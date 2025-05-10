'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useCart, Cart, CartItem } from '@/lib/hooks/useCart';

type CartContextType = {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  addToCart: (productId: string, quantity?: number) => Promise<Cart | null>;
  updateCartItem: (itemId: string, quantity: number) => Promise<Cart | null>;
  removeFromCart: (itemId: string) => Promise<Cart | null>;
  clearCart: () => Promise<Cart | null>;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const {
    cart,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCart: refreshCart,
  } = useCart();

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
}