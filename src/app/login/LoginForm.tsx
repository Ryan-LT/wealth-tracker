"use client";

import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

import { Button } from "@/shared/ui";
import { WealthTrackerLogo } from "@/shared/ui";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setBusy(true);
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as { error?: string } | null;
          setError(data?.error ?? `Sign-in failed (${res.status})`);
          return;
        }
        const dest = searchParams.get("from");
        router.replace(dest && dest.startsWith("/") && !dest.startsWith("//") && dest !== "/login" ? dest : "/");
        router.refresh();
      } finally {
        setBusy(false);
      }
    },
    [username, password, router, searchParams],
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 py-12 bg-background">
      <div className="flex flex-col items-center gap-2 text-center">
        <WealthTrackerLogo size={48} decorative />
        <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
          WealthTracker
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sign in to continue
        </Typography>
      </div>

      <form
        onSubmit={(e) => void onSubmit(e)}
        className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-6 shadow-sm"
      >
        {error ? (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        ) : null}
        <TextField
          label="Username"
          name="username"
          autoComplete="username"
          value={username}
          onChange={(ev) => setUsername(ev.target.value)}
          fullWidth
          required
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          fullWidth
          required
        />
        <Button type="submit" block disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </main>
  );
}
