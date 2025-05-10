'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BannerPosition, TargetAudience } from '@prisma/client';

export interface PromotionalBannerProps {
  id: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  position: BannerPosition;
  discount?: number | null;
  promoCode?: string | null;
}

export function PromotionalBanner({
  id,
  title,
  description,
  imageUrl,
  linkUrl,
  position,
  discount,
  promoCode,
}: PromotionalBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  // Determine banner styling based on position
  const getBannerStyle = () => {
    switch (position) {
      case BannerPosition.HOME_TOP:
      case BannerPosition.SHOP_PAGE:
        return 'w-full rounded-md overflow-hidden';
      case BannerPosition.HOME_BOTTOM:
        return 'w-full rounded-lg overflow-hidden bg-gradient-to-r from-indigo-700 to-purple-700';
      case BannerPosition.PRODUCT_PAGE:
        return 'w-full rounded-md overflow-hidden border border-gray-200';
      case BannerPosition.CART_PAGE:
      case BannerPosition.CHECKOUT_PAGE:
        return 'w-full rounded-md overflow-hidden bg-indigo-50 border border-indigo-100';
      default:
        return 'w-full rounded-md overflow-hidden';
    }
  };

  // Wrap content in link if linkUrl is provided
  const BannerContent = () => (
    <div className="relative w-full">
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-auto object-cover"
      />
      <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-4 md:p-6">
        <h3 className="text-white text-lg md:text-xl font-bold">{title}</h3>
        {description && (
          <p className="text-white text-sm md:text-base mt-1 max-w-2xl">
            {description}
          </p>
        )}
        {discount && (
          <div className="mt-2 bg-red-600 text-white inline-block px-2 py-1 rounded font-bold text-sm">
            SAVE {discount}%
          </div>
        )}
        {promoCode && (
          <div className="mt-2 text-white">
            <span className="font-normal text-sm">Use code: </span>
            <span className="font-mono font-bold bg-white text-black px-2 py-1 rounded text-sm">
              {promoCode}
            </span>
          </div>
        )}
      </div>
      
      {/* Dismiss button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDismissed(true);
        }}
        className="absolute top-2 right-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-1"
        aria-label="Dismiss"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-4 w-4" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M6 18L18 6M6 6l12 12" 
          />
        </svg>
      </button>
    </div>
  );

  return (
    <div className={getBannerStyle()}>
      {linkUrl ? (
        <Link href={linkUrl} className="block">
          <BannerContent />
        </Link>
      ) : (
        <BannerContent />
      )}
    </div>
  );
}