import { useState, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { validateCNPJ } from "@/utils/validate-documents";

function ArrowIcon({ size = 14, dir = "right" }: { size?: number; dir?: "left" | "right" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" style={{ transform: dir === "left" ? "rotate(180deg)" : undefined }} aria-hidden="true">
      <path d="M2.5 7h9M7.8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Logo({ size = 22 }: { size?: number }) {
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
        width: 88, height: 88, borderRadius: 999, border: "1.5px dashed var(--line)",
        background: value ? `center/cover no-repeat url(${value})` : "var(--bg-2)",
        position: "relative", cursor: "pointer", flexShrink: 0, color: "var(--ink-2)", outline: "none",
      }}>
        {!value && (
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>
            <circle cx="17" cy="13" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M6 28c2-5 5.5-7.5 11-7.5S26 23 28 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </button>
      <div>
        <div style={{ fontSize: 14, color: "var(--ink)" }}>{value ? "Foto carregada" : "Adicione uma foto"}</div>
        <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 4 }}>Opcional. JPG, PNG ou WEBP, até 2 MB.</div>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button type="button" onClick={() => inputRef.current?.click()} style={{ padding: "8px 14px", border: "1px solid var(--ink)", borderRadius: 999, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
            {value ? "Trocar foto" : "Escolher arquivo"}
          </button>
          {value && (
            <button type="button" onClick={() => { onChange(null); onFile?.(null); }} style={{ padding: "8px 14px", borderRadius: 999, fontSize: 12, color: "var(--ink-2)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
              Remover
            </button>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFile(e.target.files?.[0])} />
      </div>
    </div>
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
              <div style={{ width: 32, height: 32, borderRadius: 999, background: done ? "var(--c-vibra)" : active ? "var(--ink)" : "var(--paper)", color: done || active ? "#fff" : "var(--ink-2)", border: `1px solid ${done ? "var(--c-vibra)" : active ? "var(--ink)" : "var(--line)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500 }}>
                {done ? <CheckIcon size={14} color="#fff" /> : n}
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

function maskCEP(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

function maskCNPJ(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

interface SupplierFormData {
  company: string; responsible: string; cnpj: string; email: string;
  password: string; confirm: string; avatar: string | null; terms: boolean;
  cep: string; rua: string; numero: string; complemento: string;
  bairro: string; cidade: string; uf: string;
  supplierType: "PRODUCER" | "ROASTER";
}

function StepConta({ data, set, errors, onNext, onPhotoFile }: { data: SupplierFormData; set: (p: Partial<SupplierFormData>) => void; errors: Record<string, string>; onNext: () => void; onPhotoFile: (f: File | null) => void }) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (k: string) => () => setTouched(s => ({ ...s, [k]: true }));
  const err = (k: string) => touched[k] ? errors[k] : undefined;

  function handleNext() {
    setTouched({ company: true, cnpj: true, email: true, password: true, confirm: true, terms: true });
    if (Object.keys(errors).length === 0) onNext();
  }

  const isProducer = data.supplierType === "PRODUCER";

  return (
    <>
      <h2 className="serif" style={{ fontSize: 38, lineHeight: 1.05, letterSpacing: "-.015em", margin: 0 }}>
        {isProducer ? <>Sua <span className="italic" style={{ color: "var(--c-vibra)" }}>fazenda</span></> : <>Sua <span className="italic" style={{ color: "var(--c-vibra)" }}>torrefação</span></>}
      </h2>
      <p style={{ fontSize: 15, color: "var(--ink-2)", marginTop: 10, marginBottom: 24 }}>
        Conte sobre o seu negócio. A aprovação acontece em até 48h úteis.
      </p>

      {/* Supplier type selector */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
        {(["ROASTER", "PRODUCER"] as const).map(t => {
          const active = data.supplierType === t;
          return (
            <button key={t} type="button" onClick={() => set({ supplierType: t })} style={{ padding: "16px 18px", borderRadius: 14, border: `2px solid ${active ? "var(--ink)" : "var(--line)"}`, background: active ? "var(--ink)" : "var(--paper)", color: active ? "var(--c-leveza)" : "var(--ink)", cursor: "pointer", fontFamily: "inherit", textAlign: "left" as const, transition: "all .12s" }}>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{t === "ROASTER" ? "Torrefador" : "Produtor"}</div>
              <div style={{ fontSize: 12, opacity: active ? 0.75 : 0.55, lineHeight: 1.4 }}>
                {t === "ROASTER" ? "Torra e vende café para cafeterias e consumidores." : "Produz café verde e vende por kg para torrefadores."}
              </div>
            </button>
          );
        })}
      </div>

      <Field label="Foto de perfil / logo">
        <AvatarPicker value={data.avatar} onChange={v => set({ avatar: v })} onFile={onPhotoFile} />
      </Field>

      <Divider />

      <Field label="Nome do fornecedor / empresa" required error={err("company")} hint={!err("company") ? "Como aparecerá no seu perfil público." : null}>
        <input type="text" placeholder="Ex.: Fazenda Pinhal Alto" value={data.company}
          onChange={e => set({ company: e.target.value })} onBlur={touch("company")} style={inputStyle(!!err("company"))} />
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, columnGap: 16, marginTop: 14 }}>
        <Field label="Responsável" required>
          <input type="text" placeholder="Nome de quem cuida da conta" value={data.responsible}
            onChange={e => set({ responsible: e.target.value })} style={inputStyle(false)} />
        </Field>
        <Field label="CNPJ" required error={err("cnpj")}>
          <input type="text" placeholder="00.000.000/0000-00" value={data.cnpj}
            onChange={e => set({ cnpj: maskCNPJ(e.target.value) })} onBlur={touch("cnpj")} style={inputStyle(!!err("cnpj"))} inputMode="numeric" />
        </Field>
      </div>

      <Divider />

      <Field label="E-mail" required error={err("email")}>
        <input type="email" placeholder="voce@suaempresa.com" value={data.email}
          onChange={e => set({ email: e.target.value })} onBlur={touch("email")} style={inputStyle(!!err("email"))} autoComplete="email" />
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, columnGap: 16, marginTop: 14 }}>
        <Field label="Senha" required error={err("password")}>
          <input type="password" placeholder="Mínimo 8 caracteres" value={data.password}
            onChange={e => set({ password: e.target.value })} onBlur={touch("password")} style={inputStyle(!!err("password"))} autoComplete="new-password" />
          <PasswordMeter value={data.password} />
        </Field>
        <Field label="Confirmar senha" required error={err("confirm")}>
          <input type="password" placeholder="Repita a senha" value={data.confirm}
            onChange={e => set({ confirm: e.target.value })} onBlur={touch("confirm")} style={inputStyle(!!err("confirm"))} autoComplete="new-password" />
        </Field>
      </div>

      <Divider />

      <div>
        <label style={{ display: "flex", gap: 10, fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5, cursor: "pointer" }}>
          <input type="checkbox" checked={data.terms} onChange={e => { set({ terms: e.target.checked }); setTouched(s => ({ ...s, terms: true })); }}
            style={{ accentColor: "var(--c-vibra)", width: 16, height: 16, marginTop: 2, flexShrink: 0 }} />
          Li e aceito os{" "}
          <a href="#" style={{ textDecoration: "underline", color: "var(--ink)" }}>Termos de uso</a> e o{" "}
          <a href="#" style={{ textDecoration: "underline", color: "var(--ink)" }}>Contrato de Fornecedor</a>.
        </label>
        {err("terms") && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--c-vibra)", marginTop: 6, paddingLeft: 26 }}>
            <ErrorDot />{err("terms")}
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32 }}>
        <Link to={isProducer ? "/home/producer" : "/home/supplier"} style={{ fontSize: 14, color: "var(--ink-2)", textDecoration: "none" }}>← Voltar</Link>
        <button type="button" onClick={handleNext}
          style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 24px", background: "var(--ink)", color: "var(--c-leveza)", borderRadius: 999, fontSize: 15, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
          Continuar para endereço <ArrowIcon />
        </button>
      </div>
    </>
  );
}

function StepEndereco({ data, set, errors, onBack, onSubmit, submitting }: {
  data: SupplierFormData; set: (p: Partial<SupplierFormData>) => void; errors: Record<string, string>;
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
        De onde sai o <span className="italic" style={{ color: "var(--c-vibra)" }}>café</span>?
      </h2>
      <p style={{ fontSize: 15, color: "var(--ink-2)", marginTop: 10, marginBottom: 32 }}>
        Usamos este endereço para calcular fretes e exibir sua localização no perfil público.
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

        <Field label="Complemento" hint="Galpão, sítio, ponto de referência" span={3}>
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

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24 }}>
        <button type="button" onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, color: "var(--ink-2)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
          <ArrowIcon dir="left" size={12} /> Voltar para conta
        </button>
        <button type="button" onClick={handleSubmit} disabled={submitting}
          style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 24px", background: "var(--ink)", color: "var(--c-leveza)", borderRadius: 999, fontSize: 15, opacity: submitting ? 0.7 : 1, cursor: submitting ? "not-allowed" : "pointer", border: "none", fontFamily: "inherit" }}>
          {submitting ? <><Spinner /> Enviando para aprovação…</> : <>Enviar cadastro <ArrowIcon /></>}
        </button>
      </div>
    </>
  );
}

function Success({ data }: { data: SupplierFormData }) {
  return (
    <div style={{ textAlign: "center", padding: "32px 0" }}>
      <div style={{ width: 72, height: 72, borderRadius: 999, margin: "0 auto", background: "rgba(46,114,68,.14)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--success)" }}>
        <CheckIcon size={36} color="var(--success)" />
      </div>
      <h2 className="serif" style={{ fontSize: 44, lineHeight: 1.05, letterSpacing: "-.015em", margin: "28px 0 0" }}>
        Recebemos seu cadastro,{" "}
        <span className="italic" style={{ color: "var(--c-vibra)" }}>{(data.company || "fornecedor").split(" ")[0]}</span>.
      </h2>
      <p style={{ fontSize: 16, color: "var(--ink-2)", marginTop: 14, maxWidth: 540, margin: "14px auto 0", lineHeight: 1.55 }}>
        Nossa equipe vai analisar suas informações em até <b>48h úteis</b> e enviar um e-mail para{" "}
        <b style={{ color: "var(--ink)" }}>{data.email}</b> assim que sua loja for aprovada.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 32, flexWrap: "wrap" }}>
        <Link to="/login" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 24px", background: "var(--ink)", color: "var(--c-leveza)", borderRadius: 999, fontSize: 15, textDecoration: "none" }}>
          Ir para o Login <ArrowIcon />
        </Link>
        <Link to="/" style={{ padding: "14px 24px", border: "1px solid var(--ink)", borderRadius: 999, fontSize: 15, textDecoration: "none", color: "var(--ink)" }}>
          Voltar para a loja
        </Link>
      </div>
    </div>
  );
}

function SummaryAside() {
  return (
    <aside style={{ background: "var(--c-barro)", borderRadius: 18, padding: 28, color: "var(--c-leveza)", display: "flex", flexDirection: "column", gap: 22, position: "sticky", top: 24, alignSelf: "flex-start", border: "1.5px solid var(--ink)" }}>
      <div>
        <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--c-mostarda)" }}>Programa de Fornecedores</div>
        <div className="serif" style={{ fontSize: 36, lineHeight: 0.95, letterSpacing: "-.02em", marginTop: 12 }}>
          Vamos torrar <span className="italic" style={{ color: "var(--c-mostarda)" }}>juntos</span>.
        </div>
      </div>
      <div style={{ height: 1, background: "rgba(244,204,160,.2)" }} />
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
        {([
          ["Aprovação em 48h", "análise manual da nossa equipe"],
          ["Sem mensalidade", "você só paga quando vende"],
          ["Receba via Pix", "repasse semanal, sem taxas escondidas"],
          ["Logística inclusa", "convênio com transportadoras parceiras"],
        ] as [string, string][]).map(([t, s]) => (
          <li key={t} style={{ display: "flex", gap: 10 }}>
            <CheckIcon size={14} color="var(--c-mostarda)" />
            <div>
              <div style={{ fontSize: 14 }}>{t}</div>
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>{s}</div>
            </div>
          </li>
        ))}
      </ul>
      <div style={{ height: 1, background: "rgba(244,204,160,.2)" }} />
      <div className="serif italic" style={{ fontSize: 22, lineHeight: 1.2, opacity: 0.9 }}>
        "Cada saca traz o nome de quem plantou."
      </div>
      <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--c-mostarda)" }}>
        — Ilé Coffees · Espírito Santo do Pinhal
      </div>
    </aside>
  );
}

const INITIAL_DATA: SupplierFormData = {
  company: "", responsible: "", cnpj: "", email: "",
  password: "", confirm: "", avatar: null, terms: false,
  cep: "", rua: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "",
  supplierType: "ROASTER",
};

export default function RegisterSupplier() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<SupplierFormData>(INITIAL_DATA);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = (patch: Partial<SupplierFormData>) => setData(d => ({ ...d, ...patch }));

  const errors1 = useMemo(() => {
    const e: Record<string, string> = {};
    if (!data.company.trim()) e.company = "Informe o nome da empresa ou fornecedor.";
    else if (data.company.trim().length < 3) e.company = "Nome muito curto.";
    if (!data.email) e.email = "Informe seu e-mail.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = "Formato de e-mail inválido.";
    const missing = passwordMissing(data.password);
    if (!data.password) e.password = "Crie uma senha.";
    else if (missing.length > 0) e.password = `Faltando: ${missing.join(", ")}.`;
    if (!data.confirm) e.confirm = "Repita a senha.";
    else if (data.confirm !== data.password) e.confirm = "As senhas não coincidem.";
    if (!data.terms) e.terms = "Aceite os termos.";
    const cnpjDigits = data.cnpj.replace(/\D/g, "");
    if (!cnpjDigits) e.cnpj = "Informe o CNPJ.";
    else if (cnpjDigits.length !== 14) e.cnpj = "CNPJ deve ter 14 dígitos.";
    else if (!validateCNPJ(cnpjDigits)) e.cnpj = "CNPJ inválido. Verifique os dígitos.";
    return e;
  }, [data]);

  const errors2 = useMemo(() => {
    const e: Record<string, string> = {};
    const cepDigits = data.cep.replace(/\D/g, "");
    if (!cepDigits) e.cep = "Informe o CEP.";
    else if (cepDigits.length !== 8) e.cep = "CEP deve ter 8 dígitos.";
    if (!data.rua.trim()) e.rua = "Informe a rua.";
    if (!data.numero.trim()) e.numero = "Número.";
    if (!data.bairro.trim()) e.bairro = "Informe o bairro.";
    if (!data.cidade.trim()) e.cidade = "Informe a cidade.";
    if (!data.uf) e.uf = "UF";
    return e;
  }, [data]);

  async function submit() {
    setSubmitting(true);
    try {
      const body = new FormData();
      body.append("name", data.company);
      body.append("email", data.email);
      body.append("password", data.password);
      body.append("supplierType", data.supplierType);
      body.append("cnpj", data.cnpj.replace(/\D/g, ""));
      body.append("cep", data.cep.replace(/\D/g, ""));
      body.append("street", data.rua);
      body.append("number", data.numero);
      if (data.complemento) body.append("complement", data.complemento);
      body.append("district", data.bairro);
      body.append("city", data.cidade);
      body.append("state", data.uf);
      if (photoFile) body.append("photo", photoFile);
      await api.post("/suppliers", body);
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const msg = err instanceof AxiosError ? (err.response?.data?.message ?? "Erro ao cadastrar.") : "Erro ao cadastrar.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  void navigate;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      {/* TopBar */}
      <div style={{ padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--line)", background: "var(--bg)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Logo size={22} />
          <span style={{ padding: "3px 10px", border: "1px solid var(--ink)", borderRadius: 999, fontSize: 11, letterSpacing: ".06em" }}>Fornecedor</span>
        </div>
        <Link to="/login" style={{ fontSize: 13, color: "var(--ink-2)", textDecoration: "none" }}>
          Já tem conta? <span style={{ color: "var(--ink)", textDecoration: "underline" }}>Entrar</span>
        </Link>
      </div>

      <main style={{ flex: 1, maxWidth: 1240, width: "100%", margin: "0 auto", padding: "40px 32px 80px", display: "grid", gridTemplateColumns: "minmax(0, 1fr) 340px", gap: 40 }}>
        <div>
          {!done && <Stepper step={step} steps={["Conta", "Endereço"]} />}
          <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 18, padding: "40px 44px", boxShadow: "0 30px 60px -40px rgba(28,8,16,.2)" }}>
            {done ? (
              <Success data={data} />
            ) : step === 1 ? (
              <StepConta data={data} set={set} errors={errors1} onPhotoFile={setPhotoFile}
                onNext={() => { setStep(2); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
            ) : (
              <StepEndereco data={data} set={set} errors={errors2}
                onBack={() => setStep(1)} onSubmit={submit} submitting={submitting} />
            )}
          </div>

          <div style={{ marginTop: 24, padding: "14px 18px", background: "var(--bg-2)", borderRadius: 12, fontSize: 13, color: "var(--ink-2)", textAlign: "center" }}>
            Quer comprar café, não vender?{" "}
            <Link to="/register/customer" style={{ color: "var(--ink)", textDecoration: "underline" }}>Crie conta como cliente</Link>.
          </div>
        </div>

        {!done && <SummaryAside />}
      </main>

      <footer style={{ padding: "20px 32px", borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, fontSize: 12, color: "var(--ink-2)" }}>
        <span className="mono" style={{ letterSpacing: ".12em", textTransform: "uppercase" }}>© 2026 Ilé Coffees · desde 1934</span>
        <div style={{ display: "flex", gap: 18 }}>
          <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Termos</a>
          <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Privacidade</a>
          <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Suporte</a>
        </div>
      </footer>
    </div>
  );
}
