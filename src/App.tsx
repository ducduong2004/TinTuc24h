import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import NewsDetailPage from './pages/NewsDetailPage';
import SearchPage from './pages/SearchPage';
import GoldPricePage from './pages/GoldPricePage';
import CupC1Page from './pages/CupC1Page';
import FootballStandingsPage from './pages/FootballStandingsPage';
import FootballSchedulePage from './pages/FootballSchedulePage';
import FootballResultsPage from './pages/FootballResultsPage';
import LunarCalendarPage from './pages/LunarCalendarPage';
import WeatherPage from './pages/WeatherPage';
import { useEffect } from "react";

// import LoginPage from './pages/LoginPage';
import ChatbotWidget from "./components/ChatbotWidget";
import OAuthCallback from "./pages/OAuthCallback";
import VoiceAssistant from "./components/VoiceAssistant";
import AccountPage from './pages/AccountPage';
import SavedPage from './pages/SavedPage';
import ViewedPage from './pages/ViewedPage';
import AccountLinksPage from './pages/AccountLinksPage';
const App: React.FC = () => {

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "OAUTH_SUCCESS") {
        localStorage.setItem("access_token", e.data.token);

        // reload để header nhận trạng thái login
        window.location.reload();
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/news/:id" element={<NewsDetailPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/gia-vang" element={<GoldPricePage />} />
            <Route path="/cup-c1" element={<CupC1Page />} />
            <Route path="/bxh" element={<FootballStandingsPage />} />
            <Route path="/lich-thi-dau" element={<FootballSchedulePage />} />
            <Route path="/ket-qua" element={<FootballResultsPage />} />
            <Route path="/lich-van-nien" element={<LunarCalendarPage />} />
            <Route path="/category/du-bao-thoi-tiet" element={<WeatherPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/saved" element={<SavedPage />} />
            <Route path="/history" element={<ViewedPage />} />
            <Route path="/link-account" element={<AccountLinksPage />} />
            {/*<Route path="/top-ghi-ban" element={<TopScorersPage />} />*/}
            {/*<Route path="/category/top-ghi-ban" element={<TopScorersPage />} />*/}

            <Route path="/oauth2/callback" element={<OAuthCallback />} />
          </Routes>
        </main>
        <Footer />

        {/*  Chatbot – hiện ở mọi trang */}
        <ChatbotWidget />
        <VoiceAssistant />
      </div>
    </Router>
  );
};

export default App;