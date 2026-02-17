import { useState, useEffect } from "react";
import "./PlanSemanal.css";

export default function PlanSemanal() {
  const [datos, setDatos] = useState([]);

  useEffect(() => {
    // SOLO NIKE
    const dataNike = [
      { wk: 7, backlog: 382, plan: 0, pull: 0 },
      { wk: 8, backlog: 0, plan: 5720, pull: 1216 },
    ];

    setDatos(dataNike);
  }, []);

  const totalBacklog = datos.reduce((acc, d) => acc + d.backlog, 0);
  const totalPlan = datos.reduce((acc, d) => acc + d.plan, 0);
  const totalPull = datos.reduce((acc, d) => acc + d.pull, 0);

  const grandTotal = totalBacklog + totalPlan + totalPull;

  const backlogPercent =
    grandTotal > 0 ? ((totalBacklog / grandTotal) * 100).toFixed(2) : 0;

  const planPercent =
    grandTotal > 0 ? ((totalPlan / grandTotal) * 100).toFixed(2) : 0;

  return (
    <div className="plan-container">
      <h1>📊 Plan Semanal - NIKE</h1>

      <div className="resumen-box">
        <div className="kpi backlog">
          <h3>Backlog</h3>
          <p>{totalBacklog}</p>
        </div>

        <div className="kpi plan">
          <h3>Plan</h3>
          <p>{totalPlan}</p>
        </div>

        <div className="kpi pull">
          <h3>Pull</h3>
          <p>{totalPull}</p>
        </div>

        <div className="kpi total">
          <h3>Total</h3>
          <p>{grandTotal}</p>
        </div>
      </div>

      <table className="tabla-plan">
        <thead>
          <tr>
            <th>WK</th>
            <th>Backlog</th>
            <th>Plan</th>
            <th>Pull</th>
            <th>Total WK</th>
          </tr>
        </thead>
        <tbody>
          {datos.map((d, index) => (
            <tr key={index}>
              <td>{d.wk}</td>
              <td className="backlog-cell">{d.backlog}</td>
              <td className="plan-cell">{d.plan}</td>
              <td className="pull-cell">{d.pull}</td>
              <td>{d.backlog + d.plan + d.pull}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="porcentajes">
        <div className="percent backlog-percent">
          BACKLOG -1WK: {backlogPercent}%
        </div>
        <div className="percent plan-percent">
          PLAN: {planPercent}%
        </div>
      </div>
      {/* ================== LOTES ATRASADOS DETALLADO ================== */}

<h2 style={{ marginTop: "40px" }}>🚨 Lotes Atrasados - NIKE</h2>

<table className="tabla-atrasados">
  <thead>
    <tr>
      <th>Lote</th>
      <th>Área</th>
      <th>Piezas</th>
      <th>Fecha Entrega</th>
      <th>Días Atraso</th>
      <th>Horas Atraso</th>
      <th>Estado</th>
    </tr>
  </thead>
  <tbody>
    {[
      {
        id: "NK-001",
        area: "Sublimado",
        piezas: 382,
        entrega: new Date("2026-02-10T08:00:00"),
      },
      {
        id: "NK-002",
        area: "Costura",
        piezas: 1200,
        entrega: new Date("2026-02-12T07:00:00"),
      },
    ].map((lote) => {
      const ahora = new Date();
      const diffMs = ahora - lote.entrega;

      if (diffMs <= 0) return null;

      const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const horas = Math.floor(
        (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );

      let estado = "Atraso Leve";
      if (dias >= 7) estado = "Atraso Grave";
      else if (dias >= 3) estado = "Atraso Medio";

      return (
        <tr key={lote.id} className={estado.replace(" ", "-")}>
          <td>{lote.id}</td>
          <td>{lote.area}</td>
          <td>{lote.piezas}</td>
          <td>{lote.entrega.toLocaleString()}</td>
          <td>{dias}</td>
          <td>{horas}</td>
          <td>{estado}</td>
        </tr>
      );
    })}
  </tbody>
</table>

    </div>
    
  );
}


