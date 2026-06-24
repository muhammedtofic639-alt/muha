import { PrismaClient, Role, AccountStatus, JobType, WorkMode } from "@prisma/client";

const prisma = new PrismaClient();

// Broad coverage across the local job market — not just tech — so every
// posting and every seeker can find a fitting primary category.
const CATEGORY_NAMES = [
  // Tech & engineering
  "Software Engineer",
  "Mobile App Developer",
  "Data Analyst",
  "Data Scientist",
  "DevOps Engineer",
  "QA / Test Engineer",
  "IT Support Technician",
  "Network Administrator",
  "Cybersecurity Specialist",
  "Civil Engineer",
  "Mechanical Engineer",
  "Electrical Engineer",
  "Architect",
  // Creative & media
  "Graphic Designer",
  "UI/UX Designer",
  "Video Editor",
  "Photographer",
  "Content Writer",
  "Animator",
  // Marketing & sales
  "Digital Marketer",
  "Social Media Manager",
  "Sales Representative",
  "Business Development Manager",
  // Business & finance
  "Accountant",
  "Financial Analyst",
  "Human Resources Specialist",
  "Project Manager",
  "Administrative Assistant",
  "Customer Service Representative",
  "Legal Counsel",
  // Healthcare
  "Nurse",
  "Pharmacist",
  "Medical Doctor",
  "Laboratory Technician",
  // Education
  "Teacher",
  "Tutor",
  "Translator",
  // Trades & logistics
  "Electrician",
  "Plumber",
  "Driver",
  "Warehouse Worker",
  "Construction Worker",
  // Hospitality & retail
  "Chef / Cook",
  "Hotel Staff",
  "Retail Associate",
  "Event Planner",
];

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function main() {
  const categories = await Promise.all(
    CATEGORY_NAMES.map((name) =>
      prisma.category.create({ data: { name, slug: slugify(name) } })
    )
  );
  const categoryByName = new Map(categories.map((c) => [c.name, c]));
  const softwareEngineerCategory = categoryByName.get("Software Engineer")!;

  const recruiterAccount = await prisma.account.create({
    data: {
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
      categoryId: softwareEngineerCategory.id,
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
      status: AccountStatus.APPROVED,
      telegramId: "2001",
      username: "selam_dev",
      role: Role.SEEKER,
      seekerProfile: {
        create: {
          fullName: "Selam Tesfaye",
          categoryId: softwareEngineerCategory.id,
          headline: "Frontend Engineer",
          yearsExp: 3,
          bio: "Frontend engineer passionate about accessible, performant web apps.",
          governmentIdUrl: "https://placeholder.local/uploads/government-id.pdf",
          profilePhotoUrl: "https://placeholder.local/uploads/selam-photo.jpg",
          videoPitchUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
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
      status: AccountStatus.PENDING_APPROVAL,
      telegramId: "3001",
      username: "yonas_b",
      role: Role.SEEKER,
      seekerProfile: {
        create: {
          fullName: "Yonas Bekele",
          categoryId: categoryByName.get("Civil Engineer")!.id,
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
