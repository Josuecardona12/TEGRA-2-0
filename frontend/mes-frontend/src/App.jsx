import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  Outlet
} from "react-router-dom";

import Micelanios from "./pages/Micelanios";
import AtrasosDashboard from "./pages/AtrasosDashboard";
import PlanSemanal from "./pages/PlanSemanal";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Ordenes from "./pages/Ordenes";
import Configuracion from "./pages/Configuracion";
import ScanMovimiento from "./pages/ScanMovimiento";
import Reportes from "./pages/Reportes";
import Produccion from "./pages/Produccion";
import ReporteRH from "./pages/ReporteRH";

import "./App.css";

function AppLayout() {
  const [modoOscuro, setModoOscuro] = useState(false);
  const hayAtrasosGraves = true;

  return (
    <div className={`layout ${modoOscuro ? "dark" : "light"}`}>

      {/* SIDEBAR */}
      <div className="sidebar">
        <div>
          <div className="logo">TEGRA ERP</div>

          <nav>

            {/* GENERAL */}
            <p className="section-title">GENERAL</p>

            <Link to="dashboard">Dashboard</Link>

            <Link to="atrasos">
              Atrasos {hayAtrasosGraves && <span style={{ color: "red" }}>●</span>}
            </Link>

            {/* OPERACIONES */}
            <p className="section-title">OPERACIONES</p>

            <Link to="plan-semanal">Plan Semanal</Link>

            <Link to="ordenes">Órdenes</Link>

            <Link to="produccion">Producción</Link>

            <Link to="reporte-rh">Reporte RH</Link>

            <Link to="scan">Escaneo</Link>

            <Link to="micelanios">Miceláneos</Link>

            {/* SISTEMA */}
            <p className="section-title">SISTEMA</p>

            <Link to="reportes">Reportes</Link>

            <Link to="configuracion">Configuración</Link>

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
        <Outlet />
      </div>

    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* SISTEMA */}
        <Route path="/" element={<AppLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="atrasos" element={<AtrasosDashboard />} />
          <Route path="micelanios" element={<Micelanios />} />
          <Route path="ordenes" element={<Ordenes />} />
          <Route path="scan" element={<ScanMovimiento />} />
          <Route path="plan-semanal" element={<PlanSemanal />} />
          <Route path="configuracion" element={<Configuracion />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="produccion" element={<Produccion />} />
          <Route path="reporte-rh" element={<ReporteRH />} />
          <Route path="*" element={<Navigate to="dashboard" />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;