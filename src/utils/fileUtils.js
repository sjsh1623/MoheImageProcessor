const fs = require('fs');
const path = require('path');

async function ensureDirectory(dirPath) {
  await fs.promises.mkdir(dirPath, { recursive: true });
}

function sanitizeFileName(fileName) {
  const baseName = path.basename(fileName);
  if (baseName !== fileName) {
    const error = new Error('Invalid fileName provided.');
    error.status = 400;
    throw error;
  }

  return baseName;
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
