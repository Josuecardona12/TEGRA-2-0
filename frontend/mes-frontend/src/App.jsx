import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

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

  return (
    <div className={`layout ${modoOscuro ? "dark" : "light"}`}>

      {/* SIDEBAR */}
      <div className="sidebar">
        <div>
          <div className="logo">TEGRA ERP</div>

          <nav>
            <a href="/ordenes">Órdenes</a>
            <a href="/dashboard">Dashboard</a>
            <a href="/scan">Escaneo</a>
            <a href="/configuracion">Configuración</a>
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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ordenes" element={<Ordenes />} />
          <Route path="/scan" element={<ScanMovimiento />} />
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
          {/* LOGIN */}
          <Route path="/login" element={<Login />} />

          {/* RUTAS PROTEGIDAS */}
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
