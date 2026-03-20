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
import Unauthorized from "./pages/Unauthorized";

import { RoleProvider, useRole } from "./RoleContext";
import { ProduccionProvider } from "./context/ProduccionContext";
import PermissionGuard from "./PermissionGuard";
import RoleBasedMenu from "./RoleBasedMenu";

import "./App.css";

const ProtectedRoute = ({ children }) => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const RoleBasedRoute = ({ children, requiredPermissions = [], requireAll = false }) => {
  const { hasModule, loading, userRole } = useRole();
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  
  if (loading) return null;
  if (!usuario) return <Navigate to="/login" replace />;
  if (requiredPermissions.length === 0) return children;
  
  const hasAccess = requiredPermissions.some(perm => hasModule(perm));
  
  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

const AccesoDenegado = () => {
  const { roleInfo, userRole } = useRole();
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  
  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      height: "100vh",
      textAlign: "center",
      padding: "20px",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    }}>
      <div style={{ 
        background: "white",
        borderRadius: "32px",
        padding: "50px 40px",
        maxWidth: "500px",
        width: "100%",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)"
      }}>
        <div style={{ fontSize: "80px", marginBottom: "20px" }}>🚫</div>
        <h1 style={{ fontSize: "32px", marginBottom: "10px", color: "#f44336" }}>
          Acceso Denegado
        </h1>
        <p style={{ fontSize: "18px", color: "#666", marginBottom: "30px" }}>
          No tienes permisos suficientes para acceder a esta página.
        </p>
        <div style={{ 
          background: "#f5f5f5", 
          padding: "20px", 
          borderRadius: "10px",
          marginBottom: "30px"
        }}>
          <p style={{ margin: "0 0 10px 0", fontWeight: "bold" }}>Tu rol actual:</p>
          <p style={{ margin: "0", color: roleInfo.color, fontSize: "18px", fontWeight: "bold" }}>
            {roleInfo.icono} {roleInfo.nombre}
          </p>
        </div>
        <Link 
          to="/dashboard" 
          style={{
            background: "linear-gradient(135deg, #6366f1, #4f46e5)",
            color: "white",
            textDecoration: "none",
            padding: "12px 30px",
            borderRadius: "25px",
            fontSize: "16px",
            fontWeight: "bold",
            display: "inline-block"
          }}
        >
          Volver al Dashboard
        </Link>
      </div>
    </div>
  );
};

function AppLayout() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather] = useState({ temp: 31, condition: "Mayormente soleado", icon: "☀️" });
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const location = useLocation();
  const { getMenuItems, roleInfo } = useRole();

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    const usuarioGuardado = JSON.parse(localStorage.getItem("usuario"));
    setUsuario(usuarioGuardado);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    window.location.href = "/login";
  };

  const menuItems = getMenuItems();

  const filteredItems = searchTerm.length > 1 
    ? menuItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  useEffect(() => {
    const notifs = [
      { id: 1, message: "✅ Lote completado en Plotter #12", type: "success", time: "ahora", read: false },
      { id: 2, message: "⚠️ Alerta de temperatura en Máquina #08", type: "warning", time: "ahora", read: false },
      { id: 3, message: "ℹ️ Nuevo escaneo en Trazabilidad", type: "info", time: "hace 2m", read: true },
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
    if (path.includes("dashboard")) return "Dashboard Principal";
    if (path.includes("atrasos")) return "Control de Atrasos";
    if (path.includes("plan-semanal")) return "Plan Semanal";
    if (path.includes("ordenes")) return "Gestión de Órdenes";
    if (path.includes("maquinas")) return "Máquinas en Tiempo Real";
    if (path.includes("trazabilidad")) return "Trazabilidad de Lotes";
    if (path.includes("reporte-rh")) return "Reportes de RH";
    if (path.includes("micelanios")) return "Miceláneos";
    if (path.includes("fftt-quality")) return "FFTT Quality Control";
    if (path.includes("plotter")) return "Plotter - 17 Máquinas";
    if (path.includes("diseno")) return "Diseño & Producción";
    if (path.includes("reportes")) return "Reportes";
    if (path.includes("configuracion")) return "Configuración del Sistema";
    return "TEGRA";
  };

  if (!usuario) return null;

  return (
    <div className={`app-container ${darkMode ? "dark" : "light"}`}>
      <button 
        className={`sidebar-toggle ${sidebarOpen ? "open" : "closed"}`}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <span className="toggle-icon">{sidebarOpen ? "◀" : "▶"}</span>
      </button>

      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
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
                  <span className="result-icon">{item.icon}</span>
                  <div className="result-info">
                    <span className="result-name">{item.name}</span>
                    <span className="result-category">{item.category}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          <RoleBasedMenu />
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
            <div className="user-avatar" style={{ background: roleInfo.color }}>
              {usuario?.avatar || roleInfo.icono}
            </div>
            <div className="user-details">
              <span className="user-name">{usuario?.nombre || "Usuario"}</span>
              <span className="user-role" style={{ color: roleInfo.color }}>{roleInfo.nombre}</span>
            </div>
            {showUserMenu && (
              <div className="user-menu">
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
            {darkMode ? "☀️" : "🌙"}
            <span className="btn-text">{darkMode ? "Claro" : "Oscuro"}</span>
          </button>
        </div>
      </aside>

      <main className={`main-content ${sidebarOpen ? "" : "expanded"}`}>
        <div className="content-header">
          <div className="header-title">
            <h1 className="page-title animate-slide-in">{getPageTitle()}</h1>
            <div className="header-date">
              <span className="date-icon">📅</span>
              {currentTime.toLocaleDateString("es-ES", { 
                weekday: "long", 
                day: "numeric", 
                month: "long", 
                year: "numeric" 
              })}
            </div>
          </div>
          
          <div className="header-actions">
            <button className="action-btn notification-btn">
              <span className="btn-icon">🔔</span>
              {unreadCount > 0 && <span className="notification-badge animate-pulse">{unreadCount}</span>}
            </button>
          </div>
        </div>

        <div className="content-body">
          <Outlet />
        </div>
      </main>

      <div className="floating-notifications">
        {notifications.filter(n => !n.read).slice(0, 2).map(notif => (
          <div key={notif.id} className={`floating-notification ${notif.type} animate-slide-right`}>
            <span className="notification-message">{notif.message}</span>
            <span className="notification-time">{notif.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const usuarioGuardado = JSON.parse(localStorage.getItem("usuario"));
    setUsuario(usuarioGuardado);
  }, []);

  return (
    <RoleProvider>
      <ProduccionProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/acceso-denegado" element={<AccesoDenegado />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            <Route 
              path="/" 
              element={
                usuario ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
              } 
            />
            
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
              <Route path="ordenes" element={<RoleBasedRoute><Ordenes /></RoleBasedRoute>} />
              <Route path="maquinas" element={<RoleBasedRoute requiredPermissions={["maquinas"]}><MaquinasTiempoReal /></RoleBasedRoute>} />
              <Route path="trazabilidad" element={<RoleBasedRoute requiredPermissions={["trazabilidad"]}><TrazabilidadLotes /></RoleBasedRoute>} />
              <Route path="reporte-rh" element={<RoleBasedRoute requiredPermissions={["reporte-rh"]}><ReporteRH /></RoleBasedRoute>} />
              <Route path="micelanios" element={<Micelanios />} />
              <Route path="fftt-quality" element={<RoleBasedRoute requiredPermissions={["fftt-quality"]}><FFTTquality /></RoleBasedRoute>} />
              <Route path="plotter" element={<RoleBasedRoute requiredPermissions={["plotter"]}><PlotterLotes /></RoleBasedRoute>} />
              <Route path="diseno" element={<RoleBasedRoute requiredPermissions={["diseno"]}><DisenoProduccion /></RoleBasedRoute>} />
              <Route path="reportes" element={<RoleBasedRoute requiredPermissions={["reportes"]}><Reportes /></RoleBasedRoute>} />
              <Route path="configuracion" element={<RoleBasedRoute requiredPermissions={["configuracion"]}><Configuracion /></RoleBasedRoute>} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ProduccionProvider>
    </RoleProvider>
  );
}

export default App;