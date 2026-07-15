import api from "./api";

export async function getSkills() {
  const { data } = await api.get("/skills");
  return data;
}
