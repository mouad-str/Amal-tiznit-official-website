import React, { useState, useEffect } from 'react';
import { API, Player } from '../api';
import { ASSETS } from '../constants';
import { Award, CheckCircle2, Trophy, Flame, Star, ThumbsUp, Calendar } from 'lucide-react';

export const Vote: React.FC = () => {
    const [voteData, setVoteData] = useState<{ totalVotes: number; results: any[] }>({ totalVotes: 0, results: [] });
    const [votedPlayerId, setVotedPlayerId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        document.title = 'Joueur du Mois — Vote Supporter USAT';
        fetchVoteResults();
    }, []);

    const fetchVoteResults = async () => {
        try {
            const data = await API.votes.getResults('MARCH-2026');
            setVoteData(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching vote results:', error);
            setLoading(false);
        }
    };

    const handleCastVote = async (playerId: number) => {
        try {
            const res = await API.votes.cast(playerId, 'MARCH-2026');
            setVotedPlayerId(playerId);
            setMessage(res.message);
            fetchVoteResults();
        } catch (error: any) {
            setMessage(error.message || 'Impossible de voter');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#001226] text-white pt-28 pb-16 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white pt-28 pb-20 relative overflow-hidden font-sans">
            {/* Ambient Background Lights */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/10 blur-[140px] rounded-full pointer-events-none" />
            <div className="absolute top-1/2 right-10 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* Hero Title */}
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest">
                        <Trophy size={14} /> Élection Officielle Supporter • Mars 2026
                    </div>

                    <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight font-display bg-gradient-to-r from-white via-slate-200 to-amber-300 bg-clip-text text-transparent">
                        Joueur Du Mois USAT
                    </h1>

                    <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                        Votez pour le joueur ayant réalisé la meilleure performance avec les couleurs d'Amal Tiznit. Vos votes comptent dans le classement final !
                    </p>

                    {/* Stats Bar */}
                    <div className="flex items-center justify-center gap-8 pt-4 text-xs font-mono text-slate-400">
                        <div className="flex items-center gap-2">
                            <Flame className="text-amber-400" size={16} />
                            <span><strong className="text-white">{voteData.totalVotes}</strong> Votes Enregistrés</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="text-blue-400" size={16} />
                            <span>Clôture: <strong className="text-white">31 Mars 2026</strong></span>
                        </div>
                    </div>
                </div>

                {/* Success Message Banner */}
                {message && (
                    <div className="mb-10 max-w-xl mx-auto p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center gap-3 text-emerald-400 text-sm font-bold text-center">
                        <CheckCircle2 size={18} /> {message}
                    </div>
                )}

                {/* Voting Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                    {voteData.results.map((player, idx) => {
                        const isVoted = votedPlayerId === player.id;
                        const isLeader = idx === 0 && voteData.totalVotes > 0;

                        return (
                            <div 
                                key={player.id}
                                className={`relative group rounded-3xl transition-all duration-300 overflow-hidden border ${
                                    isLeader 
                                        ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/40 border-amber-500/50 shadow-2xl shadow-amber-500/10' 
                                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                                }`}
                            >
                                {/* Top Rank Ribbon */}
                                {isLeader && (
                                    <div className="absolute top-4 right-4 z-20 px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-full shadow-lg flex items-center gap-1">
                                        <Trophy size={12} /> #1 En Tête
                                    </div>
                                )}

                                {/* Image & Jersey Header */}
                                <div className="relative h-64 overflow-hidden bg-slate-950">
                                    <img 
                                        src={player.image_url || '/Assets/bg2.jpg'} 
                                        alt={player.name} 
                                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                                    
                                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                        <div>
                                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">{player.position}</span>
                                            <h3 className="text-xl font-black text-white uppercase font-display">{player.name}</h3>
                                        </div>
                                        <span className="text-3xl font-black text-white/20 font-mono">#{player.number}</span>
                                    </div>
                                </div>

                                {/* Vote Percent Progress */}
                                <div className="p-6 space-y-5">
                                    <div>
                                        <div className="flex justify-between items-center text-xs font-mono mb-2">
                                            <span className="text-slate-400 font-semibold">{player.vote_count} votes</span>
                                            <span className="text-amber-400 font-black text-sm">{player.percent}%</span>
                                        </div>
                                        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                                            <div 
                                                className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-amber-400 rounded-full transition-all duration-1000"
                                                style={{ width: `${player.percent}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        onClick={() => handleCastVote(player.id)}
                                        disabled={isVoted}
                                        className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                                            isVoted
                                                ? 'bg-emerald-600 text-white cursor-default shadow-lg shadow-emerald-600/20'
                                                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg shadow-blue-600/20 hover:scale-[1.02]'
                                        }`}
                                    >
                                        {isVoted ? (
                                            <>
                                                <CheckCircle2 size={16} /> Vote Enregistré !
                                            </>
                                        ) : (
                                            <>
                                                <ThumbsUp size={16} /> Voter Pour Ce Joueur
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Hall of Fame - Previous Winners */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 max-w-4xl mx-auto backdrop-blur-sm">
                    <h2 className="text-xl font-black uppercase text-white font-display mb-6 flex items-center gap-3">
                        <Star className="text-amber-400" size={20} /> Hall of Fame • Gagnants Précédents
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { month: 'Février 2026', player: 'Sofiane Rahimi', goals: '5 Buts', votes: '42%' },
                            { month: 'Janvier 2026', player: 'Mehdi Benkirane', goals: '4 Passes', votes: '38%' },
                            { month: 'Décembre 2025', player: 'Karim Alaoui', goals: '3 Clean Sheets', votes: '45%' },
                        ].map((w, i) => (
                            <div key={i} className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-1 text-center">
                                <span className="text-[10px] text-amber-400 font-bold uppercase font-mono">{w.month}</span>
                                <h4 className="text-sm font-bold text-white font-display">{w.player}</h4>
                                <p className="text-[11px] text-slate-400">{w.goals} • {w.votes} des voix</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Vote;
