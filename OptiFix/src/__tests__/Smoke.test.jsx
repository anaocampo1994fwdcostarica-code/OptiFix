import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App.jsx";
import { AuthProvider } from "../context/AuthContext.jsx";
import { WorkshopProvider } from "../context/WorkshopContext.jsx";

beforeEach(() => {
  localStorage.clear();
  global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }));
});

describe("App smoke", () => {
  it("monta la app completa y muestra la home", async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <WorkshopProvider>
            <App />
          </WorkshopProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(
      await screen.findByRole("heading", { name: /el .*control total.*de tu taller/i })
    ).toBeInTheDocument();
    expect(screen.getAllByRole("img", { name: /logo optifix/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/taller & erp/i).length).toBeGreaterThan(0);
  });
});
