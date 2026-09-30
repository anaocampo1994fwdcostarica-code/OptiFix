import { calcularTotalReparacion } from "../utils/calculos.js";

describe("Pruebas unitarias de lógica clave - OptiFix", () => {
  test("Calcula correctamente el total con impuestos (13%)", () => {
    expect(calcularTotalReparacion(100)).toBe(113);
  });

  test("Devuelve 0 si el subtotal es negativo", () => {
    expect(calcularTotalReparacion(-50)).toBe(0);
  });
});
