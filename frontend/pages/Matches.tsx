
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ASSETS } from '../constants';
import { API, Match } from '../api';

const Matches: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await API.matches.getAll();
        setMatches(data);
      } catch (error) {
        console.error('Failed to fetch matches:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  // Format time helper
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', hour12: false
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-white text-xl">Loading matches...</div>
      </div>
    );
  }

  return (
    <div className=" min-h-screen bg-transparent">
      <div className="bg-[#001226] text-white py-24 mb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/10 mix-blend-overlay"></div>
        <div className="container mx-auto px-4 relative z-10">
          <span className="text-blue-500 font-black text-xs uppercase tracking-[0.5em] mb-4 block mt-24">Official Schedule</span>
          <h1 className="text-6xl md:text-7xl font-black uppercase tracking-tighter mb-4 leading-none">Fixtures & Results</h1>
          <div className="flex flex-wrap gap-3 mt-8">
            <span className="bg-blue-600 px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-sm">Botola Pro 2</span>
            <span className="bg-white/10 backdrop-blur-md px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-sm">Throne Cup</span>
          </div>
        </div>
        <img src={ASSETS.logo} className="absolute top-1/2 -right-20 -translate-y-1/2 w-80 h-80 opacity-[0.05] grayscale brightness-200 pointer-events-none mt-16" />
      </div>

      <div className="container mx-auto px-4 pb-32">
        <div className="space-y-6">
          {/* Mapping through matches array to render each match card */}
          {matches.map((match) => (
            <div key={match.id} className="bg-white p-8 md:p-12 shadow-sm border-l-8 border-blue-600 rounded-sm hover:shadow-2xl transition-all group overflow-hidden relative">
              <div className="flex flex-col xl:flex-row items-center justify-between gap-12 relative z-10">
                <div className="flex-1 text-center xl:text-left">
                  <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">{formatDate(match.match_date)} • {formatTime(match.match_date)}</p>
                  <p className="text-gray-800 text-sm font-black uppercase tracking-tight">{match.stadium}</p>
                </div>

                <div className="flex-[2] flex items-center justify-center space-x-10 md:space-x-16">
                  <div className="text-center w-28 md:w-40 group-hover:scale-105 transition-transform duration-500">
                    <img src={ASSETS.logo} className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 drop-shadow-xl" />
                    <p className="font-black uppercase text-sm md:text-base tracking-tighter text-[#001226]">Amal Tiznit</p>
                  </div>

                  <div className="text-center px-6">
                    {match.status === 'finished' ? (
                      <div className="flex items-center justify-center space-x-6">
                        <span className={`text-4xl md:text-6xl font-black ${match.is_home && (match.home_score ?? 0) > (match.away_score ?? 0) ? 'text-blue-600' : 'text-[#001226]'}`}>{match.home_score ?? 0}</span>
                        <span className="text-2xl font-bold text-gray-200">-</span>
                        <span className={`text-4xl md:text-6xl font-black ${!match.is_home && (match.away_score ?? 0) > (match.home_score ?? 0) ? 'text-blue-600' : 'text-[#001226]'}`}>{match.away_score ?? 0}</span>
                      </div>
                    ) : (
                      <div className="bg-gray-100 px-10 py-4 text-xl font-black text-gray-400 rounded-full uppercase text-xs tracking-[0.5em] border border-gray-200">vs</div>
                    )}
                    <span className="text-[9px] font-black text-blue-500 block mt-4 uppercase tracking-[0.2em]">{match.status === 'finished' ? 'Final result' : 'Upcoming'}</span>
                  </div>

                  <div className="text-center w-28 md:w-40 opacity-50 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-gray-50">
                      <div className="w-3/4 h-3/4 bg-gray-200 rounded-full"></div>
                    </div>
                    <p className="font-black uppercase text-sm md:text-base tracking-tighter text-[#001226] truncate">{match.opponent}</p>
                  </div>
                </div>

                <div className="flex-1 flex justify-center xl:justify-end">
                  {match.status === 'finished' ? (
                    <button className="px-10 py-4 font-black text-[10px] uppercase tracking-[0.2em] transition-all rounded-sm shadow-xl bg-[#001226] text-white hover:bg-gray-800">
                      Match Report
                    </button>
                  ) : (
                    <Link to="/tickets" className="inline-block px-10 py-4 font-black text-[10px] uppercase tracking-[0.2em] transition-all rounded-sm shadow-xl bg-blue-600 text-white hover:bg-blue-700 shadow-blue-900/20">
                      Buy Tickets
                    </Link>
                  )}
                </div>
              </div>

              {/* Subtle background score for finished matches */}
              {match.status === 'finished' && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[150px] font-black text-gray-50/50 pointer-events-none select-none z-0">
                  {match.home_score ?? 0}-{match.away_score ?? 0}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Matches;
