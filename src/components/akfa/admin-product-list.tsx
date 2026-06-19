'use client';

import { Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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
  active: boolean;
  variants: Variant[];
}

interface AdminProductListProps {
  products: Product[];
  onProductDeleted: () => void;
  onToggleActive: (id: string, active: boolean) => void;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);
}

export default function AdminProductList({ products, onProductDeleted, onToggleActive }: AdminProductListProps) {
  if (products.length === 0) {
    return <div className="text-center py-16 space-y-3"><p className="text-zinc-600 text-sm tracking-wide">Belum ada produk.</p></div>;
  }

  return (
    <div className="space-y-3">
      {products.map((product) => {
        const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);
        return (
          <div key={product.id} className={`p-3 sm:p-4 rounded-sm border transition-colors ${product.active ? 'bg-zinc-900/50 border-white/[0.06]' : 'bg-zinc-950 border-white/[0.03] opacity-50'}`}>
            <div className="flex items-start gap-4">
              {/* Image */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-sm overflow-hidden bg-zinc-800">
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold text-white truncate">{product.name}</h3>
                  <span className={`text-[10px] font-medium tracking-wider uppercase px-1.5 py-0.5 rounded-sm ${product.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700/50 text-zinc-500'}`}>
                    {product.active ? 'Aktif' : 'Nonaktif'}
                  </span>
                  <span className={`text-[10px] font-medium tracking-wider uppercase px-1.5 py-0.5 rounded-sm ${totalStock === 0 ? 'bg-red-500/10 text-red-400' : totalStock <= 10 ? 'bg-amber-500/10 text-amber-400' : 'bg-zinc-800 text-zinc-400'}`}>
                    Stok: {totalStock}
                  </span>
                  {product.videoUrl && (
                    <span className="text-[10px] font-medium tracking-wider uppercase px-1.5 py-0.5 rounded-sm bg-blue-500/10 text-blue-400">
                      🎬 Video
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400">{formatPrice(product.price)}</p>

                {/* Size stock table */}
                {product.variants.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {product.variants.map((v) => (
                      <div key={v.id} className={`text-[10px] tracking-wider px-2 py-0.5 rounded-sm border ${v.stock === 0 ? 'border-red-500/20 text-red-400 bg-red-500/5' : 'border-white/[0.06] text-zinc-400 bg-zinc-900'}`}>
                        {v.size}: <span className="font-bold">{v.stock}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button variant="ghost" size="icon" onClick={() => onToggleActive(product.id, !product.active)} className={`h-8 w-8 ${product.active ? 'text-zinc-400 hover:text-zinc-200 hover:bg-white/10' : 'text-zinc-600 hover:text-zinc-400 hover:bg-white/5'}`} title={product.active ? 'Sembunyikan' : 'Tampilkan'}>
                  {product.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-500/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-zinc-900 border-white/10">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">Hapus Produk</AlertDialogTitle>
                      <AlertDialogDescription className="text-zinc-400">
                        Hapus <strong className="text-white">{product.name}</strong> secara permanen?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-zinc-800 border-white/10 text-zinc-300">Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={async () => { const r = await fetch(`/api/products/${product.id}`, { method: 'DELETE' }); if (r.ok) onProductDeleted(); }} className="bg-red-600 hover:bg-red-700">Hapus</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
