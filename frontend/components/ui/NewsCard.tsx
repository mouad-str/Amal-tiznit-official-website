import React from 'react';
import Badge from './Badge';

export interface NewsCardProps {
  id?: string | number;
  category: string;
  title: string;
  date: string;
  imageUrl: string;
  summary?: string;
  variant?: 'dark' | 'light';
  onClick?: () => void;
  className?: string;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  category,
  title,
  date,
  imageUrl,
  summary,
  variant = 'dark',
  onClick,
  className = '',
}) => {
  const isDark = variant === 'dark';

  return (
    <article
      onClick={onClick}
      className={`group relative flex flex-col rounded-[12px] overflow-hidden border transition-all duration-300 cursor-pointer ${
        isDark
          ? 'bg-[#0E182A] border-[rgba(255,255,255,0.08)] hover:border-[rgba(212,175,55,0.35)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.5)]'
          : 'bg-white border-[#E2E8F0] hover:border-[#002D62] hover:shadow-[0_12px_32px_rgba(0,45,98,0.12)]'
      } ${className}`}
    >
      {/* Aspect Ratio 16:9 Image Container */}
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-[#040914]">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 z-10">
          <Badge variant={isDark ? 'accent' : 'primary'} size="sm">
            {category}
          </Badge>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex flex-col flex-grow justify-between">
        <div>
          <h3
            className={`font-display text-lg font-bold uppercase leading-snug line-clamp-2 transition-colors duration-200 ${
              isDark
                ? 'text-white group-hover:text-[#D4AF37]'
                : 'text-[#0F172A] group-hover:text-[#002D62]'
            }`}
          >
            {title}
          </h3>
          {summary && (
            <p
              className={`mt-2 text-xs line-clamp-2 leading-relaxed ${
                isDark ? 'text-[#94A3B8]' : 'text-[#475569]'
              }`}
            >
              {summary}
            </p>
          )}
        </div>

        <div className="mt-4 pt-3 border-t flex items-center justify-between border-[rgba(255,255,255,0.06)]">
          <time
            className={`text-[11px] font-display uppercase tracking-widest ${
              isDark ? 'text-[#64748B]' : 'text-[#94A3B8]'
            }`}
          >
            {date}
          </time>
          <span
            className={`text-xs font-display font-bold uppercase tracking-wider transition-transform duration-200 group-hover:translate-x-1 ${
              isDark ? 'text-[#D4AF37]' : 'text-[#002D62]'
            }`}
          >
            LIRE →
          </span>
        </div>
      </div>
    </article>
  );
};

export default NewsCard;
