import { useState } from "react";
import { useMobile } from "@/contexts/MobileContext";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  onClick?: () => void;
}

export function StatCard({ label, value, sub, accent, onClick }: StatCardProps) {
  const mob = useMobile();
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => onClick && setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: mob ? "18px 16px" : "24px 28px", borderRadius: 16, background: "var(--paper)",
        border: `1px solid ${hov ? "var(--ink-2)" : "var(--line)"}`,
        boxShadow: hov ? "0 12px 32px -16px rgba(28,8,16,.22)" : "0 8px 24px -16px rgba(28,8,16,.18)",
        cursor: onClick ? "pointer" : "default",
        transition: "border-color .15s, box-shadow .15s",
        position: "relative" as const,
        overflow: "hidden", minWidth: 0,
      }}
    >
      <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)" }}>{label}</div>
      <div className="serif" style={{ fontSize: mob ? 26 : 44, lineHeight: 1, letterSpacing: "-.02em", marginTop: 8, color: accent ?? "var(--ink)", wordBreak: "break-all" }}>{value}</div>
      {sub && <div style={{ fontSize: mob ? 11 : 13, color: "var(--ink-2)", marginTop: 6 }}>{sub}</div>}
      {onClick && (
        <div className="mono" style={{ fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: hov ? "var(--ink)" : "var(--ink-3)", marginTop: 14, display: "flex", alignItems: "center", gap: 4, transition: "color .15s" }}>
          Ver detalhes
          <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      )}
    </div>
  );
}
