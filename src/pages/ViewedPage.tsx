import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Bookmark, List, Link as LinkIcon, LogOut } from 'lucide-react';
import { newsApi } from '../services/api';
import type { NewsArticle } from '../types';
import FaceEnroll from '../components/FaceEnroll';

const ViewedPage: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
    const [savedCount, setSavedCount] = useState(0);
    const [viewedCount, setViewedCount] = useState(0);
    const [showFaceEnroll, setShowFaceEnroll] = useState(false);
  const logout = () => {
        localStorage.removeItem('access_token');
        // reload để header nhận trạng thái logout
        window.location.reload();
    }

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const raw = localStorage.getItem('viewedArticles');
      let ids: string[] = [];
      try { ids = raw ? JSON.parse(raw) : []; } catch { ids = []; }

      setViewedCount(ids.length);
      try { const rawV = localStorage.getItem('savedArticles'); setSavedCount(rawV?JSON.parse(rawV).length:0);}catch{setSavedCount(0);} 

      const results: NewsArticle[] = [];
      for (const id of ids) {
        try {
          const a = await newsApi.getById(id);
          results.push(a);
        } catch {
          // ignore
        }
      }

      setArticles(results);
      setLoading(false);
    };

    load();
  }, []);

  const remove = (id: string) => {
    const raw = localStorage.getItem('viewedArticles');
    let arr: string[] = [];
    try { arr = raw ? JSON.parse(raw) : []; } catch { arr = []; }
    arr = arr.filter(x => x !== id);
    localStorage.setItem('viewedArticles', JSON.stringify(arr));
    setArticles(prev => prev.filter(a => a.id.toString() !== id));
    setViewedCount(arr.length);
  };


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
                <Link to="/history" className="block py-2 text-green-600 font-medium">Tin bài đã xem <span className="ml-2 bg-red-500 text-white rounded-full px-2 text-xs">{viewedCount}</span></Link>
              </li>

              <li className="flex items-center py-2 gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                  <LinkIcon size={16} strokeWidth={2.5} />
                </div>
                <Link to="/link-account" className="block py-2 hover:text-green-600">Liên kết tài khoản</Link>
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
          <h2 className="text-2xl font-semibold mb-4">Tin bài đã xem</h2>

          {articles.length === 0 ? (
            <div className="text-gray-600">Bạn chưa xem bài nào gần đây.</div>
          ) : (
            <div className="space-y-6">
              {articles.map(a => (
                <div key={a.id} className="flex gap-4 items-start">
                  <img src={a.thumbnail} alt={a.title} className="w-40 h-24 object-cover rounded" onError={(e) => {(e.target as HTMLImageElement).src = 'https://via.placeholder.com/160x90?text=No+Image';}} />
                  <div className="flex-1">
                    <Link to={`/news/${a.id}`} className="text-lg font-semibold text-gray-900 hover:text-green-600">{a.title}</Link>
                    <div className="mt-2 flex gap-3">
                      <button onClick={() => remove(a.id.toString())} className="px-3 py-1 border rounded bg-red-50 text-red-600">Xóa</button>
                      <Link to={`/news/${a.id}`} className="px-3 py-1 rounded bg-green-500 text-white">Đọc</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
    {showFaceEnroll && (
      <FaceEnroll onClose={() => setShowFaceEnroll(false)} />
    )}
    </>
  );
};

export default ViewedPage;
