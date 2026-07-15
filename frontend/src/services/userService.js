import api from "./api";

export const userService = {
  async search(q) {
    const { data } = await api.get("/users/search", { params: { q } });
    return data;
  },
};
