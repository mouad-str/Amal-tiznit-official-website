import React from 'react';
import Badge from './Badge';
import Button from './Button';

export interface MatchCardProps {
  id?: string | number;
  competition: string;
  homeTeam: { name: string; logoUrl?: string; isUsat?: boolean };
  awayTeam: { name: string; logoUrl?: string; isUsat?: boolean };
  homeScore?: number | null;
  awayScore?: number | null;
  status: 'UPCOMING' | 'FINISHED' | 'LIVE';
  date: string;
  time?: string;
  stadium: string;
  ticketAvailable?: boolean;
  onCtaClick?: () => void;
  className?: string;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  competition,
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  status,
  date,
  time,
  stadium,
  ticketAvailable = false,
  onCtaClick,
  className = '',
}) => {
  const isFinished = status === 'FINISHED';
  const isLive = status === 'LIVE';

  return (
    <div
      className={`relative flex flex-col rounded-[12px] bg-[#0E182A] border border-[rgba(255,255,255,0.1)] p-5 sm:p-6 transition-all duration-300 hover:border-[#D4AF37]/40 hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)] ${className}`}
    >
      {/* Top Header: Competition & Status */}
      <div className="flex items-center justify-between pb-4 border-b border-[rgba(255,255,255,0.08)]">
        <Badge variant="outline" size="sm">
          {competition}
        </Badge>

        {isLive ? (
          <Badge variant="live" size="sm">
            EN DIRECT
          </Badge>
        ) : isFinished ? (
          <Badge variant="dark" size="sm">
            TERMINÉ
          </Badge>
        ) : (
          <Badge variant="accent" size="sm">
            PROCHAIN MATCH
          </Badge>
        )}
      </div>

      {/* Main Teams & Score Display */}
      <div className="py-6 flex items-center justify-between gap-4">
        {/* Home Team */}
        <div className="flex flex-col items-center text-center flex-1">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#16243D] border border-[rgba(255,255,255,0.1)] flex items-center justify-center p-2.5 shadow-md mb-2">
            {homeTeam.logoUrl ? (
              <img src={homeTeam.logoUrl} alt={homeTeam.name} className="w-full h-full object-contain" />
            ) : (
              <span className="font-display font-bold text-sm text-[#D4AF37]">
                {homeTeam.name.substring(0, 3).toUpperCase()}
              </span>
            )}
          </div>
          <span className={`font-display text-sm sm:text-base font-bold uppercase tracking-wide ${homeTeam.isUsat ? 'text-[#D4AF37]' : 'text-white'}`}>
            {homeTeam.name}
          </span>
        </div>

        {/* Score or VS Display */}
        <div className="flex flex-col items-center justify-center px-2">
          {isFinished || isLive ? (
            <div className="flex items-center gap-2 sm:gap-3 bg-[#040914] px-4 py-2 rounded-[8px] border border-[rgba(212,175,55,0.2)]">
              <span className="font-display text-2xl sm:text-3xl font-bold text-white">
                {homeScore ?? 0}
              </span>
              <span className="font-display text-lg text-[#D4AF37]">—</span>
              <span className="font-display text-2xl sm:text-3xl font-bold text-white">
                {awayScore ?? 0}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="font-display text-2xl sm:text-3xl font-extrabold text-[#D4AF37] tracking-wider">
                VS
              </span>
              {time && (
                <span className="font-display text-xs font-semibold text-[#94A3B8] mt-1">
                  {time}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center text-center flex-1">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#16243D] border border-[rgba(255,255,255,0.1)] flex items-center justify-center p-2.5 shadow-md mb-2">
            {awayTeam.logoUrl ? (
              <img src={awayTeam.logoUrl} alt={awayTeam.name} className="w-full h-full object-contain" />
            ) : (
              <span className="font-display font-bold text-sm text-[#D4AF37]">
                {awayTeam.name.substring(0, 3).toUpperCase()}
              </span>
            )}
          </div>
          <span className={`font-display text-sm sm:text-base font-bold uppercase tracking-wide ${awayTeam.isUsat ? 'text-[#D4AF37]' : 'text-white'}`}>
            {awayTeam.name}
          </span>
        </div>
      </div>

      {/* Footer Meta & CTA */}
      <div className="pt-4 border-t border-[rgba(255,255,255,0.08)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#94A3B8]">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <span>📅 {date}</span>
          <span>📍 {stadium}</span>
        </div>

        <div>
          {ticketAvailable ? (
            <Button variant="secondary" size="sm" onClick={onCtaClick}>
              BILLETS
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={onCtaClick}>
              DÉTAILS
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
