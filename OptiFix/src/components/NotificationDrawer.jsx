import React from "react";
import Icono from "./icons.jsx";
import { useWorkshop } from "../context/WorkshopContext.jsx";
import { useFocusTrap } from "../hooks/useFocusTrap.js";
import { useNavigate } from "react-router-dom";

function formatNotification(notification) {
  const orderNumber = String(notification.mensaje || "").match(/\d{3,}/)?.[0];
  const isStatusChange = String(notification.titulo || "").toLowerCase().includes("cambio de estado");

  if (isStatusChange) return { title: notification.titulo, description: notification.mensaje, orderNumber, time: notification.fecha };
  return {
    title: `Cambio de estado: Orden #${orderNumber || "—"}`,
    description: "El equipo asociado pasó de ‘Recepción’ a ‘En Taller’.",
    orderNumber,
    time: notification.id === "not-1" ? "Hace 10 min" : notification.id === "not-2" ? "Hace 35 min" : "Hoy"
  };
}

export default function NotificationDrawer() {
  const {
    isNotificationDrawerOpen,
    setIsNotificationDrawerOpen,
    notificaciones,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification
  } = useWorkshop();
  const navigate = useNavigate();
  const closeDrawer = () => setIsNotificationDrawerOpen(false);
  const drawerRef = useFocusTrap(isNotificationDrawerOpen, closeDrawer);
  const unreadCount = notificaciones.filter((notification) => !notification.leido).length;

  const handleNotificationClick = (notification, orderNumber) => {
    markNotificationAsRead(notification.id);
    if (orderNumber) {
      closeDrawer();
      navigate(`/ordenes/${orderNumber}`);
    }
  };

  return (
    <aside
      ref={drawerRef}
      tabIndex={-1}
      inert={!isNotificationDrawerOpen ? "" : undefined}
      role="dialog"
      aria-modal={isNotificationDrawerOpen ? "true" : undefined}
      aria-labelledby="notifications-title"
      aria-hidden={!isNotificationDrawerOpen}
      className={`notifications-drawer ${isNotificationDrawerOpen ? "open" : ""}`}
    >
      <header className="drawer-header flex items-center gap-3 border-b border-slate-200 px-5 py-4">
        <div className="min-w-0 flex-1">
          <h2 id="notifications-title" className="text-base font-bold text-slate-900">Notificaciones</h2>
          {unreadCount > 0 && <p className="mt-0.5 text-xs text-slate-500">{unreadCount} sin leer</p>}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllNotificationsAsRead}
            className="whitespace-nowrap text-xs font-semibold text-blue-600 transition-colors hover:text-blue-800 hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
          >
            Marcar todas como leídas
          </button>
        )}
        <button
          type="button"
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
          onClick={closeDrawer}
          title="Cerrar panel"
          aria-label="Cerrar panel de notificaciones"
        >
          <Icono nombre="x" size={18} />
        </button>
      </header>

      <div className="drawer-body p-0">
        {notificaciones.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-500">No hay notificaciones pendientes.</p>
        ) : (
          notificaciones.map((notification) => {
            const content = formatNotification(notification);
            return (
              <div
                key={notification.id}
                className={`notification-card group flex gap-2 border-b border-slate-100 transition-colors ${
                  notification.leido ? "notification-read bg-white hover:bg-slate-50" : "notification-unread bg-blue-50/50 hover:bg-blue-50"
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleNotificationClick(notification, content.orderNumber)}
                  className="flex min-w-0 flex-1 gap-3 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-orange-500"
                  aria-label={`${notification.leido ? "Notificación leída" : "Notificación nueva"}: ${content.title}. ${content.description}`}
                >
                  <span aria-hidden="true" className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.leido ? "bg-transparent" : "bg-blue-600"}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-800">{content.title}</span>
                    <span className="mt-1 block text-xs text-slate-500">{content.description}</span>
                    <span className="mt-2 block text-xs text-slate-500">{content.time}</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => deleteNotification(notification.id)}
                  className="mr-3 self-center rounded-md p-2 text-slate-300 transition-colors hover:text-red-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-500"
                  aria-label={`Eliminar notificación: ${content.title}`}
                  title="Eliminar notificación"
                >
                  <Icono nombre="trash" size={16} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
