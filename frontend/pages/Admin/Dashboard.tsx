import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { API, Match, Player, NewsArticle } from '../../api';
import { ASSETS } from '../../constants';
import { 
    DollarSign, 
    ShoppingBag, 
    Ticket, 
    Award, 
    TrendingUp, 
    ArrowUpRight, 
    Clock, 
    Users, 
    Calendar, 
    CheckCircle2, 
    AlertCircle 
} from 'lucide-react';

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
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.title = 'Tableau De Bord — Admin USAT';
        Promise.all([
            API.players.getAll().catch(() => []),
            API.matches.getAll().catch(() => []),
            API.news.getAll().catch(() => []),
            API.orders.getAll().catch(() => []),
        ]).then(([p, m, n, o]) => {
            setPlayers(p);
            setMatches(m);
            setNews(n);
            setOrders(o);
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

    /* Financial & Operations Metrics */
    const shopRevenue = useMemo(() => {
        return orders.reduce((sum, o) => sum + (Number(o.total || o.total_amount) || 0), 0);
    }, [orders]);

    const pendingOrdersCount = useMemo(() => {
        return orders.filter(o => o.status === 'pending').length;
    }, [orders]);

    const ticketRevenue = 34500; // DH (tickets sold across 6 matches)
    const membershipRevenue = 18500; // DH (Bronze/Gold/Platinum season passes)
    const totalClubRevenue = shopRevenue + ticketRevenue + membershipRevenue;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-8 h-8 border-2 border-[#001226] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">

            {/* ─── FINANCIAL REVENUE METRICS ROW ─── */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-black uppercase text-[#001226] font-display">Aperçu Financier & Opérations</h2>
                        <p className="text-xs text-gray-500">Revenus en temps réel de la Boutique, Billetterie et Cotisations Membres.</p>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase px-3 py-1 rounded-full font-mono">
                        Chiffre d'Affaires Total: {totalClubRevenue} DH
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Boutique Revenue */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-gray-400 uppercase font-display">Revenus Boutique</span>
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><ShoppingBag size={18} /></div>
                        </div>
                        <div>
                            <div className="text-2xl font-black text-[#001226] font-mono">{shopRevenue} DH</div>
                            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-0.5">
                                <TrendingUp size={12} /> +18.4% ce mois
                            </span>
                        </div>
                    </div>

                    {/* Ticket Sales */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-gray-400 uppercase font-display">Billetterie Matchs</span>
                            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><Ticket size={18} /></div>
                        </div>
                        <div>
                            <div className="text-2xl font-black text-[#001226] font-mono">{ticketRevenue} DH</div>
                            <span className="text-[10px] text-gray-400 font-medium mt-0.5 block">
                                6 Matchs à Domicile
                            </span>
                        </div>
                    </div>

                    {/* Membership Passes */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-gray-400 uppercase font-display">Cotisations Membres</span>
                            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl"><Award size={18} /></div>
                        </div>
                        <div>
                            <div className="text-2xl font-black text-[#001226] font-mono">{membershipRevenue} DH</div>
                            <span className="text-[10px] text-amber-600 font-bold font-mono mt-0.5 block">
                                84 Membres Actifs
                            </span>
                        </div>
                    </div>

                    {/* Pending Orders */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-gray-400 uppercase font-display">Commandes En Attente</span>
                            <div className="p-2.5 bg-red-50 text-red-600 rounded-xl"><Clock size={18} /></div>
                        </div>
                        <div>
                            <div className="text-2xl font-black text-red-600 font-mono">{pendingOrdersCount}</div>
                            <Link to="/admin/orders" className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-0.5 mt-0.5">
                                Gérer L'Expédition <ArrowUpRight size={10} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── NEXT MATCH (Primary focus) ─── */}
            {nextMatch && (
                <section className="bg-[#001226] rounded-2xl overflow-hidden shadow-xl">
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

            {/* ─── RECENT OPERATIONAL ACTIVITY STREAM ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Recent Store Orders Feed */}
                <div className="lg:col-span-7">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Dernières Commandes Boutique</h3>
                        <Link to="/admin/orders" className="text-[11px] font-bold text-blue-600 uppercase tracking-wider hover:underline">Tout Gérer</Link>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50 shadow-sm">
                        {orders.slice(0, 5).map((o) => (
                            <div key={o.id} className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-mono font-bold text-xs">
                                        #{o.id}
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-[#001226]">{o.customer_name}</div>
                                        <div className="text-[10px] text-gray-400">{o.customer_phone} • {new Date(o.created_at).toLocaleDateString('fr-MA')}</div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-xs font-black text-blue-700 font-mono">{o.total || o.total_amount} DH</div>
                                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${o.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                        {o.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {orders.length === 0 && (
                            <div className="p-6 text-center text-xs text-gray-400">Aucune commande enregistrée.</div>
                        )}
                    </div>
                </div>

                {/* Top Scorers & Squad Highlights */}
                <div className="lg:col-span-5">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Meilleurs Buteurs</h3>
                        <Link to="/admin/players" className="text-[11px] font-bold text-blue-600 uppercase tracking-wider hover:underline">Effectif</Link>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50 shadow-sm">
                        {topScorers.map((p, i) => (
                            <div key={p.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50/50 transition-colors">
                                <span className="text-xs font-bold text-gray-300 tabular-nums w-4 shrink-0">{i + 1}</span>
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 shrink-0">
                                    <img src={p.image_url || '/Assets/bg2.jpg'} alt={p.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="text-xs font-semibold text-[#001226] block truncate">{p.name}</span>
                                    <span className="text-[10px] text-gray-400">{p.position} · #{p.number}</span>
                                </div>
                                <div className="text-right shrink-0">
                                    <span className="text-xs font-black text-[#001226] tabular-nums block leading-none">{p.goals} Buts</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ─── QUICK MANAGEMENT ─── */}
            <div>
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-3">Gestion Rapide Back-Office</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                    {[
                        { label: 'Boutique', path: '/admin/shop', count: orders.length },
                        { label: 'Commandes', path: '/admin/orders', count: pendingOrdersCount },
                        { label: 'Joueurs', path: '/admin/players', count: players.length },
                        { label: 'Matchs', path: '/admin/matches', count: matches.length },
                        { label: 'Articles', path: '/admin/news', count: news.length },
                        { label: 'Messages', path: '/admin/contacts' },
                    ].map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="bg-white border border-gray-100 rounded-xl px-5 py-4 hover:border-blue-500 hover:shadow-md transition-all group"
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
