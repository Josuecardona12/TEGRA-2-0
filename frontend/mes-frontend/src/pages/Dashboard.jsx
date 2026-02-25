import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [periodo, setPeriodo] = useState('dia');
  const [vista, setVista] = useState('principal');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [animacionGlobal, setAnimacionGlobal] = useState(false);
  const [temaOscuro, setTemaOscuro] = useState(true);
  
  // Notificaciones en tiempo real
  const [notificaciones, setNotificaciones] = useState([
    { id: 1, mensaje: 'LOTE-001 completado', tipo: 'exito', leida: false, timestamp: new Date() },
    { id: 2, mensaje: 'Máquina 03 requiere mantenimiento', tipo: 'advertencia', leida: false, timestamp: new Date() },
    { id: 3, mensaje: 'Nueva orden de producción', tipo: 'info', leida: true, timestamp: new Date() }
  ]);

  // Datos del dashboard con actualización en tiempo real
  const [stats, setStats] = useState({
    ordenesActivas: 24,
    ordenesCompletadas: 156,
    maquinasActivas: 8,
    maquinasTotales: 12,
    eficienciaGlobal: 87,
    produccionHoy: 1245,
    atrasos: 3,
    alertas: 5,
    productividad: 94,
    tiempoPromedio: 45,
    satisfaccion: 92
  });

  const [produccionPorHora, setProduccionPorHora] = useState([
    { hora: '06:00', valor: 45 },
    { hora: '07:00', valor: 78 },
    { hora: '08:00', valor: 92 },
    { hora: '09:00', valor: 110 },
    { hora: '10:00', valor: 135 },
    { hora: '11:00', valor: 142 },
    { hora: '12:00', valor: 128 },
    { hora: '13:00', valor: 115 },
    { hora: '14:00', valor: 138 },
    { hora: '15:00', valor: 145 },
    { hora: '16:00', valor: 132 },
    { hora: '17:00', valor: 98 }
  ]);

  const [ordenesRecientes, setOrdenesRecientes] = useState([
    { id: 'ORD-001', producto: 'Camiseta MLB', cantidad: 150, estado: 'en_proceso', fecha: '10:30 AM', prioridad: 'alta' },
    { id: 'ORD-002', producto: 'Gorra NBA', cantidad: 75, estado: 'completada', fecha: '09:15 AM', prioridad: 'media' },
    { id: 'ORD-003', producto: 'Uniforme NFL', cantidad: 200, estado: 'pendiente', fecha: '11:45 AM', prioridad: 'alta' },
    { id: 'ORD-004', producto: 'Sudadera NHL', cantidad: 100, estado: 'en_proceso', fecha: '08:20 AM', prioridad: 'baja' },
    { id: 'ORD-005', producto: 'Camiseta FIFA', cantidad: 300, estado: 'revision', fecha: '12:10 PM', prioridad: 'alta' },
    { id: 'ORD-006', producto: 'Gorra MLB', cantidad: 50, estado: 'pendiente', fecha: '01:30 PM', prioridad: 'media' }
  ]);

  const [maquinas, setMaquinas] = useState([
    { id: 1, nombre: 'Plotter HP', estado: 'operando', eficiencia: 92, orden: 'ORD-001', temperatura: 42, velocidad: 85, tiempoRestante: '2h 15m' },
    { id: 2, nombre: 'Sublimadora Epson', estado: 'operando', eficiencia: 88, orden: 'ORD-003', temperatura: 38, velocidad: 92, tiempoRestante: '1h 30m' },
    { id: 3, nombre: 'Cortadora Zund', estado: 'pausada', eficiencia: 76, orden: 'ORD-002', temperatura: 35, velocidad: 0, tiempoRestante: '0h 45m' },
    { id: 4, nombre: 'Impresora Durst', estado: 'mantenimiento', eficiencia: 0, orden: '-', temperatura: 0, velocidad: 0, tiempoRestante: '3h 00m' },
    { id: 5, nombre: 'Plancha Monti', estado: 'operando', eficiencia: 95, orden: 'ORD-004', temperatura: 180, velocidad: 75, tiempoRestante: '4h 20m' },
    { id: 6, nombre: 'Plotter Mimaki', estado: 'operando', eficiencia: 84, orden: 'ORD-005', temperatura: 41, velocidad: 78, tiempoRestante: '1h 10m' },
    { id: 7, nombre: 'Sublimadora Sawgrass', estado: 'inactiva', eficiencia: 0, orden: '-', temperatura: 22, velocidad: 0, tiempoRestante: '0h 00m' },
    { id: 8, nombre: 'Cortadora Kongsberg', estado: 'operando', eficiencia: 91, orden: 'ORD-006', temperatura: 37, velocidad: 82, tiempoRestante: '2h 45m' }
  ]);

  const [alertas, setAlertas] = useState([
    { id: 1, tipo: 'critica', mensaje: 'Temperatura alta en Máquina 05', tiempo: 'hace 2m' },
    { id: 2, tipo: 'advertencia', mensaje: 'Mantenimiento preventivo requerido', tiempo: 'hace 15m' },
    { id: 3, tipo: 'info', mensaje: 'Orden ORD-003 completada', tiempo: 'hace 25m' },
    { id: 4, tipo: 'critica', mensaje: 'Retraso en producción', tiempo: 'hace 30m' }
  ]);

  const [proyectos, setProyectos] = useState([
    { nombre: 'Proyecto MLB', progreso: 75, fechaEntrega: '2026-03-15', responsable: 'Carlos' },
    { nombre: 'Proyecto NBA', progreso: 45, fechaEntrega: '2026-03-20', responsable: 'María' },
    { nombre: 'Proyecto NFL', progreso: 90, fechaEntrega: '2026-03-10', responsable: 'José' },
    { nombre: 'Proyecto NHL', progreso: 30, fechaEntrega: '2026-03-25', responsable: 'Ana' }
  ]);

  // Actualización en tiempo real
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simular cambios en tiempo real cada 6 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimacionGlobal(true);
      setTimeout(() => setAnimacionGlobal(false), 500);

      setStats(prev => ({
        ...prev,
        ordenesActivas: Math.max(0, prev.ordenesActivas + Math.floor(Math.random() * 3) - 1),
        ordenesCompletadas: prev.ordenesCompletadas + Math.floor(Math.random() * 5),
        produccionHoy: prev.produccionHoy + Math.floor(Math.random() * 20),
        eficienciaGlobal: Number((Math.min(100, Math.max(0, prev.eficienciaGlobal + (Math.random() * 2 - 1)))).toFixed(1)),
        atrasos: Math.max(0, prev.atrasos + Math.floor(Math.random() * 2) - 1),
        alertas: Math.max(0, prev.alertas + Math.floor(Math.random() * 3) - 1),
        productividad: Number((Math.min(100, Math.max(0, prev.productividad + (Math.random() * 3 - 1.5)))).toFixed(1)),
        tiempoPromedio: Math.max(30, Math.min(60, prev.tiempoPromedio + Math.floor(Math.random() * 4) - 2)),
        satisfaccion: Number((Math.min(100, Math.max(0, prev.satisfaccion + (Math.random() * 2 - 1)))).toFixed(1))
      }));

      setProduccionPorHora(prev => {
        const nuevas = [...prev];
        const ultimaHora = nuevas.length - 1;
        nuevas[ultimaHora] = {
          ...nuevas[ultimaHora],
          valor: Math.max(0, nuevas[ultimaHora].valor + Math.floor(Math.random() * 10) - 3)
        };
        return nuevas;
      });

      setMaquinas(prev => prev.map(maq => ({
        ...maq,
        eficiencia: maq.estado === 'operando' 
          ? Number((Math.min(100, Math.max(0, maq.eficiencia + (Math.random() * 4 - 2)))).toFixed(1))
          : maq.eficiencia,
        temperatura: maq.estado === 'operando'
          ? Number((maq.temperatura + (Math.random() * 2 - 1)).toFixed(1))
          : maq.temperatura
      })));

      if (Math.random() > 0.7) {
        const nuevasNotificaciones = [
          { tipo: 'exito', mensaje: 'Orden completada exitosamente' },
          { tipo: 'advertencia', mensaje: 'Máquina con bajo rendimiento' },
          { tipo: 'info', mensaje: 'Nuevo lote disponible' },
          { tipo: 'critica', mensaje: 'Fallo en sistema de refrigeración' }
        ];
        const random = nuevasNotificaciones[Math.floor(Math.random() * nuevasNotificaciones.length)];
        
        setNotificaciones(prev => [
          {
            id: Date.now(),
            mensaje: random.mensaje,
            tipo: random.tipo,
            leida: false,
            timestamp: new Date()
          },
          ...prev.slice(0, 9)
        ]);

        setAlertas(prev => [
          {
            id: Date.now(),
            tipo: random.tipo,
            mensaje: random.mensaje,
            tiempo: 'ahora'
          },
          ...prev.slice(0, 3)
        ]);
      }

    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).replace(/^\w/, c => c.toUpperCase());
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const marcarNotificacionLeida = (id) => {
    setNotificaciones(notificaciones.map(n => 
      n.id === id ? { ...n, leida: true } : n
    ));
  };

  const marcarTodasLeidas = () => {
    setNotificaciones(notificaciones.map(n => ({ ...n, leida: true })));
  };

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'completada': return '#10b981';
      case 'en_proceso': return '#3b82f6';
      case 'pendiente': return '#f59e0b';
      case 'revision': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getPrioridadColor = (prioridad) => {
    switch(prioridad) {
      case 'alta': return '#ef4444';
      case 'media': return '#f59e0b';
      case 'baja': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getAlertaColor = (tipo) => {
    switch(tipo) {
      case 'critica': return '#ef4444';
      case 'advertencia': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const notificacionesNoLeidas = notificaciones.filter(n => !n.leida).length;

  return (
    <div className={`dashboard-premium-container ${temaOscuro ? 'tema-oscuro' : ''} ${animacionGlobal ? 'global-update' : ''}`}>
      {/* Header Premium */}
      <div className="dashboard-header">
        <div className="header-left">
          <button 
            className="menu-toggle-btn"
            onClick={() => setMenuAbierto(!menuAbierto)}
          >
            ☰
          </button>
          <h1 className="dashboard-title">
            <span className="title-icon">📊</span>
            Dashboard Producción
          </h1>
          <div className="date-badge">
            <span className="date-icon">📅</span>
            {formatDate(currentTime)}
          </div>
        </div>

        <div className="header-right">
          <div className="live-indicator">
            <span className="live-pulse"></span>
            <span className="live-text">EN VIVO</span>
            <span className="live-time">{formatTime(currentTime)}</span>
          </div>

          <button 
            className="theme-toggle-btn"
            onClick={() => setTemaOscuro(!temaOscuro)}
            title={temaOscuro ? 'Modo claro' : 'Modo oscuro'}
          >
            {temaOscuro ? '☀️' : '🌙'}
          </button>

          <div className="notificaciones-dropdown">
            <button className="notificaciones-btn">
              🔔
              {notificacionesNoLeidas > 0 && (
                <span className="notificaciones-badge">{notificacionesNoLeidas}</span>
              )}
            </button>
            <div className="notificaciones-menu">
              <div className="notificaciones-header">
                <h4>Notificaciones</h4>
                {notificacionesNoLeidas > 0 && (
                  <button className="marcar-leidas" onClick={marcarTodasLeidas}>
                    Marcar todas
                  </button>
                )}
              </div>
              {notificaciones.map(notif => (
                <div 
                  key={notif.id} 
                  className={`notificacion-item ${!notif.leida ? 'no-leida' : ''}`}
                  onClick={() => marcarNotificacionLeida(notif.id)}
                >
                  <span className={`notif-icon ${notif.tipo}`}>
                    {notif.tipo === 'exito' && '✅'}
                    {notif.tipo === 'advertencia' && '⚠️'}
                    {notif.tipo === 'info' && 'ℹ️'}
                    {notif.tipo === 'critica' && '🔴'}
                  </span>
                  <span className="notif-mensaje">{notif.mensaje}</span>
                  <span className="notif-time">
                    {notif.timestamp.toLocaleTimeString().slice(0,5)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="user-profile">
            <div className="user-avatar">JC</div>
            <div className="user-info">
              <span className="user-name">Josué Cardona</span>
              <span className="user-role">Administrador</span>
            </div>
          </div>
        </div>
      </div>

      {/* Menú Lateral */}
      <div className={`side-menu ${menuAbierto ? 'abierto' : ''}`}>
        <div className="menu-header">
          <h3>TEGRA</h3>
          <span className="menu-version">v2.5.0</span>
        </div>

        <div className="menu-search">
          <input type="text" placeholder="Buscar..." />
          <span className="search-icon">🔍</span>
        </div>

        <div className="menu-items">
          <div className="menu-section">
            <h4>PRINCIPAL</h4>
            <button className={`menu-item ${vista === 'principal' ? 'active' : ''}`} onClick={() => setVista('principal')}>
              <span className="item-icon">📊</span>
              Dashboard
            </button>
            <button className="menu-item">
              <span className="item-icon">📋</span>
              Órdenes
              <span className="item-badge">{stats.ordenesActivas}</span>
            </button>
            <button className="menu-item">
              <span className="item-icon">⚙️</span>
              Máquinas
              <span className="item-badge">{stats.maquinasActivas}/{stats.maquinasTotales}</span>
            </button>
          </div>

          <div className="menu-section">
            <h4>OPERACIONES</h4>
            <button className="menu-item">
              <span className="item-icon">📅</span>
              Plan Semanal
            </button>
            <button className="menu-item">
              <span className="item-icon">🏭</span>
              Producción
            </button>
            <button className="menu-item">
              <span className="item-icon">📦</span>
              Miceláneos
            </button>
            <button className="menu-item">
              <span className="item-icon">📊</span>
              Calidad
            </button>
          </div>

          <div className="menu-section">
            <h4>REPORTES</h4>
            <button className="menu-item">
              <span className="item-icon">📈</span>
              Eficiencia
            </button>
            <button className="menu-item">
              <span className="item-icon">👥</span>
              Recursos Humanos
            </button>
            <button className="menu-item">
              <span className="item-icon">📊</span>
              Estadísticas
            </button>
            <button className="menu-item">
              <span className="item-icon">📉</span>
              Tendencias
            </button>
          </div>

          <div className="menu-section">
            <h4>CONFIGURACIÓN</h4>
            <button className="menu-item">
              <span className="item-icon">⚙️</span>
              Ajustes
            </button>
            <button className="menu-item">
              <span className="item-icon">👤</span>
              Perfil
            </button>
            <button className="menu-item">
              <span className="item-icon">🔒</span>
              Seguridad
            </button>
          </div>
        </div>

        <div className="menu-footer">
          <div className="system-status">
            <span className="status-dot"></span>
            <span>Sistema activo</span>
          </div>
          <div className="sync-status">
            <span>🔄 Tiempo real</span>
          </div>
          <div className="storage-status">
            <span>💾 78% usado</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Selector de Período y Acciones Rápidas */}
        <div className="top-bar">
          <div className="periodo-selector">
            <button 
              className={`periodo-btn ${periodo === 'dia' ? 'active' : ''}`}
              onClick={() => setPeriodo('dia')}
            >
              Día
            </button>
            <button 
              className={`periodo-btn ${periodo === 'semana' ? 'active' : ''}`}
              onClick={() => setPeriodo('semana')}
            >
              Semana
            </button>
            <button 
              className={`periodo-btn ${periodo === 'mes' ? 'active' : ''}`}
              onClick={() => setPeriodo('mes')}
            >
              Mes
            </button>
            <button 
              className={`periodo-btn ${periodo === 'trimestre' ? 'active' : ''}`}
              onClick={() => setPeriodo('trimestre')}
            >
              Trimestre
            </button>
          </div>

          <div className="acciones-rapidas">
            <button className="accion-btn" title="Exportar reporte">
              📥 Exportar
            </button>
            <button className="accion-btn" title="Imprimir">
              🖨️ Imprimir
            </button>
            <button className="accion-btn" title="Actualizar datos">
              🔄 Actualizar
            </button>
            <button className="accion-btn" title="Ayuda">
              ❓ Ayuda
            </button>
          </div>
        </div>

        {/* KPI Cards - 9 KPIs */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon">📋</div>
            <div className="kpi-content">
              <span className="kpi-value">{stats.ordenesActivas}</span>
              <span className="kpi-label">Órdenes Activas</span>
            </div>
            <div className="kpi-trend positive">+12%</div>
            <div className="kpi-update-indicator"></div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon">✅</div>
            <div className="kpi-content">
              <span className="kpi-value">{stats.ordenesCompletadas}</span>
              <span className="kpi-label">Completadas</span>
            </div>
            <div className="kpi-trend positive">+8%</div>
            <div className="kpi-update-indicator"></div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon">⚙️</div>
            <div className="kpi-content">
              <span className="kpi-value">{stats.maquinasActivas}/{stats.maquinasTotales}</span>
              <span className="kpi-label">Máquinas Activas</span>
            </div>
            <div className="kpi-trend">{Math.round((stats.maquinasActivas/stats.maquinasTotales)*100)}%</div>
            <div className="kpi-update-indicator"></div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon">📊</div>
            <div className="kpi-content">
              <span className="kpi-value">{stats.eficienciaGlobal}%</span>
              <span className="kpi-label">Eficiencia Global</span>
            </div>
            <div className="kpi-trend positive">+5%</div>
            <div className="kpi-update-indicator"></div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon">📦</div>
            <div className="kpi-content">
              <span className="kpi-value">{stats.produccionHoy}</span>
              <span className="kpi-label">Prod. Hoy</span>
            </div>
            <div className="kpi-trend">unidades</div>
            <div className="kpi-update-indicator"></div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon">⚠️</div>
            <div className="kpi-content">
              <span className="kpi-value">{stats.alertas}</span>
              <span className="kpi-label">Alertas</span>
            </div>
            <div className="kpi-trend negative">+2</div>
            <div className="kpi-update-indicator"></div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon">⏰</div>
            <div className="kpi-content">
              <span className="kpi-value">{stats.atrasos}</span>
              <span className="kpi-label">Atrasos</span>
            </div>
            <div className="kpi-trend negative">-1</div>
            <div className="kpi-update-indicator"></div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon">📈</div>
            <div className="kpi-content">
              <span className="kpi-value">{stats.productividad}%</span>
              <span className="kpi-label">Productividad</span>
            </div>
            <div className="kpi-trend positive">+3%</div>
            <div className="kpi-update-indicator"></div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon">⭐</div>
            <div className="kpi-content">
              <span className="kpi-value">{stats.satisfaccion}%</span>
              <span className="kpi-label">Satisfacción</span>
            </div>
            <div className="kpi-trend positive">+2%</div>
            <div className="kpi-update-indicator"></div>
          </div>
        </div>

        {/* Charts Row - 2 gráficos principales */}
        <div className="charts-row">
          <div className="chart-card produccion-chart">
            <div className="chart-header">
              <h3>Producción por Hora</h3>
              <div className="chart-controls">
                <select className="chart-filter">
                  <option>Hoy</option>
                  <option>Ayer</option>
                  <option>Semana</option>
                </select>
                <span className="real-time-badge">⚡ Tiempo real</span>
              </div>
            </div>
            <div className="chart-container">
              {produccionPorHora.map((item, index) => (
                <div key={index} className="chart-bar-wrapper">
                  <div 
                    className="chart-bar" 
                    style={{ height: `${(item.valor / 150) * 100}%` }}
                  >
                    <span className="bar-value">{item.valor}</span>
                  </div>
                  <span className="bar-label">{item.hora}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3>Distribución de Máquinas</h3>
              <button className="chart-btn">Ver todas</button>
            </div>
            <div className="distribucion-container">
              <div className="distribucion-item">
                <span className="distribucion-label">Operando</span>
                <div className="distribucion-bar">
                  <div className="distribucion-fill" style={{ width: '60%', background: '#10b981' }}></div>
                </div>
                <span className="distribucion-value">60%</span>
              </div>
              <div className="distribucion-item">
                <span className="distribucion-label">Pausada</span>
                <div className="distribucion-bar">
                  <div className="distribucion-fill" style={{ width: '15%', background: '#f59e0b' }}></div>
                </div>
                <span className="distribucion-value">15%</span>
              </div>
              <div className="distribucion-item">
                <span className="distribucion-label">Mantenimiento</span>
                <div className="distribucion-bar">
                  <div className="distribucion-fill" style={{ width: '10%', background: '#ef4444' }}></div>
                </div>
                <span className="distribucion-value">10%</span>
              </div>
              <div className="distribucion-item">
                <span className="distribucion-label">Inactiva</span>
                <div className="distribucion-bar">
                  <div className="distribucion-fill" style={{ width: '15%', background: '#6b7280' }}></div>
                </div>
                <span className="distribucion-value">15%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Segunda fila de gráficos */}
        <div className="charts-row-secondary">
          <div className="chart-card">
            <div className="chart-header">
              <h3>Progreso de Proyectos</h3>
              <button className="chart-btn">Ver todos</button>
            </div>
            <div className="proyectos-container">
              {proyectos.map((proyecto, index) => (
                <div key={index} className="proyecto-item">
                  <div className="proyecto-info">
                    <span className="proyecto-nombre">{proyecto.nombre}</span>
                    <span className="proyecto-responsable">👤 {proyecto.responsable}</span>
                  </div>
                  <div className="proyecto-progress">
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${proyecto.progreso}%` }}></div>
                    </div>
                    <span className="progress-value">{proyecto.progreso}%</span>
                  </div>
                  <div className="proyecto-fecha">📅 {proyecto.fechaEntrega}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3>Alertas y Notificaciones</h3>
              <button className="chart-btn">Ver todas</button>
            </div>
            <div className="alertas-lista">
              {alertas.map(alerta => (
                <div key={alerta.id} className="alerta-item" style={{ borderLeftColor: getAlertaColor(alerta.tipo) }}>
                  <div className="alerta-contenido">
                    <span className="alerta-tipo" style={{ color: getAlertaColor(alerta.tipo) }}>
                      {alerta.tipo === 'critica' && '🔴'}
                      {alerta.tipo === 'advertencia' && '🟠'}
                      {alerta.tipo === 'info' && '🔵'}
                    </span>
                    <span className="alerta-mensaje">{alerta.mensaje}</span>
                  </div>
                  <span className="alerta-tiempo">{alerta.tiempo}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tables Row - 2 tablas */}
        <div className="tables-row">
          <div className="table-card">
            <div className="table-header">
              <h3>Órdenes Recientes</h3>
              <button className="table-btn">Ver todas</button>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Prioridad</th>
                    <th>Estado</th>
                    <th>Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {ordenesRecientes.slice(0, 4).map(orden => (
                    <tr key={orden.id}>
                      <td className="orden-id">{orden.id}</td>
                      <td>{orden.producto}</td>
                      <td className="orden-cantidad">{orden.cantidad}</td>
                      <td>
                        <span className="prioridad-badge" style={{ backgroundColor: getPrioridadColor(orden.prioridad) }}>
                          {orden.prioridad}
                        </span>
                      </td>
                      <td>
                        <span className="estado-badge" style={{ backgroundColor: getEstadoColor(orden.estado) }}>
                          {orden.estado.replace('_', ' ')}
                        </span>
                      </td>
                      <td>{orden.fecha}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="table-card">
            <div className="table-header">
              <h3>Estado de Máquinas</h3>
              <button className="table-btn">Ver dashboard</button>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Máquina</th>
                    <th>Estado</th>
                    <th>Eficiencia</th>
                    <th>Temperatura</th>
                    <th>Tiempo Rest.</th>
                  </tr>
                </thead>
                <tbody>
                  {maquinas.slice(0, 4).map(maq => (
                    <tr key={maq.id}>
                      <td className="maquina-nombre-tabla">{maq.nombre}</td>
                      <td>
                        <span className={`estado-badge-mini ${maq.estado}`}>
                          {maq.estado}
                        </span>
                      </td>
                      <td>
                        <div className="eficiencia-tabla">
                          <div className="eficiencia-bar-tabla" style={{ width: `${maq.eficiencia}%` }}></div>
                          <span>{maq.eficiencia}%</span>
                        </div>
                      </td>
                      <td className={maq.temperatura > 100 ? 'temp-alta' : maq.temperatura > 50 ? 'temp-media' : 'temp-normal'}>
                        {maq.temperatura}°C
                      </td>
                      <td>{maq.tiempoRestante}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Cards de Información Adicional */}
        <div className="info-cards-row">
          <div className="info-card">
            <div className="info-card-header">
              <span className="info-card-icon">📊</span>
              <h4>Rendimiento por Turno</h4>
            </div>
            <div className="info-card-content">
              <div className="turno-item">
                <span className="turno-nombre">Turno A</span>
                <span className="turno-valor">78%</span>
              </div>
              <div className="turno-item">
                <span className="turno-nombre">Turno B</span>
                <span className="turno-valor">82%</span>
              </div>
              <div className="turno-item">
                <span className="turno-nombre">Turno C</span>
                <span className="turno-valor">71%</span>
              </div>
            </div>
          </div>

          <div className="info-card">
            <div className="info-card-header">
              <span className="info-card-icon">⏱️</span>
              <h4>Tiempos Promedio</h4>
            </div>
            <div className="info-card-content">
              <div className="tiempo-item">
                <span className="tiempo-label">Setup</span>
                <span className="tiempo-valor">15 min</span>
              </div>
              <div className="tiempo-item">
                <span className="tiempo-label">Producción</span>
                <span className="tiempo-valor">45 min</span>
              </div>
              <div className="tiempo-item">
                <span className="tiempo-label">Mantenimiento</span>
                <span className="tiempo-valor">30 min</span>
              </div>
            </div>
          </div>

          <div className="info-card">
            <div className="info-card-header">
              <span className="info-card-icon">📦</span>
              <h4>Inventario Crítico</h4>
            </div>
            <div className="info-card-content">
              <div className="inventario-item">
                <span className="inventario-nombre">Tinta Negra</span>
                <span className="inventario-valor bajo">15%</span>
              </div>
              <div className="inventario-item">
                <span className="inventario-nombre">Papel Sublimación</span>
                <span className="inventario-valor medio">45%</span>
              </div>
              <div className="inventario-item">
                <span className="inventario-nombre">Filamento</span>
                <span className="inventario-valor bueno">78%</span>
              </div>
            </div>
          </div>

          <div className="info-card">
            <div className="info-card-header">
              <span className="info-card-icon">👥</span>
              <h4>Personal Activo</h4>
            </div>
            <div className="info-card-content">
              <div className="personal-item">
                <span className="personal-nombre">Producción</span>
                <span className="personal-valor">12</span>
              </div>
              <div className="personal-item">
                <span className="personal-nombre">Calidad</span>
                <span className="personal-valor">4</span>
              </div>
              <div className="personal-item">
                <span className="personal-nombre">Mantenimiento</span>
                <span className="personal-valor">3</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="dashboard-footer">
        <div className="footer-left">
          <span className="copyright">© 2026 TEGRA Manufacturing</span>
          <span className="footer-separator">•</span>
          <span className="environment">Producción</span>
          <span className="footer-separator">•</span>
          <span className="update-frequency">Actualización cada 6s</span>
          <span className="footer-separator">•</span>
          <span className="version-info">v2.5.0</span>
        </div>
        <div className="footer-right">
          <span className="last-update">🕒 {formatTime(currentTime)}</span>
          <span className="footer-separator">•</span>
          <span className="connection-status">
            <span className="connection-dot"></span>
            Tiempo real
          </span>
          <span className="footer-separator">•</span>
          <span className="server-status">
            <span className="server-dot"></span>
            Servidor OK
          </span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;