import { useEffect, useState, useMemo, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  price: number;
  workloadHours: number;
  level: string;
}

interface Filters {
  q: string;
  levels: string[];
  formats: string[];
  minPrice: number;
  maxPrice: number;
  hoursMax: number;
  free: boolean;
}

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: "Iniciante",
  INTERMEDIATE: "Intermediário",
  ADVANCED: "Avançado",
  Iniciante: "Iniciante",
  Intermediário: "Intermediário",
  Avançado: "Avançado",
};

const LEVEL_BG: Record<string, string> = {
  Iniciante: "var(--c-leveza)",
  Intermediário: "var(--c-mostarda)",
  Avançado: "var(--c-vibra)",
};
const LEVEL_INK: Record<string, string> = {
  Iniciante: "var(--ink)",
  Intermediário: "var(--ink)",
  Avançado: "#fff",
};

const COVER_COLORS = [
  "var(--c-leveza)",
  "var(--c-mostarda)",
  "var(--c-barro)",
  "var(--c-glamour)",
  "var(--c-vibra)",
  "var(--c-mostarda)",
];
const COVER_INK = [
  "var(--ink)",
  "var(--ink)",
  "var(--c-leveza)",
  "var(--c-leveza)",
  "var(--c-leveza)",
  "var(--ink)",
];

const LEVELS = ["Iniciante", "Intermediário", "Avançado"];
const FORMATS = ["Online", "Presencial", "Híbrido"];

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
function ArrowIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2.5 7h9M7.8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function PlayIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path d="M4 3v8l7-4z" fill="currentColor" />
    </svg>
  );
}
function ClockIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7 4v3l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
function PeopleIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <circle cx="5" cy="5" r="2" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="10.5" cy="5.5" r="1.5" stroke="currentColor" strokeWidth="1.1" />
      <path d="M1.5 12c.6-2 2-3 3.5-3s2.9 1 3.5 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M9 12c.4-1.6 1.4-2.4 2.5-2.4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}
function StarIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path d="M7 1.5l1.7 3.5 3.8.5-2.8 2.7.7 3.8L7 10.2l-3.4 1.8.7-3.8L1.5 5.5l3.8-.5z"
        fill="var(--c-mostarda)" stroke="var(--c-mostarda)" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  );
}

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}
function Chevron({ open }: { open: boolean }) {
  return (
    <svg width={10} height={6} viewBox="0 0 10 6"
      style={{ transform: `rotate(${open ? 180 : 0}deg)`, transition: "transform .15s", flexShrink: 0 }}>
      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
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

/* ===== Header ===== */
function Header() {
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
        maxWidth: 1320, margin: "0 auto", padding: "16px 32px",
        display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: 24,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Logo />
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

/* ===== Hero ===== */
function Hero({ total }: { total: number }) {
  const mob = useIsMobile();
  const stats = [
    ["+6.300", "alunos formados"],
    [String(total || 12), "cursos no catálogo"],
    ["4,9★", "avaliação média"],
    ["100%", "certificado digital"],
  ];
  const cols = mob ? 2 : 4;
  return (
    <section style={{ borderBottom: "1px solid var(--line)" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: mob ? "28px 16px 20px" : "40px 32px 32px" }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)" }}>
          <span style={{ color: "var(--c-vibra)" }}>§</span> &nbsp; Educação · íle academy
        </div>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1.4fr 1fr", gap: mob ? 12 : 40, alignItems: "flex-end", marginTop: 14 }}>
          <h1 className="serif" style={{ margin: 0, fontSize: mob ? "clamp(36px, 10vw, 56px)" : "clamp(40px, 5vw, 72px)", lineHeight: 0.9, letterSpacing: "-.03em" }}>
            Aprenda sobre<br />
            <span className="italic" style={{ color: "var(--c-vibra)" }}>café especial</span>.
          </h1>
          <p style={{ fontSize: mob ? 14 : 15, lineHeight: 1.5, color: "var(--ink-2)", maxWidth: 460, margin: 0 }}>
            Cursos com Q-Graders, mestres de torra e campeões de barismo. Online,
            presencial ou híbrido — do primeiro coado em casa até a curadoria
            completa de uma cafeteria.
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
              <div className="serif" style={{ fontSize: mob ? 28 : 36, lineHeight: 0.95, letterSpacing: "-.03em" }}>{v}</div>
              <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginTop: 6 }}>{k}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===== Filters bar ===== */
function FiltersBar({ filters, setFilters, total, loading }: {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  total: number;
  loading: boolean;
}) {
  const mob = useIsMobile();
  function toggleLevel(l: string) {
    setFilters(f => {
      const s = new Set(f.levels);
      if (s.has(l)) s.delete(l); else s.add(l);
      return { ...f, levels: [...s] };
    });
  }
  function toggleFormat(fmt: string) {
    setFilters(f => {
      const s = new Set(f.formats);
      if (s.has(fmt)) s.delete(fmt); else s.add(fmt);
      return { ...f, formats: [...s] };
    });
  }
  function reset() {
    setFilters({ q: "", levels: [], formats: [], minPrice: 0, maxPrice: 1500, hoursMax: 30, free: false });
  }
  const hasActive = filters.q || filters.levels.length || filters.formats.length || filters.minPrice > 0 || filters.maxPrice < 1500 || filters.hoursMax < 30 || filters.free;

  return (
    <div style={{
      background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 18,
      padding: 20, marginBottom: 32, boxShadow: "0 24px 48px -36px rgba(28,8,16,.2)",
    }}>
      <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1.4fr 1fr 1fr auto", gap: 16, alignItems: "flex-end" }}>
        {/* Search */}
        <div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 8 }}>Buscar</div>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Buscar curso, instrutor ou tema…"
              value={filters.q}
              onChange={e => setFilters(f => ({ ...f, q: e.target.value }))}
              style={{
                width: "100%", padding: "11px 14px 11px 38px",
                border: "1px solid var(--line)", borderRadius: 10, fontSize: 14, outline: "none",
                background: "var(--bg)", fontFamily: "inherit", color: "inherit", boxSizing: "border-box",
              }}
            />
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--ink-2)" }}>
              <SearchIcon size={14} />
            </span>
          </div>
        </div>

        {/* Level */}
        <div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 8 }}>Nível</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {LEVELS.map(l => {
              const on = filters.levels.includes(l);
              return (
                <button key={l} onClick={() => toggleLevel(l)} style={{
                  padding: "8px 12px", borderRadius: 999,
                  border: `1px solid ${on ? "var(--ink)" : "var(--line)"}`,
                  background: on ? "var(--ink)" : "var(--paper)",
                  color: on ? "var(--c-leveza)" : "var(--ink-2)",
                  fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                }}>{l}</button>
              );
            })}
          </div>
        </div>

        {/* Format */}
        <div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 8 }}>Formato</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {FORMATS.map(fmt => {
              const on = filters.formats.includes(fmt);
              return (
                <button key={fmt} onClick={() => toggleFormat(fmt)} style={{
                  padding: "8px 12px", borderRadius: 999,
                  border: `1px solid ${on ? "var(--ink)" : "var(--line)"}`,
                  background: on ? "var(--ink)" : "var(--paper)",
                  color: on ? "var(--c-leveza)" : "var(--ink-2)",
                  fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                }}>{fmt}</button>
              );
            })}
          </div>
        </div>

        <div style={{ padding: "10px 14px", background: "var(--bg-2)", borderRadius: 10, textAlign: "right", minWidth: 120 }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)" }}>Resultado</div>
          <div className="serif" style={{ fontSize: 24, lineHeight: 1, marginTop: 4, letterSpacing: "-.01em" }}>
            {loading ? "—" : total}
            <span style={{ fontSize: 12, color: "var(--ink-2)", marginLeft: 4 }}>cursos</span>
          </div>
        </div>
      </div>

      {/* Second row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 24, alignItems: "center", marginTop: 18, paddingTop: 18, borderTop: "1px dashed var(--line)" }}>
        <div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 10 }}>
            Preço · R$ {filters.minPrice}–{filters.maxPrice}
          </div>
          <div style={{ position: "relative", height: 24 }}>
            <div style={{ position: "absolute", top: 11, left: 0, right: 0, height: 3, background: "var(--bg-2)", borderRadius: 999 }} />
            <div style={{
              position: "absolute", top: 11, height: 3, borderRadius: 999, background: "var(--ink)",
              left: `${(filters.minPrice / 1500) * 100}%`,
              right: `${100 - (filters.maxPrice / 1500) * 100}%`,
            }} />
            <input type="range" min={0} max={1500} step={10} value={filters.minPrice}
              onChange={e => setFilters(f => ({ ...f, minPrice: Math.min(Number(e.target.value), f.maxPrice) }))}
              style={{ position: "absolute", inset: 0, width: "100%", appearance: "none" as const, background: "transparent", pointerEvents: "none" }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 11, color: "var(--ink-2)" }}>
            <span className="mono">R$ {filters.minPrice}</span>
            <span className="mono">R$ {filters.maxPrice}</span>
          </div>
        </div>

        <div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 10 }}>
            Carga horária · até {filters.hoursMax}h
          </div>
          <input
            type="range" min={1} max={30} step={1} value={filters.hoursMax}
            onChange={e => setFilters(f => ({ ...f, hoursMax: Number(e.target.value) }))}
            style={{ width: "100%", accentColor: "var(--ink)" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 11, color: "var(--ink-2)" }}>
            <span className="mono">1h</span>
            <span className="mono">30h</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <label style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "8px 14px", borderRadius: 999,
            border: `1px solid ${filters.free ? "var(--c-vibra)" : "var(--line)"}`,
            background: filters.free ? "rgba(231,64,44,.1)" : "transparent",
            color: filters.free ? "var(--c-vibra)" : "var(--ink-2)",
            fontSize: 13, cursor: "pointer",
          }}>
            <input
              type="checkbox"
              checked={filters.free}
              onChange={e => setFilters(f => ({ ...f, free: e.target.checked }))}
              style={{ accentColor: "var(--c-vibra)" }}
            />
            Só gratuitos
          </label>
          {hasActive && (
            <button onClick={reset} className="mono" style={{
              fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--c-vibra)",
              padding: "8px 12px", border: 0, background: "none", cursor: "pointer",
            }}>
              Limpar tudo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ===== Course card ===== */
function CourseCard({ c, idx }: { c: Course; idx: number }) {
  const levelLabel = LEVEL_LABELS[c.level] ?? c.level;
  const coverBg = COVER_COLORS[idx % COVER_COLORS.length];
  const coverInk = COVER_INK[idx % COVER_INK.length];
  const playBg = coverInk === "var(--ink)" ? "var(--ink)" : "var(--c-leveza)";
  const playInk = coverInk === "var(--ink)" ? "var(--c-leveza)" : "var(--ink)";

  return (
    <article
      style={{
        borderRadius: 18, background: "var(--paper)", border: "1px solid var(--line)",
        display: "flex", flexDirection: "column", overflow: "hidden",
        boxShadow: "0 16px 32px -28px rgba(28,8,16,.25)",
        transition: "transform .12s, box-shadow .12s",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 22px 44px -28px rgba(28,8,16,.3)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = "";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 16px 32px -28px rgba(28,8,16,.25)";
      }}
    >
      {/* Cover */}
      <div style={{
        position: "relative", aspectRatio: "16 / 10",
        background: coverBg, color: coverInk,
        padding: "22px 22px 18px",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        overflow: "hidden",
      }}>
        {c.imageUrl && (
          <>
            <img src={c.imageUrl} alt={c.title} style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "center",
            }} />
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(160deg, rgba(15,35,21,.55) 0%, rgba(15,35,21,.2) 60%, rgba(15,35,21,.5) 100%)",
            }} />
          </>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
          <span className="mono" style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", opacity: 0.75, color: c.imageUrl ? "var(--c-leveza)" : undefined }}>
            #{String(idx + 1).padStart(2, "0")} · Online
          </span>
          {c.price === 0 && (
            <span className="mono" style={{
              fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase",
              padding: "4px 10px", borderRadius: 999,
              background: "var(--c-vibra)", color: "#fff",
              border: "1px solid var(--ink)",
            }}>
              Gratuito
            </span>
          )}
        </div>

        <div style={{
          position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)",
          width: 64, height: 64, borderRadius: 999,
          background: c.imageUrl ? "rgba(255,255,255,.15)" : playBg,
          color: c.imageUrl ? "var(--c-leveza)" : playInk,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 12px 24px -8px rgba(0,0,0,.3)",
          zIndex: 1, backdropFilter: "blur(4px)",
          border: c.imageUrl ? "1px solid rgba(255,255,255,.25)" : "none",
        }}>
          <PlayIcon size={22} />
        </div>

        <div style={{ maxWidth: "70%", display: "flex", flexDirection: "column", gap: 8, position: "relative", zIndex: 1 }}>
          <span className="mono" style={{
            alignSelf: "flex-start",
            fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase",
            padding: "4px 10px", borderRadius: 999,
            background: LEVEL_BG[levelLabel] ?? "var(--c-leveza)",
            color: LEVEL_INK[levelLabel] ?? "var(--ink)",
            border: "1px solid var(--ink)",
          }}>
            {levelLabel}
          </span>
          <div className="serif" style={{ fontSize: 26, lineHeight: 1.05, letterSpacing: "-.015em", color: c.imageUrl ? "var(--c-leveza)" : undefined }}>
            {c.title}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "18px 20px 20px", display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
        <p className="serif italic" style={{ margin: 0, fontSize: 16, lineHeight: 1.3, color: "var(--ink-2)" }}>
          {c.description}
        </p>

        {/* Meta row */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0,
          paddingTop: 14, borderTop: "1px dashed var(--line)",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-2)", display: "flex", alignItems: "center", gap: 5 }}>
              <ClockIcon /> Carga
            </div>
            <div className="serif" style={{ fontSize: 18, lineHeight: 1 }}>{c.workloadHours}h</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-2)", display: "flex", alignItems: "center", gap: 5 }}>
              <PeopleIcon /> Nível
            </div>
            <div className="serif" style={{ fontSize: 18, lineHeight: 1 }}>{levelLabel}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-2)", display: "flex", alignItems: "center", gap: 5 }}>
              <StarIcon /> Rating
            </div>
            <div className="serif" style={{ fontSize: 18, lineHeight: 1 }}>4.9</div>
          </div>
        </div>

        {/* Price + CTA */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 8 }}>
          <div>
            {c.price === 0 ? (
              <>
                <div className="serif" style={{ fontSize: 28, lineHeight: 1, color: "var(--c-vibra)", letterSpacing: "-.01em" }}>Gratuito</div>
                <div className="mono" style={{ fontSize: 10, letterSpacing: ".12em", color: "var(--ink-2)", marginTop: 4, textTransform: "uppercase" }}>com cadastro</div>
              </>
            ) : (
              <>
                <div className="serif" style={{ fontSize: 26, lineHeight: 1, letterSpacing: "-.01em" }}>
                  R$ {c.price.toFixed(2).replace(".", ",")}
                </div>
                <div className="mono" style={{ fontSize: 10, letterSpacing: ".12em", color: "var(--ink-2)", marginTop: 4, textTransform: "uppercase" }}>
                  ou 4x sem juros
                </div>
              </>
            )}
          </div>
          <Link to={`/course/${c.id}`} style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "11px 16px", borderRadius: 999,
            background: "var(--ink)", color: "var(--c-leveza)", fontSize: 13,
            textDecoration: "none",
          }}>
            Ver curso <ArrowIcon size={12} />
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ===== Skeleton ===== */
function SkeletonCard() {
  return (
    <div style={{ borderRadius: 18, background: "var(--paper)", border: "1px solid var(--line)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ aspectRatio: "16/10", borderRadius: 0, background: "linear-gradient(90deg,var(--bg-2) 0%,var(--line) 50%,var(--bg-2) 100%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s ease-in-out infinite" }} />
      <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ height: 18, width: "75%", borderRadius: 8, background: "linear-gradient(90deg,var(--bg-2) 0%,var(--line) 50%,var(--bg-2) 100%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s ease-in-out infinite" }} />
        <div style={{ height: 14, width: "55%", borderRadius: 8, background: "linear-gradient(90deg,var(--bg-2) 0%,var(--line) 50%,var(--bg-2) 100%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s ease-in-out infinite" }} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
          <div style={{ height: 28, width: 100, borderRadius: 8, background: "linear-gradient(90deg,var(--bg-2) 0%,var(--line) 50%,var(--bg-2) 100%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s ease-in-out infinite" }} />
          <div style={{ height: 32, width: 110, borderRadius: 999, background: "linear-gradient(90deg,var(--bg-2) 0%,var(--line) 50%,var(--bg-2) 100%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s ease-in-out infinite" }} />
        </div>
      </div>
    </div>
  );
}

/* ===== Empty state ===== */
function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div style={{ textAlign: "center", padding: "80px 32px", background: "var(--paper)", border: "1px dashed var(--line)", borderRadius: 18 }}>
      <div style={{ width: 72, height: 72, borderRadius: 999, margin: "0 auto", background: "var(--bg-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-3)" }}>
        <SearchIcon size={32} />
      </div>
      <h3 className="serif" style={{ margin: "24px 0 0", fontSize: 36, lineHeight: 1.05, letterSpacing: "-.015em" }}>
        Nenhum curso <span className="italic" style={{ color: "var(--c-vibra)" }}>encontrado</span>.
      </h3>
      <p style={{ fontSize: 15, color: "var(--ink-2)", maxWidth: 440, margin: "12px auto 0", lineHeight: 1.55 }}>
        Tente relaxar os filtros — ampliar a faixa de preço ou tirar um nível.
        Em breve teremos mais cursos no catálogo.
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

/* ===== Newsletter strip ===== */
function NewsletterStrip() {
  return (
    <section style={{
      background: "var(--c-glamour)", color: "var(--c-leveza)",
      borderTop: "1px solid var(--ink)", borderBottom: "1px solid var(--ink)",
    }}>
      <div style={{
        maxWidth: 1320, margin: "0 auto", padding: "56px 32px",
        display: "grid", gridTemplateColumns: "1.4fr 1fr auto", gap: 32, alignItems: "center",
      }}>
        <div>
          <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--c-mostarda)" }}>
            Próximas turmas presenciais
          </div>
          <h3 className="serif" style={{ margin: "14px 0 0", fontSize: "clamp(36px, 4vw, 60px)", lineHeight: 0.95, letterSpacing: "-.02em" }}>
            Receba o <span className="italic" style={{ color: "var(--c-mostarda)" }}>calendário</span><br />direto no seu e-mail.
          </h3>
        </div>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, opacity: 0.85, maxWidth: 340 }}>
          Aulas de torra, barismo e cupping na nossa torrefação em Esp. Sto. do Pinhal.
          Vagas limitadas, ordem de inscrição.
        </p>
        <a href="#" style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          padding: "16px 24px", background: "var(--c-leveza)", color: "var(--ink)", borderRadius: 999,
          fontSize: 15, whiteSpace: "nowrap" as const, border: "1.5px solid var(--ink)",
        }}>
          Quero receber <ArrowIcon />
        </a>
      </div>
    </section>
  );
}

/* ===== Page ===== */
function useIsMobile(bp = 768) {
  const [m, setM] = useState(() => typeof window !== "undefined" && window.innerWidth < bp);
  useEffect(() => {
    const h = () => setM(window.innerWidth < bp);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, [bp]);
  return m;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    q: "", levels: [], formats: [], minPrice: 0, maxPrice: 1500, hoursMax: 30, free: false,
  });
  const mob = useIsMobile();

  useEffect(() => {
    api.get("/courses")
      .then(r => setCourses(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => courses.filter(c => {
    const levelLabel = LEVEL_LABELS[c.level] ?? c.level;
    if (filters.q && !`${c.title} ${c.description}`.toLowerCase().includes(filters.q.toLowerCase())) return false;
    if (filters.levels.length && !filters.levels.includes(levelLabel)) return false;
    if (filters.free && c.price !== 0) return false;
    if (c.price < filters.minPrice || c.price > filters.maxPrice) return false;
    if (c.workloadHours > filters.hoursMax) return false;
    return true;
  }), [courses, filters]);

  function reset() {
    setFilters({ q: "", levels: [], formats: [], minPrice: 0, maxPrice: 1500, hoursMax: 30, free: false });
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--ink)" }}>
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
      <Header />
      <Hero total={courses.length} />

      <main style={{ maxWidth: 1320, margin: "0 auto", padding: mob ? "20px 16px 48px" : "32px 32px 64px" }}>
        <FiltersBar filters={filters} setFilters={setFilters} total={visible.length} loading={loading} />

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(3, 1fr)", gap: 20 }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : visible.length ? (
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(3, 1fr)", gap: 20 }}>
            {visible.map((c, i) => <CourseCard key={c.id} c={c} idx={i} />)}
          </div>
        ) : (
          <EmptyState onReset={reset} />
        )}
      </main>

      <NewsletterStrip />

      <footer style={{ borderTop: "1px solid var(--line)", padding: "24px 32px", fontSize: 12, color: "var(--ink-2)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <span className="mono" style={{ letterSpacing: ".12em", textTransform: "uppercase" }}>
            © 2026 Ilé Coffees · desde 1934
          </span>
          <div style={{ display: "flex", gap: 18 }}>
            <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
            <Link to="/explore" style={{ color: "inherit", textDecoration: "none" }}>Cafés</Link>
            <Link to="/register/supplier" style={{ color: "inherit", textDecoration: "none" }}>Portal B2B</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
