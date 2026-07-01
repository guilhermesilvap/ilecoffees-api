import { useMobile } from "@/contexts/MobileContext";

export interface WelcomeAction {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
}

interface WelcomeBannerProps {
  name: string;
  subtitle: string;
  description: string;
  actions: WelcomeAction[];
}

export function WelcomeBanner({ name, subtitle, description, actions }: WelcomeBannerProps) {
  const mob = useMobile();
  const firstName = name.split(" ")[0];

  return (
    <div style={{
      background: "var(--ink)",
      borderRadius: 20,
      padding: mob ? "28px 24px 24px" : "36px 40px 32px",
      color: "var(--c-leveza)",
      overflow: "hidden",
      position: "relative",
    }}>
      {/* Watermark decorativo */}
      <span className="script" aria-hidden="true" style={{
        position: "absolute", right: -20, top: -40,
        fontSize: mob ? 160 : 240, lineHeight: 1,
        color: "var(--c-mostarda)", opacity: 0.07,
        userSelect: "none", pointerEvents: "none",
      }}>íle</span>

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Saudação */}
        <div className="mono" style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(216,234,208,.5)", marginBottom: 10 }}>
          ● Bem-vindo de volta
        </div>
        <h2 className="serif" style={{
          margin: "0 0 6px",
          fontSize: mob ? "clamp(24px, 6vw, 32px)" : "clamp(28px, 2.5vw, 40px)",
          lineHeight: 1, letterSpacing: "-.02em",
        }}>
          Olá, <span className="italic" style={{ color: "var(--c-mostarda)" }}>{firstName}</span>
        </h2>
        <p style={{ fontSize: 13, color: "rgba(216,234,208,.6)", margin: "0 0 6px" }}>{subtitle}</p>
        <p style={{ fontSize: 14, color: "rgba(216,234,208,.8)", lineHeight: 1.6, margin: "0 0 28px", maxWidth: 600 }}>
          {description}
        </p>

        {/* Quick actions */}
        <div style={{
          display: "grid",
          gridTemplateColumns: mob ? "repeat(2, 1fr)" : `repeat(${actions.length}, 1fr)`,
          gap: mob ? 8 : 10,
        }}>
          {actions.map((a) => (
            <button
              key={a.label}
              onClick={a.onClick}
              style={{
                background: "rgba(216,234,208,.07)",
                border: "1px solid rgba(216,234,208,.12)",
                borderRadius: 14,
                padding: mob ? "14px 14px" : "16px 18px",
                textAlign: "left",
                cursor: "pointer",
                transition: "background .15s, border-color .15s",
                color: "var(--c-leveza)",
                fontFamily: "inherit",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(216,234,208,.12)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(216,234,208,.22)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(216,234,208,.07)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(216,234,208,.12)";
              }}
            >
              <div style={{ color: "var(--c-mostarda)", marginBottom: 8, lineHeight: 0 }}>{a.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 3 }}>{a.label}</div>
              <div style={{ fontSize: 11, color: "rgba(216,234,208,.5)", lineHeight: 1.4 }}>{a.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
