import api from "./api";

export const studentService = {
  async getProfile() {
    const { data } = await api.get("/profile");
    return data;
  },

  async updateProfile(formData) {
    const { data } = await api.post("/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};
