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
    "Producción",
    "Sublimado",
    "Calidad",
    "Logística",
    "Bodega"
  ];

  const moverProducto = () => {
    if (!codigo || !origen || !destino) {
      setMensaje("⚠ Complete todos los campos");
      return;
    }

    const nuevoMovimiento = {
      codigo,
      origen,
      destino,
      cantidad,
      fecha: new Date().toLocaleString()
    };

    setMovimientos([nuevoMovimiento, ...movimientos]);
    setMensaje("✅ Movimiento registrado correctamente");

    setCodigo("");
    setOrigen("");
    setDestino("");
    setCantidad(1);
  };

  return (
    <div className="scan-container">

      <div className="scan-card">
        <h2>📦 Escaneo de Movimiento</h2>

        <div className="form-group">
          <label>Código de Barra</label>
          <input
            type="text"
            placeholder="Escanee o escriba el código"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Área Origen</label>
          <select value={origen} onChange={(e) => setOrigen(e.target.value)}>
            <option value="">Seleccione área</option>
            {areas.map((area) => (
              <option key={area}>{area}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Área Destino</label>
          <select value={destino} onChange={(e) => setDestino(e.target.value)}>
            <option value="">Seleccione área</option>
            {areas.map((area) => (
              <option key={area}>{area}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Cantidad</label>
          <input
            type="number"
            min="1"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
          />
        </div>

        <button className="btn-mover" onClick={moverProducto}>
          🔄 Mover Producto
        </button>

        {mensaje && <p className="mensaje">{mensaje}</p>}
      </div>

      <div className="historial-card">
        <h3>📋 Historial de Movimientos</h3>

        {movimientos.length === 0 && (
          <p className="sin-movimientos">No hay movimientos aún</p>
        )}

        {movimientos.map((mov, index) => (
          <div key={index} className="mov-item">
            <div>
              <strong>{mov.codigo}</strong>
              <p>{mov.origen} ➜ {mov.destino}</p>
            </div>
            <div>
              <p>Cant: {mov.cantidad}</p>
              <small>{mov.fecha}</small>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
