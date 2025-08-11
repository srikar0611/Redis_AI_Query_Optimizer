import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  TrendingUp, 
  Database, 
  Settings, 
  Activity,
  ChevronRight,
  AlertCircle,
  ShoppingCart,
  Play
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Query Performance Trends', href: '/query-trends', icon: TrendingUp },
  { name: 'Database Status', href: '/database-status', icon: Database },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const demoItems = [
  { name: 'E-commerce Demo', href: '/ecommerce-demo', icon: ShoppingCart },
  { name: 'Traffic Generator', href: '/traffic-generator', icon: Play },
];

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();

  return (
    <div className={cn("flex h-screen w-64 flex-col bg-card border-r", className)} data-testid="sidebar">
      {/* Logo and Header */}
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Database className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Redis AI</h1>
            <p className="text-xs text-muted-foreground">Query Optimizer</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4" data-testid="sidebar-nav">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href || (item.href === '/' && location === '/dashboard');
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive && "bg-primary text-primary-foreground"
                  )}
                  data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.name}
                  {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Demo Section */}
        <div className="mt-8">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Demo Applications
          </h3>
          <div className="space-y-1">
            {demoItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isActive && "bg-primary text-primary-foreground"
                    )}
                    data-testid={`demo-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.name}
                    {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Status Footer */}
      <div className="border-t p-4" data-testid="sidebar-status">
        <div className="flex items-center space-x-2 text-sm">
          <div className="flex h-2 w-2 rounded-full bg-green-500" data-testid="system-status-indicator"></div>
          <span className="text-muted-foreground">System Healthy</span>
        </div>
        <div className="mt-2 flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-orange-500" />
          <span className="text-sm text-muted-foreground" data-testid="active-alerts-count">0 Active Alerts</span>
          <Badge variant="secondary" className="ml-auto">
            All Clear
          </Badge>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
