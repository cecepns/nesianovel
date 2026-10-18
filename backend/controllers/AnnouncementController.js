const db = require('../db');
const { sanitizeHtmlForStorage } = require('../utils/s3Upload');

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const listPublic = async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 50);
    const [rows] = await db.query(
      `SELECT id, title, slug, excerpt, banner_image, is_pinned, created_at 
       FROM announcements 
       WHERE is_published = 1 
       ORDER BY is_pinned DESC, id DESC 
       LIMIT ${limit}`
    );
    res.json({ status: true, data: rows });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ status: false, error: 'Internal server error' });
  }
};

const getBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const [rows] = await db.execute(
      `SELECT id, title, slug, excerpt, content, banner_image, is_pinned, created_at, updated_at 
       FROM announcements 
       WHERE slug = ? AND is_published = 1`,
      [slug]
    );

    if (rows.length === 0) {
      return res.status(404).json({ status: false, error: 'Pengumuman tidak ditemukan' });
    }

    res.json({ status: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching announcement by slug:', error);
    res.status(500).json({ status: false, error: 'Internal server error' });
  }
};

const listAdmin = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, title, slug, excerpt, banner_image, is_pinned, is_published, created_at, updated_at 
       FROM announcements 
       ORDER BY id DESC`
    );
    res.json({ status: true, data: rows });
  } catch (error) {
    console.error('Error fetching admin announcements:', error);
    res.status(500).json({ status: false, error: 'Internal server error' });
  }
};

const create = async (req, res) => {
  try {
    const { title, slug, content, excerpt, is_pinned, is_published } = req.body;
    if (!title || !content) {
      return res.status(400).json({ status: false, error: 'Judul dan konten wajib diisi' });
    }

    let finalSlug = slug ? slugify(slug) : slugify(title);
    if (!finalSlug) {
      finalSlug = `announcement-${Date.now()}`;
    }

    // Check slug collision
    const [exists] = await db.execute('SELECT id FROM announcements WHERE slug = ?', [finalSlug]);
    if (exists.length > 0) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    const cleanContent = await sanitizeHtmlForStorage(content);
    const bannerImage = req.file ? `/uploads/${req.file.filename}` : (req.body.banner_image || null);
    const excerptText = excerpt || (cleanContent.replace(/<[^>]*>?/gm, '').slice(0, 160) + '...');
    const isPinned = is_pinned === true || is_pinned === '1' || is_pinned === 1 ? 1 : 0;
    const isPublished = is_published === false || is_published === '0' || is_published === 0 ? 0 : 1;

    const [result] = await db.execute(
      `INSERT INTO announcements (title, slug, content, excerpt, banner_image, is_pinned, is_published)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, finalSlug, cleanContent, excerptText, bannerImage, isPinned, isPublished]
    );

    res.status(201).json({
      status: true,
      message: 'Pengumuman berhasil dibuat',
      data: { id: result.insertId, slug: finalSlug }
    });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ status: false, error: 'Internal server error' });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, content, excerpt, is_pinned, is_published } = req.body;

    const [rows] = await db.execute('SELECT id, banner_image FROM announcements WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ status: false, error: 'Pengumuman tidak ditemukan' });
    }

    let finalSlug = slug ? slugify(slug) : undefined;
    const cleanContent = content !== undefined ? await sanitizeHtmlForStorage(content) : undefined;
    const bannerImage = req.file ? `/uploads/${req.file.filename}` : (req.body.banner_image !== undefined ? req.body.banner_image : rows[0].banner_image);
    const excerptText = excerpt !== undefined ? excerpt : (cleanContent ? cleanContent.replace(/<[^>]*>?/gm, '').slice(0, 160) + '...' : undefined);
    const isPinned = is_pinned !== undefined ? (is_pinned === true || is_pinned === '1' || is_pinned === 1 ? 1 : 0) : undefined;
    const isPublished = is_published !== undefined ? (is_published === false || is_published === '0' || is_published === 0 ? 0 : 1) : undefined;

    await db.execute(
      `UPDATE announcements SET
        title = COALESCE(?, title),
        slug = COALESCE(?, slug),
        content = COALESCE(?, content),
        excerpt = COALESCE(?, excerpt),
        banner_image = ?,
        is_pinned = COALESCE(?, is_pinned),
        is_published = COALESCE(?, is_published)
       WHERE id = ?`,
      [title, finalSlug, cleanContent, excerptText, bannerImage, isPinned, isPublished, id]
    );

    res.json({ status: true, message: 'Pengumuman berhasil diperbarui' });
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ status: false, error: 'Internal server error' });
  }
};

const destroy = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute('DELETE FROM announcements WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, error: 'Pengumuman tidak ditemukan' });
    }
    res.json({ status: true, message: 'Pengumuman berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ status: false, error: 'Internal server error' });
  }
};

module.exports = {
  listPublic,
  getBySlug,
  listAdmin,
  create,
  update,
  destroy,
};
