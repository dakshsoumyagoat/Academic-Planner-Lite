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
import MonthlyGoals from "@/pages/monthly-goals";
import Syllabus from "@/pages/syllabus";
import Login from "@/pages/login";
import { useGetSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { applyAccentColor } from "@/lib/accent";
import { AuthProvider, useAuth } from "@/lib/auth";

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
        <Route path="/monthly-goals" component={MonthlyGoals} />
        <Route path="/syllabus" component={Syllabus} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function ThemeAndAccentInit() {
  const { data: settings } = useGetSettings({ query: { queryKey: getGetSettingsQueryKey() } });

  useEffect(() => {
    if (!settings) return;
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
    applyAccentColor(settings.accentColor);
  }, [settings]);

  return null;
}

function AppInner() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <>
      <ThemeAndAccentInit />
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
    </>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppInner />
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
