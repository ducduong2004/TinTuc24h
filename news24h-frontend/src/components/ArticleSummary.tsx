import React, { useState } from "react";
import { aiApi } from "../services/api";

type Props = {
  articleId: string;
};

const ArticleSummary: React.FC<Props> = ({ articleId }) => {
  const [bullets, setBullets] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSummarize = async () => {
    try {
      setLoading(true);
      setErr(null);
      const data = await aiApi.summarize(articleId);
      setBullets(data.bullets || []);
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Không thể tóm tắt lúc này. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 p-4 rounded-lg border bg-gray-50">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-gray-900">Tóm tắt nhanh</h3>

        <button
          onClick={handleSummarize}
          disabled={loading}
          className="px-4 py-2 rounded-lg text-white bg-[#78b43d] hover:bg-[#3c811e] transition disabled:opacity-60"
        >
          {loading ? "Đang tóm tắt..." : bullets ? "Tóm tắt lại" : "Tóm tắt bằng AI"}
        </button>
      </div>

      {err && <div className="mt-3 text-sm text-red-600">{err}</div>}

      {bullets && (
        <ul className="mt-3 list-disc pl-5 space-y-2 text-gray-800">
          {bullets.length === 0 ? (
            <li>Không có nội dung tóm tắt.</li>
          ) : (
            bullets.map((b, idx) => <li key={idx}>{b}</li>)
          )}
        </ul>
      )}
    </div>
  );
};

export default ArticleSummary;
