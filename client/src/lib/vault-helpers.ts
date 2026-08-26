// Minimalist Secure Workspace - helper vault murni: preferensi lokal, pesan error, dan parser impor.
import { decryptAccount, type EncryptedRecord, type VaultAccount } from "./vault";

export const TOAST_DURATION_KEY = "vaultmark-toast-duration";
export const REMEMBER_LOGIN_KEY = "vaultmark-remember-login";
export const DEFAULT_TOAST_DURATION = 3600;
export const TAG_COLORS = ["#1FACFF", "#7C5CFC", "#22B573", "#F59E0B", "#EF6A6A", "#E45BB8", "#64748B"];
export const TAG_COLORS_KEY = "vaultmark-tag-colors";
const VERIFIER_DOCUMENT_ID = "verifier";
const VERIFIER_RECORD: VaultAccount = { id: VERIFIER_DOCUMENT_ID, service: "vaultmark-verifier", email: "verifier@vaultmark.local", password: "", tags: ["internal"], updatedAt: 0 };
export function getTagColors(): Record<string, string> { if (typeof window === "undefined") return {}; try { return JSON.parse(window.localStorage.getItem(TAG_COLORS_KEY) || "{}"); } catch { return {}; } }
export function getTagColor(tag: string, colors: Record<string, string>) { return colors[tag] || TAG_COLORS[Math.abs(tag.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)) % TAG_COLORS.length]; }
export function getToastDuration() { if (typeof window === "undefined") return DEFAULT_TOAST_DURATION; const stored = Number(window.localStorage.getItem(TOAST_DURATION_KEY)); return [2400, 3600, 5200, 8000].includes(stored) ? stored : DEFAULT_TOAST_DURATION; }
export function getRememberLogin() { if (typeof window === "undefined") return true; return window.localStorage.getItem(REMEMBER_LOGIN_KEY) !== "false"; }
export function getAuthErrorMessage(error: unknown, action: "login" | "register" | "reset") {
  const code = typeof error === "object" && error !== null && "code" in error ? String((error as { code?: unknown }).code) : "";
  if (code === "auth/configuration-not-found" || code === "auth/operation-not-allowed") return { title: "Firebase Authentication belum aktif", description: "Aktifkan provider Email/password di Firebase Console â†’ Authentication â†’ Sign-in method, lalu tambahkan domain live pada Authentication â†’ Settings â†’ Authorized domains." };
  if (code === "auth/invalid-api-key" || code === "auth/project-not-found" || code === "auth/app-not-authorized") return { title: "Konfigurasi Firebase tidak cocok", description: "Periksa VITE_FIREBASE_API_KEY, project ID, dan konfigurasi Web App pada deployment." };
  if (code === "auth/user-not-found") return { title: "Akun belum terdaftar", description: action === "reset" ? "Email ini belum terdaftar di Firebase Authentication." : "Gunakan Buat akun baru terlebih dahulu, atau periksa kembali alamat email Anda." };
  if (code === "auth/email-already-in-use") return { title: "Akun sudah terdaftar", description: "Gunakan Masuk ke vault atau pilih Lupa Password untuk membuat password baru." };
  if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/invalid-login-credentials") return { title: action === "reset" ? "Email belum dapat diproses" : "Login gagal", description: action === "reset" ? "Pastikan email allowlist sudah terdaftar di Firebase Authentication." : "Email atau password tidak cocok. Jika akun belum pernah dibuat, gunakan Buat akun baru." };
  if (code === "auth/user-disabled") return { title: "Akun dinonaktifkan", description: "Akun ini tidak dapat digunakan. Hubungi administrator Firebase untuk pemeriksaan lebih lanjut." };
  if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return { title: "Login Google dibatalkan", description: "Jendela Google ditutup sebelum autentikasi selesai." };
  if (code === "auth/popup-blocked") return { title: "Popup Google diblokir", description: "Izinkan popup untuk Vaultmark, lalu coba Login Google lagi." };
  if (code === "auth/unauthorized-domain") return { title: "Domain belum diizinkan", description: "Tambahkan domain live Vaultmark pada Firebase Console â†’ Authentication â†’ Settings â†’ Authorized domains." };
  if (code === "auth/too-many-requests") return { title: "Percobaan terlalu banyak", description: "Tunggu beberapa saat sebelum mencoba autentikasi lagi." };
  return { title: action === "reset" ? "Reset password belum berhasil" : action === "register" ? "Pendaftaran belum berhasil" : "Autentikasi belum berhasil", description: error instanceof Error ? error.message : "Periksa koneksi dan konfigurasi Firebase, lalu coba lagi." };
}
export function csvCell(value: unknown) { return '"' + String(value ?? "").replaceAll('"', '""') + '"'; }
export function downloadText(filename: string, content: string, type = "text/plain;charset=utf-8") { const blob = new Blob([content], { type }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; anchor.click(); URL.revokeObjectURL(url); }
export type ImportSummary = { accounts: VaultAccount[]; skipped: number };
export function isPlainRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
export function importTimestamp(value: unknown, fallback: number) { if (typeof value === "number" && Number.isFinite(value)) return value; if (typeof value === "string") { const parsed = Date.parse(value); if (!Number.isNaN(parsed)) return parsed; } return fallback; }
export function isImportEmail(value: unknown): value is string { return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()); }
export async function readImportBackup(file: File, masterPassword: string): Promise<ImportSummary> {
  if (file.size > 10_000_000) throw new Error("Ukuran berkas melebihi batas 10 MB.");
  const payload: unknown = JSON.parse(await file.text());
  if (!isPlainRecord(payload) || !Array.isArray(payload.accounts)) throw new Error("Struktur JSON tidak didukung. Gunakan berkas yang memiliki daftar accounts.");
  const rows = payload.accounts.filter(isPlainRecord);
  if (!rows.length) throw new Error("Tidak ada entri akun yang dapat diimpor.");
  if (payload.format === "vaultmark-json") {
    const decrypted = await Promise.all(rows.map(async row => { try { return await decryptAccount(row as EncryptedRecord, masterPassword); } catch { return null; } }));
    const accounts = decrypted.filter((account): account is VaultAccount => account !== null);
    if (!accounts.length) throw new Error("Cadangan Vaultmark tidak dapat dibuka dengan Master Password yang aktif.");
    return { accounts, skipped: rows.length - accounts.length };
  }
  const now = Date.now(); const accounts: VaultAccount[] = []; let skipped = payload.accounts.length - rows.length;
  rows.forEach(row => {
    if (!isImportEmail(row.email)) { skipped += 1; return; }
    const email = row.email.trim(); const password = typeof row.password === "string" ? row.password : "";
    const tagValues = [...(Array.isArray(row.tags) ? row.tags : []), ...(Array.isArray(row.labels) ? row.labels : [])].filter((tag): tag is string => typeof tag === "string" && Boolean(tag.trim())).map(tag => tag.trim());
    const tags = Array.from(new Set(["Imported", ...tagValues, ...(password ? [] : ["Password belum tersedia"])]));
    accounts.push({ id: typeof row.id === "string" && row.id.trim() ? row.id : crypto.randomUUID(), service: email.slice(email.indexOf("@") + 1), email, password, tags, createdAt: importTimestamp(row.createdAt, now), updatedAt: importTimestamp(row.updatedAt, now) });
  });
  if (!accounts.length) throw new Error("Tidak ditemukan alamat email yang valid pada berkas impor.");
  return { accounts, skipped };
}