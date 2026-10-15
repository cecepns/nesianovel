import { useState, useEffect } from 'react';
import { 
  Coins, 
  Calendar, 
  Search, 
  RefreshCw, 
  BookOpen, 
  Users, 
  TrendingUp, 
  ChevronLeft, 
  ChevronRight,
  ExternalLink,
  Award
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { apiClient, getImageUrl, formatToLocaleString } from '../../utils/api';

export default function CoinRecapManager() {
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [availableMonths, setAvailableMonths] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [data, setData] = useState({
    stats: {
      total_transactions: 0,
      total_coins_spent: 0,
      unique_readers: 0,
      unique_chapters: 0,
    },
    top_novels: [],
    items: [],
    pagination: { page: 1, limit: 15, total: 0 },
  });

  const fetchRecap = async (targetMonth = selectedMonth, targetPage = page, keyword = search) => {
    try {
      setLoading(true);
      const params = {
        page: targetPage,
        limit,
      };
      if (targetMonth) params.month = targetMonth;
      if (keyword.trim()) params.search = keyword.trim();

      const res = await apiClient.getCoinRecap(params);
      if (res?.status && res.data) {
        setData(res.data);
        if (!selectedMonth && res.data.selected_month) {
          setSelectedMonth(res.data.selected_month);
        }
        if (Array.isArray(res.data.available_months)) {
          setAvailableMonths(res.data.available_months);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat rekap bulanan pembelian koin');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecap(selectedMonth, page, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRecap(selectedMonth, 1, search);
  };

  const handleMonthChange = (e) => {
    const val = e.target.value;
    setSelectedMonth(val);
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil((data.pagination?.total || 0) / limit));

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
            <Coins className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Rekap Bulanan Pembelian Chapter (Koin Mas)
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Laporan transaksi pembaca yang membuka chapter berbayar menggunakan saldo koin
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Month Selector */}
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700">
            <Calendar className="h-4 w-4 text-purple-400" />
            <select
              value={selectedMonth}
              onChange={handleMonthChange}
              className="bg-transparent text-sm font-semibold text-gray-900 dark:text-gray-100 focus:outline-none cursor-pointer"
            >
              {availableMonths.length > 0 ? (
                availableMonths.map((m) => (
                  <option key={m.ym} value={m.ym} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                    {m.label || m.ym}
                  </option>
                ))
              ) : (
                <option value={selectedMonth || new Date().toISOString().slice(0, 7)}>
                  {selectedMonth || 'Bulan Ini'}
                </option>
              )}
            </select>
          </div>

          <button
            onClick={() => fetchRecap(selectedMonth, page, search)}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Coins Spent */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-amber-500/20 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
              Total Koin Digunakan
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Coins className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-amber-500">
              {Number(data.stats?.total_coins_spent || 0).toLocaleString('id-ID')}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1.5 font-medium">Koin Mas</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Saldo koin terpotong bulan ini</p>
        </div>

        {/* Total Transactions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-purple-500/20 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
              Chapter Terbuka
            </span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-purple-400">
              {Number(data.stats?.total_transactions || 0).toLocaleString('id-ID')}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1.5 font-medium">Transaksi</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Total pembukaan chapter berbayar</p>
        </div>

        {/* Unique Readers */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-indigo-500/20 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Pembaca Aktif
            </span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-indigo-400">
              {Number(data.stats?.unique_readers || 0).toLocaleString('id-ID')}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1.5 font-medium">Pengguna</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">User berbeda yang membuka chapter</p>
        </div>

        {/* Unique Chapters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-emerald-500/20 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Judul Chapter
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <BookOpen className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-emerald-400">
              {Number(data.stats?.unique_chapters || 0).toLocaleString('id-ID')}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1.5 font-medium">Chapter Unik</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Variasi chapter yang dibeli pembaca</p>
        </div>
      </div>

      {/* Top 5 Novel Terlaris */}
      {data.top_novels && data.top_novels.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                Top Novel Terlaris Bulan Ini (Berdasarkan Pembelian Koin)
              </h3>
            </div>
            <span className="text-xs text-gray-400">5 Teratas</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {data.top_novels.map((novel, index) => (
              <div
                key={novel.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-900/30"
              >
                <div className="w-8 h-8 rounded-full bg-purple-600/20 text-purple-400 text-xs font-black flex items-center justify-center shrink-0">
                  #{index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/novel/${novel.slug}`}
                    target="_blank"
                    className="text-xs font-bold text-gray-900 dark:text-gray-100 hover:text-purple-400 line-clamp-1 flex items-center gap-1"
                  >
                    <span>{novel.title}</span>
                    <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-60" />
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-bold text-amber-500 flex items-center gap-0.5">
                      <Coins className="h-2.5 w-2.5" />
                      {Number(novel.coins_total || 0).toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      ({novel.unlock_count}x unlock)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table Section with Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Rincian Transaksi Pembelian Chapter
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Total {data.pagination?.total || 0} riwayat transaksi ditemukan
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari user / novel / chapter..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-purple-500 outline-none w-56"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors"
            >
              Cari
            </button>
          </form>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 uppercase font-bold text-[10px] border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="py-3 px-4">Waktu Transaksi</th>
                <th className="py-3 px-4">Pembaca</th>
                <th className="py-3 px-4">Novel</th>
                <th className="py-3 px-4">Chapter</th>
                <th className="py-3 px-4 text-right">Koin Terpotong</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-purple-500" />
                    <span>Memuat data transaksi...</span>
                  </td>
                </tr>
              ) : data.items.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-400">
                    Tidak ada transaksi pembelian chapter pada periode ini.
                  </td>
                </tr>
              ) : (
                data.items.map((item) => (
                  <tr key={item.id} className="hover:bg-purple-50/30 dark:hover:bg-purple-950/20 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap text-gray-400 font-mono text-[11px]">
                      {formatToLocaleString(item.created_at)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-bold text-gray-900 dark:text-gray-100">
                        @{item.username}
                      </span>
                      {item.user_name && (
                        <span className="block text-[10px] text-gray-400">
                          {item.user_name}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        to={`/novel/${item.novel_slug}`}
                        target="_blank"
                        className="font-semibold text-purple-400 hover:text-purple-300 hover:underline flex items-center gap-1"
                      >
                        <span>{item.novel_title}</span>
                        <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-60" />
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        to={`/novel/${item.novel_slug}/${item.chapter_slug}`}
                        target="_blank"
                        className="text-gray-900 dark:text-gray-100 hover:text-purple-400 font-medium flex items-center gap-1"
                      >
                        <span>Ch. {item.chapter_number} {item.chapter_title ? `- ${item.chapter_title}` : ''}</span>
                        <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-60" />
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Coins className="h-3 w-3" />
                        <span>{item.coins_spent} Koin</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">
              Halaman {page} dari {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
