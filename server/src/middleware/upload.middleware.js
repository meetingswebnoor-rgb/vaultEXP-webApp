const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Allowed MIME types and their extensions
const ALLOWED_MIME_TYPES = {
  'application/pdf': ['.pdf'],
  'application/x-pdf': ['.pdf'],
  'application/vnd.pdf': ['.pdf'],
  'application/octet-stream': ['.pdf', '.docx', '.xlsx', '.png', '.jpg', '.jpeg', '.csv', '.txt'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/jpg': ['.jpg', '.jpeg'],
  'text/csv': ['.csv'],
  'text/plain': ['.txt']
};

const BLOCKED_EXTENSIONS = ['.exe', '.bat', '.sh', '.js', '.mjs', '.vbs', '.scr', '.cmd'];

// Max size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      // Use process.cwd() to ensure we are relative to the server root
      const userId = req.user?.id || 'anonymous';
      const uploadPath = path.join(process.cwd(), 'uploads/documents', userId);

      console.log(`[MULTER] Resolving destination for user ${userId}: ${uploadPath}`);

      // Ensure directory exists
      if (!fs.existsSync(uploadPath)) {
        console.log(`[MULTER] Creating directory: ${uploadPath}`);
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      
      cb(null, uploadPath);
    } catch (err) {
      console.error(`[MULTER] Destination Error:`, err);
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const uniqueId = crypto.randomUUID();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueId}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  console.log(`[MULTER] Filtering file: ${file.originalname} (${file.mimetype}) extension: ${ext}`);

  // 1. Block dangerous extensions immediately
  if (BLOCKED_EXTENSIONS.includes(ext)) {
    console.warn(`[MULTER] Blocked dangerous extension: ${ext}`);
    return cb(new Error('Dangerous file types are strictly prohibited.'), false);
  }

  // 2. Validate MIME type
  const allowedExtensions = ALLOWED_MIME_TYPES[file.mimetype];
  if (!allowedExtensions) {
    console.warn(`[MULTER] MIME type not allowed: ${file.mimetype}`);
    // If it's a PDF but the browser sent something weird, we could be more lenient
    // but for now let's keep it strict and see the logs.
    return cb(new Error(`Invalid file format (${file.mimetype}). Please upload allowed document types only.`), false);
  }

  // 3. Double check extension matches MIME type
  if (!allowedExtensions.includes(ext)) {
    console.warn(`[MULTER] Extension mismatch: ${ext} not allowed for ${file.mimetype}`);
    return cb(new Error('File extension does not match content type.'), false);
  }

  console.log(`[MULTER] File accepted: ${file.originalname}`);
  cb(null, true);
};

const uploadMiddleware = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10 // Max 10 files per request
  }
});

module.exports = {
  uploadMiddleware
};
