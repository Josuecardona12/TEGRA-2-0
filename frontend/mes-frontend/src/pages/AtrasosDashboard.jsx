import { useState, useMemo } from "react";
import "./AtrasosDashboard.css";

export default function AtrasosDashboard() {
  const [areaFiltro, setAreaFiltro] = useState("Todas");
  const [prioridad, setPrioridad] = useState([]);

  const lotes = [
    {
      id: "NK-001",
      area: "Sublimado",
      piezas: 382,
      entrega: new Date("2026-02-05T08:00:00"),
    },
    {
      id: "NK-002",
      area: "Costura",
      piezas: 1200,
      entrega: new Date("2026-02-10T07:00:00"),
    },
    {
      id: "NK-003",
      area: "Empaque",
      piezas: 800,
      entrega: new Date("2026-02-14T06:00:00"),
    },
  ];

  const ahora = new Date();

  const lotesProcesados = lotes
    .map((lote) => {
      const diffMs = ahora - lote.entrega;
      if (diffMs <= 0) return null;

      const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const horas = Math.floor(
        (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );

      let estado = "Leve";
      if (dias >= 7) estado = "Grave";
      else if (dias >= 3) estado = "Medio";

      return { ...lote, dias, horas, estado };
    })
    .filter(Boolean);

  const areas = ["Todas", ...new Set(lotesProcesados.map(l => l.area))];

  const filtrados = useMemo(() => {
    if (areaFiltro === "Todas") return lotesProcesados;
    return lotesProcesados.filter(l => l.area === areaFiltro);
  }, [areaFiltro]);

  const atrasosGraves = lotesProcesados.filter(l => l.estado === "Grave").length;

  const moverAPrioridad = (lote) => {
    if (!prioridad.find(p => p.id === lote.id)) {
      setPrioridad([...prioridad, lote]);
    }
  };

  return (
    <div className="atrasos-container">
      <h1>🚨 Dashboard de Atrasos - NIKE</h1>

      <div className="kpi-box">
        <div className="kpi grave">
          Atrasos Graves: {atrasosGraves}
        </div>
        <div className="kpi total">
          Total Atrasados: {lotesProcesados.length}
        </div>
      </div>

      <div className="filtro">
        <label>Filtrar por Área:</label>
        <select value={areaFiltro} onChange={(e) => setAreaFiltro(e.target.value)}>
          {areas.map(area => (
            <option key={area}>{area}</option>
          ))}
        </select>
      </div>

      <table className="tabla-atrasos">
        <thead>
          <tr>
            <th>Lote</th>
            <th>Área</th>
            <th>Piezas</th>
            <th>Días</th>
            <th>Horas</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {filtrados.map(lote => (
            <tr key={lote.id} className={lote.estado}>
              <td>{lote.id}</td>
              <td>{lote.area}</td>
              <td>{lote.piezas}</td>
              <td>{lote.dias}</td>
              <td>{lote.horas}</td>
              <td>{lote.estado}</td>
              <td>
                <button onClick={() => moverAPrioridad(lote)}>
                  Mover a Prioridad
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {prioridad.length > 0 && (
        <>
          <h2 style={{ marginTop: "40px" }}>🔥 Lotes en Prioridad</h2>
          <ul className="prioridad-lista">
            {prioridad.map(l => (
              <li key={l.id}>
                {l.id} - {l.area} - {l.piezas} piezas
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
