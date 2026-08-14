// Minimalist Secure Workspace — settings use compact cards, clear hierarchy, and quiet controls.
import { useRef } from "react";
import { ArrowDownToLine, ArrowUpFromLine, FileKey2, Lock, Moon, ShieldCheck, Sparkles, Sun, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ProfileEditor from "@/components/ProfileEditor";
import type { VaultAccount } from "@/lib/vault";

const TOAST_DURATION_KEY = "vaultmark-toast-duration";
const TAG_COLORS = ["#1FACFF", "#7C5CFC", "#22B573", "#F59E0B", "#EF6A6A", "#E45BB8", "#64748B"];
const TAG_COLORS_KEY = "vaultmark-tag-colors";

function getTagColor(tag: string, colors: Record<string, string>) {
  return colors[tag] || TAG_COLORS[Math.abs(tag.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)) % TAG_COLORS.length];
}

export type SettingsViewProps = {
  accounts: VaultAccount[];
  displayName?: string;
  photoURL?: string;
  lockMinutes: number;
  setLockMinutes: (minutes: number) => void;
  toastDuration: number;
  setToastDuration: (duration: number) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  tagColors: Record<string, string>;
  setTagColors: (colors: Record<string, string>) => void;
  onRenameTag: (from: string, to: string) => void;
  onDeleteTag: (tag: string) => void;
  onImport: (file: File) => void;
  onExport: (format: "json" | "csv") => void;
  onProfileUpdate: (displayName: string, photoURL: string) => Promise<void>;
};

export default function SettingsView({ accounts, displayName, photoURL, lockMinutes, setLockMinutes, toastDuration, setToastDuration, theme, onToggleTheme, tagColors, setTagColors, onRenameTag, onDeleteTag, onImport, onExport, onProfileUpdate }: SettingsViewProps) {
  const input = useRef<HTMLInputElement>(null);
  const tags = Array.from(new Set(accounts.flatMap(account => account.tags)));

  return (
    <section className="settings-page">
      <div className="settings-content max-w-4xl">
        <div className="settings-grid">
          <ProfileEditor displayName={displayName} photoURL={photoURL} onSave={onProfileUpdate} />
          <div className="setting-card">
            <div className="setting-icon"><Lock className="size-4" /></div>
            <div className="flex-1">
              <h3>Auto-lock vault</h3>
              <p>Kunci vault setelah tidak ada aktivitas.</p>
              <select value={lockMinutes} onChange={event => setLockMinutes(Number(event.target.value))} className="select-control mt-4" aria-label="Durasi auto-lock vault">
                <option value={5}>5 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
              </select>
            </div>
          </div>
          <div className="setting-card">
            <div className="setting-icon"><Sparkles className="size-4" /></div>
            <div className="flex-1">
              <h3>Toast notifications</h3>
              <p>Atur berapa lama notifikasi muncul di sudut layar.</p>
              <select value={toastDuration} onChange={event => { const next = Number(event.target.value); setToastDuration(next); window.localStorage.setItem(TOAST_DURATION_KEY, String(next)); window.dispatchEvent(new Event("vaultmark-toast-duration-change")); }} className="select-control mt-4" aria-label="Durasi toast notification">
                <option value={2400}>Short · 2.4 seconds</option>
                <option value={3600}>Default · 3.6 seconds</option>
                <option value={5200}>Comfortable · 5.2 seconds</option>
                <option value={8000}>Long · 8 seconds</option>
              </select>
            </div>
          </div>
          <div className="setting-card">
            <div className="setting-icon"><Moon className="size-4" /></div>
            <div className="flex-1">
              <h3>Appearance</h3>
              <p>Sesuaikan tampilan vault untuk penggunaan siang atau malam.</p>
              <Button variant="outline" className="mt-4" onClick={onToggleTheme}>{theme === "dark" ? <Sun className="mr-2 size-4" /> : <Moon className="mr-2 size-4" />}{theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}</Button>
            </div>
          </div>
          <div className="setting-card">
            <div className="flex-1">
              <h3>Tag management</h3>
              <p>{tags.length} tag aktif · Rename, merge, atau hapus massal.</p>
              <div className="mt-4 space-y-2">
                {tags.length ? tags.map(tag => <div key={tag} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                  <div className="tag-color-control">
                    <span className="tag-swatch" style={{ backgroundColor: getTagColor(tag, tagColors) }} />
                    <Badge variant="secondary" className="rounded-lg bg-white text-slate-600">{tag}</Badge>
                    <div className="tag-color-options" role="group" aria-label={`Warna tag ${tag}`}>
                      {TAG_COLORS.map(color => <button key={color} type="button" className={`tag-color-option ${getTagColor(tag, tagColors) === color ? "selected" : ""}`} style={{ backgroundColor: color }} aria-label={`Pilih warna ${color}`} onClick={() => { const next = { ...tagColors, [tag]: color }; setTagColors(next); window.localStorage.setItem(TAG_COLORS_KEY, JSON.stringify(next)); }} />)}
                    </div>
                  </div>
                  <span className="ml-auto flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => { const next = window.prompt(`Rename tag “${tag}” menjadi:`, tag)?.trim(); if (next && next !== tag) onRenameTag(tag, next); }}>Rename</Button>
                    <Button variant="ghost" size="sm" className="text-rose-600 hover:bg-rose-50" onClick={() => { if (window.confirm(`Hapus tag “${tag}” dari semua entri?`)) onDeleteTag(tag); }}>Remove</Button>
                  </span>
                </div>) : <p className="text-xs text-slate-400">Belum ada tag. Tambahkan dari form akun.</p>}
              </div>
              <p className="mt-3 text-[11px] text-slate-400">Tag dapat ditambahkan atau dihilangkan dari form akun, dan dikelola massal di sini.</p>
            </div>
          </div>
          <div className="setting-card">
            <div className="setting-icon"><ArrowUpFromLine className="size-4" /></div>
            <div className="flex-1">
              <h3>Import & export</h3>
              <p>Ekspor ciphertext terenkripsi atau impor JSON yang tervalidasi.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => onExport("json")}><ArrowDownToLine className="mr-2 size-4" />Export JSON</Button>
                <Button variant="outline" onClick={() => onExport("csv")}><ArrowDownToLine className="mr-2 size-4" />Export CSV</Button>
                <input ref={input} type="file" accept="application/json,.json" className="hidden" onChange={event => event.target.files?.[0] && onImport(event.target.files[0])} />
                <Button variant="outline" onClick={() => input.current?.click()}><ArrowUpFromLine className="mr-2 size-4" />Import JSON</Button>
              </div>
            </div>
          </div>
          <div className="setting-card">
            <div className="setting-icon"><FileKey2 className="size-4" /></div>
            <div className="flex-1">
              <h3>Master Password</h3>
              <p>Ubah password akan mengenkripsi ulang semua data lama dengan key baru.</p>
              <Button variant="outline" className="mt-4" onClick={() => toast("Master Password", { description: "Re-enkripsi akan tersedia setelah verifikasi password lama." })}>Change Master Password</Button>
            </div>
          </div>
          <div className="setting-card danger-card">
            <div className="setting-icon danger-icon"><Trash2 className="size-4" /></div>
            <div className="flex-1">
              <h3>Delete account & data</h3>
              <p>Hapus akun Firebase dan seluruh dokumen Firestore secara permanen.</p>
              <Button variant="outline" className="mt-4 text-rose-600 hover:bg-rose-50" onClick={() => toast.error("Konfirmasi tambahan diperlukan", { description: "Tindakan permanen ini belum dijalankan di preview." })}>Delete permanently</Button>
            </div>
          </div>
        </div>
        <div className="mt-8 flex items-start gap-3 rounded-2xl bg-[#F4FAFF] p-4 text-xs leading-5 text-slate-500">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#1FACFF]" />
          <span><strong className="text-slate-700">Security note.</strong> Firestore menyimpan ciphertext saja. Master Password tidak pernah masuk ke server dan tidak dapat dipulihkan jika terlupa.</span>
        </div>
      </div>
    </section>
  );
}
