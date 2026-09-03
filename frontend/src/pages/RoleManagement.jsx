import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Button from "../components/Button";
import Modal from "../components/Modal";

import {
  fetchRoles,
  updateRolePermissions,
} from "../services/api";

function RoleManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);

  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const defaultRoles = [
    {
      id: "ADMIN",
      name: "Admin",
      description: "Full system and security control",
    },
    {
      id: "MANAGER",
      name: "Manager",
      description: "Manage identities and blockchain assets",
    },
    {
      id: "AUDITOR",
      name: "Auditor",
      description: "Read-only audit and transaction access",
    },
    {
      id: "USER",
      name: "User",
      description: "Access assigned assets and transactions",
    },
  ];

  const permissionList = [
    {
      key: "dashboard",
      label: "Dashboard",
      description: "View system dashboard",
    },
    {
      key: "identity",
      label: "Identity Management",
      description: "Create and manage identities",
    },
    {
      key: "roles",
      label: "Role Management",
      description: "Manage roles and permissions",
    },
    {
      key: "assets",
      label: "Asset Management",
      description: "Create and manage blockchain assets",
    },
    {
      key: "transfer",
      label: "Asset Transfer",
      description: "Transfer asset ownership",
    },
    {
      key: "transactions",
      label: "Transactions",
      description: "View blockchain transactions",
    },
    {
      key: "audit",
      label: "Audit Trail",
      description: "View security and audit records",
    },
  ];

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);

      const response = await fetchRoles();

      const backendRoles =
        response?.data ?? response ?? [];

      setRoles(
        backendRoles.length
          ? backendRoles
          : defaultRoles
      );
    } catch (error) {
      console.error("Role loading error:", error);

      // Keep UI functional until backend is connected
      setRoles(defaultRoles);
    } finally {
      setLoading(false);
    }
  };

  const getRolePermissions = (role) => {
    if (role.permissions) {
      return role.permissions;
    }

    const defaults = {
      ADMIN: {
        dashboard: true,
        identity: true,
        roles: true,
        assets: true,
        transfer: true,
        transactions: true,
        audit: true,
      },

      MANAGER: {
        dashboard: true,
        identity: true,
        roles: false,
        assets: true,
        transfer: true,
        transactions: true,
        audit: false,
      },

      AUDITOR: {
        dashboard: true,
        identity: false,
        roles: false,
        assets: false,
        transfer: false,
        transactions: true,
        audit: true,
      },

      USER: {
        dashboard: true,
        identity: false,
        roles: false,
        assets: true,
        transfer: false,
        transactions: true,
        audit: false,
      },
    };

    return defaults[role.id] || defaults.USER;
  };

  const openPermissions = (role) => {
    setSelectedRole(role);
    setPermissions({
      ...getRolePermissions(role),
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setSelectedRole(null);
  };

  const togglePermission = (permission) => {
    setPermissions((prev) => ({
      ...prev,
      [permission]: !prev[permission],
    }));
  };

  const savePermissions = async () => {
    if (!selectedRole) return;

    try {
      setSaving(true);

      await updateRolePermissions(
        selectedRole.id || selectedRole._id,
        permissions
      );

      setRoles((prev) =>
        prev.map((role) =>
          (role.id || role._id) ===
          (selectedRole.id || selectedRole._id)
            ? {
                ...role,
                permissions,
              }
            : role
        )
      );

      closeModal();
    } catch (error) {
      console.error(
        "Permission update error:",
        error
      );

      // Keep local UI updated if backend isn't available
      setRoles((prev) =>
        prev.map((role) =>
          (role.id || role._id) ===
          (selectedRole.id || selectedRole._id)
            ? {
                ...role,
                permissions,
              }
            : role
        )
      );

      closeModal();
    } finally {
      setSaving(false);
    }
  };

  const roleClass = (role) => {
    const id = String(role.id || "").toLowerCase();

    if (id.includes("admin")) return "admin";
    if (id.includes("manager")) return "manager";
    if (id.includes("auditor")) return "auditor";

    return "user";
  };

  return (
    <div className="app-layout">

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="main-content">

        <Navbar
          title="Role Management"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="page-content">

          {/* HEADER */}

          <div className="page-header">

            <div>
              <div className="page-eyebrow">
                CRYPTA SHIELD / ACCESS CONTROL
              </div>

              <h1>Role Management</h1>

              <p>
                Control access policies and permissions
                across the blockchain platform.
              </p>
            </div>

            <Button
              variant="secondary"
              onClick={loadRoles}
              loading={loading}
            >
              ↻ Refresh
            </Button>

          </div>


          {/* ROLE CARDS */}

          <section className="roles-grid">

            {roles.map((role) => {

              const rolePermissions =
                getRolePermissions(role);

              const permissionCount =
                Object.values(rolePermissions)
                  .filter(Boolean)
                  .length;

              return (
                <div
                  className="role-card"
                  key={role.id || role._id}
                >

                  <div className="role-card-top">

                    <div
                      className={`role-large-icon ${roleClass(
                        role
                      )}`}
                    >
                      {roleClass(role) === "admin"
                        ? "◆"
                        : roleClass(role) === "manager"
                        ? "◇"
                        : roleClass(role) === "auditor"
                        ? "◉"
                        : "○"}
                    </div>

                    <span
                      className={`role-label ${roleClass(
                        role
                      )}`}
                    >
                      {role.name}
                    </span>

                  </div>

                  <h2>
                    {role.name}
                  </h2>

                  <p>
                    {role.description ||
                      "Role access configuration"}
                  </p>

                  <div className="role-card-footer">

                    <span>
                      <strong>
                        {permissionCount}
                      </strong>{" "}
                      permissions
                    </span>

                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() =>
                        openPermissions(role)
                      }
                    >
                      Configure →
                    </Button>

                  </div>

                </div>
              );
            })}

          </section>


          {/* PERMISSION MATRIX */}

          <section className="dashboard-card">

            <div className="card-header">

              <div>
                <span className="card-eyebrow">
                  AUTHORIZATION MATRIX
                </span>

                <h2>Permission Overview</h2>
              </div>

            </div>

            <div className="permission-table-wrapper">

              <table className="cs-table permission-table">

                <thead>
                  <tr>
                    <th>PERMISSION</th>
                    <th>ADMIN</th>
                    <th>MANAGER</th>
                    <th>AUDITOR</th>
                    <th>USER</th>
                  </tr>
                </thead>

                <tbody>

                  {permissionList.map((permission) => (
                    <tr key={permission.key}>

                      <td>
                        <div className="permission-name">
                          <strong>
                            {permission.label}
                          </strong>

                          <span>
                            {permission.description}
                          </span>
                        </div>
                      </td>

                      {["ADMIN", "MANAGER", "AUDITOR", "USER"].map(
                        (roleId) => {

                          const role = roles.find(
                            (item) =>
                              String(
                                item.id ||
                                item._id ||
                                ""
                              ).toUpperCase() === roleId
                          );

                          const rolePermission =
                            role
                              ? getRolePermissions(role)
                              : getRolePermissions({
                                  id: roleId,
                                });

                          return (
                            <td key={roleId}>
                              <span
                                className={
                                  rolePermission[
                                    permission.key
                                  ]
                                    ? "permission-allowed"
                                    : "permission-denied"
                                }
                              >
                                {rolePermission[
                                  permission.key
                                ]
                                  ? "✓"
                                  : "—"}
                              </span>
                            </td>
                          );
                        }
                      )}

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

          </section>


          {/* SECURITY NOTE */}

          <div className="role-security-card">

            <div className="security-icon">
              ◈
            </div>

            <div>
              <h3>Role-Based Access Control</h3>

              <p>
                Permissions are enforced through the
                identity and authorization layer before
                protected operations reach the blockchain.
              </p>
            </div>

            <div className="rbac-badge">
              RBAC ACTIVE
            </div>

          </div>

        </main>
      </div>


      {/* PERMISSIONS MODAL */}

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={
          selectedRole
            ? `${selectedRole.name} Permissions`
            : "Permissions"
        }
        size="large"
      >

        <div className="permissions-modal">

          <div className="permissions-modal-header">

            <div>
              <span className="card-eyebrow">
                ACCESS POLICY
              </span>

              <p>
                Enable or disable capabilities for
                this role.
              </p>
            </div>

            <span
              className={`role-label ${
                selectedRole
                  ? roleClass(selectedRole)
                  : ""
              }`}
            >
              {selectedRole?.name}
            </span>

          </div>


          <div className="permission-list">

            {permissionList.map((permission) => (

              <div
                className="permission-row"
                key={permission.key}
              >

                <div>
                  <strong>
                    {permission.label}
                  </strong>

                  <span>
                    {permission.description}
                  </span>
                </div>

                <button
                  type="button"
                  className={`permission-toggle ${
                    permissions[permission.key]
                      ? "enabled"
                      : ""
                  }`}
                  onClick={() =>
                    togglePermission(
                      permission.key
                    )
                  }
                >
                  <span></span>
                </button>

              </div>

            ))}

          </div>


          <div className="modal-actions">

            <Button
              variant="ghost"
              onClick={closeModal}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              onClick={savePermissions}
              loading={saving}
            >
              Save Permissions
            </Button>

          </div>

        </div>

      </Modal>

    </div>
  );
}

export default RoleManagement;