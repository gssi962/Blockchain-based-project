import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Sidebar = ({
  isOpen = true,
  onClose,
}) => {
  const { user, logout } = useAuth();

  const role = String(
    user?.role || "ADMIN"
  ).toUpperCase();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "▣",
      roles: [
        "ADMIN",
        "MANAGER",
        "AUDITOR",
        "USER",
      ],
    },

    {
      name: "Identity Management",
      path: "/identity",
      icon: "◉",
      roles: [
        "ADMIN",
        "MANAGER",
      ],
    },

    {
      name: "Role Management",
      path: "/roles",
      icon: "◇",
      roles: ["ADMIN"],
    },

    {
      name: "Asset Management",
      path: "/assets",
      icon: "◆",
      roles: [
        "ADMIN",
        "MANAGER",
        "USER",
      ],
    },

    {
      name: "Transactions",
      path: "/transactions",
      icon: "≋",
      roles: [
        "ADMIN",
        "MANAGER",
        "AUDITOR",
        "USER",
      ],
    },

    {
      name: "Audit Trail",
      path: "/audit-trail",
      icon: "◎",
      roles: [
        "ADMIN",
        "AUDITOR",
      ],
    },
  ];

  const visibleMenuItems =
    menuItems.filter((item) =>
      item.roles.includes(role)
    );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
        ></div>
      )}

      <aside
        className={`sidebar ${
          isOpen ? "sidebar-visible" : ""
        }`}
      >

        {/* LOGO */}
        <div className="sidebar-brand">

          <div className="sidebar-shield">
            🛡
          </div>

          <div className="sidebar-brand-text">
            <h1>CRYPTA</h1>
            <span>SHIELD</span>
          </div>

        </div>

        <div className="sidebar-line"></div>

        {/* MENU */}
        <nav className="sidebar-navigation">

          <p className="sidebar-section-title">
            MAIN MENU
          </p>

          {visibleMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link ${
                  isActive
                    ? "sidebar-link-active"
                    : ""
                }`
              }
            >

              <span className="sidebar-link-icon">
                {item.icon}
              </span>

              <span className="sidebar-link-text">
                {item.name}
              </span>

            </NavLink>
          ))}

        </nav>

        {/* BOTTOM */}
        <div className="sidebar-bottom">

          <div className="sidebar-line"></div>

          <button
            className="sidebar-bottom-link"
            onClick={() => {
              // Settings page baad mein add kar sakte hain
              console.log("Settings clicked");
            }}
          >
            <span>⚙</span>
            <span>Settings</span>
          </button>

          <button
            className="sidebar-bottom-link logout-button"
            onClick={logout}
          >
            <span>↪</span>
            <span>Logout</span>
          </button>

          {/* Security status */}
          <div className="sidebar-security">

            <div className="security-symbol">
              ◆
            </div>

            <div className="security-text">
              <strong>SECURE</strong>
              <span>
                Blockchain Active
              </span>
            </div>

            <span className="security-pulse"></span>

          </div>

        </div>

      </aside>
    </>
  );
};

export default Sidebar;