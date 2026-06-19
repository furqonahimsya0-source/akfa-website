'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface PromoVideo {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  active: boolean;
}

interface PromoVideoBannerProps {
  videos: PromoVideo[];
}

function isVideoUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov') || lower.endsWith('.avi') || lower.endsWith('.mkv');
}

export default function PromoVideoBanner({ videos }: PromoVideoBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeVideos = videos.filter((v) => v.active);

  useEffect(() => {
    if (activeVideos.length <= 1) return;

    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % activeVideos.length);
      }, 8000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, activeVideos.length]);

  // Auto-play current video, pause others
  useEffect(() => {
    activeVideos.forEach((v, i) => {
      const el = videoRefs.current.get(v.id);
      if (el) {
        if (i === currentIndex) {
          el.currentTime = 0;
          el.play().catch(() => {});
        } else {
          el.pause();
          el.currentTime = 0;
        }
      }
    });
  }, [currentIndex, activeVideos]);

  const goTo = (dir: 'prev' | 'next') => {
    setCurrentIndex((prev) => {
      if (dir === 'prev') return (prev - 1 + activeVideos.length) % activeVideos.length;
      return (prev + 1) % activeVideos.length;
    });
  };

  if (activeVideos.length === 0) return null;

  const current = activeVideos[currentIndex];
  const isVideo = isVideoUrl(current.videoUrl);

  return (
    <section className="relative w-full bg-black overflow-hidden">
      <div className="relative w-full" style={{ aspectRatio: isVideo ? '16/9' : '16/9' }}>
        {/* ── MEDIA RENDERING: Dynamic based on file type ── */}
        {activeVideos.map((v, i) => {
          const vIsVideo = isVideoUrl(v.videoUrl);

          if (vIsVideo) {
            return (
              <video
                key={v.id}
                ref={(el) => { if (el) videoRefs.current.set(v.id, el); }}
                src={v.videoUrl}
                muted={isMuted}
                playsInline
                loop
                preload="metadata"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                  i === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              />
            );
          } else {
            // IMAGE — render as <img>
            return (
              <div
                key={v.id}
                className={`absolute inset-0 z-0 transition-opacity duration-700 ${
                  i === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                <img
                  src={v.videoUrl}
                  alt={v.title}
                  className="w-full h-full object-cover"
                />
              </div>
            );
          }
        })}

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/40 z-20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40 z-20 pointer-events-none" />

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-30 p-4 sm:p-8 lg:p-12">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <p className="text-[10px] sm:text-xs font-medium tracking-[0.4em] uppercase text-zinc-400 mb-2">
              {isVideo ? 'Video Promosi' : 'Banner'}
            </p>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-[0.1em] text-white uppercase leading-tight">
              {current.title}
            </h3>
          </motion.div>
        </div>

        {/* Controls — only for video */}
        {isVideo && (
          <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 lg:bottom-12 lg:right-12 z-30 flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              {isMuted ? <VolumeX className="h-4 w-4 text-white" /> : <Volume2 className="h-4 w-4 text-white" />}
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              {isPlaying ? <Pause className="h-4 w-4 text-white" /> : <Play className="h-4 w-4 text-white ml-0.5" />}
            </button>
          </div>
        )}

        {/* Nav arrows */}
        {activeVideos.length > 1 && (
          <>
            <button
              onClick={() => goTo('prev')}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-center hover:bg-white/15 transition-colors opacity-0 hover:opacity-100 focus:opacity-100"
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>
            <button
              onClick={() => goTo('next')}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-center hover:bg-white/15 transition-colors opacity-0 hover:opacity-100 focus:opacity-100"
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>
          </>
        )}

        {/* Dots */}
        {activeVideos.length > 1 && (
          <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
            {activeVideos.map((v, i) => (
              <button
                key={v.id}
                onClick={() => setCurrentIndex(i)}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
