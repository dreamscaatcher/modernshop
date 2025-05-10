import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe-server';
import prisma from '@/lib/prisma';

// This is your Stripe webhook secret for testing your endpoint locally.
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_your_webhook_secret';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') || '';
    
    let event;
    
    try {
      event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
      console.error(`⚠️ Webhook signature verification failed.`, err?.message || 'Unknown error');
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }
    
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const { orderId, userId } = paymentIntent.metadata;
        
        // Update the order status
        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: { status: 'PROCESSING' },
          });
          
          console.log(`💰 Payment succeeded for order ${orderId}`);
        }
        break;
        
      case 'payment_intent.payment_failed':
        const failedPaymentIntent = event.data.object;
        const { orderId: failedOrderId } = failedPaymentIntent.metadata;
        
        // Update the order status
        if (failedOrderId) {
          await prisma.order.update({
            where: { id: failedOrderId },
            data: { status: 'CANCELED' },
          });
          
          console.log(`❌ Payment failed for order ${failedOrderId}`);
        }
        break;
        
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}