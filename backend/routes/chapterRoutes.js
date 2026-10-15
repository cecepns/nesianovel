const router = require('express').Router();

const { authenticateToken, optionalAuthenticate } = require('../middlewares/auth');
const requireAdmin = require('../middlewares/requireAdmin');
const { upload } = require('../middlewares/upload');
const ChapterController = require('../controllers/ChapterController');
const ChapterScheduleController = require('../controllers/ChapterScheduleController');

// Jadwal rilis mingguan (harus sebelum /:chapterId agar tidak bentrok)
router.get('/schedule', ChapterScheduleController.getSchedule);

// Detail chapter by novel slug and chapter slug (/api/chapters/novel/:novelSlug/:chapterSlug)
router.get('/novel/:novelSlug/:chapterSlug', optionalAuthenticate, ChapterController.showByNovelAndChapter);

// Detail chapter by slug
router.get('/slug/:slug', optionalAuthenticate, ChapterController.showBySlug);
router.get('/slug/:slug/download', ChapterController.downloadBySlug);

// Unlock chapter using coins
router.post('/slug/:slug/unlock-coin', authenticateToken, ChapterController.unlockWithCoins);
router.post('/:id/unlock-coin', authenticateToken, ChapterController.unlockWithCoins);

// Admin get chapter by id
router.get('/admin/:id', authenticateToken, requireAdmin, ChapterController.showById);

// Chapter CRUD for admin
router.put(
  '/:id',
  authenticateToken,
  requireAdmin,
  upload.single('cover'),
  ChapterController.update
);
router.delete('/:id', authenticateToken, requireAdmin, ChapterController.destroy);

// Chapter images management (mounted at /api/chapters)
router.get('/:chapterId/images', authenticateToken, requireAdmin, ChapterController.listImages);
router.post(
  '/:chapterId/images',
  authenticateToken,
  requireAdmin,
  upload.array('images', 200),
  ChapterController.uploadImages
);
router.delete(
  '/:chapterId/images/:imageId',
  authenticateToken,
  requireAdmin,
  ChapterController.deleteImage
);
router.put(
  '/:chapterId/images/reorder',
  authenticateToken,
  requireAdmin,
  ChapterController.reorderImages
);

module.exports = router;
