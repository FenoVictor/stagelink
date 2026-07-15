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
};
