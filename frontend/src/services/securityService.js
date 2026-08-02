import api from "./api";

export const securityService = {
  async get2faStatus() {
    const { data } = await api.get("/2fa/status");
    return data;
  },
  async enable2fa() {
    const { data } = await api.post("/2fa/enable");
    return data;
  },
  async confirm2fa(code) {
    const { data } = await api.post("/2fa/confirm", { code });
    return data;
  },
  async disable2fa(password, code) {
    const { data } = await api.post("/2fa/disable", { password, code });
    return data;
  },
  async getLoginLogs(params = {}) {
    const { data } = await api.get("/admin/login-logs", { params });
    return data;
  },
  async getLoginLogStats() {
    const { data } = await api.get("/admin/login-logs/stats");
    return data;
  },
  async exportLoginLogs(params = {}) {
    const response = await api.get("/admin/login-logs/export", {
      params,
      responseType: "blob",
    });
    return response;
  },
  async getTokens() {
    const { data } = await api.get("/tokens");
    return data;
  },
  async createToken(name) {
    const { data } = await api.post("/tokens", { name });
    return data;
  },
  async rotateToken() {
    const { data } = await api.post("/tokens/rotate");
    return data;
  },
  async revokeToken(tokenId) {
    const { data } = await api.delete(`/tokens/${tokenId}`);
    return data;
  },
};
