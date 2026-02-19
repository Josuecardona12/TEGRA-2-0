import { useState } from "react";
import "./Micelanios.css";

const AREAS = [
  "Diseño",
  "Plotter",
  "Sublimado",
  "Logística",
  "RH",
  "Reversión",
  "Incompleto",
  "FFTT",
  "Colorimetría"
];

export default function Micelanios() {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    area: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <div className="micelanios-container">
      <div className="micelanios-card">
        <h2>Crear Micelanio</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Ajuste de inventario"
              required
            />
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Describe el movimiento..."
              required
            />
          </div>

          <div className="form-group">
            <label>Área</label>
            <select
              name="area"
              value={formData.area}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar área</option>
              {AREAS.map((area, index) => (
                <option key={index} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn-crear">
            Guardar Micelanio
          </button>
        </form>
      </div>
    </div>
  );
}
