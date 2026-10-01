import prisma from "@/lib/db";
import { logAuditEvent } from "./audit.service";
import { FloorArea, TableStatus } from "@/types";

const TX_OPTIONS = { maxWait: 15000, timeout: 25000 };

export interface DiningOrderItemInput {
  name: string;
  category?: string;
  portion?: string;
  quantity: number;
  unitPrice: number;
  notes?: string | null;
}

export interface StartDiningOrderInput {
  tableId: string;
  customerName?: string | null;
  customerPhone?: string | null;
  guestCount?: number;
  notes?: string | null;
  items?: DiningOrderItemInput[];
  userId: string;
  userName: string;
}

export async function getDiningTables(floorFilter?: FloorArea | string) {
  const where: any = {};
  if (floorFilter && floorFilter !== "ALL") {
    where.floor = floorFilter;
  }

  const tables = await prisma.diningTable.findMany({
    where,
    orderBy: [{ name: "asc" }],
    include: {
      orders: {
        where: { status: "ACTIVE" },
        include: {
          items: {
            orderBy: { createdAt: "asc" },
          },
          payments: {
            orderBy: { timestamp: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  return tables.map((t) => {
    const activeOrder = t.orders[0] || null;
    return {
      id: t.id,
      name: t.name,
      floor: t.floor as FloorArea,
      status: t.status as TableStatus,
      capacity: t.capacity,
      notes: t.notes,
      activeOrder: activeOrder
        ? {
            id: activeOrder.id,
            customerName: activeOrder.customerName || "Walk-in Guest",
            customerPhone: activeOrder.customerPhone,
            guestCount: activeOrder.guestCount,
            status: activeOrder.status,
            subtotal: activeOrder.subtotal,
            discount: activeOrder.discount,
            totalAmount: activeOrder.totalAmount,
            paidAmount: activeOrder.paidAmount,
            paymentMethod: activeOrder.paymentMethod,
            notes: activeOrder.notes,
            kotPrinted: activeOrder.kotPrinted,
            createdAt: activeOrder.createdAt,
            items: activeOrder.items.map((it) => ({
              id: it.id,
              name: it.name,
              category: it.category,
              portion: it.portion,
              quantity: it.quantity,
              unitPrice: it.unitPrice,
              total: it.total,
              notes: it.notes,
            })),
            payments: activeOrder.payments.map((p) => ({
              id: p.id,
              amount: p.amount,
              method: p.method,
              tendered: p.tendered,
              changeReturn: p.changeReturn,
              notes: p.notes,
              recordedByName: p.recordedByName,
              timestamp: p.timestamp,
            })),
          }
        : null,
    };
  });
}

export async function getDiningOrderById(orderId: string) {
  return await prisma.diningOrder.findUnique({
    where: { id: orderId },
    include: {
      table: true,
      items: {
        orderBy: { createdAt: "asc" },
      },
      payments: {
        orderBy: { timestamp: "asc" },
      },
    },
  });
}

export async function startDiningOrder(input: StartDiningOrderInput) {
  return await prisma.$transaction(async (tx) => {
    const table = await tx.diningTable.findUnique({
      where: { id: input.tableId },
    });

    if (!table) {
      throw new Error("Dining table not found");
    }

    const existingOrder = await tx.diningOrder.findFirst({
      where: { tableId: input.tableId, status: "ACTIVE" },
    });

    if (existingOrder) {
      throw new Error(`Table ${table.name} already has an active order`);
    }

    const items = input.items || [];
    const subtotal = items.reduce((acc, it) => acc + it.quantity * it.unitPrice, 0);
    const totalAmount = subtotal;

    const order = await tx.diningOrder.create({
      data: {
        tableId: input.tableId,
        customerName: input.customerName || "Walk-in Guest",
        customerPhone: input.customerPhone || null,
        guestCount: input.guestCount || 1,
        notes: input.notes || null,
        status: "ACTIVE",
        subtotal,
        discount: 0,
        totalAmount,
        paidAmount: 0,
        createdById: input.userId,
        createdByName: input.userName,
        items: {
          create: items.map((it) => ({
            name: it.name,
            category: it.category || "FOOD",
            portion: it.portion || "REGULAR",
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            total: it.quantity * it.unitPrice,
            notes: it.notes || null,
          })),
        },
      },
      include: {
        table: true,
        items: true,
      },
    });

    // Mark table as occupied
    await tx.diningTable.update({
      where: { id: input.tableId },
      data: { status: "OCCUPIED" },
    });

    await logAuditEvent({
      userId: input.userId,
      userName: input.userName,
      action: "START_DINING_ORDER",
      entity: "DiningOrder",
      entityId: order.id,
      metadata: {
        tableName: table.name,
        customerName: order.customerName,
        guestCount: order.guestCount,
        initialItemCount: items.length,
        initialTotal: totalAmount,
      },
    });

    return order;
  }, TX_OPTIONS);
}

export async function addItemsToDiningOrder(
  orderId: string,
  items: DiningOrderItemInput[],
  userId: string,
  userName: string
) {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.diningOrder.findUnique({
      where: { id: orderId },
      include: { items: true, table: true },
    });

    if (!order || order.status !== "ACTIVE") {
      throw new Error("Active dining order not found");
    }

    for (const it of items) {
      await tx.diningOrderItem.create({
        data: {
          orderId,
          name: it.name,
          category: it.category || "FOOD",
          portion: it.portion || "REGULAR",
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          total: it.quantity * it.unitPrice,
          notes: it.notes || null,
        },
      });
    }

    const allItems = await tx.diningOrderItem.findMany({
      where: { orderId },
    });

    const newSubtotal = allItems.reduce((acc, it) => acc + it.total, 0);
    const newTotal = Math.max(0, newSubtotal - order.discount);

    const updated = await tx.diningOrder.update({
      where: { id: orderId },
      data: {
        subtotal: newSubtotal,
        totalAmount: newTotal,
        kotPrinted: false, // reset so staff prints fresh KOT for kitchen
      },
      include: {
        table: true,
        items: true,
        payments: true,
      },
    });

    await logAuditEvent({
      userId,
      userName,
      action: "ADD_ITEMS_DINING_ORDER",
      entity: "DiningOrder",
      entityId: orderId,
      metadata: {
        tableName: order.table.name,
        itemsAdded: items.length,
        newTotal,
      },
    });

    return updated;
  }, TX_OPTIONS);
}

export async function removeOrderItem(
  orderItemId: string,
  userId: string,
  userName: string
) {
  return await prisma.$transaction(async (tx) => {
    const item = await tx.diningOrderItem.findUnique({
      where: { id: orderItemId },
      include: { order: true },
    });

    if (!item) throw new Error("Order item not found");
    if (item.order.status !== "ACTIVE") throw new Error("Cannot modify settled order");

    await tx.diningOrderItem.delete({ where: { id: orderItemId } });

    const remainingItems = await tx.diningOrderItem.findMany({
      where: { orderId: item.orderId },
    });

    const newSubtotal = remainingItems.reduce((acc, it) => acc + it.total, 0);
    const newTotal = Math.max(0, newSubtotal - item.order.discount);

    await tx.diningOrder.update({
      where: { id: item.orderId },
      data: {
        subtotal: newSubtotal,
        totalAmount: newTotal,
      },
    });

    await logAuditEvent({
      userId,
      userName,
      action: "REMOVE_ORDER_ITEM",
      entity: "DiningOrderItem",
      entityId: orderItemId,
      metadata: {
        itemName: item.name,
        removedTotal: item.total,
        newOrderTotal: newTotal,
      },
    });

    return { success: true };
  }, TX_OPTIONS);
}

export async function applyOrderDiscount(
  orderId: string,
  discount: number,
  userId: string,
  userName: string
) {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.diningOrder.findUnique({ where: { id: orderId } });
    if (!order || order.status !== "ACTIVE") throw new Error("Active order not found");

    const cleanDiscount = Math.max(0, discount);
    const newTotal = Math.max(0, order.subtotal - cleanDiscount);

    const updated = await tx.diningOrder.update({
      where: { id: orderId },
      data: {
        discount: cleanDiscount,
        totalAmount: newTotal,
      },
    });

    await logAuditEvent({
      userId,
      userName,
      action: "APPLY_DISCOUNT",
      entity: "DiningOrder",
      entityId: orderId,
      metadata: { discount: cleanDiscount, newTotal },
    });

    return updated;
  }, TX_OPTIONS);
}

export async function recordDiningPayment(
  orderId: string,
  amount: number,
  method: string,
  tendered: number | null,
  notes: string | null,
  userId: string,
  userName: string
) {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.diningOrder.findUnique({
      where: { id: orderId },
      include: { payments: true },
    });

    if (!order || order.status !== "ACTIVE") {
      throw new Error("Active order not found");
    }

    const changeReturn = tendered && tendered > amount ? tendered - amount : 0;

    await tx.diningPayment.create({
      data: {
        orderId,
        amount,
        method,
        tendered: tendered || null,
        changeReturn: changeReturn || null,
        notes: notes || null,
        recordedByName: userName,
      },
    });

    const allPayments = await tx.diningPayment.findMany({
      where: { orderId },
    });

    const totalPaid = allPayments.reduce((acc, p) => acc + p.amount, 0);

    const updated = await tx.diningOrder.update({
      where: { id: orderId },
      data: {
        paidAmount: totalPaid,
        paymentMethod: allPayments.length > 1 ? "SPLIT" : method,
      },
      include: {
        table: true,
        items: true,
        payments: true,
      },
    });

    await logAuditEvent({
      userId,
      userName,
      action: "RECORD_PAYMENT",
      entity: "DiningPayment",
      entityId: orderId,
      metadata: {
        amount,
        method,
        totalPaid,
        balanceRemaining: Math.max(0, updated.totalAmount - totalPaid),
      },
    });

    return updated;
  }, TX_OPTIONS);
}

export async function markKotPrinted(orderId: string) {
  return await prisma.diningOrder.update({
    where: { id: orderId },
    data: { kotPrinted: true },
  });
}

export async function settleDiningOrder(
  orderId: string,
  userId: string,
  userName: string
) {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.diningOrder.findUnique({
      where: { id: orderId },
      include: { table: true, payments: true },
    });

    if (!order || order.status !== "ACTIVE") {
      throw new Error("Active order not found");
    }

    const remaining = order.totalAmount - order.paidAmount;
    if (remaining > 0.01) {
      throw new Error(
        `Cannot settle table with unpaid balance of Rs. ${remaining.toFixed(2)}. Please record payment first.`
      );
    }

    const settled = await tx.diningOrder.update({
      where: { id: orderId },
      data: {
        status: "COMPLETED",
        settledAt: new Date(),
      },
    });

    // Release table back to available
    await tx.diningTable.update({
      where: { id: order.tableId },
      data: { status: "AVAILABLE" },
    });

    await logAuditEvent({
      userId,
      userName,
      action: "SETTLE_DINING_ORDER",
      entity: "DiningOrder",
      entityId: orderId,
      metadata: {
        tableName: order.table.name,
        totalAmount: order.totalAmount,
        paidAmount: order.paidAmount,
      },
    });

    return settled;
  }, TX_OPTIONS);
}

export async function cancelDiningOrder(
  orderId: string,
  reason: string,
  userId: string,
  userName: string
) {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.diningOrder.findUnique({
      where: { id: orderId },
      include: { table: true },
    });

    if (!order || order.status !== "ACTIVE") {
      throw new Error("Active order not found");
    }

    const cancelled = await tx.diningOrder.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        notes: order.notes ? `${order.notes} [Cancelled: ${reason}]` : `Cancelled: ${reason}`,
      },
    });

    await tx.diningTable.update({
      where: { id: order.tableId },
      data: { status: "AVAILABLE" },
    });

    await logAuditEvent({
      userId,
      userName,
      action: "CANCEL_DINING_ORDER",
      entity: "DiningOrder",
      entityId: orderId,
      metadata: {
        tableName: order.table.name,
        reason,
      },
    });

    return cancelled;
  }, TX_OPTIONS);
}

export async function createDiningTable(
  input: { name: string; floor: string; capacity?: number; notes?: string },
  userId: string,
  userName: string
) {
  const existing = await prisma.diningTable.findUnique({
    where: { name: input.name.trim() },
  });
  if (existing) {
    throw new Error(`Table with name "${input.name.trim()}" already exists`);
  }

  const table = await prisma.diningTable.create({
    data: {
      name: input.name.trim(),
      floor: input.floor.trim(),
      capacity: input.capacity && input.capacity > 0 ? input.capacity : 4,
      notes: input.notes?.trim() || null,
      status: "AVAILABLE",
    },
  });

  await logAuditEvent({
    userId,
    userName,
    action: "CREATE_DINING_TABLE",
    entity: "DiningTable",
    entityId: table.id,
    metadata: { name: table.name, floor: table.floor, capacity: table.capacity },
  });

  return table;
}

export async function deleteDiningTable(
  tableId: string,
  userId: string,
  userName: string
) {
  return await prisma.$transaction(async (tx) => {
    const table = await tx.diningTable.findUnique({
      where: { id: tableId },
      include: {
        orders: {
          where: { status: "ACTIVE" },
        },
      },
    });

    if (!table) throw new Error("Table not found");

    if (table.orders.length > 0) {
      throw new Error(
        `Cannot remove table "${table.name}" because it currently has an ACTIVE order. Please settle or cancel the active order first.`
      );
    }

    // Clean up items and payments for historical orders if any, then delete table
    await tx.diningOrderItem.deleteMany({
      where: { order: { tableId } },
    });
    await tx.diningPayment.deleteMany({
      where: { order: { tableId } },
    });
    await tx.diningOrder.deleteMany({
      where: { tableId },
    });
    await tx.diningTable.delete({
      where: { id: tableId },
    });

    await logAuditEvent({
      userId,
      userName,
      action: "DELETE_DINING_TABLE",
      entity: "DiningTable",
      entityId: tableId,
      metadata: { tableName: table.name, floor: table.floor },
    });

    return { success: true };
  }, TX_OPTIONS);
}

export async function updateDiningTable(
  tableId: string,
  input: { name?: string; floor?: string; capacity?: number; notes?: string },
  userId: string,
  userName: string
) {
  const table = await prisma.diningTable.findUnique({ where: { id: tableId } });
  if (!table) throw new Error("Table not found");

  if (input.name && input.name.trim() !== table.name) {
    const conflict = await prisma.diningTable.findUnique({
      where: { name: input.name.trim() },
    });
    if (conflict) {
      throw new Error(`Another table with name "${input.name.trim()}" already exists`);
    }
  }

  const updated = await prisma.diningTable.update({
    where: { id: tableId },
    data: {
      name: input.name?.trim() || table.name,
      floor: input.floor?.trim() || table.floor,
      capacity: input.capacity && input.capacity > 0 ? input.capacity : table.capacity,
      notes: input.notes !== undefined ? input.notes : table.notes,
    },
  });

  await logAuditEvent({
    userId,
    userName,
    action: "UPDATE_DINING_TABLE",
    entity: "DiningTable",
    entityId: tableId,
    metadata: { name: updated.name, floor: updated.floor, capacity: updated.capacity },
  });

  return updated;
}

export async function updateOrderItem(
  orderItemId: string,
  input: { unitPrice?: number; quantity?: number; notes?: string; name?: string },
  userId: string,
  userName: string
) {
  return await prisma.$transaction(async (tx) => {
    const item = await tx.diningOrderItem.findUnique({
      where: { id: orderItemId },
      include: { order: true },
    });

    if (!item) throw new Error("Order item not found");
    if (item.order.status !== "ACTIVE") throw new Error("Cannot modify settled order");

    const newUnitPrice =
      input.unitPrice !== undefined && input.unitPrice >= 0
        ? input.unitPrice
        : item.unitPrice;
    const newQuantity =
      input.quantity !== undefined && input.quantity > 0
        ? input.quantity
        : item.quantity;
    const newTotal = newUnitPrice * newQuantity;

    const updatedItem = await tx.diningOrderItem.update({
      where: { id: orderItemId },
      data: {
        unitPrice: newUnitPrice,
        quantity: newQuantity,
        total: newTotal,
        name: input.name?.trim() || item.name,
        notes: input.notes !== undefined ? input.notes : item.notes,
      },
    });

    // Recalculate order subtotal
    const allItems = await tx.diningOrderItem.findMany({
      where: { orderId: item.orderId },
    });
    const newSubtotal = allItems.reduce((sum, it) => sum + it.total, 0);

    // Recalculate discount based on discountPercent if set, or preserve/clamp current discount
    let discount = item.order.discount;
    if (item.order.discountPercent > 0) {
      discount = (newSubtotal * item.order.discountPercent) / 100;
    } else if (discount > newSubtotal) {
      discount = newSubtotal;
    }

    const newTotalAmount = Math.max(0, newSubtotal - discount);

    await tx.diningOrder.update({
      where: { id: item.orderId },
      data: {
        subtotal: newSubtotal,
        discount,
        totalAmount: newTotalAmount,
      },
    });

    await logAuditEvent({
      userId,
      userName,
      action: "UPDATE_ORDER_ITEM",
      entity: "DiningOrderItem",
      entityId: orderItemId,
      metadata: {
        itemName: updatedItem.name,
        unitPrice: newUnitPrice,
        quantity: newQuantity,
        itemTotal: newTotal,
        newOrderTotal: newTotalAmount,
      },
    });

    return updatedItem;
  }, TX_OPTIONS);
}

export async function updateOrderPricing(
  orderId: string,
  input: {
    discount?: number;
    discountPercent?: number;
    overrideTotal?: number;
  },
  userId: string,
  userName: string
) {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.diningOrder.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order || order.status !== "ACTIVE") {
      throw new Error("Active order not found");
    }

    const subtotal = order.subtotal;
    let finalDiscount = 0;
    let finalDiscountPercent = 0;

    if (input.overrideTotal !== undefined && input.overrideTotal >= 0) {
      // User specified an exact total (e.g., rounded bill)
      const targetTotal = input.overrideTotal;
      finalDiscount = Math.max(0, subtotal - targetTotal);
      finalDiscountPercent = subtotal > 0 ? (finalDiscount / subtotal) * 100 : 0;
    } else if (input.discountPercent !== undefined && input.discountPercent >= 0) {
      // User entered discount percentage
      finalDiscountPercent = Math.min(100, input.discountPercent);
      finalDiscount = (subtotal * finalDiscountPercent) / 100;
    } else if (input.discount !== undefined && input.discount >= 0) {
      // User entered fixed discount in rupees
      finalDiscount = Math.min(subtotal, input.discount);
      finalDiscountPercent = subtotal > 0 ? (finalDiscount / subtotal) * 100 : 0;
    }

    const totalAmount = Math.max(0, subtotal - finalDiscount);

    const updated = await tx.diningOrder.update({
      where: { id: orderId },
      data: {
        discount: finalDiscount,
        discountPercent: finalDiscountPercent,
        totalAmount,
      },
      include: {
        table: true,
        items: true,
        payments: true,
      },
    });

    await logAuditEvent({
      userId,
      userName,
      action: "UPDATE_ORDER_PRICING",
      entity: "DiningOrder",
      entityId: orderId,
      metadata: {
        subtotal,
        discount: finalDiscount,
        discountPercent: finalDiscountPercent,
        totalAmount,
      },
    });

    return updated;
  }, TX_OPTIONS);
}
