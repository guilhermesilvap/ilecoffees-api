import { ReactNode, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

export function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setVisible(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(true), 30);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [location.pathname]);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(10px)",
        transition: "opacity 0.28s ease, transform 0.28s ease",
        minHeight: "100vh",
      }}
    >
      {children}
    </div>
  );
}

/* ── Loading bar that runs on route change ── */
export function RouteLoadingBar() {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const t1 = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t2 = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // start
    setProgress(0);
    setVisible(true);
    if (t1.current) clearTimeout(t1.current);
    if (t2.current) clearTimeout(t2.current);

    t1.current = setTimeout(() => setProgress(85), 60);
    t2.current = setTimeout(() => {
      setProgress(100);
      setTimeout(() => setVisible(false), 250);
    }, 350);

    return () => {
      if (t1.current) clearTimeout(t1.current);
      if (t2.current) clearTimeout(t2.current);
    };
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 99999, height: 2, pointerEvents: "none" }}>
      <div
        style={{
          height: "100%",
          width: `${progress}%`,
          background: "linear-gradient(90deg, var(--c-mostarda), var(--c-vibra))",
          transition: progress === 0 ? "none" : "width 0.3s ease",
          borderRadius: "0 2px 2px 0",
          boxShadow: "0 0 8px var(--c-mostarda)",
        }}
      />
    </div>
  );
}
