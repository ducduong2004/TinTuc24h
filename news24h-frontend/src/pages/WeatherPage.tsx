import React, { useEffect, useState } from 'react';
import { Cloud, Wind, Droplets, Eye, Gauge, ChevronDown } from 'lucide-react';
import Loading from '../components/Loading';
import { Link } from 'react-router-dom';
import { weatherApi, newsApi } from '../services/api';
import type { WeatherData as ApiWeatherData } from '../services/api';
import type { NewsArticle } from '../types';
import NewsCard from '../components/NewsCard';


interface WeatherData {
  city: string;
  currentTemp: number;
  description: string;
  todayMin: number;
  todayMax: number;
  tomorrowMin: number;
  tomorrowMax: number;
  dayAfterMin: number;
  dayAfterMax: number;
  todayDescription: string;
  tomorrowDescription: string;
  dayAfterDescription: string;
  airQuality?: number;
  airQualityStatus?: string;
}

interface CityWeather {
  city: string;
  citySlug: string;
  currentTemp: number | string;
  description: string;
  todayMin: number;
  todayMax: number;
  todayDesc: string;
  tomorrowMin: number;
  tomorrowMax: number;
  tomorrowDesc: string;
  dayAfterMin: number;
  dayAfterMax: number;
  dayAfterDesc: string;
  airQuality?: number;
  airQualityStatus?: string;
}

const WeatherPage: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [selectedCity, setSelectedCity] = useState('ha-noi');
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [allCitiesWeather, setAllCitiesWeather] = useState<CityWeather[]>([]);
  const [weatherNews, setWeatherNews] = useState<NewsArticle[]>([]);

  const cityMap: Record<string, string> = {
    'ha-noi': 'Hà Nội',
    'tp-hcm': 'TP.HCM',
    'da-nang': 'Đà Nẵng',
    'nha-trang': 'Nha Trang',
    'hai-phong': 'Hải Phòng',
    'can-tho': 'Cần Thơ',
  };

  const cities = Object.entries(cityMap).map(([slug, name]) => ({ slug, name }));

  // Load tất cả thời tiết khi component mount
  useEffect(() => {
    const loadAllWeather = async () => {
      try {
        const data = await weatherApi.getAllWeather();
        
        // Transform data
        const transformed: CityWeather[] = data.map((item: ApiWeatherData) => ({
          city: item.city || '',
          citySlug: item.citySlug || '',
          currentTemp: item.currentTemp || 'Đang cập nhật',
          description: item.description || '',
          todayMin: item.todayMin || 0,
          todayMax: item.todayMax || 0,
          todayDesc: item.todayDescription || '',
          tomorrowMin: item.tomorrowMin || 0,
          tomorrowMax: item.tomorrowMax || 0,
          tomorrowDesc: item.tomorrowDescription || '',
          dayAfterMin: item.dayAfterMin || 0,
          dayAfterMax: item.dayAfterMax || 0,
          dayAfterDesc: item.dayAfterDescription || '',
          airQuality: item.airQuality,
          airQualityStatus: item.airQualityStatus,
        }));
        
        setAllCitiesWeather(transformed);
        
        // AQI section removed; skip building air quality tiles
        
      } catch (error) {
        console.error('Error loading all weather:', error);
      }
    };

    loadAllWeather();
  }, []);

  useEffect(() => {
    // Cập nhật thời gian hiện tại mỗi phút
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadWeather = async () => {
      setLoading(true);
      try {
        const data: ApiWeatherData = await weatherApi.getWeatherByCity(selectedCity);
        
        setWeather({
          city: data.city,
          currentTemp: data.currentTemp,
          description: data.description,
          todayMin: data.todayMin,
          todayMax: data.todayMax,
          tomorrowMin: data.tomorrowMin,
          tomorrowMax: data.tomorrowMax,
          dayAfterMin: data.dayAfterMin,
          dayAfterMax: data.dayAfterMax,
          todayDescription: data.todayDescription,
          tomorrowDescription: data.tomorrowDescription,
          dayAfterDescription: data.dayAfterDescription,
          airQuality: data.airQuality,
          airQualityStatus: data.airQualityStatus,
        });
      } catch (error) {
        console.error('Error loading weather:', error);
      }
      setLoading(false);
    };

    loadWeather();
    window.scrollTo(0, 0);
  }, [selectedCity]);

  useEffect(() => {
    const loadWeatherNews = async () => {
      try {
        const response = await newsApi.getByCategory('du-bao-thoi-tiet', 0, 6);
        setWeatherNews(response.content || []);
      } catch (error) {
        console.error('Error loading weather news:', error);
      }
    };

    loadWeatherNews();
  }, []);

  const formatTime = () => {
    return currentTime.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getTodayDate = () => {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const today = new Date();
    return `Hôm nay (${today.getDate()}/${today.getMonth() + 1} ${days[today.getDay()]})`;
  };

  const getTomorrowDate = () => {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return `Ngày mai (${tomorrow.getDate()}/${tomorrow.getMonth() + 1} ${days[tomorrow.getDay()]})`;
  };

  const getDayAfterDate = () => {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    return `Ngày kia (${dayAfter.getDate()}/${dayAfter.getMonth() + 1} ${days[dayAfter.getDay()]})`;
  };

  const getAirQualityColor = (value: number) => {
    if (value <= 50) return 'text-green-600 bg-green-100';
    if (value <= 100) return 'text-yellow-600 bg-yellow-100';
    if (value <= 150) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b-4 border-green-500 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">DỰ BÁO THỜI TIẾT</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">

        {/* Main Weather Widget */}
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-lg p-4 mb-6 text-white">
          <div className="mb-3">
            <h2 className="text-lg font-bold mb-2">Thời tiết trong ngày</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="appearance-none bg-white/20 backdrop-blur-sm text-white font-bold text-sm px-3 py-1.5 pr-8 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  {cities.map((city) => (
                    <option key={city.slug} value={city.slug} className="text-gray-900">
                      {city.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-white pointer-events-none" size={16} />
              </div>
              <span className="text-xs opacity-90">{formatTime()} - {formatDate()}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Current Weather */}
            <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <Cloud size={40} className="mb-1" />
              <div className="text-3xl font-bold mb-1">{weather?.currentTemp}°C</div>
              <div className="text-sm opacity-90">{weather?.description}</div>
            </div>

            {/* Today */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <h3 className="font-bold text-xs mb-2 text-center">{getTodayDate()}</h3>
              <div className="text-center mb-1">
                <span className="text-lg font-bold">{weather?.todayMin}°C - {weather?.todayMax}°C</span>
              </div>
              <p className="text-xs text-center opacity-90 line-clamp-2">{weather?.todayDescription}</p>
            </div>

            {/* Tomorrow */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <h3 className="font-bold text-xs mb-2 text-center">{getTomorrowDate()}</h3>
              <div className="text-center mb-1">
                <span className="text-lg font-bold">{weather?.tomorrowMin}°C - {weather?.tomorrowMax}°C</span>
              </div>
              <p className="text-xs text-center opacity-90 line-clamp-2">{weather?.tomorrowDescription}</p>
            </div>

            {/* Day After Tomorrow */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <h3 className="font-bold text-xs mb-2 text-center">{getDayAfterDate()}</h3>
              <div className="text-center mb-1">
                <span className="text-lg font-bold">{weather?.dayAfterMin}°C - {weather?.dayAfterMax}°C</span>
              </div>
              <p className="text-xs text-center opacity-90 line-clamp-2">{weather?.dayAfterDescription}</p>
            </div>
          </div>
        </div>

        {/* Weather Table for All Cities */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="bg-gray-100 px-4 py-3 border-b">
            <h2 className="text-lg font-bold text-gray-900">Thời tiết các tỉnh thành</h2>
          </div>
          <div className="overflow-auto max-h-96">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">Khu vực</th>
                  <th className="px-4 py-2 text-center text-xs font-bold text-gray-700 uppercase">Hiện tại</th>
                  <th className="px-4 py-2 text-center text-xs font-bold text-gray-700 uppercase">Hôm nay</th>
                  <th className="px-4 py-2 text-center text-xs font-bold text-gray-700 uppercase">Ngày mai</th>
                  <th className="px-4 py-2 text-center text-xs font-bold text-gray-700 uppercase">Ngày kia</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allCitiesWeather.map((city: CityWeather, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className="font-medium text-gray-900">{city.city}</span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="text-base font-bold text-blue-600">
                        {typeof city.currentTemp === 'number' ? `${city.currentTemp}°C` : city.currentTemp}
                      </div>
                      {city.description && (
                        <div className="text-xs text-gray-600">{city.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="font-semibold text-sm">{city.todayMin}°C - {city.todayMax}°C</div>
                      <div className="text-xs text-gray-600">{city.todayDesc}</div>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="font-semibold text-sm">{city.tomorrowMin}°C - {city.tomorrowMax}°C</div>
                      <div className="text-xs text-gray-600">{city.tomorrowDesc}</div>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="font-semibold text-sm">{city.dayAfterMin}°C - {city.dayAfterMax}°C</div>
                      <div className="text-xs text-gray-600">{city.dayAfterDesc}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-gray-50 border-t">
            <p className="text-xs text-gray-600">
              Cập nhật: {formatTime()} - {formatDate()}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Nguồn: Trung tâm dự báo khí tượng thủy văn trung ương
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Thông tin chỉ mang tính tham khảo, chúng tôi không chịu bất kỳ trách nhiệm gì về việc sử dụng thông tin của các bạn.
            </p>
          </div>
        </div>

        {/* Weather News Section */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-red-600 inline-block">
            DỰ BÁO THỜI TIẾT
          </h2>
          {weatherNews.length > 0 ? (
            <div className="space-y-3 mt-4">
              {weatherNews.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              Đang tải tin tức...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherPage;
