import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Table from "../components/Table";

import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole,
} from "../services/api";

function IdentityManagement() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const emptyForm = {
    name: "",
    email: "",
    role: "USER",
    organization: "",
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);

      const response = await fetchUsers();

      const userData =
        response?.data?.users ||
        response?.data ||
        response?.users ||
        response ||
        [];

      setUsers(
        Array.isArray(userData)
          ? userData
          : []
      );
    } catch (err) {
      console.error(
        "Users loading error:",
        err
      );
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);

    const roleMap = {
      "role-admin": "ADMIN",
      "role-manager": "MANAGER",
      "role-auditor": "AUDITOR",
      "role-user": "USER",
    };

    setForm({
      name: user.name || "",
      email: user.email || "",
      role:
        roleMap[user.role_id] ||
        user.role ||
        "USER",
      organization:
        user.organization || "",
    });

    setError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;

    setModalOpen(false);
    setEditingUser(null);
    setForm(emptyForm);
    setError("");
  };

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError(
        "Full name is required."
      );
      return;
    }

    if (!form.email.trim()) {
      setError(
        "Email address is required."
      );
      return;
    }

    try {
      setSubmitting(true);

      if (editingUser) {
        const userId =
          editingUser.id ||
          editingUser._id;

        const roleId =
          `role-${form.role.toLowerCase()}`;

        await updateUserRole(
          userId,
          roleId,
          form.organization.trim()
        );
      } else {
        await createUser({
          name: form.name.trim(),
          email: form.email.trim(),
          roleId:
            `role-${form.role.toLowerCase()}`,
          organization:
            form.organization.trim(),
        });
      }

      closeModal();
      await loadUsers();

    } catch (err) {
      console.error(
        "Identity update error:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to save identity. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (user) => {
    const id =
      user.id ||
      user._id;

    const confirmed =
      window.confirm(
        `Remove identity "${user.name}"?`
      );

    if (!confirmed) return;

    try {
      await deleteUser(id);
      await loadUsers();
    } catch (err) {
      console.error(
        "Delete identity error:",
        err
      );

      alert(
        "Unable to remove this identity."
      );
    }
  };

  // =====================================================
  // VERIFICATION HELPERS
  // =====================================================

  const isUserVerified = (user) => {
    return (
      Number(user?.verified) === 1 ||
      user?.verified === true ||
      String(
        user?.verificationStatus || ""
      ).toLowerCase() === "verified" ||
      String(
        user?.verification || ""
      ).toLowerCase() === "verified"
    );
  };

  const getVerificationStatus = (user) => {
    return isUserVerified(user)
      ? "Verified"
      : "Pending";
  };

  const getVerificationClass = (
    status
  ) => {
    const value =
      String(status || "")
        .toLowerCase();

    if (
      value.includes("verified")
    ) {
      return "status-success";
    }

    if (
      value.includes("pending") ||
      value.includes("review")
    ) {
      return "status-warning";
    }

    if (
      value.includes("rejected") ||
      value.includes("blocked")
    ) {
      return "status-danger";
    }

    return "status-neutral";
  };

  // =====================================================
  // TABLE COLUMNS
  // =====================================================

  const columns = [
    {
      key: "identity",
      label: "IDENTITY",

      render: (_, user) => (
        <div className="identity-cell">

          <div className="identity-avatar">
            {(user.name || "U")
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <strong>
              {user.name ||
                "Unknown User"}
            </strong>

            <span>
              {user.email ||
                "No email"}
            </span>
          </div>

        </div>
      ),
    },

    {
      key: "did",
      label: "DID",

      render: (value) => (
        <span className="did-value">
          {value ||
            "did:crypta:pending"}
        </span>
      ),
    },

    {
      key: "role",
      label: "ROLE",

      render: (value, user) => {
        const roleMap = {
          "role-admin": "ADMIN",
          "role-manager": "MANAGER",
          "role-auditor": "AUDITOR",
          "role-user": "USER",
        };

        const displayRole =
          roleMap[user.role_id] ||
          value ||
          "PENDING";

        return (
          <span className="role-badge">
            {displayRole}
          </span>
        );
      },
    },

    {
      key: "organization",
      label: "ORGANIZATION",

      render: (value) => (
        <span>
          {value || "—"}
        </span>
      ),
    },

    // ===================================================
    // FIXED VERIFICATION COLUMN
    // ===================================================

    {
      key: "verified",
      label: "VERIFICATION",

      render: (_, user) => {
        const status =
          getVerificationStatus(user);

        return (
          <span
            className={`status-badge ${getVerificationClass(
              status
            )}`}
          >
            <span className="status-dot"></span>

            {status}
          </span>
        );
      },
    },

    {
      key: "actions",
      label: "ACTIONS",

      render: (_, user) => (
        <div className="identity-actions">

          <button
            className="table-action"
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(user);
            }}
          >
            Assign Role
          </button>

          <button
            className="table-action danger"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(user);
            }}
          >
            Remove
          </button>

        </div>
      ),
    },
  ];

  // =====================================================
  // VERIFIED / PENDING COUNTS
  // =====================================================

  const verifiedCount =
    users.filter(
      (user) =>
        isUserVerified(user)
    ).length;

  const pendingCount =
    users.filter(
      (user) =>
        !user.role_id ||
        !isUserVerified(user)
    ).length;

  return (
    <div className="app-layout">

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
      />

      <div className="main-content">

        <Navbar
          title="Identity Management"
          onMenuClick={() =>
            setSidebarOpen(true)
          }
        />

        <main className="page-content">

          <div className="page-header">

            <div>

              <div className="page-eyebrow">
                CRYPTA SHIELD / IDENTITY
              </div>

              <h1>
                Identity Management
              </h1>

              <p>
                Manage decentralized identities,
                verification and access roles.
              </p>

            </div>

          </div>

          {/* =================================================
              SUMMARY CARDS
          ================================================= */}

          <div className="identity-summary">

            <div className="identity-summary-card">

              <span>
                Total Identities
              </span>

              <strong>
                {users.length}
              </strong>

            </div>

            <div className="identity-summary-card">

              <span>
                Verified
              </span>

              <strong>
                {verifiedCount}
              </strong>

            </div>

            <div className="identity-summary-card">

              <span>
                Pending
              </span>

              <strong>
                {pendingCount}
              </strong>

            </div>

            <div className="identity-summary-card">

              <span>
                DID Network
              </span>

              <strong className="summary-online">
                ● Active
              </strong>

            </div>

          </div>

          {/* =================================================
              REGISTERED IDENTITIES
          ================================================= */}

          <div className="dashboard-card">

            <div className="card-header">

              <div>

                <span className="card-eyebrow">
                  DECENTRALIZED IDENTITY
                </span>

                <h2>
                  Registered Identities
                </h2>

              </div>

              <Button
                variant="ghost"
                size="small"
                onClick={loadUsers}
                loading={loading}
              >
                ↻ Refresh
              </Button>

            </div>

            <Table
              columns={columns}
              data={users}
              loading={loading}
              emptyMessage="No identities registered yet."
              onRowClick={(user) =>
                console.log(
                  "Identity selected:",
                  user
                )
              }
            />

          </div>

          {/* =================================================
              SECURITY CARD
          ================================================= */}

          <div className="identity-security-card">

            <div className="security-icon">
              ◈
            </div>

            <div>

              <h3>
                Decentralized Identity Security
              </h3>

              <p>
                Each registered identity is
                associated with a unique DID
                and can be verified before
                receiving blockchain permissions.
              </p>

            </div>

            <div className="security-status">

              <span className="status-dot"></span>

              DID Registry Active

            </div>

          </div>

        </main>

      </div>

      {/* =====================================================
          MODAL
      ===================================================== */}

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={
          editingUser
            ? "Assign Role"
            : "Create New Identity"
        }
        size="medium"
      >

        <form
          className="identity-form"
          onSubmit={handleSubmit}
        >

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <div className="form-group">

            <label>
              FULL NAME
            </label>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter full name"
              disabled={!!editingUser}
            />

          </div>

          <div className="form-group">

            <label>
              EMAIL ADDRESS
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="user@organization.com"
              disabled={!!editingUser}
            />

          </div>

          <div className="form-row">

            <div className="form-group">

              <label>
                ROLE
              </label>

              <select
                name="role"
                value={form.role}
                onChange={handleChange}
              >

                <option value="USER">
                  User
                </option>

                <option value="AUDITOR">
                  Auditor
                </option>

                <option value="MANAGER">
                  Manager
                </option>

                <option value="ADMIN">
                  Admin
                </option>

              </select>

            </div>

            <div className="form-group">

              <label>
                ORGANIZATION
              </label>

              <input
                type="text"
                name="organization"
                value={form.organization}
                onChange={handleChange}
                placeholder="Organization name"
              />

            </div>

          </div>

          {!editingUser && (
            <div className="did-generation-info">

              <div className="did-mini-icon">
                ◆
              </div>

              <div>

                <strong>
                  DID will be generated automatically
                </strong>

                <span>
                  A decentralized identifier will
                  be created during registration.
                </span>

              </div>

            </div>
          )}

          {editingUser && (
            <div className="did-generation-info">

              <div className="did-mini-icon">
                ◆
              </div>

              <div>

                <strong>
                  Role Assignment
                </strong>

                <span>
                  The selected role will be assigned
                  to this identity by the administrator.
                </span>

              </div>

            </div>
          )}

          <div className="modal-actions">

            <Button
              type="button"
              variant="ghost"
              onClick={closeModal}
              disabled={submitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              loading={submitting}
            >
              {editingUser
                ? "Assign Role"
                : "Create Identity"}
            </Button>

          </div>

        </form>

      </Modal>

    </div>
  );
}

export default IdentityManagement;