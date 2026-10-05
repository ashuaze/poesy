import fs from 'fs';
import path from 'path';
import { normalizeRawPoem } from '../src/server/poetryNormalizer';
import { Poem } from '../src/types';

/**
 * Open-Source Chinese Poetry Importer CLI
 * 
 * Usage Examples:
 * 1. Import a single JSON file from chinese-poetry:
 *    npx tsx scripts/import_chinese_poetry.ts --file=./data/poet.tang.0.json
 * 
 * 2. Import a directory with multiple JSON files:
 *    npx tsx scripts/import_chinese_poetry.ts --dir=./chinese-poetry/json --dynasty=唐代
 * 
 * 3. Import directly from a GitHub Raw or jsdelivr CDN URL:
 *    npx tsx scripts/import_chinese_poetry.ts --url=https://cdn.jsdelivr.net/gh/chinese-poetry/chinese-poetry@master/shijing/shijing.json
 */

const SERVER_ENDPOINT = process.env.API_ENDPOINT || 'http://localhost:3000/api/data/import';

async function main() {
  const args = process.argv.slice(2);
  const getArg = (name: string) => {
    const match = args.find((a) => a.startsWith(`--${name}=`));
    return match ? match.split('=')[1] : null;
  };

  const fileArg = getArg('file');
  const dirArg = getArg('dir');
  const urlArg = getArg('url');
  const dynastyHint = getArg('dynasty') || '';
  const maxPerFile = Number(getArg('max') || '500');

  console.log('====================================================');
  console.log('  中华诗词开源库 (chinese-poetry) 数据导入工具');
  console.log('====================================================');

  const collected: Poem[] = [];

  // Case 1: Import from Remote URL
  if (urlArg) {
    console.log(`[1/3] 正在从远程地址下载数据: ${urlArg}`);
    const res = await fetch(urlArg);
    if (!res.ok) {
      console.error(`下载失败: HTTP ${res.status}`);
      process.exit(1);
    }
    const rawList = await res.json();
    if (!Array.isArray(rawList)) {
      console.error('错误: 远程文件必须是 JSON 数组！');
      process.exit(1);
    }

    console.log(`[2/3] 正在解析与规范化数据 (${rawList.length} 条)...`);
    for (const item of rawList.slice(0, maxPerFile)) {
      const norm = normalizeRawPoem(item, dynastyHint || urlArg);
      if (norm) collected.push(norm);
    }
  }

  // Case 2: Import from Single Local File
  else if (fileArg) {
    const fullPath = path.resolve(process.cwd(), fileArg);
    if (!fs.existsSync(fullPath)) {
      console.error(`错误: 文件未找到 ${fullPath}`);
      process.exit(1);
    }
    console.log(`[1/3] 读取本地文件: ${fullPath}`);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const rawList = JSON.parse(content);
    if (!Array.isArray(rawList)) {
      console.error('错误: 文件必须是 JSON 数组！');
      process.exit(1);
    }
    console.log(`[2/3] 正在解析与规范化数据 (${rawList.length} 条)...`);
    for (const item of rawList.slice(0, maxPerFile)) {
      const norm = normalizeRawPoem(item, dynastyHint || path.basename(fullPath));
      if (norm) collected.push(norm);
    }
  }

  // Case 3: Import from Local Directory
  else if (dirArg) {
    const fullDir = path.resolve(process.cwd(), dirArg);
    if (!fs.existsSync(fullDir)) {
      console.error(`错误: 目录未找到 ${fullDir}`);
      process.exit(1);
    }
    console.log(`[1/3] 扫描目录: ${fullDir}`);
    const files = fs.readdirSync(fullDir).filter((f) => f.endsWith('.json'));
    console.log(`发现 ${files.length} 个 JSON 数据文件`);

    for (const f of files) {
      try {
        const filePath = path.join(fullDir, f);
        const content = fs.readFileSync(filePath, 'utf-8');
        const list = JSON.parse(content);
        if (Array.isArray(list)) {
          for (const item of list.slice(0, maxPerFile)) {
            const norm = normalizeRawPoem(item, dynastyHint || f);
            if (norm) collected.push(norm);
          }
        }
      } catch (err: any) {
        console.warn(`跳过异常文件 ${f}:`, err.message);
      }
    }
  } else {
    console.log('请指定输入源参数：');
    console.log('  --file=<json文件路径>      导入单个 JSON 文件');
    console.log('  --dir=<目录路径>           扫描并导入整个目录');
    console.log('  --url=<远程JSON下载链接>   直接从 GitHub / CDN 导入');
    console.log('  --dynasty=<朝代提示>       可选 (如 唐代, 宋代, 先秦)');
    console.log('  --max=<每个文件最大导入量> 默认 500');
    process.exit(0);
  }

  console.log(`[3/3] 成功清洗与规范化 ${collected.length} 首诗词，正在提交至本地 SQLite + MiniSearch 引擎...`);

  try {
    const response = await fetch(SERVER_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ poems: collected }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`服务器返回错误: ${response.status} - ${errText}`);
    }

    const result = await response.json();
    console.log('====================================================');
    console.log(`✅ 导入成功！本次入库: ${result.importedCount} 首`);
    console.log(`当前本地诗库总量: ${result.totalCount} 首`);
    console.log('====================================================');
  } catch (err: any) {
    console.error('❌ 发送至本地服务失败，请确保应用服务已启动 (npm run dev)：', err.message);
  }
}

main().catch(console.error);
