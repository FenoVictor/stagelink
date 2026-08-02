import { describe, it, expect } from "vitest";
import { getErrorMessage } from "../services/api";

describe("getErrorMessage", () => {
  it("returns network error message when no response", () => {
    expect(getErrorMessage({})).toBe("Impossible de contacter le serveur. Réessayez plus tard.");
  });

  it("returns rate limit message for 429", () => {
    expect(getErrorMessage({ response: { status: 429 } })).toBe("Trop de tentatives. Réessayez dans 60 secondes.");
  });

  it("returns server message from response data", () => {
    expect(getErrorMessage({ response: { status: 500, data: { message: "Erreur serveur" } } })).toBe("Erreur serveur");
  });

  it("returns default message when no message in data", () => {
    expect(getErrorMessage({ response: { status: 400, data: {} } })).toBe("Une erreur est survenue.");
  });

  it("returns default message when data is null", () => {
    expect(getErrorMessage({ response: { status: 500, data: null } })).toBe("Une erreur est survenue.");
  });
});
