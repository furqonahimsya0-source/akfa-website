'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, PlusCircle, LayoutGrid, Film, FileText, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import AddProductForm from './add-product-form';
import AdminProductList from './admin-product-list';
import PromoVideoManager from './promo-video-manager';
import DocumentManager from './document-manager';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string | null;
  imageUrl: string;
  videoUrl: string | null;
  active: boolean;
  variants: { id: string; size: string; stock: number }[];
}

interface PromoVideo {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  active: boolean;
  order: number;
}

interface Document {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  active: boolean;
  order: number;
}

interface AdminDashboardProps {
  products: Product[];
  promoVideos: PromoVideo[];
  documents: Document[];
  isLoading: boolean;
  onBackToStore: () => void;
  onLogout: () => void;
  refetch: () => void;
  refetchVideos: () => void;
  refetchDocuments: () => void;
}

export default function AdminDashboard({
  products,
  promoVideos,
  documents,
  isLoading,
  onBackToStore,
  onLogout,
  refetch,
  refetchVideos,
  refetchDocuments,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'promo' | 'docs'>('list');

  const handleProductAdded = () => {
    refetch();
    setActiveTab('list');
  };

  const handleProductDeleted = () => {
    refetch();
    toast.success('Produk berhasil dihapus');
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active }),
      });
      if (!res.ok) throw new Error('Failed to update');
      refetch();
      toast.success(active ? 'Produk ditampilkan di toko' : 'Produk disembunyikan dari toko');
    } catch {
      toast.error('Gagal mengubah status produk');
    }
  };

  const activeCount = products.filter((p) => p.active).length;
  const activeVideos = promoVideos.filter((v) => v.active).length;
  const activeDocs = documents.filter((d) => d.active).length;

  const tabs = [
    { key: 'list' as const, label: 'Daftar Produk', icon: LayoutGrid, count: activeCount },
    { key: 'add' as const, label: 'Tambah Produk', icon: PlusCircle },
    { key: 'promo' as const, label: 'Video Promosi', icon: Film, count: activeVideos },
    { key: 'docs' as const, label: 'Dokumen', icon: FileText, count: activeDocs },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="space-y-1">
            <Button
              variant="ghost"
              onClick={onBackToStore}
              className="text-zinc-500 hover:text-white -ml-2 mb-2 text-xs tracking-wide uppercase"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Kembali ke Toko
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black tracking-[0.15em] text-white uppercase">
                Admin Panel
              </h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs tracking-wide uppercase h-8 px-2"
              >
                <LogOut className="h-3.5 w-3.5 mr-1" />
                Logout
              </Button>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="bg-zinc-900 border border-white/[0.06] rounded-sm px-3 py-2 text-center">
              <p className="text-lg font-bold text-white">{activeCount}</p>
              <p className="text-[10px] text-zinc-500 tracking-wider uppercase">Produk</p>
            </div>
            <div className="bg-zinc-900 border border-white/[0.06] rounded-sm px-3 py-2 text-center">
              <p className="text-lg font-bold text-white">{activeVideos}</p>
              <p className="text-[10px] text-zinc-500 tracking-wider uppercase">Video</p>
            </div>
            <div className="bg-zinc-900 border border-white/[0.06] rounded-sm px-3 py-2 text-center">
              <p className="text-lg font-bold text-white">{activeDocs}</p>
              <p className="text-[10px] text-zinc-500 tracking-wider uppercase">Dokumen</p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-8 border-b border-white/[0.06] pb-4 overflow-x-auto">
          {tabs.map((tab) => (
            <Button
              key={tab.key}
              variant="ghost"
              onClick={() => setActiveTab(tab.key)}
              className={`tracking-widest uppercase text-xs font-medium transition-colors rounded-sm whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-white text-black hover:bg-zinc-200'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-1.5" />
              {tab.label}
              {tab.count !== undefined && (
                <span className={`ml-1.5 text-[10px] px-1 rounded-sm ${activeTab === tab.key ? 'bg-black/10' : 'bg-zinc-800 text-zinc-500'}`}>
                  {tab.count}
                </span>
              )}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'list' ? (
          <AdminProductList
            products={products}
            onProductDeleted={handleProductDeleted}
            onToggleActive={handleToggleActive}
          />
        ) : activeTab === 'add' ? (
          <div className="max-w-lg">
            <AddProductForm onProductAdded={handleProductAdded} />
          </div>
        ) : activeTab === 'promo' ? (
          <div className="max-w-2xl">
            <PromoVideoManager videos={promoVideos} onUpdated={refetchVideos} />
          </div>
        ) : (
          <div className="max-w-2xl">
            <DocumentManager documents={documents} onUpdated={refetchDocuments} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
