import { useEffect, useState } from "react";
import "./Ordenes.css";

export default function Ordenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [filtro, setFiltro] = useState("Todas");

  useEffect(() => {
    const ahora = new Date();
    const turno = obtenerTurno(ahora.getHours());

    setOrdenes([
      { id: "ORD-001", turno, area: "Producción", estado: "En Proceso", inicio: ahora },
      { id: "ORD-002", turno, area: "Calidad", estado: "Pendiente", inicio: ahora },
      { id: "ORD-003", turno, area: "Logística", estado: "Completado", inicio: ahora },
      { id: "ORD-004", turno, area: "Sublimado", estado: "En Proceso", inicio: ahora },
      { id: "ORD-005", turno, area: "Reposición", estado: "Pendiente", inicio: ahora },
      { id: "ORD-006", turno, area: "Producción", estado: "En Proceso", inicio: ahora },
    ]);
  }, []);

  function obtenerTurno(hora) {
    if (hora >= 6 && hora < 14) return "Mañana";
    if (hora >= 14 && hora < 22) return "Tarde";
    return "Noche";
  }

  const ordenesFiltradas =
    filtro === "Todas"
      ? ordenes
      : ordenes.filter((o) => o.estado === filtro);

  const total = ordenes.length;
  const enProceso = ordenes.filter(o => o.estado === "En Proceso").length;
  const pendientes = ordenes.filter(o => o.estado === "Pendiente").length;
  const completadas = ordenes.filter(o => o.estado === "Completado").length;

  return (
    <div className="dashboard-container">

      {/* 🔹 Header */}
      <div className="dashboard-header">
        <div>
          <h1>Órdenes</h1>
          <p>Panel general de producción</p>
        </div>
      </div>

      {/* 🔹 KPIs */}
      <div className="kpi-grid">
        <KPI titulo="Total" valor={total} />
        <KPI titulo="En Proceso" valor={enProceso} />
        <KPI titulo="Pendientes" valor={pendientes} />
        <KPI titulo="Completadas" valor={completadas} />
      </div>

      {/* 🔹 Filtros tipo tabs */}
      <div className="tabs">
        {["Todas", "En Proceso", "Pendiente", "Completado"].map(tab => (
          <button
            key={tab}
            className={filtro === tab ? "active-tab" : ""}
            onClick={() => setFiltro(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 🔹 Grid de órdenes */}
      <div className="ordenes-grid">
        {ordenesFiltradas.map((orden) => (
          <OrdenCard key={orden.id} orden={orden} />
        ))}
      </div>

    </div>
  );
}

function KPI({ titulo, valor }) {
  return (
    <div className="kpi-card">
      <h3>{valor}</h3>
      <p>{titulo}</p>
    </div>
  );
}

function OrdenCard({ orden }) {
  const [tiempo, setTiempo] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const ahora = new Date();
      const diff = ahora - new Date(orden.inicio);

      const horas = Math.floor(diff / 3600000);
      const minutos = Math.floor((diff % 3600000) / 60000);
      const segundos = Math.floor((diff % 60000) / 1000);

      setTiempo(
        `${horas.toString().padStart(2, "0")}:${minutos
          .toString()
          .padStart(2, "0")}:${segundos.toString().padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [orden.inicio]);

  return (
    <div className="orden-card">
      <div className="orden-top">
        <h4>{orden.id}</h4>
        <span className={`estado ${orden.estado.replace(" ", "")}`}>
          {orden.estado}
        </span>
      </div>

      <p><strong>Área:</strong> {orden.area}</p>
      <p><strong>Turno:</strong> {orden.turno}</p>
      <p><strong>Tiempo:</strong> {tiempo}</p>

      <div className="acciones">
        <button>Editar</button>
        <button className="finalizar">Finalizar</button>
      </div>
    </div>
  );
}

