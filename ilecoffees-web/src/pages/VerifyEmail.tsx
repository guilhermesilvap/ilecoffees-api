import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
    <svg width="24" height="24" viewBox="0 0 16 16" style={{ animation: "spin 0.8s linear infinite" }}>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" fill="none" opacity=".3" />
      <path d="M14 8a6 6 0 00-6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}

export default function VerifyEmail() {
  const mob = useMobile();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMsg("Link de verificação inválido.");
      return;
    }

    api.get(`/verify-email?token=${token}`)
      .then(() => setStatus("success"))
      .catch((err: any) => {
        setStatus("error");
        setErrorMsg(err?.response?.data?.message ?? "Token inválido ou já utilizado.");
      });
  }, [token]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: mob ? "24px 16px" : 24 }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ marginBottom: 40 }}>
          <Logo />
        </div>

        <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 20, padding: mob ? "32px 24px" : "44px 48px", textAlign: "center" }}>
          {status === "loading" && (
            <>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 20, color: "var(--ink-3)" }}>
                <Spinner />
              </div>
              <h2 className="serif" style={{ fontSize: 24, margin: "0 0 12px" }}>Verificando...</h2>
              <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.6, margin: 0 }}>
                Aguarde enquanto confirmamos seu e-mail.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div style={{ width: 56, height: 56, borderRadius: 999, background: "rgba(34,139,34,.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="var(--success, #228B22)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="serif" style={{ fontSize: 24, margin: "0 0 12px", letterSpacing: "-.01em" }}>E-mail confirmado!</h2>
              <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.6, margin: "0 0 28px" }}>
                Sua conta está ativa. Você já pode fazer login e explorar nossos cafés.
              </p>
              <Link
                to="/login"
                style={{ display: "inline-block", padding: "12px 32px", background: "var(--ink)", color: "var(--c-leveza)", borderRadius: 12, fontSize: 15, textDecoration: "none", fontFamily: "inherit" }}
              >
                Entrar
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div style={{ width: 56, height: 56, borderRadius: 999, background: "rgba(184,35,26,.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#b8231a" strokeWidth="2" />
                  <path d="M15 9l-6 6M9 9l6 6" stroke="#b8231a" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h2 className="serif" style={{ fontSize: 24, margin: "0 0 12px", letterSpacing: "-.01em" }}>Não foi possível confirmar</h2>
              <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.6, margin: "0 0 28px" }}>
                {errorMsg}
              </p>
              <Link
                to="/login"
                style={{ display: "inline-block", padding: "12px 32px", background: "var(--ink)", color: "var(--c-leveza)", borderRadius: 12, fontSize: 15, textDecoration: "none", fontFamily: "inherit" }}
              >
                Ir para o login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
