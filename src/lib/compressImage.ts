import imageCompression from "browser-image-compression";

export async function compressMealImage(file: File): Promise<File> {
  return imageCompression(file, {
    maxWidthOrHeight: 1600,
    initialQuality: 0.7,
    maxSizeMB: 1.5,
    useWebWorker: true,
    fileType: "image/jpeg",
  });
}
