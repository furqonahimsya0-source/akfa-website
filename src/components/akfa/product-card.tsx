'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Check, Zap, Eye, Play } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { toast } from 'sonner';
import ImageModal from './image-modal';

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
  videoUrl: string | null;
  variants: Variant[];
}

interface ProductCardProps {
  product: Product;
  index: number;
  onAddedToCart: () => void;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);
}

export default function ProductCard({ product, index, onAddedToCart }: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [added, setAdded] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const sizes = product.variants || [];
  const totalStock = sizes.reduce((sum, v) => sum + v.stock, 0);
  const selectedVariant = sizes.find((v) => v.size === selectedSize);

  const addToCart = () => {
    if (!selectedSize) {
      toast.error('Pilih ukuran dulu');
      return;
    }
    if (!selectedVariant || selectedVariant.stock <= 0) {
      toast.error('Stok habis');
      return;
    }
    addItem({ productId: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl, size: selectedSize });
    setAdded(true);
    toast.success(`${product.name} (${selectedSize}) masuk keranjang!`);
    setTimeout(() => setAdded(false), 1500);
  };

  const buyNow = () => {
    if (!selectedSize) {
      toast.error('Pilih ukuran dulu');
      return;
    }
    if (!selectedVariant || selectedVariant.stock <= 0) {
      toast.error('Stok habis');
      return;
    }
    addItem({ productId: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl, size: selectedSize });
    onAddedToCart();
    toast.success(`${product.name} (${selectedSize}) masuk keranjang!`);
  };

  const handleSizeClick = (v: Variant) => {
    if (v.stock > 0) setSelectedSize(v.size);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.08 }}
        className="group relative bg-white/[0.03] border border-white/[0.06] rounded-sm overflow-hidden hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-500"
      >
        {/* Image */}
        <div
          className="relative aspect-[3/4] overflow-hidden bg-zinc-900 cursor-pointer"
          onClick={() => !imageError && setShowImageModal(true)}
        >
          {!imageError ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-700">
              <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
              <span className="text-xs text-zinc-600">Gambar tidak tersedia</span>
            </div>
          )}

          {/* Hover overlay with zoom/play icon */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            {product.videoUrl && !showVideo ? (
              <button
                onClick={(e) => { e.stopPropagation(); setShowVideo(true); }}
                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <Play className="h-6 w-6 text-white ml-0.5" />
              </button>
            ) : (
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Eye className="h-5 w-5 text-white" />
              </div>
            )}
          </div>

          {/* Video player overlay */}
          {showVideo && product.videoUrl && (
            <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center z-10">
              <video
                src={product.videoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
                onError={() => setShowVideo(false)}
              />
              <button
                onClick={() => setShowVideo(false)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center text-xs z-20"
              >
                ✕
              </button>
            </div>
          )}

          {/* Stock badges */}
          {totalStock === 0 && (
            <div className="absolute top-3 left-3 bg-red-600/90 text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-sm">Habis</div>
          )}
          {totalStock > 0 && totalStock <= 5 && (
            <div className="absolute top-3 left-3 bg-amber-600/90 text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-sm">Stok Terbatas</div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 sm:p-5 space-y-3">
          <div>
            <h3 className="text-sm sm:text-base font-semibold tracking-wide text-white truncate">{product.name}</h3>
            {product.description && (
              <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed mt-0.5">{product.description}</p>
            )}
            <p className="text-sm sm:text-base font-medium tracking-wide text-zinc-300 mt-1">{formatPrice(product.price)}</p>
          </div>

          {/* Size + Stock */}
          {sizes.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-zinc-500">Pilih Ukuran & Stok</p>
              <div className="space-y-1">
                {sizes.map((v) => {
                  const outOfStock = v.stock <= 0;
                  const isLow = v.stock > 0 && v.stock <= 3;
                  const isSelected = selectedSize === v.size;
                  return (
                    <button
                      key={v.id}
                      onClick={() => handleSizeClick(v)}
                      disabled={outOfStock}
                      className={`w-full flex items-center justify-between h-9 px-3 rounded-sm text-[11px] font-bold tracking-wider uppercase border transition-all duration-200 ${
                        outOfStock
                          ? 'border-white/[0.04] text-zinc-700 cursor-not-allowed bg-white/[0.01] line-through'
                          : isSelected
                          ? 'bg-white text-black border-white'
                          : 'border-white/[0.08] text-zinc-400 hover:border-white/25 hover:text-white hover:bg-white/[0.02]'
                      }`}
                    >
                      <span>{v.size}</span>
                      <span className={`font-medium tracking-wide ${outOfStock ? 'text-zinc-700' : isLow ? 'text-amber-400' : isSelected ? 'text-black/60' : 'text-zinc-500'}`}>
                        {outOfStock ? 'habis' : `${v.stock} pcs`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={addToCart}
              disabled={totalStock === 0}
              className={`flex-1 h-11 rounded-sm text-xs font-bold tracking-[0.12em] uppercase transition-all duration-300 flex items-center justify-center gap-1.5 ${
                added
                  ? 'bg-emerald-600 text-white'
                  : totalStock === 0
                  ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-white/[0.04]'
                  : 'bg-zinc-900 text-white border border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              {added ? <><Check className="h-3.5 w-3.5" /> Ditambahkan</> : <><ShoppingBag className="h-3.5 w-3.5" /> Keranjang</>}
            </button>
            <button
              onClick={buyNow}
              disabled={totalStock === 0}
              className={`flex-1 h-11 rounded-sm text-xs font-bold tracking-[0.12em] uppercase transition-all duration-300 flex items-center justify-center gap-1.5 ${
                totalStock === 0
                  ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-white/[0.04]'
                  : 'bg-white text-black hover:bg-zinc-200'
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              Beli Sekarang
            </button>
          </div>
        </div>
      </motion.div>

      {/* Image Modal */}
      <ImageModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageUrl={product.imageUrl}
        productName={product.name}
      />
    </>
  );
}
