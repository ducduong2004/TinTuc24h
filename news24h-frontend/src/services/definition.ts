import { newsApi } from './api';

export interface DefinitionResponse {
  success: boolean;
  word: string;
  definition?: string;
  partOfSpeech?: string;
  example?: string;
  message?: string;
}

// Gọi backend API để lấy định nghĩa từ Gemini
export const getWordDefinition = async (word: string): Promise<DefinitionResponse> => {
  try {
    const backendUrl = 'https://api.animalsfeeds.online';
    const response = await fetch(`${backendUrl}/api/definitions/lookup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        word: word.trim(),
        language: 'vi',
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        word,
        message: 'Không thể lấy định nghĩa',
      };
    }

    const data = await response.json();
    return {
      success: true,
      word,
      ...data.data,
    };
  } catch (error) {
    console.error('Error fetching definition:', error);
    return {
      success: false,
      word,
      message: 'Lỗi khi lấy định nghĩa',
    };
  }
};
