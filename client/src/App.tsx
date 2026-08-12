// Design philosophy: Minimalist Secure Workspace — the application shell stays quiet so secure actions remain legible.
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster richColors position="bottom-right" /><Home /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
