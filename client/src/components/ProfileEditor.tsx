// Minimalist Secure Workspace — profile editing stays compact, explicit, and privacy-aware.
import { useEffect, useState } from "react";
import { Check, Image, LoaderCircle, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ProfileEditorProps = {
  displayName?: string;
  photoURL?: string;
  onSave: (displayName: string, photoURL: string) => Promise<void>;
};

export default function ProfileEditor({ displayName = "", photoURL = "", onSave }: ProfileEditorProps) {
  const [name, setName] = useState(displayName);
  const [photo, setPhoto] = useState(photoURL);
  const [photoFailed, setPhotoFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(displayName);
    setPhoto(photoURL);
    setPhotoFailed(false);
  }, [displayName, photoURL]);

  const save = async () => {
    const nextName = name.trim();
    const nextPhoto = photo.trim();
    if (nextName.length > 80) {
      setError("Nama tampilan maksimal 80 karakter.");
      return;
    }
    if (nextPhoto) {
      try {
        const parsed = new URL(nextPhoto);
        if (!/^https?:$/.test(parsed.protocol)) throw new Error("protocol");
      } catch {
        setError("Masukkan URL foto publik yang valid, diawali https://.");
        return;
      }
    }
    setError("");
    setPhotoFailed(false);
    setSaving(true);
    try {
      await onSave(nextName, nextPhoto);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Profil belum dapat disimpan.");
    } finally {
      setSaving(false);
    }
  };

  const previewLabel = name.trim() || "Vaultmark user";
  const initial = previewLabel.charAt(0).toUpperCase() || "U";

  return (
    <div className="setting-card profile-setting-card">
      <div className="setting-icon"><UserRound className="size-4" /></div>
      <div className="flex-1 min-w-0">
        <h3>Profile</h3>
        <p>Atur nama tampilan dan foto yang terlihat di menu profil.</p>
        <div className="profile-editor-fields mt-4">
          <div className="profile-preview-row">
            <div className="profile-preview" aria-label={`Preview foto profil ${previewLabel}`}>
              {photo && !photoFailed ? <img src={photo} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setPhotoFailed(true)} /> : <span>{initial}</span>}
            </div>
            <div className="profile-preview-copy">
              <strong>{previewLabel}</strong>
              <span>Foto tidak diunggah ke repository.</span>
            </div>
          </div>
          <label className="profile-field">
            <span>Display name</span>
            <Input value={name} maxLength={80} autoComplete="name" placeholder="Nama tampilan" onChange={event => setName(event.target.value)} />
          </label>
          <label className="profile-field">
            <span>Photo URL</span>
            <Input value={photo} inputMode="url" autoComplete="url" placeholder="https://contoh.com/foto.jpg" onChange={event => setPhoto(event.target.value)} aria-describedby="profile-photo-help" />
          </label>
          <p id="profile-photo-help" className="profile-help"><Image className="size-3.5" />Gunakan URL gambar publik HTTPS yang kecil agar cepat dimuat.</p>
        </div>
        {error && <p className="profile-error" role="alert">{error}</p>}
        <Button className="mt-4 bg-[#1FACFF] text-white hover:bg-[#0D8DDB]" onClick={save} disabled={saving} aria-label="Simpan perubahan profil">
          {saving ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <Check className="mr-2 size-4" />}
          {saving ? "Menyimpan..." : "Simpan profil"}
        </Button>
      </div>
    </div>
  );
}
