import { NavLink } from "react-router-dom";
import { useState } from "react";
import "./Sidebar.css";

const Sidebar = () => {
  const [busqueda, setBusqueda] = useState('');
  const [mostrarBusqueda, setMostrarBusqueda] = useState(false);
  const hayAtrasosGraves = true;

  // Datos del menú para búsqueda
  const menuItems = [
    { path: 'dashboard', nombre: 'Dashboard', icono: '📊', categoria: 'GENERAL' },
    { path: 'atrasos', nombre: 'Atrasos', icono: '⚠️', categoria: 'GENERAL' },
    { path: 'plan-semanal', nombre: 'Plan Semanal', icono: '📅', categoria: 'OPERACIONES' },
    { path: 'ordenes', nombre: 'Órdenes', icono: '📋', categoria: 'OPERACIONES' },
    { path: 'maquinas', nombre: 'Máquinas Tiempo Real', icono: '🚀', categoria: 'OPERACIONES' },
    { path: 'trazabilidad', nombre: 'Trazabilidad de Lotes', icono: '🔍', categoria: 'OPERACIONES' },
    { path: 'reporte-rh', nombre: 'Reporte RH', icono: '👥', categoria: 'OPERACIONES' },
    { path: 'scan', nombre: 'Escaneo', icono: '📱', categoria: 'OPERACIONES' },
    { path: 'micelanios', nombre: 'Miceláneos', icono: '📦', categoria: 'OPERACIONES' },
    { path: 'fftt-quality', nombre: 'FFTT Quality', icono: '🔬', categoria: 'OPERACIONES' },
    { path: 'plotter', nombre: 'Plotter 17 Máq', icono: '🖨️', categoria: 'OPERACIONES' },
    { path: 'reportes', nombre: 'Reportes', icono: '📈', categoria: 'SISTEMA' },
    { path: 'configuracion', nombre: 'Configuración', icono: '⚙️', categoria: 'SISTEMA' },
  ];

  const menuFiltrado = busqueda.length > 1 
    ? menuItems.filter(item => 
        item.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        item.categoria.toLowerCase().includes(busqueda.toLowerCase())
      )
    : [];

  return (
    <div className="sidebar abierto">
      {/* Header del Sidebar */}
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">
            TEGRA<span className="logo-highlight">ERP</span>
          </span>
        </div>
        <div className="online-indicator">
          <span className="online-dot"></span>
          <span className="online-text">Sistema en vivo</span>
          <span className="online-badge">24/7</span>
        </div>
      </div>

      {/* Buscador */}
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
            <div className="search-results-header">
              <span>Resultados encontrados: {menuFiltrado.length}</span>
            </div>
            {menuFiltrado.map(item => (
              <NavLink 
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
              </NavLink>
            ))}
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {/* GENERAL */}
        <div className="nav-section">
          <div className="section-title">
            <span className="section-icon">⭐</span>
            <span>GENERAL</span>
          </div>
          
          <NavLink 
            to="dashboard" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-text">Dashboard</span>
            <span className="nav-tooltip">Vista general del sistema</span>
          </NavLink>

          <NavLink 
            to="atrasos" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">⚠️</span>
            <span className="nav-text">Atrasos</span>
            {hayAtrasosGraves && (
              <span className="nav-badge grave">3</span>
            )}
            <span className="nav-tooltip">Control de atrasos</span>
          </NavLink>
        </div>

        {/* OPERACIONES */}
        <div className="nav-section">
          <div className="section-title">
            <span className="section-icon">⚙️</span>
            <span>OPERACIONES</span>
          </div>
          
          <NavLink 
            to="plan-semanal" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">📅</span>
            <span className="nav-text">Plan Semanal</span>
            <span className="nav-tooltip">Planificación semanal</span>
          </NavLink>

          <NavLink 
            to="ordenes" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">📋</span>
            <span className="nav-text">Órdenes</span>
            <span className="nav-badge info">12</span>
            <span className="nav-tooltip">Gestión de órdenes</span>
          </NavLink>

          <NavLink 
            to="maquinas" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">🚀</span>
            <span className="nav-text">Máquinas Tiempo Real</span>
            <span className="live-badge-small">LIVE</span>
            <span className="nav-tooltip">Monitoreo en vivo</span>
          </NavLink>
          
          <NavLink 
            to="trazabilidad" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">🔍</span>
            <span className="nav-text">Trazabilidad de Lotes</span>
            <span className="nav-tooltip">Seguimiento de lotes</span>
          </NavLink>

          <NavLink 
            to="reporte-rh" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">👥</span>
            <span className="nav-text">Reporte RH</span>
            <span className="nav-tooltip">Reporte RH</span>
          </NavLink>

          <NavLink 
            to="scan" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">📱</span>
            <span className="nav-text">Escaneo</span>
            <span className="nav-tooltip">Escaneo de códigos</span>
          </NavLink>

          <NavLink 
            to="micelanios" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">📦</span>
            <span className="nav-text">Miceláneos</span>
            <span className="nav-tooltip">Productos varios</span>
          </NavLink>

          <NavLink 
            to="fftt-quality" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">🔬</span>
            <span className="nav-text">FFTT Quality</span>
            <span className="nav-badge premium">PREMIUM</span>
            <span className="nav-tooltip">Control de calidad FFTT</span>
          </NavLink>

          <NavLink 
            to="plotter" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">🖨️</span>
            <span className="nav-text">Plotter 17 Máq</span>
            <span className="nav-badge plotter">17</span>
            <span className="nav-tooltip">Control de 17 plotters</span>
          </NavLink>
        </div>

        {/* SISTEMA */}
        <div className="nav-section">
          <div className="section-title">
            <span className="section-icon">🔧</span>
            <span>SISTEMA</span>
          </div>

          <NavLink 
            to="reportes" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">📈</span>
            <span className="nav-text">Reportes</span>
            <span className="nav-tooltip">Informes y análisis</span>
          </NavLink>

          <NavLink 
            to="configuracion" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">⚙️</span>
            <span className="nav-text">Configuración</span>
            <span className="nav-tooltip">Ajustes del sistema</span>
          </NavLink>
        </div>
      </nav>

      {/* Footer del Sidebar */}
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

        <div className="footer-stats">
          <div className="stat-item">
            <span className="stat-label">Versión</span>
            <span className="stat-value">3.0.0</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Uptime</span>
            <span className="stat-value">99.9%</span>
          </div>
        </div>
      </div>
    </div>
  );
  
};

export default Sidebar;