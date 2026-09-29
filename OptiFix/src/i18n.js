import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  es: { translation: {
    "search.placeholder": "Buscar orden, cliente o equipo [/]", "action.newOrder": "Nueva Orden", "action.logout": "Salir", "action.language": "Cambiar idioma",
    "nav.dashboard": "General / Dashboard", "nav.agenda": "Agenda", "nav.serviceCenter": "Centro de Servicios", "nav.orders": "Órdenes de trabajo", "nav.equipment": "Equipos (Historial)", "nav.clients": "Clientes (Historial)", "nav.statistics": "Estadísticas", "nav.quotes": "Cotizaciones", "nav.users": "Usuarios y permisos", "nav.products": "Productos", "nav.services": "Servicios"
    ,"orders.title": "Todas las órdenes", "orders.description": "Gestión completa del flujo de equipos en reparación — OptiFix Centro de Servicios", "orders.all": "Todas las órdenes", "orders.entry": "Entrada", "orders.progress": "En trámite", "orders.workshop": "En taller", "orders.delivered": "Salida / Entregado", "orders.action": "Acción", "orders.viewDetail": "Ver detalle"
    ,"page.dashboard": "Centro de Control y Operaciones", "page.agenda": "Agenda y Citas", "page.equipment": "Gestión de Equipos", "page.clients": "Directorio de Clientes", "page.statistics": "Panel de Estadísticas", "page.quotes": "Cotizaciones y Presupuestos", "page.users": "Usuarios y permisos", "page.products": "Catálogo de Repuestos", "page.services": "Gestión de Servicios", "page.landing": "Sistema de Gestión de Taller Electrónico"
  } },
  en: { translation: {
    "search.placeholder": "Search order, client or equipment [/]", "action.newOrder": "New Order", "action.logout": "Log out", "action.language": "Change language",
    "nav.dashboard": "General / Dashboard", "nav.agenda": "Schedule", "nav.serviceCenter": "Service Center", "nav.orders": "Work orders", "nav.equipment": "Equipment (History)", "nav.clients": "Clients (History)", "nav.statistics": "Statistics", "nav.quotes": "Quotes", "nav.users": "Users & permissions", "nav.products": "Products", "nav.services": "Services"
    ,"orders.title": "All work orders", "orders.description": "Complete management of the repair workflow — OptiFix Service Center", "orders.all": "All orders", "orders.entry": "Intake", "orders.progress": "In progress", "orders.workshop": "Workshop", "orders.delivered": "Dispatch / Delivered", "orders.action": "Action", "orders.viewDetail": "View details"
    ,"page.dashboard": "Control Center & Operations", "page.agenda": "Schedule & Appointments", "page.equipment": "Equipment Management", "page.clients": "Client Directory", "page.statistics": "Statistics Dashboard", "page.quotes": "Quotes & Estimates", "page.users": "Users & permissions", "page.products": "Parts Catalog", "page.services": "Service Management", "page.landing": "Electronic Workshop Management System"
  } }
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("optifix_language") || "es",
  fallbackLng: "es",
  interpolation: { escapeValue: false }
});

i18n.on("languageChanged", (language) => localStorage.setItem("optifix_language", language));
export default i18n;
