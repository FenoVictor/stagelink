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
};
