import React, { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { WorkshopProvider, useWorkshop } from "../context/WorkshopContext.jsx";

function Harness() {
  const { clientes, addCliente, addUsuario } = useWorkshop();
  const [resultadoRegistro, setResultadoRegistro] = useState(null);

  return (
    <div>
      <span data-testid="total-clientes">{clientes.length}</span>
      <button
        onClick={() =>
          addCliente({
            nombre: "Cliente de Prueba",
            identificacion: "999999999",
            telefono: "88880000",
          })
        }
      >
        Agregar cliente
      </button>

      <button
        onClick={() =>
          setResultadoRegistro(
            addUsuario({ nombre: "Otro Admin", usuario: "admin", password: "x", rol: "admin" })
          )
        }
      >
        Registrar usuario duplicado
      </button>
      {resultadoRegistro?.error && (
        <span data-testid="error-registro">{resultadoRegistro.error}</span>
      )}
    </div>
  );
}

beforeEach(() => localStorage.clear());

describe("WorkshopContext", () => {
  it("addCliente agrega un cliente nuevo a la lista", () => {
    render(
      <WorkshopProvider>
        <Harness />
      </WorkshopProvider>
    );
    const inicial = Number(screen.getByTestId("total-clientes").textContent);
    fireEvent.click(screen.getByText("Agregar cliente"));
    expect(Number(screen.getByTestId("total-clientes").textContent)).toBe(inicial + 1);
  });

  it("addUsuario rechaza un nombre de usuario que ya existe (ej. 'admin')", () => {
    render(
      <WorkshopProvider>
        <Harness />
      </WorkshopProvider>
    );
    fireEvent.click(screen.getByText("Registrar usuario duplicado"));
    expect(screen.getByTestId("error-registro")).toHaveTextContent(/ya existe/i);
  });
});
