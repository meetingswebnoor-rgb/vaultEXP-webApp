const multer = require('multer');

// Configure multer to use memory storage
const storage = multer.memoryStorage();

// File filter (optional, can be customized based on requirements)
const fileFilter = (req, file, cb) => {
  // Allow all files for now, or restrict based on user types
  cb(null, true);
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB max size
  },
  fileFilter: fileFilter,
});

module.exports = upload;
