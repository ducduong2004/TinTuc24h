import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Bookmark, List, Link as LinkIcon, LogOut } from 'lucide-react';
import FaceEnroll from '../components/FaceEnroll';

const AccountLinksPage: React.FC = () => {
    const [savedCount, setSavedCount] = React.useState(0);
    const [viewedCount, setViewedCount] = React.useState(0);
    const [showFaceEnroll, setShowFaceEnroll] = React.useState(false);
    const logout = () => {
        localStorage.removeItem('access_token');
        // reload để header nhận trạng thái logout
        window.location.reload();
    }

    useEffect(() => {
    try {
        const raw = localStorage.getItem('savedArticles');
        setSavedCount(raw ? JSON.parse(raw).length : 0);
    } catch { setSavedCount(0); }
    try {
        const rawV = localStorage.getItem('viewedArticles');
        setViewedCount(rawV ? JSON.parse(rawV).length : 0);
    } catch { setViewedCount(0); }
    }, []);

  return (
    <>
    <div className="max-w-5xl mx-auto my-8 px-4">
      <div className="flex gap-6">
        <aside className="w-64">
          <div className="bg-white border rounded p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white text-xl">a</div>
              <div>
                <div className="font-semibold">abc 123</div>
              </div>
            </div>
            <ul className="mt-4 text-sm text-gray-600">
              <li className="flex items-center py-2 gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                  <User size={16} strokeWidth={2.5} />
                </div>
                <Link to="/account" className="block py-2 hover:text-green-600">Thông tin tài khoản</Link>
              </li>

              <li className="flex items-center py-2 gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                  <Bookmark size={16} strokeWidth={2.5} />
                </div>
                <Link to="/saved" className="block py-2 hover:text-green-600">Tin bài đã lưu <span className="ml-2 bg-red-500 text-white rounded-full px-2 text-xs">{savedCount}</span></Link>
              </li>

              <li className="flex items-center py-2 gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                  <List size={16} strokeWidth={2.5} />
                </div>
                <Link to="/history" className="block py-2 hover:text-green-600">Tin bài đã xem <span className="ml-2 bg-red-500 text-white rounded-full px-2 text-xs">{viewedCount}</span></Link>
              </li>

              <li className="flex items-center py-2 gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                  <LinkIcon size={16} strokeWidth={2.5} />
                </div>
                <Link to="/link-account" className="block py-2 text-green-600 font-medium">Liên kết tài khoản</Link>
              </li>

              <li className="flex items-center py-2 gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white">
                  <User size={16} strokeWidth={2.5} />
                </div>
                <button onClick={() => setShowFaceEnroll(true)} className="block py-2 hover:text-green-600 text-left">Cài đặt khuôn mặt</button>
              </li>

              <li className="flex items-center py-2 gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white">
                  <LogOut size={16} strokeWidth={2.5} />
                </div>
                <button onClick={logout} className="flex-1 text-left text-red-500">Thoát tài khoản</button>
              </li>
            </ul>
          </div>
        </aside>

        <section className="flex-1 bg-white border rounded p-6">
          <h2 className="text-2xl font-semibold mb-4">Liên kết tài khoản</h2>

          <p className="text-gray-700 mb-6">Kết nối tài khoản tin tức 24h của bạn với Google, Facebook hoặc Zalo để đăng nhập bằng những tài khoản này.</p>

          <div className="space-y-4">
            <div className="flex items-center justify-between border rounded px-4 py-3">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                    <img
                    src="https://developers.google.com/identity/images/g-logo.png"
                    alt="Google"
                    className="w-5 h-5"
                    />
                </div>
                <div>Google</div>
              </div>
              <div>
                <button className="text-red-500">Ngắt liên kết</button>
              </div>
            </div>

            <div className="flex items-center justify-between border rounded px-4 py-3">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                    <img
                    src="https://cdn-icons-png.flaticon.com/512/124/124010.png"
                    alt="Facebook"
                    className="w-5 h-5"
                    />
                </div>
                <div>Facebook</div>
              </div>
              <div>
                <button className="text-green-600">Liên kết</button>
              </div>
            </div>

            <div className="flex items-center justify-between border rounded px-4 py-3">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                    <img
                    src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg"
                    alt="Zalo"
                    className="w-5 h-5"
                    />
                </div>
                <div>Zalo</div>
              </div>
              <div>
                <button className="text-green-600">Liên kết</button>
              </div>
            </div>

            <div className="mt-6">
              <button className="w-full border rounded py-3 text-red-600">Xóa tài khoản</button>
            </div>
          </div>
        </section>
      </div>
    </div>
    {showFaceEnroll && (
      <FaceEnroll onClose={() => setShowFaceEnroll(false)} />
    )}
    </>
  );
};

export default AccountLinksPage;
