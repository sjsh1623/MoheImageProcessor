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
    const { fileName } = req.params;
    const { targetPath } = await getImagePath(fileName);
    return res.sendFile(targetPath);
  } catch (error) {
    return handleError(res, error, 'Failed to serve image.', 'Failed to send image');
  }
}

async function sendResizedImageHandler(req, res) {
  try {
    const { fileName, width, height } = req.params;
    const { buffer, mimeType } = await getResizedImage(fileName, width, height);

    res.setHeader('Content-Type', mimeType);
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
