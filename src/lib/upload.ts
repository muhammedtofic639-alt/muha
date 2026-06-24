import { randomUUID } from "crypto";

export type UploadKind = "government_id" | "commercial_license" | "owner_id" | "profile_photo";

/**
 * Storage adapter placeholder. Wire this up to a real provider before going
 * to production — credentials are read from env so swapping providers
 * doesn't require code changes elsewhere:
 *
 *   AWS S3:      S3_BUCKET, S3_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
 *                -> use @aws-sdk/client-s3 PutObjectCommand + a signed GET/CDN URL
 *   Cloudinary:  CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 *                -> use the cloudinary SDK's uploader.upload()
 *
 * Until one of those is configured, files are not persisted anywhere durable;
 * this returns a stable placeholder URL so the rest of the app (onboarding
 * gate, card rendering) can be built and tested end-to-end.
 */
export async function uploadFile(file: File, kind: UploadKind): Promise<{ url: string }> {
  if (process.env.S3_BUCKET) {
    throw new Error("S3 upload not implemented — wire @aws-sdk/client-s3 here using S3_BUCKET/S3_REGION");
  }
  if (process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error("Cloudinary upload not implemented — wire the cloudinary SDK here");
  }

  const ext = file.name.split(".").pop() ?? "bin";
  return { url: `https://placeholder-media.abyssiniajobs.local/${kind}/${randomUUID()}.${ext}` };
}
