
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// Added Icons to the imports from constants
import { ASSETS, Icons } from '../constants';
import { API, NewsArticle } from '../api';

const Home: React.FC = () => {
  const [latestNews, setLatestNews] = useState<NewsArticle[]>([]);

  useEffect(() => {
    document.title = "Amal Tiznit | Official Website";
    const fetchLatestNews = async () => {
      try {
        const data = await API.news.getAll();
        // Get latest 3 articles
        setLatestNews(data.slice(0, 3));
      } catch (err) {
        console.error('Failed to load latest news:', err);
      }
    };
    fetchLatestNews();
  }, []);

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      {/* Displays the main landing visual with background image and key call-to-actions */}
      <section className="relative h-screen flex items-center justify-center hero-gradient text-white">
        <div className="hero-image"></div>
        <div className="hero-overlay"></div>

        <div className="container mx-auto px-4 text-center z-10 animate-slide-up">
          {/* Live match indicator tag */}
          <div className="mt-16 inline-flex items-center space-x-2 bg-blue-600/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-blue-500/30">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Match Day Live: 14:00</span>
          </div>
          <h1 className="font-display font-black mb-6 text-center">
            <div className="text-white text-6xl md:text-7xl lg:text-9xl tracking-tight leading-none">
              BIENVENUE
            </div>
            <div className="text-gradient-gold text-6xl md:text-7xl lg:text-9xl tracking-tight italic leading-none mt-2">
              AU USAT
            </div>
          </h1>
          {/* Main navigation buttons for primary user journeys */}
          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6">
            <Link to="/players" className="group w-full md:w-auto px-12 py-5 bg-blue-600 hover:bg-white text-white hover:text-blue-900 font-bold transition-all duration-300 shadow-2xl shadow-blue-900/40 uppercase tracking-widest text-sm skew-x-[-10deg]">
              <span className="inline-block skew-x-[10deg]">Discover The Squad</span>
            </Link>
            <Link to="/matches" className="w-full md:w-auto px-12 py-5 bg-transparent hover:bg-white/10 text-white font-bold border-2 border-white/20 transition-all uppercase tracking-widest text-sm skew-x-[-10deg]">
              <span className="inline-block skew-x-[10deg]">Match Center</span>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7-7-7"></path></svg>
        </div>
      </section>

      {/* Ticker Section */}
      {/* Animated scrolling text for breaking news and updates */}
      <div className="bg-[#000d1a] py-3 overflow-hidden border-y border-white/5">
        <div className="flex whitespace-nowrap animate-[ticker_30s_linear_infinite]">
          {[1, 2, 3, 4, 5].map(i => (
            <span key={i} className="text-[10px] font-bold uppercase tracking-[0.4em] text-blue-500/60 mx-12">
              • Next Match: AMAL TIZNIT vs HUSA AGADIR • Throne Cup Semi-Finals • Tickets Available Now • Academy Trials 2026 Registration Open •
            </span>
          ))}
        </div>
      </div>

      {/* Latest News Preview */}
      <section className="py-32 bg-transparent">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20">
            <div>
              <span className="text-blue-600 font-black text-xs uppercase tracking-[0.5em] mb-4 block">Official Feed</span>
              <h2 className="text-6xl font-black uppercase tracking-tighter text-white italic">Club <span className="text-blue-500 underline decoration-4 underline-offset-8">News</span></h2>
            </div>
            <Link to="/news" className="mt-8 md:mt-0 px-8 py-3 border-2 border-white/20 font-bold uppercase tracking-widest text-[10px] text-white hover:bg-blue-600 hover:text-white transition-all">
              Full Archive
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            {/* Featured Article */}
            {latestNews.length > 0 ? (
              <Link to={`/news/${latestNews[0].id}`} className="md:col-span-7 group cursor-pointer relative overflow-hidden rounded-sm block">
                <img src={latestNews[0].image_url || 'https://picsum.photos/seed/main/1200/800'} className="w-full h-[500px] object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-12 flex flex-col justify-end">
                  <span className="bg-blue-600 text-white px-4 py-1 text-[10px] font-bold uppercase tracking-widest w-fit mb-4">{latestNews[0].category}</span>
                  <h3 className="text-4xl font-black text-white uppercase leading-none mb-4 group-hover:text-blue-400 transition-colors">{latestNews[0].title}</h3>
                  <p className="text-gray-300 text-sm max-w-lg mb-6 line-clamp-2">{latestNews[0].description}</p>
                  <div className="text-blue-500 text-[10px] font-bold uppercase tracking-widest">Read More →</div>
                </div>
              </Link>
            ) : (
              <div className="md:col-span-7 flex items-center justify-center h-[500px] bg-white/5 rounded-sm">
                <p className="text-gray-400">No news available</p>
              </div>
            )}
            {/* Secondary Articles */}
            <div className="md:col-span-5 flex flex-col space-y-10">
              {latestNews.slice(1, 3).map((article) => (
                <Link to={`/news/${article.id}`} key={article.id} className="flex space-x-6 group cursor-pointer block">
                  <div className="w-40 h-32 flex-shrink-0 overflow-hidden rounded-sm">
                    <img src={article.image_url || `https://picsum.photos/seed/${article.id}/400/300`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <div>
                    <span className="text-blue-600 text-[9px] font-bold uppercase tracking-widest block mb-2">{article.category}</span>
                    <h4 className="text-xl font-black text-white uppercase leading-tight mb-2 group-hover:text-blue-600 transition-colors">{article.title}</h4>
                    <p className="text-gray-400 text-xs line-clamp-2">{article.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Match Day Experience */}
      <section className="py-32 bg-[#001226] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-12">The <span className="text-blue-500">Amal</span> Experience</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 border border-white/10 hover:border-blue-500 transition-colors bg-white/5 backdrop-blur-sm">
                <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icons.Ball />
                </div>
                <h4 className="text-xl font-bold uppercase mb-2">Heritage</h4>
                <p className="text-gray-400 text-xs leading-relaxed">Preserving over 75 years of footballing excellence in Tiznit city.</p>
              </div>
              <div className="p-8 border border-white/10 hover:border-blue-500 transition-colors bg-white/5 backdrop-blur-sm">
                <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icons.Users />
                </div>
                <h4 className="text-xl font-bold uppercase mb-2">Community</h4>
                <p className="text-gray-400 text-xs leading-relaxed">Connecting thousands of fans across the Souss-Massa region.</p>
              </div>
              <div className="p-8 border border-white/10 hover:border-blue-500 transition-colors bg-white/5 backdrop-blur-sm">
                <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icons.Calendar />
                </div>
                <h4 className="text-xl font-bold uppercase mb-2">Passion</h4>
                <p className="text-gray-400 text-xs leading-relaxed">Experience the roar of the crowd at the Municipal Stadium.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
