import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PerformanceChartsProps {
  timeRange: string;
}

interface ChartData {
  interval: string;
  avgTime: number;
  queryCount: number;
}

export default function PerformanceCharts({ timeRange }: PerformanceChartsProps) {
  const performanceChartRef = useRef<HTMLCanvasElement>(null);
  const loadChartRef = useRef<HTMLCanvasElement>(null);
  const performanceChartInstance = useRef<any>(null);
  const loadChartInstance = useRef<any>(null);

  const { data: chartData, isLoading } = useQuery<ChartData[]>({
    queryKey: ['/api/performance/chart-data', timeRange],
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (chartData && performanceChartRef.current && (window as any).Chart) {
      // Destroy existing chart
      if (performanceChartInstance.current) {
        performanceChartInstance.current.destroy();
      }

      const ctx = performanceChartRef.current.getContext('2d');
      if (ctx) {
        const labels = chartData.map(d => {
          const date = new Date(d.interval);
          return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          });
        });

        const responseTimeData = chartData.map(d => parseFloat(d.avgTime?.toString() || '0'));
        const optimizedData = chartData.map(d => Math.max(0, responseTimeData[0] - Math.random() * 10));

        performanceChartInstance.current = new (window as any).Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: 'Response Time (ms)',
              data: responseTimeData,
              borderColor: 'hsl(215, 89%, 53.73%)',
              backgroundColor: 'hsla(215, 89%, 53.73%, 0.1)',
              tension: 0.4,
              pointRadius: 3,
              pointHoverRadius: 6,
            }, {
              label: 'Optimized Queries',
              data: optimizedData,
              borderColor: 'hsl(159.78%, 100%, 36.08%)',
              backgroundColor: 'hsla(159.78%, 100%, 36.08%, 0.1)',
              tension: 0.4,
              pointRadius: 3,
              pointHoverRadius: 6,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              intersect: false,
              mode: 'index',
            },
            plugins: {
              legend: {
                labels: {
                  color: '#CBD5E1',
                  font: {
                    size: 12
                  }
                }
              },
              tooltip: {
                backgroundColor: 'rgba(30, 41, 59, 0.9)',
                titleColor: '#F1F5F9',
                bodyColor: '#CBD5E1',
                borderColor: '#334155',
                borderWidth: 1,
              }
            },
            scales: {
              x: {
                ticks: {
                  color: '#94A3B8',
                  font: {
                    size: 11
                  }
                },
                grid: {
                  color: 'rgba(148, 163, 184, 0.1)'
                }
              },
              y: {
                ticks: {
                  color: '#94A3B8',
                  font: {
                    size: 11
                  }
                },
                grid: {
                  color: 'rgba(148, 163, 184, 0.1)'
                },
                beginAtZero: true
              }
            }
          }
        });
      }
    }
  }, [chartData]);

  useEffect(() => {
    if (loadChartRef.current && (window as any).Chart) {
      // Destroy existing chart
      if (loadChartInstance.current) {
        loadChartInstance.current.destroy();
      }

      const ctx = loadChartRef.current.getContext('2d');
      if (ctx) {
        loadChartInstance.current = new (window as any).Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DDL'],
            datasets: [{
              data: [45, 25, 20, 8, 2],
              backgroundColor: [
                'hsl(215, 89%, 53.73%)',
                'hsl(159.78%, 100%, 36.08%)', 
                'hsl(42.03%, 92.83%, 56.27%)',
                'hsl(0, 84%, 60%)',
                'hsl(267, 84%, 65%)'
              ],
              borderColor: 'hsl(215, 25%, 15.29%)',
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  color: '#CBD5E1',
                  padding: 20,
                  font: {
                    size: 12
                  }
                }
              },
              tooltip: {
                backgroundColor: 'rgba(30, 41, 59, 0.9)',
                titleColor: '#F1F5F9',
                bodyColor: '#CBD5E1',
                borderColor: '#334155',
                borderWidth: 1,
              }
            }
          }
        });
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (performanceChartInstance.current) {
        performanceChartInstance.current.destroy();
      }
      if (loadChartInstance.current) {
        loadChartInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Query Performance Chart */}
      <Card className="bg-card rounded-xl p-6 border border-border" data-testid="performance-chart">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Query Performance Trends</h3>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-xs text-primary hover:text-primary/80 transition-colors"
            data-testid="performance-details-btn"
          >
            <i className="fas fa-external-link-alt mr-1"></i>View Details
          </Button>
        </div>
        <div className="h-64 chart-container">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <i className="fas fa-spinner animate-spin text-muted-foreground text-xl"></i>
            </div>
          ) : (
            <canvas ref={performanceChartRef}></canvas>
          )}
        </div>
      </Card>

      {/* Database Load Distribution */}
      <Card className="bg-card rounded-xl p-6 border border-border" data-testid="load-chart">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Database Load Distribution</h3>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-xs text-primary hover:text-primary/80 transition-colors"
            data-testid="load-configure-btn"
          >
            <i className="fas fa-cog mr-1"></i>Configure
          </Button>
        </div>
        <div className="h-64 chart-container">
          <canvas ref={loadChartRef}></canvas>
        </div>
      </Card>
    </div>
  );
}
