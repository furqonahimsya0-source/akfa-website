import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/products — Fetch products with variants
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeInactive = searchParams.get('all') === 'true';

    const products = await db.product.findMany({
      where: includeInactive ? {} : { active: true },
      orderBy: { createdAt: 'desc' },
      include: { variants: { orderBy: { size: 'asc' } } },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST /api/products — Create product with variants
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, price, description, imageUrl, videoUrl, variants } = body;

    if (!name || !price || !imageUrl) {
      return NextResponse.json({ error: 'Name, price, and image URL are required' }, { status: 400 });
    }

    const product = await db.product.create({
      data: {
        name,
        price: Number(price),
        description: description || null,
        imageUrl,
        videoUrl: videoUrl || null,
        active: true,
        variants: variants?.length
          ? {
              create: variants.map((v: { size: string; stock: number }) => ({
                size: v.size.toUpperCase(),
                stock: Number(v.stock) || 0,
              })),
            }
          : undefined,
      },
      include: { variants: true },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
