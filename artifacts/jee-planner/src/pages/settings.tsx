import { useEffect } from "react";
import { useGetSettings, getGetSettingsQueryKey, useUpdateSettings } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Moon, Sun } from "lucide-react";
import { applyAccentColor } from "@/lib/accent";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ACCENT_COLORS = [
  { name: "Indigo", value: "#6366f1" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Emerald", value: "#10b981" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Amber", value: "#f59e0b" },
];

export default function Settings() {
  const qc = useQueryClient();
  const { data: settings, isLoading } = useGetSettings({ query: { queryKey: getGetSettingsQueryKey() } });
  const updateSettings = useUpdateSettings({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getGetSettingsQueryKey() }) } });

  useEffect(() => {
    if (settings) {
      document.documentElement.classList.toggle("dark", settings.theme === "dark");
    }
  }, [settings]);

  function handleThemeToggle() {
    const newTheme = settings?.theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    updateSettings.mutate({ data: { theme: newTheme } });
  }

  function handleAccentColor(color: string) {
    applyAccentColor(color);
    updateSettings.mutate({ data: { accentColor: color } });
  }

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-xl">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-xl">
      <h1 className="text-xl font-bold text-foreground">Settings</h1>

      <Card className="bg-card border-border p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Theme</p>
            <p className="text-xs text-muted-foreground mt-0.5">Switch between dark and light mode</p>
          </div>
          <button
            onClick={handleThemeToggle}
            className="flex items-center gap-2 px-3 py-2 rounded-md border bg-muted border-border text-sm font-medium transition-colors text-foreground"
          >
            {settings?.theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            {settings?.theme === "dark" ? "Dark" : "Light"}
          </button>
        </div>

        <div className="mt-5">
          <p className="text-sm font-medium text-foreground mb-2">Accent Color</p>
          <div className="flex items-center gap-2 flex-wrap">
            {ACCENT_COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => handleAccentColor(c.value)}
                className="w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all"
                style={{
                  backgroundColor: c.value,
                  borderColor: settings?.accentColor === c.value ? c.value : "transparent",
                  boxShadow: settings?.accentColor === c.value ? `0 0 0 2px hsl(var(--background)), 0 0 0 4px ${c.value}` : "none",
                }}
                title={c.name}
              >
                {settings?.accentColor === c.value && <Check className="h-3.5 w-3.5 text-white" />}
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
