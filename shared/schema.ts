import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, decimal, boolean, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  categoryId: integer("category_id").notNull(),
  stock: integer("stock").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  status: text("status").notNull().default("pending"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

export const queryLogs = pgTable("query_logs", {
  id: serial("id").primaryKey(),
  queryText: text("query_text").notNull(),
  executionTime: integer("execution_time").notNull(), // in milliseconds
  affectedTables: text("affected_tables").array(),
  queryType: text("query_type").notNull(), // SELECT, INSERT, UPDATE, DELETE
  status: text("status").notNull(), // fast, slow, critical
  indexUsage: boolean("index_usage").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const aiOptimizations = pgTable("ai_optimizations", {
  id: serial("id").primaryKey(),
  queryLogId: integer("query_log_id").notNull(),
  optimizationType: text("optimization_type").notNull(), // index, rewrite, cache
  suggestion: text("suggestion").notNull(),
  confidence: integer("confidence").notNull(), // 0-100
  estimatedImprovement: integer("estimated_improvement"), // percentage
  status: text("status").notNull().default("pending"), // pending, applied, rejected
  createdAt: timestamp("created_at").defaultNow(),
});

export const performanceMetrics = pgTable("performance_metrics", {
  id: serial("id").primaryKey(),
  totalQueries: integer("total_queries").notNull().default(0),
  avgResponseTime: decimal("avg_response_time", { precision: 6, scale: 2 }).notNull(),
  optimizationsApplied: integer("optimizations_applied").notNull().default(0),
  costSavings: decimal("cost_savings", { precision: 10, scale: 2 }).notNull().default("0"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // critical, warning, info
  title: text("title").notNull(),
  description: text("description").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  orderItems: many(orderItems),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  orderItems: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const queryLogsRelations = relations(queryLogs, ({ many }) => ({
  optimizations: many(aiOptimizations),
}));

export const aiOptimizationsRelations = relations(aiOptimizations, ({ one }) => ({
  queryLog: one(queryLogs, {
    fields: [aiOptimizations.queryLogId],
    references: [queryLogs.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  role: true,
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  description: true,
  price: true,
  categoryId: true,
  stock: true,
});

export const insertQueryLogSchema = createInsertSchema(queryLogs).pick({
  queryText: true,
  executionTime: true,
  affectedTables: true,
  queryType: true,
  status: true,
  indexUsage: true,
});

export const insertAiOptimizationSchema = createInsertSchema(aiOptimizations).pick({
  queryLogId: true,
  optimizationType: true,
  suggestion: true,
  confidence: true,
  estimatedImprovement: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertQueryLog = z.infer<typeof insertQueryLogSchema>;
export type QueryLog = typeof queryLogs.$inferSelect;

export type InsertAiOptimization = z.infer<typeof insertAiOptimizationSchema>;
export type AiOptimization = typeof aiOptimizations.$inferSelect;

export type Category = typeof categories.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type PerformanceMetric = typeof performanceMetrics.$inferSelect;
export type Alert = typeof alerts.$inferSelect;
