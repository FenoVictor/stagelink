import api from "./api";

export const companyService = {
  async getProfile() {
    const { data } = await api.get("/company/profile");
    return data;
  },

  async updateProfile(formData) {
    const { data } = await api.post("/company/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};
