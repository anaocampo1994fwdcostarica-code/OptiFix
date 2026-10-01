import React, { createContext, useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import "../i18n.js";

const LanguageContext = createContext(null);

/**
 * InternacionalizaciÃ³n de interfaz para el entorno acadÃ©mico de OptiFix.
 * i18next persiste la preferencia en localStorage con la clave optifix_language.
 */
export function LanguageProvider({ children }) {
  const { t, i18n } = useTranslation();
  const value = useMemo(() => ({
    language: i18n.resolvedLanguage === "en" ? "en" : "es",
    t,
    setLanguage: (language) => i18n.changeLanguage(language === "en" ? "en" : "es"),
    toggleLanguage: () => i18n.changeLanguage(i18n.resolvedLanguage === "en" ? "es" : "en")
  }), [t, i18n, i18n.language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage debe usarse dentro de LanguageProvider");
  return context;
}
