import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext.jsx";
import { WorkshopProvider } from "../context/WorkshopContext.jsx";
import { LoginCard } from "../pages/Login.jsx";
import { LanguageProvider } from "../context/LanguageContext.jsx";

function renderLogin() {
  return render(<LanguageProvider><MemoryRouter><AuthProvider><WorkshopProvider><LoginCard /></WorkshopProvider></AuthProvider></MemoryRouter></LanguageProvider>);
}

beforeEach(() => localStorage.clear());

describe("Login", () => {
  it("muestra un error cuando la contraseña es incorrecta", async () => {
    renderLogin();
    fireEvent.change(screen.getByLabelText(/usuario|username/i), { target: { value: "admin" } });
    fireEvent.change(screen.getByLabelText(/contraseña|password/i), { target: { value: "clave-mala" } });
    fireEvent.click(screen.getByRole("button", { name: /ingresar|sign in/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/incorrectos/i);
    expect(localStorage.getItem("optifix_session")).toBeNull();
  });

  it("guarda la sesión con las credenciales correctas", async () => {
    renderLogin();
    fireEvent.change(screen.getByLabelText(/usuario|username/i), { target: { value: "admin" } });
    fireEvent.change(screen.getByLabelText(/contraseña|password/i), { target: { value: "admin123" } });
    fireEvent.click(screen.getByRole("button", { name: /ingresar|sign in/i }));
    await waitFor(() => expect(localStorage.getItem("optifix_session")).toContain("admin"));
  });
});
