import { NextRequest, NextResponse } from "next/server";
import { SwipeAction } from "@prisma/client";
import { recordSwipe, SwipeError } from "@/lib/swipe";
import { getCurrentAccount } from "@/lib/session";

interface SwipeRequestBody {
  jobId: string;
  action: "LIKE" | "PASS";
  targetAccountId?: string;
}

export async function POST(req: NextRequest) {
  // The actor is always the authenticated user — never trusted from the body,
  // so a swipe can't be forged on another user's behalf.
  const account = await getCurrentAccount();
  if (!account) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = (await req.json()) as SwipeRequestBody;

  if (!body.jobId || !body.action) {
    return NextResponse.json({ error: "jobId and action are required" }, { status: 400 });
  }
  if (!Object.values(SwipeAction).includes(body.action as SwipeAction)) {
    return NextResponse.json({ error: "action must be LIKE or PASS" }, { status: 400 });
  }

  try {
    const result = await recordSwipe({
      actorId: account.id,
      jobId: body.jobId,
      action: body.action as SwipeAction,
      targetAccountId: body.targetAccountId,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof SwipeError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("Swipe failed", err);
    return NextResponse.json({ error: "Failed to record swipe" }, { status: 500 });
  }
}
