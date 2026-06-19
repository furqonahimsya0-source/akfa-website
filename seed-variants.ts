import { db } from '@/lib/db';

async function seedVariants() {
  const products = await db.product.findMany();
  console.log(`Found ${products.length} products`);

  for (const product of products) {
    const existing = await db.productVariant.findMany({ where: { productId: product.id } });
    if (existing.length > 0) {
      console.log(`  Skip ${product.name} — variants exist`);
      continue;
    }

    // Different stock per product for realism
    const stockMap: Record<string, Record<string, number>> = {
      'Oversized Tee Black':     { S: 15, M: 20, L: 12, XL: 8 },
      'Cargo Pants Grey':        { S: 8,  M: 10, L: 6,  XL: 3 },
      'Minimalist Hoodie White': { S: 12, M: 18, L: 10, XL: 5 },
      'Bomber Jacket Black':     { M: 5,  L: 7,  XL: 4 },
      'Jogger Pants Charcoal':   { S: 10, M: 15, L: 8,  XL: 6 },
      'Crewneck Sweater Cream':  { S: 6,  M: 9,  L: 4,  XL: 2 },
    };

    const sizes = stockMap[product.name] || { S: 10, M: 10, L: 10, XL: 10 };

    for (const [size, stock] of Object.entries(sizes)) {
      await db.productVariant.create({
        data: { productId: product.id, size, stock },
      });
    }

    const totalStock = Object.values(sizes).reduce((a, b) => a + b, 0);
    console.log(`  ✓ ${product.name} — ${Object.keys(sizes).join(', ')} (${totalStock} total)`);
  }

  console.log('Done!');
}

seedVariants().catch(console.error).finally(() => process.exit(0));
