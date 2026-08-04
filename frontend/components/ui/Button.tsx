import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  children,
  className = '',
  ...props
}) => {
  // Base classes: confident athletic typography, sharp/medium rounded, transition, focus ring
  const baseClasses =
    'inline-flex items-center justify-center font-display uppercase tracking-wider transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040914] disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs font-semibold rounded-[6px] gap-1.5 min-h-[36px]',
    md: 'px-5 py-2.5 text-sm font-bold rounded-[8px] gap-2 min-h-[44px]',
    lg: 'px-7 py-3.5 text-base font-bold rounded-[8px] gap-2.5 min-h-[52px]',
  };

  const variantClasses = {
    primary:
      'bg-[#002D62] text-white hover:bg-[#004B99] border border-transparent shadow-[0_2px_8px_rgba(0,45,98,0.4)] hover:shadow-[0_4px_16px_rgba(0,75,153,0.5)]',
    secondary:
      'bg-[#D4AF37] text-[#040914] hover:bg-[#E8C65A] border border-transparent shadow-[0_2px_10px_rgba(212,175,55,0.25)] hover:shadow-[0_4px_18px_rgba(212,175,55,0.4)] font-extrabold',
    outline:
      'bg-transparent text-white hover:text-[#D4AF37] border border-[rgba(255,255,255,0.2)] hover:border-[#D4AF37] hover:bg-[rgba(212,175,55,0.06)]',
    ghost:
      'bg-transparent text-[#94A3B8] hover:text-white hover:bg-[rgba(255,255,255,0.06)] border border-transparent',
    dark:
      'bg-[#0E182A] text-white hover:bg-[#16243D] border border-[rgba(255,255,255,0.1)] shadow-[0_2px_8px_rgba(0,0,0,0.4)]',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};

export default Button;
