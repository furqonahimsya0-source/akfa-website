import { db } from '@/lib/db';

async function seedProducts() {
  const products = [
    {
      name: 'Oversized Tee Black',
      price: 289000,
      description: 'Kaos oversize premium dengan bahan cotton combed 30s. Desain minimalis cocok untuk tampilan streetwear.',
      imageUrl: '/uploads/product-tee-black.png',
      active: true,
    },
    {
      name: 'Cargo Pants Grey',
      price: 459000,
      description: 'Celana cargo dengan bahan twill premium. Dilengkapi multi-saku fungsional dan cutting modern.',
      imageUrl: '/uploads/product-cargo-grey.png',
      active: true,
    },
    {
      name: 'Minimalist Hoodie White',
      price: 389000,
      description: 'Hoodie polos premium dengan bahan fleece tebal. Cocok untuk layering outfit harian.',
      imageUrl: '/uploads/product-hoodie-white.png',
      active: true,
    },
    {
      name: 'Bomber Jacket Black',
      price: 599000,
      description: 'Bomber jacket premium dengan bahan parasut waterproof. Cocok untuk tampilan bold dan stylish.',
      imageUrl: '/uploads/product-bomber-black.png',
      active: true,
    },
    {
      name: 'Jogger Pants Charcoal',
      price: 349000,
      description: 'Celana jogger slim fit dengan bahan cotton terry. Nyaman digunakan untuk sehari-hari.',
      imageUrl: '/uploads/product-jogger-charcoal.png',
      active: true,
    },
    {
      name: 'Crewneck Sweater Cream',
      price: 429000,
      description: 'Sweater crewneck dengan bahan knit premium. Warna off-white yang elegan untuk tampilan kasual.',
      imageUrl: '/uploads/product-sweater-cream.png',
      active: true,
    },
  ];

  for (const product of products) {
    const existing = await db.product.findFirst({ where: { name: product.name } });
    if (!existing) {
      await db.product.create({ data: product });
      console.log(`✓ Created: ${product.name}`);
    } else {
      console.log(`  Skipped (exists): ${product.name}`);
    }
  }

  console.log('Seed complete!');
}

seedProducts()
  .catch(console.error)
  .finally(() => process.exit(0));
