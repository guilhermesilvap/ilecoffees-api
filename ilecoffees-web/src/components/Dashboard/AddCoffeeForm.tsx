import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { AxiosError } from "axios";

function inp(hasError = false, extra: React.CSSProperties = {}): React.CSSProperties {
  return {
    width: "100%", padding: "11px 14px",
    border: `1px solid ${hasError ? "#b8231a" : "var(--line)"}`,
    background: "var(--bg-2)", borderRadius: 10, fontSize: 14, outline: "none",
    fontFamily: "inherit", color: "var(--ink)", boxSizing: "border-box" as const,
    ...extra,
  };
}

function Lbl({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mono" style={{ display: "block", marginBottom: 7, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)" }}>
      {children}{required && <span style={{ color: "var(--c-vibra)", marginLeft: 4 }}>*</span>}
    </label>
  );
}

function Fld({ label, required, children, span = 1 }: { label: string; required?: boolean; children: React.ReactNode; span?: number }) {
  return (
    <div style={{ gridColumn: `span ${span}` }}>
      <Lbl required={required}>{label}</Lbl>
      {children}
    </div>
  );
}

function selectStyle(): React.CSSProperties {
  return {
    ...inp(), appearance: "none", paddingRight: 32, cursor: "pointer",
    backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path d='M1 1l4 4 4-4' stroke='%231c0810' stroke-width='1.2' fill='none' stroke-linecap='round'/></svg>")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
  };
}

export interface CoffeeInitialData {
  id: string;
  name: string;
  description: string | null;
  variety: string | null;
  process: string | null;
  region: string | null;
  altitude: number | null;
  saleType: "KG" | "PACKAGE" | "BOTH";
  pricePerKg: number | null;
  packagePrice: number | null;
  packagePriceCoffeeshop: number | null;
  packageWeight: number | null;
  farm: string | null;
  producer: string | null;
  score: number | null;
  sensory: string | null;
  roast: string | null;
  stock: number | null;
  photoUrl: string | null;
}

interface AddCoffeeFormProps {
  onSuccess?: () => void;
  initialCoffee?: CoffeeInitialData;
  lockedSaleType?: "KG" | "PACKAGE" | "BOTH";
  lockedLabel?: string;
}

const emptyForm = {
  name: "", description: "", variety: "", process: "", region: "",
  altitude: "", saleType: "KG", pricePerKg: "", packagePrice: "",
  packagePriceCoffeeshop: "", packageWeight: "", weightGrams: "300", widthCm: "10",
  heightCm: "5", lengthCm: "10", farm: "", producer: "", score: "", sensory: "", roast: "", stock: "",
};

const TABS = ["Básico", "Características", "Preços", "Dimensões"] as const;
const TAB_IDS = ["basic", "product", "pricing", "shipping"] as const;

export function AddCoffeeForm({ onSuccess, initialCoffee, lockedSaleType, lockedLabel }: AddCoffeeFormProps) {
  const isEditMode = !!initialCoffee;

  const coffeeToForm = (c: CoffeeInitialData) => ({
    name: c.name, description: c.description ?? "", variety: c.variety ?? "",
    process: c.process ?? "", region: c.region ?? "",
    altitude: c.altitude?.toString() ?? "", saleType: c.saleType,
    pricePerKg: c.pricePerKg?.toString() ?? "",
    packagePrice: c.packagePrice?.toString() ?? "",
    packagePriceCoffeeshop: c.packagePriceCoffeeshop?.toString() ?? "",
    packageWeight: c.packageWeight?.toString() ?? "",
    weightGrams: "300", widthCm: "10", heightCm: "5", lengthCm: "10",
    farm: c.farm ?? "", producer: c.producer ?? "",
    score: c.score?.toString() ?? "", sensory: c.sensory ?? "",
    roast: c.roast ?? "", stock: c.stock?.toString() ?? "",
  });

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<typeof TAB_IDS[number]>("basic");
  const [isLoading, setIsLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialCoffee?.photoUrl ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const baseForm = isEditMode ? coffeeToForm(initialCoffee!) : emptyForm;
  const [formData, setFormData] = useState(lockedSaleType ? { ...baseForm, saleType: lockedSaleType } : baseForm);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const validate = (): string | null => {
    if (formData.name.trim().length < 2) return "Nome do café deve ter pelo menos 2 caracteres.";
    if (formData.variety.trim().length < 2) return "Variedade deve ter pelo menos 2 caracteres.";
    if (formData.description.trim().length < 5) return "Descrição deve ter pelo menos 5 caracteres.";
    if (formData.farm.trim().length < 2) return "Nome da fazenda deve ter pelo menos 2 caracteres.";
    if (formData.producer.trim().length < 2) return "Nome do produtor deve ter pelo menos 2 caracteres.";
    if (formData.region.trim().length < 2) return "Região deve ter pelo menos 2 caracteres.";
    if (!formData.process) return "Selecione o tipo de processamento.";
    if (!formData.altitude || Number(formData.altitude) < 1) return "Informe a altitude (mínimo 1m).";
    if (!formData.score || Number(formData.score) < 1) return "Informe a pontuação SCA (mínimo 1).";
    if (!formData.roast) return "Selecione o perfil de torra.";
    if (formData.sensory.trim().length < 2) return "Informe as notas sensoriais.";
    if ((formData.saleType === "KG" || formData.saleType === "BOTH") && !formData.pricePerKg) return "Informe o preço por kg.";
    if ((formData.saleType === "PACKAGE" || formData.saleType === "BOTH") && !formData.packagePrice) return "Informe o preço do pacote.";
    if ((formData.saleType === "PACKAGE" || formData.saleType === "BOTH") && !formData.packageWeight) return "Informe o peso do pacote.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      toast({ title: "Campo obrigatório", description: validationError, variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const body = new FormData();
      body.append("name", formData.name);
      body.append("description", formData.description);
      body.append("variety", formData.variety);
      body.append("process", formData.process);
      body.append("region", formData.region);
      body.append("altitude", formData.altitude);
      body.append("saleType", formData.saleType);
      body.append("weightGrams", formData.weightGrams);
      body.append("widthCm", formData.widthCm);
      body.append("heightCm", formData.heightCm);
      body.append("lengthCm", formData.lengthCm);
      body.append("farm", formData.farm);
      body.append("producer", formData.producer);
      body.append("score", formData.score);
      body.append("sensory", formData.sensory);
      body.append("roast", formData.roast);
      if (formData.stock) body.append("stock", formData.stock);
      if ((formData.saleType === "KG" || formData.saleType === "BOTH") && formData.pricePerKg)
        body.append("pricePerKg", formData.pricePerKg);
      if (formData.saleType === "PACKAGE" || formData.saleType === "BOTH") {
        if (formData.packagePrice) body.append("packagePrice", formData.packagePrice);
        if (formData.packageWeight) body.append("packageWeight", formData.packageWeight);
        if (formData.packagePriceCoffeeshop) body.append("packagePriceCoffeeshop", formData.packagePriceCoffeeshop);
      }
      if (photoFile) body.append("photo", photoFile);

      if (isEditMode) {
        await api.put(`/coffees/${initialCoffee!.id}`, body);
        toast({ title: "Café atualizado com sucesso!", description: `${formData.name} foi atualizado.` });
      } else {
        await api.post("/coffees", body);
        toast({ title: "Café cadastrado com sucesso!", description: `${formData.name} foi adicionado ao seu catálogo.` });
      }

      setIsOpen(false);
      if (!isEditMode) {
        setFormData(emptyForm);
        setPhotoFile(null);
        setPhotoPreview(null);
      }
      onSuccess?.();
    } catch (err) {
      let msg = isEditMode ? "Erro ao atualizar café." : "Erro ao cadastrar café.";
      if (err instanceof AxiosError && err.response?.data) {
        const data = err.response.data as { message?: string; issues?: Record<string, { _errors: string[] }> };
        if (data.issues) {
          const fields = Object.entries(data.issues)
            .filter(([k, v]) => k !== "_errors" && v._errors.length > 0)
            .map(([k]) => k).join(", ");
          msg = fields ? `Campos inválidos: ${fields}` : (data.message ?? msg);
        } else if (data.message) {
          msg = data.message;
        }
      }
      toast({ title: "Erro", description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const hc = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

  const openModal = () => {
    if (isEditMode) setFormData(coffeeToForm(initialCoffee!));
    setActiveTab("basic");
    setIsOpen(true);
  };

  const tabIdx = TAB_IDS.indexOf(activeTab);

  return (
    <>
      {isEditMode ? (
        <button type="button" onClick={openModal} title="Editar café" style={{
          width: 32, height: 32, borderRadius: 8, border: "1px solid var(--line)",
          background: "var(--bg-2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-2)",
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9.5 2.5l2 2-7 7H2.5V9.5l7-7z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /><path d="M8 4l2 2" stroke="currentColor" strokeWidth="1.2" /></svg>
        </button>
      ) : (
        <button type="button" onClick={openModal} style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "10px 18px", borderRadius: 999,
          background: "var(--ink)", color: "var(--paper)",
          fontSize: 14, border: "none", cursor: "pointer", fontFamily: "inherit",
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
          Adicionar Produto
        </button>
      )}

      {isOpen && createPortal(
        <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(26,20,13,.55)" }} onClick={() => setIsOpen(false)} />
          <div style={{
            position: "relative", width: "min(860px, 96vw)", maxHeight: "92vh",
            overflowY: "auto", background: "var(--paper)", border: "1px solid var(--line)",
            borderRadius: 18, boxShadow: "0 40px 80px -30px rgba(26,20,13,.3)",
          }}>
            {/* Modal header */}
            <div style={{ padding: "28px 36px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 6 }}>
                  {isEditMode ? "Editar produto" : "Novo produto"}
                </div>
                <h2 className="serif" style={{ margin: 0, fontSize: 30, lineHeight: 1.05, letterSpacing: "-.01em" }}>
                  {isEditMode ? initialCoffee!.name : "Cadastrar café"}
                </h2>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} style={{ width: 36, height: 36, borderRadius: 999, border: "1px solid var(--line)", background: "var(--bg-2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-2)", flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 0, padding: "20px 36px 0", borderBottom: "1px solid var(--line)" }}>
              {TABS.map((label, i) => {
                const id = TAB_IDS[i];
                const active = activeTab === id;
                return (
                  <button key={id} type="button" onClick={() => setActiveTab(id)} className="mono" style={{
                    padding: "10px 20px", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase",
                    background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
                    color: active ? "var(--ink)" : "var(--ink-2)",
                    borderBottom: active ? "2px solid var(--ink)" : "2px solid transparent",
                    marginBottom: -1,
                  }}>
                    {label}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ padding: "28px 36px 24px" }}>

                {/* Tab: Básico */}
                {activeTab === "basic" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {/* Photo */}
                    <div>
                      <Lbl>Foto do produto</Lbl>
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ width: 96, height: 96, borderRadius: 12, border: "1.5px dashed var(--line)", background: "var(--bg-2)", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {photoPreview ? (
                            <img src={photoPreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M4 22l6-6 4 4 4-5 6 7H4z" stroke="var(--ink-3)" strokeWidth="1.2" strokeLinejoin="round" /><circle cx="9" cy="10" r="2.5" stroke="var(--ink-3)" strokeWidth="1.2" /></svg>
                          )}
                        </div>
                        <div>
                          <button type="button" onClick={() => fileInputRef.current?.click()} style={{ padding: "9px 16px", border: "1px solid var(--ink)", borderRadius: 999, fontSize: 13, cursor: "pointer", fontFamily: "inherit", background: "none", color: "var(--ink)" }}>
                            {photoPreview ? "Trocar imagem" : "Selecionar imagem"}
                          </button>
                          <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 6 }}>JPG, PNG ou WEBP. Recomendado 800×800px.</div>
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoChange} />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <Fld label="Nome do café" required>
                        <input type="text" value={formData.name} onChange={e => hc("name", e.target.value)} placeholder="Ex: Café Especial Premium" style={inp()} />
                      </Fld>
                      <Fld label="Variedade" required>
                        <input type="text" value={formData.variety} onChange={e => hc("variety", e.target.value)} placeholder="Ex: Bourbon, Catuaí, Mundo Novo" style={inp()} />
                      </Fld>
                    </div>

                    <Fld label="Descrição" required span={1}>
                      <textarea value={formData.description} onChange={e => hc("description", e.target.value)} placeholder="Descreva as características e origem do seu café..." rows={4} style={{ ...inp(), resize: "vertical" as const }} />
                    </Fld>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                      <Fld label="Fazenda" required>
                        <input type="text" value={formData.farm} onChange={e => hc("farm", e.target.value)} placeholder="Nome da fazenda" style={inp()} />
                      </Fld>
                      <Fld label="Produtor" required>
                        <input type="text" value={formData.producer} onChange={e => hc("producer", e.target.value)} placeholder="Nome do produtor" style={inp()} />
                      </Fld>
                      <Fld label="Região" required>
                        <input type="text" value={formData.region} onChange={e => hc("region", e.target.value)} placeholder="Ex: Cerrado Mineiro" style={inp()} />
                      </Fld>
                    </div>
                  </div>
                )}

                {/* Tab: Características */}
                {activeTab === "product" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                      <Fld label="Processamento" required>
                        <select value={formData.process} onChange={e => hc("process", e.target.value)} style={selectStyle()}>
                          <option value="">Selecione</option>
                          <option value="natural">Natural</option>
                          <option value="pulped">Pulped Natural</option>
                          <option value="washed">Lavado</option>
                          <option value="honey">Honey</option>
                          <option value="fermented">Fermentado</option>
                        </select>
                      </Fld>
                      <Fld label="Altitude (metros)" required>
                        <input type="number" step="1" value={formData.altitude} onChange={e => hc("altitude", e.target.value)} placeholder="Ex: 1200" style={inp()} />
                      </Fld>
                      <Fld label="Pontuação SCA" required>
                        <input type="number" step="1" min="0" max="100" value={formData.score} onChange={e => hc("score", e.target.value)} placeholder="Ex: 85" style={inp()} />
                        {formData.score && (
                          <div className="mono" style={{ marginTop: 6, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-2)" }}>
                            Linha automática:{" "}
                            <span style={{ color: Number(formData.score) >= 88 ? "var(--c-glamour)" : Number(formData.score) >= 87 ? "var(--c-barro)" : "var(--c-vibra)" }}>
                              {Number(formData.score) >= 88 ? "Raros" : Number(formData.score) >= 87 ? "Extraordinários" : "Origens"}
                            </span>
                          </div>
                        )}
                      </Fld>
                    </div>

                    <Fld label="Perfil de torra" required>
                      <select value={formData.roast} onChange={e => hc("roast", e.target.value)} style={selectStyle()}>
                        <option value="">Selecione o perfil de torra</option>
                        <option value="light">Clara (Light)</option>
                        <option value="medium-light">Média-Clara (Medium Light)</option>
                        <option value="medium">Média (Medium)</option>
                        <option value="medium-dark">Média-Escura (Medium Dark)</option>
                        <option value="dark">Escura (Dark)</option>
                      </select>
                    </Fld>

                    <Fld label="Notas sensoriais" required>
                      <textarea value={formData.sensory} onChange={e => hc("sensory", e.target.value)} placeholder="Ex: Chocolate, caramelo, frutas vermelhas, acidez cítrica equilibrada..." rows={3} style={{ ...inp(), resize: "vertical" as const }} />
                    </Fld>
                  </div>
                )}

                {/* Tab: Preços */}
                {activeTab === "pricing" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <Fld label="Tipo de venda" required>
                      {lockedSaleType ? (
                        <div style={{ ...inp(), display: "flex", alignItems: "center", gap: 8, opacity: 0.7, cursor: "not-allowed" }}>
                          <span style={{ fontSize: 13 }}>
                            {lockedLabel ?? (lockedSaleType === "KG" ? "Por Quilograma (Cafeterias / B2B)" : lockedSaleType === "PACKAGE" ? "Pacote Fechado (B2C)" : "Kg e Pacote")}
                          </span>
                          <span className="mono" style={{ fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 999, background: "var(--line)", color: "var(--ink-2)" }}>fixado</span>
                        </div>
                      ) : (
                        <select
                          value={formData.saleType}
                          onChange={e => hc("saleType", e.target.value)}
                          style={selectStyle()}
                        >
                          <option value="KG">Por Quilograma (Cafeterias / B2B)</option>
                          <option value="PACKAGE">Pacote Fechado (Clientes Finais / B2C)</option>
                          <option value="BOTH">Ambos — Kg e Pacote</option>
                        </select>
                      )}
                    </Fld>

                    {(formData.saleType === "KG" || formData.saleType === "BOTH") && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <Fld label="Preço por Kg (R$)" required>
                          <input type="number" step="0.01" value={formData.pricePerKg} onChange={e => hc("pricePerKg", e.target.value)} placeholder="Ex: 85.00" style={inp()} />
                        </Fld>
                        <Fld label="Estoque disponível (kg)">
                          <input type="number" step="1" min="0" value={formData.stock} onChange={e => hc("stock", e.target.value)} placeholder="Ex: 120" style={inp()} />
                        </Fld>
                      </div>
                    )}

                    {(formData.saleType === "PACKAGE" || formData.saleType === "BOTH") && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                        <Fld label="Preço pacote — Cliente Final (R$)" required>
                          <input type="number" step="0.01" value={formData.packagePrice} onChange={e => hc("packagePrice", e.target.value)} placeholder="Ex: 24.90" style={inp()} />
                        </Fld>
                        <Fld label="Preço pacote — Cafeteria (R$)">
                          <input type="number" step="0.01" value={formData.packagePriceCoffeeshop} onChange={e => hc("packagePriceCoffeeshop", e.target.value)} placeholder="Ex: 19.90" style={inp()} />
                        </Fld>
                        <Fld label="Peso do pacote (kg)" required>
                          <input type="number" step="0.001" value={formData.packageWeight} onChange={e => hc("packageWeight", e.target.value)} placeholder="Ex: 0.250" style={inp()} />
                        </Fld>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: Dimensões */}
                {activeTab === "shipping" && (
                  <div>
                    <p style={{ fontSize: 14, color: "var(--ink-2)", marginTop: 0, marginBottom: 20 }}>
                      Informações necessárias para cálculo de frete.
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 }}>
                      <Fld label="Peso (g)" required>
                        <input type="number" step="1" min="1" value={formData.weightGrams} onChange={e => hc("weightGrams", e.target.value)} style={inp()} />
                      </Fld>
                      <Fld label="Largura (cm)" required>
                        <input type="number" step="1" min="1" value={formData.widthCm} onChange={e => hc("widthCm", e.target.value)} style={inp()} />
                      </Fld>
                      <Fld label="Altura (cm)" required>
                        <input type="number" step="1" min="1" value={formData.heightCm} onChange={e => hc("heightCm", e.target.value)} style={inp()} />
                      </Fld>
                      <Fld label="Comprimento (cm)" required>
                        <input type="number" step="1" min="1" value={formData.lengthCm} onChange={e => hc("lengthCm", e.target.value)} style={inp()} />
                      </Fld>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={{ padding: "20px 36px 28px", borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button type="button" onClick={() => setIsOpen(false)} style={{ fontSize: 14, color: "var(--ink-2)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                  Cancelar
                </button>

                <div style={{ display: "flex", gap: 10 }}>
                  {tabIdx > 0 && (
                    <button type="button" onClick={() => setActiveTab(TAB_IDS[tabIdx - 1])} style={{
                      padding: "11px 20px", border: "1px solid var(--line)", borderRadius: 999, fontSize: 14,
                      background: "var(--bg-2)", color: "var(--ink)", cursor: "pointer", fontFamily: "inherit",
                    }}>
                      Anterior
                    </button>
                  )}
                  {tabIdx < TAB_IDS.length - 1 ? (
                    <button type="button" onClick={() => setActiveTab(TAB_IDS[tabIdx + 1])} style={{
                      padding: "11px 20px", borderRadius: 999, fontSize: 14,
                      background: "var(--ink)", color: "var(--paper)", border: "none", cursor: "pointer", fontFamily: "inherit",
                    }}>
                      Próximo
                    </button>
                  ) : (
                    <button type="submit" disabled={isLoading} style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      padding: "11px 22px", borderRadius: 999, fontSize: 14,
                      background: isLoading ? "var(--ink-3)" : "var(--ink)", color: "var(--paper)",
                      border: "none", cursor: isLoading ? "not-allowed" : "pointer", fontFamily: "inherit",
                    }}>
                      {isLoading ? (isEditMode ? "Salvando…" : "Cadastrando…") : (isEditMode ? "Salvar alterações" : "Cadastrar café")}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      , document.body)}
    </>
  );
}
