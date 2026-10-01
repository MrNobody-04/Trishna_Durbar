import { NextRequest, NextResponse } from "next/server";
import { deleteDiningTable, updateDiningTable } from "@/server/services/dining.service";
import { requireAuth } from "@/server/auth/rbac";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    await deleteDiningTable(id, user.id, user.name);

    return NextResponse.json({ success: true, message: "Table removed successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to remove table" },
      { status: error?.statusCode || 400 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await req.json();

    const updated = await updateDiningTable(
      id,
      {
        name: body.name,
        floor: body.floor,
        capacity: body.capacity ? parseInt(body.capacity) : undefined,
        notes: body.notes,
      },
      user.id,
      user.name
    );

    return NextResponse.json({ success: true, table: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update table" },
      { status: error?.statusCode || 400 }
    );
  }
}
