import React, { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { Link } from "react-router-dom";
import { User, Bookmark, List, Link as LinkIcon, LogOut } from 'lucide-react';
import FaceEnroll from '../components/FaceEnroll';

const AccountPage: React.FC = () => {
  const [name, setName] = useState('abc 123');
  const [email] = useState('abc396936@gmail.com');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState(0);
  const [viewedCount, setViewedCount] = useState(0);
  const [showFaceEnroll, setShowFaceEnroll] = useState(false);
    const logout = () => {
        localStorage.removeItem('access_token');
        // reload để header nhận trạng thái logout
        window.location.reload();
    }

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

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

  const handleSave = () => {
    // TODO: call API to save profile
    alert('Lưu thay đổi (demo)');
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
              {/* <li>
                <Link to="/account" className="block py-2 text-green-600 font-medium">Thông tin tài khoản</Link>
              </li> */}

              <li className="flex items-center py-2 gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                  <User size={16} strokeWidth={2.5} />
                </div>
                <Link to="/account" className="block py-2 text-green-600 font-medium">Thông tin tài khoản</Link>
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
          <h2 className="text-2xl font-semibold mb-4">Thông tin tài khoản</h2>

          <div className="flex items-center gap-6 mb-6">
            <div className="w-24 h-24 rounded-full bg-purple-500 flex items-center justify-center text-white text-4xl overflow-hidden">
              {avatar ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" /> : 'a'}
            </div>
            <div>
              <label className="inline-block bg-gray-100 border px-3 py-1 rounded cursor-pointer">
                Đổi ảnh
                <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
              </label>
              <div className="text-sm text-gray-500 mt-2">Định dạng PNG, JPG | Dung lượng tối đa 5MB</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Họ và tên <span className="text-red-500">*</span></label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email <span className="text-red-500">*</span></label>
              <input value={email} disabled className="w-full border rounded px-3 py-2 bg-gray-50" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Số điện thoại</label>
              <input placeholder="Nhập tại đây..." value={phone} onChange={e => setPhone(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ngày sinh</label>
              <input type="date" value={dob} onChange={e => setDob(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Địa chỉ</label>
              <textarea value={address} onChange={e => setAddress(e.target.value)} className="w-full border rounded px-3 py-2 h-28" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Giới tính</label>
              <label className="inline-flex items-center mr-4"><input type="radio" name="gender" checked={gender === 'male'} onChange={() => setGender('male')} className="mr-2" />Nam</label>
              <label className="inline-flex items-center"><input type="radio" name="gender" checked={gender === 'female'} onChange={() => setGender('female')} className="mr-2" />Nữ</label>
            </div>
          </div>

          <div className="mt-6 border-t pt-4 flex gap-3 justify-end">
            <button className="px-4 py-2 border rounded bg-gray-100">Hủy bỏ</button>
            <button onClick={handleSave} className="px-4 py-2 rounded bg-green-500 text-white">Lưu thay đổi</button>
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

export default AccountPage;
