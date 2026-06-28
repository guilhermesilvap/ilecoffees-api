import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";

export interface OrderDetailData {
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
  coffee?: { id: string; name: string; photoUrl?: string | null; saleType?: string } | null;
  course?: { id: string; title: string; imageUrl?: string | null } | null;
  subscription?: { id: string; name: string } | null;
  payment?: { status: string; method?: string | null; paidAt?: string | null; amount: number } | null;
  user?: { name: string; email?: string; phoneNumber?: string | null } | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:   { label: "Pendente",     color: "var(--ink)",       bg: "var(--c-leveza)" },
  PROCESSING:{ label: "Processando",  color: "var(--c-glamour)", bg: "rgba(15,41,32,.10)" },
  PAID:      { label: "Pago",         color: "var(--success)",   bg: "rgba(46,114,68,.14)" },
  SHIPPED:   { label: "Enviado",      color: "var(--ink)",       bg: "rgba(229,138,42,.18)" },
  DELIVERED: { label: "Entregue",     color: "var(--success)",   bg: "rgba(46,114,68,.14)" },
  CANCELED:  { label: "Cancelado",    color: "var(--c-vibra)",   bg: "rgba(231,64,44,.12)" },
};

const PAYMENT_STATUS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Aguardando",  color: "var(--c-mostarda)" },
  SUCCESS: { label: "Confirmado",  color: "var(--success)" },
  FAILED:  { label: "Falhou",      color: "var(--c-vibra)" },
  REFUNDED:{ label: "Estornado",   color: "var(--ink-2)" },
};

const PAYMENT_METHOD: Record<string, string> = {
  PIX: "Pix",
  CREDIT_CARD: "Cartão de crédito",
  BOLETO: "Boleto",
};

const ORDER_TYPE: Record<string, string> = {
  ONE_TIME:     "Compra avulsa",
  SUBSCRIPTION: "Assinatura",
  COURSE:       "Curso",
};

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

function Row({ label, value, accent }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, padding: "11px 0", borderBottom: "1px solid var(--line)" }}>
      <span className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", whiteSpace: "nowrap", paddingTop: 2 }}>{label}</span>
      <span style={{ fontSize: 14, textAlign: "right", color: accent ? "var(--c-vibra)" : "var(--ink)", fontWeight: accent ? 500 : 400 }}>{value}</span>
    </div>
  );
}

export default function OrderDetailModal({ order, onClose, onCancel }: {
  order: OrderDetailData;
  onClose: () => void;
  onCancel?: (id: string) => Promise<void>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [canceling, setCanceling] = useState(false);

  const canCancel = !!onCancel && order.status !== "CANCELED" && order.status !== "DELIVERED";

  async function handleCancel() {
    if (!onCancel) return;
    setCanceling(true);
    try {
      await onCancel(order.id);
      setConfirming(false);
      onClose();
    } finally {
      setCanceling(false);
    }
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (confirming) setConfirming(false);
        else onClose();
      }
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose, confirming]);

  const statusCfg = STATUS_CONFIG[order.status] ?? { label: order.status, color: "var(--ink-2)", bg: "var(--bg-2)" };
  const productName = order.coffee?.name ?? order.course?.title ?? order.subscription?.name ?? "—";
  const productImage = order.coffee?.photoUrl ?? order.course?.imageUrl ?? null;
  const productInitial = productName[0]?.toUpperCase() ?? "?";
  const orderType = order.type ? (ORDER_TYPE[order.type] ?? order.type) : null;

  const content = (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(8,18,12,.55)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 20,
          width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto",
          boxShadow: "0 24px 60px rgba(0,0,0,.22)",
          display: "flex", flexDirection: "column",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 24px 18px", borderBottom: "1px solid var(--line)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span className="mono" style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)" }}>Pedido</span>
            <span className="serif" style={{ fontSize: 22, lineHeight: 1 }}>#{order.id.slice(0, 8).toUpperCase()}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "6px 14px", borderRadius: 999, fontSize: 13,
              background: statusCfg.bg, color: statusCfg.color,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: statusCfg.color, flexShrink: 0 }} />
              {statusCfg.label}
            </span>
            <button
              onClick={onClose}
              style={{ width: 32, height: 32, borderRadius: 999, border: "1px solid var(--line)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-2)", flexShrink: 0 }}
              aria-label="Fechar"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>

        {/* Product */}
        <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, overflow: "hidden", background: "var(--bg-2)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {productImage
              ? <img src={productImage} alt={productName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <span className="serif italic" style={{ fontSize: 22, color: "var(--ink-3)" }}>{productInitial}</span>}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {orderType && (
              <span className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)" }}>{orderType}</span>
            )}
            <div style={{ fontSize: 16, fontWeight: 500, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{productName}</div>
          </div>
        </div>

        {/* Details */}
        <div style={{ padding: "6px 24px 4px" }}>
          <Row label="Data" value={fmtDate(order.createdAt)} />
          <Row label="Total" value={<span className="serif" style={{ fontSize: 18 }}>{fmt(order.totalPrice)}</span>} />
          {order.quantity != null && (
            <Row
              label="Quantidade"
              value={`${order.coffee?.saleType === "KG"
                ? order.quantity.toLocaleString("pt-BR", { maximumFractionDigits: 2 }) + " kg"
                : Math.round(order.quantity) + " pct"}`}
            />
          )}
          {order.shippingCost != null && order.shippingCost > 0 && (
            <Row label="Frete" value={fmt(order.shippingCost)} />
          )}
          {order.deliveryCep && (
            <Row label="CEP de entrega" value={<span className="mono" style={{ fontSize: 13 }}>{order.deliveryCep}</span>} />
          )}
          {order.payment && (
            <>
              {order.payment.method && (
                <Row label="Pagamento" value={PAYMENT_METHOD[order.payment.method] ?? order.payment.method} />
              )}
              <Row
                label="Status do pagamento"
                value={
                  <span style={{ color: PAYMENT_STATUS[order.payment.status]?.color ?? "var(--ink-2)" }}>
                    {PAYMENT_STATUS[order.payment.status]?.label ?? order.payment.status}
                  </span>
                }
              />
              {order.payment.paidAt && (
                <Row label="Pago em" value={fmtDate(order.payment.paidAt)} />
              )}
            </>
          )}
          {order.subscriptionStatus && (
            <Row
              label="Assinatura"
              value={order.subscriptionStatus === "ACTIVE" ? "Ativa" : order.subscriptionStatus === "PAUSED" ? "Pausada" : order.subscriptionStatus}
            />
          )}
          {order.user && (
            <>
              <Row label="Cliente" value={order.user.name} />
              {order.user.email && <Row label="E-mail" value={<span style={{ fontSize: 13 }}>{order.user.email}</span>} />}
              {order.user.phoneNumber && <Row label="Telefone" value={order.user.phoneNumber} />}
            </>
          )}
        </div>

        {/* Tracking */}
        {order.trackingCode && (
          <div style={{ margin: "4px 24px 0", padding: "14px 18px", background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 4 }}>Código de rastreio</div>
              <span className="mono" style={{ fontSize: 14, letterSpacing: ".06em" }}>{order.trackingCode}</span>
            </div>
            <Link
              to={`/track/${order.id}`}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "var(--ink)", color: "var(--c-leveza)", borderRadius: 999, fontSize: 13, textDecoration: "none", flexShrink: 0 }}
            >
              Rastrear
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2.5 7h9M7.8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          </div>
        )}

        {/* Footer */}
        <div style={{ padding: "18px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
          {canCancel && !confirming && (
            <button
              onClick={() => setConfirming(true)}
              style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1px solid var(--c-vibra)", background: "transparent", cursor: "pointer", fontSize: 14, color: "var(--c-vibra)", fontFamily: "inherit" }}
            >
              Cancelar pedido
            </button>
          )}

          {confirming && (
            <div style={{ background: "rgba(231,64,44,.07)", border: "1px solid var(--c-vibra)", borderRadius: 12, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>
                Tem certeza que deseja cancelar o pedido <strong>#{order.id.slice(0, 8).toUpperCase()}</strong>? Essa ação não pode ser desfeita.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setConfirming(false)}
                  disabled={canceling}
                  style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid var(--line)", background: "transparent", cursor: "pointer", fontSize: 13, color: "var(--ink-2)", fontFamily: "inherit" }}
                >
                  Voltar
                </button>
                <button
                  onClick={handleCancel}
                  disabled={canceling}
                  style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: "var(--c-vibra)", cursor: canceling ? "not-allowed" : "pointer", fontSize: 13, color: "#fff", fontFamily: "inherit", opacity: canceling ? 0.6 : 1, fontWeight: 600 }}
                >
                  {canceling ? "Cancelando…" : "Sim, cancelar"}
                </button>
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1px solid var(--line)", background: "transparent", cursor: "pointer", fontSize: 14, color: "var(--ink-2)", fontFamily: "inherit" }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
