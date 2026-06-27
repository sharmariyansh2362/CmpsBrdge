import { C } from "../../constants/colors";
import { Icons } from "../Icons";

// ─── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({ name = "?", size = 36, color = C.primary }) {
  const safeName = typeof name === 'string' && name.trim() ? name : "?";
  const initials = safeName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: color + "22", color, fontSize: size * 0.35,
      fontWeight: 700, display: "flex", alignItems: "center",
      justifyContent: "center", flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, p = 20, style = {}, className = "" }) {
  return (
    <div className={`cb-card ${className}`} style={{ padding: p, ...style }}>
      {children}
    </div>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
export function Btn({ children, color = C.primary, textColor = "#fff", onClick, full, sm, style = {}, variant }) {
  let bg = color, tc = textColor;
  if (variant === "soft") { bg = color + "18"; tc = color; }
  if (variant === "outline") { bg = "transparent"; tc = color; }
  return (
    <button
      className={`cb-btn ${sm ? "cb-btn-sm" : ""} ${full ? "cb-btn-full" : ""}`}
      onClick={onClick}
      style={{
        background: bg, color: tc,
        border: variant === "outline" ? `1.5px solid ${color}` : "none",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ label, color }) {
  return (
    <span className="cb-badge" style={{ background: color + "20", color }}>
      {label}
    </span>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ label, type = "text", placeholder, value, onChange, icon, id }) {
  return (
    <div className="cb-input-wrap">
      {label && <label className="cb-label" htmlFor={id}>{label}</label>}
      <div className="cb-input-box">
        {icon && <span className="cb-input-prefix">{icon}</span>}
        <input
          id={id} type={type} placeholder={placeholder} value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={`cb-input ${icon ? "cb-input-icon" : ""}`}
        />
      </div>
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, Icon, color, soft, delta }) {
  return (
    <Card p={18}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <div className="cb-stat-icon" style={{ background: soft }}>
          <Icon size={18} color={color} />
        </div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: C.text, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: C.sub, marginTop: 4 }}>{label}</div>
      {delta && <div style={{ fontSize: 11.5, color, marginTop: 6, fontWeight: 700 }}>{delta}</div>}
    </Card>
  );
}

// ─── ProgressBar ──────────────────────────────────────────────────────────────
export function ProgressBar({ pct, color }) {
  return (
    <div className="cb-progress-track">
      <div className="cb-progress-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

// ─── SectionHead ──────────────────────────────────────────────────────────────
export function SectionHead({ title, action, onAction, actionColor = C.primary }) {
  return (
    <div className="cb-flex-between" style={{ marginBottom: 16 }}>
      <h3 style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{title}</h3>
      {action && (
        <Btn sm color={actionColor} variant="soft" onClick={onAction}>
          {action}
        </Btn>
      )}
    </div>
  );
}




// ─── HeroBanner ───────────────────────────────────────────────────────────────
export function HeroBanner({ gradient, title, subtitle, actions }) {
  return (
    <div className="cb-hero" style={{ background: gradient }}>
      <div className="cb-hero-deco">
        <div className="cb-hero-circle1" />
        <div className="cb-hero-circle2" />
      </div>
      <h2 style={{ fontSize: 21, fontWeight: 800, color: "#fff", marginBottom: 6 }}>{title}</h2>
      <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.85)", marginBottom: 18 }}
        dangerouslySetInnerHTML={{ __html: subtitle }} />
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>{actions}</div>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children, width = 460 }) {
  return (
    <div className="cb-modal-bg" onClick={onClose}>
      <div className="cb-modal" style={{ maxWidth: width }} onClick={(e) => e.stopPropagation()}>
        <div className="cb-flex-between" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: C.text }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <Icons.X size={18} color={C.sub} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
export function Tabs({ items, active, onChange, activeColor = C.primary }) {
  return (
    <div className="cb-tabs">
      {items.map((item) => (
        <button key={item} className="cb-tab"
          style={{
            background: active === item ? activeColor : "transparent",
            color: active === item ? "#fff" : C.sub,
            textTransform: "capitalize",
          }}
          onClick={() => onChange(item)}>
          {item}
        </button>
      ))}
    </div>
  );
}
