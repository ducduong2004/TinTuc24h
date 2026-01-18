import axios from "axios";
import type { NewsArticle, PageResponse } from '../types';
import type { AiChatMessage, AiChatResponse, AiSummaryResponse } from "../types/ai";

//  Axios instance (dùng cho AI)
const api = axios.create({
  baseURL: "https://api.animalsfeeds.online",
});
// attach token
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const API_BASE_URL = 'https://api.animalsfeeds.online/api/news';

export const newsApi = {
  // Lấy tin tức nổi bật
  getTopHeadlines: async (): Promise<NewsArticle[]> => {
    const response = await fetch(`${API_BASE_URL}/top-headlines`);
    if (!response.ok) throw new Error('Failed to fetch top headlines');
    return response.json();
  },

  // Lấy tin tức theo danh mục
  getByCategory: async (
    slug: string,
    page: number = 0,
    size: number = 10
  ): Promise<PageResponse<NewsArticle>> => {
    const response = await fetch(
      `${API_BASE_URL}/category/${slug}?page=${page}&size=${size}`
    );
    if (!response.ok) throw new Error('Failed to fetch category news');
    return response.json();
  },

  // Lấy chi tiết tin tức
  getById: async (id: string): Promise<NewsArticle> => {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch news detail');
    return response.json();
  },

  // Tìm kiếm tin tức
  search: async (
    query: string,
    page: number = 0,
    size: number = 10
  ): Promise<PageResponse<NewsArticle>> => {
    const response = await fetch(
      `${API_BASE_URL}/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`
    );
    if (!response.ok) throw new Error('Failed to search news');
    return response.json();
  },

  // Lấy tin liên quan
  getRelated: async (id: string): Promise<NewsArticle[]> => {
    const response = await fetch(`${API_BASE_URL}/${id}/related`);
    if (!response.ok) throw new Error('Failed to fetch related news');
    return response.json();
  },

  // Lấy tin nóng
  getBreakingTicker: async (): Promise<NewsArticle[]> => {
    const response = await fetch(`${API_BASE_URL}/breaking-ticker`);
    if (!response.ok) throw new Error('Failed to fetch breaking news');
    return response.json();
  },

  // Lấy tin đọc nhiều nhất
  getMostViewed: async (limit: number = 10): Promise<NewsArticle[]> => {
    const response = await fetch(`${API_BASE_URL}/most-viewed?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch most viewed news');
    return response.json();
  },

  // Lấy tin tức bất động sản
  getRealEstateNews: async (limit: number = 5): Promise<NewsArticle[]> => {
    const response = await fetch(`${API_BASE_URL}/category/bat-dong-san?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch real estate news');
    return response.json();
  },
};

// Football API
interface FootballTeamResponse {
  position: number;
  teamName: string;
  teamLogo: string;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  recentForm: string;
}

interface FootballTeam {
  rank: number;
  name: string;
  logo: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  recentForm: string;
}

const FOOTBALL_API_BASE_URL = 'https://api.animalsfeeds.online/api/football';

// Helper function: Thay thế logo từ Google sang Wikimedia
const replaceTeamLogo = (teamName: string, oldLogo: string): string => {
  // Nếu logo từ Google (ssl.gstatic.com), thay bằng Wikimedia
  if (oldLogo.includes('ssl.gstatic.com')) {
    const logoMap: Record<string, string> = {
      'Manchester City': 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg',
      'Real Madrid': 'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg',
      'Bayern Munich': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/1024px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png',
      'PSG': 'https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg',
      'Liverpool': 'https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg',
      'Barcelona': 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%282009%E2%80%93present%29.svg',
      'Inter Milan': 'https://upload.wikimedia.org/wikipedia/en/0/05/FC_Internazionale_Milano_2021.svg',
      'Chelsea': 'https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg',
      'Napoli': 'https://upload.wikimedia.org/wikipedia/en/2/2d/SSC_Napoli.svg',
      'Newcastle': 'https://upload.wikimedia.org/wikipedia/en/e/eb/Newcastle_United_FC_2021.svg',
      'Arsenal': 'https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg',
      'Atletico Madrid': 'https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg',
      'AC Milan': 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg',
      'Juventus': 'https://upload.wikimedia.org/wikipedia/en/d/d2/Juventus_FC_2017_logo.svg',
      'Borussia Dortmund': 'https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg',
      'RB Leipzig': 'https://upload.wikimedia.org/wikipedia/en/0/04/RB_Leipzig_2014_logo.svg',
    };
    
    return logoMap[teamName] || 'https://via.placeholder.com/48x48?text=' + teamName.substring(0, 2);
  }
  
  return oldLogo;
};

export const footballApi = {
  // Lấy bảng xếp hạng theo giải đấu
  getStandings: async (leagueId: string): Promise<FootballTeam[]> => {
    const response = await fetch(`${FOOTBALL_API_BASE_URL}/${leagueId}/standings`);
    if (!response.ok) throw new Error('Failed to fetch standings');
    const data: FootballTeamResponse[] = await response.json();
    
    // Map backend response to frontend interface
    return data.map(team => ({
      rank: team.position,
      name: team.teamName,
      logo: replaceTeamLogo(team.teamName, team.teamLogo),
      played: team.matchesPlayed,
      won: team.wins,
      drawn: team.draws,
      lost: team.losses,
      goalsFor: team.goalsFor,
      goalsAgainst: team.goalsAgainst,
      goalDifference: team.goalDifference,
      points: team.points,
      recentForm: team.recentForm
    }));
  }
};

/**
 * =========================
 * AI API
 * =========================
 */
export const aiApi = {
  // Tóm tắt bài viết
  summarize: async (articleId: string): Promise<AiSummaryResponse> => {
    const res = await api.post("/api/ai/summarize", {
      articleId,
    });
    return res.data;
  },

  // Chat AI
  chat: async (
    message: string,
    history: AiChatMessage[]
  ): Promise<AiChatResponse> => {
    const res = await api.post("/api/ai/chat", {
      message,
      history,
    });
    return res.data;
  },
};

/**
 * =========================
 * Weather API
 * =========================
 */
const WEATHER_API_BASE_URL = 'https://api.animalsfeeds.online/api/weather';

export interface WeatherData {
  id: string;
  city: string;
  citySlug: string;
  currentTemp: number;
  description: string;
  todayMin: number;
  todayMax: number;
  todayDescription: string;
  tomorrowMin: number;
  tomorrowMax: number;
  tomorrowDescription: string;
  dayAfterMin: number;
  dayAfterMax: number;
  dayAfterDescription: string;
  airQuality?: number;
  airQualityStatus?: string;
  updatedAt: string;
}

export const weatherApi = {
  // Lấy tất cả thời tiết
  getAllWeather: async (): Promise<WeatherData[]> => {
    const response = await fetch(`${WEATHER_API_BASE_URL}`);
    if (!response.ok) throw new Error('Failed to fetch weather data');
    return response.json();
  },

  // Lấy thời tiết theo thành phố
  getWeatherByCity: async (citySlug: string): Promise<WeatherData> => {
    const response = await fetch(`${WEATHER_API_BASE_URL}/${citySlug}`);
    if (!response.ok) throw new Error('Failed to fetch weather for city');
    return response.json();
  },

  // Trigger crawl thủ công
  triggerCrawl: async (): Promise<string> => {
    const response = await fetch(`${WEATHER_API_BASE_URL}/crawl`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to trigger weather crawl');
    return response.text();
  },
};