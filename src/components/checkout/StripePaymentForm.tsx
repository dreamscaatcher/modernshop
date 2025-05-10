'use client';

import { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { PaymentIntent } from '@stripe/stripe-js';

interface StripePaymentFormProps {
  orderId: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

export default function StripePaymentForm({ 
  orderId,
  onSuccess,
  onError
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Create a payment intent when the component mounts
    const fetchPaymentIntent = async () => {
      try {
        const response = await fetch('/api/payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId,
            paymentMethodType: 'card',
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create payment intent');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (err: any) {
        setError(err?.message || 'An error occurred while setting up payment');
        onError(err?.message || 'An error occurred while setting up payment');
      }
    };

    fetchPaymentIntent();
  }, [orderId, onError]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      return;
    }

    if (error) {
      setError(null);
    }

    if (!cardComplete) {
      setError('Please complete your card details');
      return;
    }

    setProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (paymentError) {
        setError(paymentError.message || 'An error occurred during payment');
        onError(paymentError.message || 'An error occurred during payment');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded!
        onSuccess(paymentIntent.id);
      } else {
        setError('Payment processing failed. Please try again.');
        onError('Payment processing failed. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred');
      onError(err?.message || 'An unexpected error occurred');
    }

    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-white rounded-md shadow-sm border border-gray-200">
        <div className="mb-4">
          <label htmlFor="card-element" className="block text-sm font-medium text-gray-700 mb-2">
            Credit or debit card
          </label>
          <div className="p-3 border border-gray-300 rounded-md">
            <CardElement
              id="card-element"
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
                hidePostalCode: true,
              }}
              onChange={(e) => {
                setCardComplete(e.complete);
                if (e.error) {
                  setError(e.error.message);
                } else {
                  setError(null);
                }
              }}
            />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            For testing, use card number 4242 4242 4242 4242, any future date, any 3-digit CVC, and any postal code.
          </div>
        </div>
        
        {error && (
          <div className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img src="https://cdn.jsdelivr.net/gh/stripe/stripe-terminal-images@master/card-logos/480/visa.png" alt="Visa" className="h-6" />
          <img src="https://cdn.jsdelivr.net/gh/stripe/stripe-terminal-images@master/card-logos/480/mastercard.png" alt="Mastercard" className="h-6" />
          <img src="https://cdn.jsdelivr.net/gh/stripe/stripe-terminal-images@master/card-logos/480/amex.png" alt="American Express" className="h-6" />
          <img src="https://cdn.jsdelivr.net/gh/stripe/stripe-terminal-images@master/card-logos/480/discover.png" alt="Discover" className="h-6" />
        </div>
        <button
          type="submit"
          disabled={!stripe || processing || !cardComplete}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            (!stripe || processing || !cardComplete) && 'opacity-50 cursor-not-allowed'
          }`}
        >
          {processing ? 'Processing...' : 'Pay Now'}
        </button>
      </div>
    </form>
  );
}