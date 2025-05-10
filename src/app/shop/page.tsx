'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { BannerPosition } from '@prisma/client';
import ProductSortSelect from '@/components/products/ProductSortSelect';
import SearchResults from '@/components/products/SearchResults';
import { useCartContext } from '@/components/cart/CartProvider';
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
  rating?: number;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function Shop() {
  const searchParams = useSearchParams();
  const { addToCart } = useCartContext ? useCartContext() : { addToCart: () => Promise.resolve(null) };
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 12,
    pages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState(searchParams.get('sort') || 'newest');

  // Get filter values from URL
  const categoryId = searchParams.get('category') || '';
  const priceRanges = searchParams.getAll('price') || [];
  const ratings = searchParams.getAll('rating').map(Number) || [];
  const inStockOnly = searchParams.get('inStock') === 'true';
  const searchQuery = searchParams.get('q') || '';
  const page = Number(searchParams.get('page') || '1');

  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);

      try {
        // In a real app, this would include all filter parameters
        // const url = `/api/products?page=${page}&limit=${pagination.limit}&category=${categoryId}&q=${searchQuery}&sort=${sortOption}`;
        // if (priceRanges.length) url += `&price=${priceRanges.join(',')}`;
        // if (ratings.length) url += `&rating=${ratings.join(',')}`;
        // if (inStockOnly) url += '&inStock=true';

        // For now, simulate an API call with filtered products
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Generate mock products
        const mockProducts: Product[] = Array.from({ length: 20 }, (_, i) => {
          const product: Product = {
            id: `prod_${i + 1}`,
            name: `Product ${i + 1}`,
            description: `This is a description for Product ${i + 1}. It's a great product with many features.`,
            price: Math.floor(Math.random() * 300) + 9.99,
            stock: Math.floor(Math.random() * 50),
            images: ['/placeholder.png'],
            categoryId: ['cat1', 'cat2', 'cat3', 'cat4', 'cat5'][Math.floor(Math.random() * 5)],
            category: {
              id: ['cat1', 'cat2', 'cat3', 'cat4', 'cat5'][Math.floor(Math.random() * 5)],
              name: ['Clothing', 'Electronics', 'Home & Kitchen', 'Books', 'Toys & Games'][Math.floor(Math.random() * 5)],
            },
            rating: Math.floor(Math.random() * 5) + 1,
          };
          return product;
        });

        // Apply filters
        let filteredProducts = [...mockProducts];

        // Filter by category
        if (categoryId) {
          filteredProducts = filteredProducts.filter(product => product.categoryId === categoryId);
        }

        // Filter by search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filteredProducts = filteredProducts.filter(product =>
            product.name.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query)
          );
        }

        // Filter by price ranges
        if (priceRanges.length > 0) {
          filteredProducts = filteredProducts.filter(product => {
            return priceRanges.some(rangeId => {
              switch(rangeId) {
                case 'price-0-50':
                  return product.price >= 0 && product.price <= 50;
                case 'price-50-100':
                  return product.price > 50 && product.price <= 100;
                case 'price-100-250':
                  return product.price > 100 && product.price <= 250;
                case 'price-250+':
                  return product.price > 250;
                default:
                  return true;
              }
            });
          });
        }

        // Filter by ratings
        if (ratings.length > 0) {
          filteredProducts = filteredProducts.filter(product =>
            ratings.some(rating => (product.rating || 0) >= rating)
          );
        }

        // Filter by stock
        if (inStockOnly) {
          filteredProducts = filteredProducts.filter(product => product.stock > 0);
        }

        // Sort products
        switch (sortOption) {
          case 'price-low-high':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
          case 'price-high-low':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
          case 'name-a-z':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
          case 'name-z-a':
            filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
            break;
          case 'best-selling':
            // In a real app, this would be based on sales data
            filteredProducts.sort(() => Math.random() - 0.5);
            break;
          case 'newest':
          default:
            // For demo, we'll keep the default order
            break;
        }

        // Calculate pagination
        const total = filteredProducts.length;
        const limit = pagination.limit;
        const pages = Math.ceil(total / limit);
        const currentPage = Math.min(page, pages) || 1;
        const start = (currentPage - 1) * limit;
        const end = start + limit;

        setProducts(filteredProducts.slice(start, end));
        setPagination({
          total,
          page: currentPage,
          limit,
          pages,
        });
      } catch (err) {
        setError('An error occurred while fetching products. Please try again.');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [
    page,
    pagination.limit,
    categoryId,
    priceRanges,
    ratings,
    inStockOnly,
    searchQuery,
    sortOption
  ]);

  // Handle add to cart
  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId);
      // You could add a toast notification here
    } catch (error) {
      console.error('Error adding item to cart:', error);
    }
  };

  // Handle sort change
  const handleSortChange = (newSortOption: string) => {
    setSortOption(newSortOption);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  // Create title based on filters
  let pageTitle = "Shop All Products";
  if (searchQuery) {
    pageTitle = `Search Results: "${searchQuery}"`;
  } else if (categoryId) {
    // In a real app, you would get the category name from the API
    const categoryNames: Record<string, string> = {
      'cat1': 'Clothing',
      'cat2': 'Electronics',
      'cat3': 'Home & Kitchen',
      'cat4': 'Books',
      'cat5': 'Toys & Games',
    };
    pageTitle = categoryNames[categoryId] || 'Products';
  }

  return (
    <div>
      {/* Shop banner */}
      <div className="mb-6">
        <PositionedBanners position={BannerPosition.SHOP_PAGE} />
      </div>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">{pageTitle}</h1>
        <ProductSortSelect onSortChange={handleSortChange} selectedSort={sortOption} />
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 p-4 rounded-md mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Product results */}
      <SearchResults
        products={products}
        loading={loading}
        onAddToCart={handleAddToCart}
      />

      {/* Pagination */}
      {!loading && pagination.pages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="inline-flex rounded-md shadow">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {/* Page numbers */}
            {Array.from({ length: pagination.pages }).map((_, i) => {
              const pageNumber = i + 1;
              // Show current page, first, last, and adjacent pages
              if (
                pageNumber === 1 ||
                pageNumber === pagination.pages ||
                (pageNumber >= pagination.page - 1 && pageNumber <= pagination.page + 1)
              ) {
                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`px-3 py-2 border ${
                      pageNumber === pagination.page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              }

              // Show ellipsis
              if (
                (pageNumber === 2 && pagination.page > 3) ||
                (pageNumber === pagination.pages - 1 && pagination.page < pagination.pages - 2)
              ) {
                return (
                  <span
                    key={pageNumber}
                    className="px-3 py-2 border border-gray-300 bg-white text-gray-500"
                  >
                    ...
                  </span>
                );
              }

              return null;
            })}

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
