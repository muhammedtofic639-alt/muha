import { prisma } from "@/lib/prisma";

/**
 * Default job categories, matching prisma/seed.ts. Auto-inserted on first read
 * when the Category table is empty so seeker onboarding (which requires
 * picking a category) never dead-ends on a fresh database where the seed
 * script was never run.
 */
const DEFAULT_CATEGORY_NAMES = [
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

export async function ensureCategories() {
  const count = await prisma.category.count();
  if (count > 0) return;

  await prisma.category.createMany({
    data: DEFAULT_CATEGORY_NAMES.map((name) => ({ name, slug: slugify(name) })),
    skipDuplicates: true,
  });
}
