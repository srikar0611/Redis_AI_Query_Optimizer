import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/hooks/useWebSocket";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface QueryLog {
  id: number;
  queryText: string;
  executionTime: number;
  affectedTables: string[];
  status: string;
  createdAt: string;
}

export default function QueryMonitor() {
  const [liveQueries, setLiveQueries] = useState<QueryLog[]>([]);
  const { lastMessage } = useWebSocket();
  const { toast } = useToast();

  const { data: initialQueries, isLoading } = useQuery<QueryLog[]>({
    queryKey: ['/api/queries/recent'],
    refetchInterval: 10000,
  });

  // Handle real-time query updates
  useEffect(() => {
    if (lastMessage) {
      const message = JSON.parse(lastMessage);
      
      if (message.type === 'query:live') {
        const newQuery = message.data;
        setLiveQueries(prev => {
          // Add new query to the top and limit to 20 queries
          const updated = [newQuery, ...prev].slice(0, 20);
          return updated;
        });
      }
    }
  }, [lastMessage]);

  // Initialize with API data
  useEffect(() => {
    if (initialQueries && liveQueries.length === 0) {
      setLiveQueries(initialQueries);
    }
  }, [initialQueries, liveQueries.length]);

  const handleOptimize = async (queryId: number) => {
    try {
      await apiRequest('POST', `/api/optimizations/${queryId}/apply`);
      toast({
        title: "Optimization Requested",
        description: "AI optimization has been requested for this query.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to request optimization.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2 py-1 text-xs font-medium rounded-md";
    
    switch (status) {
      case 'fast':
        return `${baseClasses} bg-green-900/30 text-green-300`;
      case 'slow':
        return `${baseClasses} bg-yellow-900/30 text-yellow-300`;
      case 'critical':
        return `${baseClasses} bg-red-900/30 text-red-300`;
      default:
        return `${baseClasses} bg-gray-900/30 text-gray-300`;
    }
  };

  const getTableBadge = (table: string) => {
    const colors = {
      'products': 'bg-blue-900/30 text-blue-300',
      'users': 'bg-green-900/30 text-green-300',
      'orders': 'bg-purple-900/30 text-purple-300',
      'categories': 'bg-orange-900/30 text-orange-300',
    };
    
    const colorClass = colors[table as keyof typeof colors] || 'bg-gray-900/30 text-gray-300';
    return `inline-flex px-2 py-1 text-xs font-medium rounded-md ${colorClass}`;
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now.getTime() - time.getTime()) / 1000);
    
    if (diff < 60) return `${diff} sec ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    return `${Math.floor(diff / 3600)} hr ago`;
  };

  if (isLoading && liveQueries.length === 0) {
    return (
      <Card className="bg-card rounded-xl border border-border">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Live Query Monitor</h3>
        </div>
        <div className="p-8 text-center">
          <i className="fas fa-spinner animate-spin text-muted-foreground text-xl mb-2"></i>
          <p className="text-muted-foreground">Loading queries...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-card rounded-xl border border-border" data-testid="query-monitor">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Live Query Monitor</h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">Auto-refresh:</span>
            <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Query
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Table
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                AI
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {liveQueries.slice(0, 15).map((query) => (
              <tr key={`${query.id}-${query.createdAt}`} className="table-hover-row" data-testid={`query-row-${query.id}`}>
                <td className="px-6 py-4">
                  <div 
                    className="text-sm text-foreground font-mono truncate max-w-xs cursor-pointer" 
                    title={query.queryText}
                    data-testid={`query-text-${query.id}`}
                  >
                    {query.queryText.length > 60 
                      ? `${query.queryText.substring(0, 60)}...`
                      : query.queryText
                    }
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-foreground" data-testid={`query-time-${query.id}`}>
                    {query.executionTime}ms
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatTimeAgo(query.createdAt)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {query.affectedTables.map((table, idx) => (
                    <span key={idx} className={getTableBadge(table)}>
                      {table}
                    </span>
                  ))}
                </td>
                <td className="px-6 py-4">
                  <span className={getStatusBadge(query.status)} data-testid={`query-status-${query.id}`}>
                    <i className={`fas ${query.status === 'fast' ? 'fa-check' : query.status === 'slow' ? 'fa-clock' : 'fa-exclamation-triangle'} mr-1`}></i>
                    {query.status.charAt(0).toUpperCase() + query.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {query.status === 'fast' ? (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-muted text-muted-foreground rounded-md">
                      <i className="fas fa-check mr-1"></i>
                      Optimal
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="inline-flex items-center px-2 py-1 text-xs font-medium bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 transition-colors"
                      onClick={() => handleOptimize(query.id)}
                      data-testid={`optimize-btn-${query.id}`}
                    >
                      <i className="fas fa-magic mr-1"></i>
                      Optimize
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
