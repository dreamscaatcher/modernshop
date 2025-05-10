import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// PUT /api/cart/items/[id] - Update cart item quantity
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { quantity } = await request.json();
    
    if (typeof quantity !== 'number' || quantity < 1) {
      return NextResponse.json(
        { error: 'Quantity must be a positive number' },
        { status: 400 }
      );
    }
    
    // Find the user and their cart
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { cart: true },
    });
    
    if (!user || !user.cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }
    
    // Verify the cart item belongs to the user
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: params.id },
      include: { cart: true, product: true },
    });
    
    if (!cartItem) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      );
    }
    
    if (cartItem.cart.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if requested quantity exceeds stock
    if (quantity > cartItem.product.stock) {
      return NextResponse.json(
        { error: 'Not enough stock available' },
        { status: 400 }
      );
    }
    
    // Update the cart item quantity
    await prisma.cartItem.update({
      where: { id: params.id },
      data: { quantity },
    });
    
    // Return the updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { id: user.cart.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!updatedCart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    const subtotal = updatedCart.items.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0
    );
    
    return NextResponse.json({
      cart: {
        id: updatedCart.id,
        items: updatedCart.items.map(item => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          product: {
            id: item.product.id,
            name: item.product.name,
            description: item.product.description,
            price: item.product.price,
            images: item.product.images,
            stock: item.product.stock,
          },
        })),
        subtotal,
        totalItems: updatedCart.items.reduce((sum, item) => sum + item.quantity, 0),
      }
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    return NextResponse.json(
      { error: 'Failed to update cart item' },
      { status: 500 }
    );
  }
}

// DELETE /api/cart/items/[id] - Remove item from cart
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    // Verify the cart item belongs to the user
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: params.id },
      include: { cart: true },
    });
    
    if (!cartItem) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      );
    }
    
    if (cartItem.cart.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Delete the cart item
    await prisma.cartItem.delete({
      where: { id: params.id },
    });
    
    // Return the updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { id: user.cart.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!updatedCart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    const subtotal = updatedCart.items.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0
    );
    
    return NextResponse.json({
      cart: {
        id: updatedCart.id,
        items: updatedCart.items.map(item => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          product: {
            id: item.product.id,
            name: item.product.name,
            description: item.product.description,
            price: item.product.price,
            images: item.product.images,
            stock: item.product.stock,
          },
        })),
        subtotal,
        totalItems: updatedCart.items.reduce((sum, item) => sum + item.quantity, 0),
      }
    });
  } catch (error) {
    console.error('Error removing cart item:', error);
    return NextResponse.json(
      { error: 'Failed to remove cart item' },
      { status: 500 }
    );
  }
}