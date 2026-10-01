import { NextRequest, NextResponse } from "next/server";
import { deleteExpense } from "@/server/services/expense.service";
import { requireAuth } from "@/server/auth/rbac";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    await deleteExpense(id, user.id, user.name);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to delete expense" },
      { status: 400 }
    );
  }
}
