import { NextRequest, NextResponse } from "next/server";
import {
  getActivePaymentQrs,
  createPaymentQr,
} from "@/server/services/payment-qr.service";
import { requireAuth } from "@/server/auth/rbac";

export async function GET() {
  try {
    await requireAuth();
    const qrs = await getActivePaymentQrs();
    return NextResponse.json({ qrs });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch QR codes" },
      { status: error?.statusCode || 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    if (!body.bankName || !body.accountName || !body.qrImageUrl) {
      return NextResponse.json(
        { error: "Bank name, account name and QR image URL are required" },
        { status: 400 }
      );
    }

    const qr = await createPaymentQr(
      {
        bankName: body.bankName,
        accountName: body.accountName,
        accountNumber: body.accountNumber || "N/A",
        qrImageUrl: body.qrImageUrl,
        notes: body.notes,
        isDefault: body.isDefault,
      },
      user.id,
      user.name
    );

    return NextResponse.json({ success: true, qr });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to create QR code" },
      { status: 400 }
    );
  }
}
