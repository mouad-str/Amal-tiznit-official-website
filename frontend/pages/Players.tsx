
import React, { useState, useEffect } from 'react';
// Added Icons to the imports from constants
import { ASSETS, Icons } from '../constants';
import Modal from '../components/Modal';
import { API, Player as APIPlayer } from '../api';

// Define Interface for Player to include stats (mapped from API)
interface PlayerStats {
    matchesPlayed: number;
    goals: number;
    assists: number;
    minutesPlayed: number;
    yellowCards: number;
    redCards: number;
}

interface Player {
    id: string;
    name: string;
    position: string;
    number: number;
    image: string;
    stats: PlayerStats;
}

const Players: React.FC = () => {
    // State to manage the currently selected player position filter
    const [filter, setFilter] = useState('All');
    // State for the selected player to show details/stats
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    // State for players data
    const [players, setPlayers] = useState<Player[]>([]);
    // Loading state
    const [loading, setLoading] = useState(true);
    // Error state
    const [error, setError] = useState<string | null>(null);

    // Fetch players from API on component mount
    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                setLoading(true);
                const data = await API.players.getAll();
                // Map API response to component format
                const mappedPlayers: Player[] = data.map((p: APIPlayer) => ({
                    id: String(p.id),
                    name: p.name,
                    position: p.position,
                    number: p.number,
                    image: p.image_url,
                    stats: {
                        matchesPlayed: p.matches_played,
                        goals: p.goals,
                        assists: p.assists,
                        minutesPlayed: p.minutes_played,
                        yellowCards: p.yellow_cards,
                        redCards: p.red_cards
                    }
                }));
                setPlayers(mappedPlayers);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch players:', err);
                setError('Failed to load players. Using fallback data.');
                // Fallback to hardcoded data if API fails
                setPlayers([
                    { id: '1', name: 'Karim Alaoui', position: 'Goalkeeper', number: 1, image: 'https://shorturl.at/npQeJ', stats: { matchesPlayed: 18, goals: 0, assists: 1, minutesPlayed: 1620, yellowCards: 1, redCards: 0 } },
                    { id: '2', name: 'Youssef El Amrani', position: 'Defender', number: 4, image: 'https://shorturl.at/7SxIi', stats: { matchesPlayed: 15, goals: 1, assists: 2, minutesPlayed: 1300, yellowCards: 3, redCards: 0 } },
                    { id: '3', name: 'Mehdi Benkirane', position: 'Midfielder', number: 8, image: 'https://shorturl.at/YUsht', stats: { matchesPlayed: 17, goals: 4, assists: 6, minutesPlayed: 1450, yellowCards: 2, redCards: 0 } },
                    { id: '4', name: 'Sofiane Rahimi', position: 'Forward', number: 7, image: 'https://h7.cl/1hBq6', stats: { matchesPlayed: 16, goals: 12, assists: 4, minutesPlayed: 1380, yellowCards: 1, redCards: 0 } },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchPlayers();
    }, []);

    // List of available positions for filtering
    const positions = ['All', 'Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

    // Filter players based on the selected position state
    const filteredPlayers = filter === 'All' ? players : players.filter(p => p.position === filter);

    return (
        <div className="pt-24 min-h-screen bg-transparent overflow-hidden">
            {/* Header */}
            <div className="bg-[#001226] text-white py-24 relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <span className="text-blue-500 font-black text-xs uppercase tracking-[0.5em] mb-4 block animate-slide-up">Season 2025/26</span>
                    <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic mb-4 leading-none animate-slide-up">The <span className="text-blue-500">First</span> Team</h1>
                </div>
                <div className="absolute top-0 right-0 h-full w-1/2 bg-blue-600 skew-x-[-20deg] translate-x-1/2 opacity-10"></div>
                <img src={ASSETS.logo} className="absolute top-1/2 -right-20 -translate-y-1/2 w-80 h-80 opacity-[0.05] grayscale brightness-200 pointer-events-none mt-16" />

            </div>

            <div className="container mx-auto px-4 -mt-10 relative z-20 pb-20">
                {/* Filters */}
                <div className="flex flex-wrap items-center bg-[#2664eb] p-4 shadow-xl mb-12 rounded-sm gap-2 ">
                    <span className="text-[10px] font-black uppercase tracking-widest text-black font-bold fs-12 mr-4 ml-2">Position Filter:</span>
                    {positions.map(pos => (
                        <button
                            key={pos}
                            onClick={() => setFilter(pos)}
                            className={`px-8 py-3 text-[12px] font-black uppercase tracking-widest transition-all ${filter === pos ? 'bg-[#001226] text-white shadow-lg' : 'hover:bg-gray-100 text-black'}`}
                        >
                            {pos}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {filteredPlayers.map((player) => (
                        <div key={player.id} className="group relative bg-[#2664eb] border border-gray-100 shadow-md hover:shadow-2xl transition-all duration-500">
                            <div className="relative aspect-[3/4] overflow-hidden bg-gray-200">
                                <img
                                    src={player.image}
                                    alt={player.name}
                                    className="w-full h-full object-cover grayscale-0 transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
                                />
                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-[#001226] via-transparent to-transparent opacity-60"></div>
                            </div>

                            {/* Jersey Number Badge */}
                            <div className="absolute top-6 left-6 bg-blue-600 text-white w-14 h-14 flex flex-col items-center justify-center font-black italic shadow-2xl skew-x-[-10deg]">
                                <span className="text-2xl skew-x-[10deg]">{player.number}</span>
                            </div>

                            {/* Card Info */}
                            <div className="p-8 relative">
                                <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] mb-2 block">{player.position}</span>
                                <h3 className="text-2xl font-black uppercase tracking-tighter text-[#001226] leading-none mb-4 group-hover:text-blue-600 transition-colors italic">{player.name}</h3>
                                <div className="h-1 w-10 bg-gray-100 group-hover:w-full transition-all duration-500"></div>
                            </div>

                            {/* Hover Reveal Details */}
                            <div className="absolute inset-0 bg-transparent blue-600/95 p-10 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-sm border-t-8 border-white">
                                <div className="flex justify-between items-start">
                                    <span className="text-8xl font-black text-black/30 italic leading-none">#{player.number}</span>
                                    <div className=" p-2 rounded-sm text-black">
                                        <Icons.Ball />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-3xl font-black text-white uppercase italic leading-tight mb-6">{player.name}</h4>
                                    <div className="space-y-4 mb-8">
                                        <div className="flex justify-between border-b border-white/20 pb-2">
                                            <span className="text-[10px] font-bold uppercase text-blue-200">Position</span>
                                            <span className="text-xs font-black text-white uppercase">{player.position}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-white/20 pb-2">
                                            <span className="text-[10px] font-bold uppercase text-blue-200">Nationality</span>
                                            <span className="text-xs font-black text-white uppercase">Moroccan</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedPlayer(player)}
                                        className="w-full py-4 bg-black text-blue-600 font-black text-[10px] uppercase tracking-widest hover:bg-navy hover:text-white transition-colors"
                                    >
                                        Player Statistics
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Statistics Modal */}
            <Modal
                isOpen={!!selectedPlayer}
                onClose={() => setSelectedPlayer(null)}
                title={`${selectedPlayer?.name} - Statistics`}
            >
                {selectedPlayer && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="bg-gray-50 p-6 rounded-sm text-center border-b-2 border-blue-600">
                            <span className="block text-4xl font-black text-[#001226] italic mb-1">{selectedPlayer.stats.matchesPlayed}</span>
                            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Matches Played</span>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-sm text-center border-b-2 border-blue-600">
                            <span className="block text-4xl font-black text-[#001226] italic mb-1">{selectedPlayer.stats.goals}</span>
                            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Goals</span>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-sm text-center border-b-2 border-blue-600">
                            <span className="block text-4xl font-black text-[#001226] italic mb-1">{selectedPlayer.stats.assists}</span>
                            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Assists</span>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-sm text-center border-b-2 border-blue-600">
                            <span className="block text-4xl font-black text-[#001226] italic mb-1">{selectedPlayer.stats.minutesPlayed}'</span>
                            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Minutes Played</span>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-sm text-center border-b-2 border-yellow-400">
                            <span className="block text-4xl font-black text-[#001226] italic mb-1">{selectedPlayer.stats.yellowCards}</span>
                            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Yellow Cards</span>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-sm text-center border-b-2 border-red-600">
                            <span className="block text-4xl font-black text-[#001226] italic mb-1">{selectedPlayer.stats.redCards}</span>
                            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Red Cards</span>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Players;
