import React, { useEffect, useState } from "react";
import "./PlanSemanal.css";

const PlanSemanal = () => {
  const [backlog, setBacklog] = useState(1533);
  const [plan, setPlan] = useState(7955);
  const [pull, setPull] = useState(2681);

  const [animate, setAnimate] = useState(false);

  const [lotes, setLotes] = useState([
    {
      lote: "NK-137",
      area: "Sublimado",
      piezas: 1342,
      fecha: "2/15/2026 6:00 AM",
      dias: 4,
      horas: 4,
      estado: "Atraso Grave",
    },
    {
      lote: "NK-79",
      area: "Costura",
      piezas: 572,
      fecha: "2/15/2026 6:00 AM",
      dias: 7,
      horas: 3,
      estado: "Medio",
    },
    {
      lote: "NK-6",
      area: "Sublimado",
      piezas: 1249,
      fecha: "2/15/2026 6:00 AM",
      dias: 8,
      horas: 3,
      estado: "Atraso Grave",
    },
  ]);

  // 🔥 TIEMPO REAL
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimate(true);

      setBacklog((prev) => prev + Math.floor(Math.random() * 20));
      setPlan((prev) => prev + Math.floor(Math.random() * 40));
      setPull((prev) => prev + Math.floor(Math.random() * 25));

      const nuevoLote = {
        lote: `NK-${Math.floor(Math.random() * 500)}`,
        area: ["Sublimado", "Costura", "Empaque"][
          Math.floor(Math.random() * 3)
        ],
        piezas: Math.floor(Math.random() * 1500),
        fecha: "2/15/2026 6:00 AM",
        dias: Math.floor(Math.random() * 12),
        horas: Math.floor(Math.random() * 6),
        estado: Math.random() > 0.5 ? "Atraso Grave" : "Medio",
      };

      setLotes((prev) => [...prev.slice(-6), nuevoLote]);

      setTimeout(() => setAnimate(false), 600);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const total = backlog + plan + pull;

  return (
    <div className="plan-container">
      {/* HEADER */}
      <div className="plan-header">
        <h1>Plan Semanal - NIKE</h1>

        <div className="live-indicator">
          <div className="live-dot"></div>
          LIVE
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi">
          <h3>Backlog</h3>
          <p className={animate ? "number-animate" : ""}>{backlog}</p>
        </div>

        <div className="kpi">
          <h3>Plan</h3>
          <p className={animate ? "number-animate" : ""}>{plan}</p>
        </div>

        <div className="kpi">
          <h3>Pull</h3>
          <p className={animate ? "number-animate" : ""}>{pull}</p>
        </div>

        <div className="kpi">
          <h3>Total</h3>
          <p className={animate ? "number-animate" : ""}>{total}</p>
        </div>
      </div>

      {/* TABLA */}
      <div className="tabla-container">
        <h2>🚨 Lotes Atrasados - NIKE</h2>

        <table>
          <thead>
            <tr>
              <th>Lote</th>
              <th>Área</th>
              <th>Piezas</th>
              <th>Fecha Entrega</th>
              <th>Días</th>
              <th>Horas</th>
              <th>Estado</th>
            </tr>
          </thead>

          <tbody>
            {lotes.map((l, index) => (
              <tr key={index} className="new-row">
                <td>{l.lote}</td>
                <td>{l.area}</td>
                <td>{l.piezas}</td>
                <td>{l.fecha}</td>

                <td>
                  {l.dias}
                  <div
                    className="severity-bar"
                    style={{ width: `${l.dias * 8}%` }}
                  ></div>
                </td>

                <td>{l.horas}</td>

                <td>
                  <span
                    className={
                      l.estado === "Atraso Grave"
                        ? "badge grave"
                        : "badge medio"
                    }
                  >
                    {l.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlanSemanal;
