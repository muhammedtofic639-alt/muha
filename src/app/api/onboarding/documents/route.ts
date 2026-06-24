import { NextRequest, NextResponse } from "next/server";
import { AccountStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentAccount } from "@/lib/session";
import { uploadFile } from "@/lib/upload";
import { isVideoPitchUrl } from "@/lib/videoEmbed";

/**
 * Step 3 of onboarding: the document upload gate. Accepts multipart form data
 * and, depending on the account's chosen role, requires:
 *   SEEKER:    fullName, governmentId (file), videoPitchUrl (YouTube/TikTok link)
 *   RECRUITER: companyName, commercialLicense (file), ownerId (file)
 *
 * On success the account is (re-)set to PENDING_APPROVAL so an admin can
 * review the freshly uploaded documents — this also covers resubmission
 * after a REJECTED status.
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

    if (
      typeof fullName !== "string" ||
      !fullName.trim() ||
      !(governmentId instanceof File) ||
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

    const { url: governmentIdUrl } = await uploadFile(governmentId, "government_id");

    await prisma.seekerProfile.upsert({
      where: { accountId: account.id },
      update: { fullName, governmentIdUrl, videoPitchUrl, categoryId },
      create: { accountId: account.id, fullName, governmentIdUrl, videoPitchUrl, categoryId },
    });
  } else {
    const companyName = form.get("companyName");
    const commercialLicense = form.get("commercialLicense");
    const ownerId = form.get("ownerId");

    if (
      typeof companyName !== "string" ||
      !companyName.trim() ||
      !(commercialLicense instanceof File) ||
      !(ownerId instanceof File)
    ) {
      return NextResponse.json(
        { error: "companyName, commercialLicense, and ownerId files are required" },
        { status: 400 }
      );
    }

    const [{ url: commercialLicenseUrl }, { url: ownerIdUrl }] = await Promise.all([
      uploadFile(commercialLicense, "commercial_license"),
      uploadFile(ownerId, "owner_id"),
    ]);

    await prisma.companyProfile.upsert({
      where: { accountId: account.id },
      update: { companyName, commercialLicenseUrl, ownerIdUrl },
      create: { accountId: account.id, companyName, commercialLicenseUrl, ownerIdUrl },
    });
  }

  await prisma.account.update({
    where: { id: account.id },
    data: { status: AccountStatus.PENDING_APPROVAL },
  });

  return NextResponse.json({ ok: true, status: AccountStatus.PENDING_APPROVAL });
}
