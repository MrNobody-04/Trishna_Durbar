import { NextRequest, NextResponse } from "next/server";
import { deleteCategory } from "@/server/services/menu.service";
import { requireAuth } from "@/server/auth/rbac";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    await deleteCategory(id);

    return NextResponse.json({ success: true, message: "Category deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to delete category" },
      { status: error?.statusCode || 400 }
    );
  }
}
