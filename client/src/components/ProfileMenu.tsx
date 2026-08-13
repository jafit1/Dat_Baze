// Design philosophy: Minimalist Secure Workspace — profile actions are compact, calm, and clear about control.
import { ChevronDown, LogOut, Settings2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type ProfileMenuProps = {
  email: string;
  onSettings: () => void;
  onLogout: () => void;
};

export default function ProfileMenu({ email, onSettings, onLogout }: ProfileMenuProps) {
  const initial = email.trim().charAt(0).toUpperCase() || "U";
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className="profile-trigger" aria-label="Buka menu profil" aria-haspopup="menu">
          <span className="avatar" aria-hidden="true">{initial}</span>
          <span className="profile-trigger-email">{email}</span>
          <ChevronDown className="profile-trigger-chevron size-4" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={10} className="profile-menu-content">
        <div className="profile-menu-heading">
          <span className="profile-menu-kicker">Signed in as</span>
          <strong>{email}</strong>
        </div>
        <div className="profile-menu-divider" />
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
  );
}

