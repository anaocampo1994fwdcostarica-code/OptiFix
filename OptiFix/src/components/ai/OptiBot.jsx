import React, { useEffect, useRef, useState } from "react";
import { consultarOptiBot } from "../../services/optibotService.js";

const INITIAL_MESSAGES = [{ id: "welcome", author: "bot", text: "¡Hola! Soy OptiBot. Puedo ayudarte con órdenes, clientes, equipos, servicios y operación del taller." }];

export default function OptiBot({ usuario, className = "" }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView?.({ behavior: "smooth", block: "nearest" }); }, [messages, loading]);

  async function sendQuestion(event) {
    event?.preventDefault();
    const text = question.trim();
    if (!text || loading) return;
    setMessages((current) => [...current, { id: `user-${Date.now()}`, author: "user", text }]);
    setQuestion(""); setError(""); setLoading(true);
    try {
      const answer = await consultarOptiBot(text, usuario);
      setMessages((current) => [...current, { id: `bot-${Date.now()}`, author: "bot", text: answer }]);
    } catch (requestError) { setError(requestError.message || "No fue posible conectar con OptiBot."); }
    finally { setLoading(false); }
  }
  function handleKeyDown(event) { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendQuestion(); } }

  return <section id="optibot-floating-panel" className={`mx-auto flex h-[min(68vh,620px)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 ${className}`}>
    <header className="border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-700 dark:bg-slate-800"><div className="flex items-center gap-3"><span aria-hidden="true" className="grid h-10 w-10 place-items-center rounded-full bg-sky-100 text-lg dark:bg-sky-900/50">🤖</span><div><h2 className="font-semibold text-slate-900 dark:text-white">OptiBot · Asistente Administrativo</h2><p className="text-sm text-slate-500 dark:text-slate-400">Consultas basadas en información operativa autorizada del taller.</p></div></div></header>
    <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/70 p-4 dark:bg-slate-950/30" aria-live="polite" aria-label="Conversación con OptiBot">
      {messages.map((message) => <div key={message.id} className={`flex ${message.author === "user" ? "justify-end" : "justify-start"}`}><p className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${message.author === "user" ? "bg-sky-600 text-white" : "border border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"}`}>{message.text}</p></div>)}
      {loading && <div className="flex justify-start"><p className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">OptiBot está analizando la información…</p></div>}<div ref={endRef} />
    </div>
    <form onSubmit={sendQuestion} className="border-t border-slate-200 p-4 dark:border-slate-700">{error && <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}<label className="sr-only" htmlFor="optibot-question">Pregunta para OptiBot</label><div className="flex items-end gap-2"><textarea id="optibot-question" value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={handleKeyDown} rows="2" disabled={loading} placeholder="Ej.: ¿Cuántas órdenes están en reparación?" className="min-h-11 flex-1 resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:ring-sky-900" /><button type="submit" disabled={loading || !question.trim()} className="rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-slate-900">{loading ? "Enviando…" : "Enviar"}</button></div></form>
  </section>;
}
