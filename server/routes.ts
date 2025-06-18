import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCustomerSchema, insertCategorySchema, insertProductSchema, insertOrderSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for Railway
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Initialize default data
  await (storage as any).initializeDefaultData();
  
  // Customer endpoints
  app.get("/api/customer/current", async (req, res) => {
    try {
      const customer = await storage.getCurrentCustomer();
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: "Failed to get current customer" });
    }
  });

  app.get("/api/customer/registered", async (req, res) => {
    try {
      const isRegistered = await storage.isCustomerRegistered();
      res.json({ isRegistered });
    } catch (error) {
      res.status(500).json({ error: "Failed to check registration status" });
    }
  });

  app.post("/api/customer/register", async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.registerCustomer(customerData);
      await storage.setCurrentCustomer(customer.id);
      res.json(customer);
    } catch (error) {
      res.status(400).json({ error: "Failed to register customer" });
    }
  });

  app.post("/api/customer/login", async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      if (!phoneNumber) {
        return res.status(400).json({ error: "Phone number is required" });
      }
      
      const customer = await storage.loginCustomerByPhone(phoneNumber);
      if (customer) {
        await storage.setCurrentCustomer(customer.id);
        res.json(customer);
      } else {
        res.status(404).json({ error: "Customer not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to login customer" });
    }
  });

  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: "Failed to get customers" });
    }
  });

  // Category endpoints
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to get categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const { name, icon } = req.body;
      const category = await storage.addCategory(name, icon);
      res.json(category);
    } catch (error) {
      res.status(400).json({ error: "Failed to add category" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      await storage.deleteCategory(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete category" });
    }
  });

  // Product endpoints
  app.post("/api/products", async (req, res) => {
    try {
      const { categoryId, name, price } = req.body;
      const product = await storage.addProduct(categoryId, { name, price });
      res.json(product);
    } catch (error) {
      res.status(400).json({ error: "Failed to add product" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const { categoryId, ...updates } = req.body;
      await storage.updateProduct(categoryId, req.params.id, updates);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/products/:categoryId/:id", async (req, res) => {
    try {
      await storage.deleteProduct(req.params.categoryId, req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete product" });
    }
  });

  // Order endpoints
  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = {
        ...req.body,
        status: req.body.status || "received",
        isPaid: req.body.isPaid || false
      };
      const order = await storage.placeOrder(orderData);
      res.json(order);
    } catch (error) {
      res.status(400).json({ error: "Failed to place order" });
    }
  });

  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to get orders" });
    }
  });

  app.put("/api/orders/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      await storage.updateOrderStatus(req.params.id, status);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to update order status" });
    }
  });

  app.put("/api/orders/:id/payment", async (req, res) => {
    try {
      const { isPaid } = req.body;
      await storage.updateOrderPayment(req.params.id, isPaid);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to update payment status" });
    }
  });

  // Store/Admin endpoints
  app.get("/api/store/status", async (req, res) => {
    try {
      const isOpen = await storage.isStoreOpen();
      res.json({ isOpen });
    } catch (error) {
      res.status(500).json({ error: "Failed to get store status" });
    }
  });

  app.post("/api/store/toggle", async (req, res) => {
    try {
      const isOpen = await storage.toggleStore();
      res.json({ isOpen });
    } catch (error) {
      res.status(500).json({ error: "Failed to toggle store" });
    }
  });

  app.post("/api/admin/login", async (req, res) => {
    try {
      const { password } = req.body;
      const isValid = storage.verifyAdminPassword(password);
      if (isValid) {
        await storage.setAdminLoggedIn(true);
        res.json({ success: true });
      } else {
        res.status(401).json({ error: "Invalid password" });
      }
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/admin/logout", async (req, res) => {
    try {
      await storage.setAdminLoggedIn(false);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Logout failed" });
    }
  });

  app.get("/api/admin/status", async (req, res) => {
    try {
      const isLoggedIn = await storage.isAdminLoggedIn();
      res.json({ isLoggedIn });
    } catch (error) {
      res.status(500).json({ error: "Failed to get admin status" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
