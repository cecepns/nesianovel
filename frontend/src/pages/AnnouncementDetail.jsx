import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Megaphone, Calendar, ArrowLeft, Pin, Share2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { apiClient, getImageUrl } from '../utils/api';
import { resolveHtmlImages } from '../utils/quillImageHelper';

const AnnouncementDetail = () => {
  const { slug } = useParams();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    apiClient.getAnnouncementBySlug(slug)
      .then((res) => {
        if (res?.status && res.data) {
          setAnnouncement(res.data);
        } else {
          setError('Pengumuman tidak ditemukan');
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Gagal memuat pengumuman');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Tautan pengumuman disalin');
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
      <Helmet>
        <title>{`${announcement?.title || 'Pengumuman'} | NesiaNovel`}</title>
      </Helmet>

      {/* Back button */}
      <div>
        <Link
          to="/announcements"
          className="inline-flex items-center gap-2 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors py-2 px-3 rounded-xl bg-purple-950/40 border border-purple-900/30"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Semua Pengumuman</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-32 text-center">
          <div className="h-10 w-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-purple-300/70">Memuat pengumuman...</p>
        </div>
      ) : error || !announcement ? (
        <div className="py-24 text-center">
          <h2 className="text-xl font-bold text-white mb-2">{error || 'Pengumuman Tidak Ditemukan'}</h2>
          <Link to="/announcements" className="text-xs text-purple-400 underline">
            Kembali ke daftar
          </Link>
        </div>
      ) : (
        <article className="p-6 sm:p-10 rounded-3xl border border-purple-800/40 bg-[#130b28] shadow-2xl space-y-6">
          <div className="border-b border-purple-900/40 pb-6 space-y-3">
            <div className="flex items-center gap-3">
              {announcement.is_pinned && (
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500 text-gray-950 flex items-center gap-1">
                  <Pin className="h-3 w-3 rotate-45" /> PINNED
                </span>
              )}
              <span className="text-xs text-purple-300/70 flex items-center gap-1 font-semibold">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(announcement.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              {announcement.title}
            </h1>
          </div>

          {announcement.banner_image && (
            <div className="rounded-2xl overflow-hidden max-h-96 border border-purple-800/30">
              <img
                src={getImageUrl(announcement.banner_image)}
                alt={announcement.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* HTML Announcement Content */}
          <div
            className="novel-content text-purple-100 text-sm sm:text-base leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{ __html: resolveHtmlImages(announcement.content) }}
          />

          <div className="border-t border-purple-900/40 pt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-950/60 border border-purple-800/40 text-purple-300 hover:text-white text-xs font-bold transition-colors"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Bagikan Pengumuman</span>
            </button>
          </div>
        </article>
      )}
    </div>
  );
};

export default AnnouncementDetail;
