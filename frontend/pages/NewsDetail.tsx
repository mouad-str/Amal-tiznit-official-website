import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { API, NewsArticle } from '../api';
import { ArrowLeft, Calendar, User, Tag, Share2, Copy, Check, ArrowRight } from 'lucide-react';

const NewsDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [article, setArticle] = useState<NewsArticle | null>(null);
    const [relatedArticles, setRelatedArticles] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchArticleAndRelated = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await API.news.getById(parseInt(id));
                setArticle(data);
                
                // Fetch all news to find related ones in the same category
                const allNews = await API.news.getAll();
                const filtered = allNews
                    .filter((item) => item.id !== data.id)
                    .slice(0, 3);
                setRelatedArticles(filtered);
            } catch (err) {
                console.error('Failed to load article:', err);
                setError('Article introuvable');
            } finally {
                setLoading(false);
            }
        };
        fetchArticleAndRelated();
    }, [id]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="pt-32 min-h-screen bg-[#040914] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-gray-400 text-sm uppercase tracking-widest animate-pulse">Chargement de l'article...</div>
                </div>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="pt-32 min-h-screen bg-[#040914] flex flex-col items-center justify-center text-white px-4">
                <div className="text-2xl font-bold mb-4 font-display">ARTICLE INTROUVABLE</div>
                <p className="text-gray-400 text-sm mb-6 text-center">L'article que vous cherchez n'existe pas ou a été déplacé.</p>
                <Link to="/news" className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl flex items-center gap-2 transition-all">
                    <ArrowLeft size={16} /> Retour aux actualités
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#040914] text-[#F8FAFC]">
            {/* Hero Image Section */}
            <div className="relative h-[65vh] w-full overflow-hidden">
                {/* Background Parallax Image with Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#040914] via-[#040914]/40 to-transparent z-10"></div>
                <img
                    src={article.image_url || '/Assets/bg2.jpg'}
                    alt={article.title}
                    className="w-full h-full object-cover brightness-50"
                />

                {/* Article Header info */}
                <div className="absolute bottom-0 left-0 w-full z-20 pb-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <Link 
                            to="/news" 
                            className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors text-xs font-bold uppercase tracking-widest bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md"
                        >
                            <ArrowLeft size={14} className="mr-2" /> Retour aux Actualités
                        </Link>
                        
                        <div className="flex items-center gap-2 mb-4">
                            <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                                {article.category || 'CLUB'}
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tighter leading-tight mb-6 max-w-4xl font-display">
                            {article.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-gray-300 text-xs font-semibold uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-amber-400" />
                                <span>{formatDate(article.published_at)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User size={14} className="text-amber-400" />
                                <span>Équipe Média USAT</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                    
                    {/* Main Article Body */}
                    <div className="lg:col-span-2 bg-[#0E182A]/90 border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-md">
                        <div className="prose prose-invert max-w-none">
                            {/* Rich Content formatted with newlines support */}
                            <div className="text-gray-300 leading-relaxed whitespace-pre-line text-sm sm:text-base font-medium space-y-6">
                                {article.description}
                            </div>
                        </div>

                        {/* Article Sharing Footer */}
                        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-gray-400">
                                <Tag size={16} className="text-amber-400" />
                                <span className="text-xs uppercase tracking-wider font-bold">Catégorie: {article.category || 'CLUB'}</span>
                            </div>
                            
                            <button
                                onClick={handleCopyLink}
                                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl transition-all cursor-pointer text-gray-300 hover:text-white"
                            >
                                {copied ? (
                                    <>
                                        <Check size={14} className="text-emerald-400 animate-bounce" />
                                        <span className="text-emerald-400">Lien copié !</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy size={14} />
                                        <span>Partager l'article</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Sidebar / Additional Info Info Box */}
                    <div className="space-y-8">
                        <div className="bg-gradient-to-br from-[#002D62] to-[#0E182A] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                            {/* Absolute watermark */}
                            <div className="absolute right-0 bottom-0 text-8xl font-black font-mono text-white/5 select-none pointer-events-none">
                                USAT
                            </div>

                            <h3 className="text-lg font-bold text-white uppercase tracking-tight mb-3 font-display">Ittihad Amal Tiznit</h3>
                            <p className="text-xs text-gray-300 leading-relaxed mb-6">
                                Retrouvez toutes les actualités, coulisses, communiqués et résultats officiels du club de la ville d'argent.
                            </p>
                            <Link 
                                to="/news" 
                                className="inline-flex items-center gap-2 text-xs font-black text-amber-300 hover:text-amber-400 transition-colors uppercase tracking-wider group"
                            >
                                Toutes les actualités <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>

                </div>

                {/* Related Articles Section */}
                {relatedArticles.length > 0 && (
                    <div className="mt-20 pt-12 border-t border-white/10">
                        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-8 font-display">
                            Actualités <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-amber-400">Similaires</span>
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {relatedArticles.map((item) => (
                                <div 
                                    key={item.id}
                                    onClick={() => navigate(`/news/${item.id}`)}
                                    className="group bg-[#0E182A]/80 border border-white/10 hover:border-blue-500/30 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-lg cursor-pointer flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                                            <img 
                                                src={item.image_url || '/Assets/bg2.jpg'} 
                                                alt={item.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute top-4 left-4">
                                                <span className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded">
                                                    {item.category || 'CLUB'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-5">
                                            <span className="text-gray-500 text-[10px] uppercase font-bold block mb-1">
                                                {new Date(item.published_at).toLocaleDateString('fr-FR')}
                                            </span>
                                            <h3 className="text-sm font-bold text-white uppercase group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                                                {item.title}
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="p-5 pt-0">
                                        <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider inline-flex items-center gap-1 group-hover:text-amber-400 transition-colors">
                                            Lire l'article <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default NewsDetail;
