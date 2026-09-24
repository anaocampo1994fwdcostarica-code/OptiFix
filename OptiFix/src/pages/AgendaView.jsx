import React, { useState } from "react";
import { useWorkshop } from "../context/WorkshopContext.jsx";
import Icono from "../components/icons.jsx";

const DUMMY_APPOINTMENTS = [
  {
    id: "cita-1",
    cliente: "María Fernández",
    equipo: "Samsung QLED 55\"",
    motivo: "Revisión a domicilio",
    fecha: "Hoy",
    hora: "10:00 AM",
    estado: "Confirmada",
    tipo: "Domicilio",
  },
  {
    id: "cita-2",
    cliente: "Carlos Rodríguez",
    equipo: "Laptop Dell XPS",
    motivo: "Retiro de equipo reparado",
    fecha: "Hoy",
    hora: "02:30 PM",
    estado: "Pendiente",
    tipo: "Taller",
  },
  {
    id: "cita-3",
    cliente: "Empresa XYZ S.A.",
    equipo: "Lote de 5 Monitores",
    motivo: "Ingreso de nuevos equipos",
    fecha: "Mañana",
    hora: "09:00 AM",
    estado: "Confirmada",
    tipo: "Taller",
  },
  {
    id: "cita-4",
    cliente: "Laura Gómez",
    equipo: "Microondas Oster",
    motivo: "Diagnóstico inicial",
    fecha: "Mañana",
    hora: "11:15 AM",
    estado: "Reprogramada",
    tipo: "Taller",
  }
];

export default function AgendaView() {
  const [activeTab, setActiveTab] = useState("Proximas");
  const [appointments] = useState(DUMMY_APPOINTMENTS);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Confirmada":
        return "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20";
      case "Pendiente":
        return "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20";
      case "Reprogramada":
        return "bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/20";
      default:
        return "bg-slate-500/10 text-slate-600 ring-1 ring-slate-500/20";
    }
  };

  const getIconForType = (tipo) => {
    return tipo === "Domicilio" ? "truck" : "storefront";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Agenda y Citas</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestiona retiros, entregas y visitas técnicas.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 bg-optifix-600 hover:bg-optifix-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-optifix-500/20">
          <Icono nombre="plus" size={18} />
          Nueva Cita
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Calendario & Resumen */}
        <div className="space-y-6">
          {/* Mini Calendario Decorativo */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-800">Septiembre 2026</h2>
              <div className="flex gap-1">
                <button className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors">
                  <Icono nombre="chevron-left" size={16} />
                </button>
                <button className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors">
                  <Icono nombre="chevron-right" size={16} />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-400 mb-2">
              <div>Do</div><div>Lu</div><div>Ma</div><div>Mi</div><div>Ju</div><div>Vi</div><div>Sa</div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              {/* Días en blanco */}
              <div className="p-2 text-transparent">0</div>
              <div className="p-2 text-transparent">0</div>
              {/* Días del mes (Mockup 1-30) */}
              {Array.from({ length: 30 }).map((_, i) => {
                const isToday = i + 1 === 24;
                const hasEvent = [24, 25, 28].includes(i + 1);
                return (
                  <div 
                    key={i} 
                    className={`
                      p-2 rounded-lg cursor-pointer transition-all relative
                      ${isToday ? 'bg-optifix-600 text-white font-bold shadow-md shadow-optifix-500/30' : 'text-slate-700 hover:bg-slate-50'}
                    `}
                  >
                    {i + 1}
                    {hasEvent && !isToday && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-optifix-500 rounded-full"></span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resumen de Hoy */}
          <div className="bg-gradient-to-br from-optifix-600 to-optifix-800 rounded-2xl shadow-lg p-5 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Icono nombre="calendar-check" size={100} />
            </div>
            <div className="relative z-10">
              <h3 className="text-optifix-100 font-medium text-sm mb-1">Resumen de Hoy</h3>
              <div className="text-3xl font-bold mb-4">2 Citas</div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                  <span className="text-sm font-medium">10:00 AM</span>
                  <span className="text-sm text-optifix-100 truncate ml-3">Revisión a domicilio</span>
                </div>
                <div className="flex items-center justify-between bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                  <span className="text-sm font-medium">02:30 PM</span>
                  <span className="text-sm text-optifix-100 truncate ml-3">Retiro de equipo</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Lista de Citas */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden flex flex-col">
          <div className="border-b border-slate-100 p-2">
            <div className="flex gap-2 p-1 bg-slate-50/50 rounded-lg w-fit">
              {['Proximas', 'Hoy', 'Completadas'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    px-4 py-2 rounded-md text-sm font-medium transition-all
                    ${activeTab === tab 
                      ? 'bg-white text-optifix-700 shadow-sm ring-1 ring-slate-200/50' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'}
                  `}
                >
                  {tab === 'Proximas' ? 'Próximas' : tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 p-0 overflow-y-auto">
            <div className="divide-y divide-slate-100">
              {appointments.map((apt) => (
                <div key={apt.id} className="p-5 hover:bg-slate-50/80 transition-colors group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Hora / Fecha */}
                      <div className="flex flex-col items-center justify-center min-w-[70px] py-2 px-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{apt.fecha}</span>
                        <span className="text-sm font-bold text-slate-800 mt-0.5">{apt.hora.split(' ')[0]}</span>
                        <span className="text-[10px] font-semibold text-slate-400">{apt.hora.split(' ')[1]}</span>
                      </div>
                      
                      {/* Detalles */}
                      <div className="flex-1 pt-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-base font-bold text-slate-900">{apt.cliente}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${getStatusBadge(apt.estado)}`}>
                            {apt.estado}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                          <span className="font-medium text-slate-700">{apt.equipo}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span>{apt.motivo}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                          <Icono nombre={getIconForType(apt.tipo)} size={14} />
                          {apt.tipo}
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity pt-2">
                      <button className="p-2 text-slate-400 hover:text-optifix-600 hover:bg-optifix-50 rounded-lg transition-colors" title="Editar cita">
                        <Icono nombre="pencil" size={18} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Cancelar cita">
                        <Icono nombre="trash" size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {appointments.length === 0 && (
                <div className="p-12 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
                    <Icono nombre="calendar-blank" size={32} />
                  </div>
                  <h3 className="text-slate-800 font-bold mb-1">No hay citas</h3>
                  <p className="text-slate-500 text-sm">No tienes citas programadas para esta vista.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
