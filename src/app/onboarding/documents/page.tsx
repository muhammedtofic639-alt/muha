import { redirect } from "next/navigation";
import { getCurrentAccount } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { DocumentUploadForm } from "@/components/DocumentUploadForm";

export default async function DocumentsPage() {
  const account = await getCurrentAccount();
  if (!account) {
    redirect("/login");
  }

  const categories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10 text-center">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-900">Verify your identity</h1>
        <p className="mt-1 max-w-xs text-sm text-navy-600">
          Step 3 of 4 — These documents are reviewed by our team before you can access the feed.
        </p>
      </div>
      <DocumentUploadForm role={account.role} categories={categories} />
    </main>
  );
}
