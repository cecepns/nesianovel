import { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Pin, 
  Eye, 
  ExternalLink, 
  RefreshCw, 
  X, 
  Save, 
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { apiClient, getImageUrl, formatToLocaleString } from '../../utils/api';

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'image'],
    ['clean'],
  ],
};

const quillFormats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'list',
  'bullet',
  'link',
  'image',
];

export default function AnnouncementManager() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    bannerImage: null,
    bannerPreview: '',
    is_pinned: false,
    is_published: true,
  });

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getAdminAnnouncements();
      if (res?.status && Array.isArray(res.data)) {
        setAnnouncements(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat daftar pengumuman');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      bannerImage: null,
      bannerPreview: '',
      is_pinned: false,
      is_published: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      slug: item.slug || '',
      excerpt: item.excerpt || '',
      content: item.content || '',
      bannerImage: null,
      bannerPreview: item.banner_image ? getImageUrl(item.banner_image) : '',
      is_pinned: !!item.is_pinned,
      is_published: item.is_published !== 0,
    });
    setModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar (JPG, PNG, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran gambar maksimal 5MB');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      bannerImage: file,
      bannerPreview: URL.createObjectURL(file),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Judul pengumuman wajib diisi');
      return;
    }
    if (!formData.content.trim()) {
      toast.error('Isi konten pengumuman wajib diisi');
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('title', formData.title.trim());
      if (formData.slug.trim()) data.append('slug', formData.slug.trim());
      if (formData.excerpt.trim()) data.append('excerpt', formData.excerpt.trim());
      data.append('content', formData.content);
      data.append('is_pinned', formData.is_pinned ? '1' : '0');
      data.append('is_published', formData.is_published ? '1' : '0');

      if (formData.bannerImage) {
        data.append('banner_image', formData.bannerImage);
      }

      if (editingItem) {
        const res = await apiClient.updateAnnouncement(editingItem.id, data);
        if (res?.status) {
          toast.success('Pengumuman berhasil diperbarui');
          setModalOpen(false);
          fetchAnnouncements();
        } else {
          toast.error(res?.error || 'Gagal update pengumuman');
        }
      } else {
        const res = await apiClient.createAnnouncement(data);
        if (res?.status) {
          toast.success('Pengumuman baru berhasil dibuat');
          setModalOpen(false);
          fetchAnnouncements();
        } else {
          toast.error(res?.error || 'Gagal membuat pengumuman');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.message || 'Terjadi kesalahan sistem');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Hapus pengumuman "${item.title}"?`)) return;

    try {
      const res = await apiClient.deleteAnnouncement(item.id);
      if (res?.status) {
        toast.success('Pengumuman berhasil dihapus');
        fetchAnnouncements();
      } else {
        toast.error(res?.error || 'Gagal menghapus pengumuman');
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.message || 'Gagal menghapus');
    }
  };

  const filteredAnnouncements = announcements.filter((a) =>
    (a.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.slug || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
            <Megaphone className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Manajemen Pengumuman & Berita
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Kelola informasi rilis novel, tutorial saweria, dan pengumuman platform NesiaNovel
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAnnouncements}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Muat Ulang"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-900/30 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Buat Pengumuman Baru</span>
          </button>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari judul pengumuman..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-purple-500 outline-none"
          />
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400">
          Total: <strong className="text-purple-400">{filteredAnnouncements.length}</strong> pengumuman
        </div>
      </div>

      {/* Announcements Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 uppercase font-bold text-[10px] border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="py-3 px-4">Banner & Judul</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Disematkan</th>
                <th className="py-3 px-4">Tanggal Rilis</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-purple-500" />
                    <span>Memuat pengumuman...</span>
                  </td>
                </tr>
              ) : filteredAnnouncements.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-400">
                    Belum ada pengumuman yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredAnnouncements.map((item) => (
                  <tr key={item.id} className="hover:bg-purple-50/20 dark:hover:bg-purple-950/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {item.banner_image ? (
                          <img
                            src={getImageUrl(item.banner_image)}
                            alt={item.title}
                            className="w-16 h-10 object-cover rounded-lg border border-purple-500/20 shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-10 rounded-lg bg-purple-950/40 border border-purple-900/30 flex items-center justify-center shrink-0 text-purple-400">
                            <Megaphone className="h-4 w-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="font-bold text-gray-900 dark:text-gray-100 text-sm line-clamp-1">
                            {item.title}
                          </span>
                          <span className="text-[11px] text-gray-400 font-mono">
                            /announcements/{item.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {item.is_published !== 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Publik</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-500/10 text-gray-400 border border-gray-500/20">
                          <span>Draft</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {item.is_pinned ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Pin className="h-2.5 w-2.5" />
                          <span>Pinned</span>
                        </span>
                      ) : (
                        <span className="text-gray-400 text-[11px]">-</span>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-gray-400 text-[11px]">
                      {formatToLocaleString(item.created_at, true)}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/announcements/${item.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
                          title="Lihat Pratinjau"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                          title="Edit Pengumuman"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                          title="Hapus Pengumuman"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/20 shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-purple-400" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {editingItem ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Title & Slug */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Judul Pengumuman *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Contoh: Tutorial Pembelian Koin via Saweria"
                    className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm font-semibold focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    URL Slug (Opsional - otomatis dari judul jika kosong)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder="tutorial-pembelian-koin"
                    className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm font-mono focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              {/* Banner Image */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Gambar Banner Pengumuman (Opsional)
                </label>
                <div className="flex items-center gap-4">
                  {formData.bannerPreview ? (
                    <img
                      src={formData.bannerPreview}
                      alt="Banner Preview"
                      className="w-32 h-18 object-cover rounded-lg border border-purple-500/30 shrink-0"
                    />
                  ) : (
                    <div className="w-32 h-18 rounded-lg bg-gray-100 dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-400 shrink-0">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      Format JPG, PNG, WEBP. Maks 5MB. Rasio 16:9 disarankan.
                    </p>
                  </div>
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Ringkasan Singkat (Excerpt)
                </label>
                <textarea
                  rows="2"
                  value={formData.excerpt}
                  onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Ringkasan 1-2 kalimat untuk kartu beranda..."
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              {/* Content with React Quill */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Isi Konten Pengumuman *
                </label>
                <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-300 dark:border-gray-600">
                  <ReactQuill
                    theme="snow"
                    value={formData.content}
                    onChange={(val) => setFormData((prev) => ({ ...prev, content: val }))}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Tulis pengumuman di sini (dukungan format teks, heading, gambar, dan URL)..."
                    className="novel-admin-quill"
                  />
                </div>
              </div>

              {/* Switches: Pinned & Published */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={formData.is_pinned}
                    onChange={(e) => setFormData((prev) => ({ ...prev, is_pinned: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400 cursor-pointer"
                  />
                  <span className="flex items-center gap-1">
                    <Pin className="h-3.5 w-3.5 text-amber-500" />
                    <span>Sematkan di Atas (Pinned)</span>
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData((prev) => ({ ...prev, is_published: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Publikasikan Langsung</span>
                  </span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-900/30 transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      <span>{editingItem ? 'Simpan Perubahan' : 'Buat Pengumuman'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
