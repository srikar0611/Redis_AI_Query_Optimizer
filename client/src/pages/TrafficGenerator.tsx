import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Play, Pause, RotateCcw, Activity, Users, Database, Clock, TrendingUp } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TrafficStats {
  isRunning: boolean;
  interval: number;
  totalRequests: number;
  requestsPerMinute: number;
  activeUsers: number;
  errorRate: number;
  avgResponseTime: number;
}

export default function TrafficGenerator() {
  const [isRunning, setIsRunning] = useState(false);
  const [interval, setInterval] = useState([3000]);
  const [simulatedUsers, setSimulatedUsers] = useState([10]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const { toast } = useToast();

  const { data: trafficStats, refetch } = useQuery({
    queryKey: ['/api/demo/traffic/status'],
    refetchInterval: isRunning ? 2000 : false,
  });

  const mockStats: TrafficStats = {
    isRunning: false,
    interval: 3000,
    totalRequests: 1247,
    requestsPerMinute: 82,
    activeUsers: 15,
    errorRate: 0.8,
    avgResponseTime: 245,
    ...trafficStats
  };

  const handleToggleTraffic = async () => {
    try {
      if (isRunning) {
        await apiRequest('/api/demo/traffic/stop', { method: 'POST' });
        setIsRunning(false);
        toast({
          title: "Traffic Generator Stopped",
          description: "Demo traffic generation has been paused",
        });
      } else {
        await apiRequest('/api/demo/traffic/start', { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            interval: interval[0],
            users: simulatedUsers[0] 
          })
        });
        setIsRunning(true);
        toast({
          title: "Traffic Generator Started",
          description: `Generating traffic with ${simulatedUsers[0]} users every ${interval[0]}ms`,
        });
      }
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle traffic generator",
        variant: "destructive",
      });
    }
  };

  const handleReset = async () => {
    try {
      await apiRequest('/api/demo/traffic/reset', { method: 'POST' });
      setRecentActivity([]);
      toast({
        title: "Traffic Stats Reset",
        description: "All traffic generation statistics have been cleared",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset traffic statistics",
        variant: "destructive",
      });
    }
  };

  // Simulate real-time activity updates
  useEffect(() => {
    if (isRunning) {
      const activityInterval = setInterval(() => {
        const activities = [
          "SELECT * FROM products WHERE category = 'Electronics'",
          "INSERT INTO orders (user_id, total) VALUES (123, 299.99)",
          "UPDATE users SET last_login = NOW() WHERE id = 456",
          "SELECT COUNT(*) FROM categories",
          "DELETE FROM cart_items WHERE user_id = 789",
          "SELECT p.*, c.name FROM products p JOIN categories c ON p.category_id = c.id"
        ];
        
        const newActivity = {
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          query: activities[Math.floor(Math.random() * activities.length)],
          executionTime: Math.floor(Math.random() * 500) + 50,
          status: Math.random() > 0.05 ? 'success' : 'error',
          user: `User${Math.floor(Math.random() * 100) + 1}`
        };

        setRecentActivity(prev => [newActivity, ...prev.slice(0, 9)]);
      }, 2000);

      return () => clearInterval(activityInterval);
    }
  }, [isRunning]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="page-title">Traffic Generator</h1>
          <p className="text-muted-foreground">Simulate realistic database traffic for testing and demonstration</p>
        </div>
        <Badge variant={isRunning ? "default" : "secondary"} data-testid="generator-status">
          {isRunning ? "Running" : "Stopped"}
        </Badge>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Traffic Generator Controls
          </CardTitle>
          <CardDescription>Configure and control the demo traffic generation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Generation Interval</label>
                <div className="px-3">
                  <Slider
                    value={interval}
                    onValueChange={setInterval}
                    max={10000}
                    min={500}
                    step={500}
                    disabled={isRunning}
                    data-testid="interval-slider"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Current: {interval[0]}ms between requests
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Simulated Users</label>
                <div className="px-3">
                  <Slider
                    value={simulatedUsers}
                    onValueChange={setSimulatedUsers}
                    max={100}
                    min={1}
                    step={1}
                    disabled={isRunning}
                    data-testid="users-slider"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Current: {simulatedUsers[0]} concurrent users
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-4">
            <Button
              onClick={handleToggleTraffic}
              variant={isRunning ? "destructive" : "default"}
              data-testid="btn-toggle-traffic"
            >
              {isRunning ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Stop Traffic
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Traffic
                </>
              )}
            </Button>

            <Button variant="outline" onClick={handleReset} data-testid="btn-reset-stats">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Stats
            </Button>

            <div className="flex items-center space-x-2 ml-auto">
              <label htmlFor="auto-optimize" className="text-sm font-medium">
                Auto-optimize queries
              </label>
              <Switch id="auto-optimize" data-testid="switch-auto-optimize" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-requests">
              {mockStats.totalRequests.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Since last reset</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requests/Min</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-requests-per-min">
              {mockStats.requestsPerMinute}
            </div>
            <p className="text-xs text-muted-foreground">Current rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-active-users">
              {mockStats.activeUsers}
            </div>
            <p className="text-xs text-muted-foreground">Simulated connections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-avg-response">
              {mockStats.avgResponseTime}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Error rate: {mockStats.errorRate}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Live Query Activity
          </CardTitle>
          <CardDescription>Real-time view of generated database queries</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {isRunning ? "Waiting for activity..." : "Start the traffic generator to see live activity"}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={activity.status === 'success' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {activity.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                      <span className="text-xs text-muted-foreground">by {activity.user}</span>
                    </div>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded block">
                      {activity.query}
                    </code>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-semibold">{activity.executionTime}ms</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Query Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Query Patterns</CardTitle>
          <CardDescription>Types of queries being generated for realistic testing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">E-commerce Queries</h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Product catalog browsing</li>
                <li>• Shopping cart operations</li>
                <li>• Order processing</li>
                <li>• Inventory management</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">User Management</h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• User registration/login</li>
                <li>• Profile updates</li>
                <li>• Session management</li>
                <li>• Activity tracking</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Analytics Queries</h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Revenue calculations</li>
                <li>• User behavior analysis</li>
                <li>• Performance metrics</li>
                <li>• Reporting aggregations</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}