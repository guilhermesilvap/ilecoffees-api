import { useEffect, useState, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useMobile } from "@/contexts/MobileContext";

interface Coffee {
  id: string;
  name: string;
  photoUrl: string | null;
}

interface Plan {
  id: string;
  name: string;
  description: string | null;
  monthlyPrice: number;
  annualPrice: number;
  coffeeshopMonthlyPrice: number | null;
  coffeeshopAnnualPrice: number | null;
  quantity: number;
  coffees: Coffee[];
  supplier?: { id: string; name: string; email: string };
}

type BillingCycle = "MONTHLY" | "ANNUAL";

const BAND_COLORS = [
  "var(--c-mostarda)", "var(--c-glamour)", "var(--c-barro)", "var(--c-vibra)", "var(--c-leveza)",
];
const BAND_INK = [
  "var(--ink)", "var(--c-leveza)", "var(--c-leveza)", "var(--c-leveza)", "var(--ink)",
];

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}
function effectivePrices(plan: Plan, role: string) {
  const monthly = role === "COFFEESHOP" ? (plan.coffeeshopMonthlyPrice ?? plan.monthlyPrice) : plan.monthlyPrice;
  const annual  = role === "COFFEESHOP" ? (plan.coffeeshopAnnualPrice  ?? plan.annualPrice)  : plan.annualPrice;
  return { monthly, annual };
}
function savings(plan: Plan, role: string) {
  const { monthly, annual } = effectivePrices(plan, role);
  const annual12 = monthly * 12;
  if (annual12 <= 0 || annual >= annual12) return 0;
  return Math.round(((annual12 - annual) / annual12) * 100);
}

/* ── Icons ── */
function CheckIcon({ size = 14, color = "var(--success)" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path d="M3 7.5L6 10.5L11 4.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ArrowIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2.5 7h9M7.8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function Chevron({ open }: { open: boolean }) {
  return (
    <svg width={10} height={6} viewBox="0 0 10 6"
      style={{ transform: `rotate(${open ? 180 : 0}deg)`, transition: "transform .15s", flexShrink: 0 }}>
      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
    </svg>
  );
}
function PackageIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M10 2l8 4v8l-8 4-8-4V6l8-4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M10 2v12M2 6l8 4 8-4" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
function CoffeeIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M4 8h12v7a2 2 0 01-2 2H6a2 2 0 01-2-2V8z" stroke="currentColor" strokeWidth="1.3" />
      <path d="M16 10h2a2 2 0 010 4h-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M7 5c0-2 2-2 2-4M11 5c0-2 2-2 2-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
function StarIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M10 2l2.4 5 5.6.8-4 3.9.9 5.5L10 14.5l-4.9 2.7.9-5.5-4-3.9 5.6-.8z"
        fill="var(--c-mostarda)" stroke="var(--c-mostarda)" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Logo ── */
function Logo() {
  return (
    <Link to="/" style={{ display: "inline-flex", alignItems: "baseline", gap: 6, textDecoration: "none", color: "inherit" }}>
      <span className="script" style={{ fontSize: 36, lineHeight: 0.75 }}>íle</span>
      <span className="serif italic" style={{ fontSize: 13, lineHeight: 1, color: "var(--c-vibra)" }}>coffees</span>
    </Link>
  );
}

/* ── Header ── */
function Header({ mob }: { mob: boolean }) {
  const { isAuthenticated, user, type, supplierType, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  const userName = user?.name ?? "";
  const accountType = (user as any)?.accountType ?? "CUSTOMER";
  const dashboardPath = type === "SUPPLIER" ? (supplierType === "PRODUCER" ? "/dashboard/producer" : "/dashboard/supplier") : type === "ADMIN" ? "/dashboard/admin" : accountType === "COFFEESHOP" ? "/dashboard/coffeeshop" : "/dashboard/customer";

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 30,
      background: "rgba(238,243,235,.92)", backdropFilter: "blur(10px)",
      borderBottom: "1px solid var(--line)",
    }}>
      <div style={{
        maxWidth: 1320, margin: "0 auto", padding: mob ? "12px 16px" : "16px 32px",
        display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: mob ? 12 : 24,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Logo />
          {!mob && (
            <>
              <span style={{ width: 1, height: 22, background: "var(--ink)", opacity: 0.2 }} />
              {accountType === "COFFEESHOP" ? (
                <Link to="/dashboard/coffeeshop" style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, color: "var(--ink-2)", textDecoration: "none" }}>
                  <span style={{ display: "inline-flex", transform: "rotate(180deg)" }}><ArrowIcon size={12} /></span> Voltar ao meu painel
                </Link>
              ) : (
                <nav style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <NavLink to="/explore" className="mono" style={({ isActive }) => ({ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" as const, color: isActive ? "var(--ink)" : "var(--ink-2)", textDecoration: "none", borderBottom: isActive ? "1.5px solid var(--ink)" : "1.5px solid transparent", paddingBottom: 1 })}>Catálogo</NavLink>
                  <NavLink to="/courses" className="mono" style={({ isActive }) => ({ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" as const, color: isActive ? "var(--ink)" : "var(--ink-2)", textDecoration: "none", borderBottom: isActive ? "1.5px solid var(--ink)" : "1.5px solid transparent", paddingBottom: 1 })}>Cursos</NavLink>
                  <NavLink to="/subscriptions" className="mono" style={({ isActive }) => ({ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" as const, color: isActive ? "var(--ink)" : "var(--ink-2)", textDecoration: "none", borderBottom: isActive ? "1.5px solid var(--ink)" : "1.5px solid transparent", paddingBottom: 1 })}>Assinaturas</NavLink>
                </nav>
              )}
            </>
          )}
        </div>

        <div />

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {isAuthenticated ? (
            <div ref={menuRef} style={{ position: "relative" }}>
              <button onClick={() => setMenuOpen(o => !o)} style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "6px 14px 6px 6px", borderRadius: 999,
                border: "1px solid var(--line)", background: "var(--paper)",
                cursor: "pointer", fontFamily: "inherit",
              }}>
                <span style={{
                  width: 34, height: 34, borderRadius: 999, flexShrink: 0, overflow: "hidden",
                  background: type === "SUPPLIER" ? "var(--c-glamour)" : type === "ADMIN" ? "var(--c-vibra)" : accountType === "COFFEESHOP" ? "var(--c-glamour)" : "var(--c-mostarda)",
                  color: (type === "SUPPLIER" || type === "ADMIN" || accountType === "COFFEESHOP") ? "var(--c-leveza)" : "var(--ink)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 600, fontSize: 12, letterSpacing: ".02em",
                }}>
                  {(user as any)?.photoUrl
                    ? <img src={(user as any).photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : getInitials(userName)}
                </span>
                <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 }}>
                  <span style={{ fontSize: 14, color: "var(--ink)", fontWeight: 500, lineHeight: 1 }}>{userName.split(" ")[0]}</span>
                  <span className="mono" style={{ fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-2)", lineHeight: 1 }}>
                    {type === "SUPPLIER" ? (supplierType === "PRODUCER" ? "Produtor" : "Torrefador") : type === "ADMIN" ? "Admin" : accountType === "COFFEESHOP" ? "Cafeteria" : "Cliente"}
                  </span>
                </span>
                <Chevron open={menuOpen} />
              </button>
              {menuOpen && (
                <div style={{
                  position: "absolute", right: 0, top: "calc(100% + 8px)", zIndex: 50,
                  minWidth: 160, background: "var(--paper)",
                  border: "1px solid var(--line)", borderRadius: 12,
                  boxShadow: "0 8px 24px rgba(0,0,0,.08)", padding: 6,
                }}>
                  <Link to={dashboardPath} onClick={() => setMenuOpen(false)} style={{
                    display: "block", padding: "10px 14px", borderRadius: 8, fontSize: 14,
                    color: "var(--ink)", textDecoration: "none",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--bg)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    Meu painel
                  </Link>
                  <div style={{ height: 1, background: "var(--line)", margin: "4px 0" }} />
                  <button onClick={() => { logout(); navigate("/"); setMenuOpen(false); }} style={{
                    display: "block", width: "100%", padding: "10px 14px", borderRadius: 8, fontSize: 14,
                    color: "var(--ink-2)", background: "none", border: "none",
                    cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--bg)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" style={{ padding: "9px 16px", fontSize: 14, color: "var(--ink-2)", textDecoration: "none" }}>Entrar</Link>
              <Link to="/register/customer" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "10px 14px", borderRadius: 999, border: "1px solid var(--ink)", fontSize: 13,
                textDecoration: "none", color: "var(--ink)",
              }}>
                Criar conta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

/* ── Hero ── */
function Hero({ planCount, mob }: { planCount: number; mob: boolean }) {
  const stats = [
    [String(planCount || "—"), "planos disponíveis"],
    ["+12", "fornecedores ativos"],
    ["100%", "grãos certificados"],
    ["Mensal", "ou anual"],
  ];
  const cols = mob ? 2 : 4;
  return (
    <section style={{ borderBottom: "1px solid var(--line)" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: mob ? "28px 16px 20px" : "40px 32px 28px" }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)" }}>
          <span style={{ color: "var(--c-vibra)" }}>§</span>&nbsp; Assinaturas · íle coffees
        </div>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1.4fr 1fr", gap: mob ? 14 : 36, alignItems: "flex-end", marginTop: 14 }}>
          <h1 className="serif" style={{ margin: 0, fontSize: mob ? "clamp(36px, 10vw, 56px)" : "clamp(44px, 5vw, 76px)", lineHeight: 0.9, letterSpacing: "-.03em" }}>
            Café especial<br />
            <span className="italic" style={{ color: "var(--c-vibra)" }}>em casa</span>,<br />
            todo mês.
          </h1>
          <p style={{ fontSize: mob ? 14 : 16, lineHeight: 1.55, color: "var(--ink-2)", maxWidth: 420, margin: 0 }}>
            Assine um plano de um dos nossos fornecedores certificados e receba café
            fresco com a moagem que preferir — direto da origem para o seu coador.
          </p>
        </div>

        <div style={{
          marginTop: mob ? 20 : 28, display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 0,
          border: "1px solid var(--ink)", borderRadius: 14, overflow: "hidden",
          background: "var(--paper)",
        }}>
          {stats.map(([v, k], i) => (
            <div key={k} style={{
              padding: mob ? "12px 14px" : "14px 20px",
              borderRight: (i % cols !== cols - 1) ? "1px solid var(--line)" : undefined,
              borderTop: i >= cols ? "1px solid var(--line)" : undefined,
              background: i === 0 ? "var(--c-mostarda)" : "transparent",
            }}>
              <div className="serif" style={{ fontSize: mob ? 26 : 34, lineHeight: 0.95, letterSpacing: "-.03em" }}>{v}</div>
              <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginTop: 6 }}>{k}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── BillingToggle ── */
function BillingToggle({ value, onChange, plans, role }: {
  value: BillingCycle;
  onChange: (v: BillingCycle) => void;
  plans: Plan[];
  role: string;
}) {
  const maxSavings = Math.max(...plans.map(p => savings(p, role)), 0);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <div style={{
        display: "inline-flex", border: "1px solid var(--line)", borderRadius: 999,
        background: "var(--paper)", padding: 3, gap: 3,
      }}>
        {(["MONTHLY", "ANNUAL"] as BillingCycle[]).map(cycle => {
          const on = value === cycle;
          return (
            <button key={cycle} onClick={() => onChange(cycle)} style={{
              padding: "8px 18px", borderRadius: 999, fontSize: 13,
              background: on ? "var(--ink)" : "transparent",
              color: on ? "var(--c-leveza)" : "var(--ink-2)",
              border: "none", cursor: "pointer", fontFamily: "inherit",
              transition: "background .12s, color .12s",
            }}>
              {cycle === "MONTHLY" ? "Mensal" : "Anual"}
            </button>
          );
        })}
      </div>
      {value === "ANNUAL" && maxSavings > 0 && (
        <span className="mono" style={{
          fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase",
          padding: "6px 12px", borderRadius: 999,
          background: "rgba(46,114,68,.14)", color: "var(--success)",
          border: "1px solid var(--success)",
        }}>
          economize até {maxSavings}%
        </span>
      )}
    </div>
  );
}

/* ── PlanCard ── */
const FALLBACK_GRADIENTS = [
  "linear-gradient(140deg, #0f2315 0%, #3d2b18 60%, #e58a2a 100%)",
  "linear-gradient(140deg, #0f2920 0%, #1c4a30 60%, #e58a2a 100%)",
  "linear-gradient(140deg, #3d2b18 0%, #0f2315 55%, #e7402c 100%)",
  "linear-gradient(140deg, #e7402c 0%, #0f2315 70%, #0f2920 100%)",
  "linear-gradient(140deg, #e58a2a 0%, #3d2b18 60%, #0f2315 100%)",
];

function PlanCardImage({ plan, idx }: { plan: Plan; idx: number }) {
  const photos = plan.coffees.map(c => c.photoUrl).filter(Boolean) as string[];

  if (photos.length === 0) {
    return (
      <div style={{ position: "relative", height: 200, background: FALLBACK_GRADIENTS[idx % FALLBACK_GRADIENTS.length], flexShrink: 0, overflow: "hidden" }}>
        {/* decorative coffee ring */}
        <div style={{ position: "absolute", right: -32, top: -32, width: 200, height: 200, borderRadius: 999, border: "40px solid rgba(255,255,255,.06)" }} />
        <div style={{ position: "absolute", right: 28, bottom: 20 }}>
          <span className="script" style={{ fontSize: 80, color: "rgba(255,255,255,.10)", lineHeight: 1 }}>íle</span>
        </div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(28,8,16,.55) 0%, transparent 60%)" }} />
      </div>
    );
  }

  if (photos.length === 1) {
    return (
      <div style={{ position: "relative", height: 200, flexShrink: 0, overflow: "hidden" }}>
        <img src={photos[0]} alt="" aria-hidden style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(28,8,16,.6) 0%, rgba(28,8,16,.1) 55%, transparent 100%)" }} />
      </div>
    );
  }

  /* 2-3 photos: mosaic */
  const shown = photos.slice(0, 3);
  return (
    <div style={{ position: "relative", height: 200, flexShrink: 0, overflow: "hidden", display: "grid", gridTemplateColumns: shown.length === 2 ? "1fr 1fr" : "1fr 1fr 1fr" }}>
      {shown.map((src, i) => (
        <div key={i} style={{ position: "relative", overflow: "hidden", borderRight: i < shown.length - 1 ? "2px solid var(--paper)" : undefined }}>
          <img src={src} alt="" aria-hidden style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
        </div>
      ))}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(28,8,16,.62) 0%, rgba(28,8,16,.08) 55%, transparent 100%)" }} />
    </div>
  );
}

function PlanCard({ plan, idx, billing, role }: {
  plan: Plan;
  idx: number;
  billing: BillingCycle;
  role: string;
}) {
  const navigate = useNavigate();
  const { monthly, annual } = effectivePrices(plan, role);
  const price   = billing === "MONTHLY" ? monthly : annual;
  const savePct = savings(plan, role);
  const annual12 = monthly * 12;
  const savedAmt = annual12 - annual;
  const hasPhotos = plan.coffees.some(c => c.photoUrl);

  return (
    <article style={{
      borderRadius: 20, border: "1px solid var(--line)", background: "var(--paper)",
      display: "flex", flexDirection: "column", overflow: "hidden",
      boxShadow: "0 16px 40px -28px rgba(28,8,16,.2)",
      transition: "transform .18s, box-shadow .18s",
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
      (e.currentTarget as HTMLElement).style.boxShadow = "0 28px 52px -24px rgba(28,8,16,.30)";
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLElement).style.transform = "";
      (e.currentTarget as HTMLElement).style.boxShadow = "0 16px 40px -28px rgba(28,8,16,.2)";
    }}>

      {/* Image / visual header */}
      <div style={{ position: "relative" }}>
        <PlanCardImage plan={plan} idx={idx} />

        {/* Supplier + plan name overlay at bottom of image */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "14px 20px" }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(244,204,160,.75)", marginBottom: 4 }}>
            {plan.supplier?.name ?? "íle coffees"}
          </div>
          <div className="serif" style={{ fontSize: 26, lineHeight: 0.95, letterSpacing: "-.02em", color: "#fff" }}>
            {plan.name}
          </div>
        </div>

        {/* Savings badge */}
        {billing === "ANNUAL" && savePct > 0 && (
          <div style={{ position: "absolute", top: 14, right: 14 }}>
            <span className="mono" style={{
              fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase",
              padding: "5px 11px", borderRadius: 999,
              background: "var(--success)", color: "#fff",
            }}>
              -{savePct}%
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "18px 20px 20px", display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
        {plan.description && (
          <p className="serif italic" style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: "var(--ink-2)" }}>
            "{plan.description}"
          </p>
        )}

        {/* Coffees */}
        {plan.coffees.length > 0 && (
          <div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 8 }}>
              {plan.coffees.length} café{plan.coffees.length !== 1 ? "s" : ""} incluso{plan.coffees.length !== 1 ? "s" : ""}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {plan.coffees.map(c => (
                <span key={c.id} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, padding: "4px 10px", borderRadius: 999, background: "var(--bg-2)", border: "1px solid var(--line)", color: "var(--ink)" }}>
                  {c.photoUrl && (
                    <img src={c.photoUrl} alt="" aria-hidden style={{ width: 16, height: 16, borderRadius: 999, objectFit: "cover", flexShrink: 0 }} />
                  )}
                  {c.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Quantity */}
        {plan.quantity > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--ink-2)" }}>
            <PackageIcon size={14} />
            <span>{plan.quantity} envio{plan.quantity !== 1 ? "s" : ""} por ciclo</span>
          </div>
        )}

        {/* Price */}
        <div style={{ marginTop: "auto", paddingTop: 14, borderTop: "1px solid var(--line)" }}>
          {role === "COFFEESHOP" && (billing === "MONTHLY" ? plan.coffeeshopMonthlyPrice : plan.coffeeshopAnnualPrice) != null && (
            <div className="mono" style={{ fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--c-glamour)", marginBottom: 6 }}>
              Preço B2B · Cafeteria
            </div>
          )}
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
            <span className="serif" style={{ fontSize: 40, lineHeight: 0.95, letterSpacing: "-.025em" }}>
              {fmt(price)}
            </span>
            <span style={{ fontSize: 13, color: "var(--ink-2)" }}>
              /{billing === "MONTHLY" ? "mês" : "ano"}
            </span>
          </div>
          {billing === "ANNUAL" && savePct > 0 && (
            <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <CheckIcon size={12} />
              <span>Economize <b style={{ color: "var(--success)" }}>{fmt(savedAmt)}</b> no ano</span>
            </div>
          )}
          {billing === "MONTHLY" && annual > 0 && (
            <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 4 }}>
              ou {fmt(annual)}/ano — economize {savePct}%
            </div>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate(`/subscriptions/${plan.id}`)}
          style={{
            width: "100%", padding: "13px 0", borderRadius: 12,
            background: "var(--ink)", color: "var(--c-leveza)",
            border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer",
            fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "opacity .12s",
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >
          <span>Ver plano</span><ArrowIcon size={12} />
        </button>
      </div>
    </article>
  );
}

/* ── SkeletonCard ── */
function SkeletonCard() {
  return (
    <div style={{ borderRadius: 20, background: "var(--paper)", border: "1px solid var(--line)", overflow: "hidden" }}>
      <div style={{ height: 96, background: "linear-gradient(90deg,var(--bg-2) 0%,var(--line) 50%,var(--bg-2) 100%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s ease-in-out infinite" }} />
      <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 12 }}>
        {[120, 90, 60, 44].map((w, i) => (
          <div key={i} style={{ height: i === 3 ? 44 : 14, width: `${w}%`, maxWidth: "100%", borderRadius: 8, background: "linear-gradient(90deg,var(--bg-2) 0%,var(--line) 50%,var(--bg-2) 100%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s ease-in-out infinite" }} />
        ))}
      </div>
    </div>
  );
}

/* ── HowItWorks ── */
function HowItWorks({ mob }: { mob: boolean }) {
  const steps = [
    { n: "01", icon: <CoffeeIcon size={28} />, title: "Escolha o plano", body: "Navegue pelos planos disponíveis e filtre por fornecedor, preço e tipo de café." },
    { n: "02", icon: <StarIcon size={28} />, title: "Personalize", body: "Selecione o ciclo de cobrança — mensal ou anual. No anual você economiza até 20%." },
    { n: "03", icon: <PackageIcon size={28} />, title: "Receba em casa", body: "Seu café chega fresquinho, torrado no ponto certo, com nota da origem e instruções de preparo." },
  ];
  return (
    <section style={{ borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", background: "var(--c-barro)", color: "var(--c-leveza)" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: mob ? "48px 16px" : "72px 32px" }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--c-mostarda)" }}>
          Como funciona
        </div>
        <h2 className="serif" style={{ margin: mob ? "14px 0 36px" : "14px 0 56px", fontSize: mob ? "clamp(32px, 8vw, 52px)" : "clamp(40px, 5vw, 72px)", lineHeight: 0.92, letterSpacing: "-.025em" }}>
          Simples como um<br /><span className="italic" style={{ color: "var(--c-mostarda)" }}>bom coado</span>.
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(3, 1fr)", gap: mob ? 16 : 2 }}>
          {steps.map((s, i) => (
            <div key={s.n} style={{
              padding: mob ? "24px 22px" : "32px 30px",
              background: i === 1 ? "rgba(255,255,255,.06)" : "transparent",
              borderRadius: 16, border: i === 1 ? "1px solid rgba(255,255,255,.12)" : (mob ? "1px solid rgba(255,255,255,.08)" : "none"),
            }}>
              <div style={{ color: "var(--c-mostarda)", marginBottom: 16 }}>{s.icon}</div>
              <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--c-mostarda)", marginBottom: 10 }}>
                Passo {s.n}
              </div>
              <div className="serif" style={{ fontSize: mob ? 22 : 28, lineHeight: 1.05, letterSpacing: "-.01em", marginBottom: 10 }}>
                {s.title}
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.55, color: "rgba(244,230,204,.75)", margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── EmptyState ── */
function EmptyState() {
  return (
    <div style={{
      textAlign: "center", padding: "80px 32px",
      background: "var(--paper)", border: "1px dashed var(--line)", borderRadius: 18,
    }}>
      <div className="serif" style={{ fontSize: 44, lineHeight: 1.05, letterSpacing: "-.02em" }}>
        Nenhum plano <span className="italic" style={{ color: "var(--c-vibra)" }}>disponível</span>.
      </div>
      <p style={{ fontSize: 15, color: "var(--ink-2)", marginTop: 12, maxWidth: 400, marginInline: "auto", lineHeight: 1.55 }}>
        Ainda não há planos de assinatura cadastrados. Volte em breve ou explore nosso catálogo de cafés.
      </p>
      <Link to="/explore" style={{
        display: "inline-flex", marginTop: 24, padding: "12px 24px",
        background: "var(--ink)", color: "var(--c-leveza)", borderRadius: 999,
        fontSize: 14, textDecoration: "none",
      }}>
        Explorar cafés <ArrowIcon size={12} />
      </Link>
    </div>
  );
}

/* ── Page ── */
export default function SubscriptionsPage() {
  const { isAuthenticated, type, user } = useAuth();
  const role = (user as any)?.accountType === "COFFEESHOP" ? "COFFEESHOP" : "CUSTOMER";
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billing, setBilling] = useState<BillingCycle>("MONTHLY");
  const mob = useMobile();

  useEffect(() => {
    api.get("/subscriptions")
      .then(r => setPlans(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--ink)" }}>
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
      <Header mob={mob} />
      <Hero planCount={plans.length} mob={mob} />

      <main style={{ maxWidth: 1320, margin: "0 auto", padding: mob ? "20px 16px 60px" : "32px 32px 80px" }}>
        {/* Section header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-end",
          marginBottom: mob ? 20 : 32, gap: 24, flexWrap: "wrap",
        }}>
          <div>
            <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 10 }}>
              <span style={{ color: "var(--c-vibra)" }}>§</span>&nbsp; Escolha seu plano
            </div>
            <h2 className="serif" style={{ margin: 0, fontSize: mob ? "clamp(28px, 7vw, 44px)" : "clamp(36px, 4vw, 56px)", lineHeight: 1.0, letterSpacing: "-.015em" }}>
              {loading ? "—" : plans.length} plano{plans.length !== 1 ? "s" : ""} disponíve{plans.length !== 1 ? "is" : "l"}
            </h2>
          </div>
          {!loading && plans.length > 0 && (
            <BillingToggle value={billing} onChange={setBilling} plans={plans} role={role} />
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(3, 1fr)", gap: 20 }}>
            {Array.from({ length: mob ? 3 : 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : plans.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
            {plans.map((plan, i) => (
              <PlanCard key={plan.id} plan={plan} idx={i} billing={billing} role={role} />
            ))}
          </div>
        )}
      </main>

      <HowItWorks mob={mob} />

      <footer style={{ borderTop: "1px solid var(--line)", padding: "24px 32px", fontSize: 12, color: "var(--ink-2)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <span className="mono" style={{ letterSpacing: ".12em", textTransform: "uppercase" }}>
            © 2026 Ilé Coffees · desde 1934
          </span>
          <div style={{ display: "flex", gap: 18 }}>
            <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
            <Link to="/explore" style={{ color: "inherit", textDecoration: "none" }}>Cafés</Link>
            <Link to="/courses" style={{ color: "inherit", textDecoration: "none" }}>Cursos</Link>
            <Link to="/register/supplier" style={{ color: "inherit", textDecoration: "none" }}>Portal B2B</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
