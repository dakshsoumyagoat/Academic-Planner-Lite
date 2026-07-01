import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { 
  LayoutDashboard, 
  CalendarDays, 
  CheckSquare, 
  FileText, 
  Search, 
  Settings,
  Menu,
  Wifi,
  WifiOff
} from "lucide-react";
import { Button } from "./ui/button";
import { getIsOnline } from "@/lib/sync-fetch";
import { getPendingCount } from "@/lib/sync-engine";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [online, setOnline] = useState(getIsOnline());
  const [pending, setPending] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setOnline(getIsOnline());
      getPendingCount().then((c) => setPending(c));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Calendar", href: "/calendar", icon: CalendarDays },
    { name: "Tasks", href: "/tasks", icon: CheckSquare },
    { name: "Tests", href: "/tests", icon: FileText },
    { name: "Search", href: "/search", icon: Search },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-sidebar border-r border-sidebar-border">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border justify-between">
          <h1 className="text-lg font-semibold text-primary tracking-tight">JEE Planner</h1>
          <div className="flex items-center gap-1.5">
            {online ? (
              <Wifi className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <WifiOff className="h-3.5 w-3.5 text-amber-400" />
            )}
            {pending > 0 && (
              <span className="text-[10px] font-medium text-amber-400">{pending}</span>
            )}
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}>
                  <Icon className="h-4 w-4" />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="md:hidden h-16 flex items-center px-4 border-b border-border bg-background">
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="ml-4 text-lg font-semibold text-primary tracking-tight">JEE Planner</h1>
        </header>

        {isMobileMenuOpen && (
          <nav className="md:hidden border-b border-border bg-sidebar p-2 space-y-1">
            {navigation.map((item) => {
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href}>
                  <div 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium ${
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-sidebar-foreground"
                  }`}>
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </nav>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
