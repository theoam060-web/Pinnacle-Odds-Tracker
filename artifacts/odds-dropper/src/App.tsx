import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AlertStoreProvider } from "@/lib/alert-context";
import { BetStoreProvider } from "@/lib/bet-store";
import { SettingsProvider } from "@/lib/settings-context";
import NotFound from "@/pages/not-found";
import FeedPage from "@/pages/feed";
import EventDetailPage from "@/pages/event-detail";
import BetTrackerPage from "@/pages/bet-tracker";
import BetStatsPage from "@/pages/bet-stats";
import AlertConfigurationsPage from "@/pages/alert-configurations";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5000,
    }
  }
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={FeedPage} />
      <Route path="/event/:id" component={EventDetailPage} />
      <Route path="/bet-tracker" component={BetTrackerPage} />
      <Route path="/bet-stats" component={BetStatsPage} />
      <Route path="/alert-configurations" component={AlertConfigurationsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <AlertStoreProvider>
          <BetStoreProvider>
            <TooltipProvider>
              <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
                <Router />
              </WouterRouter>
              <Toaster />
            </TooltipProvider>
          </BetStoreProvider>
        </AlertStoreProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
}

export default App;
