import React, { useState } from 'react';
import { Poem, AIInterpretation } from '../types';
import {
  X,
  Volume2,
  VolumeX,
  Sparkles,
  Share2,
  Bookmark,
  AlignLeft,
  Columns,
  BookOpen,
  Info,
  Layers,
  Heart
} from 'lucide-react';
import { convertText } from '../data/chineseConverter';

interface PoemDetailModalProps {
  poem: Poem | null;
  onClose: () => void;
  lang: 'chs' | 'cht';
  onGenerateCard: (poem: Poem) => void;
  isFavorited: boolean;
  onToggleFavorite: (poem: Poem) => void;
}

export const PoemDetailModal: React.FC<PoemDetailModalProps> = ({
  poem,
  onClose,
  lang,
  onGenerateCard,
  isFavorited,
  onToggleFavorite,
}) => {
  const [layoutMode, setLayoutMode] = useState<'horizontal' | 'vertical'>('horizontal');
  const [activeTab, setActiveTab] = useState<'original' | 'translation' | 'appreciation' | 'ai'>('original');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [aiData, setAiData] = useState<AIInterpretation | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  if (!poem) return null;

  // Recitation with Web Speech Synthesis
  const handleRecite = () => {
    if (!('speechSynthesis' in window)) {
      alert('您的浏览器暂不支持朗读功能。');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const textToRead = `${poem.title}。${poem.dynasty}，${poem.author}。${poem.paragraphs.join('。')}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.82; // Slightly measured, gentle pacing for poetry

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  // Trigger Gemini Deep Interpretation
  const handleFetchAiAnalysis = async () => {
    if (aiData) {
      setActiveTab('ai');
      return;
    }

    setIsAiLoading(true);
    setAiError(null);
    setActiveTab('ai');

    try {
      const res = await fetch('/api/poetry/ai-interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: poem.title,
          author: poem.author,
          paragraphs: poem.paragraphs,
        }),
      });

      if (!res.ok) {
        throw new Error('AI 分析暂不可用');
      }

      const data = await res.json();
      setAiData(data);
    } catch (err: any) {
      setAiError(err.message || '生成失败，请稍后重试');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#fbf8f2] border border-[#d6cbba] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-[#e6decb] bg-[#f5efe3]/90 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#b93a32]" />
            <span className="text-xs text-[#8c7864] font-classical tracking-widest">
              {poem.dynasty} · {poem.genre}
            </span>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Recite Audio Button */}
            <button
              onClick={handleRecite}
              className={`p-2 rounded-lg transition-colors border ${
                isPlayingAudio
                  ? 'bg-[#b93a32] text-white border-[#b93a32]'
                  : 'bg-[#faf6ed] hover:bg-[#ede5d5] text-[#554638] border-[#e0d6c3]'
              }`}
              title={isPlayingAudio ? '停止朗诵' : '名篇朗诵'}
            >
              {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Horizontal / Vertical Toggle */}
            <button
              onClick={() => setLayoutMode(layoutMode === 'horizontal' ? 'vertical' : 'horizontal')}
              className="p-2 rounded-lg bg-[#faf6ed] hover:bg-[#ede5d5] text-[#554638] border border-[#e0d6c3] transition-colors"
              title={layoutMode === 'horizontal' ? '切换为古籍竖排' : '切换为现代横排'}
            >
              {layoutMode === 'horizontal' ? <Columns className="w-4 h-4" /> : <AlignLeft className="w-4 h-4" />}
            </button>

            {/* Bookmark Favorite */}
            <button
              onClick={() => onToggleFavorite(poem)}
              className="p-2 rounded-lg bg-[#faf6ed] hover:bg-[#ede5d5] text-[#554638] border border-[#e0d6c3] transition-colors"
              title={isFavorited ? '已收藏' : '加入藏诗阁'}
            >
              <Bookmark className={`w-4 h-4 ${isFavorited ? 'text-[#b93a32] fill-[#b93a32]' : 'text-[#8c7864]'}`} />
            </button>

            {/* Export Card */}
            <button
              onClick={() => onGenerateCard(poem)}
              className="p-2 rounded-lg bg-[#faf6ed] hover:bg-[#ede5d5] text-[#554638] border border-[#e0d6c3] transition-colors"
              title="生成宣纸诗笺"
            >
              <Share2 className="w-4 h-4 text-[#8c7864]" />
            </button>

            {/* Close */}
            <button
              onClick={() => {
                if (isPlayingAudio) window.speechSynthesis?.cancel();
                onClose();
              }}
              className="p-2 rounded-lg bg-[#faf6ed] hover:bg-[#ede5d5] text-[#554638] border border-[#e0d6c3] transition-colors ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-[#e6decb] bg-[#f9f5ec] flex items-center space-x-4 text-xs sm:text-sm font-classical">
          <button
            onClick={() => setActiveTab('original')}
            className={`py-3 border-b-2 font-medium tracking-wider transition-colors flex items-center space-x-1.5 ${
              activeTab === 'original'
                ? 'border-[#b93a32] text-[#b93a32]'
                : 'border-transparent text-[#735e4d] hover:text-[#2c221a]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{convertText('原文全卷', lang)}</span>
          </button>

          {poem.translation && (
            <button
              onClick={() => setActiveTab('translation')}
              className={`py-3 border-b-2 font-medium tracking-wider transition-colors flex items-center space-x-1.5 ${
                activeTab === 'translation'
                  ? 'border-[#b93a32] text-[#b93a32]'
                  : 'border-transparent text-[#735e4d] hover:text-[#2c221a]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{convertText('白话通译', lang)}</span>
            </button>
          )}

          {poem.appreciation && (
            <button
              onClick={() => setActiveTab('appreciation')}
              className={`py-3 border-b-2 font-medium tracking-wider transition-colors flex items-center space-x-1.5 ${
                activeTab === 'appreciation'
                  ? 'border-[#b93a32] text-[#b93a32]'
                  : 'border-transparent text-[#735e4d] hover:text-[#2c221a]'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>{convertText('名家鉴赏', lang)}</span>
            </button>
          )}

          <button
            onClick={handleFetchAiAnalysis}
            className={`py-3 border-b-2 font-medium tracking-wider transition-colors flex items-center space-x-1.5 ${
              activeTab === 'ai'
                ? 'border-[#b93a32] text-[#b93a32]'
                : 'border-transparent text-[#8e241c] hover:text-[#6a150f]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{convertText('AI 意境解构', lang)}</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8">
          {/* TAB 1: ORIGINAL POEM */}
          {activeTab === 'original' && (
            <div className="space-y-8">
              {/* Header Title & Author */}
              <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold font-classical text-[#2c221a] tracking-widest">
                  {convertText(poem.title, lang)}
                </h2>
                <p className="text-sm font-classical text-[#8c7864] tracking-widest">
                  〔{convertText(poem.dynasty, lang)}〕 {convertText(poem.author, lang)}
                </p>
              </div>

              {/* Poem Verses Display */}
              {layoutMode === 'horizontal' ? (
                <div className="max-w-xl mx-auto text-center space-y-4 font-classical text-lg sm:text-xl text-[#2c221a] leading-loose tracking-widest py-4 border-y border-[#ede5d5]">
                  {poem.paragraphs.map((para, idx) => (
                    <p key={idx} className="hover:text-[#b93a32] transition-colors select-text">
                      {convertText(para, lang)}
                    </p>
                  ))}
                </div>
              ) : (
                /* Traditional Vertical Mode */
                <div className="overflow-x-auto py-6 px-4 bg-[#f8f4ec] rounded-xl border border-[#e4dcce] flex justify-center">
                  <div className="vertical-rl font-classical text-lg sm:text-xl text-[#2c221a] tracking-[0.3em] leading-relaxed space-y-4 max-h-[360px] select-text">
                    <div className="text-sm text-[#8c7864] tracking-[0.4em] mb-4">
                      {convertText(poem.author, lang)}·书
                    </div>
                    {poem.paragraphs.map((para, idx) => (
                      <p key={idx} className="hover:text-[#b93a32] transition-colors">
                        {convertText(para, lang)}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Red Seal stamp aesthetic */}
              <div className="flex justify-center">
                <div className="w-8 h-12 border-2 border-[#b93a32] rounded-xs text-[#b93a32] font-calligraphy text-xs flex flex-col items-center justify-center select-none shadow-2xs opacity-80">
                  <span>雅</span>
                  <span>集</span>
                </div>
              </div>

              {/* Notes & Annotations */}
              {poem.notes && poem.notes.length > 0 && (
                <div className="bg-[#f5efe3]/80 border border-[#e6decb] rounded-xl p-4 sm:p-5 space-y-3">
                  <h4 className="text-xs font-bold font-classical text-[#735e4d] tracking-wider">
                    {convertText('【字词注释】', lang)}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-classical">
                    {poem.notes.map((n, idx) => (
                      <div key={idx} className="bg-[#faf6ed] p-2.5 rounded-lg border border-[#e8dfcf]">
                        <span className="font-bold text-[#b93a32] mr-1.5">
                          {convertText(n.word, lang)}
                          {n.pinyin && <span className="font-normal text-[11px] text-[#8c7864] ml-1">({n.pinyin})</span>}
                          :
                        </span>
                        <span className="text-[#554638]">{convertText(n.note, lang)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TRANSLATION */}
          {activeTab === 'translation' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="flex items-center space-x-2 text-sm font-bold font-classical text-[#2c221a]">
                <Layers className="w-4 h-4 text-[#b93a32]" />
                <span>{convertText('白话通释', lang)}</span>
              </div>
              <div className="p-6 bg-[#faf6ed] rounded-xl border border-[#e4dcce] text-base font-classical text-[#46392f] leading-relaxed tracking-wide">
                {convertText(poem.translation || '暂无译文', lang)}
              </div>
            </div>
          )}

          {/* TAB 3: APPRECIATION */}
          {activeTab === 'appreciation' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="flex items-center space-x-2 text-sm font-bold font-classical text-[#2c221a]">
                <Info className="w-4 h-4 text-[#b93a32]" />
                <span>{convertText('艺术赏析与历史背景', lang)}</span>
              </div>
              <div className="p-6 bg-[#faf6ed] rounded-xl border border-[#e4dcce] text-base font-classical text-[#46392f] leading-relaxed tracking-wide space-y-4">
                <p>{convertText(poem.appreciation || '暂无详细赏析', lang)}</p>
              </div>
            </div>
          )}

          {/* TAB 4: AI DEEP ANALYSIS */}
          {activeTab === 'ai' && (
            <div className="max-w-2xl mx-auto space-y-6">
              {isAiLoading && (
                <div className="text-center py-16 space-y-3">
                  <Sparkles className="w-8 h-8 text-[#b93a32] animate-spin mx-auto" />
                  <p className="text-sm font-classical text-[#735e4d]">
                    {convertText('AI 导师正在静心体悟诗境，解构千古心绪...', lang)}
                  </p>
                </div>
              )}

              {aiError && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm font-classical flex items-center justify-between">
                  <span>{aiError}</span>
                  <button
                    onClick={handleFetchAiAnalysis}
                    className="text-xs underline font-bold"
                  >
                    重试
                  </button>
                </div>
              )}

              {aiData && !isAiLoading && (
                <div className="space-y-5 font-classical">
                  {/* Contemporary Echo */}
                  <div className="p-5 rounded-xl bg-gradient-to-r from-[#faf2e9] to-[#f4e8d8] border border-[#e4d4be] space-y-2">
                    <div className="flex items-center space-x-2 text-xs font-bold text-[#b93a32]">
                      <Heart className="w-3.5 h-3.5" />
                      <span>{convertText('当代心境回响 · 给当下的你', lang)}</span>
                    </div>
                    <p className="text-sm text-[#423326] leading-relaxed">
                      {convertText(aiData.contemporaryEcho, lang)}
                    </p>
                    <div className="pt-2 text-xs text-[#8e241c] font-medium border-t border-[#e2d0ba]">
                      {convertText('诗眼指引：', lang)} {convertText(aiData.suggestedLine, lang)}
                    </div>
                  </div>

                  {/* Mood Analysis */}
                  <div className="p-5 rounded-xl bg-[#faf6ed] border border-[#e4dcce] space-y-2">
                    <h5 className="text-xs font-bold text-[#735e4d] tracking-wider">
                      {convertText('【意境与审美色彩】', lang)}
                    </h5>
                    <p className="text-sm text-[#46392f] leading-relaxed">
                      {convertText(aiData.moodAnalysis, lang)}
                    </p>
                  </div>

                  {/* Creative Context */}
                  <div className="p-5 rounded-xl bg-[#faf6ed] border border-[#e4dcce] space-y-2">
                    <h5 className="text-xs font-bold text-[#735e4d] tracking-wider">
                      {convertText('【历史际遇与心境背景】', lang)}
                    </h5>
                    <p className="text-sm text-[#46392f] leading-relaxed">
                      {convertText(aiData.creativeContext, lang)}
                    </p>
                  </div>

                  {/* Appreciation */}
                  <div className="p-5 rounded-xl bg-[#faf6ed] border border-[#e4dcce] space-y-2">
                    <h5 className="text-xs font-bold text-[#735e4d] tracking-wider">
                      {convertText('【艺术特色与文学解析】', lang)}
                    </h5>
                    <p className="text-sm text-[#46392f] leading-relaxed">
                      {convertText(aiData.appreciation, lang)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#e6decb] bg-[#f5efe3]/80 flex items-center justify-between">
          <div className="text-xs text-[#8c7864] font-classical">
            {convertText('源承诗泉古典语料 · 雅韵长存', lang)}
          </div>

          <button
            onClick={() => onGenerateCard(poem)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#b93a32] hover:bg-[#a02c25] text-white text-xs font-medium font-classical tracking-wider transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{convertText('生成雅致诗笺', lang)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
