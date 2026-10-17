import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Search,
  X,
  User,
  Crown,
  Coins,
  Megaphone,
} from "lucide-react";
import Logo from "../assets/logo.png";
import LazyImage from "./LazyImage";
import { useAuth } from "../contexts/AuthContext";
import { apiClient } from "../utils/api";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchDesktopRef = useRef(null);
  const searchMobileRef = useRef(null);

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
                <span>{Number(user.points || 0).toLocaleString()} Koin</span>
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

            {/* Profile Avatar / Login */}
            {isAuthenticated && user ? (
              <Link
                to="/akun"
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 transition-colors"
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
                to="/login"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow transition-all"
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
    </header>
  );
};

export default Header;
