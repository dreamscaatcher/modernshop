'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELED';
  paymentStatus: 'PAID' | 'REFUNDED' | 'FAILED';
  paymentMethod: string;
  shippingAddress: Address;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [note, setNote] = useState('');
  
  useEffect(() => {
    // In a real app, this would fetch the order from an API
    const fetchOrder = async () => {
      setLoading(true);
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // This would be replaced with actual API call
        // const response = await fetch(`/api/orders/${orderId}`);
        // const data = await response.json();
        
        // Generate a mock order for the demo
        const numItems = Math.floor(Math.random() * 3) + 1;
        const items: OrderItem[] = Array.from({ length: numItems }, (_, i) => {
          const price = Math.floor(Math.random() * 100) + 9.99;
          const quantity = Math.floor(Math.random() * 3) + 1;
          
          return {
            id: `ITEM${i}`,
            productId: `PROD${Math.floor(Math.random() * 100)}`,
            productName: `Product ${Math.floor(Math.random() * 100)}`,
            productImage: '/placeholder.png',
            quantity,
            price,
          };
        });
        
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = 5.99;
        const tax = Math.round(subtotal * 0.0825 * 100) / 100; // 8.25% tax
        const total = subtotal + shipping + tax;
        
        const mockOrder: Order = {
          id: orderId,
          userId: `USER${Math.floor(Math.random() * 100)}`,
          customerName: 'John Doe',
          customerEmail: 'john.doe@example.com',
          status: 'PROCESSING',
          paymentStatus: 'PAID',
          paymentMethod: 'Credit Card (Stripe)',
          shippingAddress: {
            id: 'ADDR1',
            street: '123 Main St',
            city: 'Anytown',
            state: 'CA',
            postalCode: '12345',
            country: 'US',
          },
          items,
          subtotal,
          shipping,
          tax,
          total,
          notes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        setOrder(mockOrder);
        setNewStatus(mockOrder.status);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details.');
      } finally {
        setLoading(false);
      }
    };
    
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);
  
  const handleUpdateStatus = async () => {
    if (!order || newStatus === order.status) return;
    
    setUpdatingStatus(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would be an API call:
      // await fetch(`/api/orders/${orderId}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status: newStatus }),
      // });
      
      // Update the order locally for the demo
      setOrder(prev => {
        if (!prev) return null;
        return {
          ...prev,
          status: newStatus as Order['status'],
          updatedAt: new Date().toISOString(),
          notes: note ? `${prev.notes}\n${new Date().toLocaleString()}: Status changed to ${newStatus}${note ? ` - ${note}` : ''}` : prev.notes,
        };
      });
      
      setNote('');
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status.');
    } finally {
      setUpdatingStatus(false);
    }
  };
  
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getPaymentStatusColor = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'REFUNDED':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">Order Details</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  if (error || !order) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">Order Details</h1>
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {error || 'Order not found'}
              </h3>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <button
            type="button"
            onClick={() => router.push('/admin/orders')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Order {order.id}</h1>
            <span className={`ml-4 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
          <button
            type="button"
            onClick={() => router.push('/admin/orders')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Orders
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
            </svg>
            Print Order
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Order Info Column */}
        <div className="md:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Order Items</h3>
            </div>
            <div className="border-t border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              {item.productImage ? (
                                <Image
                                  src={item.productImage}
                                  alt={item.productName}
                                  width={40}
                                  height={40}
                                  className="h-10 w-10 object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 bg-gray-200 flex items-center justify-center">
                                  <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                <Link href={`/admin/products/${item.productId}`} className="hover:text-blue-600">
                                  {item.productName}
                                </Link>
                              </div>
                              <div className="text-sm text-gray-500">
                                SKU: {item.productId}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${item.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-white">
                    <tr>
                      <th colSpan={3} className="px-6 py-3 text-right text-sm font-normal text-gray-500">
                        Subtotal
                      </th>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                        ${order.subtotal.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <th colSpan={3} className="px-6 py-3 text-right text-sm font-normal text-gray-500">
                        Shipping
                      </th>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                        ${order.shipping.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <th colSpan={3} className="px-6 py-3 text-right text-sm font-normal text-gray-500">
                        Tax
                      </th>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                        ${order.tax.toFixed(2)}
                      </td>
                    </tr>
                    <tr className="border-t border-gray-200">
                      <th colSpan={3} className="px-6 py-3 text-right text-base font-semibold text-gray-900">
                        Total
                      </th>
                      <td className="px-6 py-3 whitespace-nowrap text-base font-semibold text-gray-900">
                        ${order.total.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
          
          {/* Customer Notes */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Order Notes</h3>
            </div>
            <div className="px-4 py-5 sm:px-6">
              {order.notes ? (
                <div className="text-sm text-gray-900 whitespace-pre-line">
                  {order.notes}
                </div>
              ) : (
                <p className="text-sm italic text-gray-500">No notes for this order.</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Customer</h3>
            </div>
            <div className="px-4 py-5 sm:px-6">
              <div className="text-sm text-gray-900 mb-4">
                <p className="font-medium text-gray-900">{order.customerName}</p>
                <p className="text-gray-500">{order.customerEmail}</p>
              </div>
              <Link
                href={`/admin/users/${order.userId}`}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                View Customer
              </Link>
            </div>
          </div>
          
          {/* Shipping Info */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Shipping</h3>
            </div>
            <div className="px-4 py-5 sm:px-6">
              <div className="text-sm text-gray-900">
                <p>{order.customerName}</p>
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>
          </div>
          
          {/* Payment Info */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Payment</h3>
            </div>
            <div className="px-4 py-5 sm:px-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-500">Method</p>
                <p className="text-sm text-gray-900">{order.paymentMethod}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">Status</p>
                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getPaymentStatusColor(order.paymentStatus)}`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>
          
          {/* Update Status */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Update Status</h3>
            </div>
            <div className="px-4 py-5 sm:px-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELED">Canceled</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="note" className="block text-sm font-medium text-gray-700">
                    Add a note (optional)
                  </label>
                  <textarea
                    id="note"
                    name="note"
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="mt-1 block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border border-gray-300 rounded-md"
                  />
                </div>
                
                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  disabled={updatingStatus || newStatus === order.status}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingStatus ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}