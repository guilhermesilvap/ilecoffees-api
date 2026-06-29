import { createContext, useContext, useState, useEffect } from "react";

const MobileContext = createContext(false);

export function MobileProvider({ children }: { children: React.ReactNode }) {
  const [mob, setMob] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 767px)").matches
      : false
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const h = (e: MediaQueryListEvent) => setMob(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  return <MobileContext.Provider value={mob}>{children}</MobileContext.Provider>;
}

export function useMobile() {
  return useContext(MobileContext);
}
