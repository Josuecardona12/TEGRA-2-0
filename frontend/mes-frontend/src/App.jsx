import React, { useState, useEffect, useCallback, lazy, Suspense, useRef, useMemo, startTransition } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  Outlet,
  useLocation,
  useNavigate
} from "react-router-dom";


const prefetchMap = new Map();

const prefetchRoute = (path, importFn) => {
  if (prefetchMap.has(path)) return;
  prefetchMap.set(path, true);
  // Iniciar carga en segundo plano sin bloquear UI
  const prefetchPromise = importFn();
  prefetchMap.set(`${path}_promise`, prefetchPromise);
  return prefetchPromise;
};

// Lazy loading con prefetch integrado
const createPrefetchedLazy = (importFn, routePath) => {
  const Component = lazy(() => {
    // Iniciar prefetch inmediatamente
    prefetchRoute(routePath, importFn);
    return importFn();
  });
  Component.displayName = `Prefetched_${routePath}`;
  return Component;
};

// Importar componentes con prefetch
const Micelanios = createPrefetchedLazy(() => import("./pages/Micelanios"), "/micelanios");
const AtrasosDashboard = createPrefetchedLazy(() => import("./pages/AtrasosDashboard"), "/atrasos");
const PlanSemanal = createPrefetchedLazy(() => import("./pages/PlanSemanal"), "/plan-semanal");
const Login = createPrefetchedLazy(() => import("./pages/Login"), "/login");
const Ordenes = createPrefetchedLazy(() => import("./pages/Ordenes"), "/ordenes");
const Configuracion = createPrefetchedLazy(() => import("./pages/Configuracion"), "/configuracion");
const Reportes = createPrefetchedLazy(() => import("./pages/Reportes"), "/reportes");
const ReporteRH = createPrefetchedLazy(() => import("./pages/ReporteRH"), "/reporte-rh");
const MaquinasTiempoReal = createPrefetchedLazy(() => import("./pages/MaquinasTiempoReal"), "/maquinas");
const TrazabilidadLotes = createPrefetchedLazy(() => import("./trazabilidad-dashboard/TrazabilidadLotes"), "/trazabilidad");
const FFTTquality = createPrefetchedLazy(() => import("./pages/FFTTquality"), "/fftt-quality");
const PlotterLotes = createPrefetchedLazy(() => import("./pages/PlotterLotes"), "/plotter");
const DisenoProduccion = createPrefetchedLazy(() => import("./pages/DisenoProduccion"), "/diseno");
const Dashboard = createPrefetchedLazy(() => import("./pages/Dashboard"), "/dashboard");
const Unauthorized = createPrefetchedLazy(() => import("./pages/Unauthorized"), "/unauthorized");
// ===== NUEVO: Buzón de Diseño =====
const BuzonDiseno = createPrefetchedLazy(() => import("./pages/BuzonDiseno"), "/buzon-diseno");

import { RoleProvider, useRole } from "./RoleContext";
import { ProduccionProvider } from "./context/ProduccionContext";
import RoleBasedMenu from "./RoleBasedMenu";

import "./App.css";

// ============================================
// LOADING SPINNER ULTRA PREMIUM
// ============================================
const LoadingSpinner = React.memo(() => (
  <div className="premium-loader">
    <div className="loader">
      <div className="loader-circle"></div>
      <div className="loader-circle"></div>
      <div className="loader-circle"></div>
      <p className="loader-text">Cargando experiencia premium</p>
      <div className="loader-progress">
        <div className="loader-progress-bar"></div>
      </div>
    </div>
  </div>
));
LoadingSpinner.displayName = 'LoadingSpinner';

// ============================================
// SKELETON LOADER - Para transiciones suaves
// ============================================
const SkeletonLoader = React.memo(() => (
  <div className="skeleton-loader">
    <div className="skeleton-header"></div>
    <div className="skeleton-cards">
      <div className="skeleton-card"></div>
      <div className="skeleton-card"></div>
      <div className="skeleton-card"></div>
      <div className="skeleton-card"></div>
    </div>
    <div className="skeleton-chart"></div>
  </div>
));
SkeletonLoader.displayName = 'SkeletonLoader';

// ============================================
// ERROR BOUNDARY MEJORADO
// ============================================
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error capturado:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-premium">
          <div className="error-card">
            <div className="error-icon">💥</div>
            <h2>Error inesperado</h2>
            <p>{this.state.error?.message || "Ha ocurrido un error en la aplicación"}</p>
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

// ============================================
// COMPONENTES MEMOIZADOS
// ============================================
const ProtectedRoute = React.memo(({ children }) => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }
  return children;
});
ProtectedRoute.displayName = 'ProtectedRoute';

const RoleBasedRoute = React.memo(({ children, requiredPermissions = [] }) => {
  const { hasModule, loading } = useRole();
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  
  if (loading) return <SkeletonLoader />;
  if (!usuario) return <Navigate to="/login" replace />;
  if (requiredPermissions.length === 0) return children;
  
  const hasAccess = requiredPermissions.some(perm => hasModule(perm));
  
  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
});
RoleBasedRoute.displayName = 'RoleBasedRoute';

const AccesoDenegado = React.memo(() => {
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
});
AccesoDenegado.displayName = 'AccesoDenegado';

// ============================================
// HOOK PERSONALIZADO PARA PREFETCH EN HOVER
// ============================================
const usePrefetchOnHover = (path, importFn) => {
  const prefetchedRef = useRef(false);
  
  const handleMouseEnter = useCallback(() => {
    if (!prefetchedRef.current) {
      prefetchedRef.current = true;
      // Cargar en segundo plano sin bloquear
      const idleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 100));
      idleCallback(() => {
        importFn().catch(console.error);
      });
    }
  }, [importFn]);
  
  return handleMouseEnter;
};

// ============================================
// COMPONENTE DE ENLACE CON PREFETCH
// ============================================
const PrefetchLink = React.memo(({ to, children, className, onClick }) => {
  const navigate = useNavigate();
  const prefetchOnHover = usePrefetchOnHover(to, () => {
    const route = Object.values({
      dashboard: () => import("./pages/Dashboard"),
      atrasos: () => import("./pages/AtrasosDashboard"),
      "plan-semanal": () => import("./pages/PlanSemanal"),
      ordenes: () => import("./pages/Ordenes"),
      maquinas: () => import("./pages/MaquinasTiempoReal"),
      trazabilidad: () => import("./trazabilidad-dashboard/TrazabilidadLotes"),
      "fftt-quality": () => import("./pages/FFTTquality"),
      plotter: () => import("./pages/PlotterLotes"),
      diseno: () => import("./pages/DisenoProduccion"),
      reportes: () => import("./pages/Reportes"),
      configuracion: () => import("./pages/Configuracion"),
      "reporte-rh": () => import("./pages/ReporteRH"),
      micelanios: () => import("./pages/Micelanios"),
      "buzon-diseno": () => import("./pages/BuzonDiseno"),
    })[to.replace("/", "")];
    return route || (() => Promise.resolve());
  });
  
  const handleClick = useCallback((e) => {
    if (onClick) onClick(e);
    startTransition(() => {
      navigate(to);
    });
  }, [navigate, to, onClick]);
  
  return (
    <Link 
      to={to} 
      className={className} 
      onClick={handleClick}
      onMouseEnter={prefetchOnHover}
    >
      {children}
    </Link>
  );
});
PrefetchLink.displayName = 'PrefetchLink';

// ============================================
// COMPONENTE PRINCIPAL APP LAYOUT (Optimizado)
// ============================================
function AppLayout() {
  // ================ ESTADOS ================
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { getMenuItems, roleInfo } = useRole();
  const mainContentRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const transitionTimeoutRef = useRef(null);
  
  // ================ MEMOIZACIÓN DE VALORES ================
  const menuItems = useMemo(() => getMenuItems(), [getMenuItems]);
  
  // ================ FUNCIONES MEMOIZADAS ================
  const getPageTitle = useCallback(() => {
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
      configuracion: "⚙️ Configuración",
      "buzon-diseno": "🎨 Buzón de Diseño"
    };
    for (const [key, title] of Object.entries(titles)) {
      if (path.includes(key)) return title;
    }
    return "🏭 TEGRA";
  }, [location.pathname]);
  
  const filteredItems = useMemo(() => {
    if (searchTerm.length < 2) return [];
    return menuItems.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, menuItems]);
  
  const getFilteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (activeTab === "unread") return !n.read;
      return true;
    });
  }, [notifications, activeTab]);
  
  // ================ EFECTOS OPTIMIZADOS ================
  // Persistir modo oscuro
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    document.body.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);
  
  // Detectar scroll con throttle optimizado
  useEffect(() => {
    let ticking = false;
    let lastScrollY = 0;
    
    const handleScroll = () => {
      if (!ticking && mainContentRef.current) {
        requestAnimationFrame(() => {
          const currentScrollY = mainContentRef.current.scrollTop;
          setIsScrolled(currentScrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
      lastScrollY = mainContentRef.current?.scrollTop || 0;
    };
    
    const currentRef = mainContentRef.current;
    if (currentRef) {
      currentRef.addEventListener("scroll", handleScroll, { passive: true });
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
  
  // Reloj optimizado con requestAnimationFrame
  useEffect(() => {
    let animationId;
    let lastUpdate = Date.now();
    
    const updateClock = () => {
      const now = Date.now();
      if (now - lastUpdate >= 1000) {
        setCurrentTime(new Date());
        lastUpdate = now;
      }
      animationId = requestAnimationFrame(updateClock);
    };
    
    animationId = requestAnimationFrame(updateClock);
    return () => cancelAnimationFrame(animationId);
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
      startTransition(() => {
        setWeather(random);
      });
    }, 1800000);
    return () => clearInterval(interval);
  }, []);
  
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
      startTransition(() => {
        setNotifications(prev => [newNotif, ...prev].slice(0, 10));
        setUnreadCount(prev => prev + 1);
      });
    }, 45000);
    
    return () => clearInterval(interval);
  }, []);
  
  // ================ FUNCIONES MEMOIZADAS ================
  const handleLogout = useCallback(() => {
    localStorage.removeItem("usuario");
    window.location.href = "/login";
  }, []);
  
  const markAllAsRead = useCallback(() => {
    startTransition(() => {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    });
  }, []);
  
  const markAsRead = useCallback((id) => {
    startTransition(() => {
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    });
  }, []);
  
  const toggleSidebar = useCallback(() => {
    startTransition(() => {
      setSidebarOpen(prev => !prev);
    });
  }, []);
  
  const toggleDarkMode = useCallback(() => {
    startTransition(() => {
      setDarkMode(prev => !prev);
    });
  }, []);
  
  const scrollToTop = useCallback(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);
  
  // Manejo de búsqueda con debounce
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      startTransition(() => {
        setSearchTerm(value);
      });
    }, 150);
  }, []);
  
  const handleSearchFocus = useCallback(() => {
    setShowSearch(true);
  }, []);
  
  const handleSearchBlur = useCallback(() => {
    setTimeout(() => setShowSearch(false), 200);
  }, []);
  
  // ================ RENDER ================
  if (!usuario) return <LoadingSpinner />;
  
  return (
    <ErrorBoundary>
      <div className={`app-premium ${darkMode ? "dark" : "light"} ${isTransitioning ? "transitioning" : ""}`}>
        {/* Sidebar Toggle */}
        <button 
          className={`sidebar-toggle-premium ${sidebarOpen ? "open" : "closed"}`}
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
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
              defaultValue={searchTerm}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              autoComplete="off"
            />
            
            {showSearch && filteredItems.length > 0 && (
              <div className="search-premium-results">
                {filteredItems.map(item => (
                  <PrefetchLink
                    key={item.path}
                    to={item.path}
                    className="search-premium-result"
                  >
                    <span className="result-premium-icon">{item.icon}</span>
                    <span className="result-premium-name">{item.name}</span>
                  </PrefetchLink>
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
            <div className="user-premium-section" onClick={() => setShowUserMenu(prev => !prev)}>
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
            <button className="theme-premium-toggle" onClick={toggleDarkMode}>
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
                  onClick={() => setShowNotificationPanel(prev => !prev)}
                  aria-label="Notificaciones"
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
            <Suspense fallback={<SkeletonLoader />}>
              <Outlet />
            </Suspense>
          </div>
          
          {/* Scroll to Top */}
          {isScrolled && (
            <button 
              className="scroll-premium-top"
              onClick={scrollToTop}
              aria-label="Volver arriba"
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
                  {/* ===== NUEVA RUTA: BUZÓN DE DISEÑO ===== */}
                  <Route path="buzon-diseno" element={<BuzonDiseno />} />
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