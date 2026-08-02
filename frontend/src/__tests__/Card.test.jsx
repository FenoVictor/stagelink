import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Card from "../components/ui/Card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Contenu</Card>);
    expect(screen.getByText("Contenu")).toBeInTheDocument();
  });

  it("applies base classes", () => {
    render(<Card>Test</Card>);
    expect(screen.getByText("Test").className).toContain("rounded-xl");
    expect(screen.getByText("Test").className).toContain("bg-surface");
  });

  it("applies hover classes when hover is true", () => {
    render(<Card hover>Test</Card>);
    expect(screen.getByText("Test").className).toContain("cursor-pointer");
  });

  it("does not apply hover classes when hover is false", () => {
    render(<Card>Test</Card>);
    expect(screen.getByText("Test").className).not.toContain("cursor-pointer");
  });

  it("applies custom className", () => {
    render(<Card className="custom">Test</Card>);
    expect(screen.getByText("Test").className).toContain("custom");
  });
});
