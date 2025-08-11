import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { db } from "./db";
import { storage } from "./storage";
import { queryLogs, aiOptimizations, performanceMetrics, alerts } from "@shared/schema";
import { desc, sql, count, avg } from "drizzle-orm";
import { queryInterceptorMiddleware } from "./services/queryInterceptor";
import { initializeRedis, redisClient, publishRealTimeUpdate } from "./services/redis";
import { initializeDemoData, startTrafficGenerator } from "./services/demoData";
import { generateQueryInsights } from "./services/gemini";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize services
  await initializeRedis();
  await initializeDemoData();
  
  // Start demo traffic generator (with delay to allow DB setup)
  setTimeout(() => {
    startTrafficGenerator(3000);
  }, 2000);

  // Add query interceptor middleware
  app.use(queryInterceptorMiddleware);

  // API Routes
  app.get("/api/health", async (req, res) => {
    try {
      // Check database connection
      await db.select().from(queryLogs).limit(1);
      
      // Check Redis connection (optional)
      let redisStatus = "disconnected";
      try {
        await redisClient.ping();
        redisStatus = "connected";
      } catch (error) {
        redisStatus = "fallback";
      }
      
      res.json({ 
        status: "healthy", 
        database: "connected",
        redis: redisStatus,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ 
        status: "unhealthy", 
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/metrics", async (req, res) => {
    try {
      const [totalQueriesResult] = await db
        .select({ count: count() })
        .from(queryLogs);
        
      const [avgResponseResult] = await db
        .select({ avg: avg(queryLogs.executionTime) })
        .from(queryLogs);
        
      const [optimizationsResult] = await db
        .select({ count: count() })
        .from(aiOptimizations);

      // Calculate cost savings (simplified calculation)
      const totalQueries = totalQueriesResult.count || 0;
      const avgResponse = parseFloat(avgResponseResult.avg || "0");
      const optimizations = optimizationsResult.count || 0;
      
      // Simplified cost calculation: assume $0.001 per query + time-based costs
      const baselineCost = totalQueries * 0.001;
      const timeCost = (avgResponse / 1000) * totalQueries * 0.01;
      const savings = optimizations * 10.5; // Assume $10.5 average savings per optimization

      const metrics = {
        totalQueries,
        avgResponseTime: avgResponse.toFixed(1),
        aiOptimizations: optimizations,
        costSavings: savings.toFixed(0)
      };

      res.json(metrics);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      res.status(500).json({ error: "Failed to fetch metrics" });
    }
  });

  app.get("/api/queries/recent", async (req, res) => {
    try {
      const recentQueries = await db
        .select({
          id: queryLogs.id,
          queryText: queryLogs.queryText,
          executionTime: queryLogs.executionTime,
          affectedTables: queryLogs.affectedTables,
          status: queryLogs.status,
          createdAt: queryLogs.createdAt,
        })
        .from(queryLogs)
        .orderBy(desc(queryLogs.createdAt))
        .limit(20);

      res.json(recentQueries);
    } catch (error) {
      console.error("Error fetching recent queries:", error);
      res.status(500).json({ error: "Failed to fetch recent queries" });
    }
  });

  app.get("/api/optimizations/active", async (req, res) => {
    try {
      const activeOptimizations = await db
        .select()
        .from(aiOptimizations)
        .where(sql`status = 'pending'`)
        .orderBy(desc(aiOptimizations.createdAt))
        .limit(10);

      res.json(activeOptimizations);
    } catch (error) {
      console.error("Error fetching active optimizations:", error);
      res.status(500).json({ error: "Failed to fetch active optimizations" });
    }
  });

  app.post("/api/optimizations/:id/apply", async (req, res) => {
    try {
      const { id } = req.params;
      
      // In a real implementation, this would apply the optimization
      await db
        .update(aiOptimizations)
        .set({ status: "applied" })
        .where(sql`id = ${id}`);

      await publishRealTimeUpdate('optimization:applied', {
        optimizationId: id,
        timestamp: new Date().toISOString()
      });

      res.json({ success: true, message: "Optimization applied successfully" });
    } catch (error) {
      console.error("Error applying optimization:", error);
      res.status(500).json({ error: "Failed to apply optimization" });
    }
  });

  app.get("/api/alerts", async (req, res) => {
    try {
      const activeAlerts = await db
        .select()
        .from(alerts)
        .where(sql`is_active = true`)
        .orderBy(desc(alerts.createdAt))
        .limit(10);

      res.json(activeAlerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  app.get("/api/insights", async (req, res) => {
    try {
      const recentQueries = await db
        .select({
          queryText: queryLogs.queryText,
          executionTime: queryLogs.executionTime,
        })
        .from(queryLogs)
        .orderBy(desc(queryLogs.createdAt))
        .limit(50);

      // Convert to format expected by AI
      const queryData = recentQueries.map(q => ({
        queryText: q.queryText,
        executionTime: q.executionTime,
        frequency: 1 // Simplified - in real implementation, calculate actual frequency
      }));

      const insights = await generateQueryInsights(queryData);
      res.json(insights);
    } catch (error) {
      console.error("Error generating insights:", error);
      res.status(500).json({ error: "Failed to generate insights" });
    }
  });

  app.get("/api/performance/chart-data", async (req, res) => {
    try {
      // Get performance data for the last hour in 15-minute intervals
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      const performanceData = await db
        .select({
          interval: sql`date_trunc('minute', created_at)`,
          avgTime: avg(queryLogs.executionTime),
          queryCount: count()
        })
        .from(queryLogs)
        .where(sql`created_at >= ${oneHourAgo.toISOString()}`)
        .groupBy(sql`date_trunc('minute', created_at)`)
        .orderBy(sql`date_trunc('minute', created_at)`);

      res.json(performanceData);
    } catch (error) {
      console.error("Error fetching performance chart data:", error);
      res.status(500).json({ error: "Failed to fetch performance data" });
    }
  });

  app.post("/api/demo/traffic/start", async (req, res) => {
    try {
      const { interval = 3000 } = req.body;
      startTrafficGenerator(interval);
      res.json({ success: true, message: "Traffic generator started" });
    } catch (error) {
      console.error("Error starting traffic generator:", error);
      res.status(500).json({ error: "Failed to start traffic generator" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', async (ws: WebSocket) => {
    console.log('New WebSocket connection established');

    // Send initial data
    ws.send(JSON.stringify({ 
      type: 'connection', 
      message: 'Connected to Redis AI Query Optimizer' 
    }));

    // Subscribe to Redis channels for real-time updates (if available)
    let subscriber: any = null;
    try {
      if (redisClient.isReady) {
        subscriber = redisClient.duplicate();
        await subscriber.connect();
        
        subscriber.subscribe('query:live', (message: string) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'query:live', data: JSON.parse(message) }));
          }
        });

        subscriber.subscribe('optimization:suggestion', (message: string) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'optimization:suggestion', data: JSON.parse(message) }));
          }
        });

        subscriber.subscribe('demo:metrics', (message: string) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'demo:metrics', data: JSON.parse(message) }));
          }
        });
      }
    } catch (error) {
      console.log('Redis subscriber not available, using polling for real-time updates');
      
      // Fallback: Send periodic updates
      const updateInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ 
            type: 'demo:metrics', 
            data: {
              queriesPerMin: Math.floor(Math.random() * 100) + 200,
              activeUsers: Math.floor(Math.random() * 500) + 800,
              databaseLoad: Math.floor(Math.random() * 30) + 40
            }
          }));
        } else {
          clearInterval(updateInterval);
        }
      }, 5000);
    }

    ws.on('close', () => {
      console.log('WebSocket connection closed');
      if (subscriber) {
        subscriber.disconnect().catch(() => {});
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  return httpServer;
}
