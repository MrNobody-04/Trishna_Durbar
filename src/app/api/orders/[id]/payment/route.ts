import { NextRequest, NextResponse } from "next/server";
import { recordDiningPayment } from "@/server/services/dining.service";
import { requireAuth } from "@/server/auth/rbac";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const { amount, method, tendered, notes } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid payment amount is required" },
        { status: 400 }
      );
    }

    const updated = await recordDiningPayment(
      id,
      Number(amount),
      method || "CASH",
      tendered ? Number(tendered) : null,
      notes || null,
      user.id,
      user.name
    );

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to record payment" },
      { status: 400 }
    );
  }
}
