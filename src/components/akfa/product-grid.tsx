'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import ProductCard from './product-card';

interface Variant {
  id: string;
  size: string;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  description: string | null;
  imageUrl: string;
  variants: Variant[];
}

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  onAddedToCart: () => void;
}

export default function ProductGrid({ products, isLoading, onAddedToCart }: ProductGridProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  if (isLoading) {
    return (
      <section ref={sectionRef} className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-zinc-800 rounded-sm" />
              <div className="mt-3 space-y-2">
                <div className="h-4 bg-zinc-800 rounded w-3/4" />
                <div className="h-3 bg-zinc-800 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section ref={sectionRef} className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 space-y-4">
          <p className="text-4xl sm:text-5xl font-black tracking-[0.2em] text-zinc-800 uppercase">Empty</p>
          <p className="text-sm sm:text-base font-light tracking-[0.15em] text-zinc-500">Belum ada koleksi yang tersedia saat ini.</p>
        </motion.div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12 sm:mb-16">
        <p className="text-xs font-medium tracking-[0.5em] uppercase text-zinc-500 mb-3">Collection</p>
        <h2 className="text-3xl sm:text-4xl font-black tracking-[0.15em] text-white uppercase">Koleksi Kami</h2>
        <div className="w-12 h-px bg-zinc-600 mx-auto mt-4" />
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} onAddedToCart={onAddedToCart} />
        ))}
      </div>
    </section>
  );
}
