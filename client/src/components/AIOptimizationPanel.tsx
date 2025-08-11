import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/hooks/useWebSocket";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Optimization {
  id: number;
  optimizationType: string;
  suggestion: string;
  confidence: number;
  estimatedImprovement: number;
  status: string;
  createdAt: string;
}

interface Alert {
  id: number;
  type: string;
  title: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export default function AIOptimizationPanel() {
  const [liveOptimizations, setLiveOptimizations] = useState<Optimization[]>([]);
  const [demoMetrics, setDemoMetrics] = useState({
    queriesPerMin: 342,
    activeUsers: 1247,
    databaseLoad: 60
  });
  
  const { lastMessage } = useWebSocket();
  const { toast } = useToast();

  const { data: optimizations } = useQuery<Optimization[]>({
    queryKey: ['/api/optimizations/active'],
    refetchInterval: 30000,
  });

  const { data: alerts } = useQuery<Alert[]>({
    queryKey: ['/api/alerts'],
    refetchInterval: 15000,
  });

  // Handle real-time optimization updates
  useEffect(() => {
    if (lastMessage) {
      const message = JSON.parse(lastMessage);
      
      if (message.type === 'optimization:suggestion') {
        const newOptimization = message.data;
        setLiveOptimizations(prev => {
          const updated = [newOptimization, ...prev].slice(0, 5);
          return updated;
        });
      }
      
      if (message.type === 'demo:metrics') {
        setDemoMetrics(message.data);
      }
    }
  }, [lastMessage]);

  const handleApplyOptimization = async (optimizationId: number) => {
    try {
      await apiRequest('POST', `/api/optimizations/${optimizationId}/apply`);
      toast({
        title: "Optimization Applied",
        description: "The optimization has been applied successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to apply optimization.",
        variant: "destructive",
      });
    }
  };

  const startTrafficGenerator = async () => {
    try {
      await apiRequest('POST', '/api/demo/traffic/start', { interval: 2000 });
      toast({
        title: "Traffic Generator Started",
        description: "Demo traffic generation has been increased.",
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to start traffic generator.",
        variant: "destructive",
      });
    }
  };

  const getOptimizationIcon = (type: string) => {
    switch (type) {
      case 'index':
        return 'fas fa-list';
      case 'rewrite':
        return 'fas fa-edit';
      case 'cache':
        return 'fas fa-memory';
      default:
        return 'fas fa-cog';
    }
  };

  const getOptimizationColor = (type: string) => {
    switch (type) {
      case 'index':
        return 'text-accent';
      case 'rewrite':
        return 'text-secondary';
      case 'cache':
        return 'text-primary';
      default:
        return 'text-muted-foreground';
    }
  };

  const displayOptimizations = liveOptimizations.length > 0 ? liveOptimizations : (optimizations || []);
  const displayAlerts = alerts?.filter(alert => alert.isActive) || [];

  return (
    <div className="space-y-6">
      {/* AI Suggestions */}
      <Card className="bg-card rounded-xl p-6 border border-border" data-testid="ai-suggestions">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
            <i className="fas fa-robot text-accent text-sm"></i>
          </div>
          <h3 className="text-lg font-semibold text-foreground">AI Suggestions</h3>
        </div>
        
        <div className="space-y-4">
          {displayOptimizations.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-brain text-muted-foreground text-2xl mb-2"></i>
              <p className="text-muted-foreground">No active optimizations</p>
              <p className="text-xs text-muted-foreground mt-1">AI is monitoring your queries</p>
            </div>
          ) : (
            displayOptimizations.slice(0, 2).map((optimization, index) => (
              <div key={optimization.id || index} className="ai-suggestion-card" data-testid={`suggestion-${optimization.id || index}`}>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-medium text-accent capitalize">
                    <i className={`${getOptimizationIcon(optimization.optimizationType)} mr-1`}></i>
                    {optimization.optimizationType} Recommendation
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Confidence: {optimization.confidence}%
                  </span>
                </div>
                <p className="text-sm text-foreground mb-3">
                  {optimization.suggestion}
                </p>
                <div className="flex space-x-2">
                  <Button 
                    size="sm"
                    className="px-3 py-1 bg-primary hover:bg-primary/80 text-primary-foreground text-xs rounded-md transition-colors"
                    onClick={() => handleApplyOptimization(optimization.id)}
                    data-testid={`apply-btn-${optimization.id || index}`}
                  >
                    Apply
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="px-3 py-1 bg-muted hover:bg-muted/80 text-muted-foreground text-xs rounded-md transition-colors"
                    onClick={() => {
                      // Show SQL diff modal or navigate to detailed view
                      toast({
                        title: "SQL Review",
                        description: `Original: ${optimization.originalQuery?.substring(0, 50)}...\nOptimized: ${optimization.optimizedQuery?.substring(0, 50)}...`,
                      });
                    }}
                    data-testid={`review-btn-${optimization.id || index}`}
                  >
                    Review SQL
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Active Alerts */}
      <Card className="bg-card rounded-xl p-6 border border-border" data-testid="active-alerts">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Active Alerts</h3>
          <span className="bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full" data-testid="alert-count">
            {displayAlerts.length}
          </span>
        </div>
        
        <div className="space-y-3">
          {displayAlerts.length === 0 ? (
            <div className="text-center py-4">
              <i className="fas fa-shield-alt text-secondary text-xl mb-2"></i>
              <p className="text-muted-foreground text-sm">All systems healthy</p>
            </div>
          ) : (
            displayAlerts.slice(0, 3).map((alert) => (
              <div 
                key={alert.id}
                className={`flex items-start space-x-3 p-3 rounded-lg border ${
                  alert.type === 'critical' 
                    ? 'bg-red-900/20 border-red-700/50' 
                    : alert.type === 'warning'
                    ? 'bg-yellow-900/20 border-yellow-700/50'
                    : 'bg-blue-900/20 border-blue-700/50'
                }`}
                data-testid={`alert-${alert.id}`}
              >
                <i className={`fas ${
                  alert.type === 'critical' 
                    ? 'fa-exclamation-triangle text-destructive' 
                    : alert.type === 'warning'
                    ? 'fa-clock text-accent'
                    : 'fa-info-circle text-primary'
                } mt-0.5`}></i>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{alert.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {displayAlerts.length > 3 && (
          <Button 
            variant="outline"
            className="w-full mt-4 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground text-sm rounded-lg transition-colors"
            data-testid="view-all-alerts"
          >
            View All Alerts
          </Button>
        )}
      </Card>

      {/* Demo E-commerce Status */}
      <Card className="bg-card rounded-xl p-6 border border-border" data-testid="demo-status">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <i className="fas fa-shopping-cart text-blue-400 text-sm"></i>
          </div>
          <h3 className="text-lg font-semibold text-foreground">Demo E-commerce</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Traffic Generation</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
              <span className="text-xs text-secondary">Active</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Queries/min</span>
            <span className="text-sm text-foreground" data-testid="queries-per-min">
              {demoMetrics.queriesPerMin}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Active Users</span>
            <span className="text-sm text-foreground" data-testid="active-users">
              {demoMetrics.activeUsers.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Database Load</span>
            <div className="flex items-center space-x-2">
              <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent transition-all duration-300" 
                  style={{ width: `${demoMetrics.databaseLoad}%` }}
                ></div>
              </div>
              <span className="text-xs text-muted-foreground" data-testid="database-load">
                {demoMetrics.databaseLoad}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex space-x-2 mt-4">
          <Button 
            size="sm"
            className="flex-1 px-3 py-2 bg-primary hover:bg-primary/80 text-primary-foreground text-xs rounded-lg transition-colors"
            onClick={startTrafficGenerator}
            data-testid="increase-load-btn"
          >
            <i className="fas fa-play mr-1"></i>
            Increase Load
          </Button>
          <Button 
            size="sm"
            variant="outline"
            className="flex-1 px-3 py-2 bg-muted hover:bg-muted/80 text-muted-foreground text-xs rounded-lg transition-colors"
            data-testid="view-app-btn"
          >
            <i className="fas fa-external-link-alt mr-1"></i>
            View App
          </Button>
        </div>
      </Card>
    </div>
  );
}
