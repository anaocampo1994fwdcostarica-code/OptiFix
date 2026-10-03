import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { WORKSHOP_NAME } from "../config/workshop.js";
import { useFocusTrap } from "../hooks/useFocusTrap.js";

pdfMake.addVirtualFileSystem(pdfFonts);

export function descargarReportePDF({ orden, cliente, equipo, archivos = [] }) {
    const fotos = archivos.filter((archivo) => archivo.vistaPrevia).map((archivo) => ({ image: archivo.vistaPrevia, width: 180, margin: [0, 8, 8, 8] }));
    const definicionDocumento = {
      content: [
        { text: `${WORKSHOP_NAME} · Reporte de Orden de Servicio`, fontSize: 18, bold: true, color: "#0369a1", margin: [0, 0, 0, 10] },
        { text: `Orden N°: ${orden.numero}`, fontSize: 14, bold: true, margin: [0, 0, 0, 14] },
        { table: { widths: ["*", "*"], body: [[{ text: `Cliente: ${cliente.nombre || "—"}`, bold: true }, { text: `Equipo: ${equipo.tipo || "—"}`, bold: true }], [{ text: `Correo: ${cliente.email || "—"}` }, { text: `Teléfono: ${cliente.telefono || "—"}` }], [{ text: `Modelo: ${[equipo.marca, equipo.modelo].filter(Boolean).join(" ") || "—"}` }, { text: `Serie: ${equipo.serie || "—"}` }]] }, margin: [0, 0, 0, 14] },
        { text: "Trabajo solicitado", bold: true, margin: [0, 0, 0, 4] },
        { text: orden.trabajo_solicitado || "Sin detalle", margin: [0, 0, 0, 14] },
        { text: "Documentación Digital y Fotografías del Equipo", fontSize: 12, bold: true, margin: [0, 0, 0, 6] },
        { ul: archivos.map((archivo) => `Archivo: ${archivo.nombre} (${archivo.tamano || "—"}) · ${archivo.fecha || ""}`) },
        ...(fotos.length ? [{ columns: fotos, margin: [0, 8, 0, 0] }] : [])
      ],
      defaultStyle: { fontSize: 10 }
    };
    pdfMake.createPdf(definicionDocumento).download(`Orden_${orden.numero}_Reporte.pdf`);
}

export function VistaPreviaReporteOrden({ orden, cliente, equipo, archivos = [], onClose, onPrint }) {
  const dialogRef = useFocusTrap(true, onClose);
  const fotos = archivos.filter((archivo) => archivo.vistaPrevia);
  const modelo = [equipo.marca, equipo.modelo].filter(Boolean).join(" ") || "Sin especificar";

  return (
    <div className="report-preview-overlay" onMouseDown={onClose}>
      <section ref={dialogRef} tabIndex={-1} className="report-preview-modal" role="dialog" aria-modal="true" aria-labelledby="report-preview-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className="report-preview-header">
          <div>
            <span className="report-preview-eyebrow">{WORKSHOP_NAME}</span>
            <h2 id="report-preview-title">Vista previa · Orden N° {orden.numero}</h2>
          </div>
          <button type="button" className="report-preview-close" onClick={onClose} aria-label="Cerrar vista previa">×</button>
        </header>

        <div className="report-preview-paper">
          <h3>Reporte de Orden de Servicio</h3>
          <p className="report-preview-status">Estado: <strong>{orden.estado_actual || "Sin estado"}</strong></p>
          <div className="report-preview-details">
            <div><span>Cliente</span><strong>{cliente.nombre || "Sin cliente"}</strong><small>{cliente.telefono || cliente.email || "Sin contacto"}</small></div>
            <div><span>Equipo</span><strong>{equipo.tipo || "Equipo"}</strong><small>{modelo} · Serie: {equipo.serie || "—"}</small></div>
          </div>
          <div className="report-preview-work">
            <span>Trabajo solicitado</span>
            <p>{orden.trabajo_solicitado || "Sin detalle registrado."}</p>
          </div>
          <div className="report-preview-files">
            <span>Documentación y fotografías ({archivos.length})</span>
            {fotos.length > 0 ? (
              <div className="report-preview-images">
                {fotos.slice(0, 4).map((archivo) => <img key={archivo.id || archivo.nombre} src={archivo.vistaPrevia} alt={archivo.nombre || "Archivo adjunto"} />)}
              </div>
            ) : <p>No hay fotografías adjuntas para esta orden.</p>}
          </div>
        </div>

        <footer className="report-preview-actions">
          <button type="button" className="btn-secondary" onClick={() => descargarReportePDF({ orden, cliente, equipo, archivos })}>Descargar PDF</button>
          <button type="button" className="btn-primary" onClick={onPrint}>Imprimir orden</button>
        </footer>
      </section>
    </div>
  );
}

export default function ReporteOrdenPDF({ onOpenPreview }) {
  return <button type="button" className="btn-secondary" onClick={onOpenPreview} title="Vista previa del reporte PDF">Reporte PDF</button>;
}
