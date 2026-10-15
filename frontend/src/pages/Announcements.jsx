import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Megaphone, Pin, Calendar, ChevronRight } from 'lucide-react';
import { apiClient } from '../utils/api';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.getAnnouncements(30)
      .then((res) => {
        if (res?.status && Array.isArray(res.data)) {
          setAnnouncements(res.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      <Helmet>
        <title>Pengumuman & Berita | NesiaNovel</title>
        <meta
          name="description"
          content="Pengumuman resmi, panduan, tutorial pembayaran, dan berita pembaruan platform NesiaNovel."
        />
      </Helmet>

      {/* Header */}
      <div className="p-8 rounded-3xl border border-purple-800/40 bg-gradient-to-b from-[#180d36] to-[#0c061a] shadow-2xl flex items-center gap-4">
        <div className="p-4 rounded-2xl bg-purple-600/20 border border-purple-500/40 text-purple-300">
          <Megaphone className="h-8 w-8 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Pengumuman & Berita
          </h1>
          <p className="text-xs sm:text-sm text-purple-300/70 mt-1">
            Informasi rilis, maintenance server, dan tutorial seputar NesiaNovel.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="h-10 w-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-purple-300/70">Memuat pengumuman...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="py-20 text-center text-purple-300/70 text-sm">
          Belum ada pengumuman yang dipublikasikan.
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((ann) => (
            <Link
              key={ann.id}
              to={`/announcements/${ann.slug}`}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-purple-900/30 bg-[#130b28] hover:border-purple-600/50 hover:bg-[#1a0f35] transition-all duration-200 shadow-lg"
            >
              <div className="flex items-start gap-4 min-w-0">
                <div className="p-3 rounded-2xl bg-purple-950/60 border border-purple-800/40 text-purple-400 group-hover:text-amber-300 shrink-0">
                  {ann.is_pinned ? (
                    <Pin className="h-5 w-5 text-amber-400 rotate-45" />
                  ) : (
                    <Calendar className="h-5 w-5 text-purple-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {ann.is_pinned && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500 text-gray-950">
                        PINNED
                      </span>
                    )}
                    <span className="text-xs text-purple-300/60 font-semibold">
                      {ann.created_at ? new Date(ann.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' }) : ''}
                    </span>
                  </div>
                  <h2 className="text-base font-extrabold text-white group-hover:text-purple-300 transition-colors">
                    {ann.title}
                  </h2>
                  {ann.excerpt && (
                    <p className="text-xs text-purple-200/70 line-clamp-2 mt-1">
                      {ann.excerpt}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-purple-400 group-hover:text-purple-300 shrink-0 self-end sm:self-center">
                <span>Baca Selengkapnya</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Announcements;
