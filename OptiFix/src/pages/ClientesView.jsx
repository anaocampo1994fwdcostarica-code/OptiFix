import React, { useEffect, useMemo, useState } from "react";
import { useWorkshop } from "../context/WorkshopContext.jsx";
import ClienteModal from "../components/modals/ClienteModal.jsx";
import Icono from "../components/icons.jsx";
import { useTranslation } from "react-i18next";
import { useFocusTrap } from "../hooks/useFocusTrap.js";

const PAGE_SIZE = 5;
const AVATAR_PALETTE = ["bg-optifix-600", "bg-emerald-600", "bg-blue-600", "bg-slate-600", "bg-indigo-600", "bg-amber-600"];
const CLIENTES_PARA_ELIMINAR = [
  { id: "cli-demo-1", identificacion: "119990101", nombre: "Andrea Solano", email: "andrea.solano@correo.cr", telefono: "87001234", direccion: "San Ramón, Alajuela" },
  { id: "cli-demo-2", identificacion: "208880202", nombre: "Diego Vargas", email: "diego.vargas@correo.cr", telefono: "88114567", direccion: "Tres Ríos, Cartago" },
  { id: "cli-demo-3", identificacion: "311770303", nombre: "María José Araya", email: "maria.araya@correo.cr", telefono: "89907890", direccion: "Belén, Heredia" },
];

function iniciales(nombre = "") {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "??";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[1][0]).toUpperCase();
}

function colorAvatar(nombre = "") {
  let hash = 0;
  for (let i = 0; i < nombre.length; i++) hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

function normalizeCostaRicaPhone(phone = "") {
  const digits = String(phone).replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("506") && digits.length >= 11) return digits;
  return digits.length === 8 ? `506${digits}` : digits;
}

export default function ClientesView() {
  const { t } = useTranslation();
  const { clientes, ordenes, equipos, addCliente, updateCliente, deleteCliente, updateOrden } = useWorkshop();
  const [searchTerm, setSearchTerm] = useState("");
  const [tab, setTab] = useState("TODOS");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clienteToEdit, setClienteToEdit] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [toast, setToast] = useState("");
  const [deletedDemoIds, setDeletedDemoIds] = useState([]);
  const [whatsappClient, setWhatsappClient] = useState(null);
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // ── Métricas del encabezado ────────────
  const clientesDisponibles = useMemo(() => {
    const ids = new Set(clientes.map((cliente) => cliente.id));
    return [...CLIENTES_PARA_ELIMINAR.filter((cliente) => !ids.has(cliente.id) && !deletedDemoIds.includes(cliente.id)), ...clientes];
  }, [clientes, deletedDemoIds]);
  const ordenesEnTaller = ordenes.filter(o => o.estado_actual !== "ENTREGADO").length;
  const clientesRegistrados = clientesDisponibles.length;
  const equiposEnCustodia = equipos.length;
  const clientesConTelefono = clientesDisponibles.filter(c => c.telefono).length;

  const filteredClientes = useMemo(() => {
    return clientesDisponibles.filter(c => {
      const matchSearch = c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.identificacion.includes(searchTerm) ||
                          (c.telefono && c.telefono.includes(searchTerm)) ||
                          (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const clientOrdenes = ordenes.filter(o => o.cliente_id === c.id);
      let matchTab = true;
      if (tab === "CON_ORDENES") matchTab = clientOrdenes.some(o => o.estado_actual !== "ENTREGADO");
      if (tab === "HISTORICOS") matchTab = clientOrdenes.every(o => o.estado_actual === "ENTREGADO") && clientOrdenes.length > 0;

      return matchSearch && matchTab;
    });
  }, [clientesDisponibles, ordenes, searchTerm, tab]);

  const totalPages = Math.ceil(filteredClientes.length / PAGE_SIZE) || 1;
  const paginatedClientes = filteredClientes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleOpenCreate = () => {
    setClienteToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setClienteToEdit(c);
    setIsModalOpen(true);
  };

  const handleSaveCliente = async (formData) => {
    if (clienteToEdit) {
      updateCliente(clienteToEdit.id, formData);
    } else {
      addCliente(formData);
    }
  };

  const activeOrdersFor = (clienteId) => ordenes.filter((order) => order.cliente_id === clienteId && order.estado_actual !== "ENTREGADO").length;
  const handleDeleteCliente = (cliente) => setDeleteDialog({ cliente, blocked: activeOrdersFor(cliente.id) > 0 });
  const confirmDeleteCliente = async () => {
    if (!deleteDialog || deleteDialog.blocked) return;
    if (activeOrdersFor(deleteDialog.cliente.id) > 0) {
      setDeleteDialog({ ...deleteDialog, blocked: true });
      return;
    }
    try {
      await deleteCliente(deleteDialog.cliente.id);
      if (CLIENTES_PARA_ELIMINAR.some((cliente) => cliente.id === deleteDialog.cliente.id)) setDeletedDemoIds((ids) => [...ids, deleteDialog.cliente.id]);
      setDeleteDialog(null);
      setToast(t("clients.deleted"));
    } catch (error) {
      setDeleteDialog(null);
      setToast(error.message || t("clients.deleteError"));
    }
  };

  const prepareWhatsapp = async ({ order, text, mode }) => {
    if (!whatsappClient) return;
    const phone = normalizeCostaRicaPhone(whatsappClient.telefono);
    if (!phone) return;
    const message = text.trim();
    if (order) {
      const timeline = [...(order.linea_tiempo || []), { fecha: new Date().toLocaleString("es-CR"), estado: order.estado_actual, realizado_por: "Taller Servicios Electrónicos CR", detalle: mode === "pdf" ? "Documento preparado para compartir por WhatsApp." : "Información preparada para compartir por WhatsApp." }];
      try { await updateOrden(order.id, { linea_tiempo: timeline }); } catch { /* El enlace funciona incluso sin conexión local. */ }
    }
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    setWhatsappClient(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t("clients.title")}</h1>
          <p className="text-sm text-slate-500 mt-1">{t("clients.subtitle")}</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 bg-optifix-600 hover:bg-optifix-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-optifix-500/20"
        >
          <Icono nombre="plus" size={18} />
          {t("clients.new")}
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 flex flex-col justify-between">
          <div className="text-sm font-medium text-slate-500 mb-2">{t("clients.registered")}</div>
          <div className="text-3xl font-bold text-slate-900">{clientesRegistrados}</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 flex flex-col justify-between">
          <div className="text-sm font-medium text-slate-500 mb-2">{t("clients.ordersWorkshop")}</div>
          <div className="text-3xl font-bold text-optifix-600">{ordenesEnTaller}</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 flex flex-col justify-between">
          <div className="text-sm font-medium text-slate-500 mb-2">{t("clients.inCustody")}</div>
          <div className="text-3xl font-bold text-slate-700">{equiposEnCustodia}</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 flex flex-col justify-between">
          <div className="text-sm font-medium text-slate-500 mb-2">{t("clients.whatsapp")}</div>
          <div className="text-3xl font-bold text-emerald-600">{clientesConTelefono}</div>
        </div>
      </div>

      {/* Controles y Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden flex flex-col erp-directory-card">
        {/* Filtros */}
        <div className="border-b border-slate-100 p-4 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50 erp-directory-toolbar">
          <div className="flex gap-2 p-1 bg-white rounded-lg w-fit ring-1 ring-slate-200/50 erp-directory-tabs">
            {[
              { id: "TODOS", label: t("common.all") },
              { id: "CON_ORDENES", label: t("clients.activeTab") },
              { id: "HISTORICOS", label: t("clients.historical") }
            ].map(t => (
              <button 
                key={t.id}
                onClick={() => { setTab(t.id); setPage(1); }}
                className={`
                  px-4 py-2 rounded-md text-sm font-medium transition-all
                  ${tab === t.id 
                    ? 'bg-slate-100 text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}
                `}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Icono nombre="search" size={16} />
            </span>
            <input
              type="text"
              placeholder={t("clients.search")}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="pl-9 pr-4 py-2 rounded-xl border-slate-200 text-sm focus:ring-optifix-500 focus:border-optifix-500 w-full sm:w-72 shadow-sm"
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 erp-directory-table">
            <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">{t("common.client")}</th>
                <th className="px-6 py-4">{t("clients.identification")}</th>
                <th className="px-6 py-4">{t("clients.contact")}</th>
                <th className="px-6 py-4">{t("shell.equipment")}</th>
                <th className="px-6 py-4">{t("clients.activeOrders")}</th>
                <th className="px-6 py-4 text-right">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedClientes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Icono nombre="users" size={32} className="text-slate-300 mb-3" />
                      <p>{t("clients.empty")}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedClientes.map((c) => {
                  const clientEquipos = equipos.filter((eq) => eq.cliente_id === c.id);
                  const clientOrdenes = ordenes.filter((o) => o.cliente_id === c.id);
                  const activeOrdersCount = clientOrdenes.filter(o => o.estado_actual !== "ENTREGADO").length;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group erp-directory-row">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${colorAvatar(c.nombre)}`}>
                            {iniciales(c.nombre)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{c.nombre}</div>
                            <div className="text-xs text-slate-500 truncate max-w-[150px]">{c.direccion || t("clients.noAddress")}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {c.identificacion}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-sm text-slate-700">
                            <Icono nombre="phone" size={14} className="text-slate-400" />
                            {c.telefono || "N/A"}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Icono nombre="mail" size={14} className="text-slate-400" />
                            {c.email || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                          {t("clients.equipmentCount", { count: clientEquipos.length })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${activeOrdersCount > 0 ? 'bg-optifix-50 text-optifix-700 ring-1 ring-optifix-600/20' : 'bg-slate-50 text-slate-500'}`}>
                          {t("clients.activeCount", { count: activeOrdersCount })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            className={`p-2 rounded-lg transition-colors ${c.telefono ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-300 cursor-not-allowed'}`}
                            title={c.telefono ? "Enviar por WhatsApp" : "Este cliente no tiene un número de WhatsApp registrado."}
                            aria-label={`WhatsApp: ${c.nombre}`}
                            onClick={() => c.telefono && setWhatsappClient(c)}
                          >
                            <Icono nombre="whatsapp" size={18} />
                          </button>
                          <button
                            className="p-2 text-slate-400 hover:text-optifix-600 hover:bg-optifix-50 rounded-lg transition-colors"
                            onClick={() => handleOpenEdit(c)}
                            title={t("clients.edit")}
                            aria-label={`${t("clients.edit")}: ${c.nombre}`}
                          >
                            <Icono nombre="pencil" size={18} />
                          </button>
                          <button disabled={activeOrdersCount > 0} className={`p-2 rounded-lg transition-colors ${activeOrdersCount > 0 ? "text-red-400 opacity-50 cursor-not-allowed" : "text-slate-400 hover:text-red-600 hover:bg-red-50"}`} onClick={() => handleDeleteCliente(c)} title={activeOrdersCount > 0 ? t("clients.deleteBlockedHint") : t("clients.delete")} aria-label={`${t("clients.delete")} ${c.nombre}`}>
                            <Icono nombre="trash" size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginación */}
        {totalPages > 1 && (
          <div className="border-t border-slate-100 p-4 flex items-center justify-between bg-slate-50/50 erp-directory-pagination">
            <span className="text-sm text-slate-500">
              {t("common.pageOf", { page, total: totalPages })}
            </span>
            <div className="flex gap-2">
              <button 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t("common.previous")}
              </button>
              <button 
                disabled={page === totalPages} 
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t("common.next")}
              </button>
            </div>
          </div>
        )}
      </div>

      <ClienteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCliente}
        clienteToEdit={clienteToEdit}
      />
      {deleteDialog && <DeleteClienteDialog dialog={deleteDialog} onClose={() => setDeleteDialog(null)} onConfirm={confirmDeleteCliente} />}
      {whatsappClient && <WhatsappDialog client={whatsappClient} orders={ordenes.filter((order) => order.cliente_id === whatsappClient.id)} equipos={equipos} onClose={() => setWhatsappClient(null)} onPrepare={prepareWhatsapp} />}
      {toast && <div role="status" aria-live="polite" aria-atomic="true" className={`fixed z-[100] right-5 bottom-5 rounded-xl border-2 px-4 py-3 text-sm font-semibold text-white shadow-lg ${toast === t("clients.deleted") ? "border-emerald-900 bg-emerald-700" : "border-red-950 bg-red-700"}`}><span aria-hidden="true" className="mr-2">{toast === t("clients.deleted") ? "✓" : "!"}</span>{toast}</div>}
    </div>
  );
}

function WhatsappDialog({ client, orders, equipos, onClose, onPrepare }) {
  const dialogRef = useFocusTrap(true, onClose);
  const [mode, setMode] = useState("order");
  const [orderId, setOrderId] = useState(orders[0]?.id || "");
  const [custom, setCustom] = useState("");
  const selected = orders.find((order) => order.id === orderId);
  const equipment = equipos.find((item) => item.id === selected?.equipo_id);
  const phone = normalizeCostaRicaPhone(client.telefono);
  const info = selected ? `Hola ${client.nombre} 👋\n\nLe compartimos información de su orden de servicio técnico.\n\nOrden: #${selected.numero}\nEquipo: ${equipment?.marca || equipment?.tipo || "Sin registrar"}\nModelo: ${equipment?.modelo || "Sin modelo"}\nSerie: ${equipment?.serie || "Sin serie"}\nEstado actual: ${selected.estado_actual}\n\nTaller Servicios Electrónicos CR\n\nEste mensaje fue generado desde OptiFix.` : "";
  const message = mode === "custom" ? custom : mode === "pdf" ? `${info}\n\nSe preparó el PDF de la orden. Adjuntalo manualmente desde WhatsApp.` : info;
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" onMouseDown={onClose}><section ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="whatsapp-title" onMouseDown={(event) => event.stopPropagation()} className="whatsapp-dialog w-full max-w-lg rounded-2xl p-6 shadow-2xl"><header className="flex items-start justify-between gap-4"><div><h2 id="whatsapp-title" className="text-lg font-bold">Enviar por WhatsApp</h2><p className="mt-1 text-sm">{client.nombre} · +{phone}</p></div><button type="button" onClick={onClose} aria-label="Cerrar">×</button></header><fieldset className="mt-5 grid gap-2"><legend className="text-sm font-semibold">¿Qué deseas enviar?</legend>{[["order","Información de una orden"],["pdf","Documento/PDF de una orden"],["custom","Mensaje personalizado"]].map(([value,label]) => <label key={value} className="flex items-center gap-2 text-sm"><input type="radio" checked={mode === value} onChange={() => setMode(value)} />{label}</label>)}</fieldset>{mode !== "custom" && <label className="mt-4 grid gap-1 text-sm font-semibold">Orden asociada<select value={orderId} onChange={(event) => setOrderId(event.target.value)} disabled={!orders.length}>{orders.length ? orders.map((order) => <option key={order.id} value={order.id}>Orden #{order.numero} · {order.estado_actual}</option>) : <option value="">No hay órdenes asociadas</option>}</select></label>}{mode === "custom" && <label className="mt-4 grid gap-1 text-sm font-semibold">Mensaje<textarea rows="4" value={custom} onChange={(event) => setCustom(event.target.value)} placeholder="Escriba el mensaje..." /></label>}{mode === "pdf" && <p className="mt-3 text-xs">WhatsApp Web no adjunta archivos locales automáticamente. Se abrirá el mensaje y podrás adjuntar el PDF descargado.</p>}<footer className="mt-6 flex justify-end gap-3"><button type="button" onClick={onClose}>Cancelar</button><button type="button" disabled={!phone || (mode !== "custom" && !selected) || (mode === "custom" && !custom.trim())} onClick={() => onPrepare({ order: selected, text: message, mode })}>Abrir WhatsApp</button></footer></section></div>;
}

function DeleteClienteDialog({ dialog, onClose, onConfirm }) {
  const { t } = useTranslation();
  const dialogRef = useFocusTrap(true, onClose);
  const { cliente, blocked } = dialog;
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" onMouseDown={onClose}>
    <section ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="delete-client-title" onMouseDown={(event) => event.stopPropagation()} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
      <h2 id="delete-client-title" className={`text-lg font-bold ${blocked ? "text-red-700" : "text-slate-900"}`}>{blocked ? t("clients.blockedTitle") : t("clients.deleteTitle")}</h2>
      <p className={`mt-3 text-sm leading-6 ${blocked ? "text-red-600" : "text-slate-600"}`}>{blocked ? t("clients.blockedBody") : t("clients.deleteBody")}</p>
      <div className="mt-6 flex justify-end gap-3">{blocked ? <button type="button" onClick={onClose} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">{t("clients.understood")}</button> : <><button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">{t("common.cancel")}</button><button type="button" onClick={onConfirm} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">{t("clients.deleteAction")}</button></>}</div>
    </section>
  </div>;
}
