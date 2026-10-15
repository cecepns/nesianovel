import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, ChevronRight, Pin, Calendar } from 'lucide-react';
import { apiClient } from '../utils/api';

const AnnouncementSection = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiClient.getAnnouncements(4)
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
    <section className="my-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="rounded-3xl border border-purple-800/40 bg-gradient-to-r from-[#170e33] via-[#120a28] to-[#150d30] p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between gap-3 mb-4 border-b border-purple-900/30 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300">
              <Megaphone className="h-5 w-5 text-purple-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                Pengumuman Resmi
              </h2>
              <p className="text-[11px] text-purple-300/70">
                Informasi penting, tutorial pembayaran, dan pembaruan NesiaNovel
              </p>
            </div>
          </div>
          <Link
            to="/announcements"
            className="flex items-center gap-1 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors"
          >
            <span>Semua</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {announcements.map((ann) => (
            <Link
              key={ann.id}
              to={`/announcements/${ann.slug}`}
              className="group flex items-start gap-3 p-3 rounded-2xl bg-purple-950/30 border border-purple-900/30 hover:border-purple-600/50 hover:bg-purple-900/20 transition-all duration-200"
            >
              <div className="p-2 rounded-xl bg-[#1b103c] border border-purple-800/40 text-purple-400 group-hover:text-amber-300 group-hover:scale-105 transition-all shrink-0">
                {ann.is_pinned ? (
                  <Pin className="h-4 w-4 text-amber-400 rotate-45" />
                ) : (
                  <Calendar className="h-4 w-4 text-purple-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {ann.is_pinned && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-amber-500 text-gray-950">
                      PINNED
                    </span>
                  )}
                  <span className="text-[10px] text-purple-300/60">
                    {ann.created_at ? new Date(ann.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : ''}
                  </span>
                </div>
                <h3 className="font-bold text-white text-xs sm:text-sm line-clamp-1 group-hover:text-purple-300 transition-colors">
                  {ann.title}
                </h3>
                {ann.excerpt && (
                  <p className="text-[11px] text-purple-200/60 line-clamp-1 mt-0.5">
                    {ann.excerpt}
                  </p>
                )}
              </div>
              <ChevronRight className="h-4 w-4 text-purple-500/40 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all self-center" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AnnouncementSection;
