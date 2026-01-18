import React, { useEffect, useState } from 'react';
import { Settings, X } from 'lucide-react';

export interface TextSettings {
  fontSize: number; // 14-24px
  fontFamily: 'system' | 'serif' | 'sans-serif' | 'mono';
  textColor: string; // hex color
  lineHeight: number; // 1.4-2.0
}

interface TextSettingsPanelProps {
  onSettingsChange: (settings: TextSettings) => void;
}

const FONT_FAMILIES = [
  { value: 'system', label: 'Mặc định', class: 'font-sans' },
  { value: 'serif', label: 'Serif', class: 'font-serif' },
  { value: 'sans-serif', label: 'Sans Serif', class: 'font-sans' },
  { value: 'mono', label: 'Monospace', class: 'font-mono' },
];

const PRESET_COLORS = [
  { value: '#000000', label: 'Đen' },
  { value: '#374151', label: 'Xám đậm' },
  { value: '#6366f1', label: 'Xanh lam' },
  { value: '#8b5cf6', label: 'Tím' },
  { value: '#dc2626', label: 'Đỏ' },
  { value: '#78b43d', label: 'Xanh lá' },
];

const LINE_HEIGHTS = [
  { value: 1.4, label: '1.4' },
  { value: 1.6, label: '1.6' },
  { value: 1.8, label: '1.8' },
  { value: 2.0, label: '2.0' },
];

const TextSettingsPanel: React.FC<TextSettingsPanelProps> = ({ onSettingsChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<TextSettings>(() => {
    const saved = localStorage.getItem('textSettings');
    return saved ? JSON.parse(saved) : {
      fontSize: 16,
      fontFamily: 'system',
      textColor: '#000000',
      lineHeight: 1.6,
    };
  });

  useEffect(() => {
    localStorage.setItem('textSettings', JSON.stringify(settings));
    onSettingsChange(settings);
  }, [settings, onSettingsChange]);

  const handleFontSizeChange = (size: number) => {
    setSettings(prev => ({ ...prev, fontSize: size }));
  };

  const handleFontFamilyChange = (family: 'system' | 'serif' | 'sans-serif' | 'mono') => {
    setSettings(prev => ({ ...prev, fontFamily: family }));
  };

  const handleColorChange = (color: string) => {
    setSettings(prev => ({ ...prev, textColor: color }));
  };

  const handleLineHeightChange = (height: number) => {
    setSettings(prev => ({ ...prev, lineHeight: height }));
  };

  const resetSettings = () => {
    const defaultSettings = {
      fontSize: 16,
      fontFamily: 'system' as const,
      textColor: '#000000',
      lineHeight: 1.6,
    };
    setSettings(defaultSettings);
  };

  const getFontFamilyClass = () => {
    const families: Record<string, string> = {
      system: 'font-sans',
      serif: 'font-serif',
      'sans-serif': 'font-sans',
      mono: 'font-mono',
    };
    return families[settings.fontFamily] || 'font-sans';
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-6 bg-[#78b43d] text-white rounded-full p-4 shadow-lg hover:bg-[#3c811e] transition-all hover:scale-110 z-40"
        title="Chỉnh sửa kiểu chữ"
        style={{bottom: 160}}
      >
        <Settings size={24} />
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-40 right-8 bg-white rounded-lg shadow-2xl p-6 w-80 max-h-[600px] overflow-y-auto z-50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Chỉnh sửa kiểu chữ</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          {/* Font Size */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Kích thước chữ: {settings.fontSize}px
            </label>
            <input
              type="range"
              min="14"
              max="24"
              value={settings.fontSize}
              onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
              className="w-full accent-[#78b43d]"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>14px</span>
              <span>24px</span>
            </div>
          </div>

          {/* Line Height */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Khoảng cách dòng: {settings.lineHeight}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {LINE_HEIGHTS.map((height) => (
                <button
                  key={height.value}
                  onClick={() => handleLineHeightChange(height.value)}
                  className={`px-2 py-2 rounded text-xs font-medium transition ${
                    settings.lineHeight === height.value
                      ? 'bg-[#78b43d] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {height.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font Family */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Kiểu chữ
            </label>
            <div className="grid grid-cols-2 gap-2">
              {FONT_FAMILIES.map((font) => (
                <button
                  key={font.value}
                  onClick={() => handleFontFamilyChange(font.value as any)}
                  className={`px-3 py-2 rounded text-xs font-medium transition ${
                    settings.fontFamily === font.value
                      ? 'bg-[#78b43d] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${font.class}`}
                >
                  {font.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text Color */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Màu chữ
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleColorChange(color.value)}
                  className={`px-3 py-2 rounded text-xs font-medium transition border-2 ${
                    settings.textColor === color.value
                      ? 'border-gray-900'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color.value, color: color.value === '#ffffff' || color.value === '#ffeb3b' ? '#000' : '#fff' }}
                  title={color.label}
                >
                  A
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.textColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="flex-1 h-10 rounded cursor-pointer"
              />
              <span className="text-xs text-gray-500 self-center">{settings.textColor}</span>
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={resetSettings}
            className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium text-sm"
          >
            ↺ Đặt lại mặc định
          </button>
        </div>
      )}
    </>
  );
};

export default TextSettingsPanel;
