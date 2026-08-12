// Design philosophy: Minimalist Secure Workspace — security logic stays explicit, quiet, and client-first.
import { initializeApp, getApps } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import * as OTPAuth from "otpauth";

export type VaultAccount = { id: string; service: string; email: string; password: string; twoFA?: string; tags: string[]; createdAt?: number; updatedAt: number; favorite?: boolean };
export type EncryptedRecord = { version: 1; iv: string; salt: string; ciphertext: string; updatedAt: number };
const encoder = new TextEncoder(); const decoder = new TextDecoder();
const bytesToB64 = (bytes: Uint8Array) => btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(""));
const b64ToBytes = (value: string) => Uint8Array.from(atob(value), c => c.charCodeAt(0));
export async function deriveVaultKey(masterPassword: string, saltBytes?: Uint8Array) { const salt = saltBytes ?? crypto.getRandomValues(new Uint8Array(16)); const material = await crypto.subtle.importKey("raw", encoder.encode(masterPassword), "PBKDF2", false, ["deriveKey"]); const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: 210_000, hash: "SHA-256" }, material, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]); return { key, salt }; }
export async function encryptAccount(account: VaultAccount, masterPassword: string): Promise<EncryptedRecord> { const { key, salt } = await deriveVaultKey(masterPassword); const iv = crypto.getRandomValues(new Uint8Array(12)); const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(JSON.stringify(account))); return { version: 1, iv: bytesToB64(iv), salt: bytesToB64(salt), ciphertext: bytesToB64(new Uint8Array(ciphertext)), updatedAt: Date.now() }; }
export async function decryptAccount(record: EncryptedRecord, masterPassword: string): Promise<VaultAccount> { const { key } = await deriveVaultKey(masterPassword, b64ToBytes(record.salt)); const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64ToBytes(record.iv) }, key, b64ToBytes(record.ciphertext)); return JSON.parse(decoder.decode(plain)) as VaultAccount; }
export function getTotpCode(secret?: string) { if (!secret) return null; try { return new OTPAuth.TOTP({ secret: OTPAuth.Secret.fromBase32(secret.replace(/\s+/g, "").toUpperCase()) }).generate(); } catch { return null; } }
const firebaseConfig = { apiKey: import.meta.env.VITE_FIREBASE_API_KEY, authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID, storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, appId: import.meta.env.VITE_FIREBASE_APP_ID };
export const firebaseConfigured = Object.values(firebaseConfig).every(Boolean); let app: ReturnType<typeof initializeApp> | undefined; let auth: Auth | undefined; let db: Firestore | undefined;
if (firebaseConfigured) { app = getApps()[0] ?? initializeApp(firebaseConfig); auth = getAuth(app); db = getFirestore(app); }
export { auth, db };
export function generatePassword(length: number, options: { upper: boolean; lower: boolean; numbers: boolean; symbols: boolean }) { const sets = [options.upper ? "ABCDEFGHJKLMNPQRSTUVWXYZ" : "", options.lower ? "abcdefghijkmnopqrstuvwxyz" : "", options.numbers ? "23456789" : "", options.symbols ? "!@#$%^&*_-+=?" : ""].filter(Boolean); const alphabet = sets.join("") || "abcdefghijkmnopqrstuvwxyz23456789"; const values = crypto.getRandomValues(new Uint32Array(length)); return Array.from(values, v => alphabet[v % alphabet.length]).join(""); }
export function downloadJson(filename: string, data: unknown) { const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; anchor.click(); URL.revokeObjectURL(url); }
export function formatRelativeTime(timestamp: number) { const minutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000)); if (minutes < 1) return "baru saja"; if (minutes < 60) return `${minutes} mnt lalu`; const hours = Math.round(minutes / 60); if (hours < 24) return `${hours} jam lalu`; return `${Math.round(hours / 24)} hari lalu`; }
