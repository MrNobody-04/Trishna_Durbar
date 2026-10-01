import { NextRequest, NextResponse } from "next/server";
import { applyOrderDiscount } from "@/server/services/dining.service";
import { requireAuth } from "@/server/auth/rbac";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await req.json();
    const { discount, discountPercent, overrideTotal } = body;

    const { updateOrderPricing } = await import("@/server/services/dining.service");
    const updated = await updateOrderPricing(
      id,
      {
        discount: discount !== undefined ? Number(discount) : undefined,
        discountPercent: discountPercent !== undefined ? Number(discountPercent) : undefined,
        overrideTotal: overrideTotal !== undefined ? Number(overrideTotal) : undefined,
      },
      user.id,
      user.name
    );

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update order pricing" },
      { status: 400 }
    );
  }
}
