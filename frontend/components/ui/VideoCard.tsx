import React from 'react';
import Badge from './Badge';

export interface VideoCardProps {
  id?: string | number;
  title: string;
  category?: string;
  duration: string;
  thumbnailUrl: string;
  date?: string;
  onClick?: () => void;
  className?: string;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  title,
  category = 'USAT TV',
  duration,
  thumbnailUrl,
  date,
  onClick,
  className = '',
}) => {
  return (
    <div
      onClick={onClick}
      className={`group relative flex flex-col rounded-[12px] overflow-hidden bg-[#0E182A] border border-[rgba(255,255,255,0.08)] transition-all duration-300 hover:border-[#D4AF37] hover:shadow-[0_12px_32px_rgba(0,0,0,0.6)] cursor-pointer ${className}`}
    >
      {/* 16:9 Thumbnail Container */}
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-[#040914]">
        <img
          src={thumbnailUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E182A] via-transparent to-black/30" />

        {/* Category & Duration Badges */}
        <div className="absolute top-3 left-3 z-10">
          <Badge variant="primary" size="sm">
            {category}
          </Badge>
        </div>

        <div className="absolute bottom-3 right-3 z-10">
          <span className="bg-black/80 backdrop-blur-sm text-white font-display text-[11px] font-bold px-2 py-0.5 rounded-[4px] border border-white/10">
            {duration}
          </span>
        </div>

        {/* Play Icon Centered */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-12 h-12 rounded-full bg-[#D4AF37] text-[#040914] flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:bg-white">
            <svg
              className="w-5 h-5 ml-0.5 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Title & Metadata */}
      <div className="p-4 flex flex-col justify-between flex-grow">
        <h4 className="font-display text-sm font-bold uppercase text-white leading-snug line-clamp-2 group-hover:text-[#D4AF37] transition-colors duration-200">
          {title}
        </h4>
        {date && (
          <span className="mt-3 text-[11px] font-display uppercase tracking-widest text-[#64748B]">
            {date}
          </span>
        )}
      </div>
    </div>
  );
};

export default VideoCard;
