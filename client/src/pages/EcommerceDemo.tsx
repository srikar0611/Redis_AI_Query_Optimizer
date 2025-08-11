import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Package, Users, TrendingUp, Database, Play, Pause, Eye } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function EcommerceDemo() {
  const [isRunning, setIsRunning] = useState(false);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const { toast } = useToast();

  const { data: demoStats } = useQuery({
    queryKey: ['/api/demo/ecommerce/stats'],
    refetchInterval: isRunning ? 3000 : false,
  });

  const mockStats = {
    totalProducts: 1247,
    totalUsers: 8924,
    totalOrders: 2156,
    totalRevenue: 89430.50,
    averageOrderValue: 41.50,
    conversionRate: 3.2,
    ordersToday: 127,
    revenueToday: 5280.75,
    topCategories: [
      { name: 'Electronics', count: 423, percentage: 34 },
      { name: 'Clothing', count: 312, percentage: 25 },
      { name: 'Books', count: 189, percentage: 15 },
      { name: 'Sports', count: 156, percentage: 13 },
      { name: 'Home', count: 167, percentage: 13 }
    ],
    ...demoStats
  };

  const handleToggleDemo = async () => {
    try {
      if (isRunning) {
        await apiRequest('/api/demo/ecommerce/stop', { method: 'POST' });
        setIsRunning(false);
        toast({
          title: "E-commerce Demo Stopped",
          description: "Demo traffic has been paused",
        });
      } else {
        await apiRequest('/api/demo/ecommerce/start', { method: 'POST' });
        setIsRunning(true);
        toast({
          title: "E-commerce Demo Started",
          description: "Generating realistic e-commerce activity",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle demo",
        variant: "destructive",
      });
    }
  };

  const handleViewApp = () => {
    toast({
      title: "E-commerce App",
      description: "Opening demo storefront in a new window...",
    });
    // In a real implementation, this would open the demo app
    window.open('/demo-store', '_blank');
  };

  // Simulate live order updates
  useEffect(() => {
    if (isRunning) {
      const orderInterval = setInterval(() => {
        const products = ['Wireless Headphones', 'Smart Watch', 'Laptop Stand', 'Coffee Maker', 'Gaming Mouse'];
        const users = ['Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson', 'Eve Brown'];
        
        const newOrder = {
          id: `ORD-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          customer: users[Math.floor(Math.random() * users.length)],
          product: products[Math.floor(Math.random() * products.length)],
          amount: (Math.random() * 200 + 20).toFixed(2),
          status: Math.random() > 0.1 ? 'completed' : 'processing'
        };

        setRecentOrders(prev => [newOrder, ...prev.slice(0, 9)]);
      }, 3000);

      return () => clearInterval(orderInterval);
    }
  }, [isRunning]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="page-title">E-commerce Demo</h1>
          <p className="text-muted-foreground">Interactive e-commerce application for query optimization testing</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={isRunning ? "default" : "secondary"} data-testid="demo-status">
            {isRunning ? "Running" : "Stopped"}
          </Badge>
          <Button onClick={handleViewApp} variant="outline" data-testid="btn-view-app">
            <Eye className="h-4 w-4 mr-2" />
            View App
          </Button>
          <Button onClick={handleToggleDemo} data-testid="btn-toggle-demo">
            {isRunning ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Stop Demo
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Demo
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Demo Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-products">
              {mockStats.totalProducts.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Across 15 categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-users">
              {mockStats.totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Registered customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-orders">
              {mockStats.totalOrders.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-revenue">
              ${mockStats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total sales</p>
          </CardContent>
        </Card>
      </div>

      {/* Application Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Demo Application Features
          </CardTitle>
          <CardDescription>
            This e-commerce demo generates realistic database queries for testing optimization algorithms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Database Operations</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Product catalog searches with filters</li>
                <li>• User authentication and session management</li>
                <li>• Shopping cart operations (add/remove/update)</li>
                <li>• Order processing and payment handling</li>
                <li>• Inventory management and stock updates</li>
                <li>• Customer analytics and behavior tracking</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Query Patterns Generated</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Complex JOIN operations across multiple tables</li>
                <li>• Aggregate queries for sales reporting</li>
                <li>• Full-text search on product descriptions</li>
                <li>• Geo-location queries for shipping</li>
                <li>• Time-series queries for analytics</li>
                <li>• Concurrent write operations for inventory</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Product Categories</CardTitle>
          <CardDescription>Distribution of products by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockStats.topCategories.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{category.name}</span>
                  <span className="text-sm text-muted-foreground">{category.count} products</span>
                </div>
                <Progress value={category.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Order Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Live Order Activity
          </CardTitle>
          <CardDescription>Real-time order processing (when demo is running)</CardDescription>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {isRunning ? "Waiting for orders..." : "Start the demo to see live order activity"}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={order.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                        {order.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{order.timestamp}</span>
                    </div>
                    <p className="text-sm font-medium">{order.customer} ordered {order.product}</p>
                    <p className="text-xs text-muted-foreground">Order ID: {order.id}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">${order.amount}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Insights</CardTitle>
          <CardDescription>How this demo helps optimize your database</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <div className="font-semibold">Query Complexity</div>
              <p className="text-muted-foreground">
                Generates queries with varying complexity levels to test optimization algorithms under different scenarios.
              </p>
            </div>
            <div className="space-y-2">
              <div className="font-semibold">Load Testing</div>
              <p className="text-muted-foreground">
                Simulates concurrent user sessions to identify performance bottlenecks in high-traffic situations.
              </p>
            </div>
            <div className="space-y-2">
              <div className="font-semibold">Pattern Recognition</div>
              <p className="text-muted-foreground">
                Creates realistic query patterns that help the AI learn common optimization opportunities.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}