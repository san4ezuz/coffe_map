import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

function client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY are not set — see .env.example");
  }
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey },
  });
}

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 8 * 1024 * 1024;

export async function uploadPlacePhoto(placeId: string, file: File): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Разрешены только JPEG, PNG и WebP");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Файл больше 8MB");
  }
  const bucket = process.env.R2_BUCKET;
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!bucket || !publicUrl) {
    throw new Error("R2_BUCKET / R2_PUBLIC_URL are not set — see .env.example");
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const key = `places/${placeId}/${randomUUID()}.${ext}`;
  const body = new Uint8Array(await file.arrayBuffer());

  await client().send(
    new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: file.type })
  );

  return `${publicUrl.replace(/\/$/, "")}/${key}`;
}

export async function deletePlacePhoto(url: string): Promise<void> {
  const bucket = process.env.R2_BUCKET;
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!bucket || !publicUrl) {
    throw new Error("R2_BUCKET / R2_PUBLIC_URL are not set — see .env.example");
  }
  const prefix = `${publicUrl.replace(/\/$/, "")}/`;
  if (!url.startsWith(prefix)) return;
  const key = url.slice(prefix.length);

  await client().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
