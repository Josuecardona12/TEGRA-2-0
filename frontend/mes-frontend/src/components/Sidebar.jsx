import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import "./Sidebar.css";

const Sidebar = () => {
  const { user, logout, hasPermission } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [openSections, setOpenSections] = useState({
    general: true,
    operaciones: true,
    sistema: true
  });
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState({ temp: 28, condition: "Mayor. soleado", icon: "☀️" });
  const sidebarRef = useRef(null);
  const userMenuRef = useRef(null);

  // Reloj en tiempo real
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Clima dinámico
  useEffect(() => {
    const weatherOptions = [
      { temp: 28, condition: "Mayor. soleado", icon: "☀️" },
      { temp: 24, condition: "Parcialmente nublado", icon: "⛅" },
      { temp: 22, condition: "Brisa suave", icon: "🍃" },
      { temp: 26, condition: "Despejado", icon: "🌤️" }
    ];
    const interval = setInterval(() => {
      const randomWeather = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
      setWeather(randomWeather);
    }, 1800000);
    return () => clearInterval(interval);
  }, []);

  // Cerrar menú de usuario al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Estructura del menú
  const menuSections = [
    {
      id: "general",
      title: "GENERAL",
      icon: "📌",
      items: [
        { name: "Dashboard", path: "/dashboard", icon: "🏠", permission: null },
        { name: "Atrasos", path: "/atrasos", icon: "⏱️", permission: null }
      ]
    },
    {
      id: "operaciones",
      title: "OPERACIONES",
      icon: "⚙️",
      items: [
        { name: "Plan Semanal", path: "/plan-semanal", icon: "📅", permission: null },
        { name: "Órdenes", path: "/ordenes", icon: "📋", permission: "ordenes" },
        { name: "Máquinas", path: "/maquinas", icon: "⚙️", permission: "maquinas" },
        { name: "Trazabilidad", path: "/trazabilidad", icon: "🔍", permission: "trazabilidad" },
        { name: "Reporte RH", path: "/reporte-rh", icon: "👥", permission: "reporte-rh" },
        { name: "Miceláneos", path: "/micelanios", icon: "📦", permission: null },
        { name: "FFTT Quality", path: "/fftt-quality", icon: "📈", permission: "fftt-quality" },
        { name: "Plotter 17", path: "/plotter", icon: "🖨️", permission: "plotter" },
        { name: "Diseño", path: "/diseno", icon: "🎨", permission: "diseno" }
      ]
    },
    {
      id: "sistema",
      title: "SISTEMA",
      icon: "🔧",
      items: [
        { name: "Reportes", path: "/reportes", icon: "📑", permission: "reportes" },
        { name: "Configuración", path: "/configuracion", icon: "⚙️", permission: "configuracion" }
      ]
    }
  ];

  // Filtrar items por búsqueda
  const filteredItems = searchTerm.length > 1
    ? menuSections.flatMap(section =>
        section.items.filter(item =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        ).map(item => ({ ...item, sectionTitle: section.title }))
      )
    : [];

  // Alternar sección
  const toggleSection = (sectionId) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Verificar si un ítem está activo
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Renderizar ítem del menú
  const renderMenuItem = (item) => {
    // Verificar permisos si es necesario
    if (item.permission && !hasPermission(item.permission)) {
      return null;
    }

    return (
      <NavLink
        key={item.path}
        to={item.path}
        className={({ isActive }) => 
          `menu-item ${isActive ? "active" : ""}`
        }
        onClick={() => setShowSearch(false)}
      >
        <span className="menu-icon">{item.icon}</span>
        <span className="menu-name">{item.name}</span>
        {isActive(item.path) && <span className="active-dot"></span>}
      </NavLink>
    );
  };

  return (
    <>
      {/* Toggle Button */}
      <button 
        className={`sidebar-toggle-btn ${isOpen ? "open" : "closed"}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
      >
        <span className="toggle-icon">{isOpen ? "◀" : "▶"}</span>
        <span className="toggle-tooltip">{isOpen ? "Cerrar menú" : "Abrir menú"}</span>
      </button>

      {/* Sidebar */}
      <aside className={`sidebar-premium ${isOpen ? "open" : "closed"}`} ref={sidebarRef}>
        <div className="sidebar-gradient"></div>
        
        {/* Header con estado del sistema */}
        <div className="sidebar-header">
          <div className="system-status">
            <div className="status-pulse"></div>
            <div className="status-dot"></div>
            <span className="status-text">SISTEMA OPERATIVO</span>
            <span className="uptime-badge">99.99%</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <div className="search-icon">🔍</div>
          <input
            type="text"
            placeholder="Buscar módulos, funciones..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowSearch(true)}
            onBlur={() => setTimeout(() => setShowSearch(false), 200)}
          />
          {searchTerm && (
            <button className="search-clear" onClick={() => setSearchTerm("")}>
              ✕
            </button>
          )}

          {/* Search Results */}
          {showSearch && filteredItems.length > 0 && (
            <div className="search-results">
              <div className="results-header">
                <span>Resultados encontrados</span>
                <span className="results-count">{filteredItems.length}</span>
              </div>
              {filteredItems.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className="search-result"
                  onClick={() => setShowSearch(false)}
                >
                  <span className="result-icon">{item.icon}</span>
                  <div className="result-info">
                    <span className="result-name">{item.name}</span>
                    <span className="result-category">{item.sectionTitle}</span>
                  </div>
                  <span className="result-arrow">→</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Role Info */}
        <div className="role-info-card">
          <div className="role-badge">
            {user?.avatar || "👑"}
          </div>
          <div className="role-details">
            <span className="role-label">ROL ACTUAL</span>
            <span className="role-name">{user?.role || "Administrador"}</span>
            <span className="role-desc">Acceso total al sistema</span>
          </div>
        </div>

        {/* Menu Sections */}
        <nav className="sidebar-nav">
          {menuSections.map((section) => {
            // Filtrar items sin permisos
            const visibleItems = section.items.filter(item => 
              !item.permission || hasPermission(item.permission)
            );
            
            if (visibleItems.length === 0) return null;
            
            return (
              <div key={section.id} className="menu-section">
                <div 
                  className="section-header"
                  onClick={() => toggleSection(section.id)}
                >
                  <span className="section-icon">{section.icon}</span>
                  <span className="section-title">{section.title}</span>
                  <span className={`section-arrow ${openSections[section.id] ? "open" : ""}`}>
                    ▼
                  </span>
                </div>
                
                {openSections[section.id] && (
                  <div className="section-items">
                    {visibleItems.map(renderMenuItem)}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          {/* Weather Widget */}
          <div className="weather-widget">
            <span className="weather-icon">{weather.icon}</span>
            <div className="weather-info">
              <span className="weather-temp">{weather.temp}°C</span>
              <span className="weather-desc">{weather.condition}</span>
            </div>
          </div>

          {/* User Menu */}
          <div className="user-menu-container" ref={userMenuRef}>
            <div 
              className="user-info"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="user-avatar">
                {user?.avatar || "👤"}
                <div className="avatar-ring"></div>
              </div>
              <div className="user-details">
                <span className="user-name">{user?.nombre || "Administrador"}</span>
                <span className="user-role">{user?.role || "Administrador"}</span>
              </div>
              <span className="user-arrow">▼</span>
            </div>

            {showUserMenu && (
              <div className="user-dropdown">
                <div className="dropdown-header">
                  <div className="dropdown-avatar">
                    {user?.avatar || "👤"}
                  </div>
                  <div className="dropdown-info">
                    <span className="dropdown-name">{user?.nombre || "Administrador"}</span>
                    <span className="dropdown-email">{user?.email || "admin@tegra.com"}</span>
                    <span className="dropdown-role">{user?.role || "Administrador"}</span>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <button onClick={logout} className="dropdown-logout">
                  <span>🔒</span>
                  Cerrar Sesión
                  <span>→</span>
                </button>
              </div>
            )}
          </div>

          {/* Footer Stats */}
          <div className="footer-stats">
            <div className="stat">
              <span className="stat-value">v3.0.0</span>
              <span className="stat-label">versión</span>
            </div>
            <div className="stat">
              <span className="stat-value">99.99%</span>
              <span className="stat-label">uptime</span>
            </div>
            <div className="stat">
              <span className="stat-value">{currentTime.toLocaleTimeString().slice(0,5)}</span>
              <span className="stat-label">horas</span>
            </div>
          </div>

          {/* Theme Toggle */}
          <button className="theme-toggle" onClick={toggleTheme}>
            <div className="toggle-track">
              <div className={`toggle-thumb ${darkMode ? "dark" : "light"}`}>
                <span>{darkMode ? "🌙" : "☀️"}</span>
              </div>
            </div>
            <span className="toggle-text">{darkMode ? "Modo Oscuro" : "Modo Claro"}</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;