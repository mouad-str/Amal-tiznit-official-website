import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API, NewsArticle } from '../api';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';

const NewsDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [article, setArticle] = useState<NewsArticle | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchArticle = async () => {
            if (!id) return;
            try {
                // Since the real API might not support getById perfectly yet or we want to be safe
                // We'll try to fetch it.
                const data = await API.news.getById(parseInt(id));
                setArticle(data);
            } catch (err) {
                console.error('Failed to load article:', err);
                setError('Article not found');
            } finally {
                setLoading(false);
            }
        };
        fetchArticle();
    }, [id]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="pt-32 min-h-screen bg-transparent flex items-center justify-center">
                <div className="text-white text-xl animate-pulse">Loading article...</div>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="pt-32 min-h-screen bg-transparent flex flex-col items-center justify-center text-white">
                <div className="text-2xl font-bold mb-4">Article not found</div>
                <Link to="/news" className="text-blue-500 hover:text-blue-400 flex items-center gap-2">
                    <ArrowLeft size={20} /> Back to News
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent pt-32 pb-20">
            {/* Hero Image */}
            <div className="relative h-[60vh] w-full overflow-hidden mb-12">
                <div className="absolute inset-0 bg-gradient-to-t from-[#001226] via-[#001226]/50 to-transparent z-10"></div>
                <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-full h-full object-cover fixed top-0 left-0 -z-10 brightness-50"
                />

                <div className="absolute bottom-0 left-0 w-full z-20 pb-12">
                    <div className="container mx-auto px-4">
                        <Link to="/news" className="inline-flex items-center text-blue-400 hover:text-white mb-6 transition-colors text-sm font-bold uppercase tracking-widest">
                            <ArrowLeft size={16} className="mr-2" /> Back to News
                        </Link>
                        <span className="bg-blue-600 text-white px-4 py-1 text-[10px] font-black uppercase tracking-widest w-fit block mb-4">
                            {article.category}
                        </span>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tighter leading-none mb-6">
                            {article.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-6 text-gray-300 text-sm">
                            <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-blue-500" />
                                <span>{formatDate(article.published_at)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User size={16} className="text-blue-500" />
                                <span>Media Team</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-sm rounded-lg p-8 md:p-12 border border-white/10 shadow-2xl">
                    <div className="prose prose-lg prose-invert max-w-none">
                        <p className="text-xl text-gray-300 leading-relaxed font-light mb-8 border-l-4 border-blue-600 pl-6 italic">
                            {article.description}
                        </p>
                        <div className="text-gray-400 leading-relaxed space-y-6">
                            {/* Since the API currently only provides a description, we'll repeat it or use placeholder content for the body if real content isn't available yet. 
                                Ideally, the API would return a separate 'content' field. For now, we simulate a full article. */}
                            <p>
                                {article.description}
                            </p>
                            <p>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                            </p>
                            <p>
                                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                            </p>
                        </div>
                    </div>

                    {/* Tags/Share */}
                    <div className="mt-12 pt-8 border-t border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Tag size={16} />
                            <span className="text-sm uppercase tracking-wider">{article.category}</span>
                        </div>
                        <div className="flex gap-4">
                            {/* Social share buttons could go here */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewsDetail;
