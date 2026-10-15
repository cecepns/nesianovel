import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Coins, 
  Crown, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink, 
  Upload, 
  Info, 
  HelpCircle,
  Zap,
  ShieldCheck,
  X,
  CreditCard
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../utils/api';
import LoginModal from '../components/LoginModal';

const Store = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('coins'); // 'coins' | 'premium'
  const [loading, setLoading] = useState(true);
  const [packagesData, setPackagesData] = useState({
    coin_packages: [
      { id: 'coin-50', coins: 50, price: 'Rp10.000', priceNum: 10000, popular: false },
      { id: 'coin-150', coins: 150, price: 'Rp25.000', priceNum: 25000, popular: true },
      { id: 'coin-350', coins: 350, price: 'Rp50.000', priceNum: 50000, popular: false },
      { id: 'coin-750', coins: 750, price: 'Rp100.000', priceNum: 100000, popular: false }
    ],
    premium_packages: [
      { id: 'prem-1m', durationMonths: 1, name: 'Paket 1 Bulan', duration: '30 Hari', price: 'Rp15.000', priceNum: 15000, highlight: false },
      { id: 'prem-3m', durationMonths: 3, name: 'Paket 3 Bulan', duration: '90 Hari', price: 'Rp40.000', priceNum: 40000, highlight: true },
      { id: 'prem-6m', durationMonths: 6, name: 'Paket 6 Bulan', duration: '180 Hari', price: 'Rp75.000', priceNum: 75000, highlight: false },
      { id: 'prem-12m', durationMonths: 12, name: 'Paket 12 Bulan (1 Tahun)', duration: '365 Hari', price: 'Rp140.000', priceNum: 140000, highlight: false }
    ],
    saweria_url: 'https://saweria.co/nesianovel',
    coin_unlock_price: 25,
  });

  const [selectedPackage, setSelectedPackage] = useState(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    username: user?.username || '',
    proofImage: null,
    preview: '',
  });

  useEffect(() => {
    let cancelled = false;
    apiClient.getStorePackages()
      .then((res) => {
        if (!cancelled && res?.status && res.data) {
          setPackagesData(res.data);
        }
      })
      .catch((err) => console.warn('Failed loading store packages:', err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (user?.username) {
      setForm((prev) => ({ ...prev, username: user.username }));
    }
  }, [user]);

  const handleOpenOrder = (pkg, type) => {
    if (!isAuthenticated) {
      setLoginModalOpen(true);
      return;
    }
    setSelectedPackage({ ...pkg, order_type: type });
    setForm({
      username: user?.username || '',
      proofImage: null,
      preview: '',
    });
    setOrderModalOpen(true);
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

    setForm((prev) => ({
      ...prev,
      proofImage: file,
      preview: URL.createObjectURL(file),
    }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!form.username.trim()) {
      toast.error('Username akun wajib diisi');
      return;
    }
    if (!form.proofImage) {
      toast.error('Bukti pembayaran wajib diunggah');
      return;
    }
    if (!selectedPackage) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('username', form.username.trim());
      formData.append('package_id', selectedPackage.id);
      formData.append('package_name', selectedPackage.name || `${selectedPackage.coins} Koin`);
      formData.append('package_price', selectedPackage.price);
      formData.append('order_type', selectedPackage.order_type);
      formData.append('proof_image', form.proofImage);

      if (selectedPackage.order_type === 'coins') {
        formData.append('coins_amount', String(selectedPackage.coins || 0));
      } else {
        formData.append('duration_months', String(selectedPackage.durationMonths || 1));
      }

      const res = await apiClient.createPremiumOrder(formData);
      if (res.status) {
        toast.success('Pesanan berhasil dikirim! Menunggu verifikasi admin.');
        setOrderModalOpen(false);
      } else {
        toast.error(res.error || 'Gagal mengirim pesanan');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Gagal mengirim pesanan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
      <Helmet>
        <title>Store Koin & VIP Premium | NesiaNovel</title>
        <meta
          name="description"
          content="Beli Koin dan langganan VIP Premium NesiaNovel. Buka bab terkunci dan nikmati membaca web novel tanpa batas dengan pembayaran mudah via Saweria."
        />
      </Helmet>

      {/* Hero Store Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-purple-800/40 bg-gradient-to-b from-[#1c103b] via-[#120a26] to-[#0a0517] p-6 sm:p-10 shadow-2xl text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.25),transparent_60%)]" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/40 bg-purple-500/15 px-4 py-1.5 text-xs font-black tracking-widest text-purple-300 uppercase shadow-inner">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>NesiaNovel Official Store</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Top-up <span className="text-amber-400">Koin</span> & <span className="text-purple-400">VIP Premium</span>
          </h1>

          <p className="text-sm sm:text-base text-purple-200/80 leading-relaxed">
            Buka bab novel terbaru favoritmu menggunakan Koin (25 Koin/bab) atau upgrade ke VIP Premium untuk akses tanpa batas ke semua novel tanpa gangguan iklan.
          </p>

          {/* User Status Bar */}
          {isAuthenticated && user && (
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#190f36] border border-purple-700/50 text-xs font-bold text-amber-300">
                <Coins className="h-4 w-4 text-amber-400" />
                <span>Saldo Koin: {Number(user.points || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#190f36] border border-purple-700/50 text-xs font-bold text-purple-200">
                <Crown className="h-4 w-4 text-amber-300" />
                <span>
                  Status VIP:{' '}
                  {user.membership_active ? (
                    <span className="text-green-400">Aktif</span>
                  ) : (
                    <span className="text-gray-400">Reguler</span>
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Store Navigation Tabs (Coins vs VIP) */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 rounded-2xl bg-[#130b29] border border-purple-800/40 shadow-xl">
          <button
            type="button"
            onClick={() => setActiveTab('coins')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-extrabold transition-all duration-200 ${
              activeTab === 'coins'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-gray-950 shadow-lg shadow-amber-500/20'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Coins className="h-4 w-4" />
            <span>Paket Koin Novel (4 Pilihan)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('premium')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-extrabold transition-all duration-200 ${
              activeTab === 'premium'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Crown className="h-4 w-4" />
            <span>VIP Premium (1, 3, 6, 12 Bulan)</span>
          </button>
        </div>
      </div>

      {/* COIN PACKAGES SECTION (The 4 Boxes Requested by Client) */}
      {activeTab === 'coins' && (
        <section className="space-y-6 animate-fade-in">
          <div className="text-center max-w-lg mx-auto">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Pilih Paket Koin
            </h2>
            <p className="text-xs sm:text-sm text-purple-300/70 mt-1">
              Setiap bab novel terkunci dapat dibuka dengan 25 koin dan bisa dibaca selamanya.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {packagesData.coin_packages.map((pkg) => {
              const chaptersEstimate = Math.floor(pkg.coins / (packagesData.coin_unlock_price || 25));
              return (
                <div
                  key={pkg.id}
                  className={`relative flex flex-col justify-between rounded-3xl border p-6 transition-all duration-200 hover:-translate-y-1 ${
                    pkg.popular
                      ? 'border-amber-400/80 bg-gradient-to-b from-[#241747] to-[#140b2b] shadow-xl shadow-amber-500/10 ring-1 ring-amber-400/40'
                      : 'border-purple-800/40 bg-[#130b28] hover:border-purple-600/50 shadow-lg'
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-0.5 text-[10px] font-black uppercase text-gray-950 shadow-md">
                      Paling Populer
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                        <Coins className="h-6 w-6" />
                      </div>
                      <span className="text-xs font-bold text-purple-300/80">
                        ~{chaptersEstimate} Bab
                      </span>
                    </div>

                    <div className="text-3xl font-black text-white mb-1">
                      {pkg.coins} <span className="text-base font-bold text-amber-400">Koin</span>
                    </div>
                    <div className="text-xl font-extrabold text-purple-200 mb-4">
                      {pkg.price}
                    </div>

                    <ul className="text-xs text-purple-300/80 space-y-2 mb-6 border-t border-purple-900/30 pt-4">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />
                        <span>Buka ~{chaptersEstimate} bab terkunci</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />
                        <span>Koin aktif selamanya (tanpa expired)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />
                        <span>Bisa dipakai di semua judul novel</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenOrder(pkg, 'coins')}
                    className={`w-full py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-200 shadow-md ${
                      pkg.popular
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-gray-950'
                        : 'bg-purple-600 hover:bg-purple-500 text-white'
                    }`}
                  >
                    Beli Koin Sekarang
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* PREMIUM VIP PACKAGES SECTION (1, 3, 6, 12 Bulan) */}
      {activeTab === 'premium' && (
        <section className="space-y-6 animate-fade-in">
          <div className="text-center max-w-lg mx-auto">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Pilih Durasi VIP Premium
            </h2>
            <p className="text-xs sm:text-sm text-purple-300/70 mt-1">
              Bebas baca ribuan bab novel tanpa perlu kunci, bebas iklan, dan prioritas rilis.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {packagesData.premium_packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative flex flex-col justify-between rounded-3xl border p-6 transition-all duration-200 hover:-translate-y-1 ${
                  pkg.highlight
                    ? 'border-purple-400/80 bg-gradient-to-b from-[#25154d] to-[#140b2b] shadow-xl shadow-purple-600/15 ring-1 ring-purple-400/40'
                    : 'border-purple-800/40 bg-[#130b28] hover:border-purple-600/50 shadow-lg'
                }`}
              >
                {pkg.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 px-3 py-0.5 text-[10px] font-black uppercase text-white shadow-md">
                    Rekomendasi
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-300">
                      <Crown className="h-6 w-6 text-amber-300" />
                    </div>
                    <span className="text-xs font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                      {pkg.duration}
                    </span>
                  </div>

                  <div className="text-xl font-black text-white mb-1">
                    {pkg.name}
                  </div>
                  <div className="text-2xl font-extrabold text-amber-400 mb-4">
                    {pkg.price}
                  </div>

                  <ul className="text-xs text-purple-300/80 space-y-2 mb-6 border-t border-purple-900/30 pt-4">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />
                      <span>Buka semua bab novel terkunci</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />
                      <span>100% bebas dari semua iklan</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />
                      <span>Badge VIP emas di profil & komentar</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />
                      <span>Bonus EXP & fitur eksklusif</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenOrder(pkg, 'premium')}
                  className={`w-full py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-200 shadow-md ${
                    pkg.highlight
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:brightness-110 text-white'
                      : 'bg-[#221345] hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-700/50'
                  }`}
                >
                  Upgrade VIP Sekarang
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SAWERIA PAYMENT TUTORIAL GUIDE (Requested by Client) */}
      <section className="rounded-3xl border border-purple-800/40 bg-gradient-to-b from-[#140b2b] to-[#0c061a] p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-900/40 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                Panduan Pembayaran Melalui Saweria
              </h3>
              <p className="text-xs text-purple-300/70">
                Cara mudah top-up koin dan VIP dengan QRIS, GoPay, OVO, DANA, dan ShopeePay.
              </p>
            </div>
          </div>
          <a
            href={packagesData.saweria_url || 'https://saweria.co/nesianovel'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-black text-xs shadow transition-all duration-200"
          >
            <span>Buka Link Saweria Resmi</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs text-purple-200/80">
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-900/30 space-y-2">
            <div className="w-7 h-7 rounded-xl bg-purple-600 flex items-center justify-center font-black text-white text-xs">
              1
            </div>
            <div className="font-bold text-white text-sm">Pilih Paket</div>
            <p>Pilih paket Koin atau durasi VIP Premium yang kamu inginkan di atas dan catat harganya.</p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-900/30 space-y-2">
            <div className="w-7 h-7 rounded-xl bg-purple-600 flex items-center justify-center font-black text-white text-xs">
              2
            </div>
            <div className="font-bold text-white text-sm">Buka Saweria</div>
            <p>Buka halaman Saweria NesiaNovel dan masukkan nominal pembayaran sesuai harga paket.</p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-900/30 space-y-2">
            <div className="w-7 h-7 rounded-xl bg-purple-600 flex items-center justify-center font-black text-white text-xs">
              3
            </div>
            <div className="font-bold text-white text-sm">Tuliskan Username</div>
            <p>Pada kolom pesan Saweria, cantumkan <strong>Username Akun NesiaNovel</strong> kamu dan selesaikan bayar.</p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-900/30 space-y-2">
            <div className="w-7 h-7 rounded-xl bg-purple-600 flex items-center justify-center font-black text-white text-xs">
              4
            </div>
            <div className="font-bold text-white text-sm">Upload Bukti</div>
            <p>Klik tombol Beli pada paket di website ini dan unggah tangkapan layar bukti transfer Saweria.</p>
          </div>
        </div>
      </section>

      {/* ORDER CONFIRMATION MODAL */}
      {orderModalOpen && selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-[#140c2e] border border-purple-800/60 p-6 sm:p-8 text-white shadow-2xl relative space-y-6">
            <button
              type="button"
              onClick={() => setOrderModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 font-bold text-xs uppercase mb-2">
                Konfirmasi Pesanan
              </div>
              <h3 className="text-xl font-black text-white">
                {selectedPackage.name || `${selectedPackage.coins} Koin`} - {selectedPackage.price}
              </h3>
            </div>

            {/* Saweria Direct Link Box */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200/90 flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white mb-1">
                  Sudah mentransfer via Saweria?
                </p>
                <p>
                  Jika belum, silakan buka{' '}
                  <a
                    href={packagesData.saweria_url || 'https://saweria.co/nesianovel'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-amber-300 underline inline-flex items-center gap-0.5"
                  >
                    saweria.co/nesianovel <ExternalLink className="h-3 w-3" />
                  </a>{' '}
                  sebesar <strong>{selectedPackage.price}</strong> dan cantumkan username akun kamu.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-purple-200 block mb-1.5">
                  Username Akun NesiaNovel
                </label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="Username akun kamu"
                  className="w-full px-4 py-3 rounded-xl bg-[#1b103b] border border-purple-800/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-purple-200 block mb-1.5">
                  Bukti Pembayaran Saweria (Screenshot)
                </label>
                <div className="relative border-2 border-dashed border-purple-800/60 rounded-2xl p-4 text-center hover:border-purple-500 transition-colors bg-[#170e34]">
                  {form.preview ? (
                    <div className="space-y-2">
                      <img
                        src={form.preview}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded-xl object-contain"
                      />
                      <label
                        htmlFor="proof-upload"
                        className="inline-block text-xs text-purple-300 font-bold underline cursor-pointer hover:text-white"
                      >
                        Ganti Foto Bukti
                      </label>
                    </div>
                  ) : (
                    <label htmlFor="proof-upload" className="cursor-pointer block py-6 space-y-2">
                      <Upload className="h-8 w-8 text-purple-400 mx-auto" />
                      <div className="text-xs font-bold text-white">
                        Klik untuk upload screenshot bukti transfer
                      </div>
                      <div className="text-[10px] text-purple-300/60">
                        PNG, JPG, WEBP (Maks 5MB)
                      </div>
                    </label>
                  )}
                  <input
                    id="proof-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setOrderModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-purple-950 border border-purple-900/40 text-purple-300 hover:text-white font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-2 py-3 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white font-black text-xs shadow-lg transition-all"
                >
                  {submitting ? 'Mengirim...' : 'Kirim Bukti Pembayaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loginModalOpen && <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />}
    </div>
  );
};

export default Store;
