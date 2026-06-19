import { NextRequest, NextResponse } from 'next/server';

// Admin access code
const ADMIN_CODE = process.env.ADMIN_ACCESS_CODE || '030324';

// POST /api/admin/verify — Verify admin access code
export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Kode akses diperlukan' },
        { status: 400 }
      );
    }

    const isCorrect = code.trim().toUpperCase() === ADMIN_CODE.toUpperCase();

    if (!isCorrect) {
      return NextResponse.json(
        { success: false, error: 'Kode akses salah' },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error verifying admin code:', error);
    return NextResponse.json(
      { error: 'Gagal memverifikasi' },
      { status: 500 }
    );
  }
}
