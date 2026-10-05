# 诗境 · 古诗词检索与意境推荐系统

> **源承四万经典 · 悟见千年心境**  
> 一款融合中国古典美学、高能倒排检索与现代大语言模型（Gemini）意境解析的古诗词知识库与鉴赏平台。全面兼容开源项目 [chinese-poetry](https://github.com/chinese-poetry/chinese-poetry) 与 [chinese-poetry-api](https://github.com/palemoky/chinese-poetry-api) 语料生态。

---

## 目录
- [一、项目概述](#一项目概述)
- [二、核心功能](#二核心功能)
- [三、系统技术栈与架构](#三系统技术栈与架构)
- [四、开源数据导入指南 (Chinese-Poetry)](#四开源数据导入指南-chinese-poetry)
  - [1. 异构字段归一化管道](#1-异构字段归一化管道)
  - [2. CLI 命令行批量入库工具](#2-cli-命令行批量入库工具)
  - [3. RESTful API 数据导入与管理接口](#3-restful-api-数据导入与管理接口)
  - [4. 数据服务管理控制台（隐藏入口）](#4-数据服务管理控制台隐藏入口)
- [五、本地安装与运行](#五本地安装与运行)
- [六、环境变量说明](#六环境变量说明)
- [七、目录结构](#七目录结构)
- [八、开源协议与鸣谢](#八开源协议与鸣谢)

---

## 一、项目概述

**诗境** 旨在将浩瀚博大的中国古诗词从静态的文字库，转变为现代人随时能够产生情感共鸣的心灵栖所。系统内置了经典名篇，采用轻量高效的 **SQLite 3 (WebAssembly)** 与 **MiniSearch 倒排索引引擎**，支持毫秒级全文检索、文人字号别名消歧、朝代体裁意象多维筛选，并结合 **Google Gemini API** 实现了“以情触诗、借诗言怀”的智能化意境解析。

---

## 二、核心功能

### 1. 🔍 多维度多层次检索
- **全文即时检索**：支持按诗名、作者、正文名句、字词毫秒级倒排检索。
- **文人别名自动消歧**：内置文人别名字号字典，例如搜索“东坡居士”或“苏子瞻”可直接匹配“苏轼”之作品；搜索“青莲居士”直达“李白”。
- **多重组合筛选**：
  - **朝代**：先秦、两汉、魏晋、南北朝、唐代、宋代、元代、明代、清代
  - **体裁**：五言绝句、七言绝句、五言律诗、七言律诗、乐府古体、词、曲等
  - **古典意象**：明月、酒、剑、春风、落花、飞雪、秋风、柳、沧海等
  - **心境主题**：豪放旷达、婉约相思、羁旅思乡、清冷孤寂、闲适山水、家国壮志、静心归隐等

### 2. 🌿 二十四节气与今日心境
- 依据传统二十四节气（立春、惊蛰、清明、芒种、白露、霜降、大雪等）智能推荐切合时令物候的传世诗篇。
- 支持一键换签与结合当前选定心境的动态推荐。

### 3. ✨ 心境问诗 (AI 意境深度解析)
- 用户可用现代口语描述当下心情或处境（如“深夜加班感到迷茫而孤独”、“春日午后在窗前喝茶微风拂面”）。
- 由服务端 Gemini 2.5 模型进行意境解构，提炼心境色彩与古典意象，并从诗库中挑选最契合的古诗词名篇，附带深度鉴赏共鸣。

### 4. 🌸 飞花令对弈
- 提供古典文人雅玩“飞花令”，支持指定关键字（如“月”、“花”、“春”、“风”、“酒”等）进行诗句检索与背诵测试。
- 系统自动校验所填诗句是否包含指定字，并展示作者、篇名与完整出处。

### 5. 📜 典雅诗词卡片生成
- 支持一键将诗篇转换为中国传统色彩（素白宣纸、竹青雅韵、黛蓝深邃、朱砂暖意）的排版卡片。
- 支持复制名句或长图保存，适合在移动端与社交平台分享。

### 6. 🈳 简繁体中文即时互转
- 内置简繁双向字符映射引擎，界面、诗文正文、解析赏析均可一键在简体与繁体之间无损切换。

### 7. 💖 诗匣藏珍
- 客户端离线持久化收藏喜欢的作品，支持随时调阅和快捷制卡。

---

## 三、系统技术栈与架构

| 层次 | 技术选型 | 说明 |
| :--- | :--- | :--- |
| **前端界面** | React 19, TypeScript, Tailwind CSS v4, Motion | 经典宣纸色调，细腻水墨风排版，流畅转场 |
| **图标与字体** | Lucide React, Noto Serif SC (宋体/明体) | 兼顾古典审美与现代可读性 |
| **后端服务** | Node.js, Express 4, tsx | 全栈同构 API 代理，保护敏感配置安全 |
| **数据库** | `sql.js` (SQLite 3 WebAssembly) | 本地数据库引擎，支持 SQL 动态分析与事务写入 |
| **检索引擎** | `minisearch` | 内存高性能倒排分词检索，支持模糊匹配与词频权重 |
| **大模型能力** | `@google/genai` (Gemini 2.5 Flash) | 服务端意境理解与古典美学解构 |

---

## 四、开源数据导入指南 (Chinese-Poetry)

本项目完美支持开源界最为庞大的古典文学语料库 [chinese-poetry/chinese-poetry](https://github.com/chinese-poetry/chinese-poetry)（包含全唐诗 5.5 万首、全宋诗 25 万首、宋词 2 万余首、诗经、楚辞、两汉曹操集等）。

### 1. 异构字段归一化管道

开源数据在不同朝代和分支中的字段格式存在差异，本项目在 `src/server/poetryNormalizer.ts` 中封装了智能清洗与规范化工具：

```
开源 JSON 数据 (poet.tang.* / ci.song.* / shijing.*)
                     │
                     ▼
  ┌─────────────────────────────────────┐
  │      poetryNormalizer (数据归一化)    │
  │  • 统一标题 (title / rhythmic)       │
  │  • 统一正文 (paragraphs / content)   │
  │  • 自动识别体裁 (绝句/律诗/词/古体)   │
  │  • 自动提取高频意象 (月/酒/剑/春风...) │
  │  • 标注心境标签与朝代补齐            │
  └─────────────────────────────────────┘
                     │
                     ▼
       写入 SQLite + 构建 MiniSearch 倒排索引
```

### 2. CLI 命令行批量入库工具

针对全唐诗、全宋诗等数十万首级的大规模语料，项目提供了高性能 Node.js CLI 工具 `scripts/import_chinese_poetry.ts`：

#### 准备步骤：克隆开源项目
```bash
git clone --depth 1 https://github.com/chinese-poetry/chinese-poetry.git
```

#### 场景 A：扫描并导入整个目录
```bash
# 批量导入全唐诗（指定朝代为唐代，每个文件最多提取 500 首）
npm run import-poetry -- --dir=./chinese-poetry/全唐诗 --dynasty=唐代 --max=500

# 批量导入宋词
npm run import-poetry -- --dir=./chinese-poetry/宋词 --dynasty=宋代
```

#### 场景 B：导入单个 JSON 文件
```bash
npm run import-poetry -- --file=./chinese-poetry/全唐诗/poet.tang.0.json --dynasty=唐代
```

#### 场景 C：通过 GitHub Raw 或 jsdelivr CDN 远程导入
```bash
# 导入《诗经》
npm run import-poetry -- --url=https://cdn.jsdelivr.net/gh/chinese-poetry/chinese-poetry@master/shijing/shijing.json

# 导入《曹操诗集》
npm run import-poetry -- --url=https://cdn.jsdelivr.net/gh/chinese-poetry/chinese-poetry@master/caocao/caocao.json
```

---

### 3. RESTful API 数据导入与管理接口

服务端提供了丰富的无状态 RESTful API，可供自动化作业、脚本或爬虫直接调用：

#### 1) 批量导入诗词数据
- **Endpoint**: `POST /api/data/import`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "poems": [
      {
        "title": "春夜喜雨",
        "author": "杜甫",
        "dynasty": "唐代",
        "paragraphs": ["好雨知时节，当春乃发生。", "随风潜入夜，润物细无声。"]
      }
    ],
    "sourceHint": "自定义导入"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "importedCount": 1,
    "totalCount": 42
  }
  ```

#### 2) 远程 URL 一键拉取导入
- **Endpoint**: `POST /api/data/import-url`
- **Request Body**:
  ```json
  {
    "url": "https://cdn.jsdelivr.net/gh/chinese-poetry/chinese-poetry@master/shijing/shijing.json",
    "dynasty": "先秦",
    "maxCount": 300
  }
  ```

#### 3) 执行只读 SQL 统计与聚合
- **Endpoint**: `POST /api/data/query`
- **Request Body**:
  ```json
  {
    "sql": "SELECT dynasty, count(*) as count FROM poems GROUP BY dynasty ORDER BY count DESC;"
  }
  ```
- **Response**: 返回执行耗时、列名及行数据。

#### 4) 获取数据库与引擎指标
- **Endpoint**: `GET /api/data/stats`
- **Response**: 包含收录诗篇总数、朝代分布直方图、意象词频统计、运行时间等。

---

### 4. 数据服务管理控制台（隐藏入口）

为保持前端界面的纯粹优雅与古典气质，管理员数据服务控制台已在公开顶栏中进行隐藏：

- **快捷键唤出**：在网页任意位置按下组合键 <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>D</kbd>（macOS 用户为 <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>D</kbd>）。
- **控制台功能包括**：
  1. **经典名篇包一键载入**：《诗经》名篇、《曹操乐府》、《全唐诗选》、《宋词三百首》。
  2. **本地文件拖拽上传**：支持浏览器端直接拖入 `.json` 文件并即时流式导入。
  3. **在线 URL 拉取**：输入 jsdelivr 或 GitHub 链接直接同步。
  4. **SQL 交互式控制台**：直接在线编写 SQL 语句查询数据库底层表结构。
  5. **引擎监控与文人别名库**：实时查看倒排索引词条数量、朝代比例与别名映射关系。

---

## 五、本地安装与运行

### 1. 安装依赖
```bash
npm install
```

### 2. 本地开发模式
启动开发服务器（含 Vite 客户端热重载与 Express 服务端 API）：
```bash
npm run dev
```
启动成功后，浏览器访问：`http://localhost:3000`

### 3. 代码类型检查
```bash
npm run lint
```

### 4. 生产环境构建与启动
```bash
npm run build
npm run start
```

---

## 六、环境变量说明

在项目根目录下配置 `.env` 文件（可参考 `.env.example`）：

```env
# Google Gemini 官方 API Key（用于心境问诗 AI 意境解析，必填项）
GEMINI_API_KEY=your_gemini_api_key_here
```

> **注意**：`GEMINI_API_KEY` 仅在 Node.js 服务端读取并使用，绝不会泄露给前端浏览器。

---

## 七、目录结构

```text
├── scripts/
│   └── import_chinese_poetry.ts   # 开源 chinese-poetry 语料批量导入 CLI 脚本
├── src/
│   ├── components/                # React UI 核心组件
│   │   ├── Header.tsx             # 顶栏导航与功能按钮（已隐藏管理入口）
│   │   ├── DailyRecommendation.tsx# 今日推荐与名句卡片
│   │   ├── MoodCompass.tsx        # 心境罗盘与二十四节气组件
│   │   ├── PoemList.tsx           # 诗词瀑布流与条件筛选器
│   │   ├── PoemDetailModal.tsx    # 诗词正文、注解与全屏沉浸弹窗
│   │   ├── PoemCardGenerator.tsx  # 雅致古风卡片排版生成器
│   │   ├── AIMoodSearchModal.tsx  # Gemini 心境问诗对话框
│   │   ├── FeihualingModal.tsx    # 飞花令雅玩组件
│   │   ├── FavoritesDrawer.tsx    # 诗匣藏珍（本地收藏夹）
│   │   └── DataServiceModal.tsx   # 数据服务控制台（快捷键唤起）
│   ├── data/
│   │   ├── poems.ts               # 精选古典诗词初始种子语料
│   │   └── chineseConverter.ts    # 简繁体中文双向转换字典
│   ├── server/
│   │   ├── poetryDb.ts            # SQLite (sql.js) + MiniSearch 数据库引擎
│   │   ├── poetryNormalizer.ts    # chinese-poetry 开源格式智能清洗管道
│   │   └── gemini.ts              # Google Gemini 2.5 意境解析服务端封装
│   ├── App.tsx                    # 前端核心入口与状态管理
│   ├── types.ts                   # 全局 TypeScript 数据结构与接口定义
│   └── index.css                  # Tailwind CSS 与中文字体定义
├── server.ts                      # Express 服务端入口与 API 路由中心
├── package.json                   # 项目依赖与运行脚本定义
├── metadata.json                  # 应用元数据
└── README.md                      # 项目完整技术文档与使用手册
```

---

## 八、开源协议与鸣谢

- 本项目基于 MIT 协议开源。
- 诗词数据结构规范兼容并特别鸣谢：
  - [chinese-poetry / chinese-poetry](https://github.com/chinese-poetry/chinese-poetry) - 最全中华古诗词数据库
  - [palemoky / chinese-poetry-api](https://github.com/palemoky/chinese-poetry-api) - 中华诗词 API 服务
  - [sql.js](https://github.com/sql-js/sql.js) - SQLite in WebAssembly
  - [MiniSearch](https://github.com/lucaong/minisearch) - Tiny, zero-dependency full-text search engine
