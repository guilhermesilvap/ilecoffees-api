import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

export interface SubscriptionInitialData {
  id: string;
  name: string;
  description: string | null;
  monthlyPrice: number;
  annualPrice: number;
  coffeeshopMonthlyPrice?: number | null;
  coffeeshopAnnualPrice?: number | null;
  coffeeIds?: string[];
}

interface AddSubscriptionFormProps {
  onSuccess?: () => void;
  initialSubscription?: SubscriptionInitialData;
}

interface CoffeeOption { id: string; name: string; description: string | null }

function inp(extra: React.CSSProperties = {}): React.CSSProperties {
  return {
    width: "100%", padding: "10px 14px", borderRadius: 10,
    border: "1px solid var(--line)", background: "var(--bg)",
    fontSize: 14, fontFamily: "inherit", outline: "none",
    color: "var(--ink)", boxSizing: "border-box", ...extra,
  };
}

export function AddSubscriptionForm({ onSuccess, initialSubscription }: AddSubscriptionFormProps) {
  const isEditMode = !!initialSubscription;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableCoffees, setAvailableCoffees] = useState<CoffeeOption[]>([]);
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: initialSubscription?.name ?? "",
    description: initialSubscription?.description ?? "",
    monthlyPrice: initialSubscription?.monthlyPrice.toString() ?? "",
    annualPrice: initialSubscription?.annualPrice.toString() ?? "",
    coffeeshopMonthlyPrice: initialSubscription?.coffeeshopMonthlyPrice?.toString() ?? "",
    coffeeshopAnnualPrice: initialSubscription?.coffeeshopAnnualPrice?.toString() ?? "",
    quantity: (initialSubscription as any)?.quantity?.toString() ?? "",
    selectedCoffees: initialSubscription?.coffeeIds ?? [] as string[],
  });

  useEffect(() => {
    if (!open) return;
    api.get<CoffeeOption[]>("/coffees").then(r => setAvailableCoffees(r.data)).catch(() => {});
    if (isEditMode) {
      setForm({
        name: initialSubscription!.name,
        description: initialSubscription!.description ?? "",
        monthlyPrice: initialSubscription!.monthlyPrice.toString(),
        annualPrice: initialSubscription!.annualPrice.toString(),
        coffeeshopMonthlyPrice: initialSubscription!.coffeeshopMonthlyPrice?.toString() ?? "",
        coffeeshopAnnualPrice: initialSubscription!.coffeeshopAnnualPrice?.toString() ?? "",
        quantity: (initialSubscription as any)?.quantity?.toString() ?? "",
        selectedCoffees: initialSubscription!.coffeeIds ?? [],
      });
    }
  }, [open]);

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function toggleCoffee(id: string) {
    setForm(prev => ({
      ...prev,
      selectedCoffees: prev.selectedCoffees.includes(id)
        ? prev.selectedCoffees.filter(c => c !== id)
        : [...prev.selectedCoffees, id],
    }));
  }

  function annualDiscount() {
    const m = parseFloat(form.monthlyPrice);
    const a = parseFloat(form.annualPrice);
    if (!m || !a) return null;
    const pct = ((m * 12 - a) / (m * 12)) * 100;
    return pct > 0 ? pct.toFixed(0) : null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.selectedCoffees.length === 0) {
      toast({ title: "Selecione pelo menos um café.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        monthlyPrice: parseFloat(form.monthlyPrice),
        annualPrice: parseFloat(form.annualPrice),
        coffeeshopMonthlyPrice: form.coffeeshopMonthlyPrice ? parseFloat(form.coffeeshopMonthlyPrice) : null,
        coffeeshopAnnualPrice: form.coffeeshopAnnualPrice ? parseFloat(form.coffeeshopAnnualPrice) : null,
        quantity: form.quantity ? parseInt(form.quantity, 10) : null,
        coffeeIds: form.selectedCoffees,
      };
      if (isEditMode) {
        await api.put(`/subscriptions/${initialSubscription!.id}`, payload);
        toast({ title: "Assinatura atualizada com sucesso." });
      } else {
        await api.post("/subscriptions", payload);
        toast({ title: "Assinatura criada com sucesso." });
        setForm({ name: "", description: "", monthlyPrice: "", annualPrice: "", coffeeshopMonthlyPrice: "", coffeeshopAnnualPrice: "", quantity: "", selectedCoffees: [] });
      }
      setOpen(false);
      onSuccess?.();
    } catch (err: unknown) {
      const msg = (err as any)?.response?.data?.message ?? "Erro ao salvar assinatura.";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  const discount = annualDiscount();

  return (
    <>
      {isEditMode ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            padding: "8px 12px", borderRadius: 999,
            border: "1px solid var(--line)", background: "none",
            fontSize: 12, cursor: "pointer", fontFamily: "inherit", color: "var(--ink)",
          }}
        >
          Editar
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "11px 20px", borderRadius: 999,
            background: "var(--ink)", color: "var(--c-leveza)",
            border: 0, cursor: "pointer", fontFamily: "inherit", fontSize: 14,
          }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Nova assinatura
        </button>
      )}

      {open && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(28,8,16,.55)",
          backdropFilter: "blur(4px)", zIndex: 50,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        }}>
          <div style={{
            background: "var(--paper)", borderRadius: 20, padding: 32,
            width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto",
          }}>
            <div className="serif" style={{ fontSize: 24, letterSpacing: "-.01em", marginBottom: 24 }}>
              {isEditMode ? `Editar assinatura` : "Nova assinatura"}
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Nome */}
              <div>
                <label className="mono" style={{ display: "block", fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 6 }}>
                  Nome *
                </label>
                <input
                  required
                  value={form.name}
                  onChange={e => set("name", e.target.value)}
                  placeholder="Ex: Assinatura Premium Mensal"
                  style={inp()}
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="mono" style={{ display: "block", fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 6 }}>
                  Descrição *
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={e => set("description", e.target.value)}
                  placeholder="Descreva os benefícios e características desta assinatura..."
                  style={{ ...inp(), resize: "vertical" }}
                />
              </div>

              {/* Preços */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="mono" style={{ display: "block", fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 6 }}>
                    Preço mensal (R$) *
                  </label>
                  <input
                    required type="number" step="0.01" min="0"
                    value={form.monthlyPrice}
                    onChange={e => set("monthlyPrice", e.target.value)}
                    placeholder="89.90"
                    style={inp()}
                  />
                </div>
                <div>
                  <label className="mono" style={{ display: "block", fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 6 }}>
                    Preço anual (R$) *
                  </label>
                  <input
                    required type="number" step="0.01" min="0"
                    value={form.annualPrice}
                    onChange={e => set("annualPrice", e.target.value)}
                    placeholder="899.00"
                    style={inp()}
                  />
                  {discount && (
                    <div className="mono" style={{ fontSize: 10, color: "var(--c-vibra)", marginTop: 4, letterSpacing: ".1em" }}>
                      {discount}% de desconto no anual
                    </div>
                  )}
                </div>
              </div>

              {/* Preços B2B (Cafeteria) */}
              <div>
                <label className="mono" style={{ display: "block", fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 6 }}>
                  Preços B2B — Cafeteria (opcional)
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label className="mono" style={{ display: "block", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 4 }}>
                      Mensal B2B (R$)
                    </label>
                    <input
                      type="number" step="0.01" min="0"
                      value={form.coffeeshopMonthlyPrice}
                      onChange={e => set("coffeeshopMonthlyPrice", e.target.value)}
                      placeholder="Ex: 69.90"
                      style={inp()}
                    />
                  </div>
                  <div>
                    <label className="mono" style={{ display: "block", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 4 }}>
                      Anual B2B (R$)
                    </label>
                    <input
                      type="number" step="0.01" min="0"
                      value={form.coffeeshopAnnualPrice}
                      onChange={e => set("coffeeshopAnnualPrice", e.target.value)}
                      placeholder="Ex: 699.00"
                      style={inp()}
                    />
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 6 }}>
                  Preço exclusivo para contas do tipo Cafeteria. Deixe em branco para usar o preço padrão.
                </div>
              </div>

              {/* Quantidade por entrega */}
              <div>
                <label className="mono" style={{ display: "block", fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 6 }}>
                  Itens por entrega (opcional)
                </label>
                <input
                  type="number" step="1" min="1"
                  value={form.quantity}
                  onChange={e => set("quantity", e.target.value)}
                  placeholder="Ex: 2"
                  style={{ ...inp(), maxWidth: 160 }}
                />
                <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 6 }}>
                  Número de pacotes enviados por ciclo de cobrança.
                </div>
              </div>

              {/* Cafés */}
              <div>
                <label className="mono" style={{ display: "block", fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 10 }}>
                  Cafés inclusos *
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 220, overflowY: "auto" }}>
                  {availableCoffees.length === 0 && (
                    <div style={{ fontSize: 13, color: "var(--ink-3)", padding: "12px 0" }}>Carregando cafés…</div>
                  )}
                  {availableCoffees.map(coffee => {
                    const checked = form.selectedCoffees.includes(coffee.id);
                    return (
                      <label
                        key={coffee.id}
                        style={{
                          display: "flex", alignItems: "flex-start", gap: 12,
                          padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                          border: `1px solid ${checked ? "var(--ink)" : "var(--line)"}`,
                          background: checked ? "var(--bg)" : "transparent",
                          transition: "border-color .1s, background .1s",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCoffee(coffee.id)}
                          style={{ marginTop: 2, accentColor: "var(--c-vibra)", flexShrink: 0 }}
                        />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500 }}>{coffee.name}</div>
                          {coffee.description && (
                            <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 2, lineHeight: 1.4 }}>{coffee.description}</div>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
                {form.selectedCoffees.length === 0 && (
                  <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 6 }}>Selecione pelo menos um café</div>
                )}
              </div>

              {/* Ações */}
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  style={{
                    padding: "11px 20px", borderRadius: 999,
                    border: "1px solid var(--line)", background: "none",
                    fontSize: 14, cursor: "pointer", fontFamily: "inherit", color: "var(--ink)",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "11px 20px", borderRadius: 999,
                    background: "var(--ink)", color: "var(--c-leveza)",
                    border: 0, fontSize: 14, cursor: loading ? "not-allowed" : "pointer",
                    fontFamily: "inherit", opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? "Salvando…" : isEditMode ? "Salvar alterações" : "Criar assinatura"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
