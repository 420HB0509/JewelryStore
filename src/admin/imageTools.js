/* Resizes and compresses photos in the browser before upload, so a
   12 MB phone picture becomes a ~200–400 KB web image. */

const MAX_SIDE = 1600;
const QUALITY = 0.82;

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("This file isn't a photo we can read. Try a JPG or PNG."));
    };
    img.src = url;
  });
}

const toBlob = (canvas, type, quality) =>
  new Promise((resolve) => canvas.toBlob((b) => resolve(b), type, quality));

export async function compressImage(file) {
  if (!file.type.startsWith("image/")) throw new Error(`“${file.name}” isn't an image.`);

  // createImageBitmap respects the phone's rotation (EXIF orientation)
  let source;
  try {
    source = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    source = await loadImage(file);
  }

  const scale = Math.min(1, MAX_SIDE / Math.max(source.width, source.height));
  const width = Math.round(source.width * scale);
  const height = Math.round(source.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff"; // transparent PNGs get a white background
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(source, 0, 0, width, height);
  source.close?.();

  let blob = await toBlob(canvas, "image/webp", QUALITY);
  if (!blob || blob.type !== "image/webp") blob = await toBlob(canvas, "image/jpeg", QUALITY);
  if (!blob) throw new Error("Couldn't process this photo.");
  return blob;
}
