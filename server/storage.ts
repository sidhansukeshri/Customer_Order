import { 
  users, customers, categories, products, orders, appSettings,
  type User, type InsertUser, type Customer, type InsertCustomer,
  type Category, type InsertCategory, type Product, type InsertProduct,
  type Order, type InsertOrder
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Customer methods
  isCustomerRegistered(): Promise<boolean>;
  registerCustomer(customer: InsertCustomer): Promise<Customer>;
  getCurrentCustomer(): Promise<Customer | null>;
  getCustomers(): Promise<Customer[]>;
  loginCustomerByPhone(phoneNumber: string): Promise<Customer | null>;
  setCurrentCustomer(customerId: string): Promise<void>;
  
  // Category methods
  getCategories(): Promise<Category[]>;
  addCategory(name: string, icon: string): Promise<Category>;
  updateCategory(categoryId: string, updates: Partial<Category>): Promise<void>;
  deleteCategory(categoryId: string): Promise<void>;
  
  // Product methods
  addProduct(categoryId: string, product: Omit<Product, 'id' | 'categoryId'>): Promise<Product>;
  updateProduct(categoryId: string, productId: string, updates: Partial<Product>): Promise<void>;
  deleteProduct(categoryId: string, productId: string): Promise<void>;
  
  // Order methods
  placeOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order>;
  getOrders(): Promise<Order[]>;
  updateOrderStatus(orderId: string, status: string): Promise<void>;
  updateOrderPayment(orderId: string, isPaid: boolean): Promise<void>;
  
  // Store/Admin methods
  isStoreOpen(): Promise<boolean>;
  toggleStore(): Promise<boolean>;
  verifyAdminPassword(password: string): boolean;
  setAdminLoggedIn(loggedIn: boolean): Promise<void>;
  isAdminLoggedIn(): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  private adminPassword = 'admin123';

  async initializeDefaultData() {
    // Check if categories already exist
    const existingCategories = await db.select().from(categories).limit(1);
    if (existingCategories.length > 0) return;

    // Insert default categories
    const defaultCategories = [
      { id: 'potatoes', name: 'Potatoes', icon: 'fas fa-seedling' },
      { id: 'rice', name: 'Rice', icon: 'fas fa-wheat-awn' },
      { id: 'onions', name: 'Onions', icon: 'fas fa-circle' },
      { id: 'flour-atta', name: 'Flour/Atta', icon: 'fas fa-mortar-pestle' }
    ];

    for (const category of defaultCategories) {
      await db.insert(categories).values(category);
    }

    // Insert default products
    const defaultProducts = [
      { id: 'gulla', categoryId: 'potatoes', name: 'Gulla', price: 520 },
      { id: 'pokhraj', categoryId: 'potatoes', name: 'Pokhraj', price: 600 },
      { id: 'swastik-miniket', categoryId: 'rice', name: 'Swastik Miniket', price: 1599 },
      { id: 'basmati-rice', categoryId: 'rice', name: 'Premium Basmati', price: 1850 },
      { id: 'red-onions', categoryId: 'onions', name: 'Red Onions', price: 850 },
      { id: 'white-onions', categoryId: 'onions', name: 'White Onions', price: 780 },
      { id: 'wheat-atta', categoryId: 'flour-atta', name: 'Whole Wheat Atta', price: 1200 },
      { id: 'maida', categoryId: 'flour-atta', name: 'All Purpose Flour (Maida)', price: 950 }
    ];

    for (const product of defaultProducts) {
      await db.insert(products).values(product);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async isCustomerRegistered(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.currentCustomerId !== null;
  }

  async registerCustomer(customer: InsertCustomer): Promise<Customer> {
    const id = Date.now().toString();
    const [newCustomer] = await db
      .insert(customers)
      .values({ ...customer, id })
      .returning();
    
    // Set as current customer
    await this.updateSettings({ currentCustomerId: id });
    
    return newCustomer;
  }

  async getCurrentCustomer(): Promise<Customer | null> {
    const settings = await this.getSettings();
    if (!settings.currentCustomerId) return null;
    
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, settings.currentCustomerId));
    
    return customer || null;
  }

  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(desc(customers.registeredAt));
  }

  async loginCustomerByPhone(phoneNumber: string): Promise<Customer | null> {
    const [customer] = await db.select().from(customers).where(eq(customers.phoneNumber, phoneNumber));
    return customer || null;
  }

  async setCurrentCustomer(customerId: string): Promise<void> {
    await this.updateSettings({ currentCustomerId: customerId });
  }

  async getCategories(): Promise<Category[]> {
    const categoriesData = await db.query.categories.findMany({
      with: {
        products: true
      }
    });
    
    return categoriesData.map(cat => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      items: cat.products
    }));
  }

  async addCategory(name: string, icon: string): Promise<Category> {
    const id = Date.now().toString();
    const [category] = await db
      .insert(categories)
      .values({ id, name, icon })
      .returning();
    
    return { 
      id: category.id,
      name: category.name,
      icon: category.icon,
      items: [] 
    } as Category;
  }

  async updateCategory(categoryId: string, updates: Partial<Category>): Promise<void> {
    await db
      .update(categories)
      .set(updates)
      .where(eq(categories.id, categoryId));
  }

  async deleteCategory(categoryId: string): Promise<void> {
    await db.delete(categories).where(eq(categories.id, categoryId));
  }

  async addProduct(categoryId: string, product: Omit<Product, 'id' | 'categoryId'>): Promise<Product> {
    const id = Date.now().toString();
    const [newProduct] = await db
      .insert(products)
      .values({ ...product, id, categoryId })
      .returning();
    
    return newProduct;
  }

  async updateProduct(categoryId: string, productId: string, updates: Partial<Product>): Promise<void> {
    await db
      .update(products)
      .set(updates)
      .where(eq(products.id, productId));
  }

  async deleteProduct(categoryId: string, productId: string): Promise<void> {
    await db.delete(products).where(eq(products.id, productId));
  }

  async placeOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
    const id = Date.now().toString();
    const [newOrder] = await db
      .insert(orders)
      .values({ ...order, id })
      .returning();
    
    return newOrder;
  }

  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, orderId));
  }

  async updateOrderPayment(orderId: string, isPaid: boolean): Promise<void> {
    await db
      .update(orders)
      .set({ isPaid })
      .where(eq(orders.id, orderId));
  }

  async isStoreOpen(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.isStoreOpen;
  }

  async toggleStore(): Promise<boolean> {
    const settings = await this.getSettings();
    const newStatus = !settings.isStoreOpen;
    await this.updateSettings({ isStoreOpen: newStatus });
    return newStatus;
  }

  verifyAdminPassword(password: string): boolean {
    return password === this.adminPassword;
  }

  async setAdminLoggedIn(loggedIn: boolean): Promise<void> {
    await this.updateSettings({ isAdminLoggedIn: loggedIn });
  }

  async isAdminLoggedIn(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.isAdminLoggedIn;
  }

  private async getSettings() {
    let [settings] = await db.select().from(appSettings).where(eq(appSettings.id, 'app_settings'));
    
    if (!settings) {
      [settings] = await db
        .insert(appSettings)
        .values({ 
          id: 'app_settings',
          isStoreOpen: true,
          isAdminLoggedIn: false,
          currentCustomerId: null
        })
        .returning();
    }
    
    return settings;
  }

  private async updateSettings(updates: Partial<typeof appSettings.$inferInsert>) {
    await db
      .update(appSettings)
      .set(updates)
      .where(eq(appSettings.id, 'app_settings'));
  }
}

export const storage = new DatabaseStorage();
