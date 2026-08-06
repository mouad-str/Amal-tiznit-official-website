import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    Search, 
    Clock, 
    Share2, 
    Bookmark, 
    TrendingUp, 
    Mail, 
    Check, 
    X, 
    ChevronRight, 
    Filter, 
    Sparkles, 
    BookOpen,
    ArrowRight,
    CheckCircle2
} from 'lucide-react';
import { API, NewsArticle } from '../api';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const News: React.FC = () => {
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter & Search states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    
    // Interactive states
    const [savedIds, setSavedIds] = useState<number[]>(() => {
        try {
            const local = localStorage.getItem('amal_news_bookmarks');
            return local ? JSON.parse(local) : [];
        } catch {
            return [];
        }
    });
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);
    const [visibleCount, setVisibleCount] = useState(7);

    useEffect(() => {
        document.title = "Official News & Press | US Amal Tiznit";
        const fetchNews = async () => {
            try {
                const data = await API.news.getAll();
                setArticles(data);
            } catch (err) {
                setError('Failed to load news articles');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    // Save bookmarks to localStorage
    useEffect(() => {
        try {
            localStorage.setItem('amal_news_bookmarks', JSON.stringify(savedIds));
        } catch (e) {
            console.error('Failed to save bookmarks:', e);
        }
    }, [savedIds]);

    const toggleBookmark = (e: React.MouseEvent, id: number) => {
        e.preventDefault();
        e.stopPropagation();
        setSavedIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleShare = (e: React.MouseEvent, article: NewsArticle) => {
        e.preventDefault();
        e.stopPropagation();
        const url = `${window.location.origin}/news/${article.id}`;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url);
            setCopiedId(article.id);
            setTimeout(() => setCopiedId(null), 2500);
        }
    };

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (newsletterEmail.trim()) {
            setSubscribed(true);
            setNewsletterEmail('');
            setTimeout(() => setSubscribed(false), 5000);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const estimateReadTime = (text: string) => {
        const words = text ? text.trim().split(/\s+/).length : 0;
        const minutes = Math.max(2, Math.ceil(words / 25));
        return `${minutes} min read`;
    };

    // Dynamic categories
    const categories = ['All', ...Array.from(new Set(articles.map(a => a.category).filter(Boolean)))];

    // Filtered articles logic
    const filteredArticles = articles.filter(article => {
        const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
        const query = searchTerm.toLowerCase();
        const matchesSearch = !searchTerm || 
            article.title.toLowerCase().includes(query) || 
            article.description.toLowerCase().includes(query) ||
            (article.category && article.category.toLowerCase().includes(query));
        return matchesCategory && matchesSearch;
    });

    const featuredArticle = filteredArticles[0];
    const gridArticles = filteredArticles.slice(1, visibleCount);
    const trendingArticles = articles.slice(0, 4);

    return (
        <div className="pt-24 pb-20 min-h-screen bg-transparent">
            {/* Header Title Section */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
                    <div>
                        <div className="flex items-center space-x-3 mb-3 pt-10">
                            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                            <span className="text-blue-500 font-bold text-xs uppercase tracking-[0.4em]">Official Press & Media</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white font-display">
                            Club <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-amber-400">Archive</span>
                        </h1>
                        <p className="text-gray-400 mt-2 text-sm md:text-base max-w-xl">
                            Stay up-to-date with official match reports, transfer updates, press releases, and exclusive interviews from US Amal Tiznit.
                        </p>
                    </div>

                    <div className="flex items-center space-x-3 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl backdrop-blur-md">
                        <BookOpen className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-gray-300 font-medium">
                            Total Articles: <strong className="text-white font-bold">{filteredArticles.length}</strong>
                        </span>
                        {savedIds.length > 0 && (
                            <span className="ml-2 pl-3 border-l border-white/10 text-xs text-amber-400 font-semibold flex items-center gap-1">
                                <Bookmark className="w-3.5 h-3.5 fill-amber-400" />
                                {savedIds.length} Saved
                            </span>
                        )}
                    </div>
                </div>

                {/* Filter and Search Toolbar */}
                <div className="mt-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search headlines, news, transfers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#0B1528]/80 border border-white/10 rounded-xl pl-11 pr-10 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/50 transition-all"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                        <Filter className="w-4 h-4 text-gray-400 hidden sm:block mr-1 flex-shrink-0" />
                        {categories.map((cat) => {
                            const active = selectedCategory === cat;
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex-shrink-0 whitespace-nowrap border ${
                                        active
                                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/30'
                                            : 'bg-[#0B1528]/60 border-white/10 text-gray-400 hover:text-white hover:border-white/25 hover:bg-white/5'
                                    }`}
                                >
                                    {cat}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Skeleton Loading State */}
            {loading && (
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Featured Article Skeleton */}
                    <div className="w-full h-[480px] bg-white/5 animate-pulse rounded-2xl border border-white/10 mb-12 p-8 flex flex-col justify-end">
                        <div className="h-6 w-24 bg-white/10 rounded-md mb-4"></div>
                        <div className="h-10 w-3/4 bg-white/10 rounded-md mb-4"></div>
                        <div className="h-4 w-1/2 bg-white/10 rounded-md"></div>
                    </div>
                    {/* Secondary Cards Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-80 bg-white/5 animate-pulse rounded-xl border border-white/10"></div>
                        ))}
                    </div>
                </div>
            )}

            {/* Error or Empty State */}
            {!loading && (error || filteredArticles.length === 0) && (
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                    <div className="max-w-md mx-auto bg-[#0B1528]/80 border border-white/10 rounded-2xl p-10 backdrop-blur-xl">
                        <BookOpen className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Articles Found</h3>
                        <p className="text-gray-400 text-sm mb-6">
                            {searchTerm || selectedCategory !== 'All' 
                                ? `We couldn't find any articles matching your search criteria.`
                                : error || 'No news articles available at the moment.'}
                        </p>
                        {(searchTerm || selectedCategory !== 'All') && (
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
                            >
                                Reset Filters
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            {!loading && filteredArticles.length > 0 && (
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {/* HERO FEATURED ARTICLE */}
                    {featuredArticle && (
                        <div className="mb-14">
                            <div className="group relative rounded-2xl overflow-hidden border border-white/10 bg-[#0B1528] shadow-2xl transition-all duration-500 hover:border-blue-500/40">
                                <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
                                    {/* Image Column */}
                                    <div className="lg:col-span-7 relative overflow-hidden min-h-[320px] lg:min-h-full">
                                        <img 
                                            src={featuredArticle.image_url} 
                                            alt={featuredArticle.title}
                                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#0B1528]"></div>
                                        
                                        {/* Floating Badge */}
                                        <div className="absolute top-4 left-4 flex items-center space-x-2">
                                            <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider shadow-lg">
                                                Featured Story
                                            </span>
                                            {featuredArticle.category && (
                                                <span className="bg-white/10 backdrop-blur-md text-gray-200 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border border-white/10">
                                                    {featuredArticle.category}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content Column */}
                                    <div className="lg:col-span-5 p-8 lg:p-10 flex flex-col justify-between relative bg-[#0B1528]">
                                        <div>
                                            <div className="flex items-center space-x-4 text-xs font-semibold text-gray-400 mb-4">
                                                <span className="flex items-center gap-1.5 text-blue-400">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {estimateReadTime(featuredArticle.description)}
                                                </span>
                                                <span>•</span>
                                                <span>{formatDate(featuredArticle.published_at)}</span>
                                            </div>

                                            <Link to={`/news/${featuredArticle.id}`}>
                                                <h2 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-tight leading-snug mb-4 group-hover:text-blue-400 transition-colors">
                                                    {featuredArticle.title}
                                                </h2>
                                            </Link>

                                            <p className="text-gray-300 text-sm leading-relaxed mb-6 line-clamp-4">
                                                {featuredArticle.description}
                                            </p>
                                        </div>

                                        <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                                            <Link to={`/news/${featuredArticle.id}`}>
                                                <Button variant="primary" size="md" className="gap-2">
                                                    Read Story 
                                                </Button>
                                            </Link>

                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={(e) => handleShare(e, featuredArticle)}
                                                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all relative"
                                                    title="Share Story"
                                                >
                                                    <Share2 className="w-4 h-4" />
                                                    {copiedId === featuredArticle.id && (
                                                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap">
                                                            Link Copied!
                                                        </span>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={(e) => toggleBookmark(e, featuredArticle.id)}
                                                    className={`p-2.5 rounded-xl border transition-all ${
                                                        savedIds.includes(featuredArticle.id)
                                                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                                                            : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
                                                    }`}
                                                    title={savedIds.includes(featuredArticle.id) ? "Remove Bookmark" : "Save Article"}
                                                >
                                                    <Bookmark className={`w-4 h-4 ${savedIds.includes(featuredArticle.id) ? 'fill-amber-400' : ''}`} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TWO-COLUMN GRID & SIDEBAR SECTION */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* LEFT: Secondary Articles Grid */}
                        <div className="lg:col-span-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-blue-400" />
                                    Latest Headlines
                                </h3>
                                <span className="text-xs text-gray-400 font-mono">
                                    Showing {gridArticles.length + (featuredArticle ? 1 : 0)} of {filteredArticles.length}
                                </span>
                            </div>

                            {gridArticles.length === 0 ? (
                                <p className="text-gray-400 text-sm italic py-8 border border-dashed border-white/10 rounded-xl text-center">
                                    No additional stories in this category.
                                </p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {gridArticles.map((article) => {
                                        const isSaved = savedIds.includes(article.id);
                                        return (
                                            <div 
                                                key={article.id}
                                                className="group flex flex-col justify-between bg-[#0B1528]/80 border border-white/10 hover:border-blue-500/30 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-lg"
                                            >
                                                <div>
                                                    {/* Card Image */}
                                                    <div className="relative aspect-[16/9] overflow-hidden bg-black/40">
                                                        <img 
                                                            src={article.image_url} 
                                                            alt={article.title}
                                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        />
                                                        <div className="absolute top-3 left-3 flex items-center gap-2">
                                                            <span className="bg-[#0B1528]/90 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wider backdrop-blur-md">
                                                                {article.category || 'News'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Card Body */}
                                                    <div className="p-5">
                                                        <div className="flex items-center justify-between text-[11px] text-gray-400 mb-2 font-medium">
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3 text-blue-400" />
                                                                {estimateReadTime(article.description)}
                                                            </span>
                                                            <span>{formatDate(article.published_at)}</span>
                                                        </div>

                                                        <Link to={`/news/${article.id}`}>
                                                            <h4 className="text-lg font-bold text-white uppercase tracking-tight leading-snug mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                                                                {article.title}
                                                            </h4>
                                                        </Link>

                                                        <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 mb-4">
                                                            {article.description}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Card Footer Actions */}
                                                <div className="p-5 pt-0 flex items-center justify-between border-t border-white/5 mt-auto">
                                                    <Link 
                                                        to={`/news/${article.id}`}
                                                        className="text-xs font-bold uppercase tracking-wider text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                                    >
                                                        Read Full <ChevronRight className="w-3.5 h-3.5" />
                                                    </Link>

                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={(e) => handleShare(e, article)}
                                                            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors relative"
                                                            title="Share"
                                                        >
                                                            <Share2 className="w-3.5 h-3.5" />
                                                            {copiedId === article.id && (
                                                                <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                                                                    Copied
                                                                </span>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={(e) => toggleBookmark(e, article.id)}
                                                            className={`p-1.5 rounded-lg transition-colors ${
                                                                isSaved ? 'text-amber-400 bg-amber-400/10' : 'text-gray-400 hover:text-white hover:bg-white/5'
                                                            }`}
                                                            title={isSaved ? "Saved" : "Save"}
                                                        >
                                                            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-400' : ''}`} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Load More Pagination */}
                            {filteredArticles.length > visibleCount && (
                                <div className="mt-10 text-center">
                                    <button
                                        onClick={() => setVisibleCount(prev => prev + 6)}
                                        className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/50 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all backdrop-blur-md shadow-lg"
                                    >
                                        Load More Stories ({filteredArticles.length - visibleCount} remaining)
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* RIGHT: Trending & Press Release Sidebar */}
                        <div className="lg:col-span-4 space-y-8">
                            {/* Trending Stories Box */}
                            <div className="bg-[#0B1528]/90 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
                                <div className="flex items-center space-x-2 border-b border-white/10 pb-4 mb-6">
                                    <TrendingUp className="w-5 h-5 text-amber-400" />
                                    <h3 className="text-base font-bold text-white uppercase tracking-wider">
                                        Trending Stories
                                    </h3>
                                </div>

                                <div className="space-y-4">
                                    {trendingArticles.map((tArticle, idx) => (
                                        <Link 
                                            key={tArticle.id}
                                            to={`/news/${tArticle.id}`}
                                            className="group flex items-start gap-4 p-2.5 rounded-xl hover:bg-white/5 transition-all"
                                        >
                                            <span className="font-display font-black text-2xl text-blue-500/40 group-hover:text-amber-400 transition-colors w-6">
                                                0{idx + 1}
                                            </span>
                                            <div className="flex-1">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                                                    {tArticle.category}
                                                </span>
                                                <h5 className="text-sm font-bold text-gray-200 group-hover:text-white uppercase leading-snug transition-colors line-clamp-2">
                                                    {tArticle.title}
                                                </h5>
                                                <span className="text-[10px] text-gray-500 mt-1 block">
                                                    {formatDate(tArticle.published_at)}
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Official Club Notice / Media Kit Box */}
                            <div className="bg-gradient-to-br from-blue-900/40 to-slate-900/90 border border-blue-500/20 rounded-2xl p-6 shadow-xl">
                                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider mb-3 inline-block">
                                    Media & Press Enquiries
                                </span>
                                <h4 className="text-lg font-black text-white uppercase mb-2">
                                    Official Press Kit
                                </h4>
                                <p className="text-gray-300 text-xs leading-relaxed mb-4">
                                    For official accreditation, matchday photography requests, or press statement verification, please contact our communications desk.
                                </p>
                                <Link to="/contact">
                                    <span className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 gap-1">
                                        Contact Media Team <ArrowRight className="w-3.5 h-3.5" />
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* NEWSLETTER SUBSCRIPTION BANNER */}
                    <div className="mt-20">
                        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-950 via-[#0B1528] to-slate-950 border border-blue-500/30 p-8 md:p-12 shadow-2xl">
                            <div className="relative z-10 max-w-2xl mx-auto text-center">
                                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center mx-auto mb-4">
                                    <Mail className="w-6 h-6 text-blue-400" />
                                </div>

                                <h3 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight mb-3">
                                    Never Miss A <span className="text-blue-400">Matchday Story</span>
                                </h3>

                                <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-8">
                                    Subscribe to the official US Amal Tiznit newsletter and get breaking club news, transfer updates, and post-match analysis delivered directly to your inbox.
                                </p>

                                {subscribed ? (
                                    <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-6 py-3 rounded-xl text-sm font-bold animate-fade-in">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                        Thank you! You are now subscribed to Amal Tiznit Official News.
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                                        <input 
                                            type="email"
                                            required
                                            placeholder="Enter your email address..."
                                            value={newsletterEmail}
                                            onChange={(e) => setNewsletterEmail(e.target.value)}
                                            className="flex-1 bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                        />
                                        <Button type="submit" variant="primary" size="md" className="whitespace-nowrap">
                                            Subscribe
                                        </Button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default News;
