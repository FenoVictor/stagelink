import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Modal from "../components/ui/Modal";

describe("Modal", () => {
  beforeEach(() => {
    document.body.style.overflow = "";
  });

  afterEach(() => {
    document.body.style.overflow = "";
  });

  it("does not render when closed", () => {
    render(<Modal open={false} onClose={vi.fn()} title="Test">Content</Modal>);
    expect(screen.queryByText("Test")).not.toBeInTheDocument();
  });

  it("renders when open", () => {
    render(<Modal open={true} onClose={vi.fn()} title="My Modal">Content</Modal>);
    expect(screen.getByText("My Modal")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("calls onClose when clicking overlay", () => {
    const onClose = vi.fn();
    const { container } = render(<Modal open={true} onClose={onClose} title="Test">Content</Modal>);
    const overlay = container.querySelector(".fixed.inset-0");
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalled();
  });

  it("does not close when clicking inside modal content", () => {
    const onClose = vi.fn();
    render(<Modal open={true} onClose={onClose} title="Test">
      <span data-testid="inner">Inner</span>
    </Modal>);
    fireEvent.click(screen.getByTestId("inner"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("sets body overflow to hidden when open", () => {
    render(<Modal open={true} onClose={vi.fn()} title="Test">Content</Modal>);
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("renders close button", () => {
    render(<Modal open={true} onClose={vi.fn()} title="Test">Content</Modal>);
    const closeBtn = screen.getByRole("button");
    expect(closeBtn).toBeInTheDocument();
  });

  it("calls onClose when clicking close button", () => {
    const onClose = vi.fn();
    render(<Modal open={true} onClose={onClose} title="Test">Content</Modal>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClose).toHaveBeenCalled();
  });
});
