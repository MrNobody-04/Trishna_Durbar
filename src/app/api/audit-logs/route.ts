import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuth } from "@/server/auth/rbac";

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit")) || 50;

    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: "desc" },
      take: limit,
      include: {
        user: { select: { id: true, name: true, role: true } },
      },
    });

    return NextResponse.json({ logs });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch audit logs" },
      { status: error?.statusCode || 500 }
    );
  }
}
