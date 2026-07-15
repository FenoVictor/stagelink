import api from "./api";

export const internshipService = {
  async getAll(params) {
    const { data } = await api.get("/internships", { params });
    return data;
  },

  async getFilters() {
    const { data } = await api.get("/internships/filters");
    return data;
  },

  async getOne(id) {
    const { data } = await api.get(`/internships/${id}`);
    return data;
  },

  async create(formData) {
    const { data } = await api.post("/company/internships", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async update(id, formData) {
    formData.append("_method", "PUT");
    const { data } = await api.post(`/company/internships/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async delete(id) {
    await api.delete(`/company/internships/${id}`);
  },

  async getMyInternships() {
    const { data } = await api.get("/company/internships");
    return data;
  },

  async apply(idInternship, formData) {
    const { data } = await api.post(`/internships/${idInternship}/apply`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async getMyApplications() {
    const { data } = await api.get("/applications");
    return data;
  },

  async getInternshipApplications(idInternship) {
    const { data } = await api.get(`/company/internships/${idInternship}/applications`);
    return data;
  },

  async updateApplicationStatus(id, status) {
    const { data } = await api.put(`/company/applications/${id}`, { status });
    return data;
  },
};
