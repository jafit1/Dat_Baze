// Design philosophy: Minimalist Secure Workspace — profile actions are compact, calm, and clear about control.
import { useState } from "react";
import { ChevronDown, LogOut, Settings2, UserRound } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useProfile } from "@/hooks/useProfile";
import { useAuditLog } from "@/hooks/useAuditLog";
import ProfileView from "@/components/ProfileView";
import { auth } from "@/lib/vault";

type ProfileMenuProps = {
  email: string;
  displayName?: string;
  photoURL?: string;
  onSettings: () => void;
  onLogout: () => void;
};

export default function ProfileMenu({ email, displayName, photoURL, onSettings, onLogout }: ProfileMenuProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const currentUser = auth?.currentUser ?? null;
  const profile = useProfile(currentUser);
  const audit = useAuditLog(currentUser);
  const label = displayName?.trim() || profile.displayName.trim() || email;
  const resolvedPhotoURL = photoURL?.trim() || profile.photoURL.trim();
  const initial = label.trim().charAt(0).toUpperCase() || "U";
  return (<>
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className="profile-trigger" aria-label="Buka menu profil" aria-haspopup="menu">
          <span className="avatar" aria-hidden="true">{resolvedPhotoURL ? <img src={resolvedPhotoURL} alt="" loading="lazy" referrerPolicy="no-referrer" /> : initial}</span>
          <span className="profile-trigger-email">{label}</span>
          <ChevronDown className="profile-trigger-chevron size-4" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={10} className="profile-menu-content">
        <div className="profile-menu-heading">
          <span className="profile-menu-kicker">Signed in as</span>
          <strong>{label}</strong>
          <span className="profile-menu-email">{email}</span>
        </div>
        <div className="profile-menu-divider" />
        <button type="button" className="profile-menu-item" onClick={() => setProfileOpen(true)}>
          <UserRound className="size-4" />
          <span>Profil &amp; riwayat login</span>
        </button>
        <button type="button" className="profile-menu-item" onClick={onSettings}>
          <Settings2 className="size-4" />
          <span>Settings</span>
        </button>
        <button type="button" className="profile-menu-item danger" onClick={onLogout}>
          <LogOut className="size-4" />
          <span>Logout</span>
        </button>
      </PopoverContent>
    </Popover>
    {profileOpen && currentUser && <ProfileView user={currentUser} displayName={label} photoURL={resolvedPhotoURL} events={audit.events} loading={audit.loading} error={audit.error} onRefresh={audit.refresh} onSettings={() => { setProfileOpen(false); onSettings(); }} onClose={() => setProfileOpen(false)} />}
    </>
  );
}
