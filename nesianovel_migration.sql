-- ==============================================================================
-- NESIANOVEL COMPLETE DATABASE MIGRATION SCRIPT
-- Tanggal: 17 Oktober 2026
-- Deskripsi: Menambahkan seluruh tabel, kolom, index, dan setting default untuk
--            fitur NesiaNovel (Novel chapters, Koin terpisah, Order email & koin,
--            Announcements, Unlocked chapters, Pinned series).
-- Kompatibel: MySQL 5.7+, MySQL 8.0+, MariaDB, phpMyAdmin
-- Aman dijalankan berulang kali (Idempotent / tidak akan menduplikasi data/kolom)
-- ==============================================================================

-- 1. Helper Stored Procedure agar penambahan kolom aman di semua versi MySQL
DELIMITER $$
DROP PROCEDURE IF EXISTS AddColumnIfNotExists $$
CREATE PROCEDURE AddColumnIfNotExists(
    IN tableName VARCHAR(64),
    IN colName VARCHAR(64),
    IN colDef TEXT
)
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = tableName
          AND COLUMN_NAME = colName
    ) THEN
        SET @sql = CONCAT('ALTER TABLE `', tableName, '` ADD COLUMN `', colName, '` ', colDef);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END $$
DELIMITER ;

-- ==============================================================================
-- 2. PERUBAHAN TABEL: chapters
--    - content: Menyimpan isi teks cerita novel
--    - coin_price: Biaya koin untuk membuka chapter (default: 25)
--    - is_locked: Penanda chapter terkunci (koin/VIP)
-- ==============================================================================
CALL AddColumnIfNotExists('chapters', 'content', 'LONGTEXT NULL AFTER `cover`');
CALL AddColumnIfNotExists('chapters', 'coin_price', 'INT NOT NULL DEFAULT 25 AFTER `content`');
CALL AddColumnIfNotExists('chapters', 'is_locked', 'TINYINT(1) NOT NULL DEFAULT 0 AFTER `coin_price`');

-- ==============================================================================
-- 3. PERUBAHAN TABEL: manga
--    - is_pinned: Penanda series yang disematkan untuk slider PINNED SERIES di homepage
-- ==============================================================================
CALL AddColumnIfNotExists('manga', 'is_pinned', 'TINYINT(1) NOT NULL DEFAULT 0 AFTER `is_project`');


-- ==============================================================================
-- 4. PERUBAHAN TABEL: users
--    - coins: Koin pengguna yang terpisah dari EXP / Points level membaca
-- ==============================================================================
CALL AddColumnIfNotExists('users', 'coins', 'INT NOT NULL DEFAULT 0 AFTER `points`');
UPDATE users SET coins = points WHERE coins = 0 AND points > 0;

-- ==============================================================================
-- 5. PERUBAHAN TABEL: premium_orders
--    - order_type: Tipe order ('premium' untuk VIP member, 'coins' untuk paket koin)
--    - coins_amount: Jumlah koin jika order paket koin
--    - duration_months: Durasi bulan jika order VIP
--    - user_id: ID pengguna yang memesan
--    - email: Email pemesan untuk verifikasi Saweria
-- ==============================================================================
CALL AddColumnIfNotExists('premium_orders', 'order_type', "ENUM('premium', 'coins') NOT NULL DEFAULT 'premium' AFTER `package_id`");
CALL AddColumnIfNotExists('premium_orders', 'coins_amount', 'INT NOT NULL DEFAULT 0 AFTER `package_price`');
CALL AddColumnIfNotExists('premium_orders', 'duration_months', 'INT NOT NULL DEFAULT 0 AFTER `coins_amount`');
CALL AddColumnIfNotExists('premium_orders', 'user_id', 'INT NULL AFTER `username`');
CALL AddColumnIfNotExists('premium_orders', 'email', 'VARCHAR(255) NULL AFTER `username`');

-- Backfill email order lama jika masih kosong
UPDATE premium_orders po 
JOIN users u ON (po.user_id = u.id OR po.username COLLATE utf8mb4_unicode_ci = u.username COLLATE utf8mb4_unicode_ci) 
SET po.email = u.email 
WHERE po.email IS NULL AND u.email IS NOT NULL;

-- ==============================================================================
-- 6. TABEL BARU: user_unlocked_chapters
--    Mencatat riwayat pembukaan chapter berbayar oleh pengguna menggunakan koin
-- ==============================================================================
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

-- ==============================================================================
-- 7. TABEL BARU: announcements
--    Menyimpan data pengumuman sistem/banner untuk homepage & notifikasi
-- ==============================================================================
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

-- ==============================================================================
-- 8. DATA AWAL: Pengumuman Panduan Pembayaran Saweria
-- ==============================================================================
INSERT INTO announcements (title, slug, excerpt, content, is_pinned, is_published)
VALUES (
  'Panduan Pembayaran Koin & Premium Melalui Saweria',
  'panduan-pembayaran-saweria',
  'Cara mudah top-up koin dan aktivasi member VIP Premium NesiaNovel melalui Saweria.',
  '<h3>Cara Top-up Koin & VIP Premium NesiaNovel Lewat Saweria</h3><ol><li>Pilih paket Koin atau VIP Premium yang kamu inginkan di halaman <strong>Store</strong>.</li><li>Klik tombol <strong>Beli Sekarang</strong> dan catat nominal pembayarannya.</li><li>Buka link Saweria resmi NesiaNovel di <a href=\"https://saweria.co/nesianovel\" target=\"_blank\" rel=\"noopener noreferrer\">saweria.co/nesianovel</a>.</li><li>Masukkan nominal sesuai harga paket yang dipilih, dan cantumkan <strong>Username Akun NesiaNovel</strong> kamu di kolom pesan/catatan Saweria.</li><li>Pilih metode pembayaran (QRIS, GoPay, OVO, DANA, LinkAja, dsb) lalu selesaikan pembayaran.</li><li>Screenshot atau simpan bukti transaksi/pembayaran berhasil.</li><li>Upload bukti screenshot di form konfirmasi Store NesiaNovel.</li><li>Admin akan memverifikasi dan koin / status VIP kamu akan aktif dalam waktu 5-15 menit!</li></ol><p>Jika ada kendala, hubungi kami via menu Kontak atau Discord komunitas kami.</p>',
  1,
  1
) ON DUPLICATE KEY UPDATE title = VALUES(title);

-- ==============================================================================
-- 9. DATA AWAL: Pengaturan Paket Koin, VIP, & Saweria di tabel settings
-- ==============================================================================
INSERT INTO settings (`key`, `value`) VALUES
('coin_packages', '[{\"id\":\"coin-50\",\"coins\":50,\"price\":\"Rp10.000\",\"priceNum\":10000,\"popular\":false},{\"id\":\"coin-150\",\"coins\":150,\"price\":\"Rp25.000\",\"priceNum\":25000,\"popular\":true},{\"id\":\"coin-350\",\"coins\":350,\"price\":\"Rp50.000\",\"priceNum\":50000,\"popular\":false},{\"id\":\"coin-750\",\"coins\":750,\"price\":\"Rp100.000\",\"priceNum\":100000,\"popular\":false}]'),
('premium_packages', '[{\"id\":\"prem-1m\",\"durationMonths\":1,\"name\":\"Paket 1 Bulan\",\"duration\":\"30 Hari\",\"price\":\"Rp15.000\",\"priceNum\":15000,\"highlight\":false},{\"id\":\"prem-3m\",\"durationMonths\":3,\"name\":\"Paket 3 Bulan\",\"duration\":\"90 Hari\",\"price\":\"Rp40.000\",\"priceNum\":40000,\"highlight\":true},{\"id\":\"prem-6m\",\"durationMonths\":6,\"name\":\"Paket 6 Bulan\",\"duration\":\"180 Hari\",\"price\":\"Rp75.000\",\"priceNum\":75000,\"highlight\":false},{\"id\":\"prem-12m\",\"durationMonths\":12,\"name\":\"Paket 12 Bulan (1 Tahun)\",\"duration\":\"365 Hari\",\"price\":\"Rp140.000\",\"priceNum\":140000,\"highlight\":false}]'),
('coin_unlock_price', '25'),
('saweria_url', 'https://saweria.co/nesianovel')
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

-- ==============================================================================
-- 10. CLEANUP: Hapus temporary procedure
-- ==============================================================================
DROP PROCEDURE IF EXISTS AddColumnIfNotExists;
