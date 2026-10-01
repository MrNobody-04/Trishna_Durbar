import { NextRequest, NextResponse } from "next/server";
import {
  toggleMenuItemAvailability,
  updateMenuItem,
  deleteMenuItem,
} from "@/server/services/menu.service";
import { requireAuth } from "@/server/auth/rbac";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    let body: any = {};
    try {
      body = await req.json();
    } catch {}

    if (body && Object.keys(body).length > 0) {
      const updated = await updateMenuItem(id, {
        price: body.price !== undefined ? parseFloat(body.price) : undefined,
        nameEnglish: body.nameEnglish,
        nameNepali: body.nameNepali,
        category: body.category,
        portion: body.portion,
        description: body.description,
        comboItems: body.comboItems,
        isAvailable: body.isAvailable,
      });
      return NextResponse.json({ success: true, item: updated });
    }

    const item = await toggleMenuItemAvailability(id);
    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update item" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    await deleteMenuItem(id);

    return NextResponse.json({ success: true, message: "Dish removed from menu" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to delete item" },
      { status: 400 }
    );
  }
}
