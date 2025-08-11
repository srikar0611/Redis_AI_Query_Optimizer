import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/Dashboard";
import QueryTrends from "@/pages/QueryTrends";
import DatabaseStatus from "@/pages/DatabaseStatus";
import TrafficGenerator from "@/pages/TrafficGenerator";
import EcommerceDemo from "@/pages/EcommerceDemo";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/query-trends" component={QueryTrends} />
      <Route path="/database-status" component={DatabaseStatus} />
      <Route path="/traffic-generator" component={TrafficGenerator} />
      <Route path="/ecommerce-demo" component={EcommerceDemo} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark min-h-screen bg-background text-foreground">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
