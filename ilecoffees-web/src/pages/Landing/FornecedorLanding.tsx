import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useMobile } from "@/contexts/MobileContext";


function Logo() {
  return (
    <Link to="/" style={{ display: "inline-flex", alignItems: "baseline", gap: 6, textDecoration: "none", color: "currentColor" }}>
      <span className="script" style={{ fontSize: 44, lineHeight: 0.8 }}>íle</span>
      <span className="serif italic" style={{ fontSize: 14, lineHeight: 1, color: "var(--c-vibra)" }}>coffees</span>
    </Link>
  );
}

function Arrow({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M2.5 7h9M7.8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const BENEFITS = [
  {
    n: "01",
    title: "Canal direto com torrefadores",
    sub: "sem intermediários",
    body: "Seus lotes chegam a torrefadoras especializadas em specialty de todo o Brasil. Você negocia diretamente, sem atravessador e com preço justo.",
    icon: (
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
        <path d="M7 14h14M14 7v14" stroke="var(--c-vibra)" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="14" cy="14" r="10" stroke="var(--ink)" strokeWidth="1.4" />
      </svg>
    ),
  },
  {
    n: "02",
    title: "Vitrine técnica completa",
    sub: "variedade, altitude, processo e SCA",
    body: "Monte o perfil de cada lote com ficha completa: variedade, região, altitude, processo de beneficiamento e pontuação SCA. Os compradores certos te encontram.",
    icon: (
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
        <rect x="4" y="4" width="20" height="20" rx="4" stroke="var(--ink)" strokeWidth="1.4" />
        <path d="M8 14h12M8 10h8M8 18h6" stroke="var(--c-vibra)" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    n: "03",
    title: "Pedidos e rastreabilidade",
    sub: "do campo à torra",
    body: "Receba pedidos de torrefadoras pelo painel, confirme lotes e acompanhe em tempo real. Toda a cadeia documentada, do campo até a saída do seu galpão.",
    icon: (
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
        <path d="M6 9h16v15a1 1 0 01-1 1H7a1 1 0 01-1-1V9z" stroke="var(--ink)" strokeWidth="1.4" />
        <path d="M10 9V6a4 4 0 018 0v3" stroke="var(--ink)" strokeWidth="1.4" />
        <path d="M10 15l3 3 5-5" stroke="var(--c-vibra)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    n: "04",
    title: "Receba via Pix",
    sub: "repasse semanal, sem burocracia",
    body: "Pagamentos garantidos pela plataforma com repasse semanal via Pix. Sem mensalidade, sem taxa de entrada — você só paga uma comissão quando vende.",
    icon: (
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
        <path d="M14 4v20M6 8h12a4 4 0 010 8H6" stroke="var(--c-vibra)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

const STEPS = [
  ["01", "Cadastre sua fazenda", "Informe o nome, CNPJ, localização e tipo de produção. Aprovação em até 48h."],
  ["02", "Suba seus lotes", "Adicione cada café com variedade, altitude, processo, pontuação SCA e preço por kg."],
  ["03", "Receba pedidos", "Torrefadoras visualizam seu catálogo e fazem pedidos diretamente pelo painel."],
  ["04", "Receba via Pix", "Repasse semanal. Sem mensalidade. Sem taxa de adesão."],
];

const PROFILE_ITEMS = [
  { label: "Fazenda", value: "Sítio Pedra Branca", tag: "Minas Gerais" },
  { label: "Variedade", value: "Bourbon Amarelo", tag: "Altitude 1.240m" },
  { label: "Processo", value: "Natural Anaeróbico", tag: "72h" },
  { label: "Pontuação SCA", value: "88,5 pts", tag: "Specialty" },
];

function LotPreview({ mob }: { mob: boolean }) {
  return (
    <div style={{
      background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 20,
      overflow: "hidden", boxShadow: "0 24px 56px -24px rgba(28,8,16,.2)",
      maxWidth: 480, width: "100%",
    }}>
      <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 10, height: 10, borderRadius: 999, background: "var(--c-mostarda)" }} />
        <span style={{ width: 10, height: 10, borderRadius: 999, background: "#e8d3c3" }} />
        <span style={{ width: 10, height: 10, borderRadius: 999, background: "#e8d3c3" }} />
        <span className="mono" style={{ marginLeft: 8, fontSize: 11, color: "var(--ink-2)" }}>Lote · Safra 2025</span>
      </div>
      <div style={{ padding: "24px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div className="serif" style={{ fontSize: 26, lineHeight: 1, letterSpacing: "-.01em" }}>Pedra Branca</div>
            <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 4 }}>Bourbon Amarelo · Natural Anaeróbico</div>
          </div>
          <span style={{ padding: "4px 10px", borderRadius: 999, background: "rgba(var(--c-vibra-rgb),.08)", border: "1px solid var(--c-vibra)", fontSize: 12, color: "var(--c-vibra)", fontWeight: 600 }}>
            88,5 SCA
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          {PROFILE_ITEMS.map(({ label, value, tag }) => (
            <div key={label} style={{ padding: "14px 14px", borderRadius: 12, background: "var(--bg-2)", border: "1px solid var(--line)" }}>
              <div className="mono" style={{ fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{value}</div>
              <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 2 }}>{tag}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderRadius: 12, background: "var(--bg)", border: "1px solid var(--line)" }}>
          <div>
            <div style={{ fontSize: 12, color: "var(--ink-2)" }}>Preço por kg</div>
            <div className="serif" style={{ fontSize: 24, lineHeight: 1, color: "var(--c-vibra)", marginTop: 2 }}>R$ 48,00</div>
          </div>
          <div style={{ textAlign: "right" as const }}>
            <div style={{ fontSize: 12, color: "var(--ink-2)" }}>Estoque disponível</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 2 }}>120 kg</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FornecedorLanding() {
  const mob = useMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--ink)" }}>

      {/* ── Header ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(238,243,235,.92)", backdropFilter: "blur(10px)", borderBottom: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: mob ? "14px 20px" : "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          {!mob ? (
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Logo />
                <span style={{ padding: "3px 10px", border: "1px solid var(--ink)", borderRadius: 999, fontSize: 11, letterSpacing: ".06em" }}>Fornecedor</span>
              </div>
              <span style={{ width: 1, height: 20, background: "var(--ink)", opacity: 0.15 }} />
              <nav style={{ display: "flex", gap: 24, alignItems: "center" }}>
                <a href="#beneficios" className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", textDecoration: "none" }}>Benefícios</a>
                <a href="#como-funciona" className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", textDecoration: "none" }}>Como funciona</a>
                <Link to="/roaster" className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", textDecoration: "none" }}>Sou torrefador →</Link>
                <Link to="/" className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", textDecoration: "none" }}>← Loja</Link>
              </nav>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Logo />
              <span style={{ padding: "3px 10px", border: "1px solid var(--ink)", borderRadius: 999, fontSize: 11 }}>Fornecedor</span>
            </div>
          )}

          {!mob ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Link to="/login" style={{ padding: "9px 16px", fontSize: 14, color: "var(--ink-2)", textDecoration: "none" }}>Já tenho conta</Link>
              <Link to="/register/supplier" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 999, background: "var(--ink)", color: "var(--c-leveza)", fontSize: 14, textDecoration: "none" }}>
                Cadastrar <Arrow size={12} />
              </Link>
            </div>
          ) : (
            <button onClick={() => setMenuOpen(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: "var(--ink)", lineHeight: 0 }}>
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
              {[["Benefícios", "#beneficios"], ["Como funciona", "#como-funciona"]].map(([label, to]) => (
                <a key={label} href={to} onClick={() => setMenuOpen(false)} style={{ padding: "14px 4px", fontSize: 18, color: "var(--ink)", textDecoration: "none", borderBottom: "1px solid var(--line)" }}>{label}</a>
              ))}
              <Link to="/roaster" onClick={() => setMenuOpen(false)} style={{ padding: "14px 4px", fontSize: 18, color: "var(--ink-2)", textDecoration: "none", borderBottom: "1px solid var(--line)" }}>Sou torrefador →</Link>
              <Link to="/" onClick={() => setMenuOpen(false)} style={{ padding: "14px 4px", fontSize: 18, color: "var(--ink-2)", textDecoration: "none", borderBottom: "1px solid var(--line)" }}>← Loja</Link>
            </nav>
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <Link to="/login" style={{ flex: 1, textAlign: "center" as const, padding: "13px", fontSize: 15, color: "var(--ink)", border: "1.5px solid rgba(28,8,16,.2)", borderRadius: 999, textDecoration: "none" }}>Login</Link>
              <Link to="/register/supplier" style={{ flex: 1, textAlign: "center" as const, padding: "13px", fontSize: 15, background: "var(--ink)", color: "var(--c-leveza)", borderRadius: 999, textDecoration: "none" }}>Cadastrar</Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid var(--ink)" }}>
        <img
          src="https://images.unsplash.com/photo-1524350876685-274059332603?fm=jpg&q=80&w=1920&auto=format&fit=crop&crop=center"
          alt=""
          aria-hidden
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 35%" }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(28,8,16,.58) 0%, rgba(28,8,16,.72) 50%, rgba(28,8,16,.98) 100%)",
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1320, margin: "0 auto", padding: mob ? "72px 20px 80px" : "100px 32px 120px" }}>
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1.1fr 1fr", gap: mob ? 40 : 64, alignItems: "center" }}>
            <div>
              <div className="mono" style={{ fontSize: 12, letterSpacing: ".24em", textTransform: "uppercase", color: "rgba(244,204,160,.7)", display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
                <span style={{ width: 24, height: 1, background: "var(--c-mostarda)" }} />
                Portal B2B · Para Produtores de Café
              </div>

              <h1 className="serif" style={{ margin: "0 0 24px", fontSize: mob ? "clamp(52px, 13vw, 88px)" : "clamp(60px, 7vw, 120px)", lineHeight: 0.9, letterSpacing: "-.035em", color: "var(--c-leveza)" }}>
                Da sua fazenda<br />às melhores<br /><span className="italic" style={{ color: "var(--c-mostarda)" }}>torrefações<br />do Brasil.</span>
              </h1>

              <p style={{ fontSize: mob ? 15 : 17, lineHeight: 1.6, color: "rgba(244,204,160,.78)", maxWidth: 460, margin: "0 0 36px" }}>
                Canal direto entre <b style={{ color: "var(--c-leveza)" }}>produtores de café verde</b> e torrefadoras especializadas em specialty. Sem atravessador, sem burocracia.
              </p>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 32 }}>
                <Link to="/register/supplier" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: mob ? "14px 22px" : "16px 28px", background: "var(--c-mostarda)", color: "var(--ink)", borderRadius: 999, fontSize: mob ? 14 : 15, textDecoration: "none" }}>
                  Cadastrar minha fazenda <Arrow />
                </Link>
                <Link to="/login" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: mob ? "13px 20px" : "15px 24px", borderRadius: 999, fontSize: mob ? 14 : 15, color: "var(--c-leveza)", border: "1.5px solid rgba(244,204,160,.3)", textDecoration: "none" }}>
                  Já tenho conta
                </Link>
              </div>

              <div className="mono" style={{ display: "inline-flex", gap: 20, fontSize: 12, color: "rgba(244,204,160,.5)", flexWrap: "wrap" }}>
                {["Sem mensalidade", "Aprovação em 48h", "Receba via Pix"].map((t, i, a) => (
                  <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: i < a.length - 1 ? 20 : 0 }}>
                    <span style={{ letterSpacing: ".14em", textTransform: "uppercase" }}>{t}</span>
                    {i < a.length - 1 && <span style={{ width: 3, height: 3, borderRadius: 999, background: "var(--c-mostarda)", marginLeft: 20 }} />}
                  </span>
                ))}
              </div>
            </div>

            {!mob && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <LotPreview mob={mob} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Benefícios ── */}
      <section id="beneficios" style={{ borderTop: "1px solid var(--ink)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: mob ? "56px 20px" : "96px 32px" }}>
          <div style={{ marginBottom: mob ? 36 : 64 }}>
            <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)" }}>
              <span style={{ color: "var(--c-vibra)" }}>§01</span> · Por que o íle coffees
            </div>
            <h2 className="serif" style={{ margin: "14px 0 0", fontSize: mob ? "clamp(32px, 8vw, 52px)" : "clamp(40px, 5vw, 72px)", lineHeight: 0.95, letterSpacing: "-.02em" }}>
              Mais visibilidade,<br /><span className="italic" style={{ color: "var(--c-vibra)" }}>mais mercado.</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(2, 1fr)", gap: mob ? 12 : 16 }}>
            {BENEFITS.map(({ n, title, sub, body, icon }) => (
              <div key={n} style={{ padding: "36px 32px", borderRadius: 16, background: "var(--paper)", border: "1px solid var(--line)", display: "flex", gap: 24 }}>
                <div style={{ width: 52, height: 52, borderRadius: 12, background: "var(--bg-2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="mono" style={{ fontSize: 11, letterSpacing: ".14em", color: "var(--ink-2)", marginBottom: 8 }}>§ {n}</div>
                  <h3 className="serif" style={{ margin: "0 0 4px", fontSize: mob ? 22 : 26, lineHeight: 1.1, letterSpacing: "-.01em" }}>{title}</h3>
                  <div className="serif italic" style={{ fontSize: 14, color: "var(--c-vibra)", marginBottom: 12 }}>{sub}</div>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "var(--ink-2)" }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Destaque: Preview do lote (mobile) ── */}
      {mob && (
        <section style={{ borderTop: "1px solid var(--line)", background: "var(--ink)", padding: "56px 20px" }}>
          <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(244,204,160,.55)", marginBottom: 24 }}>
            §02 · Sua vitrine no portal
          </div>
          <h2 className="serif" style={{ fontSize: "clamp(32px, 8vw, 48px)", lineHeight: 0.95, letterSpacing: "-.02em", color: "var(--c-leveza)", marginBottom: 32 }}>
            Cada lote tem<br /><span className="italic" style={{ color: "var(--c-mostarda)" }}>a ficha completa.</span>
          </h2>
          <LotPreview mob={mob} />
        </section>
      )}

      {/* ── Como funciona ── */}
      <section id="como-funciona" style={{ background: "var(--ink)", color: "var(--c-leveza)", borderTop: "1px solid var(--ink)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: mob ? "64px 20px" : "100px 32px" }}>
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1.4fr", gap: mob ? 32 : 56, alignItems: "start" }}>
            <div style={mob ? {} : { position: "sticky", top: 100 }}>
              <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(244,204,160,.5)" }}>
                <span style={{ color: "var(--c-mostarda)" }}>§{mob ? "03" : "02"}</span> · Como funciona
              </div>
              <h2 className="serif" style={{ margin: "16px 0 16px", fontSize: mob ? "clamp(32px, 7vw, 48px)" : "clamp(36px, 4vw, 56px)", lineHeight: 1, letterSpacing: "-.015em", color: "var(--c-leveza)" }}>
                Quatro passos.<br /><span className="italic" style={{ color: "var(--c-mostarda)" }}>Sem burocracia.</span>
              </h2>
              <p style={{ fontSize: 15, color: "rgba(244,204,160,.65)", lineHeight: 1.55, maxWidth: 360 }}>
                Do cadastro à primeira venda em menos de uma semana.
              </p>
            </div>
            <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {STEPS.map(([n, t, d], i) => (
                <li key={n} style={{
                  display: "grid", gridTemplateColumns: "auto 1fr", gap: 24, alignItems: "start",
                  padding: "26px 0",
                  borderTop: "1px solid rgba(244,204,160,.12)",
                  borderBottom: i === STEPS.length - 1 ? "1px solid rgba(244,204,160,.12)" : undefined,
                }}>
                  <div className="serif" style={{ fontSize: 44, lineHeight: 1, color: "rgba(244,204,160,.3)", minWidth: 64 }}>{n}</div>
                  <div>
                    <div className="serif" style={{ fontSize: 22, lineHeight: 1.1, letterSpacing: "-.01em", color: "var(--c-leveza)" }}>{t}</div>
                    <p style={{ fontSize: 14, color: "rgba(244,204,160,.6)", lineHeight: 1.55, margin: "8px 0 0" }}>{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── Crosslink Torrefador ── */}
      <section style={{ borderTop: "1px solid var(--line)", background: "var(--paper)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: mob ? "40px 20px" : "56px 32px" }}>
          <div style={{ display: "flex", flexDirection: mob ? "column" : "row", alignItems: mob ? "flex-start" : "center", justifyContent: "space-between", gap: 20, padding: "32px 36px", borderRadius: 20, border: "1px solid var(--line)", background: "var(--bg)" }}>
            <div>
              <div className="mono" style={{ fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 8 }}>Também no portal</div>
              <div className="serif" style={{ fontSize: mob ? 22 : 28, lineHeight: 1.1, letterSpacing: "-.01em" }}>
                É torrefador? Venda seus cafés<br /><span className="italic" style={{ color: "var(--c-vibra)" }}>para 1.200+ cafeterias parceiras.</span>
              </div>
            </div>
            <Link to="/roaster" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 24px", borderRadius: 999, background: "var(--ink)", color: "var(--c-leveza)", fontSize: 14, textDecoration: "none", flexShrink: 0 }}>
              Ver portal Torrefador <Arrow />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section style={{ background: "var(--c-barro)", color: "var(--c-leveza)", borderTop: "1px solid var(--ink)", position: "relative", overflow: "hidden" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: mob ? "80px 20px" : "120px 32px", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--c-mostarda)" }}>
            §{mob ? "04" : "03"} · conecte sua fazenda
          </div>
          <h2 className="serif" style={{ margin: "22px 0 0", fontSize: mob ? "clamp(52px, 13vw, 88px)" : "clamp(64px, 8vw, 128px)", lineHeight: 0.92, letterSpacing: "-.025em", color: "var(--c-leveza)" }}>
            Pronto para<br /><span className="italic" style={{ color: "var(--c-mostarda)" }}>conectar<br />sua fazenda?</span>
          </h2>
          <p style={{ margin: "28px auto 0", maxWidth: 480, fontSize: mob ? 15 : 17, lineHeight: 1.55, color: "var(--c-leveza)", opacity: 0.82 }}>
            Cadastre-se agora. Aprovação em até 48h, sem mensalidade e sem taxa de entrada.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 40, flexWrap: "wrap" }}>
            <Link to="/register/supplier" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: mob ? "15px 24px" : "18px 30px", background: "var(--c-mostarda)", color: "var(--ink)", borderRadius: 999, fontSize: mob ? 15 : 16, textDecoration: "none" }}>
              Cadastrar minha fazenda <Arrow />
            </Link>
            <Link to="/login" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: mob ? "14px 20px" : "17px 26px", border: "1.5px solid rgba(244,204,160,.3)", borderRadius: 999, fontSize: mob ? 14 : 15, color: "var(--c-leveza)", textDecoration: "none" }}>
              Já tenho conta
            </Link>
          </div>
        </div>
        <div className="script" aria-hidden style={{ position: "absolute", right: -30, bottom: mob ? -50 : -80, fontSize: mob ? 200 : 380, lineHeight: 1, color: "var(--c-mostarda)", opacity: 0.15, pointerEvents: "none", letterSpacing: "-.04em" }}>
          íle
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: "var(--c-glamour)", color: "var(--c-leveza)", borderTop: "1px solid var(--ink)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: mob ? "24px 20px" : "32px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <Logo />
          <span className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", opacity: 0.55 }}>
            © 2026 Ilé Coffees · CNPJ 47.221.118/0001-09
          </span>
          <div style={{ display: "flex", gap: 20 }}>
            <Link to="/roaster" style={{ fontSize: 13, color: "var(--c-leveza)", opacity: 0.8, textDecoration: "none" }}>Para torrefadores</Link>
            <Link to="/coffeeshop" style={{ fontSize: 13, color: "var(--c-leveza)", opacity: 0.8, textDecoration: "none" }}>Para cafeterias</Link>
            <Link to="/" style={{ fontSize: 13, color: "var(--c-leveza)", opacity: 0.8, textDecoration: "none" }}>Loja</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
