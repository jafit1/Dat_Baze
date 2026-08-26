// Vaultmark × AuthKit — login adalah satu tugas utama; panel kanan hanyalah bukti, bukan dekorasi.
import { useState } from "react";
import { browserLocalPersistence, browserSessionPersistence, createUserWithEmailAndPassword, sendPasswordResetEmail, setPersistence, signInWithEmailAndPassword } from "firebase/auth";
import { toast } from "sonner";
import { Fingerprint, Eye, EyeOff, KeyRound, LoaderCircle, ShieldCheck, Unlock, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth } from "@/lib/vault";
import { ALLOWED_LOGIN_EMAIL, ALLOWED_LOGIN_USERNAME, resolveLoginIdentifier } from "@/lib/auth-policy";
import { getAuthErrorMessage, getRememberLogin, REMEMBER_LOGIN_KEY } from "@/lib/vault-helpers";
import { recordAuditEvent } from "@/lib/audit";

export default function AuthScreen() {
  const [register, setRegister] = useState(false);
  const [username, setUsername] = useState(ALLOWED_LOGIN_USERNAME);
  const [password, setPassword] = useState("");
  const [rememberLogin, setRememberLogin] = useState(getRememberLogin);
  const [authBusy, setAuthBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    setAuthBusy(true);
    try {
      await applyPersistence();
      const credentials = register ? await createUserWithEmailAndPassword(auth, trimmedEmail, password) : await signInWithEmailAndPassword(auth, trimmedEmail, password);
      try { await recordAuditEvent(credentials.user, "login", "password"); }
      catch { toast.warning("Login berhasil, riwayat belum tersimpan", { description: "Sesi aktif, tetapi aktivitas login belum dapat dicatat." }); }
    } catch (error) {
      const feedback = getAuthErrorMessage(error, register ? "register" : "login");
      toast.error(feedback.title, { description: feedback.description });
    } finally {
      setAuthBusy(false);
    }
  };

  const resetPassword = async () => {
    if (authBusy || register) return;
    const trimmedEmail = validateIdentifier();
    if (!trimmedEmail) return;
    if (!auth) { toast.error("Firebase belum terkonfigurasi", { description: "Reset password memerlukan koneksi Firebase aktif." }); return; }
    try { await sendPasswordResetEmail(auth, trimmedEmail); toast.success("Tautan reset password dikirim", { description: `Periksa inbox ${trimmedEmail} dan ikuti instruksinya.` }); }
    catch (error) { const feedback = getAuthErrorMessage(error, "reset"); toast.error(feedback.title, { description: feedback.description }); }
  };

  const evidence = [
    { icon: ShieldCheck, title: "Enkripsi lokal aktif", desc: "AES-GCM 256-bit bekerja sepenuhnya di browser Anda." },
    { icon: Fingerprint, title: "Master Password milik Anda", desc: "Tidak pernah dikirim, disimpan, atau diketahui server." },
    { icon: KeyRound, title: "Firestore hanya menyimpan cipher", desc: "Yang tersimpan adalah ciphertext, bukan rahasianya." },
  ];

  return (
    <main className="auth-shell">
      {/* ---- Kolom tugas: form login ---- */}
      <div className="auth-card">
        <div className="brand-lockup flex items-center gap-3">
          <img src="/assets/vaultmark-logo.svg" className="brand-mark size-10 rounded-xl" alt="Vaultmark" />
          <div>
            <div className="brand-wordmark font-display text-[16px]">vaultmark</div>
            <div className="brand-subline">private workspace</div>
          </div>
        </div>

        <div className="mt-14 max-w-md">
          <p className="eyebrow eyebrow-lines">secure by design</p>
          <h1 className="headline-gradient mt-4 font-display font-medium leading-[1.12]">
            Satu tempat untuk semua akses penting.
          </h1>
          <p className="mt-5 max-w-sm text-[15px] leading-7 text-[#c7d3ea]">
            Kunci vault dengan Master Password yang hanya Anda miliki. Data rahasia dienkripsi di browser sebelum menuju Firestore.
          </p>
        </div>

        <form
          className="mt-9 flex max-w-md flex-col gap-4"
          onSubmit={event => { event.preventDefault(); void submit(); }}
        >
          <label className="grid gap-2">
            <span className="sr-only">Username</span>
            <Input
              required
              disabled={authBusy}
              type="text"
              autoComplete="username"
              placeholder="Username"
              aria-label="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </label>

          <div className="pw-field">
            <Input
              required
              disabled={authBusy}
              type={showPassword ? "text" : "password"}
              autoComplete={register ? "new-password" : "current-password"}
              placeholder={register ? "Password akun" : "Password"}
              aria-label={register ? "Password akun" : "Password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="pw-toggle"
              onClick={() => setShowPassword(current => !current)}
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              aria-pressed={showPassword}
              tabIndex={0}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>

          <label className={`remember-login ${register ? "muted" : ""}`}>
            <input
              type="checkbox"
              disabled={authBusy}
              checked={rememberLogin}
              onChange={event => setRememberLogin(event.target.checked)}
              aria-describedby="remember-login-help"
            />
            <span>
              <strong>Ingat saya di browser ini</strong>
              <small id="remember-login-help">
                {rememberLogin
                  ? "Sesi disimpan oleh Firebase di perangkat ini."
                  : "Sesi berakhir saat browser ditutup."}{" "}
                Password mentah tidak pernah disimpan.
              </small>
            </span>
          </label>

          <Button type="submit" disabled={authBusy} aria-busy={authBusy} className="auth-submit w-full bg-[#663af3] text-white hover:bg-[#7c53ff]">
            {authBusy ? <LoaderCircle className="auth-loading-icon mr-2 size-4" /> : register ? <UserPlus className="mr-2 size-4" /> : <Unlock className="mr-2 size-4" />}
            {authBusy ? "Memproses..." : register ? "Buat akun" : "Masuk ke vault"}
          </Button>

          {!register && (
            <>
              <button type="button" disabled={authBusy} className="auth-forgot-link" onClick={() => void resetPassword()} aria-label="Kirim tautan reset password">
                Lupa Password?
              </button>
              <button type="button" disabled={authBusy} className="auth-forgot-link" onClick={() => setRegister(!register)}>
                Sudah punya akun? Masuk dulu
              </button>
            </>
          )}
          {register && (
            <button type="button" disabled={authBusy} className="auth-forgot-link" onClick={() => setRegister(!register)}>
              Sudah punya akun? Masuk
            </button>
          )}
        </form>

        <p className="mt-auto flex items-center gap-2 pt-10 text-xs text-[#9da7ba]">
          <ShieldCheck className="size-4 text-[#b6d9fc]" />
          AES-GCM 256-bit · zero-knowledge master key
        </p>
      </div>

      {/* ---- Panel bukti: gelap kaca, bukan dekorasi putih ---- */}
      <aside className="auth-aside" aria-hidden="true">
        <div className="security-rail" />
        <div className="status-capsule">
          <span className="status-dot" />
          Client-side encryption active
          <span className="ml-auto font-mono text-[10px] text-[#b6d9fc]">AES-GCM</span>
        </div>

        <p className="auth-quote font-display">
          &ldquo;Keamanan yang baik terasa seperti ruang bernapas.&rdquo;
        </p>

        <ul className="auth-evidence">
          {evidence.map(item => (
            <li key={item.title} className="auth-evidence-row">
              <span className="auth-evidence-icon"><item.icon className="size-5" strokeWidth={1.5} /></span>
              <span>
                <strong>{item.title}</strong>
                <small>{item.desc}</small>
              </span>
            </li>
          ))}
        </ul>

        <p className="auth-aside-foot">
          Master key never leaves this browser
        </p>
      </aside>
    </main>
  );
}
