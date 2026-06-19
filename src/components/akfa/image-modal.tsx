'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  productName: string;
}

export default function ImageModal({ isOpen, onClose, imageUrl, productName }: ImageModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md cursor-zoom-out"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[105] flex flex-col items-center justify-center p-4 sm:p-8 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-200"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Product Name */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-xs sm:text-sm font-medium tracking-[0.3em] uppercase text-zinc-400 mb-4 sm:mb-6"
            >
              {productName}
            </motion.p>

            {/* Image */}
            <div className="relative max-w-3xl w-full max-h-[70vh] sm:max-h-[75vh] rounded-sm overflow-hidden border border-white/[0.08] shadow-2xl">
              <img
                src={imageUrl}
                alt={productName}
                className="w-full h-full object-contain bg-zinc-950"
              />
            </div>

            {/* Hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 flex items-center gap-1.5 text-[10px] text-zinc-600 tracking-wider"
            >
              <ZoomIn className="h-3 w-3" />
              Klik di luar gambar untuk menutup
            </motion.p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
