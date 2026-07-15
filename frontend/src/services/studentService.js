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

  async getPublicProfile(userId) {
    const { data } = await api.get(`/students/${userId}/profile`);
    return data;
  },

  async getDashboard() {
    const { data } = await api.get("/student/dashboard");
    return data;
  },

  // Internship journey
  async getMyInternships() {
    const { data } = await api.get("/student/internships");
    return data;
  },

  async startInternship(internshipId, startDate) {
    const { data } = await api.post(`/student/internships/${internshipId}/start`, { start_date: startDate });
    return data;
  },

  async completeInternship(id, endDate, feedback) {
    const { data } = await api.put(`/student/internship-student/${id}/complete`, { end_date: endDate, feedback });
    return data;
  },

  async downloadAttestation(id) {
    const response = await api.get(`/student/internship-student/${id}/attestation`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `attestation_${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
