'use client';

import ProductForm from '@/components/admin/ProductForm';

export default function NewProductPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Create New Product</h1>
        <p className="mt-2 text-sm text-gray-700">
          Add a new product to your store.
        </p>
      </div>
      
      <ProductForm />
    </div>
  );
}