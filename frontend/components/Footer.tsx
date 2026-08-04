import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, ShieldCheck, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Facebook, url: 'https://facebook.com', label: 'Facebook' },
    { icon: Instagram, url: 'https://instagram.com', label: 'Instagram' },
    { icon: Twitter, url: 'https://twitter.com', label: 'Twitter' },
    { icon: Youtube, url: 'https://youtube.com', label: 'YouTube' },
  ];

  return (
    <footer className="bg-[#040914] text-[#F8FAFC] border-t border-[rgba(255,255,255,0.08)] mt-auto relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#002D62]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Footer Container */}
      <div className="usat-container pt-16 pb-12 relative z-10">
        {/* Top Branding Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-12 mb-12 border-b border-[rgba(255,255,255,0.08)] gap-8">
          <div className="flex items-center gap-5">
            <img
              src="/Assets/logo.png"
              alt="USAT Crest"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-[0_4px_12px_rgba(212,175,55,0.2)]"
            />
            <div>
              <span className="usat-overline text-[#D4AF37] block text-xs tracking-widest">
                FONDÉ EN 1948 • TIZNIT, MAROC
              </span>
              <h2 className="usat-h1 text-white font-display uppercase tracking-tight mt-0.5">
                ITTIHAD AL-RIYADI AMAL TIZNIT
              </h2>
              <p className="text-xs text-[#94A3B8] max-w-md mt-1">
                La passion du football au cœur du Souss-Massa. Retrouvez l'actualité officielle et soutenez les Rouges et Bleus.
              </p>
            </div>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            <span className="font-display text-xs font-bold uppercase tracking-wider text-[#64748B] mr-2 hidden sm:inline-block">
              REJOIGNEZ-NOUS:
            </span>
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 rounded-[8px] bg-[#0E182A] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[#94A3B8] hover:text-[#D4AF37] hover:border-[#D4AF37]/50 hover:bg-[#16243D] transition-all duration-200 shadow-sm"
                >
                  <Icon size={18} />
                </a>
              );
            })}
          </div>
        </div>

        {/* 4 Column Navigation Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12">
          {/* Column 1: Club & Squad */}
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-widest text-[#D4AF37] mb-5">
              LE CLUB & L'ÉQUIPE
            </h3>
            <ul className="space-y-3 text-xs font-display uppercase tracking-wider">
              <li>
                <Link to="/players" className="text-[#94A3B8] hover:text-white transition-colors duration-200">
                  Équipe Première
                </Link>
              </li>
              <li>
                <Link to="/matches" className="text-[#94A3B8] hover:text-white transition-colors duration-200">
                  Matchs & Résultats
                </Link>
              </li>
              <li>
                <Link to="/news" className="text-[#94A3B8] hover:text-white transition-colors duration-200">
                  Actualités Officieuses
                </Link>
              </li>
              <li>
                <Link to="/design-system" className="text-[#94A3B8] hover:text-[#D4AF37] transition-colors duration-200 flex items-center gap-1">
                  <span>Design System USAT</span>
                  <ArrowUpRight size={12} />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Billetterie & Stade */}
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-widest text-[#D4AF37] mb-5">
              BILLETTERIE & STADE
            </h3>
            <ul className="space-y-3 text-xs font-display uppercase tracking-wider">
              <li>
                <Link to="/tickets" className="text-[#94A3B8] hover:text-white transition-colors duration-200">
                  Acheter un Billet
                </Link>
              </li>
              <li>
                <span className="text-[#64748B]">Stade El Massira (Tiznit)</span>
              </li>
              <li>
                <Link to="/contact" className="text-[#94A3B8] hover:text-white transition-colors duration-200">
                  Guide du Supporter
                </Link>
              </li>
              <li>
                <Link to="/tickets" className="text-[#94A3B8] hover:text-white transition-colors duration-200">
                  Tarifs & Abonnements
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Boutique & Shop */}
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-widest text-[#D4AF37] mb-5">
              BOUTIQUE OFFICIELLE
            </h3>
            <ul className="space-y-3 text-xs font-display uppercase tracking-wider">
              <li>
                <Link to="/shop" className="text-[#94A3B8] hover:text-white transition-colors duration-200">
                  Maillot Domicile 2026
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-[#94A3B8] hover:text-white transition-colors duration-200">
                  Tenues d'Entraînement
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-[#94A3B8] hover:text-white transition-colors duration-200">
                  Accessoires USAT
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-[#94A3B8] hover:text-white transition-colors duration-200">
                  Nouveautés Merchandise
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Info */}
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-widest text-[#D4AF37] mb-5">
              CONTACT & SIÈGE
            </h3>
            <div className="space-y-3.5 text-xs text-[#94A3B8]">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-[#D4AF37] shrink-0 mt-0.5" />
                <span>Stade El Massira, Av. Hassan II, Tiznit 85000, Maroc</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-[#D4AF37] shrink-0" />
                <span>contact@amaltiznit.ma</span>
              </div>
              <div className="pt-2">
                <Link
                  to="/admin/login"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#0E182A] border border-[rgba(255,255,255,0.1)] text-[11px] font-display uppercase tracking-wider text-[#94A3B8] hover:text-white hover:border-[#D4AF37]/40 transition-colors"
                >
                  <ShieldCheck size={14} className="text-[#D4AF37]" />
                  <span>Portail Administration</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="pt-8 border-t border-[rgba(255,255,255,0.08)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
          <p>© {currentYear} Ittihad al-Riyadi Amal Tiznit (USAT). Tous droits réservés.</p>
          <div className="flex items-center gap-6 font-display uppercase tracking-wider text-[11px]">
            <Link to="/contact" className="hover:text-white transition-colors">
              Mentions Légales
            </Link>
            <Link to="/contact" className="hover:text-white transition-colors">
              Confidentialité
            </Link>
            <Link to="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
