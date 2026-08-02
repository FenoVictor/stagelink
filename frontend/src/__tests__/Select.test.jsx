import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Select from "../components/ui/Select";

describe("Select", () => {
  it("renders select element", () => {
    render(<Select><option>A</option></Select>);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    render(<Select label="Type" id="type"><option>A</option></Select>);
    expect(screen.getByLabelText("Type")).toBeInTheDocument();
  });

  it("does not render label when not provided", () => {
    const { container } = render(<Select><option>A</option></Select>);
    expect(container.querySelector("label")).not.toBeInTheDocument();
  });

  it("renders children options", () => {
    render(
      <Select>
        <option value="remote">Remote</option>
        <option value="onsite">Onsite</option>
      </Select>
    );
    expect(screen.getByText("Remote")).toBeInTheDocument();
    expect(screen.getByText("Onsite")).toBeInTheDocument();
  });

  it("displays error message", () => {
    render(<Select error="Requis"><option>A</option></Select>);
    expect(screen.getByRole("alert")).toHaveTextContent("Requis");
  });

  it("applies error border class", () => {
    render(<Select error="Error"><option>A</option></Select>);
    expect(screen.getByRole("combobox").className).toContain("border-danger");
  });
});
