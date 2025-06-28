import { r2AccessId, r2AccessKey, r2AccountId } from "@/config";
import { S3Client } from "@aws-sdk/client-s3";

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: r2AccessId,
    secretAccessKey: r2AccessKey,
  },
});
