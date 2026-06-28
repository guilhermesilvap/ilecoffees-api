import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/ui/logo";
import { CartButton } from "@/components/Cart/CartButton";
import { EcosystemSection } from "@/components/EcosystemSection";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface CoffeeProduct {
  id: string;
  name: string;
  region: string | null;
  saleType: "KG" | "PACKAGE" | "BOTH";
  pricePerKg: number | null;
  packagePrice: number | null;
  packagePriceCoffeeshop: number | null;
  score: number | null;
  photoUrl: string | null;
}

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

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const BAG_COLORS = ["#f4cca0", "#c4d8bc", "#d4e0cc", "#eef3eb", "#e8ddd8", "#dce8d4"];

const BENEFITS = [
  {
    n: "01",
    title: "Preços exclusivos B2B",
    sub: "direto para sua cafeteria",
    body: "Preços especiais para compras em kg e pacotes fechados, sem tabela de varejo. Quanto mais você compra, melhor negocia.",
    icon: (
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
        <path d="M14 4v20M6 8h12a4 4 0 010 8H6" stroke="var(--c-vibra)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    n: "02",
    title: "Assinatura recorrente",
    sub: "sem estoque parado",
    body: "Programe entregas semanais ou mensais com desconto especial. Café fresco no tempo certo, sem pedidos manuais.",
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
    title: "Cursos com Q-Graders",
    sub: "treine sua equipe",
    body: "Acesso a treinamentos de barismo e análise sensorial com especialistas SCA. Qualifique sua equipe sem sair da plataforma.",
    icon: (
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="10" stroke="var(--ink)" strokeWidth="1.4" />
        <path d="M12 10v8l7-4z" fill="var(--c-vibra)" />
      </svg>
    ),
  },
  {
    n: "04",
    title: "Rastreabilidade total",
    sub: "da fazenda à sua xícara",
    body: "Produtor, fazenda, altitude, processo e pontuação SCA em cada lote. Conte a história do café para seus clientes.",
    icon: (
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
        <path d="M14 4C9.6 4 6 7.6 6 12c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8z" stroke="var(--ink)" strokeWidth="1.4" />
        <circle cx="14" cy="12" r="2.5" fill="var(--c-vibra)" />
      </svg>
    ),
  },
];

const CoffeeShopHome = () => {
  const navigate = useNavigate();
  const [coffees, setCoffees] = useState<CoffeeProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get<CoffeeProduct[]>("/coffees?supplierType=ROASTER")
      .then(({ data }) => setCoffees(data.slice(0, 6)))
      .catch(() => setCoffees([]))
      .finally(() => setIsLoading(false));
  }, []);

  const { user, logout } = useAuth();
  const firstName = user?.name?.split(" ")[0] ?? "Usuário";
  const lastName = user?.name?.split(" ")[1] ?? "";
  const initials = ((firstName[0] ?? "") + (lastName[0] ?? "")).toUpperCase();
  const mob = useIsMobile();
  const [navOpen, setNavOpen] = useState(false);
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
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--ink)" }}>

      {/* ── Header ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(238,243,235,.92)", backdropFilter: "blur(10px)", borderBottom: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: mob ? "14px 20px" : "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          {mob ? (
            <>
              <Logo />
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <CartButton />
                <button onClick={() => setNavOpen(o => !o)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: "var(--ink)", lineHeight: 0 }}>
                  {navOpen
                    ? <svg width={20} height={20} viewBox="0 0 20 20"><path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                    : <svg width={20} height={20} viewBox="0 0 20 20"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                  }
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <Logo />
                <span style={{ width: 1, height: 20, background: "var(--ink)", opacity: 0.15 }} />
                <nav style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <Link to="/explore" className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink)", textDecoration: "none" }}>Catálogo</Link>
                  <Link to="/courses" className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", textDecoration: "none" }}>Cursos</Link>
                  <Link to="/subscriptions" className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", textDecoration: "none" }}>Assinaturas</Link>
                </nav>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <CartButton />
                <div ref={menuRef} style={{ position: "relative" }}>
                  <button onClick={() => setMenuOpen(o => !o)} style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "6px 14px 6px 6px", borderRadius: 999, border: "1px solid var(--line)", background: "var(--paper)", cursor: "pointer", fontFamily: "inherit" }}>
                    <span style={{ width: 34, height: 34, borderRadius: 999, flexShrink: 0, background: "var(--c-glamour)", color: "var(--c-leveza)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, overflow: "hidden" }}>
                      {(user as any)?.photoUrl ? <img src={(user as any).photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (initials || "?")}
                    </span>
                    <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 }}>
                      <span style={{ fontSize: 14, color: "var(--ink)", fontWeight: 500, lineHeight: 1 }}>{firstName}</span>
                      <span className="mono" style={{ fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-2)", lineHeight: 1 }}>Cafeteria</span>
                    </span>
                    <svg width={10} height={6} viewBox="0 0 10 6" style={{ transform: menuOpen ? "rotate(180deg)" : undefined, transition: "transform .15s", flexShrink: 0 }}>
                      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
                    </svg>
                  </button>
                  {menuOpen && (
                    <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", zIndex: 50, minWidth: 160, background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,.08)", padding: 6 }}>
                      <Link to="/dashboard/coffeeshop" onClick={() => setMenuOpen(false)} style={{ display: "block", padding: "10px 14px", borderRadius: 8, fontSize: 14, color: "var(--ink)", textDecoration: "none" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--bg)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >Meu painel</Link>
                      <div style={{ height: 1, background: "var(--line)", margin: "4px 0" }} />
                      <button onClick={() => { logout(); navigate("/"); setMenuOpen(false); }} style={{ display: "block", width: "100%", padding: "10px 14px", borderRadius: 8, fontSize: 14, color: "var(--ink-2)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" as const }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--bg)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >Sair</button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {mob && navOpen && (
          <div style={{ borderTop: "1px solid var(--line)", background: "rgba(238,243,235,.98)", padding: "12px 20px 24px" }}>
            <nav style={{ display: "flex", flexDirection: "column" }}>
              {([["Catálogo", "/explore"], ["Cursos", "/courses"], ["Assinaturas", "/subscriptions"]] as [string, string][]).map(([label, to]) => (
                <Link key={label} to={to} onClick={() => setNavOpen(false)} style={{ padding: "14px 4px", fontSize: 18, color: "var(--ink)", textDecoration: "none", borderBottom: "1px solid var(--line)" }}>{label}</Link>
              ))}
            </nav>
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <Link to="/dashboard/coffeeshop" style={{ flex: 1, textAlign: "center" as const, padding: "13px", fontSize: 15, color: "var(--ink)", border: "1.5px solid rgba(28,8,16,.2)", borderRadius: 999, textDecoration: "none" }}>Meu painel</Link>
              <button onClick={() => { logout(); navigate("/"); }} style={{ flex: 1, padding: "13px", fontSize: 15, background: "var(--ink)", color: "var(--c-leveza)", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit" }}>Sair</button>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section style={{ position: "relative", minHeight: mob ? "72vh" : "88vh", display: "flex", alignItems: "center", overflow: "hidden", borderBottom: "1px solid var(--ink)" }}>
        <img src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?fm=jpg&q=80&w=1920&auto=format&fit=crop&crop=center" alt="" aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
        <div style={{
          position: "absolute", inset: 0,
          background: mob
            ? "linear-gradient(to bottom, rgba(15,41,32,.6) 0%, rgba(15,41,32,.82) 60%, rgba(15,41,32,.97) 100%)"
            : "linear-gradient(105deg, rgba(15,41,32,.92) 0%, rgba(15,41,32,.84) 38%, rgba(15,41,32,.46) 68%, rgba(15,41,32,.2) 100%)",
        }} />
        <span className="script" aria-hidden="true" style={{
          position: "absolute", right: mob ? -20 : "4%", bottom: mob ? -40 : -60,
          fontSize: mob ? "clamp(180px, 55vw, 320px)" : "clamp(260px, 32vw, 520px)", lineHeight: 1,
          color: "var(--c-mostarda)", opacity: mob ? 0.1 : 0.12,
          userSelect: "none", pointerEvents: "none", zIndex: 1,
        }}>íle</span>

        <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 1320, margin: "0 auto", padding: mob ? "56px 20px 64px" : "50px 32px" }}>
          <div style={{ maxWidth: mob ? "100%" : 620 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: mob ? 20 : 28 }}>
              <span style={{ width: 24, height: 1, background: "var(--c-mostarda)", flexShrink: 0 }} />
              <span className="mono" style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(244,204,160,.65)" }}>
                Portal B2B · Cafeteria
              </span>
            </div>

            <h1 className="serif" style={{
              margin: `0 0 ${mob ? 16 : 20}px`,
              fontSize: mob ? "clamp(52px, 14vw, 88px)" : "clamp(64px, 7.5vw, 128px)",
              lineHeight: 0.9, letterSpacing: "-.035em", color: "var(--c-leveza)",
            }}>
              Olá, <span className="italic" style={{ color: "var(--c-mostarda)" }}>{firstName}.</span><br />
              Bem-vindo ao seu<br />portal de compras.
            </h1>

            <p style={{ fontSize: mob ? 15 : 17, lineHeight: 1.6, color: "rgba(244,204,160,.75)", maxWidth: 440, margin: `0 0 ${mob ? 28 : 36}px` }}>
              Cafés especiais com preços exclusivos para sua cafeteria — compre a granel, por pacote ou com assinatura recorrente.
            </p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link to="/explore" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: mob ? "14px 22px" : "16px 28px", background: "var(--c-mostarda)", color: "var(--ink)", borderRadius: 999, fontSize: mob ? 14 : 15, textDecoration: "none" }}>
                Explorar catálogo <ArrowIcon />
              </Link>
              <Link to="/subscriptions" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: mob ? "13px 20px" : "15px 24px", borderRadius: 999, fontSize: mob ? 14 : 15, color: "var(--c-leveza)", border: "1.5px solid rgba(244,204,160,.3)", textDecoration: "none" }}>
                Ver assinaturas
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Benefícios B2B ── */}
      <section style={{ borderTop: "1px solid var(--ink)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: mob ? "48px 20px" : "72px 32px" }}>
          <div style={{ marginBottom: mob ? 32 : 52 }}>
            <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)" }}>§01 · Vantagens da conta Cafeteria</div>
            <h2 className="serif" style={{ margin: "14px 0 0", fontSize: mob ? "clamp(32px, 8vw, 52px)" : "clamp(40px, 5vw, 72px)", lineHeight: 0.95, letterSpacing: "-.02em" }}>
              Tudo que sua cafeteria<br /><span className="italic" style={{ color: "var(--c-vibra)" }}>precisa, em um portal.</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(4, 1fr)", gap: mob ? 12 : 16 }}>
            {BENEFITS.map(({ n, title, sub, body, icon }) => (
              <div key={n} style={{ padding: "32px 28px", borderRadius: 16, background: "var(--paper)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: 12, background: "var(--bg-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {icon}
                </div>
                <div>
                  <div className="mono" style={{ fontSize: 11, letterSpacing: ".14em", color: "var(--ink-2)" }}>§ {n}</div>
                  <h3 className="serif" style={{ margin: "8px 0 4px", fontSize: mob ? 26 : 30, lineHeight: 1.05, letterSpacing: "-.01em" }}>{title}</h3>
                  <div className="serif italic" style={{ fontSize: 15, color: "var(--c-vibra)" }}>{sub}</div>
                </div>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "var(--ink-2)" }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cafés disponíveis ── */}
      <section style={{ borderTop: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: mob ? "48px 20px 60px" : "72px 32px 96px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: mob ? 28 : 48 }}>
            <div>
              <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)" }}>§02 · Catálogo B2B</div>
              <h2 className="serif" style={{ margin: "12px 0 0", fontSize: mob ? "clamp(32px, 8vw, 52px)" : "clamp(36px, 5vw, 72px)", lineHeight: 0.95, letterSpacing: "-.02em" }}>
                Cafés com <span className="italic" style={{ color: "var(--c-vibra)" }}>preço de cafeteria</span>
              </h2>
            </div>
            <Link to="/explore" className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", textDecoration: "none", flexShrink: 0 }}>
              Ver todos →
            </Link>
          </div>

          {isLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "64px 0" }}>
              <Loader2 size={28} className="animate-spin" style={{ color: "var(--c-vibra)" }} />
            </div>
          ) : coffees.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 0", color: "var(--ink-2)" }}>
              <div className="serif italic" style={{ fontSize: 24 }}>Nenhum café disponível no momento.</div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: mob ? "repeat(2, 1fr)" : "repeat(3, 1fr)", gap: mob ? 12 : 16 }}>
              {coffees.map((coffee, i) => (
                <CoffeeCard key={coffee.id} coffee={coffee} bg={BAG_COLORS[i % BAG_COLORS.length]} mob={mob} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Assinatura B2B CTA ── */}
      <section style={{ background: "var(--c-glamour)", color: "var(--c-leveza)", borderTop: "1px solid var(--ink)", position: "relative", overflow: "hidden" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: mob ? "72px 20px" : "100px 32px", position: "relative", zIndex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1.3fr 1fr auto", gap: mob ? 24 : 36, alignItems: "end" }}>
            <div>
              <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(244,204,160,.55)" }}>§03 · Assinatura B2B</div>
              <h3 className="serif" style={{ margin: "16px 0 0", fontSize: mob ? "clamp(32px, 8vw, 52px)" : "clamp(40px, 5vw, 72px)", lineHeight: 0.95, letterSpacing: "-.02em", color: "var(--c-leveza)" }}>
                Café fresco<br /><span className="italic" style={{ color: "var(--c-mostarda)" }}>toda semana</span>,<br />no ritmo da sua cafeteria.
              </h3>
            </div>
            <div>
              <p style={{ margin: "0 0 20px", fontSize: mob ? 15 : 16, lineHeight: 1.55, maxWidth: 320, color: "rgba(244,204,160,.8)" }}>
                Programe entregas recorrentes com desconto especial para empresas. Sem estoque parado, sem burocracia.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(["Mensal", "Anual com desconto", "Sem fidelidade"] as string[]).map(tag => (
                  <span key={tag} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 999, border: "1px solid rgba(244,204,160,.25)", fontSize: 12, color: "rgba(244,204,160,.75)" }}>
                    <span style={{ width: 5, height: 5, borderRadius: 999, background: "var(--c-mostarda)" }} />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <Link to="/subscriptions" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "16px 24px", background: "var(--c-leveza)", color: "var(--ink)", borderRadius: 999, fontSize: 15, whiteSpace: "nowrap" as const, textDecoration: "none" }}>
              Ver planos <ArrowIcon />
            </Link>
          </div>
        </div>
        <div className="script" aria-hidden="true" style={{ position: "absolute", right: -30, bottom: mob ? -60 : -80, fontSize: mob ? 200 : 360, lineHeight: 1, color: "var(--c-mostarda)", opacity: 0.2, pointerEvents: "none", letterSpacing: "-.04em" }}>
          íle
        </div>
      </section>

      {/* ── Cursos CTA ── */}
      <section style={{ borderTop: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: mob ? "48px 20px" : "72px 32px" }}>
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: mob ? 24 : 40, alignItems: "center" }}>
            <div>
              <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)" }}>§04 · Formação</div>
              <h2 className="serif" style={{ margin: "14px 0 16px", fontSize: mob ? "clamp(32px, 8vw, 52px)" : "clamp(36px, 4.5vw, 64px)", lineHeight: 0.95, letterSpacing: "-.02em" }}>
                Capacite sua<br /><span className="italic" style={{ color: "var(--c-vibra)" }}>equipe de baristas</span>.
              </h2>
              <p style={{ fontSize: mob ? 14 : 15, lineHeight: 1.6, color: "var(--ink-2)", maxWidth: 440, margin: "0 0 28px" }}>
                Cursos de análise sensorial, extração e gestão de cafeteria criados por Q-Graders e especialistas SCA. Acesso com sua conta Cafeteria.
              </p>
              <Link to="/courses" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: mob ? "13px 22px" : "15px 26px", background: "var(--ink)", color: "var(--c-leveza)", borderRadius: 999, fontSize: mob ? 14 : 15, textDecoration: "none" }}>
                Ver cursos disponíveis <ArrowIcon />
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { title: "Análise Sensorial", tag: "Q-Grader" },
                { title: "Extração Espresso", tag: "Barismo" },
                { title: "Gestão de Cafeteria", tag: "Negócios" },
                { title: "Latte Art Avançada", tag: "Técnica" },
              ].map(({ title, tag }) => (
                <div key={title} style={{ padding: "20px 18px", borderRadius: 12, background: "var(--paper)", border: "1px solid var(--line)" }}>
                  <span className="mono" style={{ display: "inline-block", fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", padding: "3px 8px", background: "var(--bg-2)", borderRadius: 999, color: "var(--c-vibra)", marginBottom: 10 }}>{tag}</span>
                  <div className="serif" style={{ fontSize: 16, lineHeight: 1.2, letterSpacing: "-.01em" }}>{title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <EcosystemSection highlight="coffeeshop" />

      {/* ── Footer ── */}
      <footer style={{ background: "var(--c-glamour)", color: "var(--c-leveza)", borderTop: "1px solid var(--ink)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: mob ? "24px 20px" : "32px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <Logo />
          <span className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", opacity: 0.65 }}>
            © 2026 Ilé Coffees · desde 1934 · CNPJ 47.221.118/0001-09
          </span>
          <div style={{ display: "flex", gap: 22 }}>
            <Link to="/explore" style={{ fontSize: 13, color: "var(--c-leveza)", opacity: 0.85, textDecoration: "none" }}>Catálogo</Link>
            <Link to="/courses" style={{ fontSize: 13, color: "var(--c-leveza)", opacity: 0.85, textDecoration: "none" }}>Cursos</Link>
            <Link to="/subscriptions" style={{ fontSize: 13, color: "var(--c-leveza)", opacity: 0.85, textDecoration: "none" }}>Assinaturas</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

function CoffeeCard({ coffee, bg, mob }: { coffee: CoffeeProduct; bg: string; mob: boolean }) {
  const [hovered, setHovered] = useState(false);

  const kgPrice = coffee.pricePerKg;
  const pkgPrice = coffee.packagePriceCoffeeshop ?? coffee.packagePrice;
  const showKg = coffee.saleType === "KG" || coffee.saleType === "BOTH";
  const showPkg = coffee.saleType === "PACKAGE" || coffee.saleType === "BOTH";

  return (
    <Link to={`/product/${coffee.id}`} style={{ textDecoration: "none" }}>
      <article style={{
        border: "1.5px solid var(--line)", borderRadius: 16, overflow: "hidden",
        background: "var(--paper)", transition: "transform .22s ease, box-shadow .22s ease",
        transform: hovered ? "translateY(-4px)" : "none",
        boxShadow: hovered ? "0 16px 40px -16px rgba(28,8,16,.2)" : "none",
      }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={{ height: mob ? 160 : 200, background: bg, position: "relative", overflow: "hidden" }}>
          {coffee.photoUrl
            ? <img src={coffee.photoUrl} alt={coffee.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="script" style={{ fontSize: 64, color: "var(--ink)", opacity: 0.15 }}>íle</span>
              </div>
          }
          {coffee.score && (
            <span className="mono" style={{ position: "absolute", top: 10, right: 10, fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", padding: "4px 9px", background: "var(--ink)", color: "var(--c-leveza)", borderRadius: 999 }}>
              {coffee.score} pts
            </span>
          )}
          {coffee.packagePriceCoffeeshop && (
            <span className="mono" style={{ position: "absolute", bottom: 10, left: 10, fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", padding: "3px 8px", background: "var(--c-vibra)", color: "var(--c-leveza)", borderRadius: 999 }}>
              Preço B2B
            </span>
          )}
        </div>
        <div style={{ padding: mob ? "12px 14px 14px" : "14px 16px 18px" }}>
          {coffee.region && (
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 6 }}>
              {coffee.region}
            </div>
          )}
          <h3 className="serif" style={{ margin: "0 0 10px", fontSize: mob ? 17 : 22, lineHeight: 1.05, letterSpacing: "-.01em", color: "var(--ink)" }}>
            {coffee.name}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {showKg && kgPrice != null && (
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span className="serif" style={{ fontSize: mob ? 17 : 21, color: "var(--c-vibra)", lineHeight: 1 }}>{fmt(kgPrice)}</span>
                <span className="mono" style={{ fontSize: 10, color: "var(--ink-2)" }}>/kg</span>
              </div>
            )}
            {showPkg && pkgPrice != null && (
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span className="serif" style={{ fontSize: mob ? 15 : 18, color: "var(--ink)", lineHeight: 1 }}>{fmt(pkgPrice)}</span>
                <span className="mono" style={{ fontSize: 10, color: "var(--ink-2)" }}>/pacote</span>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

export default CoffeeShopHome;
