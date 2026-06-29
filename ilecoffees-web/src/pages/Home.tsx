import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
    <Link to="/" style={{ display: "inline-flex", alignItems: "baseline", gap: 6 }}>
      <span className="script" style={{ fontSize: 44, lineHeight: 0.8, color: "currentColor" }}>íle</span>
      <span className="serif italic" style={{ fontSize: 14, lineHeight: 1, color: "var(--c-vibra)", letterSpacing: ".02em" }}>coffees</span>
    </Link>
  );
}

function Eyebrow({ children, n }: { children: React.ReactNode; n?: string }) {
  return (
    <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)", display: "inline-flex", alignItems: "center", gap: 10 }}>
      {n && <span style={{ color: "var(--c-vibra)" }}>{n}</span>}
      <span>{children}</span>
    </div>
  );
}

const NAV_LINKS: [string, string][] = [
  ["Portfólio", "#linhas"],
  ["Prêmios", "#premios"],
  ["Nossa história", "#historia"],
  ["Assinatura", "#assinatura"],
];

function Header() {
  const mob = useMobile();
  const [open, setOpen] = useState(false);

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(238,243,235,.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--line)" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: mob ? "14px 20px" : "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        {mob ? (
          <>
            <Logo />
            <button
              onClick={() => setOpen(!open)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: "var(--ink)", lineHeight: 0 }}
              aria-label="Menu"
            >
              {open
                ? <svg width={20} height={20} viewBox="0 0 20 20"><path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                : <svg width={20} height={20} viewBox="0 0 20 20"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
              }
            </button>
          </>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Logo />
              <span style={{ width: 1, height: 20, background: "var(--ink)", opacity: 0.15 }} />
              <nav style={{ display: "flex", gap: 22, alignItems: "center" }}>
                {NAV_LINKS.map(([label, to]) =>
                  to.startsWith("#") ? (
                    <a key={label} href={to} className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", textDecoration: "none" }}>{label}</a>
                  ) : (
                    <Link key={label} to={to} className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", textDecoration: "none" }}>{label}</Link>
                  )
                )}
              </nav>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Link to="/login" style={{ padding: "9px 16px", fontSize: 14, color: "var(--ink-2)", textDecoration: "none" }}>Entrar</Link>
              <Link to="/register/customer" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 999, background: "var(--ink)", color: "var(--paper)", fontSize: 14, textDecoration: "none" }}>
                Começar <ArrowIcon size={12} />
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Mobile menu */}
      {mob && open && (
        <div style={{ borderTop: "1px solid var(--line)", background: "rgba(238,243,235,.98)", padding: "12px 20px 24px" }}>
          <nav style={{ display: "flex", flexDirection: "column" }}>
            {NAV_LINKS.map(([label, to]) =>
              to.startsWith("#") ? (
                <a key={label} href={to} onClick={() => setOpen(false)} style={{ padding: "14px 4px", fontSize: 18, color: "var(--ink)", textDecoration: "none", borderBottom: "1px solid var(--line)" }}>{label}</a>
              ) : (
                <Link key={label} to={to} onClick={() => setOpen(false)} style={{ padding: "14px 4px", fontSize: 18, color: "var(--ink)", textDecoration: "none", borderBottom: "1px solid var(--line)" }}>{label}</Link>
              )
            )}
          </nav>
          <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
            <Link to="/login" style={{ flex: 1, textAlign: "center" as const, padding: "13px", fontSize: 15, color: "var(--ink)", border: "1.5px solid rgba(28,8,16,.2)", borderRadius: 999, textDecoration: "none" }}>Entrar</Link>
            <Link to="/register/customer" style={{ flex: 1, textAlign: "center" as const, padding: "13px", fontSize: 15, background: "var(--ink)", color: "var(--c-leveza)", borderRadius: 999, textDecoration: "none" }}>Começar</Link>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  const mob = useMobile();
  return (
    <section style={{ overflow: "hidden" }}>
      <div style={{
        position: "relative",
        minHeight: mob ? "82vh" : "100vh",
        overflow: "hidden",
        borderBottom: "1px solid var(--ink)",
        display: "flex", alignItems: "center",
      }}>
        {/* Imagem de fundo — fazenda / torra editorial */}
        <img
          src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1920&q=85"
          alt=""
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
        />
        {/* Overlay escuro com gradiente direcional */}
        <div style={{
          position: "absolute", inset: 0,
          background: mob
            ? "linear-gradient(to bottom, rgba(28,8,16,.55) 0%, rgba(28,8,16,.78) 60%, rgba(28,8,16,.96) 100%)"
            : "linear-gradient(105deg, rgba(28,8,16,.9) 0%, rgba(28,8,16,.82) 40%, rgba(28,8,16,.45) 70%, rgba(28,8,16,.2) 100%)",
        }} />

        {/* Watermark */}
        <span className="script" aria-hidden="true" style={{
          position: "absolute", right: mob ? -20 : "4%", bottom: mob ? -40 : -60,
          fontSize: mob ? "clamp(180px, 55vw, 320px)" : "clamp(260px, 32vw, 520px)", lineHeight: 1,
          color: "var(--c-mostarda)", opacity: mob ? 0.1 : 0.12,
          userSelect: "none", pointerEvents: "none", zIndex: 1,
        }}>íle</span>

        {/* Conteúdo */}
        <div style={{
          position: "relative", zIndex: 2,
          width: "100%",
          maxWidth: 1320, margin: "0 auto",
          padding: mob ? "56px 20px 64px" : "70px 32px",
        }}>
          <div style={{ maxWidth: mob ? "100%" : 620 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: mob ? 24 : 36 }}>
              <span style={{ width: 24, height: 1, background: "var(--c-mostarda)", flexShrink: 0 }} />
              <span className="mono" style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(244,204,160,.65)" }}>
                Cafés especiais · Brasil · Desde 1934
              </span>
            </div>

            <h1 className="serif" style={{
              margin: `0 0 ${mob ? 20 : 28}px`,
              fontSize: mob ? "clamp(52px, 14vw, 88px)" : "clamp(64px, 7.5vw, 128px)",
              lineHeight: 0.9, letterSpacing: "-.035em", color: "var(--c-leveza)",
            }}>
              Uma herança<br />
              <span className="italic" style={{ color: "var(--c-mostarda)" }}>em cada</span><br />
              xícara.
            </h1>

            <p style={{ fontSize: mob ? 15 : 17, lineHeight: 1.6, color: "rgba(244,204,160,.75)", maxWidth: 400, margin: `0 0 ${mob ? 32 : 44}px` }}>
              Cafés selecionados por Q-Graders em fazendas premiadas do Brasil — do produtor à sua xícara.
            </p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: mob ? 0 : 48 }}>
              <Link to="/explore" style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: mob ? "14px 22px" : "16px 28px",
                background: "var(--c-mostarda)", color: "var(--ink)",
                borderRadius: 999, fontSize: mob ? 14 : 15, textDecoration: "none",
              }}>
                Ver os cafés <ArrowIcon />
              </Link>
              <a href="#historia" style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: mob ? "13px 20px" : "15px 24px", borderRadius: 999,
                fontSize: mob ? 14 : 15, color: "var(--c-leveza)",
                border: "1.5px solid rgba(244,204,160,.3)", textDecoration: "none",
              }}>
                Nossa história
              </a>
            </div>

            {!mob && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["Q-Grader Certified", "84+ pts SCA", "Cup of Excellence", "100% Arábica"].map(b => (
                  <span key={b} className="mono" style={{
                    fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase",
                    padding: "6px 14px", border: "1px solid rgba(244,204,160,.2)",
                    borderRadius: 999, color: "rgba(244,204,160,.55)",
                  }}>{b}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats band */}
      <div style={{ background: "var(--c-glamour)", borderBottom: "1px solid var(--ink)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", display: "grid", gridTemplateColumns: mob ? "repeat(2, 1fr)" : "repeat(4, 1fr)" }}>
          {([
            ["+500", "Cafeterias parceiras"],
            ["+10k", "Clientes impactados"],
            ["84+", "Pontos SCA mínimos"],
            ["100%", "Rastreabilidade"],
          ] as [string, string][]).map(([v, k], i) => (
            <div key={k} style={{
              padding: mob ? "24px 20px" : "36px 32px",
              borderRight: (mob ? i % 2 !== 1 : i < 3) ? "1px solid rgba(244,204,160,.18)" : 0,
              borderBottom: mob && i < 2 ? "1px solid rgba(244,204,160,.18)" : 0,
            }}>
              <div className="serif" style={{ fontSize: mob ? "clamp(32px, 8vw, 52px)" : "clamp(44px, 5.5vw, 80px)", lineHeight: 0.95, letterSpacing: "-.03em", color: "var(--c-leveza)" }}>{v}</div>
              <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(244,204,160,.5)", marginTop: 10 }}>{k}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const items = [
    "Carmo de Minas", "Cerrado Mineiro", "Mantiqueira de Minas", "Sul de Minas",
    "Espírito Santo do Pinhal", "Chapada Diamantina", "Matas de Rondônia",
    "Carmo de Minas", "Cerrado Mineiro", "Mantiqueira de Minas", "Sul de Minas",
    "Espírito Santo do Pinhal",
  ];
  return (
    <section style={{ background: "var(--ink)", color: "var(--c-leveza)", overflow: "hidden", padding: "20px 0" }}>
      <div style={{ display: "flex", gap: 40, animation: "marquee 50s linear infinite", whiteSpace: "nowrap" }}>
        {[...items, ...items].map((it, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 24 }}>
            <span className="serif italic" style={{ fontSize: "clamp(24px, 4vw, 36px)", color: "var(--c-leveza)" }}>{it}</span>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--c-mostarda)", flexShrink: 0 }} />
          </span>
        ))}
      </div>
    </section>
  );
}

const LINHAS = [
  { n: "01", tier: "Linha Clássica", name: "Origens", sca: "84–86", body: "Fazendas selecionadas com terroir identificado, do produtor à xícara. Cada grão tem endereço.", bg: "var(--paper)", ink: "var(--ink)", accent: "var(--c-vibra)" },
  { n: "02", tier: "Linha Premium", name: "Extraordinários", sca: "87–89", body: "Processos especiais que transformam cada xícara em experiência sensorial única.", bg: "var(--c-mostarda)", ink: "var(--ink)", accent: "var(--c-vibra)" },
  { n: "03", tier: "Linha Exclusiva", name: "Raros", sca: "89+", body: "Micro-lotes de colheitas únicas com características sensoriais que desafiam o que você imagina.", bg: "var(--c-glamour)", ink: "var(--c-leveza)", accent: "var(--c-mostarda)" },
];

function LinhaCard({ n, tier, name, sca, body, bg, ink, accent }: typeof LINHAS[0]) {
  const [on, setOn] = useState(false);
  const isDark = ink !== "var(--ink)";
  const borderAlpha = isDark ? "rgba(244,204,160,.25)" : "rgba(28,8,16,.18)";
  return (
    <Link to={`/explore?linha=${encodeURIComponent(name)}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
      <article
        style={{
          position: "relative", overflow: "hidden",
          border: "1.5px solid var(--ink)", borderRadius: 20,
          padding: "32px 28px 28px", background: bg, color: ink,
          cursor: "pointer", transition: "transform .24s ease, box-shadow .24s ease",
          transform: on ? "translateY(-6px)" : "translateY(0)",
          boxShadow: on ? "0 28px 56px -18px rgba(28,8,16,.38)" : "0 2px 8px -4px rgba(28,8,16,.1)",
          minHeight: 340, display: "flex", flexDirection: "column",
        }}
        onMouseEnter={() => setOn(true)} onMouseLeave={() => setOn(false)}
      >
        <span className="serif" aria-hidden="true" style={{ position: "absolute", right: -12, bottom: -24, fontSize: 180, lineHeight: 0.85, letterSpacing: "-.04em", color: ink, opacity: 0.07, userSelect: "none", pointerEvents: "none" }}>{n}</span>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 44 }}>
          <span className="mono" style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", padding: "5px 12px", border: `1px solid ${borderAlpha}`, borderRadius: 999, opacity: 0.7 }}>{tier}</span>
          <div style={{ width: 38, height: 38, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", border: `1.5px solid ${borderAlpha}`, transition: "transform .24s ease", transform: on ? "translate(3px, -3px)" : "translate(0,0)", flexShrink: 0 }}>
            <ArrowIcon size={14} />
          </div>
        </div>
        <h3 className="serif" style={{ margin: "0 0 16px", fontSize: "clamp(32px, 3.2vw, 52px)", lineHeight: 0.95, letterSpacing: "-.025em" }}>{name}</h3>
        <p style={{ margin: "0 0 auto", fontSize: 14, lineHeight: 1.65, opacity: 0.68, paddingBottom: 28 }}>{body}</p>
        <span className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", padding: "7px 14px", background: accent, color: isDark ? "var(--ink)" : "var(--paper)", borderRadius: 999, alignSelf: "flex-start" }}>{sca} pts SCA</span>
      </article>
    </Link>
  );
}

function LinhasGrid() {
  const mob = useMobile();
  return (
    <section id="linhas" style={{ borderTop: "1px solid var(--ink)" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: mob ? "64px 20px 48px" : "100px 40px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 340px", gap: mob ? 16 : 48, alignItems: "flex-end", marginBottom: mob ? 36 : 64 }}>
          <div>
            <Eyebrow n="§02">Portfólio</Eyebrow>
            <h2 className="serif" style={{ margin: "16px 0 0", fontSize: "clamp(40px, 6vw, 96px)", lineHeight: 0.95, letterSpacing: "-.02em" }}>
              Nossas <span className="italic" style={{ color: "var(--c-vibra)" }}>Linhas</span>.
            </h2>
          </div>
          {!mob && (
            <p style={{ fontSize: 15, color: "var(--ink-2)", lineHeight: 1.65, margin: 0 }}>
              Três linhas que traduzem a diversidade do café brasileiro em diferentes níveis de exclusividade.
            </p>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(3, 1fr)", gap: mob ? 12 : 16 }}>
          {LINHAS.map(l => <LinhaCard key={l.n} {...l} />)}
        </div>
      </div>
    </section>
  );
}

function Destaque() {
  const mob = useMobile();
  return (
    <section id="destaque" style={{ background: "var(--c-mostarda)", borderTop: "1px solid var(--ink)" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: mob ? "72px 20px" : "120px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1.2fr", gap: mob ? 48 : 64, alignItems: "center" }}>
          {/* Bag mock */}
          <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
            <div style={{ width: mob ? 260 : 320, aspectRatio: "5 / 7", borderRadius: 12, background: "var(--c-barro)", color: "var(--c-leveza)", border: "2px solid var(--ink)", position: "relative", overflow: "hidden", boxShadow: "0 30px 60px -30px rgba(28,8,16,.5)", padding: "24px 22px", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span className="script" style={{ fontSize: 52, lineHeight: 0.8, color: "var(--c-leveza)" }}>íle</span>
                <span className="mono" style={{ fontSize: 9, letterSpacing: ".14em", opacity: 0.7, marginTop: 6 }}>250g</span>
              </div>
              <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", opacity: 0.65, marginTop: 20 }}>Linha Extraordinários</div>
              <div className="serif" style={{ fontSize: mob ? 36 : 44, lineHeight: 0.95, letterSpacing: "-.02em", marginTop: 10 }}>
                Crema<br /><span className="italic" style={{ color: "var(--c-mostarda)" }}>Brûlée</span>
              </div>
              <div className="serif italic" style={{ fontSize: 16, marginTop: 14, color: "var(--c-leveza)", opacity: 0.9, lineHeight: 1.3 }}>
                Baunilha · Caramelo<br />Cacau · Frutas Amarelas
              </div>
              <div style={{ marginTop: "auto", paddingTop: 20 }}>
                <div className="mono" style={{ fontSize: 9, letterSpacing: ".14em", opacity: 0.65 }}>SCA</div>
                <div className="serif" style={{ fontSize: 26, lineHeight: 1, color: "var(--c-mostarda)" }}>86 pts</div>
              </div>
            </div>
            <div style={{ position: "absolute", right: mob ? 0 : 0, top: 24, padding: "8px 12px", background: "var(--c-vibra)", color: "var(--c-leveza)", borderRadius: 999, border: "1.5px solid var(--ink)", transform: "rotate(8deg)", boxShadow: "0 12px 28px -10px rgba(28,8,16,.4)" }}>
              <span className="mono" style={{ fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", display: "block" }}>Recorde mundial</span>
              <span className="serif" style={{ fontSize: 20, lineHeight: 1 }}>95,85 pts</span>
            </div>
          </div>

          {/* Info */}
          <div>
            <Eyebrow n="§03">Produto em destaque</Eyebrow>
            <h2 className="serif" style={{ margin: "16px 0 0", fontSize: "clamp(40px, 6vw, 96px)", lineHeight: 0.95, letterSpacing: "-.02em" }}>
              Crema <span className="italic" style={{ color: "var(--c-vibra)" }}>Brûlée</span>
            </h2>
            <div className="mono" style={{ fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", marginTop: 12, color: "var(--ink-2)" }}>
              86 pontos SCA &nbsp;·&nbsp; Carmo de Minas / MG
            </div>
            <p style={{ fontSize: mob ? 15 : 17, lineHeight: 1.55, color: "var(--ink-2)", marginTop: 20, maxWidth: 560 }}>
              Um café que redefiniu os padrões de excelência. Conquistou o recorde mundial no{" "}
              <b style={{ color: "var(--ink)" }}>Cup of Excellence</b> com 95,85 pontos — a maior pontuação da história.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: mob ? "repeat(2, 1fr)" : "repeat(3, 1fr)", gap: 0, marginTop: 28, border: "1px solid var(--ink)", borderRadius: 16, overflow: "hidden", background: "var(--paper)" }}>
              {([
                ["Variedade", "Arara e Catuaí"],
                ["Fazenda", "Sertão e Irmãs Pereira"],
                ["Altitude", "1.200 m"],
                ["Processo", "Cereja / Natural"],
                ["Região", "Carmo de Minas · MG"],
                ["Peso", "250 g"],
              ] as [string, string][]).map(([k, v], i) => (
                <div key={k} style={{ padding: "14px 16px", borderRight: (mob ? i % 2 !== 1 : i % 3 !== 2) ? "1px solid var(--line)" : 0, borderTop: (mob ? i >= 2 : i >= 3) ? "1px solid var(--line)" : 0 }}>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)" }}>{k}</div>
                  <div className="serif" style={{ fontSize: mob ? 16 : 19, lineHeight: 1.2, marginTop: 4 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Premios() {
  const mob = useMobile();
  const prizes = [
    { rank: "1°", year: "2025", event: "AVPA Paris Coffee Show", title: "1º lugar — Categoria Natural", sub: "Melhor café specialty brasileiro · Paris, França" },
    { rank: "2°", year: "2025", event: "Cup of Excellence Brasil", title: "2º lugar mundial", sub: "Recorde: 95,85 pontos — a maior pontuação da história do concurso" },
    { rank: "1°", year: "2022", event: "Specialty Coffee Competition", title: "1º lugar nacional", sub: "Categoria Anaeróbico · Brasil" },
  ];
  return (
    <section id="premios" style={{ background: "var(--c-glamour)", color: "var(--c-leveza)", borderTop: "1px solid var(--ink)" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: mob ? "64px 20px" : "100px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 380px", gap: mob ? 16 : 48, alignItems: "flex-end", marginBottom: mob ? 36 : 72 }}>
          <div>
            <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(244,204,160,.55)" }}>
              <span style={{ color: "var(--c-mostarda)" }}>§04</span> &nbsp; Reconhecimento
            </div>
            <h2 className="serif" style={{ margin: "16px 0 0", fontSize: "clamp(40px, 6vw, 96px)", lineHeight: 0.95, letterSpacing: "-.02em", color: "var(--c-leveza)" }}>
              Prêmios que <span className="italic" style={{ color: "var(--c-mostarda)" }}>comprovam</span>.
            </h2>
          </div>
          {!mob && (
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: "rgba(244,204,160,.65)" }}>
              Reconhecimento internacional que valida nossa obsessão por qualidade — e a dos produtores que selecionamos.
            </p>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(3, 1fr)", gap: "1px", background: "rgba(244,204,160,.18)" }}>
          {prizes.map((p, i) => (
            <article key={i} style={{ padding: mob ? "28px 20px" : "36px 32px", background: "var(--c-glamour)", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: mob ? 20 : 36 }}>
                <span className="serif italic" style={{ fontSize: mob ? 72 : 100, lineHeight: 0.8, color: "var(--c-mostarda)", letterSpacing: "-.02em" }}>{p.rank}</span>
                <span className="mono" style={{ fontSize: 11, letterSpacing: ".14em", color: "rgba(244,204,160,.4)", paddingTop: 6 }}>{p.year}</span>
              </div>
              <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(244,204,160,.45)", marginBottom: 8 }}>{p.event}</div>
              <h3 className="serif" style={{ margin: "0 0 8px", fontSize: mob ? 20 : 24, lineHeight: 1.1, letterSpacing: "-.01em", color: "var(--c-leveza)" }}>{p.title}</h3>
              <p style={{ fontSize: 14, color: "rgba(244,204,160,.58)", lineHeight: 1.6, margin: 0 }}>{p.sub}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Story() {
  const mob = useMobile();
  return (
    <section id="historia" style={{ background: "var(--c-mostarda)", borderTop: "1px solid var(--ink)" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: mob ? "72px 20px" : "120px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1.1fr", gap: mob ? 48 : 64, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <div style={{ aspectRatio: "4 / 5", borderRadius: 16, overflow: "hidden", background: "var(--ink)", border: "1.5px solid var(--ink)", position: "relative", boxShadow: "0 30px 60px -30px rgba(28,8,16,.4)" }}>
              <img src="/assets/tamara-foto.jpg" alt="Tamara Lilla — fundadora da íle coffees" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
              <div style={{ position: "absolute", bottom: 16, left: 16, padding: "10px 14px", background: "var(--c-leveza)", color: "var(--ink)", borderRadius: 10, border: "1px solid var(--ink)" }}>
                <div className="serif italic" style={{ fontSize: 20, lineHeight: 1 }}>Tamara Lilla</div>
                <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", marginTop: 4 }}>Fundadora · íle coffees · 2020</div>
              </div>
            </div>
            <div style={{ position: "absolute", right: -16, top: 24, width: 100, height: 100, borderRadius: 999, background: "var(--c-vibra)", color: "var(--c-leveza)", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", transform: "rotate(-8deg)", boxShadow: "0 12px 28px -10px rgba(28,8,16,.4)", border: "1.5px solid var(--ink)" }}>
              <span className="serif italic" style={{ fontSize: mob ? 18 : 22, lineHeight: 0.95 }}>desde<br />1934</span>
            </div>
          </div>
          <div style={{ color: "var(--ink)" }}>
            <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase" }}>
              <span style={{ color: "var(--c-vibra)" }}>§05</span> &nbsp; Nossa história
            </div>
            <h2 className="serif" style={{ margin: "16px 0 0", fontSize: "clamp(40px, 6vw, 96px)", lineHeight: 0.95, letterSpacing: "-.02em" }}>
              Da família <span className="italic" style={{ color: "var(--c-vibra)" }}>à xícara</span>.
            </h2>
            <p style={{ fontSize: mob ? 15 : 17, lineHeight: 1.55, marginTop: 24, maxWidth: 540, color: "var(--ink)" }}>
              A íle coffees nasceu de uma obsessão por café com história. Em 1934, a família Lilla começou a cultivar café no coração de São Paulo. Quatro gerações depois, <b>Tamara Lilla</b> transformou esse legado em algo extraordinário.
            </p>
            <p style={{ fontSize: mob ? 14 : 16, lineHeight: 1.55, marginTop: 16, maxWidth: 540, color: "var(--ink)", opacity: 0.85 }}>
              Visitamos fazendas, conhecemos produtores, entendemos solos e microclimas — e trazemos para cada embalagem o DNA completo daquele grão.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: mob ? 10 : 16, marginTop: mob ? 28 : 36 }}>
              {([["4ª", "geração da família Lilla"], ["90", "anos cultivando café"], ["1.200m", "altitude média"]] as [string, string][]).map(([k, v]) => (
                <div key={v} style={{ padding: mob ? "16px 14px" : "22px 20px", border: "1.5px solid var(--ink)", borderRadius: 14, background: "var(--c-leveza)" }}>
                  <div className="serif" style={{ fontSize: mob ? 36 : 56, lineHeight: 1, letterSpacing: "-.03em" }}>{k}</div>
                  <div style={{ fontSize: 11, marginTop: 6, color: "var(--ink-2)" }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Subscription() {
  const mob = useMobile();
  return (
    <section id="assinatura" style={{ background: "var(--c-vibra)", borderTop: "1px solid var(--ink)", color: "var(--c-leveza)", position: "relative", overflow: "hidden" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: mob ? "72px 20px" : "120px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1.3fr 1fr auto", gap: mob ? 24 : 36, alignItems: "end", position: "relative", zIndex: 1 }}>
          <div>
            <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", opacity: 0.85 }}>§06 &nbsp; Assinatura</div>
            <h3 className="serif" style={{ margin: "16px 0 0", fontSize: mob ? "clamp(36px, 8vw, 56px)" : "clamp(48px, 5.5vw, 88px)", lineHeight: 0.95, letterSpacing: "-.02em" }}>
              Histórias que <span className="italic" style={{ color: "var(--c-mostarda)" }}>brotam</span><br />da terra,<br />toda quinzena.
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: mob ? 15 : 16, lineHeight: 1.55, maxWidth: 320, opacity: 0.92 }}>
            Você escolhe a moagem, a frequência e a quantidade. A gente escolhe o lote e despacha no mesmo dia da torra.
          </p>
          <Link to="/register/customer" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "16px 24px", background: "var(--c-leveza)", color: "var(--ink)", borderRadius: 999, fontSize: 15, whiteSpace: "nowrap" as const, border: "1.5px solid var(--ink)", textDecoration: "none" }}>
            A partir de R$ 49 <ArrowIcon />
          </Link>
        </div>
        <div className="script" aria-hidden="true" style={{ position: "absolute", right: -30, bottom: -80, fontSize: mob ? 200 : 360, lineHeight: 1, color: "var(--c-mostarda)", opacity: 0.35, pointerEvents: "none", letterSpacing: "-.04em" }}>
          íle
        </div>
      </div>
    </section>
  );
}

function FooterTag({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 10px", border: "1px solid rgba(244,204,160,.3)", borderRadius: 999, fontSize: 11, color: "var(--c-leveza)" }}>
      <span style={{ width: 5, height: 5, borderRadius: 999, background: "var(--c-mostarda)" }} />
      {children}
    </span>
  );
}

function Footer() {
  const mob = useMobile();
  return (
    <footer style={{ background: "var(--c-glamour)", color: "var(--c-leveza)", borderTop: "1px solid var(--ink)" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: mob ? "48px 20px" : "64px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr 1fr" : "1.6fr 1fr 1fr 1fr", gap: mob ? 32 : 36 }}>
          <div style={{ gridColumn: mob ? "1 / -1" : "auto" }}>
            <Logo />
            <p style={{ fontSize: 14, lineHeight: 1.55, color: "var(--c-leveza)", opacity: 0.8, marginTop: 12, maxWidth: 320 }}>
              Rua Cel. Joaquim Lopes, 482 — Centro<br />Espírito Santo do Pinhal / SP · ter–sáb · 8h–18h
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
              <FooterTag>Aceitamos Pix</FooterTag>
              <FooterTag>Frete grátis acima de R$ 120</FooterTag>
            </div>
          </div>
          {([
            ["Loja", [["Cafés", "/explore"], ["Assinatura", "#assinatura"], ["Equipamentos", "#"], ["Vale-presente", "#"]]],
            ["Casa", [["Nossa história", "#historia"], ["Produtores", "#"], ["Cafeteria", "#"], ["Diário", "#"]]],
            ["Conta", [["Entrar", "/login"], ["Fornecedor", "/home/supplier"], ["Atendimento", "#"], ["Política de troca", "#"]]],
          ] as [string, [string, string][]][]).map(([title, items]) => (
            <div key={title}>
              <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--c-mostarda)", marginBottom: 12 }}>{title}</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {items.map(([label, to]) => (
                  <li key={label}>
                    {to.startsWith("/")
                      ? <Link to={to} style={{ fontSize: 14, color: "var(--c-leveza)", opacity: 0.9, textDecoration: "none" }}>{label}</Link>
                      : <a href={to} style={{ fontSize: 14, color: "var(--c-leveza)", opacity: 0.9, textDecoration: "none" }}>{label}</a>
                    }
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(244,204,160,.2)", marginTop: 48, paddingTop: 20, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <span className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--c-leveza)", opacity: 0.65 }}>© 2026 Ilé Coffees Torrefação Ltda. · desde 1934</span>
          <span className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--c-leveza)", opacity: 0.65 }}>CNPJ 47.221.118 / 0001-09</span>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div style={{ background: "var(--bg)", color: "var(--ink)", overflowX: "hidden" }}>
      <Header />
      <Hero />
      <Marquee />
      <LinhasGrid />
      <Destaque />
      <Premios />
      <Story />
      <Subscription />
      <EcosystemSection />
      <Footer />
    </div>
  );
}
