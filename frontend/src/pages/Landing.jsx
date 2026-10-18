import { useState, useEffect } from "react";
import {
  ExternalLink,
  Flame,
  BookOpen,
  Crown,
  Smartphone,
  Moon,
  Sun,
  ChevronDown,
  Sparkles,
  Heart,
  Share2,
  Download,
  CheckCircle2,
  Zap,
  Globe,
  ShieldCheck,
  Star
} from "lucide-react";
import logo from "../assets/logo.png";
import discordIcon from "../assets/discord.svg";
import { apiClient, setCdnDomain } from "../utils/api";
import { decryptResponseAddress } from "../utils/decryptor";

const defaultCtaItems = [
  {
    id: "read_novel",
    title: "Baca Novel",
    subtitle: "Ribuan judul web novel & light novel gratis",
    href: "https://nesianovel.com/",
    icon: "BookOpen",
    badge: "Hot",
  },
  {
    id: "premium",
    title: "Upgrade ke Premium",
    subtitle: "Baca tanpa iklan & fitur eksklusif",
    href: "https://nesianovel.com/premium",
    icon: "Crown",
    badge: "Pro",
  },
  {
    id: "discord",
    title: "Join Discord",
    subtitle: "Komunitas pembaca & update info terbaru",
    href: "https://discord.gg/dgC22PSm9h",
    icon: "Discord",
  },
  {
    id: "facebook",
    title: "Facebook",
    subtitle: "Halaman resmi NesiaNovel di Facebook",
    href: "https://facebook.com",
    icon: "Facebook",
  },
  {
    id: "tiktok",
    title: "TikTok",
    subtitle: "Follow TikTok NesiaNovel",
    href: "https://tiktok.com",
    icon: "TikTok",
  },
  {
    id: "instagram",
    title: "Instagram",
    subtitle: "Follow Instagram NesiaNovel",
    href: "https://instagram.com",
    icon: "Instagram",
  },
  {
    id: "download_app",
    title: "Download App",
    subtitle: "Baca novel lebih nyaman di aplikasi",
    href: "https://nesianovel.com/",
    icon: "Download",
    badge: "App",
  }
];

const renderIcon = (iconName) => {
  if (iconName === 'Discord') {
    return <img src={discordIcon} alt="" aria-hidden="true" className="h-5 w-5 drop-shadow" />;
  }
  if (iconName === 'Facebook') {
    return (
      <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    );
  }
  if (iconName === 'TikTok') {
    return (
      <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.33 22a6.34 6.34 0 0 0 6.34-6.34V9.37a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.85-.8z" />
      </svg>
    );
  }
  if (iconName === 'Instagram') {
    return (
      <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    );
  }

  let IconComp = BookOpen;
  if (iconName === 'Crown') IconComp = Crown;
  if (iconName === 'Download') IconComp = Download;
  if (iconName === 'Smartphone') IconComp = Smartphone;
  if (iconName === 'Heart') IconComp = Heart;
  if (iconName === 'Share2') IconComp = Share2;
  if (iconName === 'ExternalLink') IconComp = ExternalLink;

  return <IconComp className="h-5 w-5" />;
};

const getItemGradient = (id, iconName) => {
  if (id === 'read_novel' || id === 'read_manga' || iconName === 'BookOpen') return 'from-purple-600 to-indigo-600 text-white shadow-purple-500/25';
  if (id === 'premium' || iconName === 'Crown') return 'from-amber-500 via-yellow-500 to-amber-600 text-slate-950 shadow-amber-500/25';
  if (id === 'discord' || iconName === 'Discord') return 'from-[#5865F2] to-indigo-600 text-white shadow-indigo-500/25';
  if (id === 'facebook' || iconName === 'Facebook') return 'from-[#1877F2] to-blue-600 text-white shadow-blue-500/25';
  if (id === 'tiktok' || iconName === 'TikTok') return 'from-slate-900 to-black text-white ring-1 ring-white/20 shadow-slate-950/40';
  if (id === 'instagram' || iconName === 'Instagram') return 'from-amber-500 via-rose-500 to-purple-600 text-white shadow-rose-500/25';
  if (id === 'download_app' || iconName === 'Download') return 'from-emerald-600 to-teal-600 text-white shadow-emerald-500/25';
  return 'from-purple-600 to-indigo-600 text-white shadow-purple-500/20';
};

const stats = [
  { value: "5000+", label: "Judul Novel", icon: BookOpen },
  { value: "100K+", label: "Chapter Novel", icon: Zap },
  { value: "24/7", label: "Update Harian", icon: Flame },
];

const genreItems = [
  "Fantasy", "Isekai", "Romance", "Action", "Martial Arts", "Xianxia", "Wuxia",
  "Adventure", "Comedy", "Mystery", "Sci-Fi", "Slice of Life", "Supernatural",
  "Reincarnation", "Drama", "School Life"
];

const faqItems = [
  {
    question: "Apa itu Nesianovel?",
    answer: "Nesianovel adalah platform baca novel online terdepan yang menyediakan web novel, light novel, dan novel terjemahan bahasa Indonesia terlengkap dan gratis. Nesianovel telah dipercaya oleh ratusan ribu pembaca novel di seluruh Indonesia.",
  },
  {
    question: "Apakah Nesianovel gratis?",
    answer: "Ya! Kamu bisa membaca ribuan judul novel dan chapter di Nesianovel secara gratis. Tersedia juga opsi Premium untuk pengalaman membaca tanpa iklan dan akses fitur eksklusif lainnya.",
  },
  {
    question: "Apa domain resmi Nesianovel?",
    answer: "Domain resmi Nesianovel adalah nesianovel.com. Pastikan kamu selalu mengakses domain resmi untuk mendapatkan update chapter novel terbaru dan terpercaya.",
  },
  {
    question: "Genre novel apa saja yang tersedia?",
    answer: "Nesianovel menyediakan beragam genre novel populer termasuk Fantasy, Isekai, Romance, Action, Martial Arts (Wuxia & Xianxia), Reincarnation, Sci-Fi, Mystery, Slice of Life, dan masih banyak lagi.",
  },
  {
    question: "Bagaimana cara baca novel di Nesianovel?",
    answer: 'Sangat mudah! Klik tombol "Baca Novel" di atas, cari judul novel yang ingin kamu nikmati, pilih chapter, dan langsung mulai membaca. Tampilan reader kami dirancang khusus agar nyaman untuk membaca teks panjang di HP maupun PC.',
  },
];

const Landing = () => {
  const [isLightMode, setIsLightMode] = useState(false);
  const [ctaItems, setCtaItems] = useState(defaultCtaItems);
  const [openFaqItems, setOpenFaqItems] = useState(() => new Set([faqItems[0]?.question]));

  useEffect(() => {
    const fetchLandingSettings = async () => {
      try {
        const res = await apiClient.getSettings();
        let settings = res;

        // Handle direct encrypted response payload { encrypted: true, data: "...", time: ... }
        if (settings && typeof settings === 'object' && settings.encrypted && settings.data && settings.time) {
          try {
            settings = decryptResponseAddress(settings.data, settings.time);
          } catch (decErr) {
            console.error("[Landing] Failed to decrypt settings payload:", decErr);
          }
        }

        // Handle nested encrypted response payload { data: { encrypted: true, data: "...", time: ... } }
        if (settings && typeof settings === 'object' && settings.data && typeof settings.data === 'object' && !Array.isArray(settings.data)) {
          if (settings.data.encrypted && settings.data.data && settings.data.time) {
            try {
              settings = decryptResponseAddress(settings.data.data, settings.data.time);
            } catch (decErr) {
              console.error("[Landing] Failed to decrypt nested settings.data payload:", decErr);
            }
          }
        }

        if (settings?.cdn_domain) {
          setCdnDomain(settings.cdn_domain);
        }

        let rawLinks = settings?.quick_links ?? settings?.data?.quick_links ?? (Array.isArray(settings?.data) ? settings.data : null);

        if (typeof rawLinks === 'string') {
          try {
            rawLinks = JSON.parse(rawLinks);
          } catch (pErr) {
            console.warn("[Landing] Failed to parse quick_links string:", pErr);
          }
        }

        if (Array.isArray(rawLinks) && rawLinks.length > 0) {
          const landingLinks = rawLinks.filter((item) => {
            if (!item || typeof item !== 'object') return false;
            const isActive = item.is_active !== false && item.is_active !== '0' && item.is_active !== 0;
            const isLanding = item.is_landing !== false && item.is_landing !== '0' && item.is_landing !== 0;
            return isActive && isLanding;
          });

          if (landingLinks.length > 0) {
            setCtaItems(landingLinks);
          }
        }
      } catch (err) {
        console.error("Error loading quick links for Landing:", err);
      }
    };

    fetchLandingSettings();
  }, []);

  const allFaqOpen = openFaqItems.size === faqItems.length;

  const toggleFaq = (question) => {
    setOpenFaqItems((prev) => {
      const next = new Set(prev);
      if (next.has(question)) {
        next.delete(question);
      } else {
        next.add(question);
      }
      return next;
    });
  };

  const toggleAllFaq = () => {
    setOpenFaqItems(() => {
      if (allFaqOpen) return new Set();
      return new Set(faqItems.map((item) => item.question));
    });
  };

  return (
    <main
      className={`relative min-h-screen overflow-hidden transition-colors duration-300 font-sans ${isLightMode ? "bg-slate-50 text-slate-900" : "bg-[#05070c] text-gray-100"
        }`}
    >
      {/* Background Lighting Gradients */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div
          className={`absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full blur-[120px] opacity-40 transition-opacity ${isLightMode
              ? "bg-gradient-to-tr from-purple-200 via-indigo-200 to-purple-100"
              : "bg-gradient-to-tr from-purple-950/70 via-purple-900/50 to-indigo-950/40"
            }`}
        />
        <div
          className={`absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[120px] opacity-30 transition-opacity ${isLightMode ? "bg-purple-200/30" : "bg-purple-900/30"
            }`}
        />
      </div>

      {/* Grid Pattern Overlay */}
      <div
        className={`pointer-events-none absolute inset-0 z-0 opacity-[0.07] ${isLightMode
            ? "[background-image:linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)]"
            : "[background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)]"
          } [background-size:32px_32px]`}
      />

      <section className="relative z-10 mx-auto flex min-h-screen max-w-2xl flex-col items-center px-4 pb-16 pt-8 sm:px-6">
        {/* Top Header Switcher */}
        <div className="w-full flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Online • Live
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsLightMode((prev) => !prev)}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border shadow-sm transition-all duration-200 ${isLightMode
                ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-100 shadow-slate-200 hover:scale-105"
                : "border-gray-800 bg-gray-900/90 text-gray-200 hover:bg-gray-800 shadow-black hover:scale-105"
              }`}
            aria-label={isLightMode ? "Switch to Dark Mode" : "Switch to Light Mode"}
            title={isLightMode ? "Mode Gelap" : "Mode Terang"}
          >
            {isLightMode ? (
              <Moon className="h-4 w-4 text-slate-700" />
            ) : (
              <Sun className="h-4 w-4 text-amber-400" />
            )}
          </button>
        </div>

        {/* Brand Logo & Headline */}
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <img src={logo} alt="NesiaNovel" className="w-44 sm:w-56 object-contain" />
          </div>

          <div
            className={`mt-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-extrabold shadow-sm transition-all ${isLightMode
                ? "bg-purple-50 text-purple-700 border border-purple-200/80"
                : "bg-purple-950/60 text-purple-300 border border-purple-800/60 backdrop-blur-md"
              }`}
          >
            <Flame className="h-4 w-4 text-purple-400 animate-bounce" />
            Platform Baca Web Novel & Light Novel Bahasa Indonesia
          </div>
        </div>

        {/* Action Link Cards (CTAs) */}
        <div className="mt-8 w-full space-y-3.5">
          {ctaItems.map((item) => {
            const iconBgGradient = getItemGradient(item.id, item.icon);
            return (
              <a
                key={item.title + item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative flex w-full items-center justify-between rounded-2xl border p-4 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isLightMode
                    ? "border-slate-200/90 bg-white hover:border-purple-400/60 hover:shadow-purple-500/10"
                    : "border-gray-800/80 bg-gray-900/80 backdrop-blur-xl hover:border-purple-500/60 hover:shadow-purple-900/20"
                  }`}
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-md ${iconBgGradient}`}
                  >
                    {renderIcon(item.icon)}
                  </span>

                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-base font-extrabold sm:text-lg transition-colors group-hover:text-purple-400 ${isLightMode ? "text-slate-900" : "text-gray-100"
                          }`}
                      >
                        {item.title}
                      </p>
                      {item.badge && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${item.badge.toLowerCase() === 'pro' || item.badge.toLowerCase() === 'hot'
                              ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-sm'
                              : 'bg-purple-600 text-white shadow-sm'
                            }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {item.subtitle && (
                      <p
                        className={`text-xs font-medium mt-0.5 line-clamp-1 ${isLightMode ? "text-slate-500" : "text-gray-400"
                          }`}
                      >
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 ${isLightMode
                      ? "bg-slate-100 text-slate-600 group-hover:bg-purple-600 group-hover:text-white"
                      : "bg-gray-800 text-gray-400 group-hover:bg-purple-600 group-hover:text-white"
                    }`}
                >
                  <ExternalLink className="h-4 w-4" />
                </div>
              </a>
            );
          })}
        </div>

        {/* Stats Grid */}
        <div
          className={`mt-8 grid w-full grid-cols-3 gap-3 rounded-2xl border p-4 shadow-lg ${isLightMode
              ? "border-slate-200 bg-white"
              : "border-purple-900/30 bg-gray-900/70 backdrop-blur-md"
            }`}
        >
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={stat.label}
                className={`flex flex-col items-center justify-center rounded-xl p-3 text-center transition-transform hover:scale-105 ${isLightMode ? "bg-slate-50" : "bg-gray-800/60"
                  }`}
              >
                <IconComponent className="h-5 w-5 text-purple-400 mb-1.5" />
                <p className="text-base font-extrabold text-purple-400 sm:text-xl font-mono">
                  {stat.value}
                </p>
                <p className={`text-[11px] font-semibold mt-0.5 ${isLightMode ? "text-slate-600" : "text-gray-400"}`}>
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Informational Cards & Accordions */}
        <div className="mt-8 w-full space-y-4">
          {/* About Section */}
          <section
            className={`rounded-2xl border p-6 shadow-md transition-colors ${isLightMode ? "border-slate-200 bg-white" : "border-purple-900/30 bg-gray-900/70 backdrop-blur-md"
              }`}
          >
            <h2 className="flex items-center gap-2.5 text-xl font-extrabold text-purple-400">
              <BookOpen className="h-5 w-5" /> Apa itu Nesianovel?
            </h2>
            <p className={`mt-3 text-sm leading-relaxed ${isLightMode ? "text-slate-600" : "text-gray-300"}`}>
              Nesianovel adalah platform baca web novel, light novel, dan novel terjemahan online berbahasa Indonesia yang paling
              lengkap dan terupdate. Dengan ribuan judul dari berbagai genre populer seperti Fantasy, Isekai, Xianxia, Romance,
              hingga Sci-Fi, Nesianovel menjadi pilihan utama para penikmat cerita novel di Indonesia.
            </p>
            <p className={`mt-3 text-sm leading-relaxed ${isLightMode ? "text-slate-600" : "text-gray-300"}`}>
              Nikmati pengalaman membaca novel yang nyaman dan imersif dengan update chapter terbaru setiap hari, tampilan modern yang
              responsif di semua perangkat, kustomisasi reader yang fleksibel, dan fitur bookmark untuk menyimpan novel favoritmu. Semua bisa kamu akses
              secara gratis!
            </p>
          </section>

          {/* Genre Section */}
          <section
            className={`rounded-2xl border p-6 shadow-md transition-colors ${isLightMode ? "border-slate-200 bg-white" : "border-purple-900/30 bg-gray-900/70 backdrop-blur-md"
              }`}
          >
            <h2 className="flex items-center gap-2.5 text-xl font-extrabold text-purple-400">
              <Sparkles className="h-5 w-5" /> Jelajahi Genre Novel
            </h2>
            <p className={`mt-2 text-xs sm:text-sm ${isLightMode ? "text-slate-500" : "text-gray-400"}`}>
              Temukan ribuan web novel dan light novel sesuai genre favoritmu:
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {genreItems.map((genre) => (
                <span
                  key={genre}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold border transition-all duration-200 hover:scale-105 cursor-pointer ${isLightMode
                      ? "border-slate-200 bg-slate-100 text-slate-700 hover:border-purple-500 hover:bg-purple-600 hover:text-white"
                      : "border-gray-800 bg-gray-800/80 text-gray-300 hover:border-purple-500 hover:bg-purple-600 hover:text-white"
                    }`}
                >
                  {genre}
                </span>
              ))}
            </div>
          </section>

          {/* Features Section */}
          <section
            className={`rounded-2xl border p-6 shadow-md transition-colors ${isLightMode ? "border-slate-200 bg-white" : "border-purple-900/30 bg-gray-900/70 backdrop-blur-md"
              }`}
          >
            <h2 className="flex items-center gap-2.5 text-xl font-extrabold text-purple-400">
              <Zap className="h-5 w-5" /> Keunggulan Nesianovel
            </h2>
            <ul className="mt-4 space-y-3 text-xs sm:text-sm">
              {[
                { title: "Koleksi Terlengkap", desc: "Ribuan judul web novel, light novel, dan novel terjemahan dalam bahasa Indonesia." },
                { title: "Update Tercepat", desc: "Chapter terbaru rilis setiap hari tanpa terlambat." },
                { title: "Akses Perangkat", desc: "Tampilan responsif di HP, tablet, dan aplikasi Android." },
                { title: "Bookmark & Riwayat", desc: "Simpan judul favorit dan lanjutkan dari chapter terakhir." },
                { title: "Mode Gelap & Terang", desc: "Tampilan visual nyaman untuk membaca teks kapan pun." },
                { title: "Fitur Premium", desc: "Pengalaman baca bebas dari gangguan iklan." },
              ].map((feat) => (
                <li key={feat.title} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-purple-400 mt-0.5" />
                  <div>
                    <span className={`font-bold ${isLightMode ? "text-slate-900" : "text-gray-100"}`}>
                      {feat.title}
                    </span>{" "}
                    —{" "}
                    <span className={isLightMode ? "text-slate-600" : "text-gray-400"}>
                      {feat.desc}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* FAQ Accordion */}
          <section
            className={`rounded-2xl border p-6 shadow-md transition-colors ${isLightMode ? "border-slate-200 bg-white" : "border-purple-900/30 bg-gray-900/70 backdrop-blur-md"
              }`}
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="flex items-center gap-2.5 text-xl font-extrabold text-purple-400">
                <Globe className="h-5 w-5" /> Pertanyaan Umum (FAQ)
              </h2>
              <button
                type="button"
                onClick={toggleAllFaq}
                className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${isLightMode
                    ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
              >
                {allFaqOpen ? "Tutup Semua" : "Buka Semua"}
              </button>
            </div>

            <div className="space-y-3">
              {faqItems.map((item) => {
                const isOpen = openFaqItems.has(item.question);
                return (
                  <div
                    key={item.question}
                    className={`rounded-xl border transition-colors overflow-hidden ${isLightMode
                        ? isOpen ? "border-purple-300 bg-purple-50/50" : "border-slate-200 bg-slate-50"
                        : isOpen ? "border-purple-500/60 bg-purple-950/30" : "border-gray-800/80 bg-gray-800/40"
                      }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(item.question)}
                      className="flex w-full items-center justify-between gap-3 p-4 text-left font-bold text-sm"
                      aria-expanded={isOpen}
                    >
                      <span className={isLightMode ? "text-slate-900" : "text-gray-100"}>
                        {item.question}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 transition-transform duration-200 text-purple-400 ${isOpen ? "rotate-180" : "rotate-0"
                          }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-0 text-xs sm:text-sm leading-relaxed border-t border-purple-500/20 mt-1">
                        <p className={isLightMode ? "text-slate-600" : "text-gray-300"}>
                          {item.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Footer Info */}
          <section
            className={`rounded-2xl border p-6 shadow-md transition-colors text-center ${isLightMode ? "border-slate-200 bg-white" : "border-purple-900/30 bg-gray-900/70 backdrop-blur-md"
              }`}
          >
            <h2 className="text-lg font-extrabold text-purple-400 mb-2">
              NesiaNovel Indonesia
            </h2>
            <p className={`text-xs sm:text-sm leading-relaxed max-w-lg mx-auto ${isLightMode ? "text-slate-600" : "text-gray-400"}`}>
              Platform utama baca web novel, light novel, dan novel terjemahan bahasa Indonesia tercepat, terlengkap, dan gratis.
            </p>
            <p className="mt-4 text-xs font-semibold text-gray-500">
              © {new Date().getFullYear()} NesiaNovel. All rights reserved.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
};

export default Landing;
