import { useState, useEffect } from "react";
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
  const { user, apiCall } = useApp();
  const location = useLocation();
  const rc = ROLE_COLORS[user.role];
  const page = location.pathname.split("/")[2] || "dashboard";
  const title = PAGE_TITLE_MAP[page] || "Dashboard";

  const [anns, setAnns] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    apiCall("/api/announcements")
      .then(data => {
        setAnns(data || []);
        const lastSeen = localStorage.getItem(`anns_last_seen_${user.id}`);
        const lastSeenTime = lastSeen ? new Date(lastSeen) : new Date(0);
        const unread = (data || []).filter(a => new Date(a.created_at) > lastSeenTime).length;
        setUnreadCount(unread);
      })
      .catch(err => console.error(err));
  }, [user]);

  const handleBellClick = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      localStorage.setItem(`anns_last_seen_${user.id}`, new Date().toISOString());
      setUnreadCount(0);
    }
  };

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
        <div style={{ position: "relative" }}>
          <button
            onClick={handleBellClick}
            style={{
              width: 36, height: 36, borderRadius: 10, background: C.surface,
              border: "none", cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", position: "relative",
            }}
          >
            <Icons.Bell size={16} color={C.sub} />
            {unreadCount > 0 && (
              <span style={{
                position: "absolute", top: 4, right: 4, minWidth: 16, height: 16,
                borderRadius: "50%", background: C.danger, border: "2px solid #EEEEFF",
                fontSize: 9, fontWeight: 800, color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px"
              }}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <>
              <div onClick={() => setShowDropdown(false)} style={{ position: "fixed", inset: 0, zIndex: 998 }} />
              <div style={{
                position: "absolute", top: 46, right: 0, width: 320, maxHeight: 400, overflowY: "auto",
                background: "#fff", borderRadius: 14, boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                zIndex: 999, padding: 12
              }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.text, padding: "4px 8px 10px" }}>Announcements</div>
                {anns.length === 0 ? (
                  <div style={{ textAlign: "center", color: C.sub, padding: 20, fontSize: 12.5 }}>No announcements yet.</div>
                ) : (
                  anns.slice(0, 8).map((a, idx) => (
                    <div key={a.id} style={{ padding: "10px 8px", borderBottom: idx !== Math.min(anns.length, 8) - 1 ? `1px solid ${C.border}` : "none" }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.text }}>{a.title}</div>
                      <p style={{ fontSize: 11.5, color: C.sub, marginTop: 3, lineHeight: 1.4 }}>
                        {a.content?.length > 80 ? a.content.substring(0, 80) + "..." : a.content}
                      </p>
                      <div style={{ fontSize: 10, color: C.sub, marginTop: 4 }}>
                        {new Date(a.created_at).toLocaleDateString()} &bull; {a.users?.name || "System"}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

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
