import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/documents — Fetch documents
export async function GET(request: NextRequest) {
  try {
    const includeInactive = request.nextUrl.searchParams.get('all') === 'true';
    const docs = await db.document.findMany({
      where: includeInactive ? {} : { active: true },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(docs);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

// POST /api/documents — Create document (admin only)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('x-admin-token');
    if (authHeader !== '030324') {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    const { title, description, fileUrl, fileName, fileType, fileSize, order } = await request.json();

    if (!title || !fileUrl || !fileName) {
      return NextResponse.json({ error: 'Title, fileUrl, dan fileName wajib diisi' }, { status: 400 });
    }

    const doc = await db.document.create({
      data: {
        title,
        description: description || null,
        fileUrl,
        fileName,
        fileType: fileType || 'application/octet-stream',
        fileSize: fileSize || 0,
        sortOrder: order ?? 0,
        active: true,
      },
    });

    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
  }
}
