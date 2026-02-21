const express = require('express');
const multer = require('multer');
const path = require('path');
const os = require('os');

const {
  saveImageHandler,
  uploadImageHandler,
  sendImageHandler,
  sendResizedImageHandler,
} = require('../controllers/imageController');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: path.join(os.tmpdir(), 'mohe-uploads'),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

router.post('/save', saveImageHandler);
router.post('/upload', upload.single('image'), uploadImageHandler);

// Support subdirectory paths: /image/place/filename.jpg, /image/menu/filename.jpg
router.get('/image/:subdir/:fileName', sendImageHandler);
router.get('/image/:subdir/:fileName/:width/:height', sendResizedImageHandler);

// Keep flat path support for backward compatibility
router.get('/image/:fileName', sendImageHandler);
router.get('/image/:fileName/:width/:height', sendResizedImageHandler);

module.exports = router;
