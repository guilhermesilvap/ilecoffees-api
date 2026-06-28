import { useState, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { validateCPF, validateCNPJ } from "@/utils/validate-documents";

function ArrowIcon({ size = 14, dir = "right" }: { size?: number; dir?: "left" | "right" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" style={{ transform: dir === "left" ? "rotate(180deg)" : undefined }} aria-hidden="true">
      <path d="M2.5 7h9M7.8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Logo({ size = 24 }: { size?: number }) {
  return (
    <Link to="/" style={{ display: "inline-flex", alignItems: "baseline", gap: 6, textDecoration: "none", color: "var(--ink)" }}>
      <span className="script" style={{ fontSize: size * 1.6, lineHeight: 0.75 }}>íle</span>
      <span className="serif italic" style={{ fontSize: size * 0.46, lineHeight: 1, color: "var(--c-vibra)" }}>coffees</span>
    </Link>
  );
}

function CheckIcon({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path d="M3 7.5L6 10.5L11 4.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
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

function Spinner({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ animation: "spin 0.8s linear infinite" }}>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" fill="none" opacity=".3" />
      <path d="M14 8a6 6 0 00-6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}

function AvatarPicker({ value, onChange, onFile }: { value: string | null; onChange: (v: string | null) => void; onFile?: (f: File | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    onFile?.(file);
    const reader = new FileReader();
    reader.onload = e => onChange(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <button type="button" onClick={() => inputRef.current?.click()} style={{
        width: 80, height: 80, borderRadius: 999, border: "1.5px dashed var(--line)",
        background: value ? `center/cover no-repeat url(${value})` : "var(--bg-2)",
        position: "relative", cursor: "pointer", flexShrink: 0, color: "var(--ink-2)", outline: "none",
      }}>
        {!value && (
          <svg width="30" height="30" viewBox="0 0 34 34" fill="none" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>
            <circle cx="17" cy="13" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M6 28c2-5 5.5-7.5 11-7.5S26 23 28 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </button>
      <div>
        <div style={{ fontSize: 14, color: "var(--ink)" }}>{value ? "Foto carregada" : "Foto de perfil"}</div>
        <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 4 }}>Opcional. JPG, PNG ou WEBP, até 2 MB.</div>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button type="button" onClick={() => inputRef.current?.click()} style={{ padding: "7px 13px", border: "1px solid var(--ink)", borderRadius: 999, fontSize: 12, cursor: "pointer", fontFamily: "inherit", background: "none", color: "var(--ink)" }}>
            {value ? "Trocar foto" : "Escolher arquivo"}
          </button>
          {value && (
            <button type="button" onClick={() => { onChange(null); onFile?.(null); }} style={{ padding: "7px 13px", borderRadius: 999, fontSize: 12, color: "var(--ink-2)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
              Remover
            </button>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFile(e.target.files?.[0])} />
      </div>
    </div>
  );
}

function IconPerson() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.5" stroke="var(--ink)" strokeWidth="1.4" />
      <path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5" stroke="var(--ink)" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconShop() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M4 10h16l-1.5 9.5a1 1 0 01-1 .8H6.5a1 1 0 01-1-.8L4 10z" stroke="var(--ink)" strokeWidth="1.4" />
      <path d="M3 7l1.4-3h15.2L21 7" stroke="var(--ink)" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M9 14h6" stroke="var(--c-vibra)" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function inputStyle(hasError: boolean, extra: React.CSSProperties = {}): React.CSSProperties {
  return {
    width: "100%", padding: "13px 15px",
    border: `1px solid ${hasError ? "var(--error, #b8231a)" : "var(--line)"}`,
    background: "var(--paper)", borderRadius: 12, fontSize: 15, outline: "none",
    transition: "border-color .12s ease, box-shadow .12s ease", fontFamily: "inherit", color: "var(--ink)",
    boxShadow: hasError ? "0 0 0 3px rgba(184,35,26,.14)" : "none",
    ...extra,
  };
}

function Divider() {
  return <div style={{ height: 1, background: "var(--line)", margin: "28px 0" }} />;
}

function Field({ label, error, hint, required, children, span = 1 }: {
  label: string; error?: string | null; hint?: string | null;
  required?: boolean; children: React.ReactNode; span?: number;
}) {
  return (
    <div style={{ gridColumn: `span ${span}`, marginBottom: 4 }}>
      <label className="mono" style={{ display: "block", marginBottom: 8, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)" }}>
        {label}{required && <span style={{ color: "var(--c-vibra)", marginLeft: 4 }}>*</span>}
      </label>
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

function passwordScore(p: string) {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}

function passwordMissing(p: string): string[] {
  const missing: string[] = [];
  if (p.length < 8) missing.push("mínimo 8 caracteres");
  if (!/[A-Z]/.test(p)) missing.push("letra maiúscula");
  if (!/[a-z]/.test(p)) missing.push("letra minúscula");
  if (!/\d/.test(p)) missing.push("número");
  if (!/[^A-Za-z0-9]/.test(p)) missing.push("caractere especial");
  return missing;
}

function PasswordMeter({ value }: { value: string }) {
  const score = passwordScore(value);
  const labels = ["", "Fraca", "Razoável", "Boa", "Forte"];
  const colors = ["var(--line)", "#c66", "#d99", "#a93", "var(--success)"];
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 4 }}>
        {[1, 2, 3, 4].map(i => (
          <span key={i} style={{ flex: 1, height: 4, borderRadius: 999, background: i <= score ? colors[score] : "var(--line)", transition: "background .15s" }} />
        ))}
      </div>
      {value && (
        <div className="mono" style={{ marginTop: 8, fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)" }}>
          Força: <span style={{ color: colors[score] }}>{labels[score] || "—"}</span>
        </div>
      )}
    </div>
  );
}

function AccountTypeCard({ value, current, onClick, title, sub, icon, perks }: {
  value: string; current: string; onClick: (v: string) => void;
  title: string; sub: string; icon: React.ReactNode; perks: string[];
}) {
  const active = current === value;
  return (
    <button type="button" onClick={() => onClick(value)} style={{
      textAlign: "left", padding: "20px 22px", borderRadius: 14,
      border: `1.5px solid ${active ? "var(--ink)" : "var(--line)"}`,
      background: "var(--paper)", boxShadow: active ? "0 12px 28px -16px rgba(26,20,13,.25)" : "none",
      position: "relative", cursor: "pointer", transition: "border-color .12s, box-shadow .12s", width: "100%",
    }}>
      <div style={{ position: "absolute", top: 16, right: 16, width: 22, height: 22, borderRadius: 999, border: `1.5px solid ${active ? "var(--ink)" : "var(--line)"}`, background: active ? "var(--ink)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {active && <CheckIcon size={12} color="var(--paper)" />}
      </div>
      <div style={{ width: 44, height: 44, borderRadius: 11, background: "var(--bg-2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>{icon}</div>
      <div className="serif" style={{ fontSize: 24, lineHeight: 1.1, letterSpacing: "-.01em" }}>{title}</div>
      <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 4 }}>{sub}</div>
      <ul style={{ listStyle: "none", padding: 0, margin: "14px 0 0", display: "flex", flexDirection: "column", gap: 6 }}>
        {perks.map(p => (
          <li key={p} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--ink-2)" }}>
            <CheckIcon size={12} color="var(--c-vibra)" /> {p}
          </li>
        ))}
      </ul>
    </button>
  );
}

function Stepper({ step, steps }: { step: number; steps: string[] }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 36 }}>
      {steps.map((label, i) => {
        const n = i + 1;
        const active = n === step;
        const done = n < step;
        return (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 999, background: done ? "var(--c-vibra)" : active ? "var(--ink)" : "var(--paper)", color: done || active ? "var(--paper)" : "var(--ink-2)", border: `1px solid ${done ? "var(--c-vibra)" : active ? "var(--ink)" : "var(--line)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, transition: "all .15s ease" }}>
                {done ? <CheckIcon size={14} /> : n}
              </div>
              <div className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: active ? "var(--ink)" : "var(--ink-2)" }}>
                Passo {n} · {label}
              </div>
            </div>
            {i < steps.length - 1 && <span style={{ width: 48, height: 1, background: "var(--line)" }} />}
          </div>
        );
      })}
    </div>
  );
}

const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function maskCEP(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

function maskCPF(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function maskCNPJ(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

interface RegisterFormData {
  name: string; email: string; phone: string; password: string; confirm: string;
  accountType: "CUSTOMER" | "COFFEESHOP"; terms: boolean;
  cpf: string; cnpj: string; avatar: string | null;
  cep: string; rua: string; numero: string; complemento: string;
  bairro: string; cidade: string; uf: string; newsletter: boolean;
}

function StepAccount({ data, set, errors, onNext, onPhotoFile }: { data: RegisterFormData; set: (p: Partial<RegisterFormData>) => void; errors: Record<string, string>; onNext: () => void; onPhotoFile: (f: File | null) => void }) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (k: string) => () => setTouched(s => ({ ...s, [k]: true }));

  function handleNext() {
    setTouched({ name: true, email: true, phone: true, password: true, confirm: true, accountType: true, cpf: true, cnpj: true, terms: true });
    if (Object.keys(errors).length === 0) onNext();
  }

  const err = (k: string) => touched[k] ? errors[k] : undefined;

  return (
    <>
      <h2 className="serif" style={{ fontSize: 38, lineHeight: 1.05, letterSpacing: "-.015em", margin: 0 }}>
        Criar sua <span className="italic" style={{ color: "var(--c-vibra)" }}>conta</span>
      </h2>
      <p style={{ fontSize: 15, color: "var(--ink-2)", marginTop: 10, marginBottom: 32 }}>
        Leva uns dois minutinhos. Você poderá editar tudo depois no seu perfil.
      </p>

      <Field label="Foto de perfil">
        <AvatarPicker value={data.avatar} onChange={v => set({ avatar: v })} onFile={onPhotoFile} />
      </Field>

      <Divider />

      <div className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 12 }}>
        Tipo de conta <span style={{ color: "var(--c-vibra)" }}>*</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 8 }}>
        <AccountTypeCard value="CUSTOMER" current={data.accountType} onClick={(v) => set({ accountType: v as "CUSTOMER" | "COFFEESHOP" })}
          title="Pessoa Física" sub="Para clientes finais que querem comprar café em casa"
          icon={<IconPerson />} perks={["Pacotes de 250g e 1kg", "Assinatura quinzenal", "Cursos online"]} />
        <AccountTypeCard value="COFFEESHOP" current={data.accountType} onClick={(v) => set({ accountType: v as "CUSTOMER" | "COFFEESHOP" })}
          title="Empresa / Cafeteria" sub="Para cafeterias e estabelecimentos que compram em escala"
          icon={<IconShop />} perks={["Compra em saca de 60 kg", "Preços de atacado", "Faturamento e nota fiscal"]} />
      </div>

      <Divider />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, columnGap: 16 }}>
        <Field label={data.accountType === "COFFEESHOP" ? "Nome do responsável" : "Nome completo"} required error={err("name")} span={2}>
          <input type="text" placeholder="Como devemos te chamar?" value={data.name}
            onChange={e => set({ name: e.target.value })} onBlur={touch("name")} style={inputStyle(!!err("name"))} />
        </Field>
        <Field label="E-mail" required error={err("email")}>
          <input type="email" placeholder="voce@exemplo.com" value={data.email}
            onChange={e => set({ email: e.target.value })} onBlur={touch("email")} style={inputStyle(!!err("email"))} autoComplete="email" />
        </Field>
        <Field label="Telefone" required error={err("phone")} hint={!err("phone") ? "Para confirmar pedidos via WhatsApp." : null}>
          <input type="tel" placeholder="(31) 99999-0000" value={data.phone}
            onChange={e => set({ phone: maskPhone(e.target.value) })} onBlur={touch("phone")} style={inputStyle(!!err("phone"))} autoComplete="tel" />
        </Field>
        <Field label="Senha" required error={err("password")}>
          <input type="password" placeholder="Mínimo 8 caracteres" value={data.password}
            onChange={e => set({ password: e.target.value })} onBlur={touch("password")} style={inputStyle(!!err("password"))} autoComplete="new-password" />
          <PasswordMeter value={data.password} />
        </Field>
        <Field label="Confirmar senha" required error={err("confirm")}>
          <input type="password" placeholder="Repita a senha" value={data.confirm}
            onChange={e => set({ confirm: e.target.value })} onBlur={touch("confirm")} style={inputStyle(!!err("confirm"))} autoComplete="new-password" />
        </Field>
        {data.accountType === "CUSTOMER" ? (
          <Field label="CPF" required error={err("cpf")} span={2}>
            <input type="text" placeholder="000.000.000-00" value={data.cpf}
              onChange={e => set({ cpf: maskCPF(e.target.value) })} onBlur={touch("cpf")} style={inputStyle(!!err("cpf"))} inputMode="numeric" />
          </Field>
        ) : (
          <Field label="CNPJ" required error={err("cnpj")} span={2}>
            <input type="text" placeholder="00.000.000/0000-00" value={data.cnpj}
              onChange={e => set({ cnpj: maskCNPJ(e.target.value) })} onBlur={touch("cnpj")} style={inputStyle(!!err("cnpj"))} inputMode="numeric" />
          </Field>
        )}
      </div>

      <Divider />

      <div>
        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5, cursor: "pointer" }}>
          <input type="checkbox" checked={data.terms} onChange={e => { set({ terms: e.target.checked }); setTouched(s => ({ ...s, terms: true })); }}
            style={{ accentColor: "var(--c-vibra)", width: 16, height: 16, marginTop: 2, flexShrink: 0 }} />
          Li e aceito os{" "}
          <a href="#" style={{ textDecoration: "underline", color: "var(--ink)" }}>Termos de uso</a> e a{" "}
          <a href="#" style={{ textDecoration: "underline", color: "var(--ink)" }}>Política de privacidade</a>.
        </label>
        {err("terms") && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--c-vibra)", marginTop: 6, paddingLeft: 26 }}>
            <ErrorDot />{err("terms")}
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32 }}>
        <Link to="/" style={{ fontSize: 14, color: "var(--ink-2)", textDecoration: "none" }}>← Voltar</Link>
        <button type="button" onClick={handleNext}
          style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 24px", background: "var(--ink)", color: "var(--paper)", borderRadius: 999, fontSize: 15, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
          Continuar para endereço <ArrowIcon />
        </button>
      </div>
    </>
  );
}

function StepAddress({ data, set, errors, onBack, onSubmit, submitting }: {
  data: RegisterFormData; set: (p: Partial<RegisterFormData>) => void; errors: Record<string, string>;
  onBack: () => void; onSubmit: () => void; submitting: boolean;
}) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [cepLoading, setCepLoading] = useState(false);
  const [cepStatus, setCepStatus] = useState<"found" | "notfound" | null>(null);
  const numberRef = useRef<HTMLInputElement>(null);

  const touch = (k: string) => () => setTouched(s => ({ ...s, [k]: true }));
  const err = (k: string) => touched[k] ? errors[k] : undefined;

  async function handleCepBlur() {
    setTouched(s => ({ ...s, cep: true }));
    const digits = data.cep.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setCepLoading(true);
    setCepStatus(null);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const json = await res.json();
      setCepLoading(false);
      if (!json.erro) {
        set({ rua: json.logradouro, bairro: json.bairro, cidade: json.localidade, uf: json.uf });
        setCepStatus("found");
        setTimeout(() => numberRef.current?.focus(), 50);
      } else {
        setCepStatus("notfound");
      }
    } catch {
      setCepLoading(false);
      setCepStatus("notfound");
    }
  }

  function handleSubmit() {
    setTouched({ cep: true, rua: true, numero: true, bairro: true, cidade: true, uf: true });
    if (Object.keys(errors).length === 0) onSubmit();
  }

  const selectStyle: React.CSSProperties = {
    ...inputStyle(!!err("uf")), appearance: "none", paddingRight: 36,
    backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path d='M1 1l4 4 4-4' stroke='%231c0810' stroke-width='1.2' fill='none' stroke-linecap='round'/></svg>")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center",
  };

  return (
    <>
      <h2 className="serif" style={{ fontSize: 38, lineHeight: 1.05, letterSpacing: "-.015em", margin: 0 }}>
        Onde <span className="italic" style={{ color: "var(--c-vibra)" }}>entregamos</span>?
      </h2>
      <p style={{ fontSize: 15, color: "var(--ink-2)", marginTop: 10, marginBottom: 32 }}>
        Seu endereço principal. Você pode adicionar outros depois, na hora da compra.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 16, columnGap: 16 }}>
        <Field label="CEP" required span={2}
          error={err("cep") || (cepStatus === "notfound" ? "CEP não encontrado. Preencha manualmente." : undefined)}
          hint={cepStatus === "found" ? "Endereço preenchido automaticamente ✓" : (!err("cep") ? "Digite o CEP para preenchimento automático." : null)}>
          <div style={{ position: "relative" }}>
            <input type="text" placeholder="00000-000" value={data.cep}
              onChange={e => { set({ cep: maskCEP(e.target.value) }); setCepStatus(null); }}
              onBlur={handleCepBlur} style={inputStyle(!!err("cep") || cepStatus === "notfound", { paddingRight: 36 })} inputMode="numeric" />
            <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}>
              {cepLoading ? <Spinner /> : cepStatus === "found" ? <CheckIcon color="var(--success)" /> : null}
            </span>
          </div>
        </Field>

        <Field label="Rua" required error={err("rua")} span={3}>
          <input type="text" placeholder="Nome da rua" value={data.rua}
            onChange={e => set({ rua: e.target.value })} onBlur={touch("rua")} style={inputStyle(!!err("rua"))} />
        </Field>
        <Field label="Número" required error={err("numero")} span={1}>
          <input ref={numberRef} type="text" placeholder="123" value={data.numero}
            onChange={e => set({ numero: e.target.value })} onBlur={touch("numero")} style={inputStyle(!!err("numero"))} />
        </Field>

        <Field label="Complemento" hint="Apto, bloco, ponto de referência" span={3}>
          <input type="text" placeholder="Opcional" value={data.complemento}
            onChange={e => set({ complemento: e.target.value })} style={inputStyle(false)} />
        </Field>
        <Field label="Bairro" required error={err("bairro")} span={3}>
          <input type="text" placeholder="Bairro" value={data.bairro}
            onChange={e => set({ bairro: e.target.value })} onBlur={touch("bairro")} style={inputStyle(!!err("bairro"))} />
        </Field>

        <Field label="Cidade" required error={err("cidade")} span={4}>
          <input type="text" placeholder="Cidade" value={data.cidade}
            onChange={e => set({ cidade: e.target.value })} onBlur={touch("cidade")} style={inputStyle(!!err("cidade"))} />
        </Field>
        <Field label="Estado" required error={err("uf")} span={2}>
          <select value={data.uf} onChange={e => set({ uf: e.target.value })} onBlur={touch("uf")} style={selectStyle}>
            <option value="">UF</option>
            {UFS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
          </select>
        </Field>
      </div>

      <Divider />

      <label style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5, cursor: "pointer" }}>
        <input type="checkbox" checked={data.newsletter} onChange={e => set({ newsletter: e.target.checked })}
          style={{ accentColor: "var(--c-vibra)", width: 16, height: 16, marginTop: 2 }} />
        Quero receber novidades de lotes, cursos e curadoria mensal da Ilé.
      </label>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32 }}>
        <button type="button" onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, color: "var(--ink-2)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
          <ArrowIcon dir="left" size={12} /> Voltar para conta
        </button>
        <button type="button" onClick={handleSubmit} disabled={submitting}
          style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 24px", background: "var(--ink)", color: "var(--paper)", borderRadius: 999, fontSize: 15, opacity: submitting ? 0.7 : 1, cursor: submitting ? "not-allowed" : "pointer", border: "none", fontFamily: "inherit" }}>
          {submitting ? <><Spinner /> Criando conta…</> : <>Criar conta <ArrowIcon /></>}
        </button>
      </div>
    </>
  );
}

function Success({ data }: { data: RegisterFormData }) {
  return (
    <div style={{ textAlign: "center", padding: "32px 0" }}>
      <div style={{ width: 72, height: 72, borderRadius: 999, margin: "0 auto", background: "rgba(46,114,68,.14)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--success)" }}>
        <CheckIcon size={36} />
      </div>
      <h2 className="serif" style={{ fontSize: 44, lineHeight: 1.05, letterSpacing: "-.015em", margin: "28px 0 0" }}>
        Bem-vinde à <span className="italic" style={{ color: "var(--c-vibra)" }}>Ilé</span>, {data.name.split(" ")[0]}.
      </h2>
      <p style={{ fontSize: 16, color: "var(--ink-2)", marginTop: 14, maxWidth: 520, margin: "14px auto 0", lineHeight: 1.55 }}>
        Sua conta de <b>{data.accountType === "COFFEESHOP" ? "Cafeteria" : "Cliente"}</b> foi criada. Faça login para continuar.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 32, flexWrap: "wrap" }}>
        <Link to="/login" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 24px", background: "var(--ink)", color: "var(--paper)", borderRadius: 999, fontSize: 15, textDecoration: "none" }}>
          Fazer login <ArrowIcon />
        </Link>
        <Link to="/explore" style={{ padding: "14px 24px", border: "1px solid var(--ink)", borderRadius: 999, fontSize: 15, textDecoration: "none", color: "var(--ink)" }}>
          Explorar cafés
        </Link>
      </div>
    </div>
  );
}

function SummaryAside({ data }: { data: RegisterFormData }) {
  return (
    <aside style={{ background: "var(--bg-2)", borderRadius: 18, padding: 28, border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 22, position: "sticky", top: 24, alignSelf: "flex-start" }}>
      <div>
        <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)" }}>Sua conta</div>
        <div className="serif" style={{ fontSize: 28, lineHeight: 1.05, letterSpacing: "-.01em", marginTop: 8 }}>
          {data.accountType === "COFFEESHOP" ? "Cafeteria" : "Cliente final"}
          <div className="serif italic" style={{ fontSize: 18, color: "var(--c-vibra)", lineHeight: 1.1, marginTop: 4 }}>
            {data.accountType === "COFFEESHOP" ? "preço de atacado" : "pacotes individuais"}
          </div>
        </div>
      </div>
      <div style={{ height: 1, background: "var(--line)" }} />
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
        {([
          ["Catálogo curado", "lotes de fazendas brasileiras"],
          ["Assinatura quinzenal", "um café novo na sua porta"],
          ["Cursos online", "barismo, métodos e prova"],
          data.accountType === "COFFEESHOP"
            ? ["Pedidos por atacado", "saca de 60kg e contratos mensais"]
            : ["Frete grátis acima de R$ 120", "para todo o Brasil"],
        ] as [string, string][]).map(([t, s]) => (
          <li key={t} style={{ display: "flex", gap: 10 }}>
            <CheckIcon size={14} color="var(--c-vibra)" />
            <div>
              <div style={{ fontSize: 14 }}>{t}</div>
              <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 2 }}>{s}</div>
            </div>
          </li>
        ))}
      </ul>
      <div style={{ height: 1, background: "var(--line)" }} />
      <div className="serif italic" style={{ fontSize: 22, lineHeight: 1.2, color: "var(--ink-2)" }}>
        "Cada saca traz o nome de quem plantou."
      </div>
      <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-3)" }}>
        — Ilé Coffees · Belo Horizonte
      </div>
    </aside>
  );
}

const INITIAL_DATA: RegisterFormData = {
  name: "", email: "", phone: "", password: "", confirm: "",
  accountType: "CUSTOMER", terms: false,
  cpf: "", cnpj: "", avatar: null,
  cep: "", rua: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "",
  newsletter: true,
};

export default function RegisterCustomer() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<RegisterFormData>(INITIAL_DATA);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = (patch: Partial<RegisterFormData>) => setData(d => ({ ...d, ...patch }));

  const errors1 = useMemo(() => {
    const e: Record<string, string> = {};
    if (!data.name.trim()) e.name = "Informe seu nome completo.";
    else if (data.name.trim().split(" ").filter(Boolean).length < 2) e.name = "Inclua nome e sobrenome.";
    if (!data.email) e.email = "Informe seu e-mail.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = "Formato de e-mail inválido.";
    const phoneDigits = data.phone.replace(/\D/g, "");
    if (!phoneDigits) e.phone = "Informe seu telefone.";
    else if (phoneDigits.length < 10) e.phone = "Telefone com DDD, por favor.";
    const missing = passwordMissing(data.password);
    if (!data.password) e.password = "Crie uma senha.";
    else if (missing.length > 0) e.password = `Faltando: ${missing.join(", ")}.`;
    if (!data.confirm) e.confirm = "Repita a senha.";
    else if (data.confirm !== data.password) e.confirm = "As senhas não coincidem.";
    if (!data.terms) e.terms = "Você precisa aceitar os termos.";
    const cpfDigits = data.cpf.replace(/\D/g, "");
    const cnpjDigits = data.cnpj.replace(/\D/g, "");
    if (data.accountType === "CUSTOMER") {
      if (!cpfDigits) e.cpf = "Informe seu CPF.";
      else if (cpfDigits.length !== 11) e.cpf = "CPF deve ter 11 dígitos.";
      else if (!validateCPF(cpfDigits)) e.cpf = "CPF inválido. Verifique os dígitos.";
    } else {
      if (!cnpjDigits) e.cnpj = "Informe o CNPJ.";
      else if (cnpjDigits.length !== 14) e.cnpj = "CNPJ deve ter 14 dígitos.";
      else if (!validateCNPJ(cnpjDigits)) e.cnpj = "CNPJ inválido. Verifique os dígitos.";
    }
    return e;
  }, [data]);

  const errors2 = useMemo(() => {
    const e: Record<string, string> = {};
    const cepDigits = data.cep.replace(/\D/g, "");
    if (!cepDigits) e.cep = "Informe o CEP.";
    else if (cepDigits.length !== 8) e.cep = "CEP deve ter 8 dígitos.";
    if (!data.rua.trim()) e.rua = "Informe a rua.";
    if (!data.numero.trim()) e.numero = "Número da casa.";
    if (!data.bairro.trim()) e.bairro = "Informe o bairro.";
    if (!data.cidade.trim()) e.cidade = "Informe a cidade.";
    if (!data.uf) e.uf = "UF";
    return e;
  }, [data]);

  async function submit() {
    setSubmitting(true);
    try {
      const body = new FormData();
      body.append("name", data.name);
      body.append("email", data.email);
      body.append("password", data.password);
      body.append("accountType", data.accountType);
      body.append("phoneNumber", data.phone.replace(/\D/g, ""));
      if (data.accountType === "CUSTOMER") body.append("cpf", data.cpf.replace(/\D/g, ""));
      else body.append("cnpj", data.cnpj.replace(/\D/g, ""));
      body.append("cep", data.cep.replace(/\D/g, ""));
      body.append("street", data.rua);
      body.append("number", data.numero);
      if (data.complemento) body.append("complement", data.complemento);
      body.append("district", data.bairro);
      body.append("city", data.cidade);
      body.append("state", data.uf);
      if (photoFile) body.append("photo", photoFile);
      await api.post("/users", body);
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const msg = err instanceof AxiosError ? (err.response?.data?.message ?? "Erro ao criar conta.") : "Erro ao criar conta.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  void navigate;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      <div style={{ padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--line)", background: "var(--bg)" }}>
        <Logo size={24} />
        <Link to="/login" style={{ fontSize: 13, color: "var(--ink-2)", textDecoration: "none" }}>
          Já tem conta? <span style={{ color: "var(--ink)", textDecoration: "underline" }}>Entrar</span>
        </Link>
      </div>

      <main style={{ flex: 1, maxWidth: 1240, width: "100%", margin: "0 auto", padding: "40px 32px 80px", display: "grid", gridTemplateColumns: "minmax(0, 1fr) 340px", gap: 40 }}>
        <div>
          {!done && <Stepper step={step} steps={["Conta", "Endereço"]} />}
          <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 18, padding: "40px 44px", boxShadow: "0 30px 60px -40px rgba(26,20,13,.18)" }}>
            {done ? (
              <Success data={data} />
            ) : step === 1 ? (
              <StepAccount data={data} set={set} errors={errors1} onPhotoFile={setPhotoFile}
                onNext={() => { setStep(2); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
            ) : (
              <StepAddress data={data} set={set} errors={errors2}
                onBack={() => setStep(1)} onSubmit={submit} submitting={submitting} />
            )}
          </div>
        </div>

        {!done && <SummaryAside data={data} />}
      </main>

      <footer style={{ padding: "20px 32px", borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, fontSize: 12, color: "var(--ink-2)" }}>
        <span className="mono" style={{ letterSpacing: ".12em", textTransform: "uppercase" }}>© 2026 Ilé Coffees Torrefação Ltda.</span>
        <div style={{ display: "flex", gap: 18 }}>
          <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Termos</a>
          <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Privacidade</a>
          <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Suporte</a>
        </div>
      </footer>
    </div>
  );
}
