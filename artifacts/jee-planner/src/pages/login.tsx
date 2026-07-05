import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { KeyRound } from "lucide-react";
import logo from "@/assets/logo.png";

export default function Login() {
  const { login, setup, hasUser } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSetup = !hasUser;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (isSetup) {
      if (password.length < 4) { setError("Password must be at least 4 characters"); return; }
      if (password !== confirm) { setError("Passwords don't match"); return; }
    }

    setLoading(true);
    const err = isSetup
      ? await setup(username.trim(), password)
      : await login(username.trim(), password);
    setLoading(false);

    if (err) setError(err);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center mx-auto">
            <img src={logo} alt="JEE Planner" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">JEE Planner</h1>
          <p className="text-sm text-muted-foreground">
            {isSetup ? "Create your account to get started" : "Sign in to continue"}
          </p>
        </div>

        <Card className="bg-card border-border p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your username"
                autoComplete="username"
                required
                className="bg-background border-input"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={isSetup ? "new-password" : "current-password"}
                required
                className="bg-background border-input"
              />
            </div>

            {isSetup && (
              <div className="space-y-1.5">
                <Label htmlFor="confirm">Confirm Password</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  className="bg-background border-input"
                />
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              <KeyRound className="h-4 w-4 mr-2" />
              {loading ? "Please wait…" : isSetup ? "Create Account" : "Sign In"}
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          {isSetup
            ? "Your data is stored privately on this server"
            : "Use the same credentials on any device"}
        </p>
      </div>
    </div>
  );
}
