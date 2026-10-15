-- Migration for NesiaNovel

-- 1. Update chapters table with novel content & coin price
ALTER TABLE chapters
  ADD COLUMN IF NOT EXISTS content LONGTEXT NULL AFTER cover,
  ADD COLUMN IF NOT EXISTS coin_price INT NOT NULL DEFAULT 25 AFTER content,
  ADD COLUMN IF NOT EXISTS is_locked TINYINT(1) NOT NULL DEFAULT 0 AFTER coin_price;

-- 2. Update manga table with is_pinned
ALTER TABLE manga
  ADD COLUMN IF NOT EXISTS is_pinned TINYINT(1) NOT NULL DEFAULT 0 AFTER is_project;

UPDATE manga SET is_pinned = is_project WHERE is_project = 1;

-- 3. Create user_unlocked_chapters for tracking unlocked chapters via coins
CREATE TABLE IF NOT EXISTS user_unlocked_chapters (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  chapter_id INT NOT NULL,
  coins_spent INT NOT NULL DEFAULT 25,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_user_chapter (user_id, chapter_id),
  KEY idx_user (user_id),
  KEY idx_chapter (chapter_id),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  content LONGTEXT NOT NULL,
  excerpt TEXT NULL,
  banner_image VARCHAR(500) NULL,
  is_pinned TINYINT(1) NOT NULL DEFAULT 0,
  is_published TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_announcement_slug (slug),
  KEY idx_is_pinned (is_pinned),
  KEY idx_is_published (is_published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Update premium_orders table to support both coins and premium packages
ALTER TABLE premium_orders
  ADD COLUMN IF NOT EXISTS order_type ENUM('premium', 'coins') NOT NULL DEFAULT 'premium' AFTER package_id,
  ADD COLUMN IF NOT EXISTS coins_amount INT NOT NULL DEFAULT 0 AFTER package_price,
  ADD COLUMN IF NOT EXISTS duration_months INT NOT NULL DEFAULT 0 AFTER coins_amount,
  ADD COLUMN IF NOT EXISTS user_id INT NULL AFTER username;

-- 6. Insert initial announcement (Saweria Payment Tutorial)
INSERT INTO announcements (title, slug, excerpt, content, is_pinned, is_published)
VALUES (
  'Panduan Pembayaran Koin & Premium Melalui Saweria',
  'panduan-pembayaran-saweria',
  'Cara mudah top-up koin dan aktivasi member VIP Premium NesiaNovel melalui Saweria.',
  '<h3>Cara Top-up Koin & VIP Premium NesiaNovel Lewat Saweria</h3><ol><li>Pilih paket Koin atau VIP Premium yang kamu inginkan di halaman <strong>Store</strong>.</li><li>Klik tombol <strong>Beli Sekarang</strong> dan catat nominal pembayarannya.</li><li>Buka link Saweria resmi NesiaNovel di <a href=\"https://saweria.co/nesianovel\" target=\"_blank\" rel=\"noopener noreferrer\">saweria.co/nesianovel</a>.</li><li>Masukkan nominal sesuai harga paket yang dipilih, dan cantumkan <strong>Username Akun NesiaNovel</strong> kamu di kolom pesan/catatan Saweria.</li><li>Pilih metode pembayaran (QRIS, GoPay, OVO, DANA, LinkAja, dsb) lalu selesaikan pembayaran.</li><li>Screenshot atau simpan bukti transaksi/pembayaran berhasil.</li><li>Upload bukti screenshot di form konfirmasi Store NesiaNovel.</li><li>Admin akan memverifikasi dan koin / status VIP kamu akan aktif dalam waktu 5-15 menit!</li></ol><p>Jika ada kendala, hubungi kami via menu Kontak atau Discord komunitas kami.</p>',
  1,
  1
) ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 7. Insert default settings for coin & premium packages
INSERT INTO settings (`key`, `value`) VALUES
('coin_packages', '[{\"id\":\"coin-50\",\"coins\":50,\"price\":\"Rp10.000\",\"priceNum\":10000,\"popular\":false},{\"id\":\"coin-150\",\"coins\":150,\"price\":\"Rp25.000\",\"priceNum\":25000,\"popular\":true},{\"id\":\"coin-350\",\"coins\":350,\"price\":\"Rp50.000\",\"priceNum\":50000,\"popular\":false},{\"id\":\"coin-750\",\"coins\":750,\"price\":\"Rp100.000\",\"priceNum\":100000,\"popular\":false}]'),
('premium_packages', '[{\"id\":\"prem-1m\",\"durationMonths\":1,\"name\":\"Paket 1 Bulan\",\"duration\":\"30 Hari\",\"price\":\"Rp15.000\",\"priceNum\":15000,\"highlight\":false},{\"id\":\"prem-3m\",\"durationMonths\":3,\"name\":\"Paket 3 Bulan\",\"duration\":\"90 Hari\",\"price\":\"Rp40.000\",\"priceNum\":40000,\"highlight\":true},{\"id\":\"prem-6m\",\"durationMonths\":6,\"name\":\"Paket 6 Bulan\",\"duration\":\"180 Hari\",\"price\":\"Rp75.000\",\"priceNum\":75000,\"highlight\":false},{\"id\":\"prem-12m\",\"durationMonths\":12,\"name\":\"Paket 12 Bulan (1 Tahun)\",\"duration\":\"365 Hari\",\"price\":\"Rp140.000\",\"priceNum\":140000,\"highlight\":false}]'),
('coin_unlock_price', '25'),
('saweria_url', 'https://saweria.co/nesianovel')
ON DUPLICATE KEY UPDATE `value`=VALUES(`value`);
