import { NextRequest, NextResponse } from "next/server";
import { getDashboardMetrics } from "@/server/services/analytics.service";
import { requireAuth } from "@/server/auth/rbac";
import { TimePeriod } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(req.url);
    const period = (searchParams.get("period") as TimePeriod) || "today";

    const metrics = await getDashboardMetrics(period);
    const response = NextResponse.json({ metrics });
    response.headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate");
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch analytics" },
      { status: error?.statusCode || 500 }
    );
  }
}
