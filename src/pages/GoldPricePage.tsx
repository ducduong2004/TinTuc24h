// src/pages/GoldPricePage.tsx
import React, { useState, useEffect } from 'react';
import { TrendingUp, RefreshCw, Newspaper,} from 'lucide-react';
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

      const grouped = groupPricesByType(data);
      setGroupedPrices(grouped);

      if (grouped.length > 0 && !selectedGoldType) {
        setSelectedGoldType(`${grouped[0].goldType}-${grouped[0].company}`);
      }

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

  const prepareChartData = (prices: GoldPrice[]) => {
    if (!selectedGoldType || prices.length === 0) return;

    const [goldType, company] = selectedGoldType.split('-');

    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    const filteredPrices = prices
      .filter(p =>
        p.goldType === goldType &&
        p.company === company &&
        new Date(p.updatedAt) >= thirtyDaysAgo
      )
      .sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());

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
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

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

      if (priceDate === today) {
        existing.today = price;
      } else if (priceDate === yesterday && !existing.yesterday) {
        existing.yesterday = price;
      }
    });

    return Array.from(grouped.values());
  };

  const calculateDifference = (current: number, previous?: number) => {
    if (!previous) return null;
    return current - previous;
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
        setGoldNews(data.content || []);
      }
    } catch (err) {
      console.error('Error fetching gold news:', err);
    }
  };

  useEffect(() => {
    fetchGoldPrices();
    fetchGoldNews();
  }, []);

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
              Giá Vàng Hôm Nay
            </h1>
            {lastUpdate && (
              <p className="text-yellow-100 mt-2">
                Cập nhật lúc: {lastUpdate}
              </p>
            )}
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

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Main Layout: Price Table Left + Chart Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Left: Bảng giá vàng */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-yellow-500 to-yellow-600">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-bold text-white" rowSpan={2}>

                  </th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-white border-b border-yellow-400" colSpan={2}>
                    Hôm nay ({new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })})
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-white border-b border-yellow-400" colSpan={2}>
                    Hôm qua ({new Date(Date.now() - 86400000).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })})
                  </th>
                </tr>
                <tr>
                  <th className="px-4 py-2 text-center text-xs font-bold text-white border-r border-yellow-400">Giá mua</th>
                  <th className="px-4 py-2 text-center text-xs font-bold text-white">Giá bán</th>
                  <th className="px-4 py-2 text-center text-xs font-bold text-white border-r border-yellow-400">Giá mua</th>
                  <th className="px-4 py-2 text-center text-xs font-bold text-white">Giá bán</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {groupedPrices.map((item, index) => {
                  const buyDiff = calculateDifference(item.today.buyPrice, item.yesterday?.buyPrice);
                  const sellDiff = calculateDifference(item.today.sellPrice, item.yesterday?.sellPrice);
                  const goldKey = `${item.goldType}-${item.company}`;

                  return (
                    <tr
                      key={index}
                      className={`hover:bg-yellow-50 transition-colors cursor-pointer ${
                        selectedGoldType === goldKey ? 'bg-yellow-100' : ''
                      }`}
                      onClick={() => setSelectedGoldType(goldKey)}
                    >
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        <div className="font-bold text-gray-800">{item.goldType}</div>
                        <div className="text-xs text-gray-500 mt-1">{item.company}</div>
                      </td>
                      {/* Today Buy */}
                      <td className="px-4 py-3 text-center border-r border-gray-200">
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(item.today.buyPrice)}
                        </div>
                        {buyDiff !== null && (
                          <div className={`text-xs mt-1 flex items-center justify-center gap-1 ${
                            buyDiff > 0 ? 'text-green-600' : buyDiff < 0 ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            {buyDiff > 0 ? '▲' : buyDiff < 0 ? '▼' : ''}
                            {Math.abs(buyDiff).toLocaleString('vi-VN')}
                          </div>
                        )}
                      </td>
                      {/* Today Sell */}
                      <td className="px-4 py-3 text-center">
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(item.today.sellPrice)}
                        </div>
                        {sellDiff !== null && (
                          <div className={`text-xs mt-1 flex items-center justify-center gap-1 ${
                            sellDiff > 0 ? 'text-green-600' : sellDiff < 0 ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            {sellDiff > 0 ? '▲' : sellDiff < 0 ? '▼' : ''}
                            {Math.abs(sellDiff).toLocaleString('vi-VN')}
                          </div>
                        )}
                      </td>
                      {/* Yesterday Buy */}
                      <td className="px-4 py-3 text-center border-r border-gray-200 bg-gray-50">
                        {item.yesterday ? (
                          <div className="text-sm text-gray-700">
                            {formatPrice(item.yesterday.buyPrice)}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      {/* Yesterday Sell */}
                      <td className="px-4 py-3 text-center bg-gray-50">
                        {item.yesterday ? (
                          <div className="text-sm text-gray-700">
                            {formatPrice(item.yesterday.sellPrice)}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="bg-blue-50 border-t border-blue-200 p-3">
            <p className="text-xs text-blue-800">
              Đơn vị: nghìn đồng/lượng | ▼ Tăng/giảm so sánh với ngày trước đó
            </p>
          </div>
        </div>

        {/* Right: Biểu đồ */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Biểu đồ giá vàng 30 ngày gần nhất
            </h2>
            {selectedGoldType && (
              <div className="text-lg font-bold text-yellow-600">
                {selectedGoldType.split('-')[0]}
              </div>
            )}
          </div>

          {/* Gold Type Selector + Date */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tìm mã vàng nhanh</label>
              <button
                onClick={() => setShowGoldDropdown(!showGoldDropdown)}
                className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg bg-white hover:border-yellow-500 focus:outline-none focus:border-yellow-500 font-medium text-gray-800"
              >
                {selectedGoldType ? selectedGoldType.split('-')[0] : 'Chọn loại vàng'}
                <span className="float-right">▼</span>
              </button>

              {showGoldDropdown && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
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
                            <div className="font-medium text-gray-800">{item.goldType}</div>
                            <div className="text-xs text-gray-500">{item.company}</div>
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-500"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Chart */}
          {chartData.length > 0 && selectedGoldType ? (
            <ResponsiveContainer width="100%" height={400}>
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
                  tickFormatter={(value: number) => `${(value / 1000).toFixed(1)}M`}
                  domain={[
                    (dataMin: number) => Math.floor(dataMin - 200),
                    (dataMax: number) => Math.ceil(dataMax + 200)
                  ]}
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
            <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-center">
                <span className="block text-4xl mb-2">📊</span>
                Chọn loại vàng để xem biểu đồ
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom: News Section */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Newspaper className="w-6 h-6" />
            Tin tức về Vàng
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
          {goldNews.length > 0 ? (
            goldNews.map((news) => (
              <Link
                key={news.id}
                to={`/news/${news.id}`}
                className="flex gap-3 p-4 hover:bg-yellow-50 rounded-lg transition-colors border border-gray-200"
              >
                {news.thumbnail && (
                  <img
                    src={`${news.thumbnail}?cache=${news.id}`}
                    alt={news.title}
                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/96x96?text=No+Image';
                    }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 hover:text-yellow-600">
                    {news.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-2">
                    {formatDate(news.publishedAt)}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-3 p-8 text-center">
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
            Xem tất cả tin tức về vàng →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GoldPricePage;
