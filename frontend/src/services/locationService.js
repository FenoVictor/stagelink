import api from "./api";
import { withCache, clearCache } from "../utils/cache";

function cacheKey(name, id) {
  return `location_${name}_${id ?? ""}`;
}

export const locationService = {
  async getCountries() {
    return withCache(cacheKey("countries"), async () => {
      const { data } = await api.get("/locations/countries");
      return data;
    });
  },

  async getProvinces(countryId) {
    return withCache(cacheKey("provinces", countryId), async () => {
      const { data } = await api.get(`/locations/${countryId}/provinces`);
      return data;
    });
  },

  async getRegions(provinceId) {
    return withCache(cacheKey("regions", provinceId), async () => {
      const { data } = await api.get(`/locations/provinces/${provinceId}/regions`);
      return data;
    });
  },

  async getDistricts(regionId) {
    return withCache(cacheKey("districts", regionId), async () => {
      const { data } = await api.get(`/locations/regions/${regionId}/districts`);
      return data;
    });
  },

  async getCommunes(districtId) {
    return withCache(cacheKey("communes", districtId), async () => {
      const { data } = await api.get(`/locations/districts/${districtId}/communes`);
      return data;
    });
  },

  async getNeighborhoods(communeId) {
    return withCache(cacheKey("neighborhoods", communeId), async () => {
      const { data } = await api.get(`/locations/communes/${communeId}/neighborhoods`);
      return data;
    });
  },

  async getCommuneHierarchy(communeId) {
    return withCache(cacheKey("hierarchy", communeId), async () => {
      const { data } = await api.get(`/locations/communes/${communeId}/hierarchy`);
      return data;
    });
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

  clearLocationCache() {
    Object.keys(localStorage)
      .filter((k) => k.startsWith("sl_cache_location_"))
      .forEach((k) => localStorage.removeItem(k));
  },
};

export { clearCache };
