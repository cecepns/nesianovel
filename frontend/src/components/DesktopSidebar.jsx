import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  ShoppingBag,
  BookMarked,
  Compass,
  UserCircle,
  Megaphone,
  Trophy,
  CalendarDays,
  Coins,
  Crown,
  LogIn,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import Logo from '../assets/logo.png';
import { useAuth } from '../contexts/AuthContext';
import { resolveActiveNavId } from '../config/navigation';

const DesktopSidebar = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const activeTab = resolveActiveNavId(location.pathname);

  const mainNav = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'store', label: 'Store', icon: ShoppingBag, path: '/store', badge: 'Koin & VIP', highlight: true },
    { id: 'library', label: 'Library', icon: BookMarked, path: '/library' },
    { id: 'novels', label: 'All Novels', icon: Compass, path: '/novels' },
    { id: 'account', label: 'Akun', icon: UserCircle, path: '/akun' },
  ];

  const subNav = [
    { label: 'Pengumuman', icon: Megaphone, path: '/announcements' },
    { label: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
    { label: 'Jadwal Rilis', icon: CalendarDays, path: '/jadwal' },
  ];

  return (
    <aside
      aria-label="Desktop Sidebar Navigation"
      className="hidden md:flex fixed top-0 left-0 bottom-0 z-40 w-64 flex-col bg-[#0d081e] border-r border-purple-900/30 text-gray-200 select-none backdrop-blur-xl shadow-[4px_0_24px_rgba(0,0,0,0.5)]"
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-purple-900/20 bg-gradient-to-b from-purple-950/40 to-transparent">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <img
              src={Logo}
              alt="NesiaNovel"
              className="h-10 w-auto object-contain drop-shadow-[0_0_12px_rgba(168,85,247,0.35)] transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          {/* <div>
            <span className="text-lg font-black tracking-tight text-white flex items-center gap-1">
              Nesia<span className="text-purple-400">Novel</span>
            </span>
            <span className="text-[10px] tracking-wider uppercase text-purple-300/70 font-semibold block">
              Web Novel Indonesia
            </span>
          </div> */}
        </Link>
      </div>

      {/* Main Navigation (The 5 Core Items) */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-purple-300/60">
            Menu Utama
          </div>
          <nav className="space-y-1">
            {mainNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${isActive
                      ? 'bg-gradient-to-r from-purple-600/30 to-purple-800/20 text-white border border-purple-500/40 shadow-[0_0_15px_rgba(147,51,234,0.25)]'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-purple-400 drop-shadow-[0_0_6px_rgba(168,85,247,0.8)]' : 'text-gray-400 group-hover:text-purple-300'
                        }`}
                      strokeWidth={isActive ? 2.25 : 1.75}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-amber-500 text-white shadow-sm">
                      {item.badge}
                    </span>
                  )}
                  {isActive && !item.badge && (
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_6px_#c084fc]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Secondary Navigation */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-purple-300/60">
            Jelajahi
          </div>
          <nav className="space-y-1">
            {subNav.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${isActive
                      ? 'bg-purple-900/30 text-purple-200 font-semibold border border-purple-500/20'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                    }`}
                >
                  <Icon className="h-4 w-4 text-gray-500 group-hover:text-purple-400 transition-colors" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Admin Quick Link if admin */}
        {user?.role === 'admin' && (
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-purple-300/60">
              Admin
            </div>
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-950/60 text-purple-300 border border-purple-800/40 hover:bg-purple-900/50 transition-colors"
            >
              <ShieldCheck className="h-4 w-4 text-purple-400" />
              <span>Admin Panel</span>
            </Link>
          </div>
        )}
      </div>

      {/* User Balance & Profile Widget */}
      <div className="p-3 border-t border-purple-900/20 bg-[#0a0517]">
        {isAuthenticated && user ? (
          <div className="rounded-2xl border border-purple-900/30 bg-purple-950/30 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 overflow-hidden">
                  {user.profile_image ? (
                    <img src={user.profile_image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    (user.username || 'U')[0].toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{user.username}</div>
                  <div className="text-[10px] text-purple-300/70 flex items-center gap-1">
                    {user.membership_active ? (
                      <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                        <Crown className="h-2.5 w-2.5" /> VIP Member
                      </span>
                    ) : (
                      <span>Reguler</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Coins indicator */}
            <div className="flex items-center justify-between bg-black/40 rounded-xl px-2.5 py-1.5 mb-2 border border-purple-900/40">
              <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold">
                <Coins className="h-3.5 w-3.5 text-amber-400" />
                <span>{Number(user.points || 0).toLocaleString()} Koin</span>
              </div>
              <Link
                to="/store"
                className="text-[10px] font-bold text-purple-300 hover:text-white bg-purple-600/50 hover:bg-purple-600 px-2 py-0.5 rounded-lg transition-colors flex items-center gap-0.5"
              >
                Top-up <ChevronRight className="h-2.5 w-2.5" />
              </Link>
            </div>
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-md hover:from-purple-500 hover:to-indigo-500 transition-all duration-200"
          >
            <LogIn className="h-4 w-4" />
            <span>Masuk / Daftar Akun</span>
          </Link>
        )}
      </div>
    </aside>
  );
};

export default DesktopSidebar;
