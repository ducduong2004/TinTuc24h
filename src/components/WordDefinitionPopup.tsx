import React, { useState, useRef, useEffect } from 'react';
import { getWordDefinition, type DefinitionResponse } from '../services/definition';
import { X } from 'lucide-react';

const WordDefinitionPopup: React.FC = () => {
  const [selectedWord, setSelectedWord] = useState<string>('');
  const [definition, setDefinition] = useState<DefinitionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Xử lý khi người dùng bôi đen text
  const handleTextSelection = async () => {
    const selectedText = window.getSelection()?.toString().trim();
    console.log('Selected text:', selectedText);

    if (!selectedText || selectedText.length < 2) {
      setIsVisible(false);
      return;
    }

    // Bỏ dấu chấm, phẩy, dấu hỏi ở cuối
    const cleanWord = selectedText.replace(/[.,!?;:()"\-]+$/g, '').trim();

    if (cleanWord.length < 2) {
      setIsVisible(false);
      return;
    }

    console.log('Clean word:', cleanWord);
    setSelectedWord(cleanWord);
    setIsVisible(true);
    setLoading(true);

    // Lấy vị trí để hiển thị popup
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      setPosition({
        top: rect.top + window.scrollY - 10,
        left: rect.left + window.scrollX + rect.width / 2,
      });
    }

    // Gọi API để lấy định nghĩa
    console.log('Calling API for word:', cleanWord);
    const result = await getWordDefinition(cleanWord);
    console.log('API response:', result);
    setDefinition(result);
    setLoading(false);
  };

  // Lắng nghe sự kiện mouseup (khi thả chuột sau khi bôi đen)
  useEffect(() => {
    document.addEventListener('mouseup', handleTextSelection);
    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
    };
  }, []);

  // Đóng popup khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      ref={popupRef}
      className="fixed bg-white rounded-lg shadow-2xl p-4 w-72 z-50 border border-gray-200"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)',
        maxHeight: '400px',
        overflowY: 'auto',
      }}
    >
      {/* Close Button */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-gray-900">{selectedWord}</h4>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          <X size={18} />
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#78b43d] border-t-transparent"></div>
        </div>
      )}

      {/* Content */}
      {!loading && definition && (
        <>
          {definition.success ? (
            <>
              {/* Part of Speech */}
              {definition.partOfSpeech && (
                <p className="text-xs text-gray-500 italic mb-2">
                  {definition.partOfSpeech}
                </p>
              )}

              {/* Definition */}
              {definition.definition && (
                <div className="mb-3">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {definition.definition}
                  </p>
                </div>
              )}

              {/* Example */}
              {definition.example && (
                <div className="border-l-3 border-[#78b43d] pl-3 mb-3">
                  <p className="text-xs text-gray-600 italic">
                    "{definition.example}"
                  </p>
                </div>
              )}

              {/* Powered by */}
              <p className="text-xs text-gray-400 text-center mt-3 pt-3 border-t">
                Powered by Gemini AI
              </p>
            </>
          ) : (
            <div className="text-sm text-gray-600 text-center py-4">
              <p><X size={14} className="inline-block mr-2 text-red-500" />{definition.message}</p>
              <p className="text-xs text-gray-400 mt-2">Thử từ khác hoặc kiểm tra chính tả</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WordDefinitionPopup;
