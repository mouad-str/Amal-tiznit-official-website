import React from 'react';

export interface PartnerItem {
  id: string | number;
  name: string;
  logoUrl?: string;
  websiteUrl?: string;
  category?: string;
}

export interface PartnersMarqueeProps {
  partners?: PartnerItem[];
  title?: string;
  className?: string;
}

// Curated official USAT partners fallback dataset with clean SVG brand graphics
const DEFAULT_PARTNERS: PartnerItem[] = [
  {
    id: 'usat-club',
    name: 'USAT Amal Tiznit',
    logoUrl: '/Assets/logo.png',
  },
  {
    id: 'tiznit-city',
    name: 'Ville de Tiznit',
    logoUrl: '/Assets/logo_tiznit_1.png',
  },
  {
    id: 'ocp-group',
    name: 'OCP Group',
    logoUrl: '/Assets/OCP.png',
  },
  {
    id: 'ram',
    name: 'Royal Air Maroc',
    logoUrl: '/Assets/Royal.png',
  },
  {
    id: 'boa',
    name: 'Bank of Africa',
    logoUrl: '/Assets/BMCE.png',
  },
  {
    id: 'iam',
    name: 'Maroc Telecom',
    logoUrl: '/Assets/iam.png',  
},
];

export const PartnersMarquee: React.FC<PartnersMarqueeProps> = ({
  partners = DEFAULT_PARTNERS,
  title = 'PARTENAIRES OFFICIELS & SPONSORS',
  className = '',
}) => {
  return (
    <section
      aria-label="Official Partners and Sponsors"
      className={`relative py-6 sm:py-8 bg-[#0B1320] border-y border-[rgba(255,255,255,0.08)] overflow-hidden select-none group ${className}`}
    >
      {/* Top Label */}
      <div className="usat-container mb-4 sm:mb-5 text-center">
        <h3 className="usat-overline text-[11px] sm:text-xs font-display font-bold uppercase tracking-[0.25em] text-[#64748B]">
          {title}
        </h3>
      </div>

      {/* Marquee Viewport with Soft Gradient Edge Masks */}
      <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        {/* Continuous Animated Track (Pause on Hover) */}
        <div className="flex w-max items-center animate-marquee group-hover:[animation-play-state:paused] transition-all duration-300">
          {/* SET A */}
          <div className="flex items-center gap-12 sm:gap-16 lg:gap-20 px-6 sm:px-10 shrink-0">
            {partners.map((partner) => (
              <PartnerItemDisplay key={`setA-${partner.id}`} partner={partner} />
            ))}
          </div>

          {/* SET B (Exact Duplicate for Seamless Infinite Loop) */}
          <div className="flex items-center gap-12 sm:gap-16 lg:gap-20 px-6 sm:px-10 shrink-0" aria-hidden="true">
            {partners.map((partner) => (
              <PartnerItemDisplay key={`setB-${partner.id}`} partner={partner} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const PartnerItemDisplay: React.FC<{ partner: PartnerItem }> = ({ partner }) => {
  const content = (
    <div className="flex items-center justify-center h-8 sm:h-10 lg:h-11 px-2 opacity-70 hover:opacity-100 transition-opacity duration-300">
      {partner.logoUrl ? (
        <img
          src={partner.logoUrl}
          alt={`Official partner — ${partner.name}`}
          className="max-h-7 sm:max-h-9 lg:max-h-10 w-auto object-contain filter grayscale brightness-200 hover:grayscale-0 transition-all duration-300"
          loading="lazy"
        />
      ) : (
        <span className="font-display text-sm sm:text-base font-bold uppercase tracking-wider text-[#94A3B8] hover:text-[#D4AF37]">
          {partner.name}
        </span>
      )}
    </div>
  );

  if (partner.websiteUrl) {
    return (
      <a
        href={partner.websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        title={partner.name}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
      >
        {content}
      </a>
    );
  }

  return content;
};

export default PartnersMarquee;
