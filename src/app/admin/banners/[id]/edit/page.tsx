import { notFound } from 'next/navigation';
import BannerForm from '@/components/admin/BannerForm';
import { prisma } from '@/lib/prisma';

interface EditBannerPageProps {
  params: {
    id: string;
  };
}

export default async function EditBannerPage({ params }: EditBannerPageProps) {
  const id = params.id;

  const banner = await prisma.promotionalBanner.findUnique({
    where: { id },
  });

  if (!banner) {
    notFound();
  }

  // Transform the banner data to match expected types
  const bannerData = {
    id: banner.id,
    title: banner.title,
    description: banner.description ?? undefined,
    imageUrl: banner.imageUrl,
    linkUrl: banner.linkUrl ?? undefined,
    startDate: banner.startDate,
    endDate: banner.endDate,
    isActive: banner.isActive,
    position: banner.position,
    priority: banner.priority,
    targetAudience: banner.targetAudience ?? undefined,
    discount: banner.discount ?? undefined,
    promoCode: banner.promoCode ?? undefined,
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Edit Banner</h1>
        <p className="mt-2 text-sm text-gray-700">
          Update the promotional banner details
        </p>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <BannerForm
            initialData={bannerData}
            mode="edit"
          />
        </div>
      </div>
    </div>
  );
}