import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { POETRY_CORPUS, MOOD_THEMES, SOLAR_TERMS } from './src/data/poetryCorpus.ts';
import { poetryDataService, AUTHOR_ALIASES } from './src/server/dataService.ts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Search API backed by embedded SQLite + MiniSearch engine
app.get('/api/poetry/search', async (req, res) => {
  try {
    const {
      keyword = '',
      dynasty = '',
      genre = '',
      mood = '',
      imagery = '',
      author = '',
      page = '1',
      pageSize = '12',
    } = req.query;

    const p = Math.max(1, parseInt(String(page), 10) || 1);
    const ps = Math.max(1, parseInt(String(pageSize), 10) || 12);

    const result = poetryDataService.search({
      keyword: String(keyword).trim(),
      dynasty: String(dynasty).trim(),
      genre: String(genre).trim(),
      mood: String(mood).trim(),
      imagery: String(imagery).trim(),
      author: String(author).trim(),
      page: p,
      pageSize: ps,
    });

    res.json({
      items: result.poems,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      durationMs: result.durationMs,
      resolvedAuthorAlias: result.resolvedAuthorAlias,
    });
  } catch (error: any) {
    console.error('Search error:', error);
    res.status(500).json({ error: error?.message || 'Search failed' });
  }
});

// Database Service Diagnostics & Metrics API
app.get('/api/data/stats', (req, res) => {
  try {
    const stats = poetryDataService.getStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to fetch data stats' });
  }
});

// Database Safe SQL Query API (SELECT / PRAGMA)
app.post('/api/data/query', (req, res) => {
  try {
    const { sql } = req.body;
    if (!sql || typeof sql !== 'string') {
      return res.status(400).json({ error: 'SQL string is required' });
    }
    const result = poetryDataService.executeSql(sql);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error?.message || 'SQL execution failed' });
  }
});

// Data Import API (Batch JSON import)
app.post('/api/data/import', (req, res) => {
  try {
    const { poems, sourceHint } = req.body;
    if (!Array.isArray(poems)) {
      return res.status(400).json({ error: 'poems array is required' });
    }
    const result = poetryDataService.importBatch(poems, sourceHint);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Import failed' });
  }
});

// Import from Remote Open-Source GitHub / CDN URL
app.post('/api/data/import-url', async (req, res) => {
  try {
    const { url, sourceHint, maxCount = 200 } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Valid URL is required' });
    }

    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 Poetry-Importer/1.0' },
    });

    if (!response.ok) {
      throw new Error(`远程抓取失败，HTTP 状态码: ${response.status} ${response.statusText}`);
    }

    const rawData = await response.json();
    if (!Array.isArray(rawData)) {
      return res.status(400).json({ error: '远程链接内容必须为 JSON 数组' });
    }

    const limited = rawData.slice(0, Number(maxCount) || 200);
    const result = poetryDataService.importBatch(limited, sourceHint || url);

    res.json({
      success: true,
      importedCount: result.importedCount,
      totalCount: result.totalCount,
      sourceUrl: url,
    });
  } catch (error: any) {
    console.error('Import from URL error:', error);
    res.status(500).json({ error: error?.message || 'Failed to import from URL' });
  }
});

// Author Aliases Dictionary API
app.get('/api/data/aliases', (req, res) => {
  res.json({ aliases: AUTHOR_ALIASES });
});

// Daily & Contextual Recommendation API
app.get('/api/poetry/recommend', (req, res) => {
  try {
    const { mood, solarTerm } = req.query;
    const { poem, reason } = poetryDataService.recommend(
      mood ? String(mood) : undefined,
      solarTerm ? String(solarTerm) : undefined
    );

    res.json({
      poem,
      reason,
      solarTerms: SOLAR_TERMS,
      moods: MOOD_THEMES,
    });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Recommendation failed' });
  }
});

// AI Poem Interpretation & Appreciation
app.post('/api/poetry/ai-interpret', async (req, res) => {
  try {
    const { title, author, paragraphs } = req.body;
    if (!title || !author) {
      return res.status(400).json({ error: 'Title and author are required' });
    }

    const poemContent = Array.isArray(paragraphs) ? paragraphs.join('\n') : '';

    const prompt = `请作为一位造诣深厚、温润诗性的中国古典文学大家与心境疗愈导师，为以下这首古诗词提供结构化深度鉴赏：
诗题：《${title}》
作者：${author}
正文：
${poemContent}

请返回JSON格式，包含以下字段：
1. translation: 白话通译，文笔优美流畅，不失原诗神韵。
2. appreciation: 意境与艺术鉴赏，剖析炼字用典、构图意境与修辞之妙。
3. creativeContext: 创作背景与作者当时的历史际遇与心境。
4. moodAnalysis: 情感色调与审美意境（如孤绝、清旷、凄清、豪壮等）。
5. contemporaryEcho: 现代人心境映射——写给当代身处都市或生活压力中的读者的温情寄语，说明这首诗如何启迪当代心灵。
6. suggestedLine: 原诗中最打动人心的诗眼名句。`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translation: { type: Type.STRING },
            appreciation: { type: Type.STRING },
            creativeContext: { type: Type.STRING },
            moodAnalysis: { type: Type.STRING },
            contemporaryEcho: { type: Type.STRING },
            suggestedLine: { type: Type.STRING },
          },
          required: [
            'translation',
            'appreciation',
            'creativeContext',
            'moodAnalysis',
            'contemporaryEcho',
            'suggestedLine',
          ],
        },
      },
    });

    const jsonText = response.text || '{}';
    const parsed = JSON.parse(jsonText);
    res.json(parsed);
  } catch (error: any) {
    console.error('AI interpret error:', error);
    res.status(500).json({ error: error?.message || 'AI interpretation failed' });
  }
});

// AI Mood & Semantic Search
app.post('/api/poetry/ai-mood-search', async (req, res) => {
  try {
    const { moodPrompt } = req.body;
    if (!moodPrompt) {
      return res.status(400).json({ error: 'moodPrompt is required' });
    }

    const availablePoemsSummary = POETRY_CORPUS.map(
      (p) => `ID: ${p.id} | 《${p.title}》 ${p.author} | 风格/意象: ${p.moods.join(',')} / ${p.imagery.join(',')} | 名句: ${p.famousLines?.join('；') || ''}`
    ).join('\n');

    const prompt = `用户目前的心境或需求是：“${moodPrompt}”。
我们库中有以下精选古典诗词：
${availablePoemsSummary}

请以文学鉴赏导师与心境引路人的口吻：
1. 深入共情用户的心情，撰写一段温暖、有文化意蕴的心境短评寄语 (analysis)。
2. 从以上库中挑选出最契合该心境的 1 至 3 首诗词的 ID (selectedIds)。
3. 给出一句最治愈、最能激发生命力量的古代名句或寄语赠言 (quote)。

请以JSON格式输出。`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING },
            quote: { type: Type.STRING },
            selectedIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['analysis', 'quote', 'selectedIds'],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    const matched = POETRY_CORPUS.filter((p) => result.selectedIds?.includes(p.id));
    const finalPoems = matched.length > 0 ? matched : [POETRY_CORPUS[0]];

    res.json({
      analysis: result.analysis,
      quote: result.quote,
      curatedPoems: finalPoems,
    });
  } catch (error: any) {
    console.error('AI mood search error:', error);
    res.status(500).json({ error: error?.message || 'AI mood search failed' });
  }
});

// Feihualing Game AI response
app.post('/api/poetry/feihualing-play', async (req, res) => {
  try {
    const { character, usedLines = [], userLine = '' } = req.body;
    if (!character) {
      return res.status(400).json({ error: 'character is required' });
    }

    const prompt = `你正在与玩家进行中国古典“飞花令”雅集游戏。
本次飞花令的主令字为：“${character}”。
玩家刚刚对出的诗句是：“${userLine}”。
已经使用过的诗句包括：${JSON.stringify(usedLines)}。

请你作为对手，对出一句含有“${character}”字的千古名句，不能与已用过的诗句重复。
要求必须是真实可考的经典诗句，并注明出处诗名和作者。

请以JSON格式输出：
- line: 诗句正文（含${character}字）
- title: 诗词题目
- author: 作者
- comment: 对玩家此句的简短妙赏点评（20字以内）`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            line: { type: Type.STRING },
            title: { type: Type.STRING },
            author: { type: Type.STRING },
            comment: { type: Type.STRING },
          },
          required: ['line', 'title', 'author', 'comment'],
        },
      },
    });

    const answer = JSON.parse(response.text || '{}');
    res.json(answer);
  } catch (error: any) {
    console.error('Feihualing error:', error);
    res.status(500).json({ error: error?.message || 'Feihualing play failed' });
  }
});

// Vite Middleware for development & static serving for production
async function startServer() {
  console.log('Initializing embedded Poetry Data Service (SQLite + MiniSearch)...');
  await poetryDataService.initialize();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Chinese Poetry App server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
