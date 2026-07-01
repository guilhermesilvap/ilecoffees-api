import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useMobile } from "@/contexts/MobileContext";
import { DashboardLogo } from "@/components/Dashboard/DashboardLogo";
import { StatCard } from "@/components/Dashboard/StatCard";
import { WelcomeBanner, WelcomeAction } from "@/components/Dashboard/WelcomeBanner";

/* ─────────────────────────── types ─────────────────────────── */
interface Paginated<T> { items: T[]; total: number; page: number; limit: number; totalPages: number; }

interface DashboardStats {
  users: { total: number };
  suppliers: { total: number; active: number; inactive: number; withoutPlan: number };
  coffees: { total: number; lowStock: number };
  orders: { total: number; byStatus: Record<string, number>; byType: Record<string, number> };
  revenue: { confirmed: number; pending: number; failedPayments: number; byMethod: Record<string, number> };
  courses: { total: number; totalEnrollments: number; byLevel: Record<string, number> };
  subscriptions: { total: number };
  cart: { usersWithAbandonedCart: number };
}
interface UserItem { id: string; name: string; email: string; accountType: string; city: string; state: string; createdAt: string; }
interface SupplierItem { id: string; name: string; email: string; city: string; state: string; isActive: boolean; planId: string | null; createdAt: string; supplierType: string; }
interface OrderItem { id: string; userId: string; totalPrice: number; type: string; status: string; createdAt: string; }
interface CourseItem { id: string; title: string; level: string; price: number; workloadHours: number; imageUrl: string | null; }
interface LessonItem { id: string; title: string; description: string | null; order: number; durationMinutes: number | null; videoUrl: string | null; isLocked: boolean; }
interface StudentProgress { userId: string; userName: string; userEmail: string; enrolledAt: string; completedLessons: number; totalLessons: number; completionPercent: number; lastActivityAt: string | null; }
interface SupplierPlanItem { id: string; name: string; description: string; price: number; maxProducts: number | null; }

interface PartnerStockCoffee { id: string; name: string; stock: number | null; pricePerKg: number | null; packagePrice: number | null; region: string; isActive: boolean; }
interface PartnerStockSupplier { supplierId: string; supplierName: string; supplierType: string; coffeeCount: number; coffees: PartnerStockCoffee[]; }
interface PartnerStockShopEntry { coffeeId: string; coffeeName: string; supplierName: string; quantity: number; alertAt: number | null; isLow: boolean; }
interface PartnerStockShop { userId: string; userName: string; userEmail: string; city: string | null; state: string | null; stockCount: number; stocks: PartnerStockShopEntry[]; }
interface PartnerStockData { suppliers: PartnerStockSupplier[]; coffeeshops: PartnerStockShop[]; }

/* ─────────────────────────── helpers ─────────────────────────── */
const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtDate = (s: string) => new Date(s).toLocaleDateString("pt-BR");

const STATUS_LABELS: Record<string, string> = { PENDING: "Pendente", PAID: "Pago", SHIPPED: "Enviado", DELIVERED: "Entregue", CANCELED: "Cancelado" };
const STATUS_COLORS: Record<string, string> = { PENDING: "var(--c-mostarda)", PAID: "#2e7244", SHIPPED: "var(--c-glamour)", DELIVERED: "#2e7244", CANCELED: "var(--c-vibra)" };
const LEVEL_LABELS: Record<string, string> = { BEGINNER: "Iniciante", INTERMEDIATE: "Intermediário", ADVANCED: "Avançado" };
const ORDER_STATUSES = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELED"];

/* ─────────────────────────── tabs ─────────────────────────── */
const TABS = ["Visão Geral", "Usuários", "Fornecedores", "Pedidos", "Cursos", "Planos", "Estoque Parceiros"] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, JSX.Element> = {
  "Visão Geral": <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x={3} y={3} width={7} height={7} rx={1.5}/><rect x={14} y={3} width={7} height={7} rx={1.5}/><rect x={3} y={14} width={7} height={7} rx={1.5}/><rect x={14} y={14} width={7} height={7} rx={1.5}/></svg>,
  "Usuários": <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx={9} cy={7} r={4}/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><path d="M16 3.13a4 4 0 010 7.75"/><path d="M21 21v-2a4 4 0 00-3-3.87"/></svg>,
  "Fornecedores": <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M20 7H4a1 1 0 00-1 1v11a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1z"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>,
  "Pedidos": <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x={9} y={3} width={6} height={4} rx={1}/><path d="M9 12h6M9 16h4" strokeLinecap="round"/></svg>,
  "Cursos": <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>,
  "Planos": <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x={2} y={5} width={20} height={14} rx={2}/><path d="M2 10h20" strokeLinecap="round"/></svg>,
  "Estoque Parceiros": <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x={2} y={7} width={20} height={14} rx={2}/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><path d="M12 12v5M9.5 14.5h5" strokeLinecap="round"/></svg>,
};

/* ─────────────────────────── hooks ─────────────────────────── */

/* ─────────────────────────── shared UI ─────────────────────────── */

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

function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 0" }}>
      <svg width="28" height="28" viewBox="0 0 16 16" fill="none" style={{ animation: "spin 1s linear infinite" }}>
        <circle cx="8" cy="8" r="6" stroke="var(--ink-2)" strokeWidth="2" strokeDasharray="25 13" strokeLinecap="round"/>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </svg>
    </div>
  );
}

function Badge({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <span className="mono" style={{
      fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase",
      padding: "3px 9px", borderRadius: 999,
      background: color ? `${color}22` : "var(--bg-2)",
      color: color ?? "var(--ink-2)",
      border: `1px solid ${color ? `${color}44` : "var(--line)"}`,
    }}>{children}</span>
  );
}

function Inp({ value, onChange, placeholder, type = "text", min, step }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  type?: string; min?: string; step?: string;
}) {
  return (
    <input
      type={type} value={value} placeholder={placeholder} min={min} step={step}
      onChange={e => onChange(e.target.value)}
      style={{ width: "100%", padding: "11px 14px", borderRadius: 10, fontSize: 14, border: "1px solid var(--line)", background: "var(--bg)", fontFamily: "inherit", color: "var(--ink)", outline: "none", boxSizing: "border-box" }}
      onFocus={e => { e.currentTarget.style.borderColor = "var(--ink)"; }}
      onBlur={e => { e.currentTarget.style.borderColor = "var(--line)"; }}
    />
  );
}

function Lbl({ children }: { children: React.ReactNode }) {
  return <label className="mono" style={{ display: "block", fontSize: 10, letterSpacing: ".15em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 6 }}>{children}</label>;
}

function PrimaryBtn({ onClick, disabled, children, type = "button" }: { onClick?: () => void; disabled?: boolean; children: React.ReactNode; type?: "button" | "submit" }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      padding: "12px 22px", borderRadius: 10, background: disabled ? "var(--ink-3)" : "var(--ink)",
      color: "var(--c-leveza)", fontSize: 14, fontFamily: "inherit", border: "none",
      cursor: disabled ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8,
    }}>{children}</button>
  );
}

function DangerBtn({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      padding: "8px 14px", borderRadius: 8, background: "rgba(184,35,26,.08)",
      color: "var(--c-vibra)", fontSize: 13, fontFamily: "inherit",
      border: "1px solid rgba(184,35,26,.2)", cursor: "pointer",
    }}>{children}</button>
  );
}

/* ─────────────────────────── Pagination ─────────────────────────── */
function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 20 }}>
      <button onClick={() => onChange(page - 1)} disabled={page <= 1} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--bg)", fontSize: 13, fontFamily: "inherit", cursor: page <= 1 ? "not-allowed" : "pointer", color: page <= 1 ? "var(--ink-3)" : "var(--ink)" }}>←</button>
      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
        .reduce<(number | "…")[]>((acc, p, i, arr) => {
          if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("…");
          acc.push(p);
          return acc;
        }, [])
        .map((p, i) =>
          p === "…"
            ? <span key={`e${i}`} style={{ color: "var(--ink-2)", fontSize: 13 }}>…</span>
            : <button key={p} onClick={() => onChange(p as number)} style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${p === page ? "var(--ink)" : "var(--line)"}`, background: p === page ? "var(--ink)" : "var(--bg)", color: p === page ? "var(--c-leveza)" : "var(--ink)", fontSize: 13, fontFamily: "inherit", cursor: "pointer" }}>{p}</button>
        )
      }
      <button onClick={() => onChange(page + 1)} disabled={page >= totalPages} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--bg)", fontSize: 13, fontFamily: "inherit", cursor: page >= totalPages ? "not-allowed" : "pointer", color: page >= totalPages ? "var(--ink-3)" : "var(--ink)" }}>→</button>
    </div>
  );
}

/* ─────────────────────────── Modal ─────────────────────────── */
function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const mob = useMobile();
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: mob ? "0 12px" : 0 }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(15,35,21,.5)", backdropFilter: "blur(4px)" }} />
      <div style={{ position: "relative", background: "var(--paper)", borderRadius: 18, border: "1px solid var(--line)", padding: mob ? "20px 16px" : "28px 32px", width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 32px 64px -20px rgba(15,35,21,.4)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div className="serif" style={{ fontSize: mob ? 18 : 22, letterSpacing: "-.01em" }}>{title}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-2)", fontSize: 22, lineHeight: 1, padding: "0 4px" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Main component
═══════════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const mob = useMobile();
  const [mobMenuOpen, setMobMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("Visão Geral");

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const [users, setUsers] = useState<UserItem[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersPage, setUsersPage] = useState(1);
  const [usersMeta, setUsersMeta] = useState({ total: 0, totalPages: 1 });

  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [suppliersPage, setSuppliersPage] = useState(1);
  const [suppliersMeta, setSuppliersMeta] = useState({ total: 0, totalPages: 1 });

  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersMeta, setOrdersMeta] = useState({ total: 0, totalPages: 1 });

  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [plans, setPlans] = useState<SupplierPlanItem[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);

  const [planModal, setPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SupplierPlanItem | null>(null);
  const [planForm, setPlanForm] = useState({ name: "", description: "", price: "", maxProducts: "" });
  const [planSaving, setPlanSaving] = useState(false);

  const [revenueModalOpen, setRevenueModalOpen] = useState(false);
  const [subsModal, setSubsModal] = useState(false);
  const [subsDetail, setSubsDetail] = useState<{ id: string; userId: string; coffeeId: string; frequency: string; status: string; createdAt: string }[]>([]);
  const [subsDetailLoading, setSubsDetailLoading] = useState(false);

  const [partnerStock, setPartnerStock] = useState<PartnerStockData | null>(null);
  const [partnerStockLoading, setPartnerStockLoading] = useState(false);
  const [partnerStockExpanded, setPartnerStockExpanded] = useState<Record<string, boolean>>({});

  const [lessonModal, setLessonModal] = useState<{ course: CourseItem } | null>(null);
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [studentsModal, setStudentsModal] = useState<{ course: CourseItem } | null>(null);
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [lessonForm, setLessonForm] = useState({ title: "", description: "", order: "1", durationMinutes: "", videoUrl: "", isLocked: false });
  const [lessonSaving, setLessonSaving] = useState(false);

  const initials = user?.name?.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase() ?? "A";

  /* ── loaders ── */
  const loadStats = async () => {
    setStatsLoading(true);
    try { const { data } = await api.get<DashboardStats>("/admin/dashboard"); setStats(data); }
    catch { toast({ title: "Erro ao carregar estatísticas.", variant: "destructive" }); }
    finally { setStatsLoading(false); }
  };

  const loadUsers = async (page = 1) => {
    setUsersLoading(true);
    try {
      const { data } = await api.get<Paginated<UserItem>>("/admin/users", { params: { page, limit: 30 } });
      setUsers(data.items);
      setUsersMeta({ total: data.total, totalPages: data.totalPages });
      setUsersPage(data.page);
    } catch { toast({ title: "Erro ao carregar usuários.", variant: "destructive" }); }
    finally { setUsersLoading(false); }
  };

  const loadSuppliers = async (page = 1) => {
    setSuppliersLoading(true);
    try {
      const { data } = await api.get<Paginated<SupplierItem>>("/admin/suppliers", { params: { page, limit: 30 } });
      setSuppliers(data.items);
      setSuppliersMeta({ total: data.total, totalPages: data.totalPages });
      setSuppliersPage(data.page);
    } catch { toast({ title: "Erro ao carregar fornecedores.", variant: "destructive" }); }
    finally { setSuppliersLoading(false); }
  };

  const loadOrders = async (page = 1) => {
    setOrdersLoading(true);
    try {
      const { data } = await api.get<Paginated<OrderItem>>("/admin/orders", { params: { page, limit: 30 } });
      setOrders(data.items);
      setOrdersMeta({ total: data.total, totalPages: data.totalPages });
      setOrdersPage(data.page);
    } catch { toast({ title: "Erro ao carregar pedidos.", variant: "destructive" }); }
    finally { setOrdersLoading(false); }
  };

  const loadCourses = async () => {
    setCoursesLoading(true);
    try { const { data } = await api.get<CourseItem[]>("/courses"); setCourses(data); }
    catch { toast({ title: "Erro ao carregar cursos.", variant: "destructive" }); }
    finally { setCoursesLoading(false); }
  };

  const loadPlans = async () => {
    setPlansLoading(true);
    try { const { data } = await api.get<SupplierPlanItem[]>("/admin/supplier-plans"); setPlans(data); }
    catch { toast({ title: "Erro ao carregar planos.", variant: "destructive" }); }
    finally { setPlansLoading(false); }
  };

  const openSubsModal = async () => {
    setSubsModal(true);
    if (subsDetail.length > 0) return;
    setSubsDetailLoading(true);
    try { const { data } = await api.get("/subscriptions"); setSubsDetail(data); }
    catch { toast({ title: "Erro ao carregar assinaturas.", variant: "destructive" }); }
    finally { setSubsDetailLoading(false); }
  };

  const loadPartnerStock = async () => {
    setPartnerStockLoading(true);
    try { const { data } = await api.get<PartnerStockData>("/admin/partner-stock"); setPartnerStock(data); }
    catch { toast({ title: "Erro ao carregar estoque de parceiros.", variant: "destructive" }); }
    finally { setPartnerStockLoading(false); }
  };

  useEffect(() => {
    loadPlans();
    loadStats();
  }, []);

  useEffect(() => {
    if (activeTab === "Usuários") loadUsers(1);
    if (activeTab === "Fornecedores") loadSuppliers(1);
    if (activeTab === "Pedidos") loadOrders(1);
    if (activeTab === "Cursos" && courses.length === 0) loadCourses();
    if (activeTab === "Estoque Parceiros" && !partnerStock) loadPartnerStock();
  }, [activeTab]);

  /* ── actions ── */
  const deleteUser = async (id: string) => {
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(p => p.filter(u => u.id !== id));
      toast({ title: "Usuário removido." });
    } catch (e: unknown) {
      toast({ title: "Erro", description: (e as { response?: { data?: { message?: string } } })?.response?.data?.message, variant: "destructive" });
    }
  };

  const deleteSupplier = async (id: string) => {
    try {
      await api.delete(`/admin/suppliers/${id}`);
      setSuppliers(p => p.filter(s => s.id !== id));
      toast({ title: "Fornecedor removido." });
    } catch (e: unknown) {
      toast({ title: "Erro", description: (e as { response?: { data?: { message?: string } } })?.response?.data?.message, variant: "destructive" });
    }
  };

  const toggleSupplier = async (id: string, isActive: boolean) => {
    try {
      const { data } = await api.patch<SupplierItem>(`/admin/suppliers/${id}/status`, { isActive: !isActive });
      setSuppliers(p => p.map(s => s.id === id ? { ...s, isActive: data.isActive } : s));
      toast({ title: `Fornecedor ${!isActive ? "ativado" : "desativado"}.` });
    } catch (e: unknown) {
      toast({ title: "Erro", description: (e as { response?: { data?: { message?: string } } })?.response?.data?.message, variant: "destructive" });
    }
  };

  const assignPlan = async (supplierId: string, planId: string | null) => {
    try {
      await api.patch(`/admin/suppliers/${supplierId}/plan`, { planId });
      setSuppliers(p => p.map(s => s.id === supplierId ? { ...s, planId } : s));
      toast({ title: "Plano atribuído." });
    } catch (e: unknown) {
      toast({ title: "Erro", description: (e as { response?: { data?: { message?: string } } })?.response?.data?.message, variant: "destructive" });
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      const { data } = await api.patch<OrderItem>(`/admin/orders/${id}/status`, { status });
      setOrders(p => p.map(o => o.id === id ? { ...o, status: data.status } : o));
      toast({ title: "Status atualizado." });
    } catch (e: unknown) {
      toast({ title: "Erro", description: (e as { response?: { data?: { message?: string } } })?.response?.data?.message, variant: "destructive" });
    }
  };

  const deleteCourse = async (id: string) => {
    try {
      await api.delete(`/admin/courses/${id}`);
      setCourses(p => p.filter(c => c.id !== id));
      toast({ title: "Curso removido." });
    } catch (e: unknown) {
      toast({ title: "Erro", description: (e as { response?: { data?: { message?: string } } })?.response?.data?.message, variant: "destructive" });
    }
  };

  const openLessons = async (course: CourseItem) => {
    setLessonModal({ course });
    setLessonsLoading(true);
    try {
      const { data } = await api.get<{ lessons: LessonItem[] }>(`/courses/${course.id}`);
      setLessons(data.lessons);
      setLessonForm(p => ({ ...p, order: String((data.lessons.length ?? 0) + 1) }));
    } catch { toast({ title: "Erro ao carregar aulas.", variant: "destructive" }); }
    finally { setLessonsLoading(false); }
  };

  const openStudents = async (course: CourseItem) => {
    setStudentsModal({ course });
    setStudentsLoading(true);
    setStudents([]);
    try {
      const { data } = await api.get<StudentProgress[]>(`/admin/courses/${course.id}/students`);
      setStudents(data);
    } catch { toast({ title: "Erro ao carregar alunos.", variant: "destructive" }); }
    finally { setStudentsLoading(false); }
  };

  const addLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonModal) return;
    setLessonSaving(true);
    try {
      await api.post(`/admin/courses/${lessonModal.course.id}/lessons`, {
        title: lessonForm.title,
        description: lessonForm.description || undefined,
        order: parseInt(lessonForm.order),
        durationMinutes: lessonForm.durationMinutes ? parseInt(lessonForm.durationMinutes) : undefined,
        videoUrl: lessonForm.videoUrl || undefined,
        isLocked: lessonForm.isLocked,
      });
      const { data } = await api.get<{ lessons: LessonItem[] }>(`/courses/${lessonModal.course.id}`);
      setLessons(data.lessons);
      setLessonForm({ title: "", description: "", order: String(data.lessons.length + 1), durationMinutes: "", videoUrl: "", isLocked: false });
      toast({ title: "Aula adicionada." });
    } catch (e: unknown) {
      toast({ title: "Erro", description: (e as { response?: { data?: { message?: string } } })?.response?.data?.message, variant: "destructive" });
    } finally { setLessonSaving(false); }
  };

  const deleteLesson = async (lessonId: string) => {
    if (!lessonModal) return;
    try {
      await api.delete(`/admin/courses/${lessonModal.course.id}/lessons/${lessonId}`);
      setLessons(p => p.filter(l => l.id !== lessonId));
      toast({ title: "Aula removida." });
    } catch (e: unknown) {
      toast({ title: "Erro", description: (e as { response?: { data?: { message?: string } } })?.response?.data?.message, variant: "destructive" });
    }
  };

  const openPlanCreate = () => {
    setEditingPlan(null);
    setPlanForm({ name: "", description: "", price: "", maxProducts: "" });
    setPlanModal(true);
  };

  const openPlanEdit = (p: SupplierPlanItem) => {
    setEditingPlan(p);
    setPlanForm({ name: p.name, description: p.description, price: String(p.price), maxProducts: p.maxProducts?.toString() ?? "" });
    setPlanModal(true);
  };

  const savePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlanSaving(true);
    try {
      const payload = { name: planForm.name, description: planForm.description, price: parseFloat(planForm.price), maxProducts: planForm.maxProducts ? parseInt(planForm.maxProducts) : null };
      if (editingPlan) {
        await api.put(`/admin/supplier-plans/${editingPlan.id}`, payload);
        toast({ title: "Plano atualizado." });
      } else {
        await api.post("/admin/supplier-plans", payload);
        toast({ title: "Plano criado." });
      }
      setPlanModal(false);
      loadPlans();
    } catch (e: unknown) {
      toast({ title: "Erro", description: (e as { response?: { data?: { message?: string } } })?.response?.data?.message, variant: "destructive" });
    } finally { setPlanSaving(false); }
  };

  const deletePlan = async (id: string) => {
    try {
      await api.delete(`/admin/supplier-plans/${id}`);
      setPlans(p => p.filter(pl => pl.id !== id));
      toast({ title: "Plano removido." });
    } catch (e: unknown) {
      toast({ title: "Erro", description: (e as { response?: { data?: { message?: string } } })?.response?.data?.message, variant: "destructive" });
    }
  };

  const planMap = new Map(plans.map(p => [p.id, p.name]));

  /* ═══════════════ render ═══════════════ */
  return (
    <div style={{ background: "var(--bg)", color: "var(--ink)", fontFamily: "inherit", display: "flex", height: "100vh", overflow: "hidden" }}>

      {/* ── Sidebar desktop ── */}
      {!mob && (
        <aside style={{ width: 220, flexShrink: 0, background: "var(--c-glamour)", color: "var(--c-leveza)", display: "flex", flexDirection: "column", height: "100vh", overflowY: "auto" }}>
          <div style={{ padding: "22px 20px 14px" }}><DashboardLogo light /></div>
          <div style={{ height: 1, background: "rgba(255,255,255,.08)", margin: "0 16px 4px" }} />

          {/* user info */}
          <div style={{ padding: "14px 16px 12px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 999, flexShrink: 0, overflow: "hidden", background: "rgba(255,255,255,.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600 }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name?.split(" ")[0] ?? "Admin"}</div>
              <div className="mono" style={{ fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(255,255,255,.45)", lineHeight: 1.6 }}>Administrador</div>
            </div>
          </div>
          <div style={{ height: 1, background: "rgba(255,255,255,.08)", margin: "0 16px 10px" }} />

          {/* nav */}
          <nav style={{ flex: 1, padding: "0 10px", display: "flex", flexDirection: "column", gap: 2 }}>
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className="mono"
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: 0, width: "100%", background: activeTab === tab ? "rgba(255,255,255,.13)" : "transparent", color: activeTab === tab ? "var(--c-leveza)" : "rgba(255,255,255,.5)", cursor: "pointer", fontFamily: "inherit", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", textAlign: "left", transition: "background .12s, color .12s" }}
                onMouseEnter={e => { if (activeTab !== tab) { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.07)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.8)"; } }}
                onMouseLeave={e => { if (activeTab !== tab) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.5)"; } }}
              >
                {TAB_ICONS[tab]} {tab}
              </button>
            ))}
          </nav>

          {/* footer */}
          <div style={{ padding: "4px 10px 24px" }}>
            <div style={{ height: 1, background: "rgba(255,255,255,.08)", margin: "0 6px 10px" }} />
            <button onClick={() => { logout(); navigate("/"); }} className="mono"
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: 0, background: "transparent", color: "rgba(255,255,255,.5)", fontSize: 11, cursor: "pointer", fontFamily: "inherit", letterSpacing: ".1em", textTransform: "uppercase", textAlign: "left", width: "100%" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--c-leveza)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.07)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.5)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sair
            </button>
          </div>
        </aside>
      )}

      {/* ── Mobile: top bar ── */}
      {mob && (
        <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: "var(--c-glamour)", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <DashboardLogo light />
          <button onClick={() => setMobMenuOpen(o => !o)} style={{ background: "none", border: 0, color: "var(--c-leveza)", cursor: "pointer", padding: 4 }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </header>
      )}

      {/* ── Mobile: slide-out drawer ── */}
      {mob && mobMenuOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100 }} onClick={() => setMobMenuOpen(false)}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 240, background: "var(--c-glamour)", display: "flex", flexDirection: "column", padding: "60px 10px 24px" }} onClick={e => e.stopPropagation()}>
            <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
              {TABS.map(tab => (
                <button key={tab} onClick={() => { setActiveTab(tab); setMobMenuOpen(false); }} className="mono"
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 10, border: 0, background: activeTab === tab ? "rgba(255,255,255,.13)" : "transparent", color: activeTab === tab ? "var(--c-leveza)" : "rgba(255,255,255,.5)", cursor: "pointer", fontFamily: "inherit", fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase", textAlign: "left", width: "100%" }}>
                  {TAB_ICONS[tab]} {tab}
                </button>
              ))}
            </nav>
            <div style={{ height: 1, background: "rgba(255,255,255,.08)", margin: "8px 6px" }} />
            <button onClick={() => { logout(); navigate("/"); }} className="mono"
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, border: 0, background: "transparent", color: "rgba(255,255,255,.5)", fontSize: 12, cursor: "pointer", fontFamily: "inherit", textAlign: "left", width: "100%" }}>
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sair
            </button>
          </div>
        </div>
      )}

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

        {/* Desktop breadcrumb bar */}
        {!mob && (
          <div style={{ flexShrink: 0, borderBottom: "1px solid var(--line)", padding: "0 36px", height: 50, display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--paper)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span className="mono" style={{ fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--ink-2)" }}>Admin</span>
              <span style={{ color: "var(--ink-2)", fontSize: 12 }}>›</span>
              <span className="mono" style={{ fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--ink)" }}>{activeTab}</span>
            </div>
            <span className="mono" style={{ fontSize: 10, letterSpacing: ".12em", color: "var(--ink-2)", textTransform: "capitalize" }}>
              {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
            </span>
          </div>
        )}

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", padding: mob ? "72px 16px 80px" : "32px 36px 80px" }}>

          {/* ══ VISÃO GERAL ══ */}
          {activeTab === "Visão Geral" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              <WelcomeBanner
                name={user?.name ?? "Admin"}
                subtitle="Painel de Controle · íle coffees"
                description="Visão centralizada de toda a operação da plataforma. Gerencie usuários, aprovações de fornecedores, acompanhe o fluxo de pedidos, crie planos de parceria e monitore a receita em tempo real. Use as abas para acessar cada módulo de gestão."
                actions={([
                  { icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}><circle cx={9} cy={7} r={4}/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><path d="M16 3.13a4 4 0 010 7.75"/><path d="M21 21v-2a4 4 0 00-3-3.87"/></svg>, label: "Usuários", description: "Clientes e cafeterias cadastradas", onClick: () => setActiveTab("Usuários") },
                  { icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}><path d="M20 7H4a1 1 0 00-1 1v11a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1z"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>, label: "Fornecedores", description: "Produtores e torrefadores ativos", onClick: () => setActiveTab("Fornecedores") },
                  { icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x={9} y={3} width={6} height={4} rx={1}/><path d="M9 12h6M9 16h4" strokeLinecap="round"/></svg>, label: "Pedidos", description: "Todos os pedidos da plataforma", onClick: () => setActiveTab("Pedidos") },
                  { icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}><rect x={2} y={5} width={20} height={14} rx={2}/><path d="M2 10h20" strokeLinecap="round"/></svg>, label: "Planos", description: "Planos de parceria para fornecedores", onClick: () => setActiveTab("Planos") },
                ] as WelcomeAction[])}
              />
              {statsLoading ? <Spinner /> : stats ? (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: mob ? "repeat(2, minmax(0, 1fr))" : "repeat(4,1fr)", gap: 16 }}>
                    <StatCard label="Usuários" value={stats.users.total} sub="cadastrados" onClick={() => setActiveTab("Usuários")} />
                    <StatCard label="Fornecedores ativos" value={stats.suppliers.active} sub={`${stats.suppliers.total} no total`} onClick={() => setActiveTab("Fornecedores")} />
                    <StatCard label="Receita confirmada" value={fmt(stats.revenue.confirmed)} sub="pagamentos aprovados" accent="var(--success)" onClick={() => setRevenueModalOpen(true)} />
                    <StatCard label="Total de pedidos" value={stats.orders.total} sub="desde o início" onClick={() => setActiveTab("Pedidos")} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: mob ? "repeat(2, minmax(0, 1fr))" : "repeat(4,1fr)", gap: 16 }}>
                    <StatCard label="Cursos" value={stats.courses.total} sub={`${stats.courses.totalEnrollments} matrículas`} onClick={() => setActiveTab("Cursos")} />
                    <StatCard label="Assinaturas" value={stats.subscriptions.total} sub="planos ativos" onClick={openSubsModal} />
                    <StatCard label="Cafés cadastrados" value={stats.coffees.total} sub={stats.coffees.lowStock > 0 ? `${stats.coffees.lowStock} com estoque baixo` : "todos com estoque"} onClick={() => setActiveTab("Estoque Parceiros")} />
                    <StatCard label="Receita pendente" value={fmt(stats.revenue.pending)} sub="aguardando confirmação" onClick={() => setRevenueModalOpen(true)} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 20 }}>
                    <ChartCard title="Pedidos por status">
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {Object.entries(stats.orders.byStatus).map(([status, count]) => {
                          const total = Object.values(stats.orders.byStatus).reduce((a, b) => a + b, 0);
                          return (
                            <div key={status}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                                <span style={{ fontSize: 13, color: "var(--ink)" }}>{STATUS_LABELS[status] ?? status}</span>
                                <span className="mono" style={{ fontSize: 11, color: "var(--ink-2)" }}>{count} · {total > 0 ? Math.round(count / total * 100) : 0}%</span>
                              </div>
                              <div style={{ height: 6, background: "var(--bg-2)", borderRadius: 999, overflow: "hidden" }}>
                                <div style={{ height: "100%", borderRadius: 999, background: STATUS_COLORS[status] ?? "var(--ink-2)", width: `${total > 0 ? (count / total) * 100 : 0}%`, transition: "width 0.8s cubic-bezier(.4,0,.2,1)" }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ChartCard>
                    <ChartCard title="Receita por método de pagamento">
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {Object.entries(stats.revenue.byMethod).map(([method, amount]) => {
                          const max = Math.max(...Object.values(stats.revenue.byMethod), 1);
                          return (
                            <div key={method}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                                <span style={{ fontSize: 13, color: "var(--ink)" }}>{method}</span>
                                <span className="mono" style={{ fontSize: 11, color: "var(--ink-2)" }}>{fmt(amount)}</span>
                              </div>
                              <div style={{ height: 6, background: "var(--bg-2)", borderRadius: 999, overflow: "hidden" }}>
                                <div style={{ height: "100%", borderRadius: 999, background: "var(--c-glamour)", width: `${(amount / max) * 100}%`, transition: "width 0.8s cubic-bezier(.4,0,.2,1)" }} />
                              </div>
                            </div>
                          );
                        })}
                        {Object.keys(stats.revenue.byMethod).length === 0 && <span style={{ fontSize: 13, color: "var(--ink-2)" }}>Nenhuma receita registrada.</span>}
                      </div>
                    </ChartCard>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                  <button onClick={loadStats} style={{ padding: "12px 22px", borderRadius: 10, background: "var(--ink)", color: "var(--c-leveza)", border: "none", cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>Carregar estatísticas</button>
                </div>
              )}
            </div>
          )}

          {/* ══ USUÁRIOS ══ */}
          {activeTab === "Usuários" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <div className="serif" style={{ fontSize: mob ? 22 : 32, letterSpacing: "-.01em", marginBottom: 4 }}>Usuários</div>
                <div className="mono" style={{ fontSize: 11, color: "var(--ink-2)", letterSpacing: ".12em" }}>{usersMeta.total} cadastrados</div>
              </div>
              {/* Type breakdown */}
              {!usersLoading && users.length > 0 && (() => {
                const customers = users.filter(u => u.accountType !== "COFFEESHOP").length;
                const coffeeshops = users.filter(u => u.accountType === "COFFEESHOP").length;
                return (
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", borderRadius: 12, background: "var(--paper)", border: "1px solid var(--line)" }}>
                      <div style={{ width: 10, height: 10, borderRadius: 999, background: "var(--c-glamour)", flexShrink: 0 }} />
                      <div>
                        <div className="mono" style={{ fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)" }}>Consumidores</div>
                        <div className="serif" style={{ fontSize: 26, lineHeight: 1, letterSpacing: "-.01em" }}>{customers}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", borderRadius: 12, background: "var(--paper)", border: "1px solid var(--line)" }}>
                      <div style={{ width: 10, height: 10, borderRadius: 999, background: "var(--c-mostarda)", flexShrink: 0 }} />
                      <div>
                        <div className="mono" style={{ fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)" }}>Cafeterias</div>
                        <div className="serif" style={{ fontSize: 26, lineHeight: 1, letterSpacing: "-.01em" }}>{coffeeshops}</div>
                      </div>
                    </div>
                  </div>
                );
              })()}
              {usersLoading ? <Spinner /> : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {users.map(u => {
                    const isCoffeeshop = u.accountType === "COFFEESHOP";
                    return (
                      <div key={u.id} style={{ display: "flex", flexDirection: mob ? "column" : "row", alignItems: mob ? "stretch" : "center", justifyContent: "space-between", padding: mob ? "14px 16px" : "16px 20px", background: "var(--paper)", borderRadius: 14, border: `1px solid ${isCoffeeshop ? "rgba(193,142,50,.3)" : "var(--line)"}`, gap: mob ? 10 : 16 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, minWidth: 0 }}>
                          <div style={{ width: 8, height: 8, borderRadius: 999, flexShrink: 0, background: isCoffeeshop ? "var(--c-mostarda)" : "var(--c-glamour)", marginTop: 5 }} />
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 3 }}>{u.name}</div>
                            <div style={{ fontSize: 13, color: "var(--ink-2)" }}>{u.email} · {u.city}/{u.state} · <span className="mono" style={{ fontSize: 11 }}>{fmtDate(u.createdAt)}</span></div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, justifyContent: mob ? "flex-end" : "flex-start" }}>
                          <Badge color={isCoffeeshop ? "var(--c-mostarda)" : "var(--c-glamour)"}>{isCoffeeshop ? "Cafeteria" : "Consumidor"}</Badge>
                          <DangerBtn onClick={() => deleteUser(u.id)}>Remover</DangerBtn>
                        </div>
                      </div>
                    );
                  })}
                  {users.length === 0 && <div style={{ textAlign: "center", padding: "48px 0", color: "var(--ink-2)", fontSize: 14 }}>Nenhum usuário encontrado.</div>}
                </div>
              )}
              <Pagination page={usersPage} totalPages={usersMeta.totalPages} onChange={loadUsers} />
            </div>
          )}

          {/* ══ FORNECEDORES ══ */}
          {activeTab === "Fornecedores" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <div className="serif" style={{ fontSize: mob ? 22 : 32, letterSpacing: "-.01em", marginBottom: 4 }}>Fornecedores</div>
                <div className="mono" style={{ fontSize: 11, color: "var(--ink-2)", letterSpacing: ".12em" }}>{suppliersMeta.total} cadastrados</div>
              </div>
              {/* Type breakdown */}
              {!suppliersLoading && suppliers.length > 0 && (() => {
                const roasters = suppliers.filter(s => s.supplierType === "ROASTER").length;
                const producers = suppliers.filter(s => s.supplierType === "PRODUCER").length;
                return (
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", borderRadius: 12, background: "var(--paper)", border: "1px solid var(--line)" }}>
                      <div style={{ width: 10, height: 10, borderRadius: 999, background: "var(--c-vibra)", flexShrink: 0 }} />
                      <div>
                        <div className="mono" style={{ fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)" }}>Torrefadores</div>
                        <div className="serif" style={{ fontSize: 26, lineHeight: 1, letterSpacing: "-.01em" }}>{roasters}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", borderRadius: 12, background: "var(--paper)", border: "1px solid var(--line)" }}>
                      <div style={{ width: 10, height: 10, borderRadius: 999, background: "#2e7244", flexShrink: 0 }} />
                      <div>
                        <div className="mono" style={{ fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)" }}>Produtores</div>
                        <div className="serif" style={{ fontSize: 26, lineHeight: 1, letterSpacing: "-.01em" }}>{producers}</div>
                      </div>
                    </div>
                  </div>
                );
              })()}
              {suppliersLoading ? <Spinner /> : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {suppliers.map(s => {
                    const isRoaster = s.supplierType === "ROASTER";
                    const typeColor = isRoaster ? "var(--c-vibra)" : "#2e7244";
                    const typeLabel = isRoaster ? "Torrefador" : "Produtor";
                    return (
                      <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "var(--paper)", borderRadius: 14, border: `1px solid ${isRoaster ? "rgba(184,35,26,.2)" : "rgba(46,114,68,.2)"}`, gap: 16, flexWrap: "wrap" as const }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" as const }}>
                            <div style={{ width: 8, height: 8, borderRadius: 999, flexShrink: 0, background: typeColor }} />
                            <span style={{ fontSize: 15, fontWeight: 500 }}>{s.name}</span>
                            <Badge color={typeColor}>{typeLabel}</Badge>
                            <Badge color={s.isActive ? "#2e7244" : "var(--c-vibra)"}>{s.isActive ? "Ativo" : "Inativo"}</Badge>
                          </div>
                          <div style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 8, paddingLeft: 20 }}>{s.email} · {s.city}/{s.state}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 20 }}>
                            <span className="mono" style={{ fontSize: 10, color: "var(--ink-2)", letterSpacing: ".1em" }}>PLANO</span>
                            <select
                              value={s.planId ?? "none"}
                              onChange={e => assignPlan(s.id, e.target.value === "none" ? null : e.target.value)}
                              style={{ padding: "5px 10px", borderRadius: 8, fontSize: 12, border: "1px solid var(--line)", background: "var(--bg)", fontFamily: "inherit", color: "var(--ink)", outline: "none" }}
                            >
                              <option value="none">Sem plano</option>
                              {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                          <button onClick={() => toggleSupplier(s.id, s.isActive)} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--bg)", fontSize: 13, fontFamily: "inherit", cursor: "pointer", color: "var(--ink)" }}>
                            {s.isActive ? "Desativar" : "Ativar"}
                          </button>
                          <DangerBtn onClick={() => deleteSupplier(s.id)}>Remover</DangerBtn>
                        </div>
                      </div>
                    );
                  })}
                  {suppliers.length === 0 && <div style={{ textAlign: "center", padding: "48px 0", color: "var(--ink-2)", fontSize: 14 }}>Nenhum fornecedor encontrado.</div>}
                </div>
              )}
              <Pagination page={suppliersPage} totalPages={suppliersMeta.totalPages} onChange={loadSuppliers} />
            </div>
          )}

          {/* ══ PEDIDOS ══ */}
          {activeTab === "Pedidos" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <div className="serif" style={{ fontSize: mob ? 22 : 32, letterSpacing: "-.01em", marginBottom: 4 }}>Pedidos</div>
                <div className="mono" style={{ fontSize: 11, color: "var(--ink-2)", letterSpacing: ".12em" }}>{ordersMeta.total} no sistema</div>
              </div>
              {ordersLoading ? <Spinner /> : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {orders.map(o => (
                    <div key={o.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "var(--paper)", borderRadius: 14, border: "1px solid var(--line)", gap: 16, flexWrap: "wrap" as const }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                          <span className="mono" style={{ fontSize: 12, color: "var(--ink)" }}>#{o.id.slice(0, 8).toUpperCase()}</span>
                          <Badge color={STATUS_COLORS[o.status]}>{STATUS_LABELS[o.status] ?? o.status}</Badge>
                        </div>
                        <div style={{ fontSize: 13, color: "var(--ink-2)" }}>
                          {o.type} · <strong style={{ color: "var(--ink)" }}>{fmt(o.totalPrice)}</strong> · {fmtDate(o.createdAt)}
                        </div>
                      </div>
                      <select
                        value={o.status}
                        onChange={e => updateOrderStatus(o.id, e.target.value)}
                        style={{ padding: "9px 14px", borderRadius: 10, fontSize: 13, border: "1px solid var(--line)", background: "var(--bg)", fontFamily: "inherit", color: "var(--ink)", outline: "none" }}
                      >
                        {ORDER_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                      </select>
                    </div>
                  ))}
                  {orders.length === 0 && <div style={{ textAlign: "center", padding: "48px 0", color: "var(--ink-2)", fontSize: 14 }}>Nenhum pedido encontrado.</div>}
                </div>
              )}
              <Pagination page={ordersPage} totalPages={ordersMeta.totalPages} onChange={loadOrders} />
            </div>
          )}

          {/* ══ CURSOS ══ */}
          {activeTab === "Cursos" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" as const }}>
                <div>
                  <div className="serif" style={{ fontSize: mob ? 22 : 32, letterSpacing: "-.01em", marginBottom: 4 }}>Cursos</div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--ink-2)", letterSpacing: ".12em" }}>{courses.length} cadastrados</div>
                </div>
              </div>
              {coursesLoading ? <Spinner /> : (
                <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(3,1fr)", gap: 16 }}>
                  {courses.map(c => (
                    <div key={c.id} style={{ background: "var(--paper)", borderRadius: 16, border: "1px solid var(--line)", overflow: "hidden" }}>
                      <div style={{ aspectRatio: "16/9", background: "var(--bg-2)", overflow: "hidden", position: "relative" }}>
                        {c.imageUrl
                          ? <img src={c.imageUrl} alt={c.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth={1.4}><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg></div>}
                        <div style={{ position: "absolute", top: 10, right: 10 }}><Badge>{LEVEL_LABELS[c.level] ?? c.level}</Badge></div>
                      </div>
                      <div style={{ padding: "16px 18px" }}>
                        <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6, lineHeight: 1.3 }}>{c.title}</div>
                        <div className="mono" style={{ fontSize: 11, color: "var(--ink-2)", marginBottom: 14 }}>{c.workloadHours}h · {fmt(c.price)}</div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => openStudents(c)} style={{ flex: 1, padding: "9px 12px", borderRadius: 9, border: "1px solid var(--line)", background: "var(--bg)", fontSize: 13, fontFamily: "inherit", cursor: "pointer", color: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx={9} cy={7} r={4}/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><path d="M16 3.13a4 4 0 010 7.75"/><path d="M21 21v-2a4 4 0 00-3-3.87"/></svg>
                            Alunos
                          </button>
                          <button onClick={() => openLessons(c)} style={{ flex: 1, padding: "9px 12px", borderRadius: 9, border: "1px solid var(--line)", background: "var(--bg)", fontSize: 13, fontFamily: "inherit", cursor: "pointer", color: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx={12} cy={12} r={10}/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/></svg>
                            Aulas
                          </button>
                          <DangerBtn onClick={() => deleteCourse(c.id)}>Remover</DangerBtn>
                        </div>
                      </div>
                    </div>
                  ))}
                  {courses.length === 0 && <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 0", color: "var(--ink-2)", fontSize: 14 }}>Nenhum curso cadastrado.</div>}
                </div>
              )}
            </div>
          )}

          {/* ══ ESTOQUE PARCEIROS ══ */}
          {activeTab === "Estoque Parceiros" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" as const }}>
                <div>
                  <div className="serif" style={{ fontSize: mob ? 22 : 32, letterSpacing: "-.01em", marginBottom: 4 }}>Estoque dos Parceiros</div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--ink-2)", letterSpacing: ".12em" }}>
                    {partnerStock ? `${partnerStock.suppliers.length} fornecedores · ${partnerStock.coffeeshops.length} cafeterias` : "—"}
                  </div>
                </div>
                <button onClick={loadPartnerStock} style={{ padding: "9px 16px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--bg)", fontSize: 13, fontFamily: "inherit", cursor: "pointer", color: "var(--ink)", display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
                  Atualizar
                </button>
              </div>

              {partnerStockLoading ? <Spinner /> : !partnerStock ? (
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                  <button onClick={loadPartnerStock} style={{ padding: "12px 22px", borderRadius: 10, background: "var(--ink)", color: "var(--c-leveza)", border: "none", cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>Carregar estoque</button>
                </div>
              ) : (
                <>
                  {/* Fornecedores & Produtores */}
                  <div>
                    <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 14 }}>Fornecedores / Produtores</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {partnerStock.suppliers.length === 0 && <div style={{ fontSize: 14, color: "var(--ink-2)", padding: "24px 0" }}>Nenhum fornecedor cadastrado.</div>}
                      {partnerStock.suppliers.map(s => {
                        const expanded = !!partnerStockExpanded[`s-${s.supplierId}`];
                        const lowCount = s.coffees.filter(c => c.stock !== null && c.stock <= 0).length;
                        return (
                          <div key={s.supplierId} style={{ background: "var(--paper)", borderRadius: 14, border: "1px solid var(--line)", overflow: "hidden" }}>
                            <button onClick={() => setPartnerStockExpanded(p => ({ ...p, [`s-${s.supplierId}`]: !p[`s-${s.supplierId}`] }))}
                              style={{ width: "100%", padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--ink-2)" strokeWidth={1.8} style={{ transform: expanded ? "rotate(90deg)" : "none", transition: "transform .15s", flexShrink: 0 }}><polyline points="9 18 15 12 9 6"/></svg>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <span style={{ fontSize: 15, fontWeight: 500, color: "var(--ink)" }}>{s.supplierName}</span>
                                  <Badge>{s.supplierType === "ROASTER" ? "Torrefador" : "Produtor"}</Badge>
                                  {lowCount > 0 && <Badge color="var(--c-vibra)">{lowCount} sem estoque</Badge>}
                                </div>
                                <div className="mono" style={{ fontSize: 11, color: "var(--ink-2)", marginTop: 2 }}>{s.coffeeCount} produto(s)</div>
                              </div>
                            </button>
                            {expanded && (
                              <div style={{ borderTop: "1px solid var(--line)", overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                                  <thead>
                                    <tr style={{ background: "var(--bg)" }}>
                                      <th style={{ padding: "10px 18px", textAlign: "left", fontWeight: 500, color: "var(--ink-2)", fontSize: 11 }}>Produto</th>
                                      <th style={{ padding: "10px 18px", textAlign: "right", fontWeight: 500, color: "var(--ink-2)", fontSize: 11 }}>Estoque (kg)</th>
                                      <th style={{ padding: "10px 18px", textAlign: "right", fontWeight: 500, color: "var(--ink-2)", fontSize: 11 }}>Preço/kg</th>
                                      <th style={{ padding: "10px 18px", textAlign: "right", fontWeight: 500, color: "var(--ink-2)", fontSize: 11 }}>Pacote</th>
                                      <th style={{ padding: "10px 18px", textAlign: "left", fontWeight: 500, color: "var(--ink-2)", fontSize: 11 }}>Região</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {s.coffees.map((c, i) => {
                                      const stockZero = c.stock !== null && c.stock <= 0;
                                      return (
                                        <tr key={c.id} style={{ borderTop: i === 0 ? "none" : "1px solid var(--line)", background: stockZero ? "rgba(184,35,26,.04)" : undefined }}>
                                          <td style={{ padding: "11px 18px", color: "var(--ink)", fontWeight: 500 }}>{c.name}</td>
                                          <td style={{ padding: "11px 18px", textAlign: "right", color: stockZero ? "var(--c-vibra)" : "var(--ink)", fontWeight: stockZero ? 600 : undefined }}>
                                            {c.stock ?? "—"}
                                          </td>
                                          <td style={{ padding: "11px 18px", textAlign: "right", color: "var(--ink-2)" }}>{c.pricePerKg != null ? fmt(c.pricePerKg) : "—"}</td>
                                          <td style={{ padding: "11px 18px", textAlign: "right", color: "var(--ink-2)" }}>{c.packagePrice != null ? fmt(c.packagePrice) : "—"}</td>
                                          <td style={{ padding: "11px 18px", color: "var(--ink-2)" }}>{c.region ?? "—"}</td>
                                        </tr>
                                      );
                                    })}
                                    {s.coffees.length === 0 && (
                                      <tr><td colSpan={5} style={{ padding: "14px 18px", color: "var(--ink-2)", textAlign: "center" }}>Nenhum produto cadastrado.</td></tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cafeterias */}
                  <div>
                    <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 14 }}>Cafeterias</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {partnerStock.coffeeshops.length === 0 && <div style={{ fontSize: 14, color: "var(--ink-2)", padding: "24px 0" }}>Nenhuma cafeteria com estoque registrado.</div>}
                      {partnerStock.coffeeshops.map(cs => {
                        const expanded = !!partnerStockExpanded[`cs-${cs.userId}`];
                        const lowCount = cs.stocks.filter(st => st.isLow).length;
                        return (
                          <div key={cs.userId} style={{ background: "var(--paper)", borderRadius: 14, border: "1px solid var(--line)", overflow: "hidden" }}>
                            <button onClick={() => setPartnerStockExpanded(p => ({ ...p, [`cs-${cs.userId}`]: !p[`cs-${cs.userId}`] }))}
                              style={{ width: "100%", padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--ink-2)" strokeWidth={1.8} style={{ transform: expanded ? "rotate(90deg)" : "none", transition: "transform .15s", flexShrink: 0 }}><polyline points="9 18 15 12 9 6"/></svg>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <span style={{ fontSize: 15, fontWeight: 500, color: "var(--ink)" }}>{cs.userName}</span>
                                  {lowCount > 0 && <Badge color="var(--c-mostarda)">{lowCount} baixo estoque</Badge>}
                                </div>
                                <div className="mono" style={{ fontSize: 11, color: "var(--ink-2)", marginTop: 2 }}>{cs.city ?? "—"}/{cs.state ?? "—"} · {cs.userEmail} · {cs.stockCount} item(ns)</div>
                              </div>
                            </button>
                            {expanded && (
                              <div style={{ borderTop: "1px solid var(--line)", overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                                  <thead>
                                    <tr style={{ background: "var(--bg)" }}>
                                      <th style={{ padding: "10px 18px", textAlign: "left", fontWeight: 500, color: "var(--ink-2)", fontSize: 11 }}>Café</th>
                                      <th style={{ padding: "10px 18px", textAlign: "left", fontWeight: 500, color: "var(--ink-2)", fontSize: 11 }}>Fornecedor</th>
                                      <th style={{ padding: "10px 18px", textAlign: "right", fontWeight: 500, color: "var(--ink-2)", fontSize: 11 }}>Qtd</th>
                                      <th style={{ padding: "10px 18px", textAlign: "right", fontWeight: 500, color: "var(--ink-2)", fontSize: 11 }}>Alerta</th>
                                      <th style={{ padding: "10px 18px", textAlign: "center", fontWeight: 500, color: "var(--ink-2)", fontSize: 11 }}>Status</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {cs.stocks.map((st, i) => (
                                      <tr key={st.coffeeId} style={{ borderTop: i === 0 ? "none" : "1px solid var(--line)", background: st.isLow ? "rgba(184,35,26,.04)" : undefined }}>
                                        <td style={{ padding: "11px 18px", fontWeight: 500, color: "var(--ink)" }}>{st.coffeeName}</td>
                                        <td style={{ padding: "11px 18px", color: "var(--ink-2)" }}>{st.supplierName}</td>
                                        <td style={{ padding: "11px 18px", textAlign: "right", color: st.isLow ? "var(--c-vibra)" : "var(--ink)", fontWeight: st.isLow ? 600 : undefined }}>{st.quantity}</td>
                                        <td style={{ padding: "11px 18px", textAlign: "right", color: "var(--ink-2)" }}>{st.alertAt ?? "—"}</td>
                                        <td style={{ padding: "11px 18px", textAlign: "center" }}>
                                          {st.isLow ? <Badge color="var(--c-vibra)">Baixo</Badge> : <Badge color="#2e7244">OK</Badge>}
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
                  </div>
                </>
              )}
            </div>
          )}

          {/* ══ PLANOS ══ */}
          {activeTab === "Planos" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" as const }}>
                <div>
                  <div className="serif" style={{ fontSize: mob ? 22 : 32, letterSpacing: "-.01em", marginBottom: 4 }}>Planos de Fornecedor</div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--ink-2)", letterSpacing: ".12em" }}>{plans.length} cadastrados</div>
                </div>
                <PrimaryBtn onClick={openPlanCreate}>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Novo plano
                </PrimaryBtn>
              </div>
              {plansLoading ? <Spinner /> : (
                <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(3,1fr)", gap: 16 }}>
                  {plans.map(p => (
                    <div key={p.id} style={{ background: "var(--paper)", borderRadius: 16, border: "1px solid var(--line)", padding: "22px 24px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 16 }}>
                        <div>
                          <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>{p.name}</div>
                          <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>{p.description}</div>
                        </div>
                        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth={1.4}><rect x={2} y={5} width={20} height={14} rx={2}/><path d="M2 10h20"/></svg>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                        <span style={{ color: "var(--ink-2)" }}>Preço mensal</span>
                        <span className="serif" style={{ fontSize: 18, letterSpacing: "-.01em" }}>{fmt(p.price)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, fontSize: 13 }}>
                        <span style={{ color: "var(--ink-2)" }}>Máx. produtos</span>
                        <span style={{ fontWeight: 500 }}>{p.maxProducts ?? "Ilimitado"}</span>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => openPlanEdit(p)} style={{ flex: 1, padding: "9px 12px", borderRadius: 9, border: "1px solid var(--line)", background: "var(--bg)", fontSize: 13, fontFamily: "inherit", cursor: "pointer", color: "var(--ink)" }}>Editar</button>
                        <DangerBtn onClick={() => deletePlan(p.id)}>Remover</DangerBtn>
                      </div>
                    </div>
                  ))}
                  {plans.length === 0 && <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 0", color: "var(--ink-2)", fontSize: 14 }}>Nenhum plano cadastrado.</div>}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ── Modal: detalhe de receita ── */}
      <Modal open={revenueModalOpen} onClose={() => setRevenueModalOpen(false)} title="Detalhes de Receita">
        {stats && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 12 }}>
              {[
                { label: "Confirmada", value: fmt(stats.revenue.confirmed), color: "#2e7244" },
                { label: "Pendente", value: fmt(stats.revenue.pending), color: "var(--c-mostarda)" },
                { label: "Pagamentos falhos", value: stats.revenue.failedPayments, color: "var(--c-vibra)" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ padding: "16px 18px", borderRadius: 12, background: "var(--bg)", border: "1px solid var(--line)" }}>
                  <div className="mono" style={{ fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)" }}>{label}</div>
                  <div className="serif" style={{ fontSize: mob ? 22 : 28, lineHeight: 1.1, letterSpacing: "-.01em", marginTop: 6, color, wordBreak: "break-all" }}>{value}</div>
                </div>
              ))}
            </div>
            <div>
              <div className="mono" style={{ fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 12 }}>Por método de pagamento</div>
              {Object.keys(stats.revenue.byMethod).length === 0
                ? <div style={{ fontSize: 13, color: "var(--ink-3)" }}>Nenhuma receita registrada.</div>
                : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {Object.entries(stats.revenue.byMethod).map(([method, amount]) => {
                      const total = Object.values(stats.revenue.byMethod).reduce((a, b) => a + b, 0);
                      const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
                      return (
                        <div key={method}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <span style={{ fontSize: 14, color: "var(--ink)" }}>{method}</span>
                            <div style={{ textAlign: "right" }}>
                              <span className="serif" style={{ fontSize: 17, letterSpacing: "-.01em" }}>{fmt(amount)}</span>
                              <span className="mono" style={{ fontSize: 10, color: "var(--ink-2)", marginLeft: 8 }}>{pct}%</span>
                            </div>
                          </div>
                          <div style={{ height: 6, background: "var(--bg-2)", borderRadius: 999, overflow: "hidden" }}>
                            <div style={{ height: "100%", borderRadius: 999, background: "var(--c-glamour)", width: `${pct}%`, transition: "width .6s cubic-bezier(.4,0,.2,1)" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
            </div>
          </div>
        )}
      </Modal>

      {/* ── Modal: assinaturas ── */}
      <Modal open={subsModal} onClose={() => setSubsModal(false)} title={`Assinaturas — ${stats?.subscriptions.total ?? 0} ativas`}>
        {subsDetailLoading ? <Spinner /> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {subsDetail.length === 0
              ? <div style={{ textAlign: "center", padding: "32px 0", fontSize: 13, color: "var(--ink-2)" }}>Nenhuma assinatura encontrada.</div>
              : subsDetail.map((s: { id: string; status?: string; frequency?: string; createdAt?: string }) => (
                <div key={s.id} style={{ padding: "12px 14px", background: "var(--bg)", borderRadius: 11, border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div className="mono" style={{ fontSize: 11, color: "var(--ink)" }}>#{s.id.slice(0, 8).toUpperCase()}</div>
                    {s.createdAt && <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 2 }}>Criada em {fmtDate(s.createdAt)}</div>}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    {s.frequency && <Badge>{s.frequency}</Badge>}
                    {s.status && <Badge color={s.status === "ACTIVE" ? "#2e7244" : "var(--c-mostarda)"}>{s.status === "ACTIVE" ? "Ativa" : s.status}</Badge>}
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </Modal>

      {/* ── Modal: alunos do curso ── */}
      <Modal open={!!studentsModal} onClose={() => { setStudentsModal(null); setStudents([]); }} title={`Alunos — ${studentsModal?.course.title ?? ""}`}>
        {studentsLoading ? <Spinner /> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Stats strip */}
            {students.length > 0 && (() => {
              const avg = Math.round(students.reduce((s, st) => s + st.completionPercent, 0) / students.length);
              const done = students.filter(st => st.completionPercent === 100).length;
              return (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 4 }}>
                  {[
                    { label: "Alunos", val: students.length },
                    { label: "Concluíram", val: done },
                    { label: "Progresso médio", val: `${avg}%` },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ textAlign: "center", padding: "12px 8px", borderRadius: 12, background: "var(--bg)", border: "1px solid var(--line)" }}>
                      <div className="serif" style={{ fontSize: 26, lineHeight: 1, letterSpacing: "-.01em" }}>{val}</div>
                      <div className="mono" style={{ fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginTop: 4 }}>{label}</div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Student list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {students.map(st => (
                <div key={st.userId} style={{ padding: "12px 14px", background: "var(--bg)", borderRadius: 12, border: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, gap: 10 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{st.userName}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 2 }}>{st.userEmail}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div className="serif" style={{ fontSize: 20, lineHeight: 1, letterSpacing: "-.01em", color: st.completionPercent === 100 ? "#2e7244" : st.completionPercent > 0 ? "var(--c-mostarda)" : "var(--ink-3)" }}>
                        {st.completionPercent}%
                      </div>
                      <div className="mono" style={{ fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-3)", marginTop: 2 }}>
                        {st.completedLessons}/{st.totalLessons} aulas
                      </div>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div style={{ height: 5, background: "var(--line)", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 999,
                      background: st.completionPercent === 100 ? "#2e7244" : st.completionPercent > 0 ? "var(--c-mostarda)" : "var(--line)",
                      width: `${st.completionPercent}%`,
                      transition: "width .6s cubic-bezier(.4,0,.2,1)"
                    }} />
                  </div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 6, letterSpacing: ".1em" }}>
                    Matriculado em {fmtDate(st.enrolledAt)}
                    {st.lastActivityAt && ` · Último acesso ${fmtDate(st.lastActivityAt)}`}
                  </div>
                </div>
              ))}
              {students.length === 0 && (
                <div style={{ textAlign: "center", padding: "32px 0", fontSize: 13, color: "var(--ink-2)" }}>Nenhum aluno matriculado ainda.</div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ── Modal: plano ── */}
      <Modal open={planModal} onClose={() => setPlanModal(false)} title={editingPlan ? `Editar: ${editingPlan.name}` : "Novo Plano"}>
        <form onSubmit={savePlan} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div><Lbl>Nome *</Lbl><Inp value={planForm.name} onChange={v => setPlanForm(p => ({ ...p, name: v }))} /></div>
          <div>
            <Lbl>Descrição *</Lbl>
            <textarea value={planForm.description} onChange={e => setPlanForm(p => ({ ...p, description: e.target.value }))} rows={3} required style={{ width: "100%", padding: "11px 14px", borderRadius: 10, fontSize: 14, border: "1px solid var(--line)", background: "var(--bg)", fontFamily: "inherit", color: "var(--ink)", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 12 }}>
            <div><Lbl>Preço (R$) *</Lbl><Inp value={planForm.price} onChange={v => setPlanForm(p => ({ ...p, price: v }))} type="number" step="0.01" min="0" /></div>
            <div><Lbl>Máx. Produtos</Lbl><Inp value={planForm.maxProducts} onChange={v => setPlanForm(p => ({ ...p, maxProducts: v }))} type="number" min="1" placeholder="Ilimitado" /></div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <button type="button" onClick={() => setPlanModal(false)} style={{ padding: "11px 20px", borderRadius: 10, border: "1px solid var(--line)", background: "none", fontSize: 14, fontFamily: "inherit", cursor: "pointer", color: "var(--ink-2)" }}>Cancelar</button>
            <PrimaryBtn type="submit" disabled={planSaving}>{planSaving ? "Salvando…" : editingPlan ? "Salvar alterações" : "Criar plano"}</PrimaryBtn>
          </div>
        </form>
      </Modal>

      {/* ── Modal: aulas do curso ── */}
      <Modal open={!!lessonModal} onClose={() => setLessonModal(null)} title={`Aulas — ${lessonModal?.course.title ?? ""}`}>
        {lessonsLoading ? <Spinner /> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[...lessons].sort((a, b) => a.order - b.order).map(l => (
                <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", background: "var(--bg)", borderRadius: 10 }}>
                  <span className="mono" style={{ fontSize: 11, color: "var(--ink-2)", width: 24 }}>#{l.order}</span>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.title}</span>
                  {l.durationMinutes && <span className="mono" style={{ fontSize: 11, color: "var(--ink-2)", flexShrink: 0 }}>{l.durationMinutes}min</span>}
                  {l.isLocked && <Badge>Bloqueada</Badge>}
                  <button onClick={() => deleteLesson(l.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-vibra)", padding: "2px 6px", fontSize: 18, lineHeight: 1, flexShrink: 0 }}>×</button>
                </div>
              ))}
              {lessons.length === 0 && <div style={{ textAlign: "center", padding: "20px 0", fontSize: 13, color: "var(--ink-2)" }}>Nenhuma aula cadastrada.</div>}
            </div>

            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 16 }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 14 }}>Adicionar Aula</div>
              <form onSubmit={addLesson} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div><Lbl>Título *</Lbl><Inp value={lessonForm.title} onChange={v => setLessonForm(p => ({ ...p, title: v }))} /></div>
                <div><Lbl>Descrição</Lbl><Inp value={lessonForm.description} onChange={v => setLessonForm(p => ({ ...p, description: v }))} /></div>
                <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 10 }}>
                  <div><Lbl>Ordem *</Lbl><Inp value={lessonForm.order} onChange={v => setLessonForm(p => ({ ...p, order: v }))} type="number" min="1" /></div>
                  <div><Lbl>Duração (min)</Lbl><Inp value={lessonForm.durationMinutes} onChange={v => setLessonForm(p => ({ ...p, durationMinutes: v }))} type="number" min="1" /></div>
                </div>
                <div><Lbl>URL do Vídeo</Lbl><Inp value={lessonForm.videoUrl} onChange={v => setLessonForm(p => ({ ...p, videoUrl: v }))} placeholder="https://..." /></div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--ink-2)", cursor: "pointer" }}>
                  <input type="checkbox" checked={lessonForm.isLocked} onChange={e => setLessonForm(p => ({ ...p, isLocked: e.target.checked }))} style={{ accentColor: "var(--ink)", width: 15, height: 15 }} />
                  Bloqueada (requer matrícula)
                </label>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <PrimaryBtn type="submit" disabled={lessonSaving}>{lessonSaving ? "Adicionando…" : "Adicionar aula"}</PrimaryBtn>
                </div>
              </form>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
