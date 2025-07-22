import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SportProvider } from "@/contexts/sport-context";
import Dashboard from "@/pages/dashboard";


import AIChat from "@/pages/ai-chat";
import Settings from "@/pages/settings";
import TailWatch from "@/pages/tail-watch";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />


      <Route path="/tail-watch" component={TailWatch} />
      <Route path="/ai-chat" component={AIChat} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SportProvider>
          <div className="min-h-screen bg-dark text-text-primary">
            <Toaster />
            <Router />
          </div>
        </SportProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
