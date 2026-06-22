import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/promo-videos — Fetch active promo videos (public)
export async function GET(request: NextRequest) {
  try {
    const includeInactive = request.nextUrl.searchParams.get('all') === 'true';
    const videos = await db.promoVideo.findMany({
      where: includeInactive ? {} : { active: true },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(videos);
  } catch (error) {
    console.error('Error fetching promo videos:', error);
    return NextResponse.json({ error: 'Failed to fetch promo videos' }, { status: 500 });
  }
}

// POST /api/promo-videos — Create promo video (admin only)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('x-admin-token');
    if (authHeader !== '030324') {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    const { title, videoUrl, thumbnailUrl, active, order } = await request.json();

    if (!title || !videoUrl) {
      return NextResponse.json({ error: 'Title dan video URL wajib diisi' }, { status: 400 });
    }

    const video = await db.promoVideo.create({
      data: {
        title,
        videoUrl,
        thumbnailUrl: thumbnailUrl || null,
        active: active ?? true,
        sortOrder: order ?? 0,
      },
    });

    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    console.error('Error creating promo video:', error);
    return NextResponse.json({ error: 'Failed to create promo video' }, { status: 500 });
  }
}
