import { redirect } from "next/navigation";
import { getCurrentAccount } from "@/lib/session";

/**
 * The admin status gate. This is a Server Component, so it can hit Postgres
 * directly (the edge middleware can't) and always reflects the account's
 * *current* status — an admin approval takes effect on the next page load,
 * no re-login required.
 */
export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const account = await getCurrentAccount();

  if (!account) {
    redirect("/login");
  }

  if (account.status === "PENDING_APPROVAL") {
    redirect("/pending");
  }

  if (account.status === "REJECTED") {
    redirect("/rejected");
  }

  return <>{children}</>;
}
