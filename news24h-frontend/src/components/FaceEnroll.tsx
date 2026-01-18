import React, { useEffect, useRef, useState } from 'react';
import { authApi } from '../services/auth';

interface FaceEnrollProps {
  onClose?: () => void;
}

const FaceEnroll: React.FC<FaceEnrollProps> = ({ onClose }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (!mounted) return;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        setMessage('Không thể truy cập camera. Vui lòng kiểm tra quyền.');
      }
    }
    start();
    return () => {
      mounted = false;
      const tracks = (videoRef.current?.srcObject as MediaStream | null)?.getTracks() || [];
      tracks.forEach(t => t.stop());
    };
  }, []);

  const captureAndEnroll = async () => {
    setMessage(null);
    setLoading(true);
    try {
      const video = videoRef.current!;
      const canvas = canvasRef.current!;
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 240;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

      const res = await authApi.enrollFace(dataUrl);
      if (res && res.success) {
        setMessage('Đăng ký khuôn mặt thành công');
      } else {
        setMessage(res?.message || 'Đăng ký khuôn mặt thất bại');
      }
    } catch (err) {
      setMessage('Lỗi khi chụp hoặc gửi ảnh');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative bg-white w-[420px] rounded-xl shadow-2xl px-6 py-5">
        <button onClick={onClose} className="absolute right-4 top-4">✕</button>
        <h3 className="text-center font-medium mb-3">Đăng ký khuôn mặt</h3>
        <div className="flex flex-col items-center gap-3">
          <video ref={videoRef} autoPlay playsInline className="w-full rounded-md bg-black" />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <button
            onClick={captureAndEnroll}
            disabled={loading}
            className="w-full bg-[#78b43d] text-white rounded-md py-2 disabled:opacity-60"
          >
            {loading ? 'Đang gửi...' : 'Chụp và đăng ký'}
          </button>
          {message && <p className="text-sm text-center text-gray-600">{message}</p>}
          <p className="text-xs text-gray-500">Hãy nhìn thẳng vào camera và giữ tư thế ổn định.</p>
        </div>
      </div>
    </div>
  );
};

export default FaceEnroll;
