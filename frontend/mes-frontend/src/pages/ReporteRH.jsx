import React, { useState, useMemo, useEffect } from "react";
import "./ProduccionLive.css";

const dataInicial = [
  {
    po: "V108707",
    sport: "Baseball",
    week: 7,
    pc: 15,
    sublimado: "11/26",
    maquina: "8B",
    turno: "A",
    status: "OK",
  },
  {
    po: "V109133",
    sport: "Baseball",
    week: 8,
    pc: 4,
    sublimado: "11/26",
    maquina: "8B",
    turno: "B",
    status: "OK",
  },
  {
    po: "V108994",
    sport: "Baseball",
    week: 2,
    pc: 10,
    sublimado: "11/27",
    maquina: "1B",
    turno: "A",
    status: "OK",
  },
  {
    po: "V109217",
    sport: "Baseball",
    week: 4,
    pc: 20,
    sublimado: "12/2",
    maquina: "8B",
    turno: "B",
    status: "OK",
  },
  {
    po: "V108251",
    sport: "Baseball",
    week: 8,
    pc: 50,
    sublimado: "12/3",
    maquina: "3A",
    turno: "A",
    status: "RH",
  },
  {
    po: "V109459",
    sport: "Baseball",
    week: 2,
    pc: 10,
    sublimado: "12/4",
    maquina: "5A",
    turno: "A",
    status: "OK",
  },
];

const Produccion = () => {
  const [semanaFiltro, setSemanaFiltro] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const [horaActual, setHoraActual] = useState(new Date());

  // ⏱️ Reloj en tiempo real
  useEffect(() => {
    const intervalo = setInterval(() => {
      setHoraActual(new Date());
    }, 1000);

    return () => clearInterval(intervalo);
  }, []);

  // 🔹 Filtrado dinámico
  const datosFiltrados = useMemo(() => {
    return dataInicial.filter((item) => {
      return (
        (semanaFiltro === "" || item.week === Number(semanaFiltro)) &&
        (statusFiltro === "" || item.status === statusFiltro)
      );
    });
  }, [semanaFiltro, statusFiltro]);

  // 🔹 Cálculos
  const totalRegistros = datosFiltrados.length;
  const totalOK = datosFiltrados.filter((d) => d.status === "OK").length;
  const totalRH = datosFiltrados.filter((d) => d.status === "RH").length;
  const totalPC = datosFiltrados.reduce((acc, d) => acc + d.pc, 0);

  // 🔥 Estado general automático
  const estadoGeneral =
    totalRH > 0 ? "Atención requerida" : "Operando con normalidad";

  return (
    <div className="produccion-container">

      {/* ================= HEADER LIVE ================= */}

      <div className="live-header">
        <div>
          <h1>Reporte RH - Control Producción</h1>
          <p className="subtitle">
            Sistema activo • {horaActual.toLocaleTimeString()}
          </p>
        </div>

        <div className="live-indicator">
          <div className="live-dot"></div>
          EN VIVO
        </div>
      </div>

      {/* ================= ESTADO GENERAL ================= */}

      <div
        className={`estado-general ${
          totalRH > 0 ? "estado-alerta" : "estado-ok"
        }`}
      >
        {estadoGeneral}
      </div>

      {/* ================= FILTROS ================= */}

      <div className="filters">
        <div>
          <label>Semana</label>
          <select
            value={semanaFiltro}
            onChange={(e) => setSemanaFiltro(e.target.value)}
          >
            <option value="">Todas las semanas</option>
            {[...new Set(dataInicial.map((d) => d.week))].map((week) => (
              <option key={week} value={week}>
                Semana {week}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Status</label>
          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
          >
            <option value="">Todos los status</option>
            <option value="OK">OK</option>
            <option value="RH">RH</option>
          </select>
        </div>
      </div>

      {/* ================= DASHBOARD ================= */}

      <div className="dashboard-layout">

        {/* --------- CARDS --------- */}

        <div className="cards">
          <div className="card">
            <h2>{totalRegistros}</h2>
            <p>Total Registros</p>
          </div>

          <div className="card">
            <h2>{totalOK}</h2>
            <p>Total OK</p>
          </div>

          <div className="card">
            <h2>{totalRH}</h2>
            <p>Total RH</p>
          </div>

          <div className="card">
            <h2>{totalPC}</h2>
            <p>Total PC</p>
          </div>
        </div>

        {/* --------- TABLA --------- */}

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>PO</th>
                <th>Sport</th>
                <th>Week</th>
                <th>PC</th>
                <th>Sublimado</th>
                <th>Máquina</th>
                <th>Turno</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {datosFiltrados.map((item, index) => (
                <tr key={index}>
                  <td>{item.po}</td>
                  <td>{item.sport}</td>
                  <td>{item.week}</td>
                  <td>{item.pc}</td>
                  <td>{item.sublimado}</td>
                  <td>{item.maquina}</td>
                  <td>{item.turno}</td>
                  <td>
                    <span
                      className={`badge ${
                        item.status === "OK"
                          ? "badge-ok"
                          : "badge-rh"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default Produccion;