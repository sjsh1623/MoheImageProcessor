# API Specification

## POST /save
- **Description**: Downloads an image from the provided URL and saves it under `/images` with the specified file name.
- **Request Body**
  ```json
  {
    "url": "https://example.com/image.jpg",
    "fileName": "sample.jpg"
  }
  ```
- **Responses**
  - `201 Created`
    ```json
    {
      "message": "Image saved successfully.",
      "fileName": "sample.jpg"
    }
    ```
  - `400 Bad Request` – Missing parameters or invalid file name.
  - `502 Bad Gateway` – Remote server error while fetching the image.
  - `500 Internal Server Error` – Other processing failures.

## GET /image/:fileName
- **Description**: Returns the original image stored under `/images`.
- **Path Parameters**
  - `fileName` – Name of the previously saved file.
- **Responses**
  - `200 OK` – Binary image data, `Content-Type` inferred from file extension.
  - `400 Bad Request` – Invalid file name.
  - `404 Not Found` – Image not found.
  - `500 Internal Server Error` – Server-side failure while reading the file.

## GET /image/:fileName/:width/:height
- **Description**: Returns a resized version of the stored image. Resizing uses Sharp's `cover` fit, preserving aspect ratio while filling the requested dimensions.
- **Path Parameters**
  - `fileName` – Name of the previously saved file.
  - `width` – Target width (positive integer).
  - `height` – Target height (positive integer).
- **Responses**
  - `200 OK` – Binary image data for the resized image, `Content-Type` inferred from file extension.
  - `400 Bad Request` – Invalid file name or invalid width/height values.
  - `404 Not Found` – Image not found.
  - `500 Internal Server Error` – Server-side failure while processing the image.
