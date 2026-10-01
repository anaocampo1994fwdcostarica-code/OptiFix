import React from "react";
import OptiBot from "../components/ai/OptiBot.jsx";
import { useAuth } from "../hooks/useAuth.js";

export default function AsistenteIAView() {
  const { user } = useAuth();
  return <main className="page-container"><div className="mb-6"><p className="text-sm text-slate-500 dark:text-slate-400">Herramientas / Asistente IA</p><h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">OptiBot IA</h1><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Asistente administrativo para la operación diaria de OptiFix.</p></div><OptiBot usuario={user} /></main>;
}
