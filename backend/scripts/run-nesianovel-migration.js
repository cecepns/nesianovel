const db = require('../db');

async function ensureColumn(table, column, def) {
  const [cols] = await db.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  if (cols.length === 0) {
    console.log(`Adding ${column} to ${table}...`);
    await db.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${def}`);
  } else {
    console.log(`Column ${column} in ${table} already exists.`);
  }
}

async function run() {
  try {
    console.log('Running NesiaNovel schema migrations...');

    // 1. Chapters
    await ensureColumn('chapters', 'content', 'LONGTEXT NULL AFTER `cover`');
    await ensureColumn('chapters', 'coin_price', 'INT NOT NULL DEFAULT 25 AFTER `content`');
    await ensureColumn('chapters', 'is_locked', 'TINYINT(1) NOT NULL DEFAULT 0 AFTER `coin_price`');

    // 2. Manga
    await ensureColumn('manga', 'is_pinned', 'TINYINT(1) NOT NULL DEFAULT 0 AFTER `is_project`');
    await db.query(`UPDATE manga SET is_pinned = is_project WHERE is_project = 1`);

    // 3. User Unlocked Chapters
    await db.query(`
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
    `);

    // 4. Announcements
    await db.query(`
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
    `);

    // 5. Premium Orders
    await ensureColumn('premium_orders', 'order_type', "ENUM('premium', 'coins') NOT NULL DEFAULT 'premium' AFTER `package_id`");
    await ensureColumn('premium_orders', 'coins_amount', 'INT NOT NULL DEFAULT 0 AFTER `package_price`');
    await ensureColumn('premium_orders', 'duration_months', 'INT NOT NULL DEFAULT 0 AFTER `coins_amount`');
    await ensureColumn('premium_orders', 'user_id', 'INT NULL AFTER `username`');

    // 6. Default announcement
    const [existingAnn] = await db.query('SELECT id FROM announcements WHERE slug = ?', ['panduan-pembayaran-saweria']);
    if (existingAnn.length === 0) {
      await db.query(`
        INSERT INTO announcements (title, slug, excerpt, content, is_pinned, is_published)
        VALUES (?, ?, ?, ?, 1, 1)
      `, [
        'Panduan Pembayaran Koin & Premium Melalui Saweria',
        'panduan-pembayaran-saweria',
        'Cara mudah top-up koin dan aktivasi member VIP Premium NesiaNovel melalui Saweria.',
        '<h3>Cara Top-up Koin & VIP Premium NesiaNovel Lewat Saweria</h3><ol><li>Pilih paket Koin atau VIP Premium yang kamu inginkan di halaman <strong>Store</strong>.</li><li>Klik tombol <strong>Beli Sekarang</strong> dan catat nominal pembayarannya.</li><li>Buka link Saweria resmi NesiaNovel di <a href="https://saweria.co/nesianovel" target="_blank" rel="noopener noreferrer">saweria.co/nesianovel</a>.</li><li>Masukkan nominal sesuai harga paket yang dipilih, dan cantumkan <strong>Username Akun NesiaNovel</strong> kamu di kolom pesan/catatan Saweria.</li><li>Pilih metode pembayaran (QRIS, GoPay, OVO, DANA, LinkAja, dsb) lalu selesaikan pembayaran.</li><li>Screenshot atau simpan bukti transaksi/pembayaran berhasil.</li><li>Upload bukti screenshot di form konfirmasi Store NesiaNovel.</li><li>Admin akan memverifikasi dan koin / status VIP kamu akan aktif dalam waktu 5-15 menit!</li></ol><p>Jika ada kendala, hubungi kami via menu Kontak atau Discord komunitas kami.</p>'
      ]);
    }

    // 7. Settings
    const defaultSettings = [
      {
        key: 'coin_packages',
        val: JSON.stringify([
          { id: 'coin-50', coins: 50, price: 'Rp10.000', priceNum: 10000, popular: false },
          { id: 'coin-150', coins: 150, price: 'Rp25.000', priceNum: 25000, popular: true },
          { id: 'coin-350', coins: 350, price: 'Rp50.000', priceNum: 50000, popular: false },
          { id: 'coin-750', coins: 750, price: 'Rp100.000', priceNum: 100000, popular: false }
        ])
      },
      {
        key: 'premium_packages',
        val: JSON.stringify([
          { id: 'prem-1m', durationMonths: 1, name: 'Paket 1 Bulan', duration: '30 Hari', price: 'Rp15.000', priceNum: 15000, highlight: false },
          { id: 'prem-3m', durationMonths: 3, name: 'Paket 3 Bulan', duration: '90 Hari', price: 'Rp40.000', priceNum: 40000, highlight: true },
          { id: 'prem-6m', durationMonths: 6, name: 'Paket 6 Bulan', duration: '180 Hari', price: 'Rp75.000', priceNum: 75000, highlight: false },
          { id: 'prem-12m', durationMonths: 12, name: 'Paket 12 Bulan (1 Tahun)', duration: '365 Hari', price: 'Rp140.000', priceNum: 140000, highlight: false }
        ])
      },
      { key: 'coin_unlock_price', val: '25' },
      { key: 'saweria_url', val: 'https://saweria.co/nesianovel' }
    ];

    for (const item of defaultSettings) {
      await db.query(
        `INSERT INTO settings (\`key\`, \`value\`) VALUES (?, ?) ON DUPLICATE KEY UPDATE \`value\` = VALUES(\`value\`)`,
        [item.key, item.val]
      );
    }

    console.log('NesiaNovel schema migrations completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

run();
