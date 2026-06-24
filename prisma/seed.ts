import { PrismaClient, Role, JobType, WorkMode } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const recruiterAccount = await prisma.account.create({
    data: {
      telegramId: "1001",
      username: "addis_tech_hr",
      role: Role.RECRUITER,
      companyProfile: {
        create: {
          companyName: "Addis Tech Solutions",
          location: "Addis Ababa, Ethiopia",
          about: "A fast-growing fintech building payment infrastructure for East Africa.",
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
      telegramId: "2001",
      username: "selam_dev",
      role: Role.SEEKER,
      seekerProfile: {
        create: {
          fullName: "Selam Tesfaye",
          headline: "Frontend Engineer",
          yearsExp: 3,
          bio: "Frontend engineer passionate about accessible, performant web apps.",
          skills: ["React", "TypeScript", "Tailwind CSS"],
          location: "Addis Ababa, Ethiopia",
        },
      },
    },
  });

  console.log("Seeded:", { recruiterAccountId: recruiterAccount.id, seekerAccountId: seekerAccount.id });
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
