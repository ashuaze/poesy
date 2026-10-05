import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import MiniSearch from 'minisearch';
import { Poem } from '../types';
import { POETRY_CORPUS } from '../data/poetryCorpus';
import { normalizeRawPoem } from './poetryNormalizer';

// Author Aliases Dictionary
export const AUTHOR_ALIASES: Record<string, string> = {
  // 李白
  '青莲居士': '李白',
  '李太白': '李白',
  '太白': '李白',
  '谪仙人': '李白',
  '诗仙': '李白',
  // 苏轼
  '东坡居士': '苏轼',
  '苏东坡': '苏轼',
  '东坡': '苏轼',
  '苏子瞻': '苏轼',
  '子瞻': '苏轼',
  // 杜甫
  '少陵野老': '杜甫',
  '杜少陵': '杜甫',
  '杜工部': '杜甫',
  '子美': '杜甫',
  '诗圣': '杜甫',
  '老杜': '杜甫',
  // 李清照
  '易安居士': '李清照',
  '易安': '李清照',
  '李易安': '李清照',
  // 辛弃疾
  '稼轩居士': '辛弃疾',
  '辛稼轩': '辛弃疾',
  '幼安': '辛弃疾',
  // 王维
  '摩诘居士': '王维',
  '王右丞': '王维',
  '王摩诘': '王维',
  '诗佛': '王维',
  // 白居易
  '香山居士': '白居易',
  '白乐天': '白居易',
  '乐天': '白居易',
  '诗魔': '白居易',
  // 陶渊明
  '五柳先生': '陶渊明',
  '陶潜': '陶渊明',
  '靖节先生': '陶渊明',
  '陶元亮': '陶渊明',
  // 李商隐
  '玉溪生': '李商隐',
  '樊南生': '李商隐',
  '义山': '李商隐',
  // 杜牧
  '樊川居士': '杜牧',
  '杜樊川': '杜牧',
  '小杜': '杜牧',
  // 刘禹锡
  '刘梦得': '刘禹锡',
  '梦得': '刘禹锡',
  '诗豪': '刘禹锡',
  // 纳兰性德
  '纳兰容若': '纳兰性德',
  '容若': '纳兰性德',
  '楞伽山人': '纳兰性德',
  // 陆游
  '放翁': '陆游',
  '陆放翁': '陆游',
  // 柳永
  '柳三变': '柳永',
  '柳屯田': '柳永',
  // 屈原
  '屈平': '屈原',
  '灵均': '屈原',
};

// Chinese custom segmenter for MiniSearch (character + bi-gram)
export function chineseTokenizer(text: string): string[] {
  if (!text) return [];
  const clean = text.toLowerCase().replace(/[\s\p{P}\p{S}]/gu, '');
  const tokens: string[] = [];

  // Individual characters
  for (let i = 0; i < clean.length; i++) {
    tokens.push(clean[i]);
    // Bi-grams
    if (i < clean.length - 1) {
      tokens.push(clean.slice(i, i + 2));
    }
  }
  return tokens;
}

export interface SearchQueryOptions {
  keyword?: string;
  dynasty?: string;
  genre?: string;
  mood?: string;
  imagery?: string;
  author?: string;
  page?: number;
  pageSize?: number;
}

export interface DatabaseStats {
  totalPoems: number;
  totalAuthors: number;
  dynastiesCount: Record<string, number>;
  topImagery: Array<{ name: string; count: number }>;
  indexTermCount: number;
  engine: string;
  uptimeSeconds: number;
}

export class PoetryDataService {
  private db: Database | null = null;
  private SQL: SqlJsStatic | null = null;
  private searchIndex: MiniSearch<Poem> | null = null;
  private startTime = Date.now();
  private poemsMap = new Map<string, Poem>();

  async initialize() {
    // 1. Initialize SQLite WebAssembly engine
    this.SQL = await initSqlJs();
    this.db = new this.SQL.Database();

    // 2. Create Schema
    this.createTables();

    // 3. Initialize MiniSearch full-text inverted index
    this.searchIndex = new MiniSearch<Poem>({
      fields: ['title', 'author', 'paragraphsText', 'famousLinesText', 'imageryText'],
      storeFields: ['id', 'title', 'author', 'dynasty', 'genre'],
      tokenize: chineseTokenizer,
      searchOptions: {
        boost: {
          title: 3.5,
          author: 3.0,
          famousLinesText: 2.5,
          imageryText: 2.0,
          paragraphsText: 1.0,
        },
        prefix: true,
        fuzzy: 0.2,
      },
    });

    // 4. Seed initial corpus into SQLite & Search Index
    this.loadCorpus(POETRY_CORPUS);
    console.log(`[PoetryDataService] Initialized successfully with ${this.poemsMap.size} poems.`);
  }

  private createTables() {
    if (!this.db) return;

    this.db.run(`
      CREATE TABLE IF NOT EXISTS poems (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        dynasty TEXT NOT NULL,
        genre TEXT NOT NULL,
        paragraphs TEXT NOT NULL,
        famous_lines TEXT,
        translation TEXT,
        appreciation TEXT,
        moods TEXT,
        imagery TEXT,
        solar_terms TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS authors (
        name TEXT PRIMARY KEY,
        dynasty TEXT NOT NULL,
        aliases TEXT,
        poem_count INTEGER DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS query_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        query TEXT,
        results_count INTEGER,
        duration_ms REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_poems_author ON poems(author);
      CREATE INDEX IF NOT EXISTS idx_poems_dynasty ON poems(dynasty);
      CREATE INDEX IF NOT EXISTS idx_poems_genre ON poems(genre);
    `);
  }

  public loadCorpus(corpus: Poem[]) {
    if (!this.db || !this.searchIndex) return;

    const indexDocs: Array<Poem & { paragraphsText: string; famousLinesText: string; imageryText: string }> = [];

    for (const poem of corpus) {
      this.poemsMap.set(poem.id, poem);

      // Insert or replace into SQLite
      this.db.run(
        `INSERT OR REPLACE INTO poems (
          id, title, author, dynasty, genre, paragraphs,
          famous_lines, translation, appreciation, moods, imagery, solar_terms
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          poem.id,
          poem.title,
          poem.author,
          poem.dynasty,
          poem.genre,
          JSON.stringify(poem.paragraphs),
          JSON.stringify(poem.famousLines || []),
          poem.translation || '',
          poem.appreciation || '',
          JSON.stringify(poem.moods || []),
          JSON.stringify(poem.imagery || []),
          JSON.stringify(poem.solarTerms || []),
        ]
      );

      // Update Author Record
      this.db.run(
        `INSERT INTO authors (name, dynasty, aliases, poem_count)
         VALUES (?, ?, ?, 1)
         ON CONFLICT(name) DO UPDATE SET poem_count = poem_count + 1`,
        [poem.author, poem.dynasty, '']
      );

      indexDocs.push({
        ...poem,
        paragraphsText: poem.paragraphs.join(' '),
        famousLinesText: (poem.famousLines || []).join(' '),
        imageryText: (poem.imagery || []).join(' '),
      });
    }

    // Index all documents in MiniSearch
    this.searchIndex.addAll(indexDocs);
  }

  /**
   * Search poems using hybrid full-text indexing + SQLite filter
   */
  public search(options: SearchQueryOptions) {
    const startTime = performance.now();
    const {
      keyword = '',
      dynasty = '',
      genre = '',
      mood = '',
      imagery = '',
      author = '',
      page = 1,
      pageSize = 12,
    } = options;

    let candidateIds: Set<string> | null = null;
    let queryAuthor = author;

    // Check author alias
    if (keyword && AUTHOR_ALIASES[keyword]) {
      queryAuthor = AUTHOR_ALIASES[keyword];
    }

    // 1. If keyword exists, run through MiniSearch
    if (keyword && this.searchIndex) {
      // Check if alias expanded
      const searchTerms = [keyword];
      if (AUTHOR_ALIASES[keyword]) {
        searchTerms.push(AUTHOR_ALIASES[keyword]);
      }

      const searchHits = this.searchIndex.search(searchTerms.join(' '));
      candidateIds = new Set(searchHits.map((h) => String(h.id)));
    }

    // 2. Fetch and filter from poems map
    let results: Poem[] = [];
    const allList = Array.from(this.poemsMap.values());

    for (const p of allList) {
      if (candidateIds && !candidateIds.has(p.id)) {
        // Check fallback direct inclusion for substring safety
        const kwLower = keyword.toLowerCase();
        const inDirect =
          p.title.toLowerCase().includes(kwLower) ||
          p.author.toLowerCase().includes(kwLower) ||
          p.paragraphs.some((para) => para.toLowerCase().includes(kwLower));
        if (!inDirect) continue;
      }

      if (queryAuthor && p.author !== queryAuthor) continue;
      if (dynasty && p.dynasty !== dynasty) continue;
      if (genre && p.genre !== genre) continue;
      if (mood && !p.moods.includes(mood)) continue;
      if (imagery && !p.imagery.includes(imagery)) continue;

      results.push(p);
    }

    // Pagination
    const total = results.length;
    const offset = (page - 1) * pageSize;
    const paginated = results.slice(offset, offset + pageSize);
    const duration = performance.now() - startTime;

    // Log query in background
    if (this.db) {
      try {
        this.db.run(
          `INSERT INTO query_logs (query, results_count, duration_ms) VALUES (?, ?, ?)`,
          [keyword || 'all', total, duration]
        );
      } catch (err) {
        // ignore logging errors
      }
    }

    return {
      poems: paginated,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      durationMs: Number(duration.toFixed(2)),
      resolvedAuthorAlias: keyword && AUTHOR_ALIASES[keyword] ? AUTHOR_ALIASES[keyword] : undefined,
    };
  }

  /**
   * Safe SQL execution for Data Hub queries
   */
  public executeSql(sql: string) {
    if (!this.db) throw new Error('Database not initialized');
    const trimmed = sql.trim();
    // Safety guard: only allow SELECT or PRAGMA queries
    if (!/^(SELECT|PRAGMA|EXPLAIN)\s+/i.test(trimmed)) {
      throw new Error('出于安全保护，仅支持执行 SELECT 或 PRAGMA 查询');
    }

    const start = performance.now();
    const res = this.db.exec(trimmed);
    const durationMs = Number((performance.now() - start).toFixed(2));

    if (!res || res.length === 0) {
      return { columns: [], values: [], rowCount: 0, durationMs };
    }

    return {
      columns: res[0].columns,
      values: res[0].values,
      rowCount: res[0].values.length,
      durationMs,
    };
  }

  /**
   * Import batch poems from JSON (e.g. palemoky/chinese-poetry format or standard Poem schema)
   */
  public importBatch(rawList: any[], sourceHint?: string) {
    const normalizedList: Poem[] = [];

    for (const raw of rawList) {
      if (!raw) continue;
      // If already matching full Poem interface
      if (raw.id && raw.title && Array.isArray(raw.paragraphs) && raw.author && raw.dynasty && Array.isArray(raw.moods)) {
        normalizedList.push(raw as Poem);
      } else {
        const norm = normalizeRawPoem(raw, sourceHint);
        if (norm) {
          normalizedList.push(norm);
        }
      }
    }

    this.loadCorpus(normalizedList);
    return {
      importedCount: normalizedList.length,
      totalCount: this.poemsMap.size,
    };
  }

  /**
   * Database and Search Engine Statistics
   */
  public getStats(): DatabaseStats {
    const dynastiesCount: Record<string, number> = {};
    const imageryCountMap: Record<string, number> = {};
    const authorsSet = new Set<string>();

    for (const p of this.poemsMap.values()) {
      dynastiesCount[p.dynasty] = (dynastiesCount[p.dynasty] || 0) + 1;
      authorsSet.add(p.author);

      for (const im of p.imagery || []) {
        imageryCountMap[im] = (imageryCountMap[im] || 0) + 1;
      }
    }

    const topImagery = Object.entries(imageryCountMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalPoems: this.poemsMap.size,
      totalAuthors: authorsSet.size,
      dynastiesCount,
      topImagery,
      indexTermCount: this.searchIndex?.termCount || 0,
      engine: 'SQLite 3 (Wasm) + MiniSearch Inverted Index',
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }

  /**
   * Get single poem by ID
   */
  public getPoemById(id: string): Poem | undefined {
    return this.poemsMap.get(id);
  }

  /**
   * Recommend based on solar term or mood
   */
  public recommend(mood?: string, solarTerm?: string): { poem: Poem; reason: string } {
    const all = Array.from(this.poemsMap.values());
    if (all.length === 0) {
      throw new Error('Poem repository is empty');
    }

    let candidates = all;
    let reason = '今日诗境·与时光重逢';

    if (solarTerm) {
      const match = all.filter((p) => p.solarTerms?.includes(solarTerm));
      if (match.length > 0) {
        candidates = match;
        reason = `时令·${solarTerm}特荐`;
      }
    } else if (mood) {
      const match = all.filter((p) => p.moods.includes(mood));
      if (match.length > 0) {
        candidates = match;
        reason = `心境·${mood}意境精选`;
      }
    }

    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    return { poem: picked, reason };
  }
}

// Global Singleton Instance
export const poetryDataService = new PoetryDataService();
