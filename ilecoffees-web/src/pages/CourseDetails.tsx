import { useEffect, useState, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  price: number;
  workloadHours: number;
  level: string;
}
interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  order: number;
  isLocked: boolean;
  durationMinutes: number | null;
}
interface Enrollment {
  id: string;
  courseId: string;
  userId: string;
  completedLessons: number;
}
interface CourseProgress {
  courseId: string;
  totalLessons: number;
  completedLessons: number;
  completionPercent: number;
  lessons: Array<{ lessonId: string; title: string; order: number; completed: boolean }>;
}

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: "Iniciante",
  INTERMEDIATE: "Intermediário",
  ADVANCED: "Avançado",
};
const COVER_COLORS = ["var(--c-mostarda)", "var(--c-leveza)", "var(--c-barro)", "var(--c-glamour)", "var(--c-vibra)"];
const COVER_INK = ["var(--ink)", "var(--ink)", "var(--c-leveza)", "var(--c-leveza)", "var(--c-leveza)"];

/* ===== Icons ===== */
function ArrowIcon({ size = 14, dir = "right" }: { size?: number; dir?: "left" | "right" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" style={{ transform: dir === "left" ? "rotate(180deg)" : undefined }}>
      <path d="M2.5 7h9M7.8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CartIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M2 3h2l1.6 8.4a1 1 0 001 .8h5.6a1 1 0 001-.78L14.6 6.5H4.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="6.5" cy="14" r="1" fill="currentColor" />
      <circle cx="11.5" cy="14" r="1" fill="currentColor" />
    </svg>
  );
}
function StarIcon({ filled, size = 14 }: { filled: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path d="M7 1.5l1.7 3.5 3.8.5-2.8 2.7.7 3.8L7 10.2l-3.4 1.8.7-3.8L1.5 5.5l3.8-.5z"
        fill={filled ? "var(--c-mostarda)" : "transparent"}
        stroke={filled ? "var(--c-mostarda)" : "var(--ink-3)"}
        strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}
function PlayIcon({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path d="M4 3v8l7-4z" fill={color} />
    </svg>
  );
}
function LockIcon({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <rect x="3" y="6.5" width="8" height="6" rx="1" stroke={color} strokeWidth="1.3" />
      <path d="M5 6.5V4.5a2 2 0 014 0v2" stroke={color} strokeWidth="1.3" />
    </svg>
  );
}
function CheckIcon({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path d="M3 7.5L6 10.5L11 4.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}
function Chevron({ open }: { open: boolean }) {
  return (
    <svg width={10} height={6} viewBox="0 0 10 6"
      style={{ transform: `rotate(${open ? 180 : 0}deg)`, transition: "transform .15s", flexShrink: 0 }}>
      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/* ===== Logo ===== */
function Logo() {
  return (
    <Link to="/" style={{ display: "inline-flex", alignItems: "baseline", gap: 6 }}>
      <span className="script" style={{ fontSize: 36, lineHeight: 0.75, color: "currentColor" }}>íle</span>
      <span className="serif italic" style={{ fontSize: 13, lineHeight: 1, color: "var(--c-vibra)" }}>coffees</span>
    </Link>
  );
}

/* ===== Header ===== */
function Header() {
  const { isAuthenticated, user, type, supplierType, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  const userName = user?.name ?? "";
  const accountType = (user as any)?.accountType ?? "CUSTOMER";
  const dashboardPath = type === "SUPPLIER" ? (supplierType === "PRODUCER" ? "/dashboard/producer" : "/dashboard/supplier") : type === "ADMIN" ? "/dashboard/admin" : accountType === "COFFEESHOP" ? "/dashboard/coffeeshop" : "/dashboard/customer";

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 30,
      background: "rgba(238,243,235,.92)", backdropFilter: "blur(10px)",
      borderBottom: "1px solid var(--line)",
    }}>
      <div style={{
        maxWidth: 1320, margin: "0 auto", padding: "16px 32px",
        display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: 24,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Logo />
          <span style={{ width: 1, height: 22, background: "var(--ink)", opacity: 0.2 }} />
          {accountType === "COFFEESHOP" ? (
            <Link to="/dashboard/coffeeshop" style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, color: "var(--ink-2)", textDecoration: "none" }}>
              <ArrowIcon size={12} dir="left" /> Voltar ao meu painel
            </Link>
          ) : (
            <nav style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <NavLink to="/explore" className="mono" style={({ isActive }) => ({ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" as const, color: isActive ? "var(--ink)" : "var(--ink-2)", textDecoration: "none", borderBottom: isActive ? "1.5px solid var(--ink)" : "1.5px solid transparent", paddingBottom: 1 })}>Catálogo</NavLink>
              <NavLink to="/courses" className="mono" style={({ isActive }) => ({ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" as const, color: isActive ? "var(--ink)" : "var(--ink-2)", textDecoration: "none", borderBottom: isActive ? "1.5px solid var(--ink)" : "1.5px solid transparent", paddingBottom: 1 })}>Cursos</NavLink>
              <NavLink to="/subscriptions" className="mono" style={({ isActive }) => ({ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" as const, color: isActive ? "var(--ink)" : "var(--ink-2)", textDecoration: "none", borderBottom: isActive ? "1.5px solid var(--ink)" : "1.5px solid transparent", paddingBottom: 1 })}>Assinaturas</NavLink>
            </nav>
          )}
        </div>

        <div />

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {isAuthenticated ? (
            <div ref={menuRef} style={{ position: "relative" }}>
              <button onClick={() => setMenuOpen(o => !o)} style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "6px 12px 6px 6px", borderRadius: 999,
                border: "1px solid var(--line)", background: "var(--paper)",
                cursor: "pointer", fontFamily: "inherit",
              }}>
                <span style={{
                  width: 32, height: 32, borderRadius: 999, overflow: "hidden",
                  background: type === "SUPPLIER" ? "var(--c-glamour)" : type === "ADMIN" ? "var(--c-vibra)" : accountType === "COFFEESHOP" ? "var(--c-glamour)" : "var(--c-mostarda)",
                  color: (type === "SUPPLIER" || type === "ADMIN" || accountType === "COFFEESHOP") ? "var(--c-leveza)" : "var(--ink)",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 600, fontSize: 11,
                }}>
                  {(user as any)?.photoUrl
                    ? <img src={(user as any).photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : getInitials(userName)}
                </span>
                <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.1 }}>
                  <span style={{ fontSize: 13 }}>{userName.split(" ")[0]}</span>
                  <span className="mono" style={{ fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-2)" }}>
                    {type === "SUPPLIER" ? (supplierType === "PRODUCER" ? "Produtor" : "Torrefador") : type === "ADMIN" ? "Admin" : accountType === "COFFEESHOP" ? "Cafeteria" : "Cliente"}
                  </span>
                </span>
                <Chevron open={menuOpen} />
              </button>
              {menuOpen && (
                <div style={{
                  position: "absolute", right: 0, top: "calc(100% + 8px)", zIndex: 40,
                  minWidth: 200, background: "var(--paper)",
                  border: "1px solid var(--line)", borderRadius: 14,
                  boxShadow: "0 24px 40px -20px rgba(28,8,16,.3)", padding: 8,
                }}>
                  <Link to={dashboardPath} onClick={() => setMenuOpen(false)} style={{
                    display: "flex", alignItems: "center", gap: 10, width: "100%",
                    padding: "10px 12px", borderRadius: 8, fontSize: 14,
                    color: "var(--ink)", textDecoration: "none",
                  }}>
                    Meu painel
                  </Link>
                  <div style={{ height: 1, background: "var(--line)", margin: "6px 0" }} />
                  <button onClick={() => { logout(); navigate("/"); setMenuOpen(false); }} style={{
                    display: "flex", alignItems: "center", gap: 10, width: "100%",
                    padding: "10px 12px", borderRadius: 8, fontSize: 14,
                    color: "#b8231a", background: "transparent", border: "none",
                    cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                  }}>
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" style={{ padding: "9px 16px", fontSize: 14, color: "var(--ink-2)", textDecoration: "none" }}>Entrar</Link>
              <Link to="/register/customer" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "10px 14px", borderRadius: 999, border: "1px solid var(--ink)", fontSize: 13,
                textDecoration: "none", color: "var(--ink)",
              }}>
                Criar conta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

/* ===== Cover ===== */
function Cover({ course, idx }: { course: Course; idx: number }) {
  const bg = COVER_COLORS[idx % COVER_COLORS.length];
  const ink = COVER_INK[idx % COVER_INK.length];
  const levelLabel = LEVEL_LABELS[course.level] ?? course.level;
  const words = course.title.split(" ");
  const firstWord = words[0];
  const rest = words.slice(1).join(" ");

  const hasImage = !!course.imageUrl;
  const textColor = hasImage ? "var(--c-leveza)" : ink;

  return (
    <div style={{
      position: "relative", aspectRatio: "16 / 9", borderRadius: 18, overflow: "hidden",
      background: bg, color: textColor,
      border: "1.5px solid var(--ink)", padding: "32px 36px",
      boxShadow: "0 32px 64px -32px rgba(28,8,16,.35)",
      display: "flex", flexDirection: "column", justifyContent: "space-between",
    }}>
      {hasImage && (
        <>
          <img
            src={course.imageUrl!}
            alt={course.title}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(10,4,8,.72) 0%, rgba(10,4,8,.45) 55%, rgba(10,4,8,.65) 100%)" }} />
        </>
      )}
      <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", opacity: 0.8 }}>
          íle academy · #{String(idx + 1).padStart(2, "0")}
        </span>
        <span className="mono" style={{
          fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase",
          padding: "5px 12px", borderRadius: 999,
          background: "var(--ink)", color: "var(--c-leveza)", border: "1px solid var(--ink)",
        }}>
          Nível {levelLabel}
        </span>
      </div>

      <div style={{
        position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", zIndex: 1,
        width: 108, height: 108, borderRadius: 999,
        background: hasImage ? "rgba(255,255,255,.15)" : ink === "var(--ink)" ? "var(--ink)" : "var(--c-leveza)",
        color: hasImage ? "var(--c-leveza)" : ink === "var(--ink)" ? "var(--c-leveza)" : "var(--ink)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 18px 36px -12px rgba(0,0,0,.4)",
        backdropFilter: hasImage ? "blur(4px)" : undefined,
        border: hasImage ? "1px solid rgba(255,255,255,.25)" : undefined,
      }}>
        <PlayIcon size={42} color="currentColor" />
      </div>

      <div style={{ maxWidth: 720, position: "relative", zIndex: 1 }}>
        <div className="serif" style={{ fontSize: "clamp(40px, 5.5vw, 76px)", lineHeight: 0.92, letterSpacing: "-.03em" }}>
          {firstWord} <span className="italic">{rest}</span>
        </div>
        {course.description && (
          <div className="serif italic" style={{ fontSize: 22, marginTop: 8, opacity: 0.85 }}>
            {course.description.split(".")[0]}
          </div>
        )}
      </div>

      <span className="script" aria-hidden="true" style={{
        position: "absolute", right: 24, bottom: -32, zIndex: 1,
        fontSize: 240, lineHeight: 1, opacity: 0.15, pointerEvents: "none",
      }}>íle</span>
    </div>
  );
}

/* ===== Meta band ===== */
function MetaBand({ course }: { course: Course }) {
  const mob = useIsMobile();
  const levelLabel = LEVEL_LABELS[course.level] ?? course.level;
  const items = [
    ["Nível", levelLabel],
    ["Carga horária", `${course.workloadHours} horas`],
    ["Formato", "Online"],
    ["Alunos", "642+"],
  ];
  const cols = mob ? 2 : 4;
  return (
    <div style={{
      marginTop: 28, display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 0,
      border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden", background: "var(--paper)",
    }}>
      {items.map(([k, v], i) => (
        <div key={k} style={{
          padding: "18px 20px",
          borderRight: (i % cols !== cols - 1) ? "1px solid var(--line)" : undefined,
          borderTop: i >= cols ? "1px solid var(--line)" : undefined,
        }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)" }}>{k}</div>
          <div className="serif" style={{ fontSize: 20, lineHeight: 1.2, marginTop: 6 }}>{v}</div>
        </div>
      ))}
    </div>
  );
}

/* ===== Tabs ===== */
type TabId = "DESC" | "CONTENT" | "REVIEWS" | "INSTRUCTOR";
function Tabs({ active, onChange, lessonCount }: { active: TabId; onChange: (t: TabId) => void; lessonCount: number }) {
  const tabs: { id: TabId; label: string; sub?: string }[] = [
    { id: "DESC", label: "Descrição" },
    { id: "CONTENT", label: "Conteúdo", sub: `${lessonCount} aulas` },
    { id: "REVIEWS", label: "Avaliações", sub: "87" },
    { id: "INSTRUCTOR", label: "Instrutor" },
  ];
  return (
    <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--line)" }}>
      {tabs.map(t => {
        const on = active === t.id;
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{
            padding: "16px 22px", fontSize: 14,
            color: on ? "var(--ink)" : "var(--ink-2)",
            borderBottom: `2px solid ${on ? "var(--c-vibra)" : "transparent"}`,
            marginBottom: -1,
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "none", border: "none", borderBottomWidth: 2,
            borderBottomStyle: "solid", borderBottomColor: on ? "var(--c-vibra)" : "transparent",
            cursor: "pointer", fontFamily: "inherit",
          }}>
            {t.label}
            {t.sub && (
              <span className="mono" style={{
                fontSize: 10, letterSpacing: ".1em",
                padding: "2px 7px", borderRadius: 999,
                background: on ? "var(--ink)" : "var(--bg-2)",
                color: on ? "var(--c-leveza)" : "var(--ink-2)",
              }}>
                {t.sub}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ===== Description tab ===== */
function Description({ course }: { course: Course }) {
  const mob = useIsMobile();
  return (
    <section style={{ marginTop: 32 }}>
      <h2 className="serif" style={{ margin: 0, fontSize: "clamp(36px, 4vw, 56px)", lineHeight: 1, letterSpacing: "-.015em" }}>
        Sobre o <span className="italic" style={{ color: "var(--c-vibra)" }}>curso</span>
      </h2>
      <p style={{ fontSize: 17, lineHeight: 1.6, color: "var(--ink-2)", marginTop: 18, maxWidth: 640, whiteSpace: "pre-line" as const }}>
        {course.description}
      </p>

      <h3 className="serif" style={{ margin: "40px 0 16px", fontSize: 28, letterSpacing: "-.01em" }}>O que você vai aprender</h3>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 14 }}>
        {[
          "Fundamentos e teoria aplicada",
          "Técnicas profissionais do setor",
          "Prática guiada por especialistas",
          "Certificado digital reconhecido",
          "Acesso vitalício ao conteúdo",
          "Comunidade de alunos ativa",
        ].map(item => (
          <li key={item} style={{ display: "flex", gap: 12, alignItems: "flex-start", fontSize: 15, lineHeight: 1.5 }}>
            <span style={{
              width: 24, height: 24, borderRadius: 999, background: "var(--c-leveza)",
              border: "1.5px solid var(--ink)", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1,
            }}>
              <CheckIcon size={12} color="var(--c-vibra)" />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function getEmbedUrl(url: string): string {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`;
  return url;
}

function VideoModal({ lesson, onClose, onMarkComplete, alreadyDone, nextLesson, onNext }: {
  lesson: Lesson;
  onClose: () => void;
  onMarkComplete?: () => void;
  alreadyDone?: boolean;
  nextLesson?: Lesson | null;
  onNext?: () => void;
}) {
  const [marking, setMarking] = useState(false);
  const [done, setDone] = useState(alreadyDone ?? false);

  useEffect(() => { setDone(alreadyDone ?? false); }, [alreadyDone]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleMark() {
    if (done || marking || !onMarkComplete) return;
    setMarking(true);
    try {
      await onMarkComplete();
      setDone(true);
    } finally {
      setMarking(false);
    }
  }

  const embedUrl = lesson.videoUrl ? getEmbedUrl(lesson.videoUrl) : null;

  return createPortal(
    <div
      onClick={onClose}
      style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, zIndex: 9999, background: "rgba(10,4,8,.88)", backdropFilter: "blur(6px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}
    >
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: "min(960px, calc((100vh - 200px) * 16 / 9))", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(244,204,160,.6)" }}>Aula</div>
            <div className="serif" style={{ fontSize: 22, color: "var(--c-leveza)", marginTop: 4 }}>{lesson.title}</div>
          </div>
          <button
            onClick={onClose}
            style={{ width: 36, height: 36, borderRadius: 999, border: "1px solid rgba(244,204,160,.3)", background: "transparent", cursor: "pointer", color: "var(--c-leveza)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
            aria-label="Fechar"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>
        <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", borderRadius: 16, overflow: "hidden", background: "#000", border: "1px solid rgba(255,255,255,.08)" }}>
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={lesson.title}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
            />
          ) : (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,.4)", fontSize: 14 }}>
              Vídeo não disponível
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          {lesson.durationMinutes && (
            <div className="mono" style={{ fontSize: 11, color: "rgba(244,204,160,.5)", letterSpacing: ".12em" }}>
              {lesson.durationMinutes} min
            </div>
          )}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {onMarkComplete && (
              <button
                onClick={handleMark}
                disabled={done || marking}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "9px 18px", borderRadius: 999, fontSize: 13, fontFamily: "inherit",
                  background: done ? "rgba(46,114,68,.25)" : "rgba(244,204,160,.12)",
                  border: done ? "1px solid rgba(46,114,68,.5)" : "1px solid rgba(244,204,160,.3)",
                  color: done ? "#7ecfa4" : "var(--c-leveza)",
                  cursor: done ? "default" : "pointer",
                  transition: "opacity .15s",
                  opacity: marking ? 0.6 : 1,
                }}
              >
                {done
                  ? <><svg width={13} height={13} viewBox="0 0 13 13" fill="none"><path d="M2 7l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> Concluída</>
                  : marking ? "Salvando…" : "Marcar como concluída"
                }
              </button>
            )}
            {nextLesson && onNext && (
              <button
                onClick={onNext}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "9px 18px", borderRadius: 999, fontSize: 13, fontFamily: "inherit",
                  background: "var(--c-mostarda)", color: "var(--ink)",
                  border: "1px solid rgba(244,204,160,.4)", cursor: "pointer",
                }}
              >
                Próxima aula <ArrowIcon size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ===== Content tab (lessons accordion) ===== */
function Content({ lessons, enrolled, selectedLesson, setSelectedLesson, onMarkComplete, completedIds }: {
  lessons: Lesson[];
  enrolled: boolean;
  selectedLesson: Lesson | null;
  setSelectedLesson: (l: Lesson | null) => void;
  onMarkComplete?: (lessonId: string) => Promise<void>;
  completedIds?: Set<string>;
}) {
  const mob = useIsMobile();
  const grouped = useMemo(() => {
    const chunkSize = Math.ceil(lessons.length / 3) || 4;
    const mods: { title: string; items: Lesson[] }[] = [];
    for (let i = 0; i < lessons.length; i += chunkSize) {
      mods.push({ title: `Módulo ${Math.floor(i / chunkSize) + 1}`, items: lessons.slice(i, i + chunkSize) });
    }
    return mods;
  }, [lessons]);

  const sortedLessons = useMemo(() => [...lessons].sort((a, b) => a.order - b.order), [lessons]);
  const currentIdx = selectedLesson ? sortedLessons.findIndex(l => l.id === selectedLesson.id) : -1;
  const nextLesson = enrolled && currentIdx >= 0 && currentIdx < sortedLessons.length - 1 ? sortedLessons[currentIdx + 1] : null;

  const [open, setOpen] = useState<boolean[]>([true, false, false, false]);

  function toggle(i: number) {
    setOpen(arr => arr.map((v, idx) => idx === i ? !v : v));
  }

  return (
    <section style={{ marginTop: 32 }}>
      {selectedLesson && (
        <VideoModal
          lesson={selectedLesson}
          onClose={() => setSelectedLesson(null)}
          alreadyDone={completedIds?.has(selectedLesson.id)}
          onMarkComplete={enrolled && onMarkComplete ? () => onMarkComplete(selectedLesson.id) : undefined}
          nextLesson={nextLesson}
          onNext={nextLesson ? () => setSelectedLesson(nextLesson) : undefined}
        />
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <h2 className="serif" style={{ margin: 0, fontSize: "clamp(36px, 4vw, 56px)", lineHeight: 1, letterSpacing: "-.015em" }}>
          Conteúdo do <span className="italic" style={{ color: "var(--c-vibra)" }}>curso</span>
        </h2>
        <div className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)" }}>
          {lessons.length} aulas
        </div>
      </div>

      {!enrolled && (
        <div style={{
          marginTop: 22, padding: "14px 18px", background: "var(--bg-2)", borderRadius: 12,
          fontSize: 14, color: "var(--ink-2)", display: "flex", alignItems: "center", gap: 12,
        }}>
          <span style={{ flexShrink: 0 }}><LockIcon color="var(--ink)" /></span>
          <span>Apenas as primeiras aulas estão disponíveis. <b style={{ color: "var(--ink)" }}>Matricule-se</b> para liberar todo o conteúdo.</span>
        </div>
      )}

      <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 12 }}>
        {grouped.map((mod, i) => (
          <article key={mod.title} style={{ border: "1px solid var(--line)", borderRadius: 14, background: "var(--paper)", overflow: "hidden" }}>
            <button onClick={() => toggle(i)} style={{
              width: "100%", padding: "14px 18px",
              display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16,
              textAlign: "left", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
            }}>
              <div>
                <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)" }}>
                  {mod.title}
                </div>
                <div className="serif" style={{ fontSize: 22, letterSpacing: "-.01em", marginTop: 2 }}>
                  {mod.items[0]?.title?.split(" ").slice(0, 3).join(" ")}…
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span className="mono" style={{ fontSize: 11, color: "var(--ink-2)" }}>{mod.items.length} aulas</span>
                <span style={{ transform: `rotate(${open[i] ? 180 : 0}deg)`, transition: "transform .15s" }}>
                  <ArrowIcon size={12} />
                </span>
              </div>
            </button>
            {open[i] && (
              <div>
                {mod.items.map((item, j) => {
                  const locked = !enrolled && (item.isLocked ?? j >= 2);
                  const playable = !locked && !!item.videoUrl;
                  const isDone = completedIds?.has(item.id) ?? false;
                  return (
                    <div
                      key={item.id}
                      onClick={() => playable && setSelectedLesson(item)}
                      style={{
                        padding: mob ? "12px 12px" : "12px 18px", borderTop: "1px solid var(--line)",
                        display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: mob ? 10 : 16, alignItems: "center",
                        cursor: playable ? "pointer" : "default",
                        transition: "background .12s",
                        background: isDone ? "rgba(46,114,68,.04)" : undefined,
                      }}
                      onMouseEnter={e => { if (playable) (e.currentTarget as HTMLElement).style.background = isDone ? "rgba(46,114,68,.07)" : "var(--bg)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isDone ? "rgba(46,114,68,.04)" : ""; }}
                    >
                      <span className="mono" style={{ fontSize: 11, color: isDone ? "var(--success)" : "var(--ink-2)", width: 28 }}>
                        {String(item.order).padStart(2, "0")}
                      </span>
                      <div>
                        <div style={{ fontSize: 14, color: locked ? "var(--ink-2)" : "var(--ink)" }}>{item.title}</div>
                        <div className="mono" style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: isDone ? "var(--success)" : "var(--ink-3)", marginTop: 3 }}>
                          {isDone ? "Concluída" : "Aula em vídeo"}
                        </div>
                      </div>
                      <span className="mono" style={{ fontSize: 11, color: "var(--ink-2)" }}>
                        {item.durationMinutes ? `${item.durationMinutes} min` : "—"}
                      </span>
                      <span style={{
                        width: 32, height: 32, borderRadius: 999,
                        background: isDone ? "var(--success)" : locked ? "transparent" : "var(--ink)",
                        color: locked ? "var(--ink-3)" : "var(--c-leveza)",
                        border: isDone ? "1px solid var(--success)" : locked ? "1px solid var(--line)" : "1px solid var(--ink)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {isDone
                          ? <svg width={12} height={12} viewBox="0 0 12 12" fill="none"><path d="M2 6.5l2.5 2.5 5.5-5.5" stroke="var(--c-leveza)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          : locked ? <LockIcon size={12} /> : <PlayIcon size={12} color="var(--c-leveza)" />
                        }
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

/* ===== Reviews tab ===== */
interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { id: string; name: string };
}

function fmtRelDate(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days < 1) return "hoje";
  if (days < 7) return `há ${days} dia${days > 1 ? "s" : ""}`;
  if (days < 30) return `há ${Math.floor(days / 7)} semana${Math.floor(days / 7) > 1 ? "s" : ""}`;
  if (days < 365) return `há ${Math.floor(days / 30)} mês${Math.floor(days / 30) > 1 ? "es" : ""}`;
  return `há ${Math.floor(days / 365)} ano${Math.floor(days / 365) > 1 ? "s" : ""}`;
}

function Reviews({ enrolled, courseId }: { enrolled: boolean; courseId: string }) {
  const mob = useIsMobile();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadReviews = () => {
    setLoadingReviews(true);
    api.get<ReviewItem[]>(`/courses/${courseId}/reviews`)
      .then(r => setReviews(r.data))
      .catch(() => {})
      .finally(() => setLoadingReviews(false));
  };

  useEffect(() => { loadReviews(); }, [courseId]);

  const rating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const histogram = [5, 4, 3, 2, 1].map(s => ({ s, n: reviews.filter(r => r.rating === s).length }));
  const max = Math.max(...histogram.map(h => h.n), 1);

  const handleSubmit = async () => {
    if (!stars || !text.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await api.post(`/courses/${courseId}/reviews`, { rating: stars, comment: text });
      setSubmitted(true);
      setText("");
      setStars(0);
      loadReviews();
    } catch (e: any) {
      setSubmitError(e?.response?.data?.message ?? "Erro ao publicar avaliação. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section style={{ marginTop: 32 }}>
      <h2 className="serif" style={{ margin: 0, fontSize: "clamp(36px, 4vw, 56px)", lineHeight: 1, letterSpacing: "-.015em" }}>
        Avaliações dos <span className="italic" style={{ color: "var(--c-vibra)" }}>alunos</span>
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "300px 1fr", gap: 24, margin: "24px 0 28px" }}>
        <div style={{ padding: 22, borderRadius: 16, background: "var(--paper)", border: "1px solid var(--line)" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span className="serif" style={{ fontSize: 64, lineHeight: 1, letterSpacing: "-.03em" }}>
              {reviews.length > 0 ? rating.toFixed(1) : "—"}
            </span>
            {reviews.length > 0 && <span className="serif" style={{ fontSize: 22, color: "var(--ink-2)" }}>/ 5</span>}
          </div>
          <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
            {[1, 2, 3, 4, 5].map(i => <StarIcon key={i} filled={i <= Math.round(rating)} size={18} />)}
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 8 }}>
            {loadingReviews ? "Carregando…" : `Baseado em ${reviews.length} avaliação${reviews.length !== 1 ? "ões" : ""}`}
          </div>
        </div>
        <div style={{ padding: "22px 24px", borderRadius: 16, background: "var(--paper)", border: "1px solid var(--line)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {histogram.map(h => (
              <div key={h.s} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: 14, padding: "4px 6px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span className="mono" style={{ fontSize: 11, width: 12 }}>{h.s}</span>
                  <StarIcon filled size={12} />
                </span>
                <span style={{ height: 6, background: "var(--bg-2)", borderRadius: 999 }}>
                  <span style={{ display: "block", width: `${(h.n / max) * 100}%`, height: "100%", background: "var(--c-mostarda)", borderRadius: 999 }} />
                </span>
                <span className="mono" style={{ fontSize: 11, color: "var(--ink-2)", width: 24, textAlign: "right" }}>{h.n}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {enrolled && !submitted && (
        <div style={{ padding: 22, marginBottom: 22, borderRadius: 14, background: "var(--paper)", border: "1.5px solid var(--ink)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12, gap: 14, flexWrap: "wrap" }}>
            <div className="serif" style={{ fontSize: 26, lineHeight: 1.05, letterSpacing: "-.01em" }}>
              Deixe a sua <span className="italic">avaliação</span>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {[1, 2, 3, 4, 5].map(i => (
                <button key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)} onClick={() => setStars(i)} style={{ padding: 4, border: 0, background: "none", cursor: "pointer" }}>
                  <StarIcon filled={i <= (hover || stars)} size={28} />
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Conte como foi sua experiência. O que você aprendeu? Recomendaria?"
            rows={4}
            style={{
              width: "100%", padding: "12px 14px", border: "1px solid var(--line)", borderRadius: 12,
              background: "var(--bg)", outline: "none", fontSize: 14, resize: "vertical" as const,
              fontFamily: "inherit", color: "inherit", boxSizing: "border-box" as const,
            }}
          />
          {submitError && (
            <div style={{ marginTop: 8, fontSize: 13, color: "var(--c-vibra)" }}>{submitError}</div>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
            <button onClick={handleSubmit} disabled={!stars || !text.trim() || submitting} style={{
              padding: "11px 20px", borderRadius: 999, fontSize: 14,
              background: "var(--ink)", color: "var(--c-leveza)",
              opacity: (!stars || !text.trim() || submitting) ? 0.5 : 1,
              cursor: (!stars || !text.trim() || submitting) ? "not-allowed" : "pointer",
              border: 0, fontFamily: "inherit",
            }}>
              {submitting ? "Publicando…" : "Publicar avaliação"}
            </button>
          </div>
        </div>
      )}

      {submitted && (
        <div style={{ padding: "14px 18px", marginBottom: 22, borderRadius: 12, background: "rgba(46,114,68,.10)", border: "1px solid #2e7244", fontSize: 14, color: "#2e7244" }}>
          Avaliação publicada com sucesso!
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {loadingReviews ? (
          <div style={{ padding: "32px 0", textAlign: "center" as const, fontSize: 14, color: "var(--ink-2)" }}>Carregando avaliações…</div>
        ) : reviews.length === 0 ? (
          <div style={{ padding: "32px 0", textAlign: "center" as const, fontSize: 14, color: "var(--ink-2)" }}>
            Ainda não há avaliações para este curso.{enrolled ? " Seja o primeiro a avaliar!" : ""}
          </div>
        ) : reviews.map(r => (
          <article key={r.id} style={{
            padding: "20px 22px", borderRadius: 14, background: "var(--paper)",
            border: "1px solid var(--line)", display: "grid", gridTemplateColumns: "auto 1fr", gap: 16,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 999,
              background: "var(--c-mostarda)", color: "var(--ink)",
              display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 13,
            }}>
              {r.user.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("")}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{r.user.name}</span>
                <span className="mono" style={{ fontSize: 10, letterSpacing: ".1em", color: "var(--ink-2)" }}>{fmtRelDate(r.createdAt)}</span>
              </div>
              <div style={{ display: "flex", gap: 3, marginTop: 6 }}>
                {[1, 2, 3, 4, 5].map(i => <StarIcon key={i} filled={i <= r.rating} size={12} />)}
              </div>
              {r.comment && <p style={{ fontSize: 14, lineHeight: 1.55, color: "var(--ink-2)", margin: "10px 0 0" }}>{r.comment}</p>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ===== Instructor tab ===== */
function Instructor() {
  const mob = useIsMobile();
  return (
    <section style={{ marginTop: 32 }}>
      <h2 className="serif" style={{ margin: 0, fontSize: "clamp(36px, 4vw, 56px)", lineHeight: 1, letterSpacing: "-.015em" }}>
        Quem <span className="italic" style={{ color: "var(--c-vibra)" }}>ensina</span>
      </h2>
      <div style={{
        marginTop: 24, display: "grid", gridTemplateColumns: mob ? "1fr" : "auto 1fr", gap: 28,
        padding: mob ? 18 : 24, background: "var(--c-barro)", color: "var(--c-leveza)",
        borderRadius: 18, border: "1.5px solid var(--ink)",
      }}>
        <div style={{
          width: mob ? 80 : 160, height: mob ? 80 : 160, borderRadius: 999,
          background: "var(--c-mostarda)", color: "var(--ink)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: mob ? 28 : 56, fontWeight: 500,
        }} className="serif">
          PH
        </div>
        <div>
          <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--c-mostarda)" }}>Instrutor</div>
          <div className="serif" style={{ fontSize: 44, lineHeight: 1, letterSpacing: "-.02em", marginTop: 8 }}>Pedro Henrique</div>
          <div className="serif italic" style={{ fontSize: 20, color: "var(--c-mostarda)", marginTop: 4 }}>Q-Grader · Mestre de Torra</div>
          <p style={{ fontSize: 15, lineHeight: 1.6, margin: "16px 0 0", opacity: 0.9, maxWidth: 560 }}>
            Q-Grader certificado pela SCA, com 12 anos torrando café para algumas das melhores cafeterias do Brasil.
            Mentor do programa de mestre de torra da íle.
          </p>
          <div style={{ display: "flex", gap: 24, marginTop: 22, flexWrap: "wrap" }}>
            {[["12", "anos de experiência"], ["+2k", "alunos formados"], ["4,9★", "média nos cursos"]].map(([k, v]) => (
              <div key={v}>
                <div className="serif" style={{ fontSize: 36, lineHeight: 1, letterSpacing: "-.02em", color: "var(--c-mostarda)" }}>{k}</div>
                <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===== Course checkout modal ===== */
type PayMethod = "PIX" | "CREDIT_CARD";

const PAY_METHODS: { id: PayMethod; label: string; desc: (price: number) => string }[] = [
  { id: "PIX",         label: "PIX",              desc: () => "Aprovação imediata · sem taxas" },
  { id: "CREDIT_CARD", label: "Cartão de Crédito", desc: (p) => `Até ${p > 100 ? "4x" : "3x"} sem juros` },
];

function CourseCheckoutModal({ course, orderId, onSuccess, onClose }: {
  course: Course;
  orderId: string;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const [method, setMethod] = useState<PayMethod>("PIX");
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape" && !paid) onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, paid]);

  async function handlePay() {
    setPaying(true);
    setError(null);
    try {
      await api.post("/payments", { orderId, method });
      setPaid(true);
      setTimeout(onSuccess, 2200);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Erro ao processar pagamento. Tente novamente.");
    } finally {
      setPaying(false);
    }
  }

  const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

  return createPortal(
    <div
      onClick={() => !paid && onClose()}
      style={{
        position: "fixed", top: 0, right: 0, bottom: 0, left: 0, zIndex: 9999,
        background: "rgba(10,4,8,.88)", backdropFilter: "blur(6px)",
        overflowY: "auto",
        display: "flex", justifyContent: "center", alignItems: "flex-start",
        padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 500,
          margin: "auto",
          background: "var(--paper)", borderRadius: 24,
          border: "1px solid var(--line)",
          boxShadow: "0 40px 80px -32px rgba(28,8,16,.5)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ padding: "26px 28px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-2)" }}>
              Finalizar compra
            </div>
            <div className="serif" style={{ fontSize: 26, letterSpacing: "-.015em", lineHeight: 1.1, marginTop: 6 }}>
              {course.title}
            </div>
          </div>
          {!paid && (
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: 999, flexShrink: 0,
                border: "1px solid var(--line)", background: "transparent",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--ink-2)",
              }}
              aria-label="Fechar"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        {paid ? (
          <div style={{ padding: "36px 28px 40px", textAlign: "center" }}>
            <div style={{
              width: 72, height: 72, borderRadius: 999, margin: "0 auto",
              background: "var(--c-leveza)", border: "2px solid var(--ink)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="var(--c-vibra)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="serif" style={{ fontSize: 34, lineHeight: 1.05, letterSpacing: "-.02em", marginTop: 22 }}>
              Matrícula <span className="italic" style={{ color: "var(--c-vibra)" }}>confirmada</span>!
            </div>
            <p style={{ fontSize: 15, color: "var(--ink-2)", lineHeight: 1.55, margin: "12px 0 0" }}>
              Você já tem acesso completo ao curso. Bom estudo!
            </p>
          </div>
        ) : (
          <>
            {/* Order summary */}
            <div style={{
              margin: "20px 28px", padding: "16px 20px",
              background: "var(--bg)", borderRadius: 14,
              border: "1px solid var(--line)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)" }}>Total</div>
                <div className="serif" style={{ fontSize: 44, lineHeight: 1, letterSpacing: "-.02em", marginTop: 4 }}>
                  {fmt(course.price)}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)" }}>Acesso</div>
                <div style={{ fontSize: 14, color: "var(--ink)", marginTop: 4 }}>Vitalício</div>
              </div>
            </div>

            {/* Payment method */}
            <div style={{ padding: "0 28px" }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 10 }}>
                Forma de pagamento
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {PAY_METHODS.map(m => {
                  const on = method === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 14,
                        padding: "13px 16px", borderRadius: 12,
                        border: `1.5px solid ${on ? "var(--ink)" : "var(--line)"}`,
                        background: on ? "var(--ink)" : "var(--paper)",
                        color: on ? "var(--c-leveza)" : "var(--ink)",
                        cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                        transition: "border-color .1s, background .1s",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{m.label}</div>
                        <div style={{ fontSize: 12, opacity: 0.65, marginTop: 2 }}>{m.desc(course.price)}</div>
                      </div>
                      <span style={{
                        width: 20, height: 20, borderRadius: 999, flexShrink: 0,
                        border: `2px solid ${on ? "var(--c-leveza)" : "var(--line)"}`,
                        background: on ? "var(--c-leveza)" : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {on && <span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--ink)", display: "block" }} />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <div style={{
                margin: "14px 28px 0", padding: "11px 14px", borderRadius: 10,
                background: "rgba(231,64,44,.08)", border: "1px solid rgba(231,64,44,.3)",
                color: "var(--c-vibra)", fontSize: 13,
              }}>
                {error}
              </div>
            )}

            {/* Confirm */}
            <div style={{ padding: "20px 28px 28px" }}>
              <button
                onClick={handlePay}
                disabled={paying}
                style={{
                  width: "100%", padding: "16px 20px", borderRadius: 14,
                  background: "var(--ink)", color: "var(--c-leveza)", fontSize: 16,
                  fontFamily: "inherit", border: 0, cursor: paying ? "wait" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  opacity: paying ? 0.7 : 1,
                }}
              >
                {paying ? "Processando…" : `Confirmar pagamento · ${fmt(course.price)}`}
              </button>
              <div style={{ textAlign: "center", fontSize: 12, color: "var(--ink-2)", marginTop: 10 }}>
                Compra segura · acesso imediato após confirmação
              </div>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

/* ===== Buy box ===== */
function BuyBox({ course, enrolled, progress, totalLessons, onEnroll, enrolling, enrollError, onContinue }: {
  course: Course;
  enrolled: boolean;
  progress: number;
  totalLessons: number;
  onEnroll: () => void;
  enrolling: boolean;
  enrollError: string | null;
  onContinue: () => void;
}) {
  const percent = enrolled && totalLessons > 0 ? Math.round((progress / totalLessons) * 100) : 0;

  return (
    <aside style={{
      position: "sticky", top: 96, alignSelf: "flex-start",
      background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 18,
      padding: 24, display: "flex", flexDirection: "column", gap: 18,
      boxShadow: "0 30px 60px -36px rgba(28,8,16,.25)",
    }}>
      {enrolled ? (
        <>
          <div className="mono" style={{
            fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase",
            display: "inline-flex", alignItems: "center", gap: 8, color: "var(--success)",
          }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--success)" }} />
            Matrícula ativa
          </div>
          <div>
            <div className="serif" style={{ fontSize: 28, lineHeight: 1.05, letterSpacing: "-.015em" }}>
              Continue de onde <span className="italic" style={{ color: "var(--c-vibra)" }}>parou</span>.
            </div>
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--ink-2)", marginBottom: 8 }}>
              <span className="mono" style={{ letterSpacing: ".12em", textTransform: "uppercase" }}>Seu progresso</span>
              <span><b style={{ color: "var(--ink)" }}>{progress}</b> / {totalLessons} aulas</span>
            </div>
            <div style={{ height: 10, background: "var(--bg-2)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${percent}%`,
                background: "linear-gradient(90deg, var(--c-mostarda), var(--c-vibra))",
                borderRadius: 999, transition: "width .3s",
              }} />
            </div>
            <div className="serif" style={{ fontSize: 36, lineHeight: 1, marginTop: 10, letterSpacing: "-.02em" }}>
              {percent}<span style={{ fontSize: 18, color: "var(--ink-2)" }}>% concluído</span>
            </div>
          </div>
          <button onClick={onContinue} style={{
            padding: "14px 18px", borderRadius: 12,
            background: "var(--ink)", color: "var(--c-leveza)",
            fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            border: 0, cursor: "pointer", fontFamily: "inherit",
          }}>
            <PlayIcon color="var(--c-leveza)" /> Continuar curso
          </button>
        </>
      ) : (
        <>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
              <span className="serif" style={{ fontSize: 48, lineHeight: 1, letterSpacing: "-.02em" }}>
                {course.price === 0 ? "Grátis" : `R$ ${course.price.toFixed(2).replace(".", ",")}`}
              </span>
            </div>
            {course.price > 0 && (
              <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 8 }}>
                Em até <b style={{ color: "var(--ink)" }}>{course.price > 100 ? "4x" : "3x"} de R$ {(course.price / (course.price > 100 ? 4 : 3)).toFixed(2).replace(".", ",")}</b> sem juros
              </div>
            )}
          </div>

          <button onClick={onEnroll} disabled={enrolling} style={{
            padding: "14px 18px", borderRadius: 12,
            background: "var(--ink)", color: "var(--c-leveza)",
            fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            border: 0, cursor: enrolling ? "wait" : "pointer", fontFamily: "inherit",
            opacity: enrolling ? 0.7 : 1,
          }}>
            {enrolling ? "Processando…" : course.price === 0 ? "Acessar agora — Grátis" : "Comprar este curso"}
          </button>

          {enrollError && (
            <div style={{
              padding: "11px 14px", borderRadius: 10,
              background: "rgba(231,64,44,.08)", border: "1px solid rgba(231,64,44,.3)",
              color: "var(--c-vibra)", fontSize: 13, lineHeight: 1.4,
            }}>
              {enrollError}
            </div>
          )}

          <div style={{ height: 1, background: "var(--line)" }} />

          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              "Acesso vitalício ao conteúdo",
              "Certificado digital",
              "Suporte no Q&A",
              "Atualizações gratuitas",
            ].map(item => (
              <li key={item} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--ink-2)" }}>
                <CheckIcon size={14} color="var(--success)" /> {item}
              </li>
            ))}
          </ul>
        </>
      )}
    </aside>
  );
}

/* ===== Certificate ===== */
function openCertificate(userName: string, courseTitle: string, workloadHours: number) {
  const date = new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<title>Certificado — ${courseTitle}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Mono&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#f5f0e8;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .cert{width:900px;background:#fdfaf5;border:2px solid #1c0810;padding:72px 80px;position:relative;text-align:center}
  .cert::before{content:'';position:absolute;inset:10px;border:1px solid rgba(28,8,16,.15);pointer-events:none}
  .mono{font-family:'DM Mono',monospace;letter-spacing:.14em;text-transform:uppercase;font-size:10px;color:#8a7060}
  .serif{font-family:'Playfair Display',Georgia,serif}
  .title{font-size:52px;line-height:1;letter-spacing:-.02em;margin:18px 0 8px;color:#1c0810}
  .italic{font-style:italic;color:#c0392b}
  .name{font-size:46px;font-style:italic;margin:20px 0;color:#1c0810;border-bottom:1.5px solid #1c0810;display:inline-block;padding-bottom:6px}
  .course{font-size:22px;margin:12px 0 6px;color:#1c0810}
  .hours{font-size:14px;color:#8a7060;margin-bottom:36px}
  .date{font-size:13px;color:#8a7060;margin-top:36px}
  .seal{width:80px;height:80px;border-radius:50%;background:#1c0810;color:#f5f0e8;display:inline-flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 36px;font-family:'Playfair Display',serif;font-style:italic}
  .footer{display:flex;justify-content:space-between;margin-top:48px;padding-top:24px;border-top:1px solid rgba(28,8,16,.15)}
  .sig{text-align:center;flex:1}
  .sig-line{width:140px;height:1px;background:#1c0810;margin:0 auto 8px}
  @media print{body{background:#fdfaf5}.cert{border-color:#1c0810}}
</style>
</head>
<body>
<div class="cert">
  <div class="mono">Certificado de Conclusão</div>
  <div class="serif title">Ilé <span class="italic">Coffees</span></div>
  <div class="mono" style="margin-bottom:24px">Academy · Educação em Café Especial</div>
  <div class="seal">í</div>
  <p style="font-size:15px;color:#8a7060;max-width:480px;margin:0 auto 8px">Certificamos que</p>
  <div class="serif name">${userName}</div>
  <p style="font-size:15px;color:#8a7060;margin:16px 0 8px">concluiu com êxito o curso</p>
  <div class="serif course">${courseTitle}</div>
  <div class="hours">${workloadHours}h de conteúdo</div>
  <div class="footer">
    <div class="sig"><div class="sig-line"></div><div class="mono">Ilé Coffees Academy</div></div>
    <div class="sig"><div class="sig-line"></div><div class="mono">Pedro Henrique · Q-Grader</div></div>
  </div>
  <div class="date mono">${date}</div>
</div>
<script>window.onload=function(){window.print()}</script>
</body>
</html>`;
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
}

/* ===== Page ===== */
function useIsMobile(bp = 768) {
  const [m, setM] = useState(() => typeof window !== "undefined" && window.innerWidth < bp);
  useEffect(() => {
    const h = () => setM(window.innerWidth < bp);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, [bp]);
  return m;
}

export default function CourseDetails() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [checkoutOrderId, setCheckoutOrderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("DESC");
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const mob = useIsMobile();

  const enrolled = !!enrollment;
  const completedCount = courseProgress?.completedLessons ?? 0;
  const totalLessons = lessons.length;

  useEffect(() => {
    api.get(`/courses/${courseId}`)
      .then(r => {
        const { course: c, lessons: ls, enrolled: e } = r.data;
        setCourse(c);
        setLessons(ls ?? []);
        if (e) {
          setEnrollment(e as Enrollment);
          if (user) {
            api.get<CourseProgress>(`/courses/${courseId}/progress`)
              .then(pr => setCourseProgress(pr.data))
              .catch(() => {});
          }
        }
      })
      .finally(() => setLoading(false));
  }, [courseId, user]);

  async function handleMarkComplete(lessonId: string) {
    await api.patch(`/courses/${courseId}/lessons/${lessonId}/complete`);
    const pr = await api.get<CourseProgress>(`/courses/${courseId}/progress`);
    setCourseProgress(pr.data);
  }

  function handleContinue() {
    const sorted = [...lessons].sort((a, b) => a.order - b.order);
    let next: Lesson | undefined;
    if (courseProgress) {
      const completedIds = new Set(courseProgress.lessons.filter(l => l.completed).map(l => l.lessonId));
      next = sorted.find(l => !completedIds.has(l.id));
    }
    next = next ?? sorted[completedCount] ?? sorted[sorted.length - 1];
    if (next) {
      setActiveTab("CONTENT");
      setSelectedLesson(next);
    }
  }

  async function handleEnroll() {
    if (!user) { window.location.href = "/login"; return; }
    setEnrolling(true);
    setEnrollError(null);
    try {
      const r = await api.post(`/courses/${courseId}/enroll`);
      if (r.data.enrolled) {
        setEnrollment(r.data);
      } else if (r.data.orderId) {
        setCheckoutOrderId(r.data.orderId);
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Não foi possível processar a matrícula. Tente novamente.";
      setEnrollError(msg);
    } finally {
      setEnrolling(false);
    }
  }

  async function handleCheckoutSuccess() {
    setCheckoutOrderId(null);
    try {
      const r = await api.get(`/courses/${courseId}`);
      const { enrolled: e } = r.data;
      if (e) {
        setEnrollment(e as Enrollment);
        if (user) {
          api.get<CourseProgress>(`/courses/${courseId}/progress`)
            .then(pr => setCourseProgress(pr.data))
            .catch(() => {});
        }
      }
    } catch {}
  }

  if (loading) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="serif" style={{ fontSize: 24, color: "var(--ink-2)" }}>Carregando…</div>
      </div>
    );
  }
  if (!course) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div className="serif" style={{ fontSize: 48 }}>Curso não encontrado</div>
          <Link to="/courses" style={{ display: "inline-block", marginTop: 16, color: "var(--c-vibra)" }}>← Voltar aos cursos</Link>
        </div>
      </div>
    );
  }

  const courseIdx = parseInt(courseId ?? "0") % COVER_COLORS.length;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--ink)" }}>
      <Header />

      {/* Breadcrumb */}
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: mob ? "16px 16px 0" : "20px 32px 0" }}>
        <nav className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-2)", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <Link to="/">Início</Link>
          <span style={{ opacity: 0.5 }}>/</span>
          <Link to="/courses">Cursos</Link>
          <span style={{ opacity: 0.5 }}>/</span>
          <span style={{ color: "var(--ink)" }}>{course.title}</span>
        </nav>
      </div>

      <main style={{
        maxWidth: 1320, margin: "0 auto", padding: mob ? "20px 16px 60px" : "28px 32px 80px",
        display: "grid", gridTemplateColumns: mob ? "1fr" : "minmax(0, 1fr) 380px", gap: mob ? 32 : 48, alignItems: "start",
      }}>
        <div>
          <Cover course={course} idx={courseIdx} />
          <MetaBand course={course} />

          {enrolled && completedCount > 0 && totalLessons > 0 && completedCount === totalLessons && (
            <div style={{
              marginTop: 28, padding: "20px 24px", borderRadius: 16,
              background: "linear-gradient(135deg, var(--c-glamour) 0%, #0f2920 100%)",
              color: "var(--c-leveza)", display: "flex", alignItems: "center",
              justifyContent: "space-between", gap: 20, flexWrap: "wrap",
              boxShadow: "0 8px 32px -12px rgba(15,41,32,.4)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontSize: 36 }}>🎓</span>
                <div>
                  <div className="mono" style={{ fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", opacity: .7, marginBottom: 4 }}>Parabéns!</div>
                  <div className="serif" style={{ fontSize: 22, lineHeight: 1.1, letterSpacing: "-.01em" }}>
                    Você concluiu <span className="italic">{course.title}</span>
                  </div>
                  <div style={{ fontSize: 13, marginTop: 4, opacity: .8 }}>{totalLessons} aulas · {course.workloadHours}h de conteúdo</div>
                </div>
              </div>
              <button
                onClick={() => openCertificate(user?.name ?? "Aluno", course.title, course.workloadHours)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "12px 22px", borderRadius: 999,
                  background: "var(--c-leveza)", color: "var(--c-glamour)",
                  border: 0, fontSize: 14, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 15l-2 5 5-1.5L20 21l-2-5"/><circle cx="12" cy="8" r="5"/></svg>
                Emitir Certificado
              </button>
            </div>
          )}

          <div style={{ marginTop: 40 }}>
            <Tabs active={activeTab} onChange={setActiveTab} lessonCount={totalLessons} />
            {activeTab === "DESC" && <Description course={course} />}
            {activeTab === "CONTENT" && (
              <Content
                lessons={lessons}
                enrolled={enrolled}
                selectedLesson={selectedLesson}
                setSelectedLesson={setSelectedLesson}
                onMarkComplete={enrolled ? handleMarkComplete : undefined}
                completedIds={courseProgress ? new Set(courseProgress.lessons.filter(l => l.completed).map(l => l.lessonId)) : undefined}
              />
            )}
            {activeTab === "REVIEWS" && <Reviews enrolled={enrolled} courseId={courseId!} />}
            {activeTab === "INSTRUCTOR" && <Instructor />}
          </div>
        </div>

        <BuyBox
          course={course}
          enrolled={enrolled}
          progress={completedCount}
          totalLessons={totalLessons}
          onEnroll={handleEnroll}
          enrolling={enrolling}
          enrollError={enrollError}
          onContinue={handleContinue}
        />
      </main>

      {checkoutOrderId && course && (
        <CourseCheckoutModal
          course={course}
          orderId={checkoutOrderId}
          onSuccess={handleCheckoutSuccess}
          onClose={() => setCheckoutOrderId(null)}
        />
      )}

      <footer style={{ borderTop: "1px solid var(--line)", padding: "24px 32px", fontSize: 12, color: "var(--ink-2)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <span className="mono" style={{ letterSpacing: ".12em", textTransform: "uppercase" }}>© 2026 Ilé Coffees · desde 1934</span>
          <div style={{ display: "flex", gap: 18 }}>
            <Link to="/" style={{ color: "inherit" }}>Home</Link>
            <Link to="/courses" style={{ color: "inherit" }}>Cursos</Link>
            <Link to="/explore" style={{ color: "inherit" }}>Cafés</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
