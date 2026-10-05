export interface PoemNote {
  word: string;
  pinyin?: string;
  note: string;
}

export interface Poem {
  id: string;
  title: string;
  author: string;
  dynasty: string;
  genre: string;
  rhythmic?: string;
  paragraphs: string[];
  translation?: string;
  appreciation?: string;
  notes?: PoemNote[];
  imagery: string[];
  moods: string[];
  solarTerms?: string[];
  famousLines?: string[];
}

export interface SearchFilters {
  keyword: string;
  dynasty: string;
  genre: string;
  mood: string;
  imagery: string;
  lang: 'chs' | 'cht';
}

export interface MoodTheme {
  id: string;
  name: string;
  alias: string;
  color: string;
  bgGrad: string;
  iconName: string;
  description: string;
}

export interface SolarTermInfo {
  name: string;
  season: string;
  description: string;
  poemId: string;
}

export interface AIInterpretation {
  translation: string;
  appreciation: string;
  creativeContext: string;
  moodAnalysis: string;
  contemporaryEcho: string;
  suggestedLine: string;
}

export interface AIMoodSearchResponse {
  curatedPoems: Poem[];
  analysis: string;
  quote: string;
}

export interface FeihualingRound {
  speaker: 'user' | 'ai';
  line: string;
  title: string;
  author: string;
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

