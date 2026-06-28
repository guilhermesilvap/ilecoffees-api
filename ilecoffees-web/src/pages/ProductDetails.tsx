import { useEffect, useState, useMemo, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { CartButton } from "@/components/Cart/CartButton";

interface CoffeeProduct {
  id: string;
  name: string;
  description: string | null;
  variety: string | null;
  process: string | null;
  region: string | null;
  altitude: number | null;
  farm: string | null;
  saleType: "KG" | "PACKAGE" | "BOTH";
  pricePerKg: number | null;
  packagePrice: number | null;
  packagePriceCoffeeshop: number | null;
  packageWeight: number | null;
  score: number | null;
  photoUrl: string | null;
  roast: string | null;
  sensory: string | null;
}

interface FreightOption { name: string; days: string; price: number; note?: string; }

function getLine(score: number | null): string {
  if (!score) return "Origens";
  if (score >= 88) return "Raros";
  if (score >= 87) return "Extraordinários";
  return "Origens";
}

/* ===== Icons ===== */
function ArrowIcon({ size = 14, dir = "right" }: { size?: number; dir?: "left" | "right" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" style={{ transform: dir === "left" ? "rotate(180deg)" : undefined }}>
      <path d="M2.5 7h9M7.8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CartIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M2 3h2l1.6 8.4a1 1 0 001 .8h5.6a1 1 0 001-.78L14.6 6.5H4.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="6.5" cy="14" r="1" fill="currentColor" />
      <circle cx="11.5" cy="14" r="1" fill="currentColor" />
    </svg>
  );
}
function StarIcon({ filled, size = 14 }: { filled: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path d="M7 1.5l1.7 3.5 3.8.5-2.8 2.7.7 3.8L7 10.2l-3.4 1.8.7-3.8L1.5 5.5l3.8-.5z"
        fill={filled ? "var(--c-mostarda)" : "transparent"}
        stroke={filled ? "var(--c-mostarda)" : "var(--ink-3)"}
        strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}
function CheckIcon({ size = 12, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path d="M3 7.5L6 10.5L11 4.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function XIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/* ===== Logo ===== */
function Logo() {
  return (
    <Link to="/" style={{ display: "inline-flex", alignItems: "baseline", gap: 6 }}>
      <span className="script" style={{ fontSize: 36, lineHeight: 0.75, color: "currentColor" }}>íle</span>
      <span className="serif italic" style={{ fontSize: 13, lineHeight: 1, color: "var(--c-vibra)" }}>coffees</span>
    </Link>
  );
}

/* ===== Header ===== */
function UserMenu() {
  const { user, type, supplierType, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const firstName = user?.name?.split(" ")[0] ?? "Usuário";
  const lastName  = user?.name?.split(" ")[1] ?? "";
  const initials  = (firstName[0] ?? "") + (lastName[0] ?? "");

  const accountType = (user as any)?.accountType ?? "CUSTOMER";
  const roleLabel =
    type === "SUPPLIER" ? (supplierType === "PRODUCER" ? "PRODUTOR" : "TORREFADOR")
    : type === "ADMIN"  ? "ADMIN"
    : accountType === "COFFEESHOP" ? "CAFETERIA"
    : "CLIENTE";

  const dashboardPath =
    type === "SUPPLIER" ? (supplierType === "PRODUCER" ? "/dashboard/producer" : "/dashboard/supplier")
    : type === "ADMIN"  ? "/dashboard/admin"
    : accountType === "COFFEESHOP" ? "/dashboard/coffeeshop"
    : "/dashboard/customer";

  useEffect(() => {
    function onOut(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onOut);
    return () => document.removeEventListener("mousedown", onOut);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          padding: "6px 14px 6px 6px", borderRadius: 999,
          border: "1px solid var(--line)", background: "var(--paper)",
          cursor: "pointer", fontFamily: "inherit",
        }}
      >
        <span style={{
          width: 34, height: 34, borderRadius: 999,
          background: "var(--c-vibra)", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 700, flexShrink: 0,
        }}>
          {initials.toUpperCase() || "?"}
        </span>
        <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 }}>
          <span style={{ fontSize: 14, color: "var(--ink)", fontWeight: 500, lineHeight: 1 }}>{firstName}</span>
          <span className="mono" style={{ fontSize: 9, letterSpacing: ".12em", color: "var(--c-vibra)", lineHeight: 1 }}>{roleLabel}</span>
        </span>
        <svg width={12} height={12} viewBox="0 0 12 12" fill="none" style={{ color: "var(--ink-2)", transform: open ? "rotate(180deg)" : undefined, transition: "transform .15s" }}>
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          background: "var(--paper)", border: "1px solid var(--line)",
          borderRadius: 12, padding: "6px", minWidth: 160,
          boxShadow: "0 8px 24px rgba(0,0,0,.08)", zIndex: 50,
        }}>
          <Link
            to={dashboardPath}
            onClick={() => setOpen(false)}
            style={{ display: "block", padding: "10px 14px", borderRadius: 8, fontSize: 14, color: "var(--ink)", textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--bg)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            Meu painel
          </Link>
          <div style={{ height: 1, background: "var(--line)", margin: "4px 0" }} />
          <button
            type="button"
            onClick={() => { setOpen(false); logout(); }}
            style={{
              display: "block", width: "100%", padding: "10px 14px", borderRadius: 8,
              fontSize: 14, color: "var(--ink-2)", background: "none", border: "none",
              cursor: "pointer", fontFamily: "inherit", textAlign: "left",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--bg)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            Sair
          </button>
        </div>
      )}
    </div>
  );
}

function Header() {
  const { isAuthenticated } = useAuth();

  return (
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
          <Logo />
          <span style={{ width: 1, height: 22, background: "var(--ink)", opacity: 0.2 }} />
          <Link to="/explore" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", textDecoration: "none", fontFamily: "inherit" }} className="mono">
            ← Catálogo
          </Link>
        </div>

        <div />

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <Link to="/login" style={{ padding: "9px 16px", fontSize: 14, color: "var(--ink-2)" }}>Entrar</Link>
          )}
          <CartButton />
        </div>
      </div>
    </header>
  );
}

/* ===== Gallery ===== */
function Gallery({ coffee }: { coffee: CoffeeProduct }) {
  const line = getLine(coffee.score);
  const lineBg = line === "Raros" ? "var(--c-glamour)" : line === "Extraordinários" ? "var(--c-barro)" : "var(--c-leveza)";
  const lineInk = line === "Origens" ? "var(--ink)" : "var(--c-leveza)";
  const mostraAcc = line === "Origens" ? "var(--ink)" : "var(--c-mostarda)";

  if (coffee.photoUrl) {
    return (
      <div style={{ borderRadius: 18, overflow: "hidden", border: "1.5px solid var(--ink)", boxShadow: "0 32px 64px -30px rgba(28,8,16,.4)", aspectRatio: "1 / 1.08" }}>
        <img src={coffee.photoUrl} alt={coffee.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>
    );
  }

  return (
    <div style={{
      aspectRatio: "1 / 1.08", borderRadius: 18, overflow: "hidden",
      background: lineBg, color: lineInk,
      border: "1.5px solid var(--ink)", position: "relative",
      padding: "32px 30px",
      boxShadow: "0 32px 64px -30px rgba(28,8,16,.4)",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span className="script" style={{ fontSize: 88, lineHeight: 0.7 }}>íle</span>
        <span className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", opacity: 0.65 }}>
          {coffee.packageWeight ? `${coffee.packageWeight}g` : "250g"} · grãos
        </span>
      </div>
      <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", opacity: 0.65, marginTop: 28 }}>
        Linha {line}
      </div>
      <div className="serif" style={{ fontSize: 56, lineHeight: 0.92, letterSpacing: "-.02em", marginTop: 12 }}>
        {coffee.name.split(" ").map((w, i, arr) =>
          i === arr.length - 1
            ? <span key={i} className="italic" style={{ color: mostraAcc }}>{w}</span>
            : <span key={i}>{w} </span>
        )}
      </div>
      {coffee.description && (
        <div className="serif italic" style={{ fontSize: 17, marginTop: 18, opacity: 0.9, lineHeight: 1.3 }}>
          {coffee.description.split("·").slice(0, 3).join("·")}
        </div>
      )}
      <div style={{ marginTop: "auto", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          {coffee.score && (
            <>
              <div className="mono" style={{ fontSize: 9, letterSpacing: ".14em", opacity: 0.65, textTransform: "uppercase" }}>SCA</div>
              <div className="serif" style={{ fontSize: 36, lineHeight: 1, color: mostraAcc }}>{coffee.score} pts</div>
            </>
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="mono" style={{ fontSize: 9, letterSpacing: ".14em", opacity: 0.65, textTransform: "uppercase" }}>Safra</div>
          <div className="mono" style={{ fontSize: 16, marginTop: 4 }}>2026</div>
        </div>
      </div>
    </div>
  );
}

/* ===== Specs ===== */
function Specs({ coffee }: { coffee: CoffeeProduct }) {
  const rows: [string, string][] = [
    ["Região", coffee.region ?? "—"],
    ["Variedade", coffee.variety ?? "—"],
    ["Processo", coffee.process ?? "—"],
    ["Torra", coffee.roast ?? "—"],
    ["Altitude", coffee.altitude ? `${coffee.altitude} m` : "—"],
    ["Peso", coffee.packageWeight ? `${coffee.packageWeight} g` : "250 g"],
  ];
  return (
    <div style={{ marginTop: 32, border: "1px solid var(--ink)", borderRadius: 16, overflow: "hidden", background: "var(--paper)" }}>
      <div className="mono" style={{
        padding: "12px 18px", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase",
        color: "var(--ink-2)", borderBottom: "1px solid var(--line)", background: "var(--bg-2)",
      }}>
        Ficha técnica · safra 2026
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        {rows.map(([k, v], i) => (
          <div key={k} style={{
            padding: "18px 20px",
            borderRight: (i % 2 !== 1) ? "1px solid var(--line)" : undefined,
            borderTop: i >= 2 ? "1px solid var(--line)" : undefined,
          }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)" }}>{k}</div>
            <div className="serif" style={{ fontSize: 20, lineHeight: 1.2, marginTop: 6 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== Tasting notes ===== */
function TastingNotes({ coffee }: { coffee: CoffeeProduct }) {
  const source = coffee.sensory ?? coffee.description;
  const notes = source
    ? source.split(/[·\-,]/).map(n => n.trim()).filter(Boolean).slice(0, 5)
    : ["Caramelo", "Chocolate", "Frutas"];

  const profiles: [string, number][] = [
    ["Doçura", coffee.score ? Math.min(100, coffee.score - 5) : 75],
    ["Acidez", 60],
    ["Corpo", 80],
    ["Aroma", coffee.score ? Math.min(100, coffee.score - 3) : 78],
  ];
  return (
    <section style={{ marginTop: 56 }}>
      <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)" }}>
        <span style={{ color: "var(--c-vibra)" }}>§</span> &nbsp; Notas sensoriais
      </div>
      <h2 className="serif" style={{ margin: "14px 0 24px", fontSize: "clamp(36px, 4vw, 56px)", lineHeight: 1, letterSpacing: "-.015em" }}>
        O que você vai <span className="italic" style={{ color: "var(--c-vibra)" }}>provar</span>.
      </h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {notes.map((n, i) => (
          <span key={n} style={{
            padding: "10px 18px", borderRadius: 999,
            background: i === 0 ? "var(--c-mostarda)" : i === 1 ? "var(--c-vibra)" : "var(--paper)",
            color: i === 0 ? "var(--ink)" : i === 1 ? "var(--c-leveza)" : "var(--ink)",
            border: "1.5px solid var(--ink)", fontSize: 15,
          }}>
            <span className="serif italic">{n}</span>
          </span>
        ))}
      </div>
      <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
        {profiles.map(([k, v]) => (
          <div key={k} style={{ padding: 16, background: "var(--paper)", borderRadius: 12, border: "1px solid var(--line)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
              <span className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)" }}>{k}</span>
              <span className="serif" style={{ fontSize: 22, lineHeight: 1 }}>{v}<span style={{ fontSize: 12, color: "var(--ink-2)" }}>/100</span></span>
            </div>
            <div style={{ height: 6, background: "var(--bg-2)", borderRadius: 999 }}>
              <div style={{
                width: `${v}%`, height: "100%", borderRadius: 999,
                background: v >= 85 ? "var(--c-vibra)" : v >= 70 ? "var(--c-mostarda)" : "var(--ink-3)",
              }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ===== Producer ===== */
function Producer({ coffee }: { coffee: CoffeeProduct }) {
  if (!coffee.farm && !coffee.region) return null;
  return (
    <section style={{ marginTop: 56 }}>
      <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)" }}>
        <span style={{ color: "var(--c-vibra)" }}>§</span> &nbsp; Conheça a fazenda
      </div>
      <h2 className="serif" style={{ margin: "14px 0 24px", fontSize: "clamp(36px, 4vw, 56px)", lineHeight: 1, letterSpacing: "-.015em" }}>
        Quem <span className="italic" style={{ color: "var(--c-vibra)" }}>cultivou</span> esse café.
      </h2>
      <div style={{
        display: "grid", gridTemplateColumns: "auto 1fr", gap: 28, alignItems: "stretch",
        padding: 24, background: "var(--c-mostarda)", borderRadius: 18, border: "1.5px solid var(--ink)",
      }}>
        <div style={{
          width: 240, aspectRatio: "3 / 4", borderRadius: 12,
          background: "var(--c-barro)", color: "var(--c-leveza)",
          border: "1.5px solid var(--ink)", position: "relative", overflow: "hidden",
          display: "flex", alignItems: "flex-end", padding: 18,
        }}>
          <div>
            <div className="serif italic" style={{ fontSize: 26, lineHeight: 1 }}>{coffee.farm ?? "Produtor"}</div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", opacity: 0.8, marginTop: 6 }}>
              Produtores · desde 1934
            </div>
          </div>
        </div>
        <div>
          <div className="serif" style={{ fontSize: 36, lineHeight: 1, letterSpacing: "-.02em" }}>{coffee.farm ?? "Fazenda"}</div>
          <div style={{ fontSize: 14, color: "var(--ink-2)", marginTop: 6 }}>{coffee.region ?? "Brasil"}</div>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--ink)", marginTop: 16, maxWidth: 580 }}>
            Uma das fazendas parceiras da Ilé Coffees, selecionada pelo rigoroso processo de curadoria,
            garantindo que apenas os melhores grãos cheguem até você.
          </p>
          <div style={{ marginTop: 18 }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)" }}>Fornecido por</div>
            <ul style={{ listStyle: "none", padding: 0, margin: "10px 0 0", display: "flex", flexDirection: "column", gap: 6 }}>
              <li style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--c-vibra)" }} />
                Ilé Coffees · Esp. Sto. do Pinhal / SP
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===== Reviews ===== */
function Reviews() {
  const rating = 4.8;
  const count = 24;
  const histogram = [5, 4, 3, 2, 1].map(s => ({
    s,
    n: s === 5 ? 16 : s === 4 ? 5 : s === 3 ? 2 : s === 2 ? 1 : 0,
  }));
  const max = Math.max(...histogram.map(h => h.n));

  return (
    <section style={{ marginTop: 56 }}>
      <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)" }}>
        <span style={{ color: "var(--c-vibra)" }}>§</span> &nbsp; Avaliações dos clientes
      </div>
      <h2 className="serif" style={{ margin: "14px 0 24px", fontSize: "clamp(36px, 4vw, 56px)", lineHeight: 1, letterSpacing: "-.015em" }}>
        Quem provou, <span className="italic" style={{ color: "var(--c-vibra)" }}>aprovou</span>.
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24, marginBottom: 28 }}>
        <div style={{ padding: 22, borderRadius: 16, background: "var(--paper)", border: "1px solid var(--line)" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span className="serif" style={{ fontSize: 64, lineHeight: 1, letterSpacing: "-.03em" }}>{rating.toFixed(1)}</span>
            <span className="serif" style={{ fontSize: 22, color: "var(--ink-2)" }}>/ 5</span>
          </div>
          <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
            {[1, 2, 3, 4, 5].map(i => <StarIcon key={i} filled={i <= Math.round(rating)} size={18} />)}
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 8 }}>Baseado em {count} avaliações</div>
          <a href="#" style={{
            display: "inline-flex", marginTop: 18, padding: "10px 16px",
            borderRadius: 999, border: "1px solid var(--ink)", fontSize: 13,
          }}>
            Avaliar este café
          </a>
        </div>
        <div style={{ padding: "22px 24px", borderRadius: 16, background: "var(--paper)", border: "1px solid var(--line)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {histogram.map(h => (
              <div key={h.s} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: 14, padding: "4px 6px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span className="mono" style={{ fontSize: 11, width: 12 }}>{h.s}</span>
                  <StarIcon filled size={12} />
                </span>
                <span style={{ height: 6, background: "var(--bg-2)", borderRadius: 999 }}>
                  <span style={{ display: "block", width: `${(h.n / max) * 100}%`, height: "100%", background: "var(--c-mostarda)", borderRadius: 999 }} />
                </span>
                <span className="mono" style={{ fontSize: 11, color: "var(--ink-2)", width: 24, textAlign: "right" }}>{h.n}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {[
          { name: "Marina T.", role: "CUSTOMER", stars: 5, when: "há 3 dias", text: "Sem dúvida o melhor café da casa. O nome não engana — tem doçura de sobremesa e final longo." },
          { name: "Café Cosmo", role: "COFFEESHOP", stars: 5, when: "há 1 semana", text: "Servimos no nosso menu degustação e foi um sucesso entre os clientes." },
          { name: "Pedro H.", role: "CUSTOMER", stars: 4, when: "há 2 semanas", text: "Excelente. Vale cada centavo." },
        ].map((r, i) => (
          <article key={i} style={{
            padding: "20px 22px", borderRadius: 14, background: "var(--paper)",
            border: "1px solid var(--line)", display: "grid", gridTemplateColumns: "auto 1fr", gap: 16,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 999,
              background: r.role === "COFFEESHOP" ? "var(--c-glamour)" : "var(--c-mostarda)",
              color: r.role === "COFFEESHOP" ? "var(--c-leveza)" : "var(--ink)",
              display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 13,
            }}>
              {r.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{r.name}</span>
                {r.role === "COFFEESHOP" && (
                  <span className="mono" style={{ fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 999, background: "var(--c-glamour)", color: "var(--c-leveza)" }}>Cafeteria</span>
                )}
                <span className="mono" style={{ fontSize: 10, letterSpacing: ".1em", color: "var(--ink-2)" }}>{r.when}</span>
              </div>
              <div style={{ display: "flex", gap: 3, marginTop: 6 }}>
                {[1, 2, 3, 4, 5].map(i => <StarIcon key={i} filled={i <= r.stars} size={12} />)}
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.55, color: "var(--ink-2)", margin: "10px 0 0" }}>{r.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ===== Buy box ===== */
function BuyBox({ coffee, role, onAdd }: { coffee: CoffeeProduct; role: string; onAdd: (qty: number, variant: string) => void }) {
  const { isAuthenticated } = useAuth();
  const hasBoth = coffee.saleType === "BOTH";
  const canBuyKg = (coffee.saleType === "KG" || hasBoth) && (role === "COFFEESHOP" || role === "ROASTER");
  const canBuyPackage = (coffee.saleType === "PACKAGE" || hasBoth) && role !== "ROASTER";
  const defaultVariant: "KG" | "PACKAGE" =
    canBuyKg && !canBuyPackage ? "KG"
    : canBuyPackage ? "PACKAGE"
    : "KG";
  const [variant, setVariant] = useState<"PACKAGE" | "KG">(defaultVariant);
  const [qty, setQty] = useState(1);
  const [grind, setGrind] = useState("graos");
  const [cep, setCep] = useState("");
  const [freightLoading, setFreightLoading] = useState(false);
  const [freightOptions, setFreightOptions] = useState<FreightOption[] | null>(null);
  const [freightError, setFreightError] = useState<string | null>(null);
  const [loginMsg, setLoginMsg] = useState(false);

  const pkgPrice = role === "COFFEESHOP" ? (coffee.packagePriceCoffeeshop ?? coffee.packagePrice ?? 0) : (coffee.packagePrice ?? 0);
  const unitPrice = variant === "KG" ? (coffee.pricePerKg ?? 0) : pkgPrice;
  const total = unitPrice * qty;

  function maskCEP(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 8);
    return d.length <= 5 ? d : `${d.slice(0, 5)}-${d.slice(5)}`;
  }
  async function calcFreight() {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setFreightLoading(true);
    setFreightOptions(null);
    setFreightError(null);
    try {
      const res = await api.get("/shipping/estimate-product", {
        params: { cep: digits, coffeeId: coffee.id },
      });
      const data: { carrier: string; service: string; price: number; deadlineDays: number }[] = res.data;
      if (!data.length) {
        setFreightError("Nenhuma opção de frete disponível para este CEP.");
        return;
      }
      const mapped: FreightOption[] = []
      for (const o of data) {
        mapped.push({
          name: o.service,
          days: o.deadlineDays === 1 ? "1 dia útil" : `${o.deadlineDays} dias úteis`,
          price: o.price,
          note: o.carrier,
        })
      }
      setFreightOptions(mapped);
    } catch {
      setFreightError("Não foi possível calcular o frete. Verifique o CEP e tente novamente.");
    } finally {
      setFreightLoading(false);
    }
  }

  return (
    <aside style={{
      position: "sticky", top: 96, alignSelf: "flex-start",
      background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 18,
      padding: 24, display: "flex", flexDirection: "column", gap: 18,
      boxShadow: "0 30px 60px -36px rgba(28,8,16,.25)",
    }}>
      {/* Price */}
      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
          <span className="serif" style={{ fontSize: 48, lineHeight: 1, letterSpacing: "-.02em" }}>
            R$ {unitPrice.toFixed(2).replace(".", ",")}
          </span>
          <span className="mono" style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-2)" }}>
            {variant === "KG" ? "por kg · sem mín." : "pacote · 250g"}
          </span>
        </div>
        <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 8 }}>
          Em até <b style={{ color: "var(--ink)" }}>3x de R$ {(unitPrice / 3).toFixed(2).replace(".", ",")}</b> sem juros ·
          {" "}<b style={{ color: "var(--c-vibra)" }}>5% off no Pix</b>
        </div>
      </div>

      {/* Variant selector (only shown for BOTH saleType) */}
      {hasBoth && (
        <div>
          <div className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 10 }}>
            Modalidade
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {canBuyKg && (
              <button type="button" onClick={() => setVariant("KG")} style={{
                flex: 1, padding: "11px 14px", borderRadius: 12, fontSize: 13,
                border: `1.5px solid ${variant === "KG" ? "var(--ink)" : "var(--line)"}`,
                background: variant === "KG" ? "var(--ink)" : "var(--bg)",
                color: variant === "KG" ? "var(--c-leveza)" : "var(--ink)",
                cursor: "pointer", fontFamily: "inherit",
              }}>
                Por Kg
              </button>
            )}
            {canBuyPackage && (
              <button type="button" onClick={() => setVariant("PACKAGE")} style={{
                flex: 1, padding: "11px 14px", borderRadius: 12, fontSize: 13,
                border: `1.5px solid ${variant === "PACKAGE" ? "var(--ink)" : "var(--line)"}`,
                background: variant === "PACKAGE" ? "var(--ink)" : "var(--bg)",
                color: variant === "PACKAGE" ? "var(--c-leveza)" : "var(--ink)",
                cursor: "pointer", fontFamily: "inherit",
              }}>
                Pacote
              </button>
            )}
          </div>
        </div>
      )}

      {/* Grind */}
      <div>
        <div className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 10 }}>
          Moagem
        </div>
        <select
          value={grind}
          onChange={e => setGrind(e.target.value)}
          style={{
            width: "100%", padding: "12px 14px", border: "1px solid var(--line)",
            borderRadius: 12, fontSize: 14, background: "var(--bg)", outline: "none",
            appearance: "none" as const, fontFamily: "inherit", color: "inherit",
            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path d='M1 1l4 4 4-4' stroke='%231c0810' stroke-width='1.2' fill='none' stroke-linecap='round'/></svg>")`,
            backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", paddingRight: 36,
          }}
        >
          <option value="graos">Em grãos (recomendado)</option>
          <option value="espresso">Moído para espresso</option>
          <option value="filtro">Moído para filtro</option>
          <option value="prensa">Moído para prensa francesa</option>
        </select>
      </div>

      {/* Qty + add */}
      <div>
        <div className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 10 }}>
          Quantidade
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--line)", borderRadius: 12, background: "var(--bg)", overflow: "hidden" }}>
            <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 38, height: 44, fontSize: 18, border: 0, background: "none", cursor: "pointer" }}>−</button>
            <span className="serif" style={{ minWidth: 36, textAlign: "center", fontSize: 22 }}>{qty}</span>
            <button onClick={() => setQty(q => Math.min(99, q + 1))} style={{ width: 38, height: 44, fontSize: 18, border: 0, background: "none", cursor: "pointer" }}>+</button>
          </div>
          <button onClick={() => {
            if (!isAuthenticated) { setLoginMsg(true); return; }
            setLoginMsg(false);
            onAdd(qty, variant);
          }} style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
            padding: "12px 18px", background: "var(--ink)", color: "var(--c-leveza)", borderRadius: 12, fontSize: 14,
            border: 0, cursor: "pointer", fontFamily: "inherit",
          }}>
            <CartIcon /> Adicionar — R$ {total.toFixed(2).replace(".", ",")}
          </button>
        </div>
        {loginMsg && (
          <div style={{
            marginTop: 10, padding: "12px 14px", borderRadius: 12,
            background: "rgba(194,60,40,.07)", border: "1px solid rgba(194,60,40,.2)",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
          }}>
            <span style={{ fontSize: 13, color: "var(--ink)", lineHeight: 1.4 }}>
              Faça login para adicionar ao carrinho.
            </span>
            <Link to="/login" style={{
              fontSize: 13, fontWeight: 600, color: "var(--c-vibra)",
              textDecoration: "none", whiteSpace: "nowrap" as const,
            }}>
              Entrar →
            </Link>
          </div>
        )}
      </div>

      <div style={{ height: 1, background: "var(--line)" }} />

      {/* Freight */}
      <div>
        <div className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 10 }}>
          Calcular frete
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
          <input
            type="text" placeholder="00000-000" value={cep}
            onChange={e => setCep(maskCEP(e.target.value))}
            inputMode="numeric"
            style={{ padding: "12px 14px", border: "1px solid var(--line)", borderRadius: 12, fontSize: 14, background: "var(--bg)", outline: "none", fontFamily: "inherit" }}
          />
          <button onClick={calcFreight} disabled={freightLoading} style={{
            padding: "12px 18px", border: "1px solid var(--ink)", borderRadius: 12, fontSize: 13,
            cursor: "pointer", background: "none", fontFamily: "inherit",
          }}>
            {freightLoading ? "…" : "Calcular"}
          </button>
        </div>
        {freightError && (
          <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 10, background: "rgba(194,60,40,.07)", border: "1px solid rgba(194,60,40,.2)", fontSize: 12, color: "var(--c-vibra)" }}>
            {freightError}
          </div>
        )}
        {freightOptions && (
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
            {freightOptions.map((o, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 12px", borderRadius: 10,
                background: i === 0 ? "rgba(28,8,16,.05)" : "transparent",
                border: i === 0 ? "1px solid var(--ink)" : "1px solid var(--line)",
              }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{o.name}</span>
                  <span style={{ fontSize: 12, color: "var(--ink-2)" }}>
                    {o.days}{o.note ? <> &middot; <span style={{ color: "var(--ink)" }}>{o.note}</span></> : null}
                  </span>
                </div>
                <span className="serif" style={{ fontSize: 18, flexShrink: 0, marginLeft: 12 }}>
                  {o.price === 0 ? "Grátis" : `R$ ${o.price.toFixed(2).replace(".", ",")}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ height: 1, background: "var(--line)" }} />

      {/* Supplier */}
      <div>
        <div className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)" }}>Fornecedor</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
          <span style={{
            width: 36, height: 36, borderRadius: 999, background: "var(--c-glamour)", color: "var(--c-mostarda)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }} className="serif italic">íc</span>
          <div>
            <div className="serif" style={{ fontSize: 18, lineHeight: 1.1 }}>Ilé Coffees</div>
            <div style={{ fontSize: 12, color: "var(--ink-2)" }}>Esp. Sto. do Pinhal · SP</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 12, fontSize: 12, color: "var(--ink-2)" }}>
          <span>✓ Torrado em pequenos lotes</span>
          <span>✓ Despacho em 24h</span>
        </div>
      </div>
    </aside>
  );
}

/* ===== Cart toast ===== */
function Toast({ item, onClose }: { item: { name: string; qty: number; variant: string } | null; onClose: () => void }) {
  useEffect(() => {
    if (!item) return;
    const t = setTimeout(onClose, 2400);
    return () => clearTimeout(t);
  }, [item, onClose]);
  if (!item) return null;
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 60,
      background: "var(--ink)", color: "var(--c-leveza)",
      padding: "14px 18px", borderRadius: 14,
      display: "flex", alignItems: "center", gap: 12,
      boxShadow: "0 20px 40px -20px rgba(0,0,0,.4)", maxWidth: 380,
    }}>
      <span style={{
        width: 34, height: 34, borderRadius: 999, background: "var(--c-mostarda)",
        color: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600,
      }}>
        {item.qty}×
      </span>
      <div>
        <div style={{ fontSize: 13 }}>Adicionado ao carrinho</div>
        <div className="serif italic" style={{ fontSize: 18, lineHeight: 1.1, color: "var(--c-mostarda)" }}>
          {item.name} — {item.variant === "KG" ? "por kg" : "250g"}
        </div>
      </div>
      <button onClick={onClose} style={{ marginLeft: "auto", border: 0, background: "none", cursor: "pointer", color: "var(--c-leveza)", opacity: 0.7 }}>
        <XIcon size={14} />
      </button>
    </div>
  );
}

/* ===== Page ===== */
function useIsMobile(bp = 768) {
  const [m, setM] = useState(() => typeof window !== "undefined" && window.innerWidth < bp);
  useEffect(() => {
    const h = () => setM(window.innerWidth < bp);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, [bp]);
  return m;
}

export default function ProductDetails() {
  const { productId } = useParams<{ productId: string }>();
  const { user, type, supplierType } = useAuth();
  const { addItem, openCart } = useCart();
  const [coffee, setCoffee] = useState<CoffeeProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ name: string; qty: number; variant: string } | null>(null);
  const [isFav, setIsFav] = useState(false);
  const mob = useIsMobile();

  const isRegularUser = type === "USER" && user?.accountType !== "COFFEESHOP";
  const role =
    type === "SUPPLIER" && supplierType === "ROASTER" ? "ROASTER"
    : user?.accountType === "COFFEESHOP" ? "COFFEESHOP"
    : user ? "CUSTOMER"
    : "VISITOR";

  useEffect(() => {
    api.get(`/coffees/${productId}`)
      .then(r => setCoffee(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    if (!isRegularUser || !productId) return;
    api.get("/favorites")
      .then(r => {
        const favs: { coffeeId: string }[] = r.data;
        setIsFav(favs.some(f => f.coffeeId === productId));
      })
      .catch(() => {});
  }, [isRegularUser, productId]);

  async function toggleFavorite() {
    if (!productId) return;
    try {
      if (isFav) {
        await api.delete(`/favorites/${productId}`);
        setIsFav(false);
      } else {
        await api.post("/favorites", { coffeeId: productId });
        setIsFav(true);
      }
    } catch {}
  }

  async function handleAdd(qty: number, variant: string) {
    if (!coffee) return;
    await addItem(coffee.id, qty).catch(() => {});
    openCart();
    setToast({ name: coffee.name, qty, variant });
  }

  const line = getLine(coffee?.score ?? null);

  if (loading) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="serif" style={{ fontSize: 24, color: "var(--ink-2)" }}>Carregando…</div>
      </div>
    );
  }
  if (!coffee) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div className="serif" style={{ fontSize: 48, color: "var(--ink)" }}>Café não encontrado</div>
          <Link to="/explore" style={{ display: "inline-block", marginTop: 16, color: "var(--c-vibra)" }}>← Voltar ao catálogo</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--ink)" }}>
      <Header />

      {/* Breadcrumb */}
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: mob ? "16px 16px 0" : "20px 32px 0" }}>
        <nav className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <Link to="/">Início</Link>
          <span style={{ opacity: 0.5 }}>/</span>
          <Link to="/explore">Cafés</Link>
          <span style={{ opacity: 0.5 }}>/</span>
          <span style={{ color: "var(--c-vibra)" }}>{line}</span>
          <span style={{ opacity: 0.5 }}>/</span>
          <span style={{ color: "var(--ink)" }}>{coffee.name}</span>
        </nav>
      </div>

      <main style={{
        maxWidth: 1320, margin: "0 auto", padding: mob ? "20px 16px 60px" : "28px 32px 80px",
        display: "grid", gridTemplateColumns: mob ? "1fr" : "minmax(0, 1fr) 380px", gap: mob ? 32 : 48, alignItems: "start",
      }}>
        <div>
          {/* Gallery + title */}
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "minmax(0, 1fr) minmax(0, 1.05fr)", gap: mob ? 24 : 36, alignItems: "start" }}>
            <Gallery coffee={coffee} />
            <div>
              <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)" }}>
                <span style={{ color: "var(--c-vibra)" }}>Linha {line}</span> &nbsp;·&nbsp; {coffee.region ?? "Brasil"}
              </div>
              <h1 className="serif" style={{ margin: "12px 0 0", fontSize: "clamp(48px, 6vw, 80px)", lineHeight: 0.9, letterSpacing: "-.03em" }}>
                {coffee.name.split(" ").map((w, i, arr) =>
                  i === arr.length - 1
                    ? <span key={i} className="italic" style={{ color: "var(--c-vibra)" }}>{w}</span>
                    : <span key={i}>{w} </span>
                )}
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 18, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {[1, 2, 3, 4, 5].map(i => <StarIcon key={i} filled={i <= 5} size={16} />)}
                  <span className="mono" style={{ fontSize: 12, letterSpacing: ".06em", color: "var(--ink-2)", marginLeft: 6 }}>4.9 · 24 avaliações</span>
                </div>
                <span style={{ width: 4, height: 4, borderRadius: 999, background: "var(--ink-3)" }} />
                <span style={{ fontSize: 13, color: "var(--ink-2)" }}>
                  <b style={{ color: "var(--success)" }}>● Em estoque</b>
                </span>
                {isRegularUser && (
                  <button
                    onClick={toggleFavorite}
                    title={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                    style={{
                      marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "7px 14px", borderRadius: 999,
                      border: `1px solid ${isFav ? "var(--c-vibra)" : "var(--line)"}`,
                      background: isFav ? "rgba(194,60,40,.07)" : "transparent",
                      cursor: "pointer", fontFamily: "inherit", fontSize: 13,
                      color: isFav ? "var(--c-vibra)" : "var(--ink-2)",
                      transition: "all .15s",
                    }}
                  >
                    <svg width={16} height={16} viewBox="0 0 16 16" fill={isFav ? "var(--c-vibra)" : "none"}>
                      <path d="M8 13.7C8 13.7 2 9.5 2 5.5C2 3.6 3.6 2 5.5 2C6.5 2 7.5 2.6 8 3.4C8.5 2.6 9.5 2 10.5 2C12.4 2 14 3.6 14 5.5C14 9.5 8 13.7 8 13.7Z"
                        stroke={isFav ? "var(--c-vibra)" : "currentColor"} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {isFav ? "Favoritado" : "Favoritar"}
                  </button>
                )}
              </div>
              {coffee.description && (
                <p style={{ fontSize: 17, lineHeight: 1.6, color: "var(--ink-2)", marginTop: 24, maxWidth: 580 }}>
                  {coffee.description}
                </p>
              )}
            </div>
          </div>

          <Specs coffee={coffee} />
          <TastingNotes coffee={coffee} />
          <Producer coffee={coffee} />
          <Reviews />
        </div>

        <BuyBox coffee={coffee} role={role} onAdd={handleAdd} />
      </main>

      {/* Related */}
      <section style={{ borderTop: "1px solid var(--ink)", background: "var(--bg-2)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "80px 32px" }}>
          <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)" }}>
            <span style={{ color: "var(--c-vibra)" }}>§</span> &nbsp; Pra você também gostar
          </div>
          <h2 className="serif" style={{ margin: "14px 0 28px", fontSize: "clamp(40px, 5vw, 72px)", lineHeight: 0.95, letterSpacing: "-.02em" }}>
            Cafés <span className="italic" style={{ color: "var(--c-vibra)" }}>relacionados</span>.
          </h2>
          <div style={{ textAlign: "center", padding: "32px", color: "var(--ink-2)" }}>
            <Link to="/explore" style={{ color: "var(--c-vibra)", fontSize: 15 }}>Ver catálogo completo →</Link>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid var(--line)", padding: "24px 32px", fontSize: 12, color: "var(--ink-2)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <span className="mono" style={{ letterSpacing: ".12em", textTransform: "uppercase" }}>© 2026 Ilé Coffees · desde 1934</span>
          <div style={{ display: "flex", gap: 18 }}>
            <Link to="/" style={{ color: "inherit" }}>Home</Link>
            <Link to="/explore" style={{ color: "inherit" }}>Cafés</Link>
            <Link to="/courses" style={{ color: "inherit" }}>Cursos</Link>
          </div>
        </div>
      </footer>

      <Toast item={toast} onClose={() => setToast(null)} />
    </div>
  );
}
