
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API, NewsArticle } from '../api';

const News: React.FC = () => {
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
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

    // Format date helper
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="pt-24 min-h-screen bg-transparent flex items-center justify-center">
                <div className="text-white text-xl">Loading news...</div>
            </div>
        );
    }

    if (error || articles.length === 0) {
        return (
            <div className="pt-24 min-h-screen bg-transparent flex items-center justify-center">
                <div className="text-gray-400 text-xl">{error || 'No news articles available'}</div>
            </div>
        );
    }

    return (
        <div className="pt-24 min-h-screen bg-transparent">
            <div className="container mx-auto px-4 py-16">
                <span className="text-blue-600 font-black text-xs uppercase tracking-[0.5em] mb-4 block">Official Press</span>
                <h1 className="text-6xl font-black uppercase tracking-tighter text-white mb-12 leading-none">Digital <span className="text-blue-500">Archive</span></h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    {/* Feature Article */}
                    <Link to={`/news/${articles[0].id}`} className="col-span-1 md:col-span-2 relative h-[600px] overflow-hidden group cursor-pointer rounded-sm shadow-2xl block">
                        <img src={articles[0].image_url} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#001226] via-transparent to-transparent p-12 flex flex-col justify-end">
                            <span className="bg-blue-600 text-white px-5 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] w-fit mb-6 shadow-lg">{articles[0].category}</span>
                            <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-6 max-w-4xl leading-none">{articles[0].title}</h2>
                            <p className="text-gray-300 max-w-2xl text-lg mb-8 line-clamp-2 leading-relaxed font-medium">{articles[0].description}</p>
                            <p className="text-blue-500 font-black text-xs uppercase tracking-widest">{formatDate(articles[0].published_at)}</p>
                        </div>
                    </Link>

                    {/* Sub Articles */}
                    {articles.slice(1).map((article) => (
                        <Link to={`/news/${article.id}`} key={article.id} className="flex flex-col md:flex-row gap-8 group block">
                            <div className="w-full md:w-72 h-52 flex-shrink-0 overflow-hidden rounded-sm shadow-lg">
                                <img src={article.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            </div>
                            <div className="flex flex-col justify-center">
                                <span className="text-blue-600 text-[10px] font-black uppercase tracking-widest mb-3">{article.category}</span>
                                <h3 className="text-2xl font-black text-white mb-4 group-hover:text-blue-600 transition-colors uppercase leading-tight tracking-tighter">{article.title}</h3>
                                <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">{article.description}</p>
                                <div className="flex items-center space-x-4">
                                    <div className="h-px w-10 bg-gray-100"></div>
                                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{formatDate(article.published_at)}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default News;
