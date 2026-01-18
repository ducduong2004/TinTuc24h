import type { Category } from '../types';

export const CATEGORIES: Category[] = [
  { 
    slug: 'tin-tuc', 
    name: 'TIN TỨC',
    subcategories: [
      { slug: 'tin-tuc-trong-ngay', name: 'Tin tức trong ngày' },
      { slug: 'chinh-tri-xa-hoi', name: 'Chính trị - Xã hội' },
      { slug: 'ban-tre-cuoc-song', name: 'Bạn trẻ - Cuộc sống' },
      { slug: 'doi-song-dan-sinh', name: 'Đời sống - Dân sinh' },
      { slug: 'tai-nan-giao-thong', name: 'Tai nạn giao thông' },
      { slug: 'nong-tren-mang', name: 'Nóng trên mạng' },
      { slug: 'du-bao-thoi-tiet', name: 'Dự báo thời tiết' },
    ]
  },
  { 
    slug: 'bong-da', 
    name: 'BÓNG ĐÁ',
    subcategories: [
      { slug: 'lich-thi-dau', name: 'Lịch thi đấu' },
      { slug: 'ket-qua', name: 'Kết quả' },
      { slug: 'bxh', name: 'Bảng xếp hạng' },
      { slug: 'cup-c1', name: 'Cup C1' },
      { slug: 'ngoai-hang-anh', name: 'Ngoại hạng Anh' },
      { slug: 'la-liga', name: 'La Liga' },
      { slug: 'serie-a', name: 'Serie A' },
      { slug: 'bundesliga', name: 'Bundesliga' },
      { slug: 'v-league', name: 'V-League' },
      { slug: 'ngoi-sao-bong-da', name: 'Ngôi sao bóng đá' },
      { slug: 'chuyen-nhuong', name: 'Tin chuyển nhượng' },
    ]
  },
  { 
    slug: 'kinh-doanh', 
    name: 'KINH DOANH',
    subcategories: [
      { slug: 'tai-chinh-bat-dong-san', name: 'Tài chính - Bất động sản' },
      { slug: 'thi-truong-tieu-dung', name: 'Thị trường tiêu dùng' },
      { slug: 'doanh-nghiep', name: 'Doanh nghiệp' },
      { slug: 'chung-khoan', name: 'Chứng khoán' },
      { slug: 'gia-vang', name: 'Giá vàng' },
      { slug: 'bat-dong-san', name: 'Bất động sản' },
      { slug: 'khoi-nghiep', name: 'Khởi nghiệp' },

    ]
  },
  { 
    slug: 'giai-tri', 
    name: 'GIẢI TRÍ',
    subcategories: [
      { slug: 'phim', name: 'Phim' },
      { slug: 'ca-nhac-mtv', name: 'Ca nhạc - MTV' },
      { slug: 'thoi-trang', name: 'Thời trang' },
      { slug: 'lam-dep', name: 'Làm đẹp' },
      { slug: 'doi-song-showbiz', name: 'Đời sống Showbiz' },
    ]
  },
  { 
    slug: 'suc-khoe', 
    name: 'SỨC KHỎE',
    subcategories: [
      { slug: 'suc-khoe-doi-song', name: 'Tin tức sức khỏe' },
      { slug: 'dinh-duong', name: 'Sức khoẻ Dinh dưỡng' },
      { slug: 'ung-thu', name: 'Ung thư' },
      { slug: 'phat-minh-y-hoc', name: 'Phát minh y học' },
      { slug: 'benh-phu-nu', name: 'Bệnh phụ nữ' },
      { slug: 'benh-dan-ong', name: 'Bệnh đàn ông' },

    ]
  },
  { 
    slug: 'hi-tech', 
    name: 'HI-TECH',
    subcategories: [
      { slug: 'thoi-trang-hi-tech', name: 'Thời trang Hi Tech' },
      { slug: 'dien-thoai', name: 'Điện thoại' },
      { slug: 'laptop-gia-re', name: 'Laptop' },
      { slug: 'tin-tuc-cong-nghe', name: 'Tin tức công nghệ' },
      { slug: 'may-tinh-de-ban', name: 'Máy tính để bàn' },
      { slug: 'may-tinh-bang', name: 'Máy tính bảng' },
      { slug: 'cac-san-pham-khac', name: 'Phụ kiện hi-tech' },

    ]
  },
  { 
    slug: 'the-gioi', 
    name: 'THẾ GIỚI',
    subcategories: [
      { slug: 'an-ninh-hinh-su', name: 'An ninh hình sự' },
      { slug: 'diem-nong', name: 'Điểm nóng' },
      { slug: 'quan-su', name: 'Quân sự' },
      { slug: 'theo-dong-lich-su', name: 'Theo dòng lịch sử' },
    ]
  },
    { 
    slug: 'the-thao', 
    name: 'THỂ THAO',
    subcategories: [
      { slug: 'bong-da', name: 'Bóng đá' },
      { slug: 'bong-chuyen', name: 'Bóng chuyền' },
      { slug: 'tennis', name: 'Tennis' },
      { slug: 'pickleball', name: 'Pickleball' },
      { slug: 'bong-ro-nba-vba', name: 'Bóng rổ NBA' },
      { slug: 'cac-mon-the-thao-khac', name: 'Thể thao khác' },
    ]
  },
  { 
    slug: 'o-to', 
    name: 'Ô TÔ',
    subcategories: [
      { slug: 'oto', name: 'Ô tô' },
      { slug: 'xe-may', name: 'Xe máy' },
    ]
  },
  { 
    slug: 'cong-nghe-thong-tin', 
    name: 'CÔNG NGHỆ THÔNG TIN',
    subcategories: [
      { slug: 'cong-nghe-thong-tin', name: 'Công nghệ thông tin' },
    ]
  },
];

export const getCategoryName = (slug: string): string => {
  const category = CATEGORIES.find(cat => cat.slug === slug);
  return category ? category.name : slug;
};