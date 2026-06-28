import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { EcosystemSection } from "@/components/EcosystemSection";

function useIsMobile(bp = 768) {
  const [m, setM] = useState(() => typeof window !== "undefined" && window.innerWidth < bp);
  useEffect(() => {
    const h = () => setM(window.innerWidth < bp);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, [bp]);
  return m;
}

function ArrowIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2.5 7h9M7.8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Logo() {
  return (
    <Link to="/" style={{ display: "inline-flex", alignItems: "baseline", gap: 6 }}>
      <span className="script" style={{ fontSize: 44, lineHeight: 0.8, color: "currentColor" }}>íle</span>
      <span className="serif italic" style={{ fontSize: 14, lineHeight: 1, color: "var(--c-vibra)" }}>coffees</span>
    </Link>
  );
}

const FEATURES = [
  {
    n: "01", title: "Canal direto com torrefadores",
    body: "Seus lotes chegam direto a torrefadoras especializadas. Sem intermediários, preço justo e rastreabilidade completa do campo à torra.",
  },
  {
    n: "02", title: "Vitrine por kg",
    body: "Cadastre seus cafés com dados completos — variedade, altitude, processo e pontuação SCA — e os torrefadores encontram exatamente o que procuram.",
  },
  {
    n: "03", title: "Pedidos e pagamentos",
    body: "Gerencie pedidos e receba via Pix semanalmente. Sem burocracia, sem mensalidade.",
  },
  {
    n: "04", title: "Visibilidade para o mercado specialty",
    body: "Seu perfil fica visível para torrefadores credenciados em todo o Brasil, ampliando o alcance da sua produção.",
  },
];

const STEPS = [
  ["01", "Cadastre-se como Produtor", "Informe o nome da fazenda, CNPJ e localização. Aprovação em até 48h."],
  ["02", "Suba seus lotes", "Adicione cada café com variedade, processo, altitude e preço por kg."],
  ["03", "Receba pedidos", "Torrefadores visualizam seu catálogo e fazem pedidos diretamente."],
  ["04", "Receba via Pix", "Repasse semanal sem taxa de adesão."],
];

export default function ProducerHome() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const mob = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const firstName = user?.name?.split(" ")[0] ?? "Produtor";
  const lastName = user?.name?.split(" ")[1] ?? "";
  const initials = ((firstName[0] ?? "") + (lastName[0] ?? "")).toUpperCase();

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--ink)" }}>
      {/* Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(238,243,235,.92)", backdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--line)",
      }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: mob ? "14px 20px" : "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          {!mob ? (
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Logo />
                <span style={{ padding: "3px 10px", border: "1px solid var(--ink)", borderRadius: 999, fontSize: 11, letterSpacing: ".06em" }}>
                  Produtor
                </span>
              </div>
              <span style={{ width: 1, height: 20, background: "var(--ink)", opacity: 0.15 }} />
              <nav style={{ display: "flex", gap: 24, alignItems: "center" }}>
                <a href="#beneficios" className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", textDecoration: "none" }}>Vantagens</a>
                <a href="#funcionamento" className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", textDecoration: "none" }}>Como funciona</a>
                <Link to="/" className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", textDecoration: "none" }}>← Loja</Link>
              </nav>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Logo />
              <span style={{ padding: "3px 10px", border: "1px solid var(--ink)", borderRadius: 999, fontSize: 11, letterSpacing: ".06em" }}>
                Produtor
              </span>
            </div>
          )}
          {!mob ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {isAuthenticated ? (
                <div ref={userMenuRef} style={{ position: "relative" }}>
                  <button onClick={() => setUserMenuOpen(o => !o)} style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "6px 14px 6px 6px", borderRadius: 999, border: "1px solid var(--line)", background: "var(--paper)", cursor: "pointer", fontFamily: "inherit" }}>
                    <span style={{ width: 34, height: 34, borderRadius: 999, flexShrink: 0, background: "var(--c-glamour)", color: "var(--c-leveza)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, overflow: "hidden" }}>
                      {(user as any)?.photoUrl
                        ? <img src={(user as any).photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : (initials || "?")}
                    </span>
                    <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 }}>
                      <span style={{ fontSize: 14, color: "var(--ink)", fontWeight: 500, lineHeight: 1 }}>{firstName}</span>
                      <span className="mono" style={{ fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-2)", lineHeight: 1 }}>Produtor</span>
                    </span>
                    <svg width={10} height={6} viewBox="0 0 10 6" style={{ transform: userMenuOpen ? "rotate(180deg)" : undefined, transition: "transform .15s", flexShrink: 0 }}>
                      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
                    </svg>
                  </button>
                  {userMenuOpen && (
                    <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", zIndex: 50, minWidth: 160, background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,.08)", padding: 6 }}>
                      <Link to="/dashboard/producer" onClick={() => setUserMenuOpen(false)} style={{ display: "block", padding: "10px 14px", borderRadius: 8, fontSize: 14, color: "var(--ink)", textDecoration: "none" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--bg)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >Meu painel</Link>
                      <div style={{ height: 1, background: "var(--line)", margin: "4px 0" }} />
                      <button onClick={() => { logout(); navigate("/"); setUserMenuOpen(false); }} style={{ display: "block", width: "100%", padding: "10px 14px", borderRadius: 8, fontSize: 14, color: "var(--ink-2)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" as const }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--bg)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >Sair</button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link to="/login" style={{ padding: "9px 16px", fontSize: 14, color: "var(--ink-2)", textDecoration: "none" }}>Login</Link>
                  <Link to="/register/supplier" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 999, background: "var(--ink)", color: "var(--c-leveza)", fontSize: 14, textDecoration: "none" }}>
                    Registre-se <ArrowIcon size={12} />
                  </Link>
                </>
              )}
            </div>
          ) : (
            <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: "var(--ink)", lineHeight: 0 }} aria-label="Menu">
              {menuOpen
                ? <svg width={20} height={20} viewBox="0 0 20 20"><path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                : <svg width={20} height={20} viewBox="0 0 20 20"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
              }
            </button>
          )}
        </div>
        {mob && menuOpen && (
          <div style={{ borderTop: "1px solid var(--line)", background: "rgba(238,243,235,.98)", padding: "12px 20px 24px" }}>
            <nav style={{ display: "flex", flexDirection: "column" }}>
              {[["Vantagens", "#beneficios"], ["Como funciona", "#funcionamento"], ["← Loja", "/"]].map(([label, to]) => (
                to.startsWith("/")
                  ? <Link key={label} to={to} onClick={() => setMenuOpen(false)} style={{ padding: "14px 4px", fontSize: 18, color: "var(--ink)", textDecoration: "none", borderBottom: "1px solid var(--line)" }}>{label}</Link>
                  : <a key={label} href={to} onClick={() => setMenuOpen(false)} style={{ padding: "14px 4px", fontSize: 18, color: "var(--ink)", textDecoration: "none", borderBottom: "1px solid var(--line)" }}>{label}</a>
              ))}
            </nav>
            {isAuthenticated ? (
              <div style={{ marginTop: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 4px", borderBottom: "1px solid var(--line)" }}>
                  <span style={{ width: 38, height: 38, borderRadius: 999, flexShrink: 0, background: "var(--c-glamour)", color: "var(--c-leveza)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, overflow: "hidden" }}>
                    {(user as any)?.photoUrl ? <img src={(user as any).photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (initials || "?")}
                  </span>
                  <span style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <span style={{ fontSize: 16, color: "var(--ink)", fontWeight: 500, lineHeight: 1 }}>{firstName}</span>
                    <span className="mono" style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink-2)" }}>Produtor</span>
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                  <Link to="/dashboard/producer" onClick={() => setMenuOpen(false)} style={{ flex: 1, textAlign: "center" as const, padding: "13px", fontSize: 15, color: "var(--ink)", border: "1.5px solid rgba(28,8,16,.2)", borderRadius: 999, textDecoration: "none" }}>Meu painel</Link>
                  <button onClick={() => { logout(); navigate("/"); setMenuOpen(false); }} style={{ flex: 1, padding: "13px", fontSize: 15, background: "var(--ink)", color: "var(--c-leveza)", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit" }}>Sair</button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
                <Link to="/login" style={{ flex: 1, textAlign: "center" as const, padding: "13px", fontSize: 15, color: "var(--ink)", border: "1.5px solid rgba(28,8,16,.2)", borderRadius: 999, textDecoration: "none" }}>Login</Link>
                <Link to="/register/supplier" style={{ flex: 1, textAlign: "center" as const, padding: "13px", fontSize: 15, background: "var(--ink)", color: "var(--c-leveza)", borderRadius: 999, textDecoration: "none" }}>Registre-se</Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Hero */}
      <section style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid var(--ink)" }}>
        <img
          src="https://images.unsplash.com/photo-1500423079914-b65af272b8db?fm=jpg&q=80&w=1920&auto=format&fit=crop"
          alt=""
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%" }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(28,8,16,.55) 0%, rgba(28,8,16,.70) 55%, rgba(28,8,16,.97) 100%)",
        }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1240, margin: "0 auto", padding: mob ? "72px 20px" : "100px 40px", textAlign: "center" }}>
          <div className="mono" style={{ fontSize: 12, letterSpacing: ".24em", textTransform: "uppercase", color: "rgba(244,204,160,.7)", display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
            <span style={{ width: 24, height: 1, background: "var(--c-mostarda)" }} />
            Portal B2B · Produtores de café
            <span style={{ width: 24, height: 1, background: "var(--c-mostarda)" }} />
          </div>

          <h1 className="serif" style={{ margin: 0, fontSize: "clamp(56px, 9vw, 160px)", lineHeight: 0.9, letterSpacing: "-.035em", color: "var(--c-leveza)" }}>
            Da sua fazenda<br />às melhores <span className="italic" style={{ color: "var(--c-mostarda)" }}>torrefações</span><br />do Brasil.
          </h1>

          <p style={{ margin: "44px auto 0", maxWidth: 640, fontSize: 19, lineHeight: 1.55, color: "rgba(244,204,160,.78)" }}>
            Canal direto entre <b style={{ color: "var(--c-leveza)" }}>produtores de café verde</b> e torrefadoras especializadas em specialty coffee.
          </p>

          <div style={{ display: "flex", gap: 12, marginTop: 40, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/register/supplier" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "18px 28px", background: "var(--c-mostarda)", color: "var(--ink)", borderRadius: 999, fontSize: 16 }}>
              Cadastre sua fazenda <ArrowIcon />
            </Link>
            <Link to="/login" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "17px 26px", border: "1.5px solid rgba(244,204,160,.35)", borderRadius: 999, fontSize: 15, color: "var(--c-leveza)" }}>
              Já tenho conta
            </Link>
          </div>

          <div className="mono" style={{ marginTop: 32, display: "inline-flex", gap: 24, fontSize: 12, color: "rgba(244,204,160,.55)", flexWrap: "wrap", justifyContent: "center" }}>
            <span style={{ letterSpacing: ".14em", textTransform: "uppercase" }}>Sem mensalidade</span>
            <span style={{ width: 4, height: 4, borderRadius: 999, background: "var(--c-mostarda)" }} />
            <span style={{ letterSpacing: ".14em", textTransform: "uppercase" }}>Aprovação em 48h</span>
            <span style={{ width: 4, height: 4, borderRadius: 999, background: "var(--c-mostarda)" }} />
            <span style={{ letterSpacing: ".14em", textTransform: "uppercase" }}>Recebe via Pix</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="beneficios" style={{ maxWidth: 1200, margin: "0 auto", padding: mob ? "80px 20px" : "120px 40px" }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 48 }}>
          Por que o íle coffees
        </div>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(2, 1fr)", gap: 24 }}>
          {FEATURES.map(f => (
            <div key={f.n} style={{ padding: "32px 36px", border: "1px solid var(--line)", borderRadius: 16, background: "var(--paper)" }}>
              <div className="mono" style={{ fontSize: 11, color: "var(--ink-2)", letterSpacing: ".14em", marginBottom: 16 }}>{f.n}</div>
              <div className="serif" style={{ fontSize: 22, marginBottom: 12, lineHeight: 1.15 }}>{f.title}</div>
              <div style={{ fontSize: 15, lineHeight: 1.6, color: "var(--ink-2)" }}>{f.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section id="funcionamento" style={{ borderTop: "1px solid var(--line)", background: "var(--ink)", color: "var(--c-leveza)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: mob ? "80px 20px" : "120px 40px" }}>
          <div className="mono" style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(244,204,160,.55)", marginBottom: 48 }}>
            Como funciona
          </div>
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(4, 1fr)", gap: 32 }}>
            {STEPS.map(([n, title, body]) => (
              <div key={n}>
                <div className="mono" style={{ fontSize: 11, color: "var(--c-mostarda)", letterSpacing: ".14em", marginBottom: 16 }}>{n}</div>
                <div className="serif" style={{ fontSize: 20, marginBottom: 12, lineHeight: 1.2 }}>{title}</div>
                <div style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(244,204,160,.65)" }}>{body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: mob ? "80px 20px" : "120px 40px", textAlign: "center" }}>
        <h2 className="serif" style={{ fontSize: mob ? 48 : 80, lineHeight: 0.9, letterSpacing: "-.025em", marginBottom: 32 }}>
          Pronto para <span className="italic" style={{ color: "var(--c-vibra)" }}>conectar</span><br />sua fazenda?
        </h2>
        <Link to="/register/supplier" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "18px 32px", background: "var(--ink)", color: "var(--c-leveza)", borderRadius: 999, fontSize: 16 }}>
          Cadastrar agora <ArrowIcon />
        </Link>
      </section>

      <EcosystemSection highlight="producer" />

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--line)", padding: mob ? "40px 20px" : "48px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <Logo />
          <div style={{ fontSize: 13, color: "var(--ink-2)" }}>© 2026 íle coffees · Portal de Produtores</div>
        </div>
      </footer>
    </div>
  );
}
