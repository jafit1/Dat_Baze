import { useEffect, useState } from "react";

export function useDebouncedValue(value: string, delay: number) { const [debounced, setDebounced] = useState(value); useEffect(() => { const timeout = window.setTimeout(() => setDebounced(value), delay); return () => window.clearTimeout(timeout); }, [value, delay]); return debounced; }