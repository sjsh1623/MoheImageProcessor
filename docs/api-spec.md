# API Specification

## POST /save
- **Description**: Downloads an image from the provided URL and saves it under `/images` with the specified file name. The file extension is automatically detected from the image's Content-Type header and appended to the file name.
- **Request Body**
  ```json
  {
    "url": "https://example.com/image.jpg",
    "fileName": "sample"
  }
  ```
  - `url` (required): URL of the image to download
  - `fileName` (required): File name without extension
- **Responses**
  - `201 Created`
    ```json
    {
      "message": "Image saved successfully.",
      "fileName": "sample.jpeg"
    }
    ```
    Note: The returned `fileName` includes the auto-detected extension.
  - `400 Bad Request` – Missing parameters, invalid file name, or unable to determine file type.
  - `502 Bad Gateway` – Remote server error while fetching the image.
  - `500 Internal Server Error` – Other processing failures.

## GET /image/:fileName
- **Description**: Returns the original image stored under `/images`. The file name can be provided with or without extension. If no extension is provided, the server will automatically search for a matching file.
- **Path Parameters**
  - `fileName` – Name of the previously saved file. Can include extension (e.g., `sample.jpeg`) or exclude it (e.g., `sample`).
- **Responses**
  - `200 OK` – Binary image data, `Content-Type` inferred from file extension.
  - `400 Bad Request` – Invalid file name.
  - `404 Not Found` – Image not found.
  - `500 Internal Server Error` – Server-side failure while reading the file.

## GET /image/:fileName/:width/:height
- **Description**: Returns a resized version of the stored image. Resizing uses Sharp's `cover` fit, preserving aspect ratio while filling the requested dimensions. The file name can be provided with or without extension.
- **Path Parameters**
  - `fileName` – Name of the previously saved file. Can include extension (e.g., `sample.jpeg`) or exclude it (e.g., `sample`).
  - `width` – Target width (positive integer).
  - `height` – Target height (positive integer).
- **Responses**
  - `200 OK` – Binary image data for the resized image, `Content-Type` inferred from file extension.
  - `400 Bad Request` – Invalid file name or invalid width/height values.
  - `404 Not Found` – Image not found.
  - `500 Internal Server Error` – Server-side failure while processing the image.
