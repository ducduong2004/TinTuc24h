import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from "../services/auth";
import FaceLogin from '../components/FaceLogin';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onClose?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onClose }) => {
  const [showFaceLogin, setShowFaceLogin] = useState(false);
  const { login } = useAuth();

  const handleFaceLoginSuccess = (res: any) => {
    if (res?.token) {
      // use auth context to set user from token
      login(res.token);
      // tell header to open dropdown after login
      try { sessionStorage.setItem('openDropdownAfterLogin', '1'); } catch {}
      setShowFaceLogin(false);
      onClose?.();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative bg-white w-[420px] rounded-xl shadow-2xl px-8 py-6">

        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 transition text-xl"
        >
          ✕
        </button>

        <div className="flex justify-center mb-4">
          <img
            src="https://cdn.24h.com.vn/images/2023/logo-24h-new.svg"
            alt="24h"
            className="h-14"
          />
        </div>

        <h2 className="text-center text-base font-medium text-gray-800 mb-6">
          Đăng nhập 24h bằng tài khoản
        </h2>

        <div className="space-y-3">
          <button
            onClick={authApi.loginGoogle}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-2.5 hover:bg-gray-50 transition"
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google"
              className="w-5 h-5"
            />
            <span className="font-medium text-gray-800">Google</span>
          </button>

          <button
            onClick={authApi.loginFacebook}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-2.5 hover:bg-gray-50 transition"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/124/124010.png"
              alt="Facebook"
              className="w-5 h-5"
            />
            <span className="font-medium text-gray-800">Facebook</span>
          </button>

          <button
            onClick={authApi.loginZalo}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-2.5 hover:bg-gray-50 transition"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg"
              alt="Zalo"
              className="w-5 h-5"
            />
            <span className="font-medium text-gray-800">Zalo</span>
          </button>

          {/* Face login */}
          <button
            onClick={() => setShowFaceLogin(true)}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-2.5 hover:bg-gray-50 transition"
          >
            <span className="font-medium text-gray-800">Đăng nhập bằng khuôn mặt</span>
          </button>
        </div>

        <p className="text-xs text-center text-gray-500 mt-6 leading-relaxed">
          Khi thực hiện "Đăng nhập" có nghĩa là bạn đã đồng ý với{' '}
          <Link to="#" className="text-[#78b43d] hover:underline">
            Điều khoản dịch vụ
          </Link>{' '}
          và{' '}
          <Link to="#" className="text-[#78b43d] hover:underline">
            Chính sách quyền riêng tư
          </Link>{' '}
          của 24h.com.vn
        </p>

        {showFaceLogin && (
          <FaceLogin onClose={() => setShowFaceLogin(false)} onSuccess={handleFaceLoginSuccess} />
        )}
      </div>
    </div>
  );
};

export default LoginPage;
