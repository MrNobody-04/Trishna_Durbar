import { NextRequest, NextResponse } from "next/server";
import {
  startDiningOrder,
  getDiningOrderHistory,
} from "@/server/services/dining.service";
import { requireAuth } from "@/server/auth/rbac";

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status") || "ALL";
    const search = searchParams.get("search") || undefined;
    const limit = Number(searchParams.get("limit")) || 50;
    const page = Number(searchParams.get("page")) || 1;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const data = await getDiningOrderHistory({
      status,
      search,
      limit,
      page,
      startDate,
      endDate,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch orders" },
      { status: error?.statusCode || 500 }
    );
  }
}

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
