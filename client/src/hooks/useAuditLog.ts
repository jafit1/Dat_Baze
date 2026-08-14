/* Minimalist Secure Workspace — the profile surface reads a short, user-owned audit history with explicit loading and retry states. */
import { useCallback, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { listAuditEvents, type AuditEvent } from "@/lib/audit";

export function useAuditLog(user: User | null) {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(Boolean(user));
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setEvents([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setEvents(await listAuditEvents(user));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Riwayat login belum dapat dimuat.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { void refresh(); }, [refresh]);

  return { events, loading, error, refresh };
}
