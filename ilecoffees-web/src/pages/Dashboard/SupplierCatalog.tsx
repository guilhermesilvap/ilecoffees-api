import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { AddCoffeeForm, CoffeeInitialData } from "@/components/Dashboard/AddCoffeeForm";

interface Coffee {
  id: string;
  name: string;
  description: string | null;
  region: string | null;
  variety: string | null;
  process: string | null;
  saleType: "KG" | "PACKAGE";
  pricePerKg: number | null;
  packagePrice: number | null;
  score: number | null;
  photoUrl: string | null;
}

function getLine(score: number | null): "Raros" | "Extraordinários" | "Origens" {
  if (!score) return "Origens";
  if (score >= 88) return "Raros";
  if (score >= 87) return "Extraordinários";
  return "Origens";
}

const LINE_BG    = { Raros: "var(--c-glamour)", Extraordinários: "var(--c-mostarda)", Origens: "var(--paper)" };
const LINE_BG2   = { Raros: "#142318", Extraordinários: "#b8701e", Origens: "var(--bg-2)" };
const LINE_INK   = { Raros: "var(--c-leveza)", Extraordinários: "var(--ink)", Origens: "var(--ink)" };
const LINE_INK2  = { Raros: "rgba(216,234,208,.55)", Extraordinários: "var(--ink-2)", Origens: "var(--ink-2)" };
const LINE_ACCENT = { Raros: "var(--c-mostarda)", Extraordinários: "var(--c-vibra)", Origens: "var(--c-vibra)" };
const LINE_BORDER = { Raros: "rgba(255,255,255,.07)", Extraordinários: "rgba(15,35,21,.15)", Origens: "var(--line)" };

function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/dashboard/supplier" style={{ display: "inline-flex", alignItems: "baseline", gap: 6, textDecoration: "none", color: light ? "var(--c-leveza)" : "var(--ink)" }}>
      <span className="script" style={{ fontSize: 40, lineHeight: 0.8 }}>íle</span>
      <span className="serif italic" style={{ fontSize: 13, color: light ? "rgba(255,255,255,.6)" : "var(--c-vibra)" }}>coffees</span>
    </Link>
  );
}

const TABS = ["Visão Geral", "Produtos", "Estoque", "Assinaturas", "Cursos", "Pedidos", "Relatórios", "Perfil"] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, JSX.Element> = {
  "Visão Geral": <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x={3} y={3} width={7} height={7} rx={1.5}/><rect x={14} y={3} width={7} height={7} rx={1.5}/><rect x={3} y={14} width={7} height={7} rx={1.5}/><rect x={14} y={14} width={7} height={7} rx={1.5}/></svg>,
  "Produtos": <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M20 7H4a1 1 0 00-1 1v11a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1z"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>,
  "Estoque": <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M20 7H4a1 1 0 00-1 1v11a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1z"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="8" y1="12" x2="16" y2="12" strokeLinecap="round"/></svg>,
  "Assinaturas": <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
  "Cursos": <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>,
  "Pedidos": <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x={9} y={3} width={6} height={4} rx={1}/><path d="M9 12h6M9 16h4" strokeLinecap="round"/></svg>,
  "Relatórios": <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M3 3v18h18" strokeLinecap="round"/><path d="M7 16l4-4 4 4 4-4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  "Perfil": <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx={12} cy={8} r={4}/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round"/></svg>,
};

function SearchIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function CoffeeCard({ c, onRefresh }: { c: Coffee; onRefresh: () => void }) {
  const line = getLine(c.score);
  const lineBg    = LINE_BG[line];
  const lineBg2   = LINE_BG2[line];
  const lineInk   = LINE_INK[line];
  const lineInk2  = LINE_INK2[line];
  const lineAccent = LINE_ACCENT[line];
  const lineBorder = LINE_BORDER[line];
  const price = c.saleType === "KG" ? c.pricePerKg : c.packagePrice;
  const unit  = c.saleType === "KG" ? "/kg" : "· 250g";

  return (
    <article style={{
      borderRadius: 18, background: lineBg, border: `1px solid ${lineBorder}`,
      padding: 16, display: "flex", flexDirection: "column", gap: 14,
      color: lineInk, boxShadow: "0 16px 32px -28px rgba(28,8,16,.3)",
      transition: "transform .12s, box-shadow .12s",
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 28px 48px -24px rgba(28,8,16,.4)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "0 16px 32px -28px rgba(28,8,16,.3)"; }}
    >
      {/* Imagem */}
      <div style={{
        position: "relative", aspectRatio: "1 / 1.05", borderRadius: 12,
        background: lineBg2, overflow: "hidden", border: `1px solid ${lineBorder}`,
        padding: 18, display: "flex", flexDirection: "column", justifyContent: "space-between",
      }}>
        {c.photoUrl ? (
          <img src={c.photoUrl} alt={c.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span className="script" style={{ fontSize: 36, lineHeight: 0.8, color: lineAccent }}>íle</span>
              <span className="mono" style={{ fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: lineInk2 }}>
                {c.saleType === "PACKAGE" ? "250g" : "1kg"}
              </span>
            </div>
            <div>
              <div className="mono" style={{ fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color: lineAccent }}>{line}</div>
              <div className="serif" style={{ fontSize: 26, lineHeight: 0.95, letterSpacing: "-.015em", marginTop: 4, color: lineInk }}>{c.name}</div>
            </div>
          </>
        )}
        <span className="mono" style={{
          position: "absolute", top: 10, right: 10, fontSize: 9,
          letterSpacing: ".14em", textTransform: "uppercase",
          padding: "4px 8px", borderRadius: 999,
          background: "rgba(0,0,0,.35)", color: lineInk, backdropFilter: "blur(4px)",
        }}>
          {c.saleType === "KG" ? "KG" : "Pacote"}
        </span>
      </div>

      {/* Info */}
      <div>
        <div className="serif" style={{ fontSize: 22, lineHeight: 1.1, letterSpacing: "-.01em" }}>{c.name}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
          <span style={{ fontSize: 13, color: lineInk2 }}>{c.region ?? "Brasil"}</span>
          {c.score && (
            <span className="mono" style={{ fontSize: 11, letterSpacing: ".08em", padding: "3px 8px", borderRadius: 999, background: "rgba(0,0,0,.18)", color: lineAccent }}>
              {c.score} pts SCA
            </span>
          )}
        </div>
      </div>

      {c.description && (
        <p className="serif italic" style={{ margin: 0, fontSize: 14, lineHeight: 1.3, color: lineInk2 }}>{c.description}</p>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 6 }}>
        <div>
          {price != null ? (
            <>
              <div className="serif" style={{ fontSize: 26, lineHeight: 1, letterSpacing: "-.01em" }}>
                R$ {price.toFixed(2).replace(".", ",")}
              </div>
              <div className="mono" style={{ fontSize: 10, letterSpacing: ".12em", color: lineInk2, marginTop: 4, textTransform: "uppercase" }}>{unit}</div>
            </>
          ) : (
            <div style={{ fontSize: 14, color: lineInk2 }}>Consulte</div>
          )}
        </div>
        <AddCoffeeForm initialCoffee={c as unknown as CoffeeInitialData} onSuccess={onRefresh} />
      </div>
    </article>
  );
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

export default function SupplierCatalog() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const mob = useIsMobile();
  const firstName = user?.name?.split(" ")[0] ?? "Fornecedor";
  const lastName = user?.name?.split(" ")[1] ?? "";
  const initials = ((firstName[0] ?? "") + (lastName[0] ?? "")).toUpperCase();
  const [mobMenuOpen, setMobMenuOpen] = useState(false);
  const [coffees, setCoffees] = useState<Coffee[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get<Coffee[]>(`/coffees?supplierId=${user?.id}`)
      .then(r => setCoffees(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const term = q.toLowerCase();
    if (!term) return coffees;
    return coffees.filter(c =>
      c.name.toLowerCase().includes(term) ||
      (c.region ?? "").toLowerCase().includes(term) ||
      (c.variety ?? "").toLowerCase().includes(term) ||
      (c.process ?? "").toLowerCase().includes(term)
    );
  }, [coffees, q]);

  const ACTIVE_TAB: Tab = "Produtos";

  return (
    <div style={{ background: "var(--bg)", color: "var(--ink)", fontFamily: "inherit", display: "flex", height: "100vh", overflow: "hidden" }}>

      {/* Sidebar – desktop */}
      {!mob && (
        <aside style={{
          width: 220, flexShrink: 0,
          background: "var(--c-glamour)", color: "var(--c-leveza)",
          display: "flex", flexDirection: "column",
          height: "100vh", overflowY: "auto",
        }}>
          <div style={{ padding: "22px 20px 14px" }}>
            <Logo light />
          </div>
          <div style={{ height: 1, background: "rgba(255,255,255,.08)", margin: "0 16px 4px" }} />
          <div style={{ padding: "14px 16px 12px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 999, flexShrink: 0, overflow: "hidden", background: "rgba(255,255,255,.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600 }}>
              {(user as any)?.photoUrl
                ? <img src={(user as any).photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : (initials || "?")}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{firstName}</div>
              <div className="mono" style={{ fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(255,255,255,.45)", lineHeight: 1.6 }}>Torrefador</div>
            </div>
          </div>
          <div style={{ height: 1, background: "rgba(255,255,255,.08)", margin: "0 16px 10px" }} />
          <nav style={{ flex: 1, padding: "0 10px", display: "flex", flexDirection: "column", gap: 2 }}>
            {TABS.map(tab => (
              <Link key={tab} to="/dashboard/supplier" className="mono"
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                  borderRadius: 10, textDecoration: "none",
                  background: tab === ACTIVE_TAB ? "rgba(255,255,255,.13)" : "transparent",
                  color: tab === ACTIVE_TAB ? "var(--c-leveza)" : "rgba(255,255,255,.5)",
                  fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase",
                  transition: "background .12s, color .12s",
                }}
                onMouseEnter={e => { if (tab !== ACTIVE_TAB) { e.currentTarget.style.background = "rgba(255,255,255,.07)"; e.currentTarget.style.color = "rgba(255,255,255,.8)"; } }}
                onMouseLeave={e => { if (tab !== ACTIVE_TAB) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,.5)"; } }}
              >
                {TAB_ICONS[tab]}
                {tab}
              </Link>
            ))}
          </nav>
          <div style={{ padding: "4px 10px 24px" }}>
            <div style={{ height: 1, background: "rgba(255,255,255,.08)", margin: "0 6px 10px" }} />
            <Link to="/explore" className="mono"
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, fontSize: 11, color: "rgba(255,255,255,.5)", textDecoration: "none", letterSpacing: ".1em", textTransform: "uppercase" as const }}
              onMouseEnter={e => { e.currentTarget.style.color = "var(--c-leveza)"; e.currentTarget.style.background = "rgba(255,255,255,.07)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,.5)"; e.currentTarget.style.background = "transparent"; }}
            >
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Comprar café
            </Link>
            <button onClick={() => { logout(); navigate("/"); }} className="mono"
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: 0, background: "transparent", color: "rgba(255,255,255,.5)", fontSize: 11, cursor: "pointer", fontFamily: "inherit", letterSpacing: ".1em", textTransform: "uppercase" as const, textAlign: "left" as const, width: "100%" }}
              onMouseEnter={e => { e.currentTarget.style.color = "var(--c-leveza)"; e.currentTarget.style.background = "rgba(255,255,255,.07)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,.5)"; e.currentTarget.style.background = "transparent"; }}
            >
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sair
            </button>
          </div>
        </aside>
      )}

      {/* Main area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

        {/* Mobile: top bar */}
        {mob && (
          <header style={{ flexShrink: 0, background: "var(--c-glamour)", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Logo light />
            <button onClick={() => setMobMenuOpen(o => !o)} style={{ background: "none", border: 0, color: "var(--c-leveza)", cursor: "pointer", padding: 4 }}>
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </header>
        )}

        {/* Mobile: slide-out drawer */}
        {mob && mobMenuOpen && (
          <div style={{ position: "fixed", inset: 0, zIndex: 100 }} onClick={() => setMobMenuOpen(false)}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 240, background: "var(--c-glamour)", display: "flex", flexDirection: "column", padding: "60px 10px 24px" }} onClick={e => e.stopPropagation()}>
              <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                {TABS.map(tab => (
                  <Link key={tab} to="/dashboard/supplier" className="mono" onClick={() => setMobMenuOpen(false)}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 10, textDecoration: "none", background: tab === ACTIVE_TAB ? "rgba(255,255,255,.13)" : "transparent", color: tab === ACTIVE_TAB ? "var(--c-leveza)" : "rgba(255,255,255,.5)", fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase" as const }}>
                    {TAB_ICONS[tab]}
                    {tab}
                  </Link>
                ))}
              </nav>
              <div style={{ height: 1, background: "rgba(255,255,255,.08)", margin: "8px 6px" }} />
              <button onClick={() => { logout(); navigate("/"); }} className="mono"
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, border: 0, background: "transparent", color: "rgba(255,255,255,.5)", fontSize: 12, cursor: "pointer", fontFamily: "inherit", textAlign: "left" as const, width: "100%" }}>
                <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Sair
              </button>
            </div>
          </div>
        )}

        {/* Desktop: breadcrumb top bar */}
        {!mob && (
          <div style={{ flexShrink: 0, borderBottom: "1px solid var(--line)", padding: "0 36px", height: 50, display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--paper)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span className="mono" style={{ fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--ink-2)" }}>Torrefador</span>
              <span style={{ color: "var(--ink-2)", fontSize: 12 }}>›</span>
              <span className="mono" style={{ fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--ink)" }}>Meus Produtos</span>
            </div>
            <span className="mono" style={{ fontSize: 10, letterSpacing: ".12em", color: "var(--ink-2)", textTransform: "capitalize" }}>
              {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
            </span>
          </div>
        )}

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto" }}>

          {/* Page header */}
          <section style={{ borderBottom: "1px solid var(--line)" }}>
            <div style={{ padding: mob ? "32px 16px 24px" : "40px 36px 28px" }}>
              <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)" }}>
                <span style={{ color: "var(--c-vibra)" }}>§</span> &nbsp; Pré-visualização do catálogo
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, marginTop: 14, flexWrap: "wrap" }}>
                <h1 className="serif" style={{ margin: 0, fontSize: "clamp(40px, 5vw, 72px)", lineHeight: 0.9, letterSpacing: "-.03em" }}>
                  Seus <span className="italic" style={{ color: "var(--c-vibra)" }}>cafés</span>.
                </h1>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderRadius: 999, background: "var(--paper)", border: "1px solid var(--line)", color: "var(--ink-2)", maxWidth: 360, width: "100%" }}>
                  <SearchIcon />
                  <input
                    type="text"
                    placeholder="Buscar por nome, região ou processo…"
                    value={q}
                    onChange={e => setQ(e.target.value)}
                    style={{ flex: 1, border: 0, outline: "none", background: "transparent", fontSize: 14, fontFamily: "inherit", color: "inherit" }}
                  />
                </div>
              </div>
              <p style={{ marginTop: 12, fontSize: 14, color: "var(--ink-2)" }}>
                É assim que seus produtos aparecem para os clientes. Clique em <strong>Editar</strong> para ajustar qualquer produto.
              </p>
            </div>
          </section>

          {/* Grid */}
          <div style={{ padding: mob ? "24px 16px 60px" : "32px 36px 80px" }}>
            {loading ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} style={{ borderRadius: 18, background: "var(--paper)", border: "1px solid var(--line)", aspectRatio: "1 / 1.6", opacity: 0.5 }} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0", color: "var(--ink-2)" }}>
                <div className="serif" style={{ fontSize: 36 }}>Nenhum produto encontrado.</div>
                <p style={{ marginTop: 8, fontSize: 14 }}>
                  {q ? "Tente outro termo de busca." : "Adicione seus primeiros cafés no painel."}
                </p>
                {!q && (
                  <Link to="/dashboard/supplier" style={{ display: "inline-block", marginTop: 20, padding: "12px 24px", background: "var(--ink)", color: "var(--c-leveza)", borderRadius: 999, fontSize: 14, textDecoration: "none" }}>
                    Ir para o painel
                  </Link>
                )}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
                {filtered.map(c => <CoffeeCard key={c.id} c={c} onRefresh={load} />)}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
