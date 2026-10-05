import React from 'react';
import { Poem } from '../types';
import { Search, X, Bookmark, BookOpen, Share2 } from 'lucide-react';
import { convertText } from '../data/chineseConverter';

interface PoemListProps {
  poems: Poem[];
  keyword: string;
  onKeywordChange: (kw: string) => void;
  selectedDynasty: string;
  onSelectDynasty: (dyn: string) => void;
  selectedGenre: string;
  onSelectGenre: (genre: string) => void;
  selectedImagery: string;
  onSelectImagery: (img: string) => void;
  onSelectPoem: (poem: Poem) => void;
  onGenerateCard: (poem: Poem) => void;
  favoriteIds: Set<string>;
  onToggleFavorite: (poem: Poem) => void;
  lang: 'chs' | 'cht';
}

const DYNASTIES = ['全部', '唐代', '宋代', '先秦', '两汉', '元代'];
const GENRES = ['全部', '五言绝句', '七言绝句', '五言律诗', '七言律诗', '词', '古体诗', '诗经'];
const IMAGERY_TAGS = ['全部', '明月', '春风', '酒', '柳', '雁', '雪', '孤舟', '剑', '寒江'];

export const PoemList: React.FC<PoemListProps> = ({
  poems,
  keyword,
  onKeywordChange,
  selectedDynasty,
  onSelectDynasty,
  selectedGenre,
  onSelectGenre,
  selectedImagery,
  onSelectImagery,
  onSelectPoem,
  onGenerateCard,
  favoriteIds,
  onToggleFavorite,
  lang,
}) => {
  return (
    <section className="space-y-6">
      {/* Search Input Bar */}
      <div className="bg-[#faf6ed] border border-[#e4dcce] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-[#8c7864] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="poetry-search-input"
            type="text"
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            placeholder={convertText('搜索诗题、诗人（如李白、苏轼）、名句（如明月几时有）或意象...', lang)}
            className="w-full pl-11 pr-10 py-3 bg-[#fdfaf5] border border-[#ded5c3] rounded-xl text-sm sm:text-base font-classical text-[#2c221a] placeholder-[#9c8976] focus:outline-none focus:ring-2 focus:ring-[#b93a32]/20 focus:border-[#b93a32] transition-all"
          />
          {keyword && (
            <button
              onClick={() => onKeywordChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8c7864] hover:text-[#2c221a]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Rows */}
        <div className="space-y-2.5 text-xs font-classical">
          {/* Dynasty Filter */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1">
            <span className="text-[#8c7864] shrink-0 font-medium">{convertText('朝代', lang)}:</span>
            <div className="flex items-center space-x-1.5 shrink-0">
              {DYNASTIES.map((dyn) => {
                const isSelected = (!selectedDynasty && dyn === '全部') || selectedDynasty === dyn;
                return (
                  <button
                    key={dyn}
                    onClick={() => onSelectDynasty(dyn === '全部' ? '' : dyn)}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      isSelected
                        ? 'bg-[#2c221a] text-[#fbf8f2] font-semibold'
                        : 'bg-[#ede5d5]/80 hover:bg-[#e0d6c3] text-[#554638]'
                    }`}
                  >
                    {convertText(dyn, lang)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Genre Filter */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1">
            <span className="text-[#8c7864] shrink-0 font-medium">{convertText('体裁', lang)}:</span>
            <div className="flex items-center space-x-1.5 shrink-0">
              {GENRES.map((g) => {
                const isSelected = (!selectedGenre && g === '全部') || selectedGenre === g;
                return (
                  <button
                    key={g}
                    onClick={() => onSelectGenre(g === '全部' ? '' : g)}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      isSelected
                        ? 'bg-[#2c221a] text-[#fbf8f2] font-semibold'
                        : 'bg-[#ede5d5]/80 hover:bg-[#e0d6c3] text-[#554638]'
                    }`}
                  >
                    {convertText(g, lang)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Imagery Filter */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1">
            <span className="text-[#8c7864] shrink-0 font-medium">{convertText('意象', lang)}:</span>
            <div className="flex items-center space-x-1.5 shrink-0">
              {IMAGERY_TAGS.map((img) => {
                const isSelected = (!selectedImagery && img === '全部') || selectedImagery === img;
                return (
                  <button
                    key={img}
                    onClick={() => onSelectImagery(img === '全部' ? '' : img)}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      isSelected
                        ? 'bg-[#b93a32] text-white font-semibold'
                        : 'bg-[#ede5d5]/80 hover:bg-[#e0d6c3] text-[#554638]'
                    }`}
                  >
                    {convertText(img, lang)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-[#8c7864] font-classical tracking-wider">
          {convertText(`共收录 ${poems.length} 首切合诗作`, lang)}
        </span>
      </div>

      {/* Poetry Cards Grid */}
      {poems.length === 0 ? (
        <div className="text-center py-16 px-4 bg-[#faf6ed] rounded-2xl border border-[#e4dcce] space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#ede5d5] flex items-center justify-center text-[#8c7864] font-calligraphy text-2xl">
            空
          </div>
          <h4 className="text-base font-bold font-classical text-[#2c221a]">
            {convertText('暂无切合诗词', lang)}
          </h4>
          <p className="text-xs text-[#8c7864] max-w-sm mx-auto font-classical">
            {convertText('可尝试放宽筛选条件，或使用顶部的“心境问诗”由 AI 为您推荐适合的古雅诗句。', lang)}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {poems.map((poem) => {
            const isFav = favoriteIds.has(poem.id);
            return (
              <article
                key={poem.id}
                id={`poem-card-${poem.id}`}
                className="group relative flex flex-col justify-between bg-[#faf6ed] hover:bg-[#fcf9f2] border border-[#e4dcce] hover:border-[#cfc1aa] rounded-xl p-5 transition-all shadow-xs hover:shadow-sm"
              >
                <div className="space-y-3">
                  {/* Top Bar: Dynasty & Bookmark */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <span className="px-2 py-0.5 rounded-sm bg-[#ede5d5] text-[#554638] text-[10px] font-classical tracking-wider">
                        {poem.dynasty}
                      </span>
                      <span className="text-xs font-classical text-[#8c7864]">
                        {poem.author}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(poem);
                      }}
                      className="text-[#8c7864] hover:text-[#b93a32] p-1 rounded transition-colors"
                      title={isFav ? '已收藏' : '收藏'}
                    >
                      <Bookmark
                        className={`w-4 h-4 ${isFav ? 'text-[#b93a32] fill-[#b93a32]' : 'text-[#8c7864]'}`}
                      />
                    </button>
                  </div>

                  {/* Title */}
                  <h3
                    onClick={() => onSelectPoem(poem)}
                    className="text-lg font-bold font-classical text-[#2c221a] group-hover:text-[#b93a32] transition-colors cursor-pointer line-clamp-1"
                  >
                    {convertText(poem.title, lang)}
                  </h3>

                  {/* Lines Excerpt */}
                  <div
                    onClick={() => onSelectPoem(poem)}
                    className="space-y-1 text-sm text-[#4d3e33] font-classical leading-relaxed cursor-pointer"
                  >
                    {poem.paragraphs.slice(0, 2).map((p, idx) => (
                      <p key={idx} className="line-clamp-1">
                        {convertText(p, lang)}
                      </p>
                    ))}
                    {poem.paragraphs.length > 2 && (
                      <p className="text-[11px] text-[#a19080] tracking-widest">······</p>
                    )}
                  </div>

                  {/* Famous line highlight if available */}
                  {poem.famousLines && poem.famousLines.length > 0 && (
                    <div className="pt-1 text-xs text-[#8e241c] font-classical bg-[#f7ebe9]/60 px-2.5 py-1.5 rounded-md border-l-2 border-[#b93a32]">
                      <span className="font-medium">{convertText('名句：', lang)}</span>
                      <span>{convertText(poem.famousLines[0], lang)}</span>
                    </div>
                  )}
                </div>

                {/* Footer tags and read button */}
                <div className="mt-4 pt-3 border-t border-[#ede5d5] flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {poem.moods.slice(0, 2).map((m) => (
                      <span
                        key={m}
                        className="text-[10px] font-classical text-[#735e4d] bg-[#f0ebd9] px-1.5 py-0.5 rounded"
                      >
                        {convertText(m, lang)}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onGenerateCard(poem)}
                      className="p-1.5 rounded text-[#735e4d] hover:text-[#2c221a] hover:bg-[#ede5d5] transition-colors"
                      title="生成诗笺"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onSelectPoem(poem)}
                      className="flex items-center space-x-1 text-xs font-classical font-medium text-[#b93a32] hover:text-[#8e241c] pl-1"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{convertText('品读', lang)}</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
