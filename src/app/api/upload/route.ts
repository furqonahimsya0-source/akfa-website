import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

// Detect file extension from magic bytes
function detectExt(buffer: Buffer): string {
  if (buffer.length >= 3 && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return 'jpg';
  if (buffer.length >= 4 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x4E) return 'png';
  if (buffer.length >= 4 && buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) {
    if (buffer.length >= 12 && buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) return 'webp';
  }
  if (buffer.length >= 4 && buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) return 'gif';
  if (buffer.length >= 2 && buffer[0] === 0x42 && buffer[1] === 0x4D) return 'bmp';
  return 'jpg';
}

// Get folder based on MIME type
function getFolder(mimeType: string): string {
  const t = mimeType.toLowerCase();
  if (t.startsWith('image/')) return 'images';
  if (t.startsWith('video/')) return 'videos';
  if (t.startsWith('audio/')) return 'audio';
  return 'docs';
}

// Check if we're in Vercel Blob mode
function isVercelBlob(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

// POST /api/upload - Universal file upload (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check admin token
    const authHeader = request.headers.get('x-admin-token');
    if (authHeader !== '030324') {
      return NextResponse.json({ error: 'Akses ditolak. Hanya admin yang bisa upload.' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const image = formData.get('image') as File | null;
    const video = formData.get('video') as File | null;

    // Support multiple field names for backward compatibility
    const targetFile = file || image || video;

    if (!targetFile) {
      return NextResponse.json({ error: 'Tidak ada file' }, { status: 400 });
    }

    if (targetFile.size === 0) {
      return NextResponse.json({ error: 'File kosong' }, { status: 400 });
    }

    // ── Vercel Blob (production) ───────────────────────────────────────
    if (isVercelBlob()) {
      const { put } = await import('@vercel/blob');
      const folder = getFolder(targetFile.type);
      const ext = targetFile.name.split('.').pop()?.toLowerCase() || 'bin';
      const filename = `${randomUUID()}.${ext}`;
      const blobKey = `${folder}/${filename}`;

      const blob = await put(blobKey, targetFile, {
        access: 'public',
        addRandomSuffix: false,
      });

      console.log(`[Upload] Via Vercel Blob: ${targetFile.name} → ${blob.url}`);

      if (targetFile.type.startsWith('image/') || image) {
        return NextResponse.json({ imageUrl: blob.url, filename: targetFile.name, fileSize: targetFile.size, mimeType: targetFile.type }, { status: 201 });
      }
      return NextResponse.json({ videoUrl: blob.url, filename: targetFile.name, fileSize: targetFile.size, mimeType: targetFile.type }, { status: 201 });
    }

    // ── Local filesystem (development) ──────────────────────────────
    const bytes = await targetFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const folder = getFolder(targetFile.type);
    const uploadsDir = join(process.cwd(), 'public', 'uploads', folder);
    await mkdir(uploadsDir, { recursive: true });

    const ext = targetFile.name.split('.').pop()?.toLowerCase() || detectExt(buffer);
    const filename = `${randomUUID()}.${ext}`;
    const filepath = join(uploadsDir, filename);
    await writeFile(filepath, buffer);

    const publicUrl = `/uploads/${folder}/${filename}`;
    console.log(`[Upload] Local: ${targetFile.name} → ${publicUrl}`);

    if (targetFile.type.startsWith('image/') || image) {
      return NextResponse.json({ imageUrl: publicUrl, filename: targetFile.name, fileSize: targetFile.size, mimeType: targetFile.type }, { status: 201 });
    }
    return NextResponse.json({ videoUrl: publicUrl, filename: targetFile.name, fileSize: targetFile.size, mimeType: targetFile.type }, { status: 201 });
  } catch (error) {
    console.error('[Upload] Error:', error);
    return NextResponse.json({ error: 'Gagal upload file. Coba ulangi.' }, { status: 500 });
  }
}
