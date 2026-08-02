import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Input from "../components/ui/Input";

describe("Input", () => {
  it("renders input element", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    render(<Input label="Email" id="email" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("does not render label when not provided", () => {
    const { container } = render(<Input id="email" />);
    expect(container.querySelector("label")).not.toBeInTheDocument();
  });

  it("displays error message", () => {
    render(<Input error="Ce champ est requis" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Ce champ est requis");
  });

  it("applies error border class", () => {
    render(<Input error="Error" />);
    expect(screen.getByRole("textbox").className).toContain("border-danger");
  });

  it("passes through props like placeholder", () => {
    render(<Input placeholder="Entrez votre email" />);
    expect(screen.getByPlaceholderText("Entrez votre email")).toBeInTheDocument();
  });

  it("passes through type prop", () => {
    const { container } = render(<Input type="password" />);
    expect(container.querySelector("input")).toHaveAttribute("type", "password");
  });
});
