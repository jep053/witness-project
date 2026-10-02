"use client";

import { useEffect, useRef } from "react";
import { markAllNotificationsRead } from "@/app/actions/notifications";

/** Renders nothing — fires once on mount to mark the inbox read. */
export function MarkNotificationsRead() {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    markAllNotificationsRead("/notifications");
  }, []);

  return null;
}