import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AddCoffeeForm, CoffeeInitialData } from "@/components/Dashboard/AddCoffeeForm";
import { AddSubscriptionForm, SubscriptionInitialData } from "@/components/Dashboard/AddSubscriptionForm";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import OrderDetailModal from "@/components/OrderDetailModal";
import { useMobile } from "@/contexts/MobileContext";
import { DashboardLogo } from "@/components/Dashboard/DashboardLogo";
import { StatCard } from "@/components/Dashboard/StatCard";

type Coffee = CoffeeInitialData;
type Subscription = SubscriptionInitialData;

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
  user?: { name: string; email?: string; phoneNumber?: string | null } | null;
}

interface DashboardStats {
  coffees: { total: number };
  orders: { pending: number; total: number };
  subscriptions: { activeSubscribers: number };
  revenue: { monthly: number };
}

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  workloadHours: number;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  imageUrl: string | null;
}

interface CourseStudent {
  userId: string;
  userName: string;
  userEmail: string;
  completedLessons: number;
  totalLessons: number;
  completionPercent: number;
  lastActivityAt: string | null;
}

const levelLabel: Record<string, string> = {
  BEGINNER: "Iniciante", INTERMEDIATE: "Intermediário", ADVANCED: "Avançado",
};

interface CourseFormData {
  title: string;
  description: string;
  price: string;
  workloadHours: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
}

const COURSE_INITIAL: CourseFormData = { title: "", description: "", price: "", workloadHours: "", level: "BEGINNER" };


interface Lesson {
  id: string;
  title: string;
  description?: string;
  videoUrl: string;
  order: number;
  isLocked: boolean;
  durationMinutes?: number;
}

interface LessonFormData {
  title: string;
  description: string;
  videoUrl: string;
  order: string;
  isLocked: boolean;
  durationMinutes: string;
}

const LESSON_INITIAL: LessonFormData = { title: "", description: "", videoUrl: "", order: "1", isLocked: false, durationMinutes: "" };

function PackageIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M20 7H4a1 1 0 00-1 1v11a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 12h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

const TABS = ["Visão Geral", "Produtos", "Estoque", "Estoque Cafeterias", "Assinaturas", "Cursos", "Pedidos", "Relatórios", "Perfil"] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, JSX.Element> = {
  "Visão Geral": <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x={3} y={3} width={7} height={7} rx={1.5}/><rect x={14} y={3} width={7} height={7} rx={1.5}/><rect x={3} y={14} width={7} height={7} rx={1.5}/><rect x={14} y={14} width={7} height={7} rx={1.5}/></svg>,
  "Produtos": <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M20 7H4a1 1 0 00-1 1v11a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1z"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>,
  "Estoque": <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M20 7H4a1 1 0 00-1 1v11a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1z"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="8" y1="12" x2="16" y2="12" strokeLinecap="round"/></svg>,
  "Estoque Cafeterias": <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M17 8h1a4 4 0 010 8h-1"/><path d="M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8z"/><line x1="6" y1="2" x2="6" y2="4" strokeLinecap="round"/><line x1="10" y1="2" x2="10" y2="4" strokeLinecap="round"/><line x1="14" y1="2" x2="14" y2="4" strokeLinecap="round"/></svg>,
  "Assinaturas": <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
  "Cursos": <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>,
  "Pedidos": <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x={9} y={3} width={6} height={4} rx={1}/><path d="M9 12h6M9 16h4" strokeLinecap="round"/></svg>,
  "Relatórios": <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M3 3v18h18" strokeLinecap="round"/><path d="M7 16l4-4 4 4 4-4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  "Perfil": <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx={12} cy={8} r={4}/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round"/></svg>,
};

const LOW_STOCK_UNITS = 20;

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

interface CoffeeshopStockRow {
  coffeeshopId: string;
  coffeeshopName: string;
  coffeeshopEmail: string;
  city: string | null;
  state: string | null;
  coffeeId: string;
  coffeeName: string;
  quantity: number;
  alertAt: number | null;
  isLow: boolean;
  lastUpdated: string;
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

/* ── Mock data (fallback para testes visuais quando API está vazia) ────────── */
const _now = new Date();
const _m = (monthOffset: number, day: number) =>
  new Date(_now.getFullYear(), _now.getMonth() + monthOffset, day).toISOString();

const MOCK_ORDERS: Order[] = [
  { id: "s-0001", status: "PAID",    totalPrice: 3200,  createdAt: _m(-5, 8),  user: { name: "Maria Souza" } },
  { id: "s-0002", status: "PAID",    totalPrice: 5600,  createdAt: _m(-4, 14), user: { name: "João Lima" } },
  { id: "s-0003", status: "PENDING", totalPrice: 2800,  createdAt: _m(-4, 27), user: { name: "Ana Costa" } },
  { id: "s-0004", status: "PAID",    totalPrice: 7800,  createdAt: _m(-3, 5),  user: { name: "Maria Souza" } },
  { id: "s-0005", status: "PAID",    totalPrice: 4200,  createdAt: _m(-3, 19), user: { name: "João Lima" } },
  { id: "s-0006", status: "CANCELED",totalPrice: 1600,  createdAt: _m(-2, 11), user: { name: "Ana Costa" } },
  { id: "s-0007", status: "PAID",    totalPrice: 9200,  createdAt: _m(-2, 23), user: { name: "Carlos Reis" } },
  { id: "s-0008", status: "PAID",    totalPrice: 6400,  createdAt: _m(-1, 9),  user: { name: "Maria Souza" } },
  { id: "s-0009", status: "PAID",    totalPrice: 11000, createdAt: _m(-1, 21), user: { name: "João Lima" } },
  { id: "s-0010", status: "PENDING", totalPrice: 5000,  createdAt: _m(0, 4),   user: { name: "Carlos Reis" } },
  { id: "s-0011", status: "PAID",    totalPrice: 8800,  createdAt: _m(0, 16),  user: { name: "Ana Costa" } },
  { id: "s-0012", status: "CANCELED",totalPrice: 2200,  createdAt: _m(0, 25),  user: { name: "Maria Souza" } },
];

const MOCK_MOVEMENTS: StockMovement[] = [
  { id: "sm01", coffeeId: "p01", type: "SALE",  delta: -24, reason: "Pedido #s-0001", createdAt: _m(-5, 8),  coffee: { name: "Espresso Clássico 250g" } },
  { id: "sm02", coffeeId: "p02", type: "SALE",  delta: -18, reason: "Pedido #s-0002", createdAt: _m(-4, 14), coffee: { name: "Blend Especial 500g" } },
  { id: "sm03", coffeeId: "p01", type: "SALE",  delta: -30, reason: "Pedido #s-0004", createdAt: _m(-3, 5),  coffee: { name: "Espresso Clássico 250g" } },
  { id: "sm04", coffeeId: "p03", type: "SALE",  delta: -15, reason: "Pedido #s-0005", createdAt: _m(-3, 19), coffee: { name: "Filtrado Natural 200g" } },
  { id: "sm05", coffeeId: "p02", type: "SALE",  delta: -36, reason: "Pedido #s-0007", createdAt: _m(-2, 23), coffee: { name: "Blend Especial 500g" } },
  { id: "sm06", coffeeId: "p01", type: "SALE",  delta: -20, reason: "Pedido #s-0008", createdAt: _m(-1, 9),  coffee: { name: "Espresso Clássico 250g" } },
  { id: "sm07", coffeeId: "p04", type: "SALE",  delta: -42, reason: "Pedido #s-0009", createdAt: _m(-1, 21), coffee: { name: "Grão Selecionado 1kg" } },
  { id: "sm08", coffeeId: "p02", type: "SALE",  delta: -28, reason: "Pedido #s-0011", createdAt: _m(0, 16),  coffee: { name: "Blend Especial 500g" } },
  { id: "sm09", coffeeId: "p01", type: "ENTRY", delta: 200, reason: "Reposição de estoque", createdAt: _m(-3, 1), coffee: { name: "Espresso Clássico 250g" } },
  { id: "sm10", coffeeId: "p02", type: "ENTRY", delta: 150, reason: "Reposição de estoque", createdAt: _m(-1, 1), coffee: { name: "Blend Especial 500g" } },
];

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

export default function SupplierDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("Visão Geral");
  const [coffees, setCoffees] = useState<Coffee[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseModal, setCourseModal] = useState<{ open: boolean; editing: Course | null }>({ open: false, editing: null });
  const [courseForm, setCourseForm] = useState<CourseFormData>(COURSE_INITIAL);
  const [coursePhotoFile, setCoursePhotoFile] = useState<File | null>(null);
  const [courseLoading, setCourseLoading] = useState(false);
  const coursePhotoInputRef = useRef<HTMLInputElement>(null);
  const [coursePhotoPreview, setCoursePhotoPreview] = useState<string | null>(null);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [moduleNames, setModuleNames] = useState<string[]>(["Módulo 1"]);
  const [currentLessonModule, setCurrentLessonModule] = useState<number>(1);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonModal, setLessonModal] = useState<{ open: boolean; editing: Lesson | null }>({ open: false, editing: null });
  const [lessonFormData, setLessonFormData] = useState<LessonFormData>(LESSON_INITIAL);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);
  const [showStudents, setShowStudents] = useState(false);
  const [students, setStudents] = useState<CourseStudent[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [adjustModal, setAdjustModal] = useState<{ coffee: Coffee } | null>(null);
  const [adjustDelta, setAdjustDelta] = useState("");
  const [adjustType, setAdjustType] = useState<"ENTRY" | "ADJUSTMENT">("ENTRY");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [csStock, setCsStock] = useState<CoffeeshopStockRow[]>([]);
  const [csStockLoading, setCsStockLoading] = useState(false);
  const [csExpanded, setCsExpanded] = useState<Record<string, boolean>>({});
  const { user, logout, updateUser } = useAuth();
  const [profileForm, setProfileForm] = useState({
    name: "", cep: "", street: "", number: "", district: "", city: "", state: "", complement: "",
  });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const profilePhotoRef = useRef<HTMLInputElement>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [mpConnected, setMpConnected] = useState<boolean | null>(null);
  const [mpUserId, setMpUserId] = useState<string | null>(null);
  const [mpLoading, setMpLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const mob = useMobile();
  const firstName = user?.name?.split(" ")[0] ?? "Torrefador";
  const lastName = user?.name?.split(" ")[1] ?? "";
  const initials = ((firstName[0] ?? "") + (lastName[0] ?? "")).toUpperCase();
  const [mobMenuOpen, setMobMenuOpen] = useState(false);

  const loadCoffees = () => {
    if (!user?.id) return;
    api.get<Coffee[]>(`/coffees?supplierId=${user.id}`).then(r => setCoffees(r.data)).catch(() => {});
  };

  const loadSubscriptions = () =>
    api.get<Subscription[]>("/subscriptions").then(r => setSubscriptions(r.data)).catch(() => {});

  const loadCourses = () =>
    api.get<Course[]>("/supplier/courses").then(r => setCourses(r.data)).catch(() => {});

  const loadCsStock = () => {
    setCsStockLoading(true);
    api.get<CoffeeshopStockRow[]>("/supplier/coffeeshop-stock")
      .then(r => setCsStock(r.data))
      .catch(() => {})
      .finally(() => setCsStockLoading(false));
  };

  useEffect(() => {
    loadCoffees();
    loadSubscriptions();
    api.get<Order[]>("/supplier/orders").then(r => {
      const allOrders = r.data;
      const pending = allOrders.filter(o => o.status === "PENDING").length;
      const monthly = allOrders.filter(o => o.status === "PAID").reduce((sum, o) => sum + o.totalPrice, 0);
      setStats({
        coffees: { total: 0 },
        orders: { pending, total: allOrders.length },
        subscriptions: { activeSubscribers: 0 },
        revenue: { monthly },
      });
      setOrders(allOrders);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (activeTab === "Pedidos") {
      api.get<Order[]>("/supplier/orders").then(r => setOrders(r.data)).catch(() => {});
    }
    if (activeTab === "Cursos") {
      loadCourses();
    }
    if (activeTab === "Estoque" || activeTab === "Relatórios") {
      loadCoffees();
      api.get<StockMovement[]>("/supplier/stock/movements").then(r => setMovements(r.data)).catch(() => {});
    }
    if (activeTab === "Estoque Cafeterias" && csStock.length === 0) {
      loadCsStock();
    }
    if (activeTab === "Relatórios") {
      api.get<Order[]>("/supplier/orders").then(r => setOrders(r.data)).catch(() => {});
    }
    if (activeTab === "Perfil" && mpConnected === null) {
      api.get<{ connected: boolean; mpUserId: string | null }>("/supplier/mp/status")
        .then(r => { setMpConnected(r.data.connected); setMpUserId(r.data.mpUserId); })
        .catch(() => { setMpConnected(false); });
    }
  }, [activeTab]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setPreviewLesson(null); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const handleDeleteCoffee = async (id: string) => {
    try {
      await api.delete(`/coffees/${id}`);
      setCoffees(prev => prev.filter(c => c.id !== id));
      toast({ title: "Café removido com sucesso." });
    } catch {
      toast({ title: "Erro ao remover café.", variant: "destructive" });
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    try {
      await api.delete(`/subscriptions/${id}`);
      setSubscriptions(prev => prev.filter(s => s.id !== id));
      toast({ title: "Assinatura removida com sucesso." });
    } catch {
      toast({ title: "Erro ao remover assinatura.", variant: "destructive" });
    }
  };

  const openCourseCreate = () => {
    setCourseForm(COURSE_INITIAL);
    setCoursePhotoFile(null);
    setCoursePhotoPreview(null);
    setCourseModal({ open: true, editing: null });
  };

  const openCourseEdit = (c: Course) => {
    setCourseForm({ title: c.title, description: c.description, price: String(c.price), workloadHours: String(c.workloadHours), level: c.level });
    setCoursePhotoFile(null);
    setCoursePhotoPreview(c.imageUrl ?? null);
    setCourseModal({ open: true, editing: c });
  };

  const handleCourseSubmit = async () => {
    if (!courseForm.title || !courseForm.description || !courseForm.price || !courseForm.workloadHours) {
      toast({ title: "Preencha todos os campos obrigatórios.", variant: "destructive" }); return;
    }
    setCourseLoading(true);
    try {
      const body = new FormData();
      body.append("title", courseForm.title);
      body.append("description", courseForm.description);
      body.append("price", courseForm.price);
      body.append("workloadHours", courseForm.workloadHours);
      body.append("level", courseForm.level);
      if (coursePhotoFile) body.append("photo", coursePhotoFile);

      if (courseModal.editing) {
        await api.put(`/supplier/courses/${courseModal.editing.id}`, body);
        toast({ title: "Curso atualizado com sucesso." });
      } else {
        await api.post("/supplier/courses", body);
        toast({ title: "Curso criado com sucesso." });
      }
      setCourseModal({ open: false, editing: null });
      loadCourses();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Erro ao salvar curso.";
      toast({ title: "Erro", description: msg, variant: "destructive" });
    } finally {
      setCourseLoading(false);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    try {
      await api.delete(`/supplier/courses/${id}`);
      setCourses(prev => prev.filter(c => c.id !== id));
      toast({ title: "Curso removido com sucesso." });
    } catch {
      toast({ title: "Erro ao remover curso.", variant: "destructive" });
    }
  };

  const getModuleNum = (order: number) => Math.floor((order - 1) / 100) + 1;

  const loadLessons = async (courseId: string): Promise<Lesson[]> => {
    try {
      const r = await api.get<{ lessons: Lesson[] }>(`/courses/${courseId}`);
      const loaded = r.data.lessons ?? [];
      setLessons(loaded);
      return loaded;
    } catch { setLessons([]); return []; }
  };

  const openManageCourse = async (c: Course) => {
    setActiveCourse(c);
    const loaded = await loadLessons(c.id);
    const maxModule = loaded.reduce((max, l) => Math.max(max, getModuleNum(l.order)), 0);
    const count = Math.max(1, maxModule);
    setModuleNames(Array.from({ length: count }, (_, i) => `Módulo ${i + 1}`));
  };

  const openAddLessonInModule = (moduleNum: number) => {
    setCurrentLessonModule(moduleNum);
    const lessonsInModule = lessons.filter(l => getModuleNum(l.order) === moduleNum);
    const nextOrder = (moduleNum - 1) * 100 + lessonsInModule.length + 1;
    setLessonFormData({ ...LESSON_INITIAL, order: String(nextOrder) });
    setLessonModal({ open: true, editing: null });
  };

  const openEditLesson = (l: Lesson) => {
    setLessonFormData({
      title: l.title,
      description: l.description ?? "",
      videoUrl: l.videoUrl,
      order: String(l.order),
      isLocked: l.isLocked,
      durationMinutes: l.durationMinutes != null ? String(l.durationMinutes) : "",
    });
    setLessonModal({ open: true, editing: l });
  };

  const handleSaveLesson = async () => {
    if (!activeCourse) return;
    if (!lessonFormData.title || !lessonFormData.videoUrl) {
      toast({ title: "Título e URL do vídeo são obrigatórios.", variant: "destructive" }); return;
    }
    setLessonLoading(true);
    try {
      const body = {
        title: lessonFormData.title,
        description: lessonFormData.description || undefined,
        videoUrl: lessonFormData.videoUrl,
        order: Number(lessonFormData.order),
        isLocked: lessonFormData.isLocked,
        durationMinutes: lessonFormData.durationMinutes ? Number(lessonFormData.durationMinutes) : undefined,
      };
      if (lessonModal.editing) {
        await api.put(`/supplier/courses/${activeCourse.id}/lessons/${lessonModal.editing.id}`, body);
        toast({ title: "Aula atualizada." });
      } else {
        await api.post(`/supplier/courses/${activeCourse.id}/lessons`, body);
        toast({ title: "Aula adicionada." });
      }
      setLessonModal({ open: false, editing: null });
      loadLessons(activeCourse.id);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Erro ao salvar aula.";
      toast({ title: "Erro", description: msg, variant: "destructive" });
    } finally {
      setLessonLoading(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!activeCourse) return;
    try {
      await api.delete(`/supplier/courses/${activeCourse.id}/lessons/${lessonId}`);
      setLessons(prev => prev.filter(l => l.id !== lessonId));
      toast({ title: "Aula removida." });
    } catch {
      toast({ title: "Erro ao remover aula.", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: (user.name as string) ?? "",
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

  const saveProfile = async () => {
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const body = new FormData();
      Object.entries(profileForm).forEach(([k, v]) => { if (v) body.append(k, v); });
      if (profilePhoto) body.append("photo", profilePhoto);
      const { data } = await api.put("/suppliers/profile", body);
      updateUser(data as Record<string, unknown>);
      setProfilePhoto(null);
      setProfileMsg({ ok: true, text: "Perfil atualizado com sucesso." });
    } catch {
      setProfileMsg({ ok: false, text: "Erro ao salvar. Verifique os dados e tente novamente." });
    } finally {
      setProfileLoading(false);
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

  const fmt = (val: number) => val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const getEmbedUrl = (url: string): string => {
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0`;
    const vimeo = url.match(/vimeo\.com\/(\d+)/);
    if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`;
    return url;
  };

  return (
    <div style={{ background: "var(--bg)", color: "var(--ink)", fontFamily: "inherit", display: "flex", height: "100vh", overflow: "hidden" }}>
      {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}

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
              <div className="mono" style={{ fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(255,255,255,.45)", lineHeight: 1.6 }}>Torrefador</div>
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
              <span className="mono" style={{ fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--ink-2)" }}>Torrefador</span>
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
        {activeTab === "Visão Geral" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <div style={{ display: "grid", gridTemplateColumns: mob ? "repeat(2, minmax(0, 1fr))" : "repeat(4, 1fr)", gap: 16 }}>
              <StatCard label="Produtos ativos" value={coffees.length} sub="cafés cadastrados" />
              <StatCard label="Pedidos pendentes" value={stats?.orders.pending ?? "—"} sub="aguardando processamento" />
              <StatCard label="Planos de assinatura" value={subscriptions.length} sub="planos cadastrados" />
              <StatCard label="Receita mensal" value={stats ? fmt(stats.revenue.monthly) : "—"} sub="mês atual" />
            </div>

            {/* CTA — catálogo de produtores */}
            <Link to="/explore" style={{ textDecoration: "none" }}>
              <div style={{
                padding: mob ? "20px 22px" : "24px 32px",
                borderRadius: 16,
                background: "var(--ink)",
                color: "var(--c-leveza)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 20,
                cursor: "pointer",
              }}>
                <div>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", opacity: 0.55, marginBottom: 8 }}>Abastecimento · B2B</div>
                  <div className="serif" style={{ fontSize: mob ? 22 : 28, letterSpacing: "-.01em", lineHeight: 1.1 }}>Catálogo de Produtores</div>
                  <div style={{ fontSize: 13, opacity: 0.65, marginTop: 6 }}>Compre café verde diretamente de produtores cadastrados</div>
                </div>
                <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 999, border: "1px solid rgba(238,243,235,.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7h9M7.8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              </div>
            </Link>

            <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 20 }}>
              <div style={{ padding: mob ? 18 : 28, borderRadius: 16, background: "var(--paper)", border: "1px solid var(--line)" }}>
                <div className="serif" style={{ fontSize: 26, letterSpacing: "-.01em", marginBottom: 18 }}>Meus Cafés</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {coffees.slice(0, 3).map(coffee => (
                    <div key={coffee.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "var(--bg-2)", borderRadius: 10 }}>
                      <div>
                        <div style={{ fontSize: 15 }}>{coffee.name}</div>
                        <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 2 }}>
                          {coffee.saleType === "KG" ? `${fmt(coffee.pricePerKg ?? 0)}/kg` : `${fmt(coffee.packagePrice ?? 0)} pacote`}
                        </div>
                      </div>
                      <span className="mono" style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 999, background: "var(--ink)", color: "var(--c-leveza)" }}>
                        {coffee.saleType}
                      </span>
                    </div>
                  ))}
                  {coffees.length === 0 && <p style={{ fontSize: 14, color: "var(--ink-2)" }}>Nenhum produto cadastrado.</p>}
                </div>
              </div>

              <div style={{ padding: mob ? 18 : 28, borderRadius: 16, background: "var(--paper)", border: "1px solid var(--line)" }}>
                <div className="serif" style={{ fontSize: 26, letterSpacing: "-.01em", marginBottom: 18 }}>Assinaturas Ativas</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {subscriptions.slice(0, 3).map(sub => (
                    <div key={sub.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "var(--bg-2)", borderRadius: 10 }}>
                      <div>
                        <div style={{ fontSize: 15 }}>{sub.name}</div>
                        <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 2 }}>{fmt(sub.monthlyPrice)}/mês</div>
                      </div>
                      <span className="mono" style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 999, border: "1px solid var(--ink)", color: "var(--ink)" }}>
                        Ativa
                      </span>
                    </div>
                  ))}
                  {subscriptions.length === 0 && <p style={{ fontSize: 14, color: "var(--ink-2)" }}>Nenhuma assinatura cadastrada.</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PRODUTOS */}
        {activeTab === "Produtos" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div className="serif" style={{ fontSize: mob ? 22 : 32, letterSpacing: "-.01em" }}>Meus Produtos</div>
                <p style={{ fontSize: 14, color: "var(--ink-2)", marginTop: 4 }}>Gerencie seu catálogo de cafés</p>
              </div>
              <AddCoffeeForm onSuccess={loadCoffees} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(3, 1fr)", gap: 20 }}>
              {coffees.map(coffee => (
                <div key={coffee.id} style={{ borderRadius: 16, background: "var(--paper)", border: "1px solid var(--line)", overflow: "hidden", boxShadow: "0 8px 24px -16px rgba(28,8,16,.15)" }}>
                  <div style={{ aspectRatio: "16/9", background: "var(--bg-2)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    {coffee.photoUrl
                      ? <img src={coffee.photoUrl} alt={coffee.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <PackageIcon size={32} />}
                  </div>
                  <div style={{ padding: 20 }}>
                    <div style={{ fontSize: 17, fontWeight: 500, marginBottom: 4 }}>{coffee.name}</div>
                    <div style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 16 }}>{coffee.description}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{ fontSize: 14 }}>{coffee.saleType === "KG" ? "Por kg:" : "Pacote:"}</span>
                      <span className="serif" style={{ fontSize: 20, letterSpacing: "-.01em" }}>
                        {coffee.saleType === "KG" ? fmt(coffee.pricePerKg ?? 0) : fmt(coffee.packagePrice ?? 0)}
                      </span>
                    </div>
                    {coffee.stock != null && coffee.saleType === "KG" && (
                      <div style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 14 }}>Estoque: {coffee.stock} kg</div>
                    )}
                    <div style={{ display: "flex", gap: 8 }}>
                      <AddCoffeeForm initialCoffee={coffee} onSuccess={loadCoffees} />
                      <button
                        onClick={() => handleDeleteCoffee(coffee.id)}
                        style={{
                          flex: 1, padding: "8px 14px", borderRadius: 8, fontSize: 13,
                          border: "1px solid var(--line)", background: "var(--bg-2)",
                          color: "var(--ink-2)", cursor: "pointer", fontFamily: "inherit",
                        }}
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {coffees.length === 0 && (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 32px", color: "var(--ink-2)", fontSize: 15 }}>
                  Nenhum café cadastrado ainda. Clique em "Adicionar Produto" para começar.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ESTOQUE */}
        {activeTab === "Estoque" && (() => {
          const outOfStock = coffees.filter(c => (c.stock ?? 0) === 0);
          const lowStock = coffees.filter(c => (c.stock ?? 0) > 0 && (c.stock ?? 0) < LOW_STOCK_UNITS);
          const unitFor = (c: Coffee) => c.saleType === "KG" ? "kg" : "un";
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              <div style={{ display: "grid", gridTemplateColumns: mob ? "repeat(2, minmax(0, 1fr))" : "repeat(4,1fr)", gap: 16 }}>
                <StatCard label="Produtos ativos" value={coffees.length} sub="SKUs cadastrados" />
                <StatCard label="Com estoque" value={coffees.filter(c => (c.stock ?? 0) > 0).length} sub="produtos disponíveis" />
                <StatCard label="Estoque baixo" value={lowStock.length} sub={`abaixo de ${LOW_STOCK_UNITS} un/kg`} />
                <StatCard label="Sem estoque" value={outOfStock.length} sub="produtos zerados" />
              </div>

              <div>
                <div className="serif" style={{ fontSize: 24, letterSpacing: "-.01em", marginBottom: 16 }}>Visão por Produto</div>
                <div style={{ borderRadius: 16, background: "var(--paper)", border: "1px solid var(--line)", overflow: "hidden" }}>
                  {!mob && (
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 100px", padding: "12px 20px", borderBottom: "1px solid var(--line)", background: "var(--bg-2)" }}>
                      {["Produto", "Tipo venda", "Estoque", "Status", ""].map(h => (
                        <span key={h} className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)" }}>{h}</span>
                      ))}
                    </div>
                  )}
                  {coffees.map((c, i) => {
                    const stock = c.stock ?? 0;
                    const status = stock === 0 ? "Zerado" : stock < LOW_STOCK_UNITS ? "Baixo" : "OK";
                    const statusClr = stock === 0 ? "#b8231a" : stock < LOW_STOCK_UNITS ? "var(--c-mostarda)" : "#2e7244";
                    return (
                      <div key={c.id} style={mob ? {
                        padding: "14px 16px", borderTop: i ? "1px solid var(--line)" : undefined,
                        display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
                      } : {
                        display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 100px", padding: "14px 20px",
                        borderTop: i ? "1px solid var(--line)" : undefined, alignItems: "center",
                      }}>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{c.name}</div>
                        {!mob && <span className="mono" style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 999, background: "var(--bg-2)", color: "var(--ink-2)" }}>{c.saleType}</span>}
                        <div className="serif" style={{ fontSize: mob ? 16 : 20, letterSpacing: "-.01em" }}>{stock} {unitFor(c)}</div>
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
                    <div style={{ padding: "48px 20px", textAlign: "center", fontSize: 14, color: "var(--ink-2)" }}>Nenhum produto cadastrado.</div>
                  )}
                </div>
              </div>

              <div>
                <div className="serif" style={{ fontSize: 24, letterSpacing: "-.01em", marginBottom: 16 }}>Histórico de Movimentações</div>
                <div style={{ borderRadius: 16, background: "var(--paper)", border: "1px solid var(--line)", overflow: "hidden" }}>
                  {!mob && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px 80px 1fr", padding: "12px 20px", borderBottom: "1px solid var(--line)", background: "var(--bg-2)" }}>
                      {["Data", "Produto", "Tipo", "Qtd", "Motivo"].map(h => (
                        <span key={h} className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)" }}>{h}</span>
                      ))}
                    </div>
                  )}
                  {movements.map((m, i) => {
                    const coffee = coffees.find(c => c.id === m.coffeeId);
                    const unit = coffee?.saleType === "KG" ? "kg" : "un";
                    return (
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
                          {m.delta > 0 ? "+" : ""}{m.delta} {unit}
                        </div>
                        <div style={{ fontSize: 13, color: "var(--ink-2)" }}>{m.reason ?? "—"}</div>
                      </div>
                    );
                  })}
                  {movements.length === 0 && (
                    <div style={{ padding: "48px 20px", textAlign: "center", fontSize: 14, color: "var(--ink-2)" }}>Nenhuma movimentação registrada.</div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ESTOQUE CAFETERIAS */}
        {activeTab === "Estoque Cafeterias" && (() => {
          // Group rows by coffeeshop
          const grouped = new Map<string, { name: string; email: string; city: string | null; state: string | null; rows: CoffeeshopStockRow[] }>();
          for (const row of csStock) {
            if (!grouped.has(row.coffeeshopId)) {
              grouped.set(row.coffeeshopId, { name: row.coffeeshopName, email: row.coffeeshopEmail, city: row.city, state: row.state, rows: [] });
            }
            grouped.get(row.coffeeshopId)!.rows.push(row);
          }
          const shops = Array.from(grouped.entries());
          const lowShops = shops.filter(([, v]) => v.rows.some(r => r.isLow)).length;

          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" as const }}>
                <div>
                  <div className="serif" style={{ fontSize: mob ? 22 : 32, letterSpacing: "-.01em", marginBottom: 4 }}>Estoque das Cafeterias</div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--ink-2)", letterSpacing: ".12em" }}>
                    {shops.length} cafeteria(s) · {lowShops > 0 ? `${lowShops} com estoque baixo` : "todos ok"}
                  </div>
                </div>
                <button onClick={loadCsStock} style={{ padding: "9px 16px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--bg)", fontSize: 13, fontFamily: "inherit", cursor: "pointer", color: "var(--ink)", display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
                  Atualizar
                </button>
              </div>

              {csStockLoading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 0" }}>
                  <svg width="28" height="28" viewBox="0 0 16 16" fill="none" style={{ animation: "spin 1s linear infinite" }}>
                    <circle cx="8" cy="8" r="6" stroke="var(--ink-2)" strokeWidth="2" strokeDasharray="25 13" strokeLinecap="round"/>
                    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                  </svg>
                </div>
              ) : shops.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "var(--ink-2)", fontSize: 14 }}>
                  Nenhuma cafeteria utiliza seus produtos ainda.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {shops.map(([csId, cs]) => {
                    const expanded = !!csExpanded[csId];
                    const lowCount = cs.rows.filter(r => r.isLow).length;
                    return (
                      <div key={csId} style={{ background: "var(--paper)", borderRadius: 14, border: "1px solid var(--line)", overflow: "hidden" }}>
                        <button onClick={() => setCsExpanded(p => ({ ...p, [csId]: !p[csId] }))}
                          style={{ width: "100%", padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--ink-2)" strokeWidth={1.8} style={{ transform: expanded ? "rotate(90deg)" : "none", transition: "transform .15s", flexShrink: 0 }}><polyline points="9 18 15 12 9 6"/></svg>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <span style={{ fontSize: 15, fontWeight: 500, color: "var(--ink)" }}>{cs.name}</span>
                              {lowCount > 0 && (
                                <span className="mono" style={{ fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", padding: "3px 9px", borderRadius: 999, background: "rgba(184,35,26,.1)", color: "var(--c-vibra)", border: "1px solid rgba(184,35,26,.25)" }}>
                                  {lowCount} baixo estoque
                                </span>
                              )}
                            </div>
                            <div className="mono" style={{ fontSize: 11, color: "var(--ink-2)", marginTop: 2 }}>
                              {cs.city ?? "—"}/{cs.state ?? "—"} · {cs.email} · {cs.rows.length} produto(s)
                            </div>
                          </div>
                        </button>
                        {expanded && (
                          <div style={{ borderTop: "1px solid var(--line)", overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                              <thead>
                                <tr style={{ background: "var(--bg)" }}>
                                  <th style={{ padding: "10px 18px", textAlign: "left", fontWeight: 500, color: "var(--ink-2)", fontSize: 11 }}>Café</th>
                                  <th style={{ padding: "10px 18px", textAlign: "right", fontWeight: 500, color: "var(--ink-2)", fontSize: 11 }}>Qtd</th>
                                  <th style={{ padding: "10px 18px", textAlign: "right", fontWeight: 500, color: "var(--ink-2)", fontSize: 11 }}>Alerta</th>
                                  <th style={{ padding: "10px 18px", textAlign: "center", fontWeight: 500, color: "var(--ink-2)", fontSize: 11 }}>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {cs.rows.map((row, i) => (
                                  <tr key={row.coffeeId} style={{ borderTop: i === 0 ? "none" : "1px solid var(--line)", background: row.isLow ? "rgba(184,35,26,.04)" : undefined }}>
                                    <td style={{ padding: "11px 18px", fontWeight: 500, color: "var(--ink)" }}>{row.coffeeName}</td>
                                    <td style={{ padding: "11px 18px", textAlign: "right", color: row.isLow ? "var(--c-vibra)" : "var(--ink)", fontWeight: row.isLow ? 600 : undefined }}>{row.quantity}</td>
                                    <td style={{ padding: "11px 18px", textAlign: "right", color: "var(--ink-2)" }}>{row.alertAt ?? "—"}</td>
                                    <td style={{ padding: "11px 18px", textAlign: "center" }}>
                                      {row.isLow
                                        ? <span className="mono" style={{ fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", padding: "3px 9px", borderRadius: 999, background: "rgba(184,35,26,.1)", color: "var(--c-vibra)", border: "1px solid rgba(184,35,26,.25)" }}>Baixo</span>
                                        : <span className="mono" style={{ fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", padding: "3px 9px", borderRadius: 999, background: "rgba(46,114,68,.1)", color: "#2e7244", border: "1px solid rgba(46,114,68,.25)" }}>OK</span>
                                      }
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* ASSINATURAS */}
        {activeTab === "Assinaturas" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div className="serif" style={{ fontSize: mob ? 22 : 32, letterSpacing: "-.01em" }}>Minhas Assinaturas</div>
                <p style={{ fontSize: 14, color: "var(--ink-2)", marginTop: 4 }}>Planos de assinatura que você oferece</p>
              </div>
              <AddSubscriptionForm onSuccess={loadSubscriptions} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(2, 1fr)", gap: 20 }}>
              {subscriptions.map(sub => (
                <div key={sub.id} style={{ padding: mob ? "20px 18px" : 28, borderRadius: 16, background: "var(--paper)", border: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div className="serif" style={{ fontSize: 26, letterSpacing: "-.01em" }}>{sub.name}</div>
                    <span className="mono" style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 999, border: "1px solid var(--ink)", color: "var(--ink)" }}>Ativa</span>
                  </div>
                  <p style={{ fontSize: 14, color: "var(--ink-2)", marginBottom: 20 }}>{sub.description}</p>
                  <div style={{ display: "flex", gap: 24, marginBottom: 20, flexWrap: "wrap" as const }}>
                    <div>
                      <div style={{ fontSize: 12, color: "var(--ink-2)" }}>Mensal</div>
                      <div className="serif" style={{ fontSize: mob ? 22 : 28, letterSpacing: "-.01em", wordBreak: "break-all" }}>{fmt(sub.monthlyPrice)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: "var(--ink-2)" }}>Anual</div>
                      <div className="serif" style={{ fontSize: mob ? 22 : 28, letterSpacing: "-.01em", wordBreak: "break-all" }}>{fmt(sub.annualPrice)}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <AddSubscriptionForm initialSubscription={sub} onSuccess={loadSubscriptions} />
                    <button
                      onClick={() => handleDeleteSubscription(sub.id)}
                      style={{
                        flex: 1, padding: "8px 14px", borderRadius: 8, fontSize: 13,
                        border: "1px solid var(--line)", background: "var(--bg-2)",
                        color: "var(--ink-2)", cursor: "pointer", fontFamily: "inherit",
                      }}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
              {subscriptions.length === 0 && (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 32px", color: "var(--ink-2)", fontSize: 15 }}>
                  Nenhuma assinatura cadastrada ainda.
                </div>
              )}
            </div>
          </div>
        )}

        {/* CURSOS */}
        {activeTab === "Cursos" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {activeCourse ? (
              <>
                {/* Back bar */}
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => { setActiveCourse(null); setLessons([]); setShowStudents(false); setStudents([]); }}
                    style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 16px", borderRadius: 999, border: "1px solid var(--line)", background: "none", fontSize: 13, cursor: "pointer", fontFamily: "inherit", color: "var(--ink-2)" }}
                  >
                    ← Voltar
                  </button>
                  <div style={{ flex: 1 }}>
                    <div className="serif" style={{ fontSize: 26, letterSpacing: "-.01em" }}>{activeCourse.title}</div>
                    <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 2 }}>
                      {showStudents ? "Alunos matriculados" : "Módulos e aulas"}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!showStudents) {
                        setStudentsLoading(true);
                        api.get<CourseStudent[]>(`/supplier/courses/${activeCourse.id}/students`)
                          .then(r => setStudents(r.data))
                          .catch(() => setStudents([]))
                          .finally(() => setStudentsLoading(false));
                      }
                      setShowStudents(v => !v);
                    }}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 16px",
                      borderRadius: 999, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                      border: showStudents ? "1px solid var(--ink)" : "1px solid var(--line)",
                      background: showStudents ? "var(--ink)" : "none",
                      color: showStudents ? "var(--c-leveza)" : "var(--ink-2)",
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
                    </svg>
                    {showStudents ? "Ver aulas" : "Ver alunos"}
                  </button>
                </div>

                {/* Students panel */}
                {showStudents && (
                  <div style={{ borderRadius: 16, border: "1px solid var(--line)", background: "var(--paper)", overflow: "hidden" }}>
                    <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--line)", background: "var(--bg-2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)" }}>
                        Progresso dos alunos
                      </span>
                      {!studentsLoading && (
                        <span className="mono" style={{ fontSize: 10, color: "var(--ink-2)" }}>{students.length} aluno{students.length !== 1 ? "s" : ""}</span>
                      )}
                    </div>
                    {studentsLoading ? (
                      <div style={{ padding: "32px 20px", textAlign: "center", fontSize: 13, color: "var(--ink-2)" }}>Carregando...</div>
                    ) : students.length === 0 ? (
                      <div style={{ padding: "32px 20px", textAlign: "center", fontSize: 13, color: "var(--ink-2)" }}>Nenhum aluno matriculado ainda.</div>
                    ) : (
                      <div style={{ overflowX: "auto" }}>
                        {/* Header row */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 120px 120px", padding: "10px 20px", borderBottom: "1px solid var(--line)", gap: 12, minWidth: 480 }}>
                          {["Aluno", "Aulas", "Conclusão", "Última atividade"].map(h => (
                            <div key={h} className="mono" style={{ fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)" }}>{h}</div>
                          ))}
                        </div>
                        {students.map((s, i) => (
                          <div key={s.userId} style={{ display: "grid", gridTemplateColumns: "1fr 140px 120px 120px", padding: "14px 20px", borderTop: i ? "1px solid var(--line)" : undefined, gap: 12, alignItems: "center", minWidth: 480 }}>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 500 }}>{s.userName}</div>
                              <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 2 }}>{s.userEmail}</div>
                            </div>
                            <div className="mono" style={{ fontSize: 13 }}>
                              {s.completedLessons}/{s.totalLessons}
                            </div>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ flex: 1, height: 6, background: "var(--bg-2)", borderRadius: 999 }}>
                                  <div style={{
                                    height: "100%", width: `${s.completionPercent}%`, borderRadius: 999,
                                    background: s.completionPercent === 100
                                      ? "linear-gradient(90deg, var(--c-glamour), #2e7244)"
                                      : "linear-gradient(90deg, var(--c-mostarda), var(--c-vibra))",
                                  }} />
                                </div>
                                <span className="mono" style={{ fontSize: 11, color: s.completionPercent === 100 ? "var(--c-glamour)" : "var(--ink-2)", flexShrink: 0 }}>
                                  {s.completionPercent}%
                                </span>
                              </div>
                            </div>
                            <div style={{ fontSize: 12, color: "var(--ink-2)" }}>
                              {s.lastActivityAt
                                ? new Date(s.lastActivityAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
                                : "—"}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Module sections */}
                {!showStudents && moduleNames.map((modName, idx) => {
                  const moduleNum = idx + 1;
                  const moduleLessons = [...lessons].filter(l => getModuleNum(l.order) === moduleNum).sort((a, b) => a.order - b.order);
                  return (
                    <div key={moduleNum} style={{ borderRadius: 16, border: "1px solid var(--line)", background: "var(--paper)", overflow: "hidden" }}>
                      <div style={{ padding: mob ? "12px 16px" : "14px 20px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-2)", gap: 12, flexWrap: "wrap" as const }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                          <span className="mono" style={{ fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", flexShrink: 0 }}>Módulo {moduleNum}</span>
                          <input
                            value={modName}
                            onChange={e => setModuleNames(prev => prev.map((n, i) => i === idx ? e.target.value : n))}
                            style={{ fontSize: 15, fontWeight: 500, border: "none", background: "transparent", outline: "none", color: "var(--ink)", fontFamily: "inherit", minWidth: 0, width: "100%" }}
                            placeholder={`Módulo ${moduleNum}`}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => openAddLessonInModule(moduleNum)}
                          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 999, background: "var(--ink)", color: "var(--c-leveza)", border: 0, fontSize: 12, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}
                        >
                          <span style={{ fontSize: 14, lineHeight: 1 }}>+</span> Adicionar aula
                        </button>
                      </div>

                      {moduleLessons.length === 0 ? (
                        <div style={{ padding: "24px 20px", textAlign: "center", fontSize: 13, color: "var(--ink-2)" }}>
                          Nenhuma aula neste módulo.
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          {moduleLessons.map((l, li) => (
                            <div key={l.id} style={{ display: "flex", alignItems: mob ? "flex-start" : "center", gap: mob ? 10 : 14, padding: mob ? "12px 16px" : "14px 20px", borderTop: li ? "1px solid var(--line)" : undefined, flexWrap: mob ? "wrap" as const : undefined }}>
                              <div className="mono" style={{ fontSize: 11, letterSpacing: ".1em", color: "var(--ink-2)", flexShrink: 0, width: 20, textAlign: "center", marginTop: mob ? 2 : 0 }}>
                                {li + 1}
                              </div>
                              <div style={{ flex: mob ? "1 1 200px" : 1, minWidth: 0 }}>
                                <div style={{ fontSize: 14, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.title}</div>
                                <div style={{ display: "flex", gap: 10, marginTop: 3, flexWrap: "wrap" }}>
                                  {l.durationMinutes && <span style={{ fontSize: 12, color: "var(--ink-2)" }}>{l.durationMinutes} min</span>}
                                  {l.isLocked && <span className="mono" style={{ fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 999, background: "var(--c-glamour)", color: "var(--ink)" }}>Bloqueada</span>}
                                </div>
                              </div>
                              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                                <button type="button" onClick={() => setPreviewLesson(l)} title="Visualizar" style={{ width: 32, height: 32, borderRadius: 999, border: "1px solid var(--line)", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-2)" }}>
                                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><polygon points="3,1.5 12,6.5 3,11.5" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="currentColor" fillOpacity=".15"/></svg>
                                </button>
                                <button type="button" onClick={() => openEditLesson(l)} style={{ padding: "6px 12px", borderRadius: 999, border: "1px solid var(--line)", background: "none", fontSize: 12, cursor: "pointer", fontFamily: "inherit", color: "var(--ink)" }}>Editar</button>
                                <button type="button" onClick={() => handleDeleteLesson(l.id)} style={{ padding: "6px 12px", borderRadius: 999, border: "1px solid var(--line)", background: "none", fontSize: 12, cursor: "pointer", fontFamily: "inherit", color: "var(--c-vibra)" }}>Remover</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {!showStudents && (
                  <button
                    type="button"
                    onClick={() => setModuleNames(prev => [...prev, `Módulo ${prev.length + 1}`])}
                    style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 20px", borderRadius: 999, border: "1px dashed var(--line)", background: "none", fontSize: 14, cursor: "pointer", fontFamily: "inherit", color: "var(--ink-2)" }}
                  >
                    <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Adicionar módulo
                  </button>
                )}
              </>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div className="serif" style={{ fontSize: mob ? 22 : 32, letterSpacing: "-.01em" }}>Meus Cursos</div>
                    <p style={{ fontSize: 14, color: "var(--ink-2)", marginTop: 4 }}>Cursos que você oferece na plataforma</p>
                  </div>
                  <button
                    type="button"
                    onClick={openCourseCreate}
                    style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 20px", borderRadius: 999, background: "var(--ink)", color: "var(--c-leveza)", border: 0, cursor: "pointer", fontFamily: "inherit", fontSize: 14 }}
                  >
                    <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Novo curso
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                  {courses.map(c => (
                    <div key={c.id} style={{ borderRadius: 16, background: "var(--paper)", border: "1px solid var(--line)", overflow: "hidden" }}>
                      {c.imageUrl ? (
                        <img src={c.imageUrl} alt={c.title} style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />
                      ) : (
                        <div style={{ height: 160, background: "var(--c-glamour)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span className="script" style={{ fontSize: 48, color: "var(--c-mostarda)" }}>íle</span>
                        </div>
                      )}
                      <div style={{ padding: "16px 20px 20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                          <div className="serif" style={{ fontSize: 18, lineHeight: 1.2, letterSpacing: "-.01em" }}>{c.title}</div>
                          <span className="mono" style={{ fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 999, background: "var(--bg-2)", color: "var(--ink-2)", flexShrink: 0 }}>
                            {levelLabel[c.level]}
                          </span>
                        </div>
                        <p style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 6, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {c.description}
                        </p>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
                          <div>
                            <div className="serif" style={{ fontSize: 22, letterSpacing: "-.01em" }}>{fmt(c.price)}</div>
                            <div className="mono" style={{ fontSize: 10, color: "var(--ink-2)", marginTop: 2, letterSpacing: ".1em", textTransform: "uppercase" }}>{c.workloadHours}h de conteúdo</div>
                          </div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            <button type="button" onClick={() => openManageCourse(c)} style={{ padding: "8px 14px", borderRadius: 999, border: "1px solid var(--ink)", background: "var(--ink)", fontSize: 12, cursor: "pointer", fontFamily: "inherit", color: "var(--c-leveza)" }}>
                              Gerenciar
                            </button>
                            <button type="button" onClick={() => openCourseEdit(c)} style={{ padding: "8px 12px", borderRadius: 999, border: "1px solid var(--line)", background: "none", fontSize: 12, cursor: "pointer", fontFamily: "inherit", color: "var(--ink)" }}>
                              Editar
                            </button>
                            <button type="button" onClick={() => handleDeleteCourse(c.id)} style={{ padding: "8px 12px", borderRadius: 999, border: "1px solid var(--line)", background: "none", fontSize: 12, cursor: "pointer", fontFamily: "inherit", color: "var(--c-vibra)" }}>
                              Remover
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {courses.length === 0 && (
                    <div style={{ gridColumn: "1/-1", padding: "56px 0", textAlign: "center", fontSize: 14, color: "var(--ink-2)" }}>
                      Nenhum curso cadastrado ainda.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Modal de curso */}
        {courseModal.open && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(28,8,16,.55)", backdropFilter: "blur(4px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div style={{ background: "var(--paper)", borderRadius: 20, padding: mob ? "20px 16px" : 32, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
              <div className="serif" style={{ fontSize: 24, letterSpacing: "-.01em", marginBottom: 24 }}>
                {courseModal.editing ? "Editar curso" : "Novo curso"}
              </div>

              {[
                { label: "Título *", key: "title", type: "text", placeholder: "Ex: Introdução ao café especial" },
                { label: "Preço (R$) *", key: "price", type: "number", placeholder: "0.00" },
                { label: "Carga horária (h) *", key: "workloadHours", type: "number", placeholder: "Ex: 8" },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 12, marginBottom: 6, color: "var(--ink-2)" }} className="mono">{f.label}</label>
                  <input
                    type={f.type}
                    value={(courseForm as any)[f.key]}
                    placeholder={f.placeholder}
                    onChange={e => setCourseForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--bg)", fontSize: 14, fontFamily: "inherit", outline: "none", color: "var(--ink)", boxSizing: "border-box" }}
                  />
                </div>
              ))}

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, marginBottom: 6, color: "var(--ink-2)" }} className="mono">Descrição *</label>
                <textarea
                  value={courseForm.description}
                  rows={3}
                  placeholder="Descreva o curso..."
                  onChange={e => setCourseForm(prev => ({ ...prev, description: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--bg)", fontSize: 14, fontFamily: "inherit", outline: "none", color: "var(--ink)", resize: "vertical", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, marginBottom: 6, color: "var(--ink-2)" }} className="mono">Nível</label>
                <select
                  value={courseForm.level}
                  onChange={e => setCourseForm(prev => ({ ...prev, level: e.target.value as CourseFormData["level"] }))}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--bg)", fontSize: 14, fontFamily: "inherit", outline: "none", color: "var(--ink)", boxSizing: "border-box" }}
                >
                  <option value="BEGINNER">Iniciante</option>
                  <option value="INTERMEDIATE">Intermediário</option>
                  <option value="ADVANCED">Avançado</option>
                </select>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 12, marginBottom: 10, color: "var(--ink-2)" }} className="mono">Imagem do curso</label>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{
                    width: 80, height: 80, borderRadius: 12, flexShrink: 0,
                    background: "var(--bg-2)", border: "1px solid var(--line)",
                    overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--ink-2)",
                  }}>
                    {coursePhotoPreview
                      ? <img src={coursePhotoPreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.3"/><circle cx="8.5" cy="9.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M3 15l5-4 4 4 3-3 6 5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>
                    }
                  </div>
                  <div>
                    <input
                      ref={coursePhotoInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={e => {
                        const f = e.target.files?.[0] ?? null;
                        setCoursePhotoFile(f);
                        if (f) setCoursePhotoPreview(URL.createObjectURL(f));
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => coursePhotoInputRef.current?.click()}
                      style={{
                        padding: "9px 18px", borderRadius: 999,
                        border: "1px solid var(--line)", background: "var(--bg)",
                        fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                        color: "var(--ink)", display: "block", marginBottom: 8,
                        transition: "border-color .15s",
                      }}
                    >
                      {coursePhotoFile ? "Trocar imagem" : "Selecionar imagem"}
                    </button>
                    {coursePhotoFile && <div style={{ fontSize: 12, color: "var(--ink-2)" }}>{coursePhotoFile.name}</div>}
                    {!coursePhotoFile && coursePhotoPreview && <div style={{ fontSize: 12, color: "var(--ink-2)" }}>Imagem atual mantida</div>}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setCourseModal({ open: false, editing: null })}
                  style={{ padding: "11px 20px", borderRadius: 999, border: "1px solid var(--line)", background: "none", fontSize: 14, cursor: "pointer", fontFamily: "inherit", color: "var(--ink)" }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCourseSubmit}
                  disabled={courseLoading}
                  style={{ padding: "11px 20px", borderRadius: 999, background: "var(--ink)", color: "var(--c-leveza)", border: 0, fontSize: 14, cursor: courseLoading ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: courseLoading ? 0.7 : 1 }}
                >
                  {courseLoading ? "Salvando…" : courseModal.editing ? "Salvar alterações" : "Criar curso"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal — form de aula */}
        {lessonModal.open && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(28,8,16,.65)", backdropFilter: "blur(4px)", zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div style={{ background: "var(--paper)", borderRadius: 20, padding: mob ? "20px 16px" : 32, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }}>
              <div className="serif" style={{ fontSize: 22, letterSpacing: "-.01em", marginBottom: 24 }}>
                {lessonModal.editing ? "Editar aula" : `Nova aula — Módulo ${currentLessonModule}`}
              </div>

              {/* Título */}
              <div style={{ marginBottom: 16 }}>
                <label className="mono" style={{ display: "block", fontSize: 12, marginBottom: 6, color: "var(--ink-2)" }}>Título *</label>
                <input
                  type="text"
                  value={lessonFormData.title}
                  placeholder="Ex: Introdução ao processamento natural"
                  onChange={e => setLessonFormData(p => ({ ...p, title: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--bg)", fontSize: 14, fontFamily: "inherit", outline: "none", color: "var(--ink)", boxSizing: "border-box" }}
                />
              </div>

              {/* URL do vídeo */}
              <div style={{ marginBottom: 16 }}>
                <label className="mono" style={{ display: "block", fontSize: 12, marginBottom: 6, color: "var(--ink-2)" }}>URL do vídeo *</label>
                <input
                  type="url"
                  value={lessonFormData.videoUrl}
                  placeholder="https://..."
                  onChange={e => setLessonFormData(p => ({ ...p, videoUrl: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--bg)", fontSize: 14, fontFamily: "inherit", outline: "none", color: "var(--ink)", boxSizing: "border-box" }}
                />
              </div>

              {/* Descrição */}
              <div style={{ marginBottom: 16 }}>
                <label className="mono" style={{ display: "block", fontSize: 12, marginBottom: 6, color: "var(--ink-2)" }}>Descrição</label>
                <textarea
                  value={lessonFormData.description}
                  rows={2}
                  placeholder="Breve descrição da aula..."
                  onChange={e => setLessonFormData(p => ({ ...p, description: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--bg)", fontSize: 14, fontFamily: "inherit", outline: "none", color: "var(--ink)", resize: "vertical", boxSizing: "border-box" }}
                />
              </div>

              {/* Ordem e duração */}
              <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div>
                  <label className="mono" style={{ display: "block", fontSize: 12, marginBottom: 6, color: "var(--ink-2)" }}>Ordem</label>
                  <input
                    type="number"
                    min={1}
                    value={lessonFormData.order}
                    onChange={e => setLessonFormData(p => ({ ...p, order: e.target.value }))}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--bg)", fontSize: 14, fontFamily: "inherit", outline: "none", color: "var(--ink)", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label className="mono" style={{ display: "block", fontSize: 12, marginBottom: 6, color: "var(--ink-2)" }}>Duração (min)</label>
                  <input
                    type="number"
                    min={1}
                    value={lessonFormData.durationMinutes}
                    placeholder="Ex: 15"
                    onChange={e => setLessonFormData(p => ({ ...p, durationMinutes: e.target.value }))}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--bg)", fontSize: 14, fontFamily: "inherit", outline: "none", color: "var(--ink)", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              {/* isLocked toggle */}
              <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setLessonFormData(p => ({ ...p, isLocked: !p.isLocked }))}
                  style={{
                    width: 44, height: 24, borderRadius: 999, border: "none", cursor: "pointer",
                    background: lessonFormData.isLocked ? "var(--c-glamour)" : "var(--line)",
                    position: "relative", transition: "background .2s", flexShrink: 0,
                  }}
                  aria-checked={lessonFormData.isLocked}
                  role="switch"
                >
                  <span style={{
                    position: "absolute", top: 2, left: lessonFormData.isLocked ? 22 : 2,
                    width: 20, height: 20, borderRadius: 999,
                    background: "var(--paper)", transition: "left .2s",
                    boxShadow: "0 1px 4px rgba(0,0,0,.2)",
                  }} />
                </button>
                <label className="mono" style={{ fontSize: 12, color: "var(--ink-2)", cursor: "pointer" }} onClick={() => setLessonFormData(p => ({ ...p, isLocked: !p.isLocked }))}>
                  Aula bloqueada (pré-visualização restrita)
                </label>
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setLessonModal({ open: false, editing: null })}
                  style={{ padding: "11px 20px", borderRadius: 999, border: "1px solid var(--line)", background: "none", fontSize: 14, cursor: "pointer", fontFamily: "inherit", color: "var(--ink)" }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveLesson}
                  disabled={lessonLoading}
                  style={{ padding: "11px 20px", borderRadius: 999, background: "var(--ink)", color: "var(--c-leveza)", border: 0, fontSize: 14, cursor: lessonLoading ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: lessonLoading ? 0.7 : 1 }}
                >
                  {lessonLoading ? "Salvando…" : lessonModal.editing ? "Salvar alterações" : "Adicionar aula"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal — preview de vídeo */}
        {previewLesson && (
          <div
            onClick={() => setPreviewLesson(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(10,4,8,.82)", backdropFilter: "blur(6px)", zIndex: 80, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}
          >
            <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 820, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <div className="serif" style={{ fontSize: 20, letterSpacing: "-.01em", color: "var(--c-leveza)" }}>{previewLesson.title}</div>
                  {previewLesson.durationMinutes && (
                    <div style={{ fontSize: 12, color: "rgba(238,243,235,.55)", marginTop: 2 }}>{previewLesson.durationMinutes} min</div>
                  )}
                </div>
                <button
                  onClick={() => setPreviewLesson(null)}
                  style={{ width: 36, height: 36, borderRadius: 999, border: "1px solid rgba(238,243,235,.2)", background: "rgba(238,243,235,.08)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--c-leveza)", flexShrink: 0 }}
                  aria-label="Fechar"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                </button>
              </div>
              <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", borderRadius: 14, overflow: "hidden", background: "#000" }}>
                <iframe
                  src={getEmbedUrl(previewLesson.videoUrl)}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
                />
              </div>
              <div style={{ fontSize: 11, color: "rgba(238,243,235,.38)", textAlign: "center" }}>Clique fora do vídeo ou pressione ESC para fechar</div>
            </div>
          </div>
        )}

        {/* PERFIL */}
        {activeTab === "Perfil" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 760 }}>
            <div>
              <div className="serif" style={{ fontSize: mob ? 22 : 32, letterSpacing: "-.01em" }}>Minha Conta</div>
              <p style={{ fontSize: 14, color: "var(--ink-2)", marginTop: 4 }}>Atualize suas informações de perfil</p>
            </div>

            <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 16, padding: mob ? "20px 16px 16px" : "28px 28px 24px" }}>
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
                  <input ref={profilePhotoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0] ?? null; setProfilePhoto(f); if (f) setProfilePhotoPreview(URL.createObjectURL(f)); }} />
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
                  { label: "Nome da empresa / Nome", key: "name", placeholder: "Seu nome ou razão social" },
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
                <div>
                  <label className="mono" style={{ display: "block", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 6 }}>Complemento</label>
                  <input
                    type="text"
                    value={profileForm.complement}
                    placeholder="Sala 5, Andar 2…"
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
                  type="button"
                  onClick={saveProfile}
                  disabled={profileLoading}
                  style={{ padding: "11px 24px", borderRadius: 999, background: "var(--ink)", color: "var(--c-leveza)", border: 0, fontSize: 14, cursor: profileLoading ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: profileLoading ? 0.7 : 1 }}
                >
                  {profileLoading ? "Salvando…" : "Salvar alterações"}
                </button>
              </div>
            </div>

            {/* Mercado Pago */}
            <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 16, padding: "24px 28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <svg width={22} height={22} viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="var(--c-glamour)"/></svg>
                <div className="serif" style={{ fontSize: 20, letterSpacing: "-.01em" }}>Recebimentos · Mercado Pago</div>
              </div>
              {mpConnected === null ? (
                <div style={{ fontSize: 13, color: "var(--ink-2)" }}>Verificando conexão…</div>
              ) : mpConnected ? (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 999, background: "#2e7244", display: "inline-block" }} />
                    <span style={{ fontSize: 13, color: "#2e7244", fontWeight: 500 }}>Conta conectada</span>
                    {mpUserId && <span style={{ fontSize: 12, color: "var(--ink-2)", marginLeft: 4 }}>— ID {mpUserId}</span>}
                  </div>
                  <p style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 18 }}>
                    Seus produtos já estão configurados para receber pagamentos diretamente na sua conta Mercado Pago.
                    A plataforma retém 3% de comissão em cada transação.
                  </p>
                  <button
                    type="button"
                    disabled={mpLoading}
                    onClick={async () => {
                      if (!confirm("Deseja desconectar sua conta do Mercado Pago? Seus produtos não poderão ser comprados até você reconectar.")) return;
                      setMpLoading(true);
                      try {
                        await api.delete("/supplier/mp/connect");
                        setMpConnected(false);
                        setMpUserId(null);
                        toast({ title: "Conta Mercado Pago desconectada." });
                      } catch {
                        toast({ title: "Erro ao desconectar.", variant: "destructive" });
                      } finally {
                        setMpLoading(false);
                      }
                    }}
                    style={{ padding: "9px 20px", borderRadius: 999, border: "1px solid #b8231a", background: "transparent", color: "#b8231a", fontSize: 13, cursor: mpLoading ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: mpLoading ? 0.7 : 1 }}
                  >
                    {mpLoading ? "Desconectando…" : "Desconectar conta"}
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--c-mostarda)", display: "inline-block" }} />
                    <span style={{ fontSize: 13, color: "var(--c-mostarda)", fontWeight: 500 }}>Conta não conectada</span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 18 }}>
                    Conecte sua conta Mercado Pago para receber pagamentos dos seus produtos diretamente.
                    A íle coffees retém 3% de comissão em cada transação.
                  </p>
                  <button
                    type="button"
                    disabled={mpLoading}
                    onClick={async () => {
                      setMpLoading(true);
                      try {
                        const { data } = await api.get<{ url: string }>("/supplier/mp/auth-url");
                        window.location.href = data.url;
                      } catch {
                        toast({ title: "Erro ao obter URL de autorização.", variant: "destructive" });
                        setMpLoading(false);
                      }
                    }}
                    style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "11px 24px", borderRadius: 999, background: "var(--c-glamour)", color: "var(--c-leveza)", border: 0, fontSize: 14, cursor: mpLoading ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: mpLoading ? 0.7 : 1 }}
                  >
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none"><path d="M15 3h6v6M14 10l7-7M10 4H4a1 1 0 00-1 1v15a1 1 0 001 1h15a1 1 0 001-1v-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {mpLoading ? "Redirecionando…" : "Conectar Mercado Pago"}
                  </button>
                </div>
              )}
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
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M9 3H4a1 1 0 00-1 1v8a1 1 0 001 1h5M11 5l3 3-3 3M14 8H7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Sair da conta
              </button>
            </div>
          </div>
        )}

        {/* PEDIDOS */}
        {activeTab === "Pedidos" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <div className="serif" style={{ fontSize: mob ? 22 : 32, letterSpacing: "-.01em" }}>Pedidos</div>
              <p style={{ fontSize: 14, color: "var(--ink-2)", marginTop: 4 }}>Pedidos recebidos na plataforma</p>
            </div>
            <div style={{ borderRadius: 16, background: "var(--paper)", border: "1px solid var(--line)", overflow: "hidden" }}>
              {!mob && <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "12px 20px", borderBottom: "1px solid var(--line)", background: "var(--bg-2)" }}>
                {["Pedido", "Cliente", "Valor", "Status"].map(h => (
                  <span key={h} className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)" }}>{h}</span>
                ))}
              </div>}
              {orders.map((order, i) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  style={mob ? {
                    padding: "14px 16px", borderTop: i ? "1px solid var(--line)" : undefined,
                    display: "flex", flexDirection: "column", gap: 6,
                    cursor: "pointer",
                  } : {
                    display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 40px", padding: "16px 20px",
                    borderTop: i ? "1px solid var(--line)" : undefined, alignItems: "center",
                    cursor: "pointer", transition: "background .1s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "var(--bg-2)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = ""; }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 14 }}>#{order.id.slice(0, 8)}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 2 }}>{order.coffee?.name ?? order.course?.title ?? order.subscription?.name ?? "—"}</div>
                    </div>
                    {mob && <span style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      fontSize: 12, color: statusColor[order.status] ?? "var(--ink-2)",
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: 999, background: statusColor[order.status] ?? "var(--ink-3)" }} />
                      {statusLabel[order.status] ?? order.status}
                    </span>}
                  </div>
                  {mob ? (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 13, color: "var(--ink-2)" }}>{order.user?.name ?? "—"}</div>
                      <div className="serif" style={{ fontSize: 18, letterSpacing: "-.01em" }}>{fmt(order.totalPrice)}</div>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: 14 }}>{order.user?.name ?? "—"}</div>
                      <div className="serif" style={{ fontSize: 18, letterSpacing: "-.01em" }}>{fmt(order.totalPrice)}</div>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        fontSize: 12, color: statusColor[order.status] ?? "var(--ink-2)",
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: 999, background: statusColor[order.status] ?? "var(--ink-3)" }} />
                        {statusLabel[order.status] ?? order.status}
                      </span>
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none" style={{ color: "var(--ink-2)" }}><path d="M2.5 7h9M7.8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </>
                  )}
                </div>
              ))}
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
          const topByVolume = (() => {
            const map = new Map<string, { label: string; value: number }>();
            _movements.filter(m => m.type === "SALE").forEach(m => {
              const name = m.coffee?.name ?? "Produto";
              const prev = map.get(m.coffeeId) ?? { label: name, value: 0 };
              map.set(m.coffeeId, { label: name, value: prev.value + Math.abs(m.delta) });
            });
            return [...map.values()].sort((a, b) => b.value - a.value).slice(0, 5);
          })();
          const _revenue = _orders.filter(o => o.status === "PAID").reduce((s, o) => s + o.totalPrice, 0);
          const statusData = [
            { label: "Pago",     value: _orders.filter(o => o.status === "PAID").length,                            color: "#2e7244" },
            { label: "Pendente", value: _orders.filter(o => o.status === "PENDING").length,                          color: "var(--c-mostarda)" },
            { label: "Cancelado",value: _orders.filter(o => ["CANCELED","CANCELLED"].includes(o.status)).length,     color: "var(--c-vibra)" },
          ];
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
                <div>
                  <div className="serif" style={{ fontSize: mob ? 22 : 32, letterSpacing: "-.01em" }}>Relatórios e Análises</div>
                  <p style={{ fontSize: 14, color: "var(--ink-2)", marginTop: 4 }}>Desempenho dos seus negócios</p>
                </div>
                {isMock && (
                  <span className="mono" style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 999, background: "var(--c-mostarda)", color: "#fff", opacity: 0.85 }}>
                    dados de exemplo
                  </span>
                )}
              </div>
              {/* KPIs */}
              <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(3, 1fr)", gap: 16 }}>
                <StatCard label="Total de Produtos" value={coffees.length}  sub="cafés no catálogo" />
                <StatCard label="Total de Pedidos"  value={_orders.length}  sub="pedidos recebidos" />
                <StatCard label="Receita acumulada" value={fmt(_revenue)}   sub="pedidos pagos" />
              </div>
              {/* Área: receita mensal */}
              <ChartCard title="Receita mensal" sub="Últimos 6 meses — pedidos pagos (R$)">
                <AreaChart data={revenueByMonth} color="var(--c-glamour)" uid="sup-rev" />
              </ChartCard>
              {/* Linha 2 colunas */}
              <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 20 }}>
                <ChartCard title="Produtos mais vendidos" sub="Volume de saídas no estoque">
                  <HBarChart data={topByVolume} unit="un" />
                </ChartCard>
                <ChartCard title="Status dos pedidos">
                  <DonutChart data={statusData} />
                </ChartCard>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Adjust stock modal */}
      {adjustModal && (
        <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, zIndex: 9999, background: "rgba(28,8,16,.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "var(--paper)", borderRadius: 20, padding: mob ? "20px 16px" : 32, width: "100%", maxWidth: 440 }}>
            <div className="serif" style={{ fontSize: 22, letterSpacing: "-.01em", marginBottom: 4 }}>Ajustar estoque</div>
            <div style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 24 }}>
              {adjustModal.coffee.name} · atual: {adjustModal.coffee.stock ?? 0} {adjustModal.coffee.saleType === "KG" ? "kg" : "un"}
            </div>

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
                Quantidade{adjustType === "ADJUSTMENT" ? " — negativo para baixa manual" : ""}
              </label>
              <input
                type="number"
                value={adjustDelta}
                onChange={e => setAdjustDelta(e.target.value)}
                placeholder={adjustType === "ENTRY" ? "Ex: 50" : "Ex: −10 ou 30"}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--bg)", fontSize: 14, fontFamily: "inherit", outline: "none", color: "var(--ink)", boxSizing: "border-box" as const }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label className="mono" style={{ display: "block", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 6 }}>Motivo (opcional)</label>
              <input
                type="text"
                value={adjustReason}
                onChange={e => setAdjustReason(e.target.value)}
                placeholder="Ex: Chegada de lote, devolução, perda..."
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
