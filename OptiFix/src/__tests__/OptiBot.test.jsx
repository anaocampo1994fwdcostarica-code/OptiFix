import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import OptiBot from "../components/ai/OptiBot.jsx";
import { consultarOptiBot } from "../services/optibotService.js";

jest.mock("../services/optibotService.js", () => ({ consultarOptiBot: jest.fn() }));

describe("OptiBot", () => {
  it("envía una consulta al webhook y muestra la respuesta", async () => {
    consultarOptiBot.mockResolvedValueOnce("Hay 3 órdenes en reparación.");
    render(<OptiBot usuario={{ id: "user-2", nombre: "Técnico", rol: "tecnico" }} />);

    fireEvent.change(screen.getByLabelText(/pregunta para optibot/i), { target: { value: "¿Cuántas órdenes hay?" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));

    expect(consultarOptiBot).toHaveBeenCalledWith("¿Cuántas órdenes hay?", expect.objectContaining({ id: "user-2" }));
    expect(await screen.findByText("Hay 3 órdenes en reparación.")).toBeInTheDocument();
  });

  it("muestra un error recuperable si el webhook falla", async () => {
    consultarOptiBot.mockRejectedValueOnce(new Error("Webhook no disponible"));
    render(<OptiBot usuario={{ id: "user-1", rol: "admin" }} />);

    fireEvent.change(screen.getByLabelText(/pregunta para optibot/i), { target: { value: "Estado del taller" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Webhook no disponible");
  });
});
