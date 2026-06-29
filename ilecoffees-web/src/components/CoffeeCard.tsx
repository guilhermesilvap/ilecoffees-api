import { useState } from "react";
import { Link } from "react-router-dom";

export interface Coffee {
  id: string;
  name: string;
  description: string | null;
  region: string | null;
  saleType: "KG" | "PACKAGE" | "BOTH";
  pricePerKg: number | null;
  packagePrice: number | null;
  packagePriceCoffeeshop: number | null;
  score: number | null;
  photoUrl: string | null;
  supplier?: { id: string; name: string; photoUrl: string | null; supplierType: string } | null;
}

export function getLine(score: number | null): "Raros" | "Extraordinários" | "Origens" {
  if (!score) return "Origens";
  if (score >= 88) return "Raros";
  if (score >= 87) return "Extraordinários";
  return "Origens";
}

const LINE_BG: Record<string, string> = {
  Raros: "var(--c-glamour)",
  Extraordinários: "var(--c-mostarda)",
  Origens: "var(--paper)",
};
const LINE_BG2: Record<string, string> = {
  Raros: "#142318",
  Extraordinários: "#b8701e",
  Origens: "var(--bg-2)",
};
const LINE_INK: Record<string, string> = {
  Raros: "var(--c-leveza)",
  Extraordinários: "var(--ink)",
  Origens: "var(--ink)",
};
const LINE_INK2: Record<string, string> = {
  Raros: "rgba(216,234,208,.55)",
  Extraordinários: "var(--ink-2)",
  Origens: "var(--ink-2)",
};
const LINE_ACCENT: Record<string, string> = {
  Raros: "var(--c-mostarda)",
  Extraordinários: "var(--c-vibra)",
  Origens: "var(--c-vibra)",
};
const LINE_BORDER: Record<string, string> = {
  Raros: "rgba(255,255,255,.07)",
  Extraordinários: "rgba(15,35,21,.15)",
  Origens: "var(--line)",
};

export function CoffeeCard({ c, onAdd, role, mob }: { c: Coffee; onAdd: (c: Coffee, qty: number) => void; role: "COFFEESHOP" | "CUSTOMER" | "VISITOR" | "ROASTER"; mob: boolean }) {
  const line = getLine(c.score);
  const lineBg   = LINE_BG[line];
  const lineBg2  = LINE_BG2[line];
  const lineInk  = LINE_INK[line];
  const lineInk2 = LINE_INK2[line];
  const lineAccent = LINE_ACCENT[line];
  const lineBorder = LINE_BORDER[line];

  const hasKg = c.saleType === "KG" || c.saleType === "BOTH";
  const hasPkg = c.saleType === "PACKAGE" || c.saleType === "BOTH";
  const showKg = hasKg && role !== "CUSTOMER";
  const pkgPrice = role === "COFFEESHOP" ? (c.packagePriceCoffeeshop ?? c.packagePrice) : c.packagePrice;
  const price = showKg && !hasPkg ? c.pricePerKg : hasPkg ? pkgPrice : c.pricePerKg;
  const unit = showKg && !hasPkg ? "/kg" : hasPkg ? "· pacote" : "/kg";

  const showComparison = role === "COFFEESHOP" && c.packagePriceCoffeeshop != null && c.packagePrice != null && c.packagePriceCoffeeshop !== c.packagePrice;
  const saving = showComparison && c.packagePrice! > c.packagePriceCoffeeshop!
    ? Math.round((1 - c.packagePriceCoffeeshop! / c.packagePrice!) * 100)
    : null;

  const useKgStepper = showKg && c.saleType === "KG";
  const [qty, setQty] = useState(1);
  const fmtQty = (v: number) => Number.isInteger(v) ? `${v} kg` : `${v.toLocaleString("pt-BR")} kg`;
  const totalKgPrice = useKgStepper && c.pricePerKg != null ? c.pricePerKg * qty : null;

  return (
    <article
      style={{
        borderRadius: 14, background: lineBg, border: `1px solid ${lineBorder}`,
        padding: mob ? 10 : 16, display: "flex", flexDirection: "column", gap: mob ? 8 : 14,
        color: lineInk,
        boxShadow: "0 16px 32px -28px rgba(28,8,16,.3)",
        transition: "transform .12s, box-shadow .12s",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 28px 48px -24px rgba(28,8,16,.4)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = "";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 16px 32px -28px rgba(28,8,16,.3)";
      }}
    >
      {/* Product image / bag mock */}
      <div style={{
        position: "relative", aspectRatio: mob ? "4 / 3" : "1 / 1.05", borderRadius: 10,
        background: lineBg2,
        overflow: "hidden", border: `1px solid ${lineBorder}`,
        padding: mob ? 10 : 18, display: "flex", flexDirection: "column", justifyContent: "space-between",
        transform: "translateZ(0)",
      }}>
        {c.photoUrl ? (
          <img
            src={c.photoUrl}
            alt={c.name}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span className="script" style={{ fontSize: mob ? 22 : 36, lineHeight: 0.8, color: lineAccent }}>íle</span>
              {!mob && (
                <span className="mono" style={{ fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: lineInk2 }}>
                  {c.saleType === "KG" ? "granel" : c.saleType === "PACKAGE" ? "250g" : "KG + Pacote"}
                </span>
              )}
            </div>
            <div>
              <div className="mono" style={{ fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color: lineAccent }}>
                {line}
              </div>
              <div className="serif" style={{ fontSize: mob ? 12 : 26, lineHeight: 0.95, letterSpacing: "-.015em", marginTop: 4, color: lineInk, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {c.name}
              </div>
            </div>
          </>
        )}
        {!mob && (
          <span className="mono" style={{
            position: "absolute", top: 10, right: 10,
            fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase",
            padding: "4px 8px", borderRadius: 999,
            background: "rgba(0,0,0,.35)", color: lineInk,
            backdropFilter: "blur(4px)",
          }}>
            {c.saleType === "KG" ? "Por kg" : c.saleType === "PACKAGE" ? "Pacote" : "KG + Pacote"}
          </span>
        )}
        {saving !== null && (
          <span className="mono" style={{
            position: "absolute", bottom: 10, left: 10,
            fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase",
            padding: "4px 8px", borderRadius: 999,
            background: "var(--c-vibra)", color: "#fff",
          }}>
            −{saving}% B2B
          </span>
        )}

        {/* Supplier badge */}
        {c.supplier && (
          <div style={{
            position: "absolute", top: 8, left: 8,
            display: "flex", alignItems: "center", gap: mob ? 0 : 6,
            background: "rgba(15,35,20,.72)", backdropFilter: "blur(6px)",
            borderRadius: 999, padding: mob ? "3px" : "4px 10px 4px 4px",
            border: "1px solid rgba(255,255,255,.12)",
          }}>
            <span style={{
              width: mob ? 18 : 22, height: mob ? 18 : 22, borderRadius: 999, flexShrink: 0,
              overflow: "hidden", background: "var(--c-mostarda)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 7, fontWeight: 700, color: "var(--ink)", letterSpacing: ".02em",
            }}>
              {c.supplier.photoUrl
                ? <img src={c.supplier.photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : c.supplier.name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()
              }
            </span>
            {!mob && (
              <span style={{ fontSize: 10, color: "rgba(255,255,255,.90)", fontWeight: 500, letterSpacing: ".01em", whiteSpace: "nowrap", maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis" }}>
                {c.supplier.name}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        <div className="serif" style={{ fontSize: mob ? 15 : 22, lineHeight: 1.1, letterSpacing: "-.01em", overflow: mob ? "hidden" : undefined, textOverflow: mob ? "ellipsis" : undefined, whiteSpace: mob ? "nowrap" : undefined }}>{c.name}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: mob ? 2 : 4 }}>
          <span style={{ fontSize: mob ? 11 : 13, color: lineInk2 }}>{c.region ?? "Brasil"}</span>
          {c.score && (
            <span className="mono" style={{
              fontSize: mob ? 9 : 11, letterSpacing: ".08em",
              padding: mob ? "2px 6px" : "3px 8px", borderRadius: 999,
              background: "rgba(0,0,0,.18)", color: lineAccent,
              whiteSpace: "nowrap", flexShrink: 0,
            }}>
              {c.score} pts
            </span>
          )}
        </div>
      </div>

      {!mob && c.description && (
        <p className="serif italic" style={{ margin: 0, fontSize: 14, lineHeight: 1.3, color: lineInk2 }}>
          {c.description}
        </p>
      )}

      {/* Preço + controles */}
      <div style={{ marginTop: "auto", paddingTop: 6, display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Linha de preço */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            {price != null ? (
              <>
                {showComparison && (
                  <div className="mono" style={{ fontSize: 11, color: lineInk2, textDecoration: "line-through", opacity: 0.65, marginBottom: 2 }}>
                    R$ {c.packagePrice!.toFixed(2).replace(".", ",")}
                  </div>
                )}
                <div className="serif" style={{ fontSize: mob ? 18 : 26, lineHeight: 1, letterSpacing: "-.01em" }}>
                  R$ {price.toFixed(2).replace(".", ",")}
                </div>
                <div className="mono" style={{ fontSize: 10, letterSpacing: ".12em", color: lineInk2, marginTop: 4, textTransform: "uppercase" }}>
                  {showComparison ? "· preço B2B" : unit}
                </div>
              </>
            ) : (
              <div style={{ fontSize: 14, color: lineInk2 }}>Consulte</div>
            )}
          </div>
          {/* Detalhes sempre visível aqui à direita */}
          <Link to={`/product/${c.id}`} style={{
            padding: mob ? "6px 10px" : "8px 12px", borderRadius: 999,
            border: `1px solid ${lineBorder}`,
            background: "rgba(0,0,0,.15)",
            fontSize: mob ? 11 : 12, color: lineInk, textDecoration: "none",
            flexShrink: 0,
          }}>
            {mob ? "Ver" : "Detalhes"}
          </Link>
        </div>

        {/* Stepper de kg — só para produtos vendidos por kg */}
        {useKgStepper ? (
          <div>
            <div className="mono" style={{ fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: lineInk2, marginBottom: 6 }}>
              Quantidade · mín. 0,5 kg · passo 0,5 kg
            </div>
            <div style={{ display: "flex", flexDirection: mob ? "column" : "row", gap: mob ? 8 : 6, alignItems: "center" }}>
              {/* Stepper */}
              <div style={{
                display: "flex", alignItems: "center",
                border: `1px solid ${lineBorder}`, borderRadius: 999,
                background: "rgba(0,0,0,.12)", overflow: "hidden", flexShrink: 0,
              }}>
                <button
                  type="button"
                  onClick={() => setQty(q => Math.max(0.5, Math.round((q - 0.5) * 10) / 10))}
                  style={{
                    width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                    background: "none", border: "none", cursor: qty <= 0.5 ? "not-allowed" : "pointer",
                    color: qty <= 0.5 ? lineInk2 : lineInk, fontSize: 16, fontWeight: 500,
                    opacity: qty <= 0.5 ? 0.4 : 1,
                  }}
                  disabled={qty <= 0.5}
                >
                  −
                </button>
                <span className="mono" style={{
                  minWidth: 48, textAlign: "center", fontSize: 12, letterSpacing: ".04em", color: lineInk,
                }}>
                  {fmtQty(qty)}
                </span>
                <button
                  type="button"
                  onClick={() => setQty(q => Math.round((q + 0.5) * 10) / 10)}
                  style={{
                    width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                    background: "none", border: "none", cursor: "pointer",
                    color: lineInk, fontSize: 16, fontWeight: 500,
                  }}
                >
                  +
                </button>
              </div>
              {/* Total dinâmico + botão adicionar */}
              <button
                type="button"
                onClick={() => onAdd(c, qty)}
                style={{
                  flex: 1, width: mob ? "100%" : undefined,
                  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "8px 12px", borderRadius: 999,
                  background: lineAccent, color: line === "Origens" ? "#fff" : "var(--c-barro)", fontSize: 12,
                  border: 0, cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
                }}
              >
                <span style={{ fontSize: 13, lineHeight: 1 }}>+</span>
                {totalKgPrice != null
                  ? `Adicionar · R$ ${totalKgPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : "Adicionar ao carrinho"}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onAdd(c, 1)}
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: mob ? "9px 10px" : "10px 14px", borderRadius: 999, width: "100%",
              background: lineAccent, color: line === "Origens" ? "#fff" : "var(--c-barro)", fontSize: mob ? 11 : 12,
              border: 0, cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
            }}
          >
            <span style={{ fontSize: mob ? 13 : 14, lineHeight: 1 }}>+</span>
            {mob ? "Adicionar" : "Adicionar ao carrinho"}
          </button>
        )}
      </div>
    </article>
  );
}
