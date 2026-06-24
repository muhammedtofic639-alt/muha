import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";

/** Reads the session cookie and loads the live Account row (status included). */
export async function getCurrentAccount() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await verifySession(token);
  if (!session) return null;

  return prisma.account.findUnique({
    where: { id: session.accountId },
    include: { seekerProfile: true, companyProfile: true },
  });
}
