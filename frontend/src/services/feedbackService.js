import api from "./api";

export const feedbackService = {
  async submit(data) {
    const { data: res } = await api.post("/feedback", data);
    return res;
  },

  async getAll(params = {}) {
    const { data } = await api.get("/admin/feedback", { params });
    return data;
  },

  async getStats() {
    const { data } = await api.get("/admin/feedback/stats");
    return data;
  },

  async update(id, data) {
    const { data: res } = await api.put(`/admin/feedback/${id}`, data);
    return res;
  },
};
