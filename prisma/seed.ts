import { PrismaClient, Role, AccountStatus, JobType, WorkMode } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const recruiterAccount = await prisma.account.create({
    data: {
      email: "hr@addistech.example",
      passwordHash,
      status: AccountStatus.APPROVED,
      telegramId: "1001",
      username: "addis_tech_hr",
      role: Role.RECRUITER,
      companyProfile: {
        create: {
          companyName: "Addis Tech Solutions",
          location: "Addis Ababa, Ethiopia",
          about: "A fast-growing fintech building payment infrastructure for East Africa.",
          commercialLicenseUrl: "https://placeholder.local/uploads/commercial-license.pdf",
          ownerIdUrl: "https://placeholder.local/uploads/owner-id.pdf",
        },
      },
    },
    include: { companyProfile: true },
  });

  await prisma.job.create({
    data: {
      companyId: recruiterAccount.companyProfile!.id,
      title: "Frontend Engineer",
      description: "Build delightful, performant interfaces for our mobile-first banking app.",
      tags: ["React", "TypeScript", "Tailwind"],
      jobType: JobType.FULL_TIME,
      workMode: WorkMode.HYBRID,
      salaryMin: 25000,
      salaryMax: 40000,
      salaryPeriod: "MONTHLY",
      currency: "ETB",
    },
  });

  const seekerAccount = await prisma.account.create({
    data: {
      email: "selam@example.com",
      passwordHash,
      status: AccountStatus.APPROVED,
      telegramId: "2001",
      username: "selam_dev",
      role: Role.SEEKER,
      seekerProfile: {
        create: {
          fullName: "Selam Tesfaye",
          headline: "Frontend Engineer",
          yearsExp: 3,
          bio: "Frontend engineer passionate about accessible, performant web apps.",
          governmentIdUrl: "https://placeholder.local/uploads/government-id.pdf",
          profilePhotoUrl: "https://placeholder.local/uploads/selam-photo.jpg",
          videoPitchUrl: "https://placeholder.local/uploads/selam-pitch.mp4",
          videoPitchSeconds: 18,
          skills: ["React", "TypeScript", "Tailwind CSS"],
          skillsDescription: "React & TypeScript specialist, 3 years building production banking UIs.",
          location: "Addis Ababa, Ethiopia",
        },
      },
    },
  });

  await prisma.companyRating.create({
    data: {
      seekerId: seekerAccount.id,
      companyId: recruiterAccount.id,
      rating: 8.5,
    },
  });

  const pendingSeekerAccount = await prisma.account.create({
    data: {
      email: "yonas@example.com",
      passwordHash,
      status: AccountStatus.PENDING_APPROVAL,
      role: Role.SEEKER,
      seekerProfile: {
        create: {
          fullName: "Yonas Bekele",
          governmentIdUrl: "https://placeholder.local/uploads/yonas-id.pdf",
        },
      },
    },
  });

  console.log("Seeded:", {
    recruiterAccountId: recruiterAccount.id,
    seekerAccountId: seekerAccount.id,
    pendingSeekerAccountId: pendingSeekerAccount.id,
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
