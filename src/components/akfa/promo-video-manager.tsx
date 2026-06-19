'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Film, Upload, Loader2, Trash2, Eye, EyeOff, Plus, X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { toast } from 'sonner';
import { useAdminStore } from '@/lib/admin-store';

interface PromoVideo {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  active: boolean;
  order: number;
}

interface PromoVideoManagerProps {
  videos: PromoVideo[];
  onUpdated: () => void;
}

export default function PromoVideoManager({ videos, onUpdated }: PromoVideoManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const adminToken = useAdminStore((s) => s.adminToken);

  const handleVideoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1 * 1024 * 1024 * 1024) { toast.error('Video maksimal 1GB'); return; }
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  }, []);

  const resetForm = useCallback(() => {
    setIsAdding(false);
    setTitle('');
    setVideoFile(null);
    setVideoPreview(null);
    if (videoInputRef.current) videoInputRef.current.value = '';
  }, []);

  const handleAdd = async () => {
    if (!title.trim()) { toast.error('Judul video harus diisi'); return; }
    if (!videoFile) { toast.error('Upload video dulu'); return; }

    setIsUploading(true);
    try {
      // Upload video
      const vidForm = new FormData();
      vidForm.append('video', videoFile);
      const vidRes = await fetch('/api/upload/video', {
        method: 'POST',
        headers: { 'X-Admin-Token': adminToken },
        body: vidForm,
      });
      const vidData = await vidRes.json();
      if (!vidRes.ok) throw new Error(vidData.error || 'Upload gagal');

      // Create promo video
      const promoRes = await fetch('/api/promo-videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': adminToken },
        body: JSON.stringify({
          title: title.trim(),
          videoUrl: vidData.videoUrl,
          order: videos.length,
        }),
      });
      if (!promoRes.ok) throw new Error('Gagal menyimpan video promosi');

      toast.success('Video promosi berhasil ditambahkan!');
      resetForm();
      onUpdated();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menambahkan video');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/promo-videos/${id}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Token': adminToken },
      });
      if (!res.ok) throw new Error('Gagal menghapus');
      toast.success('Video promosi dihapus');
      onUpdated();
    } catch {
      toast.error('Gagal menghapus video');
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const res = await fetch(`/api/promo-videos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': adminToken },
        body: JSON.stringify({ active }),
      });
      if (!res.ok) throw new Error('Gagal update');
      onUpdated();
    } catch {
      toast.error('Gagal mengubah status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Film className="h-4 w-4 text-zinc-400" />
          <h3 className="text-sm font-semibold tracking-widest uppercase text-white">Video Promosi</h3>
          <span className="text-[10px] text-zinc-600 bg-zinc-900 px-1.5 py-0.5 rounded-sm">{videos.length} video</span>
        </div>
        <Button
          onClick={() => setIsAdding(!isAdding)}
          size="sm"
          className="bg-white text-black hover:bg-zinc-200 text-xs font-semibold tracking-widest uppercase rounded-sm"
        >
          {isAdding ? <><X className="h-3 w-3 mr-1" /> Batal</> : <><Plus className="h-3 w-3 mr-1" /> Tambah</>}
        </Button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border border-white/[0.08] rounded-sm bg-zinc-950 p-4 space-y-4"
        >
          <div className="space-y-2">
            <Label className="text-zinc-300 text-xs tracking-widest uppercase font-medium">Judul Video</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Koleksi Terbaru Summer 2025"
              className="bg-zinc-900 border-white/10 text-white placeholder:text-zinc-600 focus:border-white/30 rounded-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-300 text-xs tracking-widest uppercase font-medium flex items-center gap-2">
              🎬 Video <span className="text-[10px] text-zinc-600 font-normal">MAKS. 1GB</span>
            </Label>

            {videoPreview ? (
              <div className="space-y-2">
                <div className="relative max-w-[400px] rounded-sm overflow-hidden border border-white/10 bg-black">
                  <video src={videoPreview} controls className="w-full max-h-[200px]" />
                </div>
                <p className="text-[10px] text-zinc-500">🎬 {videoFile?.name} • {videoFile ? `${(videoFile.size / 1024 / 1024).toFixed(1)} MB` : ''}</p>
                <button type="button" onClick={() => { setVideoFile(null); setVideoPreview(null); if (videoInputRef.current) videoInputRef.current.value = ''; }} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-400">
                  <X className="h-3 w-3" /> Hapus Video
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center py-8 max-w-[400px] border border-dashed border-white/[0.06] rounded-sm cursor-pointer hover:border-white/[0.15] hover:bg-white/[0.02] transition-all group">
                <Upload className="h-8 w-8 text-zinc-700 group-hover:text-zinc-500 mb-2" />
                <span className="text-xs text-zinc-500">Klik untuk upload video</span>
                <span className="text-[10px] text-zinc-700 mt-1">MP4, WebM, MOV, AVI</span>
                <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
              </label>
            )}
          </div>

          <Button
            onClick={handleAdd}
            disabled={isUploading || !title.trim() || !videoFile}
            className="w-full bg-white text-black hover:bg-zinc-200 font-semibold tracking-widest uppercase text-xs rounded-sm h-10 disabled:opacity-30"
          >
            {isUploading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Mengupload...</> : <><Plus className="h-4 w-4 mr-2" />Tambah Video Promosi</>}
          </Button>
        </motion.div>
      )}

      {/* Video List */}
      {videos.length === 0 ? (
        <div className="text-center py-10 border border-white/[0.04] rounded-sm">
          <Film className="h-8 w-8 text-zinc-800 mx-auto mb-3" />
          <p className="text-sm text-zinc-600 tracking-wide">Belum ada video promosi</p>
          <p className="text-xs text-zinc-700 mt-1">Tambahkan video untuk ditampilkan di atas katalog</p>
        </div>
      ) : (
        <div className="space-y-2">
          {videos
            .sort((a, b) => a.order - b.order)
            .map((video) => (
            <div key={video.id} className={`flex items-center gap-4 p-3 rounded-sm border transition-colors ${video.active ? 'bg-zinc-900/50 border-white/[0.06]' : 'bg-zinc-950 border-white/[0.03] opacity-50'}`}>
              <div className="w-10 h-10 flex items-center justify-center text-zinc-700">
                <GripVertical className="h-4 w-4" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{video.title}</p>
                <p className="text-[10px] text-zinc-600 truncate">{video.videoUrl}</p>
              </div>

              <span className={`text-[10px] tracking-wider uppercase px-1.5 py-0.5 rounded-sm ${video.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700/50 text-zinc-500'}`}>
                {video.active ? 'Aktif' : 'Nonaktif'}
              </span>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleActive(video.id, !video.active)}
                  className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-white/10"
                >
                  {video.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-500/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-zinc-900 border-white/10">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">Hapus Video Promosi</AlertDialogTitle>
                      <AlertDialogDescription className="text-zinc-400">
                        Hapus <strong className="text-white">{video.title}</strong> secara permanen?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-zinc-800 border-white/10 text-zinc-300">Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(video.id)} className="bg-red-600 hover:bg-red-700">Hapus</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
