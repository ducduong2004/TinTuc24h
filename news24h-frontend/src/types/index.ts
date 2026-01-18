
export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  thumbnail: string;
  category: string;
  sourceUrl: string;
  publishedAt: string;
  viewCount: number;
  featured: boolean;
}

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    unpaged: boolean;
    paged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface Category {
  slug: string;
  name: string;
  subcategories?: Category[];
}


