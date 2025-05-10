'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Cart } from '@/lib/hooks/useCart';

interface OrderSummaryProps {
  cart: Cart;
}

export default function OrderSummary({ cart }: OrderSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [discount, setDiscount] = useState(0);

  // Hardcoded shipping options for demo purposes
  const shippingOptions = [
    { id: 'standard', name: 'Standard Shipping', price: 5.99, description: 'Delivery in 3-5 business days' },
    { id: 'express', name: 'Express Shipping', price: 12.99, description: 'Delivery in 1-2 business days' },
    { id: 'overnight', name: 'Overnight Shipping', price: 24.99, description: 'Next business day delivery' },
  ];

  const [selectedShipping, setSelectedShipping] = useState(shippingOptions[0]);

  const subtotal = cart.subtotal;
  const shipping = selectedShipping.price;
  const tax = Math.round(subtotal * 0.0825 * 100) / 100; // Assuming 8.25% tax rate
  const total = subtotal + shipping + tax - discount;

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      setPromoError('Please enter a promotion code');
      setPromoSuccess('');
      setDiscount(0);
      return;
    }

    // Demo functionality - in a real app, this would validate against a database
    if (promoCode.toUpperCase() === 'SAVE10') {
      const discountAmount = Math.round(subtotal * 0.1 * 100) / 100; // 10% discount
      setDiscount(discountAmount);
      setPromoSuccess(`10% discount applied: -$${discountAmount.toFixed(2)}`);
      setPromoError('');
    } else if (promoCode.toUpperCase() === 'FREESHIP') {
      setDiscount(selectedShipping.price);
      setPromoSuccess(`Free shipping applied: -$${selectedShipping.price.toFixed(2)}`);
      setPromoError('');
    } else {
      setPromoError('Invalid promotion code');
      setPromoSuccess('');
      setDiscount(0);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
      
      <div className="mt-6 flex justify-between">
        <button 
          type="button"
          className="text-sm text-blue-600 flex items-center"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              <span>Hide order details</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </>
          ) : (
            <>
              <span>Show order details</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </>
          )}
        </button>
        <span className="text-sm text-gray-700">{cart.items.length} items</span>
      </div>
      
      {isExpanded && (
        <div className="mt-4 space-y-4 max-h-60 overflow-y-auto">
          {cart.items.map((item) => (
            <div key={item.id} className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 border border-gray-200 rounded-md overflow-hidden">
                {item.product.images && item.product.images.length > 0 ? (
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    width={48}
                    height={48}
                    className="h-full w-full object-cover object-center"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-xs">No image</span>
                  </div>
                )}
              </div>
              <div className="ml-4 flex-1 flex justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {item.product.name}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6 border-t border-gray-200 pt-4">
        <h3 className="text-base font-medium text-gray-900 mb-4">Shipping</h3>
        
        <div className="space-y-4">
          {shippingOptions.map((option) => (
            <div key={option.id} className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id={`shipping-${option.id}`}
                  name="shipping-option"
                  type="radio"
                  checked={selectedShipping.id === option.id}
                  onChange={() => {
                    setSelectedShipping(option);
                    // If free shipping promo is applied, update the discount
                    if (promoCode.toUpperCase() === 'FREESHIP' && promoSuccess) {
                      setDiscount(option.price);
                      setPromoSuccess(`Free shipping applied: -$${option.price.toFixed(2)}`);
                    }
                  }}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 text-sm flex-1">
                <label htmlFor={`shipping-${option.id}`} className="font-medium text-gray-700 flex justify-between">
                  <span>{option.name}</span>
                  <span>${option.price.toFixed(2)}</span>
                </label>
                <p className="text-gray-500">{option.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Subtotal</span>
          <span className="text-sm font-medium text-gray-900">
            ${subtotal.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Shipping</span>
          <span className="text-sm font-medium text-gray-900">
            ${shipping.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Tax</span>
          <span className="text-sm font-medium text-gray-900">
            ${tax.toFixed(2)}
          </span>
        </div>
        
        {discount > 0 && (
          <div className="flex justify-between items-center mb-2 text-green-600">
            <span className="text-sm">Discount</span>
            <span className="text-sm font-medium">
              -${discount.toFixed(2)}
            </span>
          </div>
        )}
        
        {/* Promotion Code */}
        <div className="mt-4 mb-4">
          <label htmlFor="checkout-promo-code" className="block text-sm font-medium text-gray-700 mb-2">
            Promotion Code
          </label>
          <div className="flex">
            <input
              type="text"
              id="checkout-promo-code"
              name="checkout-promo-code"
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
          <div className="flex justify-between items-center">
            <span className="text-base font-bold text-gray-900">Total</span>
            <span className="text-base font-bold text-gray-900">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}