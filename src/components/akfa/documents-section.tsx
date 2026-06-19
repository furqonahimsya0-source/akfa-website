'use client';

import { motion } from 'framer-motion';
import { FileText, Download, ExternalLink, File, Image, Film } from 'lucide-react';

interface Document {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

interface DocumentsSectionProps {
  documents: Document[];
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mimeType: string) {
  const t = mimeType.toLowerCase();
  if (t.includes('pdf')) return { icon: FileText, label: 'PDF', color: 'text-red-400' };
  if (t.includes('word') || t.includes('document')) return { icon: FileText, label: 'DOC', color: 'text-blue-400' };
  if (t.includes('sheet') || t.includes('excel')) return { icon: FileText, label: 'XLS', color: 'text-emerald-400' };
  if (t.includes('image')) return { icon: Image, label: 'IMG', color: 'text-purple-400' };
  if (t.includes('video')) return { icon: Film, label: 'VID', color: 'text-amber-400' };
  return { icon: File, label: 'FILE', color: 'text-zinc-400' };
}

function getFileAction(fileType: string, fileUrl: string) {
  const t = fileType.toLowerCase();
  if (t.startsWith('image/') || t.startsWith('video/')) {
    return { label: 'Lihat', icon: ExternalLink, action: 'view' as const };
  }
  return { label: 'Unduh', icon: Download, action: 'download' as const };
}

export default function DocumentsSection({ documents }: DocumentsSectionProps) {
  if (documents.length === 0) return null;

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <p className="text-xs font-medium tracking-[0.5em] uppercase text-zinc-500 mb-3">Resources</p>
        <h2 className="text-3xl sm:text-4xl font-black tracking-[0.15em] text-white uppercase">Dokumen & Katalog</h2>
        <div className="w-12 h-px bg-zinc-600 mx-auto mt-4" />
        <p className="text-sm text-zinc-400 mt-4 max-w-lg mx-auto font-light">
          Unduh katalog produk, size chart, dan dokumen lainnya untuk memudahkan pilihan Anda.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
        {documents.map((doc, index) => {
          const { icon: FileIcon, label, color } = getFileIcon(doc.fileType);
          const { label: actionLabel, icon: ActionIcon, action } = getFileAction(doc.fileType, doc.fileUrl);

          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-white/[0.02] border border-white/[0.06] rounded-sm p-5 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300"
            >
              {/* File type badge */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-sm bg-zinc-900 border border-white/[0.06] flex items-center justify-center">
                  <FileIcon className={`h-5 w-5 ${color}`} />
                </div>
                <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-sm bg-zinc-900 border border-white/[0.06] ${color}`}>
                  {label}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-sm font-semibold tracking-wide text-white mb-1.5 group-hover:text-white transition-colors">
                {doc.title}
              </h3>

              {/* Description */}
              {doc.description && (
                <p className="text-[11px] text-zinc-500 leading-relaxed mb-3 line-clamp-2">
                  {doc.description}
                </p>
              )}

              {/* File info */}
              <div className="flex items-center gap-2 text-[10px] text-zinc-600 mb-4">
                <span className="truncate">{doc.fileName}</span>
                <span>•</span>
                <span>{formatSize(doc.fileSize)}</span>
              </div>

              {/* Action button */}
              {action === 'download' ? (
                <a
                  href={doc.fileUrl}
                  download
                  className="flex items-center justify-center gap-2 w-full py-2.5 border border-white/[0.08] rounded-sm text-xs font-semibold tracking-widest uppercase text-zinc-300 hover:bg-white hover:text-black hover:border-white transition-all duration-300"
                >
                  <ActionIcon className="h-3.5 w-3.5" />
                  {actionLabel}
                </a>
              ) : (
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 border border-white/[0.08] rounded-sm text-xs font-semibold tracking-widest uppercase text-zinc-300 hover:bg-white hover:text-black hover:border-white transition-all duration-300"
                >
                  <ActionIcon className="h-3.5 w-3.5" />
                  {actionLabel}
                </a>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
