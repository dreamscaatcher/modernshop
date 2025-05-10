'use client';

import { useCartContext } from '@/components/cart/CartProvider';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { BannerPosition } from '@prisma/client';
import { PositionedBanners } from '@/components/banners/PositionedBanners';

export default function CartPage() {
  const { cart, loading, error, updateCartItem, removeFromCart, clearCart } = useCartContext();
  const { status } = useSession();
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    await updateCartItem(itemId, newQuantity);
  };

  const handleRemoveItem = async (itemId: string) => {
    await removeFromCart(itemId);
  };

  const handleClearCart = async () => {
    await clearCart();
  };

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      setPromoError('Please enter a promotion code');
      setPromoSuccess('');
      return;
    }

    // Demo functionality - in a real app, this would validate against a database
    if (promoCode.toUpperCase() === 'SAVE10') {
      setPromoSuccess('10% discount applied!');
      setPromoError('');
    } else {
      setPromoError('Invalid promotion code');
      setPromoSuccess('');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-8">Your Shopping Bag</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-8">Your Shopping Bag</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-lg mb-4">Please sign in to view your cart.</p>
          <Link
            href="/auth/login"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-8">Your Shopping Bag</h1>
        <div className="bg-red-100 p-4 rounded-md">
          <p className="text-red-700">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-8">Your Shopping Bag</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-lg mb-4">Your cart is empty.</p>
          <Link
            href="/shop"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Shopping Bag</h1>
        <Link
          href="/shop"
          className="text-blue-600 hover:underline"
        >
          &larr; Continue shopping
        </Link>
      </div>

      {/* Cart banner for special offers */}
      <div className="mb-6">
        <PositionedBanners position={BannerPosition.CART_PAGE} />
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        {/* Cart Items Section */}
        <div className="lg:col-span-8">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="border-b border-gray-200 py-4 px-6 hidden md:grid md:grid-cols-12 text-sm text-gray-600 uppercase">
              <div className="md:col-span-6">Item</div>
              <div className="md:col-span-2 text-center">Price</div>
              <div className="md:col-span-2 text-center">Quantity</div>
              <div className="md:col-span-2 text-center">Total</div>
            </div>

            {cart.items.map((item) => (
              <div key={item.id} className="border-b border-gray-200 py-4 px-6">
                <div className="md:grid md:grid-cols-12 md:gap-4">
                  {/* Item Details (mobile and desktop) */}
                  <div className="md:col-span-6">
                    <div className="flex">
                      <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        {item.product.images && item.product.images.length > 0 ? (
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            width={96}
                            height={96}
                            className="h-full w-full object-cover object-center"
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-xs">No image</span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex flex-col">
                        <h3 className="text-base font-medium text-gray-900">
                          {item.product.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                          {item.product.description}
                        </p>
                        <div className="mt-auto flex">
                          <button
                            type="button"
                            className="text-sm font-medium text-blue-600 hover:text-blue-500 mr-4"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            Remove
                          </button>
                          <button
                            type="button"
                            className="text-sm font-medium text-blue-600 hover:text-blue-500"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price (desktop) */}
                  <div className="hidden md:flex md:col-span-2 md:items-center md:justify-center">
                    <span className="text-gray-900">${item.product.price.toFixed(2)}</span>
                  </div>

                  {/* Quantity (desktop) */}
                  <div className="hidden md:flex md:col-span-2 md:items-center md:justify-center">
                    <div className="flex items-center border border-gray-300 rounded">
                      <button
                        type="button"
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-700"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                        className="w-12 h-8 text-center focus:outline-none"
                      />
                      <button
                        type="button"
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-700"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Total (desktop) */}
                  <div className="hidden md:flex md:col-span-2 md:items-center md:justify-center">
                    <span className="text-gray-900 font-medium">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  {/* Mobile price, quantity, total */}
                  <div className="md:hidden mt-4 grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs text-gray-500">Price</div>
                      <div className="mt-1">${item.product.price.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Quantity</div>
                      <div className="mt-1 flex items-center border border-gray-300 rounded">
                        <button
                          type="button"
                          className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-700"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                          className="w-8 h-6 text-center focus:outline-none text-sm"
                        />
                        <button
                          type="button"
                          className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-700"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Total</div>
                      <div className="mt-1 font-medium">${(item.product.price * item.quantity).toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="px-6 py-4 flex justify-between">
              <button
                type="button"
                onClick={handleClearCart}
                className="text-sm text-red-600 hover:text-red-500"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>

        {/* Order Summary Section */}
        <div className="lg:col-span-4 mt-8 lg:mt-0">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
            
            <div className="mt-6 border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-base text-gray-600">Subtotal</span>
                <span className="text-base font-medium text-gray-900">
                  ${cart.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-base text-gray-600">Shipping</span>
                <span className="text-base font-medium text-gray-900">Calculated at checkout</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-base text-gray-600">Tax</span>
                <span className="text-base font-medium text-gray-900">Calculated at checkout</span>
              </div>
              
              {/* Promotion Code */}
              <div className="mt-6 mb-6">
                <label htmlFor="promo-code" className="block text-sm font-medium text-gray-700 mb-2">
                  Promotion Code
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="promo-code"
                    name="promo-code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 min-w-0 block w-full px-3 py-2 border border-gray-300 rounded-l-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter code"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Apply
                  </button>
                </div>
                {promoError && (
                  <p className="mt-2 text-sm text-red-600">{promoError}</p>
                )}
                {promoSuccess && (
                  <p className="mt-2 text-sm text-green-600">{promoSuccess}</p>
                )}
              </div>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-bold text-gray-900">Estimated Total</span>
                  <span className="text-lg font-bold text-gray-900">
                    ${cart.subtotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <Link
                href="/checkout"
                className="w-full bg-blue-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center"
              >
                Checkout
              </Link>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Need Help? <a href="#" className="text-blue-600 hover:text-blue-500">Contact Customer Support</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}