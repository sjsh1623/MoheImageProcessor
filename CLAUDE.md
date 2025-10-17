# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mohe Image Processor is a Node.js Express server that downloads images from external URLs and serves them with optional resizing capabilities using Sharp. The service stores images locally and provides on-demand resizing.

## Development Commands

```bash
# Install dependencies
npm install

# Start the server locally (runs on http://localhost:3000)
npm start

# Docker build and run
docker-compose up --build
```

## Architecture

### Modular Layer Structure

The codebase follows a clean separation of concerns with distinct layers:

```
Routes (imageRoutes.js)
    ↓
Controllers (imageController.js)
    ↓
Services (imageService.js)
    ↓
Utils (fileUtils.js)
```

**Routes Layer** (`src/routes/imageRoutes.js`):
- Defines URL endpoints and HTTP method mappings
- Delegates to controller handlers

**Controllers Layer** (`src/controllers/imageController.js`):
- Handles HTTP request/response logic
- Validates request parameters
- Contains centralized error handling via `handleError()` function
- Maps service layer errors (with `.status` property) to appropriate HTTP status codes

**Services Layer** (`src/services/imageService.js`):
- Contains business logic for image operations
- `saveImage()`: Downloads images via axios streams, saves to local filesystem
- `getImagePath()`: Resolves and validates image file paths
- `getResizedImage()`: Uses Sharp to resize images with `fit: cover` strategy
- Throws errors with `.status` property for HTTP status code mapping

**Utils Layer** (`src/utils/fileUtils.js`):
- Low-level file system operations
- `sanitizeFileName()`: Security validation to prevent directory traversal attacks
- `ensureDirectory()`: Creates directories recursively if they don't exist
- `fileExists()`: Non-throwing file existence check

### Error Handling Pattern

Errors flow from services → controllers → client:
- Services throw errors with `.status` and optional `.cause` properties
- `createHttpError(status, message, cause)` in imageService.js creates structured errors
- Controller's `handleError()` extracts status codes and formats JSON responses
- Maintains separation: services throw domain errors, controllers handle HTTP concerns

### Image Storage

- All images stored in `./images` directory (auto-created on startup)
- In Docker: `./images` is volume-mounted to persist between container restarts
- File names are sanitized to prevent path traversal vulnerabilities

### Configuration

- Environment variables: `PORT` (default: 3000)
- Constants defined in `src/config/constants.js`
- `IMAGES_DIR` is computed relative to project root

## API Endpoints

- `POST /save` - Download and save an image from URL
- `GET /image/:fileName` - Serve original image
- `GET /image/:fileName/:width/:height` - Serve resized image

See `docs/api-spec.md` for detailed request/response specifications.

## Key Dependencies

- **express**: Web framework
- **axios**: HTTP client for downloading images (uses stream response type)
- **sharp**: Image processing library (resize with cover fit)
- **mime-types**: MIME type detection for Content-Type headers

## Docker Configuration

- Base image: `node:18-alpine`
- Production dependencies only (`npm install --omit=dev`)
- Port 3000 exposed
- Volume mount at `/app/images` for persistent storage
