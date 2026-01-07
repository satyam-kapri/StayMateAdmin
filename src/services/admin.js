import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Users API
export const adminAPI = {
  login: (phone) => api.post("/auth/fakeauth", { phoneNumber: phone }),
  // Users
  getUsers: (params) => api.get("/user/users", { params }),
  getUserById: (id) => api.get(`/user/users/${id}`),
  updateUserStatus: (id, data) => api.put(`/user/users/${id}/status`, data),
  deleteUser: (id) => api.delete(`/user/users/${id}`),

  // KYC
  getKYCs: (params) => api.get("/kyc/all", { params }),
  getKYCById: (id) => api.get(`/kyc/${id}`),
  approveKYC: (id) => api.put(`/kyc/${id}/approve`),
  rejectKYC: (id, reason) =>
    api.put(`/kyc/${id}/reject`, { rejectionReason: reason }),
  getKYCStats: () => api.get("/kyc/stats"),

  // Profiles
  getProfiles: (params) => api.get("/user/profiles", { params }),

  // Stats
  getUserStats: () => api.get("/user/stats/users"),

  // Dashboard
  getDashboardStats: async () => {
    const [userStats, kycStats] = await Promise.all([
      api.get("/user/stats/users"),
      api.get("/kyc/stats"),
    ]);
    return {
      userStats: userStats.data.data,
      kycStats: kycStats.data.data,
    };
  },
};

export default api;
