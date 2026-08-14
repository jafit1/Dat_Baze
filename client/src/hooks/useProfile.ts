// Minimalist Secure Workspace — profile metadata is synchronized without exposing secrets.
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { updateProfile, type User } from "firebase/auth";
import { toast } from "sonner";
import { auth, db } from "@/lib/vault";
import { PROFILE_DOCUMENT_ID } from "@/lib/auth-policy";

export function useProfile(user: User | null) {
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL ?? "");

  useEffect(() => {
    let cancelled = false;
    setDisplayName(user?.displayName ?? "");
    setPhotoURL(user?.photoURL ?? "");
    if (!user || !db) return;
    void (async () => {
      try {
        const snapshot = await getDoc(doc(db, `users/${user.uid}/profile/${PROFILE_DOCUMENT_ID}`));
        const data = snapshot.data();
        if (!cancelled) {
          setDisplayName(typeof data?.displayName === "string" ? data.displayName : user.displayName ?? "");
          setPhotoURL(typeof data?.photoURL === "string" ? data.photoURL : user.photoURL ?? "");
        }
      } catch {
        // Auth metadata remains a valid fallback when the profile document is unavailable.
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

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
    if (!user || !auth) throw new Error("Sesi autentikasi belum siap.");
    await updateProfile(user, { displayName: nextDisplayName || null, photoURL: nextPhotoURL || null });
    if (db) {
      await setDoc(doc(db, `users/${user.uid}/profile/${PROFILE_DOCUMENT_ID}`), {
        email: user.email,
        displayName: nextDisplayName,
        photoURL: nextPhotoURL,
        updatedAt: Date.now(),
      }, { merge: true });
    }
    setDisplayName(nextDisplayName);
    setPhotoURL(nextPhotoURL);
    window.dispatchEvent(new CustomEvent("vaultmark-profile-change", { detail: { displayName: nextDisplayName, photoURL: nextPhotoURL } }));
    toast.success("Profil berhasil diperbarui", { description: "Nama tampilan dan foto profil tersimpan." });
  };

  return { displayName, photoURL, saveProfile };
}
