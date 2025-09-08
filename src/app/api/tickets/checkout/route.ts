import { NextResponse } from 'next/server';
import { auth } from '@/auth';

interface CheckoutRequest {
  ticketId: string;
  forceConvertToVisitor?: boolean;
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: CheckoutRequest = await request.json();
    const { ticketId, forceConvertToVisitor } = body;

    if (!ticketId) {
      return NextResponse.json(
        { error: 'Ticket ID is required' },
        { status: 400 }
      );
    }

    // In a real app, you would process the checkout in your backend
    // For now, we'll return mock data
    const now = new Date();
    const checkinTime = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago
    
    const breakdown = [
      {
        from: checkinTime.toISOString(),
        to: now.toISOString(),
        hours: 2,
        rateMode: 'normal' as const,
        rate: 5,
        amount: 10
      }
    ];

    const totalAmount = breakdown.reduce((sum, item) => sum + item.amount, 0);
    const durationHours = 2;

    return NextResponse.json({
      ticketId,
      checkinAt: checkinTime.toISOString(),
      checkoutAt: now.toISOString(),
      breakdown,
      totalAmount,
      durationHours,
      convertedToVisitor: forceConvertToVisitor || false
    });
  } catch (error) {
    console.error('Error during checkout:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
