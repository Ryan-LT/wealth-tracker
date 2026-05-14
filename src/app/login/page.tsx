import { Suspense } from "react";

import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background">
          <span className="font-body-md text-on-background-variant">Loading…</span>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
