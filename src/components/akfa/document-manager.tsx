'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Trash2, Eye, EyeOff, Download, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import UniversalUploader from './universal-uploader';
import { useAdminStore } from '@/lib/admin-store';

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

interface DocumentManagerProps {
  documents: Document[];
  onUpdated: () => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mimeType: string) {
  const t = mimeType.toLowerCase();
  if (t.includes('pdf')) return 'PDF';
  if (t.includes('word') || t.includes('document')) return 'DOC';
  if (t.includes('sheet') || t.includes('excel')) return 'XLS';
  if (t.includes('presentation') || t.includes('powerpoint')) return 'PPT';
  if (t.includes('image')) return 'IMG';
  if (t.includes('video')) return 'VID';
  if (t.includes('zip') || t.includes('rar')) return 'ZIP';
  return 'FILE';
}

export default function DocumentManager({ documents, onUpdated }: DocumentManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{
    url: string; filename: string; fileSize: number; mimeType: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const adminToken = useAdminStore((s) => s.adminToken);

  const handleUploadComplete = useCallback((result: {
    url: string; filename: string; fileSize: number; mimeType: string;
  }) => {
    setUploadedFile(result);
    toast.success('File berhasil diupload!');
  }, []);

  const resetForm = useCallback(() => {
    setIsAdding(false);
    setTitle('');
    setDescription('');
    setUploadedFile(null);
  }, []);

  const handleSave = async () => {
    if (!title.trim()) { toast.error('Judul dokumen harus diisi'); return; }
    if (!uploadedFile) { toast.error('Upload file dulu'); return; }

    setIsSaving(true);
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': adminToken },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          fileUrl: uploadedFile.url,
          fileName: uploadedFile.filename,
          fileType: uploadedFile.mimeType,
          fileSize: uploadedFile.fileSize,
          order: documents.length,
        }),
      });
      if (!res.ok) throw new Error('Gagal menyimpan dokumen');
      toast.success('Dokumen berhasil ditambahkan!');
      resetForm();
      onUpdated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Token': adminToken },
      });
      if (!res.ok) throw new Error('Gagal menghapus');
      toast.success('Dokumen dihapus');
      onUpdated();
    } catch {
      toast.error('Gagal menghapus dokumen');
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const res = await fetch(`/api/documents/${id}`, {
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
          <FileText className="h-4 w-4 text-zinc-400" />
          <h3 className="text-sm font-semibold tracking-widest uppercase text-white">Dokumen & Katalog</h3>
          <span className="text-[10px] text-zinc-600 bg-zinc-900 px-1.5 py-0.5 rounded-sm">{documents.length} file</span>
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
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border border-white/[0.08] rounded-sm bg-zinc-950 p-4 space-y-4 overflow-hidden"
          >
            <div className="space-y-2">
              <Label className="text-zinc-300 text-xs tracking-widest uppercase font-medium">Judul Dokumen</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Size Chart AKFA 2025"
                className="bg-zinc-900 border-white/10 text-white placeholder:text-zinc-600 focus:border-white/30 rounded-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300 text-xs tracking-widest uppercase font-medium">Deskripsi <span className="text-zinc-600 font-normal">(opsional)</span></Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Katalog ukuran lengkap semua produk..."
                rows={2}
                className="bg-zinc-900 border-white/10 text-white placeholder:text-zinc-600 focus:border-white/30 rounded-sm resize-none"
              />
            </div>

            <UniversalUploader
              label="Upload File"
              description="Foto, Video, PDF, DOC, XLS, ZIP — semua format diterima"
              maxSizeMB={2048}
              onUpload={handleUploadComplete}
              onError={(msg) => toast.error(msg)}
            />

            {/* Uploaded file status */}
            {uploadedFile && (
              <div className="flex items-center gap-2 p-2 bg-emerald-500/5 border border-emerald-500/20 rounded-sm">
                <FileText className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-[11px] text-emerald-400 truncate flex-1">{uploadedFile.filename}</span>
                <span className="text-[10px] text-emerald-500/60">{formatSize(uploadedFile.fileSize)}</span>
              </div>
            )}

            <Button
              onClick={handleSave}
              disabled={isSaving || !title.trim() || !uploadedFile}
              className="w-full bg-white text-black hover:bg-zinc-200 font-semibold tracking-widest uppercase text-xs rounded-sm h-10 disabled:opacity-30"
            >
              {isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Menyimpan...</> : <><Plus className="h-4 w-4 mr-2" />Simpan Dokumen</>}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Document List */}
      {documents.length === 0 ? (
        <div className="text-center py-10 border border-white/[0.04] rounded-sm">
          <FileText className="h-8 w-8 text-zinc-800 mx-auto mb-3" />
          <p className="text-sm text-zinc-600 tracking-wide">Belum ada dokumen</p>
          <p className="text-xs text-zinc-700 mt-1">Tambahkan katalog, size chart, atau dokumen lainnya</p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents
            .sort((a, b) => a.order - b.order)
            .map((doc) => (
              <div key={doc.id} className={`flex items-center gap-4 p-3 rounded-sm border transition-colors ${doc.active ? 'bg-zinc-900/50 border-white/[0.06]' : 'bg-zinc-950 border-white/[0.03] opacity-50'}`}>
                {/* File type badge */}
                <div className="w-10 h-10 flex items-center justify-center rounded-sm bg-zinc-800 text-[9px] font-bold tracking-wider text-zinc-400">
                  {getFileIcon(doc.fileType)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{doc.title}</p>
                  <p className="text-[10px] text-zinc-600 truncate">{doc.fileName} • {formatSize(doc.fileSize)}</p>
                </div>

                {/* Status badge */}
                <span className={`text-[10px] tracking-wider uppercase px-1.5 py-0.5 rounded-sm ${doc.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700/50 text-zinc-500'}`}>
                  {doc.active ? 'Aktif' : 'Nonaktif'}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8 w-8 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 rounded-sm transition-colors"
                    title="Lihat file"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleActive(doc.id, !doc.active)}
                    className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-white/10"
                  >
                    {doc.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-500/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-zinc-900 border-white/10">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Hapus Dokumen</AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400">
                          Hapus <strong className="text-white">{doc.title}</strong> secara permanen?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-zinc-800 border-white/10 text-zinc-300">Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(doc.id)} className="bg-red-600 hover:bg-red-700">Hapus</AlertDialogAction>
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
