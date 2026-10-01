import prisma from "@/lib/db";

export interface LogAuditInput {
  userId?: string | null;
  userName: string;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, any> | null;
  ipAddress?: string | null;
}

export async function logAuditEvent(input: LogAuditInput) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId: input.userId || null,
        userName: input.userName,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId || null,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        ipAddress: input.ipAddress || null,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log event:", error);
    return null;
  }
}
