/**
 * * @param {File|Blob} file - The raw image file to compress.
 * @param {number} [quality=0.85] - Compression quality between 0.0 and 1.0.
 * @returns {Promise<Blob>} A promise that resolves to the compressed WebP Blob.
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
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                canvas.toBlob(
                    (blob) => {
                        URL.revokeObjectURL(objectUrl);

                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error("Canvas WebP encoding failed (browser may not support WebP canvas output)."));
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