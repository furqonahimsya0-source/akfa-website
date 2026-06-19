'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore, type CartItem } from '@/lib/cart-store';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function buildWhatsAppMessage(items: CartItem[], totalPrice: number): string {
  let msg = `Halo, saya ingin memesan:\n\n`;
  items.forEach((item, idx) => {
    msg += `${idx + 1}. ${item.name}\n   Ukuran: ${item.size} | Qty: ${item.quantity}\n   Harga: ${formatPrice(item.price * item.quantity)}\n\n`;
  });
  msg += `─────────\nTotal: ${formatPrice(totalPrice)}\n\nMohon konfirmasi ketersediaan dan ongkos kirim. Terima kasih! 🙏`;
  return `https://wa.me/6281918647292?text=${encodeURIComponent(msg)}`;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCartStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 right-0 z-[95] h-full w-full max-w-md bg-zinc-950 border-l border-white/[0.06] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-5 w-5 text-white" />
                <h2 className="text-lg font-black tracking-[0.15em] text-white uppercase">Keranjang</h2>
                <span className="text-xs font-medium bg-white/10 text-zinc-400 px-2 py-0.5 rounded-sm">
                  {items.length} item
                </span>
              </div>
              <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
                  <ShoppingBag className="h-12 w-12 text-zinc-800" />
                  <p className="text-sm text-zinc-500">Keranjang masih kosong</p>
                  <Button variant="outline" onClick={onClose} className="border-white/10 text-zinc-400 hover:text-white hover:border-white/20 text-xs tracking-wider uppercase mt-2">
                    Mulai Belanja
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={`${item.productId}-${item.size}`}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex gap-4 p-5"
                      >
                        {/* Thumbnail */}
                        <div className="relative w-16 h-16 flex-shrink-0 rounded-sm overflow-hidden bg-zinc-900">
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold tracking-widest uppercase bg-white/10 text-zinc-300 px-1.5 py-0.5 rounded-sm">
                              {item.size}
                            </span>
                            <span className="text-xs text-zinc-500">{formatPrice(item.price)}</span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            {/* Quantity controls */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                                className="w-7 h-7 flex items-center justify-center rounded-sm border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-colors"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-8 text-center text-sm font-semibold text-white">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                                className="w-7 h-7 flex items-center justify-center rounded-sm border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-colors"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            {/* Price + Delete */}
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-semibold text-white">{formatPrice(item.price * item.quantity)}</span>
                              <button
                                onClick={() => removeItem(item.productId, item.size)}
                                className="text-zinc-600 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer with total + checkout */}
            {items.length > 0 && (
              <div className="border-t border-white/[0.06] px-6 py-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400 tracking-wide">Total</span>
                  <span className="text-xl font-black tracking-wide text-white">{formatPrice(totalPrice())}</span>
                </div>
                <a
                  href={buildWhatsAppMessage(items, totalPrice())}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => { clearCart(); onClose(); }}
                >
                  <Button className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold tracking-[0.15em] uppercase text-xs rounded-sm transition-colors">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Checkout via WhatsApp
                  </Button>
                </a>
                <button
                  onClick={clearCart}
                  className="w-full text-xs text-zinc-600 hover:text-zinc-400 tracking-wide transition-colors text-center"
                >
                  Kosongkan Keranjang
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
