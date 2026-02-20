import { useState, useEffect, useMemo } from "react";
import "./AtrasosDashboard.css";

export default function AtrasosDashboard() {
  const [lotes, setLotes] = useState([]);
  const [ahora, setAhora] = useState(new Date());
  const [areaFiltro, setAreaFiltro] = useState("Todas");

  // 🔄 reloj en tiempo real
  useEffect(() => {
    const reloj = setInterval(() => {
      setAhora(new Date());
    }, 1000);
    return () => clearInterval(reloj);
  }, []);

  // 🔥 Generar lote aleatorio
  const generarLote = () => {
    const areas = ["Sublimado", "Costura", "Empaque", "Corte", "Estampado"];
    const diasAtraso = Math.floor(Math.random() * 12) + 1;

    return {
      id: "NK-" + Math.floor(Math.random() * 900 + 100),
      area: areas[Math.floor(Math.random() * areas.length)],
      piezas: Math.floor(Math.random() * 2000 + 200),
      entrega: new Date(Date.now() - diasAtraso * 24 * 60 * 60 * 1000),
    };
  };

  // 🔥 Cargar muchos lotes iniciales
  useEffect(() => {
    const iniciales = [];
    for (let i = 0; i < 10; i++) {
      iniciales.push(generarLote());
    }
    setLotes(iniciales);

    // 🔄 cada 6 segundos entra uno nuevo
    const intervalo = setInterval(() => {
      setLotes(prev => [...prev, generarLote()]);
    }, 6000);

    return () => clearInterval(intervalo);
  }, []);

  const lotesProcesados = lotes
    .map(lote => {
      const diffMs = ahora - lote.entrega;
      if (diffMs <= 0) return null;

      const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const horas = Math.floor(
        (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );

      let estado = "leve";
      if (dias >= 7) estado = "grave";
      else if (dias >= 3) estado = "medio";

      return { ...lote, dias, horas, estado };
    })
    .filter(Boolean);

  const areas = ["Todas", ...new Set(lotesProcesados.map(l => l.area))];

  const filtrados = useMemo(() => {
    if (areaFiltro === "Todas") return lotesProcesados;
    return lotesProcesados.filter(l => l.area === areaFiltro);
  }, [areaFiltro, lotesProcesados]);

  const atrasosGraves = lotesProcesados.filter(
    l => l.estado === "grave"
  ).length;

  return (
    <div className="dashboard-container">
      <div className="header">
        <h1>Dashboard de Atrasos - NIKE</h1>
        <div className="live-badge">● LIVE</div>
      </div>

      <div className="clock">
        {ahora.toLocaleString()}
      </div>

      <div className="kpis">
        <div className="kpi-card grave-card">
          <h2>{atrasosGraves}</h2>
          <p>Atrasos Graves</p>
        </div>

        <div className="kpi-card total-card">
          <h2>{lotesProcesados.length}</h2>
          <p>Total Atrasados</p>
        </div>
      </div>

      <div className="filter-box">
        <label>Área:</label>
        <select
          value={areaFiltro}
          onChange={e => setAreaFiltro(e.target.value)}
        >
          {areas.map(area => (
            <option key={area}>{area}</option>
          ))}
        </select>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Lote</th>
              <th>Área</th>
              <th>Piezas</th>
              <th>Días</th>
              <th>Horas</th>
              <th>Estado</th>
              <th>Progreso</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map(lote => (
              <tr key={lote.id} className={`row ${lote.estado}`}>
                <td>{lote.id}</td>
                <td>{lote.area}</td>
                <td>{lote.piezas}</td>
                <td>{lote.dias}</td>
                <td>{lote.horas}</td>
                <td>
                  <span className={`badge ${lote.estado}`}>
                    {lote.estado.toUpperCase()}
                  </span>
                </td>
                <td>
                  <div className="barra">
                    <div
                      className={`barra-interna ${lote.estado}`}
                      style={{
                        width: `${Math.min(lote.dias * 8, 100)}%`,
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
