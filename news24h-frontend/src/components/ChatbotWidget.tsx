import React, { useMemo, useRef, useState } from "react";
import { aiApi } from "../services/api";
import type { AiChatMessage } from "../types/ai";
import { MessageCircle } from "lucide-react";

const ChatbotWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<AiChatMessage[]>([
    { role: "model", text: "Chào bạn! Mình là trợ lý tin tức 24h. Bạn muốn hỏi gì?" },
  ]);

  const listRef = useRef<HTMLDivElement | null>(null);

  const historyToSend = useMemo(() => {
    // gửi tối đa 12 tin gần nhất để nhẹ quota
    const last = messages.slice(-12);
    return last.map((m) => ({ role: m.role, text: m.text }));
  }, [messages]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    });
  };

  const send = async () => {
    console.log("SEND CLICKED", { open, input, loading });
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    const next: AiChatMessage[] = [
    ...messages,
    { role: "user", text }
    ];
    setMessages(next);
    setLoading(true);
    scrollToBottom();

    try {
      const res = await aiApi.chat(text, historyToSend);
      setMessages((prev) => [...prev, { role: "model", text: res.reply || "Mình chưa có câu trả lời." }]);
      scrollToBottom();
    } catch (e: any) {
      const msg =
        e?.response?.status === 401
          ? "Bạn cần đăng nhập để dùng chatbot."
          : e?.response?.data?.message || "Chatbot đang bận. Bạn thử lại nhé.";
      setMessages((prev) => [...prev, { role: "model", text: msg }]);
      scrollToBottom();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 flex items-center justify-center rounded-full shadow-lg
                  text-white bg-[#78b43d] hover:bg-[#3c811e] transition"
        aria-label="Mở chatbot"
      >
        <MessageCircle size={24} />
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-20 z-50 w-[340px] max-w-[90vw] rounded-2xl shadow-2xl border bg-white overflow-hidden" style={{right:82, bottom:27}}>
          <div className="flex items-center justify-between px-4 py-3 bg-[#78b43d] text-white">
            <div className="font-semibold">Trợ lý 24h</div>
            <button onClick={() => setOpen(false)} className="opacity-90 hover:opacity-100">
              ✕
            </button>
          </div>

          <div ref={listRef} className="h-[360px] overflow-y-auto p-3 space-y-3 bg-gray-50">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-[#78b43d] text-white rounded-br-md"
                      : "bg-white border text-gray-900 rounded-bl-md"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="text-xs text-gray-500">Đang trả lời...</div>
            )}
          </div>

          <div className="p-3 border-t bg-white">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") send();
                }}
                placeholder="Nhập câu hỏi..."
                className="flex-1 px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#78b43d]"
              />
              <button
                onClick={send}
                disabled={loading}
                className="px-4 py-2 rounded-xl text-white bg-[#78b43d] hover:bg-[#3c811e] transition disabled:opacity-60"
              >
                Gửi
              </button>
            </div>
            <div className="mt-2 text-[11px] text-gray-500">
              Mẹo: hỏi ngắn gọn, 1 ý/1 câu sẽ trả lời nhanh hơn.
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;
