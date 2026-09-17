import customersJson from '@/data/customers.json';
import ordersJson from '@/data/orders.json';
import activitiesJson from '@/data/activities.json';
import usersJson from '@/data/users.json';

export type CustomerStatus = 'active' | 'inactive';

export interface Customer {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  status: CustomerStatus;
}

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
  currency: 'USD';
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export type ActivityType =
  | 'order_created'
  | 'order_status_changed'
  | 'order_cancelled'
  | 'customer_signed_up'
  | 'payment_received'
  | 'refund_issued';

export interface SystemActivity {
  id: string;
  type: ActivityType;
  message: string;
  relatedOrderId?: string;
  relatedCustomerId?: string;
  createdAt: string;
}

export interface SeedUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin';
}

export const customers = customersJson as Customer[];
export const orders = ordersJson as Order[];
export const activities = activitiesJson as SystemActivity[];
export const users = usersJson as SeedUser[];
