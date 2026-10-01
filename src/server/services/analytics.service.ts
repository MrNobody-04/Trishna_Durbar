import prisma from "@/lib/db";
import { getNepalDateRange, TimePeriod } from "@/lib/utils";

export async function getDashboardMetrics(period: TimePeriod = "today") {
  const range = getNepalDateRange(period);

  // 1. Orders within period
  const orders = await prisma.diningOrder.findMany({
    where: {
      status: "COMPLETED",
      settledAt: {
        gte: range.start,
        lte: range.end,
      },
    },
    include: {
      items: true,
      table: true,
    },
  });

  const totalRevenue = orders.reduce((sum, o) => sum + o.paidAmount, 0);
  const totalOrders = orders.length;
  const totalGuests = orders.reduce((sum, o) => sum + o.guestCount, 0);

  // 2. Expenses within period
  const expenses = await prisma.expense.findMany({
    where: {
      date: {
        gte: range.start,
        lte: range.end,
      },
    },
  });

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpense;

  // 3. Current Live Status of all 9 tables
  const allTables = await prisma.diningTable.findMany({
    include: {
      orders: {
        where: { status: "ACTIVE" },
        include: { items: true },
      },
    },
  });

  const totalTables = allTables.length;
  const occupiedTables = allTables.filter((t) => t.status === "OCCUPIED").length;
  const tableOccupancyRate = totalTables > 0 ? (occupiedTables / totalTables) * 100 : 0;
  const currentActiveDiners = allTables.reduce(
    (sum, t) => sum + (t.orders[0]?.guestCount || 0),
    0
  );
  const runningUnsettledRevenue = allTables.reduce(
    (sum, t) => sum + (t.orders[0]?.totalAmount || 0),
    0
  );

  // 4. Sales by Floor Area
  const floorRevenueMap: Record<string, number> = {
    GROUND: 0,
    HALL: 0,
    FIRST_FLOOR: 0,
    ROOFTOP: 0,
  };

  orders.forEach((o) => {
    const fl = o.table.floor || "HALL";
    floorRevenueMap[fl] = (floorRevenueMap[fl] || 0) + o.paidAmount;
  });

  const floorStats = [
    { floor: "GROUND", name: "Ground Floor", revenue: floorRevenueMap.GROUND },
    { floor: "HALL", name: "Main Hall", revenue: floorRevenueMap.HALL },
    { floor: "FIRST_FLOOR", name: "First Floor", revenue: floorRevenueMap.FIRST_FLOOR },
    { floor: "ROOFTOP", name: "Rooftop Terrace", revenue: floorRevenueMap.ROOFTOP },
  ];

  // 5. Category Breakdown
  const categoryMap: Record<string, { count: number; revenue: number }> = {};
  orders.forEach((o) => {
    o.items.forEach((it) => {
      const cat = it.category || "FOOD";
      if (!categoryMap[cat]) {
        categoryMap[cat] = { count: 0, revenue: 0 };
      }
      categoryMap[cat].count += it.quantity;
      categoryMap[cat].revenue += it.total;
    });
  });

  const categoryStats = Object.entries(categoryMap).map(([cat, val]) => ({
    category: cat,
    quantity: val.count,
    revenue: val.revenue,
  }));

  // 6. Top 5 Best Selling Items
  const itemMap: Record<string, { name: string; count: number; revenue: number }> = {};
  orders.forEach((o) => {
    o.items.forEach((it) => {
      if (!itemMap[it.name]) {
        itemMap[it.name] = { name: it.name, count: 0, revenue: 0 };
      }
      itemMap[it.name].count += it.quantity;
      itemMap[it.name].revenue += it.total;
    });
  });

  const topItems = Object.values(itemMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 7);

  return {
    period,
    totalRevenue,
    totalOrders,
    totalGuests,
    totalExpense,
    netProfit,
    totalTables,
    occupiedTables,
    tableOccupancyRate: Math.round(tableOccupancyRate),
    currentActiveDiners,
    runningUnsettledRevenue,
    floorStats,
    categoryStats,
    topItems,
  };
}
