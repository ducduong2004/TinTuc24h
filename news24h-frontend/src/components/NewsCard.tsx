import React from 'react';
import { Link } from 'react-router-dom';
import type { NewsArticle } from '../types';
import { Clock, Eye } from 'lucide-react';
import { getCategoryName } from '../constants';

interface NewsCardProps {
  article: NewsArticle;
  featured?: boolean;
  customId?: string;
}

const NewsCard: React.FC<NewsCardProps> = ({ article, featured = false, customId }) => {
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

  // Decode HTML entities in title
  const decodeHtml = (html: string) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  if (featured) {
    return (
      <Link
        id={customId}
        to={`/news/${article.id}`}
        className="block group overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-shadow"
      >
        <div className="relative h-96">
          <img
            src={`${article.thumbnail}?cache=${article.id}`}
            alt={decodeHtml(article.title)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=No+Image';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 bg-[#78b43d] text-xs font-semibold rounded-full">
                {getCategoryName(article.category)}
              </span>
              <div className="flex items-center gap-2 text-sm">
                <Clock size={14} />
                <span>{formatDate(article.publishedAt)}</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2 line-clamp-2 group-hover:text-[#78b43d] transition">
              {decodeHtml(article.title)}
            </h2>
            <p className="text-gray-200 line-clamp-2">{article.description}</p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      id={customId}
      to={`/news/${article.id}`}
      className="block group bg-white rounded-lg shadow hover:shadow-xl transition-shadow overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-1/3 h-48 sm:h-auto overflow-hidden">
          <img
            src={`${article.thumbnail}?cache=${article.id}`}
            alt={decodeHtml(article.title)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image';
            }}
          />
        </div>
        <div className="sm:w-2/3 p-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-1 bg-[#78b43d]/15 text-[#3c811e] text-xs font-semibold rounded">
              {getCategoryName(article.category)}
            </span>
            <div className="flex items-center gap-1 text-gray-500 text-xs">
              <Clock size={12} />
              <span>{formatDate(article.publishedAt)}</span>
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#78b43d] transition">
            {decodeHtml(article.title)}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-3 mb-3">
            {article.description}
          </p>
          <div className="flex items-center gap-2 text-gray-500 text-xs">
            <Eye size={14} />
            <span>{article.viewCount} lượt xem</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default NewsCard;