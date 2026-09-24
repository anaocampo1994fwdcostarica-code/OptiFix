import Icono from "./icons.jsx";

// La línea de tiempo de etapas del expediente electrónico.
export default function EtapasProgreso({ etapas, porcentaje }) {
  return (
    <>
      <div className="progress" role="progressbar" aria-valuenow={porcentaje} aria-valuemin="0" aria-valuemax="100">
        <div className="progress__bar" style={{ width: `${porcentaje}%` }} />
      </div>
      <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginBottom: 0 }}>
        Progreso del expediente: <strong>{porcentaje}%</strong>
      </p>

      <ol className="stepper">
        {etapas.map((etapa, indice) => {
          const clase = etapa.completado
            ? "step step--done"
            : etapa.en_curso
              ? "step step--current"
              : "step";
          return (
            <li key={etapa.etapa} className={clase}>
              <span className="step__dot" aria-hidden="true">
                {etapa.completado ? <Icono nombre="check-circle" size={20} /> : indice + 1}
              </span>
              <div className="step__body">
                <h4>{etapa.etapa}</h4>
                <p>
                  {etapa.completado
                    ? `Completada el ${etapa.fecha}`
                    : etapa.en_curso
                      ? "En curso"
                      : "Pendiente"}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}