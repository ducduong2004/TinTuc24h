import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Trophy } from 'lucide-react';
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
  shortName: string;
  gradient: string;
}

interface GroupedMatches {
  [date: string]: Match[];
}

const FootballSchedulePage: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>('ngoai-hang-anh');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const leagues: League[] = [
    { code: 'ngoai-hang-anh', name: 'Ngoại hạng Anh', icon: '', shortName: 'EPL', gradient: 'from-purple-600 to-pink-500' },
    { code: 'la-liga', name: 'La Liga', icon: '', shortName: 'LLL', gradient: 'from-red-600 to-orange-500' },
    { code: 'serie-a', name: 'Serie A', icon: '', shortName: 'SA', gradient: 'from-blue-600 to-cyan-500' },
    { code: 'bundesliga', name: 'Bundesliga', icon: '', shortName: 'BL', gradient: 'from-red-600 to-gray-800' },
    { code: 'ligue-1', name: 'Ligue 1', icon: '', shortName: 'L1', gradient: 'from-blue-600 to-blue-800' },
    { code: 'cup-c1', name: 'Champions League', icon: '', shortName: 'UCL', gradient: 'from-blue-800 to-blue-500' },
    { code: 'v-league', name: 'V.League 1', icon: '', shortName: 'VL1', gradient: 'from-red-700 to-yellow-500' },
  ];

  // Load local logos from src/assets and pick best match per league by filename pattern
  const logoFiles = import.meta.glob('../assets/*.{png,jpg,jpeg,svg}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
  const manualLogoMap: Record<string, string | undefined> = {
    'ngoai-hang-anh': 'ngoai-hang-anh.png',
    'la-liga': 'la-liga.png',
    'serie-a': 'serie-a.png',
    'bundesliga': 'bundesliga.png',
    'cup-c1': 'cup-c1.png',
    'v-league': 'v.league-1.png',
    'ligue-1': 'ligue-1.png',
  };
  const logoPatterns: Record<string, RegExp[]> = {
    'ngoai-hang-anh': [/premier/, /nha/, /epl/, /anh/],
    'la-liga': [/la\s*liga/, /laliga/],
    'v-league': [/v[-_]?league/, /vleague/],
    'serie-a': [/serie[-_]?a/, /seria[-_]?a/],
    'cup-c1': [/champ/, /uefa/, /ucl/, /c1/],
    'bundesliga': [/bundesliga/],
    'ligue-1': [/ligue/, /league\s*1/, /\bl1\b/],
  };

  const getLeagueLogo = (leagueCode: string): string | null => {
    const normalize = (p: string) => p.toLowerCase().split('?')[0];
    const manual = manualLogoMap[leagueCode];
    if (manual) {
      for (const [path, url] of Object.entries(logoFiles)) {
        if (normalize(path).endsWith(manual.toLowerCase())) return url as string;
      }
    }
    const patterns = logoPatterns[leagueCode] || [];
    for (const [path, url] of Object.entries(logoFiles)) {
      const p = normalize(path);
      if (patterns.some((re) => re.test(p))) return url as string;
    }
    return null;
  };

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
      
      // Lọc chỉ lấy lịch thi đấu sắp tới (status = scheduled hoặc upcoming, chưa có tỷ số)
      const upcomingMatches = allMatches.filter(match => 
        (match.status === 'scheduled' || match.status === 'upcoming' || match.status !== 'finished') &&
        match.homeScore === null && 
        match.awayScore === null
      );
      
      setMatches(upcomingMatches);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError('Không thể tải dữ liệu lịch thi đấu. Vui lòng kiểm tra kết nối backend.');
      setLoading(false);
    }
  };

  // Group matches by date or round
  const groupMatchesByRound = () => {
    const grouped: { [key: string]: Match[] } = {};
    
    matches.forEach(match => {
      let key: string;
      
      // Nếu có matchDate thì group theo ngày
      if (match.matchDate) {
        key = match.matchDate; // Format: "2025-12-20"
      } else if (match.round) {
        // Nếu không có matchDate nhưng có round
        key = `round-${match.round}`;
      } else {
        // Không có gì cả
        key = 'no-schedule';
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${hours}:${minutes} ${day}/${month}`;
  };

  const formatTimeOnly = (dateString: string) => {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const getMatchStatus = (match: Match) => {
    if (match.status === 'finished' && match.homeScore !== null && match.awayScore !== null) {
      return `${match.homeScore} - ${match.awayScore}`;
    } else if (match.status === 'live') {
      return 'LIVE';
    }
    // Trận chưa đấu - hiển thị dấu trừ như 24h.com.vn
    return '-';
  };

  const groupedMatches = groupMatchesByRound();
  const sortedKeys = Object.keys(groupedMatches).sort((a, b) => {
    // Ngày thực (YYYY-MM-DD) lên đầu, sort theo thứ tự thời gian
    if (a.match(/^\d{4}-\d{2}-\d{2}$/) && b.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return a.localeCompare(b);
    }
    // Đẩy "no-schedule" xuống cuối
    if (a === 'no-schedule') return 1;
    if (b === 'no-schedule') return -1;
    // Round theo số
    const numA = parseInt(a.replace('round-', ''));
    const numB = parseInt(b.replace('round-', ''));
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.localeCompare(b);
  });

  const getHeaderTitle = (key: string, matches: Match[]) => {
    // Nếu là ngày thực (YYYY-MM-DD)
    if (key.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const round = matches[0]?.round;
      return round ? `LỊCH THI ĐẤU VÒNG ${round}` : 'LỊCH THI ĐẤU';
    }
    // Nếu là round
    if (key.startsWith('round-')) {
      const roundNum = key.replace('round-', '');
      return `LỊCH THI ĐẤU VÒNG ${roundNum}`;
    }
    // Không nên hiển thị "CHƯA CÓ LỊCH" nữa
    return 'LỊCH THI ĐẤU';
  };

  const getHeaderDate = (key: string) => {
    // Nếu là ngày thực (YYYY-MM-DD) hoặc ISO datetime
    if (key.match(/^\d{4}-\d{2}-\d{2}/)) {
      const date = new Date(key);
      const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      const dayName = days[date.getDay()];
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${dayName}, ngày ${day}/${month}/${year}`;
    }
    return null;
  };

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
            <Calendar className="w-6 h-6" />
            <h1 className="text-2xl font-bold">Lịch Thi Đấu Bóng Đá</h1>
          </div>
          <div className="text-sm">
            Mùa giải 2025/2026
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* League Tabs */}
            <div className="bg-white rounded-lg shadow-lg mb-6 overflow-hidden">
              <div className="flex overflow-x-auto">
                {leagues.map((league) => (
                  <button
                    key={league.code}
                    onClick={() => setSelectedLeague(league.code)}
                    className={`flex-shrink-0 px-4 py-3 font-medium border-b-4 transition-colors ${
                      selectedLeague === league.code
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-transparent hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative w-10 h-10">
                        {(() => { const url = getLeagueLogo(league.code); return url ? (
                          <img
                            src={url}
                            alt={league.name}
                            className="w-full h-full object-contain"
                            loading="lazy"
                          />) : (
                          <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold">
                            {league.shortName}
                          </div>
                        ); })()}
                      </div>
                      <span className="text-xs whitespace-nowrap">{league.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-lg shadow-md mb-6">
              <div className="flex border-b">
                <button className="px-6 py-3 font-medium text-blue-600 border-b-2 border-blue-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Lịch thi đấu</span>
                  </div>
                </button>
                <Link to="/ket-qua" className="px-6 py-3 font-medium text-gray-600 hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    <span>Kết quả</span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Matches List */}
            <div className="space-y-6">
              {sortedKeys.length > 0 ? (
                sortedKeys.map((roundKey) => (
                  <div key={roundKey} className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Round Header */}
                    <div className="bg-gray-100 px-6 py-3 border-b">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-800">
                          {getHeaderTitle(roundKey, groupedMatches[roundKey])}
                        </h2>
                        {getHeaderDate(roundKey) ? (
                          <span className="text-sm text-gray-600">
                            {getHeaderDate(roundKey)}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-600">
                            {groupedMatches[roundKey].length} trận
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Matches */}
                    <div className="divide-y divide-gray-200">
                      {groupedMatches[roundKey].map((match) => (
                        <div 
                          key={match.id}
                          className="px-6 py-4 hover:bg-blue-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            {/* Time */}
                            <div className="w-32 text-sm font-medium text-gray-700">
                              {match.matchTime ? (
                                <span>{match.matchTime}</span>
                              ) : (
                                <span className="text-gray-400">--:--</span>
                              )}
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

                            {/* Score/VS */}
                            <div className="w-24 text-center">
                              <span className={`inline-block px-3 py-1 rounded-lg font-bold text-sm ${
                                match.status === 'live' 
                                  ? 'bg-red-500 text-white animate-pulse' 
                                  : match.status === 'finished'
                                  ? 'bg-gray-200 text-gray-800'
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {getMatchStatus(match)}
                              </span>
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
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Chưa có lịch thi đấu</p>
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
                  <div className="text-3xl font-bold text-blue-600">{matches.length}</div>
                  <div className="text-sm text-gray-600 mt-1">Tổng số trận</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FootballSchedulePage;
