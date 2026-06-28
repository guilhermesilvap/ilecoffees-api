import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

/* ── Icons ── */
function Chevron({ open }: { open: boolean }) {
  return (
    <svg width={10} height={6} viewBox="0 0 10 6"
      style={{ transform: `rotate(${open ? 180 : 0}deg)`, transition: "transform .15s", flexShrink: 0 }}>
      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 14 14" fill="none">
      <path d="M3 7.5L6 10.5L11 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function EditIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 14 14" fill="none">
      <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Logo ── */
function Logo() {
  return (
    <Link to="/" style={{ display: "inline-flex", alignItems: "baseline", gap: 6, textDecoration: "none", color: "inherit" }}>
      <span className="script" style={{ fontSize: 36, lineHeight: 0.75 }}>íle</span>
      <span className="serif italic" style={{ fontSize: 13, lineHeight: 1, color: "var(--c-vibra)" }}>coffees</span>
    </Link>
  );
}

/* ── Header ── */
function Header() {
  const { user, type, supplierType, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  const firstName = user?.name?.split(" ")[0] ?? "Usuário";
  const lastName = user?.name?.split(" ")[1] ?? "";
  const initials = ((firstName[0] ?? "") + (lastName[0] ?? "")).toUpperCase();
  const accountType = (user as any)?.accountType ?? "CUSTOMER";

  const dashboardPath =
    type === "SUPPLIER" ? (supplierType === "PRODUCER" ? "/dashboard/producer" : "/dashboard/supplier")
    : type === "ADMIN" ? "/dashboard/admin"
    : accountType === "COFFEESHOP" ? "/dashboard/coffeeshop"
    : "/dashboard/customer";

  const roleLabel =
    type === "SUPPLIER" ? (supplierType === "PRODUCER" ? "Produtor" : "Torrefador")
    : type === "ADMIN" ? "Admin"
    : accountType === "COFFEESHOP" ? "Cafeteria"
    : "Cliente";

  const avatarBg =
    type === "SUPPLIER" ? "var(--c-glamour)"
    : type === "ADMIN" ? "var(--c-vibra)"
    : accountType === "COFFEESHOP" ? "var(--c-glamour)"
    : "var(--c-mostarda)";

  const avatarColor =
    (type === "SUPPLIER" || type === "ADMIN" || accountType === "COFFEESHOP")
      ? "var(--c-leveza)" : "var(--ink)";

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
          <nav style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <NavLink to="/explore" className="mono" style={({ isActive }) => ({ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" as const, color: isActive ? "var(--ink)" : "var(--ink-2)", textDecoration: "none", borderBottom: isActive ? "1.5px solid var(--ink)" : "1.5px solid transparent", paddingBottom: 1 })}>Catálogo</NavLink>
            <NavLink to="/courses" className="mono" style={({ isActive }) => ({ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" as const, color: isActive ? "var(--ink)" : "var(--ink-2)", textDecoration: "none", borderBottom: isActive ? "1.5px solid var(--ink)" : "1.5px solid transparent", paddingBottom: 1 })}>Cursos</NavLink>
            <NavLink to="/subscriptions" className="mono" style={({ isActive }) => ({ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" as const, color: isActive ? "var(--ink)" : "var(--ink-2)", textDecoration: "none", borderBottom: isActive ? "1.5px solid var(--ink)" : "1.5px solid transparent", paddingBottom: 1 })}>Assinaturas</NavLink>
          </nav>
        </div>

        <div />

        <div ref={menuRef} style={{ position: "relative" }}>
          <button onClick={() => setMenuOpen(o => !o)} style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "6px 14px 6px 6px", borderRadius: 999,
            border: "1px solid var(--line)", background: "var(--paper)",
            cursor: "pointer", fontFamily: "inherit",
          }}>
            <span style={{
              width: 34, height: 34, borderRadius: 999, flexShrink: 0, overflow: "hidden",
              background: avatarBg, color: avatarColor,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 600, letterSpacing: ".02em",
            }}>
              {(user as any)?.photoUrl
                ? <img src={(user as any).photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : (initials || "?")}
            </span>
            <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 }}>
              <span style={{ fontSize: 14, color: "var(--ink)", fontWeight: 500, lineHeight: 1 }}>{firstName}</span>
              <span className="mono" style={{ fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-2)", lineHeight: 1 }}>{roleLabel}</span>
            </span>
            <Chevron open={menuOpen} />
          </button>
          {menuOpen && (
            <div style={{
              position: "absolute", right: 0, top: "calc(100% + 8px)", zIndex: 50,
              minWidth: 160, background: "var(--paper)",
              border: "1px solid var(--line)", borderRadius: 12,
              boxShadow: "0 8px 24px rgba(0,0,0,.08)", padding: 6,
            }}>
              <Link to={dashboardPath} onClick={() => setMenuOpen(false)} style={{
                display: "block", padding: "10px 14px", borderRadius: 8,
                fontSize: 14, color: "var(--ink)", textDecoration: "none",
              }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--bg)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >Meu painel</Link>
              <div style={{ height: 1, background: "var(--line)", margin: "4px 0" }} />
              <button onClick={() => { logout(); navigate("/"); setMenuOpen(false); }} style={{
                display: "block", width: "100%", padding: "10px 14px", borderRadius: 8,
                fontSize: 14, color: "var(--ink-2)", background: "none", border: "none",
                cursor: "pointer", fontFamily: "inherit", textAlign: "left",
              }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--bg)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >Sair</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ── Field ── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label className="mono" style={{ fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--ink-2)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

/* ── Page ── */
function useIsMobile(bp = 768) {
  const [m, setM] = useState(() => typeof window !== "undefined" && window.innerWidth < bp);
  useEffect(() => {
    const h = () => setM(window.innerWidth < bp);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, [bp]);
  return m;
}

export default function Profile() {
  const { user, type, supplierType } = useAuth();
  const mob = useIsMobile();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accountType = (user as any)?.accountType ?? "CUSTOMER";

  const [profile, setProfile] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: (user as any)?.phone ?? "",
    bio: (user as any)?.bio ?? "",
  });

  const firstName = profile.name.split(" ")[0] ?? "";
  const lastName = profile.name.split(" ")[1] ?? "";
  const initials = ((firstName[0] ?? "") + (lastName[0] ?? "")).toUpperCase();

  const avatarBg =
    type === "SUPPLIER" ? "var(--c-glamour)"
    : type === "ADMIN" ? "var(--c-vibra)"
    : accountType === "COFFEESHOP" ? "var(--c-glamour)"
    : "var(--c-mostarda)";

  const avatarColor =
    (type === "SUPPLIER" || type === "ADMIN" || accountType === "COFFEESHOP")
      ? "var(--c-leveza)" : "var(--ink)";

  const roleLabel =
    type === "SUPPLIER" ? (supplierType === "PRODUCER" ? "Produtor" : "Torrefador")
    : type === "ADMIN" ? "Admin"
    : accountType === "COFFEESHOP" ? "Cafeteria"
    : "Cliente";

  const inputStyle = (disabled: boolean): React.CSSProperties => ({
    width: "100%", padding: "11px 14px", borderRadius: 10,
    border: "1px solid var(--line)",
    background: disabled ? "var(--bg-2)" : "var(--paper)",
    color: disabled ? "var(--ink-2)" : "var(--ink)",
    fontSize: 14, fontFamily: "inherit",
    outline: "none", boxSizing: "border-box",
    transition: "border-color .15s",
  });

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const endpoint = type === "SUPPLIER" ? "/suppliers/profile" : "/users/profile";
      await api.put(endpoint, { name: profile.name, phone: profile.phone || undefined });
      setIsEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2400);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Erro ao salvar perfil.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--ink)" }}>
      <Header />

      {/* Page title */}
      <section style={{ borderBottom: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: mob ? "32px 16px 24px" : "48px 32px 36px" }}>
          <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)" }}>
            <span style={{ color: "var(--c-vibra)" }}>§</span>&nbsp; Minha Conta
          </div>
          <h1 className="serif" style={{ margin: "12px 0 0", fontSize: "clamp(40px, 5vw, 72px)", lineHeight: 0.92, letterSpacing: "-.025em" }}>
            Olá, <span className="italic" style={{ color: "var(--c-vibra)" }}>{firstName}</span>.
          </h1>
        </div>
      </section>

      <main style={{ maxWidth: 1320, margin: "0 auto", padding: mob ? "24px 16px 60px" : "40px 32px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "280px 1fr", gap: 28, alignItems: "start" }}>

          {/* Sidebar — avatar + role */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{
              borderRadius: 20, border: "1px solid var(--line)", background: "var(--paper)",
              padding: "32px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
              textAlign: "center",
            }}>
              <div style={{
                width: 80, height: 80, borderRadius: 999, overflow: "hidden",
                background: avatarBg, color: avatarColor,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 26, fontWeight: 700, letterSpacing: ".03em",
              }}>
                {(user as any)?.photoUrl
                  ? <img src={(user as any).photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : (initials || "?")}
              </div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 600, color: "var(--ink)" }}>{profile.name || "—"}</div>
                <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 2 }}>{profile.email}</div>
              </div>
              <span className="mono" style={{
                fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase",
                padding: "5px 14px", borderRadius: 999,
                background: avatarBg, color: avatarColor,
              }}>{roleLabel}</span>
            </div>
          </div>

          {/* Form */}
          <div style={{ borderRadius: 20, border: "1px solid var(--line)", background: "var(--paper)", padding: "32px 32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
              <div className="serif" style={{ fontSize: 22, letterSpacing: "-.01em" }}>Informações pessoais</div>
              <div style={{ display: "flex", gap: 8 }}>
                {isEditing && (
                  <button onClick={() => setIsEditing(false)} style={{
                    padding: "9px 18px", borderRadius: 999, fontSize: 13,
                    border: "1px solid var(--line)", background: "none",
                    color: "var(--ink-2)", cursor: "pointer", fontFamily: "inherit",
                  }}>Cancelar</button>
                )}
                <button
                  onClick={isEditing ? handleSave : () => setIsEditing(true)}
                  disabled={isSaving}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 7,
                    padding: "9px 18px", borderRadius: 999, fontSize: 13,
                    background: isEditing ? "var(--ink)" : "var(--paper)",
                    color: isEditing ? "var(--c-leveza)" : "var(--ink)",
                    border: "1px solid var(--ink)",
                    cursor: isSaving ? "not-allowed" : "pointer",
                    fontFamily: "inherit", opacity: isSaving ? 0.6 : 1,
                    transition: "opacity .15s",
                  }}
                >
                  {isEditing ? <><CheckIcon />{isSaving ? "Salvando…" : "Salvar"}</> : <><EditIcon />Editar</>}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                padding: "12px 16px", borderRadius: 10, marginBottom: 20,
                background: "rgba(180,30,30,.08)", border: "1px solid rgba(180,30,30,.2)",
                fontSize: 13, color: "#b41e1e",
              }}>{error}</div>
            )}

            {saved && (
              <div style={{
                padding: "12px 16px", borderRadius: 10, marginBottom: 20,
                background: "rgba(46,114,68,.08)", border: "1px solid var(--success)",
                fontSize: 13, color: "var(--success)", display: "flex", alignItems: "center", gap: 8,
              }}>
                <CheckIcon /> Perfil atualizado com sucesso.
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 20 }}>
              <Field label="Nome completo">
                <input
                  value={profile.name}
                  onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  disabled={!isEditing}
                  style={inputStyle(!isEditing)}
                  onFocus={e => { if (isEditing) e.currentTarget.style.borderColor = "var(--ink)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "var(--line)"; }}
                />
              </Field>

              <Field label="E-mail">
                <input value={profile.email} disabled style={inputStyle(true)} />
              </Field>

              <Field label="Telefone">
                <input
                  value={profile.phone}
                  onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="(11) 99999-9999"
                  style={inputStyle(!isEditing)}
                  onFocus={e => { if (isEditing) e.currentTarget.style.borderColor = "var(--ink)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "var(--line)"; }}
                />
              </Field>

              <Field label="Tipo de conta">
                <input value={roleLabel} disabled style={inputStyle(true)} />
              </Field>

              {type !== "SUPPLIER" && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <Field label="Sobre você">
                    <textarea
                      value={profile.bio}
                      onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="Conte um pouco sobre seus gostos e preferências…"
                      rows={4}
                      style={{
                        ...inputStyle(!isEditing),
                        resize: "vertical", lineHeight: 1.55,
                      }}
                      onFocus={e => { if (isEditing) e.currentTarget.style.borderColor = "var(--ink)"; }}
                      onBlur={e => { e.currentTarget.style.borderColor = "var(--line)"; }}
                    />
                  </Field>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      <footer style={{ borderTop: "1px solid var(--line)", padding: "24px 32px", fontSize: 12, color: "var(--ink-2)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <span className="mono" style={{ letterSpacing: ".12em", textTransform: "uppercase" }}>
            © 2026 Ilé Coffees · desde 1934
          </span>
          <div style={{ display: "flex", gap: 18 }}>
            <Link to="/explore" style={{ color: "inherit", textDecoration: "none" }}>Catálogo</Link>
            <Link to="/courses" style={{ color: "inherit", textDecoration: "none" }}>Cursos</Link>
            <Link to="/subscriptions" style={{ color: "inherit", textDecoration: "none" }}>Assinaturas</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
