'use client';

import Link from 'next/link';
import Image from 'next/image';

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
  rating?: number;
}

interface SearchResultsProps {
  products: Product[];
  loading: boolean;
  onAddToCart: (productId: string) => void;
}

export default function SearchResults({ products, loading, onAddToCart }: SearchResultsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 shadow animate-pulse">
            <div className="bg-gray-200 h-48 w-full mb-4 rounded"></div>
            <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded mb-4 w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">No products found.</p>
        <p className="text-gray-500">Try adjusting your filters or search criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div key={product.id} className="border rounded-lg p-4 shadow hover:shadow-md transition">
          <Link href={`/shop/${product.id}`}>
            <div className="relative h-48 w-full bg-gray-100 mb-4 rounded overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  No image
                </div>
              )}
              {/* Stock badge */}
              {product.stock <= 0 && (
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  Out of Stock
                </div>
              )}
              {product.stock > 0 && product.stock <= 5 && (
                <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                  Low Stock
                </div>
              )}
            </div>
            <div className="flex justify-between items-start mb-1">
              <h2 className="text-xl font-semibold">{product.name}</h2>
              {product.rating && (
                <div className="flex items-center">
                  <span className="text-yellow-400 mr-1">★</span>
                  <span className="text-sm text-gray-600">{product.rating}</span>
                </div>
              )}
            </div>
            <div className="flex items-center mb-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {product.category.name}
              </span>
            </div>
            <p className="text-gray-600 mb-2 line-clamp-2">
              {product.description}
            </p>
            <p className="font-bold text-lg mb-3">${product.price.toFixed(2)}</p>
          </Link>
          <button 
            className={`w-full py-2 rounded transition ${
              product.stock > 0 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={() => product.stock > 0 && onAddToCart(product.id)}
            disabled={product.stock <= 0}
          >
            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      ))}
    </div>
  );
}