import api from "./api";

export const conversationService = {
  async getAll() {
    const { data } = await api.get("/conversations");
    return data;
  },

  async getOne(id) {
    const { data } = await api.get(`/conversations/${id}`);
    return data;
  },

  async start(data) {
    const { data: res } = await api.post("/conversations", data);
    return res;
  },

  async getMessages(conversationId) {
    const { data } = await api.get(`/conversations/${conversationId}/messages`);
    return data;
  },

  async sendMessage(conversationId, message) {
    const { data } = await api.post(`/conversations/${conversationId}/messages`, { message });
    return data;
  },

  async sendMessageWithFile(conversationId, formData) {
    const { data } = await api.post(`/conversations/${conversationId}/messages`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};
