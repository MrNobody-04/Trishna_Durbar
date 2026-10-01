import { NextRequest, NextResponse } from "next/server";
import {
  getMenuItems,
  createMenuItem,
  toggleMenuItemAvailability,
} from "@/server/services/menu.service";
import { requireAuth } from "@/server/auth/rbac";

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;

    const items = await getMenuItems(category, search);
    return NextResponse.json(
      { items },
      {
        headers: {
          "Cache-Control": "private, max-age=15, stale-while-revalidate=60",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch menu" },
      { status: error?.statusCode || 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const body = await req.json();

    if (!body.nameEnglish || !body.price || !body.category) {
      return NextResponse.json(
        { error: "Item name, category and price are required" },
        { status: 400 }
      );
    }

    const item = await createMenuItem({
      nameNepali: body.nameNepali || body.nameEnglish,
      nameEnglish: body.nameEnglish,
      category: body.category,
      portion: body.portion || "REGULAR",
      price: Number(body.price),
      description: body.description,
    });

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to create menu item" },
      { status: 400 }
    );
  }
}
