// Design philosophy: Minimalist Secure Workspace — loading should feel quiet, structured, and trustworthy without distracting from secure work.
// Minimalist Secure Workspace: loading communicates secure progress through restrained blue motion and structural skeletons.
import { ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function VaultLoadingState({ label }: { label: string }) {
  return (
    <main className="loading-shell" aria-busy="true" aria-live="polite">
      <div className="loading-panel">
        <div className="loading-brand">
          <img src="/assets/vaultmark-logo.svg" className="size-9 rounded-xl" alt="Vaultmark" />
          <div>
            <div className="font-display text-[15px] font-semibold tracking-[-.03em]">vaultmark</div>
            <div className="text-[10px] font-medium uppercase tracking-[.18em] text-[#9da7ba]">private workspace</div>
          </div>
        </div>
        <div className="loading-heading">
          <div className="loading-signal" aria-hidden="true"><span className="loading-signal-orbit loading-signal-orbit-a" /><span className="loading-signal-orbit loading-signal-orbit-b" /><span className="loading-signal-core"><ShieldCheck className="size-5" /></span></div>
          <div className="loading-heading-copy"><Skeleton className="loading-eyebrow" /><Skeleton className="loading-title" /><Skeleton className="loading-subtitle" /></div>
          <div className="loading-progress" aria-hidden="true"><span /></div>
        </div>
        <div className="loading-account-list">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="loading-account-row" key={`loading-account-${index}`}>
              <Skeleton className="loading-account-mark" />
              <div className="loading-account-copy">
                <Skeleton className="loading-account-line loading-account-line-lg" />
                <Skeleton className="loading-account-line" />
              </div>
              <Skeleton className="loading-account-action" />
            </div>
          ))}
        </div>
        <div className="loading-status">
          <ShieldCheck className="size-4 text-[#b6d9fc]" />
          <span>{label}</span>
          <span className="loading-status-dot" aria-hidden="true" />
        </div>
      </div>
    </main>
  );
}
