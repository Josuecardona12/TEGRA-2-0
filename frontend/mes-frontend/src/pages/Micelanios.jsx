import { useState, useEffect } from "react";
import "./Micelanios.css";

export default function Micelanios() {
  const [lotes, setLotes] = useState([]);
  const [scan, setScan] = useState("");
  const [reloj, setReloj] = useState(new Date());

  // Reloj en tiempo real
  useEffect(() => {
    const intervalo = setInterval(() => {
      setReloj(new Date());
    }, 60000);
    return () => clearInterval(intervalo);
  }, []);

  const procesarScan = (e) => {
    if (e.key === "Enter") {
      const partes = scan.split("|");
      if (partes.length !== 3) return;

      const [id, area, maquina] = partes;
      const ahora = new Date();

      setLotes((prev) => {
        const existe = prev.find((l) => l.id === id);

        if (existe) {
          return prev.map((l) =>
            l.id === id
              ? {
                  ...l,
                  area,
                  maquina,
                  ultimoMovimiento: ahora,
                  historial: [
                    ...l.historial,
                    { area, maquina, fecha: ahora },
                  ],
                }
              : l
          );
        } else {
          return [
            ...prev,
            {
              id,
              area,
              maquina,
              fechaIngreso: ahora,
              ultimoMovimiento: ahora,
              historial: [{ area, maquina, fecha: ahora }],
            },
          ];
        }
      });

      setScan("");
    }
  };

  const horasEnMaquina = (fecha) => {
    const diff = reloj - new Date(fecha);
    return Math.floor(diff / (1000 * 60 * 60));
  };

  const obtenerEstado = (horas) => {
    if (horas >= 6) return "CRITICO";
    if (horas >= 3) return "DETENIDO";
    return "EN PROCESO";
  };

  const maquinasOcupadas = [
    ...new Set(lotes.map((l) => l.maquina)),
  ].length;

  const lotesCriticos = lotes.filter(
    (l) => obtenerEstado(horasEnMaquina(l.ultimoMovimiento)) === "CRITICO"
  ).length;

  return (
    <div className="micelanios-container">
      <h1>🏭 Miceláneos - Control Inteligente</h1>

      {/* KPIs */}
      <div className="kpi-box">
        <div className="kpi total">
          Lotes Activos: {lotes.length}
        </div>
        <div className="kpi maquinas">
          Máquinas Ocupadas: {maquinasOcupadas}
        </div>
        <div className="kpi critico">
          Lotes Críticos: {lotesCriticos}
        </div>
      </div>

      {/* Scanner */}
      <div className="scanner-box">
        <input
          type="text"
          placeholder="Escanear ID|AREA|MAQUINA"
          value={scan}
          onChange={(e) => setScan(e.target.value)}
          onKeyDown={procesarScan}
          autoFocus
        />
      </div>

      {/* Tabla principal */}
      <table className="tabla-micelanios">
        <thead>
          <tr>
            <th>ID</th>
            <th>Área</th>
            <th>Máquina</th>
            <th>Horas</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {lotes.map((lote) => {
            const horas = horasEnMaquina(lote.ultimoMovimiento);
            const estado = obtenerEstado(horas);

            return (
              <tr key={lote.id} className={estado}>
                <td>{lote.id}</td>
                <td>{lote.area}</td>
                <td>{lote.maquina}</td>
                <td>{horas} h</td>
                <td>{estado}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Historial */}
      <h2 style={{ marginTop: "40px" }}>📜 Historial</h2>

      {lotes.map((lote) => (
        <div key={lote.id} className="historial-box">
          <strong>{lote.id}</strong>
          {lote.historial.map((h, i) => (
            <div key={i}>
              {h.area} - {h.maquina} -{" "}
              {new Date(h.fecha).toLocaleString()}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
