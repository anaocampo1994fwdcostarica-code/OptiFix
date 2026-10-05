import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { WorkshopProvider } from "./context/WorkshopContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import i18n from "./i18n.js";
import { I18nextProvider } from "react-i18next";
import { LanguageProvider } from "./context/LanguageContext.jsx";
import "./index.css";
import "./DarkModeFixes.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <LanguageProvider>
        <BrowserRouter>
          <AuthProvider>
            <WorkshopProvider>
              <App />
            </WorkshopProvider>
          </AuthProvider>
        </BrowserRouter>
      </LanguageProvider>
    </I18nextProvider>
  </React.StrictMode>
);
