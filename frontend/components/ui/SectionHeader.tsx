import React from 'react';

export interface SectionHeaderProps {
  overline?: string;
  title: string;
  subtitle?: string;
  actionText?: string;
  actionHref?: string;
  onActionClick?: () => void;
  align?: 'left' | 'center' | 'between';
  theme?: 'dark' | 'light';
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  overline,
  title,
  subtitle,
  actionText,
  actionHref,
  onActionClick,
  align = 'between',
  theme = 'dark',
  className = '',
}) => {
  const titleColor = theme === 'dark' ? 'text-white' : 'text-[#0F172A]';
  const subtitleColor = theme === 'dark' ? 'text-[#94A3B8]' : 'text-[#475569]';

  return (
    <div
      className={`mb-8 sm:mb-12 flex flex-col ${
        align === 'center'
          ? 'items-center text-center'
          : align === 'between'
          ? 'sm:flex-row sm:items-end sm:justify-between'
          : 'items-start text-left'
      } gap-4 ${className}`}
    >
      <div className={align === 'center' ? 'max-w-2xl' : ''}>
        {overline && (
          <span className="usat-overline block mb-2 font-display text-xs font-bold tracking-[0.15em] text-[#D4AF37] uppercase">
            {overline}
          </span>
        )}
        <h2 className={`usat-h1 ${titleColor} tracking-tight uppercase font-display font-bold`}>
          {title}
        </h2>
        {subtitle && (
          <p className={`usat-body mt-2 ${subtitleColor} max-w-xl`}>{subtitle}</p>
        )}
      </div>

      {actionText && (
        <div className="shrink-0 mt-2 sm:mt-0">
          {actionHref ? (
            <a
              href={actionHref}
              className="inline-flex items-center gap-2 font-display text-xs font-bold tracking-widest text-[#D4AF37] hover:text-white uppercase transition-colors duration-200 group"
            >
              <span>{actionText}</span>
              <span className="transform transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </a>
          ) : (
            <button
              onClick={onActionClick}
              className="inline-flex items-center gap-2 font-display text-xs font-bold tracking-widest text-[#D4AF37] hover:text-white uppercase transition-colors duration-200 group focus:outline-none"
            >
              <span>{actionText}</span>
              <span className="transform transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SectionHeader;
