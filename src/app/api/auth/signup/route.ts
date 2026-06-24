import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword, signSession, sessionCookieOptions } from "@/lib/auth";

interface SignupBody {
  email: string;
  password: string;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as SignupBody;
  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!email || !password || password.length < 8) {
    return NextResponse.json(
      { error: "A valid email and a password of at least 8 characters are required" },
      { status: 400 }
    );
  }

  const existing = await prisma.account.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  // Role defaults to SEEKER here; the onboarding flow's role-selection step
  // (POST /api/onboarding/role) overwrites it before any documents are uploaded.
  const account = await prisma.account.create({
    data: { email, passwordHash, role: Role.SEEKER },
  });

  const token = await signSession({ accountId: account.id, role: account.role });
  const res = NextResponse.json({ accountId: account.id }, { status: 201 });
  res.cookies.set(sessionCookieOptions.name, token, sessionCookieOptions);
  return res;
}
