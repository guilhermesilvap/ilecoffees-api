import { useEffect, useState, useRef } from "react";
import { EcosystemSection } from "@/components/EcosystemSection";
import { useNavigate, Link, NavLink } from "react-router-dom";
import { Logo } from "@/components/ui/logo";
import { CartButton } from "@/components/Cart/CartButton";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import heroImage from "@/assets/hero-coffee.jpg";
import { useMobile } from "@/contexts/MobileContext";

interface CoffeeProduct {
  id: string;
  name: string;
  description: string | null;
  region: string | null;
  saleType: "KG" | "PACKAGE";
  pricePerKg: number | null;
  packagePrice: number | null;
  packageWeight: number | null;
  photoUrl: string | null;
  score: number | null;
  supplier?: { id: string; name: string; photoUrl: string | null; supplierType: string } | null;
}

interface Supplier {
  id: string;
  name: string;
  photoUrl: string | null;
  supplierType: string;
  city?: string | null;
  state?: string | null;
}


function ArrowIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2.5 7h9M7.8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const CustomerHome = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [coffees, setCoffees] = useState<CoffeeProduct[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<CoffeeProduct[]>("/coffees").then(r => r.data.slice(0, 6)).catch(() => [] as CoffeeProduct[]),
      api.get<Supplier[]>("/suppliers").then(r => r.data).catch(() => [] as Supplier[]),
    ]).then(([c, s]) => {
      setCoffees(c);
      setSuppliers(s.slice(0, 12));
    }).finally(() => setIsLoading(false));
  }, []);

  const firstName = user?.name?.split(" ")[0] ?? "";
  const lastName = user?.name?.split(" ")[1] ?? "";
  const initials = ((firstName[0] ?? "") + (lastName[0] ?? "")).toUpperCase();
  const mob = useMobile();
  const [navOpen, setNavOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--ink)" }}>

      {/* ── Header ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(238,243,235,.92)", backdropFilter: "blur(10px)", borderBottom: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: mob ? "14px 20px" : "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          {mob ? (
            <>
              <Logo />
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <CartButton />
                <button onClick={() => setNavOpen(o => !o)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: "var(--ink)", lineHeight: 0 }}>
                  {navOpen
                    ? <svg width={20} height={20} viewBox="0 0 20 20"><path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                    : <svg width={20} height={20} viewBox="0 0 20 20"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                  }
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <Logo />
                <span style={{ width: 1, height: 20, background: "var(--ink)", opacity: 0.15 }} />
                <nav style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <NavLink to="/explore" className="mono" style={({ isActive }) => ({ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" as const, color: isActive ? "var(--ink)" : "var(--ink-2)", textDecoration: "none", borderBottom: isActive ? "1.5px solid var(--ink)" : "1.5px solid transparent", paddingBottom: 1 })}>Catálogo</NavLink>
                  <NavLink to="/courses" className="mono" style={({ isActive }) => ({ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" as const, color: isActive ? "var(--ink)" : "var(--ink-2)", textDecoration: "none", borderBottom: isActive ? "1.5px solid var(--ink)" : "1.5px solid transparent", paddingBottom: 1 })}>Cursos</NavLink>
                  <NavLink to="/subscriptions" className="mono" style={({ isActive }) => ({ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" as const, color: isActive ? "var(--ink)" : "var(--ink-2)", textDecoration: "none", borderBottom: isActive ? "1.5px solid var(--ink)" : "1.5px solid transparent", paddingBottom: 1 })}>Assinaturas</NavLink>
                </nav>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <CartButton />
                <div ref={menuRef} style={{ position: "relative" }}>
                  <button onClick={() => setMenuOpen(o => !o)} style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "6px 14px 6px 6px", borderRadius: 999, border: "1px solid var(--line)", background: "var(--paper)", cursor: "pointer", fontFamily: "inherit" }}>
                    <span style={{ width: 34, height: 34, borderRadius: 999, flexShrink: 0, background: "var(--c-mostarda)", color: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, overflow: "hidden" }}>
                      {(user as any)?.photoUrl ? <img src={(user as any).photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (initials || "?")}
                    </span>
                    <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 }}>
                      <span style={{ fontSize: 14, color: "var(--ink)", fontWeight: 500, lineHeight: 1 }}>{firstName || "Usuário"}</span>
                      <span className="mono" style={{ fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-2)", lineHeight: 1 }}>Cliente</span>
                    </span>
                    <svg width={10} height={6} viewBox="0 0 10 6" style={{ transform: menuOpen ? "rotate(180deg)" : undefined, transition: "transform .15s", flexShrink: 0 }}>
                      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
                    </svg>
                  </button>
                  {menuOpen && (
                    <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", zIndex: 50, minWidth: 160, background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,.08)", padding: 6 }}>
                      <Link to="/dashboard/customer" onClick={() => setMenuOpen(false)} style={{ display: "block", padding: "10px 14px", borderRadius: 8, fontSize: 14, color: "var(--ink)", textDecoration: "none" }}
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
              </div>
            </>
          )}
        </div>

        {mob && navOpen && (
          <div style={{ borderTop: "1px solid var(--line)", background: "rgba(238,243,235,.98)", padding: "12px 20px 24px" }}>
            <nav style={{ display: "flex", flexDirection: "column" }}>
              {([["Catálogo", "/explore"], ["Cursos", "/courses"], ["Assinaturas", "/subscriptions"]] as [string, string][]).map(([label, to]) => (
                <Link key={label} to={to} onClick={() => setNavOpen(false)} style={{ padding: "14px 4px", fontSize: 18, color: "var(--ink)", textDecoration: "none", borderBottom: "1px solid var(--line)" }}>{label}</Link>
              ))}
            </nav>
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <Link to="/dashboard/customer" style={{ flex: 1, textAlign: "center" as const, padding: "13px", fontSize: 15, color: "var(--ink)", border: "1.5px solid rgba(28,8,16,.2)", borderRadius: 999, textDecoration: "none" }}>Meu painel</Link>
              <button onClick={() => { logout(); navigate("/"); }} style={{ flex: 1, padding: "13px", fontSize: 15, background: "var(--ink)", color: "var(--c-leveza)", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit" }}>Sair</button>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section style={{ position: "relative", minHeight: mob ? "72vh" : "88vh", display: "flex", alignItems: "center", overflow: "hidden", borderBottom: "1px solid var(--ink)" }}>
        <img src={heroImage} alt="" aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
        <div style={{
          position: "absolute", inset: 0,
          background: mob
            ? "linear-gradient(to bottom, rgba(15,35,21,.52) 0%, rgba(15,35,21,.78) 60%, rgba(15,35,21,.96) 100%)"
            : "linear-gradient(105deg, rgba(15,35,21,.9) 0%, rgba(15,35,21,.82) 38%, rgba(15,35,21,.44) 68%, rgba(15,35,21,.18) 100%)",
        }} />
        <span className="script" aria-hidden="true" style={{
          position: "absolute", right: mob ? -20 : "4%", bottom: mob ? -40 : -60,
          fontSize: mob ? "clamp(180px, 55vw, 320px)" : "clamp(260px, 32vw, 520px)", lineHeight: 1,
          color: "var(--c-mostarda)", opacity: mob ? 0.1 : 0.12,
          userSelect: "none", pointerEvents: "none", zIndex: 1,
        }}>íle</span>

        <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 1320, margin: "0 auto", padding: mob ? "56px 20px 64px" : "0 32px" }}>
          <div style={{ maxWidth: mob ? "100%" : 660 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: mob ? 24 : 32 }}>
              <span style={{ width: 24, height: 1, background: "var(--c-mostarda)", flexShrink: 0 }} />
              <span className="mono" style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(244,204,160,.65)" }}>
                {user?.name ? `Bem-vindo de volta, ${firstName}` : "Plataforma curada por íle"}
              </span>
            </div>

            <h1 className="serif" style={{
              margin: `0 0 ${mob ? 18 : 24}px`,
              fontSize: mob ? "clamp(48px, 13vw, 82px)" : "clamp(60px, 7vw, 118px)",
              lineHeight: 0.9, letterSpacing: "-.035em", color: "var(--c-leveza)",
            }}>
              {user?.name
                ? <><span>Olá,</span><br /><span className="italic" style={{ color: "var(--c-mostarda)" }}>{firstName}.</span></>
                : <>
                    <span>Muitas marcas.</span><br />
                    <span className="italic" style={{ color: "var(--c-mostarda)" }}>Uma plataforma.</span>
                  </>
              }
            </h1>

            <p style={{ fontSize: mob ? 15 : 17, lineHeight: 1.65, color: "rgba(244,204,160,.8)", maxWidth: 460, margin: `0 0 ${mob ? 32 : 40}px` }}>
              Torrefadores independentes, cooperativas e fazendas de todo o Brasil — selecionados e curados pela equipe íle para chegar até você.
            </p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link to="/explore" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: mob ? "14px 22px" : "16px 28px", background: "var(--c-mostarda)", color: "var(--ink)", borderRadius: 999, fontSize: mob ? 14 : 15, textDecoration: "none", fontWeight: 500 }}>
                Explorar marcas <ArrowIcon />
              </Link>
              <Link to="/courses" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: mob ? "13px 20px" : "15px 24px", borderRadius: 999, fontSize: mob ? 14 : 15, color: "var(--c-leveza)", border: "1.5px solid rgba(244,204,160,.3)", textDecoration: "none" }}>
                Ver cursos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Navegação rápida ── */}
      <div style={{ background: "var(--c-glamour)", borderBottom: "1px solid var(--ink)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(3, 1fr)" }}>
          {([
            ["01", "Catálogo", "Centenas de cafés, dezenas de marcas", "/explore"],
            ["02", "Assinaturas", "O melhor dos parceiros íle, toda quinzena", "/subscriptions"],
            ["03", "Cursos", "Aprenda com Q-Graders e baristas", "/courses"],
          ] as [string, string, string, string][]).map(([n, title, sub, to], i) => (
            <Link key={n} to={to} style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: mob ? "22px 20px" : "28px 32px", borderRight: !mob && i < 2 ? "1px solid rgba(244,204,160,.15)" : undefined, borderTop: mob && i > 0 ? "1px solid rgba(244,204,160,.15)" : undefined }}>
              <div>
                <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(244,204,160,.45)", marginBottom: 6 }}>{n}</div>
                <div className="serif" style={{ fontSize: mob ? 20 : 24, lineHeight: 1, color: "var(--c-leveza)", letterSpacing: "-.01em" }}>{title}</div>
                <div style={{ fontSize: 13, color: "rgba(244,204,160,.55)", marginTop: 4 }}>{sub}</div>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: 999, border: "1px solid rgba(244,204,160,.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "var(--c-leveza)" }}>
                <ArrowIcon size={13} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Torrefadores parceiros ── */}
      {suppliers.length > 0 && (
        <section style={{ borderBottom: "1px solid var(--line)", background: "var(--paper)" }}>
          <div style={{ maxWidth: 1320, margin: "0 auto", padding: mob ? "40px 20px 48px" : "56px 32px 64px" }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: mob ? 24 : 36 }}>
              <div>
                <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)" }}>§01 · Parceiros</div>
                <h2 className="serif" style={{ margin: "10px 0 0", fontSize: mob ? "clamp(28px, 7vw, 44px)" : "clamp(32px, 4vw, 58px)", lineHeight: 0.95, letterSpacing: "-.02em" }}>
                  Quem está <span className="italic" style={{ color: "var(--c-vibra)" }}>aqui</span>.
                </h2>
              </div>
              <Link to="/explore" className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", textDecoration: "none", flexShrink: 0 }}>
                Ver catálogo →
              </Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(4, 1fr)", gap: mob ? 10 : 14 }}>
              {suppliers.map((s) => {
                const initials2 = s.name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
                const typeLabel = s.supplierType === "ROASTER" ? "Torrefador" : s.supplierType === "PRODUCER" ? "Produtor" : s.supplierType;
                return (
                  <Link key={s.id} to={`/explore?supplier=${s.id}`} style={{ textDecoration: "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", border: "1px solid var(--line)", borderRadius: 14, background: "var(--bg)", transition: "border-color .15s, background .15s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--ink)"; (e.currentTarget as HTMLDivElement).style.background = "var(--paper)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--line)"; (e.currentTarget as HTMLDivElement).style.background = "var(--bg)"; }}
                    >
                      <span style={{ width: 40, height: 40, borderRadius: 999, flexShrink: 0, overflow: "hidden", background: "var(--c-glamour)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "var(--c-leveza)" }}>
                        {s.photoUrl
                          ? <img src={s.photoUrl} alt={s.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : initials2}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--ink)" }}>{s.name}</div>
                        <div className="mono" style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink-2)", marginTop: 2 }}>
                          {typeLabel}{s.state ? ` · ${s.state}` : ""}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {suppliers.length >= 12 && (
              <div style={{ marginTop: 20, textAlign: "center" }}>
                <Link to="/explore" className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", textDecoration: "none" }}>
                  + Ver todos os parceiros →
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Cafés em destaque ── */}
      <section style={{ borderTop: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: mob ? "48px 20px 60px" : "72px 32px 96px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: mob ? 28 : 48 }}>
            <div>
              <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)" }}>§02 · Destaques</div>
              <h2 className="serif" style={{ margin: "12px 0 0", fontSize: mob ? "clamp(32px, 8vw, 52px)" : "clamp(36px, 5vw, 72px)", lineHeight: 0.95, letterSpacing: "-.02em" }}>
                Cafés em <span className="italic" style={{ color: "var(--c-vibra)" }}>destaque</span>.
              </h2>
              <p style={{ margin: "10px 0 0", fontSize: 14, color: "var(--ink-2)" }}>
                Selecionados pela curadoria íle entre nossos parceiros.
              </p>
            </div>
            <Link to="/explore" className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", textDecoration: "none", flexShrink: 0 }}>
              Ver todos →
            </Link>
          </div>

          {isLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "64px 0" }}>
              <Loader2 size={28} className="animate-spin" style={{ color: "var(--c-vibra)" }} />
            </div>
          ) : coffees.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 0", color: "var(--ink-2)" }}>
              <div className="serif italic" style={{ fontSize: 24 }}>Nenhum café disponível no momento.</div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: mob ? "repeat(2, 1fr)" : "repeat(3, 1fr)", gap: mob ? 12 : 16 }}>
              {coffees.map((coffee) => {
                const price = coffee.saleType === "KG" ? coffee.pricePerKg ?? 0 : coffee.packagePrice ?? 0;
                return <CoffeeCard key={coffee.id} coffee={coffee} price={price} mob={mob} />;
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Como funciona ── */}
      <section style={{ background: "var(--paper)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: mob ? "48px 20px 56px" : "72px 32px 80px" }}>
          <div style={{ marginBottom: mob ? 32 : 48 }}>
            <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)" }}>§03 · Como funciona</div>
            <h2 className="serif" style={{ margin: "12px 0 0", fontSize: mob ? "clamp(28px, 7vw, 46px)" : "clamp(32px, 4.5vw, 64px)", lineHeight: 0.95, letterSpacing: "-.02em" }}>
              Do torrefador <span className="italic" style={{ color: "var(--c-vibra)" }}>à sua xícara</span>.
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(3, 1fr)", gap: mob ? 1 : 0, border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden" }}>
            {([
              ["01", "Curadoria rigorosa", "Cada torrefador passa pela avaliação da equipe íle antes de entrar na plataforma. Qualidade e origem rastreável são inegociáveis."],
              ["02", "Você escolhe a marca", "Navegue pelo catálogo e filtre por região, processo, pontuação e torrefador. Cada compra vai direto da origem para você."],
              ["03", "Receba com frequência", "Monte uma assinatura com os cafés que você ama ou compre por demanda. Entregamos frescos, no prazo e com rastreio."],
            ] as [string, string, string][]).map(([n, title, desc], i) => (
              <div key={n} style={{ padding: mob ? "28px 20px" : "36px 32px", borderTop: mob && i > 0 ? "1px solid var(--line)" : undefined, borderLeft: !mob && i > 0 ? "1px solid var(--line)" : undefined }}>
                <div className="mono" style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 16 }}>{n}</div>
                <h3 className="serif" style={{ margin: "0 0 12px", fontSize: mob ? 22 : 28, lineHeight: 1.05, letterSpacing: "-.01em" }}>{title}</h3>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: "var(--ink-2)" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Assinatura CTA ── */}
      <section style={{ background: "var(--c-vibra)", color: "var(--c-leveza)", borderTop: "1px solid var(--ink)", position: "relative", overflow: "hidden" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: mob ? "72px 20px" : "100px 32px", position: "relative", zIndex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1.3fr 1fr auto", gap: mob ? 24 : 36, alignItems: "end" }}>
            <div>
              <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", opacity: 0.85 }}>§04 · Assinatura</div>
              <h3 className="serif" style={{ margin: "16px 0 0", fontSize: mob ? "clamp(32px, 8vw, 52px)" : "clamp(40px, 5vw, 72px)", lineHeight: 0.95, letterSpacing: "-.02em" }}>
                Cafés que <span className="italic" style={{ color: "var(--c-mostarda)" }}>brotam</span><br />da terra,<br />toda quinzena.
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: mob ? 15 : 16, lineHeight: 1.55, maxWidth: 320, opacity: 0.92 }}>
              Você escolhe a marca e a frequência. A curadoria íle garante que só os melhores lotes chegam até você.
            </p>
            <Link to="/subscriptions" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "16px 24px", background: "var(--c-leveza)", color: "var(--ink)", borderRadius: 999, fontSize: 15, whiteSpace: "nowrap" as const, border: "1.5px solid var(--ink)", textDecoration: "none" }}>
              Ver planos <ArrowIcon />
            </Link>
          </div>
        </div>
        <div className="script" aria-hidden="true" style={{ position: "absolute", right: -30, bottom: mob ? -60 : -80, fontSize: mob ? 200 : 360, lineHeight: 1, color: "var(--c-mostarda)", opacity: 0.35, pointerEvents: "none", letterSpacing: "-.04em" }}>
          íle
        </div>
      </section>

      <EcosystemSection highlight="customer" />

      {/* ── Footer ── */}
      <footer style={{ background: "var(--c-glamour)", color: "var(--c-leveza)", borderTop: "1px solid var(--ink)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: mob ? "24px 20px" : "32px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <Logo />
            <span style={{ fontSize: 11, color: "rgba(244,204,160,.55)", marginTop: 4 }}>Uma plataforma íle · conectando marcas e apaixonados por café</span>
          </div>
          <span className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", opacity: 0.65 }}>
            © 2026 Ilé Coffees · CNPJ 47.221.118/0001-09
          </span>
          <div style={{ display: "flex", gap: 22 }}>
            <Link to="/explore" style={{ fontSize: 13, color: "var(--c-leveza)", opacity: 0.85, textDecoration: "none" }}>Catálogo</Link>
            <Link to="/courses" style={{ fontSize: 13, color: "var(--c-leveza)", opacity: 0.85, textDecoration: "none" }}>Cursos</Link>
            <Link to="/subscriptions" style={{ fontSize: 13, color: "var(--c-leveza)", opacity: 0.85, textDecoration: "none" }}>Assinaturas</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

function CoffeeCard({ coffee, price, mob }: { coffee: CoffeeProduct; price: number; mob: boolean }) {
  const [hovered, setHovered] = useState(false);
  const supplierInitials = coffee.supplier?.name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() ?? "";
  return (
    <Link to={`/product/${coffee.id}`} style={{ textDecoration: "none" }}>
      <article
        style={{
          border: "1.5px solid var(--line)", borderRadius: 16, overflow: "hidden",
          background: "var(--paper)", transition: "transform .22s ease, box-shadow .22s ease",
          transform: hovered ? "translateY(-4px)" : "none",
          boxShadow: hovered ? "0 16px 40px -16px rgba(28,8,16,.2)" : "none",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={{ height: mob ? 160 : 200, background: "var(--bg-2)", position: "relative", overflow: "hidden" }}>
          {coffee.photoUrl
            ? <img src={coffee.photoUrl} alt={coffee.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="mono" style={{ fontSize: 28, color: "var(--ink)", opacity: 0.12, letterSpacing: ".1em" }}>CAFÉ</span>
              </div>
          }
          {coffee.score != null && (
            <span className="mono" style={{ position: "absolute", top: 10, right: 10, fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", padding: "4px 9px", background: "var(--ink)", color: "var(--c-leveza)", borderRadius: 999 }}>
              {coffee.score} pts
            </span>
          )}
          {coffee.supplier && (
            <div style={{ position: "absolute", top: 10, left: 10, display: "flex", alignItems: "center", gap: 6, background: "rgba(15,35,20,.72)", backdropFilter: "blur(6px)", borderRadius: 999, padding: "4px 10px 4px 4px", border: "1px solid rgba(255,255,255,.12)" }}>
              <span style={{ width: 22, height: 22, borderRadius: 999, flexShrink: 0, overflow: "hidden", background: "var(--c-mostarda)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: "var(--ink)" }}>
                {coffee.supplier.photoUrl
                  ? <img src={coffee.supplier.photoUrl} alt={coffee.supplier.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : supplierInitials}
              </span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,.90)", maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}>
                {coffee.supplier.name}
              </span>
            </div>
          )}
        </div>
        <div style={{ padding: mob ? "12px 14px 14px" : "14px 16px 18px" }}>
          {coffee.region && (
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 6 }}>
              {coffee.region}
            </div>
          )}
          <h3 className="serif" style={{ margin: "0 0 10px", fontSize: mob ? 17 : 22, lineHeight: 1.05, letterSpacing: "-.01em", color: "var(--ink)" }}>
            {coffee.name}
          </h3>
          <div className="serif" style={{ fontSize: mob ? 17 : 21, color: "var(--c-vibra)", lineHeight: 1 }}>
            {fmt(price)}
            {coffee.saleType === "KG" && (
              <span className="mono" style={{ fontSize: 10, color: "var(--ink-2)", marginLeft: 4 }}>/kg</span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

export default CustomerHome;
