import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';
import CategoryManager from '../components/admin/CategoryManager';
import MangaManager from '../components/admin/MangaManager';
import Dashboard from './admin/Dashboard';
import AdsManager from './admin/AdsManager';
import FeaturedManager from './admin/FeaturedManager';
import ContactManager from './admin/ContactManager';
import QuickLinksManager from './admin/QuickLinksManager';
import BannerManager from './admin/BannerManager';
import IkiruSync from './admin/IkiruSync';
import ApkomikSync from './admin/ApkomikSync';
import UserManager from './admin/UserManager';
import OrderManager from './admin/OrderManager';
import StickerManager from './admin/StickerManager';
import MangaMigration from './admin/MangaMigration';
import StoreManager from './admin/StoreManager';
import CoinRecapManager from './admin/CoinRecapManager';
import AnnouncementManager from './admin/AnnouncementManager';

const Admin = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="categories" element={<CategoryManager />} />
        <Route path="manga" element={<MangaManager />} />
        <Route path="novel" element={<MangaManager />} />
        <Route path="announcements" element={<AnnouncementManager />} />
        <Route path="store" element={<StoreManager />} />
        <Route path="coin-recap" element={<CoinRecapManager />} />
        <Route path="orders" element={<OrderManager />} />
        <Route path="banners" element={<BannerManager />} />
        <Route path="quick-links" element={<QuickLinksManager />} />
        <Route path="users" element={<UserManager />} />
        <Route path="stickers" element={<StickerManager />} />
        <Route path="ads" element={<AdsManager />} />
        <Route path="featured" element={<FeaturedManager />} />
        <Route path="contact" element={<ContactManager />} />
        <Route path="ikiru-sync" element={<IkiruSync />} />
        <Route path="apkomik-sync" element={<ApkomikSync />} />
        <Route path="migration" element={<MangaMigration />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </AdminLayout>
  );
};

export default Admin;