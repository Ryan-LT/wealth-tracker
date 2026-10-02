"use client";

import { KeyRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { validateNewPassword } from "@/shared/lib/password-policy";
import { Alert, AlertDescription } from "@/shared/ui/kit/alert";
import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import { Label } from "@/shared/ui/kit/label";

const EMPTY = { current: "", next: "", confirm: "" };

/** Current + new password. Other devices are signed out on success; this one stays signed in. */
export function ChangePasswordForm() {
  const [values, setValues] = useState(EMPTY);
  const [touched, setTouched] = useState({ next: false, confirm: false });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const policyError = values.next ? validateNewPassword(values.next, { current: values.current || undefined }) : null;
  const mismatch = values.confirm.length > 0 && values.confirm !== values.next;
  const valid = values.current.length > 0 && values.next.length > 0 && !policyError && values.confirm === values.next;

  const set = (field: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [field]: e.target.value }));

  return (
    <form
      className="grid gap-4 sm:max-w-sm"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!valid || busy) return;
        setBusy(true);
        setError(null);
        try {
          const res = await fetch("/api/auth/password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ currentPassword: values.current, newPassword: values.next }),
          });
          if (!res.ok) {
            const data = (await res.json().catch(() => null)) as { error?: string } | null;
            setError(data?.error ?? `Couldn't change the password (${res.status})`);
            return;
          }
          setValues(EMPTY);
          setTouched({ next: false, confirm: false });
          toast.success("Password changed", { description: "Other devices were signed out." });
        } catch {
          setError("Couldn't reach the server. Check your connection and try again.");
        } finally {
          setBusy(false);
        }
      }}
    >
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <div className="grid gap-1.5">
        <Label htmlFor="current-password">Current password</Label>
        <Input
          id="current-password"
          type="password"
          autoComplete="current-password"
          value={values.current}
          onChange={set("current")}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="new-password">New password</Label>
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          value={values.next}
          onChange={set("next")}
          onBlur={() => setTouched((t) => ({ ...t, next: true }))}
          aria-invalid={touched.next && !!policyError}
          aria-describedby="new-password-hint"
        />
        <p id="new-password-hint" className={touched.next && policyError ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
          {touched.next && policyError ? policyError : "At least 10 characters."}
        </p>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="confirm-password">Confirm new password</Label>
        <Input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          value={values.confirm}
          onChange={set("confirm")}
          onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
          aria-invalid={touched.confirm && mismatch}
        />
        {touched.confirm && mismatch ? <p className="text-xs text-destructive">{"Passwords don't match."}</p> : null}
      </div>
      <div>
        <Button type="submit" disabled={!valid || busy}>
          <KeyRound />
          {busy ? "Changing…" : "Change password"}
        </Button>
      </div>
    </form>
  );
}
