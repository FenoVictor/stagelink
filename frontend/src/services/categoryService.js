import api from "./api";
import { withCache } from "../utils/cache";

export const categoryService = {
  async getCategories() {
    return withCache("categories", async () => {
      const { data } = await api.get("/categories");
      return data;
    });
  },
};
