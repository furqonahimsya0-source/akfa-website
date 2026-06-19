'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileText, Image, Film, File, Loader2 } from 'lucide-react';
import { useAdminStore } from '@/lib/admin-store';

interface FilePreview {
  file: File;
  preview: string;
  type: 'image' | 'video' | 'document' | 'unknown';
}

interface UniversalUploaderProps {
  label: string;
  description?: string;
  accept?: string; // e.g. "image/*", "video/*", ".pdf" — empty = all files
  maxSizeMB?: number;
  onUpload: (result: { url: string; filename: string; fileSize: number; mimeType: string }) => void;
  onError?: (msg: string) => void;
}

function getFileCategory(file: File): FilePreview['type'] {
  const t = file.type.toLowerCase();
  if (t.startsWith('image/')) return 'image';
  if (t.startsWith('video/')) return 'video';
  if (t.startsWith('audio/')) return 'document';
  if (t.includes('pdf') || t.includes('document') || t.includes('sheet') || t.includes('text') || t.includes('zip') || t.includes('rar')) return 'document';
  return 'unknown';
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UniversalUploader({
  label,
  description,
  accept,
  maxSizeMB = 2048,
  onUpload,
  onError,
}: UniversalUploaderProps) {
  const [preview, setPreview] = useState<FilePreview | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const adminToken = useAdminStore((s) => s.adminToken);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      onError?.(`File maksimal ${maxSizeMB >= 1024 ? `${maxSizeMB / 1024}GB` : `${maxSizeMB}MB`}`);
      return;
    }
    if (file.size === 0) {
      onError?.('File kosong');
      return;
    }

    const category = getFileCategory(file);
    let previewUrl = '';

    if (category === 'image') {
      previewUrl = URL.createObjectURL(file);
    } else if (category === 'video') {
      previewUrl = URL.createObjectURL(file);
    }

    setPreview({ file, preview: previewUrl, type: category });
  }, [maxSizeMB, onError]);

  const removeFile = useCallback(() => {
    if (preview?.preview) URL.revokeObjectURL(preview.preview);
    setPreview(null);
    setProgress('');
    if (inputRef.current) inputRef.current.value = '';
  }, [preview]);

  const uploadFile = useCallback(async () => {
    if (!preview) return;

    setIsUploading(true);
    setProgress('Mengupload file...');

    try {
      const form = new FormData();
      form.append('file', preview.file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'X-Admin-Token': adminToken },
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload gagal');
      }

      const url = data.imageUrl || data.videoUrl || data.url;
      if (!url) throw new Error('URL tidak ditemukan dalam response');

      onUpload({
        url,
        filename: data.filename || preview.file.name,
        fileSize: data.fileSize || preview.file.size,
        mimeType: data.mimeType || preview.file.type,
      });

      removeFile();
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Upload gagal');
    } finally {
      setIsUploading(false);
      setProgress('');
    }
  }, [preview, onUpload, onError, removeFile]);

  const IconComponent = preview
    ? preview.type === 'image'
      ? Image
      : preview.type === 'video'
        ? Film
        : FileText
    : Upload;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium tracking-widest uppercase text-zinc-300">{label}</p>
        {accept && (
          <span className="text-[10px] text-zinc-600 tracking-wider">{accept}</span>
        )}
      </div>

      {description && (
        <p className="text-[11px] text-zinc-500">{description}</p>
      )}

      {preview ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-white/[0.08] rounded-sm overflow-hidden"
        >
          {/* Preview area */}
          {preview.type === 'image' && (
            <div className="relative max-w-[400px] aspect-video bg-zinc-950">
              <img src={preview.preview} alt="Preview" className="w-full h-full object-contain" />
            </div>
          )}
          {preview.type === 'video' && (
            <div className="relative max-w-[400px] bg-zinc-950">
              <video src={preview.preview} controls className="w-full max-h-[240px]" />
            </div>
          )}
          {(preview.type === 'document' || preview.type === 'unknown') && (
            <div className="flex items-center gap-4 p-4 bg-zinc-900/50">
              <div className="w-12 h-12 rounded-sm bg-zinc-800 flex items-center justify-center">
                <FileText className="h-6 w-6 text-zinc-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{preview.file.name}</p>
                <p className="text-[10px] text-zinc-500">
                  {formatSize(preview.file.size)} • {preview.file.type || 'Unknown type'}
                </p>
              </div>
            </div>
          )}

          {/* File info + actions */}
          <div className="flex items-center justify-between p-3 border-t border-white/[0.06]">
            <div className="flex items-center gap-2 min-w-0">
              <IconComponent className="h-3.5 w-3.5 text-zinc-500 flex-shrink-0" />
              <span className="text-[11px] text-zinc-400 truncate">{preview.file.name}</span>
              <span className="text-[10px] text-zinc-600 flex-shrink-0">{formatSize(preview.file.size)}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={removeFile}
                className="text-[11px] text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-1"
              >
                <X className="h-3 w-3" /> Hapus
              </button>
            </div>
          </div>

          {/* Upload button */}
          <div className="p-3 border-t border-white/[0.06]">
            {progress && (
              <div className="flex items-center gap-2 text-[11px] text-zinc-400 mb-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                {progress}
              </div>
            )}
            <button
              type="button"
              onClick={uploadFile}
              disabled={isUploading}
              className="w-full py-2.5 bg-white text-black hover:bg-zinc-200 font-semibold tracking-widest uppercase text-xs rounded-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <><Loader2 className="h-4 w-4 mr-2 inline animate-spin" />Mengupload...</>
              ) : (
                <><Upload className="h-4 w-4 mr-2 inline" />Upload File</>
              )}
            </button>
          </div>
        </motion.div>
      ) : (
        /* Drop zone */
        <label className="flex flex-col items-center justify-center py-10 max-w-[400px] border-2 border-dashed border-white/[0.08] rounded-sm cursor-pointer hover:border-white/[0.15] hover:bg-white/[0.02] transition-all group">
          <IconComponent className="h-8 w-8 text-zinc-600 group-hover:text-zinc-400 transition-colors mb-3" />
          <span className="text-xs text-zinc-400 tracking-wide font-medium">
            Klik untuk pilih file
          </span>
          <span className="text-[10px] text-zinc-600 mt-1">
            {accept ? `${accept} • Maks ${maxSizeMB >= 1024 ? `${maxSizeMB / 1024}GB` : `${maxSizeMB}MB`}` : 'Semua format diterima'}
          </span>
          <input
            ref={inputRef}
            type="file"
            accept={accept || undefined}
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}
