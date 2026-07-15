import api from "./api";

export const adminService = {
  // Stats
  async getStats() {
    const { data } = await api.get("/admin/stats");
    return data;
  },

  // Users
  async getUsers(params = {}) {
    const { data } = await api.get("/admin/users", { params });
    return data;
  },

  async getUser(id) {
    const { data } = await api.get(`/admin/users/${id}`);
    return data;
  },

  async updateUser(id, userData) {
    const { data } = await api.put(`/admin/users/${id}`, userData);
    return data;
  },

  async deleteUser(id) {
    await api.delete(`/admin/users/${id}`);
  },

  async banUser(id) {
    const { data } = await api.post(`/admin/users/${id}/ban`);
    return data;
  },

  async unbanUser(id) {
    const { data } = await api.post(`/admin/users/${id}/unban`);
    return data;
  },

  async resetUserPassword(id, passwordData) {
    const { data } = await api.post(`/admin/users/${id}/reset-password`, passwordData);
    return data;
  },

  async getPasswordResets() {
    const { data } = await api.get("/admin/password-resets");
    return data;
  },

  // Students
  async getStudents(params = {}) {
    const { data } = await api.get("/admin/students", { params });
    return data;
  },

  async getStudent(id) {
    const { data } = await api.get(`/admin/students/${id}`);
    return data;
  },

  // Companies
  async getCompanies(params = {}) {
    const { data } = await api.get("/admin/companies", { params });
    return data;
  },

  async getCompany(id) {
    const { data } = await api.get(`/admin/companies/${id}`);
    return data;
  },

  async validateCompany(id) {
    const { data } = await api.post(`/admin/companies/${id}/validate`);
    return data;
  },

  async suspendCompany(id) {
    const { data } = await api.post(`/admin/companies/${id}/suspend`);
    return data;
  },

  async reactivateCompany(id) {
    const { data } = await api.post(`/admin/companies/${id}/reactivate`);
    return data;
  },

  async deleteCompany(id) {
    await api.delete(`/admin/companies/${id}`);
  },

  // Internships
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

  // Categories
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
};
