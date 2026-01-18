import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mic, MicOff, Volume2, Square } from 'lucide-react';

// Định nghĩa nhanh type cho Web Speech API nếu TS báo lỗi
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const VoiceAssistant: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [message, setMessage] = useState("Trợ lý ảo 24h");
  
  const navigate = useNavigate();
  const location = useLocation();
  const recognitionRef = useRef<any>(null);

  // --- 1. Cấu hình Speech Recognition (Nghe) ---
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.continuous = false; // Nghe xong 1 câu là xử lý ngay
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('User said:', transcript);
        handleCommand(transcript);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // --- 2. Cấu hình Text-to-Speech (Nói) ---
  const speak = (text: string, callback?: () => void) => {
    window.speechSynthesis.cancel(); // Dừng câu cũ
    setIsSpeaking(true);
    setMessage(text);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 1.1;

    utterance.onend = () => {
      setIsSpeaking(false);
      setMessage("Đang chờ lệnh...");
      if (callback) callback();
    };

    window.speechSynthesis.speak(utterance);
  };

  // --- 3. Xử lý Logic lệnh (Brain) ---
  const handleCommand = (transcript: string) => {
    const lowerText = transcript.toLowerCase();
    
    // 3.1 Điều hướng Danh mục
    if (lowerText.includes('bóng đá') || lowerText.includes('thể thao')) {
      navigate('/category/bong-da');
      speak('Đã mở danh mục Bóng đá. Bạn muốn xem bài số mấy?');
      return;
    }
    if (lowerText.includes('ô tô')) {
      navigate('/category/oto');
      speak('Đã mở danh mục Ô tô.');
      return;
    }
    if (lowerText.includes('phim')) {
      navigate('/category/phim');
      speak('Đã mở danh mục Phim.');
      return;
    }
    if (lowerText.includes('giá vàng')) {
      navigate('/gia-vang');
      speak('Đã mở trang Giá vàng.');
      return;
    }
    if (lowerText.includes('lịch vạn niên')) {
      navigate('/lich-van-nien');
      speak('Đã mở trang Lịch vạn niên.');
      return;
    }

    // 3.2 Chọn bài viết theo số thứ tự (Khi đang ở trang Category)
    // Ví dụ: "Mở bài số 2", "Xem bài đầu tiên"
    if (lowerText.includes('bài số') || lowerText.includes('bài thứ')) {
      const numberMatch = lowerText.match(/\d+/); // Tìm số trong chuỗi
      let index = -1;

      if (numberMatch) {
        index = parseInt(numberMatch[0]) - 1; // Array bắt đầu từ 0
      } else if (lowerText.includes('đầu tiên') || lowerText.includes('số một')) {
        index = 0;
      }

      if (index >= 0) {
        // Tìm các thẻ có class 'news-item-trigger' (Chúng ta sẽ thêm class này ở bước sau)
        const articles = document.querySelectorAll<HTMLElement>('.news-item-trigger');
        
        if (articles[index]) {
          speak(`Đang mở bài viết số ${index + 1}`, () => {
             articles[index].click(); // Tự động click
          });
        } else {
          speak(`Không tìm thấy bài viết số ${index + 1}`);
        }
        return;
      }
    }

    // 3.3 Đọc nội dung chi tiết (Khi đang ở trang Detail)
    if (lowerText.includes('đọc bài') || lowerText.includes('nghe tin')) {
      const readButton = document.getElementById('btn-read-news');
      if (readButton) {
        // AI phản hồi xác nhận trước
        speak('Ok, tôi sẽ đọc bài này ngay.', () => {
             // Sau khi AI nói xong câu trên thì mới bấm nút
             // Lúc này logic bên NewsDetailPage sẽ chạy (speechSynthesis của trang web)
             readButton.click();
        });
      } else {
        speak('Bạn chưa mở bài báo nào, hoặc bài này không hỗ trợ đọc.');
      }
      return;
    }
    if (lowerText.includes('dừng lại') || lowerText.includes('tạm dừng') || lowerText.includes('tiếp tục')) {
       const pauseButton = document.getElementById('btn-pause-news');
       const readButton = document.getElementById('btn-read-news'); // Nút này cũng dùng để tắt hẳn

       if (pauseButton) {
          pauseButton.click(); // Bấm nút vàng (Pause/Resume)
          speak('Đã thực hiện.');
       } else if (readButton && lowerText.includes('dừng')) {
          // Nếu không có nút pause (tức là chưa đọc), hoặc muốn tắt hẳn
          readButton.click(); // Bấm nút xanh để tắt
       } else {
          speak('Không có gì để dừng cả.');
       }
       return;
    }

    // 3.4 Về trang chủ
    if (lowerText.includes('trang chủ') || lowerText.includes('về nhà')) {
      navigate('/');
      speak('Đã về trang chủ.');
      return;
    }

    // 3.5 Lệnh không hiểu
    speak('Xin lỗi, tôi chưa hiểu lệnh: ' + transcript);
  };

  // --- Helper Controls ---
  const toggleListening = () => {
    if (isListening) recognitionRef.current?.stop();
    else recognitionRef.current?.start();
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // Ẩn ở trang login
  if (location.pathname === '/login') return null;

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-2">
      {/* Bong bóng hội thoại */}
      {(isListening || isSpeaking) && (
        <div className="bg-white px-4 py-2 rounded-lg shadow-xl border border-gray-200 mb-2 max-w-[200px] animate-fade-in-up">
          <p className="text-sm text-gray-700 font-medium">
            {isSpeaking ? '🤖 Đang nói...' : '🎙️ Đang nghe...'}
          </p>
          <p className="text-xs text-gray-500 truncate">{message}</p>
        </div>
      )}

      {/* Nút điều khiển chính */}
      <div className="flex flex-col gap-2">
        {isSpeaking && (
          <button 
            onClick={stopSpeaking}
            className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-red-600 transition"
            title="Dừng đọc"
          >
            <Square size={20} fill="currentColor" />
          </button>
        )}

        <button
          onClick={toggleListening}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl transition-all transform hover:scale-110 ${
            isListening ? 'bg-red-500 animate-pulse' : 'bg-[#78b43d]'
          }`}
        >
          {isListening ? <MicOff size={24} /> : <Mic size={24} />}
        </button>
      </div>
    </div>
  );
};

export default VoiceAssistant;