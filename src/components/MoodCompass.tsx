import React from 'react';
import { MoodTheme, SolarTermInfo } from '../types';
import { convertText } from '../data/chineseConverter';
import {
  Flame,
  Moon,
  TreePine,
  Compass,
  SunMedium,
  Shield,
  HeartHandshake,
  Leaf,
  Calendar
} from 'lucide-react';

interface MoodCompassProps {
  moods: MoodTheme[];
  solarTerms: SolarTermInfo[];
  selectedMood: string;
  selectedSolarTerm: string;
  onSelectMood: (moodId: string) => void;
  onSelectSolarTerm: (termName: string) => void;
  lang: 'chs' | 'cht';
}

const ICONS_MAP: Record<string, React.ReactNode> = {
  Flame: <Flame className="w-4 h-4" />,
  Moon: <Moon className="w-4 h-4" />,
  TreePine: <TreePine className="w-4 h-4" />,
  Compass: <Compass className="w-4 h-4" />,
  SunMedium: <SunMedium className="w-4 h-4" />,
  Shield: <Shield className="w-4 h-4" />,
  HeartHandshake: <HeartHandshake className="w-4 h-4" />,
  Leaf: <Leaf className="w-4 h-4" />,
};

export const MoodCompass: React.FC<MoodCompassProps> = ({
  moods,
  solarTerms,
  selectedMood,
  selectedSolarTerm,
  onSelectMood,
  onSelectSolarTerm,
  lang,
}) => {
  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-4 bg-[#b93a32] rounded-xs" />
          <h3 className="text-base font-bold font-classical text-[#2c221a] tracking-wider">
            {convertText('心境罗盘 · 以境遇诗', lang)}
          </h3>
        </div>
        {(selectedMood || selectedSolarTerm) && (
          <button
            onClick={() => {
              onSelectMood('');
              onSelectSolarTerm('');
            }}
            className="text-xs text-[#8c7864] hover:text-[#b93a32] underline font-classical"
          >
            {convertText('清除筛选', lang)}
          </button>
        )}
      </div>

      {/* Mood Chips Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {moods.map((m) => {
          const isSelected = selectedMood === m.name;
          return (
            <button
              key={m.id}
              onClick={() => onSelectMood(isSelected ? '' : m.name)}
              className={`text-left p-3 rounded-xl border transition-all relative overflow-hidden ${
                isSelected
                  ? 'border-[#b93a32] bg-[#fdf5f2] shadow-xs'
                  : 'border-[#e4dcce] bg-[#faf6ed] hover:border-[#cfc3af] hover:bg-[#f5ede0]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div
                  className="p-1 rounded-md"
                  style={{
                    color: m.color,
                    backgroundColor: `${m.color}15`,
                  }}
                >
                  {ICONS_MAP[m.iconName] || <Leaf className="w-4 h-4" />}
                </div>
                <span
                  className={`text-[10px] tracking-wider font-classical ${
                    isSelected ? 'text-[#b93a32] font-semibold' : 'text-[#8c7864]'
                  }`}
                >
                  {isSelected ? convertText('当前心境', lang) : ''}
                </span>
              </div>
              <h4 className="text-sm font-bold font-classical text-[#2c221a]">
                {convertText(m.name, lang)}
              </h4>
              <p className="text-[11px] text-[#786655] font-classical tracking-tight mt-0.5 truncate">
                {convertText(m.alias, lang)}
              </p>
            </button>
          );
        })}
      </div>

      {/* Solar Terms Seasonal Row */}
      <div className="bg-[#f5efe3]/80 border border-[#e6decb] rounded-xl p-3 flex items-center space-x-3 overflow-x-auto">
        <div className="flex items-center space-x-1.5 shrink-0 text-xs text-[#735e4d] font-classical font-medium pr-2 border-r border-[#e0d5c0]">
          <Calendar className="w-3.5 h-3.5 text-[#b93a32]" />
          <span>{convertText('时令节气', lang)}:</span>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          {solarTerms.map((term) => {
            const isSelected = selectedSolarTerm === term.name;
            return (
              <button
                key={term.name}
                onClick={() => onSelectSolarTerm(isSelected ? '' : term.name)}
                className={`px-2.5 py-1 rounded-lg text-xs font-classical transition-colors flex items-center space-x-1 ${
                  isSelected
                    ? 'bg-[#b93a32] text-white'
                    : 'bg-[#ebe3d3] hover:bg-[#dfd5c2] text-[#4d3e33]'
                }`}
              >
                <span>{convertText(term.name, lang)}</span>
                <span className="text-[10px] opacity-75">({convertText(term.season, lang)})</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
