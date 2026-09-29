const API_URL = "http://localhost:5000/api";

const defaultRoles = [
  {
    id: "admin",
    name: "Admin",
    description: "Full platform access",
    permissions: [
      "dashboard",
      "identity_management",
      "role_management",
      "asset_management",
      "transactions",
      "audit_trail",
    ],
  },

  {
    id: "manager",
    name: "Manager",
    description: "Manage identities and blockchain assets",
    permissions: [
      "dashboard",
      "identity_management",
      "asset_management",
      "transactions",
    ],
  },

  {
    id: "auditor",
    name: "Auditor",
    description: "Read-only audit and transaction access",
    permissions: [
      "dashboard",
      "transactions",
      "audit_trail",
    ],
  },

  {
    id: "user",
    name: "User",
    description: "Access assigned assets and transactions",
    permissions: [
      "dashboard",
      "asset_management",
    ],
  },
];

const permissionList = [
  {
    id: "dashboard",
    name: "Dashboard",
    description: "View system dashboard",
  },
  {
    id: "identity_management",
    name: "Identity Management",
    description: "Create and manage identities",
  },
  {
    id: "role_management",
    name: "Role Management",
    description: "Manage roles and permissions",
  },
  {
    id: "asset_management",
    name: "Asset Management",
    description: "Create and manage blockchain assets",
  },
  {
    id: "transactions",
    name: "Asset Transfer",
    description: "Transfer asset ownership",
  },
  {
    id: "audit_trail",
    name: "Audit Trail",
    description: "View security and audit records",
  },
];

export const getRoles = async () => {
  try {
    const response = await fetch(`${API_URL}/roles`);

    if (!response.ok) {
      throw new Error("Role API failed");
    }

    const result = await response.json();

    return result.data || result.roles || result;
  } catch (error) {
    return defaultRoles;
  }
};

export const getPermissions = () => {
  return permissionList;
};

export const updateRolePermissions = (
  roleId,
  permissions
) => {
  const roles = JSON.parse(
    localStorage.getItem("crypta_roles") ||
      JSON.stringify(defaultRoles)
  );

  const updatedRoles = roles.map((role) =>
    role.id === roleId
      ? { ...role, permissions }
      : role
  );

  localStorage.setItem(
    "crypta_roles",
    JSON.stringify(updatedRoles)
  );

  return updatedRoles;
};

export const hasPermission = (
  role,
  permission
) => {
  const roleData = defaultRoles.find(
    (item) =>
      item.id === role ||
      item.name.toLowerCase() ===
        role.toLowerCase()
  );

  return Boolean(
    roleData?.permissions.includes(permission)
  );
};