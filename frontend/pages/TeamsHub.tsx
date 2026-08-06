import React, { useState, useEffect, useMemo } from 'react';
import { API, Player } from '../api';
import { ASSETS } from '../constants';
import { Users, Shield, Award, Sparkles, Shirt, Activity } from 'lucide-react';

export const TeamsHub: React.FC = () => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [activeTab, setActiveTab] = useState<'Senior' | 'U21' | 'Women'>('Senior');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.title = 'Équipes & Effectif — US Amal Tiznit';
        API.players.getAll().then((data) => {
            setPlayers(data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const filteredPlayers = useMemo(() => {
        return players.filter(p => (p.team_category || 'Senior') === activeTab);
    }, [players, activeTab]);

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
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* Hero Header */}
                <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-widest">
                        <Users size={14} /> Pôle Sportif • US Amal Tiznit
                    </div>

                    <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight font-display bg-gradient-to-r from-white via-slate-200 to-blue-300 bg-clip-text text-transparent">
                        Toutes Les Équipes du Club
                    </h1>

                    <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                        Découvrez l'ensemble de l'effectif professionnel, le centre de formation U-21 Espoirs et l'équipe féminine d'Ittihad Al-Riyadi Amal Tiznit.
                    </p>
                </div>

                {/* Navigation Tabs */}
                <div className="flex justify-center mb-16">
                    <div className="bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl inline-flex gap-2 shadow-2xl backdrop-blur-md">
                        {[
                            { id: 'Senior', label: 'Équipe Première (Botola Pro)', badge: 'Séniors' },
                            { id: 'U21', label: 'Académie U-21 (Espoirs)', badge: 'Formation' },
                            { id: 'Women', label: 'Équipe Féminine', badge: 'Dames' },
                        ].map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`px-6 py-3 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
                                        isActive
                                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30 scale-[1.02]'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                    }`}
                                >
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Player Grid */}
                {filteredPlayers.length === 0 ? (
                    <div className="text-center py-20 bg-slate-900/40 border border-slate-800 rounded-3xl max-w-xl mx-auto">
                        <Shirt className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-slate-300 uppercase font-display">Aucun Joueur Répertorié</h3>
                        <p className="text-xs text-slate-500 mt-1">L'effectif pour cette catégorie sera mis à jour sous peu.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
                        {filteredPlayers.map((player) => (
                            <div 
                                key={player.id}
                                className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden hover:border-blue-500/50 transition-all duration-300 group hover:-translate-y-1 shadow-xl"
                            >
                                {/* Header Image & Number */}
                                <div className="relative h-72 bg-slate-950 overflow-hidden">
                                    <img 
                                        src={player.image_url || '/Assets/bg2.jpg'} 
                                        alt={player.name} 
                                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                                    
                                    <span className="absolute top-4 right-4 text-4xl font-black text-white/30 font-mono select-none">
                                        #{player.number}
                                    </span>

                                    <div className="absolute bottom-4 left-4 right-4">
                                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
                                            {player.position}
                                        </span>
                                        <h3 className="text-lg font-black text-white uppercase font-display mt-1">{player.name}</h3>
                                    </div>
                                </div>

                                {/* Stats Footer */}
                                <div className="p-5 grid grid-cols-3 gap-2 text-center border-t border-slate-800/80 bg-slate-900/40">
                                    <div>
                                        <span className="text-xs font-mono font-black text-white block">{player.matches_played}</span>
                                        <span className="text-[9px] text-slate-400 uppercase">Matchs</span>
                                    </div>
                                    <div>
                                        <span className="text-xs font-mono font-black text-amber-400 block">{player.goals}</span>
                                        <span className="text-[9px] text-slate-400 uppercase">Buts</span>
                                    </div>
                                    <div>
                                        <span className="text-xs font-mono font-black text-blue-400 block">{player.assists}</span>
                                        <span className="text-[9px] text-slate-400 uppercase">Passes</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Technical Staff Banner */}
                <div className="bg-gradient-to-r from-[#001226] via-slate-900 to-[#001226] border border-slate-800 rounded-3xl p-8 max-w-4xl mx-auto text-center space-y-4">
                    <h3 className="text-lg font-black uppercase text-white font-display flex items-center justify-center gap-2">
                        <Shield className="text-blue-400" size={20} /> Encadrement Technique USAT
                    </h3>
                    <p className="text-xs text-slate-400 max-w-xl mx-auto">
                        Sous la direction sportive du staff technique d'Amal Tiznit, axé sur la rigueur tactique et le développement de la jeunesse de la région Souss-Massa.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default TeamsHub;
