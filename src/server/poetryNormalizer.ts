import { Poem } from '../types';

/**
 * Normalizes raw items from https://github.com/chinese-poetry/chinese-poetry
 * into the standard Poem schema used by our SQLite and MiniSearch engine.
 */
export function normalizeRawPoem(raw: any, sourceHint?: string): Poem | null {
  if (!raw) return null;

  // 1. Resolve Title
  const title = raw.title || raw.rhythmic || raw.name || '无题';

  // 2. Resolve Paragraphs
  let paragraphs: string[] = [];
  if (Array.isArray(raw.paragraphs)) {
    paragraphs = raw.paragraphs;
  } else if (Array.isArray(raw.content)) {
    paragraphs = raw.content;
  } else if (typeof raw.paragraphs === 'string') {
    paragraphs = raw.paragraphs.split(/[。\n]/).filter(Boolean);
  }

  if (paragraphs.length === 0) return null;

  // 3. Resolve Author
  let author = raw.author || raw.writer || '';
  if (!author) {
    if (raw.chapter && raw.section) {
      author = `佚名·${raw.chapter}·${raw.section}`;
    } else {
      author = '佚名';
    }
  }

  // 4. Resolve Dynasty & Genre
  let dynasty = raw.dynasty || '';
  let genre = raw.genre || '';

  const hint = (sourceHint || '').toLowerCase();
  if (!dynasty) {
    if (hint.includes('tang') || hint.includes('唐')) dynasty = '唐代';
    else if (hint.includes('song') || hint.includes('宋')) dynasty = '宋代';
    else if (hint.includes('shijing') || hint.includes('诗经') || hint.includes('chuci') || hint.includes('楚辞')) dynasty = '先秦';
    else if (hint.includes('han') || hint.includes('汉') || hint.includes('caocao') || hint.includes('曹操')) dynasty = '两汉';
    else if (hint.includes('yuan') || hint.includes('元')) dynasty = '元代';
    else if (hint.includes('ming') || hint.includes('明')) dynasty = '明代';
    else if (hint.includes('qing') || hint.includes('清') || hint.includes('nalan') || hint.includes('纳兰')) dynasty = '清代';
    else dynasty = '唐代'; // default classical
  }

  if (!genre) {
    if (raw.rhythmic || hint.includes('ci.') || hint.includes('词')) {
      genre = '词';
    } else if (hint.includes('shijing') || hint.includes('诗经')) {
      genre = '诗经';
    } else if (paragraphs.length === 4) {
      const len = paragraphs[0].replace(/[\p{P}\s]/gu, '').length;
      genre = len <= 5 ? '五言绝句' : '七言绝句';
    } else if (paragraphs.length === 8) {
      const len = paragraphs[0].replace(/[\p{P}\s]/gu, '').length;
      genre = len <= 5 ? '五言律诗' : '七言律诗';
    } else {
      genre = '古体诗';
    }
  }

  // 5. Automatic Imagery Extraction from Dictionary
  const fullText = title + ' ' + paragraphs.join(' ');
  const KNOWN_IMAGERY = [
    '明月', '月', '酒', '剑', '春风', '秋风', '寒江', '孤舟', '舟',
    '雁', '柳', '梅', '雪', '雨', '菊', '松', '山', '落花', '长亭',
    '关山', '白云', '沧海', '夕阳', '琵琶', '烽火'
  ];
  const detectedImagery: string[] = [];
  for (const img of KNOWN_IMAGERY) {
    if (fullText.includes(img) && !detectedImagery.includes(img)) {
      detectedImagery.push(img);
    }
  }

  // 6. Automatic Mood Classification (Heuristic Tagging)
  const detectedMoods: string[] = [];
  if (/任平生|莫使金樽|天生我材|笑孔丘|会须一饮|仰天大笑|壮志|慷慨|豪情/i.test(fullText)) {
    detectedMoods.push('豪放旷达');
  }
  if (/独|孤|寒|冷|寂|零落|清霜|空山|凄|愁/i.test(fullText)) {
    detectedMoods.push('清冷孤寂');
  }
  if (/采菊|东篱|归隐|幽居|林泉|种豆|南山|无车马|野渡/i.test(fullText)) {
    detectedMoods.push('静心归隐');
  }
  if (/思乡|客中|故乡|望长安|还乡|行客|梦归|客舍/i.test(fullText)) {
    detectedMoods.push('羁旅思乡');
  }
  if (/山水|白云|清泉|翠竹|流水|扁舟|渔父|钓/i.test(fullText)) {
    detectedMoods.push('闲适山水');
  }
  if (/天下|胡虏|报国|胡未灭|誓扫|烽火|金戈|汉家/i.test(fullText)) {
    detectedMoods.push('家国壮志');
  }
  if (/相思|红豆|衣带渐宽|肠断|泪|同心|离恨|幽梦/i.test(fullText)) {
    detectedMoods.push('婉约相思');
  }
  if (/春去|秋风|落叶|残红|韶华|叹|物是人非/i.test(fullText)) {
    detectedMoods.push('惜春感秋');
  }

  if (detectedMoods.length === 0) {
    detectedMoods.push('闲适山水');
  }

  // 7. Famous lines extraction (pick memorable parallel lines)
  const famousLines: string[] = [];
  if (paragraphs.length >= 2) {
    famousLines.push(paragraphs[0] + paragraphs[1]);
  }

  const id = raw.id ? `import_${raw.id}` : `imported_${Math.abs(hashString(title + author + paragraphs[0]))}`;

  return {
    id,
    title,
    author,
    dynasty,
    genre,
    paragraphs,
    famousLines,
    moods: detectedMoods.slice(0, 3),
    imagery: detectedImagery.slice(0, 4),
    translation: raw.translation || '',
    appreciation: raw.appreciation || '',
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}
