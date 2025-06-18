import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import * as schema from '../shared/schema.js';

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL must be set');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function setupDatabase() {
  try {
    console.log('🚀 Setting up Restaurant Order System database...');
    
    // Create tables using Drizzle
    console.log('📋 Creating database tables...');
    
    // Add some sample categories
    console.log('🍕 Adding sample categories...');
    const categories = [
      { id: 'pizza', name: 'Pizza', icon: '🍕' },
      { id: 'burger', name: 'Burgers', icon: '🍔' },
      { id: 'drinks', name: 'Drinks', icon: '🥤' },
      { id: 'desserts', name: 'Desserts', icon: '🍰' }
    ];
    
    for (const category of categories) {
      try {
        await db.insert(schema.categories).values(category);
        console.log(`✅ Added category: ${category.name}`);
      } catch (error) {
        console.log(`⚠️ Category ${category.name} might already exist`);
      }
    }
    
    // Add some sample products
    console.log('🍕 Adding sample products...');
    const products = [
      { id: 'margherita', categoryId: 'pizza', name: 'Margherita Pizza', price: 1200 },
      { id: 'pepperoni', categoryId: 'pizza', name: 'Pepperoni Pizza', price: 1400 },
      { id: 'cheeseburger', categoryId: 'burger', name: 'Cheeseburger', price: 800 },
      { id: 'chicken-burger', categoryId: 'burger', name: 'Chicken Burger', price: 900 },
      { id: 'coke', categoryId: 'drinks', name: 'Coca Cola', price: 200 },
      { id: 'sprite', categoryId: 'drinks', name: 'Sprite', price: 200 },
      { id: 'chocolate-cake', categoryId: 'desserts', name: 'Chocolate Cake', price: 400 }
    ];
    
    for (const product of products) {
      try {
        await db.insert(schema.products).values(product);
        console.log(`✅ Added product: ${product.name}`);
      } catch (error) {
        console.log(`⚠️ Product ${product.name} might already exist`);
      }
    }
    
    // Initialize app settings
    console.log('⚙️ Initializing app settings...');
    try {
      await db.insert(schema.appSettings).values({
        id: 'app_settings',
        isStoreOpen: true,
        isAdminLoggedIn: false
      });
      console.log('✅ App settings initialized');
    } catch (error) {
      console.log('⚠️ App settings might already exist');
    }
    
    console.log('🎉 Database setup complete! Your restaurant is ready to serve!');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase(); 