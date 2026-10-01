"use client";

import { useEffect } from "react";

import { checkForServiceWorkerUpdate } from "@/shared/lib/service-worker";

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    void checkForServiceWorkerUpdate();
  }, []);

  return null;
}
