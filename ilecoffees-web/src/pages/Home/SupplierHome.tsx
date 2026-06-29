import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { EcosystemSection } from "@/components/EcosystemSection";
import { useMobile } from "@/contexts/MobileContext";


function ArrowIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2.5 7h9M7.8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Logo() {
  return (
    <Link to="/" style={{ display: "inline-flex", alignItems: "baseline", gap: 6, textDecoration: "none", color: "currentColor" }}>
      <span className="script" style={{ fontSize: 44, lineHeight: 0.8 }}>íle</span>
      <span className="serif italic" style={{ fontSize: 14, lineHeight: 1, color: "var(--c-vibra)" }}>coffees</span>
    </Link>
  );
}

const BENEFITS = [
  {
    n: "01",
    title: "Vitrine digital",
    sub: "catálogo completo e profissional",
    body: "Monte sua vitrine com fotos, fichas técnicas, variedade, altitude, processamento e SCA Score. As melhores cafeterias vão encontrar seus cafés.",
    icon: (
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
        <path d="M4 11h20l-1.8 11.2a1 1 0 01-1 .8H6.8a1 1 0 01-1-.8L4 11z" stroke="var(--ink)" strokeWidth="1.4" />
        <path d="M3 8l1.5-3h19L25 8" stroke="var(--ink)" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M11 16h6" stroke="var(--c-vibra)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    n: "02",
    title: "Pedidos automáticos",
    sub: "sem telefonemas, sem planilhas",
    body: "Cafeterias fazem pedidos direto pela plataforma. Você recebe, confirma e acompanha o status em tempo real pelo seu painel.",
    icon: (
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
        <path d="M6 9h16v15a1 1 0 01-1 1H7a1 1 0 01-1-1V9z" stroke="var(--ink)" strokeWidth="1.4" />
        <path d="M10 9V6a4 4 0 018 0v3" stroke="var(--ink)" strokeWidth="1.4" />
        <path d="M10 15l3 3 5-5" stroke="var(--c-vibra)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    n: "03",
    title: "Cursos e marca",
    sub: "construa autoridade no Specialty",
    body: "Publique cursos técnicos sobre seus cafés — origem, processamento, preparo. Torne-se referência para baristas e cafeterias parceiras.",
    icon: (
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="10" stroke="var(--ink)" strokeWidth="1.4" />
        <path d="M12 10v8l7-4z" fill="var(--c-vibra)" />
      </svg>
    ),
  },
  {
    n: "04",
    title: "Receba via Pix",
    sub: "repasse semanal, zero burocracia",
    body: "Pagamentos processados pela plataforma com repasse semanal via Pix. Sem mensalidade, sem taxa de adesão — você só paga quando vende.",
    icon: (
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
        <path d="M14 4v20M6 8h12a4 4 0 010 8H6" stroke="var(--c-vibra)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

const STEPS = [
  ["01", "Cadastre-se como Torrefador", "Conte-nos sobre sua torrefação. Aprovamos em até 48 horas."],
  ["02", "Monte sua vitrine", "Cadastre seus cafés com origem, fotos e preços. Crie cursos opcionalmente."],
  ["03", "Comece a vender", "Pedidos chegam no seu painel. Confirme e acompanhe a logística."],
  ["04", "Receba via Pix", "Repasse semanal, sem taxa de adesão."],
];

const QUICK_ACTIONS = [
  { label: "Meu painel", sub: "visão geral de pedidos e receita", to: "/dashboard/supplier", primary: true },
  { label: "Gerenciar cafés", sub: "catálogo e precificação", to: "/dashboard/supplier/catalog", primary: false },
  { label: "Explorar cursos", sub: "publicar e editar cursos", to: "/dashboard/supplier", primary: false },
];

export default function SupplierHome() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const mob = useMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const firstName = user?.name?.split(" ")[0] ?? "Torrefador";
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

      {/* ── Header ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(238,243,235,.92)", backdropFilter: "blur(10px)", borderBottom: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: mob ? "14px 20px" : "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          {!mob ? (
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Logo />
                <span style={{ padding: "3px 10px", border: "1px solid var(--ink)", borderRadius: 999, fontSize: 11, letterSpacing: ".06em" }}>Torrefador</span>
              </div>
              <span style={{ width: 1, height: 20, background: "var(--ink)", opacity: 0.15 }} />
              <nav style={{ display: "flex", gap: 24, alignItems: "center" }}>
                <a href="#beneficios" className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", textDecoration: "none" }}>Benefícios</a>
                <a href="#numeros" className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", textDecoration: "none" }}>Impacto</a>
                <a href="#funcionamento" className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", textDecoration: "none" }}>Como funciona</a>
              </nav>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Logo />
              <span style={{ padding: "3px 10px", border: "1px solid var(--ink)", borderRadius: 999, fontSize: 11, letterSpacing: ".06em" }}>Torrefador</span>
            </div>
          )}

          {!mob ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {isAuthenticated ? (
                <div ref={userMenuRef} style={{ position: "relative" }}>
                  <button onClick={() => setUserMenuOpen(o => !o)} style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "6px 14px 6px 6px", borderRadius: 999, border: "1px solid var(--line)", background: "var(--paper)", cursor: "pointer", fontFamily: "inherit" }}>
                    <span style={{ width: 34, height: 34, borderRadius: 999, flexShrink: 0, background: "var(--c-glamour)", color: "var(--c-leveza)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, overflow: "hidden" }}>
                      {(user as any)?.photoUrl ? <img src={(user as any).photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (initials || "?")}
                    </span>
                    <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 }}>
                      <span style={{ fontSize: 14, color: "var(--ink)", fontWeight: 500, lineHeight: 1 }}>{firstName}</span>
                      <span className="mono" style={{ fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-2)", lineHeight: 1 }}>Torrefador</span>
                    </span>
                    <svg width={10} height={6} viewBox="0 0 10 6" style={{ transform: userMenuOpen ? "rotate(180deg)" : undefined, transition: "transform .15s", flexShrink: 0 }}>
                      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
                    </svg>
                  </button>
                  {userMenuOpen && (
                    <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", zIndex: 50, minWidth: 160, background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,.08)", padding: 6 }}>
                      <Link to="/dashboard/supplier" onClick={() => setUserMenuOpen(false)} style={{ display: "block", padding: "10px 14px", borderRadius: 8, fontSize: 14, color: "var(--ink)", textDecoration: "none" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--bg)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >Meu painel</Link>
                      <Link to="/dashboard/supplier/catalog" onClick={() => setUserMenuOpen(false)} style={{ display: "block", padding: "10px 14px", borderRadius: 8, fontSize: 14, color: "var(--ink)", textDecoration: "none" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--bg)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >Meus cafés</Link>
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
                  <Link to="/login" style={{ padding: "9px 16px", fontSize: 14, color: "var(--ink-2)", textDecoration: "none" }}>Entrar</Link>
                  <Link to="/register/supplier" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 999, background: "var(--ink)", color: "var(--c-leveza)", fontSize: 14, textDecoration: "none" }}>
                    Cadastrar <ArrowIcon size={12} />
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
              {[["Benefícios", "#beneficios"], ["Impacto", "#numeros"], ["Como funciona", "#funcionamento"]].map(([label, to]) => (
                <a key={label} href={to} onClick={() => setMenuOpen(false)} style={{ padding: "14px 4px", fontSize: 18, color: "var(--ink)", textDecoration: "none", borderBottom: "1px solid var(--line)" }}>{label}</a>
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
                    <span className="mono" style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink-2)" }}>Torrefador</span>
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                  <Link to="/dashboard/supplier" onClick={() => setMenuOpen(false)} style={{ flex: 1, textAlign: "center" as const, padding: "13px", fontSize: 15, color: "var(--ink)", border: "1.5px solid rgba(28,8,16,.2)", borderRadius: 999, textDecoration: "none" }}>Meu painel</Link>
                  <button onClick={() => { logout(); navigate("/"); setMenuOpen(false); }} style={{ flex: 1, padding: "13px", fontSize: 15, background: "var(--ink)", color: "var(--c-leveza)", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit" }}>Sair</button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
                <Link to="/login" style={{ flex: 1, textAlign: "center" as const, padding: "13px", fontSize: 15, color: "var(--ink)", border: "1.5px solid rgba(28,8,16,.2)", borderRadius: 999, textDecoration: "none" }}>Entrar</Link>
                <Link to="/register/supplier" style={{ flex: 1, textAlign: "center" as const, padding: "13px", fontSize: 15, background: "var(--ink)", color: "var(--c-leveza)", borderRadius: 999, textDecoration: "none" }}>Cadastrar</Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* ── Hero: bifurca entre logado e visitante ── */}
      <section style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid var(--ink)" }}>
        <img
          src="https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?fm=jpg&q=80&w=1920&auto=format&fit=crop"
          alt=""
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(28,8,16,.6) 0%, rgba(28,8,16,.72) 55%, rgba(28,8,16,.97) 100%)",
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1240, margin: "0 auto", padding: mob ? "72px 20px 80px" : "100px 40px 120px" }}>
          {isAuthenticated ? (
            /* ── Hero para torrefador logado ── */
            <div>
              <div className="mono" style={{ fontSize: 12, letterSpacing: ".24em", textTransform: "uppercase", color: "rgba(244,204,160,.7)", display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
                <span style={{ width: 24, height: 1, background: "var(--c-mostarda)" }} />
                Bem-vindo de volta, {firstName}
              </div>

              <h1 className="serif" style={{ margin: "0 0 28px", fontSize: mob ? "clamp(56px, 12vw, 100px)" : "clamp(72px, 9vw, 160px)", lineHeight: 0.9, letterSpacing: "-.035em", color: "var(--c-leveza)" }}>
                Seu portal de<br />torrefação está <span className="italic" style={{ color: "var(--c-mostarda)" }}>pronto.</span>
              </h1>

              <p style={{ margin: "0 0 40px", maxWidth: 520, fontSize: mob ? 15 : 18, lineHeight: 1.55, color: "rgba(244,204,160,.8)" }}>
                Gerencie seu catálogo, acompanhe pedidos, publique cursos e receba via Pix — tudo pelo seu painel.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(3, auto)", gap: 10, justifyContent: mob ? "stretch" : "start" }}>
                {QUICK_ACTIONS.map(({ label, sub, to, primary }) => (
                  <Link key={label} to={to} style={{
                    display: "flex", flexDirection: "column", gap: 4,
                    padding: mob ? "16px 20px" : "18px 24px",
                    borderRadius: 14,
                    background: primary ? "var(--c-mostarda)" : "rgba(244,204,160,.08)",
                    border: primary ? "none" : "1.5px solid rgba(244,204,160,.2)",
                    textDecoration: "none",
                  }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: primary ? "var(--ink)" : "var(--c-leveza)", display: "flex", alignItems: "center", gap: 8 }}>
                      {label} {primary && <ArrowIcon size={12} />}
                    </span>
                    <span style={{ fontSize: 12, color: primary ? "rgba(28,8,16,.6)" : "rgba(244,204,160,.55)", lineHeight: 1.3 }}>{sub}</span>
                  </Link>
                ))}
              </div>

              <div className="mono" style={{ marginTop: 36, display: "inline-flex", gap: 24, fontSize: 12, color: "rgba(244,204,160,.45)", flexWrap: "wrap" }}>
                <span style={{ letterSpacing: ".14em", textTransform: "uppercase" }}>Receba via Pix</span>
                <span style={{ width: 4, height: 4, borderRadius: 999, background: "var(--c-mostarda)", alignSelf: "center" }} />
                <span style={{ letterSpacing: ".14em", textTransform: "uppercase" }}>Sem mensalidade</span>
                <span style={{ width: 4, height: 4, borderRadius: 999, background: "var(--c-mostarda)", alignSelf: "center" }} />
                <span style={{ letterSpacing: ".14em", textTransform: "uppercase" }}>1.200+ cafeterias parceiras</span>
              </div>
            </div>
          ) : (
            /* ── Hero para visitante ── */
            <div style={{ textAlign: "center" }}>
              <div className="mono" style={{ fontSize: 12, letterSpacing: ".24em", textTransform: "uppercase", color: "rgba(244,204,160,.7)", display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
                <span style={{ width: 24, height: 1, background: "var(--c-mostarda)" }} />
                Portal B2B · Seja parceiro
                <span style={{ width: 24, height: 1, background: "var(--c-mostarda)" }} />
              </div>

              <h1 className="serif" style={{ margin: 0, fontSize: mob ? "clamp(56px, 12vw, 100px)" : "clamp(72px, 9vw, 160px)", lineHeight: 0.9, letterSpacing: "-.035em", color: "var(--c-leveza)" }}>
                Leve seus cafés às<br /><span className="italic" style={{ color: "var(--c-mostarda)" }}>melhores</span><br />cafeterias do Brasil.
              </h1>

              <p style={{ margin: "44px auto 0", maxWidth: 620, fontSize: mob ? 15 : 19, lineHeight: 1.55, color: "rgba(244,204,160,.78)" }}>
                Portal exclusivo para <b style={{ color: "var(--c-leveza)" }}>torrefadores e revendedores Specialty</b>.
                Catálogo, pedidos e pagamentos em um só lugar.
              </p>

              <div style={{ display: "flex", gap: 12, marginTop: 40, justifyContent: "center", flexWrap: "wrap" }}>
                <Link to="/register/supplier" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: mob ? "15px 24px" : "18px 28px", background: "var(--c-mostarda)", color: "var(--ink)", borderRadius: 999, fontSize: mob ? 15 : 16, textDecoration: "none" }}>
                  Criar conta gratuita <ArrowIcon />
                </Link>
                <Link to="/login" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: mob ? "14px 20px" : "17px 26px", border: "1.5px solid rgba(244,204,160,.35)", borderRadius: 999, fontSize: mob ? 14 : 15, color: "var(--c-leveza)", textDecoration: "none" }}>
                  Já tenho conta
                </Link>
              </div>

              <div className="mono" style={{ marginTop: 32, display: "inline-flex", gap: 24, fontSize: 12, color: "rgba(244,204,160,.55)", flexWrap: "wrap", justifyContent: "center" }}>
                <span style={{ letterSpacing: ".14em", textTransform: "uppercase" }}>Sem mensalidade</span>
                <span style={{ width: 4, height: 4, borderRadius: 999, background: "var(--c-mostarda)", alignSelf: "center" }} />
                <span style={{ letterSpacing: ".14em", textTransform: "uppercase" }}>Aprovado em 48h</span>
                <span style={{ width: 4, height: 4, borderRadius: 999, background: "var(--c-mostarda)", alignSelf: "center" }} />
                <span style={{ letterSpacing: ".14em", textTransform: "uppercase" }}>Receba via Pix</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Benefícios ── */}
      <section id="beneficios" style={{ borderTop: "1px solid var(--ink)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: mob ? "64px 20px" : "100px 40px" }}>
          <div style={{ textAlign: "center", marginBottom: mob ? 36 : 64 }}>
            <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)" }}>
              <span style={{ color: "var(--c-vibra)" }}>§01</span> · Vantagens do portal
            </div>
            <h2 className="serif" style={{ margin: "16px auto 0", fontSize: mob ? "clamp(36px, 8vw, 56px)" : "clamp(44px, 5.5vw, 80px)", lineHeight: 0.95, letterSpacing: "-.02em", maxWidth: 760 }}>
              Tudo que você precisa para<br /><span className="italic" style={{ color: "var(--c-vibra)" }}>vender mais e melhor</span>.
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(4, 1fr)", gap: mob ? 12 : 16 }}>
            {BENEFITS.map(it => (
              <div key={it.n} style={{
                padding: "36px 28px 32px", borderRadius: 16, background: "var(--paper)",
                border: "1px solid var(--line)",
                display: "flex", flexDirection: "column", gap: 18,
              }}>
                <div style={{ width: 52, height: 52, borderRadius: 12, background: "var(--bg-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {it.icon}
                </div>
                <div>
                  <div className="mono" style={{ fontSize: 11, letterSpacing: ".14em", color: "var(--ink-2)" }}>§ {it.n}</div>
                  <h3 className="serif" style={{ margin: "8px 0 4px", fontSize: mob ? 26 : 30, lineHeight: 1.05, letterSpacing: "-.01em" }}>{it.title}</h3>
                  <div className="serif italic" style={{ fontSize: 15, color: "var(--c-vibra)" }}>{it.sub}</div>
                </div>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "var(--ink-2)" }}>{it.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Números ── */}
      <section id="numeros" style={{ background: "var(--c-barro)", color: "var(--c-leveza)", borderTop: "1px solid var(--c-barro)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: mob ? "64px 20px" : "100px 40px" }}>
          <div style={{ textAlign: "center", marginBottom: mob ? 36 : 64 }}>
            <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--c-mostarda)" }}>
              §02 · a plataforma em números
            </div>
            <h2 className="serif" style={{ margin: "16px auto 0", fontSize: mob ? "clamp(32px, 7vw, 52px)" : "clamp(40px, 5vw, 72px)", lineHeight: 1, letterSpacing: "-.015em", maxWidth: 760 }}>
              Uma rede que <span className="italic" style={{ color: "var(--c-mostarda)" }}>cresce com você</span>.
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(3, 1fr)", gap: mob ? 0 : 0, borderTop: "1px solid rgba(244,204,160,.2)" }}>
            {[
              { v: "500+", k: "Torrefadores", sub: "torrefações cadastradas em 18 estados" },
              { v: "1.200+", k: "Cafeterias", sub: "compram pela plataforma toda semana" },
              { v: "15k+", k: "Clientes ativos", sub: "fazem pedidos recorrentes via assinatura" },
            ].map((s, i) => (
              <div key={s.k} style={{
                textAlign: "center", padding: mob ? "40px 16px" : "56px 16px 8px",
                borderRight: !mob && i < 2 ? "1px solid rgba(244,204,160,.2)" : undefined,
                borderBottom: mob && i < 2 ? "1px solid rgba(244,204,160,.2)" : undefined,
              }}>
                <div className="serif" style={{ fontSize: mob ? "clamp(72px, 20vw, 120px)" : "clamp(96px, 12vw, 160px)", lineHeight: 0.85, letterSpacing: "-.04em", color: "var(--c-leveza)" }}>{s.v}</div>
                <div className="serif italic" style={{ fontSize: mob ? 22 : 26, marginTop: 14, color: "var(--c-mostarda)" }}>{s.k}</div>
                <p style={{ fontSize: 13, lineHeight: 1.5, color: "var(--c-leveza)", opacity: 0.7, margin: "6px auto 0", maxWidth: 260 }}>{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Como funciona ── */}
      <section id="funcionamento" style={{ borderTop: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: mob ? "64px 20px" : "100px 40px" }}>
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1.4fr", gap: mob ? 32 : 56, alignItems: "start" }}>
            <div style={mob ? {} : { position: "sticky", top: 100 }}>
              <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)" }}>
                <span style={{ color: "var(--c-vibra)" }}>§03</span> · Como funciona
              </div>
              <h2 className="serif" style={{ margin: "18px 0 0", fontSize: mob ? "clamp(36px, 8vw, 52px)" : "clamp(40px, 4.5vw, 60px)", lineHeight: 1, letterSpacing: "-.015em" }}>
                Quatro passos.<br /><span className="italic" style={{ color: "var(--c-vibra)" }}>Sem burocracia.</span>
              </h2>
              <p style={{ fontSize: 15, color: "var(--ink-2)", lineHeight: 1.5, marginTop: 20, maxWidth: 380 }}>
                Do cadastro à primeira venda em menos de uma semana.
              </p>
            </div>
            <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {STEPS.map(([n, t, d], i) => (
                <li key={n} style={{
                  display: "grid", gridTemplateColumns: "auto 1fr", gap: 28, alignItems: "start",
                  padding: "28px 0",
                  borderTop: "1px solid var(--line)",
                  borderBottom: i === STEPS.length - 1 ? "1px solid var(--line)" : undefined,
                }}>
                  <div className="serif" style={{ fontSize: 48, lineHeight: 1, color: "var(--ink-3)", minWidth: 72 }}>{n}</div>
                  <div>
                    <div className="serif" style={{ fontSize: 26, lineHeight: 1.1, letterSpacing: "-.01em" }}>{t}</div>
                    <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.55, margin: "8px 0 0", maxWidth: 480 }}>{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section style={{ background: "var(--c-vibra)", color: "var(--c-leveza)", borderTop: "1px solid var(--ink)", position: "relative", overflow: "hidden" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: mob ? "80px 20px" : "120px 40px", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", opacity: 0.85 }}>
            §04 · vamos torrar juntos
          </div>
          <h2 className="serif" style={{ margin: "22px 0 0", fontSize: mob ? "clamp(56px, 14vw, 100px)" : "clamp(64px, 9vw, 144px)", lineHeight: 0.92, letterSpacing: "-.025em" }}>
            {isAuthenticated
              ? <>Pronto para<br /><span className="italic" style={{ color: "var(--c-mostarda)" }}>vender mais?</span></>
              : <>Pronto para<br /><span className="italic" style={{ color: "var(--c-mostarda)" }}>começar?</span></>
            }
          </h2>
          <p style={{ margin: "32px auto 0", maxWidth: 520, fontSize: mob ? 15 : 18, lineHeight: 1.55, opacity: 0.92 }}>
            {isAuthenticated
              ? "Acesse seu painel para gerenciar pedidos, atualizar o catálogo e acompanhar o faturamento da sua torrefação."
              : "Crie sua conta de torrefador agora. Sem cartão de crédito, sem mensalidade — você só paga quando vende."
            }
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 40, flexWrap: "wrap" }}>
            {isAuthenticated ? (
              <Link to="/dashboard/supplier" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: mob ? "15px 24px" : "18px 30px", background: "var(--c-leveza)", color: "var(--ink)", borderRadius: 999, fontSize: mob ? 15 : 16, border: "1.5px solid var(--ink)", textDecoration: "none" }}>
                Acessar meu painel <ArrowIcon />
              </Link>
            ) : (
              <>
                <Link to="/register/supplier" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: mob ? "15px 24px" : "18px 30px", background: "var(--c-leveza)", color: "var(--ink)", borderRadius: 999, fontSize: mob ? 15 : 16, border: "1.5px solid var(--ink)", textDecoration: "none" }}>
                  Criar conta gratuita <ArrowIcon />
                </Link>
                <Link to="/login" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: mob ? "14px 20px" : "17px 28px", border: "1.5px solid var(--c-leveza)", borderRadius: 999, fontSize: mob ? 14 : 15, color: "var(--c-leveza)", textDecoration: "none" }}>
                  Já tenho conta
                </Link>
              </>
            )}
          </div>
          {!isAuthenticated && (
            <div style={{ marginTop: 32, fontSize: 13, opacity: 0.8, display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--c-mostarda)" }} />
              38 novos torrefadores esse mês
            </div>
          )}
        </div>
        <div className="script" aria-hidden="true" style={{ position: "absolute", right: -40, bottom: mob ? -60 : -100, fontSize: mob ? 240 : 440, lineHeight: 1, color: "var(--c-mostarda)", opacity: 0.22, pointerEvents: "none", letterSpacing: "-.04em" }}>
          íle
        </div>
      </section>

      <EcosystemSection highlight="roaster" />

      {/* ── Footer ── */}
      <footer style={{ background: "var(--c-glamour)", color: "var(--c-leveza)", borderTop: "1px solid var(--ink)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: mob ? "24px 20px" : "32px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <Logo />
          <span className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", opacity: 0.65 }}>
            © 2026 Ilé Coffees · desde 1934 · CNPJ 47.221.118/0001-09
          </span>
          <div style={{ display: "flex", gap: 22 }}>
            <a href="#beneficios" style={{ fontSize: 13, color: "var(--c-leveza)", opacity: 0.85, textDecoration: "none" }}>Benefícios</a>
            <a href="#numeros" style={{ fontSize: 13, color: "var(--c-leveza)", opacity: 0.85, textDecoration: "none" }}>Impacto</a>
            <a href="#funcionamento" style={{ fontSize: 13, color: "var(--c-leveza)", opacity: 0.85, textDecoration: "none" }}>Como funciona</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
