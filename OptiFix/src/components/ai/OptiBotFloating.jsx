import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import OptiBot from "./OptiBot.jsx";

export default function OptiBotFloating() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-[90] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <div className={`${isOpen ? "block" : "hidden"} w-[calc(100vw-2.5rem)] max-w-md sm:w-[430px]`}>
        <OptiBot usuario={user} className="h-[min(70vh,560px)] max-w-none" />
      </div>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? "Cerrar OptiBot" : "Abrir OptiBot"}
        aria-expanded={isOpen}
        aria-controls="optibot-floating-panel"
        className="grid h-14 w-14 place-items-center rounded-full bg-sky-600 text-2xl shadow-lg shadow-sky-900/30 transition hover:scale-105 hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-300 dark:focus:ring-sky-900"
      >
        <span aria-hidden="true">🤖</span>
      </button>
    </div>
  );
}
