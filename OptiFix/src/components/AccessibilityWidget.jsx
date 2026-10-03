import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useWorkshop } from "../context/WorkshopContext.jsx";
import { useFocusTrap } from "../hooks/useFocusTrap.js";

const FONT_SCALES = [0.9, 1, 1.1, 1.2];

/**
 * Widget universal de accesibilidad.
 * Las props son opcionales: sin ellas reutiliza los controles globales de OptiFix.
 */
export default function AccessibilityWidget({
  onToggleDarkMode,
  onZoomText,
  onToggleLanguage,
  currentLang
}) {
  const { i18n, t } = useTranslation();
  const { theme, toggleTheme } = useWorkshop();
  const [isOpen, setIsOpen] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [colorVisionFilter, setColorVisionFilter] = useState("");
  const [fontScale, setFontScale] = useState(() => {
    if (typeof window === "undefined") return 1;
    return Number(window.localStorage.getItem("optifix_font_scale")) || 1;
  });
  const panelRef = useFocusTrap(isOpen, () => setIsOpen(false));
  const fallbackLang = i18n.resolvedLanguage === "en" ? "en" : "es";
  const activeLang = currentLang === "en" ? "en" : currentLang === "es" ? "es" : fallbackLang;

  // Filtros SVG nativos para simulación de los tres tipos principales de daltonismo.
  const ColorVisionFilters = () => (
    <svg aria-hidden="true" width="0" height="0" focusable="false" style={{ position: "absolute" }}>
      <defs>
        <filter id="protanopia">
          <feColorMatrix type="matrix" values="0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0" />
        </filter>
        <filter id="deuteranopia">
          <feColorMatrix type="matrix" values="0.625 0.375 0 0 0  0.700 0.300 0 0 0  0 0.300 0.700 0 0  0 0 0 1 0" />
        </filter>
        <filter id="tritanopia">
          <feColorMatrix type="matrix" values="0.950 0.050 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0" />
        </filter>
      </defs>
    </svg>
  );

  useEffect(() => {
    document.documentElement.style.setProperty("--font-scale", String(fontScale));
    window.localStorage.setItem("optifix_font_scale", String(fontScale));
  }, [fontScale]);

  // El filtro elegido se aplica en tiempo real y se limpia al desmontar el widget.
  useEffect(() => {
    const originalFilter = document.body.style.filter;
    document.body.style.filter = colorVisionFilter ? "url(#" + colorVisionFilter + ")" : "";
    return () => {
      document.body.style.filter = originalFilter;
    };
  }, [colorVisionFilter]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const handleToggleRead = () => {
    if (!window.speechSynthesis) return;
    const synth = window.speechSynthesis;
    if (isReading) {
      synth.cancel();
      setIsReading(false);
      return;
    }
    // Se prioriza main para evitar leer controles repetidos de navegación.
    const content = document.querySelector("main")?.innerText || document.body.innerText;
    const utterance = new SpeechSynthesisUtterance(content);
    utterance.lang = activeLang === "en" ? "en-US" : "es-ES";
    utterance.onend = () => setIsReading(false);
    utterance.onerror = () => setIsReading(false);
    synth.cancel();
    synth.speak(utterance);
    setIsReading(true);
  };

  const handleZoom = () => {
    if (onZoomText) return onZoomText();
    return setFontScale((value) => FONT_SCALES[(FONT_SCALES.indexOf(value) + 1) % FONT_SCALES.length]);
  };
  const handleTheme = () => (onToggleDarkMode || toggleTheme)();
  const handleLanguage = () => onToggleLanguage
    ? onToggleLanguage()
    : i18n.changeLanguage(activeLang === "es" ? "en" : "es");

  const panelStyle = {
    width: "min(280px, calc(100vw - 40px))",
    padding: "20px", border: "1px solid #e2e8f0", borderRadius: "12px",
    backgroundColor: "#ffffff", color: "#1e293b", boxShadow: "0 16px 36px rgba(15, 23, 42, .20)", fontFamily: "inherit"
  };
  const secondaryButtonStyle = {
    width: "100%", padding: "10px 12px", border: "1px solid #dbe3ee", borderRadius: "8px",
    backgroundColor: "#f8fafc", color: "#1e293b", cursor: "pointer", fontWeight: 700, textAlign: "left"
  };

  return (
    <div className="accessibility-widget-root fixed bottom-6 left-6 z-50">
      <ColorVisionFilters />
      {isOpen && (
        <aside ref={panelRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="accessibility-widget-title" className="absolute bottom-16 left-0 origin-bottom-left" style={panelStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
            <h2 id="accessibility-widget-title" style={{ margin: 0, fontSize: "16px", fontWeight: 800 }}>{t("accessibility.title")}</h2>
            <button type="button" onClick={() => setIsOpen(false)} aria-label={t("accessibility.close")} style={{ border: 0, background: "transparent", color: "#475569", cursor: "pointer", fontSize: "22px", lineHeight: 1 }}>×</button>
          </div>
          <div style={{ borderTop: "1px solid #e2e8f0", margin: "14px 0" }} />
          <div style={{ display: "grid", gap: "10px" }}>
            <label htmlFor="color-vision-filter" style={{ color: "#334155", fontSize: "13px", fontWeight: 700 }}>{t("accessibility.colorVision")}</label>
            <select id="color-vision-filter" value={colorVisionFilter} onChange={(event) => setColorVisionFilter(event.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", color: "#1e293b" }}>
              <option value="">{t("accessibility.colorDefault")}</option>
              <option value="protanopia">{t("accessibility.protanopia")}</option>
              <option value="deuteranopia">{t("accessibility.deuteranopia")}</option>
              <option value="tritanopia">{t("accessibility.tritanopia")}</option>
            </select>
            <button type="button" onClick={handleToggleRead} style={{ ...secondaryButtonStyle, border: 0, backgroundColor: isReading ? "#dc2626" : "#2563eb", color: "#fff", textAlign: "center" }}>
              {isReading ? t("accessibility.stopReading") : t("accessibility.listen")}
            </button>
            <button type="button" onClick={handleZoom} style={secondaryButtonStyle}>
              {onZoomText ? t("accessibility.textSizeExternal") : t("accessibility.textSize", { percent: Math.round(fontScale * 100) })}
            </button>
            <button type="button" onClick={handleTheme} style={secondaryButtonStyle}>
              {theme === "light" ? t("accessibility.darkMode") : t("accessibility.lightMode")}
            </button>
            <button type="button" onClick={handleLanguage} style={secondaryButtonStyle}>
              {t("accessibility.language", { lang: activeLang.toUpperCase() })}
            </button>
          </div>
        </aside>
      )}
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? t("accessibility.close") : t("accessibility.open")}
        aria-expanded={isOpen}
        aria-controls="accessibility-widget-title"
        style={{ width: "60px", height: "60px", border: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0066cc", color: "#fff", cursor: "pointer", boxShadow: "0 4px 12px rgba(0, 0, 0, .30)" }}
      >
        <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="5" r="1" /><path d="m9 20 3-6 3 6" /><path d="m6 8 6 2 6-2" /><path d="M12 10v4" />
        </svg>
      </button>
    </div>
  );
}
