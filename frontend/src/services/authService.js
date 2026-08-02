import api from "./api";

export const authService = {
  async login(email, password) {
    const { data } = await api.post("/login", { email, password });
    return data;
  },

  async register(userData) {
    const { data } = await api.post("/register", userData);
    return data;
  },

  async logout() {
    await api.post("/logout");
  },

  async getUser() {
    const { data } = await api.get("/user");
    return data;
  },

  async changePassword(current_password, password, password_confirmation) {
    const { data } = await api.post("/change-password", { current_password, password, password_confirmation });
    return data;
  },

  async forgotPassword(email) {
    const { data } = await api.post("/forgot-password", { email });
    return data;
  },

  async resetPassword({ email, token, password, password_confirmation }) {
    const { data } = await api.post("/reset-password", { email, token, password, password_confirmation });
    return data;
  },

  async verifyEmail(id, hash) {
    const { data } = await api.get(`/email/verify/${id}/${hash}`);
    return data;
  },

  async resendVerification() {
    const { data } = await api.post("/email/verification/send");
    return data;
  },

  async verifyTwoFactor(code, tempToken) {
    const { data } = await api.post("/2fa/verify", { code }, {
      headers: { Authorization: `Bearer ${tempToken}` },
    });
    return data;
  },
};
