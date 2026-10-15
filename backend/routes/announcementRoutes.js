const router = require('express').Router();
const { authenticateToken } = require('../middlewares/auth');
const requireAdmin = require('../middlewares/requireAdmin');
const { upload } = require('../middlewares/upload');
const AnnouncementController = require('../controllers/AnnouncementController');

// Public
router.get('/', AnnouncementController.listPublic);
router.get('/:slug', AnnouncementController.getBySlug);

// Admin
router.get('/admin/all', authenticateToken, requireAdmin, AnnouncementController.listAdmin);
router.post('/admin/create', authenticateToken, requireAdmin, upload.single('banner_image'), AnnouncementController.create);
router.put('/admin/:id', authenticateToken, requireAdmin, upload.single('banner_image'), AnnouncementController.update);
router.delete('/admin/:id', authenticateToken, requireAdmin, AnnouncementController.destroy);

module.exports = router;
