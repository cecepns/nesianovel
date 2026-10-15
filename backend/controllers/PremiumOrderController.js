/* eslint-disable no-undef */
/* eslint-env node */
const db = require('../db');
const { deleteFile } = require('../utils/files');

const sanitizeLimit = (value, fallback = 10) => {
  const parsed = parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, 100);
};

const getStorePackages = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT \`key\`, \`value\` FROM settings 
       WHERE \`key\` IN ('coin_packages', 'premium_packages', 'saweria_url', 'coin_unlock_price')`
    );

    const config = {
      coin_packages: [
        { id: 'coin-50', coins: 50, price: 'Rp10.000', priceNum: 10000, popular: false },
        { id: 'coin-150', coins: 150, price: 'Rp25.000', priceNum: 25000, popular: true },
        { id: 'coin-350', coins: 350, price: 'Rp50.000', priceNum: 50000, popular: false },
        { id: 'coin-750', coins: 750, price: 'Rp100.000', priceNum: 100000, popular: false }
      ],
      premium_packages: [
        { id: 'prem-1m', durationMonths: 1, name: 'Paket 1 Bulan', duration: '30 Hari', price: 'Rp15.000', priceNum: 15000, highlight: false },
        { id: 'prem-3m', durationMonths: 3, name: 'Paket 3 Bulan', duration: '90 Hari', price: 'Rp40.000', priceNum: 40000, highlight: true },
        { id: 'prem-6m', durationMonths: 6, name: 'Paket 6 Bulan', duration: '180 Hari', price: 'Rp75.000', priceNum: 75000, highlight: false },
        { id: 'prem-12m', durationMonths: 12, name: 'Paket 12 Bulan (1 Tahun)', duration: '365 Hari', price: 'Rp140.000', priceNum: 140000, highlight: false }
      ],
      saweria_url: 'https://saweria.co/nesianovel',
      coin_unlock_price: 25,
    };

    for (const r of rows) {
      if (r.key === 'coin_packages' && r.value) {
        try { config.coin_packages = JSON.parse(r.value); } catch {}
      } else if (r.key === 'premium_packages' && r.value) {
        try { config.premium_packages = JSON.parse(r.value); } catch {}
      } else if (r.key === 'saweria_url' && r.value) {
        config.saweria_url = r.value;
      } else if (r.key === 'coin_unlock_price' && r.value) {
        config.coin_unlock_price = parseInt(r.value, 10) || 25;
      }
    }

    return res.json({ status: true, data: config });
  } catch (error) {
    console.error('Error fetching store packages:', error);
    return res.status(500).json({ status: false, error: 'Internal server error' });
  }
};

const updateStorePackages = async (req, res) => {
  try {
    const { coin_packages, premium_packages, saweria_url, coin_unlock_price } = req.body;

    if (coin_packages !== undefined) {
      const val = typeof coin_packages === 'string' ? coin_packages : JSON.stringify(coin_packages);
      await db.execute(
        `INSERT INTO settings (\`key\`, \`value\`) VALUES ('coin_packages', ?) ON DUPLICATE KEY UPDATE \`value\` = VALUES(\`value\`)`,
        [val]
      );
    }

    if (premium_packages !== undefined) {
      const val = typeof premium_packages === 'string' ? premium_packages : JSON.stringify(premium_packages);
      await db.execute(
        `INSERT INTO settings (\`key\`, \`value\`) VALUES ('premium_packages', ?) ON DUPLICATE KEY UPDATE \`value\` = VALUES(\`value\`)`,
        [val]
      );
    }

    if (saweria_url !== undefined) {
      await db.execute(
        `INSERT INTO settings (\`key\`, \`value\`) VALUES ('saweria_url', ?) ON DUPLICATE KEY UPDATE \`value\` = VALUES(\`value\`)`,
        [String(saweria_url).trim()]
      );
    }

    if (coin_unlock_price !== undefined) {
      await db.execute(
        `INSERT INTO settings (\`key\`, \`value\`) VALUES ('coin_unlock_price', ?) ON DUPLICATE KEY UPDATE \`value\` = VALUES(\`value\`)`,
        [String(coin_unlock_price).trim()]
      );
    }

    return res.json({ status: true, message: 'Pengaturan paket toko berhasil disimpan' });
  } catch (error) {
    console.error('Error updating store packages:', error);
    return res.status(500).json({ status: false, error: 'Internal server error' });
  }
};

const createOrder = async (req, res) => {
  try {
    const {
      username,
      package_id,
      package_name,
      package_price,
      order_type = 'premium',
      coins_amount = 0,
      duration_months = 0
    } = req.body || {};

    const usernameTrim = String(username || '').trim();
    const packageId = String(package_id || '').trim();
    const packageName = String(package_name || '').trim();
    const packagePrice = String(package_price || '').trim();
    const orderType = order_type === 'coins' ? 'coins' : 'premium';
    const coinsNum = parseInt(coins_amount, 10) || 0;
    const durationNum = parseInt(duration_months, 10) || 0;
    const proofImage = req.file ? `/uploads/${req.file.filename}` : null;

    if (!proofImage) {
      return res.status(400).json({ status: false, error: 'Bukti transfer wajib diupload' });
    }
    if (!usernameTrim) {
      return res.status(400).json({ status: false, error: 'Username akun wajib diisi' });
    }
    if (!packageId || !packageName) {
      return res.status(400).json({ status: false, error: 'Paket tidak valid' });
    }

    // Try finding user_id
    let userId = null;
    const [uRows] = await db.execute('SELECT id FROM users WHERE username = ?', [usernameTrim]);
    if (uRows.length > 0) {
      userId = uRows[0].id;
    }

    const [result] = await db.execute(
      `INSERT INTO premium_orders
        (username, user_id, package_id, order_type, package_name, package_price, coins_amount, duration_months, proof_image, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        usernameTrim.slice(0, 100),
        userId,
        packageId.slice(0, 50),
        orderType,
        packageName.slice(0, 120),
        packagePrice || null,
        coinsNum,
        durationNum,
        proofImage
      ]
    );

    return res.status(201).json({
      status: true,
      data: {
        id: result.insertId,
        payment_status: 'pending',
      },
      message: 'Pesanan berhasil dikirim dan sedang menunggu verifikasi admin.',
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ status: false, error: 'Internal server error' });
  }
};

const listOrders = async (req, res) => {
  try {
    const search = String(req.query.search || '').trim().toLowerCase();
    const orderTypeFilter = String(req.query.order_type || '').trim().toLowerCase();
    const statusFilter = String(req.query.status || '').trim().toLowerCase();
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = sanitizeLimit(req.query.limit, 15);
    const offset = (page - 1) * limit;

    const where = [];
    const params = [];
    if (search) {
      where.push('(LOWER(username) LIKE ? OR LOWER(package_name) LIKE ?)');
      const keyword = `%${search}%`;
      params.push(keyword, keyword);
    }
    if (orderTypeFilter && ['premium', 'coins'].includes(orderTypeFilter)) {
      where.push('order_type = ?');
      params.push(orderTypeFilter);
    }
    if (statusFilter && ['pending', 'sukses'].includes(statusFilter)) {
      where.push('payment_status = ?');
      params.push(statusFilter);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [[countRow]] = await db.execute(
      `SELECT COUNT(*) AS total
       FROM premium_orders
       ${whereSql}`,
      params
    );

    const [rows] = await db.query(
      `SELECT id, username, user_id, package_id, order_type, package_name, package_price, coins_amount, duration_months, proof_image, payment_status, created_at
       FROM premium_orders
       ${whereSql}
       ORDER BY id DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return res.json({
      status: true,
      data: {
        items: rows,
        pagination: {
          page,
          limit,
          total: Number(countRow?.total || 0),
        },
      },
    });
  } catch (error) {
    console.error('Error listing orders:', error);
    return res.status(500).json({ status: false, error: 'Internal server error' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    const paymentStatus = String(req.body?.payment_status || '').trim().toLowerCase();
    if (!Number.isFinite(orderId)) {
      return res.status(400).json({ status: false, error: 'ID order tidak valid' });
    }
    if (!['pending', 'sukses'].includes(paymentStatus)) {
      return res.status(400).json({ status: false, error: 'Status pembayaran tidak valid' });
    }

    const [orders] = await db.execute('SELECT * FROM premium_orders WHERE id = ?', [orderId]);
    if (orders.length === 0) {
      return res.status(404).json({ status: false, error: 'Order tidak ditemukan' });
    }

    const order = orders[0];
    const previousStatus = order.payment_status;

    // Apply fulfillment when changing to 'sukses'
    if (previousStatus !== 'sukses' && paymentStatus === 'sukses') {
      const [users] = await db.execute(
        `SELECT id, points, is_membership, membership_expires_at FROM users WHERE username = ?`,
        [order.username]
      );

      if (users.length > 0) {
        const u = users[0];
        if (order.order_type === 'coins' && order.coins_amount > 0) {
          await db.execute('UPDATE users SET points = points + ? WHERE id = ?', [order.coins_amount, u.id]);
        } else if (order.order_type === 'premium') {
          const durationMonths = order.duration_months > 0 ? order.duration_months : 1;
          const isCurrentlyActive = u.is_membership === 1 && u.membership_expires_at && new Date(u.membership_expires_at) > new Date();

          if (isCurrentlyActive) {
            await db.execute(
              `UPDATE users SET 
                 is_membership = 1, 
                 membership_expires_at = DATE_ADD(membership_expires_at, INTERVAL ? MONTH) 
               WHERE id = ?`,
              [durationMonths, u.id]
            );
          } else {
            await db.execute(
              `UPDATE users SET 
                 is_membership = 1, 
                 membership_expires_at = DATE_ADD(NOW(), INTERVAL ? MONTH) 
               WHERE id = ?`,
              [durationMonths, u.id]
            );
          }
        }
      }
    }

    await db.execute('UPDATE premium_orders SET payment_status = ? WHERE id = ?', [paymentStatus, orderId]);

    return res.json({ status: true, message: 'Status pembayaran berhasil diperbarui' });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ status: false, error: 'Internal server error' });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    if (!Number.isFinite(orderId)) {
      return res.status(400).json({ status: false, error: 'ID order tidak valid' });
    }

    const [rows] = await db.execute('SELECT id, proof_image FROM premium_orders WHERE id = ?', [orderId]);
    if (rows.length === 0) {
      return res.status(404).json({ status: false, error: 'Order tidak ditemukan' });
    }

    await db.execute('DELETE FROM premium_orders WHERE id = ?', [orderId]);
    deleteFile(rows[0].proof_image);

    return res.json({ status: true, message: 'Order berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return res.status(500).json({ status: false, error: 'Internal server error' });
  }
};

// Rekap Bulanan Pembelian Chapter Menggunakan Koin
const getCoinPurchasesRecap = async (req, res) => {
  try {
    const targetMonth = String(req.query.month || '').trim(); // Format: YYYY-MM
    const search = String(req.query.search || '').trim().toLowerCase();
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = sanitizeLimit(req.query.limit, 20);
    const offset = (page - 1) * limit;

    // Available months list
    const [monthRows] = await db.execute(`
      SELECT DISTINCT DATE_FORMAT(created_at, '%Y-%m') AS ym, DATE_FORMAT(created_at, '%M %Y') AS label
      FROM user_unlocked_chapters
      ORDER BY ym DESC
    `);

    const selectedMonth = targetMonth || (monthRows[0]?.ym || new Date().toISOString().slice(0, 7));

    // Stats for the month
    const [[statsRow]] = await db.execute(
      `SELECT 
        COUNT(*) AS total_transactions,
        COALESCE(SUM(coins_spent), 0) AS total_coins_spent,
        COUNT(DISTINCT user_id) AS unique_readers,
        COUNT(DISTINCT chapter_id) AS unique_chapters
       FROM user_unlocked_chapters
       WHERE DATE_FORMAT(created_at, '%Y-%m') = ?`,
      [selectedMonth]
    );

    const where = ['DATE_FORMAT(uuc.created_at, "%Y-%m") = ?'];
    const params = [selectedMonth];

    if (search) {
      where.push('(LOWER(u.username) LIKE ? OR LOWER(m.title) LIKE ? OR LOWER(c.title) LIKE ?)');
      const kw = `%${search}%`;
      params.push(kw, kw, kw);
    }

    const whereSql = `WHERE ${where.join(' AND ')}`;

    const [[countRow]] = await db.execute(
      `SELECT COUNT(*) AS total
       FROM user_unlocked_chapters uuc
       JOIN users u ON uuc.user_id = u.id
       JOIN chapters c ON uuc.chapter_id = c.id
       JOIN manga m ON c.manga_id = m.id
       ${whereSql}`,
      params
    );

    const [items] = await db.query(
      `SELECT 
        uuc.id,
        uuc.coins_spent,
        uuc.created_at,
        u.id AS user_id,
        u.username,
        u.name AS user_name,
        c.id AS chapter_id,
        c.chapter_number,
        c.title AS chapter_title,
        c.slug AS chapter_slug,
        m.id AS novel_id,
        m.title AS novel_title,
        m.slug AS novel_slug
       FROM user_unlocked_chapters uuc
       JOIN users u ON uuc.user_id = u.id
       JOIN chapters c ON uuc.chapter_id = c.id
       JOIN manga m ON c.manga_id = m.id
       ${whereSql}
       ORDER BY uuc.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // Top novels unlocked with coins in this month
    const [topNovels] = await db.execute(
      `SELECT 
        m.id,
        m.title,
        m.slug,
        m.thumbnail,
        COUNT(*) AS unlock_count,
        SUM(uuc.coins_spent) AS coins_total
       FROM user_unlocked_chapters uuc
       JOIN chapters c ON uuc.chapter_id = c.id
       JOIN manga m ON c.manga_id = m.id
       WHERE DATE_FORMAT(uuc.created_at, '%Y-%m') = ?
       GROUP BY m.id
       ORDER BY unlock_count DESC
       LIMIT 5`,
      [selectedMonth]
    );

    return res.json({
      status: true,
      data: {
        selected_month: selectedMonth,
        available_months: monthRows,
        stats: {
          total_transactions: Number(statsRow?.total_transactions || 0),
          total_coins_spent: Number(statsRow?.total_coins_spent || 0),
          unique_readers: Number(statsRow?.unique_readers || 0),
          unique_chapters: Number(statsRow?.unique_chapters || 0),
        },
        top_novels: topNovels,
        items,
        pagination: {
          page,
          limit,
          total: Number(countRow?.total || 0),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching coin recap:', error);
    return res.status(500).json({ status: false, error: 'Internal server error' });
  }
};

module.exports = {
  getStorePackages,
  updateStorePackages,
  createOrder,
  listOrders,
  updateOrderStatus,
  deleteOrder,
  getCoinPurchasesRecap,
};
