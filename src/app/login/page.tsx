import { Suspense } from "react";

import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-svh items-center justify-center bg-background">
          <span className="text-sm text-muted-foreground">Loading…</span>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
