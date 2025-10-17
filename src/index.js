const app = require('./app');
const { PORT } = require('./config/constants');
const { ensureImagesDirectory } = require('./services/imageService');

async function startServer() {
  try {
    await ensureImagesDirectory();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize images directory:', error.message);
    process.exit(1);
  }
}

startServer();
