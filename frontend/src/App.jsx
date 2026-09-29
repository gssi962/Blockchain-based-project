import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import IdentityManagement from "./pages/IdentityManagement";
import RoleManagement from "./pages/RoleManagement";
import AssetManagement from "./pages/AssetManagement";
import AssetDetails from "./pages/AssetDetails";
import Transactions from "./pages/Transactions";
import AuditTrail from "./pages/AuditTrail";

function App() {
  return (
    <Routes>

      {/* =========================
          DEFAULT ROUTE
          ========================= */}

      <Route
        path="/"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

      {/* =========================
          AUTH
          ========================= */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      {/* =========================
          DASHBOARD
          ========================= */}

      <Route
        path="/dashboard"
        element={<Dashboard />}
      />

      {/* =========================
          SETTINGS
          ========================= */}

      <Route
        path="/settings"
        element={<Settings />}
      />

      {/* =========================
          IDENTITY
          ========================= */}

      <Route
        path="/identity"
        element={<IdentityManagement />}
      />

      {/* =========================
          ROLES
          ========================= */}

      <Route
        path="/roles"
        element={<RoleManagement />}
      />

      {/* =========================
          ASSETS
          ========================= */}

      <Route
        path="/assets"
        element={<AssetManagement />}
      />

      {/* Dynamic Asset Details */}

      <Route
        path="/assets/:id"
        element={<AssetDetails />}
      />

      {/* =========================
          TRANSACTIONS
          ========================= */}

      <Route
        path="/transactions"
        element={<Transactions />}
      />

      {/* =========================
          AUDIT TRAIL
          ========================= */}

      <Route
        path="/audit-trail"
        element={<AuditTrail />}
      />

      {/* =========================
          404 FALLBACK
          ========================= */}

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

    </Routes>
  );
}

export default App;