import React from 'react';
import { Poem } from '../types';
import { Sparkles, RefreshCw, Bookmark, Share2, BookOpen } from 'lucide-react';
import { convertText } from '../data/chineseConverter';

interface DailyRecommendationProps {
  poem: Poem;
  reason?: string;
  lang: 'chs' | 'cht';
  onRefresh: () => void;
  onSelectPoem: (poem: Poem) => void;
  onGenerateCard: (poem: Poem) => void;
  isFavorited: boolean;
  onToggleFavorite: (poem: Poem) => void;
}

export const DailyRecommendation: React.FC<DailyRecommendationProps> = ({
  poem,
  reason = '今日诗境·应景推荐',
  lang,
  onRefresh,
  onSelectPoem,
  onGenerateCard,
  isFavorited,
  onToggleFavorite,
}) => {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#fbf8f2] via-[#f7f2e7] to-[#ede4d3] border border-[#e4d9c4] p-6 sm:p-8 shadow-xs">
      {/* Decorative Traditional Seal Watermark */}
      <div className="absolute right-4 -bottom-6 select-none pointer-events-none opacity-5 font-calligraphy text-[160px] text-[#b93a32] leading-none">
        墨
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Left: Content */}
        <div className="space-y-4 max-w-3xl">
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-classical tracking-wider bg-[#b93a32]/10 text-[#a02c25] border border-[#b93a32]/20 font-medium">
              <Sparkles className="w-3 h-3 text-[#b93a32]" />
              <span>{convertText(reason, lang)}</span>
            </span>

            <span className="text-xs text-[#8c7864] tracking-widest font-classical">
              {poem.dynasty} · {poem.author}
            </span>
          </div>

          <div>
            <h2
              onClick={() => onSelectPoem(poem)}
              className="text-2xl sm:text-3xl font-bold font-classical text-[#2c221a] tracking-wide hover:text-[#b93a32] transition-colors cursor-pointer inline-block"
            >
              {convertText(poem.title, lang)}
            </h2>
          </div>

          {/* Highlights / Paragraph preview */}
          <div className="space-y-2 text-[#46392f] font-classical text-base sm:text-lg leading-relaxed pl-3 border-l-2 border-[#b93a32]/40">
            {poem.paragraphs.slice(0, 2).map((para, idx) => (
              <p key={idx} className="tracking-wide">
                {convertText(para, lang)}
              </p>
            ))}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-1">
            {poem.moods.map((m) => (
              <span
                key={m}
                className="px-2.5 py-0.5 rounded-full text-[11px] font-classical bg-[#e8decd]/70 text-[#604f42] border border-[#d8ccb8]"
              >
                #{convertText(m, lang)}
              </span>
            ))}
            {poem.imagery.map((im) => (
              <span
                key={im}
                className="px-2.5 py-0.5 rounded-full text-[11px] font-classical bg-[#f1ebd0]/60 text-[#7a6438] border border-[#ded4b6]"
              >
                意象·{convertText(im, lang)}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-row md:flex-col items-center md:items-end justify-end gap-2.5 border-t md:border-t-0 pt-4 md:pt-0 border-[#e5dcce]">
          <button
            id="read-detail-btn"
            onClick={() => onSelectPoem(poem)}
            className="flex-1 md:flex-none flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg bg-[#b93a32] hover:bg-[#a12f27] text-white text-sm font-medium shadow-xs transition-colors font-classical tracking-wider"
          >
            <BookOpen className="w-4 h-4" />
            <span>{convertText('品读鉴赏', lang)}</span>
          </button>

          <button
            id="make-card-btn"
            onClick={() => onGenerateCard(poem)}
            className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-[#f0ebe1] hover:bg-[#e3dac9] text-[#423326] text-xs sm:text-sm font-medium transition-colors border border-[#d6ccb9] font-classical"
          >
            <Share2 className="w-3.5 h-3.5 text-[#735e4d]" />
            <span>{convertText('生成诗笺', lang)}</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              id="fav-daily-btn"
              onClick={() => onToggleFavorite(poem)}
              className="p-2 rounded-lg bg-[#f0ebe1] hover:bg-[#e3dac9] text-[#554638] transition-colors border border-[#d6ccb9]"
              title={isFavorited ? '已收藏' : '收藏入阁'}
            >
              <Bookmark className={`w-4 h-4 ${isFavorited ? 'text-[#b93a32] fill-[#b93a32]' : 'text-[#735e4d]'}`} />
            </button>

            <button
              id="refresh-daily-btn"
              onClick={onRefresh}
              className="p-2 rounded-lg bg-[#f0ebe1] hover:bg-[#e3dac9] text-[#554638] transition-colors border border-[#d6ccb9]"
              title="换一首"
            >
              <RefreshCw className="w-4 h-4 text-[#735e4d]" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
