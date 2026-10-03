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
  it("permite seleccionar una cuenta demo sin iniciar sesión automáticamente", () => {
    renderLogin();
    fireEvent.click(screen.getAllByRole("button", { name: /usar|use/i })[0]);

    expect(screen.getByLabelText(/usuario|username/i)).toHaveValue("admin");
    expect(screen.getByLabelText(/contraseña|password/i)).toHaveValue("admin123");
    expect(screen.getByRole("status")).toHaveTextContent(/administrador|administrator/i);
    expect(localStorage.getItem("optifix_session")).toBeNull();

    fireEvent.change(screen.getByLabelText(/usuario|username/i), { target: { value: "admin-editado" } });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

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

  it("permite ingresar normalmente con la cuenta demo de técnico", async () => {
    renderLogin();
    fireEvent.click(screen.getAllByRole("button", { name: /usar|use/i })[1]);
    fireEvent.click(screen.getByRole("button", { name: /ingresar|sign in/i }));
    await waitFor(() => expect(localStorage.getItem("optifix_session")).toContain("tecnico"));
  });
});
