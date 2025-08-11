import { apiRequest } from "@/lib/queryClient";

export interface QueryMetrics {
  totalQueries: number;
  avgResponseTime: string;
  aiOptimizations: number;
  costSavings: string;
}

export interface QueryLog {
  id: number;
  queryText: string;
  executionTime: number;
  affectedTables: string[];
  status: string;
  createdAt: string;
}

export interface Optimization {
  id: number;
  optimizationType: string;
  suggestion: string;
  confidence: number;
  estimatedImprovement: number;
  status: string;
  createdAt: string;
}

export interface Alert {
  id: number;
  type: string;
  title: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export interface QueryInsights {
  summary: string;
  topIssues: string[];
  recommendations: string[];
}

export const api = {
  // Health check
  async getHealth() {
    const response = await apiRequest('GET', '/api/health');
    return response.json();
  },

  // Metrics
  async getMetrics(): Promise<QueryMetrics> {
    const response = await apiRequest('GET', '/api/metrics');
    return response.json();
  },

  // Queries
  async getRecentQueries(): Promise<QueryLog[]> {
    const response = await apiRequest('GET', '/api/queries/recent');
    return response.json();
  },

  // Optimizations
  async getActiveOptimizations(): Promise<Optimization[]> {
    const response = await apiRequest('GET', '/api/optimizations/active');
    return response.json();
  },

  async applyOptimization(id: number) {
    const response = await apiRequest('POST', `/api/optimizations/${id}/apply`);
    return response.json();
  },

  // Alerts
  async getAlerts(): Promise<Alert[]> {
    const response = await apiRequest('GET', '/api/alerts');
    return response.json();
  },

  // Insights
  async getInsights(): Promise<QueryInsights> {
    const response = await apiRequest('GET', '/api/insights');
    return response.json();
  },

  // Performance data
  async getPerformanceChartData(timeRange: string) {
    const response = await apiRequest('GET', `/api/performance/chart-data?range=${timeRange}`);
    return response.json();
  },

  // Demo controls
  async startTrafficGenerator(interval: number = 3000) {
    const response = await apiRequest('POST', '/api/demo/traffic/start', { interval });
    return response.json();
  },
};
