import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkshop } from "../context/WorkshopContext.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { getEstadoBadge, getOrderStage, ORDER_FLOW } from "../utils/estadoColors.js";
import { descargarReportePDF } from "../components/ReporteOrdenPDF.jsx";
import { useFocusTrap } from "../hooks/useFocusTrap.js";
import Icono from "../components/icons.jsx";
import { useTranslation } from "react-i18next";
import "./OrdenesList.css";

const PAGE_SIZE = 6;
const STAGE_TABS = [{ id: "TODOS", label: "Todas las órdenes" }, ...ORDER_FLOW.map((status) => ({ id: status, label: status.charAt(0) + status.slice(1).toLowerCase() }))];
const SORT_OPTIONS = [{ value: "newest", label: "Más recientes" }, { value: "oldest", label: "Más antiguas" }, { value: "numberAsc", label: "N.º de orden ascendente" }, { value: "numberDesc", label: "N.º de orden descendente" }];
const EMPTY_FILTERS = { status: "", client: "", brand: "", dateFrom: "", dateTo: "" };

function parseOrderDate(value) { const match = String(value || "").match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/); return match ? new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1])) : null; }
function orderAge(order) { const date = parseOrderDate(order.fecha_ingreso); if (!date) return null; const today = new Date(); today.setHours(0, 0, 0, 0); return Math.max(0, Math.floor((today - date) / 86400000)); }
function ageLabel(days) { if (days === null) return null; if (days === 0) return "Hoy"; return "Hace " + days + " día" + (days === 1 ? "" : "s"); }
function normalizeOrderQuery(value) { return value.replace(/\s+/g, "").replace(/^#/, ""); }

export default function OrdenesList() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { ordenes, equipos, clientes, deleteOrden, refreshOrdenes } = useWorkshop();
  const [activeTab, setActiveTab] = useState("TODOS");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [menuOrderId, setMenuOrderId] = useState(null);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState(null);
  const filtersRef = useRef(null), sortRef = useRef(null), menuRef = useRef(null);
  const isAdmin = user?.rol === "admin";
  const equipmentById = useMemo(() => new Map(equipos.map((equipo) => [equipo.id, equipo])), [equipos]);
  const clientById = useMemo(() => new Map(clientes.map((cliente) => [cliente.id, cliente])), [clientes]);
  const statusOptions = ORDER_FLOW;
  const brandOptions = useMemo(() => [...new Set(equipos.map((equipo) => equipo.marca).filter(Boolean))].sort(), [equipos]);
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  useEffect(() => { if (!toast) return undefined; const timer = window.setTimeout(() => setToast(null), 3200); return () => window.clearTimeout(timer); }, [toast]);
  useEffect(() => {
    const closePopovers = (event) => {
      if (event.key === "Escape") { setFiltersOpen(false); setSortOpen(false); setMenuOrderId(null); return; }
      if (event.type === "mousedown" && !filtersRef.current?.contains(event.target)) setFiltersOpen(false);
      if (event.type === "mousedown" && !sortRef.current?.contains(event.target)) setSortOpen(false);
      if (event.type === "mousedown" && !menuRef.current?.contains(event.target)) setMenuOrderId(null);
    };
    document.addEventListener("keydown", closePopovers); document.addEventListener("mousedown", closePopovers);
    return () => { document.removeEventListener("keydown", closePopovers); document.removeEventListener("mousedown", closePopovers); };
  }, []);

  const visibleOrders = useMemo(() => {
    const query = normalizeOrderQuery(search);
    const matches = ordenes.filter((order) => {
      const equipment = equipmentById.get(order.equipo_id) || {};
      const date = parseOrderDate(order.fecha_ingreso);
      return (activeTab === "TODOS" || getOrderStage(order) === activeTab)
        && (!query || String(order.numero || "").includes(query) || String(order.referencia_externa || "").toLowerCase().includes(query.toLowerCase()))
        && (!filters.status || getOrderStage(order) === filters.status)
        && (!filters.client || order.cliente_id === filters.client)
        && (!filters.brand || equipment.marca === filters.brand)
        && (!filters.dateFrom || (date && date >= new Date(filters.dateFrom + "T00:00:00")))
        && (!filters.dateTo || (date && date <= new Date(filters.dateTo + "T23:59:59")));
    });
    return matches.sort((a, b) => {
      if (sortBy === "numberAsc") return Number(a.numero) - Number(b.numero);
      if (sortBy === "numberDesc") return Number(b.numero) - Number(a.numero);
      const first = parseOrderDate(a.fecha_ingreso)?.getTime() || 0, second = parseOrderDate(b.fecha_ingreso)?.getTime() || 0;
      return sortBy === "oldest" ? first - second : second - first;
    });
  }, [activeTab, equipmentById, filters, ordenes, search, sortBy]);

  useEffect(() => setPage(1), [activeTab, search, filters, sortBy]);
  const totalPages = Math.max(1, Math.ceil(visibleOrders.length / PAGE_SIZE));
  const paginatedOrders = visibleOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const tabCount = (tabId) => tabId === "TODOS" ? ordenes.length : ordenes.filter((order) => getOrderStage(order) === tabId).length;
  const updateFilter = (field, value) => setFilters((current) => ({ ...current, [field]: value }));
  const clearFilters = () => { setFilters(EMPTY_FILTERS); setSearch(""); };
  const handleRefresh = async () => { setIsRefreshing(true); try { await refreshOrdenes(); setToast({ type: "success", text: "Órdenes actualizadas." }); } catch (error) { setToast({ type: "error", text: error.message || "No se pudieron actualizar las órdenes." }); } finally { setIsRefreshing(false); } };
  const handlePrint = (order) => { descargarReportePDF({ orden: order, cliente: clientById.get(order.cliente_id) || {}, equipo: equipmentById.get(order.equipo_id) || {}, archivos: order.archivos || [], print: true }); setToast({ type: "success", text: "Documento listo para imprimir." }); };
  const handleDelete = async () => { if (!orderToDelete) return; try { await deleteOrden(orderToDelete.id); setToast({ type: "success", text: "Orden eliminada correctamente." }); } catch (error) { setToast({ type: "error", text: error.message || "No se pudo eliminar la orden." }); } finally { setOrderToDelete(null); setMenuOrderId(null); } };

  return <main className="page-container orders-page" aria-labelledby="orders-title">
    <nav className="breadcrumb-nav" aria-label="Ruta de navegación"><span>Principal</span><span>/</span><span>Taller</span><span>/</span><span className="breadcrumb-current">{t("nav.orders")}</span></nav>
    <header className="orders-header"><div><h1 id="orders-title">{t("orders.title")}</h1><p>{t("orders.description")}</p></div></header>
    <section className="order-tabs-bar official-order-tabs" role="tablist" aria-label="Etapas de órdenes">{STAGE_TABS.map((tab) => <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} className={"order-tab-btn " + (activeTab === tab.id ? "active" : "")} onClick={() => setActiveTab(tab.id)}>{tab.label} <span>{tabCount(tab.id)}</span></button>)}</section>
    <OrderToolbar search={search} setSearch={setSearch} filters={filters} updateFilter={updateFilter} clearFilters={clearFilters} activeFilterCount={activeFilterCount} filtersOpen={filtersOpen} setFiltersOpen={setFiltersOpen} sortBy={sortBy} setSortBy={setSortBy} sortOpen={sortOpen} setSortOpen={setSortOpen} statusOptions={statusOptions} brandOptions={brandOptions} clients={clientes} filtersRef={filtersRef} sortRef={sortRef} onRefresh={handleRefresh} isRefreshing={isRefreshing} />
    <section className="table-card orders-table-card" aria-label="Listado de órdenes de trabajo"><div className="orders-table-wrap"><table className="gestioo-table orders-table"><thead><tr><th>N.º</th><th>Estado</th><th>N.º serie</th><th>Marca</th><th>Modelo</th><th>Cliente</th><th>Ingreso</th><th className="orders-actions-heading">Acciones</th></tr></thead><tbody>{paginatedOrders.map((order) => <OrderRow key={order.id} order={order} equipment={equipmentById.get(order.equipo_id) || {}} client={clientById.get(order.cliente_id) || {}} isAdmin={isAdmin} isMenuOpen={menuOrderId === order.id} onOpen={() => navigate("/ordenes/" + order.numero)} onPrint={() => handlePrint(order)} onToggleMenu={() => setMenuOrderId((current) => current === order.id ? null : order.id)} onDelete={() => setOrderToDelete(order)} menuRef={menuOrderId === order.id ? menuRef : null} />)}</tbody></table></div>{!visibleOrders.length && <EmptyOrders hasFilters={Boolean(search || activeFilterCount || activeTab !== "TODOS")} onClear={clearFilters} />}{visibleOrders.length > 0 && <Pagination page={page} totalPages={totalPages} count={visibleOrders.length} onChange={setPage} />}</section>
    {orderToDelete && <DeleteOrderModal order={orderToDelete} onCancel={() => setOrderToDelete(null)} onConfirm={handleDelete} />}
    {toast && <div role="status" aria-live="polite" aria-atomic="true" className={"orders-toast " + toast.type}><span aria-hidden="true">{toast.type === "success" ? "✓" : "!"}</span>{toast.text}</div>}
  </main>;
}

function OrderToolbar({ search, setSearch, filters, updateFilter, clearFilters, activeFilterCount, filtersOpen, setFiltersOpen, sortBy, setSortBy, sortOpen, setSortOpen, statusOptions, brandOptions, clients, filtersRef, sortRef, onRefresh, isRefreshing }) {
  return <section className="orders-toolbar" aria-label="Herramientas de órdenes"><label className="order-search"><Icono nombre="search" size={17} /><span className="sr-only">Buscar por número de orden</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por N.º de orden..." inputMode="numeric" />{search && <button type="button" onClick={() => setSearch("")} aria-label="Limpiar búsqueda" title="Limpiar búsqueda"><Icono nombre="x" size={16} /></button>}</label><div className="toolbar-popover" ref={filtersRef}><button type="button" className="toolbar-button" aria-label="Filtrar órdenes" title="Filtrar órdenes" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((open) => !open)}><Icono nombre="filter" size={16} />Filtros{activeFilterCount > 0 && <span className="toolbar-count">{activeFilterCount}</span>}</button>{filtersOpen && <OrderFilters filters={filters} updateFilter={updateFilter} clearFilters={clearFilters} statusOptions={statusOptions} brandOptions={brandOptions} clients={clients} />}</div><div className="toolbar-popover" ref={sortRef}><button type="button" className="toolbar-button" aria-label="Ordenar órdenes" title="Ordenar órdenes" aria-expanded={sortOpen} onClick={() => setSortOpen((open) => !open)}>Ordenar <Icono nombre="chevron-down" size={15} /></button>{sortOpen && <div className="toolbar-menu sort-menu" role="menu">{SORT_OPTIONS.map((option) => <button key={option.value} type="button" role="menuitemradio" aria-checked={sortBy === option.value} onClick={() => { setSortBy(option.value); setSortOpen(false); }}>{sortBy === option.value && <Icono nombre="check" size={14} />}{option.label}</button>)}</div>}</div><button type="button" className="toolbar-button toolbar-refresh" aria-label="Actualizar órdenes" title="Actualizar órdenes" disabled={isRefreshing} onClick={onRefresh}><Icono nombre="refresh-cw" size={16} className={isRefreshing ? "orders-spin" : ""} /><span className="sr-only">Actualizar órdenes</span></button></section>;
}

function OrderFilters({ filters, updateFilter, clearFilters, statusOptions, brandOptions, clients }) {
  return <div className="toolbar-menu filters-menu" role="dialog" aria-label="Filtrar órdenes"><div className="filters-menu-heading"><strong>Filtrar órdenes</strong><button type="button" onClick={clearFilters}>Limpiar filtros</button></div><label>Estado<select value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}><option value="">Todos los estados</option>{statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}</select></label><label>Cliente<select value={filters.client} onChange={(event) => updateFilter("client", event.target.value)}><option value="">Todos los clientes</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.nombre}</option>)}</select></label><label>Marca<select value={filters.brand} onChange={(event) => updateFilter("brand", event.target.value)}><option value="">Todas las marcas</option>{brandOptions.map((brand) => <option key={brand} value={brand}>{brand}</option>)}</select></label><div className="filter-date-grid"><label>Desde<input type="date" value={filters.dateFrom} onChange={(event) => updateFilter("dateFrom", event.target.value)} /></label><label>Hasta<input type="date" value={filters.dateTo} onChange={(event) => updateFilter("dateTo", event.target.value)} /></label></div></div>;
}

function OrderRow({ order, equipment, client, isAdmin, isMenuOpen, onOpen, onPrint, onToggleMenu, onDelete, menuRef }) {
  const badge = getEstadoBadge(order), age = orderAge(order), finalStage = getOrderStage(order) === "ENTREGADO";
  return <tr className="table-row-clickable orders-table-row" tabIndex={0} onClick={onOpen} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onOpen(); } }}><td><strong className="table-order-num">#{order.numero}</strong></td><td><span className="orders-table-status" style={{ backgroundColor: badge.bg, color: badge.color }}>{order.estado_actual}</span></td><td className="orders-mono">{equipment.serie || "—"}</td><td className="orders-brand">{equipment.marca || "—"}</td><td className="orders-model">{equipment.modelo || "NO TRAE MODELO"}</td><td><strong className="orders-client">{client.nombre || "—"}</strong><small>{client.telefono || ""}</small></td><td><span>{order.fecha_ingreso?.split(" ")[0] || "—"}</span>{age !== null && <small className={!finalStage && age >= 8 ? "order-age attention" : "order-age"}>{ageLabel(age)}</small>}</td><td className="orders-actions"><button type="button" className="order-action-button" onClick={(event) => { event.stopPropagation(); onOpen(); }} aria-label="Ver orden" title="Ver orden"><Icono nombre="eye" size={17} /></button><button type="button" className="order-action-button" onClick={(event) => { event.stopPropagation(); onPrint(); }} aria-label="Imprimir orden" title="Imprimir orden"><Icono nombre="printer" size={17} /></button>{isAdmin && <span className="order-more-menu" ref={menuRef}><button type="button" className="order-action-button" onClick={(event) => { event.stopPropagation(); onToggleMenu(); }} aria-label="Más opciones" title="Más opciones" aria-expanded={isMenuOpen}><Icono nombre="more-vertical" size={17} /></button>{isMenuOpen && <div className="order-options" role="menu"><button type="button" role="menuitem" onClick={(event) => { event.stopPropagation(); onDelete(); }}><Icono nombre="trash" size={15} />Eliminar orden</button></div>}</span>}</td></tr>;
}
function EmptyOrders({ hasFilters, onClear }) { return <div className="orders-empty"><Icono nombre="search" size={24} /><h2>No encontramos órdenes</h2><p>{hasFilters ? "No existen órdenes que coincidan con tu búsqueda o filtros." : "Todavía no hay órdenes registradas."}</p>{hasFilters && <button type="button" onClick={onClear}>Limpiar filtros</button>}</div>; }
function Pagination({ page, totalPages, count, onChange }) { return <footer className="orders-pagination"><span>Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, count)} de {count} órdenes</span><div className="orders-pagination-controls"><button type="button" disabled={page === 1} onClick={() => onChange((current) => Math.max(1, current - 1))}>Anterior</button><span className="orders-page-number" aria-current="page">{page}</span><button type="button" disabled={page === totalPages} onClick={() => onChange((current) => Math.min(totalPages, current + 1))}>Siguiente</button></div></footer>; }
function DeleteOrderModal({ order, onCancel, onConfirm }) { const dialogRef = useFocusTrap(true, onCancel); return <div className="orders-modal-backdrop" onMouseDown={onCancel}><section ref={dialogRef} tabIndex={-1} className="orders-delete-modal" role="dialog" aria-modal="true" aria-labelledby="delete-order-title" onMouseDown={(event) => event.stopPropagation()}><div className="delete-order-icon"><Icono nombre="trash" size={20} /></div><h2 id="delete-order-title">Eliminar orden #{order.numero}</h2><p>¿Seguro que deseas eliminar esta orden? Esta acción no se puede deshacer.</p><footer><button type="button" onClick={onCancel}>Cancelar</button><button type="button" className="delete-confirm-button" onClick={onConfirm}>Eliminar orden</button></footer></section></div>; }
