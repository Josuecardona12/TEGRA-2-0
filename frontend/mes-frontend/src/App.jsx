import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  Outlet,
  useLocation
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
import ReporteRH from "./pages/ReporteRH";
import MaquinasTiempoReal from "./pages/MaquinasTiempoReal";
import TrazabilidadLotes from "./trazabilidad-dashboard/TrazabilidadLotes";
import ScanInicio from './pages/ScanInicio';
import FFTTquality from "./pages/FFTTquality";
import PlotterLotes from "./pages/PlotterLotes"; // ✅ IMPORTACIÓN DE PLOTTER
import "./App.css";

function AppLayout() {
  const [modoOscuro, setModoOscuro] = useState(false);
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [notificaciones, setNotificaciones] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [menuFiltrado, setMenuFiltrado] = useState([]);
  const [mostrarBusqueda, setMostrarBusqueda] = useState(false);
  const hayAtrasosGraves = true;
  const location = useLocation();

  // Datos del menú para búsqueda - INCLUYE FFTT Y PLOTTER
  const menuItems = [
    { path: 'dashboard', nombre: 'Dashboard', icono: '📊', categoria: 'GENERAL' },
    { path: 'atrasos', nombre: 'Atrasos', icono: '⚠️', categoria: 'GENERAL' },
    { path: 'plan-semanal', nombre: 'Plan Semanal', icono: '📅', categoria: 'OPERACIONES' },
    { path: 'ordenes', nombre: 'Órdenes', icono: '📋', categoria: 'OPERACIONES' },
    { path: 'maquinas', nombre: 'Máquinas Tiempo Real', icono: '🚀', categoria: 'OPERACIONES' },
    { path: 'trazabilidad', nombre: 'Trazabilidad de Lotes', icono: '📊', categoria: 'OPERACIONES' },
    { path: 'reporte-rh', nombre: 'Reporte RH', icono: '👥', categoria: 'OPERACIONES' },
    { path: 'scan', nombre: 'Escaneo', icono: '📱', categoria: 'OPERACIONES' },
    { path: 'micelanios', nombre: 'Miceláneos', icono: '📦', categoria: 'OPERACIONES' },
    { path: 'fftt-quality', nombre: 'FFTT Quality Control', icono: '🔬', categoria: 'OPERACIONES' },
    { path: 'plotter', nombre: 'Plotter 17 Máquinas', icono: '🖨️', categoria: 'OPERACIONES' }, // ✅ NUEVO PLOTTER
    { path: 'reportes', nombre: 'Reportes', icono: '📈', categoria: 'SISTEMA' },
    { path: 'configuracion', nombre: 'Configuración', icono: '⚙️', categoria: 'SISTEMA' },
  ];

  // Simular notificaciones en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const nuevasNotificaciones = [
          { id: Date.now(), mensaje: "Plotter HP-02 terminó lote", tipo: "success", tiempo: "ahora" },
          { id: Date.now() + 1, mensaje: "Alerta de tinta baja en Plotter-05", tipo: "warning", tiempo: "ahora" },
          { id: Date.now() + 2, mensaje: "Nuevo lote escaneado en Plotter", tipo: "info", tiempo: "ahora" }
        ];
        setNotificaciones(prev => [nuevasNotificaciones[Math.floor(Math.random() * 3)], ...prev].slice(0, 4));
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Efecto para búsqueda en menú
  useEffect(() => {
    if (busqueda.length > 1) {
      const filtrados = menuItems.filter(item => 
        item.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        item.categoria.toLowerCase().includes(busqueda.toLowerCase())
      );
      setMenuFiltrado(filtrados);
      setMostrarBusqueda(true);
    } else {
      setMostrarBusqueda(false);
    }
  }, [busqueda]);

  const eliminarNotificacion = (id) => {
    setNotificaciones(prev => prev.filter(n => n.id !== id));
  };

  const isActive = (path) => {
    return location.pathname.includes(path);
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Dashboard';
    if (path.includes('atrasos')) return 'Control de Atrasos';
    if (path.includes('plan-semanal')) return 'Plan Semanal';
    if (path.includes('ordenes')) return 'Gestión de Órdenes';
    if (path.includes('maquinas')) return 'Máquinas en Tiempo Real';
    if (path.includes('trazabilidad')) return 'Trazabilidad de Lotes';
    if (path.includes('reporte-rh')) return 'Reportes de RH';
    if (path.includes('scan')) return 'Escaneo de Movimiento';
    if (path.includes('micelanios')) return 'Miceláneos';
    if (path.includes('fftt-quality')) return 'FFTT Quality Control';
    if (path.includes('plotter')) return 'Plotter - 17 Máquinas en Línea'; // ✅ TÍTULO PLOTTER
    if (path.includes('reportes')) return 'Reportes';
    if (path.includes('configuracion')) return 'Configuración del Sistema';
    return 'TEGRA ERP';
  };

  return (
    <div className={`app-container ${modoOscuro ? 'dark' : 'light'}`}>
      {/* Notificaciones flotantes */}
      <div className="notificaciones-container">
        {notificaciones.map(notif => (
          <div key={notif.id} className={`notificacion-flotante ${notif.tipo}`}>
            <div className="notif-contenido">
              <span className="notif-icon">
                {notif.tipo === 'success' && '✅'}
                {notif.tipo === 'warning' && '⚠️'}
                {notif.tipo === 'info' && 'ℹ️'}
              </span>
              <div className="notif-texto">
                <span className="notif-mensaje">{notif.mensaje}</span>
                <span className="notif-tiempo">{notif.tiempo}</span>
              </div>
            </div>
            <button className="notif-cerrar" onClick={() => eliminarNotificacion(notif.id)}>×</button>
          </div>
        ))}
      </div>

      {/* Botón para colapsar sidebar */}
      <button 
        className={`sidebar-toggle ${sidebarAbierto ? 'abierto' : ''}`}
        onClick={() => setSidebarAbierto(!sidebarAbierto)}
      >
        {sidebarAbierto ? '◀' : '▶'}
      </button>

      {/* SIDEBAR CON NUEVA ENTRADA PLOTTER */}
      <div className={`sidebar ${sidebarAbierto ? 'abierto' : 'cerrado'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">TEGRA<span className="logo-highlight">ERP</span></span>
          </div>
          <div className="online-indicator">
            <span className="online-dot"></span>
            <span className="online-text">Sistema en vivo</span>
          </div>
        </div>

        <div className="sidebar-search">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Buscar en menú..." 
            className="search-input"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onBlur={() => setTimeout(() => setMostrarBusqueda(false), 200)}
            onFocus={() => busqueda.length > 1 && setMostrarBusqueda(true)}
          />
          
          {/* Resultados de búsqueda */}
          {mostrarBusqueda && menuFiltrado.length > 0 && (
            <div className="search-results">
              {menuFiltrado.map(item => (
                <Link 
                  key={item.path}
                  to={item.path}
                  className="search-result-item"
                  onClick={() => setMostrarBusqueda(false)}
                >
                  <span className="result-icon">{item.icono}</span>
                  <div className="result-info">
                    <span className="result-nombre">{item.nombre}</span>
                    <span className="result-categoria">{item.categoria}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {/* GENERAL */}
          <div className="nav-section">
            <div className="section-title">
              <span className="section-icon">⭐</span>
              GENERAL
            </div>
            <Link 
              to="dashboard" 
              className={`nav-link ${isActive('dashboard') ? 'active' : ''}`}
            >
              <span className="nav-icon">📊</span>
              <span className="nav-text">Dashboard</span>
              {isActive('dashboard') && <span className="nav-indicator"></span>}
              <span className="nav-tooltip">Vista general</span>
            </Link>

            <Link 
              to="atrasos" 
              className={`nav-link ${isActive('atrasos') ? 'active' : ''}`}
            >
              <span className="nav-icon">⚠️</span>
              <span className="nav-text">Atrasos</span>
              {hayAtrasosGraves && (
                <span className="nav-badge grave">
                  <span className="badge-pulse"></span>
                  3
                </span>
              )}
              {isActive('atrasos') && <span className="nav-indicator"></span>}
              <span className="nav-tooltip">Control de atrasos</span>
            </Link>
          </div>

          {/* OPERACIONES - CON FFTT Y PLOTTER INCLUIDOS */}
          <div className="nav-section">
            <div className="section-title">
              <span className="section-icon">⚙️</span>
              OPERACIONES
            </div>
            
            <Link 
              to="plan-semanal" 
              className={`nav-link ${isActive('plan-semanal') ? 'active' : ''}`}
            >
              <span className="nav-icon">📅</span>
              <span className="nav-text">Plan Semanal</span>
              {isActive('plan-semanal') && <span className="nav-indicator"></span>}
              <span className="nav-tooltip">Planificación semanal</span>
            </Link>

            <Link 
              to="ordenes" 
              className={`nav-link ${isActive('ordenes') ? 'active' : ''}`}
            >
              <span className="nav-icon">📋</span>
              <span className="nav-text">Órdenes</span>
              <span className="nav-badge info">12</span>
              {isActive('ordenes') && <span className="nav-indicator"></span>}
              <span className="nav-tooltip">Gestión de órdenes</span>
            </Link>

            <Link 
              to="maquinas" 
              className={`nav-link ${isActive('maquinas') ? 'active' : ''}`}
            >
              <span className="nav-icon">🚀</span>
              <span className="nav-text">Máquinas Tiempo Real</span>
              <span className="live-badge-small">LIVE</span>
              {isActive('maquinas') && <span className="nav-indicator"></span>}
              <span className="nav-tooltip">Monitoreo en vivo</span>
            </Link>
            
            <Link 
              to="trazabilidad" 
              className={`nav-link destacado ${isActive('trazabilidad') ? 'active' : ''}`}
            >
              <span className="nav-icon">📊</span>
              <span className="nav-text">Trazabilidad de Lotes</span>
              <span className="nav-badge nuevo">NUEVO</span>
              <span className="destacado-glow"></span>
              {isActive('trazabilidad') && <span className="nav-indicator"></span>}
              <span className="nav-tooltip">Seguimiento de lotes</span>
            </Link>

            <Link 
              to="reporte-rh" 
              className={`nav-link ${isActive('reporte-rh') ? 'active' : ''}`}
            >
              <span className="nav-icon">👥</span>
              <span className="nav-text">Reporte RH</span>
              {isActive('reporte-rh') && <span className="nav-indicator"></span>}
              <span className="nav-tooltip">Reporte RH</span>
            </Link>

            <Link 
              to="scan" 
              className={`nav-link ${isActive('scan') ? 'active' : ''}`}
            >
              <span className="nav-icon">📱</span>
              <span className="nav-text">Escaneo</span>
              {isActive('scan') && <span className="nav-indicator"></span>}
              <span className="nav-tooltip">Escaneo de códigos</span>
            </Link>

            <Link 
              to="micelanios" 
              className={`nav-link ${isActive('micelanios') ? 'active' : ''}`}
            >
              <span className="nav-icon">📦</span>
              <span className="nav-text">Miceláneos</span>
              {isActive('micelanios') && <span className="nav-indicator"></span>}
              <span className="nav-tooltip">Productos varios</span>
            </Link>

            {/* 🔬 FFTT Quality Control */}
            <Link 
              to="fftt-quality" 
              className={`nav-link premium ${isActive('fftt-quality') ? 'active' : ''}`}
            >
              <span className="nav-icon">🔬</span>
              <span className="nav-text">FFTT Quality</span>
              <span className="nav-badge premium">PREMIUM</span>
              <span className="premium-glow"></span>
              {isActive('fftt-quality') && <span className="nav-indicator"></span>}
              <span className="nav-tooltip">Control de calidad FFTT</span>
            </Link>

            {/* 🖨️ NUEVO: PLOTTER 17 MÁQUINAS - DESTACADO */}
            <Link 
              to="plotter" 
              className={`nav-link plotter-destacado ${isActive('plotter') ? 'active' : ''}`}
            >
              <span className="nav-icon">🖨️</span>
              <span className="nav-text">Plotter 17 Máq</span>
              <span className="nav-badge plotter">
                <span className="badge-live"></span>
                17
              </span>
              <span className="plotter-glow"></span>
              {isActive('plotter') && <span className="nav-indicator"></span>}
              <span className="nav-tooltip">Control de 17 plotters</span>
            </Link>
          </div>

          {/* SISTEMA */}
          <div className="nav-section">
            <div className="section-title">
              <span className="section-icon">🔧</span>
              SISTEMA
            </div>

            <Link 
              to="reportes" 
              className={`nav-link ${isActive('reportes') ? 'active' : ''}`}
            >
              <span className="nav-icon">📈</span>
              <span className="nav-text">Reportes</span>
              {isActive('reportes') && <span className="nav-indicator"></span>}
              <span className="nav-tooltip">Informes y análisis</span>
            </Link>

            <Link 
              to="configuracion" 
              className={`nav-link ${isActive('configuracion') ? 'active' : ''}`}
            >
              <span className="nav-icon">⚙️</span>
              <span className="nav-text">Configuración</span>
              {isActive('configuracion') && <span className="nav-indicator"></span>}
              <span className="nav-tooltip">Ajustes del sistema</span>
            </Link>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <span className="avatar-icon">👤</span>
              <span className="user-status"></span>
            </div>
            <div className="user-details">
              <span className="user-name">Josué Cardona</span>
              <span className="user-role">Administrador</span>
            </div>
          </div>

          <div className="footer-actions">
            <button
              className="btn-modo"
              onClick={() => setModoOscuro(!modoOscuro)}
              title={modoOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {modoOscuro ? '☀️' : '🌙'}
              <span className="btn-text">{modoOscuro ? 'Claro' : 'Oscuro'}</span>
            </button>
            
            <button className="btn-logout" title="Cerrar sesión">
              <span className="logout-icon">🚪</span>
            </button>
          </div>

          <div className="footer-stats">
            <div className="stat-item">
              <span className="stat-label">Versión</span>
              <span className="stat-value">2.5.0</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Sincro</span>
              <span className="stat-value">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className={`main-content ${sidebarAbierto ? '' : 'expandido'}`}>
        <div className="content-header">
          <div className="header-title">
            <h1>{getPageTitle()}</h1>
            <p className="header-subtitle">
              {new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="header-actions">
            <button className="action-btn" title="Notificaciones">
              <span className="btn-icon">🔔</span>
              {notificaciones.length > 0 && (
                <span className="notification-badge">{notificaciones.length}</span>
              )}
            </button>
            <button className="action-btn" title="Mensajes">
              <span className="btn-icon">💬</span>
            </button>
            <button className="action-btn" title="Actividad reciente">
              <span className="btn-icon">⚡</span>
            </button>
            <div className="header-profile">
              <span className="profile-iniciales">JC</span>
            </div>
          </div>
        </div>

        <div className="content-body">
          <Outlet />
        </div>
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

        {/* SISTEMA PRINCIPAL */}
        <Route path="/" element={<AppLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="atrasos" element={<AtrasosDashboard />} />
          <Route path="micelanios" element={<Micelanios />} />
          <Route path="ordenes" element={<Ordenes />} />
          <Route path="scan" element={<ScanMovimiento />} />
          <Route path="plan-semanal" element={<PlanSemanal />} />
          <Route path="configuracion" element={<Configuracion />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="reporte-rh" element={<ReporteRH />} />
          <Route path="maquinas" element={<MaquinasTiempoReal />} />
          <Route path="trazabilidad" element={<TrazabilidadLotes />} />
          <Route path="fftt-quality" element={<FFTTquality />} />
          <Route path="plotter" element={<PlotterLotes />} /> {/* ✅ NUEVA RUTA PLOTTER */}
          <Route path="*" element={<Navigate to="dashboard" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;