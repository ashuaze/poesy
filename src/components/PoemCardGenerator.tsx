import React, { useRef, useEffect, useState } from 'react';
import { Poem } from '../types';
import { X, Download, Palette } from 'lucide-react';
import { convertText } from '../data/chineseConverter';

interface PoemCardGeneratorProps {
  poem: Poem | null;
  onClose: () => void;
  lang: 'chs' | 'cht';
}

interface ThemeColor {
  id: string;
  name: string;
  bg: string;
  text: string;
  secondary: string;
  border: string;
  sealBg: string;
  sealText: string;
}

const THEMES: ThemeColor[] = [
  {
    id: 'rice-paper',
    name: '宣纸素白',
    bg: '#f8f4ec',
    text: '#2c221a',
    secondary: '#8c7864',
    border: '#dcd1bd',
    sealBg: '#b93a32',
    sealText: '#ffffff',
  },
  {
    id: 'deep-blue',
    name: '黛青寒夜',
    bg: '#18222d',
    text: '#eceff1',
    secondary: '#90a4ae',
    border: '#2c3e50',
    sealBg: '#c0392b',
    sealText: '#ffffff',
  },
  {
    id: 'bamboo-green',
    name: '竹韵幽青',
    bg: '#16281e',
    text: '#e8f5e9',
    secondary: '#81c784',
    border: '#2e5138',
    sealBg: '#b71c1c',
    sealText: '#ffffff',
  },
  {
    id: 'rouge-red',
    name: '胭脂落雪',
    bg: '#3e161a',
    text: '#fae8eb',
    secondary: '#f48fb1',
    border: '#5c2228',
    sealBg: '#c2185b',
    sealText: '#ffffff',
  },
  {
    id: 'agarwood',
    name: '沉香玄墨',
    bg: '#1c1917',
    text: '#f5f0e6',
    secondary: '#a89f91',
    border: '#38322c',
    sealBg: '#a82c24',
    sealText: '#ffffff',
  },
];

export const PoemCardGenerator: React.FC<PoemCardGeneratorProps> = ({
  poem,
  onClose,
  lang,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<ThemeColor>(THEMES[0]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  if (!poem) return null;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 800;
    const height = 1100;
    canvas.width = width;
    canvas.height = height;

    // 1. Draw Background
    ctx.fillStyle = selectedTheme.bg;
    ctx.fillRect(0, 0, width, height);

    // 2. Draw Elegant Border Frame
    ctx.strokeStyle = selectedTheme.border;
    ctx.lineWidth = 2;
    ctx.strokeRect(36, 36, width - 72, height - 72);

    ctx.strokeStyle = selectedTheme.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(44, 44, width - 88, height - 88);

    // 3. Decorative Corner Accents
    const drawCorner = (x: number, y: number) => {
      ctx.strokeStyle = selectedTheme.secondary;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.stroke();
    };
    drawCorner(56, 56);
    drawCorner(width - 56, 56);
    drawCorner(56, height - 56);
    drawCorner(width - 56, height - 56);

    // 4. Header Dynasty & Collection mark
    ctx.fillStyle = selectedTheme.secondary;
    ctx.font = '22px "Noto Serif SC", serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '8px';
    ctx.fillText(`· ${convertText(poem.dynasty, lang)} ·`, width / 2, 120);

    // 5. Title
    ctx.fillStyle = selectedTheme.text;
    ctx.font = 'bold 42px "Noto Serif SC", "Ma Shan Zheng", serif';
    ctx.letterSpacing = '4px';
    ctx.fillText(convertText(poem.title, lang), width / 2, 190);

    // 6. Author
    ctx.fillStyle = selectedTheme.secondary;
    ctx.font = '24px "Noto Serif SC", serif';
    ctx.letterSpacing = '6px';
    ctx.fillText(`〔${convertText(poem.author, lang)}〕`, width / 2, 240);

    // Subtle divider line
    ctx.strokeStyle = selectedTheme.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 80, 270);
    ctx.lineTo(width / 2 + 80, 270);
    ctx.stroke();

    // 7. Poem Verses
    ctx.fillStyle = selectedTheme.text;
    ctx.font = '28px "Noto Serif SC", serif';
    ctx.letterSpacing = '3px';
    ctx.textAlign = 'center';

    const maxLines = Math.min(poem.paragraphs.length, 8);
    const startY = 360;
    const lineHeight = 58;

    for (let i = 0; i < maxLines; i++) {
      const line = convertText(poem.paragraphs[i], lang);
      ctx.fillText(line, width / 2, startY + i * lineHeight);
    }

    // 8. Traditional Seal Stamp (Bottom Right)
    const sealX = width - 150;
    const sealY = height - 170;
    const sealW = 60;
    const sealH = 75;

    ctx.fillStyle = selectedTheme.sealBg;
    ctx.fillRect(sealX, sealY, sealW, sealH);
    ctx.strokeStyle = selectedTheme.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(sealX - 2, sealY - 2, sealW + 4, sealH + 4);

    ctx.fillStyle = selectedTheme.sealText;
    ctx.font = 'bold 22px "Ma Shan Zheng", "Noto Serif SC", cursive';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '2px';
    ctx.fillText('诗', sealX + sealW / 2, sealY + 30);
    ctx.fillText('境', sealX + sealW / 2, sealY + 60);

    // 9. Bottom App Slogan
    ctx.fillStyle = selectedTheme.secondary;
    ctx.font = '16px "Noto Serif SC", serif';
    ctx.textAlign = 'left';
    ctx.letterSpacing = '2px';
    ctx.fillText('诗境 · 古诗词搜索与意境推荐', 70, height - 80);
    ctx.font = '12px sans-serif';
    ctx.fillText('源承中华诗词名库', 70, height - 60);
  }, [poem, selectedTheme, lang]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `诗境_${poem.author}_${poem.title}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#faf6ed] border border-[#d6cbba] rounded-2xl p-6 space-y-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e4dcce] pb-3">
          <div className="flex items-center space-x-2">
            <Palette className="w-4 h-4 text-[#b93a32]" />
            <h3 className="text-base font-bold font-classical text-[#2c221a]">
              {convertText('定制雅致诗笺与壁纸', lang)}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#8c7864] hover:text-[#2c221a]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Paper Theme Chooser */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-classical text-[#735e4d]">
            {convertText('宣纸底色：', lang)}
          </span>
          <div className="flex items-center space-x-2">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-classical border transition-all ${
                  selectedTheme.id === theme.id
                    ? 'border-[#b93a32] ring-2 ring-[#b93a32]/20 font-bold'
                    : 'border-[#ded4c3] hover:border-[#b93a32]/50'
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full border border-black/10"
                  style={{ backgroundColor: theme.bg }}
                />
                <span>{convertText(theme.name, lang)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Canvas Preview */}
        <div className="flex justify-center bg-[#eae3d5] p-3 rounded-xl overflow-hidden max-h-[460px]">
          <canvas
            ref={canvasRef}
            className="max-h-[440px] w-auto h-auto rounded-lg shadow-md"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-[#8c7864] font-classical">
            {convertText('高清 800×1100 纵向比例，适合作为手机壁纸或雅趣分享', lang)}
          </span>
          <button
            onClick={handleDownload}
            className="flex items-center space-x-1.5 px-4 py-2 bg-[#b93a32] hover:bg-[#a12f27] text-white text-xs sm:text-sm font-medium rounded-lg font-classical tracking-wider transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>{convertText('保存诗笺图片', lang)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
