const express = require('express');
const { uploadMiddleware } = require('../../middleware/upload.middleware');
const { protect } = require('../../middleware/auth.middleware');
const documentController   = require('./document.controller');
const {
  verifyDocumentOwnership,
  verifySignedToken,
  secureFileServe,
  downloadRateLimiter
} = require('../../middleware/documentSecurity.middleware');

const router = express.Router();

// All document routes require authentication
router.use(protect);

router.post(
  '/upload',
  uploadMiddleware.array('file', 10),
  documentController.uploadDocuments
);

/** @route GET /api/documents/search */
router.get('/search', documentController.searchDocuments);

// Folders
router.get('/folders', documentController.getFolders);
router.post('/folders', documentController.createFolder);

// Archive
router.put('/:id/archive', verifyDocumentOwnership, documentController.archiveDocument);

// AI Chat
router.post('/chat', documentController.chatWithDocuments);

/**
 * @route GET /api/documents/:id/signed-url
 * @desc Generate a short-lived signed download token for a document
 */
router.get(
  '/:id/signed-url',
  verifyDocumentOwnership,
  documentController.generateSignedUrl
);

/**
 * @route GET /api/documents/secure-download
 * @desc Serve a file via a signed token — no auth cookie required (CDN-ready)
 */
router.get(
  '/secure-download',
  downloadRateLimiter,
  verifySignedToken,
  secureFileServe
);

/**
 * @route POST /api/documents/admin/cleanup
 * @desc Admin-only: run orphan removal, duplicate detection, and storage report
 */
router.post('/admin/cleanup', documentController.runCleanup);

module.exports = router;

