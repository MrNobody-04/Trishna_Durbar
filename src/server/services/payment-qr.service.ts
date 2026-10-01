import prisma from "@/lib/db";
import { logAuditEvent } from "./audit.service";

export interface CreatePaymentQrInput {
  bankName: string;
  accountName: string;
  accountNumber: string;
  qrImageUrl: string;
  notes?: string | null;
  isDefault?: boolean;
}

export async function getActivePaymentQrs() {
  return await prisma.paymentQr.findMany({
    where: { isActive: true },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

export async function getDefaultPaymentQr() {
  return await prisma.paymentQr.findFirst({
    where: { isActive: true, isDefault: true },
  });
}

export async function createPaymentQr(
  input: CreatePaymentQrInput,
  userId: string,
  userName: string
) {
  if (input.isDefault) {
    await prisma.paymentQr.updateMany({
      where: { isDefault: true },
      data: { isDefault: false },
    });
  }

  const qr = await prisma.paymentQr.create({
    data: {
      bankName: input.bankName,
      accountName: input.accountName,
      accountNumber: input.accountNumber,
      qrImageUrl: input.qrImageUrl,
      notes: input.notes || null,
      isDefault: input.isDefault ?? false,
      isActive: true,
    },
  });

  await logAuditEvent({
    userId,
    userName,
    action: "CREATE_PAYMENT_QR",
    entity: "PaymentQr",
    entityId: qr.id,
    metadata: { bankName: qr.bankName, accountName: qr.accountName },
  });

  return qr;
}

export interface UpdatePaymentQrInput {
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  qrImageUrl?: string;
  notes?: string | null;
  isDefault?: boolean;
}

export async function updatePaymentQr(
  id: string,
  input: UpdatePaymentQrInput,
  userId: string,
  userName: string
) {
  if (input.isDefault) {
    await prisma.paymentQr.updateMany({
      where: { isDefault: true, NOT: { id } },
      data: { isDefault: false },
    });
  }

  const updated = await prisma.paymentQr.update({
    where: { id },
    data: {
      ...(input.bankName && { bankName: input.bankName }),
      ...(input.accountName && { accountName: input.accountName }),
      ...(input.accountNumber !== undefined && { accountNumber: input.accountNumber }),
      ...(input.qrImageUrl && { qrImageUrl: input.qrImageUrl }),
      ...(input.notes !== undefined && { notes: input.notes }),
      ...(input.isDefault !== undefined && { isDefault: input.isDefault }),
    },
  });

  await logAuditEvent({
    userId,
    userName,
    action: "UPDATE_PAYMENT_QR",
    entity: "PaymentQr",
    entityId: id,
    metadata: { bankName: updated.bankName, accountName: updated.accountName },
  });

  return updated;
}

export async function deletePaymentQr(
  id: string,
  userId: string,
  userName: string
) {
  await prisma.paymentQr.delete({ where: { id } });
  await logAuditEvent({
    userId,
    userName,
    action: "DELETE_PAYMENT_QR",
    entity: "PaymentQr",
    entityId: id,
  });
  return { success: true };
}

