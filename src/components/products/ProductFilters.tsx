'use client';

import { useState, useEffect } from 'react';

interface Category {
  id: string;
  name: string;
  productCount: number;
}

interface PriceRange {
  min: number;
  max: number | null;
  label: string;
}

interface FilterProps {
  onCategoryChange: (categoryId: string) => void;
  onPriceRangeChange: (priceRanges: string[]) => void;
  onRatingChange: (ratings: number[]) => void;
  onAvailabilityChange: (inStock: boolean) => void;
  selectedCategory?: string;
  selectedPriceRanges?: string[];
  selectedRatings?: number[];
  inStockOnly?: boolean;
}

export default function ProductFilters({
  onCategoryChange,
  onPriceRangeChange,
  onRatingChange,
  onAvailabilityChange,
  selectedCategory = '',
  selectedPriceRanges = [],
  selectedRatings = [],
  inStockOnly = false,
}: FilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    rating: true,
    availability: true,
  });

  // Price range options
  const priceRanges: { id: string; label: string; range: PriceRange }[] = [
    { id: 'price-0-50', label: '$0 - $50', range: { min: 0, max: 50, label: '$0 - $50' } },
    { id: 'price-50-100', label: '$50 - $100', range: { min: 50, max: 100, label: '$50 - $100' } },
    { id: 'price-100-250', label: '$100 - $250', range: { min: 100, max: 250, label: '$100 - $250' } },
    { id: 'price-250+', label: '$250+', range: { min: 250, max: null, label: '$250+' } },
  ];

  // Rating options
  const ratingOptions = [
    { id: 'rating-4+', value: 4, label: '4+ Stars' },
    { id: 'rating-3+', value: 3, label: '3+ Stars' },
    { id: 'rating-2+', value: 2, label: '2+ Stars' },
    { id: 'rating-1+', value: 1, label: '1+ Stars' },
  ];

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      setError(null);

      try {
        // In a real app, this would fetch categories from an API
        // const response = await fetch('/api/categories');
        // const data = await response.json();
        // setCategories(data.categories);

        // For now, we'll use mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockCategories: Category[] = [
          { id: 'cat1', name: 'Clothing', productCount: 32 },
          { id: 'cat2', name: 'Electronics', productCount: 24 },
          { id: 'cat3', name: 'Home & Kitchen', productCount: 18 },
          { id: 'cat4', name: 'Books', productCount: 15 },
          { id: 'cat5', name: 'Toys & Games', productCount: 12 },
        ];
        
        setCategories(mockCategories);
      } catch (err) {
        setError('Failed to load categories');
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  const handlePriceRangeChange = (rangeId: string) => {
    const newSelectedRanges = selectedPriceRanges.includes(rangeId)
      ? selectedPriceRanges.filter(id => id !== rangeId)
      : [...selectedPriceRanges, rangeId];
    
    onPriceRangeChange(newSelectedRanges);
  };

  const handleRatingChange = (ratingValue: number) => {
    const newSelectedRatings = selectedRatings.includes(ratingValue)
      ? selectedRatings.filter(value => value !== ratingValue)
      : [...selectedRatings, ratingValue];
    
    onRatingChange(newSelectedRatings);
  };

  const handleCategoryClick = (categoryId: string) => {
    onCategoryChange(categoryId === selectedCategory ? '' : categoryId);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleClearFilters = () => {
    onCategoryChange('');
    onPriceRangeChange([]);
    onRatingChange([]);
    onAvailabilityChange(false);
  };

  // Check if any filters are active
  const hasActiveFilters = selectedCategory !== '' || 
    selectedPriceRanges.length > 0 || 
    selectedRatings.length > 0 || 
    inStockOnly;

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Categories Section */}
      <div className="mb-6">
        <div
          className="flex justify-between items-center mb-2 cursor-pointer"
          onClick={() => toggleSection('categories')}
        >
          <h3 className="text-sm font-medium text-gray-900">Categories</h3>
          <span>
            {expandedSections.categories ? (
              <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </span>
        </div>
        
        {expandedSections.categories && (
          <div className="space-y-2">
            {loading && <p className="text-sm text-gray-500">Loading categories...</p>}
            
            {error && <p className="text-sm text-red-500">{error}</p>}
            
            {!loading && categories.length === 0 && (
              <p className="text-sm text-gray-500">No categories found</p>
            )}
            
            {!loading && categories.map(category => (
              <div key={category.id} className="flex items-center justify-between">
                <button
                  onClick={() => handleCategoryClick(category.id)}
                  className={`text-sm ${
                    selectedCategory === category.id
                      ? 'font-medium text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {category.name}
                </button>
                <span className="text-xs text-gray-500">({category.productCount})</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Price Range Section */}
      <div className="mb-6">
        <div
          className="flex justify-between items-center mb-2 cursor-pointer"
          onClick={() => toggleSection('price')}
        >
          <h3 className="text-sm font-medium text-gray-900">Price Range</h3>
          <span>
            {expandedSections.price ? (
              <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </span>
        </div>
        
        {expandedSections.price && (
          <div className="space-y-2">
            {priceRanges.map(range => (
              <div key={range.id} className="flex items-center">
                <input
                  id={range.id}
                  name={range.id}
                  type="checkbox"
                  checked={selectedPriceRanges.includes(range.id)}
                  onChange={() => handlePriceRangeChange(range.id)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor={range.id} className="ml-3 text-sm text-gray-600">
                  {range.label}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rating Section */}
      <div className="mb-6">
        <div
          className="flex justify-between items-center mb-2 cursor-pointer"
          onClick={() => toggleSection('rating')}
        >
          <h3 className="text-sm font-medium text-gray-900">Rating</h3>
          <span>
            {expandedSections.rating ? (
              <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </span>
        </div>
        
        {expandedSections.rating && (
          <div className="space-y-2">
            {ratingOptions.map(option => (
              <div key={option.id} className="flex items-center">
                <input
                  id={option.id}
                  name={option.id}
                  type="checkbox"
                  checked={selectedRatings.includes(option.value)}
                  onChange={() => handleRatingChange(option.value)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor={option.id} className="ml-3 text-sm text-gray-600 flex items-center">
                  {[1, 2, 3, 4, 5].map(star => (
                    <svg
                      key={star}
                      className={`h-4 w-4 ${star <= option.value ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 15.58l-5.94 3.13 1.13-6.58L.59 7.55l6.65-.97L10 .78l2.76 5.8 6.65.97-4.6 4.58 1.13 6.58L10 15.58z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ))}
                  <span className="ml-1">&amp; Up</span>
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Availability Section */}
      <div className="mb-6">
        <div
          className="flex justify-between items-center mb-2 cursor-pointer"
          onClick={() => toggleSection('availability')}
        >
          <h3 className="text-sm font-medium text-gray-900">Availability</h3>
          <span>
            {expandedSections.availability ? (
              <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </span>
        </div>
        
        {expandedSections.availability && (
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                id="in-stock"
                name="in-stock"
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => onAvailabilityChange(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="in-stock" className="ml-3 text-sm text-gray-600">
                In Stock Only
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Mobile apply filters button - only shown on smaller screens */}
      <div className="lg:hidden mt-4">
        <button
          type="button"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}