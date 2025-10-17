const path = require('path');

const PORT = process.env.PORT || 3000;
const IMAGES_DIR = path.join(__dirname, '..', '..', 'images');

module.exports = {
  PORT,
  IMAGES_DIR,
};
