import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { newsApi } from '../services/api';
import type { NewsArticle } from '../types';
import Loading from '../components/Loading';
import { getCategoryName } from '../constants';
import { Clock, Eye, Tag, ExternalLink, Bookmark, Volume2, Play, Pause, Moon, X, Target } from 'lucide-react';
import { MODE_CONFIG } from '../config/readingModes';
import type { ReadingMode } from '../config/readingModes';
import ArticleSummary from "../components/ArticleSummary";
import TextSettingsPanel from "../components/TextSettingsPanel";
import type { TextSettings } from '../components/TextSettingsPanel';
import ShareArticlePanel from "../components/ShareArticlePanel";
import WordExplainPopup from '../components/WordExplainPopup';
import { useAuth } from '../context/AuthContext';

// const stopSpeak = () => {
//   speechSynthesis.cancel();
// };

const NewsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [relatedNews, setRelatedNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const [readingMode, setReadingMode] = useState<ReadingMode>("normal");
  const mode = MODE_CONFIG[readingMode];

  const [selectedWord, setSelectedWord] = useState<string>("");
  const [meanings, setMeanings] = useState<any[]>([]);
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });
  const [loadingMeaning, setLoadingMeaning] = useState(false);

  // Comments
  const [comments, setComments] = useState<Array<{id: string; author: string; authorId?: string; text: string; createdAt: string;}>>([]);
  const [newComment, setNewComment] = useState('');
  const { user, isAuthenticated } = useAuth();


  const [isModeOpen, setIsModeOpen] = useState(false);
  const [textSettings, setTextSettings] = useState<TextSettings>({
    fontSize: 16,
    fontFamily: 'system',
    textColor: '#000000',
    lineHeight: 1.6,
  });

const API_BASE = "https://minhqnd.com";

const lookupWord = async (word: string) => {
  try {
    setLoadingMeaning(true);
    setMeanings([]);
    const url = `https://dict.minhqnd.com/api/v1/lookup?word=${encodeURIComponent(word)}`;

    const res = await fetch(url).then(res => res.json()).then(data => {
      console.log(data);
      console.log(`Từ: ${data.word}`);
    });

    // if (res.status === 404) {
    //   setMeanings([
    //     {
    //       pos: "_",
    //       definition: "Không tìm thấy ý nghĩa của từ này",
    //       source: ""
    //     }
    //   ])
    //   return;
    // }

    // if(!res.ok) return;

    // const data = await res.json();

    // console.log(data)

    // if(data.exists) {
    //   const result = data.results[0]
    //   setMeanings(result.meanings)
      
    // } else {
    //   setMeanings([
    //     {
    //       pos: "_",
    //       definition: "Khong tim thay nghia",
    //       source: "Dictionnary"
    //     }
    //   ])
    // }

  } catch (err) {
    console.error(err);
  } finally {
    setLoadingMeaning(false);
  }
};

const closePopup = () => {
  setSelectedWord("");
  setMeanings([]);
  setLoadingMeaning(false);
};

  // Set meta tags cho chia sẻ
  useEffect(() => {
    if (article) {
      document.title = article.title + ' - Tin tức 24h';
      
      // Remove old OG tags
      const oldTags = document.querySelectorAll('meta[property^="og:"]');
      oldTags.forEach(tag => tag.remove());

      // Add OG meta tags
      const createMetaTag = (property: string, content: string) => {
        const meta = document.createElement('meta');
        meta.setAttribute('property', property);
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      };

      createMetaTag('og:title', article.title);
      createMetaTag('og:description', article.description);
      createMetaTag('og:url', `${window.location.origin}/news/${article.id}`);
      createMetaTag('og:type', 'article');
      createMetaTag('og:site_name', 'Tin tức 24h');
      if (article.thumbnail) {
        createMetaTag('og:image', article.thumbnail);
        createMetaTag('og:image:width', '1200');
        createMetaTag('og:image:height', '630');
      }
    }
  }, [article]);


  let utterance: SpeechSynthesisUtterance | null = null;

  // Decode HTML entities in title
  const decodeHtml = (html: string) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  const htmlToPlainText = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.innerText || div.textContent || '';
  };
  //   if (!text) return;

  //   speechSynthesis.cancel();

  //   utterance = new SpeechSynthesisUtterance(text);
  //   utterance.lang = "vi-VN";
  //   utterance.rate = 1;
  //   utterance.pitch = 1;

  //   speechSynthesis.speak(utterance);
  // };

  useEffect(() => {
    // Khi đổi bài → tắt giọng đọc
    speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    // cập nhật trạng thái saved khi đổi bài
    const saved = localStorage.getItem('savedArticles');
    try {
      const arr = saved ? JSON.parse(saved) : [];
      setIsSaved(arr.includes(id));
    } catch {
      setIsSaved(false);
    }
  }, [id]);

  const toggleSaveArticle = () => {
    if (!article) return;
    const key = 'savedArticles';
    const raw = localStorage.getItem(key);
    let arr: string[] = [];
    try {
      arr = raw ? JSON.parse(raw) : [];
    } catch {
      arr = [];
    }

    if (arr.includes(article.id.toString())) {
      arr = arr.filter(x => x !== article.id.toString());
      setIsSaved(false);
    } else {
      arr.push(article.id.toString());
      setIsSaved(true);
    }

    localStorage.setItem(key, JSON.stringify(arr));
  };

  useEffect(() => {
    const fetchNewsDetail = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const [newsData, related] = await Promise.all([
          newsApi.getById(id),
          newsApi.getRelated(id)
        ]);
        setArticle(newsData);
        setRelatedNews(related);
        // Thêm vào lịch sử đã xem (localStorage)
        try {
          const key = 'viewedArticles';
          const raw = localStorage.getItem(key);
          let arr: string[] = raw ? JSON.parse(raw) : [];
          const idStr = newsData.id.toString();
          // loại bỏ nếu đã có rồi, đưa lên đầu
          arr = arr.filter(x => x !== idStr);
          arr.unshift(idStr);
          // giữ tối đa 200 mục
          if (arr.length > 200) arr = arr.slice(0, 200);
          localStorage.setItem(key, JSON.stringify(arr));
        } catch (e) {
          // ignore
        }
      } catch (err) {
        setError('Không thể tải chi tiết tin tức. Vui lòng thử lại sau.');
        console.error('Error fetching news detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsDetail();
    window.scrollTo(0, 0);
    // load comments for this article from localStorage
    try {
      const raw = localStorage.getItem(`comments_${id}`);
      const arr = raw ? JSON.parse(raw) : [];
      setComments(Array.isArray(arr) ? arr : []);
    } catch (e) {
      setComments([]);
    }
  }, [id]);

  if (loading) return <Loading />;

  if (error || !article) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          {error || 'Không tìm thấy tin tức'}
        </div>
      </div>
    );
  }

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

  const toggleFocusMode = () => {
    setReadingMode((prev) => (prev === "focus" ? "normal" : "focus"));
  };

  const toggleDarkMode = () => {
    setReadingMode((prev) => (prev === "dark" ? "normal" : "dark"));
  };


  const handleSpeakToggle = () => {
    if (!article) return;

    // Nếu đang nghe → dừng
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      return;
    }

    // Nghe từ đầu
    const text = htmlToPlainText(article.content);

    utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "vi-VN";
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    setIsPaused(false);
  };


  const handlePauseResume = () => {
    if (!isSpeaking) return;

    if (isPaused) {
      speechSynthesis.resume();
      setIsPaused(false);
    } else {
      speechSynthesis.pause();
      setIsPaused(true);
    }
  };


  return (
    // <div className="min-h-screen bg-gray-50">
    <div className={`min-h-screen transition-colors duration-300 ${mode.container}`}>
      <TextSettingsPanel onSettingsChange={setTextSettings} />
      <div className="container mx-auto px-4 py-8">
        {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-8"> */}
        <div className={`grid gap-8 ${mode.grid}`}>
          {/* Main Content */}
          {/* <div className="lg:col-span-2"> */}
          <div className={mode.article}>
            <article className={`rounded-lg shadow-lg overflow-hidden transition-colors duration-300 ${mode.container}`}>
              {/* Category & Meta Info */}
              <div className="px-6 pt-6">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  
                  <Link
                    to={`/category/${article.category}`}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-[#78b43d] text-white text-sm font-semibold rounded-full hover:bg-[#3c811e] transition"
                  >
                    <Tag size={14} />
                    {getCategoryName(article.category)}
                  </Link>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Clock size={16} />
                    <span>{formatDate(article.publishedAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Eye size={16} />
                    <span>{article.viewCount} lượt xem</span>
                  </div>
                  
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {decodeHtml(article.title)}
                </h1>

                <div className="flex gap-3 mb-6">

                  <button
                    onClick={toggleFocusMode}
                    className={`px-4 py-2 rounded-lg transition ${
                      readingMode === "focus"
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-gray-800 text-white hover:bg-black"
                    }`}
                  >
                    {readingMode === "focus" ? (
                      <>
                        <X size={16} className="inline-block mr-2" /> Thoát Focus
                      </>
                    ) : (
                      <>
                        <Target size={16} className="inline-block mr-2" /> Focus
                      </>
                    )}
                  </button>

                  {/* Dark toggle */}
                  <button
                    onClick={toggleDarkMode}
                    className={`px-4 py-2 rounded-lg transition ${
                      readingMode === "dark"
                        ? "bg-yellow-500 text-black hover:bg-yellow-600"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    }`}
                  >
                    {readingMode === "dark" ? (
                      <>
                        <Moon size={16} className="inline-block mr-2" /> Tắt Dark
                      </>
                    ) : (
                      <>
                        <Moon size={16} className="inline-block mr-2" /> Dark
                      </>
                    )}
                  </button>

                  {/* Share Button */}
                  <ShareArticlePanel 
                    title={decodeHtml(article.title)}
                    url={`${window.location.origin}/news/${article.id}`}
                    articleId={article.id.toString()}
                  />
                  <button
                    onClick={toggleSaveArticle}
                    className={`px-4 py-2 rounded-lg transition border ${isSaved ? 'bg-yellow-400 text-white' : 'bg-white text-gray-800 hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-2">
                        <Bookmark size={16} strokeWidth={2.5} />
                        {isSaved ? 'Bỏ lưu bài' : 'Lưu bài'}
                    </div>
                  </button>
                </div>

                {/* Article Summary */}
                <ArticleSummary articleId={id!} />

                <div className="flex gap-3 mb-6 mt-3">
                  <button
                    id="btn-read-news"
                    onClick={handleSpeakToggle}
                    className={`px-4 py-2 rounded-lg text-white transition ${
                      isSpeaking ? "bg-[#3c811e] hover:bg-[#2f6517]" : "bg-[#78b43d] hover:bg-[#3c811e]"
                    }`}
                  >
                    {isSpeaking ? (
                      <>
                        <Volume2 size={16} className="inline-block mr-2" /> Đang nghe...
                      </>
                    ) : (
                      <>
                        <Volume2 size={16} className="inline-block mr-2" /> Nghe tin
                      </>
                    )}
                  </button>

                  {isSpeaking && (
                    <button
                      id="btn-pause-news"
                      onClick={handlePauseResume}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition flex items-center gap-2"
                    >
                      {isPaused ? (
                        <>
                          <Play size={14} /> Tiếp tục
                        </>
                      ) : (
                        <>
                          <Pause size={14} /> Tạm dừng
                        </>
                      )}
                    </button>
                  )}
                </div>

              </div>

              {/* Thumbnail */}
              {article.thumbnail && (
                <div className="px-6 mb-6">
                  <img
                    src={article.thumbnail}
                    alt={decodeHtml(article.title)}
                    className="w-full rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=No+Image';
                    }}
                  />
                </div>
              )}

              {/* Content */}
              <div className="px-6 pb-6">
                <div
                  className={`prose max-w-none ${mode.prose}`}
                  style={{
                    fontSize: `${textSettings.fontSize}px`,
                    color: textSettings.textColor,
                    lineHeight: textSettings.lineHeight,
                    fontFamily: textSettings.fontFamily === 'system' ? 'inherit' : 
                               textSettings.fontFamily === 'serif' ? 'Georgia, serif' :
                               textSettings.fontFamily === 'mono' ? 'Courier New, monospace' :
                               'inherit'
                  }}
                  onMouseUp={(e) => {
                    if (selectedWord || loadingMeaning) return;
                    
                    const selection = window.getSelection();
                    const text = selection?.toString().trim();

                    if (text && text.split(" ").length <= 3) {
                      setSelectedWord(text);
                      setPopupPos({ x: e.clientX, y: e.clientY });
                      lookupWord(text);
                    }
                  }}
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
                
                  <WordExplainPopup
                    word={selectedWord}
                    meanings={meanings}
                    loading={loadingMeaning}
                    position={popupPos}
                    onClose={closePopup}
                  />



                {/* Source Link */}
                {/* {article.sourceUrl && (
                  <div className="mt-8 pt-6 border-t">
                    <Link
                      to="/category/gia-vang"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <ExternalLink size={18} />
                      Xem các tin tức khác về vàng
                    </Link>
                  </div>
                )} */}

                {/* Comments Section */}
                <div className="mt-8 pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-3">Bình luận</h3>

                  {/* New comment box */}
                  {isAuthenticated ? (
                    <div className="mb-4">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                        className="w-full p-3 border rounded resize-none"
                        placeholder="Viết bình luận của bạn..."
                      />
                      <div className="flex items-center justify-end mt-2">
                        <button
                          onClick={async () => {
                            if (!newComment.trim()) return;
                            const comment = {
                              id: Date.now().toString(),
                              author: user?.name || 'Người dùng',
                              authorId: undefined,
                              text: newComment.trim(),
                              createdAt: new Date().toISOString(),
                            };
                            const updated = [comment, ...comments];
                            setComments(updated);
                            setNewComment('');
                            try {
                              localStorage.setItem(`comments_${id}`, JSON.stringify(updated));
                            } catch (e) {
                              console.error('Failed to save comment', e);
                            }
                          }}
                          className="px-4 py-2 bg-[#78b43d] text-white rounded"
                        >
                          Gửi bình luận
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 text-gray-600">Cần đăng nhập để bình luận.</div>
                  )}

                  {/* Existing comments */}
                  <div className="space-y-4">
                    {comments.length === 0 ? (
                      <div className="text-gray-500">Chưa có bình luận nào. Hãy là người bình luận đầu tiên.</div>
                    ) : (
                      comments.map((c) => (
                        <div key={c.id} className="border rounded p-3">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-semibold text-sm">{c.author}</div>
                            <div className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString('vi-VN')}</div>
                          </div>
                          <div className="text-gray-800 text-sm">{c.text}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </article>
          </div>

          {/* Sidebar - Related News */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-[#78b43d]">
                Tin liên quan
              </h2>
              <div className="space-y-4">
                {relatedNews.slice(0, 5).map((news) => (
                  <Link
                    key={news.id}
                    to={`/news/${news.id}`}
                    className="block group"
                  >
                    <div className="flex gap-3">
                      <img
                        src={news.thumbnail}
                        alt={decodeHtml(news.title)}
                        className="w-24 h-24 object-cover rounded flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100x100?text=No+Image';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-3 group-hover:text-[#78b43d] transition">
                          {decodeHtml(news.title)}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <Clock size={12} />
                          <span>{formatDate(news.publishedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default NewsDetailPage;