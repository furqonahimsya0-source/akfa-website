import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

// DELETE /api/promo-videos/[id] — Delete promo video
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = await getDb();
    const authHeader = request.headers.get('x-admin-token');
    if (authHeader !== '030324') {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    const { id } = await params;
    await db.promoVideo.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting promo video:', error);
    return NextResponse.json({ error: 'Failed to delete promo video' }, { status: 500 });
  }
}

// PATCH /api/promo-videos/[id] — Update promo video (toggle active, reorder)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = await getDb();
    const authHeader = request.headers.get('x-admin-token');
    if (authHeader !== '030324') {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const video = await db.promoVideo.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(video);
  } catch (error) {
    console.error('Error updating promo video:', error);
    return NextResponse.json({ error: 'Failed to update promo video' }, { status: 500 });
  }
}
