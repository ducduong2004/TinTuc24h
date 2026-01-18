import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Youtube, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Về 24h.com.vn</h3>
            <p className="text-sm mb-4">
              Trang tin tức trực tuyến cập nhật nhanh nhất các thông tin trong nước và quốc tế về thời sự, kinh tế, đời sống, văn hóa, giải trí...
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-white transition">
                <Youtube size={20} />
              </a>
              <a href="#" className="hover:text-white transition">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition">Trang chủ</Link></li>
              <li><a href="#" className="hover:text-white transition">Giới thiệu</a></li>
              <li><a href="#" className="hover:text-white transition">Liên hệ</a></li>
              <li><a href="#" className="hover:text-white transition">Quảng cáo</a></li>
              <li><a href="#" className="hover:text-white transition">Điều khoản sử dụng</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Chuyên mục</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/category/am-thuc" className="hover:text-white transition">Ẩm thực</Link></li>
              <li><Link to="/category/suc-khoe" className="hover:text-white transition">Sức khỏe</Link></li>
              <li><Link to="/category/du-lich" className="hover:text-white transition">Du lịch</Link></li>
              <li><Link to="/category/the-thao" className="hover:text-white transition">Thể thao</Link></li>
              <li><Link to="/category/giai-tri" className="hover:text-white transition">Giải trí</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Thông tin liên hệ</h3>
            <ul className="space-y-2 text-sm">
              <li>Địa chỉ: TP. Hồ Chí Minh</li>
              <li>Email: contact@24h.com.vn</li>
              <li>Điện thoại: (028) 1234 5678</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm">
          <p>&copy; 2025 24h.com.vn. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;