import { NextRequest, NextResponse } from "next/server";
import { markKotPrinted } from "@/server/services/dining.service";
import { requireAuth } from "@/server/auth/rbac";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    await markKotPrinted(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to mark KOT" },
      { status: 500 }
    );
  }
}
