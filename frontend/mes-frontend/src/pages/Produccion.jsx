import React, { useState, useMemo } from "react";
import "./Produccion.css";

const Produccion = () => {

  const data = [
    { area: "Entregas a Logística", total: 14140, tipo: "green" },
    { area: "Reformulación RH", total: 204, tipo: "red" },
    { area: "En Preparación", total: 571, tipo: "yellow" },
    { area: "Plotter (Pendiente Impresión)", total: 270, tipo: "gray" }
  ];

  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const totalGeneral = useMemo(() => {
    return data.reduce((acc, item) => acc + item.total, 0);
  }, []);

  const totalSublimado = 16264;
  const entregado = 14140;

  const porcentajeEntregado = ((entregado / totalGeneral) * 100).toFixed(1);
  const adherencia = ((totalSublimado / totalGeneral) * 100).toFixed(1);

  return (
    <div className="produccion-container">
      <h1>Producción</h1>
      <p className="subtitle">Panel general de producción</p>

      {/* FILTROS */}
      <div className="filters">
        <div>
          <label>Fecha Inicio</label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
        </div>

        <div>
          <label>Fecha Fin</label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />
        </div>

        <button>Filtrar</button>
      </div>

      {/* CARDS */}
      <div className="cards">
        <div className="card">
          <h2>{totalGeneral}</h2>
          <p>Total</p>
        </div>

        <div className="card">
          <h2>{totalSublimado}</h2>
          <p>Total Sublimado</p>
        </div>

        <div className="card">
          <h2>{porcentajeEntregado}%</h2>
          <p>Entregado</p>
        </div>

        <div className="card">
          <h2>{adherencia}%</h2>
          <p>Adherencia Plan</p>
        </div>
      </div>

      {/* TABLA */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Área Responsable</th>
              <th>Total</th>
              <th>%</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => {
              const porcentaje = ((item.total / totalGeneral) * 100).toFixed(1);
              return (
                <tr key={index} className={item.tipo}>
                  <td>{item.area}</td>
                  <td>{item.total}</td>
                  <td>{porcentaje}%</td>
                </tr>
              );
            })}

            <tr className="total-row">
              <td>Total</td>
              <td>{totalGeneral}</td>
              <td>100%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Produccion;
