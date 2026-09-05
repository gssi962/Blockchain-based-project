import axios from "axios";

// =====================================
// AXIOS INSTANCE
// =====================================

const api = axios.create({
    baseURL:
        import.meta.env.VITE_API_URL ||
        "http://localhost:5000/api",

    headers: {
        "Content-Type": "application/json",
    },
});
const savedToken = localStorage.getItem("token");

if (savedToken) {
  api.defaults.headers.common.Authorization = `Bearer ${savedToken}`;
}

// =====================================
// AUTH TOKEN
// =====================================

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// =====================================
// RESPONSE HANDLER
// =====================================

api.interceptors.response.use(
    (response) => response,
    (error) => {
        
        

        return Promise.reject(error);
    }
);

// =====================================
// AUTHENTICATION
// =====================================

export const loginUser = async (email, password) => {
    const response = await api.post("/auth/login", {
        email,
        password,
    });
    if (response.data?.token) {
    localStorage.setItem("token", response.data.token);
    api.defaults.headers.common.Authorization =
      `Bearer ${response.data.token}`;
  }

    return response.data;
};


export const getCurrentUser = async () => {
    const response = await api.get("/auth/me");
    return response.data;
};

// =====================================
// DASHBOARD
// =====================================

export const fetchDashboardStats = async () => {
  const token = localStorage.getItem("token");

  const response = await api.get("/dashboard/stats", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data?.data ?? response.data;
};
export const fetchRecentActivity = async () => {
    return [];
};

export const fetchBlockchainStatus = async () => {
    const response = await api.get(
        "/dashboard/blockchain-status"
    );

    return response.data;
};

// =====================================
// IDENTITY MANAGEMENT / USERS
// =====================================

export const fetchUsers = async () => {
    const response = await api.get("/users");
    return response.data;
};

export const fetchUserById = async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
};

export const createUser = async (data) => {
    const response = await api.post("/users", data);
    return response.data;
};

export const updateUser = async (id, data) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
};

export const deleteUser = async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
};

export const updateUserRole = async (id, roleId) => {
    const response = await api.patch(
        `/users/${id}/role`,
        { roleId }
    );

    return response.data;
};

// Compatibility names
export const getUsers = fetchUsers;
export const getUserById = fetchUserById;

// =====================================
// ROLE MANAGEMENT
// =====================================

export const fetchRoles = async () => {
    const response = await api.get("/roles");
    return response.data;
};

export const fetchRoleById = async (id) => {
    const response = await api.get(`/roles/${id}`);
    return response.data;
};

export const createRole = async (data) => {
    const response = await api.post("/roles", data);
    return response.data;
};

export const updateRole = async (id, data) => {
    const response = await api.put(
        `/roles/${id}`,
        data
    );

    return response.data;
};

export const deleteRole = async (id) => {
    const response = await api.delete(
        `/roles/${id}`
    );

    return response.data;
};

export const fetchPermissions = async () => {
    const response = await api.get(
        "/roles/permissions"
    );

    return response.data;
};

export const fetchRolePermissions = async (roleId) => {
    const response = await api.get(
        `/roles/${roleId}/permissions`
    );

    return response.data;
};

export const updateRolePermissions = async (
    roleId,
    permissionIds
) => {
    const response = await api.put(
        `/roles/${roleId}/permissions`,
        { permissionIds }
    );

    return response.data;
};

// Compatibility names
export const getRoles = fetchRoles;
export const getRoleById = fetchRoleById;
export const getPermissions = fetchPermissions;

// =====================================
// ASSET MANAGEMENT
// =====================================

export const fetchAssets = async () => {
    const response = await api.get("/assets");
    return response.data;
};

export const fetchAssetById = async (id) => {
    const response = await api.get(
        `/assets/${id}`
    );

    return response.data;
};

export const createAsset = async (data) => {
    const response = await api.post(
        "/assets",
        data
    );

    return response.data;
};

export const updateAsset = async (id, data) => {
    const response = await api.put(
        `/assets/${id}`,
        data
    );

    return response.data;
};

export const deleteAsset = async (id) => {
    const response = await api.delete(
        `/assets/${id}`
    );

    return response.data;
};

export const allocateAsset = async (id, data) => {
    const response = await api.post(
        `/assets/${id}/allocate`,
        data
    );

    return response.data;
};

export const transferAsset = async (id, data) => {
    const response = await api.post(
        `/assets/${id}/transfer`,
        data
    );

    return response.data;
};

// Compatibility names
export const getAssets = fetchAssets;
export const getAssetById = fetchAssetById;

// =====================================
// TRANSACTIONS
// =====================================

export const fetchTransactions = async () => {
    const response = await api.get(
        "/transactions"
    );

    return response.data;
};

export const fetchTransactionById = async (id) => {
    const response = await api.get(
        `/transactions/${id}`
    );

    return response.data;
};

export const createTransaction = async (data) => {
    const response = await api.post(
        "/transactions",
        data
    );

    return response.data;
};

export const fetchRecentTransactions = async () => {
    const response = await api.get(
        "/transactions/recent"
    );

    return response.data;
};

// Compatibility names
export const getTransactions = fetchTransactions;
export const getTransactionById = fetchTransactionById;

// =====================================
// AUDIT TRAIL
// =====================================

export const fetchAuditLogs = async () => {
    const response = await api.get("/audit");
    return response.data;
};

export const fetchAuditLogById = async (id) => {
    const response = await api.get(
        `/audit/${id}`
    );

    return response.data;
};

export const fetchAuditTrail = async () => {
    const response = await api.get("/audit");
    return response.data;
};

export const getAuditTrail = async () => {
    const response = await api.get("/audit");
    return response.data;
};

// =====================================
// BLOCKCHAIN
// =====================================

export const getBlockchainStatus = async () => {
    const response = await api.get(
        "/blockchain/status"
    );

    return response.data;
};

// =====================================
// DEFAULT EXPORT
// =====================================

export default api;