import api from "./api";

export const adminService = {
  async getUsers(params) {
    const { data } = await api.get("/admin/users", { params });
    return data;
  },

  async updateUser(id, userData) {
    const { data } = await api.put(`/admin/users/${id}`, userData);
    return data;
  },

  async deleteUser(id) {
    await api.delete(`/admin/users/${id}`);
  },

  async getInternships(params) {
    const { data } = await api.get("/admin/internships", { params });
    return data;
  },

  async updateInternship(id, internshipData) {
    const { data } = await api.put(`/admin/internships/${id}`, internshipData);
    return data;
  },

  async deleteInternship(id) {
    await api.delete(`/admin/internships/${id}`);
  },

  async getCategories() {
    const { data } = await api.get("/admin/categories");
    return data;
  },

  async createCategory(categoryData) {
    const { data } = await api.post("/admin/categories", categoryData);
    return data;
  },

  async updateCategory(id, categoryData) {
    const { data } = await api.put(`/admin/categories/${id}`, categoryData);
    return data;
  },

  async deleteCategory(id) {
    await api.delete(`/admin/categories/${id}`);
  },

  async getStats() {
    const { data } = await api.get("/admin/stats");
    return data;
  },
};
