import { NextRequest, NextResponse } from "next/server";
import { getDiningOrderById } from "@/server/services/dining.service";
import { requireAuth } from "@/server/auth/rbac";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const order = await getDiningOrderById(id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch order" },
      { status: 500 }
    );
  }
}
