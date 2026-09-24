import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App.jsx";
import { AuthProvider } from "../context/AuthContext.jsx";
import { WorkshopProvider } from "../context/WorkshopContext.jsx";

const METRICAS_MOCK = {
  tramites_resueltos_label: "+2.4M",
  disponibilidad_label: "99.8%",
  porcentaje_firma_digital: 100,
  sla_red_institucional: "99.9%",
  estado_servidores: "OPERATIVO_LINEA",
};

beforeEach(() => {
  localStorage.clear();
  global.fetch = jest.fn((url) => {
    if (url.includes("/metricas/publicas")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(METRICAS_MOCK) });
    }
    if (url.includes("/categorias")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ categorias: [] }),
      });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
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