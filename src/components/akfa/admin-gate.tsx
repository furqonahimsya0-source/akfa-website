'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X, ArrowRight, Loader2, CheckCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAdminStore } from '@/lib/admin-store';

interface AdminGateProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
}

export default function AdminGate({ isOpen, onClose, onVerified }: AdminGateProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const onVerifiedRef = useRef(onVerified);
  onVerifiedRef.current = onVerified;

  const { login } = useAdminStore();

  useEffect(() => {
    if (isOpen) {
      setCode('');
      setError('');
      setIsSuccess(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isVerifying) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isVerifying, onClose]);

  const doVerify = useCallback(async (codeValue: string) => {
    const trimmed = codeValue.trim();
    if (!trimmed) {
      setError('Masukkan kode akses');
      return;
    }

    setIsVerifying(true);
    setError('');

    // Try up to 3 times with retry on network error
    const MAX_RETRIES = 3;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const res = await fetch('/api/admin/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: trimmed }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setIsSuccess(true);
          login(trimmed);
          toast.success('Akses Admin diterima');
          setTimeout(() => {
            onVerifiedRef.current();
          }, 500);
          return;
        } else {
          setError(data.error || 'Kode akses salah');
          inputRef.current?.focus();
          setCode('');
          return;
        }
      } catch {
        // Network error — retry if we have attempts left
        if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, 1500 * attempt));
          continue;
        }
        setError('Gagal menghubungi server. Coba lagi.');
        setIsVerifying(false);
        return;
      }
    }
    setIsVerifying(false);
  }, [login]);

  const handleInput = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    const val = (e.target as HTMLInputElement).value;
    setCode(val);
    setError('');
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const currentCode = inputRef.current?.value || code;
      doVerify(currentCode);
    }
  }, [code, doVerify]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const currentCode = inputRef.current?.value || code;
    doVerify(currentCode);
  }, [code, doVerify]);

  const canSubmit = code.trim().length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={isVerifying ? undefined : onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative w-full max-w-sm mx-4 bg-zinc-950 border border-white/[0.08] rounded-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top accent line */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Close button */}
            <button
              onClick={onClose}
              disabled={isVerifying || isSuccess}
              className="absolute top-4 right-4 text-zinc-600 hover:text-white transition-colors disabled:opacity-50 z-10"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="px-8 pt-10 pb-8">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <AnimatePresence mode="wait">
                  {isSuccess ? (
                    <motion.div
                      key="success"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-14 h-14 rounded-full border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center"
                    >
                      <CheckCircle className="h-6 w-6 text-emerald-400" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="lock"
                      initial={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      className="w-14 h-14 rounded-full border border-white/[0.08] bg-white/[0.03] flex items-center justify-center"
                    >
                      <Lock className="h-6 w-6 text-zinc-400" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Title */}
              <div className="text-center space-y-2 mb-8">
                <h2 className="text-xl font-black tracking-[0.15em] text-white uppercase">
                  {isSuccess ? 'Verifikasi Berhasil' : 'Akses Admin'}
                </h2>
                <p className="text-xs text-zinc-500 tracking-wide">
                  {isSuccess ? 'Mengalihkan ke dashboard...' : 'Masukkan kode akses untuk melanjutkan'}
                </p>
              </div>

              {/* Input area */}
              {!isSuccess && (
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="password"
                      inputMode="numeric"
                      value={code}
                      onChange={handleInput}
                      onKeyDown={handleKeyDown}
                      placeholder="Masukkan kode akses"
                      disabled={isVerifying}
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                      maxLength={10}
                      className="w-full h-14 bg-zinc-900 border border-white/[0.08] rounded-sm px-4 text-center text-lg font-semibold tracking-[0.3em] text-white placeholder:text-zinc-700 placeholder:tracking-[0.05em] focus:outline-none focus:border-white/30 transition-colors disabled:opacity-50"
                    />
                  </div>

                  {/* Error message */}
                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-xs text-red-400 text-center tracking-wide"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Submit button */}
                  <button
                    type="button"
                    onClick={handleClick}
                    className={`w-full h-12 font-bold tracking-[0.2em] uppercase text-xs rounded-sm transition-all duration-200 ${
                      canSubmit
                        ? 'bg-white text-black hover:bg-zinc-200 cursor-pointer'
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    } ${isVerifying ? 'opacity-60' : ''}`}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Memverifikasi...
                      </>
                    ) : (
                      <>
                        Masuk
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Success loading indicator */}
              {isSuccess && (
                <div className="flex justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
                </div>
              )}

              {/* Bottom hint */}
              <div className="mt-6 pt-4 border-t border-white/[0.04]">
                <p className="text-[10px] text-zinc-700 text-center tracking-wider">
                  Hanya pemilik yang memiliki kode akses
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
