import { useEffect, useState } from "react";

import RoleCard from "../components/RoleCard";
import PermissionTable from "../components/PermissionTable";
import ConfigureRole from "../components/ConfigureRole";

import {
  getRoles,
  getPermissions,
  updateRolePermissions,
} from "../services/rbacServices";

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);

  const loadData = async () => {
    try {
      const roleData = await getRoles();

      setRoles(Array.isArray(roleData) ? roleData : []);
      setPermissions(getPermissions());
    } catch (error) {
      console.error("Failed to load RBAC data:", error);
      setRoles([]);
      setPermissions(getPermissions());
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = (roleId, newPermissions) => {
    const updated = updateRolePermissions(
      roleId,
      newPermissions
    );

    setRoles(updated);

    const updatedRole = updated.find(
      (role) => role.id === roleId
    );

    setSelectedRole(updatedRole || null);
  };

  return (
    <div className="module-page">

      <div className="page-top">
        <div>
          <span className="section-label">
            CRYPTA SHIELD / ACCESS CONTROL
          </span>

          <h1>Role Management</h1>

          <p>
            Control access policies and permissions
            across the blockchain platform.
          </p>
        </div>

        <button
          className="secondary-btn"
          onClick={loadData}
        >
          ↻ Refresh
        </button>
      </div>

      <div className="roles-grid">
        {roles.map((role) => (
          <RoleCard
            key={role.id}
            role={role}
            selected={selectedRole?.id === role.id}
            onClick={() => setSelectedRole(role)}
          />
        ))}
      </div>

      <PermissionTable
        roles={roles}
        permissions={permissions}
      />

      <div className="security-info">
        <strong>
          ◆ Role-Based Access Control
        </strong>

        <p>
          Access to platform resources is controlled
          according to the user's assigned role and
          permissions.
        </p>
      </div>

      {selectedRole && (
        <ConfigureRole
          role={selectedRole}
          permissions={permissions}
          onSave={handleSave}
          onClose={() => setSelectedRole(null)}
        />
      )}

    </div>
  );
};

export default RoleManagement;