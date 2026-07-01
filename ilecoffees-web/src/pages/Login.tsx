import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { AxiosError } from "axios";
import { useMobile } from "@/contexts/MobileContext";

function ArrowIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2.5 7h9M7.8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Logo({ size = 28 }: { size?: number }) {
  return (
    <Link to="/" style={{ display: "inline-flex", alignItems: "baseline", gap: 6, textDecoration: "none" }}>
      <span className="script" style={{ fontSize: size * 1.6, lineHeight: 0.75, color: "currentColor" }}>íle</span>
      <span className="serif italic" style={{ fontSize: size * 0.46, lineHeight: 1, color: "var(--c-vibra)" }}>coffees</span>
    </Link>
  );
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" style={{ animation: "spin 0.8s linear infinite" }}>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" fill="none" opacity=".3" />
      <path d="M14 8a6 6 0 00-6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
      <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M9 5v5M9 12.5v.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function CheckCircle() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5.5 9.2L7.8 11.5L12.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ErrorDot() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6 3.5v3M6 8.4v.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconCup() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M5 9h12v6a4 4 0 01-4 4H9a4 4 0 01-4-4V9z" stroke="var(--ink)" strokeWidth="1.4" />
      <path d="M17 11h2a2 2 0 010 4h-2" stroke="var(--ink)" strokeWidth="1.4" />
      <path d="M8 4c0 1.5-1 1.5-1 3M12 4c0 1.5-1 1.5-1 3" stroke="var(--c-vibra)" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconBag() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M5 8h14v13a1 1 0 01-1 1H6a1 1 0 01-1-1V8z" stroke="var(--ink)" strokeWidth="1.4" />
      <path d="M9 8V5a3 3 0 016 0v3" stroke="var(--ink)" strokeWidth="1.4" />
      <circle cx="12" cy="14" r="1.6" fill="var(--c-vibra)" />
    </svg>
  );
}

function inputStyle(hasError: boolean): React.CSSProperties {
  return {
    width: "100%", padding: "14px 16px",
    border: `1px solid ${hasError ? "var(--error, #b8231a)" : "var(--line)"}`,
    background: "var(--paper)", borderRadius: 12, fontSize: 15, outline: "none",
    transition: "border-color .12s ease, box-shadow .12s ease", fontFamily: "inherit", color: "var(--ink)",
    boxShadow: hasError ? "0 0 0 3px rgba(184,35,26,.14)" : "none",
  };
}

function Field({ label, error, hint, actionLabel, onAction, children }: {
  label: string; error?: string | null; hint?: string | null;
  actionLabel?: string; onAction?: () => void; children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <label className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)" }}>{label}</label>
        {actionLabel && (
          <button type="button" onClick={onAction} style={{ fontSize: 13, color: "var(--c-vibra)", background: "none", border: "none", cursor: "pointer" }}>{actionLabel}</button>
        )}
      </div>
      {children}
      {error ? (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, color: "var(--error, #b8231a)", fontSize: 13 }}>
          <ErrorDot /> {error}
        </div>
      ) : hint ? (
        <div style={{ marginTop: 8, color: "var(--ink-2)", fontSize: 12 }}>{hint}</div>
      ) : null}
    </div>
  );
}

function SignupCard({ kind, sub, to, icon, primary }: { kind: string; sub: string; to: string; icon: React.ReactNode; primary?: boolean }) {
  return (
    <Link to={to} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", border: `1px solid ${primary ? "var(--ink)" : "var(--line)"}`, borderRadius: 12, background: "var(--paper)", textDecoration: "none", color: "var(--ink)", transition: "background .12s ease" }}
      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-2)")}
      onMouseLeave={e => (e.currentTarget.style.background = "var(--paper)")}
    >
      <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--bg-2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 500 }}>Criar conta · {kind}</div>
        <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 2 }}>{sub}</div>
      </div>
      <ArrowIcon size={12} />
    </Link>
  );
}

function SidePanel() {
  return (
    <aside style={{ background: "var(--bg-2)", padding: "56px 56px 40px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden", borderRight: "1px solid var(--line)", minHeight: 600 }}>
      <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)", display: "inline-flex", alignItems: "center", gap: 10 }}>
        <span style={{ color: "var(--c-vibra)" }}>§</span> Boa torra · Maio 2026
      </div>

      <div>
        <div className="serif italic" style={{ fontSize: "clamp(40px, 5vw, 64px)", lineHeight: 1.05, letterSpacing: "-.015em", maxWidth: 460 }}>
          "Bom dia. <br />Que sua xícara<br />seja incrível <span style={{ color: "var(--c-vibra)" }}>hoje</span>."
        </div>
        <div className="mono" style={{ marginTop: 18, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)" }}>
          — Marina, Torrefadora · Fazenda Vargem Grande
        </div>
      </div>

      <div style={{ display: "flex", gap: 24, alignItems: "flex-end", marginTop: 56 }}>
        <div style={{ width: 160, aspectRatio: "3 / 4", borderRadius: 12, overflow: "hidden", background: "var(--ink-3)", border: "1px solid var(--line)", position: "relative", boxShadow: "0 18px 36px -18px rgba(26,20,13,.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span className="script" style={{ fontSize: 80, color: "var(--c-leveza)", opacity: 0.3 }}>íle</span>
        </div>
        <div style={{ paddingBottom: 8 }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)" }}>Destaque do lote</div>
          <div className="serif" style={{ fontSize: 28, lineHeight: 1, marginTop: 6, letterSpacing: "-.01em" }}>Pedra Redonda</div>
          <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 4 }}>Mantiqueira · 1.420 m</div>
          <div className="serif italic" style={{ fontSize: 16, color: "var(--c-vibra)", marginTop: 8, maxWidth: 200 }}>amêndoa · caramelo · maçã verde</div>
        </div>
      </div>

      <div className="serif italic" aria-hidden="true" style={{ position: "absolute", right: -40, bottom: -90, fontSize: 360, lineHeight: 1, color: "var(--ink)", opacity: 0.04, pointerEvents: "none", letterSpacing: "-.04em" }}>
        ilé
      </div>
    </aside>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const emailRef = useRef<HTMLInputElement>(null);
  const { login } = useAuth();

  useEffect(() => { emailRef.current?.focus(); }, []);

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailErr = !email ? "Informe seu e-mail." : !emailRe.test(email) ? "Formato de e-mail inválido." : null;
  const passErr = !password ? "Informe sua senha." : password.length < 6 ? "A senha deve ter ao menos 6 caracteres." : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (emailErr || passErr) return;
    setStatus("loading");
    setSubmitError(null);
    try {
      await login(email, password);
      setStatus("success");
    } catch (err) {
      setStatus("idle");
      const msg = err instanceof AxiosError ? (err.response?.data?.message ?? "E-mail ou senha inválidos.") : "E-mail ou senha inválidos.";
      setSubmitError(msg);
    }
  }

  const showEmailErr = touched.email ? emailErr : null;
  const showPassErr = touched.password ? passErr : null;

  const mob = useMobile();
  return (
    <section style={{ padding: mob ? "40px 20px 48px" : "72px 56px", display: "flex", flexDirection: "column", justifyContent: "center", minHeight: mob ? "auto" : 600 }}>
      <div style={{ maxWidth: 420, width: "100%", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <Logo size={32} />
          <h1 className="serif" style={{ margin: "28px 0 0", fontSize: 44, lineHeight: 1.02, letterSpacing: "-.015em" }}>
            Entre na sua <span className="italic" style={{ color: "var(--c-vibra)" }}>conta</span>
          </h1>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 14, flexWrap: "wrap" }}>
            {[
              { label: "Consumidor", color: "var(--c-mostarda)" },
              { label: "Cafeteria", color: "var(--c-vibra)" },
              { label: "Produtor", color: "var(--c-glamour)" },
              { label: "Torrefador", color: "var(--c-barro)" },
            ].map(({ label, color }) => (
              <span key={label} className="mono" style={{
                fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase",
                padding: "5px 12px", borderRadius: 999,
                border: `1px solid ${color}`, color,
              }}>
                {label}
              </span>
            ))}
          </div>
          <p style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 10, lineHeight: 1.5 }}>
            Tudo em um só lugar.
          </p>
        </div>

        {submitError && (
          <div role="alert" style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", marginBottom: 18, background: "rgba(184,35,26,.08)", border: "1px solid rgba(184,35,26,.3)", borderRadius: 10, color: "var(--error, #b8231a)", fontSize: 14, lineHeight: 1.4 }}>
            <ErrorIcon /> <span>{submitError}</span>
          </div>
        )}
        {status === "success" && (
          <div role="status" style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", marginBottom: 18, background: "rgba(46,114,68,.1)", border: "1px solid rgba(46,114,68,.4)", borderRadius: 10, color: "var(--success)", fontSize: 14 }}>
            <CheckCircle /> Entrando…
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <Field label="E-mail" error={showEmailErr} hint={!showEmailErr ? "Use o e-mail cadastrado na sua conta." : null}>
            <input
              ref={emailRef}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setSubmitError(null); }}
              onBlur={() => setTouched(t => ({ ...t, email: true }))}
              style={inputStyle(!!showEmailErr)}
            />
          </Field>

          <Field label="Senha" error={showPassErr} actionLabel="Esqueci minha senha" onAction={() => window.location.href = "/forgot-password"}>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setSubmitError(null); }}
                onBlur={() => setTouched(t => ({ ...t, password: true }))}
                style={{ ...inputStyle(!!showPassErr), paddingRight: 56 }}
              />
              <button type="button" onClick={() => setShowPass(s => !s)} aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
                style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", padding: "6px 10px", fontSize: 12, color: "var(--ink-2)", background: "none", border: "none", cursor: "pointer", borderRadius: 8 }}>
                {showPass ? "ocultar" : "mostrar"}
              </button>
            </div>
          </Field>

          <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "var(--ink-2)", margin: "6px 0 22px", cursor: "pointer" }}>
            <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ accentColor: "var(--c-vibra)", width: 16, height: 16 }} />
            Manter conectado por 30 dias
          </label>

          <button type="submit" disabled={status === "loading"}
            style={{ width: "100%", padding: "16px 18px", borderRadius: 12, background: "var(--ink)", color: "var(--paper)", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, opacity: status === "loading" ? 0.7 : 1, cursor: status === "loading" ? "not-allowed" : "pointer", transition: "transform .12s ease", border: "none", fontFamily: "inherit" }}
            onMouseDown={e => e.currentTarget.style.transform = "scale(.99)"}
            onMouseUp={e => e.currentTarget.style.transform = ""}
            onMouseLeave={e => e.currentTarget.style.transform = ""}
          >
            {status === "loading" ? <><Spinner /> Validando…</> : <>Entrar <ArrowIcon /></>}
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "32px 0 20px" }}>
          <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
          <span className="mono" style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)" }}>não tem uma conta?</span>
          <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 12 }}>
          <SignupCard kind="Consumidor" sub="Comprar cafés" to="/register/customer" icon={<IconCup />} />
          <SignupCard kind="Fornecedor" sub="Vender na plataforma" to="/register/supplier" icon={<IconBag />} primary />
        </div>

        <p style={{ marginTop: 28, fontSize: 12, color: "var(--ink-2)", textAlign: "center", lineHeight: 1.55 }}>
          Ao entrar, você concorda com nossos{" "}
          <a href="#" style={{ textDecoration: "underline" }}>Termos</a> e{" "}
          <a href="#" style={{ textDecoration: "underline" }}>Política de privacidade</a>.
        </p>
      </div>
    </section>
  );
}

export default function Login() {
  const mob = useMobile();
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      {/* TopBar */}
      <div style={{ padding: mob ? "14px 20px" : "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--line)", background: "var(--bg)" }}>
        <Logo size={24} />
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--ink-2)", textDecoration: "none" }}>← Voltar</Link>
      </div>

      {/* Main: sidebar + form */}
      <main style={{ flex: 1, display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr" }}>
        {!mob && <SidePanel />}
        <LoginForm />
      </main>

      {/* Footer thin */}
      <footer style={{ padding: mob ? "16px 20px" : "20px 32px", borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, fontSize: 12, color: "var(--ink-2)" }}>
        <span className="mono" style={{ letterSpacing: ".12em", textTransform: "uppercase" }}>© 2026 Ilé Coffees</span>
        <div style={{ display: "flex", gap: 18 }}>
          <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Termos</a>
          <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Privacidade</a>
          <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Suporte</a>
        </div>
      </footer>
    </div>
  );
}
