import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

const Settings = () => {
  const { user } = useAuth();

  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState({
    notifications: true,
    securityAlerts: true,
    compactMode: false,
  });

  const handleChange = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem(
      "crypta_settings",
      JSON.stringify(settings)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  return (
    <div className="page-content">

      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <div className="page-eyebrow">
            CRYPTA SHIELD / SETTINGS
          </div>

          <h1>Settings</h1>

          <p>
            Manage your account and security
            preferences.
          </p>
        </div>
      </div>

      {/* ACCOUNT INFORMATION */}
      <section className="dashboard-card">

        <div className="card-header">
          <div>
            <span className="card-eyebrow">
              ACCOUNT
            </span>

            <h2>Account Information</h2>
          </div>
        </div>

        <div className="blockchain-details">

          <div>
            <span>NAME</span>
            <strong>
              {user?.name || "—"}
            </strong>
          </div>

          <div>
            <span>EMAIL</span>
            <strong>
              {user?.email || "—"}
            </strong>
          </div>

          <div>
            <span>ROLE</span>
            <strong>
              {String(
                user?.role || "USER"
              ).toUpperCase()}
            </strong>
          </div>

        </div>
      </section>

      {/* SECURITY SETTINGS */}
      <section className="dashboard-card">

        <div className="card-header">
          <div>
            <span className="card-eyebrow">
              SECURITY
            </span>

            <h2>Security Preferences</h2>
          </div>
        </div>

        <div className="quick-actions">

          <button
            type="button"
            className="quick-action"
            onClick={() =>
              handleChange(
                "securityAlerts"
              )
            }
          >
            <div className="quick-action-icon gold">
              ◆
            </div>

            <div>
              <strong>
                Security Alerts
              </strong>

              <span>
                Receive important security
                notifications
              </span>
            </div>

            <span className="quick-arrow">
              {settings.securityAlerts
                ? "ON"
                : "OFF"}
            </span>
          </button>

          <button
            type="button"
            className="quick-action"
            onClick={() =>
              handleChange(
                "notifications"
              )
            }
          >
            <div className="quick-action-icon cyan">
              ◉
            </div>

            <div>
              <strong>
                System Notifications
              </strong>

              <span>
                Control system notification
                preferences
              </span>
            </div>

            <span className="quick-arrow">
              {settings.notifications
                ? "ON"
                : "OFF"}
            </span>
          </button>

          <button
            type="button"
            className="quick-action"
            onClick={() =>
              handleChange(
                "compactMode"
              )
            }
          >
            <div className="quick-action-icon gold">
              ◈
            </div>

            <div>
              <strong>
                Compact Mode
              </strong>

              <span>
                Use a more compact dashboard
                layout
              </span>
            </div>

            <span className="quick-arrow">
              {settings.compactMode
                ? "ON"
                : "OFF"}
            </span>
          </button>

        </div>

        {/* SAVE */}
        <div
          style={{
            marginTop: "24px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <button
            type="button"
            className="primary-button"
            onClick={handleSave}
          >
            Save Settings
          </button>

          {saved && (
            <span className="stat-positive">
              ✓ Settings saved
            </span>
          )}
        </div>

      </section>

    </div>
  );
};

export default Settings;