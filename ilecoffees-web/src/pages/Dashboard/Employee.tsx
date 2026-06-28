import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface StockItem {
  userId: string;
  coffeeId: string;
  quantity: number;
  alertAt?: number | null;
  updatedAt?: string;
  coffee?: {
    id: string;
    name: string;
    photoUrl?: string | null;
    saleType: string;
    supplier?: { name: string };
  };
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  enrolled?: boolean;
  progress?: number;
}

type TabId = "STOCK" | "COURSES";

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}
function fmt(v: number) {
  return v.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}

/* ── Icons ── */
function Arrow({ size = 14 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2.5 7h9M7.8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function Chevron({ open }: { open: boolean }) {
  return <svg width={10} height={6} viewBox="0 0 10 6" style={{ transform: `rotate(${open ? 180 : 0}deg)`, transition: "transform .15s", flexShrink: 0 }}><path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" /></svg>;
}
function IconStock()   { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="8" width="3" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="6.5" y="5" width="3" height="9" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="11" y="2" width="3" height="12" rx="1" stroke="currentColor" strokeWidth="1.3"/></svg>; }
function IconBook()    { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3.5h4.5a1.5 1.5 0 011.5 1.5v8a1 1 0 00-1-1H3v-8.5zM13 3.5H8.5a1.5 1.5 0 00-1.5 1.5v8a1 1 0 011-1H13v-8.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>; }
function IconLogout()  { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M9 3H4a1 1 0 00-1 1v8a1 1 0 001 1h5M11 5l3 3-3 3M14 8H7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function IconUser()    { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M3 14c.8-2.5 2.5-3.5 5-3.5s4.2 1 5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>; }

function Avatar({ initial, size }: { initial: string; size: number }) {
  return (
    <span style={{ width: size, height: size, borderRadius: 999, flexShrink: 0, overflow: "hidden", background: "var(--c-mostarda)", color: "var(--ink)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: size * 0.35, letterSpacing: ".02em" }}>
      {initial}
    </span>
  );
}

function DropdownItem({ icon, label, danger, onClick }: { icon: React.ReactNode; label: string; danger?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", borderRadius: 8, border: "none", fontSize: 14, color: danger ? "#b8231a" : "var(--ink)", background: "transparent", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-2)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
      <span style={{ color: danger ? "#b8231a" : "var(--ink-2)" }}>{icon}</span> {label}
    </button>
  );
}

function DashHeader({ userName, onLogout }: { userName: string; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const initial = getInitials(userName);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 30, background: "rgba(238,243,235,.92)", backdropFilter: "blur(10px)", borderBottom: "1px solid var(--line)" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "16px 32px", display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: 24 }}>
        <Link to="/" style={{ display: "inline-flex", alignItems: "baseline", gap: 6, textDecoration: "none", color: "inherit" }}>
          <span className="script" style={{ fontSize: 36, lineHeight: 0.75 }}>íle</span>
          <span className="serif italic" style={{ fontSize: 13, lineHeight: 1, color: "var(--c-vibra)" }}>coffees</span>
        </Link>
        <div />
        <div ref={wrapRef} style={{ position: "relative" }}>
          <button onClick={() => setOpen(o => !o)} style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "6px 14px 6px 6px", borderRadius: 999, border: "1px solid var(--line)", background: "var(--paper)", cursor: "pointer", fontFamily: "inherit" }}>
            <Avatar initial={initial} size={34} />
            <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 }}>
              <span style={{ fontSize: 14, color: "var(--ink)", fontWeight: 500, lineHeight: 1 }}>{userName.split(" ")[0]}</span>
              <span className="mono" style={{ fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-2)", lineHeight: 1 }}>Funcionário</span>
            </span>
            <Chevron open={open} />
          </button>
          {open && (
            <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", zIndex: 40, minWidth: 200, background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 14, boxShadow: "0 24px 40px -20px rgba(28,8,16,.3)", padding: 8 }}>
              <DropdownItem icon={<IconLogout />} label="Sair" danger onClick={onLogout} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function Sidebar({ active, setActive, userName, userEmail }: {
  active: TabId; setActive: (t: TabId) => void;
  userName: string; userEmail: string;
}) {
  const initial = getInitials(userName);
  const items: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "STOCK",   label: "Estoque",  icon: <IconStock /> },
    { id: "COURSES", label: "Cursos",   icon: <IconBook />  },
  ];

  return (
    <aside style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 18, padding: 22, position: "sticky", top: 96, alignSelf: "flex-start", display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 14 }}>
        <div style={{ position: "relative" }}>
          <span style={{ width: 64, height: 64, borderRadius: 999, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--paper)", boxShadow: "0 0 0 1px var(--line)" }}>
            <Avatar initial={initial} size={64} />
          </span>
          <span style={{ position: "absolute", right: -2, bottom: -2, width: 18, height: 18, borderRadius: 999, background: "var(--success)", border: "2px solid var(--paper)" }} />
        </div>
        <div>
          <div className="serif" style={{ fontSize: 22, lineHeight: 1.05, letterSpacing: "-.01em" }}>{userName}</div>
          <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 4 }}>{userEmail}</div>
          <span className="mono" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10, fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", padding: "5px 10px", borderRadius: 999, background: "var(--c-mostarda)", color: "var(--ink)", border: "1px solid var(--ink)" }}>
            Funcionário
          </span>
        </div>
      </div>

      <div style={{ height: 1, background: "var(--line)" }} />

      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {items.map(it => {
          const on = active === it.id;
          return (
            <button key={it.id} onClick={() => setActive(it.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 10, fontSize: 14, border: "none", cursor: "pointer", background: on ? "var(--ink)" : "transparent", color: on ? "var(--c-leveza)" : "var(--ink-2)", textAlign: "left", fontFamily: "inherit", transition: "background .12s" }}
              onMouseEnter={e => { if (!on) (e.currentTarget as HTMLElement).style.background = "var(--bg-2)"; }}
              onMouseLeave={e => { if (!on) (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
              <span style={{ color: on ? "var(--c-mostarda)" : "var(--ink-2)" }}>{it.icon}</span>
              <span style={{ flex: 1 }}>{it.label}</span>
            </button>
          );
        })}
      </nav>

      <div style={{ height: 1, background: "var(--line)" }} />

      <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.55 }}>
        Acesso ao <b style={{ color: "var(--ink)" }}>estoque</b> e <b style={{ color: "var(--ink)" }}>cursos</b> da cafeteria.
      </div>
    </aside>
  );
}

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [active, setActive] = useState<TabId>("STOCK");
  const [stock, setStock] = useState<StockItem[]>([]);
  const [stockEdits, setStockEdits] = useState<Record<string, { baixa: string }>>({});
  const [stockSaving, setStockSaving] = useState<Record<string, boolean>>({});
  const [stockMsg, setStockMsg] = useState<Record<string, { ok: boolean; text: string }>>({});
  const [stockLoading, setStockLoading] = useState(true);

  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesLoaded, setCoursesLoaded] = useState(false);

  const empName  = (user?.name as string) ?? "Funcionário";
  const empEmail = (user?.email as string) ?? "";

  useEffect(() => {
    api.get<StockItem[]>("/employee/stock")
      .then(r => {
        setStock(r.data);
        const edits: Record<string, { baixa: string }> = {};
        r.data.forEach(s => { edits[s.coffeeId] = { baixa: "" }; });
        setStockEdits(edits);
      })
      .catch(() => {})
      .finally(() => setStockLoading(false));
  }, []);

  useEffect(() => {
    if (active === "COURSES" && !coursesLoaded && !coursesLoading) {
      setCoursesLoading(true);
      api.get<Course[]>("/courses").then(async res => {
        try {
          const enroll = await api.get<{ courseId: string; progress: number }[]>("/courses/my-enrollments");
          const map = new Map(enroll.data.map(e => [e.courseId, e.progress]));
          setCourses(res.data.map(c => ({ ...c, enrolled: map.has(c.id), progress: map.get(c.id) ?? 0 })));
        } catch { setCourses(res.data); }
      }).catch(() => {}).finally(() => { setCoursesLoading(false); setCoursesLoaded(true); });
    }
  }, [active, coursesLoaded, coursesLoading]);

  async function handleStockSave(coffeeId: string) {
    const edit = stockEdits[coffeeId];
    if (!edit || edit.baixa === "") return;
    const current = stock.find(s => s.coffeeId === coffeeId);
    const baixa = parseFloat(edit.baixa);
    if (isNaN(baixa) || baixa <= 0) return;
    if (baixa > (current?.quantity ?? 0)) {
      setStockMsg(m => ({ ...m, [coffeeId]: { ok: false, text: "Baixa maior que o estoque" } }));
      setTimeout(() => setStockMsg(m => { const n = { ...m }; delete n[coffeeId]; return n; }), 2500);
      return;
    }
    const newQty = Math.max(0, (current?.quantity ?? 0) - baixa);
    setStockSaving(s => ({ ...s, [coffeeId]: true }));
    try {
      const { data } = await api.put<StockItem>(`/employee/stock/${coffeeId}`, { quantity: newQty, alertAt: current?.alertAt ?? null });
      setStock(prev => prev.map(s => s.coffeeId === coffeeId ? data : s));
      setStockEdits(e => ({ ...e, [coffeeId]: { baixa: "" } }));
      setStockMsg(m => ({ ...m, [coffeeId]: { ok: true, text: "Baixa registrada" } }));
    } catch {
      setStockMsg(m => ({ ...m, [coffeeId]: { ok: false, text: "Erro ao salvar" } }));
    } finally {
      setStockSaving(s => ({ ...s, [coffeeId]: false }));
      setTimeout(() => setStockMsg(m => { const n = { ...m }; delete n[coffeeId]; return n; }), 2500);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <DashHeader userName={empName} onLogout={() => { logout(); navigate("/"); }} />

      <main style={{ maxWidth: 1320, margin: "0 auto", padding: "32px 32px 80px", display: "grid", gridTemplateColumns: "280px 1fr", gap: 28, alignItems: "start" }}>
        <Sidebar active={active} setActive={setActive} userName={empName} userEmail={empEmail} />

        <div>
          {/* STOCK */}
          {active === "STOCK" && (
            <>
              <div style={{ marginBottom: 28 }}>
                <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 12 }}>
                  <span style={{ color: "var(--c-vibra)" }}>§</span>&nbsp; Inventário
                </div>
                <h1 className="serif" style={{ margin: 0, fontSize: "clamp(44px, 5vw, 64px)", lineHeight: 0.95, letterSpacing: "-.025em" }}>
                  Controle de <span className="italic" style={{ color: "var(--c-vibra)" }}>estoque</span>.
                </h1>
                <p style={{ fontSize: 14, color: "var(--ink-2)", marginTop: 8 }}>{stock.length} café{stock.length !== 1 ? "s" : ""} rastreado{stock.length !== 1 ? "s" : ""}</p>
              </div>

              {stockLoading ? (
                <div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}>
                  <div className="mono" style={{ fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--ink-2)" }}>Carregando…</div>
                </div>
              ) : stock.length === 0 ? (
                <div style={{ padding: "48px 32px", textAlign: "center", background: "var(--paper)", border: "1px dashed var(--line)", borderRadius: 16 }}>
                  <div className="mono" style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--ink-2)" }}>Nenhum item no estoque</div>
                  <p style={{ fontSize: 14, color: "var(--ink-2)", marginTop: 8 }}>O estoque aparecerá aqui assim que a cafeteria realizar compras no catálogo B2B.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
                  {stock.map(item => {
                    const edit = stockEdits[item.coffeeId] ?? { baixa: "" };
                    const currentQty = item.quantity;
                    const isLow = item.alertAt != null && currentQty <= item.alertAt;
                    const baixaVal = edit.baixa !== "" ? parseFloat(edit.baixa) : 0;
                    const exceedsStock = baixaVal > currentQty;
                    const msg = stockMsg[item.coffeeId];
                    const saving = stockSaving[item.coffeeId];
                    const unit = item.coffee?.saleType === "KG" ? "kg" : "pct";
                    return (
                      <div key={item.coffeeId} style={{ background: "var(--paper)", border: `1px solid ${isLow ? "var(--c-vibra)" : "var(--line)"}`, borderRadius: 16, padding: "20px 22px", display: "grid", gridTemplateColumns: "52px 1fr auto", gap: 16, alignItems: "center" }}>
                        <div style={{ width: 52, height: 52, borderRadius: 10, overflow: "hidden", background: "var(--bg-2)", flexShrink: 0 }}>
                          {item.coffee?.photoUrl
                            ? <img src={item.coffee.photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><span className="serif italic" style={{ fontSize: 18, color: "var(--ink-3)" }}>í</span></div>}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                            <span className="serif" style={{ fontSize: 18, lineHeight: 1.1 }}>{item.coffee?.name ?? "—"}</span>
                            {item.coffee?.supplier && <span style={{ fontSize: 12, color: "var(--ink-2)" }}>{item.coffee.supplier.name}</span>}
                            <span className="mono" style={{ fontSize: 11, padding: "3px 10px", borderRadius: 999, background: isLow ? "rgba(231,64,44,.10)" : "var(--bg-2)", color: isLow ? "var(--c-vibra)" : "var(--ink-2)", border: `1px solid ${isLow ? "var(--c-vibra)" : "var(--line)"}` }}>
                              {fmt(currentQty)} {unit}{isLow ? " · estoque baixo" : ""}
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <label className="mono" style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-2)", whiteSpace: "nowrap" }}>Dar baixa ({unit})</label>
                              <input type="number" min="0" max={currentQty} step="0.1" placeholder="0" value={edit.baixa}
                                onChange={e => setStockEdits(prev => ({ ...prev, [item.coffeeId]: { baixa: e.target.value } }))}
                                style={{ width: 90, padding: "7px 10px", borderRadius: 8, border: `1px solid ${exceedsStock ? "var(--c-vibra)" : "var(--line)"}`, background: "var(--bg)", fontSize: 14, fontFamily: "inherit", color: exceedsStock ? "var(--c-vibra)" : "var(--ink)", outline: "none" }} />
                            </div>
                            {msg && <span style={{ fontSize: 12, color: msg.ok ? "var(--success)" : "var(--c-vibra)" }}>{msg.text}</span>}
                          </div>
                        </div>
                        <button onClick={() => handleStockSave(item.coffeeId)}
                          disabled={saving || exceedsStock || edit.baixa === "" || baixaVal <= 0}
                          style={{ padding: "8px 16px", borderRadius: 999, background: "var(--ink)", color: "var(--c-leveza)", border: "none", fontSize: 13, cursor: (saving || exceedsStock || edit.baixa === "" || baixaVal <= 0) ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: (saving || exceedsStock || edit.baixa === "" || baixaVal <= 0) ? 0.4 : 1, whiteSpace: "nowrap" }}>
                          {saving ? "Salvando…" : "Registrar baixa"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* COURSES */}
          {active === "COURSES" && (
            <>
              <div style={{ marginBottom: 28 }}>
                <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 12 }}>
                  <span style={{ color: "var(--c-vibra)" }}>§</span>&nbsp; Aprendizado
                </div>
                <h1 className="serif" style={{ margin: 0, fontSize: "clamp(44px, 5vw, 64px)", lineHeight: 0.95, letterSpacing: "-.025em" }}>
                  Cursos <span className="italic" style={{ color: "var(--c-vibra)" }}>disponíveis</span>.
                </h1>
                <p style={{ fontSize: 14, color: "var(--ink-2)", marginTop: 8 }}>{courses.length} curso{courses.length !== 1 ? "s" : ""} no catálogo</p>
              </div>

              {coursesLoading ? (
                <div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}>
                  <div className="mono" style={{ fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--ink-2)" }}>Carregando…</div>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                  {courses.map(course => (
                    <div key={course.id} style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                      <div style={{ aspectRatio: "16/9", background: "var(--bg-2)", overflow: "hidden" }}>
                        {course.imageUrl
                          ? <img src={course.imageUrl} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><span className="serif italic" style={{ fontSize: 32, color: "var(--ink-3)" }}>íle</span></div>}
                      </div>
                      <div style={{ padding: "18px 20px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                        <div className="serif" style={{ fontSize: 19, lineHeight: 1.1, letterSpacing: "-.01em" }}>{course.title}</div>
                        {course.description && <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.45 }}>{course.description.slice(0, 90)}{course.description.length > 90 ? "…" : ""}</div>}

                        {course.enrolled && (
                          <div style={{ marginTop: 4 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                              <span className="mono" style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-2)" }}>Progresso</span>
                              <span className="mono" style={{ fontSize: 11, color: "var(--c-glamour)" }}>{course.progress ?? 0}%</span>
                            </div>
                            <div style={{ height: 4, borderRadius: 999, background: "var(--line)", overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${course.progress ?? 0}%`, background: "var(--c-glamour)", borderRadius: 999, transition: "width .3s" }} />
                            </div>
                          </div>
                        )}

                        <button onClick={async () => {
                            try { await api.post(`/employee/courses/${course.id}/view`, {}); } catch { /* silent */ }
                            navigate(`/course/${course.id}`);
                          }}
                          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "10px", borderRadius: 999, background: course.enrolled ? "transparent" : "var(--ink)", color: course.enrolled ? "var(--c-glamour)" : "var(--c-leveza)", border: course.enrolled ? "1px solid var(--c-glamour)" : "none", fontSize: 13, cursor: "pointer", fontFamily: "inherit", marginTop: "auto" }}>
                          {course.enrolled ? "Continuar" : "Ver curso"} <Arrow size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {courses.length === 0 && (
                    <div style={{ gridColumn: "1 / -1", padding: "48px 24px", textAlign: "center", background: "var(--paper)", border: "1px dashed var(--line)", borderRadius: 16 }}>
                      <p style={{ fontSize: 14, color: "var(--ink-2)" }}>Nenhum curso disponível no momento.</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <footer style={{ borderTop: "1px solid var(--line)", padding: "24px 32px" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, fontSize: 12, color: "var(--ink-2)" }}>
          <span className="mono" style={{ letterSpacing: ".12em", textTransform: "uppercase" }}>© 2026 Ilé Coffees · desde 1934</span>
          <div style={{ display: "flex", gap: 18 }}>
            <Link to="/explore" style={{ textDecoration: "none", color: "inherit" }}>Catálogo</Link>
            <Link to="/courses" style={{ textDecoration: "none", color: "inherit" }}>Cursos</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
