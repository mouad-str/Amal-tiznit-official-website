import React from 'react';

export interface BadgeProps {
  variant?: 'primary' | 'accent' | 'outline' | 'dark' | 'success' | 'warning' | 'live';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
}) => {
  const baseClasses =
    'inline-flex items-center font-display uppercase tracking-widest leading-none rounded-[4px] select-none';

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] font-semibold',
    md: 'px-2.5 py-1 text-xs font-bold',
  };

  const variantClasses = {
    primary: 'bg-[#002D62] text-white border border-[rgba(255,255,255,0.15)]',
    accent: 'bg-[#D4AF37] text-[#040914] font-extrabold',
    outline: 'bg-transparent text-[#94A3B8] border border-[rgba(255,255,255,0.2)]',
    dark: 'bg-[#0E182A] text-[#94A3B8] border border-[rgba(255,255,255,0.08)]',
    success: 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40',
    warning: 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40',
    live: 'bg-[#9E1B1B] text-white border border-[#EF4444] animate-pulse',
  };

  return (
    <span className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      {variant === 'live' && (
        <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-ping inline-block" />
      )}
      {children}
    </span>
  );
};

export default Badge;
