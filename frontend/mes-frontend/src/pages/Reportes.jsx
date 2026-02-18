import { useState } from "react";
import "./Reportes.css";

const API_URL = import.meta.env.VITE_API_URL;

const AREAS = [
  { value: "logistica", label: "Logística " },
  { value: "plotter", label: "Plotter " },
  { value: "diseno", label: "Diseño " },
  { value: "RH", label: "RH" },
  { value: "fftt", label: "FFTT " },
  { value: "sublimado", label: "Sublimado " },
  { value: "calidad", label: "Calidad " },
];

export default function Reportes() {
  const [area, setArea] = useState("logistica");
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");
  const [soloCriticos, setSoloCriticos] = useState(false);
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

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/reportes/${area}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inicio,
          fin,
          solo_criticos: soloCriticos,
        }),
      });

      if (!response.ok) {
        throw new Error("Error del servidor");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte_${area}_${inicio}_a_${fin}.pdf`;
      a.click();

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
        <p className="subtitulo">
          Generación de reportes por área
        </p>

        {/* AREA */}
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

        {/* FECHA INICIO */}
        <div className="form-group">
          <label>Fecha Inicio</label>
          <input
            type="date"
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
          />
        </div>

        {/* FECHA FIN */}
        <div className="form-group">
          <label>Fecha Fin</label>
          <input
            type="date"
            value={fin}
            onChange={(e) => setFin(e.target.value)}
          />
        </div>

        {/* CHECKBOX */}
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
