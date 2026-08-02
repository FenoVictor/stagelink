import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import EmptyState from "../components/ui/EmptyState";

describe("EmptyState", () => {
  it("renders title", () => {
    render(<EmptyState title="Aucun résultat" />);
    expect(screen.getByText("Aucun résultat")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<EmptyState title="Vide" description="Il n'y a rien ici." />);
    expect(screen.getByText("Il n'y a rien ici.")).toBeInTheDocument();
  });

  it("does not render description when not provided", () => {
    render(<EmptyState title="Vide" />);
    expect(screen.queryByText(/Il n'y a rien/)).not.toBeInTheDocument();
  });

  it("renders action button when action and onAction provided", () => {
    const onAction = vi.fn();
    render(<EmptyState title="Vide" action onAction={onAction} actionLabel="Créer" />);
    expect(screen.getByText("Créer")).toBeInTheDocument();
  });

  it("does not render button when onAction is missing", () => {
    render(<EmptyState title="Vide" action actionLabel="Créer" />);
    expect(screen.queryByText("Créer")).not.toBeInTheDocument();
  });

  it("calls onAction when button clicked", () => {
    const onAction = vi.fn();
    render(<EmptyState title="Vide" action onAction={onAction} actionLabel="Ajouter" />);
    screen.getByText("Ajouter").click();
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
