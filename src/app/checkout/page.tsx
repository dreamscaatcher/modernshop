'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useCartContext } from '@/components/cart/CartProvider';
import Link from 'next/link';
import Image from 'next/image';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import OrderSummary from '@/components/checkout/OrderSummary';

export default function CheckoutPage() {
  const { status } = useSession();
  const { cart, loading, error } = useCartContext();

  // Use string type without restrictions to avoid TypeScript errors
  const [checkoutStep, setCheckoutStep] = useState('shipping');

  // Helper function to check current step
  const isCurrentStep = (step: string) => checkoutStep === step;

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-8">Checkout</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-8">Checkout</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-lg mb-4">Please sign in to proceed with checkout.</p>
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
        <h1 className="text-2xl font-bold mb-8">Checkout</h1>
        <div className="bg-red-100 p-4 rounded-md">
          <p className="text-red-700">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-8">Checkout</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-lg mb-4">Your cart is empty. Add some products before checking out.</p>
          <Link
            href="/shop"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700"
          >
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  // For demo purposes, we'll show a success message when reaching the review step
  if (isCurrentStep('review')) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-4">Order Placed Successfully!</h1>
            <p className="text-gray-600 mb-6">
              Thank you for your order. We've received your payment and will start processing your order right away.
            </p>
            <p className="text-gray-600 mb-8">
              Order number: <span className="font-medium">ORD-{Math.floor(100000 + Math.random() * 900000)}</span>
            </p>
            <Link
              href="/shop"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      {/* Checkout Steps */}
      <div className="mb-8">
        <ol className="flex items-center w-full text-sm font-medium text-gray-500 sm:text-base">
          <li className={`flex items-center ${isCurrentStep('shipping') ? 'text-blue-600' : ''}`}>
            <span className={`flex items-center justify-center w-8 h-8 mr-2 text-xs border rounded-full shrink-0 ${
              isCurrentStep('shipping') ? 'border-blue-600 text-blue-600' : ''
            }`}>
              1
            </span>
            Shipping
            <svg className="w-4 h-4 ml-2 sm:ml-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 12 10">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 5 4 4 6-8"/>
            </svg>
          </li>
          <li className={`flex items-center ${isCurrentStep('payment') ? 'text-blue-600' : ''}`}>
            <span className={`flex items-center justify-center w-8 h-8 mr-2 text-xs border rounded-full shrink-0 ${
              isCurrentStep('payment') ? 'border-blue-600 text-blue-600' : ''
            }`}>
              2
            </span>
            Payment
            <svg className="w-4 h-4 ml-2 sm:ml-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 12 10">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 5 4 4 6-8"/>
            </svg>
          </li>
          <li className={`flex items-center ${isCurrentStep('review') ? 'text-blue-600' : ''}`}>
            <span className={`flex items-center justify-center w-8 h-8 mr-2 text-xs border rounded-full shrink-0 ${
              isCurrentStep('review') ? 'border-blue-600 text-blue-600' : ''
            }`}>
              3
            </span>
            Review
          </li>
        </ol>
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        {/* Checkout Form Section */}
        <div className="lg:col-span-8">
          <CheckoutForm 
            currentStep={checkoutStep} 
            onComplete={() => {
              if (isCurrentStep('shipping')) {
                setCheckoutStep('payment');
              } else if (isCurrentStep('payment')) {
                setCheckoutStep('review');
              }
            }}
          />
        </div>

        {/* Order Summary Section */}
        <div className="lg:col-span-4 mt-8 lg:mt-0">
          <OrderSummary cart={cart} />
          
          <div className="mt-6 bg-gray-50 p-4 rounded-md">
            <h3 className="text-base font-medium text-gray-900 mb-2">Need Help?</h3>
            <p className="text-sm text-gray-600 mb-2">
              We're available 24/7 to help with your order.
            </p>
            <div className="flex flex-col space-y-2">
              <a href="#" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Us
              </a>
              <a href="#" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call Us
              </a>
              <a href="#" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Live Chat
              </a>
            </div>
          </div>

          <div className="mt-6 bg-white border border-gray-200 p-4 rounded-md">
            <h3 className="text-base font-medium text-gray-900 mb-2">Shipping Options</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Free standard shipping on orders over $50
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Express shipping available
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                International shipping to select countries
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}