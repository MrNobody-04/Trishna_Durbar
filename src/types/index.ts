export type Role = "OWNER" | "MANAGER";

export type FloorArea = "GROUND" | "HALL" | "FIRST_FLOOR" | "ROOFTOP";

export type TableStatus = "AVAILABLE" | "OCCUPIED" | "RESERVED" | "MAINTENANCE";

export type OrderStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";

export type MenuCategory =
  | "CHICKEN"
  | "MUTTON"
  | "VEG"
  | "COMBO"
  | "RICE"
  | "MOMO"
  | "SNACKS"
  | "BEVERAGE";

export type PortionType = "REGULAR" | "HALF" | "FULL" | "MINI" | "LARGE" | "PIECE";

export type PaymentMethod = "CASH" | "QR_PAYMENT" | "CARD" | "BANK_TRANSFER" | "SPLIT";

export type ExpenseCategory =
  | "SALARY"
  | "MEAT_PURCHASE"
  | "GROCERIES"
  | "ELECTRICITY"
  | "WATER"
  | "INTERNET"
  | "GAS"
  | "MAINTENANCE"
  | "RENT"
  | "OTHER";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface DiningTableData {
  id: string;
  name: string;
  floor: FloorArea;
  status: TableStatus;
  capacity: number;
  notes?: string | null;
  activeOrder?: ActiveOrderData | null;
}

export interface ActiveOrderData {
  id: string;
  orderNumber?: number | null;
  customerName?: string | null;
  customerPhone?: string | null;
  guestCount: number;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  paymentMethod?: string | null;
  notes?: string | null;
  kotPrinted: boolean;
  createdAt: string | Date;
  items: OrderItemData[];
  payments?: PaymentRecordData[];
}

export interface OrderItemData {
  id?: string;
  category?: string;
  name: string;
  portion?: string | null;
  quantity: number;
  unitPrice: number;
  total: number;
  notes?: string | null;
}

export interface PaymentRecordData {
  id?: string;
  amount: number;
  method: string;
  tendered?: number | null;
  changeReturn?: number | null;
  notes?: string | null;
  recordedByName?: string | null;
  timestamp: string | Date;
}
