import { Link } from "react-router-dom";
import { useMobile } from "@/contexts/MobileContext";

interface DashboardLogoProps {
  light?: boolean;
  to?: string;
}

export function DashboardLogo({ light = false, to = "/" }: DashboardLogoProps) {
  const mob = useMobile();
  return (
    <Link
      to={to}
      style={{
        display: "inline-flex", alignItems: "baseline", gap: 6,
        textDecoration: "none", color: light ? "var(--c-leveza)" : "var(--ink)",
      }}
    >
      <span className="script" style={{ fontSize: mob ? 28 : 40, lineHeight: 0.8 }}>íle</span>
      <span className="serif italic" style={{ fontSize: 13, color: light ? "rgba(255,255,255,.6)" : "var(--c-vibra)" }}>coffees</span>
    </Link>
  );
}
