import { useState } from "react";
import "./Reportes.css";

const API_URL = import.meta.env.VITE_API_URL;

const AREAS = [
  { value: "logistica", label: "Logística" },
  { value: "plotter", label: "Plotter" },
  { value: "diseno", label: "Diseño" },
  { value: "rh", label: "RH" },
  { value: "fftt", label: "FFTT" },
  { value: "sublimado", label: "Sublimado" },
  { value: "calidad", label: "Calidad" },
];

// 🔥 MAPEO DE AREA STRING → ID NUMÉRICO (ajusta si tus IDs son distintos)
const AREA_MAP = {
  logistica: 1,
  plotter: 2,
  diseno: 3,
  rh: 4,
  fftt: 5,
  sublimado: 6,
  calidad: 7,
};

export default function Reportes() {
  const [area, setArea] = useState("logistica");
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");
  const [soloCriticos, setSoloCriticos] = useState(false); // aún no usado en backend
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const generarReporte = async () => {
    setMensaje("");

    if (!inicio || !fin) {
      setMensaje("Selecciona ambas fechas.");
      return;
    }

    if (inicio > fin) {
      setMensaje("La fecha inicio no puede ser mayor que la fecha fin.");
      return;
    }

    const areaId = AREA_MAP[area];

    if (!areaId) {
      setMensaje("Área inválida.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/reportes/pdf?area_id=${areaId}&fecha_inicio=${inicio}&fecha_fin=${fin}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Error generando PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte_${area}_${inicio}_a_${fin}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);

      setMensaje("Reporte generado correctamente ✅");

    } catch (error) {
      console.error(error);
      setMensaje("Error generando reporte.");
    }

    setLoading(false);
  };

  return (
    <div className="reportes-container">
      <div className="reportes-card">

        <h2>📊 Módulo de Reportes</h2>
        <p className="subtitulo">Generación automática de reportes en PDF</p>

        <div className="form-group">
          <label>Área</label>
          <select value={area} onChange={(e) => setArea(e.target.value)}>
            {AREAS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Fecha Inicio</label>
          <input
            type="date"
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Fecha Fin</label>
          <input
            type="date"
            value={fin}
            onChange={(e) => setFin(e.target.value)}
          />
        </div>

        <div className="checkbox-group">
          <input
            type="checkbox"
            checked={soloCriticos}
            onChange={(e) => setSoloCriticos(e.target.checked)}
          />
          <span>Solo registros críticos</span>
        </div>

        <button
          className="btn-generar"
          onClick={generarReporte}
          disabled={loading}
        >
          {loading ? "Generando..." : "Generar Reporte"}
        </button>

        {mensaje && <p className="mensaje">{mensaje}</p>}

      </div>
    </div>
  );
}
