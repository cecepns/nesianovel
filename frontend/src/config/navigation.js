import { Home, ShoppingBag, BookMarked, Compass, UserCircle } from 'lucide-react';

/** Navigasi utama NesiaNovel: Home - Store - Library - All Novels - Akun */
export const mainNavigationItems = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'store', label: 'Store', icon: ShoppingBag, path: '/store', badge: 'Koin' },
  { id: 'library', label: 'Library', icon: BookMarked, path: '/library' },
  { id: 'novels', label: 'All Novels', icon: Compass, path: '/novels' },
  { id: 'account', label: 'Akun', icon: UserCircle, path: '/akun' },
];

export function resolveActiveNavId(pathname) {
  if (pathname === '/store' || pathname === '/premium') return 'store';
  if (pathname === '/library') return 'library';
  if (pathname === '/novels' || pathname === '/content' || pathname === '/daftar-komik' || pathname === '/daftar-novel') return 'novels';
  if (pathname === '/akun' || pathname === '/profile' || pathname === '/login' || pathname === '/register') return 'account';
  if (pathname === '/' || pathname.startsWith('/novel/') || pathname.startsWith('/view/') || pathname.startsWith('/komik/')) return 'home';
  return 'home';
}
