import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext.jsx";
import { WorkshopProvider } from "../context/WorkshopContext.jsx";
import { LoginCard } from "../pages/Login.jsx";

function renderLogin() {
  return render(<MemoryRouter><AuthProvider><WorkshopProvider><LoginCard /></WorkshopProvider></AuthProvider></MemoryRouter>);
}

beforeEach(() => localStorage.clear());

describe("Login", () => {
  it("muestra un error cuando la contraseña es incorrecta", async () => {
    renderLogin();
    fireEvent.change(screen.getByPlaceholderText("Usuario"), { target: { value: "admin" } });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), { target: { value: "clave-mala" } });
    fireEvent.click(screen.getByRole("button", { name: /ingresar/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/incorrectos/i);
    expect(localStorage.getItem("optifix_session")).toBeNull();
  });

  it("guarda la sesión con las credenciales correctas", async () => {
    renderLogin();
    fireEvent.change(screen.getByPlaceholderText("Usuario"), { target: { value: "admin" } });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), { target: { value: "admin123" } });
    fireEvent.click(screen.getByRole("button", { name: /ingresar/i }));
    await waitFor(() => expect(localStorage.getItem("optifix_session")).toContain("admin"));
  });
});
