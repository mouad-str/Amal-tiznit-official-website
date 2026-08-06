import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { API, Match, Player, NewsArticle } from '../../api';
import { ASSETS } from '../../constants';

/* ── Helpers ───────────────────────────────────── */

const fmt = (n: number) => String(n).padStart(2, '0');

const useCountdown = (target: string | null) => {
    const [now, setNow] = useState(Date.now());
    useEffect(() => {
        if (!target) return;
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, [target]);
    if (!target) return null;
    const diff = Math.max(0, new Date(target).getTime() - now);
    return {
        d: Math.floor(diff / 86_400_000),
        h: Math.floor((diff % 86_400_000) / 3_600_000),
        m: Math.floor((diff % 3_600_000) / 60_000),
        s: Math.floor((diff % 60_000) / 1000),
        total: diff,
    };
};

const matchResult = (m: Match) => {
    if (m.status !== 'finished' || m.home_score === null || m.away_score === null) return null;
    const us = m.is_home ? m.home_score : m.away_score;
    const them = m.is_home ? m.away_score : m.home_score;
    if (us > them) return 'W';
    if (us < them) return 'L';
    return 'D';
};

/* ── Demo league table ─────────────────────────── */
const STANDINGS = [
    { pos: 1, club: 'Kawkab Marrakech', p: 22, w: 14, d: 5, l: 3, gf: 35, ga: 14, pts: 47 },
    { pos: 2, club: 'Olympique Dcheira', p: 22, w: 13, d: 5, l: 4, gf: 30, ga: 16, pts: 44 },
    { pos: 3, club: 'Amal Tiznit', p: 22, w: 12, d: 6, l: 4, gf: 32, ga: 15, pts: 42, highlight: true },
    { pos: 4, club: 'COD Meknès', p: 22, w: 11, d: 6, l: 5, gf: 28, ga: 18, pts: 39 },
    { pos: 5, club: 'Stade Marocain', p: 22, w: 10, d: 7, l: 5, gf: 26, ga: 19, pts: 37 },
    { pos: 6, club: 'Difaâ El Jadida', p: 22, w: 10, d: 5, l: 7, gf: 24, ga: 22, pts: 35 },
];

/* ── Component ─────────────────────────────────── */

export const AdminDashboard: React.FC = () => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.title = 'Dashboard — Amal Tiznit';
        Promise.all([
            API.players.getAll().catch(() => []),
            API.matches.getAll().catch(() => []),
            API.news.getAll().catch(() => []),
        ]).then(([p, m, n]) => {
            setPlayers(p);
            setMatches(m);
            setNews(n);
            setLoading(false);
        });
    }, []);

    /* Derived */
    const upcoming = useMemo(() =>
        matches.filter(m => m.status === 'upcoming')
            .sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime()),
        [matches]);

    const finished = useMemo(() =>
        matches.filter(m => m.status === 'finished')
            .sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime()),
        [matches]);

    const nextMatch = upcoming[0] ?? null;
    const lastMatch = finished[0] ?? null;
    const countdown = useCountdown(nextMatch?.match_date ?? null);

    const topScorers = useMemo(() =>
        [...players].sort((a, b) => b.goals - a.goals).slice(0, 5),
        [players]);

    /* Aggregated season stats */
    const season = useMemo(() => {
        let w = 0, d = 0, l = 0, gf = 0, ga = 0;
        finished.forEach(m => {
            if (m.home_score === null || m.away_score === null) return;
            const us = m.is_home ? m.home_score : m.away_score;
            const them = m.is_home ? m.away_score : m.home_score;
            gf += us; ga += them;
            if (us > them) w++; else if (us === them) d++; else l++;
        });
        return { played: w + d + l, w, d, l, gf, ga, pts: w * 3 + d };
    }, [finished]);

    const form = useMemo(() => finished.slice(0, 5).map(matchResult).filter(Boolean) as string[], [finished]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-8 h-8 border-2 border-[#001226] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">

            {/* ─── NEXT MATCH (Primary focus) ─── */}
            {nextMatch && (
                <section className="bg-[#001226] rounded-2xl overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] items-stretch">
                        {/* Match info */}
                        <div className="p-8 lg:p-12 flex flex-col justify-center">
                            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-[0.2em] mb-4">
                                Prochain Match · Botola Pro 2
                            </span>

                            <div className="flex items-center gap-6 sm:gap-10 mb-8">
                                {/* Home */}
                                <div className="text-center">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl p-2.5 mx-auto mb-3 shadow-lg">
                                        <img src={ASSETS.logo} alt="Amal Tiznit" className="w-full h-full object-contain" />
                                    </div>
                                    <span className="text-white text-xs sm:text-sm font-bold uppercase tracking-wide">Amal Tiznit</span>
                                </div>

                                {/* Countdown center */}
                                <div className="flex-1 text-center">
                                    {countdown && countdown.total > 0 ? (
                                        <>
                                            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3">
                                                {[
                                                    { v: countdown.d, l: 'Jours' },
                                                    { v: countdown.h, l: 'Heures' },
                                                    { v: countdown.m, l: 'Min' },
                                                    { v: countdown.s, l: 'Sec' },
                                                ].map((u, i) => (
                                                    <div key={i} className="text-center">
                                                        <span className="block text-2xl sm:text-4xl font-black text-white tabular-nums leading-none">
                                                            {fmt(u.v)}
                                                        </span>
                                                        <span className="text-[9px] text-gray-500 uppercase tracking-wider font-semibold mt-1 block">
                                                            {u.l}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                            <span className="text-gray-400 text-xs">
                                                {new Date(nextMatch.match_date).toLocaleDateString('fr-FR', {
                                                    weekday: 'long', day: 'numeric', month: 'long'
                                                })}
                                                {' · '}
                                                {new Date(nextMatch.match_date).toLocaleTimeString('fr-FR', {
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-xl font-bold text-green-400 uppercase">Jour de Match</span>
                                    )}
                                </div>

                                {/* Away */}
                                <div className="text-center">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-2xl mx-auto mb-3 flex items-center justify-center">
                                        <span className="text-3xl font-black text-white/30">{nextMatch.opponent.charAt(0)}</span>
                                    </div>
                                    <span className="text-white text-xs sm:text-sm font-bold uppercase tracking-wide">{nextMatch.opponent}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 text-xs text-gray-400">
                                <span>{nextMatch.is_home ? 'Domicile' : 'Extérieur'}</span>
                                <span className="w-px h-3 bg-gray-700" />
                                <span>{nextMatch.stadium}</span>
                            </div>
                        </div>

                        {/* Side actions strip */}
                        <div className="flex lg:flex-col border-t lg:border-t-0 lg:border-l border-white/10">
                            <Link
                                to="/admin/matches"
                                className="flex-1 flex items-center justify-center gap-2 px-8 py-4 text-xs font-bold text-white uppercase tracking-wider hover:bg-white/5 transition-colors"
                            >
                                Détails
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
                            </Link>
                            <div className="w-px lg:w-auto lg:h-px bg-white/10" />
                            <Link
                                to="/admin/tickets"
                                className="flex-1 flex items-center justify-center gap-2 px-8 py-4 text-xs font-bold text-blue-400 uppercase tracking-wider hover:bg-white/5 transition-colors"
                            >
                                Billetterie
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
                            </Link>
                        </div>
                    </div>
                </section>
            )}


            {/* ─── LAST RESULT + FORM + SEASON OVERVIEW ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Last result */}
                <div className="lg:col-span-5">
                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-3">Dernier Résultat</h3>
                    {lastMatch ? (
                        <div className="bg-white rounded-xl border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                                    {new Date(lastMatch.match_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                                {(() => {
                                    const r = matchResult(lastMatch);
                                    if (!r) return null;
                                    const styles = {
                                        W: 'bg-green-50 text-green-700 border-green-200',
                                        L: 'bg-red-50 text-red-700 border-red-200',
                                        D: 'bg-amber-50 text-amber-700 border-amber-200',
                                    };
                                    const labels = { W: 'Victoire', L: 'Défaite', D: 'Nul' };
                                    return (
                                        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${styles[r]}`}>
                                            {labels[r]}
                                        </span>
                                    );
                                })()}
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-50 rounded-lg p-1.5 border border-gray-100">
                                        <img src={ASSETS.logo} alt="USAT" className="w-full h-full object-contain" />
                                    </div>
                                    <span className="text-sm font-bold text-[#001226]">
                                        {lastMatch.is_home ? 'Amal Tiznit' : lastMatch.opponent}
                                    </span>
                                </div>

                                <span className="text-2xl font-black text-[#001226] tabular-nums tracking-wider px-4">
                                    {lastMatch.home_score} – {lastMatch.away_score}
                                </span>

                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold text-[#001226] text-right">
                                        {lastMatch.is_home ? lastMatch.opponent : 'Amal Tiznit'}
                                    </span>
                                    <div className="w-10 h-10 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center">
                                        {lastMatch.is_home ? (
                                            <span className="text-sm font-black text-gray-300">{lastMatch.opponent.charAt(0)}</span>
                                        ) : (
                                            <img src={ASSETS.logo} alt="USAT" className="w-6 h-6 object-contain" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="text-[10px] text-gray-400 mt-4 pt-3 border-t border-gray-50">
                                {lastMatch.stadium} · {lastMatch.is_home ? 'Domicile' : 'Extérieur'}
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 italic">Aucun résultat enregistré.</p>
                    )}
                </div>

                {/* Season numbers — flat, no cards */}
                <div className="lg:col-span-4">
                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-3">Saison 2025/26</h3>
                    <div className="bg-white rounded-xl border border-gray-100 p-6 h-[calc(100%-28px)]">
                        <div className="grid grid-cols-4 gap-4 text-center h-full items-center">
                            {[
                                { v: season.played, l: 'MJ' },
                                { v: season.w, l: 'V' },
                                { v: season.d, l: 'N' },
                                { v: season.l, l: 'D' },
                            ].map((s, i) => (
                                <div key={i}>
                                    <span className="block text-3xl font-black text-[#001226] tabular-nums leading-none">{s.v}</span>
                                    <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mt-1 block">{s.l}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-50 mt-4 pt-4 flex items-center justify-between text-sm">
                            <div>
                                <span className="text-gray-400 text-xs">Buts</span>
                                <span className="block font-bold text-[#001226] tabular-nums">{season.gf} : {season.ga}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-gray-400 text-xs">Points</span>
                                <span className="block font-bold text-[#001226] tabular-nums">{season.pts}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="lg:col-span-3">
                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-3">Forme</h3>
                    <div className="bg-white rounded-xl border border-gray-100 p-6 h-[calc(100%-28px)] flex flex-col justify-between">
                        <div className="flex items-center gap-2 mb-4">
                            {form.map((r, i) => {
                                const c = r === 'W' ? 'bg-green-500 text-white' : r === 'L' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600';
                                return <span key={i} className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold ${c}`}>{r === 'W' ? 'V' : r === 'L' ? 'D' : 'N'}</span>;
                            })}
                            {form.length === 0 && <span className="text-sm text-gray-400 italic">—</span>}
                        </div>

                        <div className="border-t border-gray-50 pt-4">
                            <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider block mb-1">Position</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-[#001226] tabular-nums leading-none">3</span>
                                <span className="text-sm text-gray-400 font-semibold">è</span>
                            </div>
                            <span className="text-[10px] text-gray-400 mt-0.5 block">Botola Pro 2</span>
                        </div>
                    </div>
                </div>
            </div>


            {/* ─── FIXTURES + STANDINGS ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Upcoming fixtures */}
                <div className="lg:col-span-7">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Calendrier</h3>
                        <Link to="/admin/matches" className="text-[11px] font-bold text-blue-600 uppercase tracking-wider hover:underline">Tout voir</Link>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
                        {/* Recent results */}
                        {finished.slice(0, 3).map((m) => {
                            const r = matchResult(m);
                            return (
                                <div key={m.id} className="flex items-center px-6 py-4 hover:bg-gray-50/50 transition-colors">
                                    <span className="text-[10px] text-gray-400 font-semibold w-20 shrink-0 tabular-nums">
                                        {new Date(m.match_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                    </span>
                                    <div className="flex-1 flex items-center gap-3 min-w-0">
                                        <span className="text-sm font-semibold text-[#001226] truncate">
                                            {m.is_home ? 'Amal Tiznit' : m.opponent}
                                        </span>
                                        <span className="text-sm font-black text-[#001226] tabular-nums shrink-0">
                                            {m.home_score} – {m.away_score}
                                        </span>
                                        <span className="text-sm font-semibold text-[#001226] truncate">
                                            {m.is_home ? m.opponent : 'Amal Tiznit'}
                                        </span>
                                    </div>
                                    {r && (
                                        <span className={`w-6 h-6 rounded text-[10px] font-bold flex items-center justify-center shrink-0 ml-3 ${
                                            r === 'W' ? 'bg-green-50 text-green-600' : r === 'L' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'
                                        }`}>{r === 'W' ? 'V' : r === 'L' ? 'D' : 'N'}</span>
                                    )}
                                </div>
                            );
                        })}

                        {/* Divider */}
                        {upcoming.length > 0 && finished.length > 0 && (
                            <div className="px-6 py-2 bg-gray-50/50">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">À venir</span>
                            </div>
                        )}

                        {/* Upcoming */}
                        {upcoming.slice(0, 3).map((m) => (
                            <div key={m.id} className="flex items-center px-6 py-4 hover:bg-gray-50/50 transition-colors">
                                <span className="text-[10px] text-gray-400 font-semibold w-20 shrink-0 tabular-nums">
                                    {new Date(m.match_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                </span>
                                <div className="flex-1 flex items-center gap-3 min-w-0">
                                    <span className="text-sm font-semibold text-[#001226] truncate">
                                        {m.is_home ? 'Amal Tiznit' : m.opponent}
                                    </span>
                                    <span className="text-xs text-gray-400 shrink-0">
                                        {new Date(m.match_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span className="text-sm font-semibold text-[#001226] truncate">
                                        {m.is_home ? m.opponent : 'Amal Tiznit'}
                                    </span>
                                </div>
                                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ml-3 ${
                                    m.is_home ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
                                }`}>{m.is_home ? 'Dom.' : 'Ext.'}</span>
                            </div>
                        ))}

                        {matches.length === 0 && (
                            <div className="px-6 py-8 text-center text-sm text-gray-400 italic">Aucun match enregistré.</div>
                        )}
                    </div>
                </div>

                {/* League standings */}
                <div className="lg:col-span-5">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Classement Botola Pro 2</h3>
                        <span className="text-[9px] font-semibold text-gray-300 uppercase tracking-wider">Démo</span>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                                    <th className="px-4 py-3 w-8">#</th>
                                    <th className="py-3">Club</th>
                                    <th className="py-3 text-center w-10">MJ</th>
                                    <th className="py-3 text-center w-10 hidden sm:table-cell">V</th>
                                    <th className="py-3 text-center w-10 hidden sm:table-cell">N</th>
                                    <th className="py-3 text-center w-10 hidden sm:table-cell">D</th>
                                    <th className="py-3 text-center w-10">+/-</th>
                                    <th className="py-3 text-right pr-4 w-12">Pts</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs divide-y divide-gray-50">
                                {STANDINGS.map((row) => (
                                    <tr key={row.pos} className={`${row.highlight ? 'bg-blue-50/50' : 'hover:bg-gray-50/40'} transition-colors`}>
                                        <td className="px-4 py-3 font-bold text-gray-400 tabular-nums">{row.pos}</td>
                                        <td className={`py-3 font-semibold ${row.highlight ? 'text-[#001226] font-bold' : 'text-gray-700'}`}>
                                            {row.highlight && (
                                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mr-2" />
                                            )}
                                            {row.club}
                                        </td>
                                        <td className="py-3 text-center text-gray-500 tabular-nums">{row.p}</td>
                                        <td className="py-3 text-center text-gray-500 tabular-nums hidden sm:table-cell">{row.w}</td>
                                        <td className="py-3 text-center text-gray-500 tabular-nums hidden sm:table-cell">{row.d}</td>
                                        <td className="py-3 text-center text-gray-500 tabular-nums hidden sm:table-cell">{row.l}</td>
                                        <td className="py-3 text-center tabular-nums font-semibold text-gray-600">
                                            {row.gf - row.ga > 0 ? '+' : ''}{row.gf - row.ga}
                                        </td>
                                        <td className={`py-3 text-right pr-4 font-bold tabular-nums ${row.highlight ? 'text-[#001226]' : 'text-gray-700'}`}>
                                            {row.pts}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>


            {/* ─── TOP SCORERS + NEWS ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Top scorers — table, not cards */}
                <div className="lg:col-span-5">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Meilleurs Buteurs</h3>
                        <Link to="/admin/players" className="text-[11px] font-bold text-blue-600 uppercase tracking-wider hover:underline">Effectif</Link>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
                        {topScorers.map((p, i) => (
                            <div key={p.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                                <span className="text-xs font-bold text-gray-300 tabular-nums w-4 shrink-0">{i + 1}</span>
                                <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 shrink-0">
                                    <img src={p.image_url || '/Assets/bg2.jpg'} alt={p.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="text-sm font-semibold text-[#001226] block truncate">{p.name}</span>
                                    <span className="text-[10px] text-gray-400">{p.position} · #{p.number}</span>
                                </div>
                                <div className="flex items-center gap-4 shrink-0">
                                    <div className="text-center">
                                        <span className="text-sm font-black text-[#001226] tabular-nums block leading-none">{p.goals}</span>
                                        <span className="text-[9px] text-gray-400 uppercase">Buts</span>
                                    </div>
                                    <div className="text-center">
                                        <span className="text-sm font-bold text-gray-500 tabular-nums block leading-none">{p.assists}</span>
                                        <span className="text-[9px] text-gray-400 uppercase">Ass.</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {topScorers.length === 0 && (
                            <div className="px-6 py-8 text-center text-sm text-gray-400 italic">Aucun joueur enregistré.</div>
                        )}
                    </div>
                </div>

                {/* Latest news */}
                <div className="lg:col-span-7">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Actualités</h3>
                        <Link to="/admin/news" className="text-[11px] font-bold text-blue-600 uppercase tracking-wider hover:underline">Tout voir</Link>
                    </div>

                    {news.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">Aucune actualité publiée.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Feature article */}
                            {news[0] && (
                                <div className="sm:col-span-2 relative rounded-xl overflow-hidden group bg-[#001226]">
                                    <div className="aspect-[21/9]">
                                        <img
                                            src={news[0].image_url || '/Assets/bg.jpg'}
                                            alt=""
                                            className="w-full h-full object-cover opacity-60 group-hover:opacity-70 group-hover:scale-[1.02] transition-all duration-500"
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#001226] via-[#001226]/30 to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-6">
                                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                                            {news[0].category || 'Club'}
                                        </span>
                                        <h4 className="text-base sm:text-lg font-bold text-white mt-1 line-clamp-2 leading-snug">{news[0].title}</h4>
                                        <span className="text-[10px] text-gray-400 mt-2 block">
                                            {new Date(news[0].published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Secondary articles */}
                            {news.slice(1, 3).map((n) => (
                                <div key={n.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:border-gray-200 transition-colors">
                                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{n.category || 'Info'}</span>
                                    <h5 className="text-sm font-semibold text-[#001226] mt-1.5 line-clamp-2 leading-snug">{n.title}</h5>
                                    <span className="text-[10px] text-gray-400 mt-2 block">
                                        {new Date(n.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>


            {/* ─── QUICK MANAGEMENT ─── */}
            <div>
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-3">Gestion Rapide</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                    {[
                        { label: 'Joueurs', path: '/admin/players', count: players.length },
                        { label: 'Matchs', path: '/admin/matches', count: matches.length },
                        { label: 'Articles', path: '/admin/news', count: news.length },
                        { label: 'Billets', path: '/admin/tickets' },
                        { label: 'Boutique', path: '/admin/shop' },
                        { label: 'Messages', path: '/admin/contacts' },
                    ].map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="bg-white border border-gray-100 rounded-xl px-5 py-4 hover:border-gray-200 hover:shadow-sm transition-all group"
                        >
                            <span className="text-xs font-bold text-[#001226] uppercase tracking-wider group-hover:text-blue-600 transition-colors">{item.label}</span>
                            {item.count !== undefined && (
                                <span className="block text-2xl font-black text-[#001226] tabular-nums mt-1 leading-none">{item.count}</span>
                            )}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
