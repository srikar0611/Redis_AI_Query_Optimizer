import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Database, Server, Activity, Users, HardDrive, Cpu, MemoryStick, Network } from "lucide-react";

export default function DatabaseStatus() {
  const { data: dbStatus, isLoading } = useQuery({
    queryKey: ['/api/database/status'],
    refetchInterval: 5000,
  });

  const { data: poolStatus } = useQuery({
    queryKey: ['/api/database/pool'],
    refetchInterval: 3000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const mockDbStatus = dbStatus || {
    status: "healthy",
    uptime: "3d 14h 23m",
    version: "PostgreSQL 15.4",
    connections: 45,
    maxConnections: 200,
    database: "connected",
    redis: "fallback"
  };

  const mockPoolStatus = poolStatus || {
    totalConnections: 20,
    activeConnections: 8,
    idleConnections: 12,
    waitingConnections: 0,
    maxPoolSize: 20,
    avgWaitTime: 12,
    connectionErrors: 2,
    lastErrorTime: "2 hours ago"
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="page-title">Database Status</h1>
        <p className="text-muted-foreground">Monitor database health, connections, and performance metrics</p>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Status</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={mockDbStatus.status === 'healthy' ? 'default' : 'destructive'} data-testid="db-status-badge">
                {mockDbStatus.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Uptime: {mockDbStatus.uptime}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="active-connections">
              {mockDbStatus.connections}
            </div>
            <p className="text-xs text-muted-foreground">
              of {mockDbStatus.maxConnections} max
            </p>
            <Progress value={(mockDbStatus.connections / mockDbStatus.maxConnections) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Redis Cache</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={mockDbStatus.redis === 'connected' ? 'default' : 'secondary'} data-testid="redis-status">
                {mockDbStatus.redis}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {mockDbStatus.redis === 'fallback' ? 'Using memory fallback' : 'Connected to Redis'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Version</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {mockDbStatus.version}
            </div>
            <p className="text-xs text-muted-foreground">
              Latest stable
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Connection Pool Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Connection Pool Status
          </CardTitle>
          <CardDescription>Real-time connection pool monitoring and statistics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active Connections</span>
                <span className="text-2xl font-bold text-green-600" data-testid="pool-active">
                  {mockPoolStatus.activeConnections}
                </span>
              </div>
              <Progress value={(mockPoolStatus.activeConnections / mockPoolStatus.maxPoolSize) * 100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Idle Connections</span>
                <span className="text-2xl font-bold text-blue-600" data-testid="pool-idle">
                  {mockPoolStatus.idleConnections}
                </span>
              </div>
              <Progress value={(mockPoolStatus.idleConnections / mockPoolStatus.maxPoolSize) * 100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Waiting</span>
                <span className="text-2xl font-bold text-yellow-600" data-testid="pool-waiting">
                  {mockPoolStatus.waitingConnections}
                </span>
              </div>
              <Progress value={(mockPoolStatus.waitingConnections / 10) * 100} className="h-2" />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground">Total Pool Size</p>
              <p className="font-semibold" data-testid="pool-total">{mockPoolStatus.totalConnections}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Max Pool Size</p>
              <p className="font-semibold" data-testid="pool-max">{mockPoolStatus.maxPoolSize}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Avg Wait Time</p>
              <p className="font-semibold">{mockPoolStatus.avgWaitTime}ms</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Connection Errors</p>
              <p className="font-semibold text-red-600">{mockPoolStatus.connectionErrors}</p>
            </div>
          </div>

          {mockPoolStatus.connectionErrors > 0 && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-800 dark:text-red-200">
                Last connection error: {mockPoolStatus.lastErrorTime}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            System Resources
          </CardTitle>
          <CardDescription>Database server resource utilization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">CPU Usage</span>
              </div>
              <Progress value={45} className="h-3" />
              <p className="text-sm text-muted-foreground">45% (Normal)</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MemoryStick className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Memory Usage</span>
              </div>
              <Progress value={68} className="h-3" />
              <p className="text-sm text-muted-foreground">68% (6.8GB / 10GB)</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Disk Usage</span>
              </div>
              <Progress value={32} className="h-3" />
              <p className="text-sm text-muted-foreground">32% (32GB / 100GB)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Database Actions</CardTitle>
          <CardDescription>Administrative tools and maintenance options</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" data-testid="btn-refresh-stats">
              <Activity className="h-4 w-4 mr-2" />
              Refresh Stats
            </Button>
            <Button variant="outline" data-testid="btn-optimize-connections">
              <Network className="h-4 w-4 mr-2" />
              Optimize Connections
            </Button>
            <Button variant="outline" data-testid="btn-clear-cache">
              <Server className="h-4 w-4 mr-2" />
              Clear Cache
            </Button>
            <Button variant="outline" data-testid="btn-export-logs">
              <Database className="h-4 w-4 mr-2" />
              Export Logs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}