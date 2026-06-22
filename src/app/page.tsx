'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import Navbar from '@/components/akfa/navbar';
import Hero from '@/components/akfa/hero';
import PromoVideoBanner from '@/components/akfa/promo-video-banner';
import DocumentsSection from '@/components/akfa/documents-section';
import ProductGrid from '@/components/akfa/product-grid';
import AdminDashboard from '@/components/akfa/admin-dashboard';
import AdminGate from '@/components/akfa/admin-gate';
import CartDrawer from '@/components/akfa/cart-drawer';
import { Toaster } from '@/components/ui/sonner';
import { useAdminStore } from '@/lib/admin-store';

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

interface PromoVideo {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  active: boolean;
  sortOrder: number;
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
  sortOrder: number;
}

export default function HomePage() {
  const [manualView, setManualView] = useState<'store' | 'admin' | null>(null);
  const [showAdminGate, setShowAdminGate] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const productsRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, logout } = useAdminStore();

  // Derive active view: user preference > auto based on auth session
  const activeView = manualView ?? (isAuthenticated ? 'admin' : 'store');

  // ── Public Products ──────────────────────────────────────────────────
  const {
    data: publicProducts = [],
    isLoading: isPublicLoading,
    refetch: refetchPublic,
  } = useQuery<Product[]>({
    queryKey: ['products', 'public'],
    queryFn: () => fetch('/api/products').then((res) => res.json()),
    refetchInterval: 3000,
  });

  // ── Admin Products ──────────────────────────────────────────────────
  const {
    data: allProducts = [],
    refetch: refetchAdmin,
  } = useQuery<Product[]>({
    queryKey: ['products', 'admin'],
    queryFn: () => fetch('/api/products?all=true').then((res) => res.json()),
    refetchInterval: 3000,
    enabled: activeView === 'admin',
  });

  // ── Public Promo Videos ──────────────────────────────────────────────
  const {
    data: publicPromoVideos = [],
    refetch: refetchPublicVideos,
  } = useQuery<PromoVideo[]>({
    queryKey: ['promo-videos', 'public'],
    queryFn: () => fetch('/api/promo-videos').then((res) => res.json()),
    refetchInterval: 3000,
  });

  // ── Admin Promo Videos ───────────────────────────────────────────────
  const {
    data: adminPromoVideos = [],
    refetch: refetchAdminVideos,
  } = useQuery<PromoVideo[]>({
    queryKey: ['promo-videos', 'admin'],
    queryFn: () => fetch('/api/promo-videos?all=true').then((res) => res.json()),
    refetchInterval: 3000,
    enabled: activeView === 'admin',
  });

  // ── Public Documents ─────────────────────────────────────────────────
  const {
    data: publicDocuments = [],
    refetch: refetchPublicDocs,
  } = useQuery<Document[]>({
    queryKey: ['documents', 'public'],
    queryFn: () => fetch('/api/documents').then((res) => res.json()),
    refetchInterval: 3000,
  });

  // ── Admin Documents ──────────────────────────────────────────────────
  const {
    data: adminDocuments = [],
    refetch: refetchAdminDocs,
  } = useQuery<Document[]>({
    queryKey: ['documents', 'admin'],
    queryFn: () => fetch('/api/documents?all=true').then((res) => res.json()),
    refetchInterval: 3000,
    enabled: activeView === 'admin',
  });

  // ── Refetch helpers ─────────────────────────────────────────────────
  const refetchAll = useCallback(() => {
    refetchPublic(); refetchAdmin();
    refetchPublicVideos(); refetchAdminVideos();
    refetchPublicDocs(); refetchAdminDocs();
  }, [refetchPublic, refetchAdmin, refetchPublicVideos, refetchAdminVideos, refetchPublicDocs, refetchAdminDocs]);

  const scrollToProducts = useCallback(() => {
    productsRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const goHome = useCallback(() => setManualView('store'), []);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [activeView]);

  const handleAdminRequest = useCallback(() => {
    // If already authenticated via localStorage, go straight to admin
    if (isAuthenticated) {
      setManualView('admin');
      return;
    }
    if (activeView === 'admin') return;
    setShowAdminGate(true);
  }, [activeView, isAuthenticated]);

  const handleAdminVerified = useCallback(() => {
    setShowAdminGate(false);
    setManualView('admin');
  }, []);

  const handleAdminLogout = useCallback(() => {
    logout();
    setManualView('store');
  }, [logout]);

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Navbar
        activeView={activeView}
        onAdminRequest={handleAdminRequest}
        onGoHome={goHome}
        onCartOpen={() => setShowCart(true)}
        isAdmin={isAuthenticated}
      />

      <AnimatePresence mode="wait">
        {activeView === 'store' ? (
          <main key="store" className="flex-1">
            <Hero onScrollToProducts={scrollToProducts} />

            {/* Promo Banner — dynamic: video autoplay OR static image */}
            <PromoVideoBanner videos={publicPromoVideos} />

            {/* Product Catalog */}
            <div ref={productsRef}>
              <ProductGrid
                products={publicProducts}
                isLoading={isPublicLoading}
                onAddedToCart={() => setShowCart(true)}
              />
            </div>

            {/* Documents & Catalogs — dynamic download/view based on file type */}
            <DocumentsSection documents={publicDocuments} />

            {/* About Section */}
            <section id="about" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-t border-white/[0.06]">
              <div className="max-w-3xl mx-auto text-center space-y-6">
                <p className="text-xs font-medium tracking-[0.5em] uppercase text-zinc-500">About</p>
                <h2 className="text-3xl sm:text-4xl font-black tracking-[0.15em] text-white uppercase">
                  Tentang AKFA
                </h2>
                <div className="w-12 h-px bg-zinc-600 mx-auto" />
                <p className="text-sm sm:text-base font-light leading-relaxed text-zinc-400 max-w-xl mx-auto">
                  AKFA adalah brand pakaian pria yang mengusung konsep modern streetwear dengan sentuhan luxury.
                  Setiap koleksi dirancang untuk pria yang menghargai kualitas, kesederhanaan, dan gaya yang timeless.
                </p>
              </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-t border-white/[0.06]">
              <div className="max-w-2xl mx-auto text-center space-y-10">
                <div className="space-y-4">
                  <p className="text-xs font-medium tracking-[0.5em] uppercase text-zinc-500">Contact</p>
                  <h2 className="text-3xl sm:text-4xl font-black tracking-[0.15em] text-white uppercase">
                    Hubungi Kami
                  </h2>
                  <div className="w-12 h-px bg-zinc-600 mx-auto" />
                  <p className="text-sm font-light leading-relaxed text-zinc-400 max-w-md mx-auto">
                    Ada pertanyaan atau ingin order? Langsung hubungi kami lewat WhatsApp atau email.
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <a
                    href="https://wa.me/6281918647292"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center gap-4 p-6 sm:p-8 bg-white/[0.03] border border-white/[0.06] rounded-sm hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300"
                  >
                    <div className="w-14 h-14 rounded-full border border-white/[0.08] bg-white/[0.03] flex items-center justify-center group-hover:bg-white/[0.06] transition-colors">
                      <svg viewBox="0 0 24 24" className="h-6 w-6 text-zinc-400 group-hover:text-emerald-400 transition-colors" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium tracking-[0.2em] uppercase text-zinc-500">WhatsApp</p>
                      <p className="text-sm font-semibold tracking-wide text-white">0819-1864-7292</p>
                    </div>
                    <span className="text-[10px] text-zinc-600 tracking-wider uppercase">Klik untuk chat →</span>
                  </a>
                  <a
                    href="mailto:furqonahimsya0@gmail.com"
                    className="group flex flex-col items-center gap-4 p-6 sm:p-8 bg-white/[0.03] border border-white/[0.06] rounded-sm hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300"
                  >
                    <div className="w-14 h-14 rounded-full border border-white/[0.08] bg-white/[0.03] flex items-center justify-center group-hover:bg-white/[0.06] transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6 text-zinc-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium tracking-[0.2em] uppercase text-zinc-500">Email</p>
                      <p className="text-sm font-semibold tracking-wide text-white break-all">furqonahimsya0@gmail.com</p>
                    </div>
                    <span className="text-[10px] text-zinc-600 tracking-wider uppercase">Klik untuk kirim email →</span>
                  </a>
                </div>
              </div>
            </section>
          </main>
        ) : (
          <main key="admin" className="flex-1">
            <AdminDashboard
              products={allProducts}
              promoVideos={adminPromoVideos}
              documents={adminDocuments}
              isLoading={false}
              onBackToStore={goHome}
              onLogout={handleAdminLogout}
              refetch={refetchAll}
              refetchVideos={refetchAdminVideos}
              refetchDocuments={refetchAdminDocs}
            />
          </main>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-black mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center sm:items-start gap-1">
              <span className="text-xl font-black tracking-[0.3em] text-white uppercase">AKFA</span>
              <p className="text-xs text-zinc-600 tracking-wide">Modern Menswear Collection</p>
            </div>
            <div className="flex flex-col items-center sm:items-end gap-2 text-xs">
              <a href="https://wa.me/6281918647292" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white tracking-wide transition-colors">
                0819-1864-7292
              </a>
              <a href="mailto:furqonahimsya0@gmail.com" className="text-zinc-500 hover:text-white tracking-wide transition-colors">
                furqonahimsya0@gmail.com
              </a>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-white/[0.04] text-center">
            <p className="text-xs text-zinc-700 tracking-wide">&copy; {new Date().getFullYear()} AKFA. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <CartDrawer isOpen={showCart} onClose={() => setShowCart(false)} />

      {/* Admin Gate Dialog */}
      <AdminGate isOpen={showAdminGate} onClose={() => setShowAdminGate(false)} onVerified={handleAdminVerified} />

      <Toaster theme="dark" position="top-right" toastOptions={{ style: { background: '#18181b', border: '1px solid rgba(255,255,255,0.06)', color: '#fff' } }} />
    </div>
  );
}
