import type { Metadata } from "next";

import { messagesFor } from "@/shared/i18n/active";
import { isLocale } from "@/shared/i18n/locale";

import { RegisterForm } from "./register-form";

export async function generateMetadata({ params }: PageProps<"/[lang]/register">): Promise<Metadata> {
  const { lang } = await params;
  const t = messagesFor(isLocale(lang) ? lang : "en");
  return { title: t.auth.register.pageTitle };
}

export default function RegisterPage() {
  return <RegisterForm />;
}
