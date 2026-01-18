import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// import { Search, Menu, X, Home, ChevronDown, User, TrendingUp, Trophy, Calendar, DollarSign } from 'lucide-react';
import LoginPage from '../pages/LoginPage';
import { Search, Menu, X, Home, ChevronDown, User, Trophy, Calendar, DollarSign, Bookmark, List, Link as LinkIcon, LogOut, Mic } from 'lucide-react';
import vangImg from '../assets/vang.jpg';
import bongDaImg from '../assets/bong-da.jpeg';
import lichImg from '../assets/lich.png';
import { CATEGORIES } from '../constants';
import { useAuth } from "../context/AuthContext";

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [savedCount, setSavedCount] = useState(0);
  const [viewedCount, setViewedCount] = useState(0);
  
  useEffect(() => {
    // If login via face just happened, backend/token was set and header should open dropdown
    try {
      if (isAuthenticated && sessionStorage.getItem('openDropdownAfterLogin') === '1') {
        setIsDropdownOpen(true);
        sessionStorage.removeItem('openDropdownAfterLogin');
      }
    } catch {}
  }, [isAuthenticated]);

  //chuyen van bang tu giong noi
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = React.useRef<any>(null);

  useEffect(() => {
    const readCounts = () => {
      try {
        const raw = localStorage.getItem('savedArticles');
        setSavedCount(raw ? JSON.parse(raw).length : 0);
      } catch { setSavedCount(0); }
      try {
        const rawV = localStorage.getItem('viewedArticles');
        setViewedCount(rawV ? JSON.parse(rawV).length : 0);
      } catch { setViewedCount(0); }
    };

    readCounts();

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'savedArticles' || e.key === 'viewedArticles') readCounts();
    };

    window.addEventListener('storage', onStorage);

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Trình duyệt không hỗ trợ Speech Recognition");
    } else {
      const recognition = new SpeechRecognition();
      recognition.lang = "vi-VN";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const cleanedTranscript = transcript.trim().replace(/[.,!?]+$/g, '');

        setSearchQuery(cleanedTranscript);
        navigate(`/search?q=${encodeURIComponent(cleanedTranscript)}`);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      window.removeEventListener('storage', onStorage);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [navigate]);

  const handleVoiceSearch = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const visibleCategories = CATEGORIES.slice(0, 10);
  const hiddenCategories = CATEGORIES.slice(10);

  return (
    <>
      {/* MOBILE TOP BAR - Giữ nguyên */}
      <div className="fixed top-0 left-0 right-0 h-12 bg-green-600 text-white flex items-center justify-between px-4 text-sm font-medium z-50 md:hidden shadow-lg">
        <button onClick={() => setIsMenuOpen(true)} className="p-1">
          <Menu size={26} />
        </button>
        <div className="flex items-center gap-3">
          <Home size={18} />
        </div>
      </div>

      {/* HEADER CHÍNH (DESKTOP) */}
      <header className="pt-12 md:pt-0 shadow-md">
        
        {/* Hàng 1: Logo + Các nút đặc biệt + Search + User */}
        <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* LOGO - TO HƠN */}
          <Link to="/" className="shrink-0">
            <div className="bg-white px-5 py-1 rounded-lg transition-all duration-300">
               <img 
                alt="Tin tức 24h" 
                src="https://cdn.24h.com.vn/images/2023/logo-24h-new.svg" 
                className="h-12 md:h-14 w-auto object-contain" 
              />
            </div>
          </Link>

          {/* CÁC MỤC ĐẶC BIỆT - LOGOS (sitting flush on green nav) */}
          <div className="hidden lg:flex items-center gap-3 mt-6 lg:-mt-8" style={{marginLeft: 100}}>
            <Link to="/gia-vang" title="Giá vàng" className="ms-12 mt-5 pt-3 flex items-center px-2 py-0 hover:opacity-90 transition-opacity">
              <img src={vangImg} alt="Giá vàng" className="h-6 w-auto object-contain me-2" />
              <span>Giá vàng</span>
            </Link>

            <Link to="/cup-c1" title="Cup C1" className=" ms-4 me-4 mt-5 pt-3 flex items-center px-2 py-0 hover:opacity-90 transition-opacity">
              <img src={bongDaImg} alt="Cup C1" className="h-6 w-auto object-contain me-2" />
              <span>Cup C1</span>
            </Link>

            <Link to="/lich-van-nien" title="Lịch" className=" mt-5 pt-3 flex items-center px-2 py-0 hover:opacity-90 transition-opacity">
              <img src={lichImg} alt="Lịch" className="h-6 w-auto object-contain me-2" />
              <span>Lịch</span>
            </Link>
          </div>

          {/* CỤM SEARCH & USER */}
          <div className="flex items-center gap-5 w-full lg:w-auto">
            {/* Search Form - LỚN VÀ ĐẸP HƠN */}
            <form onSubmit={handleSearch} className="relative w-full md:w-96 group border border-gray rounded-full px-2">
              <input
                type="text"
                placeholder="Tìm kiếm tin tức..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-5 pr-12 text-base text-gray-800 bg-transparent rounded-full outline-none focus:border-white transition-all"
              />
               {/* Voice Search Button */}
              <button
                type="button"
                onClick={handleVoiceSearch}
                className={`absolute right-10 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition ${
                  isListening ? "bg-green-600 animate-pulse text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                title="Tìm kiếm bằng giọng nói"
                style={{marginRight: 5}}
              >
                <Mic size={16} />
              </button>

              {/* Search Button */}
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 bg-white text-gray-800 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-100 transition-all"
              >
                <Search size={18} />
              </button>
            </form>

            {/* User Icon - open login modal */}
            {!isAuthenticated ? (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="hidden md:flex flex-col items-center hover:bg-white/15 px-4 py-2 rounded-xl"
              >
                <User size={22} />
                <span className="text-xs font-semibold">Đăng nhập</span>
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-white/20"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown size={14} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white text-gray-800 rounded-lg shadow-xl z-[9999]">
                    <div className="px-4 py-3 border-b font-semibold">
                      {user?.name}
                    </div>
                    <Link to="/account" onClick={() => setIsDropdownOpen(false)} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                          <User size={16} strokeWidth={2.5} />
                        </div>
                        <span>Thông tin tài khoản</span>
                      </div>
                    </Link>
                    <Link to="/saved" onClick={() => setIsDropdownOpen(false)} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                            <Bookmark size={16} strokeWidth={2.5} />
                          </div>
                          <span>Tin bài đã lưu</span>
                        </div>
                        <span className="ml-2 bg-red-500 text-white rounded-full px-2 text-xs">{savedCount}</span>
                      </div>
                    </Link>
                    <Link to="/history" onClick={() => setIsDropdownOpen(false)} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                            <List size={16} strokeWidth={2.5} />
                          </div>
                          <span>Tin bài đã xem</span>
                        </div>
                        <span className="ml-2 bg-red-500 text-white rounded-full px-2 text-xs">{viewedCount}</span>
                      </div>
                    </Link>
                    <Link to="/link-account" onClick={() => setIsDropdownOpen(false)} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                       <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                          <LinkIcon size={16} strokeWidth={2.5} />
                        </div>
                        <span>Liên kết tài khoản</span>
                      </div>
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white">
                          <LogOut size={16} strokeWidth={2.5} />
                        </div>
                        <span>Thoát tài khoản</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </header>
      {/* Hàng 2: MENU NGANG */}
      <nav className="bg-[#78b43d] text-white sticky top-0 z-50 border-t border-green-800/30">
        <div className="max-w-7xl mx-auto">
          <ul className="hidden md:flex items-center text-sm font-bold uppercase tracking-wide" style={{marginLeft: 50}}>
            {/* Icon Menu 3 gạch */}
            <li>
              <button
                onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                className="flex items-center gap-2 px-4 py-3 hover:bg-[#3c811e] transition text-white/90 hover:text-white"
              >
                <Menu size={20} />
              </button>
            </li>
            
            {/* Icon Home */}
            <li>
              <Link
                to="/"
                className="flex items-center gap-2 px-4 py-3 hover:bg-[#3c811e] transition text-white/90 hover:text-white"
              >
                <Home size={20} />
              </Link>
            </li>

            {/* Các mục menu chính */}
            {visibleCategories.map((cat) => (
              <li 
                key={cat.slug}
                className="relative"
                onMouseEnter={() => setHoveredCategory(cat.slug)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <Link
                  to={
                    cat.slug === 'bong-da' 
                      ? '/category/serie-a' 
                      : cat.subcategories && cat.subcategories.length > 0 
                        ? `/category/${cat.subcategories[0].slug}` 
                        : `/category/${cat.slug}`
                  }
                  className="block px-4 py-3 hover:bg-[#3c811e] transition whitespace-nowrap text-white/90 hover:text-white"
                >
                  {cat.name}
                </Link>
                
                {/* Dropdown submenu */}
                {cat.subcategories && cat.subcategories.length > 0 && hoveredCategory === cat.slug && (
                  <div className={`absolute top-full left-0 bg-white text-gray-800 shadow-xl rounded-b-lg overflow-hidden border-t-2 border-[#78b43d] z-50 animate-in fade-in slide-in-from-top-2 duration-200 ${
                    cat.slug === 'bong-da' ? 'min-w-[700px] grid grid-cols-3 gap-x-2' : 'min-w-[220px]'
                  }`}>
                    <ul className={cat.slug === 'bong-da' ? 'py-2 col-span-3 grid grid-cols-3 gap-x-2' : 'py-1'}>
                      {cat.subcategories.map((subcat) => {
                        // Các trang đặc biệt không cần /category/
                        const specialPages = ['lich-thi-dau', 'ket-qua', 'bxh', 'top-ghi-ban'];
                        const linkPath = specialPages.includes(subcat.slug) 
                          ? `/${subcat.slug}` 
                          : `/category/${subcat.slug}`;
                        
                        return (
                          <li key={subcat.slug}>
                            <Link
                              to={linkPath}
                              className="block px-5 py-2.5 hover:bg-green-50 hover:text-green-600 transition text-sm font-semibold"
                              onClick={() => setHoveredCategory(null)}
                            >
                              {subcat.name}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </li>
            ))}

            {/* Dropdown Xem thêm */}
            {hiddenCategories.length > 0 && (
              <li className="relative ml-auto border-l border-green-800/30">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1 px-4 py-3 hover:bg-[#3c811e] transition text-white/90 hover:text-white"
                >
                  <Menu size={18} />
                  <ChevronDown size={14} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div
                    className="absolute top-full right-0 w-48 bg-white text-gray-800 shadow-xl rounded-b-lg overflow-hidden border-t-2 border-[#78b43d] z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                    onMouseLeave={() => setIsDropdownOpen(false)}
                  >
                    <ul className="py-1">
                      {hiddenCategories.map((cat) => (
                        <li key={cat.slug}>
                          <Link
                            to={`/category/${cat.slug}`}
                            className="block px-5 py-2.5 hover:bg-green-50 hover:text-green-600 transition text-sm font-semibold"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            {cat.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            )}
          </ul>
        </div>
      </nav>

      {/* MEGA MENU - Hiển thị xuống bên dưới */}
      {isMegaMenuOpen && (
        <div className="relative z-50">
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsMegaMenuOpen(false)} 
          />
          <div className="absolute top-full left-0 right-0 bg-white shadow-2xl z-50 relative" onClick={(e) => e.stopPropagation()}>
            <div className="container mx-auto px-6 py-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Danh mục tin tức</h2>
                <button 
                  onClick={() => setIsMegaMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {CATEGORIES.map((category) => (
                  <div key={category.slug} className="space-y-2">
                    <h3 className="font-bold text-[#78b43d] text-xs uppercase border-b border-gray-200 pb-2">
                      {category.name}
                    </h3>
                    {category.subcategories && category.subcategories.length > 0 ? (
                      <ul className="space-y-1">
                        {category.subcategories.map((subcat) => {
                          const specialPages = ['lich-thi-dau', 'ket-qua', 'bxh', 'top-ghi-ban'];
                          const linkPath = specialPages.includes(subcat.slug) 
                            ? `/${subcat.slug}` 
                            : `/category/${subcat.slug}`;
                          
                          return (
                            <li key={subcat.slug} className="group">
                              <Link
                                to={linkPath}
                                onClick={() => setIsMegaMenuOpen(false)}
                                className="text-xs font-semibold text-gray-700 hover:text-[#78b43d] hover:bg-green-50 hover:underline block py-2 px-2 cursor-pointer transition-all duration-200 rounded"
                              >
                                {subcat.name}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <Link
                        to={`/category/${category.slug}`}
                        onClick={() => setIsMegaMenuOpen(false)}
                        className="text-xs text-gray-600 hover:text-[#78b43d] hover:underline block py-1 cursor-pointer"
                      >
                        Xem tất cả
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE DRAWER - Giữ nguyên */}
      {isMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <div className="fixed top-0 left-0 bottom-0 w-80 bg-green-600 text-white z-50 overflow-y-auto shadow-2xl transition-transform duration-300">
            <div className="flex items-center justify-between p-4 border-b border-green-700 bg-green-700/50">
              <Link to="/" className="bg-white px-2 py-1 rounded" onClick={() => setIsMenuOpen(false)}>
                 <img src="https://cdn.24h.com.vn/images/2023/logo-24h-new.svg" alt="24h" className="h-6" />
              </Link>
              <button onClick={() => setIsMenuOpen(false)} className="hover:bg-green-700 p-1 rounded transition">
                <X size={24} />
              </button>
            </div>
            
            {/* Mobile Search */}
            <div className="p-4 border-b border-green-700 bg-green-800/30">
              <form onSubmit={handleSearch} className="flex relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-10 py-2 rounded-full text-gray-800 text-sm outline-none focus:ring-2 focus:ring-green-400"
                />

                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  className={`absolute right-10 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full ${
                    isListening ? "bg-white text-green-600 animate-pulse" : "bg-green-500 text-white"
                  }`}
                >
                  <Mic size={16} />
                </button>

                <button className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 bg-white text-gray-800 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-100">
                  <Search size={16} />
                </button>
              </form>
            </div>

            <ul className="text-base font-medium py-2">
              <li>
                <button onClick={() => { setIsLoginOpen(true); setIsMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-6 py-3 hover:bg-green-700 transition">
                  <User size={18} /> Đăng nhập
                </button>
              </li>
              <li>
                <Link to="/" className="flex items-center gap-3 px-6 py-3 hover:bg-green-700 transition" onClick={() => setIsMenuOpen(false)}>
                  <Home size={18} /> Trang chủ
                </Link>
              </li>
              {CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    to={`/category/${cat.slug}`}
                    className="block px-6 py-3 hover:bg-green-700 transition border-l-4 border-transparent hover:border-white pl-5"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
        {isLoginOpen && <LoginPage onClose={() => setIsLoginOpen(false)} />}
        
        <style>{`
          a {
            cursor: pointer;
          }
          .mega-menu-link:hover {
            cursor: pointer;
          }
        `}</style>
    </>
  );
};

export default Header;