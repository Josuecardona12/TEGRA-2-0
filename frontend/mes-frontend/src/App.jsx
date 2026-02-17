import React, { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Ordenes from "./pages/Ordenes";
import Configuracion from "./pages/Configuracion";
import "./App.css";

function App() {
  const [vista, setVista] = useState("ordenes");
  const [modoOscuro, setModoOscuro] = useState(false);

  return (
    <div className={`layout ${modoOscuro ? "dark" : "light"}`}>
      
      {/* SIDEBAR */}
      <div className="sidebar">
        <div>
          <div className="logo">TEGRA ERP</div>

          <nav>
            <button onClick={() => setVista("ordenes")}>
              Órdenes
            </button>

            <button onClick={() => setVista("dashboard")}>
              Dashboard
            </button>

            <button onClick={() => setVista("configuracion")}>
              Configuración
            </button>
          </nav>
        </div>

        <button
          className="btn-modo"
          onClick={() => setModoOscuro(!modoOscuro)}
        >
          {modoOscuro ? "☀ Claro" : "🌙 Oscuro"}
        </button>
      </div>

      {/* CONTENIDO */}
      <div className="content">
        {vista === "ordenes" && <Ordenes />}
        {vista === "dashboard" && <Dashboard />}
        {vista === "configuracion" && <Configuracion />}
      </div>

    </div>
  );
}

export default App;
