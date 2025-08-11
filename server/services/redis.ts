import { createClient } from 'redis';
import { memoryFallback } from './memoryFallback';

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  password: process.env.REDIS_PASSWORD,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 500)
  }
});

client.on('error', (err) => console.log('Redis attempting connection...'));

let isConnected = false;
let useMemoryFallback = false;

export async function initializeRedis() {
  if (!isConnected) {
    try {
      // Try to connect with a short timeout
      await Promise.race([
        client.connect(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
      ]);
      isConnected = true;
      useMemoryFallback = false;
      console.log('✅ Redis connected successfully');
    } catch (error) {
      console.log('⚠️  Redis not available, using in-memory fallback for caching');
      isConnected = false;
      useMemoryFallback = true;
      // Stop error spam
      client.removeAllListeners('error');
    }
  }
}

export function getClient() {
  return isConnected ? client : memoryFallback;
}

export async function cacheOptimization(queryHash: string, optimization: any, ttl: number = 3600) {
  try {
    const activeClient = getClient();
    await activeClient.setEx(`optimization:${queryHash}`, ttl, JSON.stringify(optimization));
  } catch (error) {
    console.error('Error caching optimization:', error);
  }
}

export async function getCachedOptimization(queryHash: string): Promise<any | null> {
  try {
    const activeClient = getClient();
    const cached = await activeClient.get(`optimization:${queryHash}`);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Error getting cached optimization:', error);
    return null;
  }
}

export async function storeQueryPattern(pattern: string, embedding: number[]) {
  try {
    // Store query pattern with vector embedding for similarity search
    await client.hSet(`pattern:${pattern}`, {
      pattern,
      embedding: JSON.stringify(embedding),
      timestamp: Date.now().toString()
    });
  } catch (error) {
    console.error('Error storing query pattern:', error);
  }
}

export async function publishRealTimeUpdate(channel: string, data: any) {
  try {
    const activeClient = getClient();
    await activeClient.publish(channel, JSON.stringify(data));
  } catch (error) {
    console.error('Error publishing real-time update:', error);
  }
}

export async function addToStream(streamKey: string, fields: Record<string, string>) {
  try {
    const activeClient = getClient();
    await activeClient.xAdd(streamKey, '*', fields);
  } catch (error) {
    console.error('Error adding to stream:', error);
  }
}

export async function getStreamEntries(streamKey: string, count: number = 10) {
  try {
    return await client.xRevRange(streamKey, '+', '-', { COUNT: count });
  } catch (error) {
    console.error('Error getting stream entries:', error);
    return [];
  }
}

export async function incrementCounter(key: string, increment: number = 1) {
  try {
    return await client.incrBy(key, increment);
  } catch (error) {
    console.error('Error incrementing counter:', error);
    return 0;
  }
}

export async function setTimeSeries(key: string, timestamp: number, value: number) {
  try {
    // Using sorted sets for time series data
    await client.zAdd(key, { score: timestamp, value: value.toString() });
  } catch (error) {
    console.error('Error setting time series:', error);
  }
}

export async function getTimeSeriesRange(key: string, start: number, end: number) {
  try {
    return await client.zRangeByScoreWithScores(key, start, end);
  } catch (error) {
    console.error('Error getting time series range:', error);
    return [];
  }
}

export { client as redisClient };
