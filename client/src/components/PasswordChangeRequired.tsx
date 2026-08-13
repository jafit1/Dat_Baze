// Design philosophy: Minimalist Secure Workspace — password changes are direct, quiet, and security-first.
import { useState } from "react";
import { KeyRound, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PasswordChangeRequiredProps = {
  email: string;
  onSubmit: (password: string) => Promise<void>;
  onLogout: () => void;
};

export default function PasswordChangeRequired({ email, onSubmit, onLogout }: PasswordChangeRequiredProps) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password.length < 8) {
      setError("Password baru harus memiliki minimal 8 karakter.");
      return;
    }
    if (password !== confirmation) {
      setError("Konfirmasi password belum sama.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await onSubmit(password);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Password belum dapat diperbarui.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="lock-shell">
      <div className="lock-card password-change-card">
        <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-[#EAF7FF]">
          <KeyRound className="size-7 text-[#1FACFF]" />
        </div>
        <div className="eyebrow mt-7">password update required</div>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-[-.05em]">Amankan akun Anda.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">Password awal untuk {email} harus diganti sebelum Anda dapat membuka vault.</p>
        <form className="mt-7 space-y-3" onSubmit={submit}>
          <Input autoFocus type="password" autoComplete="new-password" placeholder="Password baru" value={password} onChange={event => setPassword(event.target.value)} aria-label="Password baru" />
          <Input type="password" autoComplete="new-password" placeholder="Konfirmasi password baru" value={confirmation} onChange={event => setConfirmation(event.target.value)} aria-label="Konfirmasi password baru" />
          {error && <p className="text-sm font-medium text-rose-600" role="alert">{error}</p>}
          <Button type="submit" disabled={saving} className="h-12 w-full bg-[#1FACFF] text-white hover:bg-[#0D8DDB]">
            <ShieldCheck className="mr-2 size-4" />
            {saving ? "Menyimpan..." : "Ganti password"}
          </Button>
        </form>
        <button type="button" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900" onClick={onLogout}>
          <LogOut className="size-4" /> Logout
        </button>
      </div>
    </main>
  );
}

