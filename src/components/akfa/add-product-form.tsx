'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, Loader2, Plus, Minus, Trash2, X, Film, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAdminStore } from '@/lib/admin-store';

interface AddProductFormProps {
  onProductAdded: () => void;
}

interface SizeStock {
  size: string;
  stock: number;
}

const DEFAULT_SIZES: SizeStock[] = [
  { size: 'S', stock: 10 },
  { size: 'M', stock: 10 },
  { size: 'L', stock: 10 },
  { size: 'XL', stock: 10 },
];

export default function AddProductForm({ onProductAdded }: AddProductFormProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageInfo, setImageInfo] = useState<{ name: string; size: string } | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [sizeStocks, setSizeStocks] = useState<SizeStock[]>(DEFAULT_SIZES);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // === IMAGE HANDLING ===
  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) { toast.error('Foto maksimal 100MB'); return; }
    if (file.size === 0) { toast.error('File kosong'); return; }

    setImageFile(file);
    setImageInfo({ name: file.name, size: `${(file.size / 1024).toFixed(1)} KB` });
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const removeImage = useCallback(() => {
    setImagePreview(null); setImageFile(null); setImageInfo(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  // === VIDEO HANDLING ===
  const handleVideoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024 * 1024) { toast.error('Video maksimal 2GB'); return; }
    if (file.size === 0) { toast.error('File kosong'); return; }

    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
  }, []);

  const removeVideo = useCallback(() => {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoFile(null); setVideoPreview(null);
    if (videoInputRef.current) videoInputRef.current.value = '';
  }, [videoPreview]);

  // === SIZE STOCK ===
  const updateSizeStock = (index: number, field: 'size' | 'stock', value: string | number) => {
    setSizeStocks((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };
  const addSizeRow = () => setSizeStocks((prev) => [...prev, { size: '', stock: 0 }]);
  const removeSizeRow = (index: number) => setSizeStocks((prev) => prev.filter((_, i) => i !== index));

  const adminToken = useAdminStore((s) => s.adminToken);

  // === UPLOAD HELPER ===
  const uploadFile = async (file: File, fieldName: string): Promise<string> => {
    const form = new FormData();
    form.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'X-Admin-Token': adminToken },
      body: form,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload gagal');

    return data.imageUrl || data.videoUrl || data.url;
  };

  // === SUBMIT ===
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Nama produk harus diisi'); return; }
    if (!price || Number(price) <= 0) { toast.error('Harga harus lebih dari 0'); return; }
    if (!imageFile) { toast.error('Upload foto produk dulu'); return; }

    const validSizes = sizeStocks.filter((s) => s.size.trim() && Number(s.stock) >= 0);
    if (validSizes.length === 0) { toast.error('Tambahkan minimal satu ukuran'); return; }

    setIsSubmitting(true);
    try {
      // Step 1: Upload foto via universal upload (→ microservice)
      setUploadProgress('Mengupload foto...');
      const imageUrl = await uploadFile(imageFile, 'image');

      // Step 2: Upload video (opsional)
      let finalVideoUrl: string | null = null;
      if (videoFile) {
        setUploadProgress('Mengupload video...');
        finalVideoUrl = await uploadFile(videoFile, 'video');
      }

      // Step 3: Buat produk
      setUploadProgress('Menyimpan produk...');
      const productRes = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          price: Number(price),
          description: description.trim() || null,
          imageUrl,
          videoUrl: finalVideoUrl,
          variants: validSizes,
        }),
      });
      if (!productRes.ok) throw new Error((await productRes.json()).error || 'Gagal membuat produk');

      toast.success('Produk berhasil ditambahkan!');
      setName(''); setPrice(''); setDescription('');
      setImagePreview(null); setImageFile(null); setImageInfo(null);
      removeVideo();
      setSizeStocks(DEFAULT_SIZES);
      setUploadProgress('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      onProductAdded();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menambahkan produk');
    } finally {
      setIsSubmitting(false);
      setUploadProgress('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nama */}
      <div className="space-y-2">
        <Label className="text-zinc-300 text-xs tracking-widest uppercase font-medium">Nama Produk</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Oversized Tee Black" className="bg-zinc-900 border-white/10 text-white placeholder:text-zinc-600 focus:border-white/30 rounded-sm" />
      </div>

      {/* Harga */}
      <div className="space-y-2">
        <Label className="text-zinc-300 text-xs tracking-widest uppercase font-medium">Harga (Rp)</Label>
        <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="250000" className="bg-zinc-900 border-white/10 text-white placeholder:text-zinc-600 focus:border-white/30 rounded-sm" />
      </div>

      {/* Deskripsi */}
      <div className="space-y-2">
        <Label className="text-zinc-300 text-xs tracking-widest uppercase font-medium">Deskripsi</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Deskripsi singkat..." rows={2} className="bg-zinc-900 border-white/10 text-white placeholder:text-zinc-600 focus:border-white/30 rounded-sm resize-none" />
      </div>

      {/* FOTO PRODUK */}
      <div className="space-y-2">
        <Label className="text-zinc-300 text-xs tracking-widest uppercase font-medium flex items-center gap-2">
          Foto Produk <span className="text-[10px] text-zinc-600 tracking-widest font-normal">MAKS. 100MB</span>
        </Label>

        {imagePreview ? (
          <div className="space-y-2">
            <div className="relative aspect-[4/3] max-w-[320px] rounded-sm overflow-hidden border border-white/10 bg-zinc-950">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            </div>
            {imageInfo && (
              <p className="text-[10px] text-zinc-500">{imageInfo.name} • {imageInfo.size}</p>
            )}
            <button type="button" onClick={removeImage} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-400 tracking-wide transition-colors">
              <Trash2 className="h-3 w-3" /> Ganti Foto
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center aspect-[4/3] max-w-[320px] border-2 border-dashed border-white/10 rounded-sm cursor-pointer hover:border-white/20 hover:bg-white/[0.02] transition-all group">
            <Upload className="h-8 w-8 text-zinc-600 group-hover:text-zinc-400 transition-colors mb-2" />
            <span className="text-xs text-zinc-400 tracking-wide font-medium">Klik untuk upload foto</span>
            <span className="text-[10px] text-zinc-600 mt-1">JPG, PNG, WebP, GIF, BMP, AVIF</span>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
        )}
      </div>

      {/* VIDEO PROMOSI (opsional) */}
      <div className="space-y-2">
        <Label className="text-zinc-300 text-xs tracking-widest uppercase font-medium flex items-center gap-2">
          Video Produk <span className="text-[10px] text-zinc-600 tracking-widest font-normal">OPSIONAL • MAKS. 2GB</span>
        </Label>

        {videoPreview ? (
          <div className="space-y-2">
            <div className="relative max-w-[320px] rounded-sm overflow-hidden border border-white/10 bg-zinc-950">
              <video src={videoPreview} controls className="w-full max-h-[240px]" />
            </div>
            <p className="text-[10px] text-zinc-500">{videoFile?.name} • {videoFile ? `${(videoFile.size / 1024 / 1024).toFixed(1)} MB` : ''}</p>
            <button type="button" onClick={removeVideo} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-400 tracking-wide transition-colors">
              <X className="h-3 w-3" /> Hapus Video
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center py-8 max-w-[320px] border border-dashed border-white/[0.06] rounded-sm cursor-pointer hover:border-white/[0.15] hover:bg-white/[0.02] transition-all group">
            <Film className="h-8 w-8 text-zinc-700 group-hover:text-zinc-500 transition-colors mb-2" />
            <span className="text-xs text-zinc-500 tracking-wide">Klik untuk upload video</span>
            <span className="text-[10px] text-zinc-700 mt-1">MP4, WebM, MOV, AVI, MKV</span>
            <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
          </label>
        )}
      </div>

      {/* Ukuran & Stok */}
      <div className="space-y-3">
        <Label className="text-zinc-300 text-xs tracking-widest uppercase font-medium">Ukuran & Stok</Label>
        <div className="space-y-2">
          {sizeStocks.map((ss, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                value={ss.size}
                onChange={(e) => updateSizeStock(idx, 'size', e.target.value.toUpperCase())}
                placeholder="S"
                className="w-20 bg-zinc-900 border-white/10 text-white placeholder:text-zinc-600 focus:border-white/30 rounded-sm text-xs font-bold tracking-widest text-center uppercase"
              />
              <Input
                type="number"
                value={ss.stock}
                onChange={(e) => updateSizeStock(idx, 'stock', Number(e.target.value))}
                placeholder="0"
                className="w-24 bg-zinc-900 border-white/10 text-white placeholder:text-zinc-600 focus:border-white/30 rounded-sm text-xs text-center"
              />
              <span className="text-[10px] text-zinc-600 tracking-wider w-8">pcs</span>
              {sizeStocks.length > 1 && (
                <button type="button" onClick={() => removeSizeRow(idx)} className="text-zinc-600 hover:text-red-400 transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={addSizeRow} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white tracking-wide transition-colors">
          <Plus className="h-3.5 w-3.5" /> Tambah Ukuran
        </button>
      </div>

      {/* Submit */}
      <div className="space-y-3">
        {uploadProgress && (
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {uploadProgress}
          </div>
        )}
        <Button type="submit" disabled={isSubmitting || !imageFile} className="w-full bg-white text-black hover:bg-zinc-200 font-semibold tracking-widest uppercase text-xs rounded-sm h-12 disabled:opacity-40 disabled:cursor-not-allowed">
          {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Menyimpan...</> : <><Plus className="h-4 w-4 mr-2" />Tambah Produk</>}
        </Button>
      </div>
    </form>
  );
}
