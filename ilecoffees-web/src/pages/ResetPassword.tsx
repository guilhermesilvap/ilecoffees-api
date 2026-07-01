import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import { useMobile } from "@/contexts/MobileContext";

function Logo() {
  return (
    <Link to="/" style={{ display: "inline-flex", alignItems: "baseline", gap: 6, textDecoration: "none" }}>
      <span className="script" style={{ fontSize: 44, lineHeight: 0.75, color: "currentColor" }}>íle</span>
      <span className="serif italic" style={{ fontSize: 13, lineHeight: 1, color: "var(--c-vibra)" }}>coffees</span>
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

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function ResetPassword() {
  const mob = useMobile();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { setError("A senha deve ter pelo menos 6 caracteres."); return; }
    if (password !== confirm) { setError("As senhas não coincidem."); return; }
    setLoading(true);
    setError(null);
    try {
      await api.post("/reset-password", { token, newPassword: password });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Token inválido ou expirado. Solicite um novo link.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "var(--ink-2)", marginBottom: 16 }}>Link inválido.</p>
          <Link to="/forgot-password" style={{ color: "var(--c-vibra)" }}>Solicitar novo link</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: mob ? "24px 16px" : 24 }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ marginBottom: 40 }}>
          <Logo />
        </div>

        <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 20, padding: mob ? "32px 24px" : "44px 48px" }}>
          {success ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: 999, background: "rgba(34,139,34,.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="var(--success, #228B22)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="serif" style={{ fontSize: 24, margin: "0 0 12px", letterSpacing: "-.01em" }}>Senha redefinida!</h2>
              <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.6, margin: "0 0 8px" }}>
                Sua senha foi atualizada com sucesso. Redirecionando para o login...
              </p>
            </div>
          ) : (
            <>
              <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 12 }}>
                <span style={{ color: "var(--c-vibra)" }}>§</span>&nbsp; Nova senha
              </div>
              <h1 className="serif" style={{ fontSize: mob ? 28 : 34, margin: "0 0 8px", letterSpacing: "-.02em", lineHeight: 1 }}>
                Redefinir senha
              </h1>
              <p style={{ fontSize: 14, color: "var(--ink-2)", margin: "0 0 32px", lineHeight: 1.55 }}>
                Crie uma nova senha para sua conta.
              </p>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 16 }}>
                  <label className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", display: "block", marginBottom: 8 }}>
                    Nova senha
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPwd ? "text" : "password"}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      style={{ width: "100%", padding: "14px 44px 14px 16px", border: "1px solid var(--line)", background: "var(--paper)", borderRadius: 12, fontSize: 15, outline: "none", fontFamily: "inherit", color: "var(--ink)", boxSizing: "border-box" }}
                    />
                    <button type="button" onClick={() => setShowPwd(v => !v)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--ink-3)", padding: 4 }}>
                      <EyeIcon open={showPwd} />
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", display: "block", marginBottom: 8 }}>
                    Confirmar senha
                  </label>
                  <input
                    type={showPwd ? "text" : "password"}
                    required
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Repita a nova senha"
                    style={{ width: "100%", padding: "14px 16px", border: "1px solid var(--line)", background: "var(--paper)", borderRadius: 12, fontSize: 15, outline: "none", fontFamily: "inherit", color: "var(--ink)", boxSizing: "border-box" }}
                  />
                </div>

                {error && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", background: "rgba(184,35,26,.08)", border: "1px solid rgba(184,35,26,.2)", borderRadius: 10, marginBottom: 16, color: "#b8231a", fontSize: 13 }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{ width: "100%", padding: "14px", borderRadius: 12, background: "var(--ink)", color: "var(--c-leveza)", border: "none", fontSize: 15, fontFamily: "inherit", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? <><Spinner /> Salvando...</> : "Redefinir senha"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
