'use client';

import { useState } from 'react';
import { Menu, Shield, ShieldCheck, ShoppingBag, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { useCartStore } from '@/lib/cart-store';
import { useAdminStore } from '@/lib/admin-store';

interface NavbarProps {
  activeView: 'store' | 'admin';
  onAdminRequest: () => void;
  onGoHome: () => void;
  onCartOpen: () => void;
  isAdmin: boolean;
}

export default function Navbar({ activeView, onAdminRequest, onGoHome, onCartOpen, isAdmin }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems);
  const logout = useAdminStore((s) => s.logout);

  const navLinks = [
    { label: 'Koleksi', href: '#products' },
    { label: 'Tentang', href: '#about' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={onGoHome}>
          <span className="text-2xl sm:text-3xl font-black tracking-[0.3em] text-white uppercase">AKFA</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium tracking-widest uppercase text-zinc-400 hover:text-white transition-colors duration-300"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onCartOpen}
            className="relative text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-white text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Button>
          {isAdmin && activeView === 'admin' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => { logout(); onGoHome(); }}
              className="border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/50 font-semibold tracking-wide text-xs uppercase"
            >
              <LogOut className="h-4 w-4 mr-1.5" />
              Logout
            </Button>
          ) : (
            <Button
              variant={activeView === 'admin' ? 'default' : 'outline'}
              size="sm"
              onClick={onAdminRequest}
              className={
                activeView === 'admin'
                  ? 'bg-white text-black hover:bg-zinc-200 font-semibold tracking-wide text-xs uppercase'
                  : isAdmin
                  ? 'border-emerald-500/30 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-500/50 font-semibold tracking-wide text-xs uppercase'
                  : 'border-white/20 text-zinc-400 hover:text-white hover:border-white/40 font-semibold tracking-wide text-xs uppercase'
              }
            >
              {isAdmin ? <ShieldCheck className="h-4 w-4 mr-1.5" /> : <Shield className="h-4 w-4 mr-1.5" />}
              {isAdmin ? 'Admin ✓' : 'Admin'}
            </Button>
          )}
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onCartOpen}
            className="relative text-zinc-400 hover:text-white hover:bg-white/10"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-white text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Button>
          {isAdmin && activeView === 'admin' ? (
            <Button
              variant="ghost"
              size="icon"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              onClick={() => { logout(); onGoHome(); }}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className={isAdmin ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10' : 'text-zinc-400 hover:text-white hover:bg-white/10'}
              onClick={onAdminRequest}
            >
              {isAdmin ? <ShieldCheck className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
            </Button>
          )}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-white/10">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-black border-white/10 w-72">
              <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
              <div className="flex flex-col gap-6 mt-8">
                <div className="text-2xl font-black tracking-[0.3em] text-white uppercase">AKFA</div>
                <div className="h-px bg-white/10" />
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-sm font-medium tracking-widest uppercase text-zinc-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
