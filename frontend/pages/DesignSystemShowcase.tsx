import React, { useState } from 'react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import SectionHeader from '../components/ui/SectionHeader';
import NewsCard from '../components/ui/NewsCard';
import MatchCard from '../components/ui/MatchCard';
import PlayerCard from '../components/ui/PlayerCard';
import StatCard from '../components/ui/StatCard';
import ProductCard from '../components/ui/ProductCard';
import VideoCard from '../components/ui/VideoCard';

export const DesignSystemShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tokens' | 'typography' | 'buttons' | 'cards' | 'grid'>('tokens');

  return (
    <div className="min-h-screen bg-[#040914] text-[#F8FAFC] pb-24">
      {/* Top Header Banner */}
      <header className="border-b border-[rgba(255,255,255,0.08)] bg-[#0E182A] py-12 px-4 sm:px-8">
        <div className="usat-container">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="usat-overline text-[#D4AF37]">SYSTEM ARCHITECTURE v1.0</span>
                <span className="bg-[#002D62] text-white text-[10px] font-display uppercase font-bold px-2 py-0.5 rounded-[4px]">
                  USAT DESIGN SYSTEM
                </span>
              </div>
              <h1 className="usat-display-l text-white">
                ITTIHAD AL-RIYADI AMAL TIZNIT
              </h1>
              <p className="usat-body text-[#94A3B8] max-w-2xl mt-2">
                Visual design foundations, color tokens, typography hierarchy, and UI component foundations for the official USAT digital platform.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-display uppercase tracking-wider text-[#64748B]">STATUS:</span>
              <Badge variant="success" size="md">
                FOUNDATION APPROVED
              </Badge>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-8 overflow-x-auto pb-2 scrollbar-none border-t border-[rgba(255,255,255,0.06)] pt-6">
            {[
              { id: 'tokens', label: '1. COLOR TOKENS & PALETTE' },
              { id: 'typography', label: '2. TYPOGRAPHY HIERARCHY' },
              { id: 'buttons', label: '3. BUTTONS & BADGES' },
              { id: 'cards', label: '4. FOOTBALL CARDS' },
              { id: 'grid', label: '5. SPACING & CONTAINERS' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`font-display text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-[6px] whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-[#D4AF37] text-[#040914] shadow-md'
                    : 'bg-[#16243D] text-[#94A3B8] hover:text-white hover:bg-[#1C2E4A]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="usat-container pt-12">
        {/* ====================================================================
           SECTION 1: COLOR TOKENS & PALETTE DEMO
           ==================================================================== */}
        {activeTab === 'tokens' && (
          <section className="space-y-12">
            <SectionHeader
              overline="COLOR SYSTEM (60-25-10-5 RULE)"
              title="Palettes & Tokens"
              subtitle="Derived from official USAT brand identity. Built for high contrast, editorial luxury, and athletic confidence."
            />

            {/* 60-25-10-5 Rule Breakdown */}
            <div className="p-6 rounded-[12px] bg-[#0E182A] border border-[rgba(255,255,255,0.08)]">
              <h3 className="usat-h3 text-white mb-4">Proportional Usage Rule</h3>
              <div className="h-6 w-full rounded-[6px] overflow-hidden flex shadow-inner">
                <div className="bg-[#040914] w-[60%] flex items-center justify-center text-[10px] font-display font-bold text-white/70 border-r border-white/10">
                  60% NEUTRAL BACKGROUND (#040914)
                </div>
                <div className="bg-[#0E182A] w-[25%] flex items-center justify-center text-[10px] font-display font-bold text-white/80 border-r border-white/10">
                  25% DARK SURFACE
                </div>
                <div className="bg-[#002D62] w-[10%] flex items-center justify-center text-[10px] font-display font-bold text-white">
                  10% CLUB BLUE
                </div>
                <div className="bg-[#D4AF37] w-[5%] flex items-center justify-center text-[9px] font-display font-black text-[#040914]">
                  5% GOLD
                </div>
              </div>
            </div>

            {/* Token Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Primary Club Color */}
              <div className="p-5 rounded-[12px] bg-[#0E182A] border border-[rgba(255,255,255,0.08)] space-y-3">
                <div className="h-24 rounded-[8px] bg-[#002D62] border border-white/10 flex items-end p-3 shadow-inner">
                  <span className="font-display font-bold text-xs text-white uppercase tracking-wider">
                    PRIMARY (#002D62)
                  </span>
                </div>
                <div>
                  <h4 className="font-display text-sm font-bold uppercase text-white">--color-primary</h4>
                  <p className="text-xs text-[#94A3B8]">Deep Athletic Royal Blue (USAT Official)</p>
                </div>
              </div>

              {/* Tiznit Amber Gold */}
              <div className="p-5 rounded-[12px] bg-[#0E182A] border border-[rgba(255,255,255,0.08)] space-y-3">
                <div className="h-24 rounded-[8px] bg-[#D4AF37] border border-white/10 flex items-end p-3 shadow-inner">
                  <span className="font-display font-extrabold text-xs text-[#040914] uppercase tracking-wider">
                    SECONDARY / ACCENT (#D4AF37)
                  </span>
                </div>
                <div>
                  <h4 className="font-display text-sm font-bold uppercase text-white">--color-secondary</h4>
                  <p className="text-xs text-[#94A3B8]">Tiznit Amber Gold (Heritage Reference)</p>
                </div>
              </div>

              {/* Atlas Crimson */}
              <div className="p-5 rounded-[12px] bg-[#0E182A] border border-[rgba(255,255,255,0.08)] space-y-3">
                <div className="h-24 rounded-[8px] bg-[#9E1B1B] border border-white/10 flex items-end p-3 shadow-inner">
                  <span className="font-display font-bold text-xs text-white uppercase tracking-wider">
                    ATLAS CRIMSON (#9E1B1B)
                  </span>
                </div>
                <div>
                  <h4 className="font-display text-sm font-bold uppercase text-white">--color-accent-crimson</h4>
                  <p className="text-xs text-[#94A3B8]">Moroccan Flag & Atlas Crimson Accent</p>
                </div>
              </div>

              {/* Surface Dark */}
              <div className="p-5 rounded-[12px] bg-[#0E182A] border border-[rgba(255,255,255,0.08)] space-y-3">
                <div className="h-24 rounded-[8px] bg-[#0E182A] border border-white/10 flex items-end p-3 shadow-inner">
                  <span className="font-display font-bold text-xs text-white/80 uppercase tracking-wider">
                    SURFACE SLATE (#0E182A)
                  </span>
                </div>
                <div>
                  <h4 className="font-display text-sm font-bold uppercase text-white">--color-surface</h4>
                  <p className="text-xs text-[#94A3B8]">Match Cards & Module Background</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ====================================================================
           SECTION 2: TYPOGRAPHY HIERARCHY
           ==================================================================== */}
        {activeTab === 'typography' && (
          <section className="space-y-12">
            <SectionHeader
              overline="TYPOGRAPHY SYSTEM"
              title="Hierarchy & Character"
              subtitle="Two-font system: Display (Oswald / Tajawal) for athletic editorial titles; Functional Sans-serif (Inter) for readable body text."
            />

            {/* Accent Verification */}
            <div className="p-6 rounded-[12px] bg-[#0E182A] border border-[rgba(212,175,55,0.3)]">
              <span className="usat-overline text-[#D4AF37] block mb-1">FRENCH ACCENTS CHARACTERS VERIFICATION</span>
              <p className="font-display text-xl sm:text-2xl text-white tracking-wide">
                À Â Ç É È Ê Ë Î Ï Ô Œ Ù Û Ü Ÿ — LA PASSION DE TIZNIT & DES SUPPORTERS
              </p>
            </div>

            {/* Type Scale Showcase */}
            <div className="space-y-8 p-8 rounded-[12px] bg-[#0E182A] border border-[rgba(255,255,255,0.08)]">
              <div className="border-b border-[rgba(255,255,255,0.08)] pb-6">
                <span className="usat-overline text-[#64748B] block mb-1">DISPLAY XL</span>
                <h1 className="usat-display-xl text-white">LA PASSION DE TIZNIT</h1>
              </div>

              <div className="border-b border-[rgba(255,255,255,0.08)] pb-6">
                <span className="usat-overline text-[#64748B] block mb-1">DISPLAY L (H1)</span>
                <h2 className="usat-display-l text-white">NOTRE ÉQUIPE PREMIÈRE</h2>
              </div>

              <div className="border-b border-[rgba(255,255,255,0.08)] pb-6">
                <span className="usat-overline text-[#64748B] block mb-1">DISPLAY M (H2)</span>
                <h3 className="usat-display-m text-[#D4AF37]">PROCHAIN MATCH EN DIRECT</h3>
              </div>

              <div className="border-b border-[rgba(255,255,255,0.08)] pb-6">
                <span className="usat-overline text-[#64748B] block mb-1">BODY LARGE</span>
                <p className="usat-body-l text-[#F8FAFC]">
                  L'Ittihad al-Riyadi Amal Tiznit (USAT) prépare activement sa prochaine confrontation décisive avec un effectif motivé et une préparation physique rigoureuse.
                </p>
              </div>

              <div>
                <span className="usat-overline text-[#64748B] block mb-1">BODY REGULAR & METADATA</span>
                <p className="usat-body text-[#94A3B8]">
                  Retrouvez toutes les actualités, billetteries officielles et la boutique du club pour soutenir Amal Tiznit tout au long de la saison.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ====================================================================
           SECTION 3: BUTTONS & BADGES
           ==================================================================== */}
        {activeTab === 'buttons' && (
          <section className="space-y-12">
            <SectionHeader
              overline="INTERACTIVE FOUNDATIONS"
              title="Buttons & Badges Matrix"
              subtitle="All button variants, sizes, and badge indicators engineered for WCAG AA contrast and confidence."
            />

            {/* Button Variants */}
            <div className="p-8 rounded-[12px] bg-[#0E182A] border border-[rgba(255,255,255,0.08)] space-y-8">
              <h3 className="usat-h3 text-white">Button Variants</h3>
              <div className="flex flex-wrap gap-4 items-center">
                <Button variant="primary">[ VOIR LE MATCH ]</Button>
                <Button variant="secondary">[ ACHETER BILLETS ]</Button>
                <Button variant="outline">[ DÉCOUVRIR ]</Button>
                <Button variant="dark">[ MON COMPTE ]</Button>
                <Button variant="ghost">→ TOUTES LES ACTUALITÉS</Button>
              </div>

              <h3 className="usat-h3 text-white pt-4 border-t border-[rgba(255,255,255,0.08)]">
                Button States (Primary)
              </h3>
              <div className="flex flex-wrap gap-4 items-center">
                <Button variant="primary">DEFAULT STATE</Button>
                <Button variant="primary" isLoading>LOADING</Button>
                <Button variant="primary" disabled>DISABLED</Button>
              </div>

              <h3 className="usat-h3 text-white pt-4 border-t border-[rgba(255,255,255,0.08)]">
                Badges
              </h3>
              <div className="flex flex-wrap gap-3 items-center">
                <Badge variant="primary">ÉQUIPE PREMIÈRE</Badge>
                <Badge variant="accent">CHAMPIONNAT BOTOLA</Badge>
                <Badge variant="outline">STADE MARCHÉS VERTS</Badge>
                <Badge variant="dark">03 AOÛT 2026</Badge>
                <Badge variant="live">EN DIRECT</Badge>
                <Badge variant="success">CONFIRMÉ</Badge>
              </div>
            </div>
          </section>
        )}

        {/* ====================================================================
           SECTION 4: FOOTBALL CARDS SHOWCASE
           ==================================================================== */}
        {activeTab === 'cards' && (
          <section className="space-y-16">
            <SectionHeader
              overline="REUSABLE FOOTBALL MODULES"
              title="Card Foundations"
              subtitle="Domain-specific card modules sharing a unified athletic design language."
            />

            {/* 1. NewsCard */}
            <div>
              <h3 className="usat-h2 text-white mb-6">1. NewsCard (16:9 Image Ratio)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <NewsCard
                  category="ÉQUIPE PREMIÈRE"
                  title="L'USAT prépare activement le choc de la prochaine journée à Tiznit"
                  date="03 AOÛT 2026"
                  imageUrl="/Assets/bg1.jpg"
                  summary="Entraînement tactique intensif et préparation physique complète sous la houlette du staff technique."
                />
                <NewsCard
                  category="ACADÉMIE"
                  title="Les jeunes pépites de l'académie de Tiznit s'imposent en tournoi"
                  date="01 AOÛT 2026"
                  imageUrl="/Assets/bg2.jpg"
                  summary="Une brillante victoire collective qui confirme l'excellence de la formation du club."
                />
                <NewsCard
                  category="BILLETTERIE"
                  title="Ouverture de la billetterie officielle pour le derby à domicile"
                  date="28 JUILLET 2026"
                  imageUrl="/Assets/bg.jpg"
                  summary="Réservez vos places en ligne dès maintenant pour soutenir Amal Tiznit au stade."
                />
              </div>
            </div>

            {/* 2. MatchCard */}
            <div>
              <h3 className="usat-h2 text-white mb-6">2. MatchCard (Score & Fixture)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MatchCard
                  competition="BOTOLA PRO 2 — J24"
                  homeTeam={{ name: 'USAT TIZNIT', logoUrl: '/Assets/logo.png', isUsat: true }}
                  awayTeam={{ name: 'KAC MARRAKECH' }}
                  status="UPCOMING"
                  date="SAMEDI 08 AOÛT 2026"
                  time="18:00"
                  stadium="Stade El Massira, Tiznit"
                  ticketAvailable={true}
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
                />
              </div>
            </div>

            {/* 3. PlayerCard */}
            <div>
              <h3 className="usat-h2 text-white mb-6">3. PlayerCard (3:4 Ratio & Number Overlay)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <PlayerCard
                  number={10}
                  name="Youssef Amrani"
                  position="MILIEU OFFENSIF"
                  imageUrl="/Assets/bg2.jpg"
                  matches={18}
                  goals={8}
                />
                <PlayerCard
                  number={9}
                  name="Mehdi Ouchen"
                  position="ATTAQUANT"
                  imageUrl="/Assets/bg1.jpg"
                  matches={20}
                  goals={12}
                />
                <PlayerCard
                  number={1}
                  name="Ayoub El Hassani"
                  position="GARDIEN DE BUT"
                  imageUrl="/Assets/bg.jpg"
                  matches={22}
                  goals={0}
                />
                <PlayerCard
                  number={4}
                  name="Tariq Benchekroun"
                  position="DÉFENSEUR CENTRAL"
                  imageUrl="/Assets/bg2.jpg"
                  matches={19}
                  goals={2}
                />
              </div>
            </div>

            {/* 4. StatCard */}
            <div>
              <h3 className="usat-h2 text-white mb-6">4. StatCard (Ultra Large Display Number)</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard value="18" label="MATCHS JOUÉS" sublabel="Saison régulière 2025/2026" />
                <StatCard value="12" label="VICTOIRES" trend="+3 vs 2025" variant="gold" />
                <StatCard value="28" label="BUTS MARQUÉS" sublabel="Moyenne 1.55 / match" />
                <StatCard value="9" label="CLEAN SHEETS" sublabel="Matches sans encaisser" />
              </div>
            </div>

            {/* 5. ProductCard & VideoCard */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="usat-h2 text-white mb-6">5. ProductCard (1:1 Ratio)</h3>
                <ProductCard
                  name="Maillot Domicile Officiel USAT 2026"
                  category="ÉQUIPEMENT OFFICIEL"
                  price={350}
                  imageUrl="/Assets/logo.png"
                  isNew={true}
                />
              </div>
              <div>
                <h3 className="usat-h2 text-white mb-6">6. VideoCard (Media Thumbnail)</h3>
                <VideoCard
                  title="Highlights: Victoire héroïque d'Amal Tiznit en Coupe du Trône"
                  category="USAT TV"
                  duration="04:25"
                  thumbnailUrl="/Assets/bg1.jpg"
                  date="25 JUILLET 2026"
                />
              </div>
            </div>
          </section>
        )}

        {/* ====================================================================
           SECTION 5: SPACING & CONTAINER RULES
           ==================================================================== */}
        {activeTab === 'grid' && (
          <section className="space-y-12">
            <SectionHeader
              overline="LAYOUT ARCHITECTURE"
              title="Spacing & Grid Guidelines"
              subtitle="4px base system, generous section padding (96–144px), and 12-column responsive layout."
            />

            <div className="p-8 rounded-[12px] bg-[#0E182A] border border-[rgba(255,255,255,0.08)] space-y-6">
              <h3 className="usat-h3 text-white">Container Widths</h3>
              <div className="space-y-4">
                <div className="p-4 bg-[#16243D] border border-white/10 rounded-[8px] flex items-center justify-between">
                  <span className="font-display text-sm font-bold text-white">.usat-container</span>
                  <span className="text-xs font-display text-[#D4AF37]">MAX-WIDTH: 1280px</span>
                </div>
                <div className="p-4 bg-[#16243D] border border-white/10 rounded-[8px] flex items-center justify-between">
                  <span className="font-display text-sm font-bold text-white">.usat-container-wide</span>
                  <span className="text-xs font-display text-[#D4AF37]">MAX-WIDTH: 1440px</span>
                </div>
                <div className="p-4 bg-[#16243D] border border-white/10 rounded-[8px] flex items-center justify-between">
                  <span className="font-display text-sm font-bold text-white">.usat-container-narrow</span>
                  <span className="text-xs font-display text-[#D4AF37]">MAX-WIDTH: 960px</span>
                </div>
              </div>

              <h3 className="usat-h3 text-white pt-6 border-t border-[rgba(255,255,255,0.08)]">
                Responsive Breakpoints
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-[#040914] rounded-[8px] border border-white/10">
                  <span className="text-xs font-display text-[#94A3B8] block">MOBILE</span>
                  <span className="font-display text-lg font-bold text-white">&lt; 640px</span>
                </div>
                <div className="p-4 bg-[#040914] rounded-[8px] border border-white/10">
                  <span className="text-xs font-display text-[#94A3B8] block">TABLET</span>
                  <span className="font-display text-lg font-bold text-white">640px – 1024px</span>
                </div>
                <div className="p-4 bg-[#040914] rounded-[8px] border border-white/10">
                  <span className="text-xs font-display text-[#94A3B8] block">DESKTOP</span>
                  <span className="font-display text-lg font-bold text-[#D4AF37]">1024px+</span>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default DesignSystemShowcase;
