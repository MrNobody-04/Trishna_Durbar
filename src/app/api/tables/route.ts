import { NextRequest, NextResponse } from "next/server";
import { getDiningTables } from "@/server/services/dining.service";
import { requireAuth } from "@/server/auth/rbac";

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(req.url);
    const floor = searchParams.get("floor") || undefined;

    const tables = await getDiningTables(floor);
    return NextResponse.json({ tables });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch tables" },
      { status: error?.statusCode || 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    if (!body.name || !body.floor) {
      return NextResponse.json(
        { error: "Table name and floor area are required" },
        { status: 400 }
      );
    }

    const { createDiningTable } = await import("@/server/services/dining.service");
    const table = await createDiningTable(
      {
        name: body.name,
        floor: body.floor,
        capacity: body.capacity ? parseInt(body.capacity) : 4,
        notes: body.notes || null,
      },
      user.id,
      user.name
    );

    return NextResponse.json({ success: true, table }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to create table" },
      { status: error?.statusCode || 400 }
    );
  }
}

