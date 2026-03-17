import React, { useState, useEffect, useRef } from 'react';
import './Dashboard.css';

// ============================================
// CONFIGURACIÓN WEBSOCKET PARA TIEMPO REAL
// ============================================
const WS_URL = 'wss://glowing-lamp-r47wvpq4574fxv7j-8080.app.github.dev';

const Dashboard = () => {
  // ================ ESTADOS PRINCIPALES ================
  const [tiempoReal, setTiempoReal] = useState(new Date());
  const [periodo, setPeriodo] = useState('dia');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [modoOscuro, setModoOscuro] = useState(false);
  const [animacionActiva, setAnimacionActiva] = useState(false);
  const [showNotificaciones, setShowNotificaciones] = useState(false);
  const [vistaMetricas, setVistaMetricas] = useState('completo');
  
  // ================ ESTADOS DE CONEXIÓN ================
  const [conectado, setConectado] = useState(false);
  const [ultimoMovimiento, setUltimoMovimiento] = useState(null);
  const wsRef = useRef(null);
  const mainContentRef = useRef(null);

  // ================ MÉTRICAS EN CERO PARA PRUEBAS ================
  const [metricas, setMetricas] = useState({
    produccion: {
      total: 0,
      hoy: 0,
      semana: 0,
      mes: 0,
      tendencia: '0%',
      meta: 0,
      progreso: 0
    },
    calidad: {
      tasaFFTT: 0,
      aceptadas: 0,
      rechazadas: 0,
      pendientes: 0,
      tendencia: '0%',
      sigma: 0
    },
    eficiencia: {
      global: 0,
      maquinas: 0,
      operadores: 0,
      tendencia: '0%',
      oee: 0
    },
    lotes: {
      activos: 0,
      completados: 0,
      pendientes: 0,
      criticos: 0,
      retrasados: 0,
      tendencia: '0%'
    },
    disenos: {
      activos: 0,
      completados: 0,
      pendientes: 0,
      tiempoPromedio: '0min',
      tendencia: '0%'
    },
    maquinas: {
      total: 0,
      operativas: 0,
      mantenimiento: 0,
      reparacion: 0,
      eficienciaPromedio: 0,
      produccionHora: 0
    },
    personal: {
      total: 0,
      activos: 0,
      ausentes: 0,
      vacaciones: 0,
      productividad: 0
    }
  });

  // ================ PRODUCCIÓN POR HORA EN CERO ================
  const [produccionHora, setProduccionHora] = useState(
    Array.from({ length: 12 }, (_, i) => ({
      hora: `${String(i + 6).padStart(2, '0')}:00`,
      valor: 0,
      meta: 0
    }))
  );

  // ================ MÁQUINAS EN CERO ================
  const [maquinas, setMaquinas] = useState([]);

  // ================ LOTES RECIENTES VACÍOS ================
  const [lotesRecientes, setLotesRecientes] = useState([]);

  // ================ DISEÑOS RECIENTES VACÍOS ================
  const [disenosRecientes, setDisenosRecientes] = useState([]);

  // ================ ALERTAS VACÍAS ================
  const [alertas, setAlertas] = useState([]);

  // ================ NOTIFICACIONES ================
  const [notificaciones, setNotificaciones] = useState([]);

  // ================ CONEXIÓN WEBSOCKET ================
  useEffect(() => {
    console.log('🔌 Dashboard conectando...');
    
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    
    ws.onopen = () => {
      console.log('✅ Dashboard conectado');
      setConectado(true);
      agregarNotificacion('✅ Conectado al servidor en tiempo real', 'exito');
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📦 Dashboard recibió:', data.type);
        
        if (data.type === 'ACTUALIZACION' && data.data.ultimoMovimiento) {
          setUltimoMovimiento(data.data.ultimoMovimiento);
          agregarNotificacion(`🔄 ${data.data.ultimoMovimiento.loteId} → ${data.data.ultimoMovimiento.area}`, 'info');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('❌ Error WebSocket:', error);
      setConectado(false);
      agregarNotificacion('❌ Error de conexión', 'error');
    };
    
    ws.onclose = () => {
      console.log('❌ Dashboard desconectado');
      setConectado(false);
    };
    
    return () => ws.close();
  }, []);

  // ================ EFECTOS ================
  useEffect(() => {
    const timer = setInterval(() => {
      setTiempoReal(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (mainContentRef.current) {
        setShowScrollTop(mainContentRef.current.scrollTop > 400);
      }
    };
    const currentRef = mainContentRef.current;
    if (currentRef) currentRef.addEventListener('scroll', handleScroll);
    return () => { if (currentRef) currentRef.removeEventListener('scroll', handleScroll); };
  }, []);

  useEffect(() => {
    const modoGuardado = localStorage.getItem('modoOscuroDashboard') === 'true';
    setModoOscuro(modoGuardado);
  }, []);

  useEffect(() => {
    localStorage.setItem('modoOscuroDashboard', modoOscuro);
  }, [modoOscuro]);

  // ================ FUNCIONES ================
  const scrollToTop = () => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const agregarNotificacion = (mensaje, tipo = 'info') => {
    const id = Date.now();
    setNotificaciones(prev => [...prev, { id, mensaje, tipo }]);
    setTimeout(() => {
      setNotificaciones(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const marcarAlertaLeida = (id) => {
    setAlertas(prev => prev.map(a => a.id === id ? { ...a, leida: true } : a));
  };

  const alertasNoLeidas = alertas.filter(a => !a.leida).length;

  return (
    <div className={`dashboard-container ${modoOscuro ? 'dark-mode' : ''}`} ref={mainContentRef}>
      
      {/* ===== HEADER ELEGANTE ===== */}
      <header className="dashboard-header">
        <div className="header-gradient"></div>
        <div className="header-content">
          <div className="header-left">
            <div className="logo-wrapper">
              <div className="logo-icon">
                <span className="logo-emoji">📊</span>
                <span className="logo-glow"></span>
              </div>
              <div className="logo-text">
                <h1 className="logo-title">
                  DASHBOARD
                  <span className="logo-badge">LIVE</span>
                </h1>
                <span className="logo-subtitle">Centro de Control</span>
              </div>
            </div>
            
            <div className="date-time">
              <span className="date-icon">📅</span>
              <div className="date-info">
                <span className="date-day">
                  {tiempoReal.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  }).replace(/^\w/, c => c.toUpperCase())}
                </span>
                <span className="time-clock">
                  {tiempoReal.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            </div>
          </div>

          <div className="header-right">
            <div className={`connection-badge ${conectado ? 'online' : 'offline'}`}>
              <span className="connection-dot"></span>
              <span className="connection-text">
                {conectado ? 'SERVIDOR EN LÍNEA' : 'MODO LOCAL'}
              </span>
            </div>

            <div className="period-selector">
              <button 
                className={`period-btn ${periodo === 'dia' ? 'active' : ''}`}
                onClick={() => setPeriodo('dia')}
              >
                DÍA
              </button>
              <button 
                className={`period-btn ${periodo === 'semana' ? 'active' : ''}`}
                onClick={() => setPeriodo('semana')}
              >
                SEMANA
              </button>
              <button 
                className={`period-btn ${periodo === 'mes' ? 'active' : ''}`}
                onClick={() => setPeriodo('mes')}
              >
                MES
              </button>
            </div>

            <button 
              className="theme-toggle" 
              onClick={() => setModoOscuro(!modoOscuro)}
              title={modoOscuro ? 'Modo claro' : 'Modo oscuro'}
            >
              <span className="toggle-icon">{modoOscuro ? '☀️' : '🌙'}</span>
              <span className="toggle-glow"></span>
            </button>

            <div className="notifications-wrapper">
              <button 
                className="notifications-button"
                onClick={() => setShowNotificaciones(!showNotificaciones)}
              >
                <span className="bell-icon">🔔</span>
                {alertasNoLeidas > 0 && (
                  <span className="notifications-badge">{alertasNoLeidas}</span>
                )}
                <span className="button-glow"></span>
              </button>
              
              {showNotificaciones && (
                <div className="notifications-menu">
                  <div className="menu-header">
                    <h4>Notificaciones</h4>
                    <button onClick={() => setAlertas(prev => prev.map(a => ({ ...a, leida: true })))}>
                      Limpiar todo
                    </button>
                  </div>
                  <div className="menu-list">
                    {alertas.length === 0 ? (
                      <div className="empty-alertas">
                        <span className="empty-icon">🔔</span>
                        <p>No hay notificaciones</p>
                      </div>
                    ) : (
                      alertas.map(alerta => (
                        <div 
                          key={alerta.id} 
                          className={`alerta-item ${alerta.tipo} ${alerta.leida ? 'leida' : ''}`}
                          onClick={() => marcarAlertaLeida(alerta.id)}
                        >
                          <span className="alerta-icon">
                            {alerta.tipo === 'critica' && '🚨'}
                            {alerta.tipo === 'warning' && '⚠️'}
                            {alerta.tipo === 'info' && 'ℹ️'}
                            {alerta.tipo === 'success' && '✅'}
                          </span>
                          <div className="alerta-content">
                            <span className="alerta-message">{alerta.mensaje}</span>
                            <span className="alerta-time">{alerta.tiempo}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="user-profile">
              <div className="user-avatar">
                <span>AD</span>
                <span className="user-status"></span>
              </div>
              <div className="user-details">
                <span className="user-name">Administrador</span>
                <span className="user-role">Supervisor</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ===== NOTIFICACIONES FLOTANTES ===== */}
      <div className="floating-notifications">
        {notificaciones.map(notif => (
          <div key={notif.id} className={`floating-notif ${notif.tipo}`}>
            <span className="notif-icon">{notif.tipo === 'exito' ? '✅' : notif.tipo === 'error' ? '❌' : 'ℹ️'}</span>
            <span className="notif-text">{notif.mensaje.replace(/[✅❌ℹ️🔄]/g, '')}</span>
          </div>
        ))}
      </div>

      {/* ===== KPI CARDS PRINCIPALES (TODOS EN CERO) ===== */}
      <div className="kpi-grid">
        <div className="kpi-card produccion">
          <div className="kpi-header">
            <span className="kpi-icon">🏭</span>
            <span className="kpi-title">Producción</span>
          </div>
          <div className="kpi-value-container">
            <span className="kpi-value">0</span>
            <span className="kpi-unit">unidades</span>
          </div>
          <div className="kpi-trend">
            <span className="trend-icon">→</span>
            <span className="trend-value">0%</span>
          </div>
          <div className="kpi-progress">
            <div className="progress-bar" style={{ width: '0%' }}></div>
          </div>
          <div className="kpi-footer">
            <span>Hoy: 0</span>
            <span>Meta: 0</span>
          </div>
        </div>

        <div className="kpi-card calidad">
          <div className="kpi-header">
            <span className="kpi-icon">✅</span>
            <span className="kpi-title">Calidad</span>
          </div>
          <div className="kpi-value-container">
            <span className="kpi-value">0%</span>
            <span className="kpi-unit">FFTT</span>
          </div>
          <div className="kpi-trend">
            <span className="trend-icon">→</span>
            <span className="trend-value">0%</span>
          </div>
          <div className="kpi-progress">
            <div className="progress-bar" style={{ width: '0%' }}></div>
          </div>
          <div className="kpi-footer">
            <span>Sigma: 0</span>
            <span>Aceptadas: 0</span>
          </div>
        </div>

        <div className="kpi-card eficiencia">
          <div className="kpi-header">
            <span className="kpi-icon">⚡</span>
            <span className="kpi-title">Eficiencia</span>
          </div>
          <div className="kpi-value-container">
            <span className="kpi-value">0%</span>
            <span className="kpi-unit">global</span>
          </div>
          <div className="kpi-trend">
            <span className="trend-icon">→</span>
            <span className="trend-value">0%</span>
          </div>
          <div className="kpi-progress">
            <div className="progress-bar" style={{ width: '0%' }}></div>
          </div>
          <div className="kpi-footer">
            <span>OEE: 0%</span>
            <span>Máquinas: 0%</span>
          </div>
        </div>

        <div className="kpi-card lotes">
          <div className="kpi-header">
            <span className="kpi-icon">📦</span>
            <span className="kpi-title">Lotes</span>
          </div>
          <div className="kpi-value-container">
            <span className="kpi-value">0</span>
            <span className="kpi-unit">activos</span>
          </div>
          <div className="kpi-trend">
            <span className="trend-icon">→</span>
            <span className="trend-value">0%</span>
          </div>
          <div className="kpi-progress">
            <div className="progress-bar" style={{ width: '0%' }}></div>
          </div>
          <div className="kpi-footer">
            <span>Completados: 0</span>
            <span>Críticos: 0</span>
          </div>
        </div>

        <div className="kpi-card disenos">
          <div className="kpi-header">
            <span className="kpi-icon">🎨</span>
            <span className="kpi-title">Diseños</span>
          </div>
          <div className="kpi-value-container">
            <span className="kpi-value">0</span>
            <span className="kpi-unit">activos</span>
          </div>
          <div className="kpi-trend">
            <span className="trend-icon">→</span>
            <span className="trend-value">0%</span>
          </div>
          <div className="kpi-progress">
            <div className="progress-bar" style={{ width: '0%' }}></div>
          </div>
          <div className="kpi-footer">
            <span>Tiempo: 0min</span>
            <span>Completados: 0</span>
          </div>
        </div>

        <div className="kpi-card maquinas">
          <div className="kpi-header">
            <span className="kpi-icon">⚙️</span>
            <span className="kpi-title">Máquinas</span>
          </div>
          <div className="kpi-value-container">
            <span className="kpi-value">0</span>
            <span className="kpi-unit">operativas</span>
          </div>
          <div className="kpi-trend">
            <span className="trend-icon">→</span>
            <span className="trend-value">0/0</span>
          </div>
          <div className="kpi-progress">
            <div className="progress-bar" style={{ width: '0%' }}></div>
          </div>
          <div className="kpi-footer">
            <span>Eficiencia: 0%</span>
            <span>Producción: 0/h</span>
          </div>
        </div>
      </div>

      {/* ===== GRÁFICO DE PRODUCCIÓN (TODOS EN CERO) ===== */}
      <div className="chart-container">
        <div className="chart-header">
          <h3 className="chart-title">
            <span className="title-icon">📈</span>
            Producción por Hora
          </h3>
          <div className="chart-legend">
            <span className="legend-item">
              <span className="legend-color production"></span>
              Producción
            </span>
            <span className="legend-item">
              <span className="legend-color target"></span>
              Meta
            </span>
          </div>
        </div>
        <div className="chart-bars">
          {produccionHora.map((item, idx) => (
            <div key={idx} className="bar-wrapper">
              <div className="bar-group">
                <div 
                  className="bar-production" 
                  style={{ height: '0px' }}
                  title="0 unidades"
                >
                  <span className="bar-value">0</span>
                </div>
                <div 
                  className="bar-target" 
                  style={{ height: '0px' }}
                  title="Meta: 0"
                ></div>
              </div>
              <span className="bar-label">{item.hora}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== MÉTRICAS SECUNDARIAS ===== */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon">📊</span>
            <h4>Producción Hoy</h4>
          </div>
          <div className="metric-main">
            <span className="metric-number">0</span>
            <span className="metric-unit">unidades</span>
          </div>
          <div className="metric-details">
            <span>Semana: 0</span>
            <span>Mes: 0</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon">✅</span>
            <h4>Aceptadas</h4>
          </div>
          <div className="metric-main">
            <span className="metric-number">0</span>
            <span className="metric-unit">unidades</span>
          </div>
          <div className="metric-details">
            <span>Rechazadas: 0</span>
            <span>Tasa: 0%</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon">⏱️</span>
            <h4>Tiempo Promedio</h4>
          </div>
          <div className="metric-main">
            <span className="metric-number">0</span>
            <span className="metric-unit">minutos</span>
          </div>
          <div className="metric-details">
            <span>Lotes: 0</span>
            <span>Diseños: 0</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon">👥</span>
            <h4>Personal</h4>
          </div>
          <div className="metric-main">
            <span className="metric-number">0</span>
            <span className="metric-unit">activos</span>
          </div>
          <div className="metric-details">
            <span>Total: 0</span>
            <span>Ausentes: 0</span>
          </div>
        </div>
      </div>

      {/* ===== TABLAS DE ACTIVIDAD (VACÍAS) ===== */}
      <div className="tables-grid">
        <div className="table-card">
          <div className="table-header">
            <h4>
              <span className="header-icon">📦</span>
              Lotes Recientes
            </h4>
            <button className="view-all">Ver todos →</button>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Lote</th>
                  <th>Producto</th>
                  <th>Estado</th>
                  <th>Progreso</th>
                </tr>
              </thead>
              <tbody>
                {lotesRecientes.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="empty-table">
                      <span className="empty-icon">📭</span>
                      <p>No hay lotes recientes</p>
                    </td>
                  </tr>
                ) : (
                  lotesRecientes.map(lote => (
                    <tr key={lote.id}>
                      <td className="lote-id">{lote.id}</td>
                      <td>{lote.producto}</td>
                      <td>
                        <span className={`status-badge ${lote.estado}`}>
                          {lote.estado === 'completado' ? '✅' : 
                           lote.estado === 'en_proceso' ? '⚡' : '⏳'} {lote.estado}
                        </span>
                      </td>
                      <td>
                        <div className="progress-mini">
                          <div className="progress-mini-bar">
                            <div className="progress-mini-fill" style={{ width: `${lote.progreso}%` }}></div>
                          </div>
                          <span className="progress-mini-text">{lote.progreso}%</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="table-card">
          <div className="table-header">
            <h4>
              <span className="header-icon">🎨</span>
              Diseños Recientes
            </h4>
            <button className="view-all">Ver todos →</button>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Diseñador</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {disenosRecientes.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="empty-table">
                      <span className="empty-icon">🎨</span>
                      <p>No hay diseños recientes</p>
                    </td>
                  </tr>
                ) : (
                  disenosRecientes.map(diseno => (
                    <tr key={diseno.id}>
                      <td className="diseno-id">{diseno.id}</td>
                      <td>{diseno.nombre}</td>
                      <td>{diseno.disenador}</td>
                      <td>
                        <span className={`status-badge ${diseno.estado}`}>
                          {diseno.estado === 'completado' ? '✅' : 
                           diseno.estado === 'en_proceso' ? '⚡' : '⏳'} {diseno.estado}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ===== MÁQUINAS EN TIEMPO REAL (VACÍAS) ===== */}
      <div className="machines-container">
        <div className="machines-header">
          <h4>
            <span className="header-icon">⚙️</span>
            Máquinas en Tiempo Real
          </h4>
          <div className="machines-stats">
            <span className="stat online">🟢 0 operativas</span>
            <span className="stat warning">🟡 0 mantenimiento</span>
            <span className="stat danger">🔴 0 reparación</span>
          </div>
        </div>
        <div className="machines-grid">
          {maquinas.length === 0 ? (
            <div className="empty-machines">
              <span className="empty-icon">⚙️</span>
              <p>No hay máquinas configuradas</p>
            </div>
          ) : (
            maquinas.slice(0, 6).map(maquina => (
              <div key={maquina.id} className={`machine-card ${maquina.estado}`}>
                <div className="machine-header">
                  <span className="machine-id">{maquina.id}</span>
                  <span className={`machine-status ${maquina.estado}`}></span>
                </div>
                <span className="machine-name">{maquina.nombre}</span>
                <div className="machine-metrics">
                  <span>⚡ {maquina.eficiencia}%</span>
                  <span>📦 {maquina.produccion}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ===== BOTÓN VOLVER ARRIBA ===== */}
      <button 
        className={`scroll-top ${showScrollTop ? 'visible' : ''}`} 
        onClick={scrollToTop}
        title="Volver arriba"
      >
        ↑
      </button>

      {/* ===== ÚLTIMO MOVIMIENTO ===== */}
      {ultimoMovimiento && (
        <div className="last-movement">
          <span className="movement-icon">🔄</span>
          <span className="movement-text">
            {ultimoMovimiento.loteId} → {ultimoMovimiento.area}
          </span>
          <span className="movement-time">ahora</span>
        </div>
      )}
    </div>
  );
};

export default Dashboard;