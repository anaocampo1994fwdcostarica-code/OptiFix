// src/test-utils/calculos.test.js
import { calcularTotalReparacion } from './calculos';

describe('Pruebas unitarias de lógica clave - OptiFix', () => {
  test('Calcula correctamente el total con impuestos (13%)', () => {
    const resultado = calcularTotalReparacion(100);
    expect(resultado).toBe(113);
  });

  test('Devuelve 0 si el subtotal es negativo', () => {
    const resultado = calcularTotalReparacion(-50);
    expect(resultado).toBe(0);
  });
});
