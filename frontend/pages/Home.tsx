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

          <p className="usat-body-l text-[#94A3B8] max-w-2xl mx-auto mb-10">
            Le site officiel du club passion de la ville de Tiznit. Retrouvez toute l'actualité, l'effectif, la billetterie et la boutique officielle.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Link to="/players" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" fullWidth className="sm:w-auto">
                DÉCOUVRIR L'EFFECTIF
              </Button>
            </Link>
            <Link to="/matches" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" fullWidth className="sm:w-auto">
                CENTRE DE MATCH
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ====================================================================
          OFFICIAL PARTNERS & SPONSORS MARQUEE (BRIDGING HERO & NEXT MATCH)
         ==================================================================== */}
      <PartnersMarquee />

      {/* ====================================================================
         SECTION 1: NEXT MATCH / MATCH CENTER
         ==================================================================== */}
      <section className="py-20 sm:py-28 bg-[#0E182A] border-b border-[rgba(255,255,255,0.08)]">
        <div className="usat-container">
          <SectionHeader
            overline="CENTRE DE MATCH"
            title="Prochaines Échéances"
            subtitle="Suivez le calendrier des matchs de l'USAT en Botola et Coupe du Trône."
            actionText="TOUS LES MATCHS"
            onActionClick={() => navigate('/matches')}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <MatchCard
              competition="BOTOLA PRO 2 — J24"
              homeTeam={{ name: 'USAT TIZNIT', logoUrl: '/Assets/logo.png', isUsat: true }}
              awayTeam={{ name: 'KAC MARRAKECH' }}
              status="UPCOMING"
              date="SAMEDI 08 AOÛT 2026"
              time="18:00"
              stadium="Stade El Massira, Tiznit"
              ticketAvailable={true}
              onCtaClick={() => navigate('/tickets')}
            />

            <MatchCard
              competition="COUPE DU TRÔNE — 1/8"
              homeTeam={{ name: 'USAT TIZNIT', logoUrl: '/Assets/logo.png', isUsat: true }}
              awayTeam={{ name: 'HASSANIA AGADIR' }}
              homeScore={2}
              awayScore={1}
              status="FINISHED"
              date="25 JUILLET 2026"
              stadium="Stade El Massira, Tiznit"
              onCtaClick={() => navigate('/matches')}
            />
          </div>
        </div>
      </section>

      {/* ====================================================================
         TICKER SECTION
         ==================================================================== */}
      <div className="bg-[#001938] py-3.5 overflow-hidden border-y border-[rgba(255,255,255,0.08)]">
        <div className="flex whitespace-nowrap animate-[ticker_30s_linear_infinite]">
          {[1, 2, 3, 4].map((i) => (
            <span key={i} className="text-xs font-display font-bold uppercase tracking-[0.3em] text-[#D4AF37] mx-8">
              • PROCHAIN MATCH: AMAL TIZNIT vs KAC MARRAKECH • BILLETTERIE EN LIGNE DISPONIBLE • STADE EL MASSIRA TIZNIT • ACADÉMIE DE FOOTBALL USAT •
            </span>
          ))}
        </div>
      </div>

      {/* ====================================================================
         LATEST NEWS SECTION
         ==================================================================== */}
      <section className="py-20 sm:py-28 bg-[#040914]">
        <div className="usat-container">
          <SectionHeader
            overline="ACTUALITÉS OFFICIELLES"
            title="Dernières News USAT"
            subtitle="Toutes les informations et coulisses de l'équipe première et du club."
            actionText="ARCHIVES DE NEWS"
            onActionClick={() => navigate('/news')}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestNews.length > 0 ? (
              latestNews.map((article) => (
                <NewsCard
                  key={article.id}
                  id={article.id}
                  category={article.category || 'ÉQUIPE'}
                  title={article.title}
                  date={new Date(article.published_at || Date.now()).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  imageUrl={article.image_url || '/Assets/bg1.jpg'}
                  summary={article.description}
                  onClick={() => navigate(`/news/${article.id}`)}
                />
              ))
            ) : (
              <>
                <NewsCard
                  category="ÉQUIPE PREMIÈRE"
                  title="L'USAT prépare activement le choc de la prochaine journée à Tiznit"
                  date="03 AOÛT 2026"
                  imageUrl="/Assets/bg1.jpg"
                  summary="Entraînement tactique intensif et préparation physique complète sous la direction du staff."
                  onClick={() => navigate('/news')}
                />
                <NewsCard
                  category="ACADÉMIE"
                  title="Les jeunes pépites de l'académie de Tiznit s'imposent en tournoi"
                  date="01 AOÛT 2026"
                  imageUrl="/Assets/bg2.jpg"
                  summary="Une brillante victoire collective qui confirme l'excellence de la formation du club."
                  onClick={() => navigate('/news')}
                />
                <NewsCard
                  category="BILLETTERIE"
                  title="Ouverture de la billetterie officielle pour le derby à domicile"
                  date="28 JUILLET 2026"
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
            <StatCard value="28" label="BUTS MARQUÉS" sublabel="Moyenne 1.55 / match" />
            <StatCard value="9" label="CLEAN SHEETS" sublabel="Matchs sans encaisser de but" />
          </div>
        </div>
      </section>

      {/* ====================================================================
         SECTION 6: USAT × TIZNIT HERITAGE & HISTORY
         ==================================================================== */}
      <section className="py-20 sm:py-28 bg-[#0E182A] border-y border-[rgba(255,255,255,0.08)] relative overflow-hidden">
        <div className="usat-container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Image Collage */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-[12px] overflow-hidden border border-[rgba(212,175,55,0.3)] shadow-[0_12px_32px_rgba(0,0,0,0.6)]">
                <img
                  src="/Assets/bg.jpg"
                  alt="USAT Tiznit Supporters & Stadium"
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#040914] via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <Badge variant="accent" size="sm" className="mb-2">
                    HISTOIRE & PATRIMOINE
                  </Badge>
                  <h3 className="usat-h2 text-white font-display uppercase">
                    STADE EL MASSIRA • TIZNIT
                  </h3>
                </div>
              </div>
            </div>

            {/* Right Story Text */}
            <div className="lg:col-span-6 space-y-6">
              <span className="usat-overline text-[#D4AF37]">L'ÂME DE LA VILLE D'ARGENT</span>
              <h2 className="usat-display-m text-white">
                UNE HISTOIRE DE PASSION & D'AMBITION À TIZNIT
              </h2>
              <p className="usat-body text-[#94A3B8]">
                Fondé au cœur de la région Souss-Massa, l'Ittihad al-Riyadi Amal Tiznit incarne la fierté et l'esprit collectif de toute une ville. Plus qu'un club de football, l'USAT réunit des générations de supporters passionnés au Stade El Massira.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[rgba(255,255,255,0.08)]">
                <div>
                  <span className="font-display text-2xl font-bold text-[#D4AF37]">75+ ANS</span>
                  <p className="text-xs text-[#64748B] mt-1">D'Histoire Sportive</p>
                </div>
                <div>
                  <span className="font-display text-2xl font-bold text-[#D4AF37]">100% PASSION</span>
                  <p className="text-xs text-[#64748B] mt-1">Soutien Populaire</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
         SECTION 8: FAN CLUB & NEWSLETTER CTA
         ==================================================================== */}
      <section className="py-20 bg-[#0E182A] relative overflow-hidden">
        <div className="usat-container">
          <div className="max-w-3xl mx-auto rounded-[16px] bg-gradient-to-br from-[#002D62] to-[#040914] p-8 sm:p-12 border border-[rgba(212,175,55,0.3)] shadow-[0_12px_32px_rgba(0,0,0,0.6)] text-center space-y-6">
            <Badge variant="accent" size="sm">
              CLUB DES SUPPORTERS
            </Badge>

            <h2 className="usat-display-m text-white">
              REJOIGNEZ LA PASSION D'AMAL TIZNIT
            </h2>

            <p className="usat-body text-[#94A3B8] max-w-xl mx-auto">
              Inscrivez-vous à la newsletter officielle pour recevoir en avant-première l'actualité des matchs, les alertes billetterie et les offres de la boutique.
            </p>

            {isSubscribed ? (
              <div className="p-4 bg-[#10B981]/20 border border-[#10B981]/40 rounded-[8px] text-[#10B981] font-display text-sm font-bold uppercase">
                ✓ MERCI ! VOTRE INSCRIPTION EST CONFIRMÉE.
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  required
                  placeholder="Entrez votre adresse email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-grow px-4 py-3 rounded-[8px] bg-[#040914] text-white border border-[rgba(255,255,255,0.15)] focus:outline-none focus:border-[#D4AF37] text-sm"
                />
                <Button type="submit" variant="secondary" size="md" className="shrink-0">
                  S'INSCRIRE
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
