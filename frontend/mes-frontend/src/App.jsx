// App.js - SISTEMA ULTRA PREMIUM 4K
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

// ===== IMPORTS DE PÁGINAS =====
import Micelanios from "./pages/Micelanios";
import AtrasosDashboard from "./pages/AtrasosDashboard";
import PlanSemanal from "./pages/PlanSemanal";
import Login from "./pages/Login";
import Ordenes from "./pages/Ordenes";
import Configuracion from "./pages/Configuracion";
import Reportes from "./pages/Reportes";
import ReporteRH from "./pages/ReporteRH";
import MaquinasTiempoReal from "./pages/MaquinasTiempoReal";
import TrazabilidadLotes from "./trazabilidad-dashboard/TrazabilidadLotes";
import FFTTquality from "./pages/FFTTquality";
import PlotterLotes from "./pages/PlotterLotes";
import DisenoProduccion from "./pages/DisenoProduccion";
import Dashboard from "./pages/Dashboard";

import "./App.css";

// ===== COMPONENTE PARA PROTEGER RUTAS =====
const ProtectedRoute = ({ children }) => {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// ===== COMPONENTE PARA VERIFICAR PERMISOS =====
const RoleBasedRoute = ({ children, requiredPermissions = [] }) => {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }
  
  // Si no se requieren permisos específicos, permitir acceso
  if (requiredPermissions.length === 0) {
    return children;
  }
  
  // Verificar si el usuario tiene al menos uno de los permisos requeridos
  const hasPermission = requiredPermissions.some(permission => 
    usuario.permisos?.includes(permission)
  );
  
  if (!hasPermission) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// ===== LAYOUT PRINCIPAL =====
function AppLayout() {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState({ temp: 31, condition: "Mayormente soleado", icon: "☀️" });
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const location = useLocation();

  // Cargar usuario al iniciar
  useEffect(() => {
    const usuarioGuardado = JSON.parse(localStorage.getItem('usuario'));
    setUsuario(usuarioGuardado);
  }, []);

  // Reloj en tiempo real
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('usuario');
    window.location.href = '/login';
  };

  // Datos de búsqueda (filtrados por permisos)
  const menuItems = [
    { path: 'dashboard', name: 'Dashboard', icon: '📊', icon2: '✨', category: 'GENERAL', desc: 'Dashboard principal', new: true, permission: 'dashboard' },
    { path: 'atrasos', name: 'Atrasos', icon: '⚠️', icon2: '⏰', category: 'GENERAL', desc: 'Control de atrasos', badge: 3, permission: 'dashboard' },
    { path: 'plan-semanal', name: 'Plan Semanal', icon: '📅', icon2: '🗓️', category: 'OPERACIONES', desc: 'Planificación semanal', permission: 'dashboard' },
    { path: 'ordenes', name: 'Órdenes', icon: '📋', icon2: '📝', category: 'OPERACIONES', desc: 'Gestión de órdenes', badge: 12, permission: 'dashboard' },
    { path: 'maquinas', name: 'Máquinas', icon: '🚀', icon2: '⚡', category: 'OPERACIONES', desc: 'Monitoreo en vivo', live: true, permission: 'maquinas' },
    { path: 'trazabilidad', name: 'Trazabilidad', icon: '📊', icon2: '🔍', category: 'OPERACIONES', desc: 'Seguimiento de lotes', new: true, permission: 'trazabilidad' },
    { path: 'reporte-rh', name: 'Reporte RH', icon: '👥', icon2: '👤', category: 'OPERACIONES', desc: 'Reportes RH', permission: 'reportes' },
    { path: 'micelanios', name: 'Miceláneos', icon: '📦', icon2: '📦', category: 'OPERACIONES', desc: 'Productos varios', permission: 'dashboard' },
    { path: 'fftt-quality', name: 'FFTT Quality', icon: '🔬', icon2: '🧪', category: 'OPERACIONES', desc: 'Control calidad', premium: true, permission: 'fftt-quality' },
    { path: 'plotter', name: 'Plotter 17', icon: '🖨️', icon2: '🖨️', category: 'OPERACIONES', desc: 'Control plotters', badge: 17, permission: 'maquinas' },
    { path: 'diseno', name: 'Diseño', icon: '🎨', icon2: '🖌️', category: 'OPERACIONES', desc: 'Gestión de diseñadores', new: true, permission: 'diseno' },
    { path: 'reportes', name: 'Reportes', icon: '📈', icon2: '📊', category: 'SISTEMA', desc: 'Informes y análisis', permission: 'reportes' },
    { path: 'configuracion', name: 'Configuración', icon: '⚙️', icon2: '🔧', category: 'SISTEMA', desc: 'Ajustes del sistema', permission: 'configuracion' },
  ];

  // Filtrar menú según permisos del usuario
  const menuItemsFiltrados = menuItems.filter(item => {
    if (!usuario) return false;
    if (item.permission === 'dashboard') return true; // Dashboard siempre visible
    return usuario.permisos?.includes(item.permission);
  });

  const filteredItems = searchTerm.length > 1 
    ? menuItemsFiltrados.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Simular notificaciones
  useEffect(() => {
    const notifs = [
      { id: 1, message: "✅ Lote completado en Plotter #12", type: "success", time: "ahora", read: false },
      { id: 2, message: "⚠️ Alerta de temperatura en Máquina #08", type: "warning", time: "ahora", read: false },
      { id: 3, message: "ℹ️ Nuevo escaneo en Trazabilidad", type: "info", time: "hace 2m", read: true },
      { id: 4, message: "⚡ Producción al 94% de eficiencia", type: "success", time: "hace 5m", read: true },
    ];
    setNotifications(notifs);
    setUnreadCount(notifs.filter(n => !n.read).length);

    const interval = setInterval(() => {
      const newNotif = {
        id: Date.now(),
        message: ["✅ Lote completado", "⚠️ Alerta temperatura", "ℹ️ Nuevo escaneo"][Math.floor(Math.random() * 3)],
        type: ["success", "warning", "info"][Math.floor(Math.random() * 3)],
        time: "ahora",
        read: false
      };
      setNotifications(prev => [newNotif, ...prev].slice(0, 5));
      setUnreadCount(prev => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const isActive = (path) => location.pathname.includes(path);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Dashboard Principal';
    if (path.includes('atrasos')) return 'Control de Atrasos';
    if (path.includes('plan-semanal')) return 'Plan Semanal';
    if (path.includes('ordenes')) return 'Gestión de Órdenes';
    if (path.includes('maquinas')) return 'Máquinas en Tiempo Real';
    if (path.includes('trazabilidad')) return 'Trazabilidad de Lotes';
    if (path.includes('reporte-rh')) return 'Reportes de RH';
    if (path.includes('micelanios')) return 'Miceláneos';
    if (path.includes('fftt-quality')) return 'FFTT Quality Control';
    if (path.includes('plotter')) return 'Plotter - 17 Máquinas';
    if (path.includes('diseno')) return 'Diseño & Producción';
    if (path.includes('reportes')) return 'Reportes';
    if (path.includes('configuracion')) return 'Configuración del Sistema';
    return 'TEGRA';
  };

  if (!usuario) {
    return null; // No mostrar nada mientras se carga
  }

  return (
    <div className={`app-container ${darkMode ? 'dark' : 'light'}`}>
      {/* Sidebar Toggle Button */}
      <button 
        className={`sidebar-toggle ${sidebarOpen ? 'open' : 'closed'}`}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <span className="toggle-icon">{sidebarOpen ? '◀' : '▶'}</span>
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="online-indicator">
            <span className="online-dot"></span>
            <span className="online-text">Sistema en vivo</span>
            <span className="online-badge">24/7</span>
          </div>
        </div>

        <div className="sidebar-search">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar en menú..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowSearch(true)}
            onBlur={() => setTimeout(() => setShowSearch(false), 200)}
          />
          
          {showSearch && filteredItems.length > 0 && (
            <div className="search-results animate-scale">
              <div className="search-results-header">
                Resultados encontrados ({filteredItems.length})
              </div>
              {filteredItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="search-result-item"
                  onClick={() => setShowSearch(false)}
                >
                  <span className="result-icon">{item.icon2 || item.icon}</span>
                  <div className="result-info">
                    <span className="result-name">{item.name}</span>
                    <span className="result-category">{item.category}</span>
                    <span className="result-desc">{item.desc}</span>
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
              <span>GENERAL</span>
            </div>
            <Link to="dashboard" className={`nav-link destacado ${isActive('dashboard') ? 'active' : ''}`}>
              <span className="nav-icon">📊</span>
              <span className="nav-text">Dashboard</span>
              <span className="nav-badge new">NUEVO</span>
              {isActive('dashboard') && <span className="nav-indicator"></span>}
            </Link>
            <Link to="atrasos" className={`nav-link ${isActive('atrasos') ? 'active' : ''}`}>
              <span className="nav-icon">⚠️</span>
              <span className="nav-text">Atrasos</span>
              <span className="nav-badge grave">3</span>
              {isActive('atrasos') && <span className="nav-indicator"></span>}
            </Link>
          </div>

          {/* OPERACIONES */}
          <div className="nav-section">
            <div className="section-title">
              <span className="section-icon">⚙️</span>
              <span>OPERACIONES</span>
            </div>
            <Link to="plan-semanal" className={`nav-link ${isActive('plan-semanal') ? 'active' : ''}`}>
              <span className="nav-icon">📅</span>
              <span className="nav-text">Plan Semanal</span>
            </Link>
            <Link to="ordenes" className={`nav-link ${isActive('ordenes') ? 'active' : ''}`}>
              <span className="nav-icon">📋</span>
              <span className="nav-text">Órdenes</span>
              <span className="nav-badge info">12</span>
            </Link>
            {usuario.permisos?.includes('maquinas') && (
              <Link to="maquinas" className={`nav-link ${isActive('maquinas') ? 'active' : ''}`}>
                <span className="nav-icon">🚀</span>
                <span className="nav-text">Máquinas</span>
                <span className="live-badge">LIVE</span>
              </Link>
            )}
            {usuario.permisos?.includes('trazabilidad') && (
              <Link to="trazabilidad" className={`nav-link destacado ${isActive('trazabilidad') ? 'active' : ''}`}>
                <span className="nav-icon">📊</span>
                <span className="nav-text">Trazabilidad</span>
                <span className="nav-badge new">NUEVO</span>
              </Link>
            )}
            {usuario.permisos?.includes('reportes') && (
              <Link to="reporte-rh" className={`nav-link ${isActive('reporte-rh') ? 'active' : ''}`}>
                <span className="nav-icon">👥</span>
                <span className="nav-text">Reporte RH</span>
              </Link>
            )}
            <Link to="micelanios" className={`nav-link ${isActive('micelanios') ? 'active' : ''}`}>
              <span className="nav-icon">📦</span>
              <span className="nav-text">Miceláneos</span>
            </Link>
            {usuario.permisos?.includes('fftt-quality') && (
              <Link to="fftt-quality" className={`nav-link premium ${isActive('fftt-quality') ? 'active' : ''}`}>
                <span className="nav-icon">🔬</span>
                <span className="nav-text">FFTT Quality</span>
                <span className="premium-badge">PREMIUM</span>
              </Link>
            )}
            {usuario.permisos?.includes('maquinas') && (
              <Link to="plotter" className={`nav-link plotter ${isActive('plotter') ? 'active' : ''}`}>
                <span className="nav-icon">🖨️</span>
                <span className="nav-text">Plotter 17</span>
                <span className="nav-badge plotter">17</span>
              </Link>
            )}
            {usuario.permisos?.includes('diseno') && (
              <Link to="diseno" className={`nav-link destacado ${isActive('diseno') ? 'active' : ''}`}>
                <span className="nav-icon">🎨</span>
                <span className="nav-text">Diseño</span>
                <span className="nav-badge new">NUEVO</span>
              </Link>
            )}
          </div>

          {/* SISTEMA */}
          <div className="nav-section">
            <div className="section-title">
              <span className="section-icon">🔧</span>
              <span>SISTEMA</span>
            </div>
            {usuario.permisos?.includes('reportes') && (
              <Link to="reportes" className={`nav-link ${isActive('reportes') ? 'active' : ''}`}>
                <span className="nav-icon">📈</span>
                <span className="nav-text">Reportes</span>
              </Link>
            )}
            {usuario.permisos?.includes('configuracion') && (
              <Link to="configuracion" className={`nav-link ${isActive('configuracion') ? 'active' : ''}`}>
                <span className="nav-icon">⚙️</span>
                <span className="nav-text">Configuración</span>
              </Link>
            )}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="weather-widget">
            <span className="weather-icon">{weather.icon}</span>
            <div className="weather-info">
              <span className="weather-temp">{weather.temp}°C</span>
              <span className="weather-desc">{weather.condition}</span>
            </div>
          </div>

          <div className="user-info" onClick={() => setShowUserMenu(!showUserMenu)}>
            <div className="user-avatar">{usuario?.avatar || 'JC'}</div>
            <div className="user-details">
              <span className="user-name">{usuario?.nombre || 'Usuario'}</span>
              <span className="user-role">{usuario?.rol || 'Rol'}</span>
            </div>
            {showUserMenu && (
              <div className="user-menu">
                <Link to="/perfil">👤 Mi Perfil</Link>
                <Link to="/ajustes">⚙️ Ajustes</Link>
                <button onClick={handleLogout}>🔒 Cerrar Sesión</button>
              </div>
            )}
          </div>

          <div className="footer-stats">
            <div className="stat">
              <span className="stat-value">3.0.0</span>
              <span className="stat-label">versión</span>
            </div>
            <div className="stat">
              <span className="stat-value">99.9%</span>
              <span className="stat-label">uptime</span>
            </div>
            <div className="stat">
              <span className="stat-value">{currentTime.toLocaleTimeString().slice(0,5)}</span>
              <span className="stat-label">hora</span>
            </div>
          </div>

          <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? '☀️' : '🌙'}
            <span className="btn-text">{darkMode ? 'Claro' : 'Oscuro'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`main-content ${sidebarOpen ? '' : 'expanded'}`}>
        <div className="content-header">
          <div className="header-title">
            <h1 className="page-title animate-slide-in">{getPageTitle()}</h1>
            <div className="header-date">
              <span className="date-icon">📅</span>
              {currentTime.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </div>
          </div>
          
          <div className="header-actions">
            <button className="action-btn search-btn">
              <span className="btn-icon">🔍</span>
            </button>
            <button className="action-btn notification-btn">
              <span className="btn-icon">🔔</span>
              {unreadCount > 0 && <span className="notification-badge animate-pulse">{unreadCount}</span>}
            </button>
            <button className="action-btn message-btn">
              <span className="btn-icon">💬</span>
              <span className="notification-badge success">3</span>
            </button>
            <button className="action-btn activity-btn">
              <span className="btn-icon">⚡</span>
            </button>
            <div className="profile-menu">
              <div className="profile-avatar" onClick={() => setShowUserMenu(!showUserMenu)}>
                {usuario?.avatar || 'JC'}
              </div>
            </div>
          </div>
        </div>

        <div className="content-body">
          <Outlet />
        </div>
      </main>

      {/* Notificaciones flotantes */}
      <div className="floating-notifications">
        {notifications.filter(n => !n.read).slice(0, 2).map(notif => (
          <div key={notif.id} className={`floating-notification ${notif.type} animate-slide-right`}>
            <span className="notification-message">{notif.message}</span>
            <span className="notification-time">{notif.time}</span>
          </div>
        ))}
      </div>

      {/* Quick actions floating button */}
      <button className="quick-actions-btn">
        <span className="quick-icon">+</span>
      </button>
    </div>
  );
}

// ===== COMPONENTE PRINCIPAL =====
function App() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const usuarioGuardado = JSON.parse(localStorage.getItem('usuario'));
    setUsuario(usuarioGuardado);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública - Login */}
        <Route path="/login" element={<Login />} />
        
        {/* Ruta raíz - Redirige a login si no hay sesión, a dashboard si hay */}
        <Route 
          path="/" 
          element={
            usuario ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          } 
        />
        
        {/* Rutas protegidas */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="atrasos" element={<AtrasosDashboard />} />
          <Route path="plan-semanal" element={<PlanSemanal />} />
          
          {/* Rutas con permisos específicos */}
          <Route 
            path="ordenes" 
            element={
              <RoleBasedRoute requiredPermissions={['dashboard']}>
                <Ordenes />
              </RoleBasedRoute>
            } 
          />
          
          <Route 
            path="maquinas" 
            element={
              <RoleBasedRoute requiredPermissions={['maquinas']}>
                <MaquinasTiempoReal />
              </RoleBasedRoute>
            } 
          />
          
          <Route 
            path="trazabilidad" 
            element={
              <RoleBasedRoute requiredPermissions={['trazabilidad']}>
                <TrazabilidadLotes />
              </RoleBasedRoute>
            } 
          />
          
          <Route 
            path="reporte-rh" 
            element={
              <RoleBasedRoute requiredPermissions={['reportes']}>
                <ReporteRH />
              </RoleBasedRoute>
            } 
          />
          
          <Route path="micelanios" element={<Micelanios />} />
          
          <Route 
            path="fftt-quality" 
            element={
              <RoleBasedRoute requiredPermissions={['fftt-quality']}>
                <FFTTquality />
              </RoleBasedRoute>
            } 
          />
          
          <Route 
            path="plotter" 
            element={
              <RoleBasedRoute requiredPermissions={['maquinas']}>
                <PlotterLotes />
              </RoleBasedRoute>
            } 
          />
          
          <Route 
            path="diseno" 
            element={
              <RoleBasedRoute requiredPermissions={['diseno']}>
                <DisenoProduccion />
              </RoleBasedRoute>
            } 
          />
          
          <Route 
            path="reportes" 
            element={
              <RoleBasedRoute requiredPermissions={['reportes']}>
                <Reportes />
              </RoleBasedRoute>
            } 
          />
          
          <Route 
            path="configuracion" 
            element={
              <RoleBasedRoute requiredPermissions={['configuracion']}>
                <Configuracion />
              </RoleBasedRoute>
            } 
          />
          
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;