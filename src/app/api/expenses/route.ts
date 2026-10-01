import { NextRequest, NextResponse } from "next/server";
import {
  getExpenses,
  createExpense,
  deleteExpense,
} from "@/server/services/expense.service";
import { requireAuth } from "@/server/auth/rbac";
import { TimePeriod } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const period = (searchParams.get("period") as TimePeriod) || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const expenses = await getExpenses({ category, period, startDate, endDate });
    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

    return NextResponse.json({ expenses, totalAmount });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch expenses" },
      { status: error?.statusCode || 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    if (!body.title || !body.amount || !body.category) {
      return NextResponse.json(
        { error: "Title, category and amount are required" },
        { status: 400 }
      );
    }

    const expense = await createExpense({
      title: body.title,
      amount: Number(body.amount),
      category: body.category,
      date: body.date,
      paymentMethod: body.paymentMethod || "CASH",
      notes: body.notes,
      receiptUrl: body.receiptUrl,
      userId: user.id,
      userName: user.name,
    });

    return NextResponse.json({ success: true, expense });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to record expense" },
      { status: 400 }
    );
  }
}
