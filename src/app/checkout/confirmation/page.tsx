'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }

  interface ShippingAddress {
    name: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }

  interface OrderDetails {
    id: string;
    date: string;
    paymentStatus: string;
    paymentMethod: string;
    paymentId: string;
    shippingAddress: ShippingAddress;
    items: OrderItem[];
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  }

  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const orderId = searchParams.get('orderId');
  const paymentIntentId = searchParams.get('payment_intent');
  
  useEffect(() => {
    // In a real app, we would fetch the order details from the backend
    // based on the orderId and paymentIntentId
    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        // Mock fetch order details
        // In a real application, this would be an API call:
        // const response = await fetch(`/api/orders/${orderId}`);
        // const data = await response.json();
        
        // For demo purposes, we'll use mock data
        setTimeout(() => {
          setOrderDetails({
            id: orderId || 'order_123456789',
            date: new Date().toLocaleDateString(),
            paymentStatus: 'Paid',
            paymentMethod: 'Credit Card',
            paymentId: paymentIntentId || 'pi_123456789',
            shippingAddress: {
              name: 'John Doe',
              street: '123 Main St',
              city: 'Anytown',
              state: 'CA',
              postalCode: '12345',
              country: 'US',
            },
            items: [
              {
                id: 'item_1',
                name: 'Modern Cotton T-Shirt',
                price: 24.99,
                quantity: 2,
                image: '/placeholder.png',
              },
              {
                id: 'item_2',
                name: 'Casual Slim Fit Jeans',
                price: 49.99,
                quantity: 1,
                image: '/placeholder.png',
              },
            ],
            subtotal: 99.97,
            shipping: 5.99,
            tax: 8.25,
            total: 114.21,
          });
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to load order details');
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [orderId, paymentIntentId]);
  
  if (loading || !orderDetails) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-4">Error Loading Order</h1>
            <p className="text-gray-600 mb-6">{error}</p>
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
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600">
            Thank you for your order. We've received your payment and will start processing your order right away.
          </p>
        </div>
        
        <div className="border-t border-gray-200 pt-6 mb-6">
          <h2 className="text-lg font-medium mb-4">Order Details</h2>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Order Number</dt>
              <dd className="mt-1 text-sm text-gray-900">{orderDetails.id}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Order Date</dt>
              <dd className="mt-1 text-sm text-gray-900">{orderDetails.date}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Payment Status</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {orderDetails.paymentStatus}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
              <dd className="mt-1 text-sm text-gray-900">{orderDetails.paymentMethod}</dd>
            </div>
          </dl>
        </div>
        
        <div className="border-t border-gray-200 pt-6 mb-6">
          <h2 className="text-lg font-medium mb-4">Shipping Address</h2>
          <address className="text-sm not-italic text-gray-700">
            {orderDetails.shippingAddress.name}<br />
            {orderDetails.shippingAddress.street}<br />
            {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.postalCode}<br />
            {orderDetails.shippingAddress.country}
          </address>
        </div>
        
        <div className="border-t border-gray-200 pt-6 mb-6">
          <h2 className="text-lg font-medium mb-4">Order Summary</h2>
          <div className="space-y-4">
            {orderDetails.items.map((item) => (
              <div key={item.id} className="flex items-start">
                <div className="flex-shrink-0 w-16 h-16 border border-gray-200 rounded-md overflow-hidden">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={64}
                      height={64}
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
                      {item.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <p className="text-gray-600">Subtotal</p>
              <p className="font-medium text-gray-900">${orderDetails.subtotal.toFixed(2)}</p>
            </div>
            <div className="flex justify-between text-sm">
              <p className="text-gray-600">Shipping</p>
              <p className="font-medium text-gray-900">${orderDetails.shipping.toFixed(2)}</p>
            </div>
            <div className="flex justify-between text-sm">
              <p className="text-gray-600">Tax</p>
              <p className="font-medium text-gray-900">${orderDetails.tax.toFixed(2)}</p>
            </div>
            <div className="flex justify-between text-base font-medium pt-2 border-t border-gray-200">
              <p className="text-gray-900">Total</p>
              <p className="text-gray-900">${orderDetails.total.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
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