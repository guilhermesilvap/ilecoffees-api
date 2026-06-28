import { useRef, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .2s" }}
    >
      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type OrderType = "subscription" | "course" | "product";

const TYPE_LABELS: Record<OrderType, string> = {
  subscription: "Assinatura",
  course: "Curso",
  product: "Produto",
};

const TYPE_ICONS: Record<OrderType, React.ReactNode> = {
  subscription: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="3" y="7" width="22" height="16" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 12h22" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 17h4M9 20h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  course: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M14 5L3 10l11 5 11-5-11-5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8 13v6c0 2 2.7 4 6 4s6-2 6-4v-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M25 10v7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  product: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M5 8h18l-2 13H7L5 8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M10 8V6a4 4 0 018 0v2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
};

const NEXT_STEPS: Record<OrderType, Array<{ title: string; description: string }>> = {
  subscription: [
    { title: "Email de confirmação", description: "Você receberá os detalhes da assinatura no seu email." },
    { title: "Acesso ao plano", description: "Seu plano já está ativo — explore os cafés incluídos." },
    { title: "Recebimento mensal", description: "Os cafés serão enviados conforme o ciclo escolhido." },
  ],
  course: [
    { title: "Email de confirmação", description: "Você receberá um email com os detalhes da compra." },
    { title: "Acesse seu curso", description: 'O curso está disponível na área "Meus Cursos" do painel.' },
    { title: "Certificado", description: "Ao concluir o curso, você receberá um certificado digital." },
  ],
  product: [
    { title: "Email de confirmação", description: "Você receberá um email com os detalhes da compra." },
    { title: "Preparação do pedido", description: "Seu pedido será preparado e despachado em até 1 dia útil." },
    { title: "Acompanhamento", description: "Você receberá o código de rastreamento por email." },
  ],
};

export default function PurchaseSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, type, supplierType, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const accountType = (user as any)?.accountType ?? "CUSTOMER";
  const dashboardPath = type === "SUPPLIER" ? (supplierType === "PRODUCER" ? "/dashboard/producer" : "/dashboard/supplier") : type === "ADMIN" ? "/dashboard/admin" : accountType === "COFFEESHOP" ? "/dashboard/coffeeshop" : "/dashboard/customer";

  const orderType = (searchParams.get("type") || "product") as OrderType;
  const planName = searchParams.get("plan") || "";
  const orderId = searchParams.get("orderId") || "";

  const label = TYPE_LABELS[orderType] || "Compra";
  const steps = NEXT_STEPS[orderType] || NEXT_STEPS.product;

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--ink)", fontFamily: "inherit" }}>
      {/* Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "var(--paper)", borderBottom: "1px solid var(--line)",
        padding: "0 clamp(1rem,4vw,2.5rem)",
      }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button
            onClick={() => navigate("/explore")}
            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
          >
            <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-1px", color: "var(--ink)" }}>ılecoffees</span>
          </button>

          {isAuthenticated && user ? (
            <div ref={menuRef} style={{ position: "relative" }}>
              <button
                onClick={handleMenuToggle}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "none", border: "1px solid var(--line)",
                  borderRadius: 8, padding: "6px 12px", cursor: "pointer", color: "var(--ink)",
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "var(--c-vibra)", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, overflow: "hidden",
                }}>
                  {(user as any)?.photoUrl
                    ? <img src={(user as any).photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : getInitials(user.name)}
                </div>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{user.name.split(" ")[0]}</span>
                <Chevron open={menuOpen} />
              </button>
              {menuOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", right: 0,
                  background: "var(--paper)", border: "1px solid var(--line)",
                  borderRadius: 10, padding: "8px 0", minWidth: 180,
                  boxShadow: "0 8px 24px rgba(0,0,0,.08)", zIndex: 200,
                }}>
                  <div style={{ padding: "8px 16px 12px", borderBottom: "1px solid var(--line)" }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{user.name}</div>
                    <div style={{ fontSize: 11, color: "var(--ink)", opacity: .5, marginTop: 2 }}>
                      {user.type === "SUPPLIER" ? (supplierType === "PRODUCER" ? "Produtor" : "Torrefador") : user.type === "ADMIN" ? "Admin" : "Cliente"}
                    </div>
                  </div>
                  <button
                    onClick={() => { setMenuOpen(false); navigate(dashboardPath); }}
                    style={{ width: "100%", textAlign: "left", background: "none", border: "none", padding: "10px 16px", cursor: "pointer", fontSize: 13, color: "var(--ink)" }}
                  >
                    Meu painel
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); logout(); navigate("/explore"); }}
                    style={{ width: "100%", textAlign: "left", background: "none", border: "none", padding: "10px 16px", cursor: "pointer", fontSize: 13, color: "var(--c-glamour)" }}
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => navigate("/login")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--ink)", padding: "6px 12px" }}>
                Entrar
              </button>
              <button
                onClick={() => navigate("/register")}
                style={{ background: "var(--c-vibra)", color: "#fff", border: "none", borderRadius: 8, padding: "6px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              >
                Criar conta
              </button>
            </div>
          )}
        </div>
      </header>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "clamp(2rem,5vw,4rem) clamp(1rem,4vw,2rem)" }}>
        {/* Success Banner */}
        <div style={{
          textAlign: "center", marginBottom: 56,
        }}>
          {/* Animated check circle */}
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: "var(--c-leveza)", margin: "0 auto 24px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" stroke="var(--c-vibra)" strokeWidth="2" />
              <path d="M12 20l6 6 10-12" stroke="var(--c-vibra)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 800, letterSpacing: "-1px", marginBottom: 12 }}>
            {orderType === "subscription"
              ? "Assinatura confirmada!"
              : orderType === "course"
              ? "Curso adquirido!"
              : "Compra realizada!"}
          </h1>
          <p style={{ fontSize: 16, opacity: .65, maxWidth: 480, margin: "0 auto" }}>
            {user?.name ? `Obrigado, ${user.name.split(" ")[0]}! ` : "Obrigado! "}
            {orderType === "subscription"
              ? `Seu plano ${planName ? `"${planName}" ` : ""}está ativo.`
              : orderType === "course"
              ? "Seu acesso ao curso foi liberado."
              : "Seu pedido está sendo processado."}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr clamp(240px,30%,300px)", gap: 32, alignItems: "start" }}>
          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Type card */}
            <div style={{
              background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 16, padding: 28,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 12,
                  background: "var(--c-leveza)", display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--c-vibra)",
                }}>
                  {TYPE_ICONS[orderType]}
                </div>
                <div>
                  <div style={{
                    display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: ".06em",
                    textTransform: "uppercase", color: "var(--c-vibra)",
                    background: "var(--c-leveza)", borderRadius: 4, padding: "2px 8px", marginBottom: 4,
                  }}>
                    {label}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>
                    {planName || (orderType === "course" ? "Curso adquirido" : orderType === "product" ? "Produto" : "Plano de assinatura")}
                  </div>
                </div>
              </div>

              {orderType === "subscription" && (
                <div style={{
                  background: "var(--c-leveza)", borderRadius: 10, padding: "14px 18px",
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <circle cx="9" cy="9" r="8" stroke="var(--c-vibra)" strokeWidth="1.5" />
                    <path d="M6 9l2 2 4-4" stroke="var(--c-vibra)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{ fontSize: 13, color: "var(--ink)" }}>
                    Plano ativo — os cafés serão enviados conforme o ciclo escolhido.
                  </span>
                </div>
              )}

              {orderType === "course" && (
                <div style={{
                  background: "var(--c-leveza)", borderRadius: 10, padding: "14px 18px",
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <circle cx="9" cy="9" r="8" stroke="var(--c-vibra)" strokeWidth="1.5" />
                    <path d="M6 9l2 2 4-4" stroke="var(--c-vibra)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{ fontSize: 13, color: "var(--ink)" }}>
                    Acesso liberado — você já pode começar a aprender.
                  </span>
                </div>
              )}

              {orderType === "product" && (
                <div style={{
                  background: "var(--c-leveza)", borderRadius: 10, padding: "14px 18px",
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <circle cx="9" cy="9" r="8" stroke="var(--c-vibra)" strokeWidth="1.5" />
                    <path d="M6 9l2 2 4-4" stroke="var(--c-vibra)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{ fontSize: 13, color: "var(--ink)" }}>
                    Pedido confirmado — envio em até 1 dia útil.
                  </span>
                </div>
              )}

              {orderId && (
                <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, opacity: .5 }}>Número do pedido</span>
                  <span style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 600 }}>#{orderId.slice(0, 8).toUpperCase()}</span>
                </div>
              )}

              <div style={{ marginTop: orderId ? 10 : 18, paddingTop: orderId ? 10 : 18, borderTop: orderId ? "none" : "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, opacity: .5 }}>Data</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{new Date().toLocaleDateString("pt-BR")}</span>
              </div>
            </div>

            {/* Next steps */}
            <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 16, padding: 28 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Próximos passos</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {steps.map((step, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                      background: i === 0 ? "var(--c-vibra)" : "var(--c-leveza)",
                      color: i === 0 ? "#fff" : "var(--c-vibra)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 700,
                    }}>
                      {i + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{step.title}</div>
                      <div style={{ fontSize: 13, opacity: .6, lineHeight: 1.5 }}>{step.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* CTA card */}
            <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 16, padding: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Ações rápidas</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {orderType === "course" && orderId && (
                  <button
                    onClick={() => navigate(`/course/${orderId}`)}
                    style={{
                      width: "100%", padding: "11px 0", background: "var(--c-vibra)",
                      color: "#fff", border: "none", borderRadius: 10, fontWeight: 700,
                      fontSize: 14, cursor: "pointer",
                    }}
                  >
                    Acessar curso
                  </button>
                )}
                {orderType === "subscription" && (
                  <button
                    onClick={() => navigate("/subscriptions")}
                    style={{
                      width: "100%", padding: "11px 0", background: "var(--c-vibra)",
                      color: "#fff", border: "none", borderRadius: 10, fontWeight: 700,
                      fontSize: 14, cursor: "pointer",
                    }}
                  >
                    Ver meu plano
                  </button>
                )}
                <button
                  onClick={() => navigate(dashboardPath)}
                  style={{
                    width: "100%", padding: "11px 0", background: "var(--c-leveza)",
                    color: "var(--c-vibra)", border: "none", borderRadius: 10, fontWeight: 600,
                    fontSize: 14, cursor: "pointer",
                  }}
                >
                  Meus pedidos
                </button>
                <button
                  onClick={() => navigate("/explore")}
                  style={{
                    width: "100%", padding: "11px 0", background: "none",
                    color: "var(--ink)", border: "1px solid var(--line)", borderRadius: 10, fontWeight: 500,
                    fontSize: 14, cursor: "pointer",
                  }}
                >
                  Continuar comprando
                </button>
              </div>
            </div>

            {/* Support */}
            <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 16, padding: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Precisa de ajuda?</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ opacity: .5, flexShrink: 0 }}>
                  <rect x="1" y="3" width="13" height="10" rx="2" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M1 6l6.5 4L14 6" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                <span style={{ fontSize: 12, fontWeight: 500 }}>suporte@ilecoffees.com</span>
              </div>
              <p style={{ fontSize: 11, opacity: .5, lineHeight: 1.5, margin: 0 }}>
                Nossa equipe responde em até 24h úteis.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
