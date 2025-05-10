import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export type CartItem = {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    stock: number;
  };
};

export type Cart = {
  id: string;
  items: CartItem[];
  subtotal: number;
  totalItems: number;
};

export function useCart() {
  const { data: session, status } = useSession();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch the cart from the API
  const fetchCart = useCallback(async () => {
    if (status !== 'authenticated') return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/cart');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch cart');
      }
      
      const data = await response.json();
      setCart(data.cart);
    } catch (err: any) {
      setError(err?.message || 'An error occurred while fetching the cart');
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  }, [status]);

  // Add an item to the cart
  const addToCart = useCallback(async (productId: string, quantity: number = 1) => {
    if (status !== 'authenticated') return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add item to cart');
      }
      
      const data = await response.json();
      setCart(data.cart);
      return data.cart;
    } catch (err: any) {
      setError(err?.message || 'An error occurred while adding to cart');
      console.error('Error adding to cart:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [status]);

  // Update cart item quantity
  const updateCartItem = useCallback(async (itemId: string, quantity: number) => {
    if (status !== 'authenticated') return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update cart item');
      }
      
      const data = await response.json();
      setCart(data.cart);
      return data.cart;
    } catch (err: any) {
      setError(err?.message || 'An error occurred while updating cart item');
      console.error('Error updating cart item:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [status]);

  // Remove an item from the cart
  const removeFromCart = useCallback(async (itemId: string) => {
    if (status !== 'authenticated') return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove item from cart');
      }
      
      const data = await response.json();
      setCart(data.cart);
      return data.cart;
    } catch (err: any) {
      setError(err?.message || 'An error occurred while removing from cart');
      console.error('Error removing from cart:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [status]);

  // Clear the entire cart
  const clearCart = useCallback(async () => {
    if (status !== 'authenticated') return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/cart/clear', {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to clear cart');
      }
      
      const data = await response.json();
      setCart(data.cart);
      return data.cart;
    } catch (err: any) {
      setError(err?.message || 'An error occurred while clearing the cart');
      console.error('Error clearing cart:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [status]);

  // Fetch the cart when the session changes
  useEffect(() => {
    if (status === 'authenticated') {
      fetchCart();
    } else if (status === 'unauthenticated') {
      setCart(null);
    }
  }, [status, fetchCart]);

  return {
    cart,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCart,
  };
}