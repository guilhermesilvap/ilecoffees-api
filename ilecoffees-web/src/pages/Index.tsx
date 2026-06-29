import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { Link, NavLink, useSearchParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useMobile } from "@/contexts/MobileContext";
import { Cart } from "@/components/Cart/Cart";

interface Coffee {
  id: string;
  name: string;
  description: string | null;
  region: string | null;
  saleType: "KG" | "PACKAGE" | "BOTH";
  pricePerKg: number | null;
  packagePrice: number | null;
  packagePriceCoffeeshop: number | null;
  score: number | null;
  photoUrl: string | null;
  supplier?: { id: string; name: string; photoUrl: string | null; supplierType: string } | null;
}

interface Filters {
  q: string;
  regions: string[];
  sale: "ALL" | "PACKAGE" | "KG";
  minPrice: number;
  maxPrice: number;
}

function getLine(score: number | null): "Raros" | "Extraordinários" | "Origens" {
  if (!score) return "Origens";
  if (score >= 88) return "Raros";
  if (score >= 87) return "Extraordinários";
  return "Origens";
}

const LINE_BG: Record<string, string> = {
  Raros: "var(--c-glamour)",
  Extraordinários: "var(--c-mostarda)",
  Origens: "var(--paper)",
};
const LINE_BG2: Record<string, string> = {
  Raros: "#142318",
  Extraordinários: "#b8701e",
  Origens: "var(--bg-2)",
};
const LINE_INK: Record<string, string> = {
  Raros: "var(--c-leveza)",
  Extraordinários: "var(--ink)",
  Origens: "var(--ink)",
};
const LINE_INK2: Record<string, string> = {
  Raros: "rgba(216,234,208,.55)",
  Extraordinários: "var(--ink-2)",
  Origens: "var(--ink-2)",
};
const LINE_ACCENT: Record<string, string> = {
  Raros: "var(--c-mostarda)",
  Extraordinários: "var(--c-vibra)",
  Origens: "var(--c-vibra)",
};
const LINE_BORDER: Record<string, string> = {
  Raros: "rgba(255,255,255,.07)",
  Extraordinários: "rgba(15,35,21,.15)",
  Origens: "var(--line)",
};

/* ===== Icons ===== */
function SearchIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
function CartIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M2 3h2l1.6 8.4a1 1 0 001 .8h5.6a1 1 0 001-.78L14.6 6.5H4.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="6.5" cy="14" r="1" fill="currentColor" />
      <circle cx="11.5" cy="14" r="1" fill="currentColor" />
    </svg>
  );
}
function CheckIcon({ size = 12, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path d="M3 7.5L6 10.5L11 4.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function XIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
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

/* ===== Logo ===== */
function Logo() {
  return (
    <Link to="/" style={{ display: "inline-flex", alignItems: "baseline", gap: 6 }}>
      <span className="script" style={{ fontSize: 36, lineHeight: 0.75, color: "currentColor" }}>íle</span>
      <span className="serif italic" style={{ fontSize: 13, lineHeight: 1, color: "var(--c-vibra)" }}>coffees</span>
    </Link>
  );
}

const SUPPLIER_TABS = ["Visão Geral", "Produtos", "Estoque", "Assinaturas", "Cursos", "Pedidos", "Relatórios", "Perfil"] as const;
type SupplierTab = typeof SUPPLIER_TABS[number];
const SUPPLIER_TAB_ICONS: Record<SupplierTab, JSX.Element> = {
  "Visão Geral": <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x={3} y={3} width={7} height={7} rx={1.5}/><rect x={14} y={3} width={7} height={7} rx={1.5}/><rect x={3} y={14} width={7} height={7} rx={1.5}/><rect x={14} y={14} width={7} height={7} rx={1.5}/></svg>,
  "Produtos": <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M20 7H4a1 1 0 00-1 1v11a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1z"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>,
  "Estoque": <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M20 7H4a1 1 0 00-1 1v11a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1z"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="8" y1="12" x2="16" y2="12" strokeLinecap="round"/></svg>,
  "Assinaturas": <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
  "Cursos": <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>,
  "Pedidos": <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x={9} y={3} width={6} height={4} rx={1}/><path d="M9 12h6M9 16h4" strokeLinecap="round"/></svg>,
  "Relatórios": <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M3 3v18h18" strokeLinecap="round"/><path d="M7 16l4-4 4 4 4-4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  "Perfil": <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx={12} cy={8} r={4}/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round"/></svg>,
};

/* ===== Header ===== */
function UserMenu({ dashboardPath, mob }: { dashboardPath: string; mob: boolean }) {
  const { user, type, supplierType, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const firstName = user?.name?.split(" ")[0] ?? "Usuário";
  const lastName = user?.name?.split(" ")[1] ?? "";
  const initials = ((firstName[0] ?? "") + (lastName[0] ?? "")).toUpperCase();
  const accountType = (user as any)?.accountType ?? "CUSTOMER";

  const roleLabel =
    type === "SUPPLIER" ? (supplierType === "PRODUCER" ? "Produtor" : "Torrefador")
    : type === "ADMIN" ? "Admin"
    : accountType === "COFFEESHOP" ? "Cafeteria"
    : "Cliente";

  const avatarBg =
    type === "SUPPLIER" ? "var(--c-glamour)"
    : type === "ADMIN" ? "var(--c-vibra)"
    : accountType === "COFFEESHOP" ? "var(--c-glamour)"
    : "var(--c-mostarda)";

  const avatarColor =
    (type === "SUPPLIER" || type === "ADMIN" || accountType === "COFFEESHOP")
      ? "var(--c-leveza)" : "var(--ink)";

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const avatarSpan = (
    <span style={{
      width: 34, height: 34, borderRadius: 999, flexShrink: 0, overflow: "hidden",
      background: avatarBg, color: avatarColor,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 12, fontWeight: 600, letterSpacing: ".02em",
    }}>
      {(user as any)?.photoUrl
        ? <img src={(user as any).photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : (initials || "?")}
    </span>
  );

  if (mob) {
    return (
      <Link
        to={dashboardPath}
        style={{
          display: "inline-flex", alignItems: "center",
          padding: "3px", borderRadius: 999,
          border: "1px solid var(--line)", background: "var(--paper)",
          textDecoration: "none",
        }}
        title="Meu painel"
      >
        {avatarSpan}
      </Link>
    );
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          padding: "6px 14px 6px 6px", borderRadius: 999,
          border: "1px solid var(--line)", background: "var(--paper)",
          cursor: "pointer", fontFamily: "inherit",
        }}
      >
        {avatarSpan}
        <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 }}>
          <span style={{ fontSize: 14, color: "var(--ink)", fontWeight: 500, lineHeight: 1 }}>{firstName}</span>
          <span className="mono" style={{ fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-2)", lineHeight: 1 }}>{roleLabel}</span>
        </span>
        <svg width={12} height={12} viewBox="0 0 12 12" fill="none" style={{ color: "var(--ink-2)", transition: "transform .15s", transform: open ? "rotate(180deg)" : undefined }}>
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          background: "var(--paper)", border: "1px solid var(--line)",
          borderRadius: 12, padding: "6px", minWidth: 160,
          boxShadow: "0 8px 24px rgba(0,0,0,.08)", zIndex: 50,
        }}>
          <Link
            to={dashboardPath}
            onClick={() => setOpen(false)}
            style={{
              display: "block", padding: "10px 14px", borderRadius: 8,
              fontSize: 14, color: "var(--ink)", textDecoration: "none",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--bg)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            Meu painel
          </Link>
          <div style={{ height: 1, background: "var(--line)", margin: "4px 0" }} />
          <button
            type="button"
            onClick={() => { setOpen(false); logout(); }}
            style={{
              display: "block", width: "100%", padding: "10px 14px", borderRadius: 8,
              fontSize: 14, color: "var(--ink-2)", background: "none", border: "none",
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
  );
}

function Header({ cartCount, q, onQ, onCartOpen, mob }: { cartCount: number; q: string; onQ: (v: string) => void; onCartOpen: () => void; mob: boolean }) {
  const { isAuthenticated, type, user } = useAuth();
  const accountType = (user as any)?.accountType ?? "CUSTOMER";
  const { supplierType: supType } = useAuth();
  const dashboardPath =
    type === "SUPPLIER" ? (supType === "PRODUCER" ? "/dashboard/producer" : "/dashboard/supplier")
    : type === "ADMIN" ? "/dashboard/admin"
    : accountType === "COFFEESHOP" ? "/dashboard/coffeeshop"
    : "/dashboard/customer";

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 30,
      background: "rgba(238,243,235,.92)", backdropFilter: "blur(10px)",
      borderBottom: "1px solid var(--line)",
    }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: mob ? "10px 16px" : "16px 32px" }}>
        {mob ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {/* Mobile row 1: Logo + actions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Logo />
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {isAuthenticated ? (
                  <UserMenu dashboardPath={dashboardPath} mob={mob} />
                ) : (
                  <Link to="/login" style={{ padding: "7px 14px", fontSize: 13, color: "var(--ink-2)", border: "1px solid var(--line)", borderRadius: 999, textDecoration: "none" }}>Entrar</Link>
                )}
                <button
                  type="button"
                  onClick={onCartOpen}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "8px 12px", borderRadius: 999,
                    border: "1px solid var(--line)", background: "var(--paper)",
                    color: "var(--ink)", cursor: "pointer", fontFamily: "inherit",
                    fontSize: 14, position: "relative",
                  }}
                  aria-label={`Carrinho — ${cartCount} ${cartCount === 1 ? "item" : "itens"}`}
                >
                  <CartIcon />
                  {cartCount > 0 && (
                    <span className="mono" style={{
                      fontSize: 10, padding: "2px 6px", borderRadius: 999,
                      background: "var(--c-vibra)", color: "#fff", lineHeight: 1.4,
                    }}>
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
            {/* Mobile row 2: Search bar full width */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 14px", borderRadius: 999,
              background: "var(--paper)", border: "1px solid var(--line)", color: "var(--ink-2)",
            }}>
              <SearchIcon />
              <input
                type="text"
                placeholder="Buscar café…"
                value={q}
                onChange={e => onQ(e.target.value)}
                style={{ flex: 1, border: 0, outline: "none", background: "transparent", fontSize: 14, fontFamily: "inherit", color: "inherit" }}
              />
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Logo />
              <span style={{ width: 1, height: 22, background: "var(--ink)", opacity: 0.2 }} />
              <nav style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <NavLink to="/explore" className="mono" style={({ isActive }) => ({ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" as const, color: isActive ? "var(--ink)" : "var(--ink-2)", textDecoration: "none", borderBottom: isActive ? "1.5px solid var(--ink)" : "1.5px solid transparent", paddingBottom: 1 })}>Catálogo</NavLink>
                {type !== "SUPPLIER" && <NavLink to="/courses" className="mono" style={({ isActive }) => ({ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" as const, color: isActive ? "var(--ink)" : "var(--ink-2)", textDecoration: "none", borderBottom: isActive ? "1.5px solid var(--ink)" : "1.5px solid transparent", paddingBottom: 1 })}>Cursos</NavLink>}
                {type !== "SUPPLIER" && <NavLink to="/subscriptions" className="mono" style={({ isActive }) => ({ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" as const, color: isActive ? "var(--ink)" : "var(--ink-2)", textDecoration: "none", borderBottom: isActive ? "1.5px solid var(--ink)" : "1.5px solid transparent", paddingBottom: 1 })}>Assinaturas</NavLink>}
              </nav>
            </div>
            <div style={{
              maxWidth: 480, margin: "0 auto", width: "100%",
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 16px", borderRadius: 999,
              background: "var(--paper)", border: "1px solid var(--line)", color: "var(--ink-2)",
            }}>
              <SearchIcon />
              <input
                type="text"
                placeholder="Buscar por café, região ou processo…"
                value={q}
                onChange={e => onQ(e.target.value)}
                style={{ flex: 1, border: 0, outline: "none", background: "transparent", fontSize: 14, fontFamily: "inherit", color: "inherit" }}
              />
              <span className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", opacity: 0.6 }}>⌘K</span>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {isAuthenticated ? (
                <UserMenu dashboardPath={dashboardPath} />
              ) : (
                <Link to="/login" style={{ padding: "9px 16px", fontSize: 14, color: "var(--ink-2)" }}>Entrar</Link>
              )}
              <button
                type="button"
                onClick={onCartOpen}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "8px 14px", borderRadius: 999,
                  border: "1px solid var(--line)", background: "var(--paper)",
                  color: "var(--ink)", cursor: "pointer", fontFamily: "inherit",
                  fontSize: 14, position: "relative",
                  transition: "border-color .15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--ink)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--line)"; }}
                aria-label={`Carrinho — ${cartCount} ${cartCount === 1 ? "item" : "itens"}`}
              >
                <CartIcon />
                {cartCount > 0 ? (
                  <span className="mono" style={{
                    fontSize: 10, letterSpacing: ".1em",
                    padding: "2px 7px", borderRadius: 999,
                    background: "var(--c-vibra)", color: "#fff", lineHeight: 1.4,
                  }}>
                    {cartCount}
                  </span>
                ) : (
                  <span style={{ fontSize: 13, color: "var(--ink-2)" }}>Carrinho</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

/* ===== Page header ===== */
function PageHeader({ mob }: { mob: boolean }) {
  return (
    <section style={{ borderBottom: "1px solid var(--line)" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: mob ? "28px 16px 20px" : "56px 32px 36px" }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)" }}>
          <span style={{ color: "var(--c-vibra)" }}>§</span> &nbsp; Catálogo · safra 2026
        </div>
        <div style={{ marginTop: 14 }}>
          <h1 className="serif" style={{ margin: 0, fontSize: "clamp(40px, 8vw, 128px)", lineHeight: 0.9, letterSpacing: "-.03em" }}>
            Nossos <span className="italic" style={{ color: "var(--c-vibra)" }}>cafés</span>.
          </h1>
        </div>
      </div>
    </section>
  );
}

/* ===== Filter helpers ===== */
function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}

function CheckList({ items, active, onToggle }: { items: string[]; active: string[]; onToggle: (v: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map(it => {
        const on = active.includes(it);
        return (
          <label key={it} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, color: on ? "var(--ink)" : "var(--ink-2)", cursor: "pointer" }}>
            <span style={{
              width: 16, height: 16, borderRadius: 4, flexShrink: 0,
              border: `1.5px solid ${on ? "var(--ink)" : "var(--ink-3)"}`,
              background: on ? "var(--ink)" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {on && <CheckIcon size={10} color="var(--c-leveza)" />}
            </span>
            <input type="checkbox" checked={on} onChange={() => onToggle(it)} style={{ display: "none" }} />
            {it}
          </label>
        );
      })}
    </div>
  );
}

function SegControl({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div style={{ display: "flex", padding: 3, background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 999 }}>
      {options.map(o => {
        const on = value === o.value;
        return (
          <button key={o.value} type="button" onClick={() => onChange(o.value)} style={{
            flex: 1, padding: "8px 12px", borderRadius: 999,
            background: on ? "var(--ink)" : "transparent",
            color: on ? "var(--c-leveza)" : "var(--ink-2)",
            fontSize: 12, border: 0, cursor: "pointer", fontFamily: "inherit",
          }}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ===== Filters sidebar ===== */
function Filters({ filters, setFilters, total, regions, role, mob }: {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  total: number;
  regions: string[];
  role: "COFFEESHOP" | "CUSTOMER" | "VISITOR" | "ROASTER";
  mob: boolean;
}) {
  const [mobOpen, setMobOpen] = useState(false);

  function toggleRegion(r: string) {
    setFilters(f => {
      const s = new Set(f.regions);
      if (s.has(r)) s.delete(r); else s.add(r);
      return { ...f, regions: [...s] };
    });
  }
  function reset() {
    setFilters({ q: "", regions: [], sale: "ALL", minPrice: 0, maxPrice: 5000 });
  }
  const hasActive = filters.q || filters.regions.length || filters.sale !== "ALL" || filters.minPrice > 0 || filters.maxPrice < 5000;
  const activeCount = Number(!!filters.q) + filters.regions.length + Number(filters.sale !== "ALL") + Number(filters.minPrice > 0) + Number(filters.maxPrice < 5000);

  const saleOptions = role === "CUSTOMER"
    ? [{ value: "ALL", label: "Todos" }, { value: "PACKAGE", label: "Pacote" }]
    : [{ value: "ALL", label: "Todos" }, { value: "PACKAGE", label: "Pacote" }, { value: "KG", label: "KG" }];

  const body = (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div className="serif" style={{ fontSize: 24, letterSpacing: "-.01em" }}>Filtros</div>
        {hasActive && (
          <button type="button" onClick={reset} className="mono" style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--c-vibra)", border: 0, background: "none", cursor: "pointer" }}>
            Limpar
          </button>
        )}
      </div>

      <FilterSection title="Buscar por nome">
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Ex.: Crema Brûlée"
            value={filters.q}
            onChange={e => setFilters(f => ({ ...f, q: e.target.value }))}
            style={{ width: "100%", padding: "11px 14px 11px 38px", border: "1px solid var(--line)", borderRadius: 10, fontSize: 14, outline: "none", background: "var(--bg)", fontFamily: "inherit", color: "inherit", boxSizing: "border-box" }}
          />
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--ink-2)" }}>
            <SearchIcon size={14} />
          </span>
        </div>
      </FilterSection>

      {regions.length > 0 && (
        <FilterSection title="Região">
          <CheckList items={regions} active={filters.regions} onToggle={toggleRegion} />
        </FilterSection>
      )}

      <FilterSection title="Tipo de venda">
        <SegControl
          value={filters.sale}
          onChange={v => setFilters(f => ({ ...f, sale: v as Filters["sale"] }))}
          options={saleOptions}
        />
      </FilterSection>

      <FilterSection title={`Faixa de preço · R$ ${filters.minPrice}–${filters.maxPrice}`}>
        <div style={{ paddingTop: 6 }}>
          <div style={{ position: "relative", height: 4, background: "var(--bg-2)", borderRadius: 999 }}>
            <div style={{ position: "absolute", left: `${(filters.minPrice / 5000) * 100}%`, right: `${100 - (filters.maxPrice / 5000) * 100}%`, top: 0, bottom: 0, background: "var(--ink)", borderRadius: 999 }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
            <input type="number" min="0" max={filters.maxPrice} value={filters.minPrice}
              onChange={e => setFilters(f => ({ ...f, minPrice: Math.min(Number(e.target.value), f.maxPrice) }))}
              style={{ padding: "9px 12px", border: "1px solid var(--line)", borderRadius: 8, fontSize: 13, background: "var(--bg)", outline: "none", fontFamily: "inherit" }} />
            <input type="number" min={filters.minPrice} max="5000" value={filters.maxPrice}
              onChange={e => setFilters(f => ({ ...f, maxPrice: Math.max(Number(e.target.value), f.minPrice) }))}
              style={{ padding: "9px 12px", border: "1px solid var(--line)", borderRadius: 8, fontSize: 13, background: "var(--bg)", outline: "none", fontFamily: "inherit" }} />
          </div>
        </div>
      </FilterSection>

      <div style={{ padding: "12px 14px", background: "var(--bg-2)", borderRadius: 12 }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)" }}>Resultado</div>
        <div className="serif" style={{ fontSize: 28, lineHeight: 1, marginTop: 6, letterSpacing: "-.01em" }}>
          {total} <span style={{ fontSize: 16, color: "var(--ink-2)" }}>cafés encontrados</span>
        </div>
      </div>
    </>
  );

  if (mob) {
    return (
      <div style={{ marginBottom: 4 }}>
        <button type="button" onClick={() => setMobOpen(o => !o)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid var(--line)", background: "var(--paper)", cursor: "pointer", fontFamily: "inherit" }}>
          <span className="serif" style={{ fontSize: 18 }}>Filtros{activeCount > 0 ? ` (${activeCount})` : ""}</span>
          <svg width={14} height={14} viewBox="0 0 14 10" fill="none" style={{ transform: `rotate(${mobOpen ? 180 : 0}deg)`, transition: "transform .15s", color: "var(--ink-2)" }}>
            <path d="M1 1l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        {mobOpen && (
          <div style={{ marginTop: 8, background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 18, padding: 20, display: "flex", flexDirection: "column", gap: 20 }}>
            {body}
          </div>
        )}
      </div>
    );
  }

  return (
    <aside style={{ position: "sticky", top: 96, alignSelf: "flex-start", background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 18, padding: 24, display: "flex", flexDirection: "column", gap: 24, boxShadow: "0 24px 48px -36px rgba(28,8,16,.2)" }}>
      {body}
    </aside>
  );
}

/* ===== Coffee card ===== */
function CoffeeCard({ c, onAdd, role, mob }: { c: Coffee; onAdd: (c: Coffee, qty: number) => void; role: "COFFEESHOP" | "CUSTOMER" | "VISITOR" | "ROASTER"; mob: boolean }) {
  const line = getLine(c.score);
  const lineBg   = LINE_BG[line];
  const lineBg2  = LINE_BG2[line];
  const lineInk  = LINE_INK[line];
  const lineInk2 = LINE_INK2[line];
  const lineAccent = LINE_ACCENT[line];
  const lineBorder = LINE_BORDER[line];

  const hasKg = c.saleType === "KG" || c.saleType === "BOTH";
  const hasPkg = c.saleType === "PACKAGE" || c.saleType === "BOTH";
  const showKg = hasKg && role !== "CUSTOMER";
  const pkgPrice = role === "COFFEESHOP" ? (c.packagePriceCoffeeshop ?? c.packagePrice) : c.packagePrice;
  const price = showKg && !hasPkg ? c.pricePerKg : hasPkg ? pkgPrice : c.pricePerKg;
  const unit = showKg && !hasPkg ? "/kg" : hasPkg ? "· pacote" : "/kg";

  const showComparison = role === "COFFEESHOP" && c.packagePriceCoffeeshop != null && c.packagePrice != null && c.packagePriceCoffeeshop !== c.packagePrice;
  const saving = showComparison && c.packagePrice! > c.packagePriceCoffeeshop!
    ? Math.round((1 - c.packagePriceCoffeeshop! / c.packagePrice!) * 100)
    : null;

  const useKgStepper = showKg && c.saleType === "KG";
  const [qty, setQty] = useState(1);
  const fmtQty = (v: number) => Number.isInteger(v) ? `${v} kg` : `${v.toLocaleString("pt-BR")} kg`;
  const totalKgPrice = useKgStepper && c.pricePerKg != null ? c.pricePerKg * qty : null;

  return (
    <article
      style={{
        borderRadius: 14, background: lineBg, border: `1px solid ${lineBorder}`,
        padding: mob ? 10 : 16, display: "flex", flexDirection: "column", gap: mob ? 8 : 14,
        color: lineInk,
        boxShadow: "0 16px 32px -28px rgba(28,8,16,.3)",
        transition: "transform .12s, box-shadow .12s",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 28px 48px -24px rgba(28,8,16,.4)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = "";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 16px 32px -28px rgba(28,8,16,.3)";
      }}
    >
      {/* Product image / bag mock */}
      <div style={{
        position: "relative", aspectRatio: mob ? "4 / 3" : "1 / 1.05", borderRadius: 10,
        background: lineBg2,
        overflow: "hidden", border: `1px solid ${lineBorder}`,
        padding: mob ? 10 : 18, display: "flex", flexDirection: "column", justifyContent: "space-between",
        transform: "translateZ(0)",
      }}>
        {c.photoUrl ? (
          <img
            src={c.photoUrl}
            alt={c.name}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span className="script" style={{ fontSize: mob ? 22 : 36, lineHeight: 0.8, color: lineAccent }}>íle</span>
              {!mob && (
                <span className="mono" style={{ fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: lineInk2 }}>
                  {c.saleType === "KG" ? "granel" : c.saleType === "PACKAGE" ? "250g" : "KG + Pacote"}
                </span>
              )}
            </div>
            <div>
              <div className="mono" style={{ fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color: lineAccent }}>
                {line}
              </div>
              <div className="serif" style={{ fontSize: mob ? 12 : 26, lineHeight: 0.95, letterSpacing: "-.015em", marginTop: 4, color: lineInk, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {c.name}
              </div>
            </div>
          </>
        )}
        {!mob && (
          <span className="mono" style={{
            position: "absolute", top: 10, right: 10,
            fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase",
            padding: "4px 8px", borderRadius: 999,
            background: "rgba(0,0,0,.35)", color: lineInk,
            backdropFilter: "blur(4px)",
          }}>
            {c.saleType === "KG" ? "Por kg" : c.saleType === "PACKAGE" ? "Pacote" : "KG + Pacote"}
          </span>
        )}
        {saving !== null && (
          <span className="mono" style={{
            position: "absolute", bottom: 10, left: 10,
            fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase",
            padding: "4px 8px", borderRadius: 999,
            background: "var(--c-vibra)", color: "#fff",
          }}>
            −{saving}% B2B
          </span>
        )}

        {/* Supplier badge */}
        {c.supplier && (
          <div style={{
            position: "absolute", top: 8, left: 8,
            display: "flex", alignItems: "center", gap: mob ? 0 : 6,
            background: "rgba(15,35,20,.72)", backdropFilter: "blur(6px)",
            borderRadius: 999, padding: mob ? "3px" : "4px 10px 4px 4px",
            border: "1px solid rgba(255,255,255,.12)",
          }}>
            <span style={{
              width: mob ? 18 : 22, height: mob ? 18 : 22, borderRadius: 999, flexShrink: 0,
              overflow: "hidden", background: "var(--c-mostarda)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 7, fontWeight: 700, color: "var(--ink)", letterSpacing: ".02em",
            }}>
              {c.supplier.photoUrl
                ? <img src={c.supplier.photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : c.supplier.name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()
              }
            </span>
            {!mob && (
              <span style={{ fontSize: 10, color: "rgba(255,255,255,.90)", fontWeight: 500, letterSpacing: ".01em", whiteSpace: "nowrap", maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis" }}>
                {c.supplier.name}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        <div className="serif" style={{ fontSize: mob ? 15 : 22, lineHeight: 1.1, letterSpacing: "-.01em", overflow: mob ? "hidden" : undefined, textOverflow: mob ? "ellipsis" : undefined, whiteSpace: mob ? "nowrap" : undefined }}>{c.name}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: mob ? 2 : 4 }}>
          <span style={{ fontSize: mob ? 11 : 13, color: lineInk2 }}>{c.region ?? "Brasil"}</span>
          {c.score && (
            <span className="mono" style={{
              fontSize: mob ? 9 : 11, letterSpacing: ".08em",
              padding: mob ? "2px 6px" : "3px 8px", borderRadius: 999,
              background: "rgba(0,0,0,.18)", color: lineAccent,
              whiteSpace: "nowrap", flexShrink: 0,
            }}>
              {c.score} pts
            </span>
          )}
        </div>
      </div>

      {!mob && c.description && (
        <p className="serif italic" style={{ margin: 0, fontSize: 14, lineHeight: 1.3, color: lineInk2 }}>
          {c.description}
        </p>
      )}

      {/* Preço + controles */}
      <div style={{ marginTop: "auto", paddingTop: 6, display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Linha de preço */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            {price != null ? (
              <>
                {showComparison && (
                  <div className="mono" style={{ fontSize: 11, color: lineInk2, textDecoration: "line-through", opacity: 0.65, marginBottom: 2 }}>
                    R$ {c.packagePrice!.toFixed(2).replace(".", ",")}
                  </div>
                )}
                <div className="serif" style={{ fontSize: mob ? 18 : 26, lineHeight: 1, letterSpacing: "-.01em" }}>
                  R$ {price.toFixed(2).replace(".", ",")}
                </div>
                <div className="mono" style={{ fontSize: 10, letterSpacing: ".12em", color: lineInk2, marginTop: 4, textTransform: "uppercase" }}>
                  {showComparison ? "· preço B2B" : unit}
                </div>
              </>
            ) : (
              <div style={{ fontSize: 14, color: lineInk2 }}>Consulte</div>
            )}
          </div>
          {/* Detalhes sempre visível aqui à direita */}
          <Link to={`/product/${c.id}`} style={{
            padding: mob ? "6px 10px" : "8px 12px", borderRadius: 999,
            border: `1px solid ${lineBorder}`,
            background: "rgba(0,0,0,.15)",
            fontSize: mob ? 11 : 12, color: lineInk, textDecoration: "none",
            flexShrink: 0,
          }}>
            {mob ? "Ver" : "Detalhes"}
          </Link>
        </div>

        {/* Stepper de kg — só para produtos vendidos por kg */}
        {useKgStepper ? (
          <div>
            <div className="mono" style={{ fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: lineInk2, marginBottom: 6 }}>
              Quantidade · mín. 0,5 kg · passo 0,5 kg
            </div>
            <div style={{ display: "flex", flexDirection: mob ? "column" : "row", gap: mob ? 8 : 6, alignItems: "center" }}>
              {/* Stepper */}
              <div style={{
                display: "flex", alignItems: "center",
                border: `1px solid ${lineBorder}`, borderRadius: 999,
                background: "rgba(0,0,0,.12)", overflow: "hidden", flexShrink: 0,
              }}>
                <button
                  type="button"
                  onClick={() => setQty(q => Math.max(0.5, Math.round((q - 0.5) * 10) / 10))}
                  style={{
                    width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                    background: "none", border: "none", cursor: qty <= 0.5 ? "not-allowed" : "pointer",
                    color: qty <= 0.5 ? lineInk2 : lineInk, fontSize: 16, fontWeight: 500,
                    opacity: qty <= 0.5 ? 0.4 : 1,
                  }}
                  disabled={qty <= 0.5}
                >
                  −
                </button>
                <span className="mono" style={{
                  minWidth: 48, textAlign: "center", fontSize: 12, letterSpacing: ".04em", color: lineInk,
                }}>
                  {fmtQty(qty)}
                </span>
                <button
                  type="button"
                  onClick={() => setQty(q => Math.round((q + 0.5) * 10) / 10)}
                  style={{
                    width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                    background: "none", border: "none", cursor: "pointer",
                    color: lineInk, fontSize: 16, fontWeight: 500,
                  }}
                >
                  +
                </button>
              </div>
              {/* Total dinâmico + botão adicionar */}
              <button
                type="button"
                onClick={() => onAdd(c, qty)}
                style={{
                  flex: 1, width: mob ? "100%" : undefined,
                  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "8px 12px", borderRadius: 999,
                  background: lineAccent, color: line === "Origens" ? "#fff" : "var(--c-barro)", fontSize: 12,
                  border: 0, cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
                }}
              >
                <span style={{ fontSize: 13, lineHeight: 1 }}>+</span>
                {totalKgPrice != null
                  ? `Adicionar · R$ ${totalKgPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : "Adicionar ao carrinho"}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onAdd(c, 1)}
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: mob ? "9px 10px" : "10px 14px", borderRadius: 999, width: "100%",
              background: lineAccent, color: line === "Origens" ? "#fff" : "var(--c-barro)", fontSize: mob ? 11 : 12,
              border: 0, cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
            }}
          >
            <span style={{ fontSize: mob ? 13 : 14, lineHeight: 1 }}>+</span>
            {mob ? "Adicionar" : "Adicionar ao carrinho"}
          </button>
        )}
      </div>
    </article>
  );
}

/* ===== Skeleton ===== */
function SkeletonCard() {
  return (
    <div style={{
      borderRadius: 18, background: "var(--paper)", border: "1px solid var(--line)",
      padding: 16, display: "flex", flexDirection: "column", gap: 14, minHeight: 460,
    }}>
      <div style={{ aspectRatio: "1/1.05", borderRadius: 12, background: "linear-gradient(90deg,var(--bg-2) 0%,var(--line) 50%,var(--bg-2) 100%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s ease-in-out infinite" }} />
      <div style={{ height: 24, width: "70%", borderRadius: 8, background: "linear-gradient(90deg,var(--bg-2) 0%,var(--line) 50%,var(--bg-2) 100%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s ease-in-out infinite" }} />
      <div style={{ height: 14, width: "50%", borderRadius: 8, background: "linear-gradient(90deg,var(--bg-2) 0%,var(--line) 50%,var(--bg-2) 100%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s ease-in-out infinite" }} />
    </div>
  );
}

/* ===== Empty state ===== */
function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div style={{
      gridColumn: "1 / -1", textAlign: "center", padding: "80px 32px",
      background: "var(--paper)", border: "1px dashed var(--line)", borderRadius: 18,
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 999, margin: "0 auto",
        background: "var(--bg-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-3)",
      }}>
        <SearchIcon size={32} />
      </div>
      <h3 className="serif" style={{ margin: "24px 0 0", fontSize: 36, lineHeight: 1.05, letterSpacing: "-.015em" }}>
        Nenhum café <span className="italic" style={{ color: "var(--c-vibra)" }}>encontrado</span>.
      </h3>
      <p style={{ fontSize: 15, color: "var(--ink-2)", maxWidth: 440, margin: "12px auto 0", lineHeight: 1.55 }}>
        Tente ajustar os filtros — talvez relaxar a faixa de preço ou tirar uma região.
        Sua próxima xícara está aqui em algum lugar.
      </p>
      <button type="button" onClick={onReset} style={{
        marginTop: 24, padding: "12px 22px", borderRadius: 999,
        background: "var(--ink)", color: "var(--c-leveza)", fontSize: 14,
        border: 0, cursor: "pointer", fontFamily: "inherit",
      }}>
        Limpar filtros
      </button>
    </div>
  );
}

/* ===== Cart toast ===== */
function CartToast({ item, onClose }: { item: Coffee | null; onClose: () => void }) {
  useEffect(() => {
    if (!item) return;
    const t = setTimeout(onClose, 2400);
    return () => clearTimeout(t);
  }, [item, onClose]);
  if (!item) return null;
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 60,
      background: "var(--ink)", color: "var(--c-leveza)",
      padding: "14px 18px", borderRadius: 14, border: "1px solid var(--ink)",
      display: "flex", alignItems: "center", gap: 12,
      boxShadow: "0 20px 40px -20px rgba(0,0,0,.35)", maxWidth: 360,
    }}>
      <span style={{
        width: 32, height: 32, borderRadius: 999, background: "var(--c-mostarda)",
        color: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <CheckIcon size={16} color="var(--ink)" />
      </span>
      <div>
        <div style={{ fontSize: 14 }}>Adicionado ao carrinho</div>
        <div className="serif italic" style={{ fontSize: 18, lineHeight: 1.1, color: "var(--c-mostarda)" }}>
          {item.name}
        </div>
      </div>
      <button onClick={onClose} style={{ marginLeft: "auto", color: "var(--c-leveza)", opacity: 0.7, border: 0, background: "none", cursor: "pointer" }}>
        <XIcon size={14} />
      </button>
    </div>
  );
}

function ErrorToast({ message, onClose }: { message: string | null; onClose: () => void }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, 8000);
    return () => clearTimeout(t);
  }, [message, onClose]);
  if (!message) return null;
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 61,
      background: "var(--c-vibra)", color: "#fff",
      padding: "14px 18px", borderRadius: 14,
      display: "flex", alignItems: "center", gap: 12,
      boxShadow: "0 20px 40px -20px rgba(0,0,0,.35)", maxWidth: 360,
    }}>
      <span style={{
        width: 32, height: 32, borderRadius: 999, background: "rgba(0,0,0,.18)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <XIcon size={14} />
      </span>
      <div style={{ fontSize: 14, lineHeight: 1.4 }}>{message}</div>
      <button onClick={onClose} style={{ marginLeft: "auto", color: "#fff", opacity: 0.7, border: 0, background: "none", cursor: "pointer" }}>
        <XIcon size={14} />
      </button>
    </div>
  );
}

/* ===== Page ===== */
export default function CatalogPage() {
  const { user, isAuthenticated, type: authType, supplierType: authSupplierType, logout } = useAuth();
  const { count: cartCount, addItem } = useCart();
  const [searchParams] = useSearchParams();
  const linhaParam = searchParams.get("linha") ?? "";
  const navigate = useNavigate();

  const mob = useMobile();
  const [mobMenuOpen, setMobMenuOpen] = useState(false);
  const [coffees, setCoffees] = useState<Coffee[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({ q: "", regions: [], sale: "ALL", minPrice: 0, maxPrice: 5000 });
  const PAGE_SIZE = 9;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState<Coffee | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const role: "COFFEESHOP" | "CUSTOMER" | "VISITOR" | "ROASTER" =
    authType === "SUPPLIER" && authSupplierType === "ROASTER" ? "ROASTER"
    : user?.accountType === "COFFEESHOP" ? "COFFEESHOP"
    : user ? "CUSTOMER"
    : "VISITOR";

  useEffect(() => {
    if (role === "CUSTOMER" && filters.sale === "KG") {
      setFilters(f => ({ ...f, sale: "ALL" }));
    }
  }, [role]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    api.get("/coffees")
      .then(r => setCoffees(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const regions = useMemo(
    () => [...new Set(coffees.map(c => c.region).filter(Boolean))] as string[],
    [coffees]
  );

  const visible = useMemo(() => coffees.filter(c => {
    if (role === "CUSTOMER" && c.saleType === "KG") return false;
    if (linhaParam && getLine(c.score) !== linhaParam) return false;
    if (filters.q && !c.name.toLowerCase().includes(filters.q.toLowerCase())) return false;
    if (filters.regions.length && !filters.regions.includes(c.region ?? "")) return false;
    if (filters.sale === "PACKAGE" && c.saleType === "KG") return false;
    if (filters.sale === "KG" && c.saleType === "PACKAGE") return false;
    const pkgPrice = role === "COFFEESHOP" ? (c.packagePriceCoffeeshop ?? c.packagePrice) : c.packagePrice;
    const p = c.saleType === "KG" ? c.pricePerKg : pkgPrice;
    if (p != null && (p < filters.minPrice || p > filters.maxPrice)) return false;
    return true;
  }), [coffees, filters, role, linhaParam]);

  const addToCart = useCallback(async (c: Coffee, qty = 1) => {
    if (!isAuthenticated) {
      setErrorMsg('Faça login para adicionar ao carrinho.');
      return;
    }
    try {
      await addItem(c.id, qty);
      setToast(c);
    } catch (err: any) {
      console.error('[Cart] addItem falhou:', err?.response?.status, err?.response?.data ?? err?.message);
      const msg = err?.response?.data?.message ?? 'Não foi possível adicionar ao carrinho.';
      setErrorMsg(msg);
    }
  }, [addItem, isAuthenticated]);

  const resetFilters = useCallback(() => {
    setFilters({ q: "", regions: [], sale: "ALL", minPrice: 0, maxPrice: 5000 });
    setVisibleCount(PAGE_SIZE);
  }, [PAGE_SIZE]);

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [filters, linhaParam, PAGE_SIZE]);

  const firstName = user?.name?.split(" ")[0] ?? "Torrefador";
  const lastName = user?.name?.split(" ")[1] ?? "";
  const initials = ((firstName[0] ?? "") + (lastName[0] ?? "")).toUpperCase();

  const catalogContent = (
    <>
      {linhaParam && (
        <div style={{ background: "var(--ink)", color: "var(--c-leveza)", padding: mob ? "12px 16px" : "12px 32px" }}>
          <div style={{ maxWidth: 1320, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 14 }}>
              Filtrando: <span className="serif italic" style={{ fontSize: 17, color: "var(--c-mostarda)" }}>Linha {linhaParam}</span>
            </span>
            <Link to="/explore" style={{ fontSize: 13, color: "var(--c-leveza)", opacity: 0.7 }}>Ver todos</Link>
          </div>
        </div>
      )}
      <main style={{ maxWidth: role === "ROASTER" ? undefined : 1320, margin: role === "ROASTER" ? undefined : "0 auto", padding: mob ? "20px 16px 60px" : "32px 36px 80px" }}>
        <div className="ile-catalog-inner">
          <Filters filters={filters} setFilters={setFilters} total={loading ? 0 : visible.length} regions={regions} role={role} mob={mob} />
          <div>
            {loading ? (
              <div className="ile-cards-grid">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : visible.length ? (
              <>
                <div className="ile-cards-grid">
                  {visible.slice(0, visibleCount).map(c => <CoffeeCard key={c.id} c={c} onAdd={addToCart} role={role} mob={mob} />)}
                </div>
                {visibleCount < visible.length && (
                  <div style={{ textAlign: "center", marginTop: 32 }}>
                    <button
                      onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
                      style={{
                        padding: "12px 32px", borderRadius: 999,
                        border: "1.5px solid var(--line)", background: "var(--paper)",
                        color: "var(--ink)", fontSize: 14, cursor: "pointer",
                        display: "inline-flex", alignItems: "center", gap: 8,
                        transition: "background .12s ease, border-color .12s ease",
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-2)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--ink-3)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--paper)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--line)"; }}
                    >
                      Ver mais
                      <span className="mono" style={{ fontSize: 11, color: "var(--ink-2)" }}>
                        ({visible.length - visibleCount} restantes)
                      </span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <EmptyState onReset={resetFilters} />
            )}
          </div>
        </div>
      </main>
      <footer style={{ borderTop: "1px solid var(--line)", padding: mob ? "20px 16px" : "24px 32px", fontSize: 12, color: "var(--ink-2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <span className="mono" style={{ letterSpacing: ".12em", textTransform: "uppercase" }}>© 2026 Ilé Coffees · desde 1934</span>
          <div style={{ display: "flex", gap: 18 }}>
            <Link to="/" style={{ color: "inherit" }}>Home</Link>
            <Link to="/courses" style={{ color: "inherit" }}>Cursos</Link>
            <Link to="#" style={{ color: "inherit" }}>Suporte</Link>
          </div>
        </div>
      </footer>
    </>
  );

  const overlays = (
    <>
      <CartToast item={toast} onClose={() => setToast(null)} />
      <ErrorToast message={errorMsg} onClose={() => setErrorMsg(null)} />
      <Cart isOpen={cartOpen} onClose={() => setCartOpen(false)} onCheckout={() => { setCartOpen(false); navigate("/checkout"); }} />
    </>
  );

  if (role === "ROASTER") {
    return (
      <>
        <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
        <div style={{ background: "var(--bg)", color: "var(--ink)", fontFamily: "inherit", display: "flex", height: "100vh", overflow: "hidden" }}>

          {/* Sidebar – desktop */}
          {!mob && (
            <aside style={{ width: 220, flexShrink: 0, background: "var(--c-glamour)", color: "var(--c-leveza)", display: "flex", flexDirection: "column", height: "100vh", overflowY: "auto" }}>
              <div style={{ padding: "22px 20px 14px" }}>
                <Link to="/dashboard/supplier" style={{ display: "inline-flex", alignItems: "baseline", gap: 6, textDecoration: "none", color: "var(--c-leveza)" }}>
                  <span className="script" style={{ fontSize: 40, lineHeight: 0.8 }}>íle</span>
                  <span className="serif italic" style={{ fontSize: 13, color: "rgba(255,255,255,.6)" }}>coffees</span>
                </Link>
              </div>
              <div style={{ height: 1, background: "rgba(255,255,255,.08)", margin: "0 16px 4px" }} />
              <div style={{ padding: "14px 16px 12px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 999, flexShrink: 0, overflow: "hidden", background: "rgba(255,255,255,.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600 }}>
                  {(user as any)?.photoUrl ? <img src={(user as any).photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (initials || "?")}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{firstName}</div>
                  <div className="mono" style={{ fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(255,255,255,.45)", lineHeight: 1.6 }}>Torrefador</div>
                </div>
              </div>
              <div style={{ height: 1, background: "rgba(255,255,255,.08)", margin: "0 16px 10px" }} />
              <nav style={{ flex: 1, padding: "0 10px", display: "flex", flexDirection: "column", gap: 2 }}>
                {SUPPLIER_TABS.map(tab => (
                  <Link key={tab} to="/dashboard/supplier" className="mono"
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, textDecoration: "none", background: "transparent", color: "rgba(255,255,255,.5)", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase" as const, transition: "background .12s, color .12s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.07)"; e.currentTarget.style.color = "rgba(255,255,255,.8)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,.5)"; }}
                  >
                    {SUPPLIER_TAB_ICONS[tab]}
                    {tab}
                  </Link>
                ))}
              </nav>
              <div style={{ padding: "4px 10px 24px" }}>
                <div style={{ height: 1, background: "rgba(255,255,255,.08)", margin: "0 6px 10px" }} />
                <Link to="/explore" className="mono"
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, fontSize: 11, textDecoration: "none", letterSpacing: ".1em", textTransform: "uppercase" as const, background: "rgba(255,255,255,.13)", color: "var(--c-leveza)" }}
                >
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  Comprar café
                </Link>
                <button onClick={() => { logout(); navigate("/"); }} className="mono"
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: 0, background: "transparent", color: "rgba(255,255,255,.5)", fontSize: 11, cursor: "pointer", fontFamily: "inherit", letterSpacing: ".1em", textTransform: "uppercase" as const, textAlign: "left" as const, width: "100%", marginTop: 2 }}
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
                <Link to="/dashboard/supplier" style={{ display: "inline-flex", alignItems: "baseline", gap: 6, textDecoration: "none", color: "var(--c-leveza)" }}>
                  <span className="script" style={{ fontSize: 36, lineHeight: 0.8 }}>íle</span>
                  <span className="serif italic" style={{ fontSize: 12, color: "rgba(255,255,255,.6)" }}>coffees</span>
                </Link>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => setCartOpen(true)} style={{ background: "none", border: 0, color: "var(--c-leveza)", cursor: "pointer", padding: 4, position: "relative" }}>
                    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                    {cartCount > 0 && <span style={{ position: "absolute", top: 0, right: 0, width: 16, height: 16, borderRadius: 999, background: "var(--c-vibra)", color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{cartCount}</span>}
                  </button>
                  <button onClick={() => setMobMenuOpen(o => !o)} style={{ background: "none", border: 0, color: "var(--c-leveza)", cursor: "pointer", padding: 4 }}>
                    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                    </svg>
                  </button>
                </div>
              </header>
            )}

            {/* Mobile: drawer */}
            {mob && mobMenuOpen && (
              <div style={{ position: "fixed", inset: 0, zIndex: 100 }} onClick={() => setMobMenuOpen(false)}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 240, background: "var(--c-glamour)", display: "flex", flexDirection: "column", padding: "60px 10px 24px" }} onClick={e => e.stopPropagation()}>
                  <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                    {SUPPLIER_TABS.map(tab => (
                      <Link key={tab} to="/dashboard/supplier" className="mono" onClick={() => setMobMenuOpen(false)}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 10, textDecoration: "none", background: "transparent", color: "rgba(255,255,255,.5)", fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase" as const }}>
                        {SUPPLIER_TAB_ICONS[tab]}
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

            {/* Desktop: breadcrumb + cart */}
            {!mob && (
              <div style={{ flexShrink: 0, borderBottom: "1px solid var(--line)", padding: "0 36px", height: 50, display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--paper)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span className="mono" style={{ fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--ink-2)" }}>Torrefador</span>
                  <span style={{ color: "var(--ink-2)", fontSize: 12 }}>›</span>
                  <span className="mono" style={{ fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--ink)" }}>Catálogo</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span className="mono" style={{ fontSize: 10, letterSpacing: ".12em", color: "var(--ink-2)", textTransform: "capitalize" }}>
                    {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
                  </span>
                  <button onClick={() => setCartOpen(true)} style={{ position: "relative", background: "none", border: "1px solid var(--line)", borderRadius: 999, cursor: "pointer", padding: "6px 14px", display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--ink-2)", fontFamily: "inherit" }}>
                    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                    Carrinho
                    {cartCount > 0 && <span style={{ background: "var(--c-vibra)", color: "#fff", borderRadius: 999, fontSize: 10, fontWeight: 700, padding: "1px 6px" }}>{cartCount}</span>}
                  </button>
                </div>
              </div>
            )}

            {/* Scrollable content */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              <PageHeader mob={mob} />
              {catalogContent}
            </div>
          </div>
        </div>
        {overlays}
      </>
    );
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--ink)" }}>
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
      <Header cartCount={cartCount} q={filters.q} onQ={q => setFilters(f => ({ ...f, q }))} onCartOpen={() => setCartOpen(true)} mob={mob} />
      <PageHeader mob={mob} />
      {catalogContent}
      {overlays}
    </div>
  );
}
