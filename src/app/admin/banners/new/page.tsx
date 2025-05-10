'use client';

import BannerForm from '@/components/admin/BannerForm';

export default function NewBannerPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Create New Banner</h1>
        <p className="mt-2 text-sm text-gray-700">
          Add a new promotional banner to display on your store
        </p>
      </div>
      
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <BannerForm mode="create" />
        </div>
      </div>
    </div>
  );
}