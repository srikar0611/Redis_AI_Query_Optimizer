import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Clock, Database } from "lucide-react";
import { useState } from "react";

export default function QueryTrends() {
  const [timeRange, setTimeRange] = useState("24h");
  const [queryType, setQueryType] = useState("all");

  const { data: trendsData, isLoading } = useQuery({
    queryKey: ['/api/performance/trends', timeRange, queryType],
    refetchInterval: 10000,
  });

  const { data: slowQueries } = useQuery({
    queryKey: ['/api/queries/slow'],
    refetchInterval: 15000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const mockTrendsData = trendsData || {
    queryVolume: [
      { time: "00:00", count: 150 },
      { time: "04:00", count: 89 },
      { time: "08:00", count: 280 },
      { time: "12:00", count: 420 },
      { time: "16:00", count: 380 },
      { time: "20:00", count: 220 }
    ],
    averageResponseTime: [
      { time: "00:00", ms: 145 },
      { time: "04:00", ms: 120 },
      { time: "08:00", ms: 180 },
      { time: "12:00", ms: 250 },
      { time: "16:00", ms: 190 },
      { time: "20:00", ms: 160 }
    ],
    queryTypes: {
      SELECT: 65,
      INSERT: 20,
      UPDATE: 10,
      DELETE: 5
    }
  };

  const mockSlowQueries = slowQueries || [
    {
      id: 1,
      query: "SELECT * FROM products p JOIN categories c ON p.category_id = c.id WHERE p.price > 100 ORDER BY p.created_at DESC",
      avgTime: 2340,
      executions: 45,
      trend: "up"
    },
    {
      id: 2,
      query: "SELECT u.*, COUNT(o.id) as order_count FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.id",
      avgTime: 1820,
      executions: 32,
      trend: "down"
    },
    {
      id: 3,
      query: "SELECT p.name, SUM(oi.quantity * oi.price) as revenue FROM products p JOIN order_items oi ON p.id = oi.product_id",
      avgTime: 1650,
      executions: 28,
      trend: "up"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="page-title">Query Performance Trends</h1>
          <p className="text-muted-foreground">Monitor database query performance over time</p>
        </div>
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32" data-testid="select-time-range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={queryType} onValueChange={setQueryType}>
            <SelectTrigger className="w-32" data-testid="select-query-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Queries</SelectItem>
              <SelectItem value="SELECT">SELECT</SelectItem>
              <SelectItem value="INSERT">INSERT</SelectItem>
              <SelectItem value="UPDATE">UPDATE</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Query Volume</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+12.5%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">185ms</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-500">+5.2%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Slow Queries</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">-8.3%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Optimization Savings</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">34.2%</div>
            <p className="text-xs text-muted-foreground">
              Average improvement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Query Volume Over Time</CardTitle>
            <CardDescription>Number of queries executed per hour</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <Database className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-sm text-muted-foreground">Volume trend visualization</p>
                <p className="text-xs text-muted-foreground">Chart.js integration available</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response Time Trends</CardTitle>
            <CardDescription>Average query response time by hour</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <Clock className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-sm text-muted-foreground">Response time analysis</p>
                <p className="text-xs text-muted-foreground">Real-time monitoring active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Slow Queries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Slowest Queries</CardTitle>
          <CardDescription>Queries with highest average execution time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockSlowQueries.map((query, index) => (
              <div key={query.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <code className="text-xs bg-muted px-2 py-1 rounded max-w-md truncate">
                      {query.query}
                    </code>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{query.executions} executions</span>
                    <span>Avg: {query.avgTime}ms</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {query.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-red-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-green-500" />
                  )}
                  <Button variant="outline" size="sm" data-testid={`optimize-query-${query.id}`}>
                    Optimize
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}