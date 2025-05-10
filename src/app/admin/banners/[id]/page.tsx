import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

interface BannerPageProps {
  params: {
    id: string;
  };
}

export default async function BannerDetailsPage({ params }: BannerPageProps) {
  const id = params.id;
  
  const banner = await prisma.promotionalBanner.findUnique({
    where: { id },
  });

  if (!banner) {
    notFound();
  }

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Check if banner is currently active
  const isCurrentlyActive = () => {
    const now = new Date();
    return banner.isActive && 
           new Date(banner.startDate) <= now && 
           new Date(banner.endDate) >= now;
  };

  // Helper to get the status text and color
  const getStatusInfo = () => {
    if (isCurrentlyActive()) {
      return {
        text: 'Active',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
      };
    } else if (banner.isActive) {
      return {
        text: 'Scheduled',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
      };
    } else {
      return {
        text: 'Inactive',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
      };
    }
  };

  const status = getStatusInfo();

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Banner Details</h1>
          <p className="mt-2 text-sm text-gray-700">
            View details for promotional banner
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/admin/banners/${id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Edit
          </Link>
          <Link
            href="/admin/banners"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Banners
          </Link>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/3">
              <div className="relative aspect-[16/9] w-full mb-4 overflow-hidden rounded-lg">
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.textColor}`}>
                  {status.text}
                </span>
                <h3 className="mt-2 text-lg font-medium text-gray-900">{banner.title}</h3>
                {banner.description && (
                  <p className="mt-1 text-sm text-gray-500">{banner.description}</p>
                )}
              </div>
            </div>

            <div className="lg:w-2/3">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Position</dt>
                  <dd className="mt-1 text-sm text-gray-900">{banner.position.replace(/_/g, ' ')}</dd>
                </div>

                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Priority</dt>
                  <dd className="mt-1 text-sm text-gray-900">{banner.priority}</dd>
                </div>

                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(banner.startDate)}</dd>
                </div>

                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">End Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(banner.endDate)}</dd>
                </div>

                {banner.targetAudience && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Target Audience</dt>
                    <dd className="mt-1 text-sm text-gray-900">{banner.targetAudience.replace(/_/g, ' ')}</dd>
                  </div>
                )}

                {banner.linkUrl && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Link URL</dt>
                    <dd className="mt-1 text-sm text-gray-900 break-words">
                      <a
                        href={banner.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-900 underline"
                      >
                        {banner.linkUrl}
                      </a>
                    </dd>
                  </div>
                )}

                {banner.discount !== null && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Discount</dt>
                    <dd className="mt-1 text-sm text-gray-900">{banner.discount}%</dd>
                  </div>
                )}

                {banner.promoCode && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Promo Code</dt>
                    <dd className="mt-1 text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-900">{banner.promoCode}</dd>
                  </div>
                )}

                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(banner.createdAt)}</dd>
                </div>

                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(banner.updatedAt)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}