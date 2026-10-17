import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, ChevronRight, Pin, Calendar } from 'lucide-react';
import { apiClient } from '../utils/api';

const AnnouncementSection = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // Limit to 2 announcements so height stays slim and compact on home
    apiClient.getAnnouncements(2)
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

  if (loading || announcements.length === 0) return null;

  return (
    <div className="rounded-2xl border border-purple-800/40 bg-gradient-to-r from-[#170e33]/90 via-[#120a28]/95 to-[#170e33]/90 p-3 sm:p-3.5 shadow-lg relative overflow-hidden backdrop-blur-md">
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
        <Link
          to="/announcements"
          className="flex items-center gap-1 text-[11px] font-bold text-purple-300 hover:text-white px-2.5 py-1 rounded-lg bg-purple-950/50 hover:bg-purple-900/50 border border-purple-800/40 transition-colors shrink-0"
        >
          <span>Semua</span>
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Announcements Cards Below Header */}
      <div className={`grid grid-cols-1 ${announcements.length > 1 ? 'md:grid-cols-2' : ''} gap-2 sm:gap-2.5`}>
        {announcements.map((ann) => (
          <Link
            key={ann.id}
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
        ))}
      </div>
    </div>
  );
};

export default AnnouncementSection;
