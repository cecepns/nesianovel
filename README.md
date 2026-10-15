# NesiaNovel

Platform Web Novel Indonesia Modern & Interaktif dengan Sistem Koin, VIP Membership, Reader Format Bebas, dan Integrasi Pembayaran Saweria.

## Fitur Utama

- **Novel Reader Format Bebas**:
  - Format cerita fleksibel mendukung paragraf, heading, gambar ilustrasi, dan tautan URL.
  - Kustomisasi tampilan pembaca: Font Family (Sans, Serif, Mono), Ukuran Font dinamis, dan 4 Tema Reader (Purple, Dark/Black, Sepia, Light).
- **Sistem Koin & VIP Membership**:
  - Buka chapter berbayar dengan 25 Koin atau gratis akses tanpa batas untuk member VIP.
  - Saldo koin dan masa aktif VIP terpantau langsung di profil pembaca.
- **Toko Terpadu (`/store`)**:
  - 4 Paket Top Up Koin (50, 150, 350, 750 Koin).
  - 4 Paket VIP Membership (1, 3, 6, 12 Bulan).
  - Integrasi pembayaran Saweria dengan panduan langkah demi langkah dan upload bukti transfer.
- **Beranda Interaktif (Estetika exnovels.com)**:
  - Header & Brand NesiaNovel dengan tema Dark Purple (`#0c0717` / `#130c24`).
  - Bagian Pengumuman platform di atas konten.
  - 3 Slider Cover Horizontal: PINNED SERIES, NEW SERIES, dan FOR YOU (rekomendasi acak dinamis).
  - Navigasi tetap (Fixed Left Sidebar pada desktop & Bottom Nav pada mobile).
- **Halaman Semua Novel (`/novels`)**:
  - Quick pill filter genre horizontal dan sidebar filter kategori.
- **Panel Admin Lengkap (`/admin`)**:
  - Manajemen Novel & Chapter dengan editor React Quill dan switch Pinned series slider.
  - Manajemen Paket Store & Koin (`/admin/store`).
  - Rekap Bulanan Pembelian Chapter dengan Koin (`/admin/coin-recap`).
  - Manajemen Pengumuman & Berita Platform (`/admin/announcements`).
  - Manajemen Order VIP & Koin (`/admin/orders`).

## Arsitektur Teknologi

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, React Quill, React Helmet Async.
- **Backend**: Node.js, Express, MySQL (mysql2 pool), Multer, Socket.IO.
- **Database**: MySQL `nesianovel`.

## Menjalankan Proyek

### 1. Database
Import database MySQL:
```bash
mysql -u root -p nesianovel < dev-komiknesia_nusakomik.sql
```

Jalankan skrip migrasi NesiaNovel (jika diperlukan):
```bash
cd backend
node scripts/run-nesianovel-migration.js
```

### 2. Backend
```bash
cd backend
npm install
npm run dev
```
Backend berjalan pada `http://localhost:3001`.

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend berjalan pada `http://localhost:5173`.
