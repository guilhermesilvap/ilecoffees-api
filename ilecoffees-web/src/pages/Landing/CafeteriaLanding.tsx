import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
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
    title: "Preços exclusivos B2B",
    sub: "sem tabela do varejo",
    body: "Acesse preços por kg e por pacote exclusivos para empresas. Quanto maior o volume, melhores as condições com nossos torrefadores parceiros.",
    icon: (
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
        <path d="M14 4v20M6 8h12a4 4 0 010 8H6" stroke="var(--c-vibra)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    n: "02",
    title: "Assinatura recorrente",
    sub: "café fresco a cada ciclo",
    body: "Configure entregas mensais ou anuais com desconto especial B2B. Sem pedidos manuais, sem estoque parado — o café chega quando você precisa.",
    icon: (
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
        <path d="M4 14a10 10 0 1020 0" stroke="var(--c-vibra)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M4 14a10 10 0 0110-10" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />
        <path d="M20 9l4-5-5 1" stroke="var(--c-vibra)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    n: "03",
    title: "Rastreabilidade total",
    sub: "da fazenda ao seu copo",
    body: "Cada lote vem com produtor, fazenda, altitude, processamento e SCA Score. Conte a história do café aos seus clientes com segurança.",
    icon: (
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
        <path d="M14 4C9.6 4 6 7.6 6 12c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8z" stroke="var(--ink)" strokeWidth="1.4" />
        <circle cx="14" cy="12" r="2.5" fill="var(--c-vibra)" />
      </svg>
    ),
  },
  {
    n: "04",
    title: "Formação da equipe",
    sub: "cursos com Q-Graders",
    body: "Cursos de barista, análise sensorial e gestão de cafeteria criados por especialistas SCA. Capacite sua equipe sem sair da plataforma.",
    icon: (
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="10" stroke="var(--ink)" strokeWidth="1.4" />
        <path d="M12 10v8l7-4z" fill="var(--c-vibra)" />
      </svg>
    ),
  },
];

const STEPS = [
  ["01", "Crie sua conta Cafeteria", "Cadastre com CNPJ e dados da sua cafeteria. Aprovação imediata."],
  ["02", "Acesse o catálogo B2B", "Veja preços exclusivos para empresas em centenas de cafés specialty."],
  ["03", "Compre ou assine", "Compra avulsa ou entrega recorrente com desconto no plano anual."],
  ["04", "Receba e sirva", "Acompanhe o pedido, receba o lote com rastreabilidade e eleve seu cardápio."],
];

const PLANS = [
  { name: "Entrada", tag: "Ideal para começar", price: "A partir de R$ 69", cycle: "/mês para cafeterias", items: ["Até 2 cafés incluídos", "Entrega mensal", "15% de desconto no plano anual"] },
  { name: "Crescimento", tag: "Mais popular", price: "A partir de R$ 129", cycle: "/mês para cafeterias", items: ["Até 5 cafés incluídos", "Entrega quinzenal opcional", "20% de desconto no plano anual", "Acesso a cursos técnicos"], highlight: true },
  { name: "Pro", tag: "Alto giro", price: "A partir de R$ 249", cycle: "/mês para cafeterias", items: ["Cafés ilimitados no plano", "Entrega sob demanda", "25% de desconto no plano anual", "Cursos + suporte prioritário"] },
];

export default function CafeteriaLanding() {
  const mob = useMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
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
                <span style={{ padding: "3px 10px", border: "1px solid var(--c-vibra)", borderRadius: 999, fontSize: 11, letterSpacing: ".06em", color: "var(--c-vibra)" }}>Cafeteria</span>
              </div>
              <span style={{ width: 1, height: 20, background: "var(--ink)", opacity: 0.15 }} />
              <nav style={{ display: "flex", gap: 24, alignItems: "center" }}>
                <a href="#beneficios" className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", textDecoration: "none" }}>Benefícios</a>
                <a href="#planos" className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", textDecoration: "none" }}>Planos</a>
                <a href="#como-funciona" className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", textDecoration: "none" }}>Como funciona</a>
                <Link to="/" className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", textDecoration: "none" }}>← Loja</Link>
              </nav>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Logo />
              <span style={{ padding: "3px 10px", border: "1px solid var(--c-vibra)", borderRadius: 999, fontSize: 11, color: "var(--c-vibra)" }}>Cafeteria</span>
            </div>
          )}

          {!mob ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Link to="/login" style={{ padding: "9px 16px", fontSize: 14, color: "var(--ink-2)", textDecoration: "none" }}>Já tenho conta</Link>
              <Link to="/register/customer" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 999, background: "var(--c-vibra)", color: "var(--c-leveza)", fontSize: 14, textDecoration: "none" }}>
                Cadastrar cafeteria <Arrow size={12} />
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
          <div ref={menuRef} style={{ borderTop: "1px solid var(--line)", background: "rgba(238,243,235,.98)", padding: "12px 20px 24px" }}>
            <nav style={{ display: "flex", flexDirection: "column" }}>
              {[["Benefícios", "#beneficios"], ["Planos", "#planos"], ["Como funciona", "#como-funciona"], ["← Loja", "/"]].map(([label, to]) => (
                to.startsWith("/") && to !== "/"
                  ? <Link key={label} to={to} onClick={() => setMenuOpen(false)} style={{ padding: "14px 4px", fontSize: 18, color: "var(--ink)", textDecoration: "none", borderBottom: "1px solid var(--line)" }}>{label}</Link>
                  : to === "/"
                    ? <Link key={label} to="/" onClick={() => setMenuOpen(false)} style={{ padding: "14px 4px", fontSize: 18, color: "var(--ink-2)", textDecoration: "none", borderBottom: "1px solid var(--line)" }}>{label}</Link>
                    : <a key={label} href={to} onClick={() => setMenuOpen(false)} style={{ padding: "14px 4px", fontSize: 18, color: "var(--ink)", textDecoration: "none", borderBottom: "1px solid var(--line)" }}>{label}</a>
              ))}
            </nav>
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <Link to="/login" style={{ flex: 1, textAlign: "center" as const, padding: "13px", fontSize: 15, color: "var(--ink)", border: "1.5px solid rgba(28,8,16,.2)", borderRadius: 999, textDecoration: "none" }}>Entrar</Link>
              <Link to="/register/customer" style={{ flex: 1, textAlign: "center" as const, padding: "13px", fontSize: 15, background: "var(--c-vibra)", color: "var(--c-leveza)", borderRadius: 999, textDecoration: "none" }}>Cadastrar</Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section style={{ position: "relative", minHeight: mob ? "100vh" : "100vh", display: "flex", alignItems: "center", overflow: "hidden", borderBottom: "1px solid var(--ink)" }}>
        <img
          src="https://images.unsplash.com/photo-1453614512568-c4024d13c247?fm=jpg&q=80&w=1920&auto=format&fit=crop&crop=center"
          alt=""
          aria-hidden
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: mob
            ? "linear-gradient(to bottom, rgba(15,41,32,.65) 0%, rgba(15,41,32,.85) 55%, rgba(15,41,32,.98) 100%)"
            : "linear-gradient(110deg, rgba(15,41,32,.94) 0%, rgba(15,41,32,.88) 40%, rgba(15,41,32,.5) 70%, rgba(15,41,32,.18) 100%)",
        }} />
        <span className="script" aria-hidden style={{
          position: "absolute", right: mob ? -20 : "3%", bottom: mob ? -30 : -60,
          fontSize: mob ? "clamp(180px, 52vw, 300px)" : "clamp(280px, 34vw, 540px)", lineHeight: 1,
          color: "var(--c-mostarda)", opacity: 0.1, userSelect: "none", pointerEvents: "none", zIndex: 1,
        }}>íle</span>

        <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 1320, margin: "0 auto", padding: mob ? "100px 20px 120px" : "50px 32px" }}>
          <div style={{ maxWidth: mob ? "100%" : 640 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: mob ? 22 : 32 }}>
              <span style={{ width: 24, height: 1, background: "var(--c-mostarda)", flexShrink: 0 }} />
              <span className="mono" style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(244,204,160,.65)" }}>
                Portal B2B · Para Cafeterias
              </span>
            </div>

            <h1 className="serif" style={{
              margin: `0 0 ${mob ? 18 : 24}px`,
              fontSize: mob ? "clamp(52px, 13vw, 84px)" : "clamp(64px, 7.5vw, 128px)",
              lineHeight: 0.9, letterSpacing: "-.035em", color: "var(--c-leveza)",
            }}>
              Os melhores cafés<br />specialty chegam <span className="italic" style={{ color: "var(--c-mostarda)" }}>à sua<br />cafeteria.</span>
            </h1>

            <p style={{ fontSize: mob ? 15 : 17, lineHeight: 1.6, color: "rgba(244,204,160,.78)", maxWidth: 460, margin: `0 0 ${mob ? 32 : 40}px` }}>
              Portal B2B exclusivo para cafeterias: preços no atacado, assinaturas recorrentes, rastreabilidade total e cursos para sua equipe.
            </p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: mob ? 28 : 36 }}>
              <Link to="/register/customer" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: mob ? "14px 22px" : "16px 28px", background: "var(--c-mostarda)", color: "var(--ink)", borderRadius: 999, fontSize: mob ? 14 : 15, textDecoration: "none" }}>
                Cadastrar minha cafeteria <Arrow />
              </Link>
              <Link to="/login" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: mob ? "13px 20px" : "15px 24px", borderRadius: 999, fontSize: mob ? 14 : 15, color: "var(--c-leveza)", border: "1.5px solid rgba(244,204,160,.3)", textDecoration: "none" }}>
                Já sou parceiro
              </Link>
            </div>

            <div className="mono" style={{ display: "inline-flex", gap: 20, fontSize: 12, color: "rgba(244,204,160,.5)", flexWrap: "wrap" }}>
              {["Aprovação imediata", "Sem fidelidade", "Cancele quando quiser"].map((t, i, a) => (
                <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: i < a.length - 1 ? 20 : 0 }}>
                  <span style={{ letterSpacing: ".14em", textTransform: "uppercase" }}>{t}</span>
                  {i < a.length - 1 && <span style={{ width: 3, height: 3, borderRadius: 999, background: "var(--c-mostarda)", marginLeft: 20 }} />}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Benefícios ── */}
      <section id="beneficios" style={{ borderTop: "1px solid var(--ink)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: mob ? "56px 20px" : "96px 32px" }}>
          <div style={{ marginBottom: mob ? 36 : 64 }}>
            <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)" }}>
              <span style={{ color: "var(--c-vibra)" }}>§01</span> · Vantagens da conta Cafeteria
            </div>
            <h2 className="serif" style={{ margin: "14px 0 0", fontSize: mob ? "clamp(32px, 8vw, 52px)" : "clamp(40px, 5vw, 72px)", lineHeight: 0.95, letterSpacing: "-.02em" }}>
              Por que comprar<br /><span className="italic" style={{ color: "var(--c-vibra)" }}>pelo portal B2B</span>?
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(4, 1fr)", gap: mob ? 12 : 16 }}>
            {BENEFITS.map(({ n, title, sub, body, icon }) => (
              <div key={n} style={{ padding: "32px 26px", borderRadius: 16, background: "var(--paper)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: 12, background: "var(--bg-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {icon}
                </div>
                <div>
                  <div className="mono" style={{ fontSize: 11, letterSpacing: ".14em", color: "var(--ink-2)" }}>§ {n}</div>
                  <h3 className="serif" style={{ margin: "8px 0 4px", fontSize: mob ? 24 : 28, lineHeight: 1.05, letterSpacing: "-.01em" }}>{title}</h3>
                  <div className="serif italic" style={{ fontSize: 14, color: "var(--c-vibra)" }}>{sub}</div>
                </div>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "var(--ink-2)" }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Planos de assinatura ── */}
      <section id="planos" style={{ background: "var(--paper)", borderTop: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: mob ? "56px 20px" : "96px 32px" }}>
          <div style={{ textAlign: "center", marginBottom: mob ? 36 : 56 }}>
            <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)" }}>
              <span style={{ color: "var(--c-vibra)" }}>§02</span> · Assinatura B2B
            </div>
            <h2 className="serif" style={{ margin: "14px auto 12px", fontSize: mob ? "clamp(32px, 8vw, 52px)" : "clamp(40px, 5vw, 64px)", lineHeight: 0.95, letterSpacing: "-.02em", maxWidth: 600 }}>
              Café fresco no ritmo<br /><span className="italic" style={{ color: "var(--c-vibra)" }}>da sua operação.</span>
            </h2>
            <p style={{ fontSize: 15, color: "var(--ink-2)", maxWidth: 480, margin: "0 auto" }}>
              Planos com preços exclusivos para cafeterias. Economize até 25% no plano anual.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(3, 1fr)", gap: mob ? 14 : 20, marginBottom: 36 }}>
            {PLANS.map(({ name, tag, price, cycle, items, highlight }) => (
              <div key={name} style={{
                padding: "36px 28px", borderRadius: 20,
                background: highlight ? "var(--c-glamour)" : "var(--bg)",
                border: highlight ? "none" : "1.5px solid var(--line)",
                color: highlight ? "var(--c-leveza)" : "var(--ink)",
                position: "relative", overflow: "hidden",
              }}>
                {highlight && (
                  <span className="mono" style={{ position: "absolute", top: 20, right: 20, fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", padding: "4px 10px", background: "var(--c-mostarda)", color: "var(--ink)", borderRadius: 999 }}>
                    Mais popular
                  </span>
                )}
                <div className="mono" style={{ fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: highlight ? "rgba(244,204,160,.6)" : "var(--ink-3)", marginBottom: 10 }}>{tag}</div>
                <div className="serif" style={{ fontSize: 32, letterSpacing: "-.01em", lineHeight: 1 }}>{name}</div>
                <div style={{ margin: "20px 0 24px" }}>
                  <span className="serif" style={{ fontSize: 28, lineHeight: 1, color: highlight ? "var(--c-mostarda)" : "var(--c-vibra)" }}>{price}</span>
                  <span style={{ fontSize: 13, color: highlight ? "rgba(244,204,160,.6)" : "var(--ink-2)", marginLeft: 6 }}>{cycle}</span>
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {items.map(item => (
                    <li key={item} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: highlight ? "rgba(244,204,160,.85)" : "var(--ink-2)" }}>
                      <svg width={14} height={14} viewBox="0 0 14 14" fill="none">
                        <path d="M2 7l4 4 6-6" stroke={highlight ? "var(--c-mostarda)" : "var(--c-vibra)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link to="/register/customer" style={{
                  display: "block", textAlign: "center" as const,
                  padding: "13px", borderRadius: 999, fontSize: 14,
                  background: highlight ? "var(--c-mostarda)" : "var(--ink)",
                  color: highlight ? "var(--ink)" : "var(--c-leveza)",
                  textDecoration: "none",
                }}>
                  Começar com {name}
                </Link>
              </div>
            ))}
          </div>

          <p style={{ textAlign: "center", fontSize: 13, color: "var(--ink-3)" }}>
            Preços ilustrativos. Valores exatos variam por torrefador e produto.{" "}
            <Link to="/subscriptions" style={{ color: "var(--c-vibra)", textDecoration: "none" }}>Ver todos os planos →</Link>
          </p>
        </div>
      </section>

      {/* ── Como funciona ── */}
      <section id="como-funciona" style={{ borderTop: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: mob ? "56px 20px" : "96px 32px" }}>
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1.4fr", gap: mob ? 32 : 56, alignItems: "start" }}>
            <div style={mob ? {} : { position: "sticky", top: 100 }}>
              <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)" }}>
                <span style={{ color: "var(--c-vibra)" }}>§03</span> · Como funciona
              </div>
              <h2 className="serif" style={{ margin: "16px 0 16px", fontSize: mob ? "clamp(32px, 7vw, 48px)" : "clamp(36px, 4vw, 56px)", lineHeight: 1, letterSpacing: "-.015em" }}>
                Quatro passos<br /><span className="italic" style={{ color: "var(--c-vibra)" }}>para começar.</span>
              </h2>
              <p style={{ fontSize: 15, color: "var(--ink-2)", lineHeight: 1.55, maxWidth: 360 }}>
                Do cadastro ao primeiro pedido em menos de 10 minutos.
              </p>
            </div>
            <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {STEPS.map(([n, t, d], i) => (
                <li key={n} style={{
                  display: "grid", gridTemplateColumns: "auto 1fr", gap: 24, alignItems: "start",
                  padding: "26px 0",
                  borderTop: "1px solid var(--line)",
                  borderBottom: i === STEPS.length - 1 ? "1px solid var(--line)" : undefined,
                }}>
                  <div className="serif" style={{ fontSize: 44, lineHeight: 1, color: "var(--ink-3)", minWidth: 64 }}>{n}</div>
                  <div>
                    <div className="serif" style={{ fontSize: 24, lineHeight: 1.1, letterSpacing: "-.01em" }}>{t}</div>
                    <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.55, margin: "8px 0 0" }}>{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section style={{ background: "var(--c-glamour)", color: "var(--c-leveza)", borderTop: "1px solid var(--ink)", position: "relative", overflow: "hidden" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: mob ? "80px 20px" : "120px 32px", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(244,204,160,.6)" }}>
            §04 · comece agora
          </div>
          <h2 className="serif" style={{ margin: "22px 0 0", fontSize: mob ? "clamp(52px, 14vw, 88px)" : "clamp(64px, 8vw, 128px)", lineHeight: 0.92, letterSpacing: "-.025em" }}>
            Eleve o nível<br /><span className="italic" style={{ color: "var(--c-mostarda)" }}>da sua cafeteria.</span>
          </h2>
          <p style={{ margin: "28px auto 0", maxWidth: 480, fontSize: mob ? 15 : 17, lineHeight: 1.55, color: "rgba(244,204,160,.82)" }}>
            Cadastre-se agora, acesse preços exclusivos B2B e receba seu primeiro pedido ainda essa semana.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 40, flexWrap: "wrap" }}>
            <Link to="/register/customer" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: mob ? "15px 24px" : "18px 30px", background: "var(--c-mostarda)", color: "var(--ink)", borderRadius: 999, fontSize: mob ? 15 : 16, textDecoration: "none" }}>
              Cadastrar minha cafeteria <Arrow />
            </Link>
            <Link to="/subscriptions" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: mob ? "14px 20px" : "17px 26px", border: "1.5px solid rgba(244,204,160,.3)", borderRadius: 999, fontSize: mob ? 14 : 15, color: "var(--c-leveza)", textDecoration: "none" }}>
              Explorar os planos
            </Link>
          </div>
        </div>
        <div className="script" aria-hidden style={{ position: "absolute", right: -30, bottom: mob ? -50 : -80, fontSize: mob ? 200 : 380, lineHeight: 1, color: "var(--c-mostarda)", opacity: 0.18, pointerEvents: "none", letterSpacing: "-.04em" }}>
          íle
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: "var(--c-glamour)", color: "var(--c-leveza)", borderTop: "1px solid rgba(244,204,160,.15)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: mob ? "24px 20px" : "32px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <Logo />
          <span className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", opacity: 0.55 }}>
            © 2026 Ilé Coffees · CNPJ 47.221.118/0001-09
          </span>
          <div style={{ display: "flex", gap: 20 }}>
            <Link to="/explore" style={{ fontSize: 13, color: "var(--c-leveza)", opacity: 0.8, textDecoration: "none" }}>Catálogo</Link>
            <Link to="/subscriptions" style={{ fontSize: 13, color: "var(--c-leveza)", opacity: 0.8, textDecoration: "none" }}>Assinaturas</Link>
            <Link to="/roaster" style={{ fontSize: 13, color: "var(--c-leveza)", opacity: 0.8, textDecoration: "none" }}>Para torrefadores</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
