import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWorkshop } from "../context/WorkshopContext.jsx";
import Icono from "../components/icons.jsx";
import { getEstadoBadge, isOrderActive } from "../utils/estadoColors.js";
import { useTranslation } from "react-i18next";
import { useExchangeRate } from "../hooks/useExchangeRate.js";
import "./DashboardView.css";

const STATUS_TRANSLATIONS = { "Recepción": "status.reception", "En trámite": "status.inProgress", Presupuesto: "status.quoted", Reparado: "status.repaired", Entregado: "status.delivered", Rechazado: "status.rejected" };
const STATUS_ICONS = { "Recepción": "↓", "En trámite": "…", Presupuesto: "$", Reparado: "✓", Entregado: "✓", Rechazado: "!" };

export default function DashboardView() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { ordenes, clientes, equipos, cotizaciones } = useWorkshop();
  const [filter, setFilter] = useState("all");
  const exchangeRate = useExchangeRate();
  const stats = useMemo(() => {
    const status = (order) => getEstadoBadge(order).label;
    const delivered = ordenes.filter((order) => !isOrderActive(order));
    const active = ordenes.filter(isOrderActive);
    const recepcion = active.filter((order) => status(order) === "Recepción");
    const banco = active.filter((order) => ["Análisis técnico", "En taller"].includes(status(order)));
    const presupuestos = active.filter((order) => status(order) === "Comunicando presupuesto");
    const total = active.reduce((sum, order) => sum + (order.productos_servicios || []).reduce((itemSum, item) => itemSum + (Number(item.cantidad) || 1) * (Number(item.importe) || 0), 0), 0);
    return { active, recepcion, banco, presupuestos, delivered, total };
  }, [ordenes]);

  const filteredOrders = filter === "ready" ? stats.delivered : stats.active.filter((order) => filter === "all" || getEstadoBadge(order).label === "Recepción");
  const visibleOrders = filteredOrders.slice(0, 5);
  const pendingQuotes = cotizaciones.filter((quote) => quote.estado === "PENDIENTE").length;
  const agenda = stats.active.slice(0, 4);
  const attentionItems = [
    stats.presupuestos.length > 0 && { id: "quotes", count: stats.presupuestos.length, label: t("dashboard.budgetsToConfirm", "presupuesto(s) por confirmar"), to: "/ordenes" },
    stats.recepcion.length > 0 && { id: "intake", count: stats.recepcion.length, label: t("dashboard.ordersAwaitingIntake", "orden(es) en recepción"), to: "/ordenes" },
    stats.delivered.length > 0 && { id: "delivery", count: stats.delivered.length, label: t("dashboard.ordersReadyDelivery", "equipo(s) listo(s) para entregar"), to: "/ordenes" }
  ].filter(Boolean);
  const currencyLocale = i18n.language === "en" ? "en-US" : "es-CR";
  const moneyForLanguage = new Intl.NumberFormat(currencyLocale, { style: "currency", currency: "CRC", maximumFractionDigits: 0 });
  const today = new Intl.DateTimeFormat(currencyLocale, { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());
  const translatedStatus = (label) => t(STATUS_TRANSLATIONS[label] || label);

  return <main className="dashboard page-container" aria-labelledby="dashboard-title">
    <section className="dashboard-hero"><div><div className="dashboard-status"><span aria-hidden="true" /> {t("dashboard.operational")} <time dateTime={new Date().toISOString().slice(0, 10)}>{today}</time></div><h1 id="dashboard-title">{t("page.dashboard")}</h1><p>{t("dashboard.monitoring")}</p></div></section>
    <section className="dashboard-exchange-rate" aria-label={t("dashboard.exchangeRate")} role="status"><div><p>{t("dashboard.exchangeRate")}</p><strong>{exchangeRate.loading ? t("dashboard.loading") : exchangeRate.rate ? `1 USD ≈ ₡${Number(exchangeRate.rate).toFixed(2)}` : t("dashboard.unavailable")}</strong>{exchangeRate.source && <small>{exchangeRate.source}</small>}</div></section>
    <section className="dashboard-kpis" aria-label={t("page.dashboard")}>
      <Kpi to="/ordenes" icon="wrench" tone="blue" label={t("dashboard.ordersInWorkshop")} value={stats.active.length} detail={`${stats.recepcion.length} ${t("dashboard.inReception")} · ${stats.banco.length} ${t("dashboard.inBench")}`} />
      <Kpi to="/ordenes" icon="barchart" tone="green" label={t("dashboard.estimatedBilling")} value={moneyForLanguage.format(stats.total)} detail={t("dashboard.openOrderProducts")} />
      <Kpi to="/agenda" icon="calendar-check" tone="purple" label={t("dashboard.technicalAgenda")} value={agenda.length} detail={t("dashboard.pendingFollowups")} />
      <Kpi to="/cotizaciones" icon="box" tone="orange" label={t("dashboard.pendingQuotes")} value={pendingQuotes} detail={t("dashboard.customerConfirmation")} />
    </section>
    <section className="dashboard-attention" aria-labelledby="attention-heading"><div className="attention-heading"><span aria-hidden="true">!</span><h2 id="attention-heading">{t("dashboard.attentionRequired", "Atención requerida")}</h2></div>{attentionItems.length ? <div className="attention-items">{attentionItems.map((item) => <Link key={item.id} to={item.to}><strong>{item.count}</strong> {item.label}<Icono nombre="arrow-right" size={14} /></Link>)}</div> : <p>{t("dashboard.operationUpToDate", "Operación al día")}</p>}</section>
    <section className="dashboard-grid">
      <article className="dashboard-card orders-card"><div className="card-heading"><div><h2>{t("dashboard.activeOrders")}</h2><p>{t("dashboard.realTimeTracking")}</p></div><div className="dashboard-tabs" role="tablist" aria-label={t("dashboard.activeOrders")}>{[["all", "dashboard.all", stats.active.length], ["reception", "dashboard.reception", stats.recepcion.length], ["ready", "dashboard.ready", stats.delivered.length]].map(([id, label, count]) => <button key={id} type="button" role="tab" aria-selected={filter === id} className={filter === id ? "active" : ""} onClick={() => setFilter(id)}>{t(label)} <span>({count})</span></button>)}</div></div>
        <div className="dashboard-table-wrap"><table className="dashboard-table"><thead><tr><th>{t("dashboard.orderDate")}</th><th>{t("dashboard.equipmentFault")}</th><th>{t("dashboard.client")}</th><th>{t("dashboard.status")}</th><th><span className="sr-only">{t("common.actions")}</span></th></tr></thead><tbody>{visibleOrders.map((order) => { const equipment = equipos.find((item) => item.id === order.equipo_id); const client = clientes.find((item) => item.id === order.cliente_id); const badge = getEstadoBadge(order); return <tr key={order.id} tabIndex={0} aria-label={`OT ${order.numero}: ${translatedStatus(badge.label)}`} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); navigate(`/ordenes/${order.numero}`); } }} onClick={() => navigate(`/ordenes/${order.numero}`)}><td><strong>#{order.numero}</strong><small>{order.fecha_ingreso}</small></td><td><b>{equipment ? `${equipment.marca} ${equipment.modelo}` : t("dashboard.noEquipment")}</b><small>{order.trabajo_solicitado}</small></td><td><b>{client?.nombre || t("dashboard.noClient")}</b><small>{client?.telefono || t("dashboard.noPhone")}</small></td><td><span className="order-status" style={{ backgroundColor: badge.bg }}><span aria-hidden="true">{STATUS_ICONS[badge.label] || "•"} </span>{translatedStatus(badge.label)}</span></td><td aria-hidden="true"><Icono nombre="arrow-right" size={16} /></td></tr>; })}</tbody></table></div>
        <Link className="dashboard-link" to="/ordenes">{t("dashboard.viewAllOrders")} <Icono nombre="arrow-right" size={14} /></Link>
      </article>
      <aside className="dashboard-side" aria-label={t("dashboard.technicalAgenda")}><article className="dashboard-card agenda-card"><div className="card-heading"><div><h2><Icono nombre="calendar" size={17} /> {t("dashboard.technicalAgenda")}</h2><p>{t("dashboard.currentPriorities")}</p></div><span className="count-pill" aria-label={`${agenda.length} ${t("agenda.appointments", { count: agenda.length })}`}>{agenda.length}</span></div><div className="agenda-list">{agenda.map((order) => { const client = clientes.find((item) => item.id === order.cliente_id); return <button key={order.id} type="button" onClick={() => navigate(`/ordenes/${order.numero}`)} aria-label={`OT ${order.numero}, ${client?.nombre || t("dashboard.client")}`}><span className="agenda-order-number">OT #{order.numero}</span><span><b>{client?.nombre || t("dashboard.client")}</b><small>{order.trabajo_solicitado}</small></span><i aria-hidden="true" /></button>; })}</div><Link to="/agenda" className="agenda-action">{t("dashboard.openAgenda")} <Icono nombre="arrow-right" size={14} /></Link></article></aside>
    </section>
    <section className="quick-links" aria-label={t("common.actions")}><QuickLink to="/clientes" icon="users" title={t("dashboard.clientFiles")} text={`${clientes.length} ${t("dashboard.serviceHistory")}`} /><QuickLink to="/equipos" icon="laptop" title={t("dashboard.equipmentRegistered")} text={`${equipos.length} ${t("dashboard.serialTraceable")}`} /><QuickLink to="/cotizaciones" icon="clipboard" title={t("nav.quotes")} text={`${pendingQuotes} ${t("dashboard.pendingEstimates")}`} /></section>
  </main>;
}

function Kpi({ to, icon, tone, label, value, detail }) { return <Link to={to} className="kpi-new"><div><p>{label}</p><strong>{value}</strong></div><span className={`kpi-symbol ${tone}`}><Icono nombre={icon} size={21} /></span><small>{detail}</small></Link>; }
function QuickLink({ to, icon, title, text }) { return <Link to={to} className="quick-link"><span><Icono nombre={icon} size={21} /></span><div><b>{title}</b><small>{text}</small></div><Icono nombre="arrow-right" size={16} /></Link>; }
