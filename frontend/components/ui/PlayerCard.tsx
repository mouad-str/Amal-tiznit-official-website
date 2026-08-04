import React from 'react';

export interface PlayerCardProps {
  id?: string | number;
  number: number | string;
  name: string;
  position: string;
  imageUrl: string;
  matches?: number;
  goals?: number;
  assists?: number;
  nationality?: string;
  onClick?: () => void;
  className?: string;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  number,
  name,
  position,
  imageUrl,
  matches,
  goals,
  nationality = 'MAR',
  onClick,
  className = '',
}) => {
  return (
    <div
      onClick={onClick}
      className={`group relative rounded-[12px] overflow-hidden bg-[#0E182A] border border-[rgba(255,255,255,0.1)] transition-all duration-300 hover:border-[#D4AF37] hover:shadow-[0_12px_32px_rgba(0,0,0,0.6)] cursor-pointer select-none ${className}`}
    >
      {/* 3:4 Aspect Ratio Image Box */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-gradient-to-b from-[#040914] via-[#0E182A] to-[#040914]">
        {/* Large Background Player Squad Number */}
        <span className="absolute -top-4 -right-4 font-display text-8xl font-black text-white/5 group-hover:text-[#D4AF37]/15 transition-all duration-500 ease-out transform group-hover:scale-110 pointer-events-none z-0">
          {number}
        </span>

        {/* Player Cutout / Photo */}
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105 relative z-10"
          loading="lazy"
        />

        {/* Dark Gradient Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#040914] via-[#040914]/40 to-transparent z-20 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-30">
          <span className="bg-[#002D62] text-white font-display text-xs font-bold px-2.5 py-1 rounded-[4px] border border-[rgba(255,255,255,0.15)] shadow-md">
            #{number}
          </span>
          <span className="text-[10px] font-display font-bold text-[#D4AF37] bg-[#0E182A]/80 backdrop-blur-md px-2 py-0.5 rounded-[4px] border border-[rgba(212,175,55,0.3)]">
            {nationality}
          </span>
        </div>

        {/* Foreground Meta Overlay */}
        <div className="absolute bottom-0 inset-x-0 p-5 z-30 flex flex-col justify-end">
          <span className="usat-overline text-[#D4AF37] text-xs font-bold tracking-widest block mb-1">
            {position}
          </span>
          <h3 className="usat-h2 text-white font-display uppercase font-bold leading-tight group-hover:text-[#D4AF37] transition-colors duration-200">
            {name}
          </h3>

          {/* Hover Reveal Stats (Matches / Goals) */}
          {(matches !== undefined || goals !== undefined) && (
            <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.1)] grid grid-cols-2 gap-2 max-h-0 opacity-0 group-hover:max-h-20 group-hover:opacity-100 transition-all duration-300 ease-out overflow-hidden">
              {matches !== undefined && (
                <div>
                  <span className="block text-[10px] text-[#94A3B8] font-display uppercase tracking-wider">
                    Matchs
                  </span>
                  <span className="font-display text-sm font-bold text-white">
                    {matches}
                  </span>
                </div>
              )}
              {goals !== undefined && (
                <div>
                  <span className="block text-[10px] text-[#94A3B8] font-display uppercase tracking-wider">
                    Buts
                  </span>
                  <span className="font-display text-sm font-bold text-[#D4AF37]">
                    {goals}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
