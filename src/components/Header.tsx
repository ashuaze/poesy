import React from 'react';
import { BookOpen, Sparkles, Heart, Compass, Languages } from 'lucide-react';
import { convertText } from '../data/chineseConverter';

interface HeaderProps {
  lang: 'chs' | 'cht';
  onToggleLang: () => void;
  favoritesCount: number;
  onOpenFavorites: () => void;
  onOpenFeihualing: () => void;
  onOpenMoodSearch: () => void;
  onOpenDataService?: () => void;
  activeTab: 'explore' | 'favorites';
  setActiveTab: (tab: 'explore' | 'favorites') => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onToggleLang,
  favoritesCount,
  onOpenFavorites,
  onOpenFeihualing,
  onOpenMoodSearch,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#f9f7f2]/90 backdrop-blur-md border-b border-[#e6decb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-10 h-10 rounded-sm bg-[#b93a32] text-[#f9f7f2] flex items-center justify-center shadow-sm font-calligraphy text-2xl select-none">
            詩
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <h1 className="text-xl font-bold font-classical tracking-wider text-[#241e1a]">
                {convertText('诗境', lang)}
              </h1>
              <span className="text-xs text-[#8c7864] hidden sm:inline tracking-widest font-classical">
                {convertText('古诗词检索与意境推荐', lang)}
              </span>
            </div>
            <p className="text-[11px] text-[#a4917d] tracking-wide">
              {convertText('源承四万经典 · 悟见千年心境', lang)}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-2.5">
          {/* AI Mood Search Button */}
          <button
            id="ai-mood-search-btn"
            onClick={onOpenMoodSearch}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#e9dfd0] to-[#dfd1bd] hover:from-[#dfd1bd] hover:to-[#d0bfab] text-[#423326] text-xs sm:text-sm font-medium transition-all shadow-xs border border-[#cfbeaa]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#b93a32]" />
            <span className="font-classical">{convertText('心境问诗', lang)}</span>
          </button>

          {/* Feihualing Game Button */}
          <button
            id="feihualing-btn"
            onClick={onOpenFeihualing}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#f0ebe1] hover:bg-[#e4dcce] text-[#423326] text-xs sm:text-sm font-medium transition-all border border-[#dcd3c1]"
          >
            <Compass className="w-3.5 h-3.5 text-[#6c584c]" />
            <span className="font-classical">{convertText('飞花令', lang)}</span>
          </button>

          {/* Simplified / Traditional Toggle */}
          <button
            id="toggle-lang-btn"
            onClick={onToggleLang}
            title={lang === 'chs' ? '切换为繁体' : '切換為簡體'}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-[#e0d6c3] bg-[#faf6ed] hover:bg-[#ede5d5] text-[#554638] text-xs font-medium transition-colors"
          >
            <Languages className="w-3.5 h-3.5 text-[#8c7864]" />
            <span>{lang === 'chs' ? '繁體' : '简体'}</span>
          </button>

          {/* Favorites Drawer Button */}
          <button
            id="favorites-btn"
            onClick={onOpenFavorites}
            className="relative p-2 rounded-lg border border-[#e0d6c3] bg-[#faf6ed] hover:bg-[#ede5d5] text-[#554638] transition-colors"
            title="查看藏诗阁"
          >
            <Heart className={`w-4 h-4 ${favoritesCount > 0 ? 'text-[#b93a32] fill-[#b93a32]' : 'text-[#8c7864]'}`} />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#b93a32] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {favoritesCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
