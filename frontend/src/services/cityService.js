import api from "./api";
import { withCache } from "../utils/cache";

export const getCities = () =>
  withCache("cities", () => api.get("/cities"));
