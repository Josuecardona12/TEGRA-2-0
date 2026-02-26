import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [periodo, setPeriodo] = useState('dia');
  const [vista, setVista] = useState('principal');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [animacionGlobal, setAnimacionGlobal] = useState(false);
  const [vistaGrafica, setVistaGrafica] = useState('barras'); // 'barras', 'lineas', 'areas'
  const [filtroProduccion, setFiltroProduccion] = useState('hoy');
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [maquinaSeleccionada, setMaquinaSeleccionada] = useState(null);
  const [mostrarPanelDetalle, setMostrarPanelDetalle] = useState(false);
  const [modoComparacion, setModoComparacion] = useState(false);
  const [datosComparacion, setDatosComparacion] = useState([]);
  const [zoomNivel, setZoomNivel] = useState(1);
  
  // Notificaciones en tiempo real
  const [notificaciones, setNotificaciones] = useState([
    { id: 1, mensaje: 'LOTE-001 completado', tipo: 'exito', leida: false, timestamp: new Date() },
    { id: 2, mensaje: 'Máquina 03 requiere mantenimiento', tipo: 'advertencia', leida: false, timestamp: new Date() },
    { id: 3, mensaje: 'Nueva orden de producción', tipo: 'info', leida: true, timestamp: new Date() },
    { id: 4, mensaje: 'Objetivo de producción alcanzado', tipo: 'exito', leida: false, timestamp: new Date() }
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
    satisfaccion: 92,
    oee: 85,
    disponibilidad: 92,
    calidad: 98,
    rendimiento: 89
  });

  const [produccionPorHora, setProduccionPorHora] = useState([
    { hora: '06:00', valor: 45, valorAnterior: 42, meta: 50 },
    { hora: '07:00', valor: 78, valorAnterior: 70, meta: 80 },
    { hora: '08:00', valor: 92, valorAnterior: 85, meta: 95 },
    { hora: '09:00', valor: 110, valorAnterior: 100, meta: 115 },
    { hora: '10:00', valor: 135, valorAnterior: 125, meta: 140 },
    { hora: '11:00', valor: 142, valorAnterior: 130, meta: 145 },
    { hora: '12:00', valor: 128, valorAnterior: 120, meta: 135 },
    { hora: '13:00', valor: 115, valorAnterior: 110, meta: 120 },
    { hora: '14:00', valor: 138, valorAnterior: 128, meta: 140 },
    { hora: '15:00', valor: 145, valorAnterior: 135, meta: 150 },
    { hora: '16:00', valor: 132, valorAnterior: 125, meta: 140 },
    { hora: '17:00', valor: 98, valorAnterior: 95, meta: 100 }
  ]);

  const [produccionPorDia, setProduccionPorDia] = useState([
    { dia: 'Lun', valor: 980, valorAnterior: 950, meta: 1000 },
    { dia: 'Mar', valor: 1050, valorAnterior: 1000, meta: 1100 },
    { dia: 'Mié', valor: 1120, valorAnterior: 1080, meta: 1150 },
    { dia: 'Jue', valor: 1080, valorAnterior: 1050, meta: 1100 },
    { dia: 'Vie', valor: 1150, valorAnterior: 1100, meta: 1200 },
    { dia: 'Sáb', valor: 820, valorAnterior: 800, meta: 850 },
    { dia: 'Dom', valor: 650, valorAnterior: 620, meta: 700 }
  ]);

  const [ordenesRecientes, setOrdenesRecientes] = useState([
    { id: 'ORD-001', producto: 'Camiseta MLB', cantidad: 150, estado: 'en_proceso', fecha: '10:30 AM', prioridad: 'alta', cliente: 'Nike', progreso: 75, fechaEntrega: '2026-03-15' },
    { id: 'ORD-002', producto: 'Gorra NBA', cantidad: 75, estado: 'completada', fecha: '09:15 AM', prioridad: 'media', cliente: 'Adidas', progreso: 100, fechaEntrega: '2026-03-10' },
    { id: 'ORD-003', producto: 'Uniforme NFL', cantidad: 200, estado: 'pendiente', fecha: '11:45 AM', prioridad: 'alta', cliente: 'Puma', progreso: 0, fechaEntrega: '2026-03-20' },
    { id: 'ORD-004', producto: 'Sudadera NHL', cantidad: 100, estado: 'en_proceso', fecha: '08:20 AM', prioridad: 'baja', cliente: 'Local', progreso: 45, fechaEntrega: '2026-03-18' },
    { id: 'ORD-005', producto: 'Camiseta FIFA', cantidad: 300, estado: 'revision', fecha: '12:10 PM', prioridad: 'alta', cliente: 'Nike', progreso: 90, fechaEntrega: '2026-03-12' },
    { id: 'ORD-006', producto: 'Gorra MLB', cantidad: 50, estado: 'pendiente', fecha: '01:30 PM', prioridad: 'media', cliente: 'Adidas', progreso: 0, fechaEntrega: '2026-03-25' },
    { id: 'ORD-007', producto: 'Jersey NBA', cantidad: 180, estado: 'en_proceso', fecha: '02:15 PM', prioridad: 'alta', cliente: 'Puma', progreso: 60, fechaEntrega: '2026-03-22' },
    { id: 'ORD-008', producto: 'Bufanda NFL', cantidad: 120, estado: 'pendiente', fecha: '03:00 PM', prioridad: 'baja', cliente: 'Local', progreso: 0, fechaEntrega: '2026-03-28' }
  ]);

  const [maquinas, setMaquinas] = useState([
    { id: 1, nombre: 'Plotter HP', estado: 'operando', eficiencia: 92, orden: 'ORD-001', temperatura: 42, velocidad: 85, tiempoRestante: '2h 15m', mantenimiento: '2026-04-01', horasOperacion: 1250 },
    { id: 2, nombre: 'Sublimadora Epson', estado: 'operando', eficiencia: 88, orden: 'ORD-003', temperatura: 38, velocidad: 92, tiempoRestante: '1h 30m', mantenimiento: '2026-03-28', horasOperacion: 980 },
    { id: 3, nombre: 'Cortadora Zund', estado: 'pausada', eficiencia: 76, orden: 'ORD-002', temperatura: 35, velocidad: 0, tiempoRestante: '0h 45m', mantenimiento: '2026-03-30', horasOperacion: 2100 },
    { id: 4, nombre: 'Impresora Durst', estado: 'mantenimiento', eficiencia: 0, orden: '-', temperatura: 0, velocidad: 0, tiempoRestante: '3h 00m', mantenimiento: '2026-03-15', horasOperacion: 3500 },
    { id: 5, nombre: 'Plancha Monti', estado: 'operando', eficiencia: 95, orden: 'ORD-004', temperatura: 180, velocidad: 75, tiempoRestante: '4h 20m', mantenimiento: '2026-04-05', horasOperacion: 850 },
    { id: 6, nombre: 'Plotter Mimaki', estado: 'operando', eficiencia: 84, orden: 'ORD-005', temperatura: 41, velocidad: 78, tiempoRestante: '1h 10m', mantenimiento: '2026-03-25', horasOperacion: 1450 },
    { id: 7, nombre: 'Sublimadora Sawgrass', estado: 'inactiva', eficiencia: 0, orden: '-', temperatura: 22, velocidad: 0, tiempoRestante: '0h 00m', mantenimiento: '2026-03-20', horasOperacion: 670 },
    { id: 8, nombre: 'Cortadora Kongsberg', estado: 'operando', eficiencia: 91, orden: 'ORD-006', temperatura: 37, velocidad: 82, tiempoRestante: '2h 45m', mantenimiento: '2026-04-10', horasOperacion: 1820 }
  ]);

  const [alertas, setAlertas] = useState([
    { id: 1, tipo: 'critica', mensaje: 'Temperatura alta en Máquina 05', tiempo: 'hace 2m', solucion: 'Verificar sistema de enfriamiento' },
    { id: 2, tipo: 'advertencia', mensaje: 'Mantenimiento preventivo requerido', tiempo: 'hace 15m', solucion: 'Programar mantenimiento' },
    { id: 3, tipo: 'info', mensaje: 'Orden ORD-003 completada', tiempo: 'hace 25m', solucion: '' },
    { id: 4, tipo: 'critica', mensaje: 'Retraso en producción', tiempo: 'hace 30m', solucion: 'Revisar planificación' },
    { id: 5, tipo: 'advertencia', mensaje: 'Nivel bajo de tinta', tiempo: 'hace 45m', solucion: 'Reabastecer insumos' }
  ]);

  const [proyectos, setProyectos] = useState([
    { nombre: 'Proyecto MLB', progreso: 75, fechaEntrega: '2026-03-15', responsable: 'Carlos', tareas: 12, completadas: 9 },
    { nombre: 'Proyecto NBA', progreso: 45, fechaEntrega: '2026-03-20', responsable: 'María', tareas: 15, completadas: 7 },
    { nombre: 'Proyecto NFL', progreso: 90, fechaEntrega: '2026-03-10', responsable: 'José', tareas: 10, completadas: 9 },
    { nombre: 'Proyecto NHL', progreso: 30, fechaEntrega: '2026-03-25', responsable: 'Ana', tareas: 8, completadas: 2 },
    { nombre: 'Proyecto FIFA', progreso: 60, fechaEntrega: '2026-03-18', responsable: 'Luis', tareas: 14, completadas: 8 }
  ]);

  const [tiemposPromedio, setTiemposPromedio] = useState({
    setup: 15,
    produccion: 45,
    mantenimiento: 30,
    cambioHerramienta: 12,
    espera: 8
  });

  const [inventario, setInventario] = useState([
    { nombre: 'Tinta Negra', cantidad: 15, unidad: '%', estado: 'bajo', minima: 20 },
    { nombre: 'Tinta Cyan', cantidad: 45, unidad: '%', estado: 'medio', minima: 30 },
    { nombre: 'Tinta Magenta', cantidad: 38, unidad: '%', estado: 'medio', minima: 30 },
    { nombre: 'Tinta Amarilla', cantidad: 52, unidad: '%', estado: 'bueno', minima: 30 },
    { nombre: 'Papel Sublimación', cantidad: 45, unidad: '%', estado: 'medio', minima: 25 },
    { nombre: 'Filamento', cantidad: 78, unidad: '%', estado: 'bueno', minima: 20 },
    { nombre: 'Vinilo', cantidad: 62, unidad: '%', estado: 'bueno', minima: 30 }
  ]);

  const [personal, setPersonal] = useState({
    produccion: 12,
    calidad: 4,
    mantenimiento: 3,
    planificacion: 2,
    administracion: 5
  });

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
        satisfaccion: Number((Math.min(100, Math.max(0, prev.satisfaccion + (Math.random() * 2 - 1)))).toFixed(1)),
        oee: Number((Math.min(100, Math.max(0, prev.oee + (Math.random() * 2 - 1)))).toFixed(1)),
        disponibilidad: Number((Math.min(100, Math.max(0, prev.disponibilidad + (Math.random() * 2 - 1)))).toFixed(1)),
        calidad: Number((Math.min(100, Math.max(0, prev.calidad + (Math.random() * 2 - 1)))).toFixed(1)),
        rendimiento: Number((Math.min(100, Math.max(0, prev.rendimiento + (Math.random() * 2 - 1)))).toFixed(1))
      }));

      setProduccionPorHora(prev => {
        const nuevas = [...prev];
        const ultimaHora = nuevas.length - 1;
        nuevas[ultimaHora] = {
          ...nuevas[ultimaHora],
          valor: Math.max(0, Math.min(200, nuevas[ultimaHora].valor + Math.floor(Math.random() * 10) - 3))
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
            tiempo: 'ahora',
            solucion: 'Revisar sistema'
          },
          ...prev.slice(0, 4)
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

  const handleOrdenClick = (orden) => {
    setOrdenSeleccionada(orden);
    setMostrarPanelDetalle(true);
  };

  const handleMaquinaClick = (maquina) => {
    setMaquinaSeleccionada(maquina);
    setMostrarPanelDetalle(true);
  };

  const cerrarPanelDetalle = () => {
    setMostrarPanelDetalle(false);
    setOrdenSeleccionada(null);
    setMaquinaSeleccionada(null);
  };

  const toggleComparacion = (item) => {
    if (modoComparacion) {
      if (datosComparacion.includes(item)) {
        setDatosComparacion(datosComparacion.filter(d => d !== item));
      } else {
        setDatosComparacion([...datosComparacion, item]);
      }
    }
  };

  const renderGraficaProduccion = () => {
    const datos = filtroProduccion === 'hoy' ? produccionPorHora : produccionPorDia;
    const maxValor = Math.max(...datos.map(d => d.meta)) * 1.2;

    switch(vistaGrafica) {
      case 'barras':
        return (
          <div className="chart-container barras">
            {datos.map((item, index) => (
              <div key={index} className="chart-bar-wrapper" onClick={() => toggleComparacion(item)}>
                <div className="bar-group">
                  <div 
                    className="chart-bar actual" 
                    style={{ height: `${(item.valor / maxValor) * 100}%` }}
                  >
                    <span className="bar-value">{item.valor}</span>
                  </div>
                  {modoComparacion && (
                    <div 
                      className="chart-bar anterior" 
                      style={{ height: `${(item.valorAnterior / maxValor) * 100}%` }}
                    >
                      <span className="bar-value">{item.valorAnterior}</span>
                    </div>
                  )}
                </div>
                <span className="bar-label">{item.hora || item.dia}</span>
                <div className="bar-meta" style={{ bottom: `${(item.meta / maxValor) * 100}%` }}>
                  <span className="meta-line"></span>
                </div>
              </div>
            ))}
          </div>
        );

      case 'lineas':
        return (
          <div className="chart-container lineas">
            <svg viewBox="0 0 1000 300" className="line-chart">
              <polyline
                points={datos.map((d, i) => `${(i * (1000 / (datos.length - 1)))},${300 - (d.valor / maxValor) * 250}`).join(' ')}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
              />
              {modoComparacion && (
                <polyline
                  points={datos.map((d, i) => `${(i * (1000 / (datos.length - 1)))},${300 - (d.valorAnterior / maxValor) * 250}`).join(' ')}
                  fill="none"
                  stroke="#9ca3af"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              )}
              {datos.map((d, i) => (
                <circle
                  key={i}
                  cx={i * (1000 / (datos.length - 1))}
                  cy={300 - (d.valor / maxValor) * 250}
                  r="5"
                  fill="#3b82f6"
                  className="chart-point"
                />
              ))}
            </svg>
          </div>
        );

      case 'areas':
        return (
          <div className="chart-container areas">
            <svg viewBox="0 0 1000 300" className="area-chart">
              <defs>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2"/>
                </linearGradient>
              </defs>
              <polygon
                points={`0,300 ${datos.map((d, i) => `${(i * (1000 / (datos.length - 1)))},${300 - (d.valor / maxValor) * 250}`).join(' ')} 1000,300`}
                fill="url(#areaGradient)"
              />
            </svg>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`dashboard-premium ${animacionGlobal ? 'global-update' : ''}`}>
      {/* Overlay del panel de detalle */}
      {mostrarPanelDetalle && (
        <div className="panel-detalle-overlay" onClick={cerrarPanelDetalle}>
          <div className="panel-detalle" onClick={e => e.stopPropagation()}>
            <button className="panel-detalle-cerrar" onClick={cerrarPanelDetalle}>✕</button>
            {ordenSeleccionada && (
              <div className="detalle-contenido">
                <h3>Detalle de Orden {ordenSeleccionada.id}</h3>
                <div className="detalle-grid">
                  <div className="detalle-item">
                    <span className="detalle-label">Producto</span>
                    <span className="detalle-valor">{ordenSeleccionada.producto}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Cliente</span>
                    <span className="detalle-valor">{ordenSeleccionada.cliente}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Cantidad</span>
                    <span className="detalle-valor">{ordenSeleccionada.cantidad}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Progreso</span>
                    <span className="detalle-valor">{ordenSeleccionada.progreso}%</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Fecha Entrega</span>
                    <span className="detalle-valor">{ordenSeleccionada.fechaEntrega}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Prioridad</span>
                    <span className="detalle-valor" style={{ color: getPrioridadColor(ordenSeleccionada.prioridad) }}>
                      {ordenSeleccionada.prioridad}
                    </span>
                  </div>
                </div>
              </div>
            )}
            {maquinaSeleccionada && (
              <div className="detalle-contenido">
                <h3>Detalle de {maquinaSeleccionada.nombre}</h3>
                <div className="detalle-grid">
                  <div className="detalle-item">
                    <span className="detalle-label">Estado</span>
                    <span className="detalle-valor">{maquinaSeleccionada.estado}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Eficiencia</span>
                    <span className="detalle-valor">{maquinaSeleccionada.eficiencia}%</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Temperatura</span>
                    <span className="detalle-valor">{maquinaSeleccionada.temperatura}°C</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Orden Actual</span>
                    <span className="detalle-valor">{maquinaSeleccionada.orden}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Tiempo Restante</span>
                    <span className="detalle-valor">{maquinaSeleccionada.tiempoRestante}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Horas Operación</span>
                    <span className="detalle-valor">{maquinaSeleccionada.horasOperacion}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header Premium */}
      <div className="dashboard-header">
        <div className="header-left">
          <button 
            className="menu-toggle-btn"
            onClick={() => setMenuAbierto(!menuAbierto)}
          >
            <span className="menu-icon">☰</span>
          </button>
          <div className="logo-area">
            <div className="logo-icon">T</div>
            <h1 className="dashboard-title">
              TEGRA
              <span className="title-badge">ERP</span>
            </h1>
          </div>
          <div className="date-badge">
            <span className="date-icon">📅</span>
            <span className="date-text">{formatDate(currentTime)}</span>
          </div>
        </div>

        <div className="header-right">
          <div className="live-indicator">
            <span className="live-pulse"></span>
            <span className="live-text">EN VIVO</span>
            <span className="live-time">{formatTime(currentTime)}</span>
          </div>

          <div className="header-actions">
            <button className="action-btn" title="Comparar datos" onClick={() => setModoComparacion(!modoComparacion)}>
              {modoComparacion ? '📊' : '📈'}
            </button>
            <button className="action-btn" title="Zoom in" onClick={() => setZoomNivel(Math.min(2, zoomNivel + 0.1))}>
              🔍+
            </button>
            <button className="action-btn" title="Zoom out" onClick={() => setZoomNivel(Math.max(0.5, zoomNivel - 0.1))}>
              🔍-
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
                <div className="notificaciones-lista">
                  {notificaciones.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`notificacion-item ${!notif.leida ? 'no-leida' : ''} ${notif.tipo}`}
                      onClick={() => marcarNotificacionLeida(notif.id)}
                    >
                      <span className="notif-icon">
                        {notif.tipo === 'exito' && '✅'}
                        {notif.tipo === 'advertencia' && '⚠️'}
                        {notif.tipo === 'info' && 'ℹ️'}
                        {notif.tipo === 'critica' && '🔴'}
                      </span>
                      <div className="notif-contenido">
                        <span className="notif-mensaje">{notif.mensaje}</span>
                        <span className="notif-time">
                          {notif.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
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
      </div>

      {/* Menú Lateral */}
      <div className={`side-menu ${menuAbierto ? 'abierto' : ''}`}>
        <div className="menu-header">
          <div className="menu-logo">
            <span className="menu-logo-icon">T</span>
            <span className="menu-logo-text">TEGRA</span>
          </div>
          <span className="menu-version">v2.5.0</span>
        </div>

        <div className="menu-search">
          <input type="text" placeholder="Buscar..." />
          <span className="search-icon">🔍</span>
        </div>

        <nav className="menu-nav">
          <div className="menu-section">
            <h4>PRINCIPAL</h4>
            <button className={`menu-item ${vista === 'principal' ? 'active' : ''}`} onClick={() => setVista('principal')}>
              <span className="item-icon">📊</span>
              <span className="item-text">Dashboard</span>
            </button>
            <button className="menu-item">
              <span className="item-icon">📋</span>
              <span className="item-text">Órdenes</span>
              <span className="item-badge">{stats.ordenesActivas}</span>
            </button>
            <button className="menu-item">
              <span className="item-icon">⚙️</span>
              <span className="item-text">Máquinas</span>
              <span className="item-badge">{stats.maquinasActivas}/{stats.maquinasTotales}</span>
            </button>
          </div>

          <div className="menu-section">
            <h4>OPERACIONES</h4>
            <button className="menu-item">
              <span className="item-icon">📅</span>
              <span className="item-text">Plan Semanal</span>
            </button>
            <button className="menu-item">
              <span className="item-icon">🏭</span>
              <span className="item-text">Producción</span>
            </button>
            <button className="menu-item">
              <span className="item-icon">📦</span>
              <span className="item-text">Miceláneos</span>
            </button>
            <button className="menu-item">
              <span className="item-icon">🔧</span>
              <span className="item-text">Mantenimiento</span>
            </button>
            <button className="menu-item">
              <span className="item-icon">✅</span>
              <span className="item-text">Calidad</span>
            </button>
          </div>

          <div className="menu-section">
            <h4>REPORTES</h4>
            <button className="menu-item">
              <span className="item-icon">📈</span>
              <span className="item-text">Eficiencia</span>
            </button>
            <button className="menu-item">
              <span className="item-icon">👥</span>
              <span className="item-text">Recursos Humanos</span>
            </button>
            <button className="menu-item">
              <span className="item-icon">📊</span>
              <span className="item-text">Estadísticas</span>
            </button>
            <button className="menu-item">
              <span className="item-icon">📉</span>
              <span className="item-text">Tendencias</span>
            </button>
            <button className="menu-item">
              <span className="item-icon">💰</span>
              <span className="item-text">Costos</span>
            </button>
          </div>

          <div className="menu-section">
            <h4>CONFIGURACIÓN</h4>
            <button className="menu-item">
              <span className="item-icon">⚙️</span>
              <span className="item-text">Ajustes</span>
            </button>
            <button className="menu-item">
              <span className="item-icon">👤</span>
              <span className="item-text">Perfil</span>
            </button>
            <button className="menu-item">
              <span className="item-icon">🔒</span>
              <span className="item-text">Seguridad</span>
            </button>
          </div>
        </nav>

        <div className="menu-footer">
          <div className="system-status">
            <span className="status-dot verde"></span>
            <span>Sistema activo</span>
          </div>
          <div className="sync-status">
            <span className="sync-icon">🔄</span>
            <span>Tiempo real</span>
          </div>
          <div className="storage-status">
            <div className="storage-bar">
              <div className="storage-fill" style={{ width: '78%' }}></div>
            </div>
            <span>78% usado</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main" style={{ transform: `scale(${zoomNivel})`, transformOrigin: 'top center' }}>
        {/* Top Bar con Selector de Período y Controles de Gráfica */}
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

          <div className="grafica-controles">
            <button 
              className={`control-btn ${vistaGrafica === 'barras' ? 'active' : ''}`}
              onClick={() => setVistaGrafica('barras')}
              title="Gráfica de barras"
            >
              📊
            </button>
            <button 
              className={`control-btn ${vistaGrafica === 'lineas' ? 'active' : ''}`}
              onClick={() => setVistaGrafica('lineas')}
              title="Gráfica de líneas"
            >
              📈
            </button>
            <button 
              className={`control-btn ${vistaGrafica === 'areas' ? 'active' : ''}`}
              onClick={() => setVistaGrafica('areas')}
              title="Gráfica de áreas"
            >
              📉
            </button>
            <select 
              className="filtro-select"
              value={filtroProduccion}
              onChange={(e) => setFiltroProduccion(e.target.value)}
            >
              <option value="hoy">Hoy</option>
              <option value="semana">Esta semana</option>
              <option value="mes">Este mes</option>
            </select>
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

        {/* KPI Cards - 12 KPIs con OEE */}
        <div className="kpi-grid">
          <div className="kpi-card ordenes">
            <div className="kpi-header">
              <span className="kpi-icon">📋</span>
              <span className="kpi-tendencia positive">+12%</span>
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{stats.ordenesActivas}</span>
              <span className="kpi-label">Órdenes Activas</span>
            </div>
            <div className="kpi-footer">
              <span className="kpi-sub">vs ayer +2</span>
            </div>
          </div>

          <div className="kpi-card completadas">
            <div className="kpi-header">
              <span className="kpi-icon">✅</span>
              <span className="kpi-tendencia positive">+8%</span>
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{stats.ordenesCompletadas}</span>
              <span className="kpi-label">Completadas</span>
            </div>
            <div className="kpi-footer">
              <span className="kpi-sub">esta semana</span>
            </div>
          </div>

          <div className="kpi-card maquinas">
            <div className="kpi-header">
              <span className="kpi-icon">⚙️</span>
              <span className="kpi-tendencia">{Math.round((stats.maquinasActivas/stats.maquinasTotales)*100)}%</span>
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{stats.maquinasActivas}/{stats.maquinasTotales}</span>
              <span className="kpi-label">Máquinas Activas</span>
            </div>
            <div className="kpi-footer">
              <span className="kpi-sub">8 operando</span>
            </div>
          </div>

          <div className="kpi-card eficiencia">
            <div className="kpi-header">
              <span className="kpi-icon">📊</span>
              <span className="kpi-tendencia positive">+5%</span>
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{stats.eficienciaGlobal}%</span>
              <span className="kpi-label">Eficiencia Global</span>
            </div>
            <div className="kpi-footer">
              <span className="kpi-sub">meta 90%</span>
            </div>
          </div>

          <div className="kpi-card produccion">
            <div className="kpi-header">
              <span className="kpi-icon">📦</span>
              <span className="kpi-tendencia positive">+15%</span>
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{stats.produccionHoy}</span>
              <span className="kpi-label">Prod. Hoy</span>
            </div>
            <div className="kpi-footer">
              <span className="kpi-sub">unidades</span>
            </div>
          </div>

          <div className="kpi-card alertas">
            <div className="kpi-header">
              <span className="kpi-icon">⚠️</span>
              <span className="kpi-tendencia negative">+2</span>
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{stats.alertas}</span>
              <span className="kpi-label">Alertas</span>
            </div>
            <div className="kpi-footer">
              <span className="kpi-sub">3 críticas</span>
            </div>
          </div>

          <div className="kpi-card atrasos">
            <div className="kpi-header">
              <span className="kpi-icon">⏰</span>
              <span className="kpi-tendencia negative">-1</span>
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{stats.atrasos}</span>
              <span className="kpi-label">Atrasos</span>
            </div>
            <div className="kpi-footer">
              <span className="kpi-sub">2 graves</span>
            </div>
          </div>

          <div className="kpi-card productividad">
            <div className="kpi-header">
              <span className="kpi-icon">📈</span>
              <span className="kpi-tendencia positive">+3%</span>
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{stats.productividad}%</span>
              <span className="kpi-label">Productividad</span>
            </div>
            <div className="kpi-footer">
              <span className="kpi-sub">meta 95%</span>
            </div>
          </div>

          <div className="kpi-card satisfaccion">
            <div className="kpi-header">
              <span className="kpi-icon">⭐</span>
              <span className="kpi-tendencia positive">+2%</span>
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{stats.satisfaccion}%</span>
              <span className="kpi-label">Satisfacción</span>
            </div>
            <div className="kpi-footer">
              <span className="kpi-sub">cliente</span>
            </div>
          </div>

          <div className="kpi-card oee">
            <div className="kpi-header">
              <span className="kpi-icon">⚡</span>
              <span className="kpi-tendencia positive">+1%</span>
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{stats.oee}%</span>
              <span className="kpi-label">OEE</span>
            </div>
            <div className="kpi-footer">
              <span className="kpi-sub">world class 85%</span>
            </div>
          </div>

          <div className="kpi-card disponibilidad">
            <div className="kpi-header">
              <span className="kpi-icon">⏱️</span>
              <span className="kpi-tendencia positive">+0.5%</span>
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{stats.disponibilidad}%</span>
              <span className="kpi-label">Disponibilidad</span>
            </div>
            <div className="kpi-footer">
              <span className="kpi-sub">tiempo operativo</span>
            </div>
          </div>

          <div className="kpi-card calidad">
            <div className="kpi-header">
              <span className="kpi-icon">✨</span>
              <span className="kpi-tendencia positive">+0.3%</span>
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{stats.calidad}%</span>
              <span className="kpi-label">Calidad</span>
            </div>
            <div className="kpi-footer">
              <span className="kpi-sub">primera pasada</span>
            </div>
          </div>
        </div>

        {/* Gráfico Principal de Producción */}
        <div className="chart-card produccion-chart">
          <div className="chart-header">
            <div className="chart-title">
              <h3>Producción por {filtroProduccion === 'hoy' ? 'Hora' : 'Día'}</h3>
              <div className="chart-legend">
                <span className="legend-item">
                  <span className="legend-color actual"></span>
                  Actual
                </span>
                {modoComparacion && (
                  <span className="legend-item">
                    <span className="legend-color anterior"></span>
                    Anterior
                  </span>
                )}
                <span className="legend-item">
                  <span className="legend-color meta"></span>
                  Meta
                </span>
              </div>
            </div>
            <div className="chart-controls">
              <select className="chart-filter">
                <option>Hoy</option>
                <option>Ayer</option>
                <option>Semana</option>
              </select>
              <span className="real-time-badge">
                <span className="pulse-dot"></span>
                Tiempo real
              </span>
            </div>
          </div>
          <div className="chart-body">
            {renderGraficaProduccion()}
          </div>
        </div>

        {/* Segunda fila - Máquinas y Proyectos */}
        <div className="charts-row">
          <div className="chart-card maquinas-chart">
            <div className="chart-header">
              <h3>Estado de Máquinas</h3>
              <button className="chart-btn">Ver todas</button>
            </div>
            <div className="maquinas-grid">
              {maquinas.slice(0, 4).map(maq => (
                <div 
                  key={maq.id} 
                  className={`maquina-item ${maq.estado}`}
                  onClick={() => handleMaquinaClick(maq)}
                >
                  <div className="maquina-header">
                    <span className="maquina-nombre">{maq.nombre}</span>
                    <span className={`maquina-estado estado-${maq.estado}`}>{maq.estado}</span>
                  </div>
                  <div className="maquina-info">
                    <div className="maquina-eficiencia">
                      <div className="eficiencia-label">Eficiencia</div>
                      <div className="eficiencia-valor">{maq.eficiencia}%</div>
                      <div className="eficiencia-barra">
                        <div className="eficiencia-progreso" style={{ width: `${maq.eficiencia}%` }}></div>
                      </div>
                    </div>
                    <div className="maquina-temp">
                      <span className="temp-icon">🌡️</span>
                      <span className={`temp-valor ${maq.temperatura > 100 ? 'alta' : maq.temperatura > 50 ? 'media' : 'normal'}`}>
                        {maq.temperatura}°C
                      </span>
                    </div>
                  </div>
                  <div className="maquina-orden">
                    Orden: {maq.orden}
                    <span className="maquina-tiempo">{maq.tiempoRestante}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-card proyectos-chart">
            <div className="chart-header">
              <h3>Progreso de Proyectos</h3>
              <button className="chart-btn">Ver todos</button>
            </div>
            <div className="proyectos-lista">
              {proyectos.map((proyecto, index) => (
                <div key={index} className="proyecto-item">
                  <div className="proyecto-header">
                    <span className="proyecto-nombre">{proyecto.nombre}</span>
                    <span className="proyecto-responsable">👤 {proyecto.responsable}</span>
                  </div>
                  <div className="proyecto-progress">
                    <div className="progress-info">
                      <span className="progress-tareas">{proyecto.completadas}/{proyecto.tareas} tareas</span>
                      <span className="progress-porcentaje">{proyecto.progreso}%</span>
                    </div>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${proyecto.progreso}%` }}></div>
                    </div>
                  </div>
                  <div className="proyecto-footer">
                    <span className="proyecto-fecha">📅 {proyecto.fechaEntrega}</span>
                    {proyecto.progreso >= 90 && <span className="proyecto-badge">¡Casi listo!</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tercera fila - Alertas y Rendimiento */}
        <div className="charts-row-secondary">
          <div className="chart-card alertas-chart">
            <div className="chart-header">
              <h3>Alertas Activas</h3>
              <button className="chart-btn">Ver todas</button>
            </div>
            <div className="alertas-lista">
              {alertas.map(alerta => (
                <div key={alerta.id} className="alerta-item" style={{ borderLeftColor: getAlertaColor(alerta.tipo) }}>
                  <div className="alerta-icono">
                    {alerta.tipo === 'critica' && '🔴'}
                    {alerta.tipo === 'advertencia' && '🟠'}
                    {alerta.tipo === 'info' && '🔵'}
                  </div>
                  <div className="alerta-contenido">
                    <div className="alerta-header">
                      <span className="alerta-tipo" style={{ color: getAlertaColor(alerta.tipo) }}>
                        {alerta.tipo.toUpperCase()}
                      </span>
                      <span className="alerta-tiempo">{alerta.tiempo}</span>
                    </div>
                    <span className="alerta-mensaje">{alerta.mensaje}</span>
                    {alerta.solucion && (
                      <span className="alerta-solucion">💡 {alerta.solucion}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-card rendimiento-chart">
            <div className="chart-header">
              <h3>Rendimiento por Turno</h3>
              <button className="chart-btn">Ver detalles</button>
            </div>
            <div className="rendimiento-contenido">
              <div className="turnos-grid">
                <div className="turno-card">
                  <span className="turno-nombre">Turno A</span>
                  <span className="turno-valor">78%</span>
                  <div className="turno-barra">
                    <div className="turno-progreso" style={{ width: '78%' }}></div>
                  </div>
                  <span className="turno-produccion">450 uds</span>
                </div>
                <div className="turno-card">
                  <span className="turno-nombre">Turno B</span>
                  <span className="turno-valor">82%</span>
                  <div className="turno-barra">
                    <div className="turno-progreso" style={{ width: '82%' }}></div>
                  </div>
                  <span className="turno-produccion">520 uds</span>
                </div>
                <div className="turno-card">
                  <span className="turno-nombre">Turno C</span>
                  <span className="turno-valor">71%</span>
                  <div className="turno-barra">
                    <div className="turno-progreso" style={{ width: '71%' }}></div>
                  </div>
                  <span className="turno-produccion">380 uds</span>
                </div>
              </div>

              <div className="tiempos-promedio">
                <h4>Tiempos Promedio</h4>
                <div className="tiempos-grid">
                  <div className="tiempo-item">
                    <span className="tiempo-label">Setup</span>
                    <span className="tiempo-valor">{tiemposPromedio.setup} min</span>
                  </div>
                  <div className="tiempo-item">
                    <span className="tiempo-label">Producción</span>
                    <span className="tiempo-valor">{tiemposPromedio.produccion} min</span>
                  </div>
                  <div className="tiempo-item">
                    <span className="tiempo-label">Mantenimiento</span>
                    <span className="tiempo-valor">{tiemposPromedio.mantenimiento} min</span>
                  </div>
                  <div className="tiempo-item">
                    <span className="tiempo-label">Cambio</span>
                    <span className="tiempo-valor">{tiemposPromedio.cambioHerramienta} min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de Órdenes Recientes */}
        <div className="table-card">
          <div className="table-header">
            <h3>Órdenes de Producción</h3>
            <div className="table-actions">
              <button className="table-btn">Filtrar</button>
              <button className="table-btn primary">Nueva Orden</button>
            </div>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Producto</th>
                  <th>Cliente</th>
                  <th>Cantidad</th>
                  <th>Prioridad</th>
                  <th>Estado</th>
                  <th>Progreso</th>
                  <th>Fecha Entrega</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ordenesRecientes.map(orden => (
                  <tr key={orden.id} onClick={() => handleOrdenClick(orden)}>
                    <td className="orden-id">{orden.id}</td>
                    <td className="orden-producto">{orden.producto}</td>
                    <td className="orden-cliente">{orden.cliente}</td>
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
                    <td>
                      <div className="table-progress">
                        <div className="table-progress-bar">
                          <div className="table-progress-fill" style={{ width: `${orden.progreso}%` }}></div>
                        </div>
                        <span className="table-progress-text">{orden.progreso}%</span>
                      </div>
                    </td>
                    <td className="orden-fecha">{orden.fechaEntrega}</td>
                    <td>
                      <div className="table-acciones">
                        <button className="table-accion-btn" title="Ver detalles">👁️</button>
                        <button className="table-accion-btn" title="Editar">✏️</button>
                        <button className="table-accion-btn" title="Más opciones">⋯</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cards de Información Adicional */}
        <div className="info-cards-grid">
          <div className="info-card inventario-card">
            <div className="info-card-header">
              <span className="info-card-icon">📦</span>
              <h4>Inventario Crítico</h4>
              <button className="info-card-btn">Ver todos</button>
            </div>
            <div className="info-card-content">
              {inventario.slice(0, 5).map((item, index) => (
                <div key={index} className="inventario-item">
                  <span className="inventario-nombre">{item.nombre}</span>
                  <div className="inventario-progress">
                    <div className="inventario-bar">
                      <div 
                        className={`inventario-fill ${item.estado}`} 
                        style={{ width: `${item.cantidad}%` }}
                      ></div>
                    </div>
                    <span className={`inventario-valor ${item.estado}`}>{item.cantidad}{item.unidad}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="info-card personal-card">
            <div className="info-card-header">
              <span className="info-card-icon">👥</span>
              <h4>Personal Activo</h4>
              <button className="info-card-btn">Ver todos</button>
            </div>
            <div className="info-card-content">
              <div className="personal-stats">
                <div className="personal-stat">
                  <span className="stat-label">Producción</span>
                  <span className="stat-value">{personal.produccion}</span>
                </div>
                <div className="personal-stat">
                  <span className="stat-label">Calidad</span>
                  <span className="stat-value">{personal.calidad}</span>
                </div>
                <div className="personal-stat">
                  <span className="stat-label">Mantenimiento</span>
                  <span className="stat-value">{personal.mantenimiento}</span>
                </div>
                <div className="personal-stat">
                  <span className="stat-label">Planificación</span>
                  <span className="stat-value">{personal.planificacion}</span>
                </div>
                <div className="personal-stat">
                  <span className="stat-label">Administración</span>
                  <span className="stat-value">{personal.administracion}</span>
                </div>
              </div>
              <div className="personal-total">
                <span className="total-label">Total</span>
                <span className="total-valor">
                  {Object.values(personal).reduce((a, b) => a + b, 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="info-card metricas-card">
            <div className="info-card-header">
              <span className="info-card-icon">📊</span>
              <h4>Métricas Clave</h4>
            </div>
            <div className="info-card-content">
              <div className="metricas-grid">
                <div className="metrica-item">
                  <span className="metrica-label">MTBF</span>
                  <span className="metrica-valor">245 h</span>
                </div>
                <div className="metrica-item">
                  <span className="metrica-label">MTTR</span>
                  <span className="metrica-valor">2.5 h</span>
                </div>
                <div className="metrica-item">
                  <span className="metrica-label">Takt Time</span>
                  <span className="metrica-valor">45 s</span>
                </div>
                <div className="metrica-item">
                  <span className="metrica-label">Throughput</span>
                  <span className="metrica-valor">120/h</span>
                </div>
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
          <span className="last-update">
            <span className="update-icon">🕒</span>
            {formatTime(currentTime)}
          </span>
          <span className="footer-separator">•</span>
          <span className="connection-status">
            <span className="connection-dot verde"></span>
            Tiempo real
          </span>
          <span className="footer-separator">•</span>
          <span className="server-status">
            <span className="server-dot verde"></span>
            Servidor OK
          </span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;