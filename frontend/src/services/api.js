import axios from "axios";

const api = axios.create({

  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://blockchain-based-project.onrender.com/api",

  headers: {
    "Content-Type": "application/json",
  },

});

// =====================================================
// LOAD SAVED TOKEN
// =====================================================

const savedToken =
  localStorage.getItem("token");

if (savedToken) {

  api.defaults.headers.common.Authorization =
    `Bearer ${savedToken}`;

}

// =====================================================
// REQUEST INTERCEPTOR
// =====================================================

api.interceptors.request.use(

  (config) => {

    const token =
      localStorage.getItem("token");

    if (token) {

      config.headers =
        config.headers || {};

      config.headers.Authorization =
        `Bearer ${token}`;

    }

    return config;

  },

  (error) =>
    Promise.reject(error)

);

// =====================================================
// AUTH
// =====================================================

export const loginUser = async (
  email,
  password
) => {

  const response =
    await api.post(
      "/auth/login",
      {
        email,
        password,
      }
    );

  if (response.data?.token) {

    localStorage.setItem(
      "token",
      response.data.token
    );

    api.defaults.headers.common.Authorization =
      `Bearer ${response.data.token}`;

  }

  return response.data;

};

export const registerUser = async (
  data
) => {

  const response =
    await api.post(
      "/auth/register",
      data
    );

  return response.data;

};

// =====================================================
// EMAIL OTP
// =====================================================

export const verifyEmailOTP = async (
  email,
  otp
) => {

  const response =
    await api.post(
      "/auth/verify-email-otp",
      {
        email,
        otp,
      }
    );

  return response.data;

};

export const resendEmailOTP = async (
  email
) => {

  const response =
    await api.post(
      "/auth/resend-email-otp",
      {
        email,
      }
    );

  return response.data;

};

// =====================================================
// FORGOT PASSWORD
// =====================================================

export const forgotPassword = async (
  email
) => {

  const response =
    await api.post(
      "/auth/forgot-password",
      {
        email,
      }
    );

  return response.data;

};

export const verifyResetOTP = async (
  email,
  otp
) => {

  const response =
    await api.post(
      "/auth/verify-reset-otp",
      {
        email,
        otp,
      }
    );

  return response.data;

};

export const resetPassword = async (
  email,
  resetToken,
  newPassword
) => {

  const response =
    await api.post(
      "/auth/reset-password",
      {
        email,
        resetToken,
        newPassword,
      }
    );

  return response.data;

};

// =====================================================
// CURRENT USER
// =====================================================

export const getCurrentUser = async () => {

  const response =
    await api.get(
      "/auth/me"
    );

  return response.data;

};

// =====================================================
// DID
// =====================================================

export const generateDIDChallenge = async () => {

  const response =
    await api.get(
      "/auth/did/challenge"
    );

  return response.data;

};

export const enrollDIDPublicKey = async (
  publicKey
) => {

  const response =
    await api.post(
      "/auth/did/enroll",
      {
        publicKey,
      }
    );

  return response.data;

};

export const verifyDIDSignature = async (
  challenge,
  signature,
  publicKey
) => {

  const response =
    await api.post(
      "/auth/did/verify",
      {
        challenge,
        signature,
        publicKey,
      }
    );

  return response.data;

};

// =====================================================
// LOGOUT
// =====================================================

export const logoutUser = () => {

  localStorage.removeItem("token");

  delete api.defaults.headers.common.Authorization;

};

// =====================================================
// DASHBOARD
// =====================================================

export const fetchDashboardStats = async () => {

  const response =
    await api.get(
      "/dashboard/stats"
    );

  return response.data;

};

export const fetchRecentActivity = async () => {

  const response =
    await api.get(
      "/dashboard/activity"
    );

  return response.data;

};

export const fetchBlockchainStatus = async () => {

  const response =
    await api.get(
      "/dashboard/blockchain-status"
    );

  return response.data;

};

// =====================================================
// USERS
// =====================================================

export const fetchUsers = async () => {

  const response =
    await api.get(
      "/users"
    );

  return response.data;

};

export const getUsers =
  fetchUsers;

export const getUser = async (
  id
) => {

  const response =
    await api.get(
      `/users/${id}`
    );

  return response.data;

};

export const updateUser = async (
  id,
  data
) => {

  const response =
    await api.patch(
      `/users/${id}`,
      data
    );

  return response.data;

};

export const createUser = async (
  data
) => {

  const response =
    await api.post(
      "/users",
      data
    );

  return response.data;

};

export const updateUserRole = async (
  id,
  roleId,
  organization
) => {

  const response =
    await api.patch(
      `/users/${id}/role`,
      {
        roleId,
        organization,
      }
    );

  return response.data;

};

export const deleteUser = async (
  id
) => {

  const response =
    await api.delete(
      `/users/${id}`
    );

  return response.data;

};

// =====================================================
// ROLES
// =====================================================

export const fetchRoles = async () => {

  const response =
    await api.get(
      "/roles"
    );

  return response.data;

};

export const updateRolePermissions = async (
  roleId,
  permissions
) => {

  const response =
    await api.patch(
      `/roles/${roleId}/permissions`,
      {
        permissions,
      }
    );

  return response.data;

};

// =====================================================
// ASSETS
// =====================================================

export const fetchAssets = async () => {

  const response =
    await api.get(
      "/assets"
    );

  return response.data;

};

export const fetchAssetById = async (
  id
) => {

  const response =
    await api.get(
      `/assets/${id}`
    );

  return response.data;

};

// =====================================================
// CREATE ASSET WITH ACTUAL FILE
// =====================================================

export const createAsset = async (
  data
) => {

  const response =
    await api.post(
      "/assets",
      data,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

  return response.data;

};

export const transferAsset = async (
  id,
  data
) => {

  const response =
    await api.post(
      `/assets/${id}/transfer`,
      data
    );

  return response.data;

};

// =====================================================
// TRANSACTIONS
// =====================================================

export const fetchTransactions = async () => {

  const response =
    await api.get(
      "/transactions"
    );

  return response.data;

};

export const fetchTransactionById = async (
  id
) => {

  const response =
    await api.get(
      `/transactions/${id}`
    );

  return response.data;

};

// =====================================================
// AUDIT
// =====================================================

export const fetchAuditTrail = async () => {

  const response =
    await api.get(
      "/audit"
    );

  return response.data;

};

// =====================================================
// DEFAULT EXPORT
// =====================================================

export default api;