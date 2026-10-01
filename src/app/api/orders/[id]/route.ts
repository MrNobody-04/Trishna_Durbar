import { NextRequest, NextResponse } from "next/server";
import {
  getDiningOrderById,
  deleteDiningOrder,
} from "@/server/services/dining.service";
import { requireAuth, requireRole } from "@/server/auth/rbac";

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
      { status: error?.statusCode || 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Strictly restrict order deletion to OWNER only
    const user = await requireRole(["OWNER"]);
    const { id } = await params;

    await deleteDiningOrder(id, {
      id: user.id,
      name: user.name,
      role: user.role,
    });

    return NextResponse.json({
      success: true,
      message: "Order record permanently deleted by Owner",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Only the restaurant Owner can delete orders" },
      { status: error?.statusCode || 403 }
    );
  }
}
