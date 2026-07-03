export type UploadKind = "government_id" | "commercial_license" | "owner_id" | "profile_photo";

export class UploadError extends Error {}

// Keeps inline (data-URL) storage and serverless request bodies sane.
const MAX_INLINE_FILE_BYTES = 4 * 1024 * 1024;

/**
 * Storage adapter. Wire this up to a real provider for production —
 * credentials are read from env so swapping providers doesn't require code
 * changes elsewhere:
 *
 *   AWS S3:      S3_BUCKET, S3_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
 *                -> use @aws-sdk/client-s3 PutObjectCommand + a signed GET/CDN URL
 *   Cloudinary:  CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 *                -> use the cloudinary SDK's uploader.upload()
 *
 * Until one is configured, files are stored inline as base64 data URLs in
 * Postgres (capped at 4MB each). That keeps the whole flow genuinely working
 * with zero external services: profile photos render on swipe cards and
 * admins can view submitted documents.
 */
export async function uploadFile(file: File, kind: UploadKind): Promise<{ url: string }> {
  if (process.env.S3_BUCKET) {
    throw new Error("S3 upload not implemented — wire @aws-sdk/client-s3 here using S3_BUCKET/S3_REGION");
  }
  if (process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error("Cloudinary upload not implemented — wire the cloudinary SDK here");
  }

  if (file.size > MAX_INLINE_FILE_BYTES) {
    throw new UploadError(
      `${kind.replace(/_/g, " ")} is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB) — max 4MB per file`
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || "application/octet-stream";
  return { url: `data:${mimeType};base64,${buffer.toString("base64")}` };
}
