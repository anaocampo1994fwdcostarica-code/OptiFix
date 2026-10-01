import { listarOrdenes, obtenerOrden, crearOrden, reemplazarOrden, actualizarOrden, eliminarOrden } from "../services/ordenesService.js";
import { listarUsuarios, obtenerUsuario, crearUsuario, reemplazarUsuario, eliminarUsuario, autenticarUsuario } from "../services/usuariosService.js";
import { listarClientes, crearCliente, actualizarCliente, eliminarCliente } from "../services/clientesService.js";
import { listarEquipos, crearEquipo, actualizarEquipo, eliminarEquipo } from "../services/equiposService.js";
import { listarProductos, crearProducto, actualizarProducto, eliminarProducto } from "../services/productosService.js";
import { listarServicios, crearServicio, actualizarServicio, eliminarServicio } from "../services/serviciosService.js";
import { listarCotizaciones, crearCotizacion, actualizarCotizacion, eliminarCotizacion } from "../services/cotizacionesService.js";

const ok = (data, status = 200) => ({ ok: true, status, json: jest.fn().mockResolvedValue(data) });
const noContent = () => ({ ok: true, status: 204, json: jest.fn() });

beforeEach(() => { global.fetch = jest.fn(); });
afterEach(() => { jest.restoreAllMocks(); });

describe("Servicios HTTP de OptiFix", () => {
  it("lista órdenes mediante GET y devuelve el JSON del servidor", async () => {
    global.fetch.mockResolvedValue(ok([{ id: "ord-1" }]));
    await expect(listarOrdenes()).resolves.toEqual([{ id: "ord-1" }]);
    expect(global.fetch).toHaveBeenCalledWith("http://localhost:3001/ordenes", expect.objectContaining({ headers: { "Content-Type": "application/json" } }));
  });

  it("crea una orden mediante POST serializando el payload", async () => {
    const orden = { id: "ord-x", trabajo_solicitado: "Diagnóstico" };
    global.fetch.mockResolvedValue(ok(orden, 201));
    await expect(crearOrden(orden)).resolves.toEqual(orden);
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("/ordenes"), expect.objectContaining({ method: "POST", body: JSON.stringify(orden) }));
  });

  it("devuelve null cuando DELETE recibe 204", async () => {
    global.fetch.mockResolvedValue(noContent());
    await expect(eliminarOrden("ord-x")).resolves.toBeNull();
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("/ordenes/ord-x"), expect.objectContaining({ method: "DELETE" }));
  });

  it.each([
    ["clientes", listarClientes, actualizarCliente, "cli-1"],
    ["equipos", listarEquipos, eliminarEquipo, "eq-1"],
    ["productos", listarProductos, crearProducto, "prod-1"],
    ["servicios", listarServicios, actualizarServicio, "srv-1"],
    ["cotizaciones", listarCotizaciones, eliminarCotizacion, "cot-1"],
  ])("consume el servicio de %s con GET y una mutación", async (_nombre, listar, mutar, id) => {
    global.fetch.mockResolvedValueOnce(ok([])).mockResolvedValueOnce(ok({ id }));
    await expect(listar()).resolves.toEqual([]);
    await expect(mutar(id, { nombre: "Actualizado" })).resolves.toEqual({ id });
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("gestiona autenticación por usuario, contraseña y rol", async () => {
    global.fetch.mockResolvedValue(ok([{ id: "user-1", usuario: "ana", password: "clave", rol: "tecnico" }]));
    await expect(autenticarUsuario({ usuario: " ana ", password: "clave", rol: "tecnico" })).resolves.toMatchObject({ id: "user-1" });
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("/usuarios?usuario=ana"), expect.any(Object));
  });

  it("crea usuarios por POST y lista usuarios", async () => {
    const user = { id: "user-9", usuario: "nuevo" };
    global.fetch.mockResolvedValueOnce(ok([])).mockResolvedValueOnce(ok(user, 201));
    await expect(listarUsuarios()).resolves.toEqual([]);
    await expect(crearUsuario(user)).resolves.toEqual(user);
    expect(global.fetch).toHaveBeenLastCalledWith(expect.stringContaining("/usuarios"), expect.objectContaining({ method: "POST", body: JSON.stringify(user) }));
  });

  it("propaga el detalle de un error HTTP", async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 500, text: jest.fn().mockResolvedValue("Base de datos no disponible") });
    await expect(listarClientes()).rejects.toThrow("Base de datos no disponible");
  });

  it("propaga los fallos de red de fetch", async () => {
    global.fetch.mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(listarProductos()).rejects.toThrow("Failed to fetch");
  });

  it.each([
    ["orden", obtenerOrden, reemplazarOrden, actualizarOrden, "ord 1"],
    ["usuario", obtenerUsuario, reemplazarUsuario, null, "usr 1"],
  ])("cubre lectura individual y mutaciones completas de %s", async (_name, obtener, reemplazar, actualizar, id) => {
    global.fetch.mockResolvedValue(ok({ id }));
    await expect(obtener(id)).resolves.toEqual({ id });
    await expect(reemplazar(id, { nombre: "Completo" })).resolves.toEqual({ id });
    if (actualizar) await expect(actualizar(id, { nombre: "Parcial" })).resolves.toEqual({ id });
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining(encodeURIComponent(id)), expect.any(Object));
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining(encodeURIComponent(id)), expect.objectContaining({ method: "PUT" }));
    if (actualizar) expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining(encodeURIComponent(id)), expect.objectContaining({ method: "PATCH" }));
  });

  it.each([
    ["cliente", crearCliente, actualizarCliente, eliminarCliente, "cli 1"],
    ["equipo", crearEquipo, actualizarEquipo, eliminarEquipo, "eq 1"],
    ["producto", crearProducto, actualizarProducto, eliminarProducto, "prod 1"],
    ["servicio", crearServicio, actualizarServicio, eliminarServicio, "srv 1"],
    ["cotización", crearCotizacion, actualizarCotizacion, eliminarCotizacion, "cot 1"],
  ])("ejecuta POST, PATCH y DELETE para %s", async (_name, crear, actualizar, eliminar, id) => {
    global.fetch.mockResolvedValue(ok({ id }));
    await expect(crear({ nombre: "Nuevo" })).resolves.toEqual({ id });
    await expect(actualizar(id, { nombre: "Editado" })).resolves.toEqual({ id });
    global.fetch.mockResolvedValueOnce(noContent());
    await expect(eliminar(id)).resolves.toBeNull();
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining(encodeURIComponent(id)), expect.objectContaining({ method: "PATCH" }));
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining(encodeURIComponent(id)), expect.objectContaining({ method: "DELETE" }));
  });

  it("devuelve null si las credenciales no coinciden", async () => {
    global.fetch.mockResolvedValue(ok([{ usuario: "ana", password: "otra", rol: "tecnico" }]));
    await expect(autenticarUsuario({ usuario: "ana", password: "clave", rol: "tecnico" })).resolves.toBeNull();
  });
});
