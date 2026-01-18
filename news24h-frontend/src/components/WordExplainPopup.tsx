import React from "react";

type Meaning = {
    pos: string;
    definition: string;
    source: string;
};

interface Props {
    word: string;
    meanings: Meaning[];
    loading: boolean;
    position: {x: number; y: number };
    onClose: () => void;
}

const WordExplainPopup: React.FC<Props> = ({ word, meanings, loading, position, onClose }) => {
  
  if (!loading && !meanings.length) return null;
  const first = meanings[0];
  
  return (
    <div
      className="fixed z-50 bg-white shadow-xl border rounded-lg p-4 max-w-sm text-sm"
      style={{ top: position.y + 10, left: position.x + 10 }}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-2">
        <strong className="text-green-700">{word}</strong>
        <button onClick={onClose} className="text-gray-400 hover:text-red-500">
          ✕
        </button>
      </div>

      {loading && (
        <div className="animate-pulse space-y-2">
          <span className="italic text-gray-600"> đang tìm, bạn chờ chút nhé </span>{" "}
          <div className="h-3 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-1/3" />
        </div>
      )}


      {!loading && meanings.length > 0 && (
       <div>
        <span className="italic text-gray-600">[{first.pos}]</span>{" "}
        {first.definition}
        <div className="text-xs text-gray-400">Nguồn: {first.source}</div>
      </div>
      )}

    </div>
    
    );
};

export default WordExplainPopup;