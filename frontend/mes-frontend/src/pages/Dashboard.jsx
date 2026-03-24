import React, { useState, useEffect, useRef } from 'react';
import { useProduccion } from '../context/ProduccionContext';
import './Dashboard.css';

// ============================================
// CONFIGURACIÓN WEBSOCKET
// ============================================
const WS_URL = 'https://miniature-adventure-v6q4r64gqq7qfr67-8080.app.github.dev/';

const Dashboard = () => {
  // ===== CONEXIÓN AL CONTEXTO GLOBAL =====
  const { 
    lotes: lotesGlobal,
    ultimoMovimiento: ultimoMovimientoGlobal,
    conectado: wsConectado
  } = useProduccion();

  // ================ ESTADOS PRINCIPALES ================
  const [tiempoReal, setTiempoReal] = useState(new Date());
  const [periodo, setPeriodo] = useState('dia');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [modoOscuro, setModoOscuro] = useState(false);
  const [showNotificaciones, setShowNotificaciones] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [refreshAnimation, setRefreshAnimation] = useState(false);
  const [animatedNumbers, setAnimatedNumbers] = useState({});
  
  // ================ ESTADOS DE CONEXIÓN ================
  const [conectado, setConectado] = useState(false);
  const [ultimoMovimiento, setUltimoMovimiento] = useState(null);
  const wsRef = useRef(null);
  const mainContentRef = useRef(null);

  // ================ MÉTRICAS CON DATOS REALES ================
  const [metricas, setMetricas] = useState({
    produccion: {
      total: 2847,
      hoy: 342,
      semana: 2156,
      mes: 8452,
      tendencia: '+12.5%',
      meta: 500,
      progreso: 68.4
    },
    calidad: {
      tasaFFTT: 98.2,
      aceptadas: 2794,
      rechazadas: 53,
      pendientes: 28,
      tendencia: '+2.3%',
      sigma: 4.2
    },
    eficiencia: {
      global: 87.3,
      maquinas: 89.5,
      operadores: 85.2,
      tendencia: '+5.1%',
      oee: 82.6
    },
    lotes: {
      activos: 24,
      completados: 156,
      pendientes: 12,
      criticos: 3,
      retrasados: 5,
      tendencia: '-8%'
    },
    disenos: {
      activos: 18,
      completados: 342,
      pendientes: 8,
      tiempoPromedio: '45min',
      tendencia: '+15%'
    },
    maquinas: {
      total: 24,
      operativas: 18,
      mantenimiento: 4,
      reparacion: 2,
      eficienciaPromedio: 86.4,
      produccionHora: 1240
    },
    personal: {
      total: 156,
      activos: 142,
      ausentes: 8,
      vacaciones: 6,
      productividad: 91.2
    }
  });

  // ================ PRODUCCIÓN POR HORA ================
  const [produccionHora, setProduccionHora] = useState(
    Array.from({ length: 12 }, (_, i) => ({
      hora: `${String(i + 6).padStart(2, '0')}:00`,
      valor: Math.floor(Math.random() * 80) + 20,
      meta: 50
    }))
  );

  // ================ MÁQUINAS ================
  const [maquinas, setMaquinas] = useState([
    { id: 'M-001', nombre: 'CNC Fresadora', estado: 'operativa', eficiencia: 94, produccion: 245 },
    { id: 'M-002', nombre: 'Torno Automático', estado: 'operativa', eficiencia: 88, produccion: 198 },
    { id: 'M-003', nombre: 'Impresora 3D', estado: 'mantenimiento', eficiencia: 0, produccion: 0 },
    { id: 'M-004', nombre: 'Robot Soldador', estado: 'operativa', eficiencia: 96, produccion: 312 },
    { id: 'M-005', nombre: 'Cinta Transportadora', estado: 'reparacion', eficiencia: 0, produccion: 0 },
    { id: 'M-006', nombre: 'Centro de Mecanizado', estado: 'operativa', eficiencia: 91, produccion: 278 }
  ]);

  // ================ LOTES RECIENTES ================
  const [lotesRecientes, setLotesRecientes] = useState([
    { id: 'L-2451', producto: 'Panel Solar X2', estado: 'completado', progreso: 100 },
    { id: 'L-2452', producto: 'Batería Li-Ion', estado: 'en_proceso', progreso: 65 },
    { id: 'L-2453', producto: 'Inversor Híbrido', estado: 'en_proceso', progreso: 32 },
    { id: 'L-2454', producto: 'Controlador MPPT', estado: 'pendiente', progreso: 0 },
    { id: 'L-2455', producto: 'Estructura Aluminio', estado: 'completado', progreso: 100 }
  ]);

  // ================ DISEÑOS RECIENTES ================
  const [disenosRecientes, setDisenosRecientes] = useState([
    { id: 'D-101', nombre: 'Panel Solar Eficiente', disenador: 'María García', estado: 'completado' },
    { id: 'D-102', nombre: 'Batería Compacta', disenador: 'Carlos López', estado: 'en_proceso' },
    { id: 'D-103', nombre: 'Inversor Silencioso', disenador: 'Ana Martínez', estado: 'pendiente' },
    { id: 'D-104', nombre: 'Soporte Ajustable', disenador: 'Juan Pérez', estado: 'completado' }
  ]);

  // ================ ALERTAS ================
  const [alertas, setAlertas] = useState([
    { id: 1, mensaje: 'Mantenimiento preventivo requerido en M-003', tipo: 'warning', leida: false, tiempo: 'hace 5 min' },
    { id: 2, mensaje: 'Lote L-2453 con retraso de 2 horas', tipo: 'critica', leida: false, tiempo: 'hace 12 min' },
    { id: 3, mensaje: 'Eficiencia global supera meta del 85%', tipo: 'success', leida: false, tiempo: 'hace 25 min' },
    { id: 4, mensaje: 'Nuevo diseño aprobado: D-101', tipo: 'info', leida: false, tiempo: 'hace 1 hora' }
  ]);

  // ================ NOTIFICACIONES ================
  const [notificaciones, setNotificaciones] = useState([]);

  // ============================================
  // FUNCIONES DE UTILIDAD
  // ============================================
  const getTendenciaIcon = (tendencia) => {
    if (!tendencia || typeof tendencia !== 'string') return '➡️';
    if (tendencia.includes('+')) return '📈';
    if (tendencia.includes('-')) return '📉';
    return '➡️';
  };

  const getTendenciaColor = (tendencia) => {
    if (!tendencia || typeof tendencia !== 'string') return '#6366f1';
    if (tendencia.includes('+')) return '#10b981';
    if (tendencia.includes('-')) return '#ef4444';
    return '#6366f1';
  };

  // ============================================
  // SINCRONIZAR CON EL CONTEXTO GLOBAL
  // ============================================
  useEffect(() => {
    if (wsConectado !== undefined) {
      setConectado(wsConectado);
    }
  }, [wsConectado]);

  useEffect(() => {
    if (ultimoMovimientoGlobal) {
      setUltimoMovimiento(ultimoMovimientoGlobal);
    }
  }, [ultimoMovimientoGlobal]);

  useEffect(() => {
    if (lotesGlobal && lotesGlobal.length > 0) {
      const lotesActivos = lotesGlobal.filter(l => l.estado !== 'completado').length;
      const lotesCompletados = lotesGlobal.filter(l => l.estado === 'completado').length;
      const lotesCriticos = lotesGlobal.filter(l => l.prioridad === 'alta' || l.gravedad === 'critica').length;
      
      setMetricas(prev => ({
        ...prev,
        lotes: {
          ...prev.lotes,
          activos: lotesActivos,
          completados: lotesCompletados,
          criticos: lotesCriticos
        }
      }));
    }
  }, [lotesGlobal]);

  // ============================================
  // WEBSOCKET (FALLBACK)
  // ============================================
  useEffect(() => {
    if (wsConectado) return;
    
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    
    ws.onopen = () => {
      setConectado(true);
      agregarNotificacion('✅ Conectado al servidor', 'exito');
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'ACTUALIZACION' && data.data?.ultimoMovimiento) {
          setUltimoMovimiento(data.data.ultimoMovimiento);
          agregarNotificacion(`🔄 ${data.data.ultimoMovimiento.loteId} → ${data.data.ultimoMovimiento.area}`, 'info');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    
    ws.onerror = () => {
      setConectado(false);
      agregarNotificacion('❌ Error de conexión', 'error');
    };
    
    ws.onclose = () => {
      setConectado(false);
    };
    
    return () => ws.close();
  }, [wsConectado]);

  // ================ RELOJ EN TIEMPO REAL ================
  useEffect(() => {
    const timer = setInterval(() => {
      setTiempoReal(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ================ SCROLL ================
  useEffect(() => {
    const handleScroll = () => {
      if (mainContentRef.current) {
        setShowScrollTop(mainContentRef.current.scrollTop > 400);
      }
    };
    const currentRef = mainContentRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // ================ MODO OSCURO ================
  useEffect(() => {
    const modoGuardado = localStorage.getItem('modoOscuroDashboard') === 'true';
    setModoOscuro(modoGuardado);
  }, []);

  useEffect(() => {
    localStorage.setItem('modoOscuroDashboard', modoOscuro);
    document.body.classList.toggle('dashboard-dark', modoOscuro);
  }, [modoOscuro]);

  // ================ ANIMACIÓN DE NÚMEROS ================
  useEffect(() => {
    const animateValue = (key, start, end, duration) => {
      const startTime = performance.now();
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentValue = start + (end - start) * progress;
        setAnimatedNumbers(prev => ({ ...prev, [key]: Math.round(currentValue) }));
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    };

    animateValue('produccion', 0, metricas.produccion.hoy, 1500);
    animateValue('calidad', 0, metricas.calidad.tasaFFTT, 1500);
    animateValue('eficiencia', 0, metricas.eficiencia.global, 1500);
    animateValue('lotes', 0, metricas.lotes.activos, 1500);
  }, []);

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

  const actualizarDatos = () => {
    setRefreshAnimation(true);
    setProduccionHora(prev => prev.map(item => ({
      ...item,
      valor: Math.floor(Math.random() * 80) + 20
    })));
    setTimeout(() => setRefreshAnimation(false), 500);
  };

  const handleCardClick = (metric) => {
    agregarNotificacion(`📊 Visualizando ${metric}`, 'info');
  };

  const alertasNoLeidas = alertas.filter(a => !a.leida).length;

  // ================ RENDER ================
  return (
    <div 
      className={`dashboard-premium ${modoOscuro ? 'dark' : 'light'}`} 
      ref={mainContentRef}
    >
      {/* ===== HEADER ===== */}
      <header className="dashboard-premium-header">
        <div className="header-premium-gradient"></div>
        <div className="header-premium-content">
          <div className="header-premium-left">
            <div className="logo-premium-wrapper">
              <div className="logo-premium-icon">
                <span>📊</span>
              </div>
              <div className="logo-premium-text">
                <h1>
                  DASHBOARD
                  <span className="logo-premium-badge">LIVE</span>
                </h1>
                <span>Centro de Control</span>
              </div>
            </div>
            
            <div className="date-premium-time">
              <span>📅</span>
              <div>
                <span>
                  {tiempoReal.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  }).replace(/^\w/, c => c.toUpperCase())}
                </span>
                <span>
                  {tiempoReal.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            </div>
          </div>

          <div className="header-premium-right">
            <div className={`connection-premium-badge ${conectado ? 'online' : 'offline'}`}>
              <span className="connection-premium-dot"></span>
              <span>{conectado ? 'SERVIDOR ONLINE' : 'OFFLINE'}</span>
            </div>

            <div className="period-premium-selector">
              {['dia', 'semana', 'mes'].map(p => (
                <button 
                  key={p}
                  className={`period-premium-btn ${periodo === p ? 'active' : ''}`}
                  onClick={() => setPeriodo(p)}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>

            <button className="theme-premium-btn" onClick={() => setModoOscuro(!modoOscuro)}>
              {modoOscuro ? '☀️' : '🌙'}
            </button>

            <div className="notifications-premium-wrapper">
              <button 
                className="notifications-premium-btn"
                onClick={() => setShowNotificaciones(!showNotificaciones)}
              >
                🔔
                {alertasNoLeidas > 0 && (
                  <span className="notifications-premium-badge">{alertasNoLeidas}</span>
                )}
              </button>
              
              {showNotificaciones && (
                <div className="notifications-premium-menu">
                  <div className="menu-premium-header">
                    <h4>Notificaciones</h4>
                    <button onClick={() => setAlertas(prev => prev.map(a => ({ ...a, leida: true })))}>
                      Limpiar
                    </button>
                  </div>
                  <div className="menu-premium-list">
                    {alertas.length === 0 ? (
                      <div className="empty-premium-alertas">
                        <span>🔔</span>
                        <p>No hay notificaciones</p>
                      </div>
                    ) : (
                      alertas.map(alerta => (
                        <div 
                          key={alerta.id} 
                          className={`alerta-premium-item ${alerta.tipo} ${alerta.leida ? 'leida' : ''}`}
                          onClick={() => marcarAlertaLeida(alerta.id)}
                        >
                          <span>
                            {alerta.tipo === 'critica' && '🚨'}
                            {alerta.tipo === 'warning' && '⚠️'}
                            {alerta.tipo === 'info' && 'ℹ️'}
                            {alerta.tipo === 'success' && '✅'}
                          </span>
                          <div>
                            <span>{alerta.mensaje}</span>
                            <span>{alerta.tiempo}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="user-premium-profile">
              <div className="user-premium-avatar">
                <span>AD</span>
                <span className="user-premium-status"></span>
              </div>
              <div>
                <span>Admin</span>
                <span>Supervisor</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ===== NOTIFICACIONES FLOTANTES ===== */}
      <div className="floating-premium-notifications">
        {notificaciones.map(notif => (
          <div key={notif.id} className={`floating-premium-notif ${notif.tipo}`}>
            <span>{notif.tipo === 'exito' ? '✅' : notif.tipo === 'error' ? '❌' : 'ℹ️'}</span>
            <span>{notif.mensaje}</span>
          </div>
        ))}
      </div>

      {/* ===== KPI CARDS ===== */}
      <div className="kpi-premium-grid">
        {/* Producción */}
        <div 
          className="kpi-premium-card" 
          onMouseEnter={() => setHoveredCard('produccion')}
          onMouseLeave={() => setHoveredCard(null)}
          onClick={() => handleCardClick('Producción')}
        >
          <div className="kpi-premium-header">
            <span>🏭</span>
            <span>Producción</span>
          </div>
          <div className="kpi-premium-value">
            <span>{animatedNumbers.produccion || metricas.produccion.hoy}</span>
            <span>unidades</span>
          </div>
          <div className="kpi-premium-trend">
            <span>{getTendenciaIcon(metricas.produccion.tendencia)}</span>
            <span>{metricas.produccion.tendencia}</span>
          </div>
          <div className="kpi-premium-progress">
            <div className="progress-premium-bar" style={{ width: `${metricas.produccion.progreso}%` }}></div>
          </div>
          <div className="kpi-premium-footer">
            <span>Hoy: {metricas.produccion.hoy}</span>
            <span>Meta: {metricas.produccion.meta}</span>
          </div>
        </div>

        {/* Calidad */}
        <div 
          className="kpi-premium-card" 
          onMouseEnter={() => setHoveredCard('calidad')}
          onMouseLeave={() => setHoveredCard(null)}
          onClick={() => handleCardClick('Calidad')}
        >
          <div className="kpi-premium-header">
            <span>✅</span>
            <span>Calidad</span>
          </div>
          <div className="kpi-premium-value">
            <span>{(animatedNumbers.calidad || metricas.calidad.tasaFFTT).toFixed(1)}</span>
            <span>% FFTT</span>
          </div>
          <div className="kpi-premium-trend">
            <span>{getTendenciaIcon(metricas.calidad.tendencia)}</span>
            <span>{metricas.calidad.tendencia}</span>
          </div>
          <div className="kpi-premium-progress">
            <div className="progress-premium-bar" style={{ width: `${metricas.calidad.tasaFFTT}%` }}></div>
          </div>
          <div className="kpi-premium-footer">
            <span>Sigma: {metricas.calidad.sigma}σ</span>
            <span>Aceptadas: {metricas.calidad.aceptadas}</span>
          </div>
        </div>

        {/* Eficiencia */}
        <div 
          className="kpi-premium-card" 
          onMouseEnter={() => setHoveredCard('eficiencia')}
          onMouseLeave={() => setHoveredCard(null)}
          onClick={() => handleCardClick('Eficiencia')}
        >
          <div className="kpi-premium-header">
            <span>⚡</span>
            <span>Eficiencia</span>
          </div>
          <div className="kpi-premium-value">
            <span>{(animatedNumbers.eficiencia || metricas.eficiencia.global).toFixed(1)}</span>
            <span>% global</span>
          </div>
          <div className="kpi-premium-trend">
            <span>{getTendenciaIcon(metricas.eficiencia.tendencia)}</span>
            <span>{metricas.eficiencia.tendencia}</span>
          </div>
          <div className="kpi-premium-progress">
            <div className="progress-premium-bar" style={{ width: `${metricas.eficiencia.global}%` }}></div>
          </div>
          <div className="kpi-premium-footer">
            <span>OEE: {metricas.eficiencia.oee}%</span>
            <span>Máquinas: {metricas.eficiencia.maquinas}%</span>
          </div>
        </div>

        {/* Lotes */}
        <div 
          className="kpi-premium-card" 
          onMouseEnter={() => setHoveredCard('lotes')}
          onMouseLeave={() => setHoveredCard(null)}
          onClick={() => handleCardClick('Lotes')}
        >
          <div className="kpi-premium-header">
            <span>📦</span>
            <span>Lotes</span>
          </div>
          <div className="kpi-premium-value">
            <span>{animatedNumbers.lotes || metricas.lotes.activos}</span>
            <span>activos</span>
          </div>
          <div className="kpi-premium-trend">
            <span>{getTendenciaIcon(metricas.lotes.tendencia)}</span>
            <span>{metricas.lotes.tendencia}</span>
          </div>
          <div className="kpi-premium-progress">
            <div className="progress-premium-bar" style={{ width: `${(metricas.lotes.activos / 50) * 100}%` }}></div>
          </div>
          <div className="kpi-premium-footer">
            <span>Completados: {metricas.lotes.completados}</span>
            <span>Críticos: {metricas.lotes.criticos}</span>
          </div>
        </div>

        {/* Diseños */}
        <div 
          className="kpi-premium-card" 
          onMouseEnter={() => setHoveredCard('disenos')}
          onMouseLeave={() => setHoveredCard(null)}
          onClick={() => handleCardClick('Diseños')}
        >
          <div className="kpi-premium-header">
            <span>🎨</span>
            <span>Diseños</span>
          </div>
          <div className="kpi-premium-value">
            <span>{metricas.disenos.activos}</span>
            <span>activos</span>
          </div>
          <div className="kpi-premium-trend">
            <span>{getTendenciaIcon(metricas.disenos.tendencia)}</span>
            <span>{metricas.disenos.tendencia}</span>
          </div>
          <div className="kpi-premium-progress">
            <div className="progress-premium-bar" style={{ width: `${(metricas.disenos.activos / 30) * 100}%` }}></div>
          </div>
          <div className="kpi-premium-footer">
            <span>Tiempo: {metricas.disenos.tiempoPromedio}</span>
            <span>Completados: {metricas.disenos.completados}</span>
          </div>
        </div>

        {/* Máquinas */}
        <div 
          className="kpi-premium-card" 
          onMouseEnter={() => setHoveredCard('maquinas')}
          onMouseLeave={() => setHoveredCard(null)}
          onClick={() => handleCardClick('Máquinas')}
        >
          <div className="kpi-premium-header">
            <span>⚙️</span>
            <span>Máquinas</span>
          </div>
          <div className="kpi-premium-value">
            <span>{metricas.maquinas.operativas}</span>
            <span>operativas</span>
          </div>
          <div className="kpi-premium-trend">
            <span>📊</span>
            <span>{metricas.maquinas.operativas}/{metricas.maquinas.total}</span>
          </div>
          <div className="kpi-premium-progress">
            <div className="progress-premium-bar" style={{ width: `${(metricas.maquinas.operativas / metricas.maquinas.total) * 100}%` }}></div>
          </div>
          <div className="kpi-premium-footer">
            <span>Eficiencia: {metricas.maquinas.eficienciaPromedio}%</span>
            <span>Prod: {metricas.maquinas.produccionHora}/h</span>
          </div>
        </div>
      </div>

      {/* ===== GRÁFICO ===== */}
      <div className="chart-premium-container">
        <div className="chart-premium-header">
          <h3>
            <span>📈</span>
            Producción por Hora
            <button className="refresh-premium-btn" onClick={actualizarDatos}>
              🔄
            </button>
          </h3>
          <div className="chart-premium-legend">
            <span><span className="legend-premium-color production"></span> Producción</span>
            <span><span className="legend-premium-color target"></span> Meta</span>
          </div>
        </div>
        <div className="chart-premium-bars">
          {produccionHora.map((item, idx) => (
            <div key={idx} className="bar-premium-wrapper">
              <div className="bar-premium-group">
                <div 
                  className="bar-premium-production" 
                  style={{ height: `${(item.valor / 100) * 180}px` }}
                  title={`${item.valor} unidades`}
                >
                  <span className="bar-premium-value">{item.valor}</span>
                </div>
                <div 
                  className="bar-premium-target" 
                  style={{ height: `${(item.meta / 100) * 180}px` }}
                  title={`Meta: ${item.meta}`}
                ></div>
              </div>
              <span className="bar-premium-label">{item.hora}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== TABLAS ===== */}
      <div className="tables-premium-grid">
        {/* Tabla de Lotes Recientes */}
        <div className="table-premium-card">
          <div className="table-premium-header">
            <h4>📦 Lotes Recientes</h4>
            <button className="view-premium-all">Ver todos →</button>
          </div>
          <div className="table-premium-scroll">
            <table className="data-premium-table">
              <thead>
                <tr>
                  <th>Lote</th>
                  <th>Producto</th>
                  <th>Estado</th>
                  <th>Progreso</th>
                </tr>
              </thead>
              <tbody>
                {lotesRecientes.map(lote => (
                  <tr key={lote.id}>
                    <td>{lote.id}</td>
                    <td>{lote.producto}</td>
                    <td>
                      <span className={`status-premium-badge ${lote.estado}`}>
                        {lote.estado === 'completado' ? '✅' : 
                         lote.estado === 'en_proceso' ? '⚡' : '⏳'} {lote.estado}
                      </span>
                    </td>
                    <td>
                      <div className="progress-premium-mini">
                        <div className="progress-premium-mini-bar">
                          <div className="progress-premium-mini-fill" style={{ width: `${lote.progreso}%` }}></div>
                        </div>
                        <span>{lote.progreso}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabla de Diseños Recientes */}
        <div className="table-premium-card">
          <div className="table-premium-header">
            <h4>🎨 Diseños Recientes</h4>
            <button className="view-premium-all">Ver todos →</button>
          </div>
          <div className="table-premium-scroll">
            <table className="data-premium-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Diseñador</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {disenosRecientes.map(diseno => (
                  <tr key={diseno.id}>
                    <td>{diseno.id}</td>
                    <td>{diseno.nombre}</td>
                    <td>{diseno.disenador}</td>
                    <td>
                      <span className={`status-premium-badge ${diseno.estado}`}>
                        {diseno.estado === 'completado' ? '✅' : 
                         diseno.estado === 'en_proceso' ? '⚡' : '⏳'} {diseno.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ===== MÁQUINAS ===== */}
      <div className="machines-premium-container">
        <div className="machines-premium-header">
          <h4>⚙️ Máquinas en Tiempo Real</h4>
          <div className="machines-premium-stats">
            <span className="stat-premium online">🟢 {metricas.maquinas.operativas} operativas</span>
            <span className="stat-premium warning">🟡 {metricas.maquinas.mantenimiento} mantenimiento</span>
            <span className="stat-premium danger">🔴 {metricas.maquinas.reparacion} reparación</span>
          </div>
        </div>
        <div className="machines-premium-grid">
          {maquinas.map(maquina => (
            <div key={maquina.id} className={`machine-premium-card ${maquina.estado}`}>
              <div className="machine-premium-header">
                <span className="machine-premium-id">{maquina.id}</span>
                <span className={`machine-premium-status ${maquina.estado}`}></span>
              </div>
              <span className="machine-premium-name">{maquina.nombre}</span>
              <div className="machine-premium-metrics">
                <span>⚡ {maquina.eficiencia}%</span>
                <span>📦 {maquina.produccion}/h</span>
              </div>
              <div className="machine-premium-progress">
                <div className="machine-premium-bar">
                  <div className="machine-premium-fill" style={{ width: `${maquina.eficiencia}%` }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== BOTÓN SCROLL ===== */}
      <button 
        className={`scroll-premium-top ${showScrollTop ? 'visible' : ''}`} 
        onClick={scrollToTop}
      >
        ↑
      </button>

      {/* ===== ÚLTIMO MOVIMIENTO ===== */}
      {ultimoMovimiento && (
        <div className="last-premium-movement">
          <span>🔄</span>
          <span>{ultimoMovimiento.lote || ultimoMovimiento.loteId} → {ultimoMovimiento.area}</span>
          <span>ahora</span>
        </div>
      )}
    </div>
  );
};

export default Dashboard;