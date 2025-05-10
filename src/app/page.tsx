import Link from 'next/link'
import { BannerPosition } from '@prisma/client'
import { PositionedBanners } from '@/components/banners/PositionedBanners'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
      {/* Top banner slot */}
      <div className="w-full max-w-6xl mb-8">
        <PositionedBanners position={BannerPosition.HOME_TOP} />
      </div>

      <div className="py-12 text-center">
        <h1 className="text-4xl font-bold mb-4">ModernShop</h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">Welcome to our e-commerce platform. Discover amazing products at great prices.</p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/shop"
            className="px-6 py-3 bg-primary text-white rounded-md hover:bg-blue-600 transition font-medium"
          >
            Browse Products
          </Link>
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-secondary text-white rounded-md hover:bg-green-600 transition font-medium"
          >
            Login
          </Link>
        </div>
      </div>

      {/* Featured content section */}
      <div className="w-full max-w-6xl py-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Featured Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sample featured categories - would typically come from your backend */}
          <div className="bg-gray-100 p-6 rounded-lg shadow-sm hover:shadow-md transition">
            <h3 className="text-xl font-semibold mb-2">Electronics</h3>
            <p className="text-gray-600 mb-4">Latest gadgets and tech essentials</p>
            <Link href="/shop?category=electronics" className="text-primary hover:underline">
              Explore →
            </Link>
          </div>

          <div className="bg-gray-100 p-6 rounded-lg shadow-sm hover:shadow-md transition">
            <h3 className="text-xl font-semibold mb-2">Clothing</h3>
            <p className="text-gray-600 mb-4">Fashion for every style and occasion</p>
            <Link href="/shop?category=clothing" className="text-primary hover:underline">
              Explore →
            </Link>
          </div>

          <div className="bg-gray-100 p-6 rounded-lg shadow-sm hover:shadow-md transition">
            <h3 className="text-xl font-semibold mb-2">Home & Living</h3>
            <p className="text-gray-600 mb-4">Essentials for your living space</p>
            <Link href="/shop?category=home" className="text-primary hover:underline">
              Explore →
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom banner slot */}
      <div className="w-full max-w-6xl my-8">
        <PositionedBanners position={BannerPosition.HOME_BOTTOM} />
      </div>
    </main>
  )
}
