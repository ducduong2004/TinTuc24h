import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Target, TrendingUp } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  photo: string;
  team: string;
  teamLogo: string;
  league: string;
  goals: number;
  matches: number;
  assists: number;
  nationality: string;
  flag: string;
}

const TopScorersPage: React.FC = () => {
  const [selectedLeague, setSelectedLeague] = useState<string>('all');

  // Mock data cho top ghi bàn
  const topScorers: Record<string, Player[]> = {
    'all': [
      {
        id: '1',
        name: 'Erling Haaland',
        photo: 'https://img.a.transfermarkt.technology/portrait/big/418560-1694609670.jpg?lm=1',
        team: 'Manchester City',
        teamLogo: 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg',
        league: 'Premier League',
        goals: 21,
        matches: 17,
        assists: 5,
        nationality: 'Na Uy',
        flag: '🇳🇴'
      },
      {
        id: '2',
        name: 'Harry Kane',
        photo: 'https://img.a.transfermarkt.technology/portrait/big/132098-1664804505.jpg?lm=1',
        team: 'Bayern Munich',
        teamLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/1024px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png',
        league: 'Bundesliga',
        goals: 20,
        matches: 15,
        assists: 7,
        nationality: 'Anh',
        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿'
      },
      {
        id: '3',
        name: 'Kylian Mbappe',
        photo: 'https://img.a.transfermarkt.technology/portrait/big/342229-1682683695.jpg?lm=1',
        team: 'Real Madrid',
        teamLogo: 'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg',
        league: 'La Liga',
        goals: 18,
        matches: 16,
        assists: 6,
        nationality: 'Pháp',
        flag: '🇫🇷'
      },
      {
        id: '4',
        name: 'Mohamed Salah',
        photo: 'https://img.a.transfermarkt.technology/portrait/big/148455-1667830921.jpg?lm=1',
        team: 'Liverpool',
        teamLogo: 'https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg',
        league: 'Premier League',
        goals: 17,
        matches: 17,
        assists: 9,
        nationality: 'Ai Cập',
        flag: '🇪🇬'
      },
      {
        id: '5',
        name: 'Robert Lewandowski',
        photo: 'https://img.a.transfermarkt.technology/portrait/big/38253-1635245402.jpg?lm=1',
        team: 'Barcelona',
        teamLogo: 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%282009%E2%80%93present%29.svg',
        league: 'La Liga',
        goals: 16,
        matches: 16,
        assists: 4,
        nationality: 'Ba Lan',
        flag: '🇵🇱'
      },
      {
        id: '6',
        name: 'Victor Osimhen',
        photo: 'https://img.a.transfermarkt.technology/portrait/big/401923-1667830889.jpg?lm=1',
        team: 'Napoli',
        teamLogo: 'https://upload.wikimedia.org/wikipedia/en/2/2d/SSC_Napoli.svg',
        league: 'Serie A',
        goals: 15,
        matches: 14,
        assists: 3,
        nationality: 'Nigeria',
        flag: '🇳🇬'
      },
      {
        id: '7',
        name: 'Cole Palmer',
        photo: 'https://img.a.transfermarkt.technology/portrait/big/568874-1694609839.jpg?lm=1',
        team: 'Chelsea',
        teamLogo: 'https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg',
        league: 'Premier League',
        goals: 15,
        matches: 17,
        assists: 6,
        nationality: 'Anh',
        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿'
      },
      {
        id: '8',
        name: 'Lautaro Martinez',
        photo: 'https://img.a.transfermarkt.technology/portrait/big/406625-1655802408.jpg?lm=1',
        team: 'Inter Milan',
        teamLogo: 'https://upload.wikimedia.org/wikipedia/en/0/05/FC_Internazionale_Milano_2021.svg',
        league: 'Serie A',
        goals: 14,
        matches: 15,
        assists: 5,
        nationality: 'Argentina',
        flag: '🇦🇷'
      },
      {
        id: '9',
        name: 'Alexander Isak',
        photo: 'https://img.a.transfermarkt.technology/portrait/big/393720-1667383468.jpg?lm=1',
        team: 'Newcastle',
        teamLogo: 'https://upload.wikimedia.org/wikipedia/en/e/eb/Newcastle_United_FC_2021.svg',
        league: 'Premier League',
        goals: 14,
        matches: 16,
        assists: 3,
        nationality: 'Thụy Điển',
        flag: '🇸🇪'
      },
      {
        id: '10',
        name: 'Jude Bellingham',
        photo: 'https://img.a.transfermarkt.technology/portrait/big/581678-1683645018.jpg?lm=1',
        team: 'Real Madrid',
        teamLogo: 'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg',
        league: 'La Liga',
        goals: 13,
        matches: 16,
        assists: 8,
        nationality: 'Anh',
        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿'
      }
    ]
  };

  const leagues = [
    { id: 'all', name: 'Tất cả giải' },
    { id: 'premier-league', name: 'Premier League' },
    { id: 'la-liga', name: 'La Liga' },
    { id: 'serie-a', name: 'Serie A' },
    { id: 'bundesliga', name: 'Bundesliga' },
    { id: 'ligue-1', name: 'Ligue 1' }
  ];

  const players = topScorers[selectedLeague] || topScorers['all'];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-4">
            <Target className="w-10 h-10" />
            <h1 className="text-4xl font-bold">TOP GHI BÀN</h1>
          </div>
          <p className="text-green-100 text-lg">Danh sách những chân sút xuất sắc nhất các giải đấu hàng đầu</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Filter Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6 overflow-x-auto">
          <div className="flex gap-2 p-4">
            {leagues.map((league) => (
              <button
                key={league.id}
                onClick={() => setSelectedLeague(league.id)}
                className={`px-6 py-2.5 rounded-full font-semibold whitespace-nowrap transition-all ${
                  selectedLeague === league.id
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {league.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              {/* Table Header */}
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                <div className="grid grid-cols-12 gap-4 text-white font-bold text-sm">
                  <div className="col-span-1 text-center">#</div>
                  <div className="col-span-5">CẦU THỦ</div>
                  <div className="col-span-2 text-center">BÀN THẮNG</div>
                  <div className="col-span-2 text-center">TRẬN ĐẤU</div>
                  <div className="col-span-2 text-center">KIẾN TẠO</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {players.map((player, index) => (
                  <div
                    key={player.id}
                    className={`grid grid-cols-12 gap-4 px-6 py-4 hover:bg-green-50 dark:hover:bg-gray-700 transition-colors ${
                      index < 3 ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''
                    }`}
                  >
                    {/* Rank */}
                    <div className="col-span-1 flex items-center justify-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          index === 0
                            ? 'bg-yellow-500 text-white'
                            : index === 1
                            ? 'bg-gray-400 text-white'
                            : index === 2
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {index + 1}
                      </div>
                    </div>

                    {/* Player Info */}
                    <div className="col-span-5 flex items-center gap-3">
                      <img
                        src={player.photo}
                        alt={player.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48x48?text=Player';
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          {player.name}
                          <span className="text-lg">{player.flag}</span>
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <img
                            src={player.teamLogo}
                            alt={player.team}
                            className="w-4 h-4 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <span>{player.team}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-green-600 dark:text-green-400 font-semibold">{player.league}</span>
                        </div>
                      </div>
                    </div>

                    {/* Goals */}
                    <div className="col-span-2 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {player.goals}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">bàn</div>
                      </div>
                    </div>

                    {/* Matches */}
                    <div className="col-span-2 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {player.matches}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">trận</div>
                      </div>
                    </div>

                    {/* Assists */}
                    <div className="col-span-2 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                          {player.assists}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">kiến tạo</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-8 h-8" />
                <h3 className="text-xl font-bold">Thống kê</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-green-100">Tổng bàn thắng:</span>
                  <span className="text-2xl font-bold">156</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-100">Trung bình/trận:</span>
                  <span className="text-2xl font-bold">1.23</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-100">Top scorer:</span>
                  <span className="text-lg font-bold">Haaland</span>
                </div>
              </div>
            </div>

            {/* Hot News */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="bg-red-600 px-4 py-3">
                <h3 className="text-white font-bold uppercase">Tin nóng</h3>
              </div>
              <div className="p-4 space-y-3">
                <Link to="/news/1" className="block group">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-green-600">
                    Haaland phá kỷ lục ghi bàn tại Premier League
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">2 giờ trước</p>
                </Link>
                <Link to="/news/2" className="block group">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-green-600">
                    Harry Kane tiếp tục thăng hoa tại Bundesliga
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">3 giờ trước</p>
                </Link>
                <Link to="/news/3" className="block group">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-green-600">
                    Salah lập cú đúp vào lưới MU
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">5 giờ trước</p>
                </Link>
              </div>
            </div>

            {/* Award Banner */}
            <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg p-6 text-white text-center shadow-lg">
              <Trophy className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Chiếc giày vàng 2025</h3>
              <p className="text-sm mb-4 opacity-90">Ai sẽ giành danh hiệu?</p>
              <Link to="/bxh" className="inline-block bg-white text-orange-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition">
                Xem BXH
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopScorersPage;
