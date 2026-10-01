import { NextResponse } from "next/server";
import { clearSession, getSessionUser } from "@/server/auth/session";
import { logAuditEvent } from "@/server/services/audit.service";

export async function POST() {
  const user = await getSessionUser();
  if (user) {
    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      action: "USER_LOGOUT",
      entity: "User",
      entityId: user.id,
    });
  }
  await clearSession();
  return NextResponse.json({ success: true });
}
