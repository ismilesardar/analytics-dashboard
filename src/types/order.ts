export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  status: OrderStatus;
  amount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  isUserCreated?: boolean;
}
