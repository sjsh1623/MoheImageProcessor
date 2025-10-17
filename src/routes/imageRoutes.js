const express = require('express');

const {
  saveImageHandler,
  sendImageHandler,
  sendResizedImageHandler,
} = require('../controllers/imageController');

const router = express.Router();

router.post('/save', saveImageHandler);
router.get('/image/:fileName', sendImageHandler);
router.get('/image/:fileName/:width/:height', sendResizedImageHandler);

module.exports = router;
