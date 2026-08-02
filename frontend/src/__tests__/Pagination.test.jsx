import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Pagination from "../components/ui/Pagination";

describe("Pagination", () => {
  it("renders nothing when totalPages is 1", () => {
    const { container } = render(<Pagination page={1} totalPages={1} onChange={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders page info", () => {
    render(<Pagination page={2} totalPages={5} onChange={vi.fn()} />);
    expect(screen.getByText("Page 2 sur 5")).toBeInTheDocument();
  });

  it("calls onChange with previous page", () => {
    const onChange = vi.fn();
    render(<Pagination page={3} totalPages={5} onChange={onChange} />);
    fireEvent.click(screen.getByText("Précédent"));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("calls onChange with next page", () => {
    const onChange = vi.fn();
    render(<Pagination page={3} totalPages={5} onChange={onChange} />);
    fireEvent.click(screen.getByText("Suivant"));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("disables previous button on first page", () => {
    render(<Pagination page={1} totalPages={5} onChange={vi.fn()} />);
    expect(screen.getByText("Précédent")).toBeDisabled();
  });

  it("disables next button on last page", () => {
    render(<Pagination page={5} totalPages={5} onChange={vi.fn()} />);
    expect(screen.getByText("Suivant")).toBeDisabled();
  });

  it("does not go below page 1", () => {
    const onChange = vi.fn();
    render(<Pagination page={1} totalPages={5} onChange={onChange} />);
    const prev = screen.getByText("Précédent");
    fireEvent.click(prev);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("does not go above totalPages", () => {
    const onChange = vi.fn();
    render(<Pagination page={5} totalPages={5} onChange={onChange} />);
    const next = screen.getByText("Suivant");
    fireEvent.click(next);
    expect(onChange).not.toHaveBeenCalled();
  });
});
