'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { BannerPosition } from '@prisma/client';
import { PositionedBanners } from '@/components/banners/PositionedBanners';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  
  useEffect(() => {
    const productId = params.id as string;
    
    async function fetchProduct() {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/products/${productId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Product not found');
          }
          throw new Error('Failed to fetch product details');
        }
        
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError('An error occurred while fetching product details. Please try again.');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    }
    
    if (productId) {
      fetchProduct();
    }
  }, [params.id]);
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0 && product && value <= product.stock) {
      setQuantity(value);
    }
  };
  
  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const addToCart = () => {
    // Add to cart logic will be implemented later
    console.log('Adding to cart:', { product, quantity });
    alert(`Added ${quantity} ${product?.name} to cart!`);
  };
  
  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse">
          <div className="md:grid md:grid-cols-2 md:gap-8">
            <div className="md:col-span-1">
              <div className="bg-gray-200 rounded-lg h-96 w-full"></div>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-gray-200 h-24 rounded-md"></div>
                ))}
              </div>
            </div>
            <div className="md:col-span-1 mt-6 md:mt-0">
              <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
              <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-12 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 p-4 rounded-md mb-6 text-center">
          <p className="text-red-700 mb-4">{error || 'Product not found'}</p>
          <Link href="/shop" className="text-primary hover:text-blue-600 font-medium">
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li>
            <Link href="/" className="hover:text-primary">Home</Link>
          </li>
          <li>
            <span className="mx-2">/</span>
          </li>
          <li>
            <Link href="/shop" className="hover:text-primary">Shop</Link>
          </li>
          <li>
            <span className="mx-2">/</span>
          </li>
          <li>
            <Link href={`/shop?category=${product.category.name}`} className="hover:text-primary">
              {product.category.name}
            </Link>
          </li>
          <li>
            <span className="mx-2">/</span>
          </li>
          <li className="text-gray-700 font-medium truncate">
            {product.name}
          </li>
        </ol>
      </nav>

      {/* Product Banner */}
      <div className="mb-8">
        <PositionedBanners position={BannerPosition.PRODUCT_PAGE} />
      </div>

      <div className="md:grid md:grid-cols-2 md:gap-8">
        {/* Product Images */}
        <div className="md:col-span-1">
          <div className="relative h-96 w-full bg-gray-100 rounded-lg overflow-hidden mb-4">
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[activeImage]}
                alt={product.name}
                fill
                style={{ objectFit: 'contain' }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                No image available
              </div>
            )}
          </div>
          
          {/* Thumbnail images */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button 
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`relative h-24 bg-gray-100 rounded-md overflow-hidden ${
                    activeImage === index ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <Image 
                    src={image} 
                    alt={`${product.name} - view ${index + 1}`} 
                    fill 
                    style={{ objectFit: 'cover' }} 
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Product Details */}
        <div className="md:col-span-1 mt-8 md:mt-0">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          
          <div className="mt-2 mb-6">
            <span className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
          </div>
          
          <div className="mt-4 space-y-6">
            <p className="text-gray-700">
              {product.description}
            </p>
            
            <div className="border-t border-b py-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Availability:</span>
                {product.stock > 0 ? (
                  <span className="text-green-600 font-medium">In Stock ({product.stock} available)</span>
                ) : (
                  <span className="text-red-600 font-medium">Out of Stock</span>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Category:</span>
                <Link 
                  href={`/shop?category=${product.category.name}`}
                  className="text-primary hover:underline"
                >
                  {product.category.name}
                </Link>
              </div>
            </div>
            
            {/* Quantity selector */}
            <div className="mt-4">
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex">
                <button
                  type="button"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="px-3 py-2 border border-gray-300 text-gray-700 rounded-l-md hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">Decrease quantity</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="block w-16 text-center border-gray-300 focus:ring-primary focus:border-primary"
                />
                <button
                  type="button"
                  onClick={incrementQuantity}
                  disabled={quantity >= product.stock}
                  className="px-3 py-2 border border-gray-300 text-gray-700 rounded-r-md hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">Increase quantity</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Add to cart button */}
            <button
              type="button"
              onClick={addToCart}
              disabled={product.stock <= 0}
              className="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}