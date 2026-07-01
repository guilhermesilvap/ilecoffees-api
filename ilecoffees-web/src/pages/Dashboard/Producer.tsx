import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AddCoffeeForm, CoffeeInitialData } from "@/components/Dashboard/AddCoffeeForm";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useMobile } from "@/contexts/MobileContext";
import { DashboardLogo } from "@/components/Dashboard/DashboardLogo";
import { StatCard } from "@/components/Dashboard/StatCard";
import { WelcomeBanner, WelcomeAction } from "@/components/Dashboard/WelcomeBanner";

type Coffee = CoffeeInitialData;

interface Order {
  id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  quantity?: number | null;
  shippingCost?: number | null;
  deliveryCep?: string | null;
  trackingCode?: string | null;
  user?: { name: string; email?: string };
  supplier?: { name: string };
  buyerSupplier?: { name: string; email?: string };
  coffee?: { name: string; photoUrl?: string | null };
}


const TABS = ["Visão Geral", "Meus Cafés", "Estoque", "Pedidos", "Relatórios", "Perfil"] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, JSX.Element> = {
  "Visão Geral": <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x={3} y={3} width={7} height={7} rx={1.5}/><rect x={14} y={3} width={7} height={7} rx={1.5}/><rect x={3} y={14} width={7} height={7} rx={1.5}/><rect x={14} y={14} width={7} height={7} rx={1.5}/></svg>,
  "Meus Cafés": <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M20 7H4a1 1 0 00-1 1v11a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1z"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>,
  "Estoque": <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M20 7H4a1 1 0 00-1 1v11a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1z"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="8" y1="12" x2="16" y2="12" strokeLinecap="round"/></svg>,
  "Pedidos": <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x={9} y={3} width={6} height={4} rx={1}/><path d="M9 12h6M9 16h4" strokeLinecap="round"/></svg>,
  "Relatórios": <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M3 3v18h18" strokeLinecap="round"/><path d="M7 16l4-4 4 4 4-4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  "Perfil": <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx={12} cy={8} r={4}/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round"/></svg>,
};

const LOW_STOCK_KG = 50;

interface StockMovement {
  id: string;
  coffeeId: string;
  type: "ENTRY" | "SALE" | "ADJUSTMENT";
  delta: number;
  reason?: string | null;
  orderId?: string | null;
  createdAt: string;
  coffee?: { name: string };
}

const movementLabel: Record<string, string> = {
  ENTRY: "Entrada", SALE: "Venda", ADJUSTMENT: "Ajuste",
};
const movementColor: Record<string, string> = {
  ENTRY: "#2e7244", SALE: "var(--c-vibra)", ADJUSTMENT: "var(--c-mostarda)",
};

const statusLabel: Record<string, string> = {
  PENDING: "Pendente", PROCESSING: "Processando", SHIPPED: "Enviado",
  DELIVERED: "Entregue", CANCELED: "Cancelado", PAID: "Pago",
};

const statusColor: Record<string, string> = {
  PENDING: "var(--c-mostarda)", PROCESSING: "var(--c-vibra)", SHIPPED: "var(--c-glamour)",
  DELIVERED: "#2e7244", CANCELED: "#b8231a", PAID: "#2e7244",
};

const fmt = (val: number) => val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

/* ── Mock data (fallback para testes visuais quando API está vazia) ────────── */
const _now = new Date();
const _m = (monthOffset: number, day: number) =>
  new Date(_now.getFullYear(), _now.getMonth() + monthOffset, day).toISOString();

const MOCK_ORDERS: Order[] = [
  { id: "a1b2c3d4-0001", status: "PAID",    totalPrice: 4800,  createdAt: _m(-5, 10), supplier: { name: "Torrefação Pérola" } },
  { id: "b2c3d4e5-0002", status: "PAID",    totalPrice: 7200,  createdAt: _m(-4, 3),  supplier: { name: "Café Nobre" } },
  { id: "c3d4e5f6-0003", status: "PENDING", totalPrice: 3600,  createdAt: _m(-4, 22), supplier: { name: "Torrefação Sul" } },
  { id: "d4e5f6a1-0004", status: "PAID",    totalPrice: 9600,  createdAt: _m(-3, 8),  supplier: { name: "Torrefação Pérola" } },
  { id: "e5f6a1b2-0005", status: "PAID",    totalPrice: 5400,  createdAt: _m(-3, 28), supplier: { name: "Café Nobre" } },
  { id: "f6a1b2c3-0006", status: "CANCELED",totalPrice: 2400,  createdAt: _m(-2, 12), supplier: { name: "Torrefação Sul" } },
  { id: "a1b2c3d4-0007", status: "PAID",    totalPrice: 12000, createdAt: _m(-2, 25), supplier: { name: "Torrefação Pérola" } },
  { id: "b2c3d4e5-0008", status: "PAID",    totalPrice: 8400,  createdAt: _m(-1, 10), supplier: { name: "Café Nobre" } },
  { id: "c3d4e5f6-0009", status: "PENDING", totalPrice: 6000,  createdAt: _m(-1, 20), supplier: { name: "Torrefação Sul" } },
  { id: "d4e5f6a1-0010", status: "PAID",    totalPrice: 14400, createdAt: _m(0, 5),   supplier: { name: "Torrefação Pérola" } },
  { id: "e5f6a1b2-0011", status: "PENDING", totalPrice: 3200,  createdAt: _m(0, 18),  supplier: { name: "Café Nobre" } },
  { id: "f6a1b2c3-0012", status: "CANCELED",totalPrice: 1800,  createdAt: _m(0, 22),  supplier: { name: "Torrefação Sul" } },
];

const MOCK_MOVEMENTS: StockMovement[] = [
  { id: "mv01", coffeeId: "c01", type: "SALE", delta: -80,  reason: "Pedido #a1b2", createdAt: _m(-5, 10), coffee: { name: "Mundo Novo Amarelo" } },
  { id: "mv02", coffeeId: "c02", type: "SALE", delta: -120, reason: "Pedido #b2c3", createdAt: _m(-4, 3),  coffee: { name: "Bourbon Vermelho" } },
  { id: "mv03", coffeeId: "c01", type: "SALE", delta: -160, reason: "Pedido #d4e5", createdAt: _m(-3, 8),  coffee: { name: "Mundo Novo Amarelo" } },
  { id: "mv04", coffeeId: "c03", type: "SALE", delta: -90,  reason: "Pedido #e5f6", createdAt: _m(-3, 28), coffee: { name: "Catuaí Vermelho" } },
  { id: "mv05", coffeeId: "c01", type: "SALE", delta: -200, reason: "Pedido #a1b2", createdAt: _m(-2, 25), coffee: { name: "Mundo Novo Amarelo" } },
  { id: "mv06", coffeeId: "c02", type: "SALE", delta: -140, reason: "Pedido #b2c3", createdAt: _m(-1, 10), coffee: { name: "Bourbon Vermelho" } },
  { id: "mv07", coffeeId: "c04", type: "SALE", delta: -60,  reason: "Pedido #d4e5", createdAt: _m(-1, 20), coffee: { name: "Acaiá Cerrado" } },
  { id: "mv08", coffeeId: "c01", type: "SALE", delta: -240, reason: "Pedido #d4e5", createdAt: _m(0, 5),   coffee: { name: "Mundo Novo Amarelo" } },
  { id: "mv09", coffeeId: "c03", type: "ENTRY", delta: 500, reason: "Colheita novo lote", createdAt: _m(-2, 1),  coffee: { name: "Catuaí Vermelho" } },
  { id: "mv10", coffeeId: "c01", type: "ENTRY", delta: 800, reason: "Colheita safra 2026", createdAt: _m(-4, 1), coffee: { name: "Mundo Novo Amarelo" } },
];;

/* ── Gráficos ─────────────────────────────────────────────────────────────── */

function ChartEmpty() {
  return (
    <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontSize: 13, color: "var(--ink-3)" }}>Sem dados suficientes</span>
    </div>
  );
}

function AreaChart({ data, color, uid }: {
  data: { label: string; value: number }[];
  color: string;
  uid: string;
}) {
  const hasData = data.some(d => d.value > 0);
  if (!hasData) return <ChartEmpty />;
  const W = 500, TH = 75, PAD_T = 24, PAD_B = 20;
  const H = PAD_T + TH + PAD_B;
  const max = Math.max(...data.map(d => d.value), 1);
  const xs = data.map((_, i) => data.length < 2 ? W / 2 : (i / (data.length - 1)) * W);
  const ys = data.map(d => PAD_T + TH - (d.value / max) * TH * 0.85);
  const line = xs.reduce((acc, x, i) => {
    if (i === 0) return `M${x},${ys[i]}`;
    const cpx = (xs[i - 1] + x) / 2;
    return `${acc} C${cpx},${ys[i - 1]} ${cpx},${ys[i]} ${x},${ys[i]}`;
  }, "");
  const area = `${line} L${xs[xs.length - 1]},${PAD_T + TH} L${xs[0]},${PAD_T + TH} Z`;
  const fmtShort = (v: number) =>
    v >= 1000 ? `${(v / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}k` : v.toFixed(0);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.33, 0.66, 1].map(t => (
        <line key={t} x1={0} y1={PAD_T + TH - t * TH * 0.85} x2={W} y2={PAD_T + TH - t * TH * 0.85}
          stroke="var(--line)" strokeWidth={0.8} strokeDasharray="3 5" />
      ))}
      <path d={area} fill={`url(#${uid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      {xs.map((x, i) => (
        <g key={i}>
          {data[i].value > 0 && (
            <text x={x} y={ys[i] - 8} textAnchor="middle"
              style={{ fontSize: 9, fill: "var(--ink-2)", fontFamily: "monospace", letterSpacing: "0.05em" }}>
              {fmtShort(data[i].value)}
            </text>
          )}
          <circle cx={x} cy={ys[i]} r={3.5} fill="var(--paper)" stroke={color} strokeWidth={2} />
          <text x={x} y={H - 4} textAnchor="middle"
            style={{ fontSize: 9, fill: "var(--ink-3)", fontFamily: "monospace", letterSpacing: "0.08em" }}>
            {data[i].label.toUpperCase()}
          </text>
        </g>
      ))}
    </svg>
  );
}

function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <ChartEmpty />;
  const R = 58, CX = 70, CY = 70, thick = 20;
  let angle = -Math.PI / 2;
  const slices = data.map(d => {
    const sweep = total > 0 ? (d.value / total) * 2 * Math.PI : 0;
    const s = { ...d, sa: angle, ea: angle + sweep };
    angle += sweep;
    return s;
  });
  function arc(sa: number, ea: number) {
    const gap = 0.04;
    const sa2 = sa + gap, ea2 = ea - gap;
    if (ea2 <= sa2) return "";
    const ri = R - thick;
    const x1 = CX + R * Math.cos(sa2), y1 = CY + R * Math.sin(sa2);
    const x2 = CX + R * Math.cos(ea2), y2 = CY + R * Math.sin(ea2);
    const xi1 = CX + ri * Math.cos(ea2), yi1 = CY + ri * Math.sin(ea2);
    const xi2 = CX + ri * Math.cos(sa2), yi2 = CY + ri * Math.sin(sa2);
    const lg = ea2 - sa2 > Math.PI ? 1 : 0;
    return `M${x1},${y1} A${R},${R} 0 ${lg} 1 ${x2},${y2} L${xi1},${yi1} A${ri},${ri} 0 ${lg} 0 ${xi2},${yi2} Z`;
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
      <svg viewBox="0 0 140 140" style={{ width: 120, flexShrink: 0 }}>
        {slices.map((s, i) => <path key={i} d={arc(s.sa, s.ea)} fill={s.color} />)}
        <text x={CX} y={CY - 8} textAnchor="middle"
          style={{ fontSize: 26, fontFamily: "serif", fill: "var(--ink)", letterSpacing: "-0.02em" }}>
          {total}
        </text>
        <text x={CX} y={CY + 10} textAnchor="middle"
          style={{ fontSize: 8, fontFamily: "monospace", fill: "var(--ink-3)", letterSpacing: "0.1em" }}>
          TOTAL
        </text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: "var(--ink)" }}>{d.label}</span>
            <span className="mono" style={{ fontSize: 11, color: "var(--ink-2)", marginLeft: 8 }}>
              {d.value} · {total > 0 ? Math.round(d.value / total * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HBarChart({ data, unit }: { data: { label: string; value: number }[]; unit?: string }) {
  if (!data.length) return <ChartEmpty />;
  const max = Math.max(...data.map(d => d.value), 1);
  const colors = ["var(--c-glamour)", "#2e7244", "var(--c-mostarda)", "var(--c-vibra)", "var(--ink-2)"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {data.map((d, i) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 13, color: "var(--ink)", maxWidth: "60%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.label}</span>
            <span className="mono" style={{ fontSize: 11, color: "var(--ink-2)" }}>
              {d.value.toLocaleString("pt-BR")}{unit ? ` ${unit}` : ""}
            </span>
          </div>
          <div style={{ height: 8, background: "var(--bg-2)", borderRadius: 999, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 999,
              background: colors[i % colors.length],
              width: `${(d.value / max) * 100}%`,
              transition: "width 0.9s cubic-bezier(.4,0,.2,1)",
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ChartCard({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 16, padding: "22px 24px" }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: "var(--ink)", letterSpacing: "-.01em" }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 3 }}>{sub}</div>}
      </div>
      {children}
    </div>
  );
}

export default function ProducerDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("Visão Geral");
  const [coffees, setCoffees] = useState<Coffee[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [adjustModal, setAdjustModal] = useState<{ coffee: Coffee } | null>(null);
  const [orderDetail, setOrderDetail] = useState<Order | null>(null);
  const [adjustDelta, setAdjustDelta] = useState("");
  const [adjustType, setAdjustType] = useState<"ENTRY" | "ADJUSTMENT">("ENTRY");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjustLoading, setAdjustLoading] = useState(false);
  const { user, logout, updateUser } = useAuth();
  const [profileForm, setProfileForm] = useState({ name: "", cep: "", street: "", number: "", district: "", city: "", state: "", complement: "" });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const profilePhotoRef = useRef<HTMLInputElement>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const mob = useMobile();

  const firstName = user?.name?.split(" ")[0] ?? "Produtor";
  const lastName = user?.name?.split(" ")[1] ?? "";
  const initials = ((firstName[0] ?? "") + (lastName[0] ?? "")).toUpperCase();
  const [mobMenuOpen, setMobMenuOpen] = useState(false);

  const loadCoffees = () => {
    if (!user?.id) return;
    api.get<Coffee[]>(`/coffees?supplierId=${user.id}`).then(r => setCoffees(r.data)).catch(() => {});
  };

  useEffect(() => {
    loadCoffees();
    api.get<Order[]>("/supplier/orders").then(r => {
      const all = r.data;
      setPendingCount(all.filter(o => o.status === "PENDING").length);
      setTotalRevenue(all.filter(o => o.status === "PAID").reduce((s, o) => s + o.totalPrice, 0));
      setOrders(all);
    }).catch(() => {});
  }, [user?.id]);

  useEffect(() => {
    if (activeTab === "Pedidos") {
      api.get<Order[]>("/supplier/orders").then(r => setOrders(r.data)).catch(() => {});
    }
    if (activeTab === "Meus Cafés") loadCoffees();
    if (activeTab === "Estoque" || activeTab === "Relatórios") {
      loadCoffees();
      api.get<StockMovement[]>("/supplier/stock/movements").then(r => setMovements(r.data)).catch(() => {});
    }
    if (activeTab === "Relatórios") {
      api.get<Order[]>("/supplier/orders").then(r => setOrders(r.data)).catch(() => {});
    }
    if (activeTab === "Perfil") {
      setProfileForm({
        name: user?.name ?? "",
        cep: (user as any)?.cep ?? "",
        street: (user as any)?.street ?? "",
        number: (user as any)?.number ?? "",
        district: (user as any)?.district ?? "",
        city: (user as any)?.city ?? "",
        state: (user as any)?.state ?? "",
        complement: (user as any)?.complement ?? "",
      });
      setProfilePhotoPreview((user as any)?.photoUrl ?? null);
    }
  }, [activeTab]);

  const handleDeleteCoffee = async (id: string) => {
    try {
      await api.delete(`/coffees/${id}`);
      setCoffees(prev => prev.filter(c => c.id !== id));
      toast({ title: "Café removido com sucesso." });
    } catch {
      toast({ title: "Erro ao remover café.", variant: "destructive" });
    }
  };

  const handleAdjustSubmit = async () => {
    if (!adjustModal || !adjustDelta) return;
    const deltaNum = parseFloat(adjustDelta);
    if (isNaN(deltaNum) || deltaNum === 0) { toast({ title: "Informe uma quantidade válida.", variant: "destructive" }); return; }
    setAdjustLoading(true);
    try {
      const r = await api.post(`/coffees/${adjustModal.coffee.id}/stock/adjust`, {
        delta: deltaNum,
        type: adjustType,
        reason: adjustReason || undefined,
      });
      setCoffees(prev => prev.map(c => c.id === adjustModal.coffee.id ? { ...c, stock: r.data.coffee.stock } : c));
      setMovements(prev => [r.data.movement, ...prev]);
      setAdjustModal(null);
      setAdjustDelta("");
      setAdjustReason("");
      toast({ title: "Estoque atualizado." });
    } catch (e: any) {
      toast({ title: e?.response?.data?.message ?? "Erro ao ajustar estoque.", variant: "destructive" });
    } finally {
      setAdjustLoading(false);
    }
  };

  const saveProfile = async () => {
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const fd = new FormData();
      Object.entries(profileForm).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (profilePhoto) fd.append("photo", profilePhoto);
      const { data } = await api.put("/suppliers/profile", fd, { headers: { "Content-Type": "multipart/form-data" } });
      updateUser(data);
      setProfilePhoto(null);
      setProfileMsg({ ok: true, text: "Perfil atualizado com sucesso." });
    } catch {
      setProfileMsg({ ok: false, text: "Erro ao salvar. Verifique os dados e tente novamente." });
    } finally {
      setProfileLoading(false);
    }
  };

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
            <DashboardLogo light />
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
              <div className="mono" style={{ fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(255,255,255,.45)", lineHeight: 1.6 }}>Produtor · B2B</div>
            </div>
          </div>
          <div style={{ height: 1, background: "rgba(255,255,255,.08)", margin: "0 16px 10px" }} />
          <nav style={{ flex: 1, padding: "0 10px", display: "flex", flexDirection: "column", gap: 2 }}>
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className="mono"
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                  borderRadius: 10, border: 0, width: "100%",
                  background: activeTab === tab ? "rgba(255,255,255,.13)" : "transparent",
                  color: activeTab === tab ? "var(--c-leveza)" : "rgba(255,255,255,.5)",
                  cursor: "pointer", fontFamily: "inherit",
                  fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase",
                  textAlign: "left" as const, transition: "background .12s, color .12s",
                }}
                onMouseEnter={e => { if (activeTab !== tab) { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.07)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.8)"; } }}
                onMouseLeave={e => { if (activeTab !== tab) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.5)"; } }}
              >
                {TAB_ICONS[tab]}
                {tab}
              </button>
            ))}
          </nav>
          <div style={{ padding: "4px 10px 24px" }}>
            <div style={{ height: 1, background: "rgba(255,255,255,.08)", margin: "0 6px 10px" }} />
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
            <DashboardLogo light />
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
                  <button key={tab} onClick={() => { setActiveTab(tab); setMobMenuOpen(false); }} className="mono"
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 10, border: 0, background: activeTab === tab ? "rgba(255,255,255,.13)" : "transparent", color: activeTab === tab ? "var(--c-leveza)" : "rgba(255,255,255,.5)", cursor: "pointer", fontFamily: "inherit", fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase" as const, textAlign: "left" as const, width: "100%" }}>
                    {TAB_ICONS[tab]}
                    {tab}
                  </button>
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
              <span className="mono" style={{ fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--ink-2)" }}>Produtor</span>
              <span style={{ color: "var(--ink-2)", fontSize: 12 }}>›</span>
              <span className="mono" style={{ fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--ink)" }}>{activeTab}</span>
            </div>
            <span className="mono" style={{ fontSize: 10, letterSpacing: ".12em", color: "var(--ink-2)", textTransform: "capitalize" }}>
              {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
            </span>
          </div>
        )}

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", padding: mob ? "24px 16px 80px" : "32px 36px 80px" }}>

        {/* VISÃO GERAL */}
        {activeTab === "Visão Geral" && (() => {
          const now = new Date();
          const monthRevenue = orders
            .filter(o => o.status === "PAID" && (() => { const d = new Date(o.createdAt); return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth(); })())
            .reduce((s, o) => s + o.totalPrice, 0);
          return (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <WelcomeBanner
              name={user?.name ?? "Produtor"}
              subtitle="Painel do Produtor · íle coffees"
              description="Aqui você gerencia seus lotes de café verde: cadastre produções, acompanhe pedidos feitos por torrefadores parceiros, controle seu estoque por lote e visualize seu histórico de vendas. Navegue pelas abas para acessar cada funcionalidade."
              actions={([
                { icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}><circle cx={12} cy={12} r={10}/><path d="M12 8v8M8 12h8" strokeLinecap="round"/></svg>, label: "Cadastrar lote", description: "Adicione um novo lote de café verde", onClick: () => setActiveTab("Meus Cafés") },
                { icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x={9} y={3} width={6} height={4} rx={1}/><path d="M9 12h6M9 16h4" strokeLinecap="round"/></svg>, label: "Pedidos recebidos", description: "Compras de torrefadores", onClick: () => setActiveTab("Pedidos") },
                { icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}><path d="M20 7H4a1 1 0 00-1 1v11a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1z"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="8" y1="12" x2="16" y2="12" strokeLinecap="round"/></svg>, label: "Controlar estoque", description: "Quantidade disponível por lote", onClick: () => setActiveTab("Estoque") },
                { icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}><path d="M3 3v18h18" strokeLinecap="round"/><path d="M7 16l4-4 4 4 4-4" strokeLinecap="round" strokeLinejoin="round"/></svg>, label: "Relatórios", description: "Desempenho e histórico de vendas", onClick: () => setActiveTab("Relatórios") },
              ] as WelcomeAction[])}
            />
            <div style={{ display: "grid", gridTemplateColumns: mob ? "repeat(2, minmax(0, 1fr))" : "repeat(4, 1fr)", gap: 16 }}>
              <StatCard label="Cafés ativos" value={coffees.length} sub="lotes cadastrados" />
              <StatCard label="Pendentes" value={pendingCount} sub="aguardando pagamento" />
              <StatCard label="Receita total" value={fmt(totalRevenue)} sub="pedidos pagos" />
              <StatCard label="Receita do mês" value={fmt(monthRevenue)} sub={new Date().toLocaleString("pt-BR", { month: "long" })} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 20 }}>
              <div style={{ padding: mob ? 18 : 28, borderRadius: 16, background: "var(--paper)", border: "1px solid var(--line)" }}>
                <div className="serif" style={{ fontSize: 26, letterSpacing: "-.01em", marginBottom: 18 }}>Meus Cafés</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {coffees.slice(0, 4).map(c => (
                    <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "var(--bg-2)", borderRadius: 10 }}>
                      <div>
                        <div style={{ fontSize: 15 }}>{c.name}</div>
                        <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 2 }}>{fmt(c.pricePerKg ?? 0)}/kg</div>
                      </div>
                      <span className="mono" style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 999, background: "var(--ink)", color: "var(--c-leveza)" }}>
                        {c.stock != null ? `${c.stock} kg` : "KG"}
                      </span>
                    </div>
                  ))}
                  {coffees.length === 0 && <p style={{ fontSize: 14, color: "var(--ink-2)" }}>Nenhum lote cadastrado.</p>}
                </div>
              </div>

              <div style={{ padding: mob ? 18 : 28, borderRadius: 16, background: "var(--paper)", border: "1px solid var(--line)" }}>
                <div className="serif" style={{ fontSize: 26, letterSpacing: "-.01em", marginBottom: 18 }}>Pedidos Recentes</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {orders.slice(0, 4).map(o => (
                    <div key={o.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "var(--bg-2)", borderRadius: 10 }}>
                      <div>
                        <div style={{ fontSize: 14 }}>#{o.id.slice(0, 8)}</div>
                        <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 2 }}>{new Date(o.createdAt).toLocaleDateString("pt-BR")}</div>
                      </div>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: statusColor[o.status] ?? "var(--ink-2)" }}>
                        <span style={{ width: 6, height: 6, borderRadius: 999, background: statusColor[o.status] ?? "var(--ink-3)" }} />
                        {statusLabel[o.status] ?? o.status}
                      </span>
                    </div>
                  ))}
                  {orders.length === 0 && <p style={{ fontSize: 14, color: "var(--ink-2)" }}>Nenhum pedido ainda.</p>}
                </div>
              </div>
            </div>
          </div>
          );
        })()}

        {/* MEUS CAFÉS */}
        {activeTab === "Meus Cafés" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div className="serif" style={{ fontSize: 32, letterSpacing: "-.01em" }}>Meus Cafés</div>
                <p style={{ fontSize: 14, color: "var(--ink-2)", marginTop: 4 }}>Gerencie seus lotes vendidos a torrefadores</p>
              </div>
              <AddCoffeeForm onSuccess={loadCoffees} lockedSaleType="KG" lockedLabel="Por Quilograma (Torrefadores · B2B)" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(3, 1fr)", gap: 20 }}>
              {coffees.map(coffee => (
                <div key={coffee.id} style={{ borderRadius: 16, background: "var(--paper)", border: "1px solid var(--line)", overflow: "hidden", boxShadow: "0 8px 24px -16px rgba(28,8,16,.15)" }}>
                  <div style={{ aspectRatio: "16/9", background: "var(--bg-2)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    {coffee.photoUrl
                      ? <img src={coffee.photoUrl} alt={coffee.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : (
                        <svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                          <path d="M20 7H4a1 1 0 00-1 1v11a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1z" stroke="currentColor" strokeWidth="1.4" />
                          <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="currentColor" strokeWidth="1.4" />
                        </svg>
                      )}
                  </div>
                  <div style={{ padding: 20 }}>
                    <div style={{ fontSize: 17, fontWeight: 500, marginBottom: 4 }}>{coffee.name}</div>
                    <div style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 16 }}>{coffee.description}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{ fontSize: 14 }}>Por kg:</span>
                      <span className="serif" style={{ fontSize: 20, letterSpacing: "-.01em" }}>
                        {fmt(coffee.pricePerKg ?? 0)}
                      </span>
                    </div>
                    {coffee.stock != null && (
                      <div style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 14 }}>Estoque: {coffee.stock} kg</div>
                    )}
                    <div style={{ display: "flex", gap: 8 }}>
                      <AddCoffeeForm initialCoffee={coffee} onSuccess={loadCoffees} lockedSaleType="KG" />
                      <button
                        onClick={() => handleDeleteCoffee(coffee.id)}
                        style={{ flex: 1, padding: "8px 14px", borderRadius: 8, fontSize: 13, border: "1px solid var(--line)", background: "var(--bg-2)", color: "var(--ink-2)", cursor: "pointer", fontFamily: "inherit" }}
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {coffees.length === 0 && (
                <div style={{ gridColumn: "1 / -1", textAlign: "center" as const, padding: "60px 32px", color: "var(--ink-2)", fontSize: 15 }}>
                  Nenhum café cadastrado ainda. Clique em "Adicionar Produto" para começar.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ESTOQUE */}
        {activeTab === "Estoque" && (() => {
          const outOfStock = coffees.filter(c => (c.stock ?? 0) === 0);
          const lowStock = coffees.filter(c => (c.stock ?? 0) > 0 && (c.stock ?? 0) < LOW_STOCK_KG);
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              {/* Summary cards */}
              <div style={{ display: "grid", gridTemplateColumns: mob ? "repeat(2, minmax(0, 1fr))" : "repeat(4,1fr)", gap: 16 }}>
                <StatCard label="Lotes ativos" value={coffees.length} sub="cafés cadastrados" />
                <StatCard label="Estoque total" value={`${coffees.reduce((s, c) => s + (c.stock ?? 0), 0)} kg`} sub="soma de todos os lotes" />
                <StatCard label="Estoque baixo" value={lowStock.length} sub={`abaixo de ${LOW_STOCK_KG} kg`} />
                <StatCard label="Sem estoque" value={outOfStock.length} sub="lotes zerados" />
              </div>

              {/* Stock table */}
              <div>
                <div className="serif" style={{ fontSize: 24, letterSpacing: "-.01em", marginBottom: 16 }}>Visão por Lote</div>
                <div style={{ borderRadius: 16, background: "var(--paper)", border: "1px solid var(--line)", overflow: "hidden" }}>
                  {!mob && (
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 100px", padding: "12px 20px", borderBottom: "1px solid var(--line)", background: "var(--bg-2)" }}>
                      {["Café", "Estoque (kg)", "Status", ""].map(h => (
                        <span key={h} className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)" }}>{h}</span>
                      ))}
                    </div>
                  )}
                  {coffees.map((c, i) => {
                    const stock = c.stock ?? 0;
                    const status = stock === 0 ? "Zerado" : stock < LOW_STOCK_KG ? "Baixo" : "OK";
                    const statusClr = stock === 0 ? "#b8231a" : stock < LOW_STOCK_KG ? "var(--c-mostarda)" : "#2e7244";
                    return (
                      <div key={c.id} style={mob ? {
                        padding: "14px 16px", borderTop: i ? "1px solid var(--line)" : undefined,
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                      } : {
                        display: "grid", gridTemplateColumns: "2fr 1fr 1fr 100px", padding: "14px 20px",
                        borderTop: i ? "1px solid var(--line)" : undefined, alignItems: "center",
                      }}>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{c.name}</div>
                        <div className="serif" style={{ fontSize: mob ? 16 : 20, letterSpacing: "-.01em" }}>{stock} kg</div>
                        {!mob && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: statusClr }}>
                            <span style={{ width: 6, height: 6, borderRadius: 999, background: statusClr }} />
                            {status}
                          </span>
                        )}
                        <button
                          onClick={() => { setAdjustModal({ coffee: c }); setAdjustDelta(""); setAdjustReason(""); setAdjustType("ENTRY"); }}
                          style={{ padding: "7px 14px", borderRadius: 999, border: "1px solid var(--line)", background: "none", fontSize: 12, cursor: "pointer", fontFamily: "inherit", color: "var(--ink)" }}
                        >
                          Ajustar
                        </button>
                      </div>
                    );
                  })}
                  {coffees.length === 0 && (
                    <div style={{ padding: "48px 20px", textAlign: "center" as const, fontSize: 14, color: "var(--ink-2)" }}>Nenhum lote cadastrado.</div>
                  )}
                </div>
              </div>

              {/* Movement history */}
              <div>
                <div className="serif" style={{ fontSize: 24, letterSpacing: "-.01em", marginBottom: 16 }}>Histórico de Movimentações</div>
                <div style={{ borderRadius: 16, background: "var(--paper)", border: "1px solid var(--line)", overflow: "hidden" }}>
                  {!mob && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px 80px 1fr", padding: "12px 20px", borderBottom: "1px solid var(--line)", background: "var(--bg-2)" }}>
                      {["Data", "Café", "Tipo", "Qtd (kg)", "Motivo"].map(h => (
                        <span key={h} className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)" }}>{h}</span>
                      ))}
                    </div>
                  )}
                  {movements.map((m, i) => (
                    <div key={m.id} style={mob ? {
                      padding: "12px 16px", borderTop: i ? "1px solid var(--line)" : undefined,
                      display: "flex", flexDirection: "column", gap: 4,
                    } : {
                      display: "grid", gridTemplateColumns: "1fr 1fr 80px 80px 1fr", padding: "13px 20px",
                      borderTop: i ? "1px solid var(--line)" : undefined, alignItems: "center",
                    }}>
                      <div style={{ fontSize: 13, color: "var(--ink-2)" }}>{new Date(m.createdAt).toLocaleDateString("pt-BR")}</div>
                      <div style={{ fontSize: 13 }}>{m.coffee?.name ?? "—"}</div>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: movementColor[m.type] }}>
                        <span style={{ width: 5, height: 5, borderRadius: 999, background: movementColor[m.type] }} />
                        {movementLabel[m.type]}
                      </span>
                      <div style={{ fontSize: 13, fontWeight: 600, color: m.delta > 0 ? "#2e7244" : "var(--c-vibra)" }}>
                        {m.delta > 0 ? "+" : ""}{m.delta} kg
                      </div>
                      <div style={{ fontSize: 13, color: "var(--ink-2)" }}>{m.reason ?? "—"}</div>
                    </div>
                  ))}
                  {movements.length === 0 && (
                    <div style={{ padding: "48px 20px", textAlign: "center" as const, fontSize: 14, color: "var(--ink-2)" }}>Nenhuma movimentação registrada.</div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* PEDIDOS */}
        {activeTab === "Pedidos" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <div className="serif" style={{ fontSize: 32, letterSpacing: "-.01em" }}>Pedidos</div>
              <p style={{ fontSize: 14, color: "var(--ink-2)", marginTop: 4 }}>Pedidos recebidos de torrefadores</p>
            </div>
            <div style={{ borderRadius: 16, background: "var(--paper)", border: "1px solid var(--line)", overflow: "hidden" }}>
              {!mob && (
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "12px 20px", borderBottom: "1px solid var(--line)", background: "var(--bg-2)" }}>
                  {["Pedido", "Torrefador", "Valor", "Status"].map(h => (
                    <span key={h} className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)" }}>{h}</span>
                  ))}
                </div>
              )}
              {orders.map((o, i) => {
                const buyer = o.buyerSupplier?.name ?? o.user?.name ?? o.supplier?.name ?? "—";
                return (
                <div key={o.id} onClick={() => setOrderDetail(o)} style={mob ? {
                  padding: "14px 16px", borderTop: i ? "1px solid var(--line)" : undefined,
                  display: "flex", flexDirection: "column", gap: 6, cursor: "pointer",
                } : {
                  display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "16px 20px",
                  borderTop: i ? "1px solid var(--line)" : undefined, alignItems: "center", cursor: "pointer",
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--bg-2)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ""}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 14 }}>#{o.id.slice(0, 8)}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 2 }}>{new Date(o.createdAt).toLocaleDateString("pt-BR")}</div>
                    </div>
                    {mob && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: statusColor[o.status] ?? "var(--ink-2)" }}>
                        <span style={{ width: 6, height: 6, borderRadius: 999, background: statusColor[o.status] ?? "var(--ink-3)" }} />
                        {statusLabel[o.status] ?? o.status}
                      </span>
                    )}
                  </div>
                  {mob ? (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 13, color: "var(--ink-2)" }}>{buyer}</div>
                      <div className="serif" style={{ fontSize: 18, letterSpacing: "-.01em" }}>{fmt(o.totalPrice)}</div>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: 14 }}>{buyer}</div>
                      <div className="serif" style={{ fontSize: 18, letterSpacing: "-.01em" }}>{fmt(o.totalPrice)}</div>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: statusColor[o.status] ?? "var(--ink-2)" }}>
                        <span style={{ width: 6, height: 6, borderRadius: 999, background: statusColor[o.status] ?? "var(--ink-3)" }} />
                        {statusLabel[o.status] ?? o.status}
                      </span>
                    </>
                  )}
                </div>
                );
              })}
              {orders.length === 0 && (
                <div style={{ padding: "48px 20px", textAlign: "center", fontSize: 14, color: "var(--ink-2)" }}>
                  Nenhum pedido encontrado.
                </div>
              )}
            </div>
          </div>
        )}

        {/* RELATÓRIOS */}
        {activeTab === "Relatórios" && (() => {
          const _orders    = orders.length    > 0 ? orders    : MOCK_ORDERS;
          const _movements = movements.length > 0 ? movements : MOCK_MOVEMENTS;
          const isMock     = orders.length === 0;

          const now = new Date();
          const revenueByMonth = Array.from({ length: 6 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
            return {
              label: d.toLocaleString("pt-BR", { month: "short" }),
              value: _orders
                .filter(o => o.status === "PAID" && (() => { const od = new Date(o.createdAt); return od.getFullYear() === d.getFullYear() && od.getMonth() === d.getMonth(); })())
                .reduce((s, o) => s + o.totalPrice, 0),
            };
          });
          const topByKg = (() => {
            const map = new Map<string, { label: string; value: number }>();
            _movements.filter(m => m.type === "SALE").forEach(m => {
              const name = m.coffee?.name ?? "Lote";
              const prev = map.get(m.coffeeId) ?? { label: name, value: 0 };
              map.set(m.coffeeId, { label: name, value: prev.value + Math.abs(m.delta) });
            });
            return [...map.values()].sort((a, b) => b.value - a.value).slice(0, 5);
          })();
          const statusData = [
            { label: "Pago",     value: _orders.filter(o => o.status === "PAID").length,                            color: "#2e7244" },
            { label: "Pendente", value: _orders.filter(o => o.status === "PENDING").length,                          color: "var(--c-mostarda)" },
            { label: "Cancelado",value: _orders.filter(o => ["CANCELED","CANCELLED"].includes(o.status)).length,     color: "var(--c-vibra)" },
          ];
          const _revenue = _orders.filter(o => o.status === "PAID").reduce((s, o) => s + o.totalPrice, 0);
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
                <div>
                  <div className="serif" style={{ fontSize: 32, letterSpacing: "-.01em" }}>Relatórios e Análises</div>
                  <p style={{ fontSize: 14, color: "var(--ink-2)", marginTop: 4 }}>Desempenho dos seus lotes · B2B</p>
                </div>
                {isMock && (
                  <span className="mono" style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 999, background: "var(--c-mostarda)", color: "#fff", opacity: 0.85 }}>
                    dados de exemplo
                  </span>
                )}
              </div>
              {/* KPIs */}
              <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(3, 1fr)", gap: 16 }}>
                <StatCard label="Total de lotes"     value={coffees.length}    sub="cafés no catálogo" />
                <StatCard label="Total de pedidos"   value={_orders.length}    sub="pedidos recebidos" />
                <StatCard label="Receita acumulada"  value={fmt(_revenue)}     sub="pedidos pagos" />
              </div>
              {/* Área: receita mensal */}
              <ChartCard title="Receita mensal" sub="Últimos 6 meses — pedidos pagos (R$)">
                <AreaChart data={revenueByMonth} color="var(--c-glamour)" uid="prod-rev" />
              </ChartCard>
              {/* Linha 2 colunas */}
              <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 20 }}>
                <ChartCard title="Top lotes por kg vendido" sub="Movimentações de venda">
                  <HBarChart data={topByKg} unit="kg" />
                </ChartCard>
                <ChartCard title="Status dos pedidos">
                  <DonutChart data={statusData} />
                </ChartCard>
              </div>
            </div>
          );
        })()}

        {/* PERFIL */}
        {activeTab === "Perfil" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 760 }}>
            <div>
              <div className="serif" style={{ fontSize: 32, letterSpacing: "-.01em" }}>Minha Conta</div>
              <p style={{ fontSize: 14, color: "var(--ink-2)", marginTop: 4 }}>Atualize suas informações de perfil</p>
            </div>

            <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 16, padding: "28px 28px 24px" }}>
              <div className="serif" style={{ fontSize: 20, letterSpacing: "-.01em", marginBottom: 22 }}>Informações pessoais</div>

              {/* Photo */}
              <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 22, paddingBottom: 22, borderBottom: "1px solid var(--line)" }}>
                <div style={{ width: 72, height: 72, borderRadius: 999, flexShrink: 0, overflow: "hidden", background: "var(--c-glamour)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--line)" }}>
                  {(profilePhotoPreview ?? (user as any)?.photoUrl)
                    ? <img src={profilePhotoPreview ?? (user as any).photoUrl} alt="Foto" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <span style={{ fontWeight: 600, fontSize: 22, color: "var(--c-leveza)" }}>{initials || "?"}</span>
                  }
                </div>
                <div>
                  <input ref={profilePhotoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
                    const f = e.target.files?.[0] ?? null;
                    setProfilePhoto(f);
                    if (f) setProfilePhotoPreview(URL.createObjectURL(f));
                  }} />
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
                  { label: "Nome da fazenda / Nome", key: "name", placeholder: "Seu nome ou razão social" },
                  { label: "CEP", key: "cep", placeholder: "00000000" },
                  { label: "Rua / Logradouro", key: "street", placeholder: "Rua das Flores" },
                  { label: "Número", key: "number", placeholder: "123" },
                  { label: "Bairro", key: "district", placeholder: "Centro" },
                  { label: "Cidade", key: "city", placeholder: "São Paulo" },
                  { label: "UF", key: "state", placeholder: "MG" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="mono" style={{ display: "block", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 6 }}>{f.label}</label>
                    <input
                      type="text"
                      value={(profileForm as Record<string, string>)[f.key]}
                      placeholder={f.placeholder}
                      onChange={e => setProfileForm(p => ({ ...p, [f.key]: e.target.value }))}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--bg)", fontSize: 14, fontFamily: "inherit", outline: "none", color: "var(--ink)", boxSizing: "border-box" as const }}
                    />
                  </div>
                ))}
                <div>
                  <label className="mono" style={{ display: "block", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 6 }}>Complemento</label>
                  <input
                    type="text"
                    value={profileForm.complement}
                    placeholder="Sala 5, Galpão 2…"
                    onChange={e => setProfileForm(p => ({ ...p, complement: e.target.value }))}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--bg)", fontSize: 14, fontFamily: "inherit", outline: "none", color: "var(--ink)", boxSizing: "border-box" as const }}
                  />
                </div>
              </div>

              {profileMsg && (
                <div style={{ marginTop: 16, padding: "10px 14px", borderRadius: 10, fontSize: 13, background: profileMsg.ok ? "rgba(46,114,68,.10)" : "rgba(231,64,44,.10)", color: profileMsg.ok ? "#2e7244" : "var(--c-vibra)", border: `1px solid ${profileMsg.ok ? "#2e7244" : "var(--c-vibra)"}` }}>
                  {profileMsg.text}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
                <button
                  type="button"
                  onClick={saveProfile}
                  disabled={profileLoading}
                  style={{ padding: "11px 24px", borderRadius: 999, background: "var(--ink)", color: "var(--c-leveza)", border: 0, fontSize: 14, cursor: profileLoading ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: profileLoading ? 0.7 : 1 }}
                >
                  {profileLoading ? "Salvando…" : "Salvar alterações"}
                </button>
              </div>
            </div>

            <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 16, padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
              <div>
                <div className="serif" style={{ fontSize: 17, letterSpacing: "-.01em" }}>{user?.name}</div>
                <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 2 }}>{(user as any)?.email}</div>
              </div>
              <button
                type="button"
                onClick={() => { logout(); navigate("/"); }}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", border: "1px solid #b8231a", borderRadius: 10, background: "transparent", cursor: "pointer", fontFamily: "inherit", fontSize: 14, color: "#b8231a" }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M9 3H4a1 1 0 00-1 1v8a1 1 0 001 1h5M11 5l3 3-3 3M14 8H7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Sair da conta
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order detail modal */}
      {orderDetail && (
        <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, zIndex: 9999, background: "rgba(28,8,16,.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setOrderDetail(null)}>
          <div style={{ background: "var(--paper)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <div className="serif" style={{ fontSize: 22, letterSpacing: "-.01em" }}>Pedido #{orderDetail.id.slice(0, 8)}</div>
                <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 2 }}>{new Date(orderDetail.createdAt).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}</div>
              </div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: statusColor[orderDetail.status] ?? "var(--ink-2)", padding: "5px 12px", borderRadius: 999, background: `${statusColor[orderDetail.status]}20` ?? "var(--bg-2)" }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: statusColor[orderDetail.status] ?? "var(--ink-3)" }} />
                {statusLabel[orderDetail.status] ?? orderDetail.status}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ padding: "14px 16px", borderRadius: 12, background: "var(--bg-2)", display: "flex", flexDirection: "column", gap: 8 }}>
                <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 2 }}>Comprador</div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>
                  {orderDetail.buyerSupplier?.name ?? orderDetail.user?.name ?? "—"}
                </div>
                {(orderDetail.buyerSupplier?.email ?? orderDetail.user?.email) && (
                  <div style={{ fontSize: 13, color: "var(--ink-2)" }}>{orderDetail.buyerSupplier?.email ?? orderDetail.user?.email}</div>
                )}
                {orderDetail.buyerSupplier && (
                  <span className="mono" style={{ alignSelf: "flex-start", fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 999, background: "var(--c-glamour)", color: "var(--c-leveza)" }}>Torrefador B2B</span>
                )}
              </div>

              {orderDetail.coffee && (
                <div style={{ padding: "14px 16px", borderRadius: 12, background: "var(--bg-2)" }}>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 6 }}>Produto</div>
                  <div style={{ fontSize: 15, fontWeight: 500 }}>{orderDetail.coffee.name}</div>
                  {orderDetail.quantity && <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 2 }}>{orderDetail.quantity} kg</div>}
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ padding: "14px 16px", borderRadius: 12, background: "var(--bg-2)" }}>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 4 }}>Total</div>
                  <div className="serif" style={{ fontSize: 24, letterSpacing: "-.01em" }}>{fmt(orderDetail.totalPrice)}</div>
                </div>
                {orderDetail.shippingCost != null && (
                  <div style={{ padding: "14px 16px", borderRadius: 12, background: "var(--bg-2)" }}>
                    <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 4 }}>Frete</div>
                    <div className="serif" style={{ fontSize: 24, letterSpacing: "-.01em" }}>{fmt(orderDetail.shippingCost)}</div>
                  </div>
                )}
              </div>

              {orderDetail.trackingCode && (
                <div style={{ padding: "14px 16px", borderRadius: 12, background: "var(--bg-2)" }}>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 4 }}>Código de rastreio</div>
                  <div className="mono" style={{ fontSize: 14 }}>{orderDetail.trackingCode}</div>
                </div>
              )}

              {orderDetail.deliveryCep && (
                <div style={{ padding: "14px 16px", borderRadius: 12, background: "var(--bg-2)" }}>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 4 }}>CEP de entrega</div>
                  <div style={{ fontSize: 14 }}>{orderDetail.deliveryCep}</div>
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
              <button onClick={() => setOrderDetail(null)} style={{ padding: "11px 24px", borderRadius: 999, border: "1px solid var(--line)", background: "none", fontSize: 14, cursor: "pointer", fontFamily: "inherit", color: "var(--ink)" }}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* Adjust stock modal */}
      {adjustModal && (
        <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, zIndex: 9999, background: "rgba(28,8,16,.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "var(--paper)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 440 }}>
            <div className="serif" style={{ fontSize: 22, letterSpacing: "-.01em", marginBottom: 4 }}>Ajustar estoque</div>
            <div style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 24 }}>{adjustModal.coffee.name} · atual: {adjustModal.coffee.stock ?? 0} kg</div>

            <div style={{ marginBottom: 16 }}>
              <label className="mono" style={{ display: "block", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 6 }}>Tipo</label>
              <div style={{ display: "flex", gap: 8 }}>
                {([["ENTRY", "Entrada"] as const, ["ADJUSTMENT", "Ajuste"] as const]).map(([v, lbl]) => (
                  <button key={v} onClick={() => setAdjustType(v)} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1px solid ${adjustType === v ? "var(--ink)" : "var(--line)"}`, background: adjustType === v ? "var(--ink)" : "transparent", color: adjustType === v ? "var(--c-leveza)" : "var(--ink)", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="mono" style={{ display: "block", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 6 }}>
                Quantidade (kg){adjustType === "ADJUSTMENT" ? " — negativo para baixa manual" : ""}
              </label>
              <input
                type="number"
                value={adjustDelta}
                onChange={e => setAdjustDelta(e.target.value)}
                placeholder={adjustType === "ENTRY" ? "Ex: 120" : "Ex: −20 ou 50"}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--bg)", fontSize: 14, fontFamily: "inherit", outline: "none", color: "var(--ink)", boxSizing: "border-box" as const }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label className="mono" style={{ display: "block", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 6 }}>Motivo (opcional)</label>
              <input
                type="text"
                value={adjustReason}
                onChange={e => setAdjustReason(e.target.value)}
                placeholder="Ex: Recebimento de lote, perda por dano..."
                style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--bg)", fontSize: 14, fontFamily: "inherit", outline: "none", color: "var(--ink)", boxSizing: "border-box" as const }}
              />
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setAdjustModal(null)} style={{ padding: "11px 20px", borderRadius: 999, border: "1px solid var(--line)", background: "none", fontSize: 14, cursor: "pointer", fontFamily: "inherit", color: "var(--ink)" }}>Cancelar</button>
              <button onClick={handleAdjustSubmit} disabled={adjustLoading} style={{ padding: "11px 24px", borderRadius: 999, background: "var(--ink)", color: "var(--c-leveza)", border: 0, fontSize: 14, cursor: adjustLoading ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: adjustLoading ? 0.7 : 1 }}>
                {adjustLoading ? "Salvando…" : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
