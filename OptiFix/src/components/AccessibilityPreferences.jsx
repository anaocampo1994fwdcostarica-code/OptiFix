import React from "react";
import { useWorkshop } from "../context/WorkshopContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";

/** Controles de preferencias disponibles antes y después de iniciar sesión. */
export default function AccessibilityPreferences({ className = "" }) {
  const { theme, toggleTheme } = useWorkshop();
  const { language, toggleLanguage, t } = useLanguage();
  const nextTheme = theme === "light" ? "modo oscuro" : "modo claro";

  return (
    <div className={`accessibility-preferences ${className}`.trim()} aria-label="Preferencias de accesibilidad">
      <button type="button" onClick={toggleLanguage} aria-label={t("language.switch")} title={t("language.switch")}>
        {language === "es" ? "EN" : "ES"}
      </button>
      <button type="button" onClick={toggleTheme} aria-label={`Activar ${nextTheme}`} aria-pressed={theme === "dark"} title={`Activar ${nextTheme}`}>
        {theme === "light" ? "◐" : "☀"}
      </button>
    </div>
  );
}
