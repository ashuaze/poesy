import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Poem } from './types';
import { POETRY_CORPUS, MOOD_THEMES, SOLAR_TERMS } from './data/poetryCorpus';
import { Header } from './components/Header';
import { DailyRecommendation } from './components/DailyRecommendation';
import { MoodCompass } from './components/MoodCompass';
import { PoemList } from './components/PoemList';
import { PoemDetailModal } from './components/PoemDetailModal';
import { PoemCardGenerator } from './components/PoemCardGenerator';
import { AIMoodSearchModal } from './components/AIMoodSearchModal';
import { FeihualingModal } from './components/FeihualingModal';
import { FavoritesDrawer } from './components/FavoritesDrawer';
import { DataServiceModal } from './components/DataServiceModal';
import { convertText } from './data/chineseConverter';

export default function App() {
  // Language (Simplified vs Traditional)
  const [lang, setLang] = useState<'chs' | 'cht'>(() => {
    return (localStorage.getItem('poetry_lang') as 'chs' | 'cht') || 'chs';
  });

  const toggleLang = () => {
    setLang((prev) => {
      const next = prev === 'chs' ? 'cht' : 'chs';
      localStorage.setItem('poetry_lang', next);
      return next;
    });
  };

  // Favorites
  const [favorites, setFavorites] = useState<Poem[]>(() => {
    try {
      const saved = localStorage.getItem('poetry_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const favoriteIds = useMemo(() => new Set(favorites.map((f) => f.id)), [favorites]);

  const toggleFavorite = useCallback((poem: Poem) => {
    setFavorites((prev) => {
      const exists = prev.some((p) => p.id === poem.id);
      let updated: Poem[];
      if (exists) {
        updated = prev.filter((p) => p.id !== poem.id);
      } else {
        updated = [poem, ...prev];
      }
      localStorage.setItem('poetry_favorites', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeFavorite = useCallback((poemId: string) => {
    setFavorites((prev) => {
      const updated = prev.filter((p) => p.id !== poemId);
      localStorage.setItem('poetry_favorites', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Filter & Search State
  const [keyword, setKeyword] = useState('');
  const [selectedDynasty, setSelectedDynasty] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedSolarTerm, setSelectedSolarTerm] = useState('');
  const [selectedImagery, setSelectedImagery] = useState('');

  // Server-backed search results
  const [serverPoems, setServerPoems] = useState<Poem[] | null>(null);

  // Daily Poem Recommendation
  const [dailyPoem, setDailyPoem] = useState<Poem>(POETRY_CORPUS[0]);
  const [dailyReason, setDailyReason] = useState('今日诗境·与时光重逢');

  // Load Daily Poem from server API or local corpus
  const fetchDailyRecommendation = async (mood?: string, term?: string) => {
    try {
      const params = new URLSearchParams();
      if (mood) params.set('mood', mood);
      if (term) params.set('solarTerm', term);

      const res = await fetch(`/api/poetry/recommend?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.poem) {
          setDailyPoem(data.poem);
          if (data.reason) setDailyReason(data.reason);
          return;
        }
      }
    } catch (e) {
      console.warn('Fallback to local daily recommendation');
    }

    const randomPoem = POETRY_CORPUS[Math.floor(Math.random() * POETRY_CORPUS.length)];
    setDailyPoem(randomPoem);
    setDailyReason('今日诗境·与时光重逢');
  };

  // Search against backend SQLite & MiniSearch engine
  const fetchSearchPoems = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (keyword.trim()) params.set('keyword', keyword.trim());
      if (selectedDynasty) params.set('dynasty', selectedDynasty);
      if (selectedGenre) params.set('genre', selectedGenre);
      if (selectedMood) params.set('mood', selectedMood);
      if (selectedImagery) params.set('imagery', selectedImagery);
      params.set('pageSize', '50');

      const res = await fetch(`/api/poetry/search?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.items)) {
          setServerPoems(data.items);
          return;
        }
      }
    } catch (err) {
      console.warn('Server search fallback to client');
    }
    setServerPoems(null);
  }, [keyword, selectedDynasty, selectedGenre, selectedMood, selectedImagery]);

  useEffect(() => {
    fetchDailyRecommendation();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSearchPoems();
    }, 150);
    return () => clearTimeout(timer);
  }, [fetchSearchPoems]);

  // Modals & Drawers
  const [selectedPoem, setSelectedPoem] = useState<Poem | null>(null);
  const [cardPoem, setCardPoem] = useState<Poem | null>(null);
  const [isFeihualingOpen, setIsFeihualingOpen] = useState(false);
  const [isMoodSearchOpen, setIsMoodSearchOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isDataServiceOpen, setIsDataServiceOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'explore' | 'favorites'>('explore');

  // Keyboard shortcut (Ctrl+Shift+D or Cmd+Shift+D) to open Data Service
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        setIsDataServiceOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fallback Filtered Poems (used if server is loading or offline)
  const fallbackPoems = useMemo(() => {
    const kw = keyword.trim().toLowerCase();

    return POETRY_CORPUS.filter((poem) => {
      if (selectedDynasty && poem.dynasty !== selectedDynasty) return false;
      if (selectedGenre && poem.genre !== selectedGenre) return false;
      if (selectedMood && !poem.moods.includes(selectedMood)) return false;
      if (selectedSolarTerm && (!poem.solarTerms || !poem.solarTerms.includes(selectedSolarTerm))) return false;
      if (selectedImagery && !poem.imagery.includes(selectedImagery)) return false;

      if (kw) {
        const inTitle = poem.title.toLowerCase().includes(kw);
        const inAuthor = poem.author.toLowerCase().includes(kw);
        const inParas = poem.paragraphs.some((p) => p.toLowerCase().includes(kw));
        const inLines = poem.famousLines?.some((l) => l.toLowerCase().includes(kw));
        const inImg = poem.imagery.some((im) => im.toLowerCase().includes(kw));
        if (!inTitle && !inAuthor && !inParas && !inLines && !inImg) return false;
      }

      return true;
    });
  }, [keyword, selectedDynasty, selectedGenre, selectedMood, selectedSolarTerm, selectedImagery]);

  const displayPoems = serverPoems !== null ? serverPoems : fallbackPoems;

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f7f2] text-[#2c2824]">
      {/* Top Header */}
      <Header
        lang={lang}
        onToggleLang={toggleLang}
        favoritesCount={favorites.length}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onOpenFeihualing={() => setIsFeihualingOpen(true)}
        onOpenMoodSearch={() => setIsMoodSearchOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 sm:space-y-10">
        {/* Hero Banner / Daily Recommendation */}
        <DailyRecommendation
          poem={dailyPoem}
          reason={dailyReason}
          lang={lang}
          onRefresh={() => fetchDailyRecommendation(selectedMood, selectedSolarTerm)}
          onSelectPoem={(p) => setSelectedPoem(p)}
          onGenerateCard={(p) => setCardPoem(p)}
          isFavorited={favoriteIds.has(dailyPoem.id)}
          onToggleFavorite={toggleFavorite}
        />

        {/* Mood Compass & 24 Solar Terms */}
        <MoodCompass
          moods={MOOD_THEMES}
          solarTerms={SOLAR_TERMS}
          selectedMood={selectedMood}
          selectedSolarTerm={selectedSolarTerm}
          onSelectMood={(m) => {
            setSelectedMood(m);
            if (m) fetchDailyRecommendation(m, undefined);
          }}
          onSelectSolarTerm={(t) => {
            setSelectedSolarTerm(t);
            if (t) fetchDailyRecommendation(undefined, t);
          }}
          lang={lang}
        />

        {/* Search & Poetry List */}
        <PoemList
          poems={displayPoems}
          keyword={keyword}
          onKeywordChange={setKeyword}
          selectedDynasty={selectedDynasty}
          onSelectDynasty={setSelectedDynasty}
          selectedGenre={selectedGenre}
          onSelectGenre={setSelectedGenre}
          selectedImagery={selectedImagery}
          onSelectImagery={setSelectedImagery}
          onSelectPoem={(p) => setSelectedPoem(p)}
          onGenerateCard={(p) => setCardPoem(p)}
          favoriteIds={favoriteIds}
          onToggleFavorite={toggleFavorite}
          lang={lang}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e6decb] bg-[#f5efe3] py-8 text-center text-xs font-classical text-[#8c7864] space-y-2">
        <div className="flex items-center justify-center space-x-4">
          <span>{convertText('数据引擎：SQLite 3 (Wasm) + MiniSearch', lang)}</span>
          <span>·</span>
          <span>{convertText('数据源架构：palemoky/chinese-poetry-api', lang)}</span>
          <span>·</span>
          <span>{convertText('AI 意境解构：Gemini', lang)}</span>
          <span>·</span>
          <span>{convertText('简繁双向：中华诗语', lang)}</span>
        </div>
        <p className="text-[11px] text-[#a69482]">
          {convertText('诗境 · 愿千古之风雅，伴君走过每个从容晨昏', lang)}
        </p>
      </footer>

      {/* Modals & Slide-outs */}
      <PoemDetailModal
        poem={selectedPoem}
        onClose={() => setSelectedPoem(null)}
        lang={lang}
        onGenerateCard={(p) => setCardPoem(p)}
        isFavorited={selectedPoem ? favoriteIds.has(selectedPoem.id) : false}
        onToggleFavorite={toggleFavorite}
      />

      <PoemCardGenerator
        poem={cardPoem}
        onClose={() => setCardPoem(null)}
        lang={lang}
      />

      <AIMoodSearchModal
        isOpen={isMoodSearchOpen}
        onClose={() => setIsMoodSearchOpen(false)}
        onSelectPoem={(p) => setSelectedPoem(p)}
        lang={lang}
      />

      <FeihualingModal
        isOpen={isFeihualingOpen}
        onClose={() => setIsFeihualingOpen(false)}
        lang={lang}
      />

      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        onSelectPoem={(p) => setSelectedPoem(p)}
        onRemoveFavorite={removeFavorite}
        onGenerateCard={(p) => setCardPoem(p)}
        lang={lang}
      />

      <DataServiceModal
        isOpen={isDataServiceOpen}
        onClose={() => setIsDataServiceOpen(false)}
        lang={lang}
        onSearchWithAlias={(alias) => setKeyword(alias)}
        onDataImported={() => {
          fetchSearchPoems();
          fetchDailyRecommendation();
        }}
      />
    </div>
  );
}
