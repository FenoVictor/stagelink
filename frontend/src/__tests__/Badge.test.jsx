import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Badge from "../components/ui/Badge";

describe("Badge", () => {
  it("renders children text", () => {
    render(<Badge>En attente</Badge>);
    expect(screen.getByText("En attente")).toBeInTheDocument();
  });

  it("applies variant class for pending", () => {
    render(<Badge variant="pending">Pending</Badge>);
    const badge = screen.getByText("Pending");
    expect(badge.className).toContain("bg-yellow-100");
  });

  it("applies variant class for accepted", () => {
    render(<Badge variant="accepted">Accepted</Badge>);
    const badge = screen.getByText("Accepted");
    expect(badge.className).toContain("bg-green-100");
  });

  it("applies variant class for rejected", () => {
    render(<Badge variant="rejected">Rejected</Badge>);
    const badge = screen.getByText("Rejected");
    expect(badge.className).toContain("bg-red-100");
  });

  it("defaults to published variant", () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText("Default");
    expect(badge.className).toContain("bg-green-100");
  });

  it("applies custom className", () => {
    render(<Badge className="custom-class">Test</Badge>);
    expect(screen.getByText("Test").className).toContain("custom-class");
  });
});
