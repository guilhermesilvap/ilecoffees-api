import { useState } from "react";
import { Link } from "react-router-dom";
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

export default function ForgotPassword() {
  const mob = useMobile();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post("/forgot-password", { email });
      setSent(true);
    } catch {
      setError("Não foi possível enviar o e-mail. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: mob ? "24px 16px" : 24 }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ marginBottom: 40 }}>
          <Logo />
        </div>

        <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 20, padding: mob ? "32px 24px" : "44px 48px" }}>
          {sent ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: 999, background: "var(--bg-2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2z" stroke="var(--c-vibra)" strokeWidth="1.4" />
                  <path d="M2 8l10 7 10-7" stroke="var(--c-vibra)" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </div>
              <h2 className="serif" style={{ fontSize: 24, margin: "0 0 12px", letterSpacing: "-.01em" }}>Verifique seu e-mail</h2>
              <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.6, margin: "0 0 28px" }}>
                Se o endereço <strong>{email}</strong> estiver cadastrado, você receberá um link para redefinir sua senha em instantes.
              </p>
              <Link to="/login" style={{ fontSize: 14, color: "var(--c-vibra)", textDecoration: "none" }}>
                Voltar ao login
              </Link>
            </div>
          ) : (
            <>
              <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 12 }}>
                <span style={{ color: "var(--c-vibra)" }}>§</span>&nbsp; Recuperar acesso
              </div>
              <h1 className="serif" style={{ fontSize: mob ? 28 : 34, margin: "0 0 8px", letterSpacing: "-.02em", lineHeight: 1 }}>
                Esqueceu a senha?
              </h1>
              <p style={{ fontSize: 14, color: "var(--ink-2)", margin: "0 0 32px", lineHeight: 1.55 }}>
                Informe seu e-mail e enviaremos um link para criar uma nova senha.
              </p>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 20 }}>
                  <label className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", display: "block", marginBottom: 8 }}>
                    E-mail
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com"
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
                  {loading ? <><Spinner /> Enviando...</> : "Enviar link de recuperação"}
                </button>
              </form>

              <div style={{ marginTop: 24, textAlign: "center" }}>
                <Link to="/login" style={{ fontSize: 14, color: "var(--ink-2)", textDecoration: "none" }}>
                  ← Voltar ao login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
