import fs from "node:fs";

const root = "/home/ubuntu/personal-account-vault";

function update(path, transform) {
  const fullPath = `${root}/${path}`;
  const before = fs.readFileSync(fullPath, "utf8");
  const after = transform(before);
  if (after === before) throw new Error(`No changes made to ${path}`);
  fs.writeFileSync(fullPath, after);
}

update("client/src/App.tsx", source => source.replace(
  '<ThemeProvider defaultTheme="light">',
  '<ThemeProvider defaultTheme="light" switchable>',
));

update("client/src/pages/Home.tsx", source => {
  let next = source;
  next = next.replace(
    'import { Archive, ArrowDownToLine, ArrowUpFromLine, Check, ChevronDown, Copy, Eye, EyeOff, FileKey2, Filter, KeyRound, Lock, LogIn, LogOut, Menu, MoreHorizontal, Pencil, Plus, Search, Settings2, ShieldCheck, Sparkles, Tag, Trash2, Unlock, UserPlus, X } from "lucide-react";',
    'import { Archive, ArrowDownToLine, ArrowUpFromLine, Check, ChevronDown, Copy, Eye, EyeOff, FileKey2, Filter, KeyRound, Lock, LogIn, LogOut, Menu, MoreHorizontal, Moon, Pencil, Plus, Search, Settings2, ShieldCheck, Sparkles, Sun, Tag, Trash2, Unlock, UserPlus, X } from "lucide-react";',
  );
  next = next.replace(
    'import { firebaseConfigured, auth, db, decryptAccount, downloadJson, encryptAccount, formatRelativeTime, generatePassword, getTotpCode, type EncryptedRecord, type VaultAccount } from "@/lib/vault";',
    'import { firebaseConfigured, auth, db, decryptAccount, downloadJson, encryptAccount, formatRelativeTime, generatePassword, getTotpCode, type EncryptedRecord, type VaultAccount } from "@/lib/vault";\n+import { useTheme } from "../contexts/ThemeContext";',
  );
  next = next.replace(
    'function getToastDuration() { if (typeof window === "undefined") return DEFAULT_TOAST_DURATION; const stored = Number(window.localStorage.getItem(TOAST_DURATION_KEY)); return [2400, 3600, 5200, 8000].includes(stored) ? stored : DEFAULT_TOAST_DURATION; }',
    'function getToastDuration() { if (typeof window === "undefined") return DEFAULT_TOAST_DURATION; const stored = Number(window.localStorage.getItem(TOAST_DURATION_KEY)); return [2400, 3600, 5200, 8000].includes(stored) ? stored : DEFAULT_TOAST_DURATION; }\n+function csvCell(value: unknown) { return `"${String(value ?? "").replaceAll(""", """")}"`; }\n+function downloadText(filename: string, content: string, type = "text/plain;charset=utf-8") { const blob = new Blob([content], { type }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; anchor.click(); URL.revokeObjectURL(url); }',
  );
  next = next.replace(
    'export default function Home() { const [user, setUser] = useState<User | null>(null);',
    'export default function Home() { const { theme, toggleTheme } = useTheme(); const [user, setUser] = useState<User | null>(null);',
  );
  const exportPattern = /const exportVault = async \(\) => \{.*?\}; const renameTag = async/s;
  if (!exportPattern.test(next)) throw new Error("exportVault block not found");
  next = next.replace(exportPattern, `const exportVault = async (format: "json" | "csv" = "json") => { const exportedAt = new Date().toISOString(); if (format === "csv") { const rows = [["service", "email", "password", "twoFA", "tags", "createdAt", "updatedAt"], ...accounts.map(account => [account.service, account.email, account.password, account.twoFA ?? "", account.tags.join("; "), account.createdAt ?? "", account.updatedAt])]; downloadText(\`vaultmark-export-\${new Date().toISOString().slice(0, 10)}.csv\`, rows.map(row => row.map(csvCell).join(",")).join("\\n"), "text/csv;charset=utf-8"); toast.warning("CSV berisi data sensitif", { description: "File CSV berisi password plaintext. Simpan di tempat yang aman.", duration: getToastDuration() }); return; } const payload = { format: "vaultmark-json", version: 1, exportedAt, warning: "File berisi ciphertext dan metadata terenkripsi. Jaga file ini tetap privat.", accounts: demo ? accounts : await Promise.all(accounts.map(a => encryptAccount(a, master))) }; downloadJson(\`vaultmark-export-\${new Date().toISOString().slice(0, 10)}.json\`, payload); toast.success("Ekspor JSON siap diunduh", { duration: getToastDuration() }); }; const renameTag = async`);
  next = next.replace(
    '<SettingsView accounts={accounts} lockMinutes={lockMinutes} setLockMinutes={setLockMinutes} toastDuration={toastDuration} setToastDuration={setToastDuration} tagColors={tagColors} setTagColors={setTagColors} onRenameTag={renameTag} onDeleteTag={deleteTag} onImport={file => { toast.success(`${file.name} diverifikasi`, { description: "Siap diimpor setelah Master Password dikonfirmasi." }); }} onExport={exportVault} />',
    '<SettingsView accounts={accounts} lockMinutes={lockMinutes} setLockMinutes={setLockMinutes} toastDuration={toastDuration} setToastDuration={setToastDuration} theme={theme} onToggleTheme={() => toggleTheme?.()} tagColors={tagColors} setTagColors={setTagColors} onRenameTag={renameTag} onDeleteTag={deleteTag} onImport={file => { toast.success(`${file.name} diverifikasi`, { description: "Siap diimpor setelah Master Password dikonfirmasi." }); }} onExport={exportVault} />',
  );
  const settingsSignature = /function SettingsView\(\{ accounts, lockMinutes, setLockMinutes, toastDuration, setToastDuration, tagColors, setTagColors, onRenameTag, onDeleteTag, onImport, onExport \}: \{.*?onExport: \(\) => void \}\)/s;
  if (!settingsSignature.test(next)) throw new Error("SettingsView signature not found");
  next = next.replace(settingsSignature, 'function SettingsView({ accounts, lockMinutes, setLockMinutes, toastDuration, setToastDuration, theme, onToggleTheme, tagColors, setTagColors, onRenameTag, onDeleteTag, onImport, onExport }: { accounts: VaultAccount[]; lockMinutes: number; setLockMinutes: (n: number) => void; toastDuration: number; setToastDuration: (n: number) => void; theme: "light" | "dark"; onToggleTheme: () => void; tagColors: Record<string, string>; setTagColors: (colors: Record<string, string>) => void; onRenameTag: (from: string, to: string) => void; onDeleteTag: (tag: string) => void; onImport: (file: File) => void; onExport: (format: "json" | "csv") => void })');
  next = next.replace(
    '</div></div><div className="setting-card"><div className="flex-1"><h3>Tag management</h3>',
    '</div></div><div className="setting-card"><div className="setting-icon"><Moon className="size-4" /></div><div className="flex-1"><h3>Appearance</h3><p>Sesuaikan tampilan vault untuk penggunaan siang atau malam.</p><Button variant="outline" className="mt-4" onClick={onToggleTheme}>{theme === "dark" ? <Sun className="mr-2 size-4" /> : <Moon className="mr-2 size-4" />}{theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}</Button></div></div><div className="setting-card"><div className="flex-1"><h3>Tag management</h3>',
  );
  next = next.replace(
    '<Button variant="outline" onClick={onExport}><ArrowDownToLine className="mr-2 size-4" />Export JSON</Button>',
    '<Button variant="outline" onClick={() => onExport("json")}><ArrowDownToLine className="mr-2 size-4" />Export JSON</Button><Button variant="outline" onClick={() => onExport("csv")}><ArrowDownToLine className="mr-2 size-4" />Export CSV</Button>',
  );
  return next;
});

update("client/src/index.css", source => `${source}\n\n/* Dark mode: keep the secure workspace calm, readable, and low-glare while preserving Vault Blue as the trust signal. */\n.dark { color-scheme: dark; }\n.dark html, .dark body { background: #0a1520; color: #dbe8f2; }\n.dark .app-shell { background: #0a1520; }\n.dark .app-sidebar { border-color: #203849; background: rgba(11, 27, 40, .98); }\n.dark .topbar { border-color: #203849; background: rgba(10, 21, 32, .88); }\n.dark .vault-summary { border-color: #203849; background: #0d1b28; }\n.dark .search-wrap, .dark .account-row, .dark .empty-state, .dark .setting-card, .dark .lock-card, .dark .modal-card { border-color: #254457; background: #102332; color: #dbe8f2; }\n.dark .security-card { border-color: #254457; background: #0e1d2b; color: #a9bdcc; }\n.dark .nav-item { color: #9eb3c2; }\n.dark .nav-item:hover { background: #142d3e; color: #e5f4fb; }\n.dark .nav-item.active { background: #123c55; color: #77d1ff; }\n.dark .nav-count, .dark .eyebrow, .dark .setting-card p, .dark .accounts-section .text-slate-400, .dark .account-row .text-slate-400 { color: #8197a8 !important; }\n.dark .search-wrap input, .dark .sort-control select, .dark .select-control { color: #dbe8f2; background: transparent; }\n.dark .search-wrap input::placeholder { color: #71899b; }\n.dark .sort-control, .dark .select-control { border-color: #29485b; background: #102332; color: #b8cbd7; }\n.dark .tag-filter { color: #a9bdcc; }\n.dark .tag-filter:hover { background: #142d3e; }\n.dark .tag-filter.selected { background: #123c55; color: #77d1ff; }\n.dark .view-toggle { background: #132b3b; }\n.dark .view-toggle button.active { background: #214257; color: #77d1ff; }\n.dark .account-row:hover { border-color: #317b9e; box-shadow: 0 12px 30px rgba(0,0,0,.24); }\n.dark .account-row h4, .dark .setting-card h3, .dark .accounts-section h3, .dark .modal-card h2, .dark .confirm-card h2 { color: #e7f3f9 !important; }\n.dark .account-row .bg-slate-50, .dark .setting-card .bg-slate-50 { background: #183143 !important; color: #b9ceda !important; }\n.dark .totp-card { background: #123247; }\n.dark .icon-button:hover { background: #173548; color: #e6f4fa; }\n.dark .modal-backdrop { background: rgba(2, 9, 15, .64); }\n.dark .modal-card label { color: #aac0cd; }\n.dark .modal-card input { border-color: #29485b; background: #0d1d2a; color: #e7f3f9; }\n.dark .modal-card input::placeholder { color: #71899b; }\n.dark .confirm-mark { background: #123c55; }\n.dark .danger-card { border-color: #5b3033; background: #25181d; }\n.dark .danger-icon { background: #4a2529; }\n.dark .auth-shell { background: #0a1520; }\n.dark .auth-card { background: #0a1520; }\n.dark .auth-aside { background: #0e1f2d; }\n.dark .auth-card h1, .dark .auth-aside p { color: #e7f3f9 !important; }\n.dark .auth-card input { border-color: #29485b; background: #102332; color: #e7f3f9; }\n.dark .auth-card input::placeholder { color: #71899b; }\n.dark .status-capsule { border-color: #29485b; background: rgba(16, 35, 50, .86); color: #b8cbd7; }\n.dark .lock-shell { background: radial-gradient(circle at 50% 0%, #123247, #0a1520 58%); }\n.dark .lock-card p { color: #9eb3c2 !important; }\n.dark .lock-card input { border-color: #29485b; background: #102332; color: #e7f3f9; }\n`);

console.log("Dark mode and JSON/CSV export updates applied.");
