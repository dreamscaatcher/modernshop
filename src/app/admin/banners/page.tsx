import Link from 'next/link';
import { BannerPosition, PromotionalBanner } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export default async function BannersPage() {
  const banners = await prisma.promotionalBanner.findMany({
    orderBy: [
      { priority: 'desc' },
      { startDate: 'desc' }
    ]
  });

  // Function to check if a banner is currently active
  const isCurrentlyActive = (banner: PromotionalBanner) => {
    const now = new Date();
    return banner.isActive && 
           new Date(banner.startDate) <= now && 
           new Date(banner.endDate) >= now;
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper to make position name more readable
  const formatPosition = (position: BannerPosition) => {
    return position.replace(/_/g, ' ');
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Promotional Banners</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage promotional banners displayed across the store
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/admin/banners/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            Add Banner
          </Link>
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Banner
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Position
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Date Range
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Priority
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {banners.length > 0 ? (
                    banners.map((banner) => (
                      <tr key={banner.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img
                                className="h-10 w-10 rounded-md object-cover"
                                src={banner.imageUrl}
                                alt={banner.title}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="font-medium text-gray-900">{banner.title}</div>
                              {banner.promoCode && (
                                <div className="text-xs text-gray-500">
                                  Code: <span className="font-mono">{banner.promoCode}</span>
                                  {banner.discount && (
                                    <span className="ml-2">({banner.discount}% off)</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatPosition(banner.position)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatDate(banner.startDate)} - {formatDate(banner.endDate)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {banner.priority}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isCurrentlyActive(banner)
                              ? 'bg-green-100 text-green-800'
                              : banner.isActive
                                ? 'bg-yellow-100 text-yellow-800' // Active but not in date range
                                : 'bg-gray-100 text-gray-800'     // Inactive
                          }`}>
                            {isCurrentlyActive(banner) 
                              ? 'Active' 
                              : banner.isActive 
                                ? 'Scheduled' 
                                : 'Inactive'}
                          </span>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <Link
                            href={`/admin/banners/${banner.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            Edit
                          </Link>
                          <Link
                            href={`/admin/banners/${banner.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-sm text-gray-500">
                        No banners found. Click &quot;Add Banner&quot; to create your first promotional banner.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}