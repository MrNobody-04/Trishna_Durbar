import { NextRequest, NextResponse } from "next/server";
import { getCategories, createCategory } from "@/server/services/menu.service";
import { requireAuth } from "@/server/auth/rbac";

export async function GET() {
  try {
    await requireAuth();
    const categories = await getCategories();
    return NextResponse.json({ categories });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch categories" },
      { status: error?.statusCode || 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const body = await req.json();

    if (!body.name || !body.label) {
      return NextResponse.json(
        { error: "Category code/name and display label are required" },
        { status: 400 }
      );
    }

    const category = await createCategory({
      name: body.name,
      label: body.label,
      icon: body.icon,
    });

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to create category" },
      { status: error?.statusCode || 400 }
    );
  }
}
