import api from "./api";

export const favoriteService = {
  async getAll() {
    const { data } = await api.get("/favorites");
    return data;
  },

  async toggle(internshipId) {
    const { data } = await api.post(`/internships/${internshipId}/favorite`);
    return data;
  },
};
