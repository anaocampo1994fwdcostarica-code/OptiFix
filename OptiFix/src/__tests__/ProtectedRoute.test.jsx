import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";

function setup(initialEntry, session) {
  localStorage.clear();
  if (session) localStorage.setItem("optifix_session", JSON.stringify(session));
  return render(<MemoryRouter initialEntries={[initialEntry]}><AuthProvider><Routes>
    <Route path="/login" element={<div>Pantalla de login</div>} />
    <Route path="/ordenes" element={<div>Órdenes comunes</div>} />
    <Route path="/privado" element={<ProtectedRoute><div>Contenido privado</div></ProtectedRoute>} />
    <Route path="/solo-admin" element={<ProtectedRoute allowedRoles={["admin"]}><div>Panel exclusivo de administrador</div></ProtectedRoute>} />
  </Routes></AuthProvider></MemoryRouter>);
}

describe("ProtectedRoute", () => {
  it("redirige a login si no hay sesión", async () => {
    setup("/privado", null);
    expect(await screen.findByText("Pantalla de login")).toBeInTheDocument();
  });
  it("muestra el contenido privado si hay sesión válida", async () => {
    setup("/privado", { nombre: "Ana", usuario: "ana", rol: "tecnico" });
    expect(await screen.findByText("Contenido privado")).toBeInTheDocument();
  });
  it("bloquea al técnico de una ruta de administrador", async () => {
    setup("/solo-admin", { nombre: "Ana", usuario: "ana", rol: "tecnico" });
    expect(await screen.findByText("Órdenes comunes")).toBeInTheDocument();
  });
  it("autoriza al administrador", async () => {
    setup("/solo-admin", { nombre: "Root", usuario: "admin", rol: "admin" });
    expect(await screen.findByText("Panel exclusivo de administrador")).toBeInTheDocument();
  });
});
