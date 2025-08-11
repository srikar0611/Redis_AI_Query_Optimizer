import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";

interface LiveMetrics {
  queriesPerMin?: number;
  activeUsers?: number;
  databaseLoad?: number;
}

interface MetricsGridProps {
  liveMetrics?: LiveMetrics | null;
}

interface Metrics {
  totalQueries: number;
  avgResponseTime: string;
  aiOptimizations: number;
  costSavings: string;
}

export default function MetricsGrid({ liveMetrics }: MetricsGridProps) {
  const { data: metrics, isLoading } = useQuery<Metrics>({
    queryKey: ['/api/metrics'],
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  const metricsData = [
    {
      title: "Total Queries",
      value: isLoading ? "Loading..." : metrics?.totalQueries.toLocaleString() || "0",
      change: "+12.3%",
      changeType: "positive",
      icon: "fas fa-database",
      iconBg: "bg-primary/20",
      iconColor: "text-primary",
      testId: "metric-total-queries"
    },
    {
      title: "Avg Response Time", 
      value: isLoading ? "Loading..." : `${metrics?.avgResponseTime || "0"}ms`,
      change: "-5.2%",
      changeType: "positive",
      icon: "fas fa-stopwatch",
      iconBg: "bg-secondary/20",
      iconColor: "text-secondary",
      testId: "metric-response-time"
    },
    {
      title: "AI Optimizations",
      value: isLoading ? "Loading..." : metrics?.aiOptimizations.toLocaleString() || "0",
      change: "Active",
      changeType: "info",
      icon: "fas fa-brain",
      iconBg: "bg-accent/20", 
      iconColor: "text-accent",
      testId: "metric-ai-optimizations"
    },
    {
      title: "Cost Savings",
      value: isLoading ? "Loading..." : `$${metrics?.costSavings || "0"}`,
      change: "40.2%",
      changeType: "positive",
      icon: "fas fa-piggy-bank",
      iconBg: "bg-secondary/20",
      iconColor: "text-secondary",
      testId: "metric-cost-savings"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metricsData.map((metric, index) => (
        <Card key={index} className="bg-card rounded-xl p-6 border border-border" data-testid={metric.testId}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{metric.title}</p>
              <p className="text-2xl font-bold text-foreground">{metric.value}</p>
              <div className="flex items-center mt-2">
                {metric.changeType === "positive" && (
                  <i className="fas fa-arrow-up text-secondary text-xs"></i>
                )}
                {metric.changeType === "info" && (
                  <i className="fas fa-robot text-accent text-xs"></i>
                )}
                <span className={`text-xs ml-1 ${
                  metric.changeType === "positive" ? "text-secondary" : "text-accent"
                }`}>
                  {metric.change}
                </span>
                <span className="text-xs text-muted-foreground ml-1">
                  {metric.changeType === "positive" ? "from last hour" : "suggestions"}
                </span>
              </div>
            </div>
            <div className={`w-12 h-12 ${metric.iconBg} rounded-xl flex items-center justify-center`}>
              <i className={`${metric.icon} ${metric.iconColor}`}></i>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
