const axios = require('axios');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const mime = require('mime-types');
const { pipeline } = require('stream/promises');
const { v4: uuidv4 } = require('uuid');

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

  // 서브디렉토리가 있으면 생성 (예: place/, menu/)
  const targetDir = path.dirname(targetPath);
  if (targetDir !== IMAGES_DIR) {
    await ensureDirectory(targetDir);
  }

  try {
    const response = await axios.get(url, { responseType: 'stream' });
    await pipeline(response.data, fs.createWriteStream(targetPath));
    console.log(`✅ Image saved: ${targetPath}`);
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

/**
 * Upload image from multipart form data
 * @param {Object} file - Multer file object
 * @param {string} subdir - Optional subdirectory (e.g., 'profile', 'place')
 * @returns {Object} { fileName, targetPath }
 */
async function uploadImage(file, subdir = '') {
  await ensureImagesDirectory();

  // Generate unique filename with UUID
  const fileExtension = path.extname(file.originalname) || '.jpg';
  const uniqueFileName = `${uuidv4()}${fileExtension}`;
  const finalFileName = subdir ? `${subdir}/${uniqueFileName}` : uniqueFileName;
  const safeFileName = sanitizeFileName(finalFileName);
  const targetPath = path.join(IMAGES_DIR, safeFileName);

  // Create subdirectory if needed
  const targetDir = path.dirname(targetPath);
  if (targetDir !== IMAGES_DIR) {
    await ensureDirectory(targetDir);
  }

  try {
    // Move the uploaded file from temp location to target path
    await fs.promises.copyFile(file.path, targetPath);
    // Clean up temp file
    await fs.promises.unlink(file.path).catch(() => {});
    console.log(`✅ Image uploaded: ${targetPath}`);
  } catch (error) {
    throw createHttpError(500, 'Failed to save uploaded image.', error);
  }

  return { fileName: safeFileName, targetPath };
}

async function resolveImagePath(fileName) {
  const safeFileName = sanitizeFileName(fileName);
  let targetPath = path.join(IMAGES_DIR, safeFileName);
  let resolvedFileName = safeFileName;

  // Check if file exists with the given name (with extension)
  if (await fileExists(targetPath)) {
    return { targetPath, safeFileName: resolvedFileName };
  }

  // If not found and fileName has no extension, search for files with same base name
  const hasExtension = path.extname(safeFileName) !== '';
  if (!hasExtension) {
    try {
      const files = await fs.promises.readdir(IMAGES_DIR);
      const matchingFile = files.find((file) => {
        const baseName = path.basename(file, path.extname(file));
        return baseName === safeFileName;
      });

      if (matchingFile) {
        targetPath = path.join(IMAGES_DIR, matchingFile);
        resolvedFileName = matchingFile;
        return { targetPath, safeFileName: resolvedFileName };
      }
    } catch (error) {
      // If readdir fails, fall through to 404 error
    }
  }

  throw createHttpError(404, 'Image not found.');
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
  uploadImage,
  getImagePath,
  getResizedImage,
};
