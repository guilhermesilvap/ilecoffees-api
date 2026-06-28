import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Cart } from "./Cart";

function BagIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
      <path d="M3 7h14l-1.5 9a1 1 0 01-1 .9H5.5a1 1 0 01-1-.9L3 7z" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M7 7V5.5a3 3 0 016 0V7" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  );
}

export function CartButton() {
  const navigate = useNavigate();
  const { count, refresh, isCartOpen, openCart, closeCart } = useCart();

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <>
      <button
        onClick={openCart}
        style={{
          position: "relative",
          display: "inline-flex", alignItems: "center", gap: 7,
          padding: "8px 14px", borderRadius: 999,
          border: "1px solid var(--line)", background: "var(--paper)",
          color: "var(--ink)", cursor: "pointer", fontFamily: "inherit",
          fontSize: 14, transition: "border-color .15s, background .15s",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--ink)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--line)"; }}
        aria-label={`Carrinho — ${count} ${count === 1 ? "item" : "itens"}`}
      >
        <BagIcon />
        {count > 0 && (
          <span className="mono" style={{
            fontSize: 10, letterSpacing: ".1em",
            padding: "2px 7px", borderRadius: 999,
            background: "var(--c-vibra)", color: "#fff",
            lineHeight: 1.4,
          }}>
            {count}
          </span>
        )}
        {count === 0 && (
          <span style={{ fontSize: 13, color: "var(--ink-2)" }}>Carrinho</span>
        )}
      </button>

      <Cart
        isOpen={isCartOpen}
        onClose={closeCart}
        onCheckout={() => { closeCart(); navigate("/checkout"); }}
      />
    </>
  );
}
