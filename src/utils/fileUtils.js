const fs = require('fs');
const path = require('path');

async function ensureDirectory(dirPath) {
  await fs.promises.mkdir(dirPath, { recursive: true });
}

/**
 * 파일명/경로 검증 및 정규화
 * - 허용: place/123_name_1.jpg, menu/123_name_uuid.jpg, 123_name_1.jpg
 * - 차단: ../../../etc/passwd, /etc/passwd (디렉토리 탈출 시도)
 */
function sanitizeFileName(fileName) {
  // 경로 정규화
  const normalized = path.normalize(fileName);

  // 디렉토리 탈출 시도 차단 (..)
  if (normalized.includes('..')) {
    const error = new Error('Invalid fileName provided: path traversal detected.');
    error.status = 400;
    throw error;
  }

  // 절대 경로 차단
  if (path.isAbsolute(normalized)) {
    const error = new Error('Invalid fileName provided: absolute path not allowed.');
    error.status = 400;
    throw error;
  }

  return normalized;
}

async function fileExists(filePath) {
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  ensureDirectory,
  sanitizeFileName,
  fileExists,
};
