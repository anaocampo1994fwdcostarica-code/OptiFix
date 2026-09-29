import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.addVirtualFileSystem(pdfFonts);

export default function ReporteOrdenPDF({ orden, cliente, equipo, archivos = [] }) {
  const generarReportePDF = () => {
    const fotos = archivos.filter((archivo) => archivo.vistaPrevia).map((archivo) => ({ image: archivo.vistaPrevia, width: 180, margin: [0, 8, 8, 8] }));
    const definicionDocumento = {
      content: [
        { text: "OPTIFIX · Reporte de Orden de Servicio", fontSize: 18, bold: true, color: "#0369a1", margin: [0, 0, 0, 10] },
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
  };

  return <button type="button" className="btn-secondary" onClick={generarReportePDF} title="Descargar reporte PDF">Reporte PDF</button>;
}
