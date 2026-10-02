import { Suspense } from "react";

import { messagesFor } from "@/shared/i18n/active";
import { isLocale } from "@/shared/i18n/locale";

import { LoginForm } from "./login-form";

export default async function LoginPage({ params }: PageProps<"/[lang]/login">) {
  const { lang } = await params;
  const t = messagesFor(isLocale(lang) ? lang : "en");
  return (
    <Suspense
      fallback={
        <main className="flex min-h-svh items-center justify-center bg-background">
          <span className="text-sm text-muted-foreground">{t.common.loading}</span>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
