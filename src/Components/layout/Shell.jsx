import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { C, ROLE_COLORS, ROLE_LABELS } from "../../constants/colors";
import { NAV_ITEMS } from "../../constants/data";
import { useApp } from "../../context/AppContext";
import { Avatar } from "../ui";
import { Icons } from "../Icons";

// ─── Icon resolver (maps string → component) ──────────────────────────────────
function NavIcon({ name, size = 17, color }) {
  const I = Icons[name];
  return I ? <I size={size} color={color} /> : null;
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
export function Sidebar({ open, onClose }) {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const rc = ROLE_COLORS[user.role];
  const navItems = NAV_ITEMS[user.role];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const currentPage = location.pathname.split("/")[2] || "dashboard";

  return (
    <>
      {open && (
        <div className="cb-sidebar-overlay" onClick={onClose} />
      )}

      <aside className={`cb-sidebar ${open ? "open" : ""}`}>
        <button
          type="button"
          className="cb-sidebar-close-btn"
          onClick={onClose}
          aria-label="Close navigation menu"
        >
          <Icons.X size={18} color="#fff" />
        </button>

        {/* Logo */}
        <div className="cb-nav-logo">
          <div className="cb-nav-logo-icon">
            <Icons.GradCap size={22} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 13.5, color: "#fff", lineHeight: 1.2 }}>
              KR Mangalam
            </div>
            <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.55)" }}>
              University Portal
            </div>
          </div>
        </div>

        {/* Role pill */}
        <div className="cb-nav-role-pill">
          <div style={{
            width: 22, height: 22, borderRadius: "50%", background: rc,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {user.role === "student" && <Icons.User size={12} color="#fff" />}
            {user.role === "faculty" && <Icons.BookOpen size={12} color="#fff" />}
            {user.role === "admin" && <Icons.Shield size={12} color="#fff" />}
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>
            {ROLE_LABELS[user.role]}
          </span>
        </div>

        {/* Nav items */}
        <nav className="cb-nav-items">
          {navItems.map(({ id, label, icon, badge }) => {
            const isActive = currentPage === id;
            return (
              <NavLink
                key={id}
                to={`/${user.role}/${id}`}
                onClick={onClose}
                className="cb-nav-item"
                style={{
                  background: isActive ? "rgba(255,255,255,0.2)" : "transparent",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.65)",
                  textDecoration: "none",
                }}
              >
                <NavIcon name={icon} size={17} color={isActive ? "#fff" : "rgba(255,255,255,0.65)"} />
                <span style={{ flex: 1 }}>{label}</span>
                {badge && !isActive && (
                  <span className="cb-nav-badge">{badge}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom user strip + logout */}
        <div className="cb-nav-bottom">
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "8px 6px", marginBottom: 4,
          }}>
            <Avatar name={user.name} size={34} color={rc} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 12.5, fontWeight: 700, color: "#fff",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {user.name}
              </div>
              <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.55)" }}>
                {user.email || user.rollNo}
              </div>
            </div>
          </div>
          <button onClick={handleLogout} className="cb-nav-item" style={{ color: "rgba(255,128,66,0.9)" }}>
            <Icons.LogOut size={16} color="rgba(255,128,66,0.9)" />
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
}

// ─── Topbar ───────────────────────────────────────────────────────────────────
const PAGE_TITLE_MAP = {
  dashboard: "Dashboard",
  announcements: "Announcements & Events",
  courses: "My Courses",
  channels: "Classroom Channels",
  "lost-found": "Lost & Found",
  profile: "My Profile",
  students: "All Students",
  users: "Manage Users",
  applications: "Applications",
  logs: "System Logs",
};

export function Topbar({ onMenu }) {
  const { user } = useApp();
  const location = useLocation();
  const rc = ROLE_COLORS[user.role];
  const page = location.pathname.split("/")[2] || "dashboard";
  const title = PAGE_TITLE_MAP[page] || "Dashboard";

  return (
    <header className="cb-topbar">
      <div className="cb-flex cb-gap-3">
        <button
          onClick={onMenu}
          className="cb-menu-btn"
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: C.surface, border: "none", cursor: "pointer",
            alignItems: "center", justifyContent: "center",
          }}
        >
          <Icons.Menu size={18} color={C.sub} />
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: C.text }}>{title}</h1>
      </div>

      <div className="cb-flex cb-gap-3">
        <button style={{
          width: 36, height: 36, borderRadius: 10, background: C.surface,
          border: "none", cursor: "pointer", display: "flex",
          alignItems: "center", justifyContent: "center", position: "relative",
        }}>
          <Icons.Bell size={16} color={C.sub} />
          <span style={{
            position: "absolute", top: 7, right: 7, width: 8, height: 8,
            borderRadius: "50%", background: C.danger, border: "2px solid #EEEEFF",
          }} />
        </button>

        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          paddingLeft: 12, borderLeft: `1.5px solid ${C.border}`,
        }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.text }}>{user.name}</div>
            <div style={{ fontSize: 11, color: rc }}>{ROLE_LABELS[user.role]}</div>
          </div>
          <Avatar name={user.name} size={36} color={rc} />
        </div>
      </div>
    </header>
  );
}

// ─── Shell ────────────────────────────────────────────────────────────────────
export function Shell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="cb-app">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="cb-main">
        <Topbar onMenu={() => setSidebarOpen(true)} />
        <main className="cb-content">{children}</main>
      </div>
    </div>
  );
}
