import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { OptifixBrand } from "../components/OptifixLogo.jsx";
import { preguntarChatPublico } from "../services/n8nBackendService.js";

// Lee datos del localStorage (misma key que el contexto)
function getDataFromStorage() {
  try {
    const saved = localStorage.getItem("optifix_data_v1");
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return null;
}

const ESTADO_CONFIG = {
  "RECEPCIÓN": { color: "#a3e635", bg: "#1a2e0a", icon: "📥", label: "Recepción / Ingresado" },
  "EN TALLER": { color: "#0ea5e9", bg: "#0a1f30", icon: "🔧", label: "En Taller — En reparación" },
  "PRESUPUESTO ENVIADO": { color: "#eab308", bg: "#2a200a", icon: "💬", label: "Presupuesto Comunicado" },
  "REPARADO": { color: "#22c55e", bg: "#0a2a18", icon: "✅", label: "Reparado — Listo para retirar" },
  "ENTREGADO": { color: "#8b5cf6", bg: "#1a0a3a", icon: "🎉", label: "Entregado al Cliente" }
};

function getEstadoConfig(estado) {
  const key = Object.keys(ESTADO_CONFIG).find(
    (k) => k === (estado || "").toUpperCase()
  );
  return ESTADO_CONFIG[key] || { color: "#64748b", bg: "#1a1a2e", icon: "⏳", label: estado };
}

export default function SeguimientoPublico() {
  const { token } = useParams();
  const [mensaje, setMensaje] = useState("");
  const [chat, setChat] = useState([{ remitente: "ia", texto: "Hola, soy el asistente virtual de OptiFix. Puedo ayudarte con el estado de tu reparación." }]);
  const storageData = getDataFromStorage();

  if (!storageData) {
    return <ErrorView message="No se pudo cargar la base de datos del sistema." />;
  }

  // Buscar orden por token (ORD-XXXX) o número
  const orden = storageData.ordenes?.find(
    (o) =>
      o.token_seguimiento === token ||
      String(o.numero) === token ||
      `ORD-${o.numero}` === token
  );

  if (!orden) {
    return (
      <ErrorView
        message={`No se encontró ninguna orden con el código "${token}".`}
        hint="Verificá el enlace o consultá directamente en el taller."
      />
    );
  }

  const cliente = storageData.clientes?.find((c) => c.id === orden.cliente_id);
  const equipo = storageData.equipos?.find((e) => e.id === orden.equipo_id);
  const estadoConf = getEstadoConfig(orden.estado_actual);
  const enviarMensajeAlChatbot = async (event) => {
    event.preventDefault();
    if (!mensaje.trim()) return;
    const pregunta = mensaje.trim();
    const conversacion = [...chat, { remitente: "cliente", texto: pregunta }];
    setChat(conversacion); setMensaje("");
    try { const data = await preguntarChatPublico({ ordenId: orden.id, token, pregunta }); setChat([...conversacion, { remitente: "ia", texto: data.data?.respuesta || data.respuesta || `Tu orden está en estado ${orden.estado_actual}. Para detalles técnicos, comunicate con el taller.` }]); }
    catch { setChat([...conversacion, { remitente: "ia", texto: "Lo siento, hubo un error procesando tu consulta." }]); }
  };

  return (
    <div className="seguimiento-root">
      {/* Header público */}
      <header className="seguimiento-header">
        <Link to="/" style={{ textDecoration: "none" }}>
          <OptifixBrand size={30} textSize={18} />
        </Link>
        <span className="seguimiento-badge-header">Seguimiento de Orden</span>
      </header>

      <div className="seguimiento-content">
        {/* Estado principal destacado */}
        <div className="seguimiento-estado-card" style={{ borderColor: estadoConf.color, background: estadoConf.bg }}>
          <div className="seguimiento-estado-icon">{estadoConf.icon}</div>
          <div>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "1px" }}>
              Estado actual de tu equipo
            </div>
            <div style={{ fontSize: "24px", fontWeight: 800, color: estadoConf.color }}>
              {estadoConf.label}
            </div>
            <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
              Última actualización: {orden.linea_tiempo?.[orden.linea_tiempo.length - 1]?.fecha || orden.fecha_ingreso}
            </div>
          </div>
        </div>

        {/* Info de la orden */}
        <div className="seguimiento-grid">
          <div className="seguimiento-info-card">
            <h3>📋 Datos de la Orden</h3>
            <div className="seguimiento-info-row">
              <span>N° de Orden</span>
              <strong>#{orden.numero}</strong>
            </div>
            <div className="seguimiento-info-row">
              <span>Fecha de ingreso</span>
              <strong>{orden.fecha_ingreso}</strong>
            </div>
            {orden.fecha_entrega && (
              <div className="seguimiento-info-row">
                <span>Fecha de entrega</span>
                <strong style={{ color: "#22c55e" }}>{orden.fecha_entrega}</strong>
              </div>
            )}
            <div className="seguimiento-info-row">
              <span>Trabajo solicitado</span>
              <strong>{orden.trabajo_solicitado}</strong>
            </div>
          </div>

          <div className="seguimiento-info-card">
            <h3>🔌 Equipo</h3>
            <div className="seguimiento-info-row">
              <span>Marca</span>
              <strong>{equipo?.marca || "—"}</strong>
            </div>
            <div className="seguimiento-info-row">
              <span>Modelo</span>
              <strong>{equipo?.modelo || "NO TRAE MODELO"}</strong>
            </div>
            <div className="seguimiento-info-row">
              <span>N° de Serie</span>
              <strong style={{ fontFamily: "monospace" }}>{equipo?.serie || "—"}</strong>
            </div>
            <div className="seguimiento-info-row">
              <span>Tipo</span>
              <strong>{equipo?.tipo || "—"}</strong>
            </div>
            {equipo?.falla_reportada && (
              <div className="seguimiento-info-row">
                <span>Falla reportada</span>
                <strong>{equipo.falla_reportada}</strong>
              </div>
            )}
          </div>

          {cliente && (
            <div className="seguimiento-info-card">
              <h3>👤 Cliente</h3>
              <div className="seguimiento-info-row">
                <span>Nombre</span>
                <strong>{cliente.nombre} {cliente.apellido || ""}</strong>
              </div>
              {cliente.telefono && (
                <div className="seguimiento-info-row">
                  <span>Teléfono</span>
                  <strong>
                    <a href={`tel:${cliente.telefono}`} style={{ color: "#38bdf8" }}>
                      {cliente.telefono}
                    </a>
                  </strong>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="seguimiento-info-card">
          <h3>Boleta digital</h3>
          <div className="seguimiento-info-row"><span>Adelanto</span><strong>₡{Number(orden.adelanto || 0).toLocaleString("es-CR")}</strong></div>
          <div className="seguimiento-info-row"><span>Servicios y repuestos</span><strong>{(orden.productos_servicios || []).length} concepto(s)</strong></div>
          <p style={{ color: "#94a3b8", fontSize: "12px" }}>La boleta y actualizaciones serán enviadas al correo registrado del cliente.</p>
        </div>

        {/* Línea de tiempo */}
        {orden.linea_tiempo && orden.linea_tiempo.length > 0 && (
          <div className="seguimiento-timeline-card">
            <h3>🕒 Historial de Estado</h3>
            <div className="seguimiento-timeline">
              {[...orden.linea_tiempo].reverse().map((item, idx) => {
                const conf = getEstadoConfig(item.estado);
                return (
                  <div key={idx} className="seg-timeline-item">
                    <div
                      className="seg-timeline-dot"
                      style={{ background: conf.color, boxShadow: idx === 0 ? `0 0 10px ${conf.color}` : "none" }}
                    />
                    <div className="seg-timeline-body">
                      <div style={{ fontWeight: 700, color: conf.color, fontSize: "14px" }}>
                        {conf.icon} {item.estado}
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                        {item.fecha} · {item.detalle}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="seguimiento-timeline-card seguimiento-chat">
          <h3>Asistente Virtual OptiFix</h3>
          <div className="seguimiento-chat-messages">{chat.map((item, index) => <div key={index} className={`seguimiento-chat-message ${item.remitente}`}><span>{item.texto}</span></div>)}</div>
          <form onSubmit={enviarMensajeAlChatbot} className="seguimiento-chat-form"><input value={mensaje} onChange={(event) => setMensaje(event.target.value)} placeholder="Pregúntale algo sobre tu reparación..." /><button type="submit">Enviar</button></form>
        </div>

        {/* Nota al pie */}
        <div className="seguimiento-footer-note">
          <p>
            ¿Tenés alguna consulta? Contactanos directamente por WhatsApp o teléfono.
            Este enlace se actualiza automáticamente con el estado de tu reparación.
          </p>
          <div style={{ fontSize: "12px", color: "#475569", marginTop: "8px" }}>
            OptiFix — Sistema de Gestión de Taller · {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorView({ message, hint }) {
  return (
    <div className="seguimiento-root">
      <header className="seguimiento-header">
        <Link to="/" style={{ textDecoration: "none" }}>
          <OptifixBrand size={30} textSize={18} />
        </Link>
      </header>
      <div className="seguimiento-content" style={{ textAlign: "center", paddingTop: "80px" }}>
        <div style={{ fontSize: "60px", marginBottom: "20px" }}>🔍</div>
        <h2 style={{ color: "#ffffff", marginBottom: "12px" }}>Orden no encontrada</h2>
        <p style={{ color: "#64748b", marginBottom: "8px" }}>{message}</p>
        {hint && <p style={{ color: "#475569", fontSize: "13px" }}>{hint}</p>}
        <Link to="/" style={{ display: "inline-block", marginTop: "28px", color: "#38bdf8" }}>
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}
