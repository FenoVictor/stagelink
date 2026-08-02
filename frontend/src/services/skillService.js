import api from "./api";
import { withCache } from "../utils/cache";

export async function getSkills() {
  return withCache("skills", async () => {
    const { data } = await api.get("/skills");
    return data;
  });
}
