'use client';

import React, { useState } from 'react';
import ProductFilters from '@/components/products/ProductFilters';
import ProductSearch from '@/components/products/ProductSearch';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Get current filter values from URL
  const categoryId = searchParams.get('category') || '';
  const priceRanges = searchParams.getAll('price') || [];
  const ratings = searchParams.getAll('rating').map(Number) || [];
  const inStockOnly = searchParams.get('inStock') === 'true';
  const searchQuery = searchParams.get('q') || '';

  // Create a new URLSearchParams object to build the updated query
  const createQueryString = (params: Record<string, string | string[] | null | boolean>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());

    // Process each parameter
    Object.entries(params).forEach(([key, value]) => {
      // Clear existing values for this key
      newSearchParams.delete(key);

      // Skip null or empty values
      if (value === null || value === undefined || value === '') {
        return;
      }

      // Handle arrays
      if (Array.isArray(value)) {
        value.forEach(v => newSearchParams.append(key, v));
      }
      // Handle booleans
      else if (typeof value === 'boolean') {
        if (value) {
          newSearchParams.set(key, 'true');
        }
      }
      // Handle strings
      else {
        newSearchParams.set(key, value);
      }
    });

    return newSearchParams.toString();
  };

  // Handle changes to filters
  const handleCategoryChange = (newCategoryId: string) => {
    const query = createQueryString({ ...Object.fromEntries(searchParams.entries()), category: newCategoryId });
    router.push(`${pathname}?${query}`);
  };

  const handlePriceRangeChange = (newPriceRanges: string[]) => {
    const query = createQueryString({ ...Object.fromEntries(searchParams.entries()), price: newPriceRanges });
    router.push(`${pathname}?${query}`);
  };

  const handleRatingChange = (newRatings: number[]) => {
    const query = createQueryString({ ...Object.fromEntries(searchParams.entries()), rating: newRatings.map(String) });
    router.push(`${pathname}?${query}`);
  };

  const handleAvailabilityChange = (inStock: boolean) => {
    const query = createQueryString({ ...Object.fromEntries(searchParams.entries()), inStock });
    router.push(`${pathname}?${query}`);
  };

  const handleSearch = (query: string) => {
    const newQuery = createQueryString({ ...Object.fromEntries(searchParams.entries()), q: query });
    router.push(`${pathname}?${newQuery}`);
  };

  // Toggle mobile filters
  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Mobile filters button */}
      <div className="lg:hidden mb-4">
        <button
          type="button"
          className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          onClick={toggleMobileFilters}
        >
          {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
          <svg
            className="ml-2 h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={showMobileFilters
                ? "M6 18L18 6M6 6l12 12"
                : "M3 4h18M3 8h18M3 12h18M3 16h18M3 20h18"
              }
            />
          </svg>
        </button>
      </div>

      {/* Search bar for all screens */}
      <div className="mb-6">
        <ProductSearch onSearch={handleSearch} initialQuery={searchQuery} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar filters */}
        <aside className={`${showMobileFilters ? 'block' : 'hidden'} lg:block lg:col-span-1`}>
          <div className="sticky top-20">
            <ProductFilters
              onCategoryChange={handleCategoryChange}
              onPriceRangeChange={handlePriceRangeChange}
              onRatingChange={handleRatingChange}
              onAvailabilityChange={handleAvailabilityChange}
              selectedCategory={categoryId}
              selectedPriceRanges={priceRanges}
              selectedRatings={ratings}
              inStockOnly={inStockOnly}
            />
          </div>
        </aside>

        {/* Main content area */}
        <div className="lg:col-span-3">
          {children}
        </div>
      </div>
    </div>
  );
}