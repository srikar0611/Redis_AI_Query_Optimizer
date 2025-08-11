import { useState } from "react";

export default function Sidebar() {
  const [activeSection, setActiveSection] = useState("dashboard");

  const navigationItems = [
    { id: "dashboard", icon: "fas fa-tachometer-alt", label: "Dashboard", active: true },
    { id: "queries", icon: "fas fa-search", label: "Query Monitor" },
    { id: "optimization", icon: "fas fa-robot", label: "AI Optimization" },
    { id: "analytics", icon: "fas fa-chart-line", label: "Analytics" },
    { id: "alerts", icon: "fas fa-bell", label: "Alerts", badge: "3" },
  ];

  const demoItems = [
    { id: "ecommerce", icon: "fas fa-shopping-cart", label: "E-commerce Demo" },
    { id: "traffic", icon: "fas fa-traffic-light", label: "Traffic Generator" },
  ];

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo and Brand */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center space-x-3" data-testid="sidebar-brand">
          <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <i className="fas fa-bolt text-sidebar-primary-foreground text-sm"></i>
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">Redis AI</h1>
            <p className="text-xs text-muted-foreground">Query Optimizer</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === item.id
                  ? 'bg-sidebar-primary/20 text-sidebar-primary border border-sidebar-primary/30'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent transition-colors'
              }`}
              data-testid={`nav-${item.id}`}
            >
              <i className={`${item.icon} w-4`}></i>
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-8">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Demo App
          </h3>
          <div className="space-y-2">
            {demoItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors text-sm"
                data-testid={`demo-${item.id}`}
              >
                <i className={`${item.icon} w-4`}></i>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* System Status */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="space-y-3">
          <div className="flex items-center justify-between" data-testid="redis-status">
            <span className="text-sm text-muted-foreground">Redis Status</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-secondary rounded-full"></div>
              <span className="text-xs text-secondary">Online</span>
            </div>
          </div>
          <div className="flex items-center justify-between" data-testid="ai-model-status">
            <span className="text-sm text-muted-foreground">AI Model</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-secondary rounded-full"></div>
              <span className="text-xs text-secondary">Active</span>
            </div>
          </div>
          <div className="flex items-center justify-between" data-testid="db-pool-status">
            <span className="text-sm text-muted-foreground">DB Pool</span>
            <span className="text-xs text-muted-foreground">12/20</span>
          </div>
        </div>
      </div>
    </div>
  );
}
