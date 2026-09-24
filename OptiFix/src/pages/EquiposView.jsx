import React, { useMemo, useState } from "react";
import { useWorkshop } from "../context/WorkshopContext.jsx";
import EquipoModal from "../components/modals/EquipoModal.jsx";
import Icono from "../components/icons.jsx";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const { equipos, clientes, ordenes, addEquipo, updateEquipo } = useWorkshop();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("TODOS");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [equipoToEdit, setEquipoToEdit] = useState(null);

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

  const handleOpenEdit = (e) => {
    setEquipoToEdit(e);
    setIsModalOpen(true);
  };

  const handleSaveEquipo = (formData) => {
    if (equipoToEdit) {
      updateEquipo(equipoToEdit.id, formData);
    } else {
      addEquipo(formData);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestión de Equipos</h1>
          <p className="text-sm text-slate-500 mt-1">
            Directorio completo de aparatos registrados y su condición de ingreso.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl font-medium transition-colors border border-slate-200 shadow-sm"
          >
            <Icono nombre="download" size={18} />
            Exportar
          </button>
          <button 
            onClick={() => { setEquipoToEdit(null); setIsModalOpen(true); }}
            className="inline-flex items-center gap-2 bg-optifix-600 hover:bg-optifix-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-optifix-500/20"
          >
            <Icono nombre="plus" size={18} />
            Registrar Equipo
          </button>
        </div>
      </div>

      {/* Controles y Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden flex flex-col">
        {/* Filtros */}
        <div className="border-b border-slate-100 p-4 flex flex-col lg:flex-row gap-4 justify-between bg-slate-50/50">
          <div className="flex flex-wrap gap-2 p-1 bg-white rounded-lg w-fit ring-1 ring-slate-200/50">
            {[
              { id: "TODOS", label: `Todos (${counts.TODOS})` },
              { id: "PANTALLAS", label: `Pantallas (${counts.PANTALLAS})` },
              { id: "AUDIO", label: `Audio (${counts.AUDIO})` },
              { id: "ELECTRODOMESTICOS", label: `Electrodomésticos (${counts.ELECTRODOMESTICOS})` },
              { id: "OTROS", label: `Otros (${counts.OTROS})` }
            ].map(t => (
              <button 
                key={t.id}
                onClick={() => { setActiveTab(t.id); setPage(1); }}
                className={`
                  px-4 py-2 rounded-md text-sm font-medium transition-all
                  ${activeTab === t.id 
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
              placeholder="Buscar por serie, marca..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="pl-9 pr-4 py-2 rounded-xl border-slate-200 text-sm focus:ring-optifix-500 focus:border-optifix-500 w-full sm:w-72 shadow-sm"
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Equipo / Modelo</th>
                <th className="px-6 py-4">N° Serie</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Condición (Ingreso)</th>
                <th className="px-6 py-4 text-right">Órdenes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedEquipos.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Icono nombre="laptop" size={32} className="text-slate-300 mb-3" />
                      <p>No se encontraron equipos registrados con ese criterio.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedEquipos.map((e) => {
                  const cli = clientes.find((c) => c.id === e.cliente_id) || {};
                  const eqOrdenes = ordenes.filter((o) => o.equipo_id === e.id);
                  const lastOrder = eqOrdenes.length > 0 ? eqOrdenes[eqOrdenes.length - 1] : null;

                  return (
                    <tr key={e.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 uppercase tracking-wide">
                              {e.tipo || "Genérico"}
                            </span>
                            <span className="font-bold text-slate-900">{e.marca}</span>
                          </div>
                          <span className="text-xs text-slate-500">{e.modelo || "Sin modelo"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                          {e.serie}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 text-sm">{cli.nombre || "—"}</div>
                        <div className="text-xs text-slate-500">{cli.telefono}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ring-1 inset-ring ${condicionEstilo(e.estado_ingreso)}`}>
                          {e.estado_ingreso || "NO ESPECIFICADO"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="p-2 text-slate-400 hover:text-optifix-600 hover:bg-optifix-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            onClick={() => handleOpenEdit(e)}
                            title="Editar equipo"
                          >
                            <Icono nombre="pencil" size={18} />
                          </button>
                          {lastOrder ? (
                            <button
                              onClick={() => navigate(`/ordenes/${lastOrder.numero}`)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-optifix-50 text-optifix-700 hover:bg-optifix-100 transition-colors text-xs font-bold"
                            >
                              Ver Orden {lastOrder.numero}
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 px-3">Sin órdenes</span>
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
          <div className="border-t border-slate-100 p-4 flex items-center justify-between bg-slate-50/50">
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

      <EquipoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEquipo}
        equipoToEdit={equipoToEdit}
      />
    </div>
  );
}
