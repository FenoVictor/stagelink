import api from "./api";

export const notificationService = {
  async getAll() {
    const { data } = await api.get("/notifications");
    return data;
  },

  async markAsRead(id) {
    const { data } = await api.put(`/notifications/${id}/read`);
    return data;
  },

  async markAllRead() {
    const { data } = await api.put("/notifications/read-all");
    return data;
  },
};
