import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET - Fetch all active banners or specific banners by position
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const position = searchParams.get('position');
    const active = searchParams.get('active') === 'true';

    // Build the query based on the provided parameters
    const query: any = {};
    
    // If position is specified, filter by it
    if (position) {
      query.position = position;
    }

    // If active is specified, filter by it
    if (active) {
      query.isActive = true;
      
      // For active banners, check that current date is between start and end dates
      const now = new Date();
      query.AND = [
        { startDate: { lte: now } },
        { endDate: { gte: now } }
      ];
    }

    const banners = await prisma.promotionalBanner.findMany({
      where: query,
      orderBy: {
        priority: 'desc' // Show higher priority banners first
      }
    });

    return NextResponse.json(banners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}

// POST - Create a new banner (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'imageUrl', 'startDate', 'endDate', 'position'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create new banner
    const banner = await prisma.promotionalBanner.create({
      data: {
        title: body.title,
        description: body.description,
        imageUrl: body.imageUrl,
        linkUrl: body.linkUrl,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        isActive: body.isActive ?? true,
        position: body.position,
        priority: body.priority ?? 0,
        targetAudience: body.targetAudience,
        discount: body.discount,
        promoCode: body.promoCode
      }
    });

    return NextResponse.json(banner, { status: 201 });
  } catch (error) {
    console.error('Error creating banner:', error);
    return NextResponse.json(
      { error: 'Failed to create banner' },
      { status: 500 }
    );
  }
}