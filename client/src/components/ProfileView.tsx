// Minimalist Secure Workspace: the profile record is a viewport-contained modal with a single, calm scroll surface.
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, Clock3, KeyRound, LogIn, LogOut, Mail, MonitorSmartphone, RefreshCw, Settings2, ShieldCheck, X } from "lucide-react";
import type { User } from "firebase/auth";
import type { AuditEvent } from "@/lib/audit";

type ProfileViewProps = {
  user: User;
  displayName: string;
  photoURL: string;
  events: AuditEvent[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onSettings: () => void;
  onClose: () => void;
};

function formatDate(value: number | string | null | undefined) {
  if (!value) return "Belum tersedia";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Belum tersedia";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function providerLabel(user: User) {
  return user.providerData.some(provider => provider.providerId === "google.com") ? "Google Sign-In" : "Email & password";
}

export default function ProfileView({ user, displayName, photoURL, events, loading, error, onRefresh, onSettings, onClose }: ProfileViewProps) {
  const label = displayName.trim() || user.email || "Vaultmark user";
  const initial = label.charAt(0).toUpperCase() || "U";
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    dialogRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return createPortal(
    <div className="profile-overlay" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section ref={dialogRef} className="profile-page" role="dialog" aria-modal="true" aria-labelledby="profile-page-title" tabIndex={-1}>
        <div className="profile-page-header">
          <div>
            <div className="eyebrow flex items-center gap-2"><ShieldCheck className="size-3 text-[#b6d9fc]" />account record</div>
            <h1 id="profile-page-title" className="mt-2 font-display text-2xl font-semibold tracking-[-.05em]">Profil pengguna</h1>
            <p className="mt-2 text-sm text-[#c7d3ea]">Identitas akun dan jejak sesi Firebase Anda.</p>
          </div>
          <button type="button" className="icon-button action-tooltip" data-tooltip="Tutup profil" aria-label="Tutup profil pengguna" onClick={onClose}><X className="size-4" /></button>
        </div>
        <div className="profile-page-body">
          <div className="profile-record-grid">
            <article className="profile-identity-card">
              <div className="profile-large-avatar">{photoURL ? <img src={photoURL} alt="" referrerPolicy="no-referrer" onError={event => { event.currentTarget.style.display = "none"; }} /> : initial}</div>
              <div className="profile-identity-copy"><strong>{label}</strong><span>{user.email}</span><small><span className="status-dot" /> Sesi Firebase aktif</small></div>
              <button type="button" className="profile-edit-button" onClick={onSettings}><Settings2 className="size-4" />Edit Settings</button>
            </article>
            <article className="profile-facts-card">
              <div className="profile-fact"><Mail className="size-4" /><span><small>Email akun</small><strong>{user.email ?? "Tidak tersedia"}</strong></span></div>
              <div className="profile-fact"><KeyRound className="size-4" /><span><small>Metode autentikasi</small><strong>{providerLabel(user)}</strong></span></div>
              <div className="profile-fact"><CalendarDays className="size-4" /><span><small>Akun dibuat</small><strong>{formatDate(user.metadata.creationTime)}</strong></span></div>
              <div className="profile-fact"><Clock3 className="size-4" /><span><small>Login Firebase terakhir</small><strong>{formatDate(user.metadata.lastSignInTime)}</strong></span></div>
            </article>
          </div>
          <section className="audit-card" aria-labelledby="audit-title">
            <div className="audit-card-header"><div><h2 id="audit-title" className="font-display text-lg font-semibold tracking-[-.03em]">Riwayat login</h2><p className="mt-1 text-xs text-[#c7d3ea]">Maksimal 30 aktivitas terbaru. Password dan data vault tidak pernah dicatat.</p></div><button type="button" className="icon-button action-tooltip" data-tooltip="Muat ulang riwayat" aria-label="Muat ulang riwayat login" onClick={() => void onRefresh()} disabled={loading}><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} /></button></div>
            {loading ? <div className="audit-loading" aria-live="polite"><span className="audit-loading-dot" /><span>Memuat riwayat login...</span></div> : error ? <div className="audit-error" role="alert">{error}<button type="button" onClick={() => void onRefresh()}>Coba lagi</button></div> : events.length ? <ul className="audit-list">{events.map(event => <li className="audit-event" key={event.id}><span className={`audit-event-icon ${event.type}`}>{event.type === "login" ? <LogIn className="size-4" /> : <LogOut className="size-4" />}</span><span className="audit-event-copy"><strong>{event.type === "login" ? "Login berhasil" : "Logout"}</strong><small>{formatDate(event.createdAt)} · {event.method === "google" ? "Google Sign-In" : "Email & password"}</small><em><MonitorSmartphone className="size-3" /> Browser ini</em></span></li>)}</ul> : <div className="audit-empty">Belum ada riwayat login yang tercatat pada akun ini.</div>}
          </section>
        </div>
      </section>
    </div>,
    document.body,
  );
}
