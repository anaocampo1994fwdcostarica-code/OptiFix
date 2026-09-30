import React, { useMemo, useState } from "react";
import { useWorkshop } from "../context/WorkshopContext.jsx";
import ClienteModal from "../components/modals/ClienteModal.jsx";
import Icono from "../components/icons.jsx";

const PAGE_SIZE = 5;
const AVATAR_PALETTE = ["bg-optifix-600", "bg-emerald-600", "bg-blue-600", "bg-slate-600", "bg-indigo-600", "bg-amber-600"];

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

export default function ClientesView() {
  const { clientes, ordenes, equipos, addCliente, updateCliente, deleteCliente } = useWorkshop();
  const [searchTerm, setSearchTerm] = useState("");
  const [tab, setTab] = useState("TODOS");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clienteToEdit, setClienteToEdit] = useState(null);

  // ── Métricas del encabezado ────────────
  const ordenesEnTaller = ordenes.filter(o => o.estado_actual !== "ENTREGADO").length;
  const clientesRegistrados = clientes.length;
  const equiposEnCustodia = equipos.length;
  const clientesConTelefono = clientes.filter(c => c.telefono).length;

  const filteredClientes = useMemo(() => {
    return clientes.filter(c => {
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
  }, [clientes, ordenes, searchTerm, tab]);

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

  const handleDeleteCliente = async (cliente) => {
    if (!window.confirm(`¿Eliminar a ${cliente.nombre}? Esta acción no se puede deshacer.`)) return;
    try { await deleteCliente(cliente.id); } catch (error) { window.alert(error.message || "No se pudo eliminar el cliente."); }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Directorio de Clientes</h1>
          <p className="text-sm text-slate-500 mt-1">
            Administra los datos de contacto, expedientes y equipos asociados.
          </p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 bg-optifix-600 hover:bg-optifix-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-optifix-500/20"
        >
          <Icono nombre="plus" size={18} />
          Nuevo Cliente
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 flex flex-col justify-between">
          <div className="text-sm font-medium text-slate-500 mb-2">Clientes Registrados</div>
          <div className="text-3xl font-bold text-slate-900">{clientesRegistrados}</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 flex flex-col justify-between">
          <div className="text-sm font-medium text-slate-500 mb-2">Órdenes en Taller</div>
          <div className="text-3xl font-bold text-optifix-600">{ordenesEnTaller}</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 flex flex-col justify-between">
          <div className="text-sm font-medium text-slate-500 mb-2">Equipos en Custodia</div>
          <div className="text-3xl font-bold text-slate-700">{equiposEnCustodia}</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 flex flex-col justify-between">
          <div className="text-sm font-medium text-slate-500 mb-2">Canal WhatsApp</div>
          <div className="text-3xl font-bold text-emerald-600">{clientesConTelefono}</div>
        </div>
      </div>

      {/* Controles y Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden flex flex-col erp-directory-card">
        {/* Filtros */}
        <div className="border-b border-slate-100 p-4 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50 erp-directory-toolbar">
          <div className="flex gap-2 p-1 bg-white rounded-lg w-fit ring-1 ring-slate-200/50 erp-directory-tabs">
            {[
              { id: "TODOS", label: "Todos" },
              { id: "CON_ORDENES", label: "Con Órdenes Activas" },
              { id: "HISTORICOS", label: "Históricos" }
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
              placeholder="Buscar por nombre, cédula..."
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
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Identificación</th>
                <th className="px-6 py-4">Contacto</th>
                <th className="px-6 py-4">Equipos</th>
                <th className="px-6 py-4">Órdenes Activas</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedClientes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Icono nombre="users" size={32} className="text-slate-300 mb-3" />
                      <p>No se encontraron clientes con esos filtros.</p>
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
                            <div className="text-xs text-slate-500 truncate max-w-[150px]">{c.direccion || "Sin dirección"}</div>
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
                          {clientEquipos.length} equipos
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${activeOrdersCount > 0 ? 'bg-optifix-50 text-optifix-700 ring-1 ring-optifix-600/20' : 'bg-slate-50 text-slate-500'}`}>
                          {activeOrdersCount} activas
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a
                            href={c.telefono ? `https://wa.me/${c.telefono.replace(/\D/g, "")}` : "#"}
                            target={c.telefono ? "_blank" : "_self"}
                            rel="noreferrer"
                            className={`p-2 rounded-lg transition-colors ${c.telefono ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-300 cursor-not-allowed'}`}
                            title="WhatsApp"
                            onClick={(e) => { if (!c.telefono) e.preventDefault(); }}
                          >
                            <Icono nombre="whatsapp" size={18} />
                          </a>
                          <button
                            className="p-2 text-slate-400 hover:text-optifix-600 hover:bg-optifix-50 rounded-lg transition-colors"
                            onClick={() => handleOpenEdit(c)}
                            title="Editar cliente"
                          >
                            <Icono nombre="pencil" size={18} />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" onClick={() => handleDeleteCliente(c)} title="Eliminar cliente" aria-label={`Eliminar cliente ${c.nombre}`}>
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
              Página <span className="font-medium text-slate-900">{page}</span> de <span className="font-medium text-slate-900">{totalPages}</span>
            </span>
            <div className="flex gap-2">
              <button 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>
              <button 
                disabled={page === totalPages} 
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente
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
    </div>
  );
}
