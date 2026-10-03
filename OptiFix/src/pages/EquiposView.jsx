import React, { useEffect, useMemo, useState } from "react";
import { useWorkshop } from "../context/WorkshopContext.jsx";
import EquipoModal from "../components/modals/EquipoModal.jsx";
import Icono from "../components/icons.jsx";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const PAGE_SIZE = 6;

function categoriaDe(tipo = "") {
  const t = tipo.toUpperCase();
  if (t.includes("PANTALLA") || t.includes("VIDEOC") || t.includes("TV")) return "Pantallas";
  if (t.includes("AUDIO") || t.includes("SONIDO") || t.includes("PARLANTE") || t.includes("EQUIPO")) return "Audio";
  if (t.includes("MICROONDA") || t.includes("ELECTRODOM") || t.includes("LAVADORA") || t.includes("REFRI")) return "Electrodomésticos";
  return "Otros";
}

function condicionEstilo(estado = "") {
  const e = estado.toUpperCase();
  if (e.includes("OXIDADO") || e.includes("ROTO") || e.includes("QUEBRADO")) {
    return "bg-red-50 text-red-700 ring-red-600/20";
  }
  if (e.includes("BUEN ESTADO") || e.includes("EXCELENTE") || e.includes("INTACT")) {
    return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
  }
  if (e.includes("REGULAR")) {
    return "bg-slate-100 text-slate-700 ring-slate-500/20";
  }
  // Sucio, rayas, manchas, etc. → advertencia leve
  return "bg-amber-50 text-amber-700 ring-amber-600/20";
}

export default function EquiposView({ onOpenNewOrderModal }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { equipos, clientes, ordenes, addEquipo, updateEquipo, deleteEquipo } = useWorkshop();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("TODOS");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [equipoToEdit, setEquipoToEdit] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // Generate tab counts
  const counts = {
    TODOS: equipos.length,
    PANTALLAS: 0,
    AUDIO: 0,
    ELECTRODOMESTICOS: 0,
    OTROS: 0
  };

  equipos.forEach(eq => {
    const cat = categoriaDe(eq.tipo).toUpperCase();
    if (cat === "PANTALLAS") counts.PANTALLAS++;
    else if (cat === "AUDIO") counts.AUDIO++;
    else if (cat === "ELECTRODOMÉSTICOS" || cat === "ELECTRODOMESTICOS") counts.ELECTRODOMESTICOS++;
    else counts.OTROS++;
  });

  const filteredEquipos = useMemo(() => {
    return equipos.filter((e) => {
      const matchSearch =
        e.serie.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.modelo && e.modelo.toLowerCase().includes(searchTerm.toLowerCase()));
      
      let matchTab = true;
      if (activeTab !== "TODOS") {
        const cat = categoriaDe(e.tipo).toUpperCase();
        if (activeTab === "ELECTRODOMESTICOS" && (cat === "ELECTRODOMÉSTICOS" || cat === "ELECTRODOMESTICOS")) {
            matchTab = true;
        } else {
            matchTab = cat === activeTab;
        }
      }

      return matchSearch && matchTab;
    });
  }, [equipos, searchTerm, activeTab]);

  const totalPages = Math.ceil(filteredEquipos.length / PAGE_SIZE) || 1;
  const paginatedEquipos = filteredEquipos.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleExport = () => {
    const headers = ["Tipo de Equipo", "Marca", "Modelo", "Número de Serie", "Nombre del Cliente", "Contacto del Cliente"];
    const escapeCsvValue = (value) => {
      let safeValue = String(value ?? "").replace(/\r?\n|\r/g, " ").trim();
      // Evita que Excel interprete datos importados como fórmulas.
      if (/^[=+\-@]/.test(safeValue)) safeValue = `'${safeValue}`;
      return `"${safeValue.replace(/"/g, '""')}"`;
    };
    const rows = filteredEquipos.map((equipo) => {
      const cliente = clientes.find((item) => item.id === equipo.cliente_id) || {};
      const contacto = [cliente.telefono, cliente.correo || cliente.email].filter(Boolean).join(" / ");
      return [equipo.tipo, equipo.marca, equipo.modelo, equipo.serie, cliente.nombre, contacto];
    });
    // Excel con configuración regional en español usa punto y coma como separador.
    const csv = [headers, ...rows].map((row) => row.map(escapeCsvValue).join(";")).join("\r\n");
    const now = new Date();
    const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = downloadUrl;
    link.download = `OptiFix_Inventario_Equipos_${date}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(downloadUrl);
    setToast(t("equipment.exportSuccess"));
  };

  const handleOpenEdit = (e) => {
    setEquipoToEdit(e);
    setIsModalOpen(true);
  };

  const handleSaveEquipo = async (formData) => {
    if (equipoToEdit) {
      updateEquipo(equipoToEdit.id, formData);
    } else {
      addEquipo(formData);
    }
  };

  const handleDeleteEquipo = async (equipo) => {
    if (!window.confirm(t("equipment.deleteConfirm", { name: `${equipo.marca} ${equipo.modelo}` }))) return;
    try { await deleteEquipo(equipo.id); } catch (error) { window.alert(error.message || t("equipment.deleteError")); }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t("equipment.title")}</h1>
          <p className="text-sm text-slate-500 mt-1">{t("equipment.subtitle")}</p>
        </div>
        <div className="flex gap-3">
          <button 
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl font-medium transition-colors border border-slate-200 shadow-sm"
          >
            <Icono nombre="download" size={18} />
            {t("common.export")}
          </button>
          <button 
            onClick={() => { setEquipoToEdit(null); setIsModalOpen(true); }}
            className="inline-flex items-center gap-2 bg-optifix-600 hover:bg-optifix-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-optifix-500/20"
          >
            <Icono nombre="plus" size={18} />
            {t("equipment.register")}
          </button>
        </div>
      </div>

      {/* Controles y Tabla */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col erp-directory-card">
        {/* Filtros */}
        <div className="border-b border-slate-100 p-4 flex flex-col lg:flex-row gap-4 justify-between bg-slate-50/50 erp-directory-toolbar">
          <div
            className="flex flex-wrap items-center gap-2 erp-directory-tabs"
            role="tablist"
            aria-label={t("equipment.title")}
          >
            {[
              { id: "TODOS", label: `${t("common.all")} (${counts.TODOS})` },
              { id: "PANTALLAS", label: `${t("equipment.screens")} (${counts.PANTALLAS})` },
              { id: "AUDIO", label: `${t("equipment.audio")} (${counts.AUDIO})` },
              { id: "ELECTRODOMESTICOS", label: `${t("equipment.appliances")} (${counts.ELECTRODOMESTICOS})` },
              { id: "OTROS", label: `${t("equipment.others")} (${counts.OTROS})` }
            ].map(tab => (
              <button 
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => { setActiveTab(tab.id); setPage(1); }}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30 focus-visible:ring-offset-2 ${
                  activeTab === tab.id
                    ? "bg-blue-500 text-white"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Icono nombre="search" size={16} />
            </span>
            <input
              type="text"
              placeholder={t("equipment.search")}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="pl-9 pr-4 py-2 rounded-xl border-slate-200 text-sm focus:ring-optifix-500 focus:border-optifix-500 w-full sm:w-72 shadow-sm"
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="equipment-history-table w-full min-w-[920px] table-fixed text-left text-sm text-slate-600 erp-directory-table">
            <colgroup>
              <col className="w-[14%]" />
              <col className="w-[14%]" />
              <col className="w-[16%]" />
              <col className="w-[16%]" />
              <col className="w-[23%]" />
              <col className="w-[17%]" />
            </colgroup>
            <thead className="bg-slate-50/80 dark:bg-slate-800/70">
              <tr>
                <th className="px-5 py-3 text-left uppercase text-xs font-semibold text-slate-500 dark:text-slate-400">{t("common.equipment")}</th>
                <th className="px-5 py-3 text-left uppercase text-xs font-semibold text-slate-500 dark:text-slate-400">{t("equipment.brand")}</th>
                <th className="px-5 py-3 text-left uppercase text-xs font-semibold text-slate-500 dark:text-slate-400">{t("equipment.modelField")}</th>
                <th className="px-5 py-3 text-left uppercase text-xs font-semibold text-slate-500 dark:text-slate-400">{t("equipment.serial")}</th>
                <th className="px-5 py-3 text-left uppercase text-xs font-semibold text-slate-500 dark:text-slate-400">{t("common.client")}</th>
                <th className="px-5 py-3 text-right uppercase text-xs font-semibold text-slate-500 dark:text-slate-400">{t("equipment.orders")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {paginatedEquipos.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <Icono nombre="laptop" size={32} className="text-slate-300 mb-3" />
                      <p>{t("equipment.empty")}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedEquipos.map((e) => {
                  const cli = clientes.find((c) => c.id === e.cliente_id) || {};
                  const eqOrdenes = ordenes.filter((o) => o.equipo_id === e.id);
                  const lastOrder = eqOrdenes.length > 0 ? eqOrdenes[eqOrdenes.length - 1] : null;

                  return (
                    <tr key={e.id} className="equipment-history-row border-b border-slate-100 hover:bg-slate-50/80 transition-colors group erp-directory-row">
                      <td className="px-5 py-4">
                        <span className="inline-flex max-w-full items-center truncate rounded-md bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                          {e.tipo || t("equipment.generic")}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="block truncate font-semibold text-slate-900 dark:text-white">{e.marca || "—"}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="block truncate text-slate-500 dark:text-slate-400">{e.modelo || t("equipment.noModel")}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                          {e.serie}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-slate-900 dark:text-white">{cli.nombre || "—"}</div>
                          <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{cli.telefono || "—"}</div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="rounded-md bg-blue-100 p-2 text-blue-700 transition-colors hover:bg-blue-200 opacity-0 group-hover:opacity-100"
                            onClick={() => handleOpenEdit(e)}
                            title={t("equipment.edit")}
                            aria-label={`${t("equipment.edit")}: ${e.marca} ${e.modelo || ""}`}
                          >
                            <Icono nombre="pencil" size={18} />
                          </button>
                          <button className="rounded-md bg-blue-100 p-2 text-blue-700 transition-colors hover:bg-blue-200 opacity-0 group-hover:opacity-100" onClick={() => handleDeleteEquipo(e)} title={t("equipment.delete")} aria-label={`${t("equipment.delete")} ${e.marca} ${e.modelo}`}>
                            <Icono nombre="trash" size={18} />
                          </button>
                          {lastOrder ? (
                            <button
                              onClick={() => navigate(`/ordenes/${lastOrder.numero}`)}
                              className="rounded-md bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-200"
                            >
                              {t("equipment.viewOrder", { number: lastOrder.numero })}
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 px-3">{t("equipment.noOrders")}</span>
                          )}
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

      <EquipoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEquipo}
        equipoToEdit={equipoToEdit}
      />
      {toast && (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="fixed bottom-5 right-5 z-[100] rounded-xl border-2 border-emerald-900 bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-lg"
        >
          <span aria-hidden="true" className="mr-2">✓</span>
          {toast}
        </div>
      )}
    </div>
  );
}
