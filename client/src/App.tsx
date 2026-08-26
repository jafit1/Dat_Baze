// Design philosophy: Minimalist Secure Workspace — the application shell stays quiet so secure actions remain legible.
import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

const TOAST_DURATION_KEY = "vaultmark-toast-duration";
const DEFAULT_TOAST_DURATION = 3600;

function App() {
  const [toastDuration, setToastDuration] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_TOAST_DURATION;
    const value = Number(window.localStorage.getItem(TOAST_DURATION_KEY));
    return [2400, 3600, 5200, 8000].includes(value) ? value : DEFAULT_TOAST_DURATION;
  });

  useEffect(() => {
    const syncDuration = () => {
      const value = Number(window.localStorage.getItem(TOAST_DURATION_KEY));
      if ([2400, 3600, 5200, 8000].includes(value)) setToastDuration(value);
    };
    window.addEventListener("vaultmark-toast-duration-change", syncDuration);
    return () => window.removeEventListener("vaultmark-toast-duration-change", syncDuration);
  }, []);

  return <ErrorBoundary><ThemeProvider defaultTheme="dark" switchable><TooltipProvider><Toaster richColors position="bottom-right" duration={toastDuration} /><Home /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}

export default App;
