import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";
import { useEffect } from "react";
import Dashboard from "@/pages/dashboard";
import Calendar from "@/pages/calendar";
import Tasks from "@/pages/tasks";
import Tests from "@/pages/tests";
import Search from "@/pages/search";
import Settings from "@/pages/settings";
import { useGetSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { applyAccentColor } from "@/lib/accent";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/calendar" component={Calendar} />
        <Route path="/tasks" component={Tasks} />
        <Route path="/tests" component={Tests} />
        <Route path="/search" component={Search} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function ThemeAndAccentInit() {
  const { data: settings } = useGetSettings({ query: { queryKey: getGetSettingsQueryKey() } });

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    if (!settings) return;
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
    applyAccentColor(settings.accentColor);
  }, [settings]);

  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeAndAccentInit />
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
