// Minimalist Secure Workspace — profile edits stay explicit, centered, and bounded before persistence.
import { useEffect, useRef, useState } from "react";
import { Check, Image, ImagePlus, Link2, LoaderCircle, Trash2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProfileImageCropDialog from "@/components/ProfileImageCropDialog";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const MAX_STORED_BYTES = 100_000;

type ProfileEditorProps = {
  displayName?: string;
  photoURL?: string;
  onSave: (displayName: string, photoURL: string) => Promise<void>;
};

export default function ProfileEditor({ displayName = "", photoURL = "", onSave }: ProfileEditorProps) {
  const [name, setName] = useState(displayName);
  const [photo, setPhoto] = useState(photoURL);
  const [photoInput, setPhotoInput] = useState(photoURL.startsWith("data:image/") ? "" : photoURL);
  const [photoSource, setPhotoSource] = useState<"url" | "upload">(photoURL.startsWith("data:image/") ? "upload" : "url");
  const [photoFailed, setPhotoFailed] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const isUploadedPhoto = photoURL.startsWith("data:image/");
    setName(displayName);
    setPhoto(photoURL);
    setPhotoInput(isUploadedPhoto ? "" : photoURL);
    setPhotoSource(isUploadedPhoto ? "upload" : "url");
    setPhotoFailed(false);
  }, [displayName, photoURL]);

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Pilih file gambar JPG, PNG, atau WebP."); return; }
    if (file.size > MAX_UPLOAD_BYTES) { setError("Ukuran file maksimal 10 MB sebelum crop."); return; }
    setError("");
    setCropFile(file);
  };

  const handleCroppedPhoto = (dataURL: string) => {
    setPhoto(dataURL);
    setPhotoInput("");
    setPhotoSource("upload");
    setPhotoFailed(false);
    setCropFile(null);
  };

  const setPhotoURLInput = (value: string) => {
    setPhotoInput(value);
    setPhoto(value.trim());
    setPhotoSource("url");
    setPhotoFailed(false);
  };

  const save = async () => {
    const nextName = name.trim();
    const nextPhoto = photoSource === "upload" ? photo : photoInput.trim();
    if (nextName.length > 80) { setError("Nama tampilan maksimal 80 karakter."); return; }
    if (nextPhoto.startsWith("data:image/") && nextPhoto.length * 0.75 > MAX_STORED_BYTES) { setError("Foto hasil crop terlalu besar. Pilih gambar lain atau crop lebih sederhana."); return; }
    if (nextPhoto && !nextPhoto.startsWith("data:image/")) {
      try {
        const parsed = new URL(nextPhoto);
        if (parsed.protocol !== "https:") throw new Error("protocol");
      } catch { setError("Masukkan URL foto publik HTTPS yang valid."); return; }
    }
    setError("");
    setPhotoFailed(false);
    setSaving(true);
    try { await onSave(nextName, nextPhoto); }
    catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Profil belum dapat disimpan."); }
    finally { setSaving(false); }
  };

  const clearPhoto = () => { setPhoto(""); setPhotoInput(""); setPhotoSource("url"); setPhotoFailed(false); };
  const previewLabel = name.trim() || "Vaultmark user";
  const initial = previewLabel.charAt(0).toUpperCase() || "U";
  const hasPhoto = Boolean(photo) && !photoFailed;

  return <>
    <div className="setting-card profile-setting-card">
      <div className="setting-icon"><UserRound className="size-4" /></div>
      <div className="flex-1 min-w-0">
        <h3>Profile</h3>
        <p>Atur username dan foto yang terlihat di menu profil.</p>
        <div className="profile-editor-fields mt-4">
          <div className="profile-preview-row">
            <div className="profile-preview" aria-label={`Preview foto profil ${previewLabel}`}>
              {hasPhoto ? <img src={photo} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setPhotoFailed(true)} /> : <span>{initial}</span>}
            </div>
            <div className="profile-preview-copy">
              <strong>{previewLabel}</strong>
              <span>{photoSource === "upload" && photo ? "Foto sudah di-crop dan di-resize di browser." : "Foto dapat berasal dari URL HTTPS publik."}</span>
            </div>
          </div>
          <label className="profile-field">
            <span>Username / display name</span>
            <Input value={name} maxLength={80} autoComplete="name" placeholder="Nama tampilan" onChange={event => setName(event.target.value)} />
          </label>
          <div className="profile-upload-row">
            <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handleFile} aria-label="Pilih file foto profil" />
            <Button type="button" variant="outline" onClick={() => fileInput.current?.click()} aria-label="Upload dan crop foto profil"><ImagePlus className="mr-2 size-4 text-[#b6d9fc]" />Upload foto</Button>
            {photo && <Button type="button" variant="ghost" className="text-rose-600 hover:bg-rose-500/10" onClick={clearPhoto} aria-label="Hapus foto profil"><Trash2 className="mr-2 size-4" />Hapus</Button>}
          </div>
          <label className="profile-field">
            <span>Atau gunakan Photo URL</span>
            <div className="relative"><Link2 className="pointer-events-none absolute left-3 top-3 size-4 text-[#9da7ba]" /><Input className="pl-9" value={photoInput} inputMode="url" autoComplete="url" placeholder="https://contoh.com/foto.jpg" onChange={event => setPhotoURLInput(event.target.value)} aria-describedby="profile-photo-help" /></div>
          </label>
          <p id="profile-photo-help" className="profile-help"><Image className="size-3.5" />Upload diproses lokal menjadi JPEG square maksimal 180×180 dan sekitar 100 KB.</p>
        </div>
        {error && <p className="profile-error" role="alert">{error}</p>}
        <Button className="mt-4 bg-[#663af3] text-white hover:bg-[#7c53ff]" onClick={save} disabled={saving} aria-label="Simpan perubahan profil">
          {saving ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <Check className="mr-2 size-4" />}
          {saving ? "Menyimpan..." : "Simpan profil"}
        </Button>
      </div>
    </div>
    <ProfileImageCropDialog file={cropFile} onCancel={() => setCropFile(null)} onApply={handleCroppedPhoto} />
  </>;
}
