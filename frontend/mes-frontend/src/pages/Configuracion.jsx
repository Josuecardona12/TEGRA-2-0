import React from "react";

function Configuracion() {
  return (
    <div>
      <div className="topbar">
        <h1>Configuración del Sistema</h1>
      </div>

      <div className="panel">
        <h3>Datos de la Empresa</h3>
        <p style={{ marginTop: "15px" }}>
          Nombre: TEGRA Manufacturing
        </p>
        <p>Dirección: San Pedro Sula</p>
        <p>Teléfono: +504 9999-9999</p>
        <p>Email: contacto@tegra.com</p>
      </div>
    </div>
  );
}

export default Configuracion;
