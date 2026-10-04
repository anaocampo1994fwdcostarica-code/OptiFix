import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import CambiarEstadoModal from "../components/modals/CambiarEstadoModal.jsx";
import { actualizarEstadoOrden } from "../services/n8nBackendService.js";

jest.mock("../services/n8nBackendService.js", () => ({ actualizarEstadoOrden: jest.fn() }));

describe("CambiarEstadoModal", () => {
  beforeEach(() => actualizarEstadoOrden.mockResolvedValue({ ok: true, demo: true }));

  it("permite cambiar al estado recomendado sin escribir una observación", async () => {
    const onConfirmChange = jest.fn().mockResolvedValue({});
    render(<CambiarEstadoModal
      isOpen
      onClose={jest.fn()}
      orden={{ id: "ord-1", numero: 8785, estado_actual: "ANÁLISIS TÉCNICO", etapa_categoria: "ANÁLISIS TÉCNICO", responsable: "Daniel Rojas", presupuesto_conceptos: [] }}
      cliente={{ nombre: "Cliente" }}
      equipo={{ marca: "Sony" }}
      currentUser={{ nombre: "Administrador", rol: "admin" }}
      onConfirmChange={onConfirmChange}
    />);

    expect(screen.getByRole("heading", { name: "Cambiar estado de la orden" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Agregá un detalle opcional para el historial...")).toHaveValue("");
    fireEvent.click(screen.getByRole("button", { name: "Confirmar cambio" }));

    await waitFor(() => expect(onConfirmChange).toHaveBeenCalled());
    expect(onConfirmChange.mock.calls[0][1]).toBe("EN TALLER");
    expect(onConfirmChange.mock.calls[0][3]).toBe("Cambio de ANÁLISIS TÉCNICO a EN TALLER");
  });

  it("muestra que se debe esperar la decisión durante la comunicación del presupuesto", () => {
    render(<CambiarEstadoModal
      isOpen
      onClose={jest.fn()}
      orden={{ id: "ord-2", numero: 8822, estado_actual: "COMUNICANDO PRESUPUESTO", etapa_categoria: "COMUNICANDO PRESUPUESTO", presupuesto_conceptos: [{ descripcion: "Repuesto", cantidad: 1, precio_unitario: 1000 }] }}
      currentUser={{ nombre: "Administrador", rol: "admin" }}
      onConfirmChange={jest.fn()}
    />);
    expect(screen.getByText("Siguiente acción")).toBeInTheDocument();
    expect(screen.getByText("Esperar decisión del cliente")).toBeInTheDocument();
    expect(screen.queryByText("Siguiente recomendado")).not.toBeInTheDocument();
  });
});
