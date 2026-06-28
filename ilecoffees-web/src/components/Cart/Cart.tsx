import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useCart } from "@/contexts/CartContext";
import { api } from "@/lib/api";

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function XIcon({ size = 12 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 12 12" fill="none"><path d="M1.5 1.5l9 9M10.5 1.5l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
function MinusIcon() {
  return <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
function PlusIcon() {
  return <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
function TrashIcon() {
  return <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V4M6 7v4M8 7v4M3 4l.7 7.3a.7.7 0 00.7.7h5.2a.7.7 0 00.7-.7L11 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>;
}
function BagIcon({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 20 20" fill="none"><path d="M3 7h14l-1.5 9a1 1 0 01-1 .9H5.5a1 1 0 01-1-.9L3 7z" stroke="currentColor" strokeWidth="1.3"/><path d="M7 7V5.5a3 3 0 016 0V7" stroke="currentColor" strokeWidth="1.3"/></svg>;
}

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export function Cart({ isOpen, onClose, onCheckout }: CartProps) {
  const { items, count, total, refresh, removeItem } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) refresh();
  }, [isOpen, refresh]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) onClose();
    }
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKey);
      // small delay so the open-click doesn't immediately close
      const t = setTimeout(() => document.addEventListener("mousedown", handleClickOutside), 100);
      return () => {
        document.removeEventListener("keydown", handleKey);
        clearTimeout(t);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  const handleUpdateQty = async (coffeeId: string, currentQty: number, delta: number) => {
    const next = Math.round((currentQty + delta) * 10) / 10;
    if (next <= 0) { await removeItem(coffeeId); return; }
    try {
      await api.post("/cart/items", { coffeeId, quantity: next });
      await refresh();
    } catch { /* ignore */ }
  };

  const getItemPrice = (coffeeId: string) => {
    const item = items.find(i => i.coffeeId === coffeeId);
    if (!item) return 0;
    const c = item.coffee;
    return (c.saleType === "KG" ? (c.pricePerKg ?? 0) : (c.packagePrice ?? 0)) * item.quantity;
  };

  if (!isOpen) return null;

  return createPortal((
    <>
      <style>{`
        @keyframes cartSlideIn {
          from { opacity: 0; transform: translateY(-8px) scale(.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* Subtle backdrop — just dims slightly, doesn't cover fully */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 9988,
          background: "rgba(28,8,16,.12)",
        }}
      />

      {/* Panel — anchored top-right, below header */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Carrinho"
        style={{
          position: "fixed",
          top: 76,
          right: 24,
          zIndex: 9989,
          width: "min(420px, calc(100vw - 32px))",
          maxHeight: "calc(100vh - 100px)",
          background: "var(--paper)",
          borderRadius: 18,
          border: "1px solid var(--line)",
          boxShadow: "0 20px 60px -12px rgba(28,8,16,.28), 0 0 0 1px rgba(28,8,16,.04)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "cartSlideIn .18s cubic-bezier(.2,.8,.4,1)",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "16px 20px 14px",
          borderBottom: "1px solid var(--line)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <BagIcon size={18} />
            <span className="serif" style={{ fontSize: 19, letterSpacing: "-.015em" }}>Carrinho</span>
            {count > 0 && (
              <span className="mono" style={{
                fontSize: 9, letterSpacing: ".12em",
                padding: "3px 9px", borderRadius: 999,
                background: "var(--c-vibra)", color: "#fff",
              }}>
                {count} {count === 1 ? "item" : "itens"}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: 999,
              border: "1px solid var(--line)", background: "transparent",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--ink-2)", transition: "background .1s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            aria-label="Fechar carrinho"
          >
            <XIcon size={10} />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
          {items.length === 0 ? (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              padding: "36px 20px", textAlign: "center", gap: 10,
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 999,
                background: "var(--bg)", border: "1px solid var(--line)",
                display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-3)",
              }}>
                <BagIcon size={22} />
              </div>
              <div className="serif" style={{ fontSize: 20, letterSpacing: "-.01em" }}>Carrinho vazio</div>
              <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5, maxWidth: 220 }}>
                Adicione cafés do catálogo para começar.
              </p>
              <button
                onClick={onClose}
                style={{
                  marginTop: 4, padding: "10px 20px", borderRadius: 999,
                  background: "var(--ink)", color: "var(--c-leveza)",
                  fontSize: 12, border: "none", cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Explorar cafés
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {items.map(item => {
                const c = item.coffee;
                const unitPrice = c.saleType === "KG" ? (c.pricePerKg ?? 0) : (c.packagePrice ?? 0);
                const unitLabel = c.saleType === "KG"
                  ? `${fmt(unitPrice)}/kg`
                  : c.packageWeight
                    ? `${(c.packageWeight * 1000).toFixed(0)}g`
                    : "Pacote";
                const isKg = c.saleType === "KG";
                const step = isKg ? 0.5 : 1;
                const qtyLabel = isKg
                  ? (Number.isInteger(item.quantity) ? `${item.quantity} kg` : `${item.quantity.toLocaleString("pt-BR")} kg`)
                  : String(item.quantity);
                return (
                  <div key={item.coffeeId} style={{
                    display: "flex", gap: 10, alignItems: "center",
                    padding: "10px 12px", borderRadius: 12,
                    border: "1px solid var(--line)", background: "var(--bg)",
                  }}>
                    {/* Photo */}
                    <div style={{
                      width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                      background: "var(--bg-2)", overflow: "hidden",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: "1px solid var(--line)",
                    }}>
                      {c.photoUrl
                        ? <img src={c.photoUrl} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <span style={{ fontSize: 16 }}>☕</span>
                      }
                    </div>

                    {/* Name + label */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                      <div className="mono" style={{ fontSize: 9, letterSpacing: ".1em", color: "var(--ink-3)", marginTop: 2, textTransform: "uppercase" }}>{unitLabel}</div>
                    </div>

                    {/* Qty controls */}
                    <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--line)", borderRadius: 999, overflow: "hidden", flexShrink: 0 }}>
                      <button onClick={() => handleUpdateQty(item.coffeeId, item.quantity, -step)}
                        style={{ width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", color: "var(--ink-2)" }}>
                        <MinusIcon />
                      </button>
                      <span className="mono" style={{ fontSize: 11, minWidth: 36, textAlign: "center", color: "var(--ink)", padding: "0 2px" }}>{qtyLabel}</span>
                      <button onClick={() => handleUpdateQty(item.coffeeId, item.quantity, +step)}
                        style={{ width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", color: "var(--ink-2)" }}>
                        <PlusIcon />
                      </button>
                    </div>

                    {/* Price */}
                    <span className="serif" style={{ fontSize: 15, letterSpacing: "-.01em", flexShrink: 0, minWidth: 60, textAlign: "right" }}>{fmt(getItemPrice(item.coffeeId))}</span>

                    {/* Remove */}
                    <button onClick={() => removeItem(item.coffeeId)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-3)", padding: 3, flexShrink: 0, borderRadius: 4, transition: "color .1s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--c-vibra)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--ink-3)"; }}
                      title="Remover"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{
            padding: "12px 16px 16px",
            borderTop: "1px solid var(--line)",
            flexShrink: 0,
            background: "var(--bg)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
              <span className="mono" style={{ fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)" }}>Total</span>
              <span className="serif" style={{ fontSize: 24, letterSpacing: "-.02em" }}>{fmt(total)}</span>
            </div>
            <button
              onClick={onCheckout}
              style={{
                width: "100%", padding: "12px 20px", borderRadius: 10,
                background: "var(--c-glamour)", color: "var(--c-leveza)",
                fontSize: 13, fontFamily: "inherit", border: "none", cursor: "pointer",
                fontWeight: 500, letterSpacing: ".01em", transition: "opacity .15s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = ".85"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
            >
              Finalizar compra →
            </button>
            <button
              onClick={onClose}
              style={{
                width: "100%", marginTop: 6, padding: "10px 20px", borderRadius: 10,
                background: "none", color: "var(--ink-2)",
                fontSize: 12, fontFamily: "inherit",
                border: "1px solid var(--line)", cursor: "pointer",
              }}
            >
              Continuar comprando
            </button>
          </div>
        )}
      </div>
    </>
  ), document.body);
}
