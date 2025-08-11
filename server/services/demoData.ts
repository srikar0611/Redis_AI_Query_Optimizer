import { db } from '../db';
import { categories, products, users, orders, orderItems } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { publishRealTimeUpdate } from './redis';

export async function initializeDemoData() {
  try {
    console.log('Initializing demo data...');

    // Check if data already exists
    const existingCategories = await db.select().from(categories).limit(1);
    if (existingCategories.length > 0) {
      console.log('Demo data already exists, skipping initialization');
      return;
    }

    // Insert categories
    const categoryData = [
      { name: 'Electronics', description: 'Electronic devices and gadgets' },
      { name: 'Clothing', description: 'Fashion and apparel' },
      { name: 'Home & Garden', description: 'Home improvement and gardening' },
      { name: 'Sports', description: 'Sports and fitness equipment' },
      { name: 'Books', description: 'Books and educational materials' }
    ];

    const insertedCategories = await db.insert(categories).values(categoryData).returning();
    console.log(`Inserted ${insertedCategories.length} categories`);

    // Insert products
    const productData = [];
    const productNames = [
      'Smartphone X1', 'Laptop Pro 15', 'Wireless Headphones', 'Smart Watch',
      'Gaming Console', 'Tablet Ultra', 'Bluetooth Speaker', 'Camera DSLR',
      'T-Shirt Classic', 'Jeans Slim Fit', 'Sneakers Sport', 'Jacket Winter',
      'Dress Summer', 'Hoodie Comfort', 'Pants Casual', 'Shirt Button',
      'Garden Tools Set', 'Plant Pot Large', 'Watering Can', 'Seeds Variety',
      'Fertilizer Organic', 'Pruning Shears', 'Hose Garden', 'Sprinkler Auto',
      'Basketball', 'Tennis Racket', 'Yoga Mat', 'Dumbbells Set',
      'Treadmill Home', 'Bicycle Mountain', 'Soccer Ball', 'Swimming Goggles',
      'Novel Bestseller', 'Textbook Science', 'Cookbook Gourmet', 'Biography Famous',
      'Manual Technical', 'Guide Travel', 'Dictionary English', 'Atlas World'
    ];

    for (let i = 0; i < productNames.length; i++) {
      const categoryId = insertedCategories[i % insertedCategories.length].id;
      productData.push({
        name: productNames[i],
        description: `High quality ${productNames[i].toLowerCase()} with excellent features`,
        price: (Math.random() * 500 + 10).toFixed(2),
        categoryId,
        stock: Math.floor(Math.random() * 100) + 10
      });
    }

    const insertedProducts = await db.insert(products).values(productData).returning();
    console.log(`Inserted ${insertedProducts.length} products`);

    // Insert demo users
    const userData = [];
    const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Emma', 'Chris', 'Lisa'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];

    for (let i = 0; i < 20; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      userData.push({
        username: `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${i}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
        password: 'hashed_password_here', // In real app, this would be properly hashed
        role: i === 0 ? 'admin' : 'user'
      });
    }

    const insertedUsers = await db.insert(users).values(userData).returning();
    console.log(`Inserted ${insertedUsers.length} users`);

    console.log('Demo data initialization completed');
  } catch (error) {
    console.error('Error initializing demo data:', error);
  }
}

export async function generateDemoTraffic() {
  try {
    // Simulate e-commerce queries
    const queries = [
      // Product searches
      async () => {
        const category = Math.floor(Math.random() * 5) + 1;
        await db.select().from(products).where(eq(products.categoryId, category)).limit(20);
      },
      
      // User login simulation
      async () => {
        const randomUserId = Math.floor(Math.random() * 20) + 1;
        await db.select().from(users).where(eq(users.id, randomUserId.toString()));
      },
      
      // Order history
      async () => {
        const randomUserId = Math.floor(Math.random() * 20) + 1;
        await db.select().from(orders).where(eq(orders.userId, randomUserId.toString()));
      },
      
      // Complex join query (intentionally slow)
      async () => {
        await db.select({
          productName: products.name,
          categoryName: categories.name,
          totalSales: orders.totalAmount
        })
        .from(products)
        .leftJoin(orderItems, eq(products.id, orderItems.productId))
        .leftJoin(orders, eq(orderItems.orderId, orders.id))
        .leftJoin(categories, eq(products.categoryId, categories.id));
      }
    ];

    // Execute random queries
    const queryToRun = queries[Math.floor(Math.random() * queries.length)];
    await queryToRun();

  } catch (error) {
    console.error('Error generating demo traffic:', error);
  }
}

// Start traffic generator
let trafficInterval: NodeJS.Timeout | null = null;

export function startTrafficGenerator(intervalMs: number = 5000) {
  if (trafficInterval) {
    clearInterval(trafficInterval);
  }
  
  trafficInterval = setInterval(async () => {
    await generateDemoTraffic();
    
    // Update traffic metrics
    await publishRealTimeUpdate('demo:metrics', {
      queriesPerMin: Math.floor(Math.random() * 50) + 300,
      activeUsers: Math.floor(Math.random() * 200) + 1000,
      databaseLoad: Math.floor(Math.random() * 40) + 40
    });
  }, intervalMs);
  
  console.log(`Demo traffic generator started with ${intervalMs}ms interval`);
}

export function stopTrafficGenerator() {
  if (trafficInterval) {
    clearInterval(trafficInterval);
    trafficInterval = null;
    console.log('Demo traffic generator stopped');
  }
}
