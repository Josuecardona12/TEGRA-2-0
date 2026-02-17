import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link
} from "react-router-dom";


import Micelanios from "./pages/Micelanios";

import AtrasosDashboard from "./pages/AtrasosDashboard";
import PlanSemanal from "./pages/PlanSemanal";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Ordenes from "./pages/Ordenes";
import Configuracion from "./pages/Configuracion";
import ScanMovimiento from "./pages/ScanMovimiento";

import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

import "./App.css";

function AppLayout() {
  const [modoOscuro, setModoOscuro] = useState(false);
  const hayAtrasosGraves = true; // luego lo conectamos real


  return (
    <div className={`layout ${modoOscuro ? "dark" : "light"}`}>

      {/* SIDEBAR */}
      <div className="sidebar">
        <div>
          <div className="logo">TEGRA ERP</div>

          <nav>
            <Link to="/atrasos">
  Atrasos {hayAtrasosGraves && <span style={{color:"red"}}>●</span>}
</Link>
            <Link to="/micelanios">Miceláneos</Link>

            <Link to="/dashboard">Dashboard</Link>
            <Link to="/ordenes">Órdenes</Link>
            <Link to="/scan">Escaneo</Link>
            <Link to="/plan-semanal">Plan Semanal</Link>
            <Link to="/configuracion">Configuración</Link>
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
        <Routes>
          <Route path="/micelanios" element={<Micelanios />} />

          <Route path="/atrasos" element={<AtrasosDashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ordenes" element={<Ordenes />} />
          <Route path="/scan" element={<ScanMovimiento />} />
          <Route path="/plan-semanal" element={<PlanSemanal />} />
          <Route path="/configuracion" element={<Configuracion />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>

    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
