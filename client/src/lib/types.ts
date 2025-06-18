export interface Product {
  id: string;
  name: string;
  price: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  items: Product[];
}

export interface Customer {
  id: string;
  fullName: string;
  phoneNumber: string;
  shopName?: string;
  deliveryLocation: string;
  registeredAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  totalItems: number;
  grandTotal: number;
  createdAt: string;
  status: 'received' | 'in_transit' | 'delivered';
  isPaid: boolean;
}

export interface AppState {
  isStoreOpen: boolean;
  categories: Category[];
  customers: Customer[];
  orders: Order[];
  currentCustomer: Customer | null;
  isAdminLoggedIn: boolean;
}
