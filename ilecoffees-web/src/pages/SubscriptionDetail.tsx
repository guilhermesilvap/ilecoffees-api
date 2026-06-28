import { useEffect, useState, useRef } from "react";
import { Link, NavLink, useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

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
type PayMethod = "PIX" | "CREDIT_CARD" | "BOLETO";
type Step = "DETAILS" | "PAYMENT" | "SUCCESS";

const BAND_COLORS = ["var(--c-mostarda)", "var(--c-glamour)", "var(--c-barro)", "var(--c-vibra)", "var(--c-leveza)"];
const BAND_INK   = ["var(--ink)", "var(--c-leveza)", "var(--c-leveza)", "var(--c-leveza)", "var(--ink)"];

function planColorIdx(id: string) {
  return id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % BAND_COLORS.length;
}
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
function fakeCard(seed: string) {
  const n = seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return `0000 0000 0000 ${String(1000 + (n % 9000)).padStart(4, "0")}`;
}

/* ── Icons ── */
function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg width={10} height={6} viewBox="0 0 10 6" style={{ transform: `rotate(${open ? 180 : 0}deg)`, transition: "transform .15s", flexShrink: 0 }}>
      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
    </svg>
  );
}
function ArrowIcon({ size = 14, dir = "right" }: { size?: number; dir?: "left" | "right" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" style={{ transform: dir === "left" ? "rotate(180deg)" : undefined }}>
      <path d="M2.5 7h9M7.8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CheckIcon({ size = 14, color = "var(--success)" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path d="M3 7.5L6 10.5L11 4.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function LockIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <rect x="3" y="6.5" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5 6.5V4.5a2 2 0 014 0v2" stroke="currentColor" strokeWidth="1.3" />
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
function Header() {
  const { isAuthenticated, user, type, supplierType, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mob = useIsMobile();

  useEffect(() => {
    function onOut(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onOut);
    return () => document.removeEventListener("mousedown", onOut);
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
        maxWidth: 1320, margin: "0 auto", padding: mob ? "14px 20px" : "16px 32px",
        display: "grid", gridTemplateColumns: mob ? "auto auto" : "auto 1fr auto", alignItems: "center", gap: 24,
      }}>
        <Logo />
        {!mob && (
          accountType === "COFFEESHOP" ? (
            <Link to="/dashboard/coffeeshop" style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, color: "var(--ink-2)", textDecoration: "none" }}>
              <ArrowIcon size={12} dir="left" /> Voltar ao meu painel
            </Link>
          ) : (
            <nav style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <NavLink to="/explore" className="mono" style={({ isActive }) => ({ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" as const, color: isActive ? "var(--ink)" : "var(--ink-2)", textDecoration: "none", borderBottom: isActive ? "1.5px solid var(--ink)" : "1.5px solid transparent", paddingBottom: 1 })}>Catálogo</NavLink>
              <NavLink to="/courses" className="mono" style={({ isActive }) => ({ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" as const, color: isActive ? "var(--ink)" : "var(--ink-2)", textDecoration: "none", borderBottom: isActive ? "1.5px solid var(--ink)" : "1.5px solid transparent", paddingBottom: 1 })}>Cursos</NavLink>
              <NavLink to="/subscriptions" className="mono" style={({ isActive }) => ({ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" as const, color: isActive ? "var(--ink)" : "var(--ink-2)", textDecoration: "none", borderBottom: isActive ? "1.5px solid var(--ink)" : "1.5px solid transparent", paddingBottom: 1 })}>Assinaturas</NavLink>
            </nav>
          )
        )}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {isAuthenticated ? (
            <div ref={menuRef} style={{ position: "relative" }}>
              <button onClick={() => setMenuOpen(o => !o)} style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "6px 12px 6px 6px", borderRadius: 999,
                border: "1px solid var(--line)", background: "var(--paper)",
                cursor: "pointer", fontFamily: "inherit",
              }}>
                <span style={{
                  width: 32, height: 32, borderRadius: 999, overflow: "hidden",
                  background: type === "SUPPLIER" ? "var(--c-glamour)" : type === "ADMIN" ? "var(--c-vibra)" : accountType === "COFFEESHOP" ? "var(--c-glamour)" : "var(--c-mostarda)",
                  color: (type === "SUPPLIER" || type === "ADMIN" || accountType === "COFFEESHOP") ? "var(--c-leveza)" : "var(--ink)",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 600, fontSize: 11,
                }}>
                  {(user as any)?.photoUrl
                    ? <img src={(user as any).photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : getInitials(userName)}
                </span>
                <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.1 }}>
                  <span style={{ fontSize: 13 }}>{userName.split(" ")[0]}</span>
                  <span className="mono" style={{ fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-2)" }}>
                    {type === "SUPPLIER" ? (supplierType === "PRODUCER" ? "Produtor" : "Torrefador") : type === "ADMIN" ? "Admin" : accountType === "COFFEESHOP" ? "Cafeteria" : "Cliente"}
                  </span>
                </span>
                <ChevronIcon open={menuOpen} />
              </button>
              {menuOpen && (
                <div style={{
                  position: "absolute", right: 0, top: "calc(100% + 8px)", zIndex: 40,
                  minWidth: 200, background: "var(--paper)",
                  border: "1px solid var(--line)", borderRadius: 14,
                  boxShadow: "0 24px 40px -20px rgba(28,8,16,.3)", padding: 8,
                }}>
                  <Link to={dashboardPath} onClick={() => setMenuOpen(false)} style={{
                    display: "flex", padding: "10px 12px", borderRadius: 8,
                    fontSize: 14, color: "var(--ink)", textDecoration: "none",
                  }}>Meu painel</Link>
                  <div style={{ height: 1, background: "var(--line)", margin: "6px 0" }} />
                  <button onClick={() => { logout(); navigate("/"); }} style={{
                    display: "flex", width: "100%", padding: "10px 12px", borderRadius: 8,
                    fontSize: 14, color: "#b8231a", background: "transparent",
                    border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                  }}>Sair</button>
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
              }}>Criar conta</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

/* ── StepIndicator ── */
function StepIndicator({ step }: { step: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: "DETAILS", label: "Detalhes" },
    { id: "PAYMENT", label: "Pagamento" },
    { id: "SUCCESS", label: "Confirmação" },
  ];
  const idx = steps.findIndex(s => s.id === step);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 36 }}>
      {steps.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <div key={s.id} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{
                width: 28, height: 28, borderRadius: 999,
                background: done ? "var(--success)" : active ? "var(--ink)" : "var(--bg-2)",
                color: (done || active) ? "var(--c-leveza)" : "var(--ink-2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 600, flexShrink: 0,
                border: `1px solid ${done ? "var(--success)" : active ? "var(--ink)" : "var(--line)"}`,
              }}>
                {done ? <CheckIcon size={12} color="var(--c-leveza)" /> : i + 1}
              </span>
              <span className="mono" style={{
                fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase",
                color: active ? "var(--ink)" : done ? "var(--success)" : "var(--ink-2)",
              }}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ width: 40, height: 1, background: done ? "var(--success)" : "var(--line)", margin: "0 12px" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── PlanCover (mini) ── */
function PlanCover({ plan }: { plan: Plan }) {
  const ci = planColorIdx(plan.id);
  const bg = BAND_COLORS[ci];
  const ink = BAND_INK[ci];
  return (
    <div style={{
      borderRadius: 16, background: bg, color: ink,
      padding: "24px 28px", border: "1.5px solid var(--ink)",
      boxShadow: "0 24px 48px -24px rgba(28,8,16,.3)",
    }}>
      <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", opacity: 0.8 }}>
        {plan.supplier?.name ?? "íle coffees"}
      </div>
      <div className="serif" style={{ fontSize: "clamp(36px, 4vw, 56px)", lineHeight: 0.95, letterSpacing: "-.025em", marginTop: 10 }}>
        {plan.name}
      </div>
      {plan.description && (
        <div className="serif italic" style={{ fontSize: 16, marginTop: 10, opacity: 0.85, lineHeight: 1.4 }}>
          {plan.description.split(".")[0]}.
        </div>
      )}
    </div>
  );
}

/* ── BillingToggle ── */
function BillingToggle({ value, onChange, plan, role }: {
  value: BillingCycle; onChange: (v: BillingCycle) => void; plan: Plan; role: string;
}) {
  const { monthly, annual } = effectivePrices(plan, role);
  const savePct = savings(plan, role);
  return (
    <div>
      <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 10 }}>
        Ciclo de cobrança
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {(["MONTHLY", "ANNUAL"] as BillingCycle[]).map(cycle => {
          const on = value === cycle;
          const price = cycle === "MONTHLY" ? monthly : annual;
          const label = cycle === "MONTHLY" ? "Mensal" : "Anual";
          const sub = cycle === "ANNUAL" && savePct > 0
            ? `Economize ${savePct}% (${fmt(monthly * 12 - annual)} por ano)`
            : cycle === "MONTHLY" ? "Sem compromisso de longo prazo" : "Sem desconto adicional";
          return (
            <button key={cycle} onClick={() => onChange(cycle)} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "14px 16px", borderRadius: 12,
              border: `2px solid ${on ? "var(--ink)" : "var(--line)"}`,
              background: on ? "var(--ink)" : "var(--paper)",
              color: on ? "var(--c-leveza)" : "var(--ink)",
              cursor: "pointer", fontFamily: "inherit", textAlign: "left",
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: 11, marginTop: 2, color: on ? "rgba(244,204,160,.8)" : "var(--ink-2)" }}>{sub}</div>
              </div>
              <div className="serif" style={{ fontSize: 22, lineHeight: 1 }}>
                {fmt(price)}<span style={{ fontSize: 12, fontWeight: 400, opacity: 0.7 }}>/{cycle === "MONTHLY" ? "mês" : "ano"}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── OrderSummaryBox ── */
function OrderSummaryBox({ plan, billing, onProceed, loading, role }: {
  plan: Plan; billing: BillingCycle; onProceed: () => void; loading: boolean; role: string;
}) {
  const { monthly, annual } = effectivePrices(plan, role);
  const price = billing === "MONTHLY" ? monthly : annual;
  const savePct = savings(plan, role);
  return (
    <aside style={{
      background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 18,
      padding: 24, position: "sticky", top: 96, alignSelf: "flex-start",
      display: "flex", flexDirection: "column", gap: 20,
      boxShadow: "0 24px 48px -32px rgba(28,8,16,.2)",
    }}>
      <div>
        <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 8 }}>
          Resumo
        </div>
        <div className="serif" style={{ fontSize: 18, lineHeight: 1.1, letterSpacing: "-.01em" }}>{plan.name}</div>
        <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 4 }}>
          {plan.supplier?.name ?? "íle coffees"} · {billing === "MONTHLY" ? "mensal" : "anual"}
        </div>
      </div>

      <div style={{ height: 1, background: "var(--line)" }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {billing === "ANNUAL" && savePct > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
            <span style={{ color: "var(--ink-2)" }}>Desconto anual</span>
            <span style={{ color: "var(--success)" }}>-{savePct}%</span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontSize: 13, color: "var(--ink-2)" }}>Total</span>
          <span className="serif" style={{ fontSize: 32, lineHeight: 1, letterSpacing: "-.02em" }}>{fmt(price)}</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-2)" }}>por {billing === "MONTHLY" ? "mês" : "ano"}</div>
      </div>

      <button onClick={onProceed} disabled={loading} style={{
        padding: "14px 0", borderRadius: 12,
        background: "var(--ink)", color: "var(--c-leveza)",
        border: "none", fontSize: 15, fontWeight: 600,
        cursor: loading ? "wait" : "pointer", fontFamily: "inherit",
        opacity: loading ? 0.7 : 1,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      }}>
        {loading ? "Aguarde…" : <><span>Prosseguir para pagamento</span><ArrowIcon size={12} /></>}
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--ink-2)", justifyContent: "center" }}>
        <LockIcon size={12} /><span>Pagamento seguro · SSL</span>
      </div>

      <div style={{ height: 1, background: "var(--line)" }} />

      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        {["Cancele quando quiser", "Sem taxa de adesão", "Entrega garantida"].map(item => (
          <li key={item} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--ink-2)" }}>
            <CheckIcon size={12} />{item}
          </li>
        ))}
      </ul>
    </aside>
  );
}

/* ── PixPanel ── */
function PixPanel() {
  const [copied, setCopied] = useState(false);
  const key = "00020126360014br.gov.bcb.pix0114+55119999999995204000053039865802BR5913Ile Coffees6009Sao Paulo62140510ilecoffees63042D18";
  function copy() {
    navigator.clipboard.writeText(key).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)" }}>
        Escaneie o QR Code ou copie a chave
      </div>
      <div style={{
        width: 160, height: 160, margin: "0 auto", borderRadius: 12,
        background: "var(--paper)", border: "1.5px solid var(--ink)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 6,
      }}>
        {/* Simulated QR */}
        <svg width={100} height={100} viewBox="0 0 21 21" style={{ imageRendering: "pixelated" as const }}>
          {[
            [0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],
            [0,1],[6,1],[0,2],[2,2],[3,2],[4,2],[6,2],
            [0,3],[2,3],[4,3],[6,3],[0,4],[2,4],[3,4],[4,4],[6,4],
            [0,5],[6,5],[0,6],[1,6],[2,6],[3,6],[4,6],[5,6],[6,6],
            [8,0],[9,0],[10,0],[8,2],[10,2],[8,4],[9,4],
            [0,8],[1,8],[3,8],[5,8],[6,8],[0,10],[2,10],[4,10],[6,10],
            [0,12],[1,12],[2,12],[3,12],[4,12],[5,12],[6,12],
            [0,13],[6,13],[0,14],[2,14],[4,14],[6,14],[0,15],[6,15],[0,16],[2,16],[3,16],[4,16],[6,16],
            [14,0],[15,0],[16,0],[17,0],[18,0],[19,0],[20,0],
            [14,1],[20,1],[14,2],[16,2],[18,2],[20,2],[14,3],[16,3],[18,3],[20,3],
            [14,5],[20,5],[14,6],[15,6],[16,6],[17,6],[18,6],[19,6],[20,6],
            [8,8],[10,8],[12,8],[9,10],[11,10],[13,10],[8,12],[10,12],[12,12],
          ].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width={1} height={1} fill="var(--ink)" />
          ))}
        </svg>
        <div className="mono" style={{ fontSize: 8, letterSpacing: ".1em", color: "var(--ink-2)" }}>PIX</div>
      </div>
      <div style={{ background: "var(--bg-2)", borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <span className="mono" style={{ fontSize: 10, color: "var(--ink-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
          {key.slice(0, 36)}…
        </span>
        <button onClick={copy} style={{
          padding: "6px 12px", borderRadius: 999, fontSize: 12,
          background: copied ? "var(--success)" : "var(--ink)",
          color: "var(--c-leveza)", border: "none", cursor: "pointer", flexShrink: 0, fontFamily: "inherit",
        }}>
          {copied ? "Copiado!" : "Copiar"}
        </button>
      </div>
      <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>
        Após o pagamento, a confirmação é <b style={{ color: "var(--ink)" }}>imediata</b>. O QR Code expira em <b style={{ color: "var(--ink)" }}>30 minutos</b>.
      </div>
    </div>
  );
}

/* ── CardPanel ── */
function CardPanel({ planId }: { planId: string }) {
  const [num, setNum] = useState("");
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [installments, setInstallments] = useState("1");

  function maskNum(v: string) {
    return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  }
  function maskExpiry(v: string) {
    return v.replace(/\D/g, "").slice(0, 4).replace(/^(\d{2})(\d)/, "$1/$2");
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px",
    border: "1px solid var(--line)", borderRadius: 10, fontSize: 14,
    background: "var(--bg)", fontFamily: "inherit", color: "inherit",
    outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 8 }}>Número do cartão</div>
        <input
          value={num || fakeCard(planId).replace("0000 0000 0000 ", "")}
          onChange={e => setNum(maskNum(e.target.value))}
          placeholder="0000 0000 0000 0000"
          style={inputStyle}
        />
      </div>
      <div>
        <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 8 }}>Nome no cartão</div>
        <input
          value={name}
          onChange={e => setName(e.target.value.toUpperCase())}
          placeholder="NOME COMPLETO"
          style={inputStyle}
        />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 8 }}>Validade</div>
          <input
            value={expiry}
            onChange={e => setExpiry(maskExpiry(e.target.value))}
            placeholder="MM/AA"
            style={inputStyle}
          />
        </div>
        <div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 8 }}>CVV</div>
          <input
            value={cvv}
            onChange={e => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="000"
            style={inputStyle}
          />
        </div>
      </div>
      <div>
        <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 8 }}>Parcelas</div>
        <select value={installments} onChange={e => setInstallments(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
          <option value="1">1x sem juros</option>
          <option value="2">2x sem juros</option>
          <option value="3">3x sem juros</option>
          <option value="4">4x sem juros</option>
          <option value="6">6x sem juros</option>
          <option value="12">12x sem juros</option>
        </select>
      </div>
    </div>
  );
}

/* ── BoletoPanel ── */
function BoletoPanel() {
  const [copied, setCopied] = useState(false);
  const code = "34191.09008 62862.860078 02413.780003 6 97330000012900";
  const due = new Date(Date.now() + 3 * 86400000).toLocaleDateString("pt-BR");
  function copy() {
    navigator.clipboard.writeText(code.replace(/\s/g, "")).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)" }}>
        Boleto bancário · vence em {due}
      </div>
      {/* Simulated barcode */}
      <div style={{
        background: "white", padding: "16px 12px", borderRadius: 10, border: "1px solid var(--line)",
        overflow: "hidden",
      }}>
        <svg width="100%" height={60} viewBox="0 0 200 60" preserveAspectRatio="none">
          {Array.from({ length: 80 }, (_, i) => {
            const w = (i % 3 === 0 ? 2 : 1);
            const x = i * 2.4;
            return <rect key={i} x={x} y={0} width={w} height={60} fill={i % 7 === 0 ? "white" : "black"} />;
          })}
        </svg>
      </div>
      <div style={{ background: "var(--bg-2)", borderRadius: 10, padding: "12px 14px" }}>
        <div className="mono" style={{ fontSize: 11, color: "var(--ink-2)", marginBottom: 8, letterSpacing: ".1em" }}>
          Linha digitável
        </div>
        <div className="mono" style={{ fontSize: 13, color: "var(--ink)", letterSpacing: ".06em", wordBreak: "break-all" as const }}>
          {code}
        </div>
      </div>
      <button onClick={copy} style={{
        padding: "12px 0", borderRadius: 10, fontSize: 14,
        background: copied ? "var(--success)" : "var(--bg-2)",
        color: copied ? "var(--c-leveza)" : "var(--ink)",
        border: "1px solid var(--line)", cursor: "pointer", fontFamily: "inherit",
      }}>
        {copied ? "Código copiado!" : "Copiar código de barras"}
      </button>
      <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>
        Após o pagamento, a confirmação pode levar até <b style={{ color: "var(--ink)" }}>2 dias úteis</b>.
        O boleto vence em <b style={{ color: "var(--ink)" }}>{due}</b>.
      </div>
    </div>
  );
}

/* ── PaymentStep ── */
function PaymentStep({ plan, billing, orderId, onConfirm, confirming, role }: {
  plan: Plan; billing: BillingCycle; orderId: string;
  onConfirm: (method: PayMethod) => void; confirming: boolean; role: string;
}) {
  const mob = useIsMobile();
  const [method, setMethod] = useState<PayMethod>("PIX");
  const { monthly, annual } = effectivePrices(plan, role);
  const price = billing === "MONTHLY" ? monthly : annual;

  const methods: { id: PayMethod; label: string; sub: string }[] = [
    { id: "PIX", label: "PIX", sub: "Confirmação imediata" },
    { id: "CREDIT_CARD", label: "Cartão de crédito", sub: "Até 12x sem juros" },
    { id: "BOLETO", label: "Boleto bancário", sub: "Vence em 3 dias úteis" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 380px", gap: mob ? 24 : 48, alignItems: "start" }}>
      {/* Left: payment form */}
      <div>
        <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 12 }}>
          <span style={{ color: "var(--c-vibra)" }}>§</span>&nbsp; Forma de pagamento
        </div>
        <h2 className="serif" style={{ margin: "0 0 28px", fontSize: "clamp(32px, 4vw, 48px)", lineHeight: 0.95, letterSpacing: "-.025em" }}>
          Como deseja <span className="italic" style={{ color: "var(--c-vibra)" }}>pagar</span>?
        </h2>

        {/* Method tabs */}
        <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
          {methods.map(m => {
            const on = method === m.id;
            return (
              <button key={m.id} onClick={() => setMethod(m.id)} style={{
                padding: "10px 16px", borderRadius: 10,
                border: `2px solid ${on ? "var(--ink)" : "var(--line)"}`,
                background: on ? "var(--ink)" : "var(--paper)",
                color: on ? "var(--c-leveza)" : "var(--ink)",
                cursor: "pointer", fontFamily: "inherit",
                display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2,
              }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{m.label}</span>
                <span className="mono" style={{ fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", opacity: 0.7 }}>{m.sub}</span>
              </button>
            );
          })}
        </div>

        <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 16, padding: "24px 22px" }}>
          {method === "PIX"         && <PixPanel />}
          {method === "CREDIT_CARD" && <CardPanel planId={plan.id} />}
          {method === "BOLETO"      && <BoletoPanel />}
        </div>
      </div>

      {/* Right: confirm box */}
      <aside style={{
        background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 18,
        padding: 24, position: "sticky", top: 96, alignSelf: "flex-start",
        display: "flex", flexDirection: "column", gap: 20,
        boxShadow: "0 24px 48px -32px rgba(28,8,16,.2)",
      }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)" }}>
          Resumo do pedido
        </div>
        <div style={{ background: "var(--bg-2)", borderRadius: 10, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{plan.name}</div>
            <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 2 }}>
              {billing === "MONTHLY" ? "Mensal" : "Anual"} · {plan.supplier?.name ?? "íle coffees"}
            </div>
          </div>
          <div className="serif" style={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>{fmt(price)}</div>
        </div>

        <div style={{ height: 1, background: "var(--line)" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontSize: 13, color: "var(--ink-2)" }}>Total</span>
          <span className="serif" style={{ fontSize: 28, lineHeight: 1, letterSpacing: "-.02em" }}>{fmt(price)}</span>
        </div>

        <button
          onClick={() => onConfirm(method)}
          disabled={confirming}
          style={{
            padding: "14px 0", borderRadius: 12,
            background: "var(--ink)", color: "var(--c-leveza)",
            border: "none", fontSize: 15, fontWeight: 600,
            cursor: confirming ? "wait" : "pointer", fontFamily: "inherit",
            opacity: confirming ? 0.7 : 1,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          {confirming ? "Processando…" : <><span>Confirmar pagamento</span><ArrowIcon size={12} /></>}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--ink-2)", justifyContent: "center" }}>
          <LockIcon size={12} /><span>Ambiente seguro · SSL 256-bit</span>
        </div>

        <div className="mono" style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink-2)", textAlign: "center" }}>
          Pedido #{orderId.slice(0, 8).toUpperCase()}
        </div>
      </aside>
    </div>
  );
}

/* ── useIsMobile ── */
function useIsMobile(bp = 768) {
  const [m, setM] = useState(() => typeof window !== "undefined" && window.innerWidth < bp);
  useEffect(() => {
    const h = () => setM(window.innerWidth < bp);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, [bp]);
  return m;
}

/* ── Page ── */
export default function SubscriptionDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, type, user } = useAuth();
  const role = (user as any)?.accountType === "COFFEESHOP" ? "COFFEESHOP" : "CUSTOMER";
  const navigate = useNavigate();

  const mob = useIsMobile();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [billing, setBilling] = useState<BillingCycle>("MONTHLY");
  const [step, setStep] = useState<Step>("DETAILS");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [proceeding, setProceeding] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get(`/subscriptions/${id}`)
      .then(r => setPlan(r.data))
      .catch(() => navigate("/subscriptions"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  async function handleProceed() {
    if (!isAuthenticated) { navigate("/login"); return; }
    if (type !== "USER") return;
    setProceeding(true);
    setError(null);
    try {
      const r = await api.post("/orders/subscribe", { subscriptionId: id, billingCycle: billing });
      setOrderId(r.data.id);
      setStep("PAYMENT");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Erro ao criar o pedido. Tente novamente.");
    } finally {
      setProceeding(false);
    }
  }

  async function handleConfirm(method: PayMethod) {
    if (!orderId) return;
    setConfirming(true);
    setError(null);
    try {
      await api.post("/payments", { orderId, method });
      navigate(`/purchase-success?type=subscription&plan=${encodeURIComponent(plan?.name ?? "")}`);
    } catch {
      setError("Erro ao processar o pagamento. Tente novamente.");
    } finally {
      setConfirming(false);
    }
  }

  if (loading) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="serif" style={{ fontSize: 24, color: "var(--ink-2)" }}>Carregando…</div>
      </div>
    );
  }
  if (!plan) return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--ink)" }}>
      <Header />
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "80px 32px", textAlign: "center" }}>
        <p className="serif" style={{ fontSize: 24, color: "var(--ink-2)" }}>Plano não encontrado.</p>
      </div>
    </div>
  );

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--ink)" }}>
      <Header />

      {/* Breadcrumb */}
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: mob ? "16px 20px 0" : "20px 32px 0" }}>
        <nav className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>Início</Link>
          <span style={{ opacity: 0.5 }}>/</span>
          <Link to="/subscriptions" style={{ color: "inherit", textDecoration: "none" }}>Planos</Link>
          <span style={{ opacity: 0.5 }}>/</span>
          <span style={{ color: "var(--ink)" }}>{plan.name}</span>
        </nav>
      </div>

      <main style={{ maxWidth: 1320, margin: "0 auto", padding: mob ? "24px 20px 60px" : "32px 32px 80px" }}>
        <StepIndicator step={step} />

        {error && (
          <div style={{
            marginBottom: 24, padding: "14px 18px", borderRadius: 10,
            background: "rgba(231,64,44,.1)", border: "1px solid var(--c-vibra)",
            fontSize: 14, color: "var(--c-vibra)",
          }}>
            {error}
          </div>
        )}

        {step === "DETAILS" && (
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 380px", gap: mob ? 24 : 48, alignItems: "start" }}>
            {/* Left: plan details */}
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              <PlanCover plan={plan} />

              {/* Coffees */}
              {(plan.coffees?.length ?? 0) > 0 && (
                <section>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 14 }}>
                    Cafés inclusos no plano
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {(plan.coffees ?? []).map(c => (
                      <div key={c.id} style={{
                        display: "flex", alignItems: "center", gap: 14,
                        padding: "12px 14px", background: "var(--paper)",
                        border: "1px solid var(--line)", borderRadius: 12,
                      }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 999, flexShrink: 0,
                          background: "var(--c-mostarda)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 16,
                        }}>☕</div>
                        <div className="serif" style={{ fontSize: 15, lineHeight: 1.2 }}>{c.name}</div>
                        <div style={{ marginLeft: "auto" }}>
                          <CheckIcon size={14} />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Full description */}
              {plan.description && (
                <section>
                  <h2 className="serif" style={{ margin: "0 0 14px", fontSize: 28, lineHeight: 1.05, letterSpacing: "-.01em" }}>
                    Sobre o <span className="italic" style={{ color: "var(--c-vibra)" }}>plano</span>
                  </h2>
                  <p style={{ fontSize: 16, lineHeight: 1.6, color: "var(--ink-2)", margin: 0, whiteSpace: "pre-line" as const }}>
                    {plan.description}
                  </p>
                </section>
              )}

              {/* Billing toggle */}
              <BillingToggle value={billing} onChange={setBilling} plan={plan} role={role} />

              {/* Non-user notice */}
              {isAuthenticated && type !== "USER" && (
                <div style={{
                  padding: "14px 18px", borderRadius: 12,
                  background: "var(--c-leveza)", border: "1px solid var(--ink)", fontSize: 14,
                }}>
                  Você está logado como <b>{type === "SUPPLIER" ? "fornecedor" : "administrador"}</b>. Assinaturas são exclusivas para clientes.
                </div>
              )}
            </div>

            {/* Right: summary + CTA */}
            <OrderSummaryBox plan={plan} billing={billing} onProceed={handleProceed} loading={proceeding} role={role} />
          </div>
        )}

        {step === "PAYMENT" && orderId && (
          <PaymentStep
            plan={plan}
            billing={billing}
            orderId={orderId}
            onConfirm={handleConfirm}
            confirming={confirming}
            role={role}
          />
        )}
      </main>

      <footer style={{ borderTop: "1px solid var(--line)", padding: mob ? "20px 20px" : "24px 32px", fontSize: 12, color: "var(--ink-2)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <span className="mono" style={{ letterSpacing: ".12em", textTransform: "uppercase" }}>© 2026 Ilé Coffees · desde 1934</span>
          <div style={{ display: "flex", gap: 18 }}>
            <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
            <Link to="/subscriptions" style={{ color: "inherit", textDecoration: "none" }}>Planos</Link>
            <Link to="/explore" style={{ color: "inherit", textDecoration: "none" }}>Cafés</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
