import { useState, useEffect } from 'react';
import { 
  Coins, 
  Crown, 
  Save, 
  ExternalLink, 
  RefreshCw, 
  Sparkles, 
  AlertCircle, 
  Check, 
  Link as LinkIcon,
  HelpCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { apiClient } from '../../utils/api';

const DEFAULT_COIN_PACKAGES = [
  { id: 'coin-50', coins: 50, price: 'Rp10.000', priceNum: 10000, popular: false, bonus: '' },
  { id: 'coin-150', coins: 150, price: 'Rp25.000', priceNum: 25000, popular: true, bonus: '+15 Koin Bonus' },
  { id: 'coin-350', coins: 350, price: 'Rp50.000', priceNum: 50000, popular: false, bonus: '+50 Koin Bonus' },
  { id: 'coin-750', coins: 750, price: 'Rp100.000', priceNum: 100000, popular: false, bonus: '+150 Koin Bonus' }
];

const DEFAULT_VIP_PACKAGES = [
  { id: 'prem-1m', durationMonths: 1, name: 'Paket 1 Bulan', duration: '30 Hari', price: 'Rp15.000', priceNum: 15000, highlight: false },
  { id: 'prem-3m', durationMonths: 3, name: 'Paket 3 Bulan', duration: '90 Hari', price: 'Rp40.000', priceNum: 40000, highlight: true },
  { id: 'prem-6m', durationMonths: 6, name: 'Paket 6 Bulan', duration: '180 Hari', price: 'Rp75.000', priceNum: 75000, highlight: false },
  { id: 'prem-12m', durationMonths: 12, name: 'Paket 12 Bulan (1 Tahun)', duration: '365 Hari', price: 'Rp140.000', priceNum: 140000, highlight: false }
];

export default function StoreManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('coins'); // 'coins' | 'vip' | 'general'
  
  const [saweriaUrl, setSaweriaUrl] = useState('https://saweria.co/nesianovel');
  const [coinUnlockPrice, setCoinUnlockPrice] = useState(25);
  const [coinPackages, setCoinPackages] = useState(DEFAULT_COIN_PACKAGES);
  const [vipPackages, setVipPackages] = useState(DEFAULT_VIP_PACKAGES);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getStorePackages();
      if (res?.status && res.data) {
        if (Array.isArray(res.data.coin_packages) && res.data.coin_packages.length > 0) {
          setCoinPackages(res.data.coin_packages);
        }
        if (Array.isArray(res.data.premium_packages) && res.data.premium_packages.length > 0) {
          setVipPackages(res.data.premium_packages);
        }
        if (res.data.saweria_url) {
          setSaweriaUrl(res.data.saweria_url);
        }
        if (res.data.coin_unlock_price !== undefined) {
          setCoinUnlockPrice(Number(res.data.coin_unlock_price) || 25);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat pengaturan paket store');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleUpdateCoinPackage = (index, field, value) => {
    setCoinPackages((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSetPopularCoin = (index) => {
    setCoinPackages((prev) => 
      prev.map((pkg, i) => ({
        ...pkg,
        popular: i === index ? !pkg.popular : pkg.popular
      }))
    );
  };

  const handleUpdateVipPackage = (index, field, value) => {
    setVipPackages((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSetHighlightVip = (index) => {
    setVipPackages((prev) => 
      prev.map((pkg, i) => ({
        ...pkg,
        highlight: i === index ? !pkg.highlight : pkg.highlight
      }))
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        coin_packages: coinPackages,
        premium_packages: vipPackages,
        saweria_url: saweriaUrl.trim(),
        coin_unlock_price: Number(coinUnlockPrice) || 25,
      };

      const res = await apiClient.updateStorePackages(payload);
      if (res?.status) {
        toast.success('Pengaturan paket Store & Koin berhasil disimpan!');
      } else {
        toast.error(res?.error || 'Gagal menyimpan paket');
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.message || 'Terjadi kesalahan saat menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (!window.confirm('Reset semua paket ke pengaturan standar bawaan?')) return;
    setCoinPackages(DEFAULT_COIN_PACKAGES);
    setVipPackages(DEFAULT_VIP_PACKAGES);
    setSaweriaUrl('https://saweria.co/nesianovel');
    setCoinUnlockPrice(25);
    toast.info('Nilai telah direset ke default. Jangan lupa klik "Simpan Perubahan".');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <RefreshCw className="h-8 w-8 text-purple-500 animate-spin" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Memuat data paket store...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400">
              <Coins className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Manajemen Paket Store & Koin
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Atur 4 opsi paket koin, 4 paket durasi VIP, tautan Saweria, dan harga default buka chapter
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/store"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Lihat Store</span>
          </a>
          <button
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Reset ke nilai awal"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-900/30 transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* General Settings: Saweria & Unlock Price */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <LinkIcon className="h-4 w-4 text-purple-500" />
          <span>Pengaturan Global Transaksi</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              URL Pembayaran Saweria
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={saweriaUrl}
                onChange={(e) => setSaweriaUrl(e.target.value)}
                placeholder="https://saweria.co/nesianovel"
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              />
              {saweriaUrl && (
                <a
                  href={saweriaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                  title="Uji URL Saweria"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
              Link Saweria yang terbuka saat pembaca mengklik tombol bayar di Store
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Biaya Buka Chapter Default (Koin)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="1000"
                value={coinUnlockPrice}
                onChange={(e) => setCoinUnlockPrice(e.target.value)}
                className="w-32 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-purple-500 outline-none font-bold text-purple-500"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Koin per chapter (standar: <strong>25 Koin</strong>)
              </span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
              Tarif koin default untuk chapter berbayar jika tidak diubah secara spesifik per chapter
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('coins')}
          className={`flex items-center gap-2 py-3 px-4 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'coins'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Coins className="h-4 w-4" />
          <span>4 Paket Top Up Koin</span>
        </button>
        <button
          onClick={() => setActiveTab('vip')}
          className={`flex items-center gap-2 py-3 px-4 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'vip'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Crown className="h-4 w-4" />
          <span>4 Paket VIP Membership</span>
        </button>
      </div>

      {/* Tab 1: Paket Koin */}
      {activeTab === 'coins' && (
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/40 text-xs text-purple-900 dark:text-purple-300 flex items-center gap-2">
            <Sparkles className="h-4 w-4 shrink-0 text-purple-500" />
            <span>
              Format ini mengatur 4 kotak kartu koin di halaman Store pengguna. Pastikan harga dan jumlah koin realistis.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coinPackages.map((pkg, idx) => (
              <div 
                key={pkg.id || idx}
                className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4 relative"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 text-xs font-bold flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      Paket {pkg.coins} Koin
                    </span>
                  </div>

                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-amber-500">
                    <input
                      type="checkbox"
                      checked={!!pkg.popular}
                      onChange={() => handleSetPopularCoin(idx)}
                      className="rounded border-gray-300 text-amber-500 focus:ring-amber-400"
                    />
                    <span>Badge Terpopuler</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                      Jumlah Koin Diterima
                    </label>
                    <input
                      type="number"
                      value={pkg.coins}
                      onChange={(e) => handleUpdateCoinPackage(idx, 'coins', Number(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                      Nominal Harga (Angka)
                    </label>
                    <input
                      type="number"
                      value={pkg.priceNum}
                      onChange={(e) => handleUpdateCoinPackage(idx, 'priceNum', Number(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                      Label Harga Tampilan
                    </label>
                    <input
                      type="text"
                      value={pkg.price}
                      onChange={(e) => handleUpdateCoinPackage(idx, 'price', e.target.value)}
                      placeholder="Rp10.000"
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                      Bonus Koin (Opsional)
                    </label>
                    <input
                      type="text"
                      value={pkg.bonus || ''}
                      onChange={(e) => handleUpdateCoinPackage(idx, 'bonus', e.target.value)}
                      placeholder="+15 Koin Bonus"
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Paket VIP Membership */}
      {activeTab === 'vip' && (
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-300 flex items-center gap-2">
            <Crown className="h-4 w-4 shrink-0 text-amber-500" />
            <span>
              Member VIP mendapatkan akses membuka semua chapter berbayar tanpa koin selama masa aktif membership.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vipPackages.map((pkg, idx) => (
              <div 
                key={pkg.id || idx}
                className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {pkg.name}
                    </span>
                  </div>

                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-purple-500">
                    <input
                      type="checkbox"
                      checked={!!pkg.highlight}
                      onChange={() => handleSetHighlightVip(idx)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span>Highlight Rekomendasi</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                      Nama Paket
                    </label>
                    <input
                      type="text"
                      value={pkg.name}
                      onChange={(e) => handleUpdateVipPackage(idx, 'name', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                      Durasi (Bulan)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="48"
                      value={pkg.durationMonths}
                      onChange={(e) => handleUpdateVipPackage(idx, 'durationMonths', Number(e.target.value) || 1)}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                      Label Durasi
                    </label>
                    <input
                      type="text"
                      value={pkg.duration}
                      onChange={(e) => handleUpdateVipPackage(idx, 'duration', e.target.value)}
                      placeholder="30 Hari"
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                      Harga Tampilan
                    </label>
                    <input
                      type="text"
                      value={pkg.price}
                      onChange={(e) => handleUpdateVipPackage(idx, 'price', e.target.value)}
                      placeholder="Rp15.000"
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                      Nominal (Angka)
                    </label>
                    <input
                      type="number"
                      value={pkg.priceNum}
                      onChange={(e) => handleUpdateVipPackage(idx, 'priceNum', Number(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Save bar */}
      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-900/30 transition-all disabled:opacity-50"
        >
          {saving ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Menyimpan Pengaturan...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Simpan Semua Perubahan Paket</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
