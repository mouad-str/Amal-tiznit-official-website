import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Newspaper, Users, Calendar, ShoppingBag, ArrowRight, CornerDownLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API, NewsArticle, Player, Match, Product } from '../api';

interface GlobalSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [players, setPlayers] = useState<Player[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    // Fetch data when modal opens
    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            Promise.all([
                API.news.getAll().catch(() => []),
                API.players.getAll().catch(() => []),
                API.matches.getAll().catch(() => []),
                API.shop.getAll().catch(() => [])
            ]).then(([newsData, playersData, matchesData, productsData]) => {
                setNews(newsData);
                setPlayers(playersData);
                setMatches(matchesData);
                setProducts(productsData);
            }).finally(() => {
                setLoading(false);
            });

            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Keydown ESC handler
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const trimmed = query.trim().toLowerCase();

    const filteredNews = trimmed ? news.filter(n => 
        n.title.toLowerCase().includes(trimmed) || 
        n.description.toLowerCase().includes(trimmed) ||
        (n.category && n.category.toLowerCase().includes(trimmed))
    ).slice(0, 4) : [];

    const filteredPlayers = trimmed ? players.filter(p => 
        p.name.toLowerCase().includes(trimmed) || 
        p.position.toLowerCase().includes(trimmed) ||
        (p.nationality && p.nationality.toLowerCase().includes(trimmed))
    ).slice(0, 4) : [];

    const filteredMatches = trimmed ? matches.filter(m => 
        m.opponent.toLowerCase().includes(trimmed) || 
        m.stadium.toLowerCase().includes(trimmed)
    ).slice(0, 3) : [];

    const filteredProducts = trimmed ? products.filter(pr => 
        pr.name.toLowerCase().includes(trimmed) || 
        (pr.category && pr.category.toLowerCase().includes(trimmed))
    ).slice(0, 4) : [];

    const totalResults = filteredNews.length + filteredPlayers.length + filteredMatches.length + filteredProducts.length;

    const handleSelect = (path: string) => {
        onClose();
        setQuery('');
        navigate(path);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            {/* Modal Box */}
            <div className="relative bg-[#0B1528] border border-white/15 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden z-10">
                {/* Search Bar Input */}
                <div className="relative border-b border-white/10 p-4 flex items-center gap-3">
                    <Search className="w-5 h-5 text-blue-400 shrink-0" />
                    <input 
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search news, players, matches, shop merchandise..."
                        className="w-full bg-transparent text-white placeholder-gray-400 text-base sm:text-lg focus:outline-none font-medium"
                    />
                    {query ? (
                        <button 
                            onClick={() => setQuery('')}
                            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    ) : (
                        <kbd className="hidden sm:inline-block text-[10px] font-mono text-gray-400 bg-white/5 border border-white/10 px-2 py-1 rounded">
                            ESC
                        </kbd>
                    )}
                </div>

                {/* Search Results Body */}
                <div className="p-4 max-h-[60vh] overflow-y-auto space-y-6">
                    {loading && (
                        <div className="py-8 text-center text-gray-400 text-sm animate-pulse">
                            Searching official club database...
                        </div>
                    )}

                    {!loading && !trimmed && (
                        <div className="py-8 text-center text-gray-400">
                            <Search className="w-8 h-8 mx-auto mb-2 text-blue-400/50" />
                            <p className="text-sm font-medium text-gray-300">Type to search across the entire website</p>
                            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
                                <span className="text-gray-500">Popular:</span>
                                {['Match', 'Jersey', 'Forward', 'Tickets', 'Transfers'].map((term) => (
                                    <button 
                                        key={term} 
                                        onClick={() => setQuery(term)}
                                        className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white px-2.5 py-1 rounded-lg transition-all"
                                    >
                                        {term}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {!loading && trimmed && totalResults === 0 && (
                        <div className="py-10 text-center text-gray-400">
                            <p className="text-base text-white font-bold">No results found for "{query}"</p>
                            <p className="text-xs text-gray-400 mt-1">Try checking spelling or search for players, jerseys, or news.</p>
                        </div>
                    )}

                    {/* NEWS RESULTS */}
                    {!loading && filteredNews.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 mb-2.5">
                                <Newspaper className="w-4 h-4" />
                                News & Press ({filteredNews.length})
                            </div>
                            <div className="space-y-1.5">
                                {filteredNews.map(item => (
                                    <div 
                                        key={item.id}
                                        onClick={() => handleSelect(`/news/${item.id}`)}
                                        className="group p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <img src={item.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                            <div>
                                                <h5 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                                                    {item.title}
                                                </h5>
                                                <span className="text-[11px] text-gray-400 line-clamp-1">{item.description}</span>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors shrink-0" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PLAYERS RESULTS */}
                    {!loading && filteredPlayers.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-2.5">
                                <Users className="w-4 h-4" />
                                Players & Squad ({filteredPlayers.length})
                            </div>
                            <div className="space-y-1.5">
                                {filteredPlayers.map(player => (
                                    <div 
                                        key={player.id}
                                        onClick={() => handleSelect(`/players`)}
                                        className="group p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <img src={player.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                            <div>
                                                <h5 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                                                    #{player.number} {player.name}
                                                </h5>
                                                <span className="text-[11px] text-gray-400">{player.position} • {player.nationality}</span>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-amber-400 transition-colors shrink-0" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* MATCHES RESULTS */}
                    {!loading && filteredMatches.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2.5">
                                <Calendar className="w-4 h-4" />
                                Fixtures & Matches ({filteredMatches.length})
                            </div>
                            <div className="space-y-1.5">
                                {filteredMatches.map(match => (
                                    <div 
                                        key={match.id}
                                        onClick={() => handleSelect(`/matches`)}
                                        className="group p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer flex items-center justify-between"
                                    >
                                        <div>
                                            <h5 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                                                US Amal Tiznit vs {match.opponent}
                                            </h5>
                                            <span className="text-[11px] text-gray-400">
                                                {match.stadium} • {new Date(match.match_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 transition-colors shrink-0" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SHOP RESULTS */}
                    {!loading && filteredProducts.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400 mb-2.5">
                                <ShoppingBag className="w-4 h-4" />
                                Official Shop Merchandise ({filteredProducts.length})
                            </div>
                            <div className="space-y-1.5">
                                {filteredProducts.map(prod => (
                                    <div 
                                        key={prod.id}
                                        onClick={() => handleSelect(`/shop`)}
                                        className="group p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <img src={prod.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                            <div>
                                                <h5 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                                                    {prod.name}
                                                </h5>
                                                <span className="text-[11px] text-amber-400 font-mono font-bold">{prod.price} MAD</span>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors shrink-0" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Tip */}
                <div className="p-3 bg-white/5 border-t border-white/10 text-[11px] text-gray-400 flex items-center justify-between">
                    <span>Searching official US Amal Tiznit database</span>
                    <span className="flex items-center gap-1 font-mono text-gray-400">
                        Press <CornerDownLeft className="w-3 h-3 text-blue-400" /> to select
                    </span>
                </div>
            </div>
        </div>
    );
};

export default GlobalSearchModal;
