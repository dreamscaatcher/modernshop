import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST /api/cart/clear - Clear the cart
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Find the user and their cart
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { cart: true },
    });
    
    if (!user || !user.cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }
    
    // Delete all items in the cart
    await prisma.cartItem.deleteMany({
      where: { cartId: user.cart.id },
    });
    
    return NextResponse.json({
      cart: {
        id: user.cart.id,
        items: [],
        subtotal: 0,
        totalItems: 0,
      }
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    );
  }
}