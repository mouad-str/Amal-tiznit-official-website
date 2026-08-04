import React from 'react';
import Badge from './Badge';
import Button from './Button';

export interface ProductCardProps {
  id?: string | number;
  name: string;
  category: string;
  price: number | string;
  currency?: string;
  imageUrl: string;
  isNew?: boolean;
  onAddToCart?: () => void;
  onClick?: () => void;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  name,
  category,
  price,
  currency = 'DH',
  imageUrl,
  isNew = false,
  onAddToCart,
  onClick,
  className = '',
}) => {
  return (
    <div
      onClick={onClick}
      className={`group relative flex flex-col rounded-[12px] bg-white text-[#0F172A] border border-[#E2E8F0] overflow-hidden transition-all duration-300 hover:border-[#002D62] hover:shadow-[0_12px_32px_rgba(0,45,98,0.12)] cursor-pointer ${className}`}
    >
      {/* Square 1:1 Image ratio */}
      <div className="relative w-full aspect-square bg-[#F8FAFC] overflow-hidden flex items-center justify-center p-4">
        {isNew && (
          <div className="absolute top-3 left-3 z-10">
            <Badge variant="accent" size="sm">
              NOUVEAU
            </Badge>
          </div>
        )}

        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Product Information */}
      <div className="p-5 flex flex-col flex-grow justify-between bg-white">
        <div>
          <span className="text-[11px] font-display font-bold uppercase tracking-widest text-[#64748B] block mb-1">
            {category}
          </span>
          <h3 className="font-display text-base font-bold uppercase text-[#0F172A] line-clamp-1 group-hover:text-[#002D62] transition-colors duration-200">
            {name}
          </h3>
        </div>

        <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="font-display text-xl font-extrabold text-[#002D62]">
              {price}
            </span>
            <span className="font-display text-xs font-bold text-[#64748B]">
              {currency}
            </span>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart?.();
            }}
          >
            ACHETER
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
