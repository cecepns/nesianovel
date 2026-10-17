import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, ChevronRight, ChevronLeft, Pin, Calendar, ArrowRight } from 'lucide-react';
import { apiClient } from '../utils/api';

const AnnouncementSection = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef(0);
  const touchEndXRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    apiClient.getAnnouncements(10)
      .then((res) => {
        if (!cancelled && res?.status && Array.isArray(res.data)) {
          setAnnouncements(res.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const total = announcements.length;

  const nextSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Auto-play timer
  useEffect(() => {
    if (total <= 1 || isPaused) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [total, isPaused, nextSlide]);

  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartXRef.current - touchEndXRef.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  if (loading || announcements.length === 0) return null;

  const currentAnn = announcements[currentIndex];

  return (
    <section className="my-3 sm:my-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="rounded-2xl border border-purple-800/40 bg-gradient-to-r from-[#170e33]/90 via-[#120a28]/95 to-[#170e33]/90 px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-lg relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 backdrop-blur-md"
      >
        {/* Left: Badge + Current Announcement */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Link
            to="/announcements"
            className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-200 hover:text-white font-extrabold text-[11px] uppercase tracking-wider shadow-sm transition-colors"
          >
            <Megaphone className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
            <span>Pengumuman</span>
          </Link>

          {currentAnn.is_pinned && (
            <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase bg-amber-500 text-gray-950 shadow-sm">
              <Pin className="h-2.5 w-2.5 rotate-45" />
              PINNED
            </span>
          )}

          <Link
            to={`/announcements/${currentAnn.slug}`}
            className="min-w-0 flex-1 flex items-center gap-2 group"
          >
            <span className="font-bold text-xs sm:text-sm text-gray-100 group-hover:text-amber-300 transition-colors truncate">
              {currentAnn.title}
            </span>
            {currentAnn.excerpt && (
              <span className="hidden md:inline text-xs text-purple-300/60 truncate max-w-xs">
                — {currentAnn.excerpt}
              </span>
            )}
            <span className="shrink-0 inline-flex items-center text-[11px] font-bold text-amber-400 group-hover:translate-x-0.5 transition-transform">
              <ArrowRight className="h-3 w-3" />
            </span>
          </Link>
        </div>

        {/* Right: Controls & All link */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-purple-900/30">
          {total > 1 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-purple-300/60 mr-1 tabular-nums">
                {currentIndex + 1}/{total}
              </span>
              <button
                type="button"
                onClick={prevSlide}
                className="p-1 rounded-lg bg-purple-950/60 border border-purple-800/40 text-purple-300 hover:text-white hover:bg-purple-800/50 active:scale-95 transition-all"
                aria-label="Sebelumnya"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="p-1 rounded-lg bg-purple-950/60 border border-purple-800/40 text-purple-300 hover:text-white hover:bg-purple-800/50 active:scale-95 transition-all"
                aria-label="Berikutnya"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <Link
            to="/announcements"
            className="flex items-center gap-1 text-[11px] font-semibold text-purple-300 hover:text-white px-2 py-0.5 rounded-lg bg-purple-950/40 hover:bg-purple-900/40 border border-purple-800/40 transition-colors"
          >
            <span>Semua</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AnnouncementSection;
