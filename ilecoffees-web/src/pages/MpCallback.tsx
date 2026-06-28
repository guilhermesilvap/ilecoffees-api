import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";

export default function MpCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const code = params.get("code");
    if (!code) {
      setStatus("error");
      setErrorMsg("Código de autorização não encontrado na URL.");
      return;
    }

    api.post("/supplier/mp/connect", { code })
      .then(() => {
        setStatus("success");
        setTimeout(() => navigate("/dashboard/supplier"), 2500);
      })
      .catch((e: any) => {
        setStatus("error");
        setErrorMsg(e?.response?.data?.message ?? "Erro ao conectar conta Mercado Pago.");
      });
  }, []);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg)", color: "var(--ink)", fontFamily: "inherit",
    }}>
      <div style={{
        background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 20,
        padding: "48px 40px", maxWidth: 440, width: "100%", textAlign: "center",
      }}>
        {status === "loading" && (
          <>
            <svg width="40" height="40" viewBox="0 0 16 16" fill="none" style={{ animation: "spin 1s linear infinite", marginBottom: 20 }}>
              <circle cx="8" cy="8" r="6" stroke="var(--c-glamour)" strokeWidth="2" strokeDasharray="25 13" strokeLinecap="round"/>
            </svg>
            <div className="serif" style={{ fontSize: 22, letterSpacing: "-.01em", marginBottom: 8 }}>Conectando conta…</div>
            <div style={{ fontSize: 14, color: "var(--ink-2)" }}>Aguarde enquanto vinculamos sua conta Mercado Pago.</div>
          </>
        )}
        {status === "success" && (
          <>
            <div style={{ width: 52, height: 52, borderRadius: 999, background: "rgba(46,114,68,.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L19 7" stroke="#2e7244" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div className="serif" style={{ fontSize: 22, letterSpacing: "-.01em", marginBottom: 8 }}>Conta conectada!</div>
            <div style={{ fontSize: 14, color: "var(--ink-2)" }}>Sua conta Mercado Pago foi vinculada com sucesso. Redirecionando…</div>
          </>
        )}
        {status === "error" && (
          <>
            <div style={{ width: 52, height: 52, borderRadius: 999, background: "rgba(231,64,44,.10)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="var(--c-vibra)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div className="serif" style={{ fontSize: 22, letterSpacing: "-.01em", marginBottom: 8 }}>Erro ao conectar</div>
            <div style={{ fontSize: 14, color: "var(--ink-2)", marginBottom: 24 }}>{errorMsg}</div>
            <button
              onClick={() => navigate("/dashboard/supplier")}
              style={{ padding: "11px 24px", borderRadius: 999, background: "var(--ink)", color: "var(--c-leveza)", border: 0, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}
            >
              Voltar ao painel
            </button>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
