// src/services/api.js

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle API errors centrally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    return Promise.reject(error);
  }
);

/* =========================
   AUTH
========================= */

export const loginUser = async (data) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};


/* =========================
   DASHBOARD
========================= */

export const fetchDashboardStats = async () => {
  const response = await api.get("/dashboard/stats");
  return response.data;
};

export const fetchRecentActivity = async () => {
  const response = await api.get("/dashboard/activity");
  return response.data;
};


/* =========================
   IDENTITY MANAGEMENT
========================= */

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


/* =========================
   ROLE MANAGEMENT
========================= */

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
  const response = await api.put(`/roles/${id}`, data);
  return response.data;
};

export const updateRolePermissions = async (id, permissions) => {
  const response = await api.put(
    `/roles/${id}/permissions`,
    { permissions }
  );

  return response.data;
};


/* =========================
   ASSET MANAGEMENT
========================= */

export const fetchAssets = async () => {
  const response = await api.get("/assets");
  return response.data;
};

export const fetchAssetById = async (id) => {
  const response = await api.get(`/assets/${id}`);
  return response.data;
};

export const createAsset = async (data) => {
  const response = await api.post("/assets", data);
  return response.data;
};

export const updateAsset = async (id, data) => {
  const response = await api.put(`/assets/${id}`, data);
  return response.data;
};

export const deleteAsset = async (id) => {
  const response = await api.delete(`/assets/${id}`);
  return response.data;
};


/* =========================
   ASSET TRANSFER
========================= */

export const transferAsset = async (id, data) => {
  const response = await api.post(
    `/assets/${id}/transfer`,
    data
  );

  return response.data;
};


/* =========================
   TRANSACTIONS
========================= */

export const fetchTransactions = async () => {
  const response = await api.get("/transactions");
  return response.data;
};

export const fetchTransactionById = async (id) => {
  const response = await api.get(`/transactions/${id}`);
  return response.data;
};


/* =========================
   AUDIT TRAIL
========================= */

export const fetchAuditTrail = async () => {
  const response = await api.get("/audit-trail");
  return response.data;
};


/* =========================
   BLOCKCHAIN
========================= */

export const fetchBlockchainStatus = async () => {
  const response = await api.get("/blockchain/status");
  return response.data;
};

export default api;