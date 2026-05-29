import { toast } from "sonner";

const SAVE_TOAST_ID = "wealthtracker-save";

export function notifySaveStarted(): void {
  toast.loading("Saving…", { id: SAVE_TOAST_ID });
}

export function notifySaveSucceeded(): void {
  toast.success("Saved", { id: SAVE_TOAST_ID });
}

export function notifySaveFailed(message?: string): void {
  toast.error(message ?? "Save failed", { id: SAVE_TOAST_ID });
}
