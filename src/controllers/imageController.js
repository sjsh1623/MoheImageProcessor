const {
  saveImage,
  getImagePath,
  getResizedImage,
} = require('../services/imageService');

function handleError(res, error, fallbackMessage, logPrefix) {
  const status = error.status || 500;
  const message = error.status ? error.message : fallbackMessage;
  const logMessage = error.cause?.message || error.message;

  console.error(`${logPrefix}:`, logMessage);
  return res.status(status).json({ message });
}

async function saveImageHandler(req, res) {
  try {
    const { url, fileName } = req.body || {};

    if (!url || !fileName) {
      return res.status(400).json({ message: 'Both url and fileName are required.' });
    }

    const { fileName: savedFileName } = await saveImage(url, fileName);
    return res.status(201).json({ message: 'Image saved successfully.', fileName: savedFileName });
  } catch (error) {
    return handleError(res, error, 'Failed to save image.', 'Failed to save image');
  }
}

async function sendImageHandler(req, res) {
  try {
    // Decode URI component to handle Korean characters in filename
    const { fileName } = req.params;
    const decodedFileName = decodeURIComponent(fileName);
    const { targetPath, safeFileName } = await getImagePath(decodedFileName);

    // Set proper Content-Type for mobile compatibility
    const mime = require('mime-types');
    const mimeType = mime.lookup(safeFileName) || 'application/octet-stream';
    res.setHeader('Content-Type', mimeType);

    // Add cache control headers for better performance
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    return res.sendFile(targetPath);
  } catch (error) {
    return handleError(res, error, 'Failed to serve image.', 'Failed to send image');
  }
}

async function sendResizedImageHandler(req, res) {
  try {
    // Decode URI component to handle Korean characters in filename
    const { fileName, width, height } = req.params;
    const decodedFileName = decodeURIComponent(fileName);
    const { buffer, mimeType } = await getResizedImage(decodedFileName, width, height);

    res.setHeader('Content-Type', mimeType);
    // Add cache control headers for better performance
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    return res.send(buffer);
  } catch (error) {
    return handleError(res, error, 'Failed to resize image.', 'Failed to resize image');
  }
}

module.exports = {
  saveImageHandler,
  sendImageHandler,
  sendResizedImageHandler,
};
