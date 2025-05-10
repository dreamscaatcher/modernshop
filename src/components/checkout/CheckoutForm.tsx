'use client';

import { useState } from 'react';
import StripeProvider from './StripeProvider';
import StripePaymentForm from './StripePaymentForm';

interface CheckoutFormProps {
  currentStep: string;
  onComplete: () => void;
}

export default function CheckoutForm({ currentStep, onComplete }: CheckoutFormProps) {
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    phone: '',
    email: '',
    saveAddress: false,
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    nameOnCard: '',
    expiryDate: '',
    cvv: '',
    saveCard: false,
    sameAsShipping: true,
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZipCode: '',
    billingCountry: 'US',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setShippingInfo({
      ...shippingInfo,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    if (name === 'sameAsShipping' && type === 'checkbox') {
      setPaymentInfo({
        ...paymentInfo,
        sameAsShipping: checked as boolean,
        billingAddress: checked ? shippingInfo.address : paymentInfo.billingAddress,
        billingCity: checked ? shippingInfo.city : paymentInfo.billingCity,
        billingState: checked ? shippingInfo.state : paymentInfo.billingState,
        billingZipCode: checked ? shippingInfo.zipCode : paymentInfo.billingZipCode,
        billingCountry: checked ? shippingInfo.country : paymentInfo.billingCountry,
      });
    } else {
      setPaymentInfo({
        ...paymentInfo,
        [name]: type === 'checkbox' ? checked : value,
      });
    }
  };

  const validateShippingInfo = () => {
    const newErrors: Record<string, string> = {};
    
    if (!shippingInfo.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!shippingInfo.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!shippingInfo.address.trim()) newErrors.address = 'Address is required';
    if (!shippingInfo.city.trim()) newErrors.city = 'City is required';
    if (!shippingInfo.state.trim()) newErrors.state = 'State is required';
    if (!shippingInfo.zipCode.trim()) newErrors.zipCode = 'Zip code is required';
    if (!shippingInfo.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(shippingInfo.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!shippingInfo.phone.trim()) newErrors.phone = 'Phone number is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validatePaymentInfo = () => {
    const newErrors: Record<string, string> = {};
    
    if (!paymentInfo.cardNumber.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!/^\d{16}$/.test(paymentInfo.cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'Card number is invalid';
    }
    if (!paymentInfo.nameOnCard.trim()) newErrors.nameOnCard = 'Name on card is required';
    if (!paymentInfo.expiryDate.trim()) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(paymentInfo.expiryDate)) {
      newErrors.expiryDate = 'Expiry date should be in MM/YY format';
    }
    if (!paymentInfo.cvv.trim()) {
      newErrors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(paymentInfo.cvv)) {
      newErrors.cvv = 'CVV is invalid';
    }
    
    if (!paymentInfo.sameAsShipping) {
      if (!paymentInfo.billingAddress.trim()) newErrors.billingAddress = 'Billing address is required';
      if (!paymentInfo.billingCity.trim()) newErrors.billingCity = 'Billing city is required';
      if (!paymentInfo.billingState.trim()) newErrors.billingState = 'Billing state is required';
      if (!paymentInfo.billingZipCode.trim()) newErrors.billingZipCode = 'Billing zip code is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep === 'shipping') {
      if (validateShippingInfo()) {
        onComplete();
      }
    } else if (currentStep === 'payment') {
      if (validatePaymentInfo()) {
        onComplete();
      }
    }
  };

  // Format card number with spaces after every 4 digits
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Format expiry date in MM/YY format
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    
    return v;
  };

  if (currentStep === 'shipping') {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={shippingInfo.firstName}
                onChange={handleShippingChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.firstName ? 'border-red-300' : ''
                }`}
              />
              {errors.firstName && (
                <p className="mt-2 text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={shippingInfo.lastName}
                onChange={handleShippingChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.lastName ? 'border-red-300' : ''
                }`}
              />
              {errors.lastName && (
                <p className="mt-2 text-sm text-red-600">{errors.lastName}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={shippingInfo.address}
                onChange={handleShippingChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.address ? 'border-red-300' : ''
                }`}
              />
              {errors.address && (
                <p className="mt-2 text-sm text-red-600">{errors.address}</p>
              )}
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={shippingInfo.city}
                onChange={handleShippingChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.city ? 'border-red-300' : ''
                }`}
              />
              {errors.city && (
                <p className="mt-2 text-sm text-red-600">{errors.city}</p>
              )}
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                State / Province
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={shippingInfo.state}
                onChange={handleShippingChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.state ? 'border-red-300' : ''
                }`}
              />
              {errors.state && (
                <p className="mt-2 text-sm text-red-600">{errors.state}</p>
              )}
            </div>

            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                ZIP / Postal code
              </label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={shippingInfo.zipCode}
                onChange={handleShippingChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.zipCode ? 'border-red-300' : ''
                }`}
              />
              {errors.zipCode && (
                <p className="mt-2 text-sm text-red-600">{errors.zipCode}</p>
              )}
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                Country
              </label>
              <select
                id="country"
                name="country"
                value={shippingInfo.country}
                onChange={handleShippingChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="AU">Australia</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={shippingInfo.phone}
                onChange={handleShippingChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.phone ? 'border-red-300' : ''
                }`}
              />
              {errors.phone && (
                <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={shippingInfo.email}
                onChange={handleShippingChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.email ? 'border-red-300' : ''
                }`}
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="saveAddress"
                    name="saveAddress"
                    type="checkbox"
                    checked={shippingInfo.saveAddress}
                    onChange={handleShippingChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="saveAddress" className="font-medium text-gray-700">
                    Save this address for future orders
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Continue to Payment
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (currentStep === 'payment') {
    // For the Stripe payment form, we need to pass in an orderId
    // In a real app, this would be created after the shipping info is completed
    const mockOrderId = "order_123456789"; // In a real app, this would come from your backend

    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h2>

        <div className="mb-6 border-b border-gray-200 pb-4">
          <h3 className="text-base font-medium text-gray-900 mb-4">Billing Address</h3>

          <div className="mb-4">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="sameAsShipping"
                  name="sameAsShipping"
                  type="checkbox"
                  checked={paymentInfo.sameAsShipping}
                  onChange={handlePaymentChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="sameAsShipping" className="font-medium text-gray-700">
                  Same as shipping address
                </label>
              </div>
            </div>
          </div>

          {!paymentInfo.sameAsShipping && (
            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
              <div className="sm:col-span-2">
                <label htmlFor="billingAddress" className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  id="billingAddress"
                  name="billingAddress"
                  value={paymentInfo.billingAddress}
                  onChange={handlePaymentChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.billingAddress ? 'border-red-300' : ''
                  }`}
                />
                {errors.billingAddress && (
                  <p className="mt-2 text-sm text-red-600">{errors.billingAddress}</p>
                )}
              </div>

              <div>
                <label htmlFor="billingCity" className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  type="text"
                  id="billingCity"
                  name="billingCity"
                  value={paymentInfo.billingCity}
                  onChange={handlePaymentChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.billingCity ? 'border-red-300' : ''
                  }`}
                />
                {errors.billingCity && (
                  <p className="mt-2 text-sm text-red-600">{errors.billingCity}</p>
                )}
              </div>

              <div>
                <label htmlFor="billingState" className="block text-sm font-medium text-gray-700">
                  State / Province
                </label>
                <input
                  type="text"
                  id="billingState"
                  name="billingState"
                  value={paymentInfo.billingState}
                  onChange={handlePaymentChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.billingState ? 'border-red-300' : ''
                  }`}
                />
                {errors.billingState && (
                  <p className="mt-2 text-sm text-red-600">{errors.billingState}</p>
                )}
              </div>

              <div>
                <label htmlFor="billingZipCode" className="block text-sm font-medium text-gray-700">
                  ZIP / Postal code
                </label>
                <input
                  type="text"
                  id="billingZipCode"
                  name="billingZipCode"
                  value={paymentInfo.billingZipCode}
                  onChange={handlePaymentChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.billingZipCode ? 'border-red-300' : ''
                  }`}
                />
                {errors.billingZipCode && (
                  <p className="mt-2 text-sm text-red-600">{errors.billingZipCode}</p>
                )}
              </div>

              <div>
                <label htmlFor="billingCountry" className="block text-sm font-medium text-gray-700">
                  Country
                </label>
                <select
                  id="billingCountry"
                  name="billingCountry"
                  value={paymentInfo.billingCountry}
                  onChange={handlePaymentChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="AU">Australia</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <h3 className="text-base font-medium text-gray-900 mb-4">Payment Method</h3>
        <StripeProvider>
          <StripePaymentForm
            orderId={mockOrderId}
            onSuccess={(paymentIntentId) => {
              console.log('Payment successful:', paymentIntentId);
              onComplete();
            }}
            onError={(error) => {
              console.error('Payment error:', error);
              setErrors({ payment: error });
            }}
          />
        </StripeProvider>

        {errors.payment && (
          <div className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {errors.payment}
          </div>
        )}
      </div>
    );
  }

  return null;
}