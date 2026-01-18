import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import * as amlich from 'amlich';
import { newsApi } from '../services/api';
import type { NewsArticle } from '../types';
import { Link } from 'react-router-dom';

interface DayInfo {
  solar: number;
  lunar: number;
  lunarMonth: number;
  isToday: boolean;
  isCurrentMonth: boolean;
  canChi: string;
  tietKhi: string;
  solarHoliday?: string;
  lunarHoliday?: string;
}

// Can và Chi
const CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
const CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];

// Hàm tính Can Chi từ Julian Day Number
const getCanChiFromJD = (jd: number): string => {
  const can = CAN[(jd + 9) % 10];
  const chi = CHI[(jd + 1) % 12];
  return can + " " + chi;
};

// Hàm tính Can Chi của năm
const getYearCanChi = (year: number): string => {
  const can = CAN[(year + 6) % 10];
  const chi = CHI[(year + 8) % 12];
  return can + " " + chi;
};

// Danh sách ngày lễ dương lịch Việt Nam
const HOLIDAYS_SOLAR: { [key: string]: string } = {
  '1/1': 'Tết Dương lịch',
  '14/2': 'Valentine',
  '8/3': 'Quốc tế Phụ nữ',
  '20/3': 'Quốc tế Hạnh phúc',
  '30/4': 'Giải phóng miền Nam',
  '1/5': 'Quốc tế Lao động',
  '19/5': 'Sinh nhật Bác Hồ',
  '1/6': 'Quốc tế Thiếu nhi',
  '28/6': 'Ngày Gia đình VN',
  '27/7': 'Ngày Thương binh Liệt sĩ',
  '19/8': 'Cách mạng Tháng Tám',
  '2/9': 'Quốc khánh',
  '10/10': 'Giải phóng Thủ đô',
  '20/10': 'Ngày Phụ nữ VN',
  '20/11': 'Ngày Nhà giáo VN',
  '1/12': 'Ngày thế giới phòng chống AIDS',
  '19/12': 'Ngày toàn quốc kháng chiến',
  '22/12': 'Ngày thành lập QĐND VN',
  '24/12': 'Giáng sinh (Lễ)',
  '25/12': 'Ngày lễ Giáng sinh',
  '31/12': 'Giao thừa'
};

// Danh sách ngày lễ âm lịch
const HOLIDAYS_LUNAR: { [key: string]: string } = {
  '1/1': 'Tết Nguyên Đán',
  '15/1': 'Tết Nguyên Tiêu',
  '10/3': 'Giỗ Tổ Hùng Vương',
  '15/4': 'Phật Đản',
  '5/5': 'Tết Đoan Ngọ',
  '15/7': 'Vu Lan',
  '15/8': 'Tết Trung thu',
  '23/12': 'Ông Táo chầu trời'
};

const LunarCalendarPage = () => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  // Lấy thông tin âm lịch của ngày hiện tại
  const todayLunar = amlich.convertSolar2Lunar(
    today.getDate(),
    today.getMonth() + 1,
    today.getFullYear(),
    7
  );
  
  const selectedDateLunar = amlich.convertSolar2Lunar(
    currentDate.getDate(),
    currentDate.getMonth() + 1,
    currentDate.getFullYear(),
    7
  );

  // Tính can chi của ngày
  const getCanChiNgay = (d: number, m: number, y: number) => {
    const jd = amlich.jdFromDate(d, m, y);
    return getCanChiFromJD(jd);
  };

  // Lấy giờ hoàng đạo
  const getGioHoangDao = () => {
    const gioHD = [
      { gio: 'Tý (23h-1h)', status: 'good' },
      { gio: 'Sửu (1h-3h)', status: 'bad' },
      { gio: 'Dần (3h-5h)', status: 'good' },
      { gio: 'Mão (5h-7h)', status: 'good' },
      { gio: 'Thìn (7h-9h)', status: 'bad' },
      { gio: 'Tỵ (9h-11h)', status: 'good' },
      { gio: 'Ngọ (11h-13h)', status: 'bad' },
      { gio: 'Mùi (13h-15h)', status: 'good' },
      { gio: 'Thân (15h-17h)', status: 'bad' },
      { gio: 'Dậu (17h-19h)', status: 'good' },
      { gio: 'Tuất (19h-21h)', status: 'bad' },
      { gio: 'Hợi (21h-23h)', status: 'good' }
    ];
    return gioHD;
  };

  // Lấy việc nên làm và kiêng
  const getActivities = () => {
    return {
      nenLam: [
        'Cưới gả',
        'Khai trương',
        'Động thổ',
        'Nhập trạch',
        'An táng',
        'Cầu tự',
      ],
      kieng: [
        'Khởi công',
        'Tu tạo',
        'Xuất hành',
        'Dời chỗ',
      ]
    };
  };

  // Lấy các ngày trong tháng
  const getDaysInMonth = (): DayInfo[] => {
    const year = currentYear;
    const month = currentMonth;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    const days: DayInfo[] = [];
    
    // Thêm các ngày của tháng trước
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const prevMonth = month === 0 ? 12 : month;
      const prevYear = month === 0 ? year - 1 : year;
      const lunar = amlich.convertSolar2Lunar(day, prevMonth, prevYear, 7);
      const jd = amlich.jdFromDate(day, prevMonth, prevYear);
      const solarKey = `${day}/${prevMonth}`;
      const lunarKey = `${lunar[0]}/${lunar[1]}`;
      
      days.push({
        solar: day,
        lunar: lunar[0],
        lunarMonth: lunar[1],
        isToday: false,
        isCurrentMonth: false,
        canChi: getCanChiFromJD(jd),
        tietKhi: '',
        solarHoliday: HOLIDAYS_SOLAR[solarKey],
        lunarHoliday: HOLIDAYS_LUNAR[lunarKey]
      });
    }
    
    // Thêm các ngày của tháng hiện tại
    for (let day = 1; day <= daysInMonth; day++) {
      const lunar = amlich.convertSolar2Lunar(day, month + 1, year, 7);
      const jd = amlich.jdFromDate(day, month + 1, year);
      const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
      const solarKey = `${day}/${month + 1}`;
      const lunarKey = `${lunar[0]}/${lunar[1]}`;
      
      days.push({
        solar: day,
        lunar: lunar[0],
        lunarMonth: lunar[1],
        isToday,
        isCurrentMonth: true,
        canChi: getCanChiFromJD(jd),
        tietKhi: '',
        solarHoliday: HOLIDAYS_SOLAR[solarKey],
        lunarHoliday: HOLIDAYS_LUNAR[lunarKey]
      });
    }
    
    // Thêm các ngày của tháng sau
    const remainingDays = 42 - days.length; // 6 hàng x 7 ngày
    for (let day = 1; day <= remainingDays; day++) {
      const nextMonth = month === 11 ? 1 : month + 2;
      const nextYear = month === 11 ? year + 1 : year;
      const lunar = amlich.convertSolar2Lunar(day, nextMonth, nextYear, 7);
      const jd = amlich.jdFromDate(day, nextMonth, nextYear);
      const solarKey = `${day}/${nextMonth}`;
      const lunarKey = `${lunar[0]}/${lunar[1]}`;
      
      days.push({
        solar: day,
        lunar: lunar[0],
        lunarMonth: lunar[1],
        isToday: false,
        isCurrentMonth: false,
        canChi: getCanChiFromJD(jd),
        tietKhi: '',
        solarHoliday: HOLIDAYS_SOLAR[solarKey],
        lunarHoliday: HOLIDAYS_LUNAR[lunarKey]
      });
    }
    
    return days;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(parseInt(e.target.value));
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(parseInt(e.target.value));
  };

  const handleViewCalendar = () => {
    setCurrentDate(new Date(selectedYear, selectedMonth, 1));
  };

  const days = getDaysInMonth();
  const activities = getActivities();
  const gioHoangDao = getGioHoangDao();

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const dayNames = ['Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy', 'Chủ nhật'];

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await newsApi.getTopHeadlines();
        setArticles(response.slice(0, 10));
      } catch (err) {
        console.error('Error fetching news:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar trái - Tin nổi bật */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden sticky top-4">
              <div className="bg-red-600 px-4 py-3">
                <h3 className="text-white font-bold uppercase">Tin nổi bật</h3>
              </div>
              <div className="p-4 space-y-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                  </div>
                ) : (
                  articles.slice(0, 5).map((article) => (
                    <Link 
                      key={article.id} 
                      to={`/news/${article.id}`}
                      className="block group"
                    >
                      {article.thumbnail && (
                        <img 
                          src={article.thumbnail}
                          alt={article.title}
                          className="w-full h-32 object-cover rounded-lg mb-2 group-hover:opacity-90 transition-opacity"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=No+Image';
                          }}
                        />
                      )}
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-red-600 transition-colors">
                        {article.title}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(article.publishedAt)}</span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Lịch vạn niên - Giữa */}
          <div className="lg:col-span-6">
        {/* Header xanh lá */}
        <div className="bg-green-600 text-white rounded-t-lg px-6 py-3">
          <h1 className="text-xl font-bold">LỊCH VẠN NIÊN</h1>
        </div>

        {/* Box trắng chứa thông tin ngày */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          {/* Dương lịch & Âm lịch */}
          <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700">
            {/* Dương lịch */}
            <div className="p-6 text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Dương Lịch</div>
              <div className="flex items-center justify-center gap-4">
                <button 
                  onClick={handlePrevMonth}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="text-6xl font-bold text-green-600">{today.getDate()}</div>
                <button 
                  onClick={handleNextMonth}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Tháng {today.getMonth() + 1} năm {today.getFullYear()}
              </div>
              <div className="text-xs text-red-600 font-semibold mt-1">
                Ngày toàn quốc kháng chiến chống Pháp
              </div>
            </div>

            {/* Âm lịch */}
            <div className="p-6 text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Âm lịch</div>
              <div className="text-6xl font-bold text-green-600">{todayLunar[0]}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Tháng {todayLunar[1]} năm {getYearCanChi(today.getFullYear())} {todayLunar[3] === 1 ? 'nhuận' : ''}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Ngày {getCanChiNgay(today.getDate(), today.getMonth() + 1, today.getFullYear())}
              </div>
            </div>
          </div>

          {/* Thông tin mệnh ngày, giờ hoàng đạo, tuổi xung */}
          <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-800">
            <div className="text-sm space-y-2">
              <div>
                <span className="font-semibold">Mệnh ngày:</span>
                <span className="ml-2 text-gray-700 dark:text-gray-300">Đại hải thủy</span>
              </div>
              <div>
                <span className="font-semibold">Giờ hoàng đạo:</span>
                <span className="ml-2 text-gray-700 dark:text-gray-300">
                  Dần (3h-5h), Thìn (7h-9h), Thìn (15h-17h), Dậu (17h-19h), Hợi (21h-23h)
                </span>
              </div>
              <div>
                <span className="font-semibold">Tuổi xung:</span>
                <span className="ml-2 text-gray-700 dark:text-gray-300">
                  Bính thìn, Giáp thìn, Bính thân, Bính tuất
                </span>
              </div>
            </div>
          </div>

          {/* Chọn tháng năm */}
          <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-center gap-3 bg-green-50 dark:bg-gray-700">
            <select
              value={selectedMonth}
              onChange={handleMonthChange}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              {monthNames.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
            
            <select
              value={selectedYear}
              onChange={handleYearChange}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              {Array.from({ length: 50 }, (_, i) => today.getFullYear() - 25 + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <button
              onClick={handleViewCalendar}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold text-sm"
            >
              XEM
            </button>
          </div>

          {/* Lưới lịch */}
          <div className="p-4">
            {/* Tiêu đề các ngày trong tuần */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day, index) => (
                <div
                  key={index}
                  className={`text-center font-semibold py-2 text-xs ${
                    index === 6 ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>
            
            {/* Các ngày trong tháng */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                const isSunday = index % 7 === 6;
                return (
                  <div
                    key={index}
                    className={`
                      min-h-[70px] p-2 border transition-all relative
                      ${day.isToday 
                        ? 'bg-orange-100 dark:bg-orange-900 border-orange-400 ring-1 ring-orange-400' 
                        : day.isCurrentMonth
                          ? 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 opacity-60'
                      }
                    `}
                  >
                    {/* Ngày dương */}
                    <div className={`text-right font-bold text-lg mb-1 ${
                      day.isToday ? 'text-orange-600 dark:text-orange-400' : 
                      isSunday ? 'text-red-500' :
                      day.isCurrentMonth ? 'text-gray-900 dark:text-white' : 
                      'text-gray-400'
                    }`}>
                      {day.solar}
                    </div>
                    
                    {/* Ngày âm */}
                    <div className={`text-[10px] text-center leading-tight ${
                      day.isToday ? 'text-orange-600 dark:text-orange-400' :
                      day.lunar === 1 ? 'text-red-500 font-semibold' : 
                      'text-gray-500 dark:text-gray-400'
                    }`}>
                      {day.lunar === 1 ? `${day.lunar}/${day.lunarMonth}` : day.lunar === 15 ? `${day.lunar}` : day.lunar}
                    </div>

                    {/* Ngày lễ */}
                    {day.isCurrentMonth && (day.solarHoliday || day.lunarHoliday) && (
                      <div className="text-[9px] text-red-500 text-center mt-1 leading-tight font-medium">
                        {day.solarHoliday || day.lunarHoliday}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Xem thêm các thông tin khác */}
        <div className="text-center py-6">
          <button className="text-gray-700 dark:text-gray-300 font-semibold text-sm hover:text-green-600">
            XEM THÊM CÁC THÔNG TIN KHÁC
          </button>
        </div>
          </div>

          {/* Sidebar phải - Tin đọc nhiều */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden sticky top-4">
              <div className="bg-blue-600 px-4 py-3">
                <h3 className="text-white font-bold uppercase">Đọc nhiều nhất</h3>
              </div>
              <div className="p-4 space-y-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : (
                  articles.slice(5, 10).map((article, index) => (
                    <Link 
                      key={article.id} 
                      to={`/news/${article.id}`}
                      className="block group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative flex-shrink-0">
                          {article.thumbnail && (
                            <img 
                              src={article.thumbnail}
                              alt={article.title}
                              className="w-20 h-20 object-cover rounded-lg group-hover:opacity-90 transition-opacity"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x80?text=No+Image';
                              }}
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {article.title}
                          </h4>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(article.publishedAt)}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LunarCalendarPage;
