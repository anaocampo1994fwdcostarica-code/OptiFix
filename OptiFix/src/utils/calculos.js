export function calcularTotalReparacion(subtotal, impuesto = 0.13) {
  if (subtotal < 0) return 0;
  return subtotal + (subtotal * impuesto);
}
