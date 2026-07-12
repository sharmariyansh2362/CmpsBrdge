import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { C, ROLE_COLORS, ROLE_LABELS } from "../../constants/colors";
import { NAV_ITEMS } from "../../constants/data";
import { useApp } from "../../context/AppContext";
import { Avatar } from "../ui";
import { Icons } from "../Icons";

// ─── Icon resolver (maps string → component) ──────────────────────────────────
function NavIcon({ name, size = 18, color }) {
  const I = Icons[name];
  return I ? <I size={size} color={color} /> : null;
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
export function Sidebar({ open, onClose, collapsed, toggleCollapse }) {
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

      <aside className={`cb-sidebar ${open ? "open" : ""} ${collapsed ? "collapsed" : ""}`}>
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
          {!collapsed && (
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 13.5, color: "#fff", lineHeight: 1.2 }}>
                KR Mangalam
              </div>
              <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.55)" }}>
                University Portal
              </div>
            </div>
          )}
        </div>

        {/* Role pill */}
        {!collapsed && (
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
        )}

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
                title={collapsed ? label : undefined}
                style={{
                  background: isActive ? "rgba(255,255,255,0.2)" : "transparent",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.65)",
                  textDecoration: "none",
                  justifyContent: collapsed ? "center" : "flex-start",
                  padding: collapsed ? "11px 0" : "11px 16px",
                }}
              >
                <NavIcon name={icon} size={18} color={isActive ? "#fff" : "rgba(255,255,255,0.65)"} />
                {!collapsed && <span style={{ flex: 1 }}>{label}</span>}
                {badge && !isActive && !collapsed && (
                  <span className="cb-nav-badge">{badge}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Collapse button for desktop */}
        <button
          onClick={toggleCollapse}
          className="cb-sidebar-toggle-btn"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "none",
            color: "rgba(255,255,255,0.6)",
            padding: "8px 0",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            fontSize: 11,
            fontWeight: 700,
            gap: 6
          }}
        >
          {collapsed ? <Icons.ChevRight size={14} color="#fff" /> : (
            <>
              <Icons.ChevLeft size={14} color="#fff" />
              <span>Collapse Menu</span>
            </>
          )}
        </button>

        {/* Bottom user strip + logout */}
        <div className="cb-nav-bottom">
          {!collapsed ? (
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
          ) : (
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
              <Avatar name={user.name} size={34} color={rc} />
            </div>
          )}
          <button
            onClick={handleLogout}
            className="cb-nav-item"
            style={{
              color: "rgba(255,128,66,0.9)",
              justifyContent: collapsed ? "center" : "flex-start",
              padding: collapsed ? "11px 0" : "11px 16px"
            }}
          >
            <Icons.LogOut size={16} color="rgba(255,128,66,0.9)" />
            {!collapsed && "Log Out"}
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
  academic: "Academic Performance",
  attendance: "Attendance",
  timetable: "Timetable & Schedules",
  channels: "Classroom Channels",
  placements: "Placement Cell",
  "lost-found": "Lost & Found",
  profile: "My Profile",
  students: "All Students",
  users: "Manage Users",
  applications: "Applications",
  logs: "System Logs",
  settings: "Account Settings",
};

export function Topbar({ onMenu, collapsed }) {
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

      <div className="cb-flex cb-gap-4">
        {/* Notifications Bell */}
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
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="cb-app">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        toggleCollapse={() => setCollapsed(!collapsed)}
      />
      <div className={`cb-main ${collapsed ? "collapsed" : ""}`}>
        <Topbar onMenu={() => setSidebarOpen(true)} collapsed={collapsed} />
        <main className="cb-content">{children}</main>
      </div>
    </div>
  );
}
