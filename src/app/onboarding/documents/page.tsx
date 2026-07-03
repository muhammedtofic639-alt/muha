import { redirect } from "next/navigation";
import { getCurrentAccount } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ensureCategories } from "@/lib/categories";
import { DocumentUploadForm } from "@/components/DocumentUploadForm";

export default async function DocumentsPage() {
  const account = await getCurrentAccount();
  if (!account) {
    redirect("/");
  }

  await ensureCategories();
  const categories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });

  const isSeeker = account.role === "SEEKER";

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-10">
      <div className="mb-7 w-full max-w-sm">
        <h1 className="mb-1.5 font-display text-[28px] font-bold tracking-tight text-gray-50">
          {isSeeker ? "Build your profile" : "Verify your business"}
        </h1>
        <p className="text-sm text-gray-400">
          {isSeeker
            ? "You'll be live and discoverable instantly."
            : "We review your documents within 24 hrs. You'll be notified when approved."}
        </p>
      </div>
      <DocumentUploadForm role={account.role} categories={categories} />
    </main>
  );
}
