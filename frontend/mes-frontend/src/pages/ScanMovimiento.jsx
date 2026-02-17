import React, { useState } from "react";
import "./Dashboard.css"; // usa tu estilo global si quieres
import "./ScanMovimiento.css";

const areasDisponibles = [
  "Producción",
  "Logística",
  "Calidad",
  "Compras",
  "Bodega",
  "Administración"
];

function ScanMovimiento() {
  const [codigo, setCodigo] = useState("");
  const [areaOrigen, setAreaOrigen] = useState("");
  const [areaDestino, setAreaDestino] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [mensaje, setMensaje] = useState("");

  const moverProducto = async () => {
    if (!codigo || !areaOrigen || !areaDestino) {
      setMensaje("⚠️ Complete todos los campos");
      return;
    }

    try {
const res = await fetch(
  "https://stunning-winner-pvxjwq4pwg5c97w7-8000.app.github.dev/movimientos/scan",
  {



        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          codigo,
          area_origen: areaOrigen,
          area_destino: areaDestino,
          cantidad: parseInt(cantidad)
        })
      });

      if (res.ok) {
        setMensaje("✅ Movimiento registrado correctamente");
        setCodigo("");
        setCantidad(1);
      } else {
        setMensaje("❌ Error al mover producto");
      }
    } catch (error) {
      setMensaje("❌ Error de conexión con el servidor");
    }
  };

  return (
    <div className="card">
      <h2>📦 Escaneo de Movimiento</h2>

      <div className="form-group">
        <label>Código de Barra</label>
        <input
          type="text"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          placeholder="Escanee o escriba el código"
        />
      </div>

      <div className="form-group">
        <label>Área Origen</label>
        <select
          value={areaOrigen}
          onChange={(e) => setAreaOrigen(e.target.value)}
        >
          <option value="">Seleccione área</option>
          {areasDisponibles.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Área Destino</label>
        <select
          value={areaDestino}
          onChange={(e) => setAreaDestino(e.target.value)}
        >
          <option value="">Seleccione área</option>
          {areasDisponibles.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
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

      <button className="btn-primary" onClick={moverProducto}>
        🔄 Mover Producto
      </button>

      {mensaje && <p style={{ marginTop: "15px" }}>{mensaje}</p>}
    </div>
  );
}

export default ScanMovimiento;
