import React from 'react';

export interface StatCardProps {
  value: string | number;
  label: string;
  sublabel?: string;
  trend?: string;
  variant?: 'dark' | 'light' | 'gold';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  sublabel,
  trend,
  variant = 'dark',
  className = '',
}) => {
  const isGold = variant === 'gold';
  const isLight = variant === 'light';

  return (
    <div
      className={`relative p-6 sm:p-8 rounded-[12px] flex flex-col justify-between transition-all duration-300 border ${
        isGold
          ? 'bg-gradient-to-br from-[#D4AF37] to-[#AA871D] text-[#040914] border-[#E8C65A] shadow-[0_8px_24px_rgba(212,175,55,0.25)]'
          : isLight
          ? 'bg-white text-[#0F172A] border-[#E2E8F0] shadow-sm hover:shadow-md'
          : 'bg-[#0E182A] text-white border-[rgba(255,255,255,0.1)] hover:border-[#D4AF37]/40 shadow-sm hover:shadow-md'
      } ${className}`}
    >
      <div>
        <div className="flex items-baseline justify-between gap-2">
          <span
            className={`font-display text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-none ${
              isGold
                ? 'text-[#040914]'
                : isLight
                ? 'text-[#002D62]'
                : 'text-[#D4AF37]'
            }`}
          >
            {value}
          </span>
          {trend && (
            <span
              className={`text-xs font-display font-bold px-2 py-0.5 rounded-[4px] ${
                isGold
                  ? 'bg-[#040914] text-[#D4AF37]'
                  : 'bg-[#10B981]/20 text-[#10B981]'
              }`}
            >
              {trend}
            </span>
          )}
        </div>

        <h4
          className={`usat-h3 mt-3 font-display uppercase tracking-wider font-bold ${
            isGold
              ? 'text-[#040914]'
              : isLight
              ? 'text-[#0F172A]'
              : 'text-white'
          }`}
        >
          {label}
        </h4>
      </div>

      {sublabel && (
        <p
          className={`text-xs mt-3 pt-3 border-t ${
            isGold
              ? 'border-[#040914]/20 text-[#040914]/80'
              : isLight
              ? 'border-[#E2E8F0] text-[#64748B]'
              : 'border-[rgba(255,255,255,0.08)] text-[#94A3B8]'
          }`}
        >
          {sublabel}
        </p>
      )}
    </div>
  );
};

export default StatCard;
