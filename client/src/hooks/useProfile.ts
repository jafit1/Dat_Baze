// Minimalist Secure Workspace — profile metadata is synchronized without exposing secrets.
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged, updateProfile, type User } from "firebase/auth";
import { toast } from "sonner";
import { auth, db } from "@/lib/vault";
import { PROFILE_DOCUMENT_ID } from "@/lib/auth-policy";

export function useProfile(user: User | null) {
  const [sessionUser, setSessionUser] = useState<User | null>(() => user ?? auth?.currentUser ?? null);
  const [displayName, setDisplayName] = useState(() => (user ?? auth?.currentUser)?.displayName ?? "");
  const [photoURL, setPhotoURL] = useState(() => (user ?? auth?.currentUser)?.photoURL ?? "");

  useEffect(() => {
    if (!auth) {
      setSessionUser(user);
      return;
    }
    setSessionUser(user ?? auth.currentUser ?? null);
    return onAuthStateChanged(auth, currentUser => setSessionUser(currentUser));
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    setDisplayName(sessionUser?.displayName ?? "");
    setPhotoURL(sessionUser?.photoURL ?? "");
    if (!sessionUser || !db) return;
    void (async () => {
      try {
        const snapshot = await getDoc(doc(db, `users/${sessionUser.uid}/profile/${PROFILE_DOCUMENT_ID}`));
        const data = snapshot.data();
        if (!cancelled) {
          setDisplayName(typeof data?.displayName === "string" ? data.displayName : sessionUser.displayName ?? "");
          setPhotoURL(typeof data?.photoURL === "string" ? data.photoURL : sessionUser.photoURL ?? "");
        }
      } catch {
        // Auth metadata remains a valid fallback when the profile document is unavailable.
      }
    })();
    return () => { cancelled = true; };
  }, [sessionUser]);

  useEffect(() => {
    const onProfileChange = (event: Event) => {
      const detail = (event as CustomEvent<{ displayName?: string; photoURL?: string }>).detail;
      if (!detail) return;
      setDisplayName(detail.displayName ?? "");
      setPhotoURL(detail.photoURL ?? "");
    };
    window.addEventListener("vaultmark-profile-change", onProfileChange);
    return () => window.removeEventListener("vaultmark-profile-change", onProfileChange);
  }, []);

  const saveProfile = async (nextDisplayName: string, nextPhotoURL: string) => {
    const currentUser = sessionUser ?? user ?? auth?.currentUser ?? null;
    if (!currentUser) throw new Error("Sesi autentikasi belum siap. Tunggu sampai sesi Firebase selesai dimuat, lalu coba lagi.");
    if (!db) throw new Error("Firestore belum terkonfigurasi. Foto tidak dapat disimpan dengan aman.");
    const normalizedPhotoURL = nextPhotoURL.trim();
    if (normalizedPhotoURL.startsWith("data:image/") && normalizedPhotoURL.length > 140_000) throw new Error("Foto hasil crop terlalu besar. Pilih gambar lain atau gunakan zoom yang lebih rendah.");
    const isLocalUpload = normalizedPhotoURL.startsWith("data:image/");
    await setDoc(doc(db, `users/${currentUser.uid}/profile/${PROFILE_DOCUMENT_ID}`), {
      email: currentUser.email,
      displayName: nextDisplayName,
      photoURL: normalizedPhotoURL,
      updatedAt: Date.now(),
    }, { merge: true });
    await updateProfile(currentUser, {
      displayName: nextDisplayName || null,
      photoURL: isLocalUpload ? currentUser.photoURL ?? null : normalizedPhotoURL || null,
    });
    setDisplayName(nextDisplayName);
    setPhotoURL(normalizedPhotoURL);
    window.dispatchEvent(new CustomEvent("vaultmark-profile-change", { detail: { displayName: nextDisplayName, photoURL: normalizedPhotoURL } }));
    toast.success("Profil berhasil diperbarui", { description: "Nama tampilan dan foto profil tersimpan." });
  };

  return { displayName, photoURL, saveProfile };
}
