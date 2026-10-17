import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, ChevronRight, ChevronLeft, Pin, Calendar } from 'lucide-react';
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
    apiClient.getAnnouncements(6)
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

  // Auto-play timer: slide every 5 seconds if more than 1 announcement
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

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="rounded-2xl border border-purple-800/40 bg-gradient-to-r from-[#170e33]/90 via-[#120a28]/95 to-[#170e33]/90 p-3 sm:p-3.5 shadow-lg relative overflow-hidden backdrop-blur-md"
    >
      {/* Header on top */}
      <div className="flex items-center justify-between gap-3 mb-2.5 pb-2 border-b border-purple-900/30">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-300 shrink-0">
            <Megaphone className="h-4 w-4 text-purple-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 leading-tight">
              Pengumuman Resmi
            </h2>
            <p className="hidden sm:block text-[10px] text-purple-300/60 leading-tight">
              Informasi penting, tutorial pembayaran, dan pembaruan NesiaNovel
            </p>
          </div>
        </div>

        {/* Right: Slider Controls (if total > 1) & All link */}
        <div className="flex items-center gap-2 shrink-0">
          {total > 1 && (
            <div className="flex items-center gap-1 bg-purple-950/60 border border-purple-800/40 px-1.5 py-0.5 rounded-lg">
              <span className="text-[10px] font-bold text-purple-300/60 mr-1 tabular-nums">
                {currentIndex + 1}/{total}
              </span>
              <button
                type="button"
                onClick={prevSlide}
                className="p-1 rounded-md text-purple-300 hover:text-white hover:bg-purple-800/50 active:scale-95 transition-all"
                aria-label="Sebelumnya"
              >
                <ChevronLeft className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="p-1 rounded-md text-purple-300 hover:text-white hover:bg-purple-800/50 active:scale-95 transition-all"
                aria-label="Berikutnya"
              >
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          )}

          <Link
            to="/announcements"
            className="flex items-center gap-1 text-[11px] font-bold text-purple-300 hover:text-white px-2.5 py-1 rounded-lg bg-purple-950/50 hover:bg-purple-900/50 border border-purple-800/40 transition-colors"
          >
            <span>Semua</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Slider Track: Shows 1 compact announcement card at a time */}
      <div className="overflow-hidden relative rounded-xl">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {announcements.map((ann) => (
            <div key={ann.id} className="w-full shrink-0">
              <Link
                to={`/announcements/${ann.slug}`}
                className="group flex items-start gap-2.5 p-2.5 rounded-xl bg-purple-950/30 hover:bg-purple-900/30 border border-purple-900/30 hover:border-purple-600/40 transition-all duration-200"
              >
                <div className="p-1.5 rounded-lg bg-[#1b103c] border border-purple-800/40 text-purple-400 group-hover:text-amber-300 group-hover:scale-105 transition-all shrink-0 mt-0.5">
                  {ann.is_pinned ? (
                    <Pin className="h-3.5 w-3.5 text-amber-400 rotate-45" />
                  ) : (
                    <Calendar className="h-3.5 w-3.5 text-purple-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    {ann.is_pinned && (
                      <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-amber-500 text-gray-950 leading-none">
                        PINNED
                      </span>
                    )}
                    <span className="text-[10px] text-purple-300/60 leading-none">
                      {ann.created_at ? new Date(ann.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : ''}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-xs sm:text-sm line-clamp-1 group-hover:text-amber-300 transition-colors">
                    {ann.title}
                  </h3>
                  {ann.excerpt && (
                    <p className="text-[10px] sm:text-[11px] text-purple-200/60 line-clamp-1 mt-0.5">
                      {ann.excerpt}
                    </p>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-purple-500/40 group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all self-center shrink-0" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementSection;
