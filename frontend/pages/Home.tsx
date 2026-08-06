import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API, NewsArticle, Match, Player } from '../api';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import SectionHeader from '../components/ui/SectionHeader';
import NewsCard from '../components/ui/NewsCard';
import MatchCard from '../components/ui/MatchCard';
import PlayerCard from '../components/ui/PlayerCard';
import StatCard from '../components/ui/StatCard';
import PartnersMarquee from '../components/ui/PartnersMarquee';
import { ASSETS } from '../constants';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [latestNews, setLatestNews] = useState<NewsArticle[]>([]);
  const [upcomingMatch, setUpcomingMatch] = useState<Match | null>(null);
  const [keyPlayers, setKeyPlayers] = useState<Player[]>([]);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    document.title = "Amal Tiznit | Official Website";
    
    // Fetch News & Data
    const fetchData = async () => {
      try {
        const newsData = await API.news.getAll();
        setLatestNews(newsData.slice(0, 3));
      } catch (err) {
        console.error('Failed to load latest news:', err);
      }

      try {
        const matchData = await API.matches.getAll();
        const upcoming = matchData.find((m) => m.status === 'upcoming') || matchData[0];
        if (upcoming) setUpcomingMatch(upcoming);
      } catch (err) {
        console.error('Failed to load matches:', err);
      }

      try {
        const playerData = await API.players.getAll();
        setKeyPlayers(playerData.slice(0, 4));
      } catch (err) {
        console.error('Failed to load players:', err);
      }
    };

    fetchData();
  }, []);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setIsSubscribed(true);
      setNewsletterEmail('');
    }
  };

  // Fallback / Sample squad data if API returns empty
  const defaultPlayers: Partial<Player>[] = [
    { id: 1, name: 'Youssef Amrani', number: 10, position: 'Midfielder', image_url: '/Assets/bg2.jpg', nationality: 'MAR', matches_played: 18, goals: 8 },
    { id: 2, name: 'Mehdi Ouchen', number: 9, position: 'Forward', image_url: '/Assets/bg1.jpg', nationality: 'MAR', matches_played: 20, goals: 12 },
    { id: 3, name: 'Ayoub El Hassani', number: 1, position: 'Goalkeeper', image_url: '/Assets/bg.jpg', nationality: 'MAR', matches_played: 22, goals: 0 },
    { id: 4, name: 'Tariq Benchekroun', number: 4, position: 'Defender', image_url: '/Assets/bg2.jpg', nationality: 'MAR', matches_played: 19, goals: 2 },
  ];

  const displayPlayers = keyPlayers.length > 0 ? keyPlayers : defaultPlayers;

  return (
    <div className="overflow-x-hidden bg-[#040914] text-[#F8FAFC]">
      {/* ====================================================================
         HERO SECTION
         ==================================================================== */}
      <section className="relative min-h-[90vh] flex items-center justify-center hero-gradient text-white pt-20 pb-16">
        <div className="hero-image" />
        <div className="hero-overlay" />

        <div className="usat-container text-center z-10 animate-slide-up">
          {/* Live match indicator tag */}
          <div className="inline-flex items-center space-x-2 bg-[#002D62]/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-[rgba(212,175,55,0.3)] shadow-lg mb-6 mt-12">
            <span className="w-2 h-2 bg-[#9E1B1B] rounded-full animate-pulse" />
            <span className="text-[11px] font-display font-bold uppercase tracking-widest text-[#D4AF37]">
              SAISON 2025/2026 • BOTOLA PRO
            </span>
          </div>

          <h1 className="usat-display-xl tracking-tight text-white mb-6">
            ITTIHAD AL-RIYADI
            <span className="block text-gradient-gold italic mt-1">AMAL TIZNIT</span>
          </h1>

          <p className="usat-subtitle max-w-2xl mx-auto text-[#94A3B8] mb-10 text-sm sm:text-base">
            Site Officiel de l'USAT. Suivez les matchs, découvrez l'effectif, réservez vos billets et soutenez le club emblématique de Tiznit.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/tickets')}
              className="usat-glow"
            >
              RÉSERVER MES BILLETS
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/matches')}
            >
              PROCHAINS MATCHS
            </Button>
          </div>
        </div>
      </section>

      {/* ====================================================================
         SECTION 1: NEXT MATCH & NEWS GRID
         ==================================================================== */}
      <section className="py-20 sm:py-28 bg-[#040914]">
        <div className="usat-container">
          <SectionHeader
            overline="CALENDRIER & ACTUALITÉS"
            title="À la Une du Club"
            subtitle="Ne manquez rien des derniers résultats et des déclarations officielles."
            actionText="TOUTES LES NEWS"
            onActionClick={() => navigate('/news')}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Featured Highlight: Upcoming Match Card */}
            {upcomingMatch ? (
              <MatchCard
                homeTeam={{ name: "Amal Tiznit", logoUrl: ASSETS.logo, isUsat: true }}
                awayTeam={{ name: upcomingMatch.opponent }}
                homeScore={upcomingMatch.home_score}
                awayScore={upcomingMatch.away_score}
                date={upcomingMatch.match_date}
                time="16:00"
                stadium={upcomingMatch.stadium}
                status={upcomingMatch.status === 'finished' ? 'FINISHED' : 'UPCOMING'}
                competition="Botola Pro 2"
                onCtaClick={() => navigate('/tickets')}
              />
            ) : (
              <div className="bg-[#0E182A] border border-[rgba(255,255,255,0.08)] rounded-[12px] p-8 flex flex-col justify-between">
                <div>
                  <Badge variant="accent" size="sm">COMMUNIQUÉ</Badge>
                  <h3 className="font-display text-xl font-bold uppercase text-white mt-4">
                    Prochain Match à Domicile
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed">
                    Stade El Massira Tiznit. Billetterie ouverte pour tous les supporters.
                  </p>
                </div>
                <Button variant="primary" size="sm" onClick={() => navigate('/tickets')} className="mt-6 w-full">
                  RÉSERVER
                </Button>
              </div>
            )}

            {/* News Articles Grid */}
            {latestNews.length > 0 ? (
              latestNews.map((article) => (
                <NewsCard
                  key={article.id}
                  id={article.id}
                  category={article.category || 'CLUB'}
                  title={article.title}
                  date={new Date(article.published_at).toLocaleDateString('fr-FR')}
                  imageUrl={article.image_url}
                  summary={article.description}
                  onClick={() => navigate(`/news/${article.id}`)}
                />
              ))
            ) : (
              <>
                <NewsCard
                  category="CHAMPIONNAT"
                  title="Victoire Importante à Domicile"
                  date="02 AOÛT 2026"
                  imageUrl="/Assets/bg1.jpg"
                  summary="L'Amal Tiznit s'impose 2-0 dans une ambiance survoltée au Stade El Massira."
                  onClick={() => navigate('/news')}
                />
                <NewsCard
                  category="BILLETTERIE"
                  title="Ouverture de la Billetterie"
                  date="01 AOÛT 2026"
                  imageUrl="/Assets/bg.jpg"
                  summary="Réservez vos places en ligne dès maintenant pour soutenir Amal Tiznit au stade."
                  onClick={() => navigate('/tickets')}
                />
              </>
            )}
          </div>
        </div>
      </section>

      {/* ====================================================================
         SECTION 2: FEATURED SQUAD SPOTLIGHT
         ==================================================================== */}
      <section className="py-20 sm:py-28 bg-[#0E182A] border-y border-[rgba(255,255,255,0.08)]">
        <div className="usat-container">
          <SectionHeader
            overline="EQUIPE PREMIÈRE"
            title="Joueurs Vedettes"
            subtitle="Découvrez les figures emblématiques qui défendent les couleurs de Tiznit."
            actionText="TOUT L'EFFECTIF"
            onActionClick={() => navigate('/players')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayPlayers.map((player, idx) => (
              <PlayerCard
                key={player.id || idx}
                number={player.number || (idx + 1) * 3}
                name={player.name || 'Joueur USAT'}
                position={player.position ? player.position.toUpperCase() : 'MILIEU'}
                imageUrl={player.image_url || '/Assets/bg2.jpg'}
                nationality={player.nationality || 'MAR'}
                matches={player.matches_played || 18}
                goals={player.goals || 6}
                onClick={() => navigate('/players')}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
         SECTION 3: SEASON KEY STATISTICS
         ==================================================================== */}
      <section className="py-20 sm:py-28 bg-[#040914]">
        <div className="usat-container">
          <SectionHeader
            overline="PERFORMANCE & CHIFFRES"
            title="Statistiques de la Saison"
            subtitle="L'impact collectif d'Amal Tiznit sur les terrains cette saison."
            align="center"
          />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard value="18" label="MATCHS JOUÉS" sublabel="Botola Pro & Coupe du Trône" />
            <StatCard value="12" label="VICTOIRES" trend="+4 vs 2025" variant="gold" />
            <StatCard value="32" label="BUTS MARQUÉS" sublabel="Moyenne 1.77 / match" />
            <StatCard value="8" label="CLEAN SHEETS" trend="Top 3 Défense" variant="gold" />
          </div>
        </div>
      </section>

      {/* ====================================================================
         SECTION 4: PARTNERS & SPONSORS MARQUEE
         ==================================================================== */}
      <PartnersMarquee />

      {/* ====================================================================
         SECTION 5: NEWSLETTER & FAN CLUB CTA
         ==================================================================== */}
      <section className="py-20 bg-[#0E182A] border-t border-[rgba(255,255,255,0.08)]">
        <div className="usat-container">
          <div className="bg-[#002D62] rounded-[16px] p-8 sm:p-14 text-center border border-[rgba(212,175,55,0.3)] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto">
              <span className="usat-overline text-[#D4AF37] block mb-2">CLUB DES SUPPORTERS</span>
              <h2 className="usat-h2 text-white uppercase tracking-tight mb-4">
                REJOIGNEZ LA NATION <span className="text-[#D4AF37]">BLEU ET ROUGE</span>
              </h2>
              <p className="text-sm text-[#94A3B8] mb-8 leading-relaxed">
                Inscrivez-vous à la newsletter officielle pour recevoir en avant-première les alertes billetterie, les résumés vidéo et les offres exclusives boutique.
              </p>

              {isSubscribed ? (
                <div className="bg-[#10B981]/20 border border-[#10B981] text-[#10B981] p-4 rounded-[8px] font-display font-bold uppercase tracking-wider text-sm">
                  ✓ MERCI ! VOUS ÊTES MAINTENANT INSCRIT À LA NEWSLETTER.
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    required
                    placeholder="Votre adresse email..."
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="flex-1 bg-[#0E182A] border border-[rgba(255,255,255,0.16)] rounded-[8px] px-4 py-3 text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#D4AF37]"
                  />
                  <Button type="submit" variant="primary" size="md">
                    S'INSCRIRE
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
