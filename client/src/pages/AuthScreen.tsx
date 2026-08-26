// Minimalist Secure Workspace - login adalah satu tugas utama; semua alur lain tetap sekunder.
import { useState } from "react";
import { browserLocalPersistence, browserSessionPersistence, createUserWithEmailAndPassword, sendPasswordResetEmail, setPersistence, signInWithEmailAndPassword } from "firebase/auth";
import { toast } from "sonner";
import { LoaderCircle, Lock, ShieldCheck, Unlock, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth } from "@/lib/vault";
import { ALLOWED_LOGIN_EMAIL, ALLOWED_LOGIN_USERNAME, resolveLoginIdentifier } from "@/lib/auth-policy";
import { getAuthErrorMessage, getRememberLogin, REMEMBER_LOGIN_KEY } from "@/lib/vault-helpers";
import { recordAuditEvent } from "@/lib/audit";
import { Logo } from "@/components/vault-ui";

export default function AuthScreen() {
  const [register, setRegister] = useState(false);
  const [username, setUsername] = useState(ALLOWED_LOGIN_USERNAME);
  const [password, setPassword] = useState("");
  const [rememberLogin, setRememberLogin] = useState(getRememberLogin);
  const [authBusy, setAuthBusy] = useState(false);
  const [busyMode, setBusyMode] = useState<"password" | null>(null);
  const validateIdentifier = () => {
    const raw = username.trim();
    if (!raw) { toast.error("Username wajib diisi", { description: "Masukkan username sebelum melanjutkan." }); return null; }
    const resolved = resolveLoginIdentifier(raw);
    if (!resolved) {
      if (raw.includes("@")) toast.error("Akun tidak diizinkan", { description: `Gunakan akun ${ALLOWED_LOGIN_EMAIL} untuk masuk ke Vaultmark.` });
      else toast.error("Username tidak dikenali", { description: `Gunakan username ${ALLOWED_LOGIN_USERNAME} untuk masuk ke Vaultmark.` });
      return null;
    }
    return resolved;
  };
  const applyPersistence = async () => {
    if (!auth) return false;
    await setPersistence(auth, rememberLogin ? browserLocalPersistence : browserSessionPersistence);
    window.localStorage.setItem(REMEMBER_LOGIN_KEY, String(rememberLogin));
    return true;
  };
  const submit = async () => {
    if (authBusy) return;
    const trimmedEmail = validateIdentifier();
    if (!trimmedEmail) return;
    if (!password) { toast.error("Password wajib diisi", { description: "Masukkan password sebelum melanjutkan." }); return; }
    if (password.length < 6) { toast.error("Password terlalu pendek", { description: "Gunakan minimal 6 karakter." }); return; }
    if (!auth) { toast.error("Login dinonaktifkan", { description: "Firebase belum terkonfigurasi. Password tidak boleh melewati validasi server." }); return; }
    setAuthBusy(true); setBusyMode("password");
    try { await applyPersistence(); const credentials = register ? await createUserWithEmailAndPassword(auth, trimmedEmail, password) : await signInWithEmailAndPassword(auth, trimmedEmail, password); try { await recordAuditEvent(credentials.user, "login", "password"); } catch { toast.warning("Login berhasil, riwayat belum tersimpan", { description: "Sesi aktif, tetapi aktivitas login belum dapat dicatat." }); } }
    catch (error) { const feedback = getAuthErrorMessage(error, register ? "register" : "login"); toast.error(feedback.title, { description: feedback.description }); }
    finally { setAuthBusy(false); setBusyMode(null); }
  };
  const resetPassword = async () => {
    if (authBusy) return;
    const trimmedEmail = validateIdentifier();
    if (!trimmedEmail || register) return;
    if (!auth) { toast.error("Firebase belum terkonfigurasi", { description: "Reset password memerlukan koneksi Firebase aktif." }); return; }
    try { await sendPasswordResetEmail(auth, trimmedEmail); toast.success("Tautan reset password dikirim", { description: `Periksa inbox ${trimmedEmail} dan ikuti instruksinya.` }); }
    catch (error) { const feedback = getAuthErrorMessage(error, "reset"); toast.error(feedback.title, { description: feedback.description }); }
  };
  return <main className="auth-shell"><div className="auth-card"><Logo /><div className="mt-12 max-w-sm"><div className="eyebrow">secure by design</div><h1 className="mt-4 font-display text-4xl font-semibold leading-[1.04] tracking-[-.055em] text-slate-900">Satu tempat untuk semua akses penting.</h1><p className="mt-5 text-[15px] leading-7 text-slate-500">Kunci vault dengan Master Password yang hanya Anda miliki. Data rahasia dienkripsi di browser sebelum menuju Firestore.</p></div><div className="mt-8 space-y-3"><Input required disabled={authBusy} type="text" autoComplete="username" placeholder="Username" aria-label="Username" value={username} onChange={e => setUsername(e.target.value)} /><Input required disabled={authBusy} type="password" autoComplete={register ? "new-password" : "current-password"} placeholder={register ? "Password akun" : "Password"} value={password} onChange={e => setPassword(e.target.value)} /><label className={`remember-login ${register ? "muted" : ""}`}><input type="checkbox" disabled={authBusy} checked={rememberLogin} onChange={event => setRememberLogin(event.target.checked)} aria-describedby="remember-login-help" /><span><strong>Ingat Saya</strong><small id="remember-login-help">{rememberLogin ? "Sesi Firebase disimpan di browser ini." : "Sesi berakhir saat browser ditutup."} Password mentah tidak pernah disimpan.</small></span></label><Button disabled={authBusy} aria-busy={busyMode === "password"} className="auth-submit h-12 w-full bg-[#1FACFF] font-semibold text-white hover:bg-[#0D8DDB]" onClick={submit}>{busyMode === "password" ? <LoaderCircle className="auth-loading-icon mr-2 size-4" /> : register ? <UserPlus className="mr-2 size-4" /> : <Unlock className="mr-2 size-4" />}{busyMode === "password" ? "Memproses..." : register ? "Buat akun" : "Masuk ke vault"}</Button>{!register && <button type="button" disabled={authBusy} className="auth-forgot-link" onClick={resetPassword} aria-label="Kirim tautan reset password">Lupa Password?</button>}<button type="button" disabled={authBusy} className="w-full py-2 text-sm font-semibold text-[#0D80C9]" onClick={() => setRegister(!register)}>{register ? "Sudah punya akun? Masuk" : "Buat akun baru"}</button></div><div className="mt-12 flex items-center gap-2 text-xs text-slate-400"><ShieldCheck className="size-4 text-[#1FACFF]" /> AES-GCM 256-bit Â· zero-knowledge master key</div></div><div className="auth-aside"><div className="security-rail" /><img src="/assets/vault-pattern.svg" className="absolute inset-0 size-full object-cover opacity-70" alt="" /><div className="relative max-w-md"><div className="status-capsule"><span className="status-dot" /> Client-side encryption active <span className="ml-auto font-mono text-[10px] text-[#0D80C9]">AES-GCM</span></div><div className="mb-6 mt-9 flex size-14 items-center justify-center rounded-2xl bg-white shadow-[0_14px_40px_rgba(31,172,255,.18)]"><Lock className="size-6 text-[#1FACFF]" /></div><p className="font-display text-3xl font-semibold leading-tight tracking-[-.05em] text-slate-800">â€œKeamanan yang baik terasa seperti ruang bernapas.â€</p><div className="mt-7 flex gap-3 text-sm text-slate-500"><div className="mt-2 h-px w-8 shrink-0 bg-[#1FACFF]" /><span>Vaultmark menjaga akses Anda tetap sederhana, cepat, dan di bawah kendali sendiri.</span></div><div className="mt-10 flex items-center gap-2 text-xs font-semibold text-slate-500"><ShieldCheck className="size-4 text-[#1FACFF]" />Master key never leaves this browser</div></div></div></main>;
}