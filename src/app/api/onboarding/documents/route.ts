import { NextRequest, NextResponse } from "next/server";
import { AccountStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentAccount } from "@/lib/session";
import { uploadFile, UploadError } from "@/lib/upload";
import { isVideoPitchUrl } from "@/lib/videoEmbed";

/**
 * Step 3 of onboarding: the document upload gate. Accepts multipart form data
 * and, depending on the account's chosen role, requires:
 *   SEEKER:    fullName, governmentId (file), videoPitchUrl (YouTube/TikTok link)
 *              optionally: bio, profilePhoto (file) — shown on the swipe card
 *   RECRUITER: companyName, commercialLicense (file), ownerId (file)
 *
 * Seekers go live instantly on submit (status APPROVED — "You'll be live and
 * discoverable instantly"); recruiters are (re-)set to PENDING_APPROVAL so an
 * admin reviews their business documents first. Resubmission after a REJECTED
 * status follows the same rules.
 */
export async function POST(req: NextRequest) {
  const account = await getCurrentAccount();
  if (!account) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const form = await req.formData();

  if (account.role === "SEEKER") {
    const fullName = form.get("fullName");
    const governmentId = form.get("governmentId");
    const videoPitchUrl = form.get("videoPitchUrl");
    const categoryId = form.get("categoryId");
    const bio = form.get("bio");
    const profilePhoto = form.get("profilePhoto");

    if (
      typeof fullName !== "string" ||
      !fullName.trim() ||
      !(governmentId instanceof File) ||
      governmentId.size === 0 ||
      typeof videoPitchUrl !== "string" ||
      !isVideoPitchUrl(videoPitchUrl) ||
      typeof categoryId !== "string" ||
      !categoryId
    ) {
      return NextResponse.json(
        { error: "fullName, a governmentId file, a category, and a YouTube/TikTok video link are required" },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return NextResponse.json({ error: "Unknown category" }, { status: 400 });
    }

    let governmentIdUrl: string;
    let profilePhotoUrl: string | undefined;
    try {
      governmentIdUrl = (await uploadFile(governmentId, "government_id")).url;
      // An unfilled <input type="file"> still submits a zero-byte File —
      // only treat a real selection as a photo upload.
      profilePhotoUrl =
        profilePhoto instanceof File && profilePhoto.size > 0
          ? (await uploadFile(profilePhoto, "profile_photo")).url
          : undefined;
    } catch (err) {
      if (err instanceof UploadError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      throw err;
    }

    await prisma.seekerProfile.upsert({
      where: { accountId: account.id },
      update: {
        fullName,
        governmentIdUrl,
        videoPitchUrl,
        categoryId,
        ...(typeof bio === "string" && bio.trim() ? { bio } : {}),
        ...(profilePhotoUrl ? { profilePhotoUrl } : {}),
      },
      create: {
        accountId: account.id,
        fullName,
        governmentIdUrl,
        videoPitchUrl,
        categoryId,
        bio: typeof bio === "string" && bio.trim() ? bio : undefined,
        profilePhotoUrl,
      },
    });
  } else {
    const companyName = form.get("companyName");
    const commercialLicense = form.get("commercialLicense");
    const ownerId = form.get("ownerId");

    if (
      typeof companyName !== "string" ||
      !companyName.trim() ||
      !(commercialLicense instanceof File) ||
      commercialLicense.size === 0 ||
      !(ownerId instanceof File) ||
      ownerId.size === 0
    ) {
      return NextResponse.json(
        { error: "companyName, commercialLicense, and ownerId files are required" },
        { status: 400 }
      );
    }

    let commercialLicenseUrl: string;
    let ownerIdUrl: string;
    try {
      [{ url: commercialLicenseUrl }, { url: ownerIdUrl }] = await Promise.all([
        uploadFile(commercialLicense, "commercial_license"),
        uploadFile(ownerId, "owner_id"),
      ]);
    } catch (err) {
      if (err instanceof UploadError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      throw err;
    }

    await prisma.companyProfile.upsert({
      where: { accountId: account.id },
      update: { companyName, commercialLicenseUrl, ownerIdUrl },
      create: { accountId: account.id, companyName, commercialLicenseUrl, ownerIdUrl },
    });
  }

  const isSeeker = account.role === "SEEKER";
  const status = isSeeker ? AccountStatus.APPROVED : AccountStatus.PENDING_APPROVAL;

  await prisma.account.update({
    where: { id: account.id },
    data: { status },
  });

  return NextResponse.json({ ok: true, status, next: isSeeker ? "/seeker" : "/pending" });
}
