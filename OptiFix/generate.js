const fs = require('fs');

const rawHtml = `
<div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
<main className="w-full max-w-7xl bg-white rounded-2xl shadow-2xl border border-slate-200/80 flex flex-col max-h-[96vh] overflow-hidden relative animate-in fade-in zoom-in-95 duration-200" data-purpose="service-order-modal">
<!-- BEGIN: HeaderSection -->
<header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4 select-none">
<!-- Brand & Title -->
<div className="flex items-center gap-4">
<!-- OptiFix Logo Badge -->
<div className="flex items-center shrink-0 pr-1">
  <div className="w-8 h-8 rounded-full bg-optifix-600 flex items-center justify-center text-white font-bold text-xl mr-2">O</div>
</div>
<div>
<div className="flex items-center gap-2.5">
<span className="text-xs font-extrabold tracking-wider uppercase text-optifix-600 bg-optifix-50 px-2 py-0.5 rounded border border-optifix-100">OptiFix ERP v3.4</span>
<span className="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200" id="order-id-badge">
              #ORD-NUEVA
            </span>
</div>
<h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Nueva Orden de Servicio Técnico
          </h1>
</div>
</div>
<!-- Stepper / Status Indicator -->
<div className="hidden lg:flex items-center gap-3 bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-xl text-xs font-medium">
<div className="flex items-center gap-1.5 text-optifix-600 font-semibold">
<span className="w-5 h-5 rounded-full bg-optifix-600 text-white flex items-center justify-center text-[11px] font-mono">1</span>
<span className="">Cliente &amp; Contacto</span>
</div>
<i className="ph ph-caret-right text-slate-300"></i>
<div className="flex items-center gap-1.5 text-optifix-600 font-semibold">
<span className="w-5 h-5 rounded-full bg-optifix-600 text-white flex items-center justify-center text-[11px] font-mono">2</span>
<span className="">Dispositivo</span>
</div>
<i className="ph ph-caret-right text-slate-300"></i>
<div className="flex items-center gap-1.5 text-optifix-600 font-semibold">
<span className="w-5 h-5 rounded-full bg-optifix-600 text-white flex items-center justify-center text-[11px] font-mono">3</span>
<span className="">Diagnóstico &amp; Términos</span>
</div>
</div>
<!-- Action Utilities & Close -->
<div className="flex items-center gap-2">
<button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Ver guía rápida / Atajos" type="button">
<i className="ph ph-keyboard text-lg"></i>
</button>
<button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1" title="Cerrar modal" type="button">
<i className="ph-bold ph-x text-xl"></i>
</button>
</div>
</header>
<!-- END: HeaderSection -->
<!-- BEGIN: ModalBodyScrollableContent -->
<div className="overflow-y-auto px-6 py-6 space-y-6 flex-1 bg-surface-subtle modal-scroll" data-purpose="modal-content-area" onClick={() => {setShowClienteDropdown(false); setShowEquipoDropdown(false);}}>
<!-- BEGIN: CustomerAndEquipmentRow -->
<section aria-label="Selección de Entidades" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
<!-- CARD 1: Cliente & Contacto -->
<article className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 flex flex-col justify-between" data-purpose="client-selector-card">
<div>
<div className="flex items-center justify-between mb-3">
<div className="flex items-center gap-2">
<span className="p-1.5 bg-optifix-50 text-optifix-600 rounded-lg border border-optifix-100">
<i className="ph-bold ph-user text-base"></i>
</span>
<label className="text-sm font-bold text-slate-800">
                  Cliente Solicitante <span className="text-rose-500 font-bold">*</span>
</label>
</div>
<button onClick={() => setShowClientForm(!showClientForm)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-optifix-600 hover:text-optifix-700 bg-optifix-50 hover:bg-optifix-100/80 px-2.5 py-1 rounded-lg border border-optifix-200 transition-colors" type="button">
<i className="ph-bold ph-user-plus"></i>
<span className="">+ Nuevo Cliente</span>
</button>
</div>
<!-- Client Live Search Bar -->
<div className="relative mb-3.5" onClick={e => e.stopPropagation()}>
<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
<i className="ph ph-magnifying-glass text-lg"></i>
</div>
<input value={clienteQuery} onChange={e => { setClienteQuery(e.target.value); setClienteId(''); setShowClienteDropdown(true); }} onFocus={() => setShowClienteDropdown(true)} className="w-full pl-9 pr-24 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-optifix-500/30 focus:border-optifix-500 transition-shadow" placeholder="Buscar por Nombre, Cédula / DNI, o Teléfono..." type="text" />
<div className="absolute inset-y-1 right-1 flex items-center gap-1 pr-1">
{clienteId && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
<i className="ph-fill ph-check-circle mr-1"></i> Verificado
                </span>}
<button className="p-1.5 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100" type="button" onClick={() => setShowClienteDropdown(!showClienteDropdown)}>
<i className="ph ph-caret-down"></i>
</button>
</div>
{showClienteDropdown && (
  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
    {clientesFiltrados.map(c => (
      <div key={c.id} onClick={() => handleSelectCliente(c)} className="px-4 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0">
        <div className="font-semibold text-sm">{c.nombre} {c.apellido}</div>
        <div className="text-xs text-slate-500">{c.identificacion} • {c.telefono}</div>
      </div>
    ))}
    {clientesFiltrados.length === 0 && <div className="px-4 py-3 text-sm text-slate-500">No hay resultados</div>}
  </div>
)}
</div>
<!-- Selected Client Active Information Card -->
{clienteId && (
<div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-xl p-3.5 border border-slate-200/80 text-xs text-slate-600 space-y-2">
<div className="flex items-start justify-between">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-slate-200/80 border border-slate-300 flex items-center justify-center text-slate-500 overflow-hidden relative">
<i className="ph-bold ph-user text-xl"></i>
</div>
<div>
<h4 className="font-bold text-slate-900 text-sm">{clienteNombre} {clienteApellido}</h4>
<p className="font-mono text-slate-500 text-[11px]">Tel: {clienteTelefono}</p>
</div>
</div>
<button onClick={() => setClienteId('')} className="text-xs text-optifix-600 hover:text-optifix-800 font-medium flex items-center gap-1" type="button">
<i className="ph ph-pencil-simple"></i> Cambiar
                </button>
</div>
</div>
)}
<!-- Inline Accordion: Quick Client Creation Drawer -->
{showClientForm && (
<div className="mt-3 pt-3 border-t border-dashed border-slate-200 bg-slate-50/60 p-3.5 rounded-xl text-xs space-y-3">
<div className="flex items-center justify-between">
<span className="font-bold text-slate-800 flex items-center gap-1.5">
<i className="ph ph-identification-card text-optifix-600"></i> Ficha Rápida de Cliente
                </span>
<span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  Se guardará automáticamente
                </span>
</div>
<div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
<div>
<label className="block text-[11px] font-semibold text-slate-600 mb-1">Tipo de Cliente</label>
<select value={newClient.tipo_cliente} onChange={e => setNewClient({...newClient, tipo_cliente: e.target.value})} className="w-full text-xs rounded-lg border-slate-300 py-1.5">
<option value="Persona">Persona</option>
<option value="Empresa">Empresa</option>
</select>
</div>
<div>
<label className="block text-[11px] font-semibold text-slate-600 mb-1">DNI / Cédula <span className="text-rose-500">*</span></label>
<input value={newClient.identificacion} onChange={e => setNewClient({...newClient, identificacion: e.target.value})} className="w-full text-xs font-mono rounded-lg border-slate-300 py-1.5" placeholder="Ej: 1-0988-0234" type="text" />
</div>
<div>
<label className="block text-[11px] font-semibold text-slate-600 mb-1">Nombre <span className="text-rose-500">*</span></label>
<input value={newClient.nombre} onChange={e => setNewClient({...newClient, nombre: e.target.value})} className="w-full text-xs rounded-lg border-slate-300 py-1.5" placeholder="Nombre" type="text" />
</div>
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
<div>
<label className="block text-[11px] font-semibold text-slate-600 mb-1">Teléfono Móvil (WhatsApp) <span className="text-rose-500">*</span></label>
<div className="relative">
<input value={newClient.telefono} onChange={e => setNewClient({...newClient, telefono: e.target.value})} className="w-full text-xs font-mono rounded-lg border-slate-300 py-1.5 pl-7" placeholder="+506 8888-8888" type="text" />
<i className="ph-bold ph-whatsapp-logo text-emerald-500 absolute left-2 top-2 text-xs"></i>
</div>
</div>
<div>
<label className="block text-[11px] font-semibold text-slate-600 mb-1">Correo Electrónico</label>
<input value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} className="w-full text-xs rounded-lg border-slate-300 py-1.5" placeholder="cliente@correo.com" type="email" />
</div>
</div>
<button onClick={handleSaveQuickClient} className="w-full bg-optifix-600 hover:bg-optifix-700 text-white text-xs font-bold py-2 rounded-lg mt-2 transition-colors">Guardar y Seleccionar Cliente</button>
</div>
)}
</div>
</article>
<!-- CARD 2: Equipo / Dispositivo a Reparar -->
<article className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 flex flex-col justify-between" data-purpose="equipment-selector-card">
<div>
<div className="flex items-center justify-between mb-3">
<div className="flex items-center gap-2">
<span className="p-1.5 bg-optifix-50 text-optifix-600 rounded-lg border border-optifix-100">
<i className="ph-bold ph-laptop text-base"></i>
</span>
<label className="text-sm font-bold text-slate-800">
                  Dispositivo / Equipo <span className="text-rose-500 font-bold">*</span>
</label>
</div>
<button onClick={() => setShowEquipmentForm(!showEquipmentForm)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-optifix-600 hover:text-optifix-700 bg-optifix-50 hover:bg-optifix-100/80 px-2.5 py-1 rounded-lg border border-optifix-200 transition-colors" type="button">
<i className="ph-bold ph-plus-circle"></i>
<span className="">+ Registrar Equipo</span>
</button>
</div>
<!-- Equipment Search -->
<div className="relative mb-3.5" onClick={e => e.stopPropagation()}>
<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
<i className="ph ph-barcode text-lg"></i>
</div>
<input value={equipoQuery} onChange={e => { setEquipoQuery(e.target.value); setEquipoId(''); setShowEquipoDropdown(true); }} onFocus={() => setShowEquipoDropdown(true)} className="w-full pl-9 pr-24 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-optifix-500/30 focus:border-optifix-500 transition-shadow" placeholder="Buscar por N° de Serie, Marca o Modelo..." type="text" />
<div className="absolute inset-y-1 right-1 flex items-center gap-1 pr-1">
{equipoId && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-optifix-700 border border-blue-200">
                  Seleccionado
                </span>}
<button className="p-1.5 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100" type="button" onClick={() => setShowEquipoDropdown(!showEquipoDropdown)}>
<i className="ph ph-caret-down"></i>
</button>
</div>
{showEquipoDropdown && (
  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
    {equiposFiltrados.map(e => (
      <div key={e.id} onClick={() => handleSelectEquipo(e)} className="px-4 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0">
        <div className="font-semibold text-sm">{e.marca} {e.modelo}</div>
        <div className="text-xs text-slate-500">S/N: {e.serie}</div>
      </div>
    ))}
    {equiposFiltrados.length === 0 && <div className="px-4 py-3 text-sm text-slate-500">No hay resultados</div>}
  </div>
)}
</div>
<!-- Selected Equipment Active Details -->
{equipoId && (() => {
  const eq = equipos.find(e => e.id === equipoId);
  return eq ? (
<div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-xl p-3.5 border border-slate-200/80 flex items-center gap-4">
<!-- Visual Device Image / Thumbnail Slot -->
<div className="relative w-16 h-16 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-xs shrink-0 group">
<i className="ph-light ph-laptop text-3xl text-slate-400 group-hover:text-optifix-600 transition-colors"></i>
<button className="absolute -bottom-1 -right-1 bg-white hover:bg-slate-50 border border-slate-300 rounded-full p-1 text-slate-600 shadow-sm" title="Tomar / Cargar foto" type="button">
<i className="ph-bold ph-camera text-[10px]"></i>
</button>
</div>
<!-- Device Metadata Specs -->
<div className="flex-1 min-w-0">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="font-bold text-slate-900 text-sm truncate">{eq.marca} {eq.modelo}</span>
</div>
<button onClick={() => setEquipoId('')} className="text-xs text-optifix-600 hover:text-optifix-800 font-medium flex items-center gap-1" type="button">
<i className="ph ph-pencil-simple"></i> Cambiar
                  </button>
</div>
<div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
<span className="">Marca: <strong className="text-slate-700 font-semibold">{eq.marca}</strong></span>
<span className="">•</span>
<span className="">Modelo: <strong className="text-slate-700 font-semibold">{eq.modelo}</strong></span>
<span className="">•</span>
<span className="font-mono text-slate-700 bg-slate-200/60 px-1 rounded text-[11px]">S/N: {eq.serie}</span>
</div>
</div>
</div>) : null;
})()}
<!-- Collapsible: New Equipment Modal-Like Subpanel -->
{showEquipmentForm && (
<div className="mt-3 pt-3 border-t border-dashed border-slate-200 bg-slate-50/60 p-3.5 rounded-xl text-xs space-y-3">
<div className="flex items-center justify-between">
<span className="font-bold text-slate-800 flex items-center gap-1.5">
<i className="ph ph-cpu text-optifix-600"></i> Registrar Nuevo Dispositivo
                </span>
<label className="inline-flex items-center gap-1.5 cursor-pointer">
<input className="rounded border-slate-300 text-optifix-600 focus:ring-optifix-500 text-xs" type="checkbox" />
<span className="text-[11px] text-slate-600">Sin N° serie visible</span>
</label>
</div>
<div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
<div>
<label className="block text-[11px] font-semibold text-slate-600 mb-1">Categoría / Tipo <span className="text-rose-500">*</span></label>
<select value={newEquipo.tipo} onChange={e => setNewEquipo({...newEquipo, tipo: e.target.value})} className="w-full text-xs rounded-lg border-slate-300 py-1.5">
<option value="Laptop / Portátil">Laptop / Portátil</option>
<option value="Smartphone / Móvil">Smartphone / Móvil</option>
<option value="Consola de Videojuego">Consola de Videojuego</option>
<option value="Tablet">Tablet</option>
<option value="Monitor / TV">Monitor / TV</option>
<option value="Genérico / Otro">Genérico / Otro</option>
</select>
</div>
<div>
<label className="block text-[11px] font-semibold text-slate-600 mb-1">Marca <span className="text-rose-500">*</span></label>
<input value={newEquipo.marca} onChange={e => setNewEquipo({...newEquipo, marca: e.target.value})} className="w-full text-xs rounded-lg border-slate-300 py-1.5" placeholder="Ej: Apple, Lenovo, HP" type="text" />
</div>
<div>
<label className="block text-[11px] font-semibold text-slate-600 mb-1">Modelo Comercial <span className="text-rose-500">*</span></label>
<input value={newEquipo.modelo} onChange={e => setNewEquipo({...newEquipo, modelo: e.target.value})} className="w-full text-xs rounded-lg border-slate-300 py-1.5" placeholder="Ej: IdeaPad 3 15ITL05" type="text" />
</div>
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
<div>
<label className="block text-[11px] font-semibold text-slate-600 mb-1">N° de Serie Físico <span className="text-rose-500">*</span></label>
<input value={newEquipo.serie} onChange={e => setNewEquipo({...newEquipo, serie: e.target.value})} className="w-full text-xs font-mono rounded-lg border-slate-300 py-1.5" placeholder="Escanear o digitar SN" type="text" />
</div>
<div>
<label className="block text-[11px] font-semibold text-slate-600 mb-1">Accesorios Dejados</label>
<input className="w-full text-xs rounded-lg border-slate-300 py-1.5" placeholder="Cargador original..." type="text" />
</div>
</div>
<button onClick={handleSaveQuickEquipment} className="w-full bg-optifix-600 hover:bg-optifix-700 text-white text-xs font-bold py-2 rounded-lg mt-2 transition-colors">Guardar y Seleccionar Equipo</button>
</div>
)}
</div>
</article>
</section>
<!-- END: CustomerAndEquipmentRow -->
<!-- BEGIN: OrderDetailsAndDiagnosisSection -->
<section className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden" data-purpose="service-specifications-tabs">
<!-- Navigation Tabs -->
<div className="border-b border-slate-200 px-5 pt-3 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
<nav aria-label="Tabs de la Orden" className="flex items-center gap-2 -mb-px">
<button onClick={() => setActiveTab('General')} className={"inline-flex items-center gap-2 px-4 py-2.5 font-bold text-xs rounded-t-lg border-b-2 " + (activeTab === 'General' ? "border-optifix-600 text-optifix-700 bg-white shadow-xs" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/70 transition-colors")} type="button">
<i className="ph-bold ph-sliders text-sm"></i>
<span className="">Datos Generales &amp; Operación</span>
</button>
<button onClick={() => setActiveTab('Diagnóstico')} className={"inline-flex items-center gap-2 px-4 py-2.5 font-bold text-xs rounded-t-lg border-b-2 " + (activeTab === 'Diagnóstico' ? "border-optifix-600 text-optifix-700 bg-white shadow-xs" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/70 transition-colors")} type="button">
<i className="ph ph-stethoscope text-sm"></i>
<span className="">Diagnóstico Inicial</span>
</button>
<button onClick={() => setActiveTab('Anotaciones')} className={"inline-flex items-center gap-2 px-4 py-2.5 font-bold text-xs rounded-t-lg border-b-2 " + (activeTab === 'Anotaciones' ? "border-optifix-600 text-optifix-700 bg-white shadow-xs" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/70 transition-colors")} type="button">
<i className="ph ph-notebook text-sm"></i>
<span className="">Anotaciones Internas</span>
</button>
</nav>
<!-- External Ref Code -->
<div className="pb-2">
<div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-xs">
<label className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                Ref. Externa / Ticket:
</label>
<input value={referenciaExterna} onChange={e => setReferenciaExterna(e.target.value)} className="w-24 text-xs font-mono font-medium border-0 p-0 focus:ring-0 text-slate-800 placeholder-slate-400" placeholder="OP-882" type="text" />
</div>
</div>
</div>
<!-- Tab Body Content -->
<div className="p-6 space-y-6">
{activeTab === 'General' && (
<>
<!-- Row 1: Workflow Controls -->
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
<!-- Prioridad -->
<div>
<label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
<span className="">Prioridad</span>
</label>
<div className="relative">
<select value={prioridad} onChange={e => setPrioridad(e.target.value)} className="w-full text-xs font-semibold rounded-lg border-slate-300 focus:border-optifix-500 focus:ring-optifix-500/20 py-2 pl-2.5 pr-8">
<option value="Baja">🟢 Baja (72 hrs)</option>
<option value="Normal">🔵 Normal (24-48 hrs)</option>
<option value="Alta">🟠 Alta Prioritaria (24 hrs)</option>
<option value="Urgente">🔴 Urgencia / Express (Inmediata)</option>
</select>
</div>
</div>
<!-- Área Operativa -->
<div>
<label className="block text-xs font-bold text-slate-700 mb-1.5">
                Área de Derivación
              </label>
<select value={area} onChange={e => setArea(e.target.value)} className="w-full text-xs font-semibold rounded-lg border-slate-300 focus:border-optifix-500 focus:ring-optifix-500/20 py-2 pl-2.5 pr-8">
<option value="Entrada">📥 Mesa de Entrada / Recepción</option>
<option value="Taller">🔬 Taller / Laboratorio</option>
<option value="Software">💻 Área Sistemas / Firmware</option>
</select>
</div>
<!-- Estado Inicial -->
<div>
<label className="block text-xs font-bold text-slate-700 mb-1.5">
                Estado Inicial de Orden
              </label>
<select value={estado} onChange={e => setEstado(e.target.value)} className="w-full text-xs font-bold uppercase rounded-lg border-slate-300 bg-slate-50 focus:border-optifix-500 focus:ring-optifix-500/20 py-2 pl-2.5 pr-8 text-optifix-700">
<option value="RECEPCIÓN">RECEPCIÓN / POR REVISAR</option>
<option value="DIAGNÓSTICO">EN DIAGNÓSTICO</option>
<option value="PRESUPUESTO">PRESUPUESTADO</option>
</select>
</div>
<!-- Técnico Responsable -->
<div>
<label className="block text-xs font-bold text-slate-700 mb-1.5">
                Técnico Responsable
              </label>
<div className="relative">
<select value={responsable} onChange={e => setResponsable(e.target.value)} className="w-full text-xs font-medium rounded-lg border-slate-300 focus:border-optifix-500 focus:ring-optifix-500/20 py-2 pl-8 pr-8">
<option value="Mario Soto (Técnico Master - L2)">Mario Soto (Técnico Master - L2)</option>
<option value="Esteban Quirós (Laboratorio Micro)">Esteban Quirós (Laboratorio Micro)</option>
<option value="Laura Cordero (Garantías & Diagnóstico)">Laura Cordero (Garantías &amp; Diagnóstico)</option>
<option value="Sin Asignar (Cola General)">Sin Asignar (Cola General)</option>
</select>
<div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
<i className="ph-bold ph-user-gear text-sm"></i>
</div>
</div>
</div>
</div>
<!-- Row 2: Textarea fields (Work Requested & Physical Condition) -->
<div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
<!-- Trabajo Solicitado -->
<div className="space-y-1.5">
<div className="flex items-center justify-between">
<label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
<span className="">Trabajo Solicitado / Motivo de Ingreso</span>
<span className="text-rose-500 font-bold">*</span>
</label>
</div>
<textarea value={trabajo} onChange={e => setTrabajo(e.target.value)} className="w-full text-xs font-normal rounded-xl border-slate-300 focus:border-optifix-500 focus:ring-optifix-500/20 p-3 placeholder-slate-400 transition-shadow" placeholder="Describa puntualmente lo que solicita el cliente..." rows="3"></textarea>
</div>
<!-- Estado Físico & Accesorios Recibidos -->
<div className="space-y-1.5">
<div className="flex items-center justify-between">
<label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
<span className="">Inspección Visual &amp; Accesorios Recibidos</span>
</label>
</div>
<textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} className="w-full text-xs font-normal rounded-xl border-slate-300 focus:border-optifix-500 focus:ring-optifix-500/20 p-3 placeholder-slate-400 transition-shadow" placeholder="Rayones, golpes perimetrales, faltantes de tornillería..." rows="3"></textarea>
</div>
</div>
<!-- Row 3: Financial & Delivery Dates Controls -->
<div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
<!-- Requiere Diagnóstico Previo -->
<div>
<label className="block text-[11px] font-semibold text-slate-600 mb-1.5">Diagnóstico Previo</label>
<select value={diagnosticoSeleccion} onChange={e => setDiagnosticoSeleccion(e.target.value)} className="w-full text-xs rounded-lg border-slate-300 focus:ring-optifix-500 py-2">
<option value="Sí">Requerido (Por evaluar)</option>
<option value="No">No (Falla identificada)</option>
</select>
</div>
<!-- ¿Aplica Garantía? -->
<div>
<label className="block text-[11px] font-semibold text-slate-600 mb-1.5">Garantía de Reparación</label>
<select value={garantia} onChange={e => setGarantia(e.target.value)} className="w-full text-xs rounded-lg border-slate-300 focus:ring-optifix-500 py-2">
<option value="No">Servicio Estándar (No)</option>
<option value="Sí">Reingreso por Garantía (Sí)</option>
</select>
</div>
<!-- Fecha Prometida de Entrega -->
<div>
<label className="block text-[11px] font-semibold text-slate-600 mb-1.5">Fecha Prometida de Entrega</label>
<div className="relative">
<input value={fechaPrometida} onChange={e => setFechaPrometida(e.target.value)} className="w-full text-xs font-medium rounded-lg border-slate-300 focus:ring-optifix-500 py-2 pl-3 pr-2 text-slate-700" type="date" />
</div>
</div>
<!-- Presupuesto Estimado -->
<div>
<label className="block text-[11px] font-semibold text-slate-600 mb-1.5 flex items-center justify-between">
<span className="">Presupuesto Estimado</span>
<span className="text-[10px] text-slate-400 font-mono">CRC</span>
</label>
<div className="relative flex items-center">
<span className="absolute left-3 text-xs font-mono font-bold text-slate-400">₡</span>
<input value={presupuesto} onChange={e => setPresupuesto(e.target.value)} className="w-full text-xs font-mono font-bold text-slate-900 rounded-lg border-slate-300 focus:ring-optifix-500 py-2 pl-7 pr-7 text-right" type="number" />
</div>
</div>
<!-- Adelanto / Depósito Recibido -->
<div>
<label className="block text-[11px] font-semibold text-slate-600 mb-1.5 flex items-center justify-between">
<span className="">Adelanto / Seña</span>
</label>
<div className="relative flex items-center">
<span className="absolute left-3 text-xs font-mono font-bold text-slate-400">₡</span>
<input value={adelanto} onChange={e => setAdelanto(e.target.value)} className="w-full text-xs font-mono font-bold text-emerald-700 rounded-lg border-slate-300 focus:ring-optifix-500 py-2 pl-7 pr-7 text-right bg-emerald-50/20" placeholder="0.00" type="number" />
</div>
</div>
</div>
</>
)}

{activeTab === 'Diagnóstico' && (
  <div className="flex flex-col h-64">
    <label className="block text-xs font-bold text-slate-700 mb-2">Diagnóstico Inicial</label>
    <textarea value={diagnosticoTexto} onChange={e => setDiagnosticoTexto(e.target.value)} className="flex-1 w-full text-xs font-normal rounded-xl border-slate-300 focus:border-optifix-500 focus:ring-optifix-500/20 p-3 placeholder-slate-400 resize-none" placeholder="Escriba aquí los detalles del diagnóstico..."></textarea>
  </div>
)}

{activeTab === 'Anotaciones' && (
  <div className="flex flex-col h-64">
    <label className="block text-xs font-bold text-slate-700 mb-2">Anotaciones Privadas</label>
    <textarea value={anotaciones} onChange={e => setAnotaciones(e.target.value)} className="flex-1 w-full text-xs font-normal rounded-xl border-slate-300 focus:border-optifix-500 focus:ring-optifix-500/20 p-3 placeholder-slate-400 resize-none" placeholder="Anotaciones internas (no visibles para el cliente)..."></textarea>
  </div>
)}

</div>
</section>
<!-- END: OrderDetailsAndDiagnosisSection -->
</div>
<!-- END: ModalBodyScrollableContent -->
<!-- BEGIN: FloatingStickyFooter -->
<footer className="bg-white border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 select-none shadow-modal z-10" data-purpose="footer-order-actions">
<!-- Summary Chips for Quick Sanity Check -->
<div className="flex items-center gap-4 w-full sm:w-auto overflow-x-auto py-1">
<div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-lg shrink-0">
<i className="ph-fill ph-check-circle text-emerald-500"></i>
<span className="">Cliente: <strong className="text-slate-900 font-semibold">{clienteNombre || 'No seleccionado'}</strong></span>
</div>
<div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-lg shrink-0">
<i className="ph-fill ph-check-circle text-emerald-500"></i>
<span className="">Equipo: <strong className="text-slate-900 font-semibold">{equipoId ? equipos.find(e => e.id === equipoId)?.modelo : 'No seleccionado'}</strong></span>
</div>
<div className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-lg shrink-0">
<span className="">Saldo Restante:</span>
<span className="font-bold text-slate-900">₡{Number((presupuesto || 0) - (adelanto || 0)).toLocaleString('es-CR')}</span>
</div>
</div>
<!-- Action Buttons -->
<div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
<!-- Cancelar -->
<button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors" type="button">
          Cancelar
        </button>
<!-- CTA Principal: Crear Orden e Imprimir Boleta -->
<button onClick={handleSubmit} className="px-5 py-2.5 rounded-xl bg-optifix-500 hover:bg-optifix-600 active:bg-optifix-700 text-white text-xs font-bold shadow-md shadow-optifix-500/25 flex items-center gap-2 transition-all transform active:scale-95" type="button">
<i className="ph-bold ph-printer text-base"></i>
<span className="">Crear Orden &amp; Imprimir Boleta</span>
<span className="h-4 w-px bg-white/30 mx-0.5"></span>
<i className="ph-fill ph-whatsapp-logo text-emerald-300 text-base" title="Envía notificación inmediata al WhatsApp del cliente"></i>
</button>
</div>
</footer>
<!-- END: FloatingStickyFooter -->
</main>
</div>
`;

let reactComponentCode = `import React, { useState, useEffect } from "react";
import { useWorkshop } from "../../context/WorkshopContext.jsx";

export default function NuevaOrdenModal({ isOpen, onClose, onOrdenCreada }) {
  const { clientes, equipos, addCliente, addEquipo, addOrden } = useWorkshop();

  const [activeTab, setActiveTab] = useState("General");
  
  // Inline forms state
  const [showClientForm, setShowClientForm] = useState(false);
  const [showEquipmentForm, setShowEquipmentForm] = useState(false);

  // Quick creation objects
  const [newClient, setNewClient] = useState({ tipo_cliente: "Persona", nombre: "", identificacion: "", telefono: "", email: "" });
  const [newEquipo, setNewEquipo] = useState({ tipo: "Laptop / Portátil", marca: "", modelo: "", serie: "" });

  // Form state - General
  const [clienteId, setClienteId] = useState("");
  const [equipoId, setEquipoId] = useState("");
  const [referenciaExterna, setReferenciaExterna] = useState("");
  const [prioridad, setPrioridad] = useState("Normal");
  const [area, setArea] = useState("Entrada");
  const [estado, setEstado] = useState("RECEPCIÓN");
  const [responsable, setResponsable] = useState("Sin Asignar (Cola General)");
  const [trabajo, setTrabajo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [diagnosticoSeleccion, setDiagnosticoSeleccion] = useState("No");
  const [garantia, setGarantia] = useState("No");
  const [fechaPrometida, setFechaPrometida] = useState("");
  const [presupuesto, setPresupuesto] = useState("");
  const [adelanto, setAdelanto] = useState("");

  // Form state - Tabs
  const [diagnosticoTexto, setDiagnosticoTexto] = useState("");
  const [anotaciones, setAnotaciones] = useState("");

  // Search state
  const [clienteQuery, setClienteQuery] = useState("");
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);
  const [equipoQuery, setEquipoQuery] = useState("");
  const [showEquipoDropdown, setShowEquipoDropdown] = useState(false);

  // Aux state for display
  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteApellido, setClienteApellido] = useState("");
  const [clienteTelefono, setClienteTelefono] = useState("");

  useEffect(() => {
    if (isOpen) {
      setActiveTab("General");
      setClienteId(""); setEquipoId("");
      setClienteQuery(""); setEquipoQuery("");
      setReferenciaExterna(""); setPrioridad("Normal");
      setArea("Entrada"); setEstado("RECEPCIÓN");
      setResponsable("Sin Asignar (Cola General)");
      setTrabajo(""); setDescripcion("");
      setDiagnosticoSeleccion("No"); setGarantia("No");
      setFechaPrometida(""); setPresupuesto(""); setAdelanto("");
      setDiagnosticoTexto(""); setAnotaciones("");
      setShowClientForm(false); setShowEquipmentForm(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const clientesFiltrados = clientes.filter(c => 
    (c.nombre + " " + (c.apellido || "")).toLowerCase().includes(clienteQuery.toLowerCase()) || 
    (c.identificacion && c.identificacion.includes(clienteQuery))
  );

  const equiposFiltrados = equipos.filter(e => 
    (e.serie && e.serie.toLowerCase().includes(equipoQuery.toLowerCase())) ||
    (e.marca && e.marca.toLowerCase().includes(equipoQuery.toLowerCase()))
  );

  const handleSelectCliente = (cli) => {
    setClienteId(cli.id);
    setClienteNombre(cli.nombre || "");
    setClienteApellido(cli.apellido || "");
    setClienteTelefono(cli.telefono || "");
    setClienteQuery(cli.nombre + " " + (cli.apellido || ""));
    setShowClienteDropdown(false);
  };

  const handleSelectEquipo = (eq) => {
    setEquipoId(eq.id);
    setEquipoQuery(eq.marca + " " + eq.modelo);
    setShowEquipoDropdown(false);
  };

  const handleSaveQuickClient = () => {
    if (!newClient.nombre || !newClient.identificacion || !newClient.telefono) return;
    const cli = addCliente(newClient);
    handleSelectCliente(cli);
    setShowClientForm(false);
    setNewClient({ tipo_cliente: "Persona", nombre: "", identificacion: "", telefono: "", email: "" });
  };

  const handleSaveQuickEquipment = () => {
    if (!newEquipo.marca || !newEquipo.modelo || !newEquipo.serie) return;
    const eq = addEquipo({ ...newEquipo, cliente_id: clienteId });
    handleSelectEquipo(eq);
    setShowEquipmentForm(false);
    setNewEquipo({ tipo: "Laptop / Portátil", marca: "", modelo: "", serie: "" });
  };

  const handleSubmit = () => {
    if (!clienteId || !equipoId || !trabajo.trim()) {
      alert("Por favor complete Cliente, Equipo y Trabajo solicitado.");
      return;
    }

    const nuevaOrden = addOrden({
      cliente_id: clienteId,
      equipo_id: equipoId,
      referencia_externa: referenciaExterna,
      prioridad,
      area,
      estado_actual: estado,
      etapa_categoria: area.toUpperCase(),
      responsable,
      trabajo_solicitado: trabajo,
      descripcion_estado: descripcion,
      diagnostico: diagnosticoSeleccion === "Sí" ? diagnosticoTexto : "",
      garantia: garantia === "Sí",
      fecha_prometida: fechaPrometida,
      presupuesto,
      adelanto,
      anotaciones
    });

    if (onOrdenCreada) onOrdenCreada(nuevaOrden);
    onClose();
  };

  return (
    ${rawHtml.replace(/<!--.*?-->/g, '')}
  );
}
`;

fs.writeFileSync('c:\\Users\\HP8D3\\Downloads\\OPTIFIX\\OptiFix\\OptiFix\\src\\components\\modals\\NuevaOrdenModal.jsx', reactComponentCode);
