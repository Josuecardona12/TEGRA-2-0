import { useState } from "react";
import "./ScanMovimiento.css";

export default function ScanMovimiento() {
  const [codigo, setCodigo] = useState("");
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [mensaje, setMensaje] = useState("");
  const [movimientos, setMovimientos] = useState([]);

  const areas = [
    "Diseño",
    "Plotter",
    "RH",
    "Incompleto",
    "Producción",
    "Bodega"
  ];

  const moverProducto = () => {
    if (!codigo || !origen || !destino) {
      setMensaje("⚠️ Completa todos los campos");
      return;
    }

    const nuevoMovimiento = {
      id: Date.now(),
      codigo,
      origen,
      destino,
      cantidad,
      fecha: new Date().toLocaleString()
    };

    setMovimientos([nuevoMovimiento, ...movimientos]);

    setMensaje("✅ Movimiento agregado correctamente");

    setCodigo("");
    setCantidad(1);
  };

  return (
    <div className="mov-container">

      <div className="mov-card">
        <h2>Escaneo de Movimiento</h2>

        <div className="form-grid">
          <input
            type="text"
            placeholder="Escanee o escriba el código"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
          />

          <select value={origen} onChange={(e) => setOrigen(e.target.value)}>
            <option value="">Área Origen</option>
            {areas.map((area, i) => (
              <option key={i}>{area}</option>
            ))}
          </select>

          <select value={destino} onChange={(e) => setDestino(e.target.value)}>
            <option value="">Área Destino</option>
            {areas.map((area, i) => (
              <option key={i}>{area}</option>
            ))}
          </select>

          <input
            type="number"
            min="1"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
          />
        </div>

        <button className="mov-btn" onClick={moverProducto}>
          Mover Producto
        </button>

        {mensaje && <p className="mensaje">{mensaje}</p>}
      </div>

      <div className="historial-card">
        <h2>Historial de Movimientos</h2>

        {movimientos.length === 0 ? (
          <p className="empty">No hay movimientos aún</p>
        ) : (
          <table className="mov-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Origen</th>
                <th>Destino</th>
                <th>Cantidad</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((mov) => (
                <tr key={mov.id} className="fade-row">
                  <td>{mov.codigo}</td>
                  <td>{mov.origen}</td>
                  <td>{mov.destino}</td>
                  <td>{mov.cantidad}</td>
                  <td>{mov.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}