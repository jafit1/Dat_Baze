// Vaultmark × AuthKit — 404 sebagai glass plate di midnight canvas.
import { Button } from "@/components/ui/button";
import { Home, SearchX } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <main className="lock-shell">
      <div className="lock-card">
        <div className="icon-well mx-auto">
          <SearchX className="size-7 text-[#b6d9fc]" strokeWidth={1.5} />
        </div>
        <div className="eyebrow mt-7">error 404</div>
        <h1 className="headline-gradient mt-3 font-medium">Halaman tidak ditemukan.</h1>
        <p className="mt-3 text-sm leading-6 text-[#c7d3ea]">
          Halaman yang Anda cari sudah dipindahkan atau tidak pernah ada.
        </p>
        <Button
          onClick={() => setLocation("/")}
          className="auth-submit mt-7 w-full bg-[#663af3] text-white hover:bg-[#7c53ff]"
        >
          <Home className="mr-2 size-4" />
          Kembali ke vault
        </Button>
      </div>
    </main>
  );
}
