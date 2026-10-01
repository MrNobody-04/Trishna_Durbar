import prisma from "@/lib/db";
import { getNepalDateRange, TimePeriod } from "@/lib/utils";
import { logAuditEvent } from "./audit.service";
import { ExpenseCategory } from "@/types";

export interface CreateExpenseInput {
  title: string;
  amount: number;
  category: ExpenseCategory | string;
  date?: Date | string;
  paymentMethod?: string;
  notes?: string | null;
  receiptUrl?: string | null;
  userId: string;
  userName: string;
}

export async function getExpenses(options?: {
  category?: string;
  period?: TimePeriod;
  startDate?: string;
  endDate?: string;
}) {
  const where: any = {};

  if (options?.category && options.category !== "ALL") {
    where.category = options.category;
  }

  if (options?.startDate && options?.endDate) {
    where.date = {
      gte: new Date(options.startDate),
      lte: new Date(options.endDate),
    };
  } else if (options?.period && options.period !== "all") {
    const range = getNepalDateRange(options.period);
    where.date = {
      gte: range.start,
      lte: range.end,
    };
  }

  return await prisma.expense.findMany({
    where,
    orderBy: { date: "desc" },
    include: {
      createdBy: {
        select: { id: true, name: true, role: true },
      },
    },
  });
}

export async function createExpense(input: CreateExpenseInput) {
  const expense = await prisma.expense.create({
    data: {
      title: input.title,
      amount: input.amount,
      category: input.category,
      date: input.date ? new Date(input.date) : new Date(),
      paymentMethod: input.paymentMethod || "CASH",
      notes: input.notes || null,
      receiptUrl: input.receiptUrl || null,
      createdById: input.userId,
    },
    include: {
      createdBy: {
        select: { id: true, name: true },
      },
    },
  });

  await logAuditEvent({
    userId: input.userId,
    userName: input.userName,
    action: "CREATE_EXPENSE",
    entity: "Expense",
    entityId: expense.id,
    metadata: {
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
    },
  });

  return expense;
}

export async function deleteExpense(
  id: string,
  userId: string,
  userName: string
) {
  const expense = await prisma.expense.findUnique({ where: { id } });
  if (!expense) throw new Error("Expense record not found");

  await prisma.expense.delete({ where: { id } });

  await logAuditEvent({
    userId,
    userName,
    action: "DELETE_EXPENSE",
    entity: "Expense",
    entityId: id,
    metadata: {
      title: expense.title,
      amount: expense.amount,
    },
  });

  return { success: true };
}
