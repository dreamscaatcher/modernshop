'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { BannerPosition, TargetAudience } from '@prisma/client';
import { PromotionalBanner, PromotionalBannerProps } from './PromotionalBanner';

interface PositionedBannersProps {
  position: BannerPosition;
  maxBanners?: number;
}

export function PositionedBanners({ position, maxBanners = 1 }: PositionedBannersProps) {
  const { data: session, status } = useSession();
  const [banners, setBanners] = useState<PromotionalBannerProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/banners?position=${position}&active=true`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch banners');
        }
        
        const data = await response.json();
        
        // Filter banners based on user status if needed
        const filteredBanners = data.filter((banner: any) => {
          if (banner.targetAudience === TargetAudience.ALL) {
            return true;
          }
          
          // For returning users (logged in users)
          if (banner.targetAudience === TargetAudience.RETURNING_USERS) {
            return status === 'authenticated';
          }
          
          // For new users (not logged in)
          if (banner.targetAudience === TargetAudience.NEW_USERS) {
            return status === 'unauthenticated';
          }
          
          return true;
        });
        
        // Limit the number of banners to display
        setBanners(filteredBanners.slice(0, maxBanners));
      } catch (error) {
        console.error('Error fetching banners:', error);
        setBanners([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBanners();
  }, [position, maxBanners, status]);
  
  if (loading || banners.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-4">
      {banners.map(banner => (
        <PromotionalBanner
          key={banner.id}
          id={banner.id}
          title={banner.title}
          description={banner.description}
          imageUrl={banner.imageUrl}
          linkUrl={banner.linkUrl}
          position={banner.position}
          discount={banner.discount}
          promoCode={banner.promoCode}
        />
      ))}
    </div>
  );
}