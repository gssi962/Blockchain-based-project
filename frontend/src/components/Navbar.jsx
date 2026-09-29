import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

const Navbar = ({
  title = "Dashboard",
  onMenuClick,
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [profileOpen, setProfileOpen] =
    useState(false);

  const userName =
    user?.name ||
    user?.username ||
    "Admin";

  const userRole =
    user?.role ||
    "ADMIN";

  const userEmail =
    user?.email ||
    "admin@cryptashield.com";

  const handleSettings = () => {
    setProfileOpen(false);
    navigate("/settings");
  };

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
  };

  return (
    <header className="navbar">

      {/* LEFT */}
      <div className="navbar-left">

        {/* Mobile menu */}
        <button
          className="mobile-menu-button"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          ☰
        </button>

        <div className="navbar-title">
          <span className="navbar-title-accent"></span>

          <div>
            <h2>{title}</h2>
            <p>CRYPTA SHIELD</p>
          </div>
        </div>

      </div>

      {/* RIGHT */}
      <div className="navbar-right">

        {/* Network status */}
        <div className="network-status">
          <span className="network-indicator"></span>
          <span>Network Online</span>
        </div>

        {/* Profile */}
        <div className="profile-container">

          <button
            className="profile-button"
            onClick={() =>
              setProfileOpen(!profileOpen)
            }
            aria-expanded={profileOpen}
          >
            <div className="profile-avatar">
              {userName
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="profile-details">
              <strong>{userName}</strong>

              <span>
                {String(userRole).toUpperCase()}
              </span>
            </div>

            <span className="profile-arrow">
              {profileOpen ? "▲" : "▼"}
            </span>
          </button>

          {/* Dropdown */}
          {profileOpen && (
            <div className="profile-dropdown">

              <div className="dropdown-user-info">

                <div className="dropdown-avatar">
                  {userName
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <strong>{userName}</strong>
                  <span>{userEmail}</span>
                </div>

              </div>

              <div className="dropdown-divider"></div>

              {/* Profile */}
              <button
                className="dropdown-option"
                onClick={() => {
                  setProfileOpen(false);
                  navigate("/profile");
                }}
              >
                ◉ &nbsp; Profile
              </button>

              {/* Settings */}
              <button
                className="dropdown-option"
                onClick={handleSettings}
              >
                ⚙ &nbsp; Settings
              </button>

              <div className="dropdown-divider"></div>

              {/* Logout */}
              <button
                className="dropdown-option dropdown-logout"
                onClick={handleLogout}
              >
                ↪ &nbsp; Logout
              </button>

            </div>
          )}

        </div>

      </div>

    </header>
  );
};

export default Navbar;