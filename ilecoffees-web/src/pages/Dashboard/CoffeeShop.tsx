import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { CartButton } from "@/components/Cart/CartButton";
import OrderDetailModal from "@/components/OrderDetailModal";

interface CoffeeItem {
  id: string;
  name: string;
  description: string | null;
  pricePerKg: number | null;
  packagePrice: number | null;
  packagePriceCoffeeshop: number | null;
  saleType: "KG" | "PACKAGE" | "BOTH";
  photoUrl: string | null;
  supplier?: { name: string };
}


interface Course {
  id: string;
  title: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  enrolled?: boolean;
  progress?: number;
}

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
  coffee?: { id: string; name: string; photoUrl?: string | null; saleType?: string } | null;
  course?: { id: string; title: string; imageUrl?: string | null } | null;
  subscription?: { id: string; name: string } | null;
  payment?: { status: string; method?: string | null; paidAt?: string | null; amount: number } | null;
}

interface StockItem {
  userId: string;
  coffeeId: string;
  quantity: number;
  alertAt?: number | null;
  updatedAt?: string;
  coffee?: {
    id: string;
    name: string;
    photoUrl?: string | null;
    saleType: string;
    pricePerKg?: number | null;
    packagePriceCoffeeshop?: number | null;
    supplier?: { id: string; name: string };
  };
}

interface EmployeeStockLog {
  id: string;
  coffeeId: string;
  coffeeName: string;
  previousQty: number;
  newQty: number;
  createdAt: string;
}

interface EmployeeCourseView {
  courseId: string;
  courseName: string;
  viewedAt: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  photoUrl: string | null;
  lastAccessAt: string | null;
  createdAt: string;
  stockLogs: EmployeeStockLog[];
  courseViews: EmployeeCourseView[];
}

type TabId = "HOME" | "CATALOG" | "ORDERS" | "COURSES" | "SUBSCRIPTION" | "STOCK" | "FUNCIONARIOS" | "PROFILE";


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

function Arrow({ size = 14, dir = "right" }: { size?: number; dir?: "left" | "right" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none"
      style={{ transform: dir === "left" ? "rotate(180deg)" : "none", flexShrink: 0 }} aria-hidden="true">
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
function IconHome()    { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2.5 7L8 3l5.5 4v6a1 1 0 01-1 1H3.5a1 1 0 01-1-1V7z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M6.5 14V9.5h3V14" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>; }
function IconCoffee()  { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 5h8v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" stroke="currentColor" strokeWidth="1.3"/><path d="M11 6h1a2 2 0 010 4h-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M5 3c0-1 1-1.5 1-2.5M8 3c0-1 1-1.5 1-2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>; }
function IconBox()     { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4.5l6-2.5 6 2.5v7l-6 2.5-6-2.5v-7z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M2 4.5L8 7l6-2.5M8 7v7" stroke="currentColor" strokeWidth="1.3"/></svg>; }

function IconRepeat()  { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 5h9l-2-2M13 11H4l2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function IconBook()    { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3.5h4.5a1.5 1.5 0 011.5 1.5v8a1 1 0 00-1-1H3v-8.5zM13 3.5H8.5a1.5 1.5 0 00-1.5 1.5v8a1 1 0 011-1H13v-8.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>; }
function IconUser()    { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M3 14c.8-2.5 2.5-3.5 5-3.5s4.2 1 5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>; }
function IconLogout()  { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M9 3H4a1 1 0 00-1 1v8a1 1 0 001 1h5M11 5l3 3-3 3M14 8H7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function IconStock()   { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="8" width="3" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="6.5" y="5" width="3" height="9" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="11" y="2" width="3" height="12" rx="1" stroke="currentColor" strokeWidth="1.3"/></svg>; }
function IconTeam()    { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5.5" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M2 14c.7-2 2.2-3 4-3s3.3 1 4 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="11.5" cy="5" r="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M13.5 13c-.3-1.5-1.3-2.5-2.5-2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>; }
function IconBell()    { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5A3.5 3.5 0 003.5 5v3.5l-1 1v.5h9v-.5l-1-1V5A3.5 3.5 0 007 1.5zM5.5 11a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>; }

function Avatar({ photoUrl, initial, size, bg, color }: { photoUrl?: string | null; initial: string; size: number; bg: string; color: string }) {
  return (
    <span style={{ width: size, height: size, borderRadius: 999, flexShrink: 0, overflow: "hidden", background: bg, color, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: size * 0.35, letterSpacing: ".02em" }}>
      {photoUrl ? <img src={photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initial}
    </span>
  );
}

function DropdownItem({ icon, label, danger, onClick }: { icon: React.ReactNode; label: string; danger?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", borderRadius: 8, border: "none", fontSize: 14, color: danger ? "#b8231a" : "var(--ink)", background: "transparent", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-2)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
    >
      <span style={{ color: danger ? "#b8231a" : "var(--ink-2)" }}>{icon}</span> {label}
    </button>
  );
}

function DashHeader({ userName, photoUrl, onLogout, onNavigate }: { userName: string; photoUrl?: string | null; onLogout: () => void; onNavigate: (tab: TabId) => void }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const initial = getInitials(userName);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 30, background: "rgba(238,243,235,.92)", backdropFilter: "blur(10px)", borderBottom: "1px solid var(--line)" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "16px 32px", display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: 24 }}>
        <button onClick={() => onNavigate("HOME")} style={{ display: "inline-flex", alignItems: "baseline", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0, color: "inherit" }}>
          <span className="script" style={{ fontSize: 36, lineHeight: 0.75 }}>íle</span>
          <span className="serif italic" style={{ fontSize: 13, lineHeight: 1, color: "var(--c-vibra)" }}>coffees</span>
        </button>

        <div />

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <CartButton />
        <div ref={wrapRef} style={{ position: "relative" }}>
          <button onClick={() => setOpen(o => !o)} style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "6px 14px 6px 6px", borderRadius: 999, border: "1px solid var(--line)", background: "var(--paper)", cursor: "pointer", fontFamily: "inherit" }}>
            <Avatar photoUrl={photoUrl} initial={initial} size={34} bg="var(--c-glamour)" color="var(--c-leveza)" />
            <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 }}>
              <span style={{ fontSize: 14, color: "var(--ink)", fontWeight: 500, lineHeight: 1 }}>{userName.split(" ")[0]}</span>
              <span className="mono" style={{ fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-2)", lineHeight: 1 }}>Cafeteria</span>
            </span>
            <Chevron open={open} />
          </button>
          {open && (
            <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", zIndex: 40, minWidth: 240, background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 14, boxShadow: "0 24px 40px -20px rgba(28,8,16,.3)", padding: 8 }}>
              <DropdownItem icon={<IconUser />} label="Meu perfil" onClick={() => { onNavigate("PROFILE"); setOpen(false); }} />
              <DropdownItem icon={<IconBox />} label="Meus pedidos" onClick={() => { onNavigate("ORDERS"); setOpen(false); }} />
              <div style={{ height: 1, background: "var(--line)", margin: "6px 0" }} />
              <DropdownItem icon={<IconLogout />} label="Sair" danger onClick={onLogout} />
            </div>
          )}
        </div>
        </div>
      </div>
    </header>
  );
}

function Sidebar({ active, setActive, ordersBadge, userName, userEmail, memberSince, photoUrl }: {
  active: TabId; setActive: (t: TabId) => void;
  ordersBadge: number;
  userName: string; userEmail: string; memberSince: string; photoUrl?: string | null;
}) {
  const initial = getInitials(userName);
  const items: { id: TabId; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "HOME",         label: "Início",          icon: <IconHome /> },
    { id: "CATALOG",      label: "Catálogo B2B",    icon: <IconCoffee /> },
    { id: "ORDERS",       label: "Meus Pedidos",    icon: <IconBox />, badge: ordersBadge || undefined },
    { id: "SUBSCRIPTION", label: "Assinaturas",     icon: <IconRepeat /> },
    { id: "COURSES",      label: "Cursos",          icon: <IconBook /> },
    { id: "STOCK",        label: "Estoque",         icon: <IconStock /> },
    { id: "FUNCIONARIOS", label: "Funcionários",    icon: <IconTeam /> },
    { id: "PROFILE",      label: "Meu Perfil",      icon: <IconUser /> },
  ];
  return (
    <aside style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 18, padding: 22, position: "sticky", top: 96, alignSelf: "flex-start", display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 14 }}>
        <div style={{ position: "relative" }}>
          <span style={{ width: 64, height: 64, borderRadius: 999, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--paper)", boxShadow: "0 0 0 1px var(--line)" }}>
            <Avatar photoUrl={photoUrl} initial={initial} size={64} bg="var(--c-glamour)" color="var(--c-leveza)" />
          </span>
          <span style={{ position: "absolute", right: -2, bottom: -2, width: 18, height: 18, borderRadius: 999, background: "var(--success)", border: "2px solid var(--paper)" }} />
        </div>
        <div>
          <div className="serif" style={{ fontSize: 22, lineHeight: 1.05, letterSpacing: "-.01em" }}>{userName}</div>
          <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 4 }}>{userEmail}</div>
          <span className="mono" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10, fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", padding: "5px 10px", borderRadius: 999, background: "var(--c-glamour)", color: "var(--c-leveza)", border: "1px solid var(--ink)" }}>
            Cafeteria
          </span>
        </div>
      </div>

      <div style={{ height: 1, background: "var(--line)" }} />

      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {items.map(it => {
          const on = active === it.id;
          return (
            <button key={it.id} onClick={() => setActive(it.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 10, fontSize: 14, border: "none", cursor: "pointer", background: on ? "var(--ink)" : "transparent", color: on ? "var(--c-leveza)" : "var(--ink-2)", textAlign: "left", fontFamily: "inherit", transition: "background .12s" }}
              onMouseEnter={e => { if (!on) (e.currentTarget as HTMLElement).style.background = "var(--bg-2)"; }}
              onMouseLeave={e => { if (!on) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <span style={{ color: on ? "var(--c-mostarda)" : "var(--ink-2)" }}>{it.icon}</span>
              <span style={{ flex: 1 }}>{it.label}</span>
              {it.badge !== undefined && (
                <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 999, background: on ? "var(--c-mostarda)" : "var(--c-vibra)", color: on ? "var(--ink)" : "#fff" }}>
                  {it.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div style={{ height: 1, background: "var(--line)" }} />
      <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.55 }}>
        Parceira desde <b style={{ color: "var(--ink)" }}>{memberSince}</b>
      </div>
    </aside>
  );
}

function SectionHeader({ title, subtitle, cta }: { title: string; subtitle?: string; cta?: { label: string; onClick: () => void } }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18, gap: 16, flexWrap: "wrap" }}>
      <div>
        <h2 className="serif" style={{ margin: 0, fontSize: 32, lineHeight: 1.05, letterSpacing: "-.015em" }}>{title}</h2>
        {subtitle && <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 4 }}>{subtitle}</div>}
      </div>
      {cta && (
        <button onClick={cta.onClick} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--c-vibra)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
          {cta.label} <Arrow size={11} />
        </button>
      )}
    </div>
  );
}

function Welcome({ userName }: { userName: string }) {
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  return (
    <div style={{ marginBottom: 28 }}>
      <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)" }}>
        <span style={{ color: "var(--c-vibra)" }}>§</span>&nbsp; Bem-vinda de volta
      </div>
      <h1 className="serif" style={{ margin: "12px 0 0", fontSize: "clamp(44px, 5vw, 76px)", lineHeight: 0.95, letterSpacing: "-.025em" }}>
        {greet}, <span className="italic" style={{ color: "var(--c-vibra)" }}>{userName.split(" ")[0]}</span>.
      </h1>
    </div>
  );
}

function SummaryCard({ eyebrow, value, title, subtitle, badge, accent, dark, cta }: {
  eyebrow: string; value?: string; title?: string; subtitle?: string;
  badge?: { label: string; color: string }; accent: string; dark?: boolean;
  cta?: { label: string; onClick: () => void };
}) {
  return (
    <div style={{ padding: 20, borderRadius: 16, background: dark ? "var(--c-barro)" : "var(--paper)", color: dark ? "var(--c-leveza)" : "var(--ink)", border: `1px solid ${dark ? "var(--ink)" : "var(--line)"}`, display: "flex", flexDirection: "column", gap: 12, minHeight: 200, position: "relative", overflow: "hidden" }}>
      <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: dark ? "var(--c-mostarda)" : "var(--ink-2)" }}>{eyebrow}</div>
      <div>
        {value && <div className="serif" style={{ fontSize: 76, lineHeight: 0.9, letterSpacing: "-.04em" }}>{value}</div>}
        {title && <div className="serif" style={{ fontSize: 32, lineHeight: 1.05, letterSpacing: "-.015em", marginTop: 4 }}>{title}</div>}
        {subtitle && <div style={{ fontSize: 13, color: dark ? "rgba(244,204,160,.85)" : "var(--ink-2)", marginTop: 6 }}>{subtitle}</div>}
      </div>
      {badge && (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, padding: "5px 10px", borderRadius: 999, alignSelf: "flex-start", background: dark ? "rgba(244,204,160,.16)" : `color-mix(in srgb, ${badge.color} 18%, transparent)`, color: dark ? "var(--c-leveza)" : badge.color, border: `1px solid ${dark ? "rgba(244,204,160,.3)" : badge.color}` }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: badge.color, flexShrink: 0 }} />
          {badge.label}
        </span>
      )}
      {cta && (
        <button onClick={cta.onClick} style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: "auto", paddingTop: 6, fontSize: 13, color: dark ? "var(--c-mostarda)" : "var(--c-vibra)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", alignSelf: "flex-start" }}>
          {cta.label} <Arrow size={11} />
        </button>
      )}
      <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: accent }} />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, variant: "pending" as const };
  const colors = STATUS_COLORS[cfg.variant];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 10px", borderRadius: 999, background: colors.bg, color: colors.ink, fontSize: 12, alignSelf: "flex-start" }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: colors.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

function OrdersTable({ orders, onOpen }: { orders: Order[]; onOpen?: (o: Order) => void }) {
  if (orders.length === 0) {
    return (
      <div style={{ padding: "48px 24px", textAlign: "center", background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 16 }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--ink-2)" }}>Nenhum pedido ainda</div>
        <p style={{ fontSize: 14, color: "var(--ink-2)", marginTop: 8 }}>Seus pedidos aparecerão aqui.</p>
        <Link to="/explore" style={{ display: "inline-flex", marginTop: 16, padding: "10px 24px", background: "var(--ink)", color: "var(--c-leveza)", borderRadius: 999, fontSize: 14, textDecoration: "none" }}>
          Explorar Catálogo
        </Link>
      </div>
    );
  }
  const productLabel = (o: Order) =>
    o.coffee?.name ?? o.course?.title ?? o.subscription?.name ?? "—";
  return (
    <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "110px 1fr 130px 120px auto", padding: "12px 20px", background: "var(--bg-2)", borderBottom: "1px solid var(--line)" }}>
        {["Pedido", "Produto", "Data", "Valor", "Status"].map((h, i) => (
          <span key={i} className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)" }}>{h}</span>
        ))}
      </div>
      {orders.map((o, i) => (
        <div
          key={o.id}
          onClick={() => onOpen?.(o)}
          style={{ display: "grid", gridTemplateColumns: "110px 1fr 130px 120px auto", padding: "16px 20px", alignItems: "center", borderTop: i ? "1px solid var(--line)" : "none", fontSize: 14, cursor: onOpen ? "pointer" : "default", transition: "background .1s" }}
          onMouseEnter={e => { if (onOpen) (e.currentTarget as HTMLDivElement).style.background = "var(--bg-2)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = ""; }}
        >
          <span className="mono" style={{ fontSize: 12, color: "var(--ink-2)" }}>#{o.id.slice(0, 7).toUpperCase()}</span>
          <span style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>{productLabel(o)}</span>
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


export default function CoffeeShopDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logout, updateUser } = useAuth();

  const VALID_TABS: TabId[] = ["HOME", "CATALOG", "ORDERS", "STOCK", "FUNCIONARIOS", "PROFILE"];
  const tabFromUrl = searchParams.get("tab") as TabId;
  const [active, setActive] = useState<TabId>(VALID_TABS.includes(tabFromUrl) ? tabFromUrl : "HOME");
  const [coffees, setCoffees] = useState<CoffeeItem[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [stockEdits, setStockEdits] = useState<Record<string, { baixa: string; alertAt: string }>>({});
  const [stockSaving, setStockSaving] = useState<Record<string, boolean>>({});
  const [stockAlertSaving, setStockAlertSaving] = useState<Record<string, boolean>>({});
  const [stockMsg, setStockMsg] = useState<Record<string, { ok: boolean; text: string }>>({});

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [empForm, setEmpForm] = useState({ name: "", email: "", password: "" });
  const [empSaving, setEmpSaving] = useState(false);
  const [empMsg, setEmpMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [empDeleting, setEmpDeleting] = useState<string | null>(null);

  const [profileForm, setProfileForm] = useState({ name: "", phoneNumber: "", cep: "", street: "", number: "", district: "", city: "", state: "", complement: "" });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const profilePhotoRef = useRef<HTMLInputElement>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    const t = searchParams.get("tab") as TabId;
    if (t && VALID_TABS.includes(t)) setActive(t);
  }, [searchParams]);

  function goTab(t: TabId) {
    if (t === "COURSES") { navigate("/courses"); return; }
    if (t === "SUBSCRIPTION") { navigate("/subscriptions"); return; }
    setActive(t);
    setSearchParams(t !== "HOME" ? { tab: t } : {});
  }

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.get<CoffeeItem[]>("/coffees?supplierType=ROASTER"),
      api.get<Course[]>("/courses").then(async res => {
        try {
          const enroll = await api.get<{ courseId: string; progress: number }[]>("/courses/my-enrollments");
          const map = new Map(enroll.data.map(e => [e.courseId, e.progress]));
          return res.data.map(c => ({ ...c, enrolled: map.has(c.id), progress: map.get(c.id) ?? 0 }));
        } catch { return res.data; }
      }).catch(() => []),
      api.get<Order[]>("/orders"),
      api.get<StockItem[]>("/coffeeshop/stock").catch(() => ({ data: [] as StockItem[] })),
    ])
      .then(([coffeesRes, coursesData, ordersRes, stockRes]) => {
        setCoffees(coffeesRes.data);
        setCourses(coursesData as Course[]);
        setOrders(ordersRes.data);
        const items = stockRes.data;
        setStock(items);
        const edits: Record<string, { baixa: string; alertAt: string }> = {};
        items.forEach(s => { edits[s.coffeeId] = { baixa: "", alertAt: s.alertAt != null ? String(s.alertAt) : "" }; });
        setStockEdits(edits);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: (user.name as string) ?? "", phoneNumber: (user.phoneNumber as string) ?? "",
        cep: (user.cep as string) ?? "", street: (user.street as string) ?? "",
        number: (user.number as string) ?? "", district: (user.district as string) ?? "",
        city: (user.city as string) ?? "", state: (user.state as string) ?? "",
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

  async function handleStockSave(coffeeId: string) {
    const edit = stockEdits[coffeeId];
    if (!edit) return;
    const current = stock.find(s => s.coffeeId === coffeeId);
    const isKg = current?.coffee?.saleType === "KG";
    const baixa = edit.baixa !== "" ? (isKg ? parseFloat(edit.baixa) : parseInt(edit.baixa, 10)) : 0;
    if (isNaN(baixa) || baixa < 0) return;
    if (baixa > (current?.quantity ?? 0)) {
      setStockMsg(m => ({ ...m, [coffeeId]: { ok: false, text: "Baixa maior que o estoque atual" } }));
      setTimeout(() => setStockMsg(m => { const n = { ...m }; delete n[coffeeId]; return n; }), 2500);
      return;
    }
    const alertAt = edit.alertAt !== "" ? (isKg ? parseFloat(edit.alertAt) : parseInt(edit.alertAt, 10)) : null;
    const rawQty = (current?.quantity ?? 0) - baixa;
    const newQty = Math.max(0, isKg ? rawQty : Math.round(rawQty));
    setStockSaving(s => ({ ...s, [coffeeId]: true }));
    setStockMsg(m => { const n = { ...m }; delete n[coffeeId]; return n; });
    try {
      const { data } = await api.put<StockItem>(`/coffeeshop/stock/${coffeeId}`, { quantity: newQty, alertAt: alertAt != null && !isNaN(alertAt) ? alertAt : null });
      setStock(prev => prev.some(s => s.coffeeId === coffeeId) ? prev.map(s => s.coffeeId === coffeeId ? data : s) : [...prev, data]);
      setStockEdits(e => ({ ...e, [coffeeId]: { ...e[coffeeId], baixa: "" } }));
      setStockMsg(m => ({ ...m, [coffeeId]: { ok: true, text: "Baixa registrada" } }));
    } catch {
      setStockMsg(m => ({ ...m, [coffeeId]: { ok: false, text: "Erro ao salvar" } }));
    } finally {
      setStockSaving(s => ({ ...s, [coffeeId]: false }));
      setTimeout(() => setStockMsg(m => { const n = { ...m }; delete n[coffeeId]; return n; }), 2500);
    }
  }

  async function handleAlertSave(coffeeId: string) {
    const edit = stockEdits[coffeeId];
    if (!edit) return;
    const current = stock.find(s => s.coffeeId === coffeeId);
    if (!current) return;
    const isKg = current.coffee?.saleType === "KG";
    const alertAt = edit.alertAt !== "" ? (isKg ? parseFloat(edit.alertAt) : parseInt(edit.alertAt, 10)) : null;
    if (alertAt !== null && isNaN(alertAt)) return;
    setStockAlertSaving(s => ({ ...s, [coffeeId]: true }));
    try {
      const { data } = await api.put<StockItem>(`/coffeeshop/stock/${coffeeId}`, { quantity: current.quantity, alertAt: alertAt });
      setStock(prev => prev.map(s => s.coffeeId === coffeeId ? data : s));
      setStockMsg(m => ({ ...m, [coffeeId]: { ok: true, text: "Alerta configurado" } }));
      setTimeout(() => setStockMsg(m => { const n = { ...m }; delete n[coffeeId]; return n; }), 2500);
    } catch {
      // silent
    } finally {
      setStockAlertSaving(s => ({ ...s, [coffeeId]: false }));
    }
  }

  useEffect(() => {
    if (active === "FUNCIONARIOS" && employees.length === 0 && !employeesLoading) {
      setEmployeesLoading(true);
      api.get<Employee[]>("/coffeeshop/employees")
        .then(r => setEmployees(r.data))
        .catch(() => {})
        .finally(() => setEmployeesLoading(false));
    }
  }, [active]);

  async function createEmployee() {
    if (!empForm.name || !empForm.email || !empForm.password) return;
    setEmpSaving(true);
    setEmpMsg(null);
    try {
      const { data } = await api.post<Employee>("/coffeeshop/employees", empForm);
      setEmployees(prev => [...prev, data]);
      setEmpForm({ name: "", email: "", password: "" });
      setEmpMsg({ ok: true, text: "Funcionário cadastrado com sucesso." });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Erro ao cadastrar funcionário.";
      setEmpMsg({ ok: false, text: msg });
    } finally {
      setEmpSaving(false);
      setTimeout(() => setEmpMsg(null), 3500);
    }
  }

  async function deleteEmployee(id: string) {
    setEmpDeleting(id);
    try {
      await api.delete(`/coffeeshop/employees/${id}`);
      setEmployees(prev => prev.filter(e => e.id !== id));
    } catch {
      // silent
    } finally {
      setEmpDeleting(null);
    }
  }

  const enrolledCourses = courses.filter(c => c.enrolled);
  const activeOrders    = orders.filter(o => ["PAID", "PROCESSING", "SHIPPED"].includes(o.status));
  const activeSubs      = orders.filter(o => o.type === "SUBSCRIPTION" && o.status === "PAID");

  const userName    = user?.name ?? "Cafeteria";
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    : "—";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
      <DashHeader userName={userName} photoUrl={user?.photoUrl as string | null} onLogout={() => { logout(); navigate("/"); }} onNavigate={goTab} />

      <main style={{ maxWidth: 1320, margin: "0 auto", padding: "32px 32px 80px", display: "grid", gridTemplateColumns: "280px 1fr", gap: 28, alignItems: "start" }}>
        <Sidebar
          active={active} setActive={goTab}
          ordersBadge={activeOrders.length}
          userName={userName} userEmail={user?.email ?? ""}
          memberSince={memberSince} photoUrl={user?.photoUrl as string | null}
        />

        <div>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}>
              <div className="mono" style={{ fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--ink-2)" }}>Carregando…</div>
            </div>
          ) : (
            <>
              {/* HOME */}
              {active === "HOME" && (
                <>
                  <Welcome userName={userName} />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginBottom: 36 }}>
                    <SummaryCard
                      eyebrow="Pedidos ativos"
                      value={String(activeOrders.length)}
                      subtitle="aguardando entrega"
                      accent="var(--c-mostarda)"
                      cta={{ label: "Ver pedidos", onClick: () => goTab("ORDERS") }}
                    />
                    {activeSubs.length > 0 ? (
                      <SummaryCard
                        eyebrow="Assinatura B2B"
                        title={activeSubs[0].subscription?.name ?? "Assinatura"}
                        subtitle={`Desde ${fmtDate(activeSubs[0].createdAt)}`}
                        badge={{ label: "Ativa", color: "var(--success)" }}
                        accent="var(--c-vibra)" dark
                        cta={{ label: "Gerenciar", onClick: () => navigate("/subscriptions") }}
                      />
                    ) : (
                      <SummaryCard
                        eyebrow="Assinatura B2B"
                        title="Sem assinatura"
                        subtitle="café B2B recorrente para sua cafeteria"
                        accent="var(--c-leveza)"
                        cta={{ label: "Ver planos", onClick: () => navigate("/subscriptions") }}
                      />
                    )}
                    <SummaryCard
                      eyebrow="Cursos da equipe"
                      value={String(enrolledCourses.length)}
                      subtitle={enrolledCourses.length > 0 ? "cursos em andamento" : "nenhum curso iniciado"}
                      accent="var(--c-glamour)"
                      cta={{ label: "Ver cursos", onClick: () => navigate("/courses") }}
                    />
                  </div>

                  <section style={{ marginBottom: 36 }}>
                    <SectionHeader
                      title="Últimos pedidos"
                      subtitle={`Seus ${Math.min(orders.length, 4)} pedidos mais recentes`}
                      cta={{ label: "Ver todos os pedidos", onClick: () => goTab("ORDERS") }}
                    />
                    <OrdersTable orders={orders.slice(0, 4)} onOpen={setSelectedOrder} />
                  </section>
                </>
              )}

              {/* CATALOG */}
              {active === "CATALOG" && (
                <>
                  <div style={{ marginBottom: 28 }}>
                    <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 12 }}>
                      <span style={{ color: "var(--c-vibra)" }}>§</span>&nbsp; Compras B2B
                    </div>
                    <h1 className="serif" style={{ margin: 0, fontSize: "clamp(44px, 5vw, 64px)", lineHeight: 0.95, letterSpacing: "-.025em" }}>
                      Catálogo <span className="italic" style={{ color: "var(--c-vibra)" }}>B2B</span>.
                    </h1>
                    <p style={{ fontSize: 14, color: "var(--ink-2)", marginTop: 8 }}>{coffees.length} cafés disponíveis com preços exclusivos para cafeterias</p>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                    {coffees.map(coffee => {
                      const retailPrice = coffee.packagePrice ?? coffee.pricePerKg;
                      const b2bPrice    = coffee.packagePriceCoffeeshop ?? retailPrice;
                      const unit        = coffee.saleType === "KG" ? "kg" : "pct";
                      const saving      = (coffee.packagePriceCoffeeshop && retailPrice && retailPrice > coffee.packagePriceCoffeeshop)
                        ? Math.round((1 - coffee.packagePriceCoffeeshop / retailPrice) * 100)
                        : null;
                      return (
                        <div key={coffee.id} style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                          <div style={{ aspectRatio: "4/3", background: "var(--bg-2)", overflow: "hidden", position: "relative" }}>
                            {coffee.photoUrl
                              ? <img src={coffee.photoUrl} alt={coffee.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <span className="serif italic" style={{ fontSize: 32, color: "var(--ink-3)" }}>íle</span>
                                </div>
                            }
                            {saving !== null && (
                              <span className="mono" style={{ position: "absolute", top: 12, right: 12, fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", padding: "4px 10px", background: "var(--success)", color: "#fff", borderRadius: 999 }}>
                                −{saving}% B2B
                              </span>
                            )}
                          </div>
                          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                            <div>
                              <div className="serif" style={{ fontSize: 19, lineHeight: 1.1, letterSpacing: "-.01em" }}>{coffee.name}</div>
                              {coffee.supplier && <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 3 }}>{coffee.supplier.name}</div>}
                              {coffee.description && <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 6, lineHeight: 1.45 }}>{coffee.description.slice(0, 80)}{coffee.description.length > 80 ? "…" : ""}</div>}
                            </div>

                            {/* Comparativo de preços */}
                            <div style={{ background: "var(--bg-2)", borderRadius: 10, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 5 }}>
                              {retailPrice && coffee.packagePriceCoffeeshop && (
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                  <span style={{ fontSize: 12, color: "var(--ink-2)" }}>Preço normal</span>
                                  <span style={{ fontSize: 13, color: "var(--ink-2)", textDecoration: "line-through" }}>{fmt(retailPrice)}<span style={{ fontSize: 10, marginLeft: 3 }}>/{unit}</span></span>
                                </div>
                              )}
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                <span className="mono" style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--c-vibra)" }}>Seu preço B2B</span>
                                <span className="serif" style={{ fontSize: 20, color: "var(--ink)" }}>{fmt(b2bPrice ?? 0)}<span style={{ fontSize: 11, color: "var(--ink-2)", marginLeft: 3 }}>/{unit}</span></span>
                              </div>
                            </div>

                            <button onClick={() => navigate(`/product/${coffee.id}`)}
                              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "10px", borderRadius: 999, background: "var(--ink)", color: "var(--c-leveza)", fontSize: 13, border: "none", cursor: "pointer", fontFamily: "inherit", marginTop: "auto" }}>
                              Comprar <Arrow size={11} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {coffees.length === 0 && (
                      <div style={{ gridColumn: "1 / -1", padding: "48px 24px", textAlign: "center", background: "var(--paper)", border: "1px dashed var(--line)", borderRadius: 16 }}>
                        <p style={{ fontSize: 14, color: "var(--ink-2)" }}>Nenhum café disponível no momento.</p>
                      </div>
                    )}
                  </div>
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
                    <p style={{ fontSize: 14, color: "var(--ink-2)", marginTop: 8 }}>{orders.length} pedido{orders.length !== 1 ? "s" : ""} no total</p>
                  </div>
                  <OrdersTable orders={orders} onOpen={setSelectedOrder} />
                </>
              )}


              {/* STOCK */}
              {active === "STOCK" && (() => {
                return (
                  <>
                    <div style={{ marginBottom: 28 }}>
                      <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 12 }}>
                        <span style={{ color: "var(--c-vibra)" }}>§</span>&nbsp; Inventário
                      </div>
                      <h1 className="serif" style={{ margin: 0, fontSize: "clamp(44px, 5vw, 64px)", lineHeight: 0.95, letterSpacing: "-.025em" }}>
                        Controle de <span className="italic" style={{ color: "var(--c-vibra)" }}>estoque</span>.
                      </h1>
                      <p style={{ fontSize: 14, color: "var(--ink-2)", marginTop: 8 }}>{stock.length} café{stock.length !== 1 ? "s" : ""} rastreado{stock.length !== 1 ? "s" : ""}</p>
                    </div>

                    {stock.length === 0 && (
                      <div style={{ padding: "48px 32px", textAlign: "center", background: "var(--paper)", border: "1px dashed var(--line)", borderRadius: 16, marginBottom: 28 }}>
                        <div className="mono" style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--ink-2)" }}>Nenhum café no estoque</div>
                        <p style={{ fontSize: 14, color: "var(--ink-2)", marginTop: 8 }}>O estoque é atualizado automaticamente quando você realiza uma compra no catálogo B2B.</p>
                      </div>
                    )}

                    {stock.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
                        {stock.map(item => {
                          const edit = stockEdits[item.coffeeId] ?? { baixa: "", alertAt: item.alertAt != null ? String(item.alertAt) : "" };
                          const currentQty = item.quantity;
                          const alert = edit.alertAt !== "" ? parseFloat(edit.alertAt) : null;
                          const isLow = alert != null && !isNaN(alert) && currentQty <= alert;
                          const baixaVal = edit.baixa !== "" ? parseFloat(edit.baixa) : 0;
                          const exceedsStock = baixaVal > currentQty;
                          const msg = stockMsg[item.coffeeId];
                          const saving = stockSaving[item.coffeeId];
                          const alertSaving = stockAlertSaving[item.coffeeId];
                          const isKg = item.coffee?.saleType === "KG";
                          const unit = isKg ? "kg" : "pct";
                          return (
                            <div key={item.coffeeId} style={{ background: "var(--paper)", border: `1px solid ${isLow ? "var(--c-vibra)" : "var(--line)"}`, borderRadius: 16, padding: "20px 22px", display: "grid", gridTemplateColumns: "52px 1fr auto", gap: 16, alignItems: "center" }}>
                              <div style={{ width: 52, height: 52, borderRadius: 10, overflow: "hidden", background: "var(--bg-2)", flexShrink: 0 }}>
                                {item.coffee?.photoUrl
                                  ? <img src={item.coffee.photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                  : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><span className="serif italic" style={{ fontSize: 18, color: "var(--ink-3)" }}>í</span></div>}
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                                  <span className="serif" style={{ fontSize: 18, lineHeight: 1.1 }}>{item.coffee?.name ?? "—"}</span>
                                  {item.coffee?.supplier && <span style={{ fontSize: 12, color: "var(--ink-2)" }}>{item.coffee.supplier.name}</span>}
                                  <span className="mono" style={{ fontSize: 11, padding: "3px 10px", borderRadius: 999, background: isLow ? "rgba(231,64,44,.10)" : "var(--bg-2)", color: isLow ? "var(--c-vibra)" : "var(--ink-2)", border: `1px solid ${isLow ? "var(--c-vibra)" : "var(--line)"}` }}>
                                    {isKg
                                      ? currentQty.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })
                                      : Math.round(currentQty).toLocaleString("pt-BR")} {unit}
                                    {isLow && " · estoque baixo"}
                                  </span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <label className="mono" style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-2)", whiteSpace: "nowrap" }}>Dar baixa ({unit})</label>
                                    <input type="number" min="0" max={currentQty} step={isKg ? "0.1" : "1"} placeholder="0" value={edit.baixa}
                                      onChange={e => setStockEdits(prev => ({ ...prev, [item.coffeeId]: { ...prev[item.coffeeId], baixa: e.target.value } }))}
                                      style={{ width: 90, padding: "7px 10px", borderRadius: 8, border: `1px solid ${exceedsStock ? "var(--c-vibra)" : "var(--line)"}`, background: "var(--bg)", fontSize: 14, fontFamily: "inherit", color: exceedsStock ? "var(--c-vibra)" : "var(--ink)", outline: "none" }} />
                                  </div>
                                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <label className="mono" style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-2)", whiteSpace: "nowrap" }}>Alertar em</label>
                                    <input type="number" min="0" step={isKg ? "0.1" : "1"} placeholder="—" value={edit.alertAt}
                                      onChange={e => setStockEdits(prev => ({ ...prev, [item.coffeeId]: { ...prev[item.coffeeId], alertAt: e.target.value } }))}
                                      onBlur={() => handleAlertSave(item.coffeeId)}
                                      style={{ width: 90, padding: "7px 10px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--bg)", fontSize: 14, fontFamily: "inherit", color: "var(--ink)", outline: "none" }} />
                                    {alertSaving && <span style={{ fontSize: 11, color: "var(--ink-2)" }}>…</span>}
                                  </div>
                                  {msg && (
                                    <span style={{ fontSize: 12, color: msg.ok ? "var(--success)" : "var(--c-vibra)" }}>{msg.text}</span>
                                  )}
                                </div>
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                                <button onClick={() => handleStockSave(item.coffeeId)}
                                  disabled={saving || exceedsStock || edit.baixa === "" || baixaVal <= 0}
                                  style={{ padding: "8px 16px", borderRadius: 999, background: "var(--ink)", color: "var(--c-leveza)", border: "none", fontSize: 13, cursor: (saving || exceedsStock || edit.baixa === "" || baixaVal <= 0) ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: (saving || exceedsStock || edit.baixa === "" || baixaVal <= 0) ? 0.4 : 1, whiteSpace: "nowrap" }}>
                                  {saving ? "Salvando…" : "Registrar baixa"}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                  </>
                );
              })()}

              {/* FUNCIONARIOS */}
              {active === "FUNCIONARIOS" && (() => {
                function fmtRelative(iso: string | null) {
                  if (!iso) return "Nunca acessou";
                  const diff = Date.now() - new Date(iso).getTime();
                  const mins = Math.floor(diff / 60000);
                  if (mins < 2) return "Agora mesmo";
                  if (mins < 60) return `${mins} min atrás`;
                  const hrs = Math.floor(mins / 60);
                  if (hrs < 24) return `${hrs}h atrás`;
                  const days = Math.floor(hrs / 24);
                  if (days < 7) return `${days} dia${days > 1 ? "s" : ""} atrás`;
                  return new Date(iso).toLocaleDateString("pt-BR");
                }
                function fmtQtyDelta(prev: number, next: number) {
                  const delta = next - prev;
                  const sign = delta >= 0 ? "+" : "";
                  return `${sign}${(delta).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}`;
                }
                return (
                  <>
                    <div style={{ marginBottom: 28 }}>
                      <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 12 }}>
                        <span style={{ color: "var(--c-vibra)" }}>§</span>&nbsp; Equipe
                      </div>
                      <h1 className="serif" style={{ margin: 0, fontSize: "clamp(44px, 5vw, 64px)", lineHeight: 0.95, letterSpacing: "-.025em" }}>
                        Meus <span className="italic" style={{ color: "var(--c-vibra)" }}>funcionários</span>.
                      </h1>
                      <p style={{ fontSize: 14, color: "var(--ink-2)", marginTop: 8 }}>{employees.length} funcionário{employees.length !== 1 ? "s" : ""} cadastrado{employees.length !== 1 ? "s" : ""}</p>
                    </div>

                    {/* Add employee form */}
                    <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 16, padding: "24px 26px", marginBottom: 28 }}>
                      <div className="serif" style={{ fontSize: 20, letterSpacing: "-.01em", marginBottom: 18 }}>Cadastrar funcionário</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 12, alignItems: "flex-end" }}>
                        {[
                          { label: "Nome", key: "name", placeholder: "Nome completo", type: "text" },
                          { label: "E-mail", key: "email", placeholder: "email@cafeteria.com", type: "email" },
                          { label: "Senha temporária", key: "password", placeholder: "mínimo 6 caracteres", type: "password" },
                        ].map(f => (
                          <div key={f.key}>
                            <label className="mono" style={{ display: "block", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 6 }}>{f.label}</label>
                            <input type={f.type} value={(empForm as Record<string,string>)[f.key]} placeholder={f.placeholder}
                              onChange={e => setEmpForm(p => ({ ...p, [f.key]: e.target.value }))}
                              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--bg)", fontSize: 14, fontFamily: "inherit", outline: "none", color: "var(--ink)", boxSizing: "border-box" }} />
                          </div>
                        ))}
                        <button onClick={createEmployee} disabled={empSaving || !empForm.name || !empForm.email || !empForm.password}
                          style={{ padding: "10px 20px", borderRadius: 999, background: "var(--ink)", color: "var(--c-leveza)", border: "none", fontSize: 13, cursor: (empSaving || !empForm.name || !empForm.email || !empForm.password) ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: (empSaving || !empForm.name || !empForm.email || !empForm.password) ? 0.5 : 1, whiteSpace: "nowrap" }}>
                          {empSaving ? "Salvando…" : "+ Adicionar"}
                        </button>
                      </div>
                      {empMsg && (
                        <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10, fontSize: 13, background: empMsg.ok ? "rgba(46,114,68,.10)" : "rgba(231,64,44,.10)", color: empMsg.ok ? "var(--success)" : "var(--c-vibra)", border: `1px solid ${empMsg.ok ? "var(--success)" : "var(--c-vibra)"}` }}>
                          {empMsg.text}
                        </div>
                      )}
                    </div>

                    {/* Employee cards */}
                    {employeesLoading ? (
                      <div style={{ padding: "32px", textAlign: "center" }}>
                        <div className="mono" style={{ fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--ink-2)" }}>Carregando…</div>
                      </div>
                    ) : employees.length === 0 ? (
                      <div style={{ padding: "48px 32px", textAlign: "center", background: "var(--paper)", border: "1px dashed var(--line)", borderRadius: 16 }}>
                        <div className="mono" style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--ink-2)" }}>Nenhum funcionário ainda</div>
                        <p style={{ fontSize: 14, color: "var(--ink-2)", marginTop: 8 }}>Cadastre um funcionário acima para que ele possa acessar o estoque e os cursos.</p>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {employees.map(emp => {
                          const hasAccess = !!emp.lastAccessAt;
                          const initials = emp.name.split(" ").slice(0,2).map(w => w[0]).join("").toUpperCase();
                          return (
                            <div key={emp.id} style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden" }}>
                              {/* Employee header row */}
                              <div style={{ display: "grid", gridTemplateColumns: "44px 1fr auto auto", gap: 14, padding: "18px 20px", alignItems: "center" }}>
                                <span style={{ width: 44, height: 44, borderRadius: 999, background: hasAccess ? "var(--c-glamour)" : "var(--bg-2)", border: "1px solid var(--line)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: hasAccess ? "var(--c-leveza)" : "var(--ink-3)", flexShrink: 0, overflow: "hidden" }}>
                                  {emp.photoUrl
                                    ? <img src={emp.photoUrl} alt={emp.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    : initials}
                                </span>
                                <div>
                                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                                    <span style={{ fontWeight: 500, fontSize: 15 }}>{emp.name}</span>
                                    <span style={{ fontSize: 12, color: "var(--ink-2)" }}>{emp.email}</span>
                                  </div>
                                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 5, flexWrap: "wrap" }}>
                                    {/* Last access badge */}
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11 }}>
                                      <span style={{ width: 6, height: 6, borderRadius: 999, background: hasAccess ? "var(--success)" : "var(--c-mostarda)", flexShrink: 0 }} />
                                      <span className="mono" style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink-2)" }}>
                                        Último acesso:
                                      </span>
                                      <span style={{ fontSize: 12, color: hasAccess ? "var(--ink)" : "var(--ink-2)", fontStyle: hasAccess ? "normal" : "italic" }}>
                                        {fmtRelative(emp.lastAccessAt)}
                                      </span>
                                    </span>
                                    {/* Course views count */}
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 3.5h4.5a1.5 1.5 0 011.5 1.5v8a1 1 0 00-1-1H3v-8.5zM13 3.5H8.5a1.5 1.5 0 00-1.5 1.5v8a1 1 0 011-1H13v-8.5z" stroke="var(--ink-2)" strokeWidth="1.3" strokeLinejoin="round"/></svg>
                                      <span style={{ fontSize: 12, color: "var(--ink-2)" }}>
                                        {emp.courseViews.length > 0
                                          ? <><strong style={{ color: "var(--ink)" }}>{emp.courseViews.length}</strong> curso{emp.courseViews.length !== 1 ? "s" : ""} visualizado{emp.courseViews.length !== 1 ? "s" : ""}</>
                                          : <span style={{ fontStyle: "italic" }}>Nenhum curso acessado</span>}
                                      </span>
                                    </span>
                                    {/* Stock changes count */}
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><rect x="2" y="8" width="3" height="6" rx="1" stroke="var(--ink-2)" strokeWidth="1.3"/><rect x="6.5" y="5" width="3" height="9" rx="1" stroke="var(--ink-2)" strokeWidth="1.3"/><rect x="11" y="2" width="3" height="12" rx="1" stroke="var(--ink-2)" strokeWidth="1.3"/></svg>
                                      <span style={{ fontSize: 12, color: "var(--ink-2)" }}>
                                        {emp.stockLogs.length > 0
                                          ? <><strong style={{ color: "var(--ink)" }}>{emp.stockLogs.length}</strong> mov. de estoque</>
                                          : <span style={{ fontStyle: "italic" }}>Sem alterações no estoque</span>}
                                      </span>
                                    </span>
                                    {/* Cadastrado desde */}
                                    <span className="mono" style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: ".08em" }}>
                                      desde {new Date(emp.createdAt).toLocaleDateString("pt-BR")}
                                    </span>
                                  </div>
                                </div>
                                <button onClick={() => deleteEmployee(emp.id)} disabled={empDeleting === emp.id}
                                  style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid var(--line)", background: "transparent", cursor: empDeleting === emp.id ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--c-vibra)", opacity: empDeleting === emp.id ? 0.4 : 1 }}
                                  title="Remover funcionário">
                                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 3.5h10M5 3.5V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v1M3.5 3.5l.7 8a.5.5 0 00.5.5h4.6a.5.5 0 00.5-.5l.7-8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </button>
                              </div>

                              {/* Activity panels */}
                              {(emp.courseViews.length > 0 || emp.stockLogs.length > 0) && (
                                <div style={{ borderTop: "1px solid var(--line)", display: "grid", gridTemplateColumns: emp.courseViews.length > 0 && emp.stockLogs.length > 0 ? "1fr 1fr" : "1fr" }}>
                                  {/* Course views */}
                                  {emp.courseViews.length > 0 && (
                                    <div style={{ padding: "14px 20px", borderRight: emp.stockLogs.length > 0 ? "1px solid var(--line)" : "none" }}>
                                      <div className="mono" style={{ fontSize: 9, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 10 }}>Cursos visualizados</div>
                                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                        {emp.courseViews.map(v => (
                                          <div key={v.courseId} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                                            <span style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.courseName}</span>
                                            <span className="mono" style={{ fontSize: 10, color: "var(--ink-2)", whiteSpace: "nowrap", flexShrink: 0 }}>{fmtRelative(v.viewedAt)}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {/* Stock logs */}
                                  {emp.stockLogs.length > 0 && (
                                    <div style={{ padding: "14px 20px" }}>
                                      <div className="mono" style={{ fontSize: 9, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 10 }}>Movimentações de estoque</div>
                                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                        {emp.stockLogs.slice(0, 6).map(log => {
                                          const delta = log.newQty - log.previousQty;
                                          const isNeg = delta < 0;
                                          return (
                                            <div key={log.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                                              <span style={{ fontSize: 13, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.coffeeName}</span>
                                              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                                                <span className="mono" style={{ fontSize: 11, color: isNeg ? "var(--c-vibra)" : "var(--success)", fontWeight: 500 }}>
                                                  {fmtQtyDelta(log.previousQty, log.newQty)}
                                                </span>
                                                <span className="mono" style={{ fontSize: 10, color: "var(--ink-2)" }}>{fmtRelative(log.createdAt)}</span>
                                              </div>
                                            </div>
                                          );
                                        })}
                                        {emp.stockLogs.length > 6 && (
                                          <span style={{ fontSize: 11, color: "var(--ink-2)", fontStyle: "italic" }}>+{emp.stockLogs.length - 6} movimentações anteriores</span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                );
              })()}

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
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 780 }}>
                    <div style={{ gridColumn: "1 / -1", background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 16, padding: "28px 28px 24px" }}>
                      <div className="serif" style={{ fontSize: 22, letterSpacing: "-.01em", marginBottom: 22 }}>Editar informações</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 22, paddingBottom: 22, borderBottom: "1px solid var(--line)" }}>
                        <div style={{ width: 72, height: 72, borderRadius: 999, flexShrink: 0, overflow: "hidden", background: "var(--c-glamour)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--line)" }}>
                          {profilePhotoPreview
                            ? <img src={profilePhotoPreview} alt="Foto" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : <span style={{ fontWeight: 600, fontSize: 22, color: "var(--c-leveza)" }}>{getInitials(userName)}</span>}
                        </div>
                        <div>
                          <input ref={profilePhotoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleProfilePhotoChange} />
                          <button type="button" onClick={() => profilePhotoRef.current?.click()} style={{ padding: "8px 16px", borderRadius: 999, border: "1px solid var(--line)", background: "var(--bg)", fontSize: 13, cursor: "pointer", fontFamily: "inherit", color: "var(--ink)", display: "block", marginBottom: 6 }}>
                            {profilePhoto ? "Trocar foto" : "Alterar foto"}
                          </button>
                          <div style={{ fontSize: 12, color: "var(--ink-2)" }}>{profilePhoto ? profilePhoto.name : "JPG, PNG ou WEBP"}</div>
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
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
                            <input type="text" value={(profileForm as Record<string, string>)[f.key]} placeholder={f.placeholder}
                              onChange={e => setProfileForm(p => ({ ...p, [f.key]: e.target.value }))}
                              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--bg)", fontSize: 14, fontFamily: "inherit", outline: "none", color: "var(--ink)", boxSizing: "border-box" }} />
                          </div>
                        ))}
                        <div style={{ gridColumn: "1 / -1" }}>
                          <label className="mono" style={{ display: "block", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 6 }}>Complemento</label>
                          <input type="text" value={profileForm.complement} placeholder="Apto 42, Bloco B…"
                            onChange={e => setProfileForm(p => ({ ...p, complement: e.target.value }))}
                            style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--bg)", fontSize: 14, fontFamily: "inherit", outline: "none", color: "var(--ink)", boxSizing: "border-box" }} />
                        </div>
                      </div>
                      {profileMsg && (
                        <div style={{ marginTop: 16, padding: "10px 14px", borderRadius: 10, fontSize: 13, background: profileMsg.ok ? "rgba(46,114,68,.10)" : "rgba(231,64,44,.10)", color: profileMsg.ok ? "var(--success)" : "var(--c-vibra)", border: `1px solid ${profileMsg.ok ? "var(--success)" : "var(--c-vibra)"}` }}>
                          {profileMsg.text}
                        </div>
                      )}
                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
                        <button onClick={saveProfile} disabled={profileLoading} style={{ padding: "11px 24px", borderRadius: 999, background: "var(--ink)", color: "var(--c-leveza)", border: 0, fontSize: 14, cursor: profileLoading ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: profileLoading ? 0.7 : 1 }}>
                          {profileLoading ? "Salvando…" : "Salvar alterações"}
                        </button>
                      </div>
                    </div>
                    <div style={{ gridColumn: "1 / -1", background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 16, padding: "24px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <Avatar photoUrl={profilePhotoPreview} initial={getInitials(userName)} size={52} bg="var(--c-glamour)" color="var(--c-leveza)" />
                        <div>
                          <div className="serif" style={{ fontSize: 18, letterSpacing: "-.01em" }}>{userName}</div>
                          <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 2 }}>{user?.email}</div>
                        </div>
                      </div>
                      <button onClick={() => logout()} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", border: "1px solid var(--c-vibra)", borderRadius: 10, background: "transparent", cursor: "pointer", fontFamily: "inherit", fontSize: 14, color: "var(--c-vibra)" }}>
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
        <div style={{ maxWidth: 1320, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, fontSize: 12, color: "var(--ink-2)" }}>
          <span className="mono" style={{ letterSpacing: ".12em", textTransform: "uppercase" }}>© 2026 Ilé Coffees · desde 1934</span>
          <div style={{ display: "flex", gap: 18 }}>
            <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>Home</Link>
            <Link to="/explore" style={{ textDecoration: "none", color: "inherit" }}>Catálogo</Link>
            <Link to="/courses" style={{ textDecoration: "none", color: "inherit" }}>Cursos</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
