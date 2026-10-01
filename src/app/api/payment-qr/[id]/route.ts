import { NextRequest, NextResponse } from "next/server";
import {
  updatePaymentQr,
  deletePaymentQr,
} from "@/server/services/payment-qr.service";
import { requireAuth } from "@/server/auth/rbac";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await req.json();

    const qr = await updatePaymentQr(
      id,
      {
        bankName: body.bankName,
        accountName: body.accountName,
        accountNumber: body.accountNumber,
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
      { error: error?.message || "Failed to update QR code" },
      { status: error?.statusCode || 400 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    await deletePaymentQr(id, user.id, user.name);

    return NextResponse.json({ success: true, message: "QR code deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to delete QR code" },
      { status: error?.statusCode || 400 }
    );
  }
}
