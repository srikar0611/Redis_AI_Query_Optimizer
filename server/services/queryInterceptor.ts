import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db } from '../db';
import { queryLogs, aiOptimizations } from '@shared/schema';
import { analyzeQueryForOptimization } from './gemini';
import { cacheOptimization, getCachedOptimization, publishRealTimeUpdate, addToStream } from './redis';

interface QueryInfo {
  query: string;
  params?: any[];
  startTime: number;
}

// Store for tracking query execution
const queryTracker = new Map<string, QueryInfo>();

export function queryInterceptorMiddleware(req: Request, res: Response, next: NextFunction) {
  // Generate unique request ID for tracking
  const requestId = crypto.randomUUID();
  req.requestId = requestId;

  // Intercept database queries by wrapping the database client
  if (req.method !== 'GET' || req.path.startsWith('/api/')) {
    // Track API requests that might trigger database queries
    queryTracker.set(requestId, {
      query: `${req.method} ${req.path}`,
      params: req.body,
      startTime: Date.now()
    });
  }

  // Override res.json to capture response timing
  const originalJson = res.json;
  res.json = function(body) {
    const queryInfo = queryTracker.get(requestId);
    if (queryInfo) {
      const executionTime = Date.now() - queryInfo.startTime;
      
      // Process query asynchronously
      processQuery(queryInfo.query, executionTime, req.path);
      
      queryTracker.delete(requestId);
    }
    return originalJson.call(this, body);
  };

  next();
}

async function processQuery(queryText: string, executionTime: number, endpoint: string) {
  try {
    // Determine query type and status
    const queryType = getQueryType(queryText);
    const status = getQueryStatus(executionTime);
    const affectedTables = extractTables(queryText, endpoint);

    // Log query to database
    const [queryLog] = await db.insert(queryLogs).values({
      queryText,
      executionTime,
      affectedTables,
      queryType,
      status,
      indexUsage: false // TODO: Implement proper index usage detection
    }).returning();

    // Add to Redis stream for real-time processing
    await addToStream('query:events', {
      queryId: queryLog.id.toString(),
      queryText,
      executionTime: executionTime.toString(),
      queryType,
      status,
      timestamp: Date.now().toString()
    });

    // Publish real-time update
    await publishRealTimeUpdate('query:live', {
      id: queryLog.id,
      queryText: queryText.length > 100 ? queryText.substring(0, 100) + '...' : queryText,
      executionTime,
      status,
      affectedTables,
      timestamp: new Date().toISOString()
    });

    // Process with AI if query is slow or critical
    if (status === 'slow' || status === 'critical') {
      await processWithAI(queryLog.id, queryText, executionTime);
    }

  } catch (error) {
    console.error('Error processing query:', error);
  }
}

async function processWithAI(queryLogId: number, queryText: string, executionTime: number) {
  try {
    // Check cache first
    const queryHash = crypto.createHash('md5').update(queryText).digest('hex');
    const cachedOptimization = await getCachedOptimization(queryHash);
    
    if (cachedOptimization) {
      // Use cached optimization
      await db.insert(aiOptimizations).values({
        queryLogId,
        optimizationType: cachedOptimization.optimizationType,
        suggestion: cachedOptimization.suggestion,
        confidence: cachedOptimization.confidence,
        estimatedImprovement: cachedOptimization.estimatedImprovement
      });
      
      await publishRealTimeUpdate('optimization:suggestion', {
        queryLogId,
        ...cachedOptimization,
        source: 'cache'
      });
      
      return;
    }

    // Get AI suggestions
    const suggestions = await analyzeQueryForOptimization(queryText, executionTime);
    
    // Store suggestions in database and cache
    for (const suggestion of suggestions) {
      await db.insert(aiOptimizations).values({
        queryLogId,
        optimizationType: suggestion.optimizationType,
        suggestion: suggestion.suggestion,
        confidence: suggestion.confidence,
        estimatedImprovement: suggestion.estimatedImprovement
      });

      // Cache the optimization
      await cacheOptimization(queryHash, suggestion);

      // Publish real-time update
      await publishRealTimeUpdate('optimization:suggestion', {
        queryLogId,
        ...suggestion,
        source: 'ai'
      });
    }

  } catch (error) {
    console.error('Error processing query with AI:', error);
  }
}

function getQueryType(queryText: string): string {
  const query = queryText.toUpperCase().trim();
  
  if (query.startsWith('SELECT')) return 'SELECT';
  if (query.startsWith('INSERT')) return 'INSERT';
  if (query.startsWith('UPDATE')) return 'UPDATE';
  if (query.startsWith('DELETE')) return 'DELETE';
  if (query.includes('CREATE') || query.includes('ALTER') || query.includes('DROP')) return 'DDL';
  
  // For API endpoints, infer query type
  if (query.includes('POST')) return 'INSERT';
  if (query.includes('PUT') || query.includes('PATCH')) return 'UPDATE';
  if (query.includes('DELETE')) return 'DELETE';
  
  return 'SELECT';
}

function getQueryStatus(executionTime: number): string {
  if (executionTime > 200) return 'critical';
  if (executionTime > 100) return 'slow';
  return 'fast';
}

function extractTables(queryText: string, endpoint: string): string[] {
  const tables: string[] = [];
  
  // Extract from SQL queries
  const tableRegex = /(?:FROM|JOIN|INTO|UPDATE)\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi;
  let match;
  while ((match = tableRegex.exec(queryText)) !== null) {
    if (match[1] && !tables.includes(match[1].toLowerCase())) {
      tables.push(match[1].toLowerCase());
    }
  }
  
  // Extract from API endpoints
  if (endpoint.includes('products')) tables.push('products');
  if (endpoint.includes('users')) tables.push('users');
  if (endpoint.includes('orders')) tables.push('orders');
  if (endpoint.includes('categories')) tables.push('categories');
  
  return tables.length > 0 ? tables : ['unknown'];
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}
