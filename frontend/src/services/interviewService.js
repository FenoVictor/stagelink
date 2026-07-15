import api from "./api";

export const interviewService = {
  async getAll() {
    const { data } = await api.get("/interviews");
    return data;
  },

  async create(formData) {
    const { data } = await api.post("/company/interviews", formData);
    return data;
  },

  async update(id, formData) {
    const { data } = await api.put(`/company/interviews/${id}`, formData);
    return data;
  },
};
