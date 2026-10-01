import { NextRequest, NextResponse } from "next/server";
import { cancelDiningOrder } from "@/server/services/dining.service";
import { requireAuth } from "@/server/auth/rbac";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const { reason } = await req.json();

    const cancelled = await cancelDiningOrder(
      id,
      reason || "Cancelled by staff",
      user.id,
      user.name
    );

    return NextResponse.json({ success: true, order: cancelled });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to cancel order" },
      { status: 400 }
    );
  }
}
