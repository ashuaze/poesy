import React, { useState } from 'react';
import { Poem, AIMoodSearchResponse } from '../types';
import { X, Sparkles, Send, BookOpen, Quote } from 'lucide-react';
import { convertText } from '../data/chineseConverter';

interface AIMoodSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPoem: (poem: Poem) => void;
  lang: 'chs' | 'cht';
}

const QUICK_MOOD_PROMPTS = [
  '身处逆境但决不妥协，渴望重振豪迈自信',
  '雨夜独坐，在安静中梳理繁杂心事',
  '与好友离别在即，满怀珍重与不舍',
  '渴望远离城市喧嚣，归隐自然田园',
  '登高临风，胸怀天地辽阔宇宙无穷',
  '秋风渐起，怀念远方故人与旧时岁月',
];

export const AIMoodSearchModal: React.FC<AIMoodSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectPoem,
  lang,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AIMoodSearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (queryText?: string) => {
    const textToSearch = queryText || prompt;
    if (!textToSearch.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/poetry/ai-mood-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moodPrompt: textToSearch }),
      });

      if (!res.ok) {
        throw new Error('AI 意境检索暂不可用');
      }

      const data: AIMoodSearchResponse = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || '查询失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#fbf8f2] border border-[#d6cbba] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e6decb] bg-[#f5efe3] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#b93a32]" />
            <h3 className="text-base font-bold font-classical text-[#2c221a] tracking-wider">
              {convertText('AI 心境问诗 · 寻一首安抚心灵的诗', lang)}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8c7864] hover:text-[#2c221a] hover:bg-[#ede5d5]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Prompt Input Form */}
          <div className="space-y-3">
            <label className="block text-xs font-classical text-[#735e4d]">
              {convertText('诉说您此刻的心境、场景或期望获得的诗意力量：', lang)}
            </label>
            <div className="relative">
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={convertText('如：工作压力很大感到迷茫，想要一首豁达开朗、看淡得失的古诗...', lang)}
                className="w-full p-3.5 bg-[#fdfaf5] border border-[#ded5c3] rounded-xl text-sm font-classical text-[#2c221a] placeholder-[#a4917d] focus:outline-none focus:ring-2 focus:ring-[#b93a32]/20 focus:border-[#b93a32] resize-none"
              />
              <button
                onClick={() => handleSearch()}
                disabled={isLoading || !prompt.trim()}
                className="absolute right-3 bottom-3 flex items-center space-x-1 px-3 py-1.5 bg-[#b93a32] hover:bg-[#a12f27] disabled:opacity-40 text-white text-xs font-medium rounded-lg transition-colors font-classical"
              >
                {isLoading ? (
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>{convertText('问诗', lang)}</span>
              </button>
            </div>

            {/* Quick Prompts */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] text-[#8c7864] font-classical">
                {convertText('或选择典型心境场景：', lang)}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_MOOD_PROMPTS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setPrompt(q);
                      handleSearch(q);
                    }}
                    className="text-xs font-classical px-2.5 py-1 rounded-lg bg-[#f2ecde] hover:bg-[#e6ddca] text-[#554638] border border-[#ded5c2] transition-colors text-left"
                  >
                    {convertText(q, lang)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="py-12 text-center space-y-3">
              <Sparkles className="w-7 h-7 text-[#b93a32] animate-spin mx-auto" />
              <p className="text-sm font-classical text-[#735e4d]">
                {convertText('AI 正在浩瀚诗海中寻觅契合您当下的心境之作...', lang)}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 text-red-700 text-sm font-classical rounded-xl border border-red-200">
              {error}
            </div>
          )}

          {/* Search Result */}
          {result && !isLoading && (
            <div className="space-y-6 pt-2 font-classical">
              {/* Guidance Note */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-[#faf4ec] to-[#f4ebe0] border border-[#e4d6c4] space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#b93a32]">
                  <Quote className="w-3.5 h-3.5" />
                  <span>{convertText('心境寄语与释怀之引', lang)}</span>
                </div>
                <p className="text-sm text-[#46392f] leading-relaxed">
                  {convertText(result.analysis, lang)}
                </p>
                <div className="pt-2 text-xs font-medium text-[#8e241c] border-t border-[#e2d2be]">
                  {convertText('赠言：', lang)} “{convertText(result.quote, lang)}”
                </div>
              </div>

              {/* Recommended Poems */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#735e4d] tracking-wider">
                  {convertText('【为您精选契合名篇】', lang)}
                </h4>
                <div className="space-y-3">
                  {result.curatedPoems.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        onSelectPoem(p);
                        onClose();
                      }}
                      className="p-4 rounded-xl bg-[#faf6ed] hover:bg-[#fcf9f2] border border-[#e4dcce] hover:border-[#b93a32]/50 transition-all cursor-pointer flex items-center justify-between group shadow-2xs"
                    >
                      <div className="space-y-1 max-w-lg">
                        <div className="flex items-center space-x-2">
                          <span className="text-base font-bold text-[#2c221a] group-hover:text-[#b93a32] transition-colors">
                            {convertText(p.title, lang)}
                          </span>
                          <span className="text-xs text-[#8c7864]">
                            {p.dynasty} · {p.author}
                          </span>
                        </div>
                        <p className="text-xs text-[#5c4c3f] line-clamp-1">
                          {convertText(p.paragraphs[0], lang)}
                        </p>
                      </div>

                      <div className="flex items-center space-x-1 text-xs font-medium text-[#b93a32] shrink-0 pl-2">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{convertText('品读', lang)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
