import {
  r2AccessId,
  r2AccessKey,
  r2AccountId,
  r2bucket,
  smtpHost,
  smtpPassword,
  smtpPort,
  smtpUser,
} from "@/config";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import nodemailer from "nodemailer";

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: r2AccessId,
    secretAccessKey: r2AccessKey,
  },
});

export const uploadToR2 = async ({
  buffer,
  key,
  contentType = "image/webp",
}: {
  buffer: Buffer;
  key: string;
  contentType?: string;
}) => {
  const upload = await r2.send(
    new PutObjectCommand({
      Bucket: r2bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );
  return upload;
};

export const deleteR2 = async (key: string) => {
  await r2.send(
    new DeleteObjectCommand({
      Bucket: r2bucket,
      Key: key,
    })
  );
};

export const transporter = nodemailer.createTransport({
  host: smtpHost, // SMTP server kamu
  port: Number(smtpPort), // SSL port
  secure: Number(smtpPort) === 465, // true untuk port 465, false kalau pakai 587
  auth: {
    user: smtpUser, // username
    pass: smtpPassword, // password
  },
});
