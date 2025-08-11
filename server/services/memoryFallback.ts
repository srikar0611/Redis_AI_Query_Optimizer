// In-memory fallback for Redis functionality
class MemoryFallback {
  private cache = new Map<string, any>();
  private streams = new Map<string, any[]>();
  private subscribers = new Map<string, Set<(message: string) => void>>();

  // Cache operations
  async setEx(key: string, ttl: number, value: string): Promise<void> {
    this.cache.set(key, { value, expires: Date.now() + ttl * 1000 });
  }

  async get(key: string): Promise<string | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  // Pub/Sub operations
  async publish(channel: string, message: string): Promise<void> {
    const channelSubscribers = this.subscribers.get(channel);
    if (channelSubscribers) {
      channelSubscribers.forEach(callback => callback(message));
    }
  }

  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }
    this.subscribers.get(channel)!.add(callback);
  }

  // Stream operations
  async xAdd(streamKey: string, id: string, fields: Record<string, string>): Promise<void> {
    if (!this.streams.has(streamKey)) {
      this.streams.set(streamKey, []);
    }
    
    this.streams.get(streamKey)!.push({
      id: id === '*' ? Date.now().toString() : id,
      fields,
      timestamp: Date.now()
    });
  }

  async xRevRange(streamKey: string, start: string, end: string, options?: { COUNT?: number }): Promise<any[]> {
    const stream = this.streams.get(streamKey) || [];
    return stream.slice(0, options?.COUNT || 10).reverse();
  }

  // Other operations
  async ping(): Promise<string> {
    return 'PONG';
  }

  async incrBy(key: string, increment: number): Promise<number> {
    const current = parseInt(await this.get(key) || '0', 10);
    const newValue = current + increment;
    await this.setEx(key, 3600, newValue.toString());
    return newValue;
  }

  // Cleanup expired items periodically
  startCleanup() {
    setInterval(() => {
      const now = Date.now();
      const entries = Array.from(this.cache.entries());
      for (const [key, item] of entries) {
        if (now > item.expires) {
          this.cache.delete(key);
        }
      }
    }, 60000); // Clean every minute
  }
}

export const memoryFallback = new MemoryFallback();
memoryFallback.startCleanup();