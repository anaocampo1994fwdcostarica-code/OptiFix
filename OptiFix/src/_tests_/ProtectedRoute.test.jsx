import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";

function setup(initialEntry, session) {
  localStorage.clear();
  if (session) {
    localStorage.setItem("optifix_session", JSON.stringify(session));
  }
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<div>Pantalla de login</div>} />
          <Route path="/ordenes" element={<div>Órdenes (área común a ambos roles)</div>} />
          <Route
            path="/privado"
            element={
              <ProtectedRoute>
                <div>Contenido privado</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/solo-admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <div>Panel exclusivo de administrador</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  it("redirige a /login si no hay sesión iniciada", async () => {
    setup("/privado", null);
    expect(await screen.findByText("Pantalla de login")).toBeInTheDocument();
  });

  it("muestra el contenido privado si hay una sesión válida", async () => {
    setup("/privado", { nombre: "Ana Técnica", usuario: "ana", rol: "tecnico" });
    expect(await screen.findByText("Contenido privado")).toBeInTheDocument();
  });

  it("un técnico no puede entrar a una ruta exclusiva de administrador", async () => {
    setup("/solo-admin", { nombre: "Ana Técnica", usuario: "ana", rol: "tecnico" });
    expect(await screen.findByText("Órdenes (área común a ambos roles)")).toBeInTheDocument();
  });

  it("un administrador sí puede entrar a una ruta exclusiva de administrador", async () => {
    setup("/solo-admin", { nombre: "Root Admin", usuario: "admin", rol: "admin" });
    expect(await screen.findByText("Panel exclusivo de administrador")).toBeInTheDocument();
  });
});
