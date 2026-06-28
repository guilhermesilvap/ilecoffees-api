import { useEffect, useState, useRef } from "react";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/ui/logo";

interface TrackData {
  id: string;
  status: string;
  type: string;
  totalPrice: number;
  quantity: number | null;
  trackingCode: string | null;
  shippingCost: number | null;
  shippingCarrier: string | null;
  shippingDeadlineDays: number | null;
  deliveryCep: string | null;
  createdAt: string;
  updatedAt: string;
  coffee: { id: string; name: string; photoUrl: string | null; saleType: string } | null;
  course: { id: string; title: string; imageUrl: string | null } | null;
  subscription: { id: string; name: string } | null;
  payment: { status: string; method: string | null; paidAt: string | null; amount: number } | null;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Aguardando pagamento",
  PAID: "Pagamento confirmado",
  PREPARING: "Em preparação",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELED: "Cancelado",
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  PIX: "Pix",
  CREDIT_CARD: "Cartão de crédito",
  BOLETO: "Boleto",
};

const STATUS_ORDER = ["PENDING", "PAID", "PREPARING", "SHIPPED", "DELIVERED"];

function StepIndicator({ status }: { status: string }) {
  const current = STATUS_ORDER.indexOf(status);
  const isCanceled = status === "CANCELED";

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 0, marginTop: 32, overflowX: "auto" }}>
      {STATUS_ORDER.map((s, i) => {
        const done = !isCanceled && current >= i;
        const active = !isCanceled && current === i;
        return (
          <div key={s} style={{ flex: 1, minWidth: 80, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
              {i > 0 && (
                <div style={{ flex: 1, height: 2, background: done && current > i - 1 ? "var(--c-vibra)" : "var(--line)" }} />
              )}
              <div style={{
                width: 28, height: 28, borderRadius: 999, flexShrink: 0,
                border: `2px solid ${done ? "var(--c-vibra)" : "var(--line)"}`,
                background: active ? "var(--c-vibra)" : done ? "rgba(194,60,40,.15)" : "var(--bg)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {done && !active && (
                  <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6.5L5 9L9.5 4" stroke="var(--c-vibra)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              {i < STATUS_ORDER.length - 1 && (
                <div style={{ flex: 1, height: 2, background: current > i ? "var(--c-vibra)" : "var(--line)" }} />
              )}
            </div>
            <div className="mono" style={{
              marginTop: 8, fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase",
              textAlign: "center", color: active ? "var(--c-vibra)" : done ? "var(--ink-2)" : "var(--ink-3)",
              fontWeight: active ? 600 : 400,
              paddingInline: 4,
            }}>
              {STATUS_LABELS[s]}
            </div>
          </div>
        );
      })}
    </div>
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

export default function TrackOrder() {
  const { orderId } = useParams<{ orderId: string }>();
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
  const [data, setData] = useState<TrackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    api.get(`/orders/${orderId}/track`)
      .then(r => setData(r.data))
      .catch(err => {
        setError(err?.response?.data?.message ?? "Pedido não encontrado.");
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  const productName = data?.coffee?.name ?? data?.course?.title ?? data?.subscription?.name ?? null;
  const productPhoto = data?.coffee?.photoUrl ?? data?.course?.imageUrl ?? null;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--ink)" }}>
      {/* Header */}
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
            <Link to="/" style={{ textDecoration: "none", color: "inherit" }}><Logo /></Link>
            <span style={{ width: 1, height: 22, background: "var(--ink)", opacity: 0.2 }} />
            <nav style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <NavLink to="/explore" className="mono" style={({ isActive }) => ({ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" as const, color: isActive ? "var(--ink)" : "var(--ink-2)", textDecoration: "none", borderBottom: isActive ? "1.5px solid var(--ink)" : "1.5px solid transparent", paddingBottom: 1 })}>Catálogo</NavLink>
              <NavLink to="/courses" className="mono" style={({ isActive }) => ({ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" as const, color: isActive ? "var(--ink)" : "var(--ink-2)", textDecoration: "none", borderBottom: isActive ? "1.5px solid var(--ink)" : "1.5px solid transparent", paddingBottom: 1 })}>Cursos</NavLink>
              <NavLink to="/subscriptions" className="mono" style={({ isActive }) => ({ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" as const, color: isActive ? "var(--ink)" : "var(--ink-2)", textDecoration: "none", borderBottom: isActive ? "1.5px solid var(--ink)" : "1.5px solid transparent", paddingBottom: 1 })}>Assinaturas</NavLink>
            </nav>
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
                    background: type === "SUPPLIER" ? "var(--c-glamour)" : type === "ADMIN" ? "var(--c-vibra)" : (user as any)?.accountType === "COFFEESHOP" ? "var(--c-glamour)" : "var(--c-mostarda)",
                    color: (type === "SUPPLIER" || type === "ADMIN" || (user as any)?.accountType === "COFFEESHOP") ? "var(--c-leveza)" : "var(--ink)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 600, fontSize: 12,
                  }}>
                    {(user as any)?.photoUrl
                      ? <img src={(user as any).photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : getInitials(user?.name ?? "")}
                  </span>
                  <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 }}>
                    <span style={{ fontSize: 14, color: "var(--ink)", fontWeight: 500, lineHeight: 1 }}>{user?.name?.split(" ")[0]}</span>
                    <span className="mono" style={{ fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-2)", lineHeight: 1 }}>
                      {type === "SUPPLIER" ? (supplierType === "PRODUCER" ? "Produtor" : "Torrefador") : type === "ADMIN" ? "Admin" : (user as any)?.accountType === "COFFEESHOP" ? "Cafeteria" : "Cliente"}
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
                    <Link to={type === "SUPPLIER" ? (supplierType === "PRODUCER" ? "/dashboard/producer" : "/dashboard/supplier") : type === "ADMIN" ? "/dashboard/admin" : (user as any)?.accountType === "COFFEESHOP" ? "/dashboard/coffeeshop" : "/dashboard/customer"} onClick={() => setMenuOpen(false)} style={{ display: "block", padding: "10px 14px", borderRadius: 8, fontSize: 14, color: "var(--ink)", textDecoration: "none" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >Meu painel</Link>
                    <div style={{ height: 1, background: "var(--line)", margin: "4px 0" }} />
                    <button onClick={() => { logout(); navigate("/"); setMenuOpen(false); }} style={{ display: "block", width: "100%", padding: "10px 14px", borderRadius: 8, fontSize: 14, color: "var(--ink-2)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" as const }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >Sair</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" style={{ padding: "9px 16px", fontSize: 14, color: "var(--ink-2)", textDecoration: "none" }}>Entrar</Link>
                <Link to="/register/customer" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 999, border: "1px solid var(--ink)", fontSize: 13, textDecoration: "none", color: "var(--ink)" }}>Criar conta</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px 80px" }}>
        {loading && (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <div className="serif" style={{ fontSize: 22, color: "var(--ink-2)" }}>Consultando pedido…</div>
          </div>
        )}

        {!loading && error && (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <div className="serif" style={{ fontSize: 36, color: "var(--ink)" }}>Pedido não encontrado</div>
            <p style={{ fontSize: 15, color: "var(--ink-2)", marginTop: 12 }}>{error}</p>
            <Link to="/" style={{
              display: "inline-flex", marginTop: 24, padding: "10px 24px",
              background: "var(--ink)", color: "var(--c-leveza)", borderRadius: 999, fontSize: 14, textDecoration: "none",
            }}>
              Ir para o início
            </Link>
          </div>
        )}

        {!loading && data && (
          <>
            <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 12 }}>
              <span style={{ color: "var(--c-vibra)" }}>§</span>&nbsp; Seu pedido
            </div>
            <h1 className="serif" style={{ margin: "0 0 4px", fontSize: "clamp(40px, 5vw, 60px)", lineHeight: 0.95, letterSpacing: "-.025em" }}>
              Onde está seu <span className="italic" style={{ color: "var(--c-vibra)" }}>café</span>.
            </h1>
            <div className="mono" style={{ fontSize: 11, letterSpacing: ".1em", color: "var(--ink-2)", marginTop: 10 }}>
              ID: {data.id}
            </div>

            {/* Product card */}
            {productName && (
              <div style={{
                marginTop: 28, display: "flex", gap: 16, alignItems: "center",
                padding: "16px 18px", background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 14,
              }}>
                {productPhoto ? (
                  <img
                    src={productPhoto}
                    alt={productName}
                    style={{ width: 64, height: 64, borderRadius: 10, objectFit: "cover", flexShrink: 0 }}
                  />
                ) : (
                  <div style={{
                    width: 64, height: 64, borderRadius: 10, flexShrink: 0,
                    background: "rgba(194,60,40,.08)", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span className="script" style={{ fontSize: 22, color: "var(--c-vibra)" }}>íle</span>
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 4 }}>
                    {data.type === "SUBSCRIPTION" ? "Assinatura" : data.coffee ? "Café" : "Curso"}
                  </div>
                  <div className="serif" style={{ fontSize: 20, lineHeight: 1.1 }}>{productName}</div>
                  {data.quantity != null && (
                    <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 4 }}>
                      {data.coffee?.saleType === "KG"
                        ? `${data.quantity.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} kg`
                        : `${Math.round(data.quantity)} pacote${Math.round(data.quantity) !== 1 ? "s" : ""}`}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 4 }}>Total</div>
                  <div className="serif" style={{ fontSize: 20 }}>
                    {data.totalPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </div>
                </div>
              </div>
            )}

            {data.status === "CANCELED" ? (
              <div style={{
                marginTop: 32, padding: "24px 22px", borderRadius: 16,
                background: "rgba(194,60,40,.06)", border: "1px solid rgba(194,60,40,.22)",
              }}>
                <div className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--c-vibra)", marginBottom: 8 }}>
                  Pedido cancelado
                </div>
                <p style={{ fontSize: 14, color: "var(--ink-2)", margin: 0 }}>
                  Este pedido foi cancelado. Se você tiver dúvidas, entre em contato com o suporte.
                </p>
              </div>
            ) : (
              <StepIndicator status={data.status} />
            )}

            {data.trackingCode && (
              <div style={{
                marginTop: 32, padding: "20px 22px", borderRadius: 14,
                background: "var(--paper)", border: "1px solid var(--line)",
              }}>
                <div className="mono" style={{ fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 8 }}>
                  Código de rastreio
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <span className="mono" style={{
                    fontSize: 20, letterSpacing: ".06em", color: "var(--c-vibra)",
                    background: "rgba(194,60,40,.07)", padding: "8px 14px", borderRadius: 8,
                  }}>
                    {data.trackingCode}
                  </span>
                  {data.shippingCarrier && (
                    <span style={{ fontSize: 13, color: "var(--ink-2)" }}>{data.shippingCarrier}</span>
                  )}
                </div>
                {data.shippingDeadlineDays && (
                  <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 10 }}>
                    Prazo estimado: <b style={{ color: "var(--ink)" }}>{data.shippingDeadlineDays} dias úteis</b>
                  </div>
                )}
              </div>
            )}

            <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ padding: "16px 18px", background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 12 }}>
                <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 6 }}>Status atual</div>
                <div className="serif" style={{ fontSize: 18, lineHeight: 1.2 }}>{STATUS_LABELS[data.status] ?? data.status}</div>
              </div>
              <div style={{ padding: "16px 18px", background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 12 }}>
                <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 6 }}>Tipo</div>
                <div className="serif" style={{ fontSize: 18 }}>{data.type === "SUBSCRIPTION" ? "Assinatura" : "Pedido avulso"}</div>
              </div>
            </div>

            {/* Payment info */}
            {data.payment && (
              <div style={{
                marginTop: 12, padding: "16px 18px",
                background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 12,
              }}>
                <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 10 }}>
                  Pagamento
                </div>
                <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 2 }}>Método</div>
                    <div style={{ fontSize: 14, color: "var(--ink)" }}>
                      {data.payment.method ? (PAYMENT_METHOD_LABELS[data.payment.method] ?? data.payment.method) : "—"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 2 }}>Status</div>
                    <div style={{
                      fontSize: 13,
                      color: data.payment.status === "PAID" ? "var(--success)" : data.payment.status === "PENDING" ? "var(--c-mostarda)" : "var(--ink-2)",
                      fontWeight: 500,
                    }}>
                      {data.payment.status === "PAID" ? "Confirmado" : data.payment.status === "PENDING" ? "Aguardando" : data.payment.status}
                    </div>
                  </div>
                  {data.payment.paidAt && (
                    <div>
                      <div style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 2 }}>Pago em</div>
                      <div style={{ fontSize: 14, color: "var(--ink)" }}>
                        {new Date(data.payment.paidAt).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 2 }}>Valor</div>
                    <div style={{ fontSize: 14, color: "var(--ink)" }}>
                      {data.payment.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </div>
                  </div>
                  {data.shippingCost != null && data.shippingCost > 0 && (
                    <div>
                      <div style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 2 }}>Frete</div>
                      <div style={{ fontSize: 14, color: "var(--ink)" }}>
                        {data.shippingCost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {data.deliveryCep && (
              <div style={{ marginTop: 12, padding: "14px 18px", background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 12 }}>
                <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 6 }}>CEP de entrega</div>
                <div style={{ fontSize: 14, color: "var(--ink)" }}>{data.deliveryCep}</div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
