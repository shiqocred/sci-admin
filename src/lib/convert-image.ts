import sharp from "sharp";

export const convertToWebP = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const webpBuffer = await sharp(Buffer.from(buffer))
    .webp({ quality: 50 })
    .toBuffer();
  return webpBuffer;
};
