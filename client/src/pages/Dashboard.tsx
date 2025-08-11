import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import MetricsGrid from "@/components/MetricsGrid";
import QueryMonitor from "@/components/QueryMonitor";
import AIOptimizationPanel from "@/components/AIOptimizationPanel";
import PerformanceCharts from "@/components/PerformanceCharts";
import { useWebSocket } from "@/hooks/useWebSocket";

export default function Dashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState("1hour");
  const [liveMetrics, setLiveMetrics] = useState(null);

  // WebSocket connection for real-time updates
  const { isConnected, lastMessage } = useWebSocket();

  // Handle real-time updates
  useEffect(() => {
    if (lastMessage) {
      const message = JSON.parse(lastMessage);
      
      if (message.type === 'demo:metrics') {
        setLiveMetrics(message.data);
      }
    }
  }, [lastMessage]);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
              <p className="text-sm text-muted-foreground">Real-time database optimization and monitoring</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Real-time indicator */}
              <div className="flex items-center space-x-2" data-testid="realtime-indicator">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-secondary animate-pulse' : 'bg-muted'}`}></div>
                <span className="text-sm text-foreground">
                  {isConnected ? 'Live' : 'Disconnected'}
                </span>
              </div>
              
              {/* Time range selector */}
              <select 
                className="bg-input border border-border rounded-lg px-3 py-1 text-sm text-foreground"
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                data-testid="time-range-selector"
              >
                <option value="1hour">Last 1 hour</option>
                <option value="6hours">Last 6 hours</option>
                <option value="24hours">Last 24 hours</option>
                <option value="7days">Last 7 days</option>
              </select>

              {/* User info */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground" data-testid="user-name">Admin User</p>
                  <p className="text-xs text-muted-foreground" data-testid="user-role">Database Administrator</p>
                </div>
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-primary-foreground text-xs"></i>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Metrics Grid */}
          <MetricsGrid liveMetrics={liveMetrics} />
          
          {/* Performance Charts */}
          <PerformanceCharts timeRange={selectedTimeRange} />
          
          {/* Query Monitor and AI Panel */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <QueryMonitor />
            </div>
            <div>
              <AIOptimizationPanel />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
