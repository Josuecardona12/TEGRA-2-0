import React, { useState, useEffect, useCallback, lazy, Suspense, useRef } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  Outlet,
  useLocation
} from "react-router-dom";

// Lazy loading
const Micelanios = lazy(() => import("./pages/Micelanios"));
const AtrasosDashboard = lazy(() => import("./pages/AtrasosDashboard"));
const PlanSemanal = lazy(() => import("./pages/PlanSemanal"));
const Login = lazy(() => import("./pages/Login"));
const Ordenes = lazy(() => import("./pages/Ordenes"));
const Configuracion = lazy(() => import("./pages/Configuracion"));
const Reportes = lazy(() => import("./pages/Reportes"));
const ReporteRH = lazy(() => import("./pages/ReporteRH"));
const MaquinasTiempoReal = lazy(() => import("./pages/MaquinasTiempoReal"));
const TrazabilidadLotes = lazy(() => import("./trazabilidad-dashboard/TrazabilidadLotes"));
const FFTTquality = lazy(() => import("./pages/FFTTquality"));
const PlotterLotes = lazy(() => import("./pages/PlotterLotes"));
const DisenoProduccion = lazy(() => import("./pages/DisenoProduccion"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));

import { RoleProvider, useRole } from "./RoleContext";
import { ProduccionProvider } from "./context/ProduccionContext";
import RoleBasedMenu from "./RoleBasedMenu";

import "./App.css";

// ============================================
// LOADING SPINNER PREMIUM
// ============================================
const LoadingSpinner = () => (
  <div className="premium-loader">
    <div className="loader">
      <div className="loader-circle"></div>
      <div className="loader-circle"></div>
      <div className="loader-circle"></div>
      <p>Cargando experiencia premium</p>
    </div>
  </div>
);

// ============================================
// ERROR BOUNDARY
// ============================================
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-premium">
          <div className="error-card">
            <div className="error-icon">💥</div>
            <h2>Error inesperado</h2>
            <p>Ha ocurrido un error en la aplicación</p>
            <button onClick={() => window.location.reload()}>
              Recargar aplicación
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const ProtectedRoute = ({ children }) => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const RoleBasedRoute = ({ children, requiredPermissions = [] }) => {
  const { hasModule, loading } = useRole();
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  
  if (loading) return <LoadingSpinner />;
  if (!usuario) return <Navigate to="/login" replace />;
  if (requiredPermissions.length === 0) return children;
  
  const hasAccess = requiredPermissions.some(perm => hasModule(perm));
  
  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

// Acceso Denegado Premium
const AccesoDenegado = () => {
  const { roleInfo } = useRole();
  
  return (
    <div className="access-denied-premium">
      <div className="denied-card">
        <div className="denied-icon">🔒</div>
        <h1>Acceso Restringido</h1>
        <p>No tienes permisos para acceder a esta página</p>
        <div className="denied-role">
          <span>Tu rol actual:</span>
          <strong style={{ color: roleInfo?.color }}>{roleInfo?.nombre}</strong>
        </div>
        <Link to="/dashboard" className="denied-button">
          Volver al Dashboard
        </Link>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL APP LAYOUT
// ============================================
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
  const [weather, setWeather] = useState({ temp: 28, condition: "Mayor. soleado", icon: "☀️" });
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [isScrolled, setIsScrolled] = useState(false);
  
  const location = useLocation();
  const { getMenuItems, roleInfo } = useRole();
  const mainContentRef = useRef(null);
  
  // Persistir modo oscuro
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    document.body.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);
  
  // Detectar scroll
  useEffect(() => {
    const handleScroll = () => {
      if (mainContentRef.current) {
        setIsScrolled(mainContentRef.current.scrollTop > 50);
      }
    };
    const currentRef = mainContentRef.current;
    if (currentRef) {
      currentRef.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (currentRef) {
        currentRef.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);
  
  // Cargar usuario
  useEffect(() => {
    const usuarioGuardado = JSON.parse(localStorage.getItem("usuario"));
    setUsuario(usuarioGuardado);
  }, []);
  
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
      const random = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
      setWeather(random);
    }, 1800000);
    return () => clearInterval(interval);
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem("usuario");
    window.location.href = "/login";
  };
  
  const menuItems = getMenuItems();
  
  // Filtrar búsqueda
  const filteredItems = searchTerm.length > 1
    ? menuItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];
  
  // Notificaciones
  useEffect(() => {
    const exampleNotifs = [
      { id: 1, message: "🎉 ¡Nuevo récord de producción!", type: "success", time: "ahora", read: false, icon: "🏆" },
      { id: 2, message: "⚠️ Alerta de temperatura en Máquina M-004", type: "warning", time: "hace 5m", read: false, icon: "🔥" },
      { id: 3, message: "📊 Dashboard actualizado", type: "info", time: "hace 10m", read: true, icon: "📈" },
      { id: 4, message: "✅ Lote completado con calidad perfecta", type: "success", time: "hace 15m", read: false, icon: "✨" },
    ];
    setNotifications(exampleNotifs);
    setUnreadCount(exampleNotifs.filter(n => !n.read).length);
    
    const interval = setInterval(() => {
      const messages = [
        { message: "🏆 ¡Récord de eficiencia!", type: "success", icon: "🏆" },
        { message: "⚠️ Mantenimiento preventivo", type: "warning", icon: "🔧" },
        { message: "📈 Nuevo reporte disponible", type: "info", icon: "📊" }
      ];
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      const newNotif = {
        id: Date.now(),
        ...randomMsg,
        time: "ahora",
        read: false
      };
      setNotifications(prev => [newNotif, ...prev].slice(0, 10));
      setUnreadCount(prev => prev + 1);
    }, 45000);
    
    return () => clearInterval(interval);
  }, []);
  
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };
  
  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };
  
  const getFilteredNotifications = notifications.filter(n => {
    if (activeTab === "unread") return !n.read;
    return true;
  });
  
  const getPageTitle = () => {
    const path = location.pathname;
    const titles = {
      dashboard: "✨ Dashboard Principal",
      atrasos: "⏱️ Control de Atrasos",
      "plan-semanal": "📅 Plan Semanal",
      ordenes: "📋 Gestión de Órdenes",
      maquinas: "⚙️ Máquinas en Tiempo Real",
      trazabilidad: "🔍 Trazabilidad de Lotes",
      "reporte-rh": "👥 Reportes de RH",
      micelanios: "🎯 Miceláneos",
      "fftt-quality": "📊 FFTT Quality Control",
      plotter: "🖨️ Plotter - 17 Máquinas",
      diseno: "🎨 Diseño & Producción",
      reportes: "📈 Reportes",
      configuracion: "⚙️ Configuración"
    };
    for (const [key, title] of Object.entries(titles)) {
      if (path.includes(key)) return title;
    }
    return "🏭 TEGRA";
  };
  
  if (!usuario) return <LoadingSpinner />;
  
  return (
    <ErrorBoundary>
      <div className={`app-premium ${darkMode ? "dark" : "light"}`}>
        {/* Sidebar Toggle */}
        <button 
          className={`sidebar-toggle-premium ${sidebarOpen ? "open" : "closed"}`}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <span className="toggle-icon">{sidebarOpen ? "◀" : "▶"}</span>
        </button>
        
        {/* Sidebar */}
        <aside className={`sidebar-premium ${sidebarOpen ? "open" : "closed"}`}>
          <div className="sidebar-gradient"></div>
          
          <div className="sidebar-header-premium">
            <div className="system-status-premium">
              <span className="status-dot-premium"></span>
              <span className="status-text-premium">SISTEMA OPERATIVO</span>
              <span className="uptime-badge-premium">99.99%</span>
            </div>
          </div>
          
          {/* Search */}
          <div className="search-premium-container">
            <span className="search-premium-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar módulos..."
              className="search-premium-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowSearch(true)}
              onBlur={() => setTimeout(() => setShowSearch(false), 200)}
            />
            
            {showSearch && filteredItems.length > 0 && (
              <div className="search-premium-results">
                {filteredItems.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="search-premium-result"
                    onClick={() => setShowSearch(false)}
                  >
                    <span className="result-premium-icon">{item.icon}</span>
                    <span className="result-premium-name">{item.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          {/* Role Card */}
          <div className="role-premium-card">
            <div className="role-premium-icon" style={{ background: roleInfo?.color || "#6366f1" }}>
              {roleInfo?.icono || "👑"}
            </div>
            <div className="role-premium-info">
              <span className="role-premium-label">ROL ACTUAL</span>
              <span className="role-premium-name">{roleInfo?.nombre || "Administrador"}</span>
              <span className="role-premium-desc">Acceso total al sistema</span>
            </div>
          </div>
          
          {/* Menu */}
          <nav className="sidebar-premium-nav">
            <RoleBasedMenu />
          </nav>
          
          {/* Footer */}
          <div className="sidebar-premium-footer">
            {/* Weather */}
            <div className="weather-premium-widget">
              <span className="weather-premium-icon">{weather.icon}</span>
              <div>
                <div className="weather-premium-temp">{weather.temp}°C</div>
                <div className="weather-premium-desc">{weather.condition}</div>
              </div>
            </div>
            
            {/* User */}
            <div className="user-premium-section" onClick={() => setShowUserMenu(!showUserMenu)}>
              <div className="user-premium-avatar" style={{ background: roleInfo?.color || "#6366f1" }}>
                {usuario?.avatar || "👤"}
              </div>
              <div className="user-premium-details">
                <div className="user-premium-name">{usuario?.nombre || "Administrador"}</div>
                <div className="user-premium-role">{roleInfo?.nombre || "Administrador"}</div>
              </div>
              <span className="user-premium-arrow">▼</span>
              
              {showUserMenu && (
                <div className="user-premium-dropdown">
                  <button onClick={handleLogout} className="logout-premium-btn">
                    🔒 Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
            
            {/* Stats */}
            <div className="footer-premium-stats">
              <div className="stat-premium">
                <div className="stat-premium-value">v3.0.0</div>
                <div className="stat-premium-label">versión</div>
              </div>
              <div className="stat-premium">
                <div className="stat-premium-value">99.99%</div>
                <div className="stat-premium-label">uptime</div>
              </div>
              <div className="stat-premium">
                <div className="stat-premium-value">{currentTime.toLocaleTimeString().slice(0,5)}</div>
                <div className="stat-premium-label">hora</div>
              </div>
            </div>
            
            {/* Theme Toggle */}
            <button className="theme-premium-toggle" onClick={() => setDarkMode(!darkMode)}>
              <span className="theme-premium-icon">{darkMode ? "☀️" : "🌙"}</span>
              <span>{darkMode ? "Modo Claro" : "Modo Oscuro"}</span>
            </button>
          </div>
        </aside>
        
        {/* Main Content */}
        <main 
          className={`main-premium-content ${sidebarOpen ? "" : "expanded"}`}
          ref={mainContentRef}
        >
          <div className={`content-premium-header ${isScrolled ? "scrolled" : ""}`}>
            <div className="header-premium-title">
              <h1 className="page-premium-title">{getPageTitle()}</h1>
              <div className="header-premium-date">
                <span className="date-premium-icon">📅</span>
                <span>
                  {currentTime.toLocaleDateString("es-ES", { 
                    weekday: "long", 
                    day: "numeric", 
                    month: "long", 
                    year: "numeric" 
                  })}
                </span>
              </div>
            </div>
            
            <div className="header-premium-actions">
              <div className="notification-premium-wrapper">
                <button 
                  className={`notification-premium-btn ${unreadCount > 0 ? "has-notif" : ""}`}
                  onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                >
                  🔔
                  {unreadCount > 0 && (
                    <span className="notification-premium-badge">{unreadCount}</span>
                  )}
                </button>
                
                {showNotificationPanel && (
                  <div className="notification-premium-panel">
                    <div className="panel-premium-header">
                      <h4>Notificaciones</h4>
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead}>Marcar todas</button>
                      )}
                    </div>
                    <div className="panel-premium-tabs">
                      <button 
                        className={activeTab === "all" ? "active" : ""}
                        onClick={() => setActiveTab("all")}
                      >
                        Todas
                      </button>
                      <button 
                        className={activeTab === "unread" ? "active" : ""}
                        onClick={() => setActiveTab("unread")}
                      >
                        No leídas {unreadCount > 0 && `(${unreadCount})`}
                      </button>
                    </div>
                    <div className="notifications-premium-list">
                      {getFilteredNotifications.length === 0 ? (
                        <div className="empty-premium-notifications">
                          <span>🎉</span>
                          <p>¡Todas las notificaciones están al día!</p>
                        </div>
                      ) : (
                        getFilteredNotifications.map(notif => (
                          <div 
                            key={notif.id} 
                            className={`notification-premium-item ${notif.type} ${notif.read ? "read" : ""}`}
                            onClick={() => markAsRead(notif.id)}
                          >
                            <span className="notif-premium-icon">{notif.icon}</span>
                            <div className="notif-premium-content">
                              <div className="notif-premium-message">{notif.message}</div>
                              <div className="notif-premium-time">{notif.time}</div>
                            </div>
                            {!notif.read && <span className="notif-premium-dot"></span>}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="content-premium-body">
            <Suspense fallback={<LoadingSpinner />}>
              <Outlet />
            </Suspense>
          </div>
          
          {/* Scroll to Top */}
          {isScrolled && (
            <button 
              className="scroll-premium-top"
              onClick={() => mainContentRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
            >
              ↑
            </button>
          )}
        </main>
        
        {/* Floating Toasts */}
        <div className="floating-premium-toasts">
          {notifications.filter(n => !n.read).slice(0, 2).map(notif => (
            <div key={notif.id} className={`toast-premium ${notif.type}`}>
              <span className="toast-premium-icon">{notif.icon}</span>
              <span className="toast-premium-message">{notif.message}</span>
              <div className="toast-premium-progress"></div>
            </div>
          ))}
        </div>
      </div>
    </ErrorBoundary>
  );
}

// ============================================
// APP PRINCIPAL
// ============================================
function App() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const usuarioGuardado = JSON.parse(localStorage.getItem("usuario"));
    setUsuario(usuarioGuardado);
  }, []);

  return (
    <ErrorBoundary>
      <RoleProvider>
        <ProduccionProvider>
          <BrowserRouter>
            <Suspense fallback={<LoadingSpinner />}>
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
            </Suspense>
          </BrowserRouter>
        </ProduccionProvider>
      </RoleProvider>
    </ErrorBoundary>
  );
}

export default App;