import React, { useState, useEffect } from 'react';
import { Calendar, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Match {
  id: number;
  leagueCode: string;
  leagueName: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo: string;
  awayLogo: string;
  matchTime: string | null;
  matchDate: string | null;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  round: string | null;
  season: string;
}

interface League {
  code: string;
  name: string;
  icon: string;
}

interface GroupedMatches {
  [date: string]: Match[];
}

const FootballResultsPage: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>('ngoai-hang-anh');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const leagues: League[] = [
    { code: 'ngoai-hang-anh', name: 'Ngoại hạng Anh', icon: '⚽' },
    { code: 'la-liga', name: 'La Liga', icon: '🇪🇸' },
    { code: 'serie-a', name: 'Serie A', icon: '🇮🇹' },
    { code: 'bundesliga', name: 'Bundesliga', icon: '🇩🇪' },
    { code: 'ligue-1', name: 'Ligue 1', icon: '🇫🇷' },
    { code: 'cup-c1', name: 'Champions League', icon: '🏆' },
    { code: 'v-league', name: 'V.League 1', icon: '🇻🇳' },
  ];

  useEffect(() => {
    fetchMatches();
  }, [selectedLeague]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`https://api.animalsfeeds.online/api/football/${selectedLeague}/matches`);
      if (!response.ok) throw new Error('Failed to fetch matches');
      
      const allMatches: Match[] = await response.json();
      
      // Lọc chỉ lấy kết quả đã đấu (có tỷ số, status = finished)
      const finishedMatches = allMatches.filter(match => 
        match.status === 'finished' && 
        match.homeScore !== null && 
        match.awayScore !== null
      );
      
      setMatches(finishedMatches);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError('Không thể tải dữ liệu kết quả thi đấu. Vui lòng kiểm tra kết nối backend.');
      setLoading(false);
    }
  };

  // Group matches by date
  const groupMatchesByDate = () => {
    const grouped: { [key: string]: Match[] } = {};
    
    matches.forEach(match => {
      let key: string;
      
      if (match.matchDate) {
        // Lấy phần ngày từ ISO datetime
        key = match.matchDate.split('T')[0]; // "2025-12-30"
      } else {
        key = 'no-date';
      }
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(match);
    });

    return grouped;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const dayName = days[date.getDay()];
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${dayName}, ngày ${day}/${month}/${year}`;
  };

  const groupedMatches = groupMatchesByDate();
  const sortedKeys = Object.keys(groupedMatches)
    .filter(key => key !== 'no-date')
    .sort((a, b) => b.localeCompare(a)); // Mới nhất lên đầu

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="text-red-500 text-xl mb-4">⚠️ Lỗi tải dữ liệu</div>
        <div className="text-gray-600 mb-4">{error}</div>
        <button 
          onClick={fetchMatches}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-t-lg px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6" />
            <h1 className="text-2xl font-bold">Kết Quả Thi Đấu</h1>
          </div>
          <div className="text-sm">
            Mùa giải 2025/2026
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* League Tabs */}
            <div className="bg-white rounded-lg shadow-lg mb-6 overflow-x-auto">
              <div className="flex border-b">
                {leagues.map((league) => (
                  <button
                    key={league.code}
                    onClick={() => setSelectedLeague(league.code)}
                    className={`px-6 py-4 font-medium whitespace-nowrap transition-colors ${
                      selectedLeague === league.code
                        ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{league.icon}</span>
                      <span>{league.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-lg shadow-md mb-6">
              <div className="flex border-b">
                <Link to="/lich-thi-dau" className="px-6 py-3 font-medium text-gray-600 hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Lịch thi đấu</span>
                  </div>
                </Link>
                <button className="px-6 py-3 font-medium text-blue-600 border-b-2 border-blue-600">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    <span>Kết quả</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Results List */}
            <div className="space-y-6">
              {sortedKeys.length > 0 ? (
                sortedKeys.map((dateKey) => (
                  <div key={dateKey} className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Date Header */}
                    <div className="bg-gray-100 px-6 py-3 border-b">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-800">
                          KẾT QUẢ {groupedMatches[dateKey][0]?.round ? `VÒNG ${groupedMatches[dateKey][0].round}` : ''}
                        </h2>
                        <span className="text-sm text-gray-600">
                          {formatDate(dateKey)}
                        </span>
                      </div>
                    </div>

                    {/* Matches */}
                    <div className="divide-y divide-gray-200">
                      {groupedMatches[dateKey].map((match) => (
                        <div 
                          key={match.id}
                          className="px-6 py-4 hover:bg-blue-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            {/* Time */}
                            <div className="w-32 text-sm font-medium text-gray-700">
                              {match.matchTime || '--:--'}
                            </div>

                            {/* Home Team */}
                            <div className="flex-1 flex items-center justify-end gap-3">
                              <span className="font-semibold text-gray-900 text-right">
                                {match.homeTeam}
                              </span>
                              <img 
                                src={match.homeLogo} 
                                alt={match.homeTeam}
                                className="w-8 h-8 object-contain"
                                onError={(e) => {
                                  e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="gray"><circle cx="12" cy="12" r="10"/></svg>';
                                }}
                              />
                            </div>

                            {/* Score */}
                            <div className="w-32 flex justify-center">
                              <div className="bg-green-500 text-white px-6 py-2 rounded-full font-bold text-lg shadow-md">
                                {match.homeScore} - {match.awayScore}
                              </div>
                            </div>

                            {/* Away Team */}
                            <div className="flex-1 flex items-center gap-3">
                              <img 
                                src={match.awayLogo} 
                                alt={match.awayTeam}
                                className="w-8 h-8 object-contain"
                                onError={(e) => {
                                  e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="gray"><circle cx="12" cy="12" r="10"/></svg>';
                                }}
                              />
                              <span className="font-semibold text-gray-900">
                                {match.awayTeam}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                  <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Chưa có kết quả thi đấu</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>⚽</span>
                <span>BẢNG XẾP HẠNG CÁC GIẢI NỔI BẬT</span>
              </h3>
              <div className="space-y-2">
                {leagues.map((league) => (
                  <button
                    key={league.code}
                    onClick={() => setSelectedLeague(league.code)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      selectedLeague === league.code
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xl">{league.icon}</span>
                    <span className="font-medium">{league.name}</span>
                  </button>
                ))}
              </div>

              {/* Quick Stats */}
              <div className="mt-6 pt-6 border-t">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{matches.length}</div>
                  <div className="text-sm text-gray-600 mt-1">Tổng số trận đã đấu</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FootballResultsPage;
