import React, { useState } from 'react';
import { FeihualingRound } from '../types';
import { X, Compass, Send, Sparkles, RefreshCw, Trophy } from 'lucide-react';
import { convertText } from '../data/chineseConverter';

interface FeihualingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'chs' | 'cht';
}

const CHARACTERS = ['月', '花', '春', '风', '酒', '山', '雪', '水', '夜'];

export const FeihualingModal: React.FC<FeihualingModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [selectedChar, setSelectedChar] = useState('月');
  const [rounds, setRounds] = useState<FeihualingRound[]>([
    {
      speaker: 'ai',
      line: '举杯邀明月，对影成三人。',
      title: '月下独酌四首·其一',
      author: '李白',
    },
  ]);
  const [inputLine, setInputLine] = useState('');
  const [aiComment, setAiComment] = useState<string | null>('请赐教一句含“月”字的诗句~');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleResetGame = (newChar: string) => {
    setSelectedChar(newChar);
    const initialLine =
      newChar === '月'
        ? { line: '举杯邀明月，对影成三人。', title: '月下独酌', author: '李白' }
        : newChar === '花'
        ? { line: '乱花渐欲迷人眼，浅草才能没马蹄。', title: '钱塘湖春行', author: '白居易' }
        : newChar === '春'
        ? { line: '春风又绿江南岸，明月何时照我还？', title: '泊船瓜洲', author: '王安石' }
        : newChar === '风'
        ? { line: '随风潜入夜，润物细无声。', title: '春夜喜雨', author: '杜甫' }
        : { line: '莫使金樽空对月，天生我材必有用。', title: '将进酒', author: '李白' };

    setRounds([
      {
        speaker: 'ai',
        line: initialLine.line,
        title: initialLine.title,
        author: initialLine.author,
      },
    ]);
    setAiComment(`令字已换为“${newChar}”，请君先对~`);
    setErrorMessage(null);
    setInputLine('');
  };

  const handleSubmit = async () => {
    const trimmed = inputLine.trim();
    if (!trimmed) return;

    if (!trimmed.includes(selectedChar)) {
      setErrorMessage(`诗句中必须包含令字“${selectedChar}”！`);
      return;
    }

    const alreadyUsed = rounds.some((r) => r.line.replace(/[，。？！、\s]/g, '') === trimmed.replace(/[，。？！、\s]/g, ''));
    if (alreadyUsed) {
      setErrorMessage('此句在本次对局中已被吟诵过，请换一句~');
      return;
    }

    setErrorMessage(null);

    // Append user round
    const newUserRound: FeihualingRound = {
      speaker: 'user',
      line: trimmed,
      title: '雅客吟诵',
      author: '当代雅士',
    };

    const newRounds = [...rounds, newUserRound];
    setRounds(newRounds);
    setInputLine('');
    setIsLoading(true);

    try {
      const usedLines = newRounds.map((r) => r.line);
      const res = await fetch('/api/poetry/feihualing-play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character: selectedChar,
          userLine: trimmed,
          usedLines,
        }),
      });

      if (!res.ok) {
        throw new Error('AI 对诗出现迟疑');
      }

      const data = await res.json();
      setRounds((prev) => [
        ...prev,
        {
          speaker: 'ai',
          line: data.line,
          title: data.title,
          author: data.author,
        },
      ]);
      setAiComment(data.comment || '妙哉！且听老夫这句！');
    } catch (err: any) {
      setErrorMessage(err.message || '对诗出错，请重试');
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
            <Compass className="w-5 h-5 text-[#b93a32]" />
            <div>
              <h3 className="text-base font-bold font-classical text-[#2c221a]">
                {convertText('文人雅集 · 飞花令', lang)}
              </h3>
              <p className="text-[11px] text-[#8c7864] font-classical">
                {convertText('与 AI 文人雅士轮流对诗，领略古人行令之趣', lang)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8c7864] hover:text-[#2c221a] hover:bg-[#ede5d5]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Character selector bar */}
        <div className="px-6 py-3 bg-[#f7f2e7] border-b border-[#e6decb] flex items-center space-x-3 overflow-x-auto">
          <span className="text-xs font-classical text-[#735e4d] shrink-0 font-medium">
            {convertText('当前令字：', lang)}
          </span>
          <div className="flex items-center space-x-1.5 shrink-0">
            {CHARACTERS.map((char) => (
              <button
                key={char}
                onClick={() => handleResetGame(char)}
                className={`w-7 h-7 rounded-md font-calligraphy text-base flex items-center justify-center transition-all ${
                  selectedChar === char
                    ? 'bg-[#b93a32] text-white shadow-xs scale-105'
                    : 'bg-[#ebe3d3] hover:bg-[#ded4c1] text-[#423326]'
                }`}
              >
                {char}
              </button>
            ))}
          </div>
        </div>

        {/* Rounds Chat / Scroll area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 font-classical">
          {rounds.map((round, idx) => (
            <div
              key={idx}
              className={`flex ${round.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-md p-4 rounded-2xl border space-y-1.5 ${
                  round.speaker === 'user'
                    ? 'bg-[#b93a32] text-white border-[#b93a32] rounded-tr-none'
                    : 'bg-[#faf6ed] text-[#2c221a] border-[#ded4c3] rounded-tl-none shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] opacity-80 pb-1 border-b border-white/20">
                  <span>
                    {round.speaker === 'user'
                      ? convertText('阁下吟诵', lang)
                      : convertText(`AI 墨客 · 答对`, lang)}
                  </span>
                  <span>
                    {convertText(round.author, lang)} · 《{convertText(round.title, lang)}》
                  </span>
                </div>
                <p className="text-base sm:text-lg font-bold tracking-wide py-1">
                  {convertText(round.line, lang)}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#faf6ed] border border-[#ded4c3] p-3 rounded-2xl rounded-tl-none flex items-center space-x-2 text-xs text-[#8c7864]">
                <Sparkles className="w-4 h-4 text-[#b93a32] animate-spin" />
                <span>{convertText('AI 墨客正抚须深思，寻觅下一对句...', lang)}</span>
              </div>
            </div>
          )}

          {/* AI Comment Banner */}
          {aiComment && (
            <div className="text-center py-2 text-xs font-classical text-[#8c7864] bg-[#f2ebdc]/60 rounded-lg border border-[#e8dfcf]">
              {convertText(aiComment, lang)}
            </div>
          )}
        </div>

        {/* Footer Input */}
        <div className="p-4 bg-[#f5efe3] border-t border-[#e6decb] space-y-2">
          {errorMessage && (
            <div className="text-xs text-red-600 font-classical px-1">
              {errorMessage}
            </div>
          )}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={inputLine}
              onChange={(e) => setInputLine(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit();
              }}
              placeholder={convertText(`对出一句含“${selectedChar}”字的经典名句...`, lang)}
              className="flex-1 px-4 py-2.5 bg-[#fdfaf5] border border-[#ded5c3] rounded-xl text-sm font-classical text-[#2c221a] placeholder-[#9c8976] focus:outline-none focus:ring-2 focus:ring-[#b93a32]/20 focus:border-[#b93a32]"
            />
            <button
              onClick={handleSubmit}
              disabled={isLoading || !inputLine.trim()}
              className="flex items-center space-x-1.5 px-4 py-2.5 bg-[#b93a32] hover:bg-[#a12f27] disabled:opacity-40 text-white text-sm font-medium rounded-xl transition-colors font-classical shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>{convertText('出令', lang)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
