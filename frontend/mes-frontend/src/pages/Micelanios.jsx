import { useState } from "react";
import "./Micelanios.css";

export default function Micelanios() {
  const [codigo, setCodigo] = useState("");
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [mensaje, setMensaje] = useState("");
  const [registros, setRegistros] = useState([]);

  const areas = [
    "Diseño",
    "Plotter",
    "Rh",
    "Incompleto",
    "Fftt",
    "Colorimetria",
    "Logistica",
    "Corte"
  ];

  const registrar = () => {
    if (!codigo || !origen || !destino) {
      setMensaje("⚠ Complete todos los campos");
      return;
    }

    if (origen === destino) {
      setMensaje("⚠ Origen y destino no pueden ser iguales");
      return;
    }

    const nuevo = {
      codigo,
      origen,
      destino,
      cantidad,
      fecha: new Date().toLocaleString()
    };

    setRegistros([nuevo, ...registros]);
    setMensaje("✅ Micelanio registrado correctamente");

    setCodigo("");
    setOrigen("");
    setDestino("");
    setCantidad(1);
  };

  return (
    <div className="micelanio-container">

      {/* FORMULARIO */}
      <div className="micelanio-form">
        <h2>📦 Registro de Micelanio</h2>

        <div className="form-group">
          <label>Código de Barra</label>
          <input
            type="text"
            placeholder="Escanee o escriba el código"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Área Origen</label>
            <select value={origen} onChange={(e) => setOrigen(e.target.value)}>
              <option value="">Seleccione</option>
              {areas.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Área Destino</label>
            <select value={destino} onChange={(e) => setDestino(e.target.value)}>
              <option value="">Seleccione</option>
              {areas.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
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

        <button className="btn-registrar" onClick={registrar}>
          Registrar Micelanio
        </button>

        {mensaje && <p className="mensaje">{mensaje}</p>}
      </div>

      {/* HISTORIAL */}
      <div className="micelanio-historial">
        <h3>📋 Historial</h3>

        {registros.length === 0 && (
          <p className="vacio">No hay registros aún</p>
        )}

        {registros.map((item, index) => (
          <div key={index} className="hist-card">
            <div className="hist-left">
              <strong>{item.codigo}</strong>
              <p>{item.origen} ➜ {item.destino}</p>
            </div>
            <div className="hist-right">
              <p>Cant: {item.cantidad}</p>
              <small>{item.fecha}</small>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}