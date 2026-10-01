import { NextRequest, NextResponse } from "next/server";
import {
  addItemsToDiningOrder,
  removeOrderItem,
} from "@/server/services/dining.service";
import { requireAuth } from "@/server/auth/rbac";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const { items } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Items array is required" },
        { status: 400 }
      );
    }

    const updatedOrder = await addItemsToDiningOrder(
      id,
      items,
      user.id,
      user.name
    );

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to add items" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    await removeOrderItem(itemId, user.id, user.name);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to remove item" },
      { status: 400 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { itemId, unitPrice, quantity, notes, name } = body;

    if (!itemId) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    const { updateOrderItem } = await import("@/server/services/dining.service");
    const updated = await updateOrderItem(
      itemId,
      {
        unitPrice: unitPrice !== undefined ? parseFloat(unitPrice) : undefined,
        quantity: quantity !== undefined ? parseInt(quantity) : undefined,
        notes,
        name,
      },
      user.id,
      user.name
    );

    return NextResponse.json({ success: true, item: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update item" },
      { status: 400 }
    );
  }
}

