import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// DELETE /api/products/[id] — Delete product and its variants
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await db.product.delete({ where: { id } });
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}

// PATCH /api/products/[id] — Toggle active or update stock
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Simple toggle active
    if (typeof body.active === 'boolean') {
      const product = await db.product.update({
        where: { id },
        data: { active: body.active },
        include: { variants: true },
      });
      return NextResponse.json(product);
    }

    // Update stock for a specific variant
    if (body.size !== undefined && body.stock !== undefined) {
      const variant = await db.productVariant.upsert({
        where: { productId_size: { productId: id, size: body.size.toUpperCase() } },
        create: { productId: id, size: body.size.toUpperCase(), stock: Number(body.stock) },
        update: { stock: Number(body.stock) },
      });
      return NextResponse.json(variant);
    }

    return NextResponse.json({ error: 'No valid update data' }, { status: 400 });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}
