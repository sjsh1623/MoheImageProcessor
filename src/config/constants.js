const path = require('path');

const PORT = process.env.PORT || 3000;

// 이미지 저장 경로: /Mohe/images (MoheImageProcessor 상위 디렉토리)
// 환경변수 IMAGES_DIR로 오버라이드 가능
const IMAGES_DIR = process.env.IMAGES_DIR || path.join(__dirname, '..', '..', '..', 'images');

module.exports = {
  PORT,
  IMAGES_DIR,
};
