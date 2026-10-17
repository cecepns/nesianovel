import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft,
  Home,
  ChevronLeft,
  ChevronRight,
  List,
  X,
  Play,
  Pause,
  Share2,
  Copy,
  Heart,
  AlertTriangle,
  Settings,
  Download,
  Crown,
  Coins,
  Lock,
  Type,
  Maximize2,
  Minimize2,
  BookOpen,
} from 'lucide-react';
import {
  WhatsappShareButton,
  TelegramShareButton,
  TwitterShareButton,
  WhatsappIcon,
  TelegramIcon,
  TwitterIcon,
} from 'react-share';
import { toast } from 'react-toastify';
import discordIcon from '../assets/discord.svg';
import creditBanner from '../assets/credit-banner.png';
import LazyImage from '../components/LazyImage';
import { saveToHistory } from '../utils/historyManager';
import { apiClient, getImageUrl } from '../utils/api';
import AdBanner from '../components/AdBanner';
import { useAds } from '../hooks/useAds';
import CommentSection from '../components/CommentSection';
import DesktopSidebar from '../components/DesktopSidebar';
import { useAuth } from '../contexts/AuthContext';
import { REACTION_OPTIONS, emptyReactionCounts, sumReactionCounts } from '../constants/reactions';
import LoginModal from '../components/LoginModal';
import { downloadChapterPdf } from '../utils/downloadChapterPdf';
import {
  requiresChapterLogin,
  normalizeChapterImage,
  isLatestChapterInList,
} from '../utils/chapterAccess';

const THEME_STYLES = {
  purple: {
    bg: 'bg-[#0f0924]',
    card: 'bg-[#150d33] border-purple-800/40 text-purple-100',
    text: 'text-purple-100',
    title: 'text-white',
    label: 'Dark Purple',
  },
  black: {
    bg: 'bg-black',
    card: 'bg-[#111111] border-zinc-800 text-gray-200',
    text: 'text-gray-200',
    title: 'text-white',
    label: 'OLED Black',
  },
  sepia: {
    bg: 'bg-[#f4ecd8]',
    card: 'bg-[#fbf4e2] border-[#e2d5ba] text-[#3d2b1f]',
    text: 'text-[#3d2b1f]',
    title: 'text-[#2a1d14]',
    label: 'Sepia',
  },
  light: {
    bg: 'bg-gray-100',
    card: 'bg-white border-gray-200 text-gray-900',
    text: 'text-gray-800',
    title: 'text-gray-950',
    label: 'Light',
  },
};

const ChapterReader = () => {
  const { novelSlug: paramNovelSlug, chapterSlug: paramChapterSlug } = useParams();
  const navigate = useNavigate();
  const effectiveChapterSlug = paramChapterSlug || paramNovelSlug;

  const [chapterData, setChapterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showChapterList, setShowChapterList] = useState(false);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(-1);
  const [novelSlug, setNovelSlug] = useState(paramNovelSlug || null);

  // Settings & Controls States
  const [isControlsVisible, setIsControlsVisible] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [unlockingWithCoins, setUnlockingWithCoins] = useState(false);

  // Novel Typography Settings
  const [fontSize, setFontSize] = useState(() => {
    return parseInt(localStorage.getItem('nesianovel-fontsize') || '18', 10);
  });
  const [fontFamily, setFontFamily] = useState(() => {
    return localStorage.getItem('nesianovel-fontfamily') || 'sans';
  });
  const [readerTheme, setReaderTheme] = useState(() => {
    return localStorage.getItem('nesianovel-readertheme') || 'purple';
  });
  const [lineHeight, setLineHeight] = useState(() => {
    return localStorage.getItem('nesianovel-lineheight') || 'relaxed';
  });

  const { user, isAuthenticated } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const isPremiumUser = !!user?.membership_active;

  const discordInviteUrl = 'https://discord.gg/dgC22PSm9h';
  const donateUrl = 'https://saweria.co/nesianovel';
  const chapterOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://nesianovel.com';
  const chapterShareUrl = effectiveChapterSlug ? `${chapterOrigin}/view/${effectiveChapterSlug}` : '';
  const [chapterSharePopupOpen, setChapterSharePopupOpen] = useState(false);

  const copyChapterShareLink = async () => {
    if (!chapterShareUrl) return;
    try {
      await navigator.clipboard.writeText(chapterShareUrl);
      toast.success('Tautan chapter berhasil disalin.');
    } catch {
      toast.error('Gagal menyalin tautan.');
    }
  };

  const [chapterReactionData, setChapterReactionData] = useState(() => emptyReactionCounts());
  const [selectedChapterReaction, setSelectedChapterReaction] = useState(null);
  const [chapterReactionLoading, setChapterReactionLoading] = useState(false);

  // Fetch reactions
  useEffect(() => {
    if (!effectiveChapterSlug) return undefined;
    let cancelled = false;
    setChapterReactionLoading(true);
    apiClient
      .getChapterReactions(effectiveChapterSlug)
      .then((res) => {
        if (cancelled || !res?.status || !res.data) return;
        setChapterReactionData({ ...emptyReactionCounts(), ...res.data });
        setSelectedChapterReaction(res.userReaction ?? null);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setChapterReactionLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [effectiveChapterSlug]);

  const handleChapterReaction = async (reactionType) => {
    if (!effectiveChapterSlug) return;
    setChapterReactionLoading(true);
    try {
      const result = await apiClient.submitChapterReaction(effectiveChapterSlug, reactionType);
      if (result?.status) {
        const refresh = await apiClient.getChapterReactions(effectiveChapterSlug);
        if (refresh?.status && refresh.data) {
          setChapterReactionData({ ...emptyReactionCounts(), ...refresh.data });
          setSelectedChapterReaction(refresh.userReaction ?? null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setChapterReactionLoading(false);
    }
  };

  const fetchChapterData = useCallback(async () => {
    if (!effectiveChapterSlug) return;

    try {
      setLoading(true);
      setError(null);

      let url = `/chapters/slug/${effectiveChapterSlug}`;
      if (paramNovelSlug && paramChapterSlug) {
        url = `/chapters/novel/${paramNovelSlug}/${paramChapterSlug}`;
      }

      const result = await apiClient.request(url);

      if (result && result.status && result.data) {
        const chapters = result.data.chapters || [];
        const index = chapters.findIndex((ch) => ch.slug === effectiveChapterSlug);
        const currentChapter = index >= 0 ? chapters[index] : null;

        setChapterData(result.data);

        const extractedSlug = result.data.content?.slug || result.data.content?.id;
        setNovelSlug(extractedSlug);
        setCurrentChapterIndex(index);

        if (result.data.is_unlocked && currentChapter && result.data.content) {
          saveToHistory({
            mangaSlug: extractedSlug,
            mangaTitle: result.data.content.title,
            cover: result.data.content.cover,
            chapterSlug: currentChapter.slug,
            chapterNumber: currentChapter.number || currentChapter.chapter_number || null,
            chapterTitle: currentChapter.title || null,
            chapterCreatedAt: currentChapter.created_at || null,
            isLatestChapter: isLatestChapterInList(chapters, effectiveChapterSlug),
          });
        }
      } else {
        throw new Error('Data chapter tidak ditemukan');
      }
    } catch (err) {
      console.error('Error fetching chapter:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [effectiveChapterSlug, paramNovelSlug, paramChapterSlug]);

  useEffect(() => {
    if (effectiveChapterSlug) {
      setCurrentChapterIndex(-1);
      fetchChapterData();
    }
  }, [effectiveChapterSlug, fetchChapterData]);

  // Handle Unlock With Coins
  const handleUnlockWithCoins = async () => {
    if (!isAuthenticated) {
      setLoginOpen(true);
      return;
    }

    const price = chapterData?.coin_price || 25;
    const userCoins = Number(user?.points || 0);

    if (userCoins < price) {
      toast.error(
        <div>
          <div className="font-bold text-amber-300">Koin Tidak Cukup!</div>
          <div className="text-xs text-white">
            Dibutuhkan {price} koin. Saldo koin kamu: {userCoins} koin.
          </div>
        </div>
      );
      navigate('/store');
      return;
    }

    setUnlockingWithCoins(true);
    try {
      const res = await apiClient.unlockChapter(chapterData?.id || effectiveChapterSlug);
      if (res.status) {
        toast.success(res.message || 'Chapter berhasil dibuka!');
        await fetchChapterData();
      } else {
        toast.error(res.error || 'Gagal membuka chapter');
      }
    } catch (err) {
      toast.error(err.message || 'Gagal membuka chapter');
    } finally {
      setUnlockingWithCoins(false);
    }
  };

  const allChapters = chapterData?.chapters || [];

  const navigateToChapter = (chapter) => {
    if (!chapter) return;
    if (novelSlug) {
      navigate(`/novel/${novelSlug}/${chapter.slug}`);
    } else {
      navigate(`/view/${chapter.slug}`);
    }
  };

  const handlePrevChapter = () => {
    if (currentChapterIndex < allChapters.length - 1) {
      const prev = allChapters[currentChapterIndex + 1];
      navigateToChapter(prev);
    }
  };

  const handleNextChapter = () => {
    if (currentChapterIndex > 0) {
      const next = allChapters[currentChapterIndex - 1];
      navigateToChapter(next);
    }
  };

  const handleChapterSelect = (chapter) => {
    setShowChapterList(false);
    navigateToChapter(chapter);
  };

  const hasPrevChapter = currentChapterIndex < allChapters.length - 1;
  const hasNextChapter = currentChapterIndex > 0;

  // Track scroll for controls visibility
  const lastScrollYRef = useRef(0);
  useEffect(() => {
    let rafScheduled = false;
    const handleScroll = () => {
      if (rafScheduled) return;
      rafScheduled = true;
      requestAnimationFrame(() => {
        rafScheduled = false;
        const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
        if (Math.abs(currentScrollY - lastScrollYRef.current) > 20) {
          setIsControlsVisible(false);
        }
        lastScrollYRef.current = currentScrollY;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMainAreaClick = (e) => {
    if (
      e.target.closest('button') ||
      e.target.closest('a') ||
      e.target.closest('input') ||
      e.target.closest('[role="dialog"]') ||
      showChapterList ||
      showSettingsDrawer ||
      chapterSharePopupOpen
    ) {
      return;
    }
    setIsControlsVisible((prev) => !prev);
  };

  // Font adjustments
  const changeFontSize = (delta) => {
    setFontSize((prev) => {
      const next = Math.min(Math.max(prev + delta, 14), 28);
      localStorage.setItem('nesianovel-fontsize', String(next));
      return next;
    });
  };

  const changeFontFamily = (fam) => {
    setFontFamily(fam);
    localStorage.setItem('nesianovel-fontfamily', fam);
  };

  const changeReaderTheme = (thm) => {
    setReaderTheme(thm);
    localStorage.setItem('nesianovel-readertheme', thm);
  };

  const changeLineHeight = (lh) => {
    setLineHeight(lh);
    localStorage.setItem('nesianovel-lineheight', lh);
  };

  const currentTheme = THEME_STYLES[readerTheme] || THEME_STYLES.purple;

  const fontClasses = {
    sans: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono',
  };

  const isLocked = chapterData && !chapterData.is_unlocked;
  const currentChapter = allChapters[currentChapterIndex] || chapterData;
  const novelTitle = chapterData?.content?.title || 'NesiaNovel';
  const chapterDisplayTitle = currentChapter?.title || `Chapter ${currentChapter?.number || ''}`;

  return (
    <div className={`min-h-screen ${currentTheme.bg} transition-colors duration-200 select-text`}>
      <Helmet>
        <title>{`${chapterDisplayTitle} - ${novelTitle} | NesiaNovel`}</title>
        <meta
          name="description"
          content={`Baca novel ${novelTitle} ${chapterDisplayTitle} terjemahan bahasa Indonesia di NesiaNovel.`}
        />
      </Helmet>

      {/* Desktop Left Sidebar Navigation */}
      <DesktopSidebar />

      {/* Top Floating Control Bar */}
      <div
        className={`fixed top-0 left-0 right-0 md:left-64 z-40 transition-transform duration-300 ${
          isControlsVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="bg-[#0e0821]/95 border-b border-purple-900/40 backdrop-blur-md px-4 py-3 flex items-center justify-between text-white shadow-xl">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => {
                if (novelSlug) navigate(`/novel/${novelSlug}`);
                else navigate('/');
              }}
              className="p-2 rounded-xl bg-purple-900/30 hover:bg-purple-800/50 text-purple-300 hover:text-white transition-colors"
              aria-label="Kembali"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                {novelTitle}
              </h1>
              <p className="text-xs text-purple-300/80 truncate">
                {chapterDisplayTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSettingsDrawer(true)}
              className="p-2 rounded-xl bg-purple-900/30 hover:bg-purple-800/50 text-purple-300 hover:text-white transition-colors"
              title="Pengaturan Teks"
            >
              <Type className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setShowChapterList(true)}
              className="p-2 rounded-xl bg-purple-900/30 hover:bg-purple-800/50 text-purple-300 hover:text-white transition-colors"
              title="Daftar Chapter"
            >
              <List className="h-5 w-5" />
            </button>
            <Link
              to="/"
              className="p-2 rounded-xl bg-purple-900/30 hover:bg-purple-800/50 text-purple-300 hover:text-white transition-colors"
              title="Beranda"
            >
              <Home className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Reader Settings Drawer */}
      {showSettingsDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-[#140c2e] border border-purple-800/50 p-6 text-white shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-purple-900/40 pb-4">
              <div className="flex items-center gap-2 font-bold text-lg text-purple-200">
                <Type className="h-5 w-5 text-purple-400" />
                <span>Pengaturan Membaca</span>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsDrawer(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Font Size */}
            <div>
              <label className="text-xs font-semibold text-purple-300 mb-2 block">
                Ukuran Huruf ({fontSize}px)
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => changeFontSize(-1)}
                  className="flex-1 py-2 rounded-xl bg-purple-950/60 border border-purple-800/40 hover:bg-purple-900/40 text-sm font-bold"
                >
                  A-
                </button>
                <span className="w-12 text-center text-sm font-bold">{fontSize}</span>
                <button
                  type="button"
                  onClick={() => changeFontSize(1)}
                  className="flex-1 py-2 rounded-xl bg-purple-950/60 border border-purple-800/40 hover:bg-purple-900/40 text-sm font-bold"
                >
                  A+
                </button>
              </div>
            </div>

            {/* Font Family */}
            <div>
              <label className="text-xs font-semibold text-purple-300 mb-2 block">
                Jenis Huruf
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'sans', label: 'Sans' },
                  { id: 'serif', label: 'Serif' },
                  { id: 'mono', label: 'Mono' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => changeFontFamily(f.id)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      fontFamily === f.id
                        ? 'border-purple-400 bg-purple-600/30 text-white'
                        : 'border-purple-900/40 bg-purple-950/30 text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Themes */}
            <div>
              <label className="text-xs font-semibold text-purple-300 mb-2 block">
                Tema Latar
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(THEME_STYLES).map(([key, style]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => changeReaderTheme(key)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                      readerTheme === key
                        ? 'border-purple-400 ring-2 ring-purple-500/30 text-white'
                        : 'border-purple-900/40 text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <span>{style.label}</span>
                    <span className={`w-3.5 h-3.5 rounded-full ${style.bg} border border-purple-500/50`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Line Height */}
            <div>
              <label className="text-xs font-semibold text-purple-300 mb-2 block">
                Jarak Baris
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'normal', label: 'Rapat' },
                  { id: 'relaxed', label: 'Sedang' },
                  { id: 'loose', label: 'Renggang' },
                ].map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => changeLineHeight(l.id)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      lineHeight === l.id
                        ? 'border-purple-400 bg-purple-600/30 text-white'
                        : 'border-purple-900/40 bg-purple-950/30 text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSettingsDrawer(false)}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-colors"
            >
              Selesai
            </button>
          </div>
        </div>
      )}

      {/* Chapter Drawer */}
      {showChapterList && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md h-full bg-[#120a26] border-l border-purple-900/40 p-5 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-purple-900/30">
              <h3 className="font-bold text-white text-base">Daftar Chapter</h3>
              <button
                type="button"
                onClick={() => setShowChapterList(false)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-1.5">
              {allChapters.map((ch) => {
                const isSelected = ch.slug === effectiveChapterSlug;
                const isLockedChapter = ch.is_locked && !ch.is_unlocked;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => handleChapterSelect(ch)}
                    className={`w-full text-left px-3.5 py-3 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-purple-500 bg-purple-900/40 text-white font-bold shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                        : isLockedChapter
                        ? 'border-amber-500/30 bg-[#160f26] text-amber-200/80 hover:border-amber-500/60'
                        : 'border-purple-900/30 bg-[#140d28] text-gray-300 hover:border-purple-500/50 hover:text-white'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-sm font-semibold truncate">
                        {ch.title || `Chapter ${ch.number}`}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {ch.created_at?.formatted || ''}
                      </div>
                    </div>
                    {isLockedChapter ? (
                      <span className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">
                        <Lock className="h-3 w-3" /> {ch.coin_price || 25} Koin
                      </span>
                    ) : (
                      isSelected && (
                        <span className="shrink-0 text-[10px] font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-md">
                          Sedang Dibaca
                        </span>
                      )
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main
        onClick={handleMainAreaClick}
        className="min-h-screen py-8 px-3 sm:px-6 cursor-default md:pl-64"
      >
        <div className="max-w-4xl mx-auto">
          {/* Top Navigation Row */}
          <div className="flex items-center justify-between py-4 mb-4 border-b border-purple-900/20 text-xs text-purple-300/70">
            <Link
              to={novelSlug ? `/novel/${novelSlug}` : '/'}
              className="hover:text-purple-300 transition-colors flex items-center gap-1 font-semibold"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{novelTitle}</span>
            </Link>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSettingsDrawer(true)}
                className="hover:text-white transition-colors flex items-center gap-1 font-semibold"
              >
                <Settings className="h-3.5 w-3.5" />
                <span>Pengaturan</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-32 text-center space-y-4">
              <div className="h-10 w-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-medium text-purple-300/80">Memuat teks novel...</p>
            </div>
          ) : error ? (
            <div className="py-24 text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-white mb-2">Terjadi Kesalahan</h2>
              <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">{error}</p>
              <button
                type="button"
                onClick={fetchChapterData}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm"
              >
                Muat Ulang
              </button>
            </div>
          ) : isLocked ? (
            /* LOCKED CHAPTER SCREEN */
            <div className="my-12 p-6 sm:p-10 rounded-3xl border border-purple-500/30 bg-gradient-to-b from-[#190f33] to-[#0d071d] text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 max-w-lg mx-auto">
                <div className="inline-flex p-4 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-4 shadow-lg shadow-amber-500/10">
                  <Lock className="h-10 w-10" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
                  Chapter Ini Terkunci
                </h2>
                <p className="text-sm text-purple-200/80 mb-6">
                  Chapter <span className="text-white font-bold">{chapterDisplayTitle}</span> dapat dibuka menggunakan Koin atau dengan berlangganan VIP Premium.
                </p>

                {isAuthenticated ? (
                  <div className="space-y-4">
                    {/* Buka dengan Koin */}
                    <button
                      type="button"
                      onClick={handleUnlockWithCoins}
                      disabled={unlockingWithCoins}
                      className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-gray-950 font-black text-sm shadow-xl shadow-amber-500/20 transition-all transform hover:scale-[1.01]"
                    >
                      <Coins className="h-5 w-5" />
                      <span>
                        {unlockingWithCoins ? 'Sedang Membuka...' : `BUKA DENGAN ${chapterData?.coin_price || 25} KOIN`}
                      </span>
                    </button>

                    <div className="text-xs text-purple-300 font-medium">
                      Saldo kamu:{' '}
                      <span className="font-extrabold text-amber-300 text-sm">
                        {Number(user?.points || 0).toLocaleString()} Koin
                      </span>
                      {(user?.points || 0) < (chapterData?.coin_price || 25) && (
                        <span className="text-red-400 block sm:inline mt-1 sm:mt-0 sm:ml-2">
                          (Koin belum cukup, silakan beli di Store)
                        </span>
                      )}
                    </div>

                    <div className="relative py-2 flex items-center justify-center">
                      <span className="border-t border-purple-800/60 w-full" />
                      <span className="px-3 bg-[#130b28] text-[11px] font-black text-purple-400 uppercase tracking-widest">
                        ATAU
                      </span>
                      <span className="border-t border-purple-800/60 w-full" />
                    </div>

                    {/* Buka dengan VIP */}
                    <button
                      type="button"
                      onClick={() => navigate('/store')}
                      className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:brightness-110 text-white font-black text-sm shadow-xl shadow-purple-600/25 transition-all transform hover:scale-[1.01]"
                    >
                      <Crown className="h-5 w-5 text-amber-300" />
                      <span>BUKA DENGAN VIP (BACA SEMUA NOVEL BEBAS)</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setLoginOpen(true)}
                      className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-sm shadow-xl transition-all"
                    >
                      Masuk / Daftar untuk Membuka
                    </button>
                    <p className="text-xs text-purple-300/70">
                      Login akun kamu untuk mengakses saldo koin dan status VIP.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* NOVEL TEXT READER CONTAINER */
            <article
              className={`p-6 sm:p-10 md:p-12 rounded-3xl border shadow-2xl transition-all duration-200 ${currentTheme.card} ${fontClasses[fontFamily]}`}
            >
              {/* Novel Header inside reader */}
              <div className="mb-8 pb-6 border-b border-purple-900/30">
                <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">
                  {novelTitle}
                </div>
                <h1 className={`text-2xl sm:text-3xl md:text-4xl font-extrabold ${currentTheme.title} leading-tight`}>
                  {chapterDisplayTitle}
                </h1>
                {chapterData?.created_at && (
                  <p className="text-xs text-purple-300/60 mt-2">
                    Dipublikasikan: {new Date(chapterData.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                  </p>
                )}
              </div>

              {/* Rich text novel body */}
              {chapterData?.novel_content ? (
                <div
                  className="novel-content max-w-none"
                  style={{
                    fontSize: `${fontSize}px`,
                    lineHeight: lineHeight === 'loose' ? '2.1' : lineHeight === 'relaxed' ? '1.85' : '1.6',
                  }}
                  dangerouslySetInnerHTML={{ __html: chapterData.novel_content }}
                />
              ) : chapterData?.images && chapterData.images.length > 0 ? (
                /* Fallback for image-based chapters */
                <div className="flex flex-col gap-1 items-center">
                  {chapterData.images.map((image, index) => {
                    const { src } = normalizeChapterImage(image);
                    return (
                      <div key={index} className="w-full overflow-hidden">
                        <LazyImage
                          src={getImageUrl(src)}
                          alt={`Page ${index + 1}`}
                          className="w-full h-auto block rounded-xl"
                        />
                      </div>
                    );
                  })}
                  <img src={creditBanner} alt="NesiaNovel" className="w-full rounded-xl mt-4" />
                </div>
              ) : (
                <div className="py-20 text-center text-purple-300/70">
                  Isi bacaan novel belum tersedia untuk chapter ini.
                </div>
              )}
            </article>
          )}

          {/* Chapter Bottom Navigation & Action Buttons */}
          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePrevChapter}
              disabled={!hasPrevChapter}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border font-bold text-sm transition-all ${
                hasPrevChapter
                  ? 'bg-purple-950/60 border-purple-800/40 text-purple-200 hover:bg-purple-900/60 hover:text-white shadow-md'
                  : 'bg-purple-950/20 border-purple-900/20 text-purple-400/30 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Chapter Sebelumnya</span>
            </button>

            <button
              type="button"
              onClick={() => setShowChapterList(true)}
              className="py-3 px-4 rounded-2xl bg-purple-950/60 border border-purple-800/40 text-purple-200 hover:bg-purple-900/60 text-sm font-bold flex items-center gap-1.5"
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Daftar Chapter</span>
            </button>

            <button
              type="button"
              onClick={handleNextChapter}
              disabled={!hasNextChapter}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border font-bold text-sm transition-all ${
                hasNextChapter
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/25 hover:brightness-110'
                  : 'bg-purple-950/20 border-purple-900/20 text-purple-400/30 cursor-not-allowed'
              }`}
            >
              <span>Chapter Selanjutnya</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Share & Social Row */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setChapterSharePopupOpen(true)}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-purple-950/40 border border-purple-900/30 text-white font-bold text-xs hover:bg-purple-900/40 transition-colors"
            >
              <Share2 className="h-4 w-4 text-purple-400" />
              <span>Bagikan</span>
            </button>
            <a
              href={discordInviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-purple-950/40 border border-purple-900/30 text-white font-bold text-xs hover:bg-purple-900/40 transition-colors"
            >
              <img src={discordIcon} alt="" className="h-4 w-4" />
              <span>Discord</span>
            </a>
            <a
              href={donateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-purple-950/40 border border-purple-900/30 text-white font-bold text-xs hover:bg-purple-900/40 transition-colors"
            >
              <Heart className="h-4 w-4 text-amber-400 fill-amber-400" />
              <span>Donasi</span>
            </a>
            <button
              type="button"
              onClick={() => {
                const q = new URLSearchParams({
                  topic: 'lapor-error-novel',
                  chapter: effectiveChapterSlug || '',
                });
                if (novelSlug) q.set('novel', novelSlug);
                navigate(`/contact?${q.toString()}`);
              }}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-purple-950/40 border border-purple-900/30 text-white font-bold text-xs hover:bg-purple-900/40 transition-colors"
            >
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <span>Lapor Error</span>
            </button>
          </div>

          {/* Reaksi Chapter */}
          <div className="mt-8 rounded-3xl border border-purple-900/30 bg-[#130b28] p-6 text-center">
            <h3 className="font-bold text-white text-base">Reaksi Chapter Ini</h3>
            <p className="text-xs text-purple-300/70 mt-1">
              {sumReactionCounts(chapterReactionData).toLocaleString('id-ID')} reaksi dari pembaca
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {REACTION_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleChapterReaction(opt.id)}
                  disabled={chapterReactionLoading}
                  className={`flex flex-col items-center rounded-2xl border px-3 py-2 transition-all ${
                    selectedChapterReaction === opt.id
                      ? 'border-purple-400 bg-purple-600/30 ring-2 ring-purple-400/50 scale-105'
                      : 'border-purple-900/30 bg-purple-950/30 hover:border-purple-700/50'
                  }`}
                >
                  <img src={opt.image} alt={opt.label} className="h-8 w-8 object-contain" />
                  <span className="text-[11px] font-bold text-purple-200 mt-1">
                    {chapterReactionData[opt.id] || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Comments Section */}
          <div className="mt-8">
            <CommentSection chapterSlug={effectiveChapterSlug} mangaSlug={novelSlug} />
          </div>
        </div>
      </main>

      {/* Share Popup Modal */}
      {chapterSharePopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-[#140c2e] border border-purple-800/50 p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-purple-900/30 mb-4">
              <h3 className="font-bold text-base">Bagikan Chapter</h3>
              <button
                type="button"
                onClick={() => setChapterSharePopupOpen(false)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4 text-center">
              <WhatsappShareButton url={chapterShareUrl} title={novelTitle} className="flex flex-col items-center gap-1">
                <WhatsappIcon size={44} round />
                <span className="text-[11px] font-semibold text-gray-300">WhatsApp</span>
              </WhatsappShareButton>
              <TelegramShareButton url={chapterShareUrl} title={novelTitle} className="flex flex-col items-center gap-1">
                <TelegramIcon size={44} round />
                <span className="text-[11px] font-semibold text-gray-300">Telegram</span>
              </TelegramShareButton>
              <TwitterShareButton url={chapterShareUrl} title={novelTitle} className="flex flex-col items-center gap-1">
                <TwitterIcon size={44} round />
                <span className="text-[11px] font-semibold text-gray-300">X (Twitter)</span>
              </TwitterShareButton>
            </div>
            <button
              type="button"
              onClick={copyChapterShareLink}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-900/40 border border-purple-700/40 text-purple-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2"
            >
              <Copy className="h-4 w-4" />
              <span>Salin Tautan</span>
            </button>
          </div>
        </div>
      )}

      {loginOpen && <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />}
    </div>
  );
};

export default ChapterReader;
