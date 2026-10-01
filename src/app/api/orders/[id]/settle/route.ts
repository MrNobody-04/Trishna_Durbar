import { NextRequest, NextResponse } from "next/server";
import { settleDiningOrder } from "@/server/services/dining.service";
import { requireAuth } from "@/server/auth/rbac";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const settled = await settleDiningOrder(id, user.id, user.name);

    return NextResponse.json({ success: true, order: settled });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to settle order" },
      { status: 400 }
    );
  }
}
