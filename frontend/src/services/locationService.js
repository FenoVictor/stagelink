import api from "./api";

export const locationService = {
  async getCountries() {
    const { data } = await api.get("/locations/countries");
    return data;
  },

  async getProvinces(countryId) {
    const { data } = await api.get(`/locations/${countryId}/provinces`);
    return data;
  },

  async getRegions(provinceId) {
    const { data } = await api.get(`/locations/provinces/${provinceId}/regions`);
    return data;
  },

  async getDistricts(regionId) {
    const { data } = await api.get(`/locations/regions/${regionId}/districts`);
    return data;
  },

  async getCommunes(districtId) {
    const { data } = await api.get(`/locations/districts/${districtId}/communes`);
    return data;
  },

  async getNeighborhoods(communeId) {
    const { data } = await api.get(`/locations/communes/${communeId}/neighborhoods`);
    return data;
  },

  async proposeNeighborhood(communeId, name) {
    const { data } = await api.post("/neighborhoods", { commune_id: communeId, name });
    return data;
  },

  async getPendingNeighborhoods() {
    const { data } = await api.get("/admin/neighborhoods/pending");
    return data;
  },

  async getPendingCount() {
    const { data } = await api.get("/admin/neighborhoods/pending-count");
    return data;
  },

  async approveNeighborhood(id) {
    const { data } = await api.post(`/admin/neighborhoods/${id}/approve`);
    return data;
  },

  async rejectNeighborhood(id) {
    const { data } = await api.post(`/admin/neighborhoods/${id}/reject`);
    return data;
  },
};
