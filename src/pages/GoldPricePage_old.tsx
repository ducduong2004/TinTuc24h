// src/pages/GoldPricePage.tsx
import React, { useState, useEffect } from 'react';
import { TrendingUp, RefreshCw, Newspaper, Calendar, TrendingDown as TrendingDownIcon, TrendingUp as TrendingUpIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface GoldPrice {
  id: string;
  goldType: string;
  company: string;
  buyPrice: number;
  sellPrice: number;
  crawledAt: string;
  updatedAt: string;
}

interface GroupedGoldPrice {
  goldType: string;
  company: string;
  today: GoldPrice;
  yesterday?: GoldPrice;
}

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  category: string;
}

const GoldPricePage: React.FC = () => {
  const [goldPrices, setGoldPrices] = useState<GoldPrice[]>([]);
  const [groupedPrices, setGroupedPrices] = useState<GroupedGoldPrice[]>([]);
  const [goldNews, setGoldNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedGoldType, setSelectedGoldType] = useState<string>('');
  const [showHistoricalDates, setShowHistoricalDates] = useState(false);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showGoldDropdown, setShowGoldDropdown] = useState(false);

  const fetchGoldPrices = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://api.animalsfeeds.online/api/gold-prices');
      if (!response.ok) throw new Error('Không thể tải dữ liệu giá vàng');
      const data = await response.json();
      console.log('Gold prices data:', data); // Debug
      setGoldPrices(data);
      
      // Extract available dates
      const dates = Array.from(new Set(
        data.map((p: GoldPrice) => new Date(p.updatedAt).toISOString().split('T')[0])
      )) as string[];
      dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      setAvailableDates(dates);
      
      // Filter by selected date
      const filteredData = filterPricesByDate(data, selectedDate);
      
      // Group và lấy giá mới nhất cho mỗi loại vàng
      const grouped = groupPricesByType(filteredData);
      setGroupedPrices(grouped);
      
      // Set default selected gold type for chart
      if (grouped.length > 0 && !selectedGoldType) {
        setSelectedGoldType(`${grouped[0].goldType}-${grouped[0].company}`);
      }
      
      // Prepare chart data
      prepareChartData(data);
      
      if (data.length > 0) {
        setLastUpdate(new Date(data[0].crawledAt || data[0].updatedAt).toLocaleString('vi-VN'));
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching gold prices:', err);
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  const filterPricesByDate = (prices: GoldPrice[], date: string): GoldPrice[] => {
    const targetDate = new Date(date).toISOString().split('T')[0];
    const nextDate = new Date(new Date(date).getTime() + 86400000).toISOString().split('T')[0];
    
    return prices.filter(price => {
      const priceDate = new Date(price.updatedAt).toISOString().split('T')[0];
      return priceDate === targetDate || priceDate === nextDate;
    });
  };

  const prepareChartData = (prices: GoldPrice[]) => {
    if (!selectedGoldType || prices.length === 0) return;
    
    const [goldType, company] = selectedGoldType.split('-');
    
    // Filter prices for selected gold type and get last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    const filteredPrices = prices
      .filter(p => 
        p.goldType === goldType && 
        p.company === company &&
        new Date(p.updatedAt) >= thirtyDaysAgo
      )
      .sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
    
    // Group by date and get average prices
    const grouped = new Map<string, { buy: number[], sell: number[] }>();
    
    filteredPrices.forEach(price => {
      const date = new Date(price.updatedAt).toLocaleDateString('vi-VN');
      if (!grouped.has(date)) {
        grouped.set(date, { buy: [], sell: [] });
      }
      grouped.get(date)!.buy.push(price.buyPrice);
      grouped.get(date)!.sell.push(price.sellPrice);
    });
    
    const chartData = Array.from(grouped.entries()).map(([date, prices]) => ({
      date,
      'Mua vào': Math.round(prices.buy.reduce((a, b) => a + b, 0) / prices.buy.length),
      'Bán ra': Math.round(prices.sell.reduce((a, b) => a + b, 0) / prices.sell.length),
    }));
    
    setChartData(chartData);
  };

  const groupPricesByType = (prices: GoldPrice[]): GroupedGoldPrice[] => {
    // Use selected date instead of hardcoded today
    const targetDate = new Date(selectedDate).toISOString().split('T')[0];
    const previousDate = new Date(new Date(selectedDate).getTime() - 86400000).toISOString().split('T')[0];
    
    // Group theo goldType + company
    const grouped = new Map<string, GroupedGoldPrice>();
    
    prices.forEach(price => {
      const key = `${price.goldType}-${price.company}`;
      const priceDate = new Date(price.updatedAt).toISOString().split('T')[0];
      
      if (!grouped.has(key)) {
        grouped.set(key, {
          goldType: price.goldType,
          company: price.company,
          today: price,
        });
      }
      
      const existing = grouped.get(key)!;
      
      // Cập nhật giá ngày được chọn (mới nhất)
      if (priceDate === targetDate || new Date(price.updatedAt) > new Date(existing.today.updatedAt)) {
        if (priceDate === previousDate && !existing.yesterday) {
          existing.yesterday = price;
        } else if (priceDate >= targetDate) {
          if (existing.today && new Date(existing.today.updatedAt).toISOString().split('T')[0] === targetDate) {
            existing.yesterday = existing.today;
          }
          existing.today = price;
        }
      } else if (priceDate === previousDate && !existing.yesterday) {
        existing.yesterday = price;
      }
    });
    
    return Array.from(grouped.values());
  };

  const calculateDifference = (current: number, previous?: number) => {
    if (!previous) return null;
    return current - previous;
  };

  const formatDifference = (diff: number | null) => {
    if (diff === null) return '-';
    const symbol = diff > 0 ? '+' : '';
    return `${symbol}${diff.toLocaleString('vi-VN')}`;
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://api.animalsfeeds.online/api/gold-prices/refresh', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Không thể cập nhật giá vàng');
      await fetchGoldPrices();
      if (goldPrices.length > 0) {
        setLastUpdate(new Date().toLocaleString('vi-VN'));
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  const fetchGoldNews = async () => {
    try {
      const response = await fetch('https://api.animalsfeeds.online/api/news/category/gia-vang?page=0&size=6');
      if (response.ok) {
        const data = await response.json();
        console.log('Gold news data:', data); // Debug
        setGoldNews(data.content || []);
      }
    } catch (err) {
      console.error('Error fetching gold news:', err);
    }
  };

  useEffect(() => {
    fetchGoldPrices();
    fetchGoldNews();
  }, [selectedDate]);

  useEffect(() => {
    if (goldPrices.length > 0) {
      prepareChartData(goldPrices);
    }
  }, [selectedGoldType]);

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading && goldPrices.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-8 h-8" />
              {selectedDate === new Date().toISOString().split('T')[0] 
                ? 'Giá Vàng Hôm Nay'
                : `Giá Vàng Ngày ${new Date(selectedDate).toLocaleDateString('vi-VN')}`
              }
            </h1>
            {lastUpdate && (
              <p className="text-yellow-100 mt-2">
                Cập nhật lúc: {lastUpdate}
              </p>
            )}
          
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
              <Calendar className="w-5 h-5 text-white" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-white font-medium outline-none"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="bg-white text-yellow-600 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-50 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              Cập nhật
            </button>
          </div>
        </div>
      </div>

      {/* Quick date selection */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-yellow-600" />
            Xem giá vàng theo ngày
          </h3>
          <button
            onClick={() => setShowHistoricalDates(!showHistoricalDates)}
            className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
          >
            {showHistoricalDates ? 'Ẩn bớt ▲' : 'Xem thêm ▼'}
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* Today button */}
          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedDate === new Date().toISOString().split('T')[0]
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-yellow-100'
            }`}
          >
            Hôm nay
          </button>
          
          {/* Yesterday button */}
          <button
            onClick={() => {
              const yesterday = new Date(Date.now() - 86400000);
              setSelectedDate(yesterday.toISOString().split('T')[0]);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedDate === new Date(Date.now() - 86400000).toISOString().split('T')[0]
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-yellow-100'
            }`}
          >
            Hôm qua
          </button>
          
          {/* Last 7 days buttons */}
          {[2, 3, 4, 5, 6, 7].map(days => {
            const date = new Date(Date.now() - days * 86400000);
            const dateStr = date.toISOString().split('T')[0];
            return (
              <button
                key={days}
                onClick={() => setSelectedDate(dateStr)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedDate === dateStr
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-yellow-100'
                }`}
              >
                {date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
              </button>
            );
          })}
        </div>
        
        {/* Extended historical dates */}
        {showHistoricalDates && availableDates.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">Các ngày có dữ liệu:</p>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2 max-h-60 overflow-y-auto">
              {availableDates.map(date => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    selectedDate === date
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-yellow-100'
                  }`}
                >
                  {new Date(date).toLocaleDateString('vi-VN', { 
                    day: '2-digit', 
                    month: '2-digit',
                    year: '2-digit'
                  })}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Bảng giá vàng */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-yellow-500 to-yellow-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      Loại vàng
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-white uppercase tracking-wider">
                      Mua vào
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-white uppercase tracking-wider">
                      Bán ra
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-white uppercase tracking-wider">
                      Chênh lệch
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">
                      {
                        selectedDate === new Date().toISOString().split('T')[0]
                          ? 'So sánh hôm qua'
                          : `Giá ngày trước`
                      }
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {groupedPrices.map((item, index) => {
                    const buyDiff = calculateDifference(item.today.buyPrice, item.yesterday?.buyPrice);
                    const sellDiff = calculateDifference(item.today.sellPrice, item.yesterday?.sellPrice);
                    const priceDiff = item.today.sellPrice - item.today.buyPrice;
                    const goldKey = `${item.goldType}-${item.company}`;
                    
                    return (
                      <tr 
                        key={index} 
                        className={`hover:bg-yellow-50 transition-colors cursor-pointer ${
                          selectedGoldType === goldKey ? 'bg-yellow-100' : ''
                        }`}
                        onClick={() => setSelectedGoldType(goldKey)}
                      >
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          <div className="font-bold text-gray-800">{item.goldType}</div>
                          <div className="text-xs text-gray-500 mt-1">{item.company}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-sm font-medium text-green-600">
                            {formatPrice(item.today.buyPrice)}
                          </div>
                          {buyDiff !== null && (
                            <div className={`text-xs mt-1 flex items-center justify-end gap-1 ${
                              buyDiff > 0 ? 'text-red-500' : buyDiff < 0 ? 'text-green-500' : 'text-gray-500'
                            }`}>
                              {buyDiff > 0 ? <TrendingUpIcon size={12} /> : buyDiff < 0 ? <TrendingDownIcon size={12} /> : null}
                              {formatDifference(buyDiff)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-sm font-medium text-red-600">
                            {formatPrice(item.today.sellPrice)}
                          </div>
                          {sellDiff !== null && (
                            <div className={`text-xs mt-1 flex items-center justify-end gap-1 ${
                              sellDiff > 0 ? 'text-red-500' : sellDiff < 0 ? 'text-green-500' : 'text-gray-500'
                            }`}>
                              {sellDiff > 0 ? <TrendingUpIcon size={12} /> : sellDiff < 0 ? <TrendingDownIcon size={12} /> : null}
                              {formatDifference(sellDiff)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-sm font-bold text-blue-600">
                            {formatPrice(priceDiff)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {((priceDiff / item.today.buyPrice) * 100).toFixed(2)}%
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {item.yesterday ? (
                            <div className="text-xs text-gray-700">
                              <div className="font-medium">Mua: {formatPrice(item.yesterday.buyPrice)}</div>
                              <div className="font-medium mt-1">Bán: {formatPrice(item.yesterday.sellPrice)}</div>
                              <div className="text-xs text-gray-400 mt-1">
                                {new Date(item.yesterday.updatedAt).toLocaleDateString('vi-VN', { 
                                  day: '2-digit', 
                                  month: '2-digit' 
                                })}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Không có dữ liệu</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="bg-blue-50 border-t border-blue-200 p-4">
              <p className="text-xs text-blue-800">
                📊 Đơn vị: Nghìn đồng | 🔄 Cập nhật mỗi 30 phút
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar: Tin tức về vàng */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden sticky top-4">
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Newspaper className="w-6 h-6" />
                Tin tức về Vàng
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {goldNews.length > 0 ? (
                goldNews.map((news) => (
                  <Link 
                    key={news.id} 
                    to={`/news/${news.id}`}
                    className="block p-4 hover:bg-yellow-50 transition-colors"
                  >
                    <div className="flex gap-3">
                      {news.thumbnail && (
                        <img 
                          src={news.thumbnail} 
                          alt={news.title}
                          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x80?text=No+Image';
                          }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 hover:text-yellow-600">
                          {news.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(news.publishedAt)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-500 text-sm">Chưa có tin tức về vàng</p>
                  <Link 
                    to="/category/gia-vang"
                    className="text-yellow-600 hover:text-yellow-700 font-semibold text-sm mt-2 inline-block"
                  >
                    Xem danh mục Giá vàng →
                  </Link>
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 px-6 py-3 border-t">
              <Link 
                to="/category/gia-vang"
                className="text-yellow-600 hover:text-yellow-700 font-semibold text-sm flex items-center justify-center gap-1"
              >
                Xem các tin liên quan →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Biểu đồ giá vàng */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-start gap-6">
          {/* Left: Gold type selector */}
          <div className="w-80 flex-shrink-0">
            <div className="relative mb-4">
              <button
                onClick={() => setShowGoldDropdown(!showGoldDropdown)}
                className="w-full px-4 py-3 text-left border border-gray-300 rounded-lg bg-white hover:border-yellow-500 focus:outline-none focus:border-yellow-500 font-medium text-gray-800"
              >
                {selectedGoldType ? selectedGoldType.split('-')[0] : 'Chọn loại vàng'}
                <span className="float-right">▼</span>
              </button>
              
              {showGoldDropdown && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                  <input
                    type="text"
                    placeholder="Tìm mã vàng nhanh"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 border-b border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                  <div className="overflow-y-auto max-h-80">
                    {groupedPrices
                      .filter(item => 
                        searchTerm === '' || 
                        item.goldType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.company.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((item, index) => {
                        const goldKey = `${item.goldType}-${item.company}`;
                        return (
                          <button
                            key={index}
                            onClick={() => {
                              setSelectedGoldType(goldKey);
                              setShowGoldDropdown(false);
                              setSearchTerm('');
                            }}
                            className={`w-full px-4 py-3 text-left hover:bg-yellow-50 transition-colors border-b border-gray-100 ${
                              selectedGoldType === goldKey ? 'bg-yellow-100 font-semibold' : ''
                            }`}
                          >
                            <div className="font-medium text-gray-900">{item.goldType}</div>
                            <div className="text-xs text-gray-500">{item.company}</div>
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
            
            {/* Comparison table */}
            {selectedGoldType && groupedPrices.find(p => `${p.goldType}-${p.company}` === selectedGoldType) && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200">
                  <div className="px-3 py-2"></div>
                  <div className="px-3 py-2 text-center text-xs font-semibold text-gray-600">
                    Hôm nay ({new Date(selectedDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })})
                  </div>
                  <div className="px-3 py-2 text-center text-xs font-semibold text-gray-600">
                    Hôm qua ({new Date(new Date(selectedDate).getTime() - 86400000).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })})
                  </div>
                </div>
                {(() => {
                  const item = groupedPrices.find(p => `${p.goldType}-${p.company}` === selectedGoldType)!;
                  const buyDiff = calculateDifference(item.today.buyPrice, item.yesterday?.buyPrice);
                  const sellDiff = calculateDifference(item.today.sellPrice, item.yesterday?.sellPrice);
                  
                  return (
                    <>
                      <div className="grid grid-cols-3 border-b border-gray-200">
                        <div className="px-3 py-3 text-sm font-medium text-gray-700">Giá mua</div>
                        <div className="px-3 py-3 text-center">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatPrice(item.today.buyPrice)}
                          </div>
                          {buyDiff !== null && buyDiff !== 0 && (
                            <div className={`text-xs mt-1 flex items-center justify-center gap-1 ${
                              buyDiff > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {buyDiff > 0 ? '▲' : '▼'} {Math.abs(buyDiff).toLocaleString('vi-VN')}
                            </div>
                          )}
                        </div>
                        <div className="px-3 py-3 text-center text-sm text-gray-700">
                          {item.yesterday ? formatPrice(item.yesterday.buyPrice) : '-'}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 border-b border-gray-200">
                        <div className="px-3 py-3 text-sm font-medium text-gray-700">Giá bán</div>
                        <div className="px-3 py-3 text-center">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatPrice(item.today.sellPrice)}
                          </div>
                          {sellDiff !== null && sellDiff !== 0 && (
                            <div className={`text-xs mt-1 flex items-center justify-center gap-1 ${
                              sellDiff > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {sellDiff > 0 ? '▲' : '▼'} {Math.abs(sellDiff).toLocaleString('vi-VN')}
                            </div>
                          )}
                        </div>
                        <div className="px-3 py-3 text-center text-sm text-gray-700">
                          {item.yesterday ? formatPrice(item.yesterday.sellPrice) : '-'}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
          
          {/* Right: Chart */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Biểu đồ giá vàng 30 ngày gần nhất
              </h2>
              {selectedGoldType && (
                <div className="text-lg font-bold text-gray-800">
                  {selectedGoldType.split('-')[0]}
                </div>
              )}
            </div>
            {chartData.length > 0 && selectedGoldType ? (
              <ResponsiveContainer width="100%" height={450}>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickFormatter={(value: string) => {
                      const parts = value.split('/');
                      return `${parts[0]}/${parts[1]}`;
                    }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickFormatter={(value: number) => `${(value / 1000).toFixed(0)}k`}
                    domain={['dataMin - 1000', 'dataMax + 1000']}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '12px'
                    }}
                    labelFormatter={(label: string) => `Ngày: ${label}`}
                    formatter={(value, name) => {
                      const v = value as number;
                      const n = name as string;
                      return [formatPrice(v), n];
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ 
                      paddingTop: '30px',
                      paddingBottom: '10px'
                    }}
                    iconType="circle"
                    iconSize={10}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Mua vào" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, fill: '#ef4444' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Bán ra" 
                    stroke="#22c55e" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#22c55e', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, fill: '#22c55e' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[450px] flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-center">
                  <span className="block text-4xl mb-2">📊</span>
                  Chọn loại vàng để xem biểu đồ
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoldPricePage;
