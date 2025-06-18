import { AppState, Customer, Order, Category, Product } from './types';

const STORAGE_KEY = 'localBusinessOrders';
const ADMIN_PASSWORD = 'admin123';

const defaultCategories: Category[] = [
  {
    id: 'potatoes',
    name: 'Potatoes',
    icon: 'fas fa-seedling',
    items: [
      { id: 'gulla', name: 'Gulla', price: 520 },
      { id: 'pokhraj', name: 'Pokhraj', price: 600 }
    ]
  },
  {
    id: 'rice',
    name: 'Rice',
    icon: 'fas fa-wheat-awn',
    items: [
      { id: 'swastik-miniket', name: 'Swastik Miniket', price: 1599 },
      { id: 'basmati-rice', name: 'Premium Basmati', price: 1850 }
    ]
  },
  {
    id: 'onions',
    name: 'Onions',
    icon: 'fas fa-circle',
    items: [
      { id: 'red-onions', name: 'Red Onions', price: 850 },
      { id: 'white-onions', name: 'White Onions', price: 780 }
    ]
  },
  {
    id: 'flour-atta',
    name: 'Flour/Atta',
    icon: 'fas fa-mortar-pestle',
    items: [
      { id: 'wheat-atta', name: 'Whole Wheat Atta', price: 1200 },
      { id: 'maida', name: 'All Purpose Flour (Maida)', price: 950 }
    ]
  }
];

const defaultState: AppState = {
  isStoreOpen: true,
  categories: defaultCategories,
  customers: [],
  orders: [],
  currentCustomer: null,
  isAdminLoggedIn: false
};

export class LocalStorage {
  private getState(): AppState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return defaultState;
      
      const parsed = JSON.parse(stored);
      return {
        ...defaultState,
        ...parsed,
        categories: parsed.categories?.length > 0 ? parsed.categories : defaultCategories
      };
    } catch {
      return defaultState;
    }
  }

  private saveState(state: AppState): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  // Customer methods
  isCustomerRegistered(): boolean {
    const state = this.getState();
    return state.currentCustomer !== null;
  }

  registerCustomer(customer: Omit<Customer, 'id' | 'registeredAt'>): Customer {
    const state = this.getState();
    const newCustomer: Customer = {
      ...customer,
      id: Date.now().toString(),
      registeredAt: new Date().toISOString()
    };
    
    state.customers.push(newCustomer);
    state.currentCustomer = newCustomer;
    this.saveState(state);
    return newCustomer;
  }

  getCurrentCustomer(): Customer | null {
    return this.getState().currentCustomer;
  }

  // Store methods
  isStoreOpen(): boolean {
    return this.getState().isStoreOpen;
  }

  toggleStore(): boolean {
    const state = this.getState();
    state.isStoreOpen = !state.isStoreOpen;
    this.saveState(state);
    return state.isStoreOpen;
  }

  // Category and Product methods
  getCategories(): Category[] {
    return this.getState().categories;
  }

  addCategory(name: string, icon: string): Category {
    const state = this.getState();
    const newCategory: Category = {
      id: Date.now().toString(),
      name,
      icon,
      items: []
    };
    
    state.categories.push(newCategory);
    this.saveState(state);
    return newCategory;
  }

  updateCategory(categoryId: string, updates: Partial<Category>): void {
    const state = this.getState();
    const categoryIndex = state.categories.findIndex(c => c.id === categoryId);
    if (categoryIndex !== -1) {
      state.categories[categoryIndex] = { ...state.categories[categoryIndex], ...updates };
      this.saveState(state);
    }
  }

  deleteCategory(categoryId: string): void {
    const state = this.getState();
    state.categories = state.categories.filter(c => c.id !== categoryId);
    this.saveState(state);
  }

  addProduct(categoryId: string, product: Omit<Product, 'id'>): Product {
    const state = this.getState();
    const category = state.categories.find(c => c.id === categoryId);
    if (!category) throw new Error('Category not found');
    
    const newProduct: Product = {
      ...product,
      id: Date.now().toString()
    };
    
    category.items.push(newProduct);
    this.saveState(state);
    return newProduct;
  }

  updateProduct(categoryId: string, productId: string, updates: Partial<Product>): void {
    const state = this.getState();
    const category = state.categories.find(c => c.id === categoryId);
    if (!category) return;
    
    const productIndex = category.items.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
      category.items[productIndex] = { ...category.items[productIndex], ...updates };
      this.saveState(state);
    }
  }

  deleteProduct(categoryId: string, productId: string): void {
    const state = this.getState();
    const category = state.categories.find(c => c.id === categoryId);
    if (!category) return;
    
    category.items = category.items.filter(p => p.id !== productId);
    this.saveState(state);
  }

  // Order methods
  placeOrder(order: Omit<Order, 'id' | 'createdAt'>): Order {
    const state = this.getState();
    const newOrder: Order = {
      ...order,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    state.orders.push(newOrder);
    this.saveState(state);
    return newOrder;
  }

  getOrders(): Order[] {
    return this.getState().orders;
  }

  getCustomers(): Customer[] {
    return this.getState().customers;
  }

  // Admin methods
  verifyAdminPassword(password: string): boolean {
    return password === ADMIN_PASSWORD;
  }

  setAdminLoggedIn(loggedIn: boolean): void {
    const state = this.getState();
    state.isAdminLoggedIn = loggedIn;
    this.saveState(state);
  }

  isAdminLoggedIn(): boolean {
    return this.getState().isAdminLoggedIn;
  }

  // Export methods
  exportCustomersCSV(): string {
    const customers = this.getCustomers();
    const headers = ['Name', 'Phone', 'Shop Name', 'Location', 'Registered'];
    const rows = customers.map(c => [
      c.fullName,
      c.phoneNumber,
      c.shopName || '',
      c.deliveryLocation,
      new Date(c.registeredAt).toLocaleDateString()
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  exportOrdersCSV(): string {
    const orders = this.getOrders();
    const headers = ['Order ID', 'Customer', 'Phone', 'Items', 'Total', 'Date'];
    const rows = orders.map(o => [
      o.id,
      o.customerName,
      o.customerPhone,
      o.items.map(i => `${i.productName} x${i.quantity}`).join('; '),
      `₹${o.grandTotal}`,
      new Date(o.createdAt).toLocaleDateString()
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}

export const storage = new LocalStorage();
