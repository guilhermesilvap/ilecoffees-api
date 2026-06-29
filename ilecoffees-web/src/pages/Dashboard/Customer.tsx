import { useState, useEffect, useRef, useCallback } from "react";
import { Link, NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useMobile } from "@/contexts/MobileContext";
import OrderDetailModal from "@/components/OrderDetailModal";

interface Order {
  id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  type?: string | null;
  quantity?: number | null;
  trackingCode?: string | null;
  shippingCost?: number | null;
  deliveryCep?: string | null;
  subscriptionStatus?: string | null;
  pausedAt?: string | null;
  coffee?: { id: string; name: string; photoUrl?: string | null; saleType?: string } | null;
  course?: { id: string; title: string; imageUrl?: string | null } | null;
  subscription?: { id: string; name: string } | null;
  payment?: { status: string; method?: string | null; paidAt?: string | null; amount: number } | null;
}

interface Favorite {
  id: string;
  coffeeId: string;
  createdAt: string;
  coffee: {
    id: string;
    name: string;
    photoUrl?: string | null;
    packagePrice?: number | null;
    saleType: string;
    supplier?: { id: string; name: string } | null;
  } | null;
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  price: number;
  level?: string;
  workloadHours?: number;
  imageUrl: string | null;
  enrolled?: boolean;
  progress?: number;
  totalLessons?: number;
  completedLessons?: number;
}

type TabId = "HOME" | "ORDERS" | "SUBSCRIPTION" | "COURSES" | "FAVORITES" | "PROFILE";

const COVER_COLORS = ["var(--c-leveza)", "var(--c-mostarda)", "var(--c-barro)", "var(--c-glamour)", "var(--c-vibra)"];
const COVER_INK   = ["var(--ink)", "var(--ink)", "var(--c-leveza)", "var(--c-leveza)", "var(--c-leveza)"];

const STATUS_CONFIG: Record<string, { label: string; variant: keyof typeof STATUS_COLORS }> = {
  PENDING:    { label: "Pendente",     variant: "pending" },
  PROCESSING: { label: "Processando", variant: "info"    },
  SHIPPED:    { label: "Enviado",      variant: "warn"    },
  DELIVERED:  { label: "Entregue",     variant: "success" },
  PAID:       { label: "Pago",         variant: "success" },
  CANCELED:   { label: "Cancelado",    variant: "error"   },
};

const STATUS_COLORS = {
  pending: { bg: "var(--c-leveza)",      ink: "var(--ink)",       dot: "var(--c-mostarda)" },
  info:    { bg: "rgba(15,41,32,.10)",   ink: "var(--c-glamour)", dot: "var(--c-glamour)"  },
  warn:    { bg: "rgba(229,138,42,.18)", ink: "var(--ink)",       dot: "var(--c-mostarda)" },
  success: { bg: "rgba(46,114,68,.14)", ink: "var(--success)",   dot: "var(--success)"    },
  error:   { bg: "rgba(231,64,44,.12)", ink: "var(--c-vibra)",   dot: "var(--c-vibra)"    },
};

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

/* ── SVG Icons ── */
function Arrow({ size = 14, dir = "right" }: { size?: number; dir?: "left" | "right" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none"
      style={{ transform: dir === "left" ? "rotate(180deg)" : "none", flexShrink: 0 }} aria-hidden="true">
      <path d="M2.5 7h9M7.8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function Chevron({ size = 10, open }: { size?: number; open: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 6"
      style={{ transform: `rotate(${open ? 180 : 0}deg)`, transition: "transform .15s", flexShrink: 0 }}>
      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
    </svg>
  );
}
function PlayIcon({ size = 12, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M4 3v8l7-4z" fill={color} />
    </svg>
  );
}
function IconHome()    { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2.5 7L8 3l5.5 4v6a1 1 0 01-1 1H3.5a1 1 0 01-1-1V7z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M6.5 14V9.5h3V14" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>; }
function IconBox()     { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4.5l6-2.5 6 2.5v7l-6 2.5-6-2.5v-7z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M2 4.5L8 7l6-2.5M8 7v7" stroke="currentColor" strokeWidth="1.3"/></svg>; }
function IconRepeat()  { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 5h9l-2-2M13 11H4l2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function IconBook()    { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3.5h4.5a1.5 1.5 0 011.5 1.5v8a1 1 0 00-1-1H3v-8.5zM13 3.5H8.5a1.5 1.5 0 00-1.5 1.5v8a1 1 0 011-1H13v-8.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>; }
function IconUser()    { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M3 14c.8-2.5 2.5-3.5 5-3.5s4.2 1 5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>; }
function IconLogout()  { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M9 3H4a1 1 0 00-1 1v8a1 1 0 001 1h5M11 5l3 3-3 3M14 8H7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function IconSettings(){ return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M8 1.5v2M8 12.5v2M3.5 3.5l1.4 1.4M11.1 11.1l1.4 1.4M1.5 8h2M12.5 8h2M3.5 12.5l1.4-1.4M11.1 4.9l1.4-1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>; }
function IconHeart({ filled = false }: { filled?: boolean }) { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 13.5S2 9.5 2 5.5a3 3 0 016 0 3 3 0 016 0c0 4-6 8-6 8z" fill={filled ? "var(--c-vibra)" : "none"} stroke={filled ? "var(--c-vibra)" : "currentColor"} strokeWidth="1.3" strokeLinejoin="round"/></svg>; }
function IconShop()    { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 5h12l-1 8H3L2 5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M5 5V4a3 3 0 016 0v1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>; }

/* ── Avatar ── */
function Avatar({ photoUrl, initial, size, bg, color }: { photoUrl?: string | null; initial: string; size: number; bg: string; color: string }) {
  return (
    <span style={{ width: size, height: size, borderRadius: 999, flexShrink: 0, overflow: "hidden", background: bg, color, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: size * 0.35, letterSpacing: ".02em" }}>
      {photoUrl
        ? <img src={photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : initial}
    </span>
  );
}

/* ── DropdownItem ── */
function DropdownItem({ icon, label, danger, onClick }: { icon: React.ReactNode; label: string; danger?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 10, width: "100%",
      padding: "10px 12px", borderRadius: 8, border: "none",
      fontSize: 14, color: danger ? "#b8231a" : "var(--ink)",
      background: "transparent", cursor: "pointer", textAlign: "left", fontFamily: "inherit",
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-2)"; }}
    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
    >
      <span style={{ color: danger ? "#b8231a" : "var(--ink-2)" }}>{icon}</span> {label}
    </button>
  );
}

/* ── Header ── */
function DashHeader({ userName, accountType, photoUrl, onLogout, onNavigate }: { userName: string; accountType: string; photoUrl?: string | null; onLogout: () => void; onNavigate: (tab: TabId) => void }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const mob = useMobile();
  const initial = getInitials(userName);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

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
          <Link to="/" style={{ display: "inline-flex", alignItems: "baseline", gap: 6, textDecoration: "none", color: "inherit" }}>
            <span className="script" style={{ fontSize: mob ? 28 : 36, lineHeight: 0.75 }}>íle</span>
            <span className="serif italic" style={{ fontSize: mob ? 10 : 13, lineHeight: 1, color: "var(--c-vibra)" }}>coffees</span>
          </Link>
          {!mob && (
            <>
              <span style={{ width: 1, height: 22, background: "var(--ink)", opacity: 0.2 }} />
              <nav style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <NavLink to="/explore" className="mono" style={({ isActive }) => ({ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" as const, color: isActive ? "var(--ink)" : "var(--ink-2)", textDecoration: "none", borderBottom: isActive ? "1.5px solid var(--ink)" : "1.5px solid transparent", paddingBottom: 1 })}>Catálogo</NavLink>
                <NavLink to="/courses" className="mono" style={({ isActive }) => ({ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" as const, color: isActive ? "var(--ink)" : "var(--ink-2)", textDecoration: "none", borderBottom: isActive ? "1.5px solid var(--ink)" : "1.5px solid transparent", paddingBottom: 1 })}>Cursos</NavLink>
                <NavLink to="/subscriptions" className="mono" style={({ isActive }) => ({ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" as const, color: isActive ? "var(--ink)" : "var(--ink-2)", textDecoration: "none", borderBottom: isActive ? "1.5px solid var(--ink)" : "1.5px solid transparent", paddingBottom: 1 })}>Assinaturas</NavLink>
              </nav>
            </>
          )}
        </div>

        <div />

        <div ref={wrapRef} style={{ position: "relative" }}>
          <button onClick={() => setOpen(o => !o)} style={{
            display: "inline-flex", alignItems: "center", gap: mob ? 0 : 10,
            padding: mob ? "4px" : "6px 14px 6px 6px", borderRadius: 999,
            border: "1px solid var(--line)", background: "var(--paper)",
            cursor: "pointer", fontFamily: "inherit",
          }}>
            <Avatar
              photoUrl={photoUrl}
              initial={initial}
              size={34}
              bg={accountType === "COFFEESHOP" ? "var(--c-glamour)" : "var(--c-mostarda)"}
              color={accountType === "COFFEESHOP" ? "var(--c-leveza)" : "var(--ink)"}
            />
            {!mob && (
              <>
                <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 }}>
                  <span style={{ fontSize: 14, color: "var(--ink)", fontWeight: 500, lineHeight: 1 }}>{userName.split(" ")[0]}</span>
                  <span className="mono" style={{ fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-2)", lineHeight: 1 }}>
                    {accountType === "COFFEESHOP" ? "Cafeteria" : "Cliente"}
                  </span>
                </span>
                <Chevron open={open} />
              </>
            )}
          </button>
          {open && (
            <div style={{
              position: "absolute", right: 0, top: "calc(100% + 8px)", zIndex: 40,
              minWidth: 240, background: "var(--paper)",
              border: "1px solid var(--line)", borderRadius: 14,
              boxShadow: "0 24px 40px -20px rgba(28,8,16,.3)", padding: 8,
            }}>
              <DropdownItem icon={<IconUser />} label="Meu perfil" onClick={() => { onNavigate("PROFILE"); setOpen(false); }} />
              <DropdownItem icon={<IconBox />} label="Meus pedidos" onClick={() => { onNavigate("ORDERS"); setOpen(false); }} />
              <div style={{ height: 1, background: "var(--line)", margin: "6px 0" }} />
              <DropdownItem icon={<IconLogout />} label="Sair" danger onClick={onLogout} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ── Sidebar ── */
function Sidebar({
  accountType, active, setActive, ordersBadge, coursesBadge, userName, userEmail, memberSince, photoUrl, mob,
}: {
  accountType: string; active: TabId; setActive: (t: TabId) => void;
  ordersBadge: number; coursesBadge: number; userName: string; userEmail: string; memberSince: string; photoUrl?: string | null; mob: boolean;
}) {
  const initial = getInitials(userName);
  const items: { id: TabId; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "HOME",         label: "Início",             icon: <IconHome /> },
    { id: "ORDERS",       label: "Pedidos",             icon: <IconBox />,    badge: ordersBadge || undefined },
    { id: "SUBSCRIPTION", label: "Assinaturas",         icon: <IconRepeat /> },
    { id: "COURSES",      label: "Cursos",              icon: <IconBook />,   badge: coursesBadge || undefined },
    { id: "FAVORITES",    label: "Favoritos",           icon: <IconHeart /> },
    { id: "PROFILE",      label: "Perfil",              icon: <IconUser /> },
  ];

  if (mob) {
    return (
      <div className="ile-sidebar-pills" style={{
        display: "flex", gap: 6, overflowX: "auto", paddingBottom: 12, marginBottom: 16,
        scrollbarWidth: "none" as const, borderBottom: "1px solid var(--line)",
      }}>
        <style>{`
          .ile-sidebar-pills::-webkit-scrollbar{display:none}
          @media(max-width:767px){.ile-sidebar-desktop{display:none!important}}
        `}</style>
        <Link to="/explore" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "8px 14px", borderRadius: 999, fontSize: 13,
          flexShrink: 0, textDecoration: "none",
          background: "var(--c-vibra)", color: "#fff",
        }}>
          <IconShop /> Catálogo
        </Link>
        {items.map(it => {
          const on = active === it.id;
          return (
            <button key={it.id} onClick={() => setActive(it.id)} style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 14px", borderRadius: 999, fontSize: 13, border: "none",
              cursor: "pointer", flexShrink: 0, fontFamily: "inherit",
              background: on ? "var(--ink)" : "var(--bg-2)",
              color: on ? "var(--c-leveza)" : "var(--ink-2)",
              position: "relative",
            }}>
              <span style={{ color: on ? "var(--c-mostarda)" : "var(--ink-2)" }}>{it.icon}</span>
              {it.label}
              {it.badge !== undefined && (
                <span style={{
                  fontSize: 9, fontWeight: 600, padding: "1px 5px", borderRadius: 999,
                  background: on ? "var(--c-mostarda)" : "var(--c-vibra)",
                  color: on ? "var(--ink)" : "#fff", marginLeft: 2,
                }}>
                  {it.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <aside className="ile-sidebar-desktop" style={{
      background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 18,
      padding: 22, position: "sticky", top: 96, alignSelf: "flex-start",
      display: "flex", flexDirection: "column", gap: 22,
    }}>
      {/* User card */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 14 }}>
        <div style={{ position: "relative" }}>
          <span style={{
            width: 64, height: 64, borderRadius: 999, overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "2px solid var(--paper)", boxShadow: "0 0 0 1px var(--line)",
          }}>
            <Avatar
              photoUrl={photoUrl}
              initial={initial}
              size={64}
              bg={accountType === "COFFEESHOP" ? "var(--c-glamour)" : "var(--c-mostarda)"}
              color={accountType === "COFFEESHOP" ? "var(--c-leveza)" : "var(--ink)"}
            />
          </span>
          <span style={{
            position: "absolute", right: -2, bottom: -2,
            width: 18, height: 18, borderRadius: 999,
            background: "var(--success)", border: "2px solid var(--paper)",
          }} />
        </div>
        <div>
          <div className="serif" style={{ fontSize: 22, lineHeight: 1.05, letterSpacing: "-.01em" }}>
            {userName}
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 4 }}>
            {userEmail}
          </div>
          <span className="mono" style={{
            display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10,
            fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase",
            padding: "5px 10px", borderRadius: 999,
            background: accountType === "COFFEESHOP" ? "var(--c-glamour)" : "var(--c-leveza)",
            color: accountType === "COFFEESHOP" ? "var(--c-leveza)" : "var(--ink)",
            border: "1px solid var(--ink)",
          }}>
            {accountType === "COFFEESHOP" ? "Cafeteria" : "Cliente Final"}
          </span>
        </div>
      </div>

      <div style={{ height: 1, background: "var(--line)" }} />

      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {items.map(it => {
          const on = active === it.id;
          return (
            <button key={it.id} onClick={() => setActive(it.id)} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "11px 12px",
              borderRadius: 10, fontSize: 14, border: "none", cursor: "pointer",
              background: on ? "var(--ink)" : "transparent",
              color: on ? "var(--c-leveza)" : "var(--ink-2)",
              textAlign: "left", fontFamily: "inherit", transition: "background .12s",
            }}
            onMouseEnter={e => { if (!on) (e.currentTarget as HTMLElement).style.background = "var(--bg-2)"; }}
            onMouseLeave={e => { if (!on) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <span style={{ color: on ? "var(--c-mostarda)" : "var(--ink-2)" }}>{it.icon}</span>
              <span style={{ flex: 1 }}>{it.label}</span>
              {it.badge !== undefined && (
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 999,
                  background: on ? "var(--c-mostarda)" : "var(--c-vibra)",
                  color: on ? "var(--ink)" : "#fff",
                }}>
                  {it.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div style={{ height: 1, background: "var(--line)" }} />

      <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.55 }}>
        Cliente desde <b style={{ color: "var(--ink)" }}>{memberSince}</b>
      </div>
    </aside>
  );
}

/* ── SectionHeader ── */
function SectionHeader({ title, subtitle, cta }: { title: string; subtitle?: string; cta?: { label: string; onClick: () => void } }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "flex-end",
      marginBottom: 18, gap: 16, flexWrap: "wrap",
    }}>
      <div>
        <h2 className="serif" style={{ margin: 0, fontSize: 32, lineHeight: 1.05, letterSpacing: "-.015em" }}>
          {title}
        </h2>
        {subtitle && <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 4 }}>{subtitle}</div>}
      </div>
      {cta && (
        <button onClick={cta.onClick} style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          fontSize: 13, color: "var(--c-vibra)", background: "none", border: "none",
          cursor: "pointer", fontFamily: "inherit",
        }}>
          {cta.label} <Arrow size={11} />
        </button>
      )}
    </div>
  );
}

/* ── PlaceholderView ── */
function PlaceholderView({ title, body }: { title: string; body: string }) {
  const mob = useMobile();
  return (
    <section style={{
      padding: mob ? "40px 20px" : "80px 32px", textAlign: "center",
      background: "var(--paper)", border: "1px dashed var(--line)", borderRadius: 18,
    }}>
      <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)" }}>
        Em breve · íle
      </div>
      <h2 className="serif" style={{ margin: "12px 0 0", fontSize: mob ? 28 : 44, lineHeight: 1.05, letterSpacing: "-.02em" }}>
        {title}
      </h2>
      <p style={{ fontSize: 15, color: "var(--ink-2)", marginTop: 10, maxWidth: 460, marginInline: "auto", lineHeight: 1.55 }}>
        {body}
      </p>
    </section>
  );
}

/* ── Welcome ── */
function Welcome({ userName }: { userName: string }) {
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  return (
    <div style={{ marginBottom: 28 }}>
      <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)" }}>
        <span style={{ color: "var(--c-vibra)" }}>§</span>&nbsp; Bem-vindo de volta
      </div>
      <h1 className="serif" style={{
        margin: "12px 0 0", fontSize: "clamp(44px, 5vw, 76px)",
        lineHeight: 0.95, letterSpacing: "-.025em",
      }}>
        {greet}, <span className="italic" style={{ color: "var(--c-vibra)" }}>{userName.split(" ")[0]}</span>.
      </h1>
    </div>
  );
}

/* ── SummaryCard ── */
interface SummaryCardProps {
  eyebrow: string;
  value?: string;
  title?: string;
  subtitle?: string;
  badge?: { label: string; color: string };
  progress?: { done: number; total: number };
  accent: string;
  dark?: boolean;
  cta?: { label: string; onClick: () => void };
}
function SummaryCard({ eyebrow, value, title, subtitle, badge, progress, accent, dark, cta }: SummaryCardProps) {
  return (
    <div style={{
      padding: 20, borderRadius: 16,
      background: dark ? "var(--c-barro)" : "var(--paper)",
      color: dark ? "var(--c-leveza)" : "var(--ink)",
      border: `1px solid ${dark ? "var(--ink)" : "var(--line)"}`,
      display: "flex", flexDirection: "column", gap: 12,
      minHeight: 200, position: "relative", overflow: "hidden",
    }}>
      <div className="mono" style={{
        fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase",
        color: dark ? "var(--c-mostarda)" : "var(--ink-2)",
      }}>
        {eyebrow}
      </div>
      <div>
        {value && (
          <div className="serif" style={{ fontSize: 76, lineHeight: 0.9, letterSpacing: "-.04em" }}>{value}</div>
        )}
        {title && (
          <div className="serif" style={{ fontSize: 32, lineHeight: 1.05, letterSpacing: "-.015em", marginTop: 4 }}>{title}</div>
        )}
        {subtitle && (
          <div style={{ fontSize: 13, color: dark ? "rgba(244,204,160,.85)" : "var(--ink-2)", marginTop: 6 }}>
            {subtitle}
          </div>
        )}
      </div>
      {badge && (
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 12, padding: "5px 10px", borderRadius: 999, alignSelf: "flex-start",
          background: dark
            ? "rgba(244,204,160,.16)"
            : `color-mix(in srgb, ${badge.color} 18%, transparent)`,
          color: dark ? "var(--c-leveza)" : badge.color,
          border: `1px solid ${dark ? "rgba(244,204,160,.3)" : badge.color}`,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: badge.color, flexShrink: 0 }} />
          {badge.label}
        </span>
      )}
      {progress && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 6, color: "var(--ink-2)" }}>
            <span className="mono" style={{ letterSpacing: ".12em", textTransform: "uppercase" }}>Progresso geral</span>
            <span><b style={{ color: "var(--ink)" }}>{progress.done}</b>/{progress.total} aulas</span>
          </div>
          <div style={{ height: 8, background: "var(--bg-2)", borderRadius: 999 }}>
            <div style={{
              height: "100%", width: `${(progress.done / progress.total) * 100}%`,
              background: "linear-gradient(90deg, var(--c-mostarda), var(--c-vibra))", borderRadius: 999,
            }} />
          </div>
        </div>
      )}
      {cta && (
        <button onClick={cta.onClick} style={{
          display: "inline-flex", alignItems: "center", gap: 8, marginTop: "auto", paddingTop: 6,
          fontSize: 13, color: dark ? "var(--c-mostarda)" : "var(--c-vibra)",
          background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", alignSelf: "flex-start",
        }}>
          {cta.label} <Arrow size={11} />
        </button>
      )}
      <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: accent }} />
    </div>
  );
}

/* ── SummaryCards ── */
function SummaryCards({
  activeOrdersCount, shippedCount, activeSubOrders, enrolledCourses,
  onGoOrders, onGoSubscription, onGoCourses,
}: {
  activeOrdersCount: number; shippedCount: number;
  activeSubOrders: Order[]; enrolledCourses: Course[];
  onGoOrders: () => void; onGoSubscription: () => void; onGoCourses: () => void;
}) {
  const totalProgress = enrolledCourses.reduce((s, c) => s + (c.progress ?? 0), 0);
  const avgProgress = enrolledCourses.length > 0 ? Math.round(totalProgress / enrolledCourses.length) : 0;
  const hasSub = activeSubOrders.length > 0;

  return (
    <div className="ile-summary-cards">
      <SummaryCard
        eyebrow="Pedidos ativos"
        value={String(activeOrdersCount)}
        subtitle="aguardando entrega"
        badge={shippedCount > 0 ? { label: `${shippedCount} a caminho`, color: "var(--c-mostarda)" } : undefined}
        accent="var(--c-mostarda)"
        cta={{ label: "Ver pedidos", onClick: onGoOrders }}
      />
      {hasSub ? (
        <SummaryCard
          eyebrow="Assinatura atual"
          title={activeSubOrders[0].subscription?.name ?? "Assinatura"}
          subtitle={`Desde ${fmtDate(activeSubOrders[0].createdAt)}`}
          badge={{ label: "Ativo", color: "var(--success)" }}
          accent="var(--c-vibra)"
          dark
          cta={{ label: "Gerenciar", onClick: onGoSubscription }}
        />
      ) : (
        <SummaryCard
          eyebrow="Assinatura"
          title="Sem assinatura"
          subtitle="receba café em casa todo mês"
          accent="var(--c-leveza)"
          cta={{ label: "Ver planos", onClick: onGoSubscription }}
        />
      )}
      <SummaryCard
        eyebrow="Cursos em andamento"
        value={String(enrolledCourses.length)}
        subtitle={enrolledCourses.length > 0 ? `${avgProgress}% de progresso médio` : "nenhum curso iniciado"}
        progress={enrolledCourses.length > 0 ? { done: avgProgress, total: 100 } : undefined}
        accent="var(--c-glamour)"
        cta={{ label: "Continuar", onClick: onGoCourses }}
      />
    </div>
  );
}

/* ── StatusBadge ── */
function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, variant: "pending" as const };
  const colors = STATUS_COLORS[cfg.variant];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 9px", borderRadius: 999,
      background: colors.bg, color: colors.ink, fontSize: 11, alignSelf: "flex-start", flexShrink: 0,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: 999, background: colors.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

/* ── OrdersTable ── */
function OrdersTable({ orders, onOpen, mob }: {
  orders: Order[]; onOpen?: (o: Order) => void; mob: boolean;
}) {
  const productLabel = (o: Order) =>
    o.coffee?.name ?? o.course?.title ?? o.subscription?.name ?? "—";

  if (orders.length === 0) {
    return (
      <div style={{ padding: "48px 24px", textAlign: "center", background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 16 }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--ink-2)" }}>
          Nenhum pedido ainda
        </div>
        <p style={{ fontSize: 14, color: "var(--ink-2)", marginTop: 8 }}>Seus pedidos aparecerão aqui.</p>
        <Link to="/explore" style={{
          display: "inline-flex", marginTop: 16, padding: "10px 24px",
          background: "var(--ink)", color: "var(--c-leveza)", borderRadius: 999, fontSize: 14, textDecoration: "none",
        }}>
          Explorar Catálogo
        </Link>
      </div>
    );
  }

  if (mob) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {orders.map(o => (
          <div key={o.id} onClick={() => onOpen?.(o)} style={{
            background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 12,
            padding: "11px 12px", cursor: onOpen ? "pointer" : "default",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6, marginBottom: 7 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{productLabel(o)}</div>
                <div className="mono" style={{ fontSize: 10, color: "var(--ink-2)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>#{o.id.slice(0, 7).toUpperCase()} · {fmtDate(o.createdAt)}</div>
              </div>
              <StatusBadge status={o.status} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="serif" style={{ fontSize: 16 }}>{fmt(o.totalPrice)}</span>
              <span style={{ color: "var(--ink-2)" }}><Arrow size={11} /></span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 16, overflowX: "auto" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "110px 1fr 130px 120px auto",
        minWidth: 560,
        padding: "12px 20px", background: "var(--bg-2)", borderBottom: "1px solid var(--line)",
      }}>
        {["Pedido", "Produto", "Data", "Valor", "Status"].map((h, i) => (
          <span key={i} className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)" }}>
            {h}
          </span>
        ))}
      </div>
      {orders.map((o, i) => (
        <div
          key={o.id}
          onClick={() => onOpen?.(o)}
          style={{
            display: "grid",
            gridTemplateColumns: "110px 1fr 130px 120px auto",
            minWidth: 560,
            padding: "16px 20px", alignItems: "center",
            borderTop: i ? "1px solid var(--line)" : "none", fontSize: 14,
            cursor: onOpen ? "pointer" : "default",
            transition: "background .1s",
          }}
          onMouseEnter={e => { if (onOpen) (e.currentTarget as HTMLDivElement).style.background = "var(--bg-2)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = ""; }}
        >
          <span className="mono" style={{ fontSize: 12, color: "var(--ink-2)" }}>
            #{o.id.slice(0, 7).toUpperCase()}
          </span>
          <span style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>
            {productLabel(o)}
          </span>
          <span className="mono" style={{ fontSize: 12, color: "var(--ink-2)" }}>{fmtDate(o.createdAt)}</span>
          <span className="serif" style={{ fontSize: 17 }}>{fmt(o.totalPrice)}</span>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <StatusBadge status={o.status} />
            <span style={{ color: "var(--ink-2)", flexShrink: 0 }}><Arrow size={12} /></span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── OrdersSection ── */
function OrdersSection({ orders, onGoAll, onOpen, mob }: { orders: Order[]; onGoAll: () => void; onOpen: (o: Order) => void; mob: boolean }) {
  return (
    <section style={{ marginBottom: 36 }}>
      <SectionHeader
        title="Últimos pedidos"
        subtitle={`Seus ${Math.min(orders.length, 4)} pedidos mais recentes`}
        cta={{ label: "Ver todos os pedidos", onClick: onGoAll }}
      />
      <OrdersTable orders={orders.slice(0, 4)} onOpen={onOpen} mob={mob} />
    </section>
  );
}

/* ── CourseProgressCard ── */
function CourseProgressCard({ course, idx, compact = false }: { course: Course; idx: number; compact?: boolean }) {
  const navigate = useNavigate();
  const bgColor  = COVER_COLORS[idx % COVER_COLORS.length];
  const inkColor = COVER_INK[idx % COVER_INK.length];
  const percent  = course.progress ?? 0;
  const done     = percent === 100;
  const words    = (course.title ?? "").split(" ");
  const head     = words.slice(0, 2).join(" ");
  const tail     = words.slice(2).join(" ");

  return (
    <article style={{
      borderRadius: 16, background: "var(--paper)",
      border: done ? "1.5px solid var(--c-glamour)" : "1px solid var(--line)",
      display: "grid", gridTemplateColumns: compact ? "120px 1fr" : "180px 1fr", overflow: "hidden",
      boxShadow: done ? "0 0 0 1px var(--c-glamour)20" : undefined,
    }}>
      {/* Cover */}
      <div style={{
        background: done ? "var(--c-glamour)" : bgColor,
        color: done ? "var(--c-leveza)" : inkColor,
        padding: compact ? 14 : 18, display: "flex", flexDirection: "column", justifyContent: "space-between",
        position: "relative", borderRight: "1px solid var(--ink)",
      }}>
        <div className="mono" style={{ fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", opacity: 0.65 }}>
          íle academy
        </div>
        <div className="serif" style={{ fontSize: compact ? 16 : 22, lineHeight: 1.05, letterSpacing: "-.01em" }}>
          {head}<br /><span className="italic">{tail}</span>
        </div>
        <span style={{
          position: "absolute", right: 10, top: 10,
          width: 32, height: 32, borderRadius: 999,
          background: done ? "rgba(255,255,255,.2)" : (inkColor === "var(--ink)" ? "var(--ink)" : "var(--c-leveza)"),
          color: done ? "var(--c-leveza)" : (inkColor === "var(--ink)" ? "var(--c-leveza)" : "var(--ink)"),
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: done ? 14 : undefined,
        }}>
          {done ? "✓" : <PlayIcon size={12} color={inkColor === "var(--ink)" ? "var(--c-leveza)" : "var(--ink)"} />}
        </span>
      </div>
      {/* Body */}
      <div style={{ padding: compact ? "14px 16px" : "18px 20px", display: "flex", flexDirection: "column", gap: compact ? 6 : 10 }}>
        <div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: done ? "var(--c-glamour)" : "var(--ink-2)" }}>
            {done ? "Concluído ✓" : "Continue de onde parou"}
          </div>
          <div className="serif" style={{ fontSize: compact ? 15 : 18, lineHeight: 1.2, letterSpacing: "-.01em", marginTop: 4 }}>
            {course.title}
          </div>
          {!compact && course.description && (
            <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 4, lineHeight: 1.4 }}>
              {course.description.slice(0, 80)}{course.description.length > 80 ? "…" : ""}
            </div>
          )}
        </div>
        <div style={{ marginTop: "auto" }}>
          {course.totalLessons != null && (
            <div className="mono" style={{ fontSize: 10, color: "var(--ink-2)", marginBottom: 4 }}>
              {course.completedLessons ?? 0}/{course.totalLessons} aulas
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--ink-2)", marginBottom: 5 }}>
            <span className="mono" style={{ letterSpacing: ".12em", textTransform: "uppercase" }}>Progresso</span>
            <span><b style={{ color: done ? "var(--c-glamour)" : "var(--ink)" }}>{percent}</b>%</span>
          </div>
          <div style={{ height: 6, background: "var(--bg-2)", borderRadius: 999 }}>
            <div style={{
              height: "100%", width: `${percent}%`,
              background: done
                ? "linear-gradient(90deg, var(--c-glamour), #2e7244)"
                : "linear-gradient(90deg, var(--c-mostarda), var(--c-vibra))",
              borderRadius: 999,
            }} />
          </div>
        </div>
        <button
          onClick={() => navigate(`/course/${course.id}`)}
          style={{
            marginTop: 4, display: "inline-flex", alignItems: "center", gap: 8,
            padding: compact ? "8px 12px" : "10px 14px", borderRadius: 999, fontSize: 13,
            background: done ? "var(--c-glamour)" : "var(--ink)",
            color: "var(--c-leveza)",
            border: "none", cursor: "pointer", fontFamily: "inherit", alignSelf: "flex-start",
          }}
        >
          {done ? "Ver curso" : <><PlayIcon color="var(--c-leveza)" /> Continuar</>}
        </button>
      </div>
    </article>
  );
}

/* ── ContinueLearning ── */
function ContinueLearning({ courses, onGoAll, mob }: { courses: Course[]; onGoAll: () => void; mob: boolean }) {
  if (courses.length === 0) return null;
  return (
    <section style={{ marginBottom: 36 }}>
      <SectionHeader
        title="Continue aprendendo"
        subtitle="Cursos em andamento — retome de onde parou"
        cta={{ label: "Ver todos os cursos", onClick: onGoAll }}
      />
      <div className="ile-courses-grid">
        {courses.slice(0, 4).map((c, i) => <CourseProgressCard key={c.id} course={c} idx={i} compact={mob} />)}
      </div>
    </section>
  );
}

/* ── CustomerDashboard ── */
export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logout, updateUser } = useAuth();
  const mob = useMobile();

  const tabFromUrl = (searchParams.get("tab") as TabId) || "HOME";
  const [active, setActive] = useState<TabId>(tabFromUrl);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [favLoading, setFavLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const [profileForm, setProfileForm] = useState({
    name: "", phoneNumber: "", cep: "", street: "", number: "", district: "", city: "", state: "", complement: "",
  });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const profilePhotoRef = useRef<HTMLInputElement>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    const t = searchParams.get("tab") as TabId;
    if (t) setActive(t);
  }, [searchParams]);

  function goTab(t: TabId) {
    setActive(t);
    setSearchParams(t !== "HOME" ? { tab: t } : {});
  }

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.get<Order[]>("/orders"),
      api.get<Course[]>("/courses").then(async res => {
        try {
          const enroll = await api.get<{
            courseId: string; progress: number;
            totalLessons: number; completedLessons: number; workloadHours: number;
          }[]>("/courses/my-enrollments");
          const enrollMap = new Map(enroll.data.map(e => [e.courseId, e]));
          return res.data.map(c => {
            const e = enrollMap.get(c.id);
            return {
              ...c,
              enrolled: !!e,
              progress: e?.progress ?? 0,
              totalLessons: e?.totalLessons,
              completedLessons: e?.completedLessons,
              workloadHours: e?.workloadHours ?? c.workloadHours,
            };
          });
        } catch {
          return res.data;
        }
      }).catch(() => []),
    ])
      .then(([ordersRes, coursesData]) => {
        setOrders(ordersRes.data);
        setCourses(coursesData as Course[]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: (user.name as string) ?? "",
        phoneNumber: (user.phoneNumber as string) ?? "",
        cep: (user.cep as string) ?? "",
        street: (user.street as string) ?? "",
        number: (user.number as string) ?? "",
        district: (user.district as string) ?? "",
        city: (user.city as string) ?? "",
        state: (user.state as string) ?? "",
        complement: (user.complement as string) ?? "",
      });
      setProfilePhotoPreview((user.photoUrl as string) ?? null);
    }
  }, [user?.id]);

  const handleProfilePhotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setProfilePhoto(file);
    if (file) setProfilePhotoPreview(URL.createObjectURL(file));
  }, []);

  async function saveProfile() {
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const body = new FormData();
      Object.entries(profileForm).forEach(([k, v]) => { if (v) body.append(k, v); });
      if (profilePhoto) body.append("photo", profilePhoto);
      const { data } = await api.put("/users/profile", body);
      updateUser(data as Record<string, unknown>);
      setProfilePhoto(null);
      setProfileMsg({ ok: true, text: "Perfil atualizado com sucesso." });
    } catch {
      setProfileMsg({ ok: false, text: "Erro ao salvar. Verifique os dados e tente novamente." });
    } finally {
      setProfileLoading(false);
    }
  }

  async function cancelOrder(id: string) {
    try {
      await api.patch(`/orders/${id}/cancel`);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: "CANCELED" } : o));
    } catch {/* ignore */}
  }

  async function pauseSubscription(id: string) {
    try {
      const { data } = await api.patch(`/orders/${id}/pause`);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, subscriptionStatus: data.subscriptionStatus, pausedAt: data.pausedAt } : o));
    } catch {/* ignore */}
  }

  async function resumeSubscription(id: string) {
    try {
      const { data } = await api.patch(`/orders/${id}/resume`);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, subscriptionStatus: data.subscriptionStatus, pausedAt: null } : o));
    } catch {/* ignore */}
  }

  async function removeFavorite(coffeeId: string) {
    try {
      await api.delete(`/favorites/${coffeeId}`);
      setFavorites(prev => prev.filter(f => f.coffeeId !== coffeeId));
    } catch {/* ignore */}
  }

  useEffect(() => {
    if (active !== "FAVORITES" || !user) return;
    setFavLoading(true);
    api.get<Favorite[]>("/favorites")
      .then(r => setFavorites(r.data))
      .catch(() => {})
      .finally(() => setFavLoading(false));
  }, [active, user]);

  const enrolledCourses        = courses.filter(c => c.enrolled);
  const activeOrders           = orders.filter(o => ["PAID", "PROCESSING", "SHIPPED"].includes(o.status));
  const shippedOrders          = orders.filter(o => o.status === "SHIPPED");
  const activeSubscriptionOrders = orders.filter(o => o.type === "SUBSCRIPTION" && o.status === "PAID");

  const userName    = user?.name ?? "Visitante";
  const accountType = user?.accountType ?? "CUSTOMER";
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    : "—";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onCancel={async (id) => {
            await cancelOrder(id);
            setSelectedOrder(prev => prev ? { ...prev, status: "CANCELED" } : null);
          }}
        />
      )}
      <DashHeader userName={userName} accountType={accountType} photoUrl={user?.photoUrl as string | null} onLogout={() => { logout(); navigate("/"); }} onNavigate={goTab} />

      <main className="ile-dash-main">
        <Sidebar
          accountType={accountType}
          active={active}
          setActive={goTab}
          ordersBadge={activeOrders.length}
          coursesBadge={enrolledCourses.length}
          userName={userName}
          userEmail={user?.email ?? ""}
          memberSince={memberSince}
          photoUrl={user?.photoUrl as string | null}
          mob={mob}
        />

        <div>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}>
              <div className="mono" style={{ fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--ink-2)" }}>
                Carregando…
              </div>
            </div>
          ) : (
            <>
              {/* HOME */}
              {active === "HOME" && (
                <>
                  <Welcome userName={userName} />
                  <SummaryCards
                    activeOrdersCount={activeOrders.length}
                    shippedCount={shippedOrders.length}
                    activeSubOrders={activeSubscriptionOrders}
                    enrolledCourses={enrolledCourses}
                    onGoOrders={() => goTab("ORDERS")}
                    onGoSubscription={() => activeSubscriptionOrders.length > 0 ? goTab("SUBSCRIPTION") : navigate("/subscriptions")}
                    onGoCourses={() => goTab("COURSES")}
                  />
                  <OrdersSection orders={orders} onGoAll={() => goTab("ORDERS")} onOpen={setSelectedOrder} mob={mob} />
                  <ContinueLearning courses={enrolledCourses} onGoAll={() => goTab("COURSES")} mob={mob} />
                </>
              )}

              {/* ORDERS */}
              {active === "ORDERS" && (
                <>
                  <div style={{ marginBottom: 28 }}>
                    <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 12 }}>
                      <span style={{ color: "var(--c-vibra)" }}>§</span>&nbsp; Histórico
                    </div>
                    <h1 className="serif" style={{ margin: 0, fontSize: "clamp(44px, 5vw, 64px)", lineHeight: 0.95, letterSpacing: "-.025em" }}>
                      Meus <span className="italic" style={{ color: "var(--c-vibra)" }}>pedidos</span>.
                    </h1>
                    <p style={{ fontSize: 14, color: "var(--ink-2)", marginTop: 8 }}>
                      {orders.length} pedido{orders.length !== 1 ? "s" : ""} no total
                    </p>
                  </div>
                  <OrdersTable orders={orders} onOpen={setSelectedOrder} mob={mob} />
                </>
              )}

              {/* SUBSCRIPTION */}
              {active === "SUBSCRIPTION" && (
                activeSubscriptionOrders.length === 0 ? (
                  <div style={{ padding: "48px 32px", textAlign: "center", background: "var(--paper)", border: "1px dashed var(--line)", borderRadius: 16 }}>
                    <div className="mono" style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--ink-2)" }}>
                      Nenhuma assinatura ativa
                    </div>
                    <p style={{ fontSize: 14, color: "var(--ink-2)", marginTop: 8, maxWidth: 380, marginInline: "auto" }}>
                      Você ainda não possui assinaturas ativas. Explore nossos planos e receba café em casa todo mês.
                    </p>
                    <Link to="/subscriptions" style={{
                      display: "inline-flex", marginTop: 16, padding: "10px 24px",
                      background: "var(--ink)", color: "var(--c-leveza)", borderRadius: 999, fontSize: 14, textDecoration: "none",
                    }}>
                      Ver planos de assinatura
                    </Link>
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                      <div>
                        <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 12 }}>
                          <span style={{ color: "var(--c-vibra)" }}>§</span>&nbsp; Assinaturas
                        </div>
                        <h1 className="serif" style={{ margin: 0, fontSize: "clamp(44px, 5vw, 64px)", lineHeight: 0.95, letterSpacing: "-.025em" }}>
                          Minhas <span className="italic" style={{ color: "var(--c-vibra)" }}>assinaturas</span>.
                        </h1>
                      </div>
                      <Link to="/subscriptions" style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        padding: "10px 20px", borderRadius: 999,
                        border: "1px solid var(--ink)", fontSize: 13,
                        color: "var(--ink)", textDecoration: "none", whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}>
                        Explorar planos
                        <svg width={12} height={12} viewBox="0 0 14 14" fill="none">
                          <path d="M2.5 7h9M7.8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </Link>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                      {activeSubscriptionOrders.map(order => {
                        const isPaused = order.subscriptionStatus === "PAUSED";
                        return (
                          <div key={order.id} style={{ background: "var(--paper)", border: `1px solid ${isPaused ? "var(--c-mostarda)" : "var(--line)"}`, borderRadius: 16, padding: "24px 22px" }}>
                            <div className="mono" style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 8 }}>
                              {isPaused ? "Assinatura pausada" : "Assinatura ativa"}
                            </div>
                            <h3 className="serif" style={{ margin: "0 0 12px", fontSize: 22, color: "var(--ink)" }}>
                              {order.subscription?.name ?? "—"}
                            </h3>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                              {isPaused ? (
                                <span style={{
                                  display: "inline-flex", alignItems: "center", gap: 6,
                                  fontSize: 12, padding: "5px 10px", borderRadius: 999,
                                  background: "rgba(229,138,42,.14)", color: "var(--c-mostarda)",
                                  border: "1px solid var(--c-mostarda)",
                                }}>
                                  <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--c-mostarda)", flexShrink: 0 }} />
                                  Pausada
                                </span>
                              ) : (
                                <span style={{
                                  display: "inline-flex", alignItems: "center", gap: 6,
                                  fontSize: 12, padding: "5px 10px", borderRadius: 999,
                                  background: "rgba(46,114,68,.14)", color: "var(--success)",
                                  border: "1px solid var(--success)",
                                }}>
                                  <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--success)", flexShrink: 0 }} />
                                  Ativa
                                </span>
                              )}
                              <span style={{ fontSize: 12, color: "var(--ink-2)" }}>desde {fmtDate(order.createdAt)}</span>
                            </div>
                            <div className="serif" style={{ fontSize: 20, color: "var(--ink)", marginBottom: 2 }}>{fmt(order.totalPrice)}</div>
                            <div style={{ fontSize: 12, color: "var(--ink-2)", marginBottom: 20 }}>por ciclo de cobrança</div>
                            <div style={{ display: "flex", gap: 8 }}>
                              {isPaused ? (
                                <button
                                  onClick={() => resumeSubscription(order.id)}
                                  style={{
                                    flex: 1, padding: "9px 0", borderRadius: 999, border: "none",
                                    background: "var(--ink)", color: "var(--c-leveza)", fontSize: 13,
                                    cursor: "pointer", fontFamily: "inherit",
                                  }}
                                >
                                  Retomar assinatura
                                </button>
                              ) : (
                                <button
                                  onClick={() => pauseSubscription(order.id)}
                                  style={{
                                    flex: 1, padding: "9px 0", borderRadius: 999,
                                    border: "1px solid var(--line)", background: "transparent",
                                    fontSize: 13, cursor: "pointer", fontFamily: "inherit", color: "var(--ink-2)",
                                  }}
                                >
                                  Pausar entregas
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )
              )}

              {/* COURSES */}
              {active === "COURSES" && (() => {
                const doneCourses = enrolledCourses.filter(c => (c.progress ?? 0) === 100);
                const inProgress  = enrolledCourses.filter(c => (c.progress ?? 0) < 100);
                return (
                  <>
                    <div style={{ marginBottom: 28 }}>
                      <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 12 }}>
                        <span style={{ color: "var(--c-vibra)" }}>§</span>&nbsp; Educação
                      </div>
                      <h1 className="serif" style={{ margin: 0, fontSize: "clamp(44px, 5vw, 64px)", lineHeight: 0.95, letterSpacing: "-.025em" }}>
                        Meus <span className="italic" style={{ color: "var(--c-vibra)" }}>cursos</span>.
                      </h1>
                      {enrolledCourses.length > 0 && (
                        <div style={{ display: "flex", gap: 20, marginTop: 16 }}>
                          <div className="mono" style={{ fontSize: 12, color: "var(--ink-2)" }}>
                            <b style={{ color: "var(--ink)", fontSize: 20 }}>{enrolledCourses.length}</b> matriculado{enrolledCourses.length !== 1 ? "s" : ""}
                          </div>
                          <div className="mono" style={{ fontSize: 12, color: "var(--ink-2)" }}>
                            <b style={{ color: "var(--c-glamour)", fontSize: 20 }}>{doneCourses.length}</b> concluído{doneCourses.length !== 1 ? "s" : ""}
                          </div>
                          <div className="mono" style={{ fontSize: 12, color: "var(--ink-2)" }}>
                            <b style={{ color: "var(--c-vibra)", fontSize: 20 }}>{inProgress.length}</b> em andamento
                          </div>
                        </div>
                      )}
                    </div>

                    {enrolledCourses.length === 0 ? (
                      <div style={{ padding: "48px 32px", textAlign: "center", background: "var(--paper)", border: "1px dashed var(--line)", borderRadius: 16 }}>
                        <div className="mono" style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--ink-2)" }}>
                          Nenhum curso iniciado
                        </div>
                        <p style={{ fontSize: 14, color: "var(--ink-2)", marginTop: 8 }}>Explore nosso catálogo de cursos.</p>
                        <Link to="/courses" style={{
                          display: "inline-flex", marginTop: 16, padding: "10px 24px",
                          background: "var(--ink)", color: "var(--c-leveza)", borderRadius: 999, fontSize: 14, textDecoration: "none",
                        }}>
                          Ver Cursos
                        </Link>
                      </div>
                    ) : (
                      <>
                        {inProgress.length > 0 && (
                          <section style={{ marginBottom: 36 }}>
                            <div className="mono" style={{ fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 14 }}>
                              Em andamento · {inProgress.length}
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 14 }}>
                              {inProgress.map((c, i) => <CourseProgressCard key={c.id} course={c} idx={i} compact />)}
                            </div>
                          </section>
                        )}

                        {doneCourses.length > 0 && (
                          <section>
                            <div className="mono" style={{ fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--c-glamour)", marginBottom: 14 }}>
                              Concluídos · {doneCourses.length}
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 14 }}>
                              {doneCourses.map((c, i) => <CourseProgressCard key={c.id} course={c} idx={i + inProgress.length} compact />)}
                            </div>
                          </section>
                        )}

                        <div style={{ marginTop: 28, textAlign: "center" }}>
                          <Link to="/courses" style={{
                            display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 24px",
                            border: "1px solid var(--line)", borderRadius: 999, fontSize: 13,
                            color: "var(--ink-2)", textDecoration: "none",
                          }}>
                            Explorar mais cursos →
                          </Link>
                        </div>
                      </>
                    )}
                  </>
                );
              })()}

              {/* FAVORITES */}
              {active === "FAVORITES" && (
                <>
                  <div style={{ marginBottom: 28 }}>
                    <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 12 }}>
                      <span style={{ color: "var(--c-vibra)" }}>§</span>&nbsp; Sua lista
                    </div>
                    <h1 className="serif" style={{ margin: 0, fontSize: "clamp(44px, 5vw, 64px)", lineHeight: 0.95, letterSpacing: "-.025em" }}>
                      Meus <span className="italic" style={{ color: "var(--c-vibra)" }}>favoritos</span>.
                    </h1>
                  </div>
                  {favLoading ? (
                    <div style={{ padding: "48px 32px", textAlign: "center", color: "var(--ink-2)", fontSize: 14 }}>Carregando...</div>
                  ) : favorites.length === 0 ? (
                    <div style={{ padding: "48px 32px", textAlign: "center", background: "var(--paper)", border: "1px dashed var(--line)", borderRadius: 16 }}>
                      <div className="mono" style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--ink-2)" }}>
                        Nenhum favorito ainda
                      </div>
                      <p style={{ fontSize: 14, color: "var(--ink-2)", marginTop: 8, maxWidth: 380, marginInline: "auto" }}>
                        Explore o catálogo e adicione cafés à sua lista de favoritos.
                      </p>
                      <Link to="/coffees" style={{
                        display: "inline-flex", marginTop: 16, padding: "10px 24px",
                        background: "var(--ink)", color: "var(--c-leveza)", borderRadius: 999, fontSize: 14, textDecoration: "none",
                      }}>
                        Ver catálogo
                      </Link>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
                      {favorites.map(fav => (
                        <div key={fav.id} style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                          <div style={{ height: 140, background: "var(--bg)", overflow: "hidden" }}>
                            {fav.coffee?.photoUrl ? (
                              <img src={fav.coffee.photoUrl} alt={fav.coffee.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <span style={{ fontSize: 40 }}>☕</span>
                              </div>
                            )}
                          </div>
                          <div style={{ padding: "16px 16px 12px", flex: 1, display: "flex", flexDirection: "column" }}>
                            <div className="serif" style={{ fontSize: 18, marginBottom: 4, color: "var(--ink)", lineHeight: 1.2 }}>
                              {fav.coffee?.name ?? "—"}
                            </div>
                            <div style={{ fontSize: 12, color: "var(--ink-2)", marginBottom: 12 }}>
                              {fav.coffee?.packagePrice != null
                                ? fmt(fav.coffee.packagePrice)
                                : fav.coffee?.pricePerKg != null
                                  ? `${fmt(fav.coffee.pricePerKg)}/kg`
                                  : "—"}
                            </div>
                            <div style={{ marginTop: "auto", display: "flex", gap: 8 }}>
                              <Link
                                to={`/product/${fav.coffeeId}`}
                                style={{
                                  flex: 1, padding: "8px 0", borderRadius: 999, textAlign: "center",
                                  background: "var(--ink)", color: "var(--c-leveza)", fontSize: 12,
                                  textDecoration: "none", fontFamily: "inherit",
                                }}
                              >
                                Ver produto
                              </Link>
                              <button
                                onClick={() => removeFavorite(fav.coffeeId)}
                                style={{
                                  padding: "8px 12px", borderRadius: 999,
                                  border: "1px solid var(--line)", background: "transparent",
                                  fontSize: 12, cursor: "pointer", color: "var(--ink-2)", fontFamily: "inherit",
                                }}
                                title="Remover dos favoritos"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* PROFILE */}
              {active === "PROFILE" && (
                <>
                  <div style={{ marginBottom: 28 }}>
                    <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 12 }}>
                      <span style={{ color: "var(--c-vibra)" }}>§</span>&nbsp; Conta
                    </div>
                    <h1 className="serif" style={{ margin: 0, fontSize: "clamp(44px, 5vw, 64px)", lineHeight: 0.95, letterSpacing: "-.025em" }}>
                      Meu <span className="italic" style={{ color: "var(--c-vibra)" }}>perfil</span>.
                    </h1>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 20, maxWidth: 780 }}>
                    {/* Edit form */}
                    <div style={{ gridColumn: "1 / -1", background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 16, padding: mob ? "20px 16px" : "28px 28px 24px" }}>
                      <div className="serif" style={{ fontSize: 22, letterSpacing: "-.01em", marginBottom: 22 }}>Editar informações</div>

                      {/* Photo */}
                      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 22, paddingBottom: 22, borderBottom: "1px solid var(--line)" }}>
                        <div style={{ width: 72, height: 72, borderRadius: 999, flexShrink: 0, overflow: "hidden", background: accountType === "COFFEESHOP" ? "var(--c-glamour)" : "var(--c-mostarda)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--line)" }}>
                          {profilePhotoPreview
                            ? <img src={profilePhotoPreview} alt="Foto" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : <span style={{ fontWeight: 600, fontSize: 22, color: accountType === "COFFEESHOP" ? "var(--c-leveza)" : "var(--ink)" }}>{getInitials(userName)}</span>
                          }
                        </div>
                        <div>
                          <input ref={profilePhotoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleProfilePhotoChange} />
                          <button type="button" onClick={() => profilePhotoRef.current?.click()} style={{ padding: "8px 16px", borderRadius: 999, border: "1px solid var(--line)", background: "var(--bg)", fontSize: 13, cursor: "pointer", fontFamily: "inherit", color: "var(--ink)", display: "block", marginBottom: 6 }}>
                            {profilePhoto ? "Trocar foto" : "Alterar foto"}
                          </button>
                          <div style={{ fontSize: 12, color: "var(--ink-2)" }}>
                            {profilePhoto ? profilePhoto.name : "JPG, PNG ou WEBP"}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 14 }}>
                        {[
                          { label: "Nome completo", key: "name", placeholder: "Seu nome" },
                          { label: "Telefone", key: "phoneNumber", placeholder: "(11) 99999-9999" },
                          { label: "CEP", key: "cep", placeholder: "00000000" },
                          { label: "Rua / Logradouro", key: "street", placeholder: "Rua das Flores" },
                          { label: "Número", key: "number", placeholder: "123" },
                          { label: "Bairro", key: "district", placeholder: "Centro" },
                          { label: "Cidade", key: "city", placeholder: "São Paulo" },
                          { label: "UF", key: "state", placeholder: "SP" },
                        ].map(f => (
                          <div key={f.key}>
                            <label className="mono" style={{ display: "block", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 6 }}>{f.label}</label>
                            <input
                              type="text"
                              value={(profileForm as Record<string, string>)[f.key]}
                              placeholder={f.placeholder}
                              onChange={e => setProfileForm(p => ({ ...p, [f.key]: e.target.value }))}
                              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--bg)", fontSize: 14, fontFamily: "inherit", outline: "none", color: "var(--ink)", boxSizing: "border-box" }}
                            />
                          </div>
                        ))}
                        <div style={{ gridColumn: "1 / -1" }}>
                          <label className="mono" style={{ display: "block", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 6 }}>Complemento</label>
                          <input
                            type="text"
                            value={profileForm.complement}
                            placeholder="Apto 42, Bloco B…"
                            onChange={e => setProfileForm(p => ({ ...p, complement: e.target.value }))}
                            style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--bg)", fontSize: 14, fontFamily: "inherit", outline: "none", color: "var(--ink)", boxSizing: "border-box" }}
                          />
                        </div>
                      </div>

                      {profileMsg && (
                        <div style={{ marginTop: 16, padding: "10px 14px", borderRadius: 10, fontSize: 13, background: profileMsg.ok ? "rgba(46,114,68,.10)" : "rgba(231,64,44,.10)", color: profileMsg.ok ? "var(--success)" : "var(--c-vibra)", border: `1px solid ${profileMsg.ok ? "var(--success)" : "var(--c-vibra)"}` }}>
                          {profileMsg.text}
                        </div>
                      )}

                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
                        <button
                          onClick={saveProfile}
                          disabled={profileLoading}
                          style={{ padding: "11px 24px", borderRadius: 999, background: "var(--ink)", color: "var(--c-leveza)", border: 0, fontSize: 14, cursor: profileLoading ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: profileLoading ? 0.7 : 1 }}
                        >
                          {profileLoading ? "Salvando…" : "Salvar alterações"}
                        </button>
                      </div>
                    </div>

                    {/* Account info + logout */}
                    <div style={{ gridColumn: "1 / -1", background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 16, padding: mob ? "20px 16px" : "24px 28px", display: "flex", alignItems: mob ? "flex-start" : "center", justifyContent: "space-between", gap: 16, flexDirection: mob ? "column" : "row" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0, flex: 1 }}>
                        <Avatar
                          photoUrl={profilePhotoPreview}
                          initial={getInitials(userName)}
                          size={52}
                          bg={accountType === "COFFEESHOP" ? "var(--c-glamour)" : "var(--c-mostarda)"}
                          color={accountType === "COFFEESHOP" ? "var(--c-leveza)" : "var(--ink)"}
                        />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div className="serif" style={{ fontSize: 18, letterSpacing: "-.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userName}</div>
                          <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => logout()}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", border: "1px solid var(--c-vibra)", borderRadius: 10, background: "transparent", cursor: "pointer", fontFamily: "inherit", fontSize: 14, color: "var(--c-vibra)", width: mob ? "100%" : undefined, justifyContent: mob ? "center" : undefined, flexShrink: 0 }}
                      >
                        <IconLogout /> Sair da conta
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>

      <footer style={{ borderTop: "1px solid var(--line)", padding: "24px 32px" }}>
        <div style={{
          maxWidth: 1320, margin: "0 auto",
          display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
          fontSize: 12, color: "var(--ink-2)",
        }}>
          <span className="mono" style={{ letterSpacing: ".12em", textTransform: "uppercase" }}>
            © 2026 Ilé Coffees · desde 1934
          </span>
          <div style={{ display: "flex", gap: 18 }}>
            <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>Home</Link>
            <Link to="/explore" style={{ textDecoration: "none", color: "inherit" }}>Cafés</Link>
            <Link to="/courses" style={{ textDecoration: "none", color: "inherit" }}>Cursos</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
