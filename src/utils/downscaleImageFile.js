/**
 * Shrinks a camera photo BEFORE anything else in the app touches it.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY THIS EXISTS
 * ─────────────────────────────────────────────────────────────────────────────
 * A phone camera hands back a 12-13 MP JPEG. Decoding one costs
 * `width * height * 4` bytes of RGBA — ~48 MB for 4000x3000 — and the image
 * editor holds that decode alive for the whole session (`nativeImageRef`) so
 * it can export at native resolution. On a low-end phone, returning from the
 * camera app is already the worst possible moment to ask for 48 MB: the
 * browser has just been backgrounded and partially evicted to make room for
 * the camera. Reported symptom was an OS-level "unable to complete operation
 * due to low memory" the instant OK was tapped on the native camera screen.
 *
 * Downscaling here, at the single point where a photo enters the app, bounds
 * every cost downstream at once — decode memory, the editor's retained image,
 * the export canvas, and the upload payload.
 *
 * The important trick is `resizeWidth`/`resizeHeight` on `createImageBitmap`:
 * it lets the browser decode the JPEG *directly* at the reduced size (JPEG's
 * DCT scaling supports 1/2, 1/4, 1/8) instead of materialising the full frame
 * and then shrinking it. That is what makes this fix the decode-time OOM
 * rather than merely moving it. To use it we need the source dimensions
 * up front, which `readImageSize` reads straight out of the file header for a
 * few KB — no decode at all.
 */

/** Longest edge, in px, a photo is allowed to keep. */
const DEFAULT_MAX_EDGE = 1600;

/**
 * JPEG at 0.85. Product decision 2026-07-31, replacing the earlier
 * "PNG everywhere, no lossy compression" call (see CLAUDE.md §4(g)): a 12 MP
 * PNG of a photograph is 15-30 MB per checkpoint over factory wifi, where the
 * same picture is ~300 KB as JPEG. The editor never displays more than about
 * 1170x880 device px on a phone anyway.
 */
const DEFAULT_QUALITY = 0.85;
const DEFAULT_MIME_TYPE = "image/jpeg";

/** How much of the file to read when looking for the size header. */
const HEADER_BYTES = 256 * 1024;

/**
 * Reads the pixel dimensions out of a JPEG's SOF segment.
 *
 * @param {Uint8Array} bytes
 * @returns {{ width: number, height: number } | null}
 */
function readJpegSize(bytes) {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null; // not a JPEG (no SOI)

  let i = 2;
  while (i < bytes.length - 9) {
    // Segments are 0xFF <marker>.
    if (bytes[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marker = bytes[i + 1];

    // Any number of 0xFF bytes may pad the gap before a marker, and 0xFF is
    // not itself a legal marker value. Treating one as a marker reads the two
    // following bytes as a segment length — 0xFFFF — and skips 64 KB past
    // wherever the real SOF was. 0x00 is a stuffed byte, likewise not a marker.
    if (marker === 0xff || marker === 0x00) {
      i += 1;
      continue;
    }

    // Standalone markers carry no length field.
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2;
      continue;
    }
    if (marker === 0xd9 || marker === 0xda) return null; // EOI / start of scan

    const length = (bytes[i + 2] << 8) | bytes[i + 3];
    if (length < 2) return null;

    // SOF0..SOF15 hold the frame size — except DHT (c4), JPG (c8) and DAC (cc),
    // which share the range but are something else entirely.
    const isStartOfFrame =
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc;

    if (isStartOfFrame) {
      // payload: precision(1) height(2) width(2) ...
      const height = (bytes[i + 5] << 8) | bytes[i + 6];
      const width = (bytes[i + 7] << 8) | bytes[i + 8];
      return width > 0 && height > 0 ? { width, height } : null;
    }

    i += 2 + length;
  }
  return null;
}

/**
 * Reads the pixel dimensions out of a PNG's IHDR chunk.
 *
 * @param {Uint8Array} b
 * @returns {{ width: number, height: number } | null}
 */
function readPngSize(b) {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (b.length < 24) return null;
  for (let i = 0; i < signature.length; i += 1) {
    if (b[i] !== signature[i]) return null;
  }
  const width = (b[16] << 24) | (b[17] << 16) | (b[18] << 8) | b[19];
  const height = (b[20] << 24) | (b[21] << 16) | (b[22] << 8) | b[23];
  return width > 0 && height > 0 ? { width, height } : null;
}

/**
 * Source dimensions from the file header, without decoding a single pixel.
 * Returns null for anything it doesn't recognise — callers must cope.
 *
 * @param {File | Blob} file
 * @returns {Promise<{ width: number, height: number } | null>}
 */
async function readImageSize(file) {
  try {
    const slice = file.slice(0, Math.min(HEADER_BYTES, file.size));
    const bytes = new Uint8Array(await slice.arrayBuffer());
    return readJpegSize(bytes) || readPngSize(bytes);
  } catch {
    return null;
  }
}

/**
 * Decodes `file`, at reduced size when the browser will cooperate.
 *
 * @param {File | Blob} file
 * @param {number} maxEdge
 * @returns {Promise<ImageBitmap | HTMLImageElement | null>}
 */
async function decodeScaled(file, maxEdge) {
  if (typeof createImageBitmap === "function") {
    // `from-image` applies EXIF rotation, which <img> does for free and
    // createImageBitmap does NOT by default — without it, photos taken in
    // portrait come out sideways.
    const options = { imageOrientation: "from-image" };

    const size = await readImageSize(file);
    if (size && Math.max(size.width, size.height) > maxEdge) {
      // Deliberately set only ONE axis: the spec has the browser derive the
      // other one preserving the aspect ratio. Setting both would stretch the
      // photo. Capping whichever axis is longer in the raw frame keeps the
      // result within maxEdge whichever way EXIF rotates it.
      if (size.width >= size.height) options.resizeWidth = maxEdge;
      else options.resizeHeight = maxEdge;
      options.resizeQuality = "high";
    }

    // Degrade one capability at a time rather than giving up: an engine that
    // rejects the resize hints may still honour the orientation flag.
    for (const attempt of [options, { imageOrientation: "from-image" }, undefined]) {
      try {
        return await createImageBitmap(file, attempt);
      } catch {
        /* try the next, simpler form */
      }
    }
  }

  return decodeViaImgElement(file);
}

/**
 * Last-resort decode path. Costs a full-resolution decode — the very thing
 * this module exists to avoid — but a photo the user can still edit beats no
 * photo at all.
 *
 * @param {File | Blob} file
 * @returns {Promise<HTMLImageElement | null>}
 */
function decodeViaImgElement(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

/**
 * @param {ImageBitmap | HTMLImageElement} source
 * @returns {{ width: number, height: number }}
 */
function sourceSize(source) {
  return {
    width: source.naturalWidth || source.width || 0,
    height: source.naturalHeight || source.height || 0,
  };
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {string} mimeType
 * @param {number} quality
 * @returns {Promise<Blob | null>}
 */
function canvasToBlob(canvas, mimeType, quality) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });
}

/**
 * Swaps a file name's extension to match the type it actually holds.
 *
 * @param {string | undefined} name
 * @param {string} mimeType
 * @returns {string}
 */
function renameForType(name, mimeType) {
  const extension =
    mimeType === "image/jpeg" ? "jpg" : mimeType === "image/webp" ? "webp" : "png";
  const lastSegment = String(name || "photo").split(/[\\/]/).pop() || "photo";
  const stem = lastSegment.replace(/\.[A-Za-z0-9]{1,5}$/, "").trim() || "photo";
  return `${stem}.${extension}`;
}

/**
 * Downscales and re-encodes an image File.
 *
 * Never throws and never returns null: if anything at all goes wrong — an
 * unreadable header, a decode failure, a browser without `toBlob` — the
 * ORIGINAL file comes back untouched, so the caller's flow still works and
 * only the memory saving is lost.
 *
 * @param {File} file
 * @param {object} [options]
 * @param {number} [options.maxEdge=1600] - cap for the longest edge, in px
 * @param {number} [options.quality=0.85] - encoder quality, lossy types only
 * @param {string} [options.mimeType="image/jpeg"]
 * @returns {Promise<File>}
 */
export async function downscaleImageFile(file, options = {}) {
  const {
    maxEdge = DEFAULT_MAX_EDGE,
    quality = DEFAULT_QUALITY,
    mimeType = DEFAULT_MIME_TYPE,
  } = options;

  if (!file || !file.type?.startsWith("image/")) return file;

  // Cheap exit for a photo that is already small enough and already in the
  // target format — re-encoding it would only lose quality for nothing.
  const headerSize = await readImageSize(file);
  if (
    headerSize &&
    file.type === mimeType &&
    Math.max(headerSize.width, headerSize.height) <= maxEdge
  ) {
    return file;
  }

  let source = null;
  try {
    source = await decodeScaled(file, maxEdge);
    if (!source) return file;

    const { width, height } = sourceSize(source);
    if (!width || !height) return file;

    // decodeScaled has usually already hit the target, making this a 1:1 draw.
    // It still runs because the resize hint is only a hint — an engine that
    // ignored it, or applied it after EXIF rotation, lands slightly over.
    const scale = Math.min(1, maxEdge / Math.max(width, height));
    const targetWidth = Math.max(1, Math.round(width * scale));
    const targetHeight = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    // JPEG has no alpha: without this, any transparent pixel encodes as black.
    // A camera photo is fully opaque, but a gallery PNG reaching this path
    // would not be.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, targetWidth, targetHeight);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(source, 0, 0, targetWidth, targetHeight);

    const blob = await canvasToBlob(canvas, mimeType, quality);
    // Drop the backing store now rather than waiting for GC to notice.
    canvas.width = 0;
    canvas.height = 0;
    if (!blob) return file;

    return new File([blob], renameForType(file.name, blob.type), {
      type: blob.type,
      lastModified: file.lastModified,
    });
  } catch (err) {
    console.error("[downscaleImageFile] falling back to the original file:", err);
    return file;
  } finally {
    // ImageBitmap holds its pixels outside the JS heap; close() releases them
    // immediately instead of at some later GC.
    source?.close?.();
  }
}
