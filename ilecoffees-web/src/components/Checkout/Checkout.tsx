import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY as string | undefined;

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    MercadoPago: new (key: string, opts?: { locale: string }) => {
      createCardToken: (data: {
        cardNumber: string;
        cardholderName: string;
        cardExpirationMonth: string;
        cardExpirationYear: string;
        securityCode: string;
      }) => Promise<{ id: string; payment_method_id: string; issuer_id: string }>;
    };
  }
}

function loadMpScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById("mp-js-sdk")) { resolve(); return; }
    const s = document.createElement("script");
    s.id = "mp-js-sdk";
    s.src = "https://sdk.mercadopago.com/js/v2";
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

function useIsMobile(bp = 768) {
  const [m, setM] = useState(() => typeof window !== "undefined" && window.innerWidth < bp);
  useEffect(() => {
    const h = () => setM(window.innerWidth < bp);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, [bp]);
  return m;
}

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const METHOD_MAP: Record<string, string> = { "credit-card": "CREDIT_CARD", pix: "PIX" };

function fmtCard(v: string) { return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim(); }
function fmtExpiry(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d;
}

interface ShippingGroup {
  supplierId: string;
  supplierName: string;
  options: { carrier: string; service: string; price: number; deadlineDays: number }[];
}
interface ShippingChoice { supplierId: string; carrier: string; shippingCost: number; deadlineDays: number; }
interface CardState { number: string; holder: string; expiry: string; cvv: string; installments: number; }
interface PixPayload { qrCode: string; copyPaste: string; expiresAt: string | Date; }

interface CheckoutProps { onClose: () => void; onBack: () => void; }
type Step = "shipping" | "payment" | "review" | "pix";
const STEPS: { id: Step; label: string; num: number }[] = [
  { id: "shipping", label: "Entrega", num: 1 },
  { id: "payment",  label: "Pagamento", num: 2 },
  { id: "review",   label: "Revisão", num: 3 },
];

/* ── SVG icons ── */
function ArrowLeft() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function CheckIcon() {
  return <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function SpinIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ animation: "spin 1s linear infinite", flexShrink: 0 }}>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="25 13" strokeLinecap="round"/>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </svg>
  );
}
function CopyIcon() {
  return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M3 10V3a1 1 0 011-1h7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;
}

/* ── Shared UI ── */
function Inp({ value, onChange, placeholder, maxLength, type = "text" }: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; maxLength?: number; type?: string;
}) {
  return (
    <input
      type={type} value={value} placeholder={placeholder} maxLength={maxLength}
      onChange={e => onChange(e.target.value)}
      style={{
        width: "100%", padding: "12px 14px", borderRadius: 10, fontSize: 15,
        border: "1px solid var(--line)", background: "var(--bg)",
        fontFamily: "inherit", color: "var(--ink)", outline: "none",
        boxSizing: "border-box",
      }}
      onFocus={e => { e.currentTarget.style.borderColor = "var(--ink)"; }}
      onBlur={e => { e.currentTarget.style.borderColor = "var(--line)"; }}
    />
  );
}
function Lbl({ children }: { children: React.ReactNode }) {
  return (
    <label className="mono" style={{ display: "block", fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 7 }}>
      {children}
    </label>
  );
}
function PrimaryBtn({ onClick, disabled, children, type = "button" }: { onClick?: () => void; disabled?: boolean; children: React.ReactNode; type?: "button" | "submit"; }) {
  return (
    <button
      type={type} onClick={onClick} disabled={disabled}
      style={{
        width: "100%", padding: "15px 24px", borderRadius: 12,
        background: disabled ? "var(--ink-3)" : "var(--ink)",
        color: "var(--c-leveza)", fontSize: 15, fontFamily: "inherit",
        border: "none", cursor: disabled ? "not-allowed" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        transition: "opacity .15s",
      }}
      onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLElement).style.opacity = ".88"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
    >
      {children}
    </button>
  );
}
function SecondaryBtn({ onClick, children }: { onClick?: () => void; children: React.ReactNode; }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", padding: "13px 24px", borderRadius: 12,
      background: "none", color: "var(--ink-2)", fontSize: 14,
      fontFamily: "inherit", border: "1px solid var(--line)", cursor: "pointer", marginTop: 10,
    }}>{children}</button>
  );
}

/* ── Step bar ── */
function StepBar({ step }: { step: Step }) {
  const idx = STEPS.findIndex(s => s.id === step);
  if (idx < 0) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 36 }}>
      {STEPS.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <div key={s.id} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 999,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: done ? "var(--success)" : active ? "var(--ink)" : "var(--bg-2)",
                color: done || active ? "var(--c-leveza)" : "var(--ink-2)",
                fontWeight: 600, fontSize: 13,
                border: active ? "2px solid var(--ink)" : "2px solid transparent",
                transition: "all .2s",
              }}>
                {done ? <CheckIcon /> : s.num}
              </div>
              <span className="mono" style={{
                fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase",
                color: active ? "var(--ink)" : done ? "var(--success)" : "var(--ink-2)",
              }}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ width: 60, height: 1, background: done ? "var(--success)" : "var(--line)", margin: "0 4px", marginBottom: 22, transition: "background .3s" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Payment option ── */
function PayOption({ value, selected, onSelect, label, sub, badge }: {
  value: string; selected: boolean; onSelect: (v: string) => void;
  label: string; sub?: string; badge?: string;
}) {
  return (
    <button type="button" onClick={() => onSelect(value)} style={{
      display: "flex", alignItems: "center", gap: 14, width: "100%",
      padding: "16px 18px", borderRadius: 12, textAlign: "left",
      border: `1.5px solid ${selected ? "var(--ink)" : "var(--line)"}`,
      background: selected ? "var(--bg)" : "var(--paper)",
      cursor: "pointer", fontFamily: "inherit", transition: "border-color .15s",
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: 999, flexShrink: 0,
        border: `2px solid ${selected ? "var(--ink)" : "var(--line)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "border-color .15s",
      }}>
        {selected && <div style={{ width: 10, height: 10, borderRadius: 999, background: "var(--ink)" }} />}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, color: "var(--ink)", fontWeight: 500 }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 2 }}>{sub}</div>}
      </div>
      {badge && (
        <span className="mono" style={{
          fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase",
          padding: "4px 10px", borderRadius: 999,
          background: value === "pix" ? "rgba(46,114,68,.14)" : "var(--bg-2)",
          color: value === "pix" ? "var(--success)" : "var(--ink-2)",
          border: `1px solid ${value === "pix" ? "var(--success)" : "var(--line)"}`,
        }}>{badge}</span>
      )}
    </button>
  );
}

/* ── Card form ── */
function CardForm({ card, onChange, grandTotal }: { card: CardState; onChange: (c: CardState) => void; grandTotal: number; }) {
  const set = (k: keyof CardState, v: string | number) => onChange({ ...card, [k]: v });
  return (
    <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ height: 1, background: "var(--line)" }} />
      <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)" }}>Dados do cartão</div>

      <div>
        <Lbl>Número do cartão</Lbl>
        <Inp
          value={card.number}
          onChange={v => set("number", fmtCard(v))}
          placeholder="0000 0000 0000 0000"
          maxLength={19}
        />
      </div>
      <div>
        <Lbl>Nome no cartão</Lbl>
        <Inp
          value={card.holder}
          onChange={v => set("holder", v.toUpperCase())}
          placeholder="COMO IMPRESSO NO CARTÃO"
        />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <Lbl>Validade (MM/AA)</Lbl>
          <Inp value={card.expiry} onChange={v => set("expiry", fmtExpiry(v))} placeholder="MM/AA" maxLength={5} />
        </div>
        <div>
          <Lbl>CVV</Lbl>
          <Inp value={card.cvv} onChange={v => set("cvv", v.replace(/\D/g, "").slice(0, 4))} placeholder="123" maxLength={4} />
        </div>
      </div>

      <div>
        <Lbl>Parcelas</Lbl>
        <select
          value={card.installments}
          onChange={e => set("installments", Number(e.target.value))}
          style={{
            width: "100%", padding: "12px 14px", borderRadius: 10, fontSize: 14,
            border: "1px solid var(--line)", background: "var(--bg)",
            fontFamily: "inherit", color: "var(--ink)", outline: "none",
            boxSizing: "border-box",
          }}
        >
          {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => {
            const parcela = grandTotal / n;
            const label = n === 1 ? `1× de ${fmt(grandTotal)} (sem juros)` : `${n}× de ${fmt(parcela)} (sem juros)`;
            return <option key={n} value={n}>{label}</option>;
          })}
        </select>
      </div>
    </div>
  );
}

/* ── PIX waiting screen ── */
function PixScreen({ pix, orderId, onClose, refresh, navigate }: {
  pix: PixPayload;
  orderId: string;
  onClose: () => void;
  refresh: () => Promise<void>;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const [copied, setCopied] = useState(false);
  const [expired, setExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => {
    return Math.max(0, Math.floor((new Date(pix.expiresAt).getTime() - Date.now()) / 1000));
  });
  const mob = useIsMobile();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown
  useEffect(() => {
    const tick = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(tick); setExpired(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  // Poll payment status
  useEffect(() => {
    if (expired) return;
    intervalRef.current = setInterval(async () => {
      try {
        const { data } = await api.get<{ status: string }>(`/payments/status/${orderId}`);
        if (data.status === "SUCCESS") {
          clearInterval(intervalRef.current!);
          await refresh();
          onClose();
          navigate("/purchase-success?type=product");
        } else if (data.status === "FAILED") {
          clearInterval(intervalRef.current!);
          setExpired(true);
        }
      } catch { /* ignore */ }
    }, 3000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [expired, orderId, onClose, navigate, refresh]);

  const copy = () => {
    navigator.clipboard.writeText(pix.copyPaste).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const secs = (timeLeft % 60).toString().padStart(2, "0");

  return (
    <div style={{ textAlign: "center", maxWidth: 480, margin: "0 auto", padding: mob ? "0 0 40px" : "0 0 60px" }}>
      {expired ? (
        <div style={{ padding: "32px 0" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⏰</div>
          <div className="serif" style={{ fontSize: 22, marginBottom: 8 }}>PIX expirado</div>
          <div style={{ fontSize: 14, color: "var(--ink-2)", marginBottom: 24 }}>O código PIX de 30 minutos expirou. Volte ao início e tente novamente.</div>
          <button
            onClick={onClose}
            style={{
              padding: "13px 28px", borderRadius: 12, background: "var(--ink)",
              color: "var(--c-leveza)", fontSize: 14, fontFamily: "inherit",
              border: "none", cursor: "pointer",
            }}
          >
            Voltar ao início
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 8 }}>
            <SpinIcon size={18} />
            <span style={{ fontSize: 15, color: "var(--ink-2)" }}>Aguardando pagamento…</span>
          </div>

          <div className="mono" style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 24 }}>
            Expira em <strong style={{ color: timeLeft < 120 ? "var(--c-vibra)" : "var(--ink)" }}>{mins}:{secs}</strong>
          </div>

          {pix.qrCode ? (
            <div style={{ display: "inline-block", padding: 16, background: "#fff", borderRadius: 16, border: "1px solid var(--line)", marginBottom: 24 }}>
              <img
                src={`data:image/png;base64,${pix.qrCode}`}
                alt="QR Code PIX"
                style={{ width: 220, height: 220, display: "block" }}
              />
            </div>
          ) : (
            <div style={{ padding: "20px", background: "var(--bg-2)", borderRadius: 12, marginBottom: 24, fontSize: 13, color: "var(--ink-2)" }}>
              Use o código abaixo para pagar
            </div>
          )}

          <div style={{ marginBottom: 12 }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 10 }}>
              Pix Copia e Cola
            </div>
            <div style={{
              background: "var(--bg)", borderRadius: 12, border: "1px solid var(--line)",
              padding: "14px 16px", fontSize: 11, color: "var(--ink-2)",
              fontFamily: "monospace", wordBreak: "break-all", textAlign: "left",
              maxHeight: 80, overflowY: "auto",
            }}>
              {pix.copyPaste}
            </div>
          </div>

          <button
            onClick={copy}
            style={{
              width: "100%", padding: "14px 24px", borderRadius: 12,
              background: copied ? "var(--success)" : "var(--ink)",
              color: "var(--c-leveza)", fontSize: 14, fontFamily: "inherit",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "background .3s",
            }}
          >
            {copied ? <><CheckIcon /> Copiado!</> : <><CopyIcon /> Copiar código PIX</>}
          </button>

          <div style={{ marginTop: 16, fontSize: 12, color: "var(--ink-2)" }}>
            Abra o app do seu banco, escolha PIX e cole o código ou escaneie o QR
          </div>
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Main Checkout component
══════════════════════════════════════════════════════════════ */
export function Checkout({ onClose, onBack }: CheckoutProps) {
  const navigate = useNavigate();
  const { items, total, refresh } = useCart();
  const { user, type: authType, supplierType } = useAuth();
  const isCoffeeshop = user?.accountType === "COFFEESHOP";
  const isRoaster = authType === "SUPPLIER" && supplierType === "ROASTER";
  const ordersEndpoint = isRoaster ? "/supplier/b2b/orders" : "/orders";
  const mob = useIsMobile();

  const [step, setStep] = useState<Step>("shipping");
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [card, setCard] = useState<CardState>({ number: "", holder: "", expiry: "", cvv: "", installments: 1 });
  const [cep, setCep] = useState("");
  const [shippingGroups, setShippingGroups] = useState<ShippingGroup[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<Record<string, ShippingChoice>>({});
  const [fetchingShipping, setFetchingShipping] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pixData, setPixData] = useState<PixPayload | null>(null);
  const [pixOrderId, setPixOrderId] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mpRef = useRef<any>(null);

  useEffect(() => {
    setStep("shipping");
    setError(null);
    setSelectedShipping({});
    setShippingGroups({} as unknown as ShippingGroup[]);
    setPixData(null);
    setPixOrderId(null);
    setCard({ number: "", holder: "", expiry: "", cvv: "", installments: 1 });
  }, []);

  const shippingTotal = Object.values(selectedShipping).reduce((a, s) => a + s.shippingCost, 0);
  const pixDiscount = paymentMethod === "pix" ? (total + shippingTotal) * 0.05 : 0;
  const grandTotal = total + shippingTotal - pixDiscount;

  const handleFetchShipping = async () => {
    const clean = cep.replace(/\D/g, "");
    if (clean.length < 8) return;
    setFetchingShipping(true);
    setError(null);
    try {
      const { data } = await api.get<ShippingGroup[]>("/shipping/estimate", { params: { cep: clean } });
      setShippingGroups(data);
    } catch {
      setError("Não foi possível calcular o frete. Você pode prosseguir sem selecionar.");
      setShippingGroups([]);
    } finally {
      setFetchingShipping(false);
    }
  };

  const selectShipping = (supplierId: string, opt: ShippingGroup["options"][0]) => {
    setSelectedShipping(prev => ({
      ...prev,
      [supplierId]: { supplierId, carrier: opt.service, shippingCost: opt.price, deadlineDays: opt.deadlineDays },
    }));
  };

  const tokenizeCard = useCallback(async (): Promise<{ id: string; payment_method_id: string; issuer_id: string }> => {
    if (!MP_PUBLIC_KEY) {
      return { id: "TEST_TOKEN", payment_method_id: "visa", issuer_id: "24" };
    }
    if (!mpRef.current) {
      await loadMpScript();
      mpRef.current = new window.MercadoPago(MP_PUBLIC_KEY, { locale: "pt-BR" });
    }
    const [expMonth, expYear] = card.expiry.split("/");
    return mpRef.current.createCardToken({
      cardNumber: card.number.replace(/\s/g, ""),
      cardholderName: card.holder,
      cardExpirationMonth: expMonth,
      cardExpirationYear: "20" + (expYear ?? ""),
      securityCode: card.cvv,
    });
  }, [card]);

  const validateCard = () => {
    if (!card.number || card.number.replace(/\s/g, "").length < 13) return "Número do cartão inválido";
    if (!card.holder.trim()) return "Nome no cartão obrigatório";
    if (!card.expiry || card.expiry.length < 5) return "Validade inválida";
    if (!card.cvv || card.cvv.length < 3) return "CVV inválido";
    return null;
  };

  const handleFinish = async () => {
    if (items.length === 0) return;

    // Validate card if credit-card
    if (paymentMethod === "credit-card") {
      const cardErr = validateCard();
      if (cardErr) { setError(cardErr); return; }
    }

    setSubmitting(true);
    setError(null);

    let cardToken: string | undefined;
    let paymentMethodId: string | undefined;
    let issuerId: string | undefined;

    if (paymentMethod === "credit-card") {
      try {
        const tokenResult = await tokenizeCard();
        cardToken = tokenResult.id;
        paymentMethodId = tokenResult.payment_method_id;
        issuerId = tokenResult.issuer_id;
      } catch (e) {
        const msg = (e as Error)?.message ?? "Erro ao processar cartão";
        setError(msg.includes("status") ? "Dados do cartão inválidos. Verifique e tente novamente." : msg);
        setSubmitting(false);
        return;
      }
    }

    let createdOrders: { id: string }[] = [];
    try {
      const choices = Object.values(selectedShipping);
      const { data: orders } = await api.post<{ id: string }[]>(ordersEndpoint, {
        deliveryCep: cep.replace(/\D/g, "") || undefined,
        shippingChoices: choices.length > 0 ? choices : undefined,
      });
      createdOrders = orders;

      if (paymentMethod === "pix") {
        // Create payment for first order (primary), get PIX QR
        const { data: firstResult } = await api.post<{ payment: { id: string }; pix?: PixPayload }>("/payments", {
          orderId: orders[0].id,
          method: "PIX",
        });

        // Create payments for additional orders silently
        if (orders.length > 1) {
          await Promise.allSettled(
            orders.slice(1).map(o => api.post("/payments", { orderId: o.id, method: "PIX" })),
          );
        }

        setPixData(firstResult.pix ?? null);
        setPixOrderId(orders[0].id);
        setStep("pix");
      } else {
        // Credit card: create all payments in parallel
        await Promise.all(orders.map(o => api.post("/payments", {
          orderId: o.id,
          method: METHOD_MAP[paymentMethod],
          cardToken,
          installments: card.installments,
          paymentMethodId,
          issuerId: issuerId ? String(issuerId) : undefined,
        })));
        await refresh();
        onClose();
        navigate("/purchase-success?type=product");
      }
    } catch (err) {
      if (createdOrders.length > 0) {
        await Promise.allSettled(createdOrders.map(o => api.patch(`/orders/${o.id}/cancel`)));
      }
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Erro ao finalizar pedido. Tente novamente.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)", overflowY: "auto",
    }}>
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }`}</style>

      {/* Top bar */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "rgba(238,243,235,.95)", backdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--line)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: mob ? "14px 16px" : "14px 32px", display: "flex", alignItems: "center", gap: 16 }}>
          <button
            onClick={step === "pix" ? onClose : onBack}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-2)", padding: 4, display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontFamily: "inherit" }}
          >
            <ArrowLeft /> {step === "pix" ? "Fechar" : "Voltar"}
          </button>
          <span style={{ width: 1, height: 18, background: "var(--line)" }} />
          <span className="serif" style={{ fontSize: 18, letterSpacing: "-.01em" }}>
            {step === "pix" ? "Pagar com PIX" : "Finalizar Compra"}
          </span>
        </div>
      </div>

      <div style={{ maxWidth: step === "pix" ? 560 : 1100, margin: "0 auto", padding: mob ? "24px 16px 60px" : "40px 32px 80px" }}>
        {/* ── PIX WAITING SCREEN ── */}
        {step === "pix" && pixData && pixOrderId && (
          <PixScreen pix={pixData} orderId={pixOrderId} onClose={onClose} refresh={refresh} navigate={navigate} />
        )}

        {/* ── 3-STEP FLOW ── */}
        {step !== "pix" && (
          <>
            <StepBar step={step} />
            <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 360px", gap: 32, alignItems: "start" }}>

              {/* Main column */}
              <div>
                {/* ── STEP 1: ENTREGA ── */}
                {step === "shipping" && (
                  <div style={{ background: "var(--paper)", borderRadius: 18, border: "1px solid var(--line)", padding: mob ? "20px 18px" : "28px 32px" }}>
                    <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 6 }}>Passo 1</div>
                    <h2 className="serif" style={{ margin: "0 0 24px", fontSize: 28, letterSpacing: "-.01em" }}>Endereço de entrega</h2>

                    <Lbl>CEP</Lbl>
                    <div style={{ display: "flex", gap: 10, marginBottom: 6 }}>
                      <div style={{ flex: 1 }}>
                        <Inp value={cep} onChange={setCep} placeholder="00000-000" maxLength={9} />
                      </div>
                      <button
                        onClick={handleFetchShipping}
                        disabled={fetchingShipping || cep.replace(/\D/g, "").length < 8}
                        style={{
                          padding: "12px 18px", borderRadius: 10, fontSize: 14,
                          border: "1px solid var(--line)", background: "var(--bg)",
                          color: "var(--ink)", cursor: "pointer", fontFamily: "inherit",
                          display: "flex", alignItems: "center", gap: 8,
                          opacity: cep.replace(/\D/g, "").length < 8 ? 0.5 : 1,
                        }}
                      >
                        {fetchingShipping ? <><SpinIcon /> Calculando…</> : "Calcular frete"}
                      </button>
                    </div>

                    {error && <div style={{ fontSize: 13, color: "var(--c-vibra)", marginTop: 8, marginBottom: 8 }}>{error}</div>}

                    {Array.isArray(shippingGroups) && shippingGroups.length > 0 && (
                      <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                        <div className="mono" style={{ fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--ink-2)" }}>Opções de frete</div>
                        {shippingGroups.map(group => (
                          <div key={group.supplierId}>
                            <div style={{ fontSize: 12, color: "var(--ink-2)", marginBottom: 8 }}>{group.supplierName}</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {group.options.map(opt => {
                                const sel = selectedShipping[group.supplierId]?.carrier === opt.service;
                                return (
                                  <button key={`${opt.carrier}-${opt.service}`} type="button" onClick={() => selectShipping(group.supplierId, opt)} style={{
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                    padding: "12px 16px", borderRadius: 10, textAlign: "left",
                                    border: `1.5px solid ${sel ? "var(--ink)" : "var(--line)"}`,
                                    background: sel ? "var(--bg)" : "var(--paper)",
                                    cursor: "pointer", fontFamily: "inherit",
                                  }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                      <div style={{ width: 16, height: 16, borderRadius: 999, border: `2px solid ${sel ? "var(--ink)" : "var(--line)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        {sel && <div style={{ width: 8, height: 8, borderRadius: 999, background: "var(--ink)" }} />}
                                      </div>
                                      <div style={{ display: "flex", flexDirection: "column", gap: 2, textAlign: "left" }}>
                                        <span style={{ fontSize: 14, color: "var(--ink)", fontWeight: 500 }}>{opt.service}</span>
                                        <span style={{ fontSize: 11, color: "var(--ink-2)" }}>{opt.carrier}</span>
                                      </div>
                                    </div>
                                    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                                      <span style={{ fontSize: 12, color: "var(--ink-2)" }}>{opt.deadlineDays === 1 ? "1 dia útil" : `${opt.deadlineDays} dias úteis`}</span>
                                      <span className="serif" style={{ fontSize: 15, letterSpacing: "-.01em" }}>{fmt(opt.price)}</span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ marginTop: 28 }}>
                      <PrimaryBtn onClick={() => {
                        if (cep.replace(/\D/g, "").length < 8) {
                          setError("Informe um CEP válido para continuar.");
                          return;
                        }
                        setError(null);
                        setStep("payment");
                      }}>Continuar para Pagamento →</PrimaryBtn>
                    </div>
                  </div>
                )}

                {/* ── STEP 2: PAGAMENTO ── */}
                {step === "payment" && (
                  <div style={{ background: "var(--paper)", borderRadius: 18, border: "1px solid var(--line)", padding: mob ? "20px 18px" : "28px 32px" }}>
                    <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 6 }}>Passo 2</div>
                    <h2 className="serif" style={{ margin: "0 0 24px", fontSize: 28, letterSpacing: "-.01em" }}>Forma de pagamento</h2>

                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <PayOption
                        value="credit-card" selected={paymentMethod === "credit-card"} onSelect={setPaymentMethod}
                        label="Cartão de Crédito" sub="Aprovação imediata"
                      />
                      <PayOption
                        value="pix" selected={paymentMethod === "pix"} onSelect={setPaymentMethod}
                        label="PIX" sub="Aprovação imediata • desconto exclusivo" badge="5% off"
                      />
                    </div>

                    {paymentMethod === "credit-card" && (
                      <CardForm card={card} onChange={setCard} grandTotal={grandTotal} />
                    )}

                    {paymentMethod === "pix" && (
                      <div style={{ marginTop: 20, padding: "16px 18px", background: "rgba(46,114,68,.08)", borderRadius: 12, border: "1px solid var(--success)", fontSize: 13, color: "var(--ink-2)" }}>
                        Após confirmar, você receberá um QR Code PIX para pagar em qualquer banco. O pedido é confirmado automaticamente após o pagamento.
                      </div>
                    )}

                    <div style={{ marginTop: 28 }}>
                      <PrimaryBtn onClick={() => { setError(null); setStep("review"); }}>Revisar Pedido →</PrimaryBtn>
                      <SecondaryBtn onClick={() => setStep("shipping")}>← Voltar à Entrega</SecondaryBtn>
                    </div>
                  </div>
                )}

                {/* ── STEP 3: REVISÃO ── */}
                {step === "review" && (
                  <div style={{ background: "var(--paper)", borderRadius: 18, border: "1px solid var(--line)", padding: mob ? "20px 18px" : "28px 32px" }}>
                    <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 6 }}>Passo 3</div>
                    <h2 className="serif" style={{ margin: "0 0 24px", fontSize: 28, letterSpacing: "-.01em" }}>Revisar pedido</h2>

                    {/* Items */}
                    <div style={{ marginBottom: 20 }}>
                      <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 10 }}>Itens</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {items.map(item => {
                          const price = (item.coffee.saleType === "KG"
                          ? (item.coffee.pricePerKg ?? 0)
                          : (isCoffeeshop && item.coffee.packagePriceCoffeeshop != null
                              ? item.coffee.packagePriceCoffeeshop
                              : (item.coffee.packagePrice ?? 0))
                        ) * item.quantity;
                          return (
                            <div key={item.coffeeId} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "var(--bg)", borderRadius: 10, fontSize: 14 }}>
                              <span style={{ color: "var(--ink-2)" }}>{item.coffee.name} <span className="mono" style={{ fontSize: 11 }}>×{item.quantity}</span></span>
                              <span className="serif" style={{ fontSize: 16 }}>{fmt(price)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Payment summary */}
                    <div style={{ marginBottom: 20 }}>
                      <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 10 }}>Pagamento</div>
                      <div style={{ padding: "12px 14px", background: "var(--bg)", borderRadius: 10, fontSize: 14, color: "var(--ink-2)" }}>
                        {paymentMethod === "credit-card" && (
                          <span>
                            Cartão {card.number.replace(/\D/g, "").slice(-4).padStart(card.number.length > 3 ? 4 : 0, "•")}
                            {card.installments > 1 && <> — {card.installments}× de {fmt(grandTotal / card.installments)}</>}
                          </span>
                        )}
                        {paymentMethod === "pix" && "PIX — 5% de desconto aplicado"}
                      </div>
                    </div>

                    {/* Shipping summary */}
                    {Object.values(selectedShipping).length > 0 && (
                      <div style={{ marginBottom: 20 }}>
                        <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 10 }}>Entrega</div>
                        {Object.values(selectedShipping).map(s => (
                          <div key={s.supplierId} style={{ padding: "10px 14px", background: "var(--bg)", borderRadius: 10, fontSize: 14, display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "var(--ink-2)" }}>{s.carrier} — {s.deadlineDays} dias úteis</span>
                            <span className="serif" style={{ fontSize: 16 }}>{fmt(s.shippingCost)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {error && (
                      <div style={{ fontSize: 13, color: "var(--c-vibra)", marginBottom: 12, padding: "10px 14px", background: "rgba(231,64,44,.08)", borderRadius: 10 }}>
                        {error}
                      </div>
                    )}

                    <div style={{ marginTop: 28 }}>
                      <PrimaryBtn onClick={handleFinish} disabled={submitting}>
                        {submitting ? <><SpinIcon /> Processando…</> : (
                          paymentMethod === "pix" ? "Gerar QR Code PIX" : "Confirmar Pedido"
                        )}
                      </PrimaryBtn>
                      <SecondaryBtn onClick={() => setStep("payment")}>← Voltar ao Pagamento</SecondaryBtn>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar: order summary */}
              <div style={{ position: mob ? "static" : "sticky", top: 88 }}>
                <div style={{ background: "var(--paper)", borderRadius: 18, border: "1px solid var(--line)", padding: mob ? "18px 18px" : "24px 28px" }}>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 16 }}>Resumo do pedido</div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                    {items.map(item => {
                      const price = (item.coffee.saleType === "KG"
                          ? (item.coffee.pricePerKg ?? 0)
                          : (isCoffeeshop && item.coffee.packagePriceCoffeeshop != null
                              ? item.coffee.packagePriceCoffeeshop
                              : (item.coffee.packagePrice ?? 0))
                        ) * item.quantity;
                      return (
                        <div key={item.coffeeId} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                          <span style={{ color: "var(--ink-2)" }}>{item.coffee.name} ×{item.quantity}</span>
                          <span>{fmt(price)}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ height: 1, background: "var(--line)", marginBottom: 14 }} />

                  <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--ink-2)" }}>Subtotal</span><span>{fmt(total)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--ink-2)" }}>Frete</span>
                      <span style={{ color: shippingTotal === 0 ? "var(--ink-2)" : "var(--ink)" }}>
                        {shippingTotal > 0 ? fmt(shippingTotal) : "A calcular"}
                      </span>
                    </div>
                    {pixDiscount > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", color: "var(--success)" }}>
                        <span>Desconto PIX (5%)</span><span>-{fmt(pixDiscount)}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ height: 1, background: "var(--line)", margin: "16px 0" }} />

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span className="mono" style={{ fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--ink-2)" }}>Total</span>
                    <span className="serif" style={{ fontSize: 26, letterSpacing: "-.02em" }}>{fmt(grandTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
