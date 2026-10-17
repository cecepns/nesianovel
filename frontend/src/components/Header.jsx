import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Search,
  X,
  User,
  Crown,
  Coins,
  Megaphone,
  Menu,
  Home,
  ShoppingBag,
  BookMarked,
  Compass,
  UserCircle,
  Trophy,
  CalendarDays,
  LogIn,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import Logo from "../assets/logo.png";
import LazyImage from "./LazyImage";
import { useAuth } from "../contexts/AuthContext";
import { apiClient } from "../utils/api";
import { resolveActiveNavId } from "../config/navigation";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const activeTab = resolveActiveNavId(location.pathname);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchDesktopRef = useRef(null);
  const searchMobileRef = useRef(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedInsideDesktop =
        searchDesktopRef.current &&
        searchDesktopRef.current.contains(event.target);
      const clickedInsideMobile =
        searchMobileRef.current &&
        searchMobileRef.current.contains(event.target);
      if (!clickedInsideDesktop && !clickedInsideMobile) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const searchNovels = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      setIsSearching(true);
      try {
        const res = await apiClient.getManga(1, 10, searchQuery.trim());
        if (res && res.data) {
          setSearchResults(res.data);
          setShowResults(true);
        } else if (Array.isArray(res)) {
          setSearchResults(res);
          setShowResults(true);
        }
      } catch (error) {
        console.error("Error searching novels:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchNovels, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleNovelClick = (novel) => {
    navigate(`/novel/${novel.slug}`);
    setSearchQuery("");
    setShowResults(false);
    setMobileSearchOpen(false);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  };

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      setShowResults(false);
      navigate(`/novels?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 z-30 bg-[#0d081f]/90 backdrop-blur-md border-b border-purple-900/30 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Mobile Logo */}
          <div className="flex items-center md:hidden">
            <Link to="/" className="flex items-center gap-2">
              <img
                src={Logo}
                alt="NesiaNovel"
                className="h-8 w-auto object-contain drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]"
              />
              {/* <span className="text-base font-black text-white">
                Nesia<span className="text-purple-400">Novel</span>
              </span> */}
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg relative" ref={searchDesktopRef}>
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Cari judul novel, author, atau genre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchSubmit}
                onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                className="w-full pl-10 pr-10 py-2 bg-[#160e31] border border-purple-800/40 rounded-xl text-sm text-gray-100 placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400/70" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Desktop Search Dropdown */}
            {showResults && (
              <div className="absolute top-full mt-2 w-full bg-[#130b29] rounded-2xl shadow-2xl border border-purple-800/50 max-h-96 overflow-y-auto z-50 divide-y divide-purple-900/30">
                {isSearching ? (
                  <div className="p-4 text-center text-sm text-purple-300/60">
                    Mencari novel...
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="py-2">
                    {searchResults.map((novel) => (
                      <button
                        key={novel.id}
                        type="button"
                        onClick={() => handleNovelClick(novel)}
                        className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-purple-900/30 transition-colors text-left"
                      >
                        <LazyImage
                          src={novel.thumbnail || novel.cover}
                          alt={novel.title}
                          className="w-10 h-14 object-cover rounded-lg flex-shrink-0"
                          wrapperClassName="w-10 h-14 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-white text-sm line-clamp-1">
                            {novel.title}
                          </h4>
                          <p className="text-xs text-purple-300/60 line-clamp-1">
                            {novel.author || "Author Unknown"}
                          </p>
                          {novel.genres && novel.genres.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {novel.genres.slice(0, 2).map((g) => (
                                <span
                                  key={g.id || g}
                                  className="text-[10px] px-1.5 py-0.2 bg-purple-950 text-purple-300 rounded border border-purple-800/40"
                                >
                                  {g.name || g}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-gray-400">
                    Tidak ada novel ditemukan
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Announcements Pill */}
            <Link
              to="/announcements"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/40 text-xs font-semibold text-purple-300 hover:text-white transition-colors"
            >
              <Megaphone className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
              <span>Pengumuman</span>
            </Link>

            {/* Store / Coin Quick Button */}
            <Link
              to="/store"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-700/60 to-indigo-700/60 hover:from-purple-600 hover:to-indigo-600 border border-purple-500/40 text-xs font-bold text-white shadow-sm transition-all"
            >
              <Coins className="h-3.5 w-3.5 text-amber-300" />
              {isAuthenticated && user ? (
                <span>{Number(user.coins !== undefined ? user.coins : user.points || 0).toLocaleString()} Koin</span>
              ) : (
                <span>Store</span>
              )}
            </Link>

            {/* Mobile Search Toggle */}
            <button
              type="button"
              onClick={() => setMobileSearchOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Cari Novel"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Mobile Hamburger Menu (Garis 3) - Matches Windows Navigation */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-purple-200 hover:text-white bg-purple-950/40 border border-purple-800/40 hover:bg-purple-900/50 transition-colors"
              aria-label="Menu Navigasi"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Desktop Profile Avatar / Login */}
            {isAuthenticated && user ? (
              <Link
                to="/akun"
                className="hidden md:flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 overflow-hidden border border-purple-500/40">
                  {user.profile_image ? (
                    <img src={user.profile_image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    (user.username || 'U')[0].toUpperCase()
                  )}
                </div>
              </Link>
            ) : (
              <Link
                to="/akun"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow transition-all"
              >
                <User className="h-3.5 w-3.5" />
                <span>Masuk</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search Drawer */}
        {mobileSearchOpen && (
          <div className="md:hidden pb-3 relative" ref={searchMobileRef}>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari judul novel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchSubmit}
                onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                autoFocus
                className="w-full pl-10 pr-10 py-2.5 bg-[#160e31] border border-purple-800/40 rounded-xl text-sm text-gray-100 placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Mobile Search Results */}
            {showResults && (
              <div className="absolute top-full mt-2 w-full bg-[#130b29] rounded-2xl shadow-2xl border border-purple-800/50 max-h-80 overflow-y-auto z-50 divide-y divide-purple-900/30">
                {isSearching ? (
                  <div className="p-4 text-center text-sm text-purple-300/60">
                    Mencari novel...
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="py-2">
                    {searchResults.map((novel) => (
                      <button
                        key={novel.id}
                        type="button"
                        onClick={() => handleNovelClick(novel)}
                        className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-purple-900/30 text-left"
                      >
                        <LazyImage
                          src={novel.thumbnail || novel.cover}
                          alt={novel.title}
                          className="w-9 h-12 object-cover rounded-lg flex-shrink-0"
                          wrapperClassName="w-9 h-12 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-white text-xs line-clamp-1">
                            {novel.title}
                          </h4>
                          <p className="text-[11px] text-purple-300/60 line-clamp-1">
                            {novel.author || "Author Unknown"}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-gray-400">
                    Tidak ada hasil ditemukan
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Slide-out Menu (Garis 3) - Rendered via createPortal to escape header stacking context */}
      {mobileMenuOpen && typeof document !== "undefined" && createPortal(
        <div className="md:hidden fixed inset-0 z-[9999] flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative ml-auto w-72 max-w-[85vw] h-full bg-[#0d081e] border-l border-purple-900/40 p-4 flex flex-col justify-between shadow-2xl z-10 overflow-y-auto">
            <div className="space-y-5">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-purple-900/30">
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                  <img src={Logo} alt="NesiaNovel" className="h-8 w-auto object-contain" />
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-gray-300 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* User Balance & Status Widget (Mobile) */}
              {isAuthenticated && user ? (
                <div className="rounded-2xl border border-purple-900/30 bg-purple-950/30 p-3">
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 overflow-hidden border border-purple-500/40">
                      {user.profile_image ? (
                        <img src={user.profile_image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        (user.username || 'U')[0].toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-white truncate">{user.username}</div>
                      <div className="text-[10px] text-purple-300/70">
                        {user.membership_active ? (
                          <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                            <Crown className="h-3 w-3" /> VIP Member
                          </span>
                        ) : (
                          <span>Member Reguler</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-black/40 rounded-xl px-2.5 py-1.5 border border-purple-900/40">
                    <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold">
                      <Coins className="h-3.5 w-3.5 text-amber-400" />
                      <span>{Number(user.coins !== undefined ? user.coins : user.points || 0).toLocaleString()} Koin</span>
                    </div>
                    <Link
                      to="/store"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-[10px] font-bold text-purple-300 hover:text-white bg-purple-600/50 hover:bg-purple-600 px-2 py-0.5 rounded-lg transition-colors flex items-center gap-0.5"
                    >
                      Top-up <ChevronRight className="h-2.5 w-2.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <Link
                  to="/akun"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-md"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Masuk / Daftar Akun</span>
                </Link>
              )}

              {/* Menu Utama (Same as Windows Sidebar) */}
              <div>
                <div className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-purple-300/60">
                  Menu Utama
                </div>
                <nav className="space-y-1">
                  {[
                    { id: 'home', label: 'Home', icon: Home, path: '/' },
                    { id: 'store', label: 'Store', icon: ShoppingBag, path: '/store', badge: 'Koin & VIP' },
                    { id: 'library', label: 'Library', icon: BookMarked, path: '/library' },
                    { id: 'novels', label: 'All Novels', icon: Compass, path: '/novels' },
                    { id: 'account', label: 'Akun', icon: UserCircle, path: '/akun' },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <Link
                        key={item.id}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-purple-600/30 to-purple-800/20 text-white border border-purple-500/40 shadow-sm'
                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`h-4 w-4 ${isActive ? 'text-purple-400' : 'text-gray-400'}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-amber-500 text-white">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Jelajahi Section (Same as Windows Sidebar) */}
              <div>
                <div className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-purple-300/60">
                  Jelajahi
                </div>
                <nav className="space-y-1">
                  {[
                    { label: 'Pengumuman', icon: Megaphone, path: '/announcements' },
                    { label: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
                    { label: 'Jadwal Rilis', icon: CalendarDays, path: '/jadwal' },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-purple-900/30 text-purple-200 font-semibold border border-purple-500/20'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                        }`}
                      >
                        <Icon className="h-4 w-4 text-gray-500" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Admin Panel Link if Admin */}
              {user?.role === 'admin' && (
                <div>
                  <div className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-purple-300/60">
                    Admin
                  </div>
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold bg-purple-950/60 text-purple-300 border border-purple-800/40 hover:bg-purple-900/50 transition-colors"
                  >
                    <ShieldCheck className="h-4 w-4 text-purple-400" />
                    <span>Admin Panel</span>
                  </Link>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-purple-900/30 text-center">
              <p className="text-[10px] text-purple-300/50">
                NesiaNovel &copy; 2026
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};

export default Header;

