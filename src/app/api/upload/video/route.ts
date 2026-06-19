import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

// Check if we're in Vercel Blob mode
function isVercelBlob(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

// POST /api/upload/video - Upload video (admin only)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('x-admin-token');
    if (authHeader !== '030324') {
      return NextResponse.json({ error: 'Akses ditolak. Hanya admin yang bisa upload.' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('video') as File | null;
    if (!file) return NextResponse.json({ error: 'Tidak ada file video' }, { status: 400 });
    if (file.size === 0) return NextResponse.json({ error: 'File video kosong' }, { status: 400 });
    if (file.size > 2 * 1024 * 1024 * 1024) {
      return NextResponse.json({ error: 'Ukuran video maksimal 2GB' }, { status: 400 });
    }

    // ── Vercel Blob (production) ───────────────────────────────────────
    if (isVercelBlob()) {
      const { put } = await import('@vercel/blob');
      const name = file.name.toLowerCase();
      let ext = 'mp4';
      if (name.endsWith('.webm')) ext = 'webm';
      else if (name.endsWith('.mov')) ext = 'mov';
      else if (name.endsWith('.avi')) ext = 'avi';
      else if (name.endsWith('.mkv')) ext = 'mkv';

      const filename = `${randomUUID()}.${ext}`;
      const blob = await put(`videos/${filename}`, file, { access: 'public', addRandomSuffix: false });

      console.log(`[Video Upload] Via Vercel Blob: ${file.name} → ${blob.url}`);
      return NextResponse.json({ videoUrl: blob.url });
    }

    // ── Local filesystem (development) ────────────────────────────────
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const videosDir = join(process.cwd(), 'public', 'uploads', 'videos');
    await mkdir(videosDir, { recursive: true });

    let ext = 'mp4';
    const name = file.name.toLowerCase();
    if (name.endsWith('.webm')) ext = 'webm';
    else if (name.endsWith('.mov')) ext = 'mov';
    else if (name.endsWith('.avi')) ext = 'avi';
    else if (name.endsWith('.mkv')) ext = 'mkv';

    const filename = `${randomUUID()}.${ext}`;
    const filepath = join(videosDir, filename);
    await writeFile(filepath, buffer);

    console.log(`[Video Upload] Local: ${file.name} → /uploads/videos/${filename}`);
    return NextResponse.json({ videoUrl: `/uploads/videos/${filename}` });
  } catch (error) {
    console.error('[Video Upload] Error:', error);
    return NextResponse.json({ error: 'Gagal upload video. Coba ulangi.' }, { status: 500 });
  }
}
