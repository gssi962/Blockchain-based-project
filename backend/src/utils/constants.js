const ROLES = {
    ADMIN: "Admin",
    MANAGER: "Manager",
    AUDITOR: "Auditor",
    USER: "User"
};

const PERMISSIONS = {
    VIEW_DASHBOARD: "VIEW_DASHBOARD",

    VIEW_USERS: "VIEW_USERS",
    CREATE_USER: "CREATE_USER",

    VIEW_ROLES: "VIEW_ROLES",
    CREATE_ROLE: "CREATE_ROLE",
    ASSIGN_ROLE: "ASSIGN_ROLE",
    MANAGE_PERMISSIONS: "MANAGE_PERMISSIONS",

    CREATE_ASSET: "CREATE_ASSET",
    VIEW_ASSET: "VIEW_ASSET",
    ALLOCATE_ASSET: "ALLOCATE_ASSET",
    TRANSFER_ASSET: "TRANSFER_ASSET",

    VIEW_TRANSACTION: "VIEW_TRANSACTION",

    VIEW_AUDIT: "VIEW_AUDIT"
};

const ASSET_STATUS = {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE",
    TRANSFERRED: "TRANSFERRED"
};

const TRANSACTION_STATUS = {
    PENDING: "PENDING",
    CONFIRMED: "CONFIRMED",
    FAILED: "FAILED"
};

const AUDIT_CATEGORIES = {
    IDENTITY: "IDENTITY",
    ASSET: "ASSET",
    TRANSACTION: "TRANSACTION",
    SECURITY: "SECURITY"
};

const NETWORK = {
    NAME: "Hyperledger Fabric",
    CHANNEL: "crypta-channel",
    CONSENSUS: "Raft"
};

const createId = (prefix) => {
    return `${prefix}-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}`;
};

module.exports = {
    ROLES,
    PERMISSIONS,
    ASSET_STATUS,
    TRANSACTION_STATUS,
    AUDIT_CATEGORIES,
    NETWORK,
    createId
};