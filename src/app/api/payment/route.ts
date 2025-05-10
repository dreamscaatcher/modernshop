import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import stripe from '@/lib/stripe-server';

// POST /api/payment - Create a payment intent
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { orderId, paymentMethodType } = await request.json();
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Find the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
      },
    });
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    // Verify the order belongs to the user
    if (order.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if payment is already processed
    if (order.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Order has already been processed' },
        { status: 400 }
      );
    }
    
    // Format line items for Stripe
    const lineItems = order.items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.product.name,
          description: item.product.description.substring(0, 100),
          images: item.product.images.length > 0 ? [item.product.images[0]] : [],
        },
        unit_amount: Math.round(item.price * 100), // Stripe amounts are in cents
      },
      quantity: item.quantity,
    }));
    
    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100), // Stripe amounts are in cents
      currency: 'usd',
      receipt_email: session.user.email,
      metadata: {
        orderId: order.id,
        userId: user.id,
      },
      payment_method_types: [paymentMethodType || 'card'],
    });
    
    // Update the order with the payment intent ID
    await prisma.order.update({
      where: { id: order.id },
      data: {
        // Store the payment intent ID for reference
        // In a real production application, you would have a separate Payment model
        status: 'PROCESSING',
      },
    });
    
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}