import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BudgetDecisionEditModal } from "../components/order/OrderManagementPanels.jsx";

const rejectedOrder = {
  id: "ord-1",
  decisionPresupuesto: "RECHAZADO",
  estado_actual: "SIN REPARAR",
  linea_tiempo: []
};

describe("BudgetDecisionEditModal", () => {
  it("exige motivo antes de modificar una decisión", () => {
    render(<BudgetDecisionEditModal order={rejectedOrder} onClose={jest.fn()} onSave={jest.fn()} />);
    fireEvent.change(screen.getByLabelText("Nueva decisión"), { target: { value: "APROBADO" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambio" }));
    expect(screen.getByRole("alert")).toHaveTextContent("obligatorio");
  });

  it("permite mantener el estado actual después de registrar el cambio", async () => {
    const onSave = jest.fn().mockResolvedValue({});
    render(<BudgetDecisionEditModal order={rejectedOrder} onClose={jest.fn()} onSave={onSave} />);
    fireEvent.change(screen.getByLabelText("Nueva decisión"), { target: { value: "APROBADO" } });
    fireEvent.change(screen.getByLabelText("Motivo / comentario del cambio *"), { target: { value: "Cliente confirmó por WhatsApp." } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambio" }));
    expect(screen.getByText(/¿Desea mover la orden a/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Mantener estado actual" }));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith("APROBADO", "Cliente confirmó por WhatsApp.", false));
  });
});
