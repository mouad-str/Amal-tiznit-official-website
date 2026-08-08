import React, { useState, useEffect } from 'react';
import { 
    Search, 
    User, 
    Trophy, 
    Target, 
    Shield, 
    Calendar, 
    MapPin, 
    Clock, 
    Activity, 
    ChevronLeft, 
    ChevronRight, 
    Star, 
    Award, 
    Sparkles, 
    CheckCircle2, 
    Zap,
    ArrowRight
} from 'lucide-react';
import { ASSETS } from '../constants';
import Modal from '../components/Modal';
import Button from '../components/ui/Button';
import { API, Player as APIPlayer } from '../api';

interface PlayerBio {
    birthDate: string;
    birthPlace: string;
    height: string;
    weight: string;
    foot: string;
    nationality: string;
}

interface Player {
    id: string;
    name: string;
    position: string;
    number: number;
    image: string;
    nationality: string;
    bio: PlayerBio;
    stats: {
        matchesPlayed: number;
        goals: number;
        assists: number;
        minutesPlayed: number;
        yellowCards: number;
        redCards: number;
    };
}

const Players: React.FC = () => {
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const [modalTab, setModalTab] = useState<'overview' | 'stats'>('overview');
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        document.title = "Effectif Pro 2025/2026 | US Amal Tiznit";
        
        const fetchPlayers = async () => {
            try {
                setLoading(true);
                const data = await API.players.getAll();
                
                const mappedPlayers: Player[] = data.map((p: APIPlayer) => {
                    const dbBirth = (p as any).birth_date ? String((p as any).birth_date).slice(0, 10) : '';
                    const dbAge = (p as any).age;
                    const dbHeight = (p as any).height;
                    const dbWeight = (p as any).weight;
                    const dbFoot = (p as any).foot;

                    return {
                        id: String(p.id),
                        name: p.name,
                        position: p.position,
                        number: p.number,
                        image: p.image_url,
                        nationality: p.nationality || 'Maroc 🇲🇦',
                        bio: {
                            birthDate: dbBirth ? new Date(dbBirth).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—',
                            birthPlace: (p as any).birth_place || 'Tiznit, Maroc',
                            height: dbHeight ? `${dbHeight} cm` : '—',
                            weight: dbWeight ? `${dbWeight} kg` : '—',
                            foot: dbFoot || 'Droitier',
                            nationality: p.nationality || 'Maroc 🇲🇦'
                        },
                        stats: {
                            matchesPlayed: Number(p.matches_played) || 0,
                            goals: Number(p.goals) || 0,
                            assists: Number(p.assists) || 0,
                            minutesPlayed: Number(p.minutes_played) || 0,
                            yellowCards: Number(p.yellow_cards) || 0,
                            redCards: Number(p.red_cards) || 0
                        }
                    };
                });

                setPlayers(mappedPlayers);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch players:', err);
                setError('Impossible de charger l\'effectif depuis le serveur.');
                setPlayers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPlayers();
    }, []);

    const positions = ['All', 'Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

    const filteredPlayers = players.filter(player => {
        const matchesPos = filter === 'All' || player.position.toLowerCase().includes(filter.toLowerCase());
        const query = searchTerm.toLowerCase();
        const matchesSearch = !searchTerm || 
            player.name.toLowerCase().includes(query) || 
            player.position.toLowerCase().includes(query) ||
            String(player.number).includes(query);
        return matchesPos && matchesSearch;
    });

    const handlePrevPlayer = () => {
        if (!selectedPlayer) return;
        const index = filteredPlayers.findIndex(p => p.id === selectedPlayer.id);
        if (index > 0) {
            setSelectedPlayer(filteredPlayers[index - 1]);
        } else {
            setSelectedPlayer(filteredPlayers[filteredPlayers.length - 1]);
        }
    };

    const handleNextPlayer = () => {
        if (!selectedPlayer) return;
        const index = filteredPlayers.findIndex(p => p.id === selectedPlayer.id);
        if (index < filteredPlayers.length - 1) {
            setSelectedPlayer(filteredPlayers[index + 1]);
        } else {
            setSelectedPlayer(filteredPlayers[0]);
        }
    };

    const getPositionBadgeColor = (pos: string) => {
        const p = pos.toLowerCase();
        if (p.includes('forward') || p.includes('attaquant')) return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
        if (p.includes('midfield') || p.includes('milieu')) return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
        if (p.includes('defender') || p.includes('défenseur')) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    };

    return (
        <div className="pt-24 pb-24 min-h-screen bg-transparent">
            {/* Header Title Banner */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-10">
                <div className="pt-6 border-b border-white/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center space-x-3 mb-3">
                            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                            <span className="text-blue-500 font-bold text-xs uppercase tracking-[0.4em]">First Team Roster • 2025/2026</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white font-display">
                            Équipe <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-amber-400">Première</span>
                        </h1>
                        <p className="text-gray-400 mt-2 text-sm md:text-base max-w-xl">
                            Découvrez la composition officielle de l'US Amal Tiznit. Statistiques en direct, fiches physiques et performances de nos joueurs.
                        </p>
                    </div>

                    <div className="flex items-center space-x-3 bg-white/5 border border-white/10 px-4 py-3 rounded-2xl backdrop-blur-md">
                        <User className="w-5 h-5 text-blue-400" />
                        <span className="text-xs text-gray-300 font-medium">
                            Effectif Pro: <strong className="text-white font-bold">{players.length} Joueurs</strong>
                        </span>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="mt-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher par nom, numéro (#10) ou poste..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#0B1528]/80 border border-white/10 rounded-xl pl-11 pr-10 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
                        />
                    </div>

                    {/* Position Filter Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                        {positions.map((pos) => {
                            const active = filter === pos;
                            return (
                                <button
                                    key={pos}
                                    onClick={() => setFilter(pos)}
                                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex-shrink-0 whitespace-nowrap border ${
                                        active
                                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/30'
                                            : 'bg-[#0B1528]/60 border-white/10 text-gray-400 hover:text-white hover:border-white/25 hover:bg-white/5'
                                    }`}
                                >
                                    {pos === 'All' ? 'Tous' : pos}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Skeleton Loading */}
            {loading && (
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="h-96 bg-white/5 animate-pulse rounded-2xl border border-white/10"></div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && filteredPlayers.length === 0 && (
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <div className="max-w-md mx-auto bg-[#0B1528]/80 border border-white/10 rounded-2xl p-10 backdrop-blur-xl">
                        <User className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                        <h3 className="text-xl font-bold text-white mb-2">Aucun Joueur Trouvé</h3>
                        <p className="text-gray-400 text-sm mb-6">Aucun joueur ne correspond à vos critères de recherche.</p>
                        <Button variant="outline" size="sm" onClick={() => { setFilter('All'); setSearchTerm(''); }}>
                            Réinitialiser les filtres
                        </Button>
                    </div>
                </div>
            )}

            {/* PLAYERS GRID Showcase */}
            {!loading && filteredPlayers.length > 0 && (
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {filteredPlayers.map((player) => {
                            const badgeColor = getPositionBadgeColor(player.position);
                            return (
                                <div 
                                    key={player.id} 
                                    onClick={() => setSelectedPlayer(player)}
                                    className="group relative bg-[#0B1528]/90 border border-white/10 hover:border-blue-500/40 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 shadow-xl cursor-pointer flex flex-col justify-between"
                                >
                                    <div>
                                        {/* Player Card Image & Watermark */}
                                        <div className="relative aspect-[3/4] overflow-hidden bg-slate-950">
                                            <img
                                                src={player.image || '/Assets/bg2.jpg'}
                                                alt={player.name}
                                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528] via-transparent to-transparent"></div>

                                            {/* Toulouse FC Style Watermark Number */}
                                            <div className="absolute bottom-2 right-2 text-7xl font-black font-mono text-white/10 select-none pointer-events-none group-hover:text-blue-500/20 transition-colors">
                                                #{player.number}
                                            </div>

                                            {/* Jersey Number Badge */}
                                            <div className="absolute top-4 left-4 bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-sm shadow-lg">
                                                #{player.number}
                                            </div>

                                            {/* Position Pill */}
                                            <div className="absolute top-4 right-4">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${badgeColor}`}>
                                                    {player.position}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Player Info Body */}
                                        <div className="p-6">
                                            <span className="text-gray-400 text-[11px] font-semibold uppercase tracking-widest block mb-1">
                                                {player.nationality}
                                            </span>
                                            <h3 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-blue-400 transition-colors line-clamp-1">
                                                {player.name}
                                            </h3>

                                            {/* Quick Performance Meters */}
                                            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-2 text-center text-xs">
                                                <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                                                    <span className="text-[10px] text-gray-400 block uppercase font-bold">Matchs</span>
                                                    <span className="font-mono font-bold text-white text-sm">{player.stats.matchesPlayed}</span>
                                                </div>
                                                <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                                                    <span className="text-[10px] text-gray-400 block uppercase font-bold">Buts</span>
                                                    <span className="font-mono font-bold text-amber-400 text-sm">{player.stats.goals}</span>
                                                </div>
                                                <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                                                    <span className="text-[10px] text-gray-400 block uppercase font-bold">Assists</span>
                                                    <span className="font-mono font-bold text-blue-400 text-sm">{player.stats.assists}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <div className="p-6 pt-0">
                                        <button className="w-full bg-white/5 group-hover:bg-blue-600 text-gray-300 group-hover:text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-white/10 group-hover:border-blue-500">
                                            Fiche Joueur <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* TOULOUSE FC INSPIRED PLAYER PROFILE MODAL */}
            {selectedPlayer && (
                <Modal
                    isOpen={!!selectedPlayer}
                    onClose={() => setSelectedPlayer(null)}
                    title={`Fiche Officielle: #${selectedPlayer.number} ${selectedPlayer.name}`}
                >
                    <div className="space-y-6 text-slate-800">
                        {/* Squad Navigator Bar (Top) */}
                        <div className="flex items-center justify-between bg-slate-100 p-2.5 rounded-xl text-xs font-bold text-gray-600">
                            <button
                                onClick={handlePrevPlayer}
                                className="flex items-center gap-1 hover:text-blue-600 transition-colors px-2 py-1"
                            >
                                <ChevronLeft className="w-4 h-4" /> Joueur Précédent
                            </button>
                            <span className="font-mono text-gray-400">US Amal Tiznit Roster</span>
                            <button
                                onClick={handleNextPlayer}
                                className="flex items-center gap-1 hover:text-blue-600 transition-colors px-2 py-1"
                            >
                                Joueur Suivant <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Player Hero Showcase Banner */}
                        <div className="bg-[#0B1528] text-white p-6 sm:p-8 rounded-2xl relative overflow-hidden shadow-xl">
                            <div className="absolute right-4 bottom-0 text-9xl font-black font-mono text-white/5 select-none pointer-events-none">
                                #{selectedPlayer.number}
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
                                <img
                                    src={selectedPlayer.image || '/Assets/bg2.jpg'}
                                    alt={selectedPlayer.name}
                                    className="w-28 h-36 rounded-xl object-cover border-2 border-blue-500/40 shadow-2xl shrink-0"
                                />

                                <div className="text-center sm:text-left flex-1">
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                                        <span className="bg-blue-600 text-white font-mono font-black text-xs px-3 py-1 rounded-lg">
                                            #{selectedPlayer.number}
                                        </span>
                                        <span className="bg-white/10 text-amber-300 font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-lg border border-white/10">
                                            {selectedPlayer.position}
                                        </span>
                                    </div>

                                    <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white mb-2">
                                        {selectedPlayer.name}
                                    </h2>

                                    {/* Toulouse FC Style Personal Attributes Bar */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs bg-white/5 p-3 rounded-xl border border-white/10 text-gray-300">
                                        <div>
                                            <span className="text-[10px] text-gray-400 uppercase block">Naissance</span>
                                            <strong className="text-white">{selectedPlayer.bio.birthDate}</strong>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-gray-400 uppercase block">Lieu</span>
                                            <strong className="text-white">{selectedPlayer.bio.birthPlace}</strong>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-gray-400 uppercase block">Taille / Poids</span>
                                            <strong className="text-white">{selectedPlayer.bio.height} • {selectedPlayer.bio.weight}</strong>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-gray-400 uppercase block">Pied Fort</span>
                                            <strong className="text-amber-400">{selectedPlayer.bio.foot}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Profile Tabs: Overview vs Stats */}
                        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                            <button
                                onClick={() => setModalTab('overview')}
                                className={`px-4 py-2 font-bold text-xs uppercase tracking-wider rounded-lg transition-all ${
                                    modalTab === 'overview'
                                        ? 'bg-[#002D62] text-white shadow-md'
                                        : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                Fiche & Biographie
                            </button>
                            <button
                                onClick={() => setModalTab('stats')}
                                className={`px-4 py-2 font-bold text-xs uppercase tracking-wider rounded-lg transition-all ${
                                    modalTab === 'stats'
                                        ? 'bg-[#002D62] text-white shadow-md'
                                        : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                Statistiques Saison 2025/2026
                            </button>
                        </div>

                        {/* TAB 1: OVERVIEW & BIOGRAPHY */}
                        {modalTab === 'overview' && (
                            <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
                                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
                                    <h4 className="font-bold text-[#002D62] uppercase tracking-wider mb-1 flex items-center gap-1.5 font-display">
                                        <Sparkles className="w-4 h-4 text-[#D4AF37]" /> Profil Joueur USAT
                                    </h4>
                                    <p className="text-slate-600">
                                        Membre clé de l'effectif professionnel d'Ittihad Al-Riyadi Amal Tiznit pour la campagne Botola Pro 2025/2026. Réputé pour sa rigueur tactique, son engagement sur le terrain et sa contribution collective.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
                                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Club Actuel</span>
                                        <strong className="text-[#002D62] text-sm font-bold">US Amal Tiznit</strong>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
                                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Nationalité Sportive</span>
                                        <strong className="text-slate-800 text-sm font-bold">{selectedPlayer.bio.nationality}</strong>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: SEASON STATS DASHBOARD */}
                        {modalTab === 'stats' && (
                            <div className="space-y-6 animate-fade-in text-slate-800">
                                {/* Core Stats Grid */}
                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                                    <div className="bg-slate-50 border border-slate-200/70 p-3 rounded-xl text-center shadow-sm">
                                        <span className="block text-xl font-black text-[#002D62] font-mono">{selectedPlayer.stats.matchesPlayed}</span>
                                        <span className="text-[8px] uppercase tracking-wider text-slate-500 font-bold">Matchs</span>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-200/70 p-3 rounded-xl text-center shadow-sm">
                                        <span className="block text-xl font-black text-amber-600 font-mono">{selectedPlayer.stats.goals}</span>
                                        <span className="text-[8px] uppercase tracking-wider text-slate-500 font-bold">Buts</span>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-200/70 p-3 rounded-xl text-center shadow-sm">
                                        <span className="block text-xl font-black text-blue-600 font-mono">{selectedPlayer.stats.assists}</span>
                                        <span className="text-[8px] uppercase tracking-wider text-slate-500 font-bold">Passes</span>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-200/70 p-3 rounded-xl text-center shadow-sm">
                                        <span className="block text-xl font-black text-emerald-600 font-mono">{selectedPlayer.stats.minutesPlayed}'</span>
                                        <span className="text-[8px] uppercase tracking-wider text-slate-500 font-bold">Minutes</span>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-200/70 p-3 rounded-xl text-center shadow-sm">
                                        <span className="block text-xl font-black text-amber-500 font-mono">{selectedPlayer.stats.yellowCards}</span>
                                        <span className="text-[8px] uppercase tracking-wider text-slate-500 font-bold">Jaunes</span>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-200/70 p-3 rounded-xl text-center shadow-sm">
                                        <span className="block text-xl font-black text-red-600 font-mono">{selectedPlayer.stats.redCards}</span>
                                        <span className="text-[8px] uppercase tracking-wider text-slate-500 font-bold">Rouges</span>
                                    </div>
                                </div>

                                {/* Custom Position-Based Elite Metrics */}
                                <div className="bg-gradient-to-br from-slate-900 to-[#0A1325] p-5 rounded-2xl border border-white/10 text-white space-y-4 shadow-lg">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-display flex items-center gap-1.5">
                                            <Trophy size={14} /> Indicateurs de Performance Élite
                                        </h4>
                                        <span className="bg-[#002D62] text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-[#D4AF37]/30 text-white">
                                            RATING: {(
                                                6.5 + 
                                                (selectedPlayer.stats.goals * 0.25) + 
                                                (selectedPlayer.stats.assists * 0.15) - 
                                                (selectedPlayer.stats.redCards * 0.5)
                                            ).toFixed(1)} / 10
                                        </span>
                                    </div>

                                    {/* Goalkeeper Metrics */}
                                    {(selectedPlayer.position.toLowerCase().includes('keeper') || selectedPlayer.position.toLowerCase().includes('gardien')) && (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                                    <span className="text-[9px] text-gray-400 uppercase font-bold block mb-1">Clean Sheets (Simulé)</span>
                                                    <span className="text-md font-mono font-bold text-emerald-400">
                                                        {Math.max(1, Math.floor(selectedPlayer.stats.matchesPlayed * 0.35))} Matchs
                                                    </span>
                                                </div>
                                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                                    <span className="text-[9px] text-gray-400 uppercase font-bold block mb-1">Arrêts Décisifs (Simulé)</span>
                                                    <span className="text-md font-mono font-bold text-blue-400">
                                                        {Math.max(3, Math.floor(selectedPlayer.stats.matchesPlayed * 3.2))} Arrêts
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-bold text-gray-300">
                                                    <span>Taux de réussite aux arrêts</span>
                                                    <span className="font-mono text-amber-400">81.4%</span>
                                                </div>
                                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full" style={{ width: '81.4%' }}></div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-bold text-gray-300">
                                                    <span>Précision des Relances</span>
                                                    <span className="font-mono text-amber-400">74.5%</span>
                                                </div>
                                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full" style={{ width: '74.5%' }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Defender Metrics */}
                                    {(selectedPlayer.position.toLowerCase().includes('defender') || selectedPlayer.position.toLowerCase().includes('défenseur')) && (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                                    <span className="text-[9px] text-gray-400 uppercase font-bold block mb-1">Tacles Réussis (Simulé)</span>
                                                    <span className="text-md font-mono font-bold text-emerald-400">
                                                        {Math.max(4, Math.floor(selectedPlayer.stats.matchesPlayed * 2.4))} Tacles
                                                    </span>
                                                </div>
                                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                                    <span className="text-[9px] text-gray-400 uppercase font-bold block mb-1">Duels Gagnés (Simulé)</span>
                                                    <span className="text-md font-mono font-bold text-blue-400">
                                                        {Math.max(2, Math.floor(selectedPlayer.stats.matchesPlayed * 1.8))} Duels
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-bold text-gray-300">
                                                    <span>Taux de Tacles Réussis</span>
                                                    <span className="font-mono text-amber-400">83.2%</span>
                                                </div>
                                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full" style={{ width: '83.2%' }}></div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-bold text-gray-300">
                                                    <span>Rentrées en Zone Offensive</span>
                                                    <span className="font-mono text-amber-400">62.8%</span>
                                                </div>
                                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full" style={{ width: '62.8%' }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Midfielder Metrics */}
                                    {(selectedPlayer.position.toLowerCase().includes('midfield') || selectedPlayer.position.toLowerCase().includes('milieu')) && (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                                    <span className="text-[9px] text-gray-400 uppercase font-bold block mb-1">Chances Créées (Simulé)</span>
                                                    <span className="text-md font-mono font-bold text-emerald-400">
                                                        {Math.max(2, Math.floor(selectedPlayer.stats.assists * 2.8 + 3))} Passes Clés
                                                    </span>
                                                </div>
                                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                                    <span className="text-[9px] text-gray-400 uppercase font-bold block mb-1">Ballons Récupérés (Simulé)</span>
                                                    <span className="text-md font-mono font-bold text-blue-400">
                                                        {Math.max(5, Math.floor(selectedPlayer.stats.matchesPlayed * 4.5))} Recup.
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-bold text-gray-300">
                                                    <span>Précision des Passes</span>
                                                    <span className="font-mono text-amber-400">89.4%</span>
                                                </div>
                                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full" style={{ width: '89.4%' }}></div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-bold text-gray-300">
                                                    <span>Dribbles Réussis</span>
                                                    <span className="font-mono text-amber-400">76.3%</span>
                                                </div>
                                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full" style={{ width: '76.3%' }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Forward Metrics */}
                                    {(selectedPlayer.position.toLowerCase().includes('forward') || selectedPlayer.position.toLowerCase().includes('attaquant')) && (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                                    <span className="text-[9px] text-gray-400 uppercase font-bold block mb-1">Ratio Buts / 90 min</span>
                                                    <span className="text-md font-mono font-bold text-emerald-400">
                                                        {((selectedPlayer.stats.goals * 90) / Math.max(90, selectedPlayer.stats.minutesPlayed)).toFixed(2)} But
                                                    </span>
                                                </div>
                                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                                    <span className="text-[9px] text-gray-400 uppercase font-bold block mb-1">Tirs Cadrés (Simulé)</span>
                                                    <span className="text-md font-mono font-bold text-blue-400">
                                                        {Math.max(4, Math.floor(selectedPlayer.stats.goals * 2.8 + 2))} Tirs
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-bold text-gray-300">
                                                    <span>Efficacité face au but</span>
                                                    <span className="font-mono text-amber-400">26.8%</span>
                                                </div>
                                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-blue-500 to-[#D4AF37] rounded-full" style={{ width: '26.8%' }}></div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-bold text-gray-300">
                                                    <span>Conversion de Penalty</span>
                                                    <span className="font-mono text-amber-400">92.0%</span>
                                                </div>
                                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-blue-500 to-[#D4AF37] rounded-full" style={{ width: '92%' }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Players;
