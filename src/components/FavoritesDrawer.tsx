import React from 'react';
import { Poem } from '../types';
import { X, Trash2, BookOpen, Share2, Bookmark } from 'lucide-react';
import { convertText } from '../data/chineseConverter';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: Poem[];
  onSelectPoem: (poem: Poem) => void;
  onRemoveFavorite: (poemId: string) => void;
  onGenerateCard: (poem: Poem) => void;
  lang: 'chs' | 'cht';
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  onClose,
  favorites,
  onSelectPoem,
  onRemoveFavorite,
  onGenerateCard,
  lang,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#faf6ed] border-l border-[#d6cbba] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#e4dcce] bg-[#f5efe3] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bookmark className="w-5 h-5 text-[#b93a32] fill-[#b93a32]" />
              <h3 className="text-base font-bold font-classical text-[#2c221a]">
                {convertText('我的藏诗阁', lang)}
              </h3>
              <span className="text-xs text-[#8c7864] font-classical">
                ({favorites.length})
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded text-[#8c7864] hover:text-[#2c221a]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {favorites.length === 0 ? (
              <div className="text-center py-16 space-y-3 font-classical">
                <div className="w-12 h-12 rounded-full bg-[#ede5d5] flex items-center justify-center text-[#8c7864] text-xl mx-auto font-calligraphy">
                  閣
                </div>
                <h4 className="text-sm font-bold text-[#2c221a]">
                  {convertText('藏诗阁尚虚席', lang)}
                </h4>
                <p className="text-xs text-[#8c7864] max-w-xs mx-auto">
                  {convertText('在浏览诗篇时点击书签按钮，即可将令您心动的名篇珍藏于此。', lang)}
                </p>
              </div>
            ) : (
              favorites.map((poem) => (
                <div
                  key={poem.id}
                  className="bg-[#fdfaf5] border border-[#e4dcce] rounded-xl p-4 space-y-2 hover:border-[#b93a32]/40 transition-colors relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#8c7864] font-classical">
                      {poem.dynasty} · {poem.author}
                    </span>
                    <button
                      onClick={() => onRemoveFavorite(poem.id)}
                      className="text-[#8c7864] hover:text-red-600 p-1 rounded transition-colors"
                      title="移除收藏"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4
                    onClick={() => {
                      onSelectPoem(poem);
                      onClose();
                    }}
                    className="text-base font-bold font-classical text-[#2c221a] hover:text-[#b93a32] cursor-pointer transition-colors"
                  >
                    {convertText(poem.title, lang)}
                  </h4>

                  <p
                    onClick={() => {
                      onSelectPoem(poem);
                      onClose();
                    }}
                    className="text-xs text-[#554638] font-classical line-clamp-1 cursor-pointer"
                  >
                    {convertText(poem.paragraphs[0], lang)}
                  </p>

                  <div className="pt-2 border-t border-[#ede5d5] flex items-center justify-between">
                    <button
                      onClick={() => onGenerateCard(poem)}
                      className="text-xs text-[#735e4d] hover:text-[#2c221a] flex items-center space-x-1 font-classical"
                    >
                      <Share2 className="w-3 h-3" />
                      <span>{convertText('制诗笺', lang)}</span>
                    </button>

                    <button
                      onClick={() => {
                        onSelectPoem(poem);
                        onClose();
                      }}
                      className="text-xs text-[#b93a32] font-bold flex items-center space-x-1 font-classical"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>{convertText('研读', lang)}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
