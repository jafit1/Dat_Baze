/* Minimalist Secure Workspace — audit records are concise, user-scoped, and never contain passwords or vault ciphertext. */
import { addDoc, collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "@/lib/vault";

export type AuditEventType = "login" | "logout";
export type AuditMethod = "password" | "google" | "unknown";

export type AuditEvent = {
  id: string;
  type: AuditEventType;
  method: AuditMethod;
  email: string;
  createdAt: number;
  userAgent: string;
};

export async function recordAuditEvent(user: User, type: AuditEventType, method: AuditMethod = "unknown") {
  if (!db) return false;
  await addDoc(collection(db, `users/${user.uid}/activity`), {
    uid: user.uid,
    email: user.email ?? "",
    type,
    method,
    createdAt: Date.now(),
    userAgent: typeof navigator === "undefined" ? "" : navigator.userAgent.slice(0, 180),
  });
  return true;
}

export async function listAuditEvents(user: User, maxItems = 30): Promise<AuditEvent[]> {
  if (!db) return [];
  const snapshot = await getDocs(query(collection(db, `users/${user.uid}/activity`), orderBy("createdAt", "desc"), limit(maxItems)));
  return snapshot.docs.flatMap(item => {
    const data = item.data() as Record<string, unknown>;
    if (data.type !== "login" && data.type !== "logout") return [];
    return [{
      id: item.id,
      type: data.type as AuditEventType,
      method: data.method === "google" || data.method === "password" ? data.method : "unknown",
      email: typeof data.email === "string" ? data.email : user.email ?? "",
      createdAt: typeof data.createdAt === "number" ? data.createdAt : 0,
      userAgent: typeof data.userAgent === "string" ? data.userAgent : "",
    }];
  });
}
