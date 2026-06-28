import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <span className={cn("inline-flex items-baseline gap-1 select-none cursor-default", className)}>
      <span style={{ fontFamily: "'Italianno', cursive", fontSize: "2.1rem", lineHeight: 0.82, color: "var(--ink)" }}>
        íle
      </span>
      <span style={{ fontFamily: "'Tinos', serif", fontStyle: "italic", fontSize: "1rem", lineHeight: 1, color: "var(--c-vibra)" }}>
        coffees
      </span>
    </span>
  );
}
