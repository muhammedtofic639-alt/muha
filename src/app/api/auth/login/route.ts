import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signSession, sessionCookieOptions } from "@/lib/auth";

interface LoginBody {
  email: string;
  password: string;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as LoginBody;
  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const account = await prisma.account.findUnique({ where: { email } });
  if (!account || !(await verifyPassword(password, account.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = await signSession({ accountId: account.id, role: account.role });
  const res = NextResponse.json({ accountId: account.id, status: account.status });
  res.cookies.set(sessionCookieOptions.name, token, sessionCookieOptions);
  return res;
}
