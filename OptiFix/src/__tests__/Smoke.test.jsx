import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
jest.mock("../services/aiService.js", () => ({ sugerirDiagnostico: jest.fn() }));
jest.mock("../services/optibotService.js", () => ({ consultarOptiBot: jest.fn() }));
import App from "../App.jsx";
import { AuthProvider } from "../context/AuthContext.jsx";
import { WorkshopProvider } from "../context/WorkshopContext.jsx";
import { LanguageProvider } from "../context/LanguageContext.jsx";

beforeEach(() => {
  localStorage.clear();
  global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }));
});

describe("App smoke", () => {
  it("monta la app completa y muestra la home", async () => {
    render(
      <LanguageProvider><MemoryRouter>
        <AuthProvider>
          <WorkshopProvider>
            <App />
          </WorkshopProvider>
        </AuthProvider>
      </MemoryRouter></LanguageProvider>
    );

    expect(
      await screen.findByRole("heading", { name: /consultá el .*estado de tu orden/i })
    ).toBeInTheDocument();
    expect(screen.getAllByRole("img", { name: /logo optifix/i }).length).toBeGreaterThan(0);
  });
});
