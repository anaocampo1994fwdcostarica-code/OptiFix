import React, { useState } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { WorkshopProvider, useWorkshop } from "../context/WorkshopContext.jsx";

function Harness() {
  const { clientes, addCliente, addUsuario } = useWorkshop();
  const [resultadoRegistro, setResultadoRegistro] = useState(null);
  return <div>
    <span data-testid="total-clientes">{clientes.length}</span>
    <button onClick={() => addCliente({ nombre: "Cliente de Prueba", identificacion: "999999999", telefono: "88880000" })}>Agregar cliente</button>
    <button onClick={() => setResultadoRegistro(addUsuario({ nombre: "Otro Admin", usuario: "admin", password: "x", rol: "admin" }))}>Registrar usuario duplicado</button>
    {resultadoRegistro?.error && <span data-testid="error-registro">{resultadoRegistro.error}</span>}
  </div>;
}

function CrudHarness() {
  const { clientes, updateCliente, deleteCliente, updateUsuario } = useWorkshop();
  const [result, setResult] = useState("");
  const firstClient = clientes[0];
  return <div>
    <span data-testid="crud-client-name">{firstClient?.nombre || "sin clientes"}</span>
    <span data-testid="crud-client-count">{clientes.length}</span>
    <button onClick={async () => setResult((await updateCliente(firstClient.id, { nombre: "Cliente editado" })).nombre)}>Editar primer cliente</button>
    <button onClick={async () => { await deleteCliente(firstClient.id); setResult("eliminado"); }}>Eliminar primer cliente</button>
    <button onClick={async () => setResult((await updateUsuario("inexistente", { rol: "admin" })).error)}>Actualizar usuario inexistente</button>
    <span data-testid="crud-result">{result}</span>
  </div>;
}

beforeEach(() => localStorage.clear());

describe("WorkshopContext", () => {
  it("agrega un cliente", () => {
    render(<WorkshopProvider><Harness /></WorkshopProvider>);
    const inicial = Number(screen.getByTestId("total-clientes").textContent);
    fireEvent.click(screen.getByText("Agregar cliente"));
    expect(Number(screen.getByTestId("total-clientes").textContent)).toBe(inicial + 1);
  });
  it("rechaza un usuario duplicado", () => {
    render(<WorkshopProvider><Harness /></WorkshopProvider>);
    fireEvent.click(screen.getByText("Registrar usuario duplicado"));
    expect(screen.getByTestId("error-registro")).toHaveTextContent(/ya existe/i);
  });

  it("actualiza un cliente solo después de recibir la respuesta HTTP", async () => {
    global.fetch = jest.fn((_, options = {}) => options.method ? Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ id: "cli-1", nombre: "Cliente editado" }) }) : new Promise(() => {}));
    render(<WorkshopProvider><CrudHarness /></WorkshopProvider>);
    fireEvent.click(screen.getByText("Editar primer cliente"));
    await waitFor(() => expect(screen.getByTestId("crud-client-name")).toHaveTextContent("Cliente editado"));
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("/clientes/cli-1"), expect.objectContaining({ method: "PATCH" }));
  });

  it("elimina un cliente tras un DELETE exitoso", async () => {
    global.fetch = jest.fn((_, options = {}) => options.method ? Promise.resolve({ ok: true, status: 204, json: jest.fn() }) : new Promise(() => {}));
    render(<WorkshopProvider><CrudHarness /></WorkshopProvider>);
    const initial = Number(screen.getByTestId("crud-client-count").textContent);
    fireEvent.click(screen.getByText("Eliminar primer cliente"));
    await waitFor(() => expect(screen.getByTestId("crud-client-count")).toHaveTextContent(String(initial - 1)));
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("/clientes/cli-1"), expect.objectContaining({ method: "DELETE" }));
  });

  it("devuelve un error controlado al actualizar un usuario inexistente", async () => {
    render(<WorkshopProvider><CrudHarness /></WorkshopProvider>);
    fireEvent.click(screen.getByText("Actualizar usuario inexistente"));
    await waitFor(() => expect(screen.getByTestId("crud-result")).toHaveTextContent(/no encontrado/i));
  });
});
