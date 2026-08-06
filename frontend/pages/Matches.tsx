import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Ticket,
  BarChart2,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  MinusCircle,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Shield,
  ArrowRight
} from 'lucide-react';
import { ASSETS } from '../constants';
import { API, Match } from '../api';
import Button from '../components/ui/Button';
import Modal from '../components/Modal';

const Matches: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  // View & Filter states
  const [activeTab, setActiveTab] = useState<'schedule' | 'standings'>('schedule');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'finished'>('all');
  const [venueFilter, setVenueFilter] = useState<'all' | 'home' | 'away'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  // Countdown State
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    document.title = "Fixtures & Results | US Amal Tiznit Official";
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

  // Next match calculation for Hero countdown
  const nextMatch = matches.find(m => m.status === 'upcoming') || matches[0];

  useEffect(() => {
    if (!nextMatch) return;
    const calculateTime = () => {
      const diff = new Date(nextMatch.match_date).getTime() - new Date().getTime();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60)
      };
    };
    setCountdown(calculateTime());
    const timer = setInterval(() => setCountdown(calculateTime()), 1000);
    return () => clearInterval(timer);
  }, [nextMatch]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getMatchOutcome = (match: Match) => {
    if (match.status !== 'finished' || match.home_score === null || match.away_score === null) return null;
    const usatScore = match.is_home ? match.home_score : match.away_score;
    const oppScore = match.is_home ? match.away_score : match.home_score;
    if (usatScore > oppScore) return { label: 'Victoire', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    if (usatScore === oppScore) return { label: 'Nul', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    return { label: 'Défaite', color: 'text-red-400 bg-red-500/10 border-red-500/30' };
  };

  // Filter matches
  const filteredMatches = matches.filter(match => {
    const matchesStatus = statusFilter === 'all' || match.status === statusFilter;
    const matchesVenue = venueFilter === 'all' || (venueFilter === 'home' ? match.is_home : !match.is_home);
    const query = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      match.opponent.toLowerCase().includes(query) ||
      match.stadium.toLowerCase().includes(query);
    return matchesStatus && matchesVenue && matchesSearch;
  });

  // Mock League Standings for Botola Pro 2
  const standings = [
    { rank: 1, team: 'COD Meknès', mp: 22, w: 13, d: 6, l: 3, gf: 32, ga: 14, gd: '+18', pts: 45 },
    { rank: 2, team: 'US Amal Tiznit', mp: 22, w: 12, d: 7, l: 3, gf: 34, ga: 16, gd: '+18', pts: 43, isUSAT: true },
    { rank: 3, team: 'Kawkab Marrakech', mp: 22, w: 11, d: 8, l: 3, gf: 29, ga: 15, gd: '+14', pts: 41 },
    { rank: 4, team: 'Stade Marocain', mp: 22, w: 10, d: 7, l: 5, gf: 27, ga: 19, gd: '+8', pts: 37 },
    { rank: 5, team: 'Difaâ El Jadida', mp: 22, w: 9, d: 8, l: 5, gf: 26, ga: 20, gd: '+6', pts: 35 },
    { rank: 6, team: 'Olympique Dcheira', mp: 22, w: 9, d: 6, l: 7, gf: 25, ga: 22, gd: '+3', pts: 33 },
    { rank: 7, team: 'Raja Beni Mellal', mp: 22, w: 8, d: 7, l: 7, gf: 22, ga: 21, gd: '+1', pts: 31 },
    { rank: 8, team: 'Jeunesse Massira', mp: 22, w: 7, d: 8, l: 7, gf: 24, ga: 25, gd: '-1', pts: 29 }
  ];

  return (
    <div className="pt-24 pb-24 min-h-screen bg-transparent">
      {/* Header Hero Title Banner */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="pt-6 border-b border-white/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="text-blue-500 font-bold text-xs uppercase tracking-[0.4em]">Official Match Center</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white font-display">
              Fixtures & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-amber-400">Results</span>
            </h1>
            <p className="text-gray-400 mt-2 text-sm md:text-base max-w-xl">
              Follow US Amal Tiznit in the Botola Pro 2 & Coupe du Trône. Stay updated with live scores, match reports, and ticket availability.
            </p>
          </div>

          {/* View Switcher Tabs: Schedule vs Standings */}
          <div className="flex items-center gap-2 bg-[#0B1528] p-1.5 rounded-2xl border border-white/10">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'schedule'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <Calendar className="w-4 h-4" />
              Match Schedule
            </button>
            <button
              onClick={() => setActiveTab('standings')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'standings'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              Botola Table
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* NEXT MATCH HERO COUNTDOWN CARD (Only shown on Schedule Tab) */}
        {activeTab === 'schedule' && nextMatch && (
          <div className="mb-14">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0B1528] via-slate-900 to-[#040914] border border-blue-500/30 p-8 sm:p-12 shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Match Info & Badge */}
                <div className="lg:col-span-4">
                  <span className="bg-blue-600/20 text-blue-400 border border-blue-500/40 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest inline-block mb-4">
                    🔥 Next Matchday
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight mb-2">
                    US Amal Tiznit <span className="text-blue-400">vs</span> {nextMatch.opponent}
                  </h3>
                  <div className="space-y-1.5 text-xs text-gray-300">
                    <p className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-400" /> {formatDate(nextMatch.match_date)} at {formatTime(nextMatch.match_date)}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-400" /> {nextMatch.stadium} ({nextMatch.is_home ? 'Home Game' : 'Away Game'})
                    </p>
                  </div>
                </div>

                {/* Countdown Units */}
                <div className="lg:col-span-5 flex items-center justify-center gap-3 sm:gap-4 my-4 lg:my-0">
                  {[
                    { label: 'Days', value: countdown.days },
                    { label: 'Hours', value: countdown.hours },
                    { label: 'Mins', value: countdown.minutes },
                    { label: 'Secs', value: countdown.seconds }
                  ].map((unit, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#040914]/90 border border-white/15 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-black text-white font-mono shadow-inner">
                        {String(unit.value).padStart(2, '0')}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-2">
                        {unit.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Action */}
                <div className="lg:col-span-3 text-center lg:text-right">
                  <Link to="/tickets">
                    <Button variant="primary" size="lg" className="w-full sm:w-auto justify-center gap-2 py-2 px-8 shadow-lg shadow-blue-600/30">
                      Buy Tickets
                    </Button>
                  </Link>
                  <span className="text-[10px] text-gray-400 block mt-2">
                    Stade El Massira Box Office Open
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCHEDULE TAB CONTENT */}
        {activeTab === 'schedule' && (
          <>
            {/* Filters & Search Toolbar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
              {/* Search Input */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by opponent or stadium..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#0B1528]/80 border border-white/10 rounded-xl pl-11 pr-10 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              {/* Status Filter & Venue Filter Pills */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Status Filter */}
                <div className="flex items-center bg-[#0B1528]/80 border border-white/10 rounded-xl p-1">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'upcoming', label: 'Upcoming' },
                    { id: 'finished', label: 'Results' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setStatusFilter(tab.id as any)}
                      className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${statusFilter === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white'
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Venue Filter */}
                <div className="flex items-center bg-[#0B1528]/80 border border-white/10 rounded-xl p-1">
                  {[
                    { id: 'all', label: 'All Venues' },
                    { id: 'home', label: '🏠 Home' },
                    { id: 'away', label: '✈️ Away' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setVenueFilter(tab.id as any)}
                      className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${venueFilter === tab.id
                        ? 'bg-white/15 text-white'
                        : 'text-gray-400 hover:text-white'
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Skeleton Loading */}
            {loading && (
              <div className="space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-36 bg-white/5 animate-pulse rounded-2xl border border-white/10"></div>
                ))}
              </div>
            )}

            {/* Empty Results State */}
            {!loading && filteredMatches.length === 0 && (
              <div className="bg-[#0B1528]/80 border border-white/10 rounded-2xl p-12 text-center my-8">
                <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <h4 className="text-xl font-bold text-white mb-1">No Matches Found</h4>
                <p className="text-gray-400 text-sm mb-4">No fixtures match your current filter criteria.</p>
                <Button variant="outline" size="sm" onClick={() => { setStatusFilter('all'); setVenueFilter('all'); setSearchTerm(''); }}>
                  Reset Filters
                </Button>
              </div>
            )}

            {/* MATCHES LIST */}
            {!loading && filteredMatches.length > 0 && (
              <div className="space-y-6">
                {filteredMatches.map((match) => {
                  const outcome = getMatchOutcome(match);
                  return (
                    <div
                      key={match.id}
                      className="group relative bg-[#0B1528]/90 border border-white/10 hover:border-blue-500/40 rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:shadow-2xl shadow-xl overflow-hidden"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">

                        {/* Date & Location Info */}
                        <div className="lg:col-span-3 text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${match.is_home ? 'bg-blue-600/20 border-blue-500/30 text-blue-400' : 'bg-slate-700/40 border-slate-600 text-gray-300'
                              }`}>
                              {match.is_home ? '🏠 Home' : '✈️ Away'}
                            </span>
                            <span className="text-xs font-bold text-gray-400">Botola Pro 2</span>
                          </div>
                          <p className="text-white font-bold text-sm sm:text-base">
                            {formatDate(match.match_date)}
                          </p>
                          <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-amber-400" />
                            {match.stadium} • {formatTime(match.match_date)}
                          </p>
                        </div>

                        {/* Teams & Scoreboard Column */}
                        <div className="lg:col-span-6 flex items-center justify-center gap-6 sm:gap-10 py-4 lg:py-0 border-y lg:border-y-0 lg:border-x border-white/10 px-4">
                          {/* US Amal Tiznit */}
                          <div className="text-center flex-1">
                            <img src={ASSETS.logo} alt="USAT" className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 object-contain group-hover:scale-105 transition-transform" />
                            <h4 className="font-black text-white text-xs sm:text-sm uppercase tracking-tight">
                              Amal Tiznit
                            </h4>
                          </div>

                          {/* Score or VS Badge */}
                          <div className="text-center px-4 shrink-0">
                            {match.status === 'finished' ? (
                              <div className="flex items-center gap-3">
                                <span className="text-3xl sm:text-4xl font-black text-white font-mono">
                                  {match.home_score ?? 0}
                                </span>
                                <span className="text-gray-500 font-bold">-</span>
                                <span className="text-3xl sm:text-4xl font-black text-white font-mono">
                                  {match.away_score ?? 0}
                                </span>
                              </div>
                            ) : (
                              <div className="bg-blue-600/20 border border-blue-500/40 text-blue-400 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest">
                                VS
                              </div>
                            )}

                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mt-2">
                              {match.status === 'finished' ? (outcome ? outcome.label : 'Final Result') : 'Upcoming'}
                            </span>
                          </div>

                          {/* Opponent Team */}
                          <div className="text-center flex-1">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/5 border border-white/10 rounded-full mx-auto mb-2 flex items-center justify-center text-gray-400 font-bold text-xs uppercase">
                              <Shield className="w-6 h-6 text-gray-400" />
                            </div>
                            <h4 className="font-black text-white text-xs sm:text-sm uppercase tracking-tight line-clamp-1">
                              {match.opponent}
                            </h4>
                          </div>
                        </div>

                        {/* Actions Button */}
                        <div className="lg:col-span-3 text-center lg:text-right">
                          {match.status === 'finished' ? (
                            <button
                              onClick={() => setSelectedMatch(match)}
                              className="w-full lg:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center lg:justify-end gap-2 mx-auto"
                            >
                              <BarChart2 className="w-4 h-4 text-blue-400" /> Match Report
                            </button>
                          ) : (
                            <Link to="/tickets">
                              <Button variant="primary" size="md" className="w-full lg:w-auto justify-center gap-2">
                                Buy Tickets 
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* LEAGUE STANDINGS TAB CONTENT */}
        {activeTab === 'standings' && (
          <div className="bg-[#0B1528]/90 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-white/10 pb-6">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                  <Trophy className="w-4 h-4" /> Botola Pro 2 Official Table
                </span>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                  2025/2026 Season Standings
                </h3>
              </div>
              <span className="text-xs text-gray-400">
                Last Updated: <strong className="text-white">Matchday 22</strong>
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] font-black uppercase tracking-wider text-gray-400">
                    <th className="py-4 px-4 text-center">#</th>
                    <th className="py-4 px-4">Club</th>
                    <th className="py-4 px-4 text-center">MP</th>
                    <th className="py-4 px-4 text-center">W</th>
                    <th className="py-4 px-4 text-center">D</th>
                    <th className="py-4 px-4 text-center">L</th>
                    <th className="py-4 px-4 text-center">GF</th>
                    <th className="py-4 px-4 text-center">GA</th>
                    <th className="py-4 px-4 text-center">GD</th>
                    <th className="py-4 px-4 text-center font-bold text-amber-400">PTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {standings.map((row) => (
                    <tr
                      key={row.rank}
                      className={`transition-colors ${row.isUSAT
                        ? 'bg-blue-600/20 border-l-4 border-blue-500 font-bold text-white'
                        : 'hover:bg-white/5 text-gray-300'
                        }`}
                    >
                      <td className="py-4 px-4 text-center font-bold font-mono">
                        {row.rank}
                      </td>
                      <td className="py-4 px-4 font-bold flex items-center gap-3">
                        {row.isUSAT && (
                          <img src={ASSETS.logo} alt="USAT" className="w-6 h-6 object-contain" />
                        )}
                        <span className={row.isUSAT ? 'text-blue-400 uppercase font-black' : 'text-white'}>
                          {row.team}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center font-mono">{row.mp}</td>
                      <td className="py-4 px-4 text-center font-mono text-emerald-400">{row.w}</td>
                      <td className="py-4 px-4 text-center font-mono text-amber-400">{row.d}</td>
                      <td className="py-4 px-4 text-center font-mono text-red-400">{row.l}</td>
                      <td className="py-4 px-4 text-center font-mono text-gray-400">{row.gf}</td>
                      <td className="py-4 px-4 text-center font-mono text-gray-400">{row.ga}</td>
                      <td className="py-4 px-4 text-center font-mono text-gray-300">{row.gd}</td>
                      <td className="py-4 px-4 text-center font-mono font-black text-amber-400 text-base">
                        {row.pts}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MATCH REPORT / DETAILS MODAL */}
      {selectedMatch && (
        <Modal
          isOpen={!!selectedMatch}
          onClose={() => setSelectedMatch(null)}
          title={`Match Report: vs ${selectedMatch.opponent}`}
        >
          <div className="space-y-6 text-gray-200">
            {/* Score Banner */}
            <div className="bg-[#0E182A] border border-white/10 text-white p-6 rounded-2xl text-center shadow-lg">
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 block mb-2">
                {formatDate(selectedMatch.match_date)} • {selectedMatch.stadium}
              </span>
              <div className="flex items-center justify-center gap-8">
                <div>
                  <img src={ASSETS.logo} alt="USAT" className="w-14 h-14 mx-auto mb-1 object-contain" />
                  <p className="font-black text-xs uppercase">Amal Tiznit</p>
                </div>
                <div className="text-3xl font-black font-mono text-amber-400">
                  {selectedMatch.home_score ?? 0} - {selectedMatch.away_score ?? 0}
                </div>
                <div>
                  <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-1 border border-white/10">
                    <Shield className="w-7 h-7 text-gray-300" />
                  </div>
                  <p className="font-black text-xs uppercase">{selectedMatch.opponent}</p>
                </div>
              </div>
            </div>

            {/* Match Stats */}
            <div>
              <h4 className="font-bold text-white uppercase text-xs tracking-wider mb-3">Match Statistics</h4>
              <div className="space-y-3 text-xs font-semibold">
                {[
                  { stat: 'Possession', usat: '56%', opp: '44%' },
                  { stat: 'Shots on Target', usat: '7', opp: '4' },
                  { stat: 'Corners', usat: '6', opp: '3' },
                  { stat: 'Fouls', usat: '11', opp: '14' }
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
                    <span className="text-blue-400 font-bold">{s.usat}</span>
                    <span className="text-gray-400 uppercase text-[11px] font-bold tracking-wider">{s.stat}</span>
                    <span className="text-white font-bold">{s.opp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Matches;
