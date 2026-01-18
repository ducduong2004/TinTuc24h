import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { newsApi } from '../services/api';
import type { NewsArticle } from '../types';
import NewsCard from '../components/NewsCard';
import Loading from '../components/Loading';
import { getCategoryName } from '../constants';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [weatherNews, setWeatherNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchCategoryNews = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await newsApi.getByCategory(slug, currentPage, 10);
        setArticles(response.content);
        setTotalPages(response.totalPages);

        // Fetch weather news
        try {
          const weatherResponse = await newsApi.getByCategory('du-bao-thoi-tiet', 0, 6);
          setWeatherNews(weatherResponse.content);
        } catch (err) {
          console.log('Could not fetch weather news');
        }
      } catch (err) {
        setError('Không thể tải tin tức. Vui lòng thử lại sau.');
        console.error('Error fetching category news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryNews();
    window.scrollTo(0, 0);
  }, [slug, currentPage]);

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Category Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-[#78b43d] rounded-full"></div>
            <h1 className="text-4xl font-bold text-gray-900">
              {slug ? getCategoryName(slug) : 'Danh mục'}
            </h1>
          </div>
          <p className="text-gray-600 ml-4">Cập nhật tin tức mới nhất từ danh mục này</p>
        </div>

        {/* Articles Grid */}
        {articles.length > 0 ? (
          <>
            {/* Featured + Side Articles */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
              {/* Featured Article - Left Side (spans 1 column) */}
              {articles.length > 0 && (
                <div className="lg:col-span-1">
                  <NewsCard article={articles[0]} featured={true} />
                </div>
              )}
              
              {/* Side Articles - Right Side (spans 2 columns) */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {articles.slice(1, 5).map((article) => (
                    <NewsCard key={article.id} article={article} />
                  ))}
                </div>
              </div>
            </div>

            {/* Main Grid */}
            <div className="mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.slice(5).map((article, index) => (
                  <div key={article.id} className="relative group">
                    <div className="news-item-trigger hidden" onClick={() => {
                      const link = document.getElementById(`news-link-${article.id}`);
                      link?.click();
                    }}></div>
                  
                    <NewsCard article={article} customId={`news-link-${article.id}`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 py-8 border-t border-gray-200">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-[#78b43d] hover:text-white hover:border-[#78b43d] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  <ChevronLeft size={20} />
                  Trước
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i;
                    } else if (currentPage < 3) {
                      pageNum = i;
                    } else if (currentPage > totalPages - 3) {
                      pageNum = totalPages - 5 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-br from-[#78b43d] to-green-700 text-white shadow-lg scale-105'
                            : 'bg-white border border-gray-300 hover:border-[#78b43d] hover:text-[#78b43d]'
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-[#78b43d] hover:text-white hover:border-[#78b43d] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  Sau
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="inline-block">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📰</span>
              </div>
              <p className="text-gray-600 text-lg font-medium">Không có tin tức nào</p>
              <p className="text-gray-500 text-sm">Danh mục này chưa có tin tức, vui lòng quay lại sau</p>
            </div>
          </div>
        )}

        {/* Weather News Section - Hiển thị trừ trang nóng trên mạng */}
        {slug !== 'nong-tren-mang' && weatherNews.length > 0 && (
          <div className="mt-16 pt-12 border-t border-gray-300">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
                <h2 className="text-3xl font-bold text-gray-900">Dự báo thời tiết</h2>
              </div>
              <p className="text-gray-600 ml-4">Cập nhật dự báo thời tiết hôm nay</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {weatherNews.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;