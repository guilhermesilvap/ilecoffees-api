import { Link, useNavigate } from "react-router-dom";

function ArrowIcon({ size = 14, dir = "right" }: { size?: number; dir?: "left" | "right" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" style={{ transform: dir === "left" ? "rotate(180deg)" : undefined }} aria-hidden="true">
      <path d="M2.5 7h9M7.8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--ink)", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{ padding: "20px 32px", borderBottom: "1px solid var(--line)" }}>
        <Link to="/" style={{ display: "inline-flex", alignItems: "baseline", gap: 6, textDecoration: "none", color: "var(--ink)" }}>
          <span className="script" style={{ fontSize: 38, lineHeight: 0.75 }}>íle</span>
          <span className="serif italic" style={{ fontSize: 14, lineHeight: 1, color: "var(--c-vibra)" }}>coffees</span>
        </Link>
      </header>

      {/* Content */}
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 32px", textAlign: "center" }}>
        <div style={{ maxWidth: 560 }}>
          <div className="serif" style={{
            fontSize: "clamp(120px, 22vw, 240px)", lineHeight: 0.85,
            letterSpacing: "-.05em", color: "var(--line)", userSelect: "none",
          }}>
            404
          </div>

          <h1 className="serif" style={{ margin: "28px 0 0", fontSize: "clamp(36px, 5vw, 56px)", lineHeight: 1, letterSpacing: "-.02em" }}>
            Xícara <span className="italic" style={{ color: "var(--c-vibra)" }}>vazia</span>.
          </h1>

          <p style={{ fontSize: 17, color: "var(--ink-2)", lineHeight: 1.6, marginTop: 16, maxWidth: 400, margin: "16px auto 0" }}>
            A página que você procura não existe ou foi movida para outro endereço.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 40, flexWrap: "wrap" }}>
            <Link to="/explore" style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "14px 24px", background: "var(--ink)", color: "var(--paper)",
              borderRadius: 999, fontSize: 15, textDecoration: "none",
            }}>
              Ver catálogo <ArrowIcon />
            </Link>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "14px 22px", border: "1px solid var(--ink)",
                borderRadius: 999, fontSize: 15, background: "none",
                color: "var(--ink)", cursor: "pointer", fontFamily: "inherit",
              }}
            >
              <ArrowIcon dir="left" size={12} /> Voltar
            </button>
          </div>

          <div className="mono" style={{ marginTop: 48, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-3)" }}>
            Ilé Coffees · desde 1934
          </div>
        </div>
      </main>

      {/* 404 watermark */}
      <div className="script" aria-hidden="true" style={{
        position: "fixed", right: -20, bottom: -60,
        fontSize: "clamp(200px, 35vw, 480px)", lineHeight: 1,
        color: "var(--line)", opacity: 0.4, pointerEvents: "none",
        letterSpacing: "-.04em", zIndex: 0,
      }}>
        íle
      </div>
    </div>
  );
};

export default NotFound;
