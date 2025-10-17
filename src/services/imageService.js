const axios = require('axios');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const mime = require('mime-types');
const { pipeline } = require('stream/promises');

const { IMAGES_DIR } = require('../config/constants');
const { ensureDirectory, sanitizeFileName, fileExists } = require('../utils/fileUtils');

function createHttpError(status, message, cause) {
  const error = new Error(message);
  error.status = status;
  if (cause) {
    error.cause = cause;
  }
  return error;
}

async function ensureImagesDirectory() {
  await ensureDirectory(IMAGES_DIR);
}

async function saveImage(url, fileName) {
  const safeFileName = sanitizeFileName(fileName);
  await ensureImagesDirectory();
  const targetPath = path.join(IMAGES_DIR, safeFileName);

  try {
    const response = await axios.get(url, { responseType: 'stream' });
    await pipeline(response.data, fs.createWriteStream(targetPath));
  } catch (error) {
    if (error.response?.status) {
      throw createHttpError(
        502,
        `Failed to download image. Remote server responded with ${error.response.status}.`,
        error,
      );
    }

    throw createHttpError(500, 'Failed to save image.', error);
  }

  return { fileName: safeFileName, targetPath };
}

async function resolveImagePath(fileName) {
  const safeFileName = sanitizeFileName(fileName);
  const targetPath = path.join(IMAGES_DIR, safeFileName);

  if (!(await fileExists(targetPath))) {
    throw createHttpError(404, 'Image not found.');
  }

  return { targetPath, safeFileName };
}

async function getImagePath(fileName) {
  return resolveImagePath(fileName);
}

async function getResizedImage(fileName, width, height) {
  const parsedWidth = Number.parseInt(width, 10);
  const parsedHeight = Number.parseInt(height, 10);

  if (
    Number.isNaN(parsedWidth)
    || Number.isNaN(parsedHeight)
    || parsedWidth <= 0
    || parsedHeight <= 0
  ) {
    throw createHttpError(400, 'Width and height must be positive integers.');
  }

  const { targetPath } = await resolveImagePath(fileName);

  try {
    const buffer = await sharp(targetPath)
      .resize(parsedWidth, parsedHeight, { fit: sharp.fit.cover })
      .toBuffer();

    const mimeType = mime.lookup(targetPath) || 'application/octet-stream';
    return { buffer, mimeType };
  } catch (error) {
    throw createHttpError(500, 'Failed to resize image.', error);
  }
}

module.exports = {
  ensureImagesDirectory,
  saveImage,
  getImagePath,
  getResizedImage,
};
