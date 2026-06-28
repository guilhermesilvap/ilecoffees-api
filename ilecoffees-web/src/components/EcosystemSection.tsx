import { useState, useEffect } from "react";

type Role = "producer" | "roaster" | "coffeeshop" | "customer";

interface EcosystemSectionProps {
  highlight?: Role;
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

function LeafIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M6 22c2-6 6-10 14-12-2 6-6 10-14 12z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
      <path d="M6 22c0-4 2-8 6-10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function FlameIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M14 4c0 4-4 6-4 10a4 4 0 008 0c0-2-1-3-2-4 0 2-1 3-2 3-1 0-1-1-1-2 0-3 3-5 3-8 0 0-2 1-2 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}
function CupIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M7 10h14l-1.5 8a2 2 0 01-2 1.7H10.5a2 2 0 01-2-1.7L7 10z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M21 12h2a2 2 0 010 4h-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M8 22h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function HomeIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M5 13L14 5l9 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 11v10a1 1 0 001 1h3v-4h4v4h3a1 1 0 001-1V11" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}
function ArrowRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

const NODES: { id: Role; tag: string; label: string; icon: React.ReactNode; benefit: string; youLabel: string }[] = [
  {
    id: "producer",
    tag: "1 · Campo",
    label: "Produtor",
    icon: <LeafIcon />,
    benefit: "Acessa torrefadores especializados em todo o Brasil, vende com rastreabilidade e margem justa — sem intermediários desnecessários.",
    youLabel: "Você está aqui",
  },
  {
    id: "roaster",
    tag: "2 · Torrefação",
    label: "Torrefador",
    icon: <FlameIcon />,
    benefit: "Compra grãos de origem verificada, torra com sua identidade e distribui para cafeterias e consumidores finais na mesma plataforma.",
    youLabel: "Você está aqui",
  },
  {
    id: "coffeeshop",
    tag: "3 · Cafeteria",
    label: "Cafeteria",
    icon: <CupIcon />,
    benefit: "Acesso a atacado direto de torrefadores curados, preço diferenciado por volume e gestão de pedidos integrada ao seu fluxo.",
    youLabel: "Você está aqui",
  },
  {
    id: "customer",
    tag: "4 · Xícara",
    label: "Cliente Final",
    icon: <HomeIcon />,
    benefit: "Recebe em casa o mesmo café dos melhores bares especializados do Brasil — com assinatura, rastreabilidade e curadoria íle.",
    youLabel: "Você está aqui",
  },
];

export function EcosystemSection({ highlight }: EcosystemSectionProps) {
  const mob = useIsMobile();

  return (
    <section style={{
      background: "var(--ink)", color: "var(--c-leveza)",
      borderTop: "1px solid var(--ink)", borderBottom: "1px solid var(--ink)",
    }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: mob ? "56px 20px" : "80px 40px" }}>

        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: mob ? 16 : 48, marginBottom: mob ? 40 : 60, alignItems: "end" }}>
          <div>
            <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--c-mostarda)", marginBottom: 16 }}>
              <span style={{ opacity: 0.7 }}>§</span> &nbsp; Ecossistema íle coffees
            </div>
            <h2 className="serif" style={{ margin: 0, fontSize: mob ? "clamp(36px, 9vw, 56px)" : "clamp(40px, 4.5vw, 72px)", lineHeight: 0.92, letterSpacing: "-.025em" }}>
              Do campo à<br />
              <span className="italic" style={{ color: "var(--c-mostarda)" }}>xícara</span> —<br />
              todo mundo ganha.
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: mob ? 15 : 17, lineHeight: 1.65, color: "rgba(238,243,235,.65)", maxWidth: 480 }}>
            A íle conecta cada elo da cadeia do café especial em uma única plataforma.
            Produtores, torrefadores, cafeterias e clientes finais — cada um com
            ferramentas feitas para o seu momento, todos fortalecendo o mesmo
            ecossistema.
          </p>
        </div>

        {/* Flow */}
        {mob ? (
          /* Mobile: vertical stack */
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {NODES.map((node, i) => {
              const isHighlighted = highlight === node.id;
              return (
                <div key={node.id}>
                  <div style={{
                    padding: "24px 22px",
                    borderRadius: 16,
                    background: isHighlighted ? "var(--c-mostarda)" : "rgba(238,243,235,.06)",
                    border: `1px solid ${isHighlighted ? "var(--c-mostarda)" : "rgba(238,243,235,.12)"}`,
                    color: isHighlighted ? "var(--ink)" : "var(--c-leveza)",
                  }}>
                    {isHighlighted && (
                      <div className="mono" style={{ fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 10, opacity: 0.7 }}>
                        ★ {node.youLabel}
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: isHighlighted ? "rgba(28,8,16,.12)" : "rgba(238,243,235,.1)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        {node.icon}
                      </div>
                      <div>
                        <div className="mono" style={{ fontSize: 9, letterSpacing: ".16em", textTransform: "uppercase", opacity: 0.6, marginBottom: 4 }}>{node.tag}</div>
                        <div className="serif" style={{ fontSize: 22, lineHeight: 1, letterSpacing: "-.01em" }}>{node.label}</div>
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, opacity: isHighlighted ? 0.85 : 0.65 }}>{node.benefit}</p>
                  </div>
                  {i < NODES.length - 1 && (
                    <div style={{ display: "flex", justifyContent: "center", padding: "10px 0", color: "rgba(238,243,235,.25)" }}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M10 4v12M6 12l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Desktop: horizontal flow */
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr auto 1fr", gap: 0, alignItems: "stretch" }}>
            {NODES.map((node, i) => {
              const isHighlighted = highlight === node.id;
              return (
                <>
                  <div
                    key={node.id}
                    style={{
                      padding: "28px 24px",
                      borderRadius: 18,
                      background: isHighlighted ? "var(--c-mostarda)" : "rgba(238,243,235,.06)",
                      border: `1px solid ${isHighlighted ? "var(--c-mostarda)" : "rgba(238,243,235,.1)"}`,
                      color: isHighlighted ? "var(--ink)" : "var(--c-leveza)",
                      display: "flex", flexDirection: "column", gap: 16,
                      position: "relative",
                    }}
                  >
                    {isHighlighted && (
                      <div style={{
                        position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                        background: "var(--c-vibra)", color: "#fff",
                        padding: "4px 12px", borderRadius: 999,
                        fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase",
                        whiteSpace: "nowrap",
                      }} className="mono">
                        ★ {node.youLabel}
                      </div>
                    )}
                    <div style={{
                      width: 52, height: 52, borderRadius: 14,
                      background: isHighlighted ? "rgba(28,8,16,.12)" : "rgba(238,243,235,.1)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {node.icon}
                    </div>
                    <div>
                      <div className="mono" style={{ fontSize: 9, letterSpacing: ".16em", textTransform: "uppercase", opacity: 0.55, marginBottom: 6 }}>{node.tag}</div>
                      <div className="serif" style={{ fontSize: 26, lineHeight: 1, letterSpacing: "-.015em" }}>{node.label}</div>
                    </div>
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, opacity: isHighlighted ? 0.85 : 0.6, flex: 1 }}>{node.benefit}</p>
                  </div>
                  {i < NODES.length - 1 && (
                    <div key={`arrow-${i}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 12px", color: "rgba(238,243,235,.2)" }}>
                      <ArrowRight />
                    </div>
                  )}
                </>
              );
            })}
          </div>
        )}

        {/* Bottom strip */}
        <div style={{
          marginTop: mob ? 40 : 52,
          padding: mob ? "20px 22px" : "22px 32px",
          borderRadius: 14,
          background: "rgba(238,243,235,.05)",
          border: "1px solid rgba(238,243,235,.1)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 16,
        }}>
          <div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--c-mostarda)", marginBottom: 6 }}>
              Por que a íle é diferente
            </div>
            <p style={{ margin: 0, fontSize: mob ? 14 : 15, color: "rgba(238,243,235,.75)", lineHeight: 1.5, maxWidth: 680 }}>
              Cada transação na plataforma fortalece toda a cadeia — preço justo para o produtor,
              grão de qualidade para o torrefador, custo competitivo para a cafeteria
              e experiência especial para quem bebe em casa.
            </p>
          </div>
          <div style={{ display: "flex", gap: 20, flexShrink: 0 }}>
            {[["400+", "produtores"], ["80+", "torrefadores"], ["1.200+", "cafeterias"], ["18k+", "clientes"]].map(([n, l]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div className="serif" style={{ fontSize: mob ? 22 : 28, lineHeight: 1, color: "var(--c-mostarda)", letterSpacing: "-.02em" }}>{n}</div>
                <div className="mono" style={{ fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(238,243,235,.45)", marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
