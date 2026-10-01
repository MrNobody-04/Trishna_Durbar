import { NextRequest, NextResponse } from "next/server";
import { startDiningOrder } from "@/server/services/dining.service";
import { requireAuth } from "@/server/auth/rbac";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    if (!body.tableId) {
      return NextResponse.json({ error: "Table ID is required" }, { status: 400 });
    }

    const order = await startDiningOrder({
      tableId: body.tableId,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      guestCount: Number(body.guestCount) || 1,
      notes: body.notes,
      items: body.items || [],
      userId: user.id,
      userName: user.name,
    });

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to start order" },
      { status: 400 }
    );
  }
}
