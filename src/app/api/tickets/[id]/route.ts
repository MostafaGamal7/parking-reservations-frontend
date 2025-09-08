import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const ticketId = params.id;
    if (!ticketId) {
      return NextResponse.json(
        { error: 'Ticket ID is required' },
        { status: 400 }
      );
    }

    // In a real app, you would fetch the ticket from your backend
    // For now, we'll return mock data
    const mockTicket = {
      id: ticketId,
      type: Math.random() > 0.5 ? 'visitor' : 'subscriber',
      zoneId: 'zone-123',
      zoneName: 'Zone A',
      checkinAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      subscriptionId: Math.random() > 0.5 ? 'sub-' + Math.random().toString(36).substring(7) : undefined,
    };

    return NextResponse.json(mockTicket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
