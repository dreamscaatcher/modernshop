'use client';

import Link from 'next/link';
import { useCartContext } from './CartProvider';

export default function CartIcon() {
  const { cart } = useCartContext();
  
  return (
    <Link
      href="/cart"
      className="relative flex items-center p-2 ml-4"
      aria-label="View your shopping cart"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-700"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      
      {cart && cart.totalItems > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 flex items-center justify-center text-white text-xs">
          {cart.totalItems > 99 ? '99+' : cart.totalItems}
        </span>
      )}
    </Link>
  );
}