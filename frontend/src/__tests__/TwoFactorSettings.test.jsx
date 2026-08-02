import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TwoFactorSettings from "../pages/Settings/TwoFactorSettings";

vi.mock("../services/securityService", () => ({
  securityService: {
    get2faStatus: vi.fn().mockResolvedValue({ enabled: false, confirmed_at: null, recovery_codes: [] }),
    enable2fa: vi.fn().mockResolvedValue({
      qr_code_url: "http://chart",
      otpauth_url: "otpauth://totp/StageLink:test@test.fr?secret=ABCDEFGHIJKLMNOP&issuer=StageLink",
      secret: "ABCDEFGHIJKLMNOP",
      recovery_codes: ["CODE1AAA", "CODE2BBB", "CODE3CCC", "CODE4DDD", "CODE5EEE", "CODE6FFF", "CODE7GGG", "CODE8HHH"],
    }),
    confirm2fa: vi.fn().mockResolvedValue({ message: "ok" }),
    disable2fa: vi.fn(),
  },
}));

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

describe("TwoFactorSettings", () => {
  it("renders the enable button when 2FA is off", async () => {
    render(<TwoFactorSettings />);
    expect(
      await screen.findByRole("button", { name: /activer la double authentification/i })
    ).toBeInTheDocument();
  });

  it("shows QR setup with otpauth and accepts typed code", async () => {
    render(<TwoFactorSettings />);
    const enableBtn = await screen.findByRole("button", { name: /activer la double authentification/i });
    fireEvent.click(enableBtn);

    const svg = await screen.findByRole("img");
    expect(svg).toBeInTheDocument();

    const codeInput = screen.getByPlaceholderText("000000");
    fireEvent.change(codeInput, { target: { value: "123456" } });
    expect(codeInput.value).toBe("123456");

    fireEvent.change(codeInput, { target: { value: "abc4567" } });
    expect(codeInput.value).toBe("ABC4567");

    fireEvent.change(codeInput, { target: { value: "ab-c45.6" } });
    expect(codeInput.value).toBe("ABC456");

    const confirmBtn = await screen.findByRole("button", { name: /confirmer et activer/i });
    expect(confirmBtn).not.toBeDisabled();
  });
});
