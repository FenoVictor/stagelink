import { describe, it, expect } from "vitest";
import { ROLES, APPLICATION_STATUS, INTERNSHIP_STATUS, INTERNSHIP_TYPES } from "../constants";

describe("constants", () => {
  it("ROLES has correct values", () => {
    expect(ROLES.STUDENT).toBe("student");
    expect(ROLES.COMPANY).toBe("company");
    expect(ROLES.ADMIN).toBe("admin");
  });

  it("APPLICATION_STATUS has correct values", () => {
    expect(APPLICATION_STATUS.PENDING).toBe("pending");
    expect(APPLICATION_STATUS.ACCEPTED).toBe("accepted");
    expect(APPLICATION_STATUS.REJECTED).toBe("rejected");
  });

  it("INTERNSHIP_STATUS has correct values", () => {
    expect(INTERNSHIP_STATUS.DRAFT).toBe("draft");
    expect(INTERNSHIP_STATUS.PUBLISHED).toBe("published");
    expect(INTERNSHIP_STATUS.CLOSED).toBe("closed");
    expect(INTERNSHIP_STATUS.EXPIRED).toBe("expired");
  });

  it("INTERNSHIP_TYPES has correct values", () => {
    expect(INTERNSHIP_TYPES.REMOTE).toBe("remote");
    expect(INTERNSHIP_TYPES.ONSITE).toBe("onsite");
    expect(INTERNSHIP_TYPES.HYBRID).toBe("hybrid");
  });
});
