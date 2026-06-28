import { Coffee, Store, Users, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/logo";

function useIsMobile(bp = 768) {
  const [m, setM] = useState(() => typeof window !== "undefined" && window.innerWidth < bp);
  useEffect(() => {
    const h = () => setM(window.innerWidth < bp);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, [bp]);
  return m;
}

const userTypes = [
  {
    type: "supplier",
    title: "Sou Fornecedor",
    subtitle: "Torrefadora / Produtor",
    description: "Cadastre seus cafés, crie assinaturas e cursos para expandir seus negócios.",
    icon: Coffee,
    route: "/register/supplier",
    accent: "#e7402c",
    accentBg: "rgba(231,64,44,0.07)",
    num: "01",
  },
  {
    type: "coffeeshop",
    title: "Sou Cafeteria",
    subtitle: "Empresa / Negócio",
    description: "Compre cafés a granel, assine planos regulares e acesse cursos técnicos.",
    icon: Store,
    route: "/register/customer",
    accent: "#e58a2a",
    accentBg: "rgba(229,138,42,0.07)",
    num: "02",
  },
  {
    type: "customer",
    title: "Sou Cliente",
    subtitle: "Consumidor Final",
    description: "Descubra pacotes de cafés especiais, cursos e aprenda sobre o universo do café.",
    icon: Users,
    route: "/register/customer",
    accent: "#0f2920",
    accentBg: "rgba(15,41,32,0.07)",
    num: "03",
  },
];

const UserTypeSelection = () => {
  const navigate = useNavigate();
  const mob = useIsMobile();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px" }}>
      <div style={{ width: "100%", maxWidth: 760 }}>
        {/* Brand heading */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <Logo />
          </div>
          <h1 style={{ fontFamily: "'Tinos', serif", fontSize: "clamp(2rem, 5vw, 3.2rem)", lineHeight: 0.95, color: "var(--ink)", marginBottom: 12 }}>
            Bem-vindo ao marketplace<br />
            <span style={{ color: "var(--c-mostarda)", fontStyle: "italic" }}>de café especial.</span>
          </h1>
          <p style={{ color: "var(--ink-3)", fontSize: 15, lineHeight: 1.6, maxWidth: 380, margin: "0 auto" }}>
            Escolha o perfil que melhor descreve você para continuar
          </p>
        </div>

        {/* Type cards */}
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
          {userTypes.map(({ type, title, subtitle, description, icon: Icon, route, accent, accentBg, num }) => (
            <button
              key={type}
              onClick={() => navigate(route)}
              style={{ textAlign: "left", background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 20, padding: "24px 22px", cursor: "pointer", fontFamily: "inherit", transition: "box-shadow 0.2s, border-color 0.2s, transform 0.2s" }}
              onMouseEnter={e => {
                const el = e.currentTarget;
                el.style.boxShadow = "0 8px 28px rgba(28,8,16,0.12)";
                el.style.borderColor = accent;
                el.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget;
                el.style.boxShadow = "none";
                el.style.borderColor = "var(--line)";
                el.style.transform = "none";
              }}
            >
              <div style={{ fontFamily: "'Tinos', serif", fontSize: "2.8rem", lineHeight: 1, color: "var(--line)", marginBottom: 16 }}>
                {num}
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: accentBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                <Icon size={22} style={{ color: accent }} />
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 6 }}>
                {subtitle}
              </div>
              <h3 style={{ fontFamily: "'Tinos', serif", fontSize: 20, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>
                {title}
              </h3>
              <p style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.55, marginBottom: 20 }}>
                {description}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: accent }}>
                Continuar <ArrowRight size={14} />
              </div>
            </button>
          ))}
        </div>

        {/* Login link */}
        <p style={{ textAlign: "center", fontSize: 14, color: "var(--ink-3)" }}>
          Já tem uma conta?{" "}
          <button
            onClick={() => navigate("/login")}
            style={{ color: "var(--c-vibra)", background: "none", border: "none", cursor: "pointer", fontWeight: 700, fontFamily: "inherit", fontSize: 14 }}
          >
            Fazer login
          </button>
        </p>
      </div>
    </div>
  );
};

export default UserTypeSelection;
