import React, { useEffect, useState } from "react";
import { useWorkshop } from "../context/WorkshopContext.jsx";
import i18n from "../i18n.js";

/** Controles de preferencias disponibles antes y después de iniciar sesión. */
export default function AccessibilityPreferences({ className = "" }) {
  const { theme, toggleTheme } = useWorkshop();
  const [language, setLanguage] = useState(i18n.language || "es");
  const nextTheme = theme === "light" ? "modo oscuro" : "modo claro";

  useEffect(() => {
    const updateLanguage = (nextLanguage) => setLanguage(nextLanguage);
    i18n.on("languageChanged", updateLanguage);
    return () => i18n.off("languageChanged", updateLanguage);
  }, []);

  return (
    <div className={`accessibility-preferences ${className}`.trim()} aria-label="Preferencias de accesibilidad">
      <button type="button" onClick={() => i18n.changeLanguage(language === "es" ? "en" : "es")} aria-label={`Cambiar idioma a ${language === "es" ? "inglés" : "español"}`} title="Cambiar idioma">
        {language === "es" ? "EN" : "ES"}
      </button>
      <button type="button" onClick={toggleTheme} aria-label={`Activar ${nextTheme}`} aria-pressed={theme === "dark"} title={`Activar ${nextTheme}`}>
        {theme === "light" ? "◐" : "☀"}
      </button>
    </div>
  );
}
