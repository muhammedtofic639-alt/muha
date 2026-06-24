import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "abyssinia_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  accountId: string;
  role: "SEEKER" | "RECRUITER";
}

/**
 * The JWT only carries identity (accountId, role), never account status —
 * status is read fresh from the database on every protected request so an
 * admin approval/rejection takes effect without forcing a re-login.
 */
export async function signSession(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (typeof payload.accountId !== "string" || typeof payload.role !== "string") {
      return null;
    }
    return { accountId: payload.accountId, role: payload.role as SessionPayload["role"] };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  name: SESSION_COOKIE,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
};
