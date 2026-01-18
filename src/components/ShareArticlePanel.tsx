import React, { useState } from 'react';
import { Share2, X, Facebook, Twitter, Mail, Link2, QrCode, Copy, Check } from 'lucide-react';

interface ShareArticlePanelProps {
  title: string;
  url: string;
  articleId: string;
}

const ShareArticlePanel: React.FC<ShareArticlePanelProps> = ({ title, url, articleId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const shareUrl = url || `${window.location.origin}/news/${articleId}`;
  const shareText = `${title} - Tin tức 24h`;

  // Copy link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Share Facebook
  const handleShareFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, 'facebook-share', 'width=600,height=400');
  };

  // Share Twitter
  const handleShareTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, 'twitter-share', 'width=600,height=400');
  };

  // Share Zalo
  const handleShareZalo = () => {
    const zaloUrl = `https://zalo.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
    window.open(zaloUrl, 'zalo-share', 'width=600,height=400');
  };

  // Share Email
  const handleShareEmail = () => {
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
    window.location.href = mailtoUrl;
  };

  // Generate QR Code
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;

  return (
    <>
      {/* Share Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1 bg-[#78b43d] text-white rounded-lg hover:bg-[#3c811e] transition font-medium"
        title="Chia sẻ bài viết"
      >
        <Share2 size={18} />
        <span>Chia sẻ</span>
      </button>

      {/* Share Panel */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      )}

      {isOpen && (
        <div className="fixed bottom-8 right-8 bg-white rounded-lg shadow-2xl p-6 w-80 z-50 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Chia sẻ bài viết</h3>
            <button
              onClick={() => {
                setIsOpen(false);
                setShowQR(false);
              }}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X size={20} />
            </button>
          </div>

          {!showQR ? (
            <div className="space-y-3">
              {/* Facebook */}
              <button
                onClick={handleShareFacebook}
                className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
              >
                <Facebook size={18} />
                Chia sẻ lên Facebook
              </button>

              {/* Twitter */}
              <button
                onClick={handleShareTwitter}
                className="w-full flex items-center gap-3 px-4 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition font-medium text-sm"
              >
                <Twitter size={18} />
                Chia sẻ lên Twitter/X
              </button>

              {/* Zalo */}
              <button
                onClick={handleShareZalo}
                className="w-full flex items-center gap-3 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium text-sm"
              >
                <img src="https://zalo.me/favicon.ico" alt="Zalo" className="w-4 h-4" />
                Chia sẻ lên Zalo
              </button>

              {/* Email */}
              <button
                onClick={handleShareEmail}
                className="w-full flex items-center gap-3 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium text-sm"
              >
                <Mail size={18} />
                Gửi qua Email
              </button>

              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium text-sm ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? 'Đã copy link!' : 'Copy link bài viết'}
              </button>

              {/* QR Code */}
              <button
                onClick={() => setShowQR(true)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition font-medium text-sm"
              >
                <QrCode size={18} />
                Hiển thị mã QR
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48 mb-4" />
              <p className="text-sm text-gray-600 text-center mb-4">
                Scan mã QR để xem bài viết này
              </p>
              <button
                onClick={() => setShowQR(false)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium text-sm"
              >
                ← Quay lại
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ShareArticlePanel;
