const router = require('express').Router();

const ComicController = require('../controllers/ComicController');

const detailBySlug =
  typeof ComicController?.detailBySlug === 'function'
    ? ComicController.detailBySlug
    : typeof ComicController?.default?.detailBySlug === 'function'
      ? ComicController.default.detailBySlug
      : (req, res) => res.status(503).json({ status: false, error: 'ComicController detailBySlug not loaded' });

const incrementView =
  typeof ComicController?.incrementView === 'function'
    ? ComicController.incrementView
    : typeof ComicController?.default?.incrementView === 'function'
      ? ComicController.default.incrementView
      : (req, res) => res.status(503).json({ status: false, error: 'ComicController incrementView not loaded' });

// GET /api/comic/:slug
router.get('/:slug', detailBySlug);

// POST /api/comic/:slug/view
router.post('/:slug/view', incrementView);

module.exports = router;


