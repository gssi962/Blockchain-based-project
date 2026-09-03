const bcrypt = require("bcryptjs");

const store = {
    users: [],
    roles: [],
    assets: [],
    transactions: [],
    auditLogs: []
};

const seedData = async () => {
    if (store.roles.length === 0) {
        store.roles.push(
            {
                id: "role-admin",
                name: "Admin",
                permissions: [
                    "VIEW_DASHBOARD",
                    "VIEW_USERS",
                    "CREATE_USER",
                    "ASSIGN_ROLE",
                    "VIEW_ROLES",
                    "CREATE_ROLE",
                    "MANAGE_PERMISSIONS",
                    "CREATE_ASSET",
                    "VIEW_ASSET",
                    "ALLOCATE_ASSET",
                    "TRANSFER_ASSET",
                    "VIEW_TRANSACTION",
                    "VIEW_AUDIT"
                ]
            },
            {
                id: "role-manager",
                name: "Manager",
                permissions: [
                    "VIEW_DASHBOARD",
                    "VIEW_ASSET",
                    "CREATE_ASSET",
                    "ALLOCATE_ASSET",
                    "TRANSFER_ASSET",
                    "VIEW_TRANSACTION"
                ]
            },
            {
                id: "role-auditor",
                name: "Auditor",
                permissions: [
                    "VIEW_DASHBOARD",
                    "VIEW_ASSET",
                    "VIEW_TRANSACTION",
                    "VIEW_AUDIT"
                ]
            },
            {
                id: "role-user",
                name: "User",
                permissions: [
                    "VIEW_DASHBOARD",
                    "VIEW_ASSET"
                ]
            }
        );
    }

    if (store.users.length === 0) {
        const passwordHash = await bcrypt.hash("cryptashield", 10);

        store.users.push({
            id: "user-admin",
            name: "CRYPTA Admin",
            email: "crypta183@gmail.com",
            passwordHash,
            roleId: "role-admin",
            did: "did:sih:admin-001",
            organization: "CRYPTA",
            verified: true,
            status: "ACTIVE",
            createdAt: new Date().toISOString()
        });
    }
};

module.exports = {
    store,
    seedData
};