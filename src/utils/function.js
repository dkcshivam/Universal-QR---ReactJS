/**
 * @param {File|Blob} file - The raw image file to compress.
 * @param {number} [quality=0.75] - Compression quality between 0.0 and 1.0.
 * @param {number} [maxWidth=1280] - Maximum width in pixels (preserves aspect ratio).
 * @param {number} [maxHeight=1280] - Maximum height in pixels (preserves aspect ratio).
 * @returns {Promise<Blob>} A promise that resolves to a compressed WebP or JPEG Blob.
 */
export async function compressImageToWebP(file, quality = 0.85) {
    return new Promise((resolve, reject) => {
        if (!file) {
            return reject(new TypeError("No file provided for compression."));
        }

        if (!file.type || !file.type.startsWith("image/")) {
            return reject(new TypeError(`Invalid file type "${file.type || 'unknown'}". Only images are allowed.`));
        }

        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.src = objectUrl;

        img.onload = () => {
            try {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                if (!ctx) {
                    URL.revokeObjectURL(objectUrl);
                    return reject(new Error("Failed to get 2D canvas context."));
                }

                canvas.width = img.width;
                canvas.height = img.height;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (firstBlob) => {

            if (firstBlob && firstBlob.type === "image/webp") {
              URL.revokeObjectURL(objectUrl);
              resolve(firstBlob);
            } else {
              canvas.toBlob(
                (jpegBlob) => {
                  URL.revokeObjectURL(objectUrl);
                  if (jpegBlob) {
                    resolve(jpegBlob);
                  } else {
                    reject(new Error("Both WebP and JPEG encoding failed."));
                  }
                },
                "image/jpeg",
                quality
              );
            }
          },
          "image/webp",
          quality
        );
      } catch (canvasError) {
        URL.revokeObjectURL(objectUrl);
        reject(canvasError);
      }
    };

        img.onerror = (error) => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("Failed to process image file. The image may be corrupted or unsupported by the browser."));
        };
    });
}