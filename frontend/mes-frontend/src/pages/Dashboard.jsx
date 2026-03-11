import React, { useState, useEffect, useRef } from 'react';
import './Dashboard.css';

// ============================================
// CONFIGURACIÓN WEBSOCKET
// ============================================
const WS_URL = 'wss://glowing-lamp-r47wvpq4574fxv7j-8080.app.github.dev';

const DashboardProduccion = () => {
  // ================ ESTADOS PRINCIPALES ================
  const [fechaActual, setFechaActual] = useState(new Date());
  const [periodo, setPeriodo] = useState('dia');
  const [vista, setVista] = useState('general');
  const [menuLateral, setMenuLateral] = useState(true);
  const [temaOscuro, setTemaOscuro] = useState(false);
  
  // ================ ESTADOS DE CONEXIÓN ================
  const [conectado, setConectado] = useState(false);
  const [lotes, setLotes] = useState([]);
  const [ultimoMovimiento, setUltimoMovimiento] = useState(null);
  const wsRef = useRef(null);

  // ================ DATOS EN TIEMPO REAL (INICIALIZADOS EN 0) ================
  const [produccionHora, setProduccionHora] = useState(
    Array.from({ length: 24 }, (_, i) => ({
      hora: `${String(i).padStart(2, '0')}:00`,
      meta: 0,
      real: 0,
      eficiencia: 0,
      turno: i < 6 ? 'C' : i < 14 ? 'A' : i < 22 ? 'B' : 'C'
    }))
  );

  const [produccionDiaria, setProduccionDiaria] = useState([
    { dia: 'Lunes', fecha: new Date().toLocaleDateString(), meta: 0, real: 0, eficiencia: 0, turnos: 0 },
    { dia: 'Martes', fecha: new Date().toLocaleDateString(), meta: 0, real: 0, eficiencia: 0, turnos: 0 },
    { dia: 'Miércoles', fecha: new Date().toLocaleDateString(), meta: 0, real: 0, eficiencia: 0, turnos: 0 },
    { dia: 'Jueves', fecha: new Date().toLocaleDateString(), meta: 0, real: 0, eficiencia: 0, turnos: 0 },
    { dia: 'Viernes', fecha: new Date().toLocaleDateString(), meta: 0, real: 0, eficiencia: 0, turnos: 0 },
    { dia: 'Sábado', fecha: new Date().toLocaleDateString(), meta: 0, real: 0, eficiencia: 0, turnos: 0 },
    { dia: 'Domingo', fecha: new Date().toLocaleDateString(), meta: 0, real: 0, eficiencia: 0, turnos: 0 }
  ]);

  const [produccionSemanal, setProduccionSemanal] = useState([
    { semana: 'Semana Actual', fecha: ' - ', meta: 0, real: 0, eficiencia: 0, avance: 0 },
    { semana: 'Semana Anterior', fecha: ' - ', meta: 0, real: 0, eficiencia: 0, avance: 0 }
  ]);

  const [produccionMensual, setProduccionMensual] = useState([
    { mes: 'Enero', año: 2026, meta: 0, real: 0, eficiencia: 0, cumplimiento: 0 },
    { mes: 'Febrero', año: 2026, meta: 0, real: 0, eficiencia: 0, cumplimiento: 0 },
    { mes: 'Marzo', año: 2026, meta: 0, real: 0, eficiencia: 0, cumplimiento: 0 },
    { mes: 'Abril', año: 2026, meta: 0, real: 0, eficiencia: 0, cumplimiento: 0 }
  ]);

  // ================ MÁQUINAS Y LÍNEAS ================
  const [maquinas, setMaquinas] = useState([]);

  // ================ ÓRDENES DE PRODUCCIÓN ================
  const [ordenes, setOrdenes] = useState([]);

  // ================ PERSONAL Y TURNOS ================
  const [personal, setPersonal] = useState({
    total: 0,
    presentes: 0,
    ausentes: 0,
    vacaciones: 0,
    turnoA: 0,
    turnoB: 0,
    turnoC: 0,
    eficienciaGeneral: 0,
    productividad: 0,
    satisfaccion: 0,
    capacitacion: 0
  });

  const [turnos, setTurnos] = useState([
    { turno: 'A', horario: '06:00 - 14:00', personal: 0, produccion: 0, eficiencia: 0, meta: 0, supervisor: 'Pendiente' },
    { turno: 'B', horario: '14:00 - 22:00', personal: 0, produccion: 0, eficiencia: 0, meta: 0, supervisor: 'Pendiente' },
    { turno: 'C', horario: '22:00 - 06:00', personal: 0, produccion: 0, eficiencia: 0, meta: 0, supervisor: 'Pendiente' }
  ]);

  // ================ CALIDAD ================
  const [calidad, setCalidad] = useState({
    tasaAprobacion: 0,
    rechazos: 0,
    reprocesos: 0,
    scrap: 0,
    inspecciones: 0,
    quejasCliente: 0,
    devoluciones: 0
  });

  const [defectos, setDefectos] = useState([
    { tipo: 'Impresión', cantidad: 0, porcentaje: 0, tendencia: 'stable' },
    { tipo: 'Corte', cantidad: 0, porcentaje: 0, tendencia: 'stable' },
    { tipo: 'Color', cantidad: 0, porcentaje: 0, tendencia: 'stable' },
    { tipo: 'Acabado', cantidad: 0, porcentaje: 0, tendencia: 'stable' }
  ]);

  // ================ INVENTARIO ================
  const [inventario, setInventario] = useState({
    materiaPrima: 0,
    productoTerminado: 0,
    insumos: 0,
    criticidad: 0
  });

  // ================ CONEXIÓN WEBSOCKET MEJORADA ================
  useEffect(() => {
    console.log('🔌 Dashboard conectando...');
    
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    
    ws.onopen = () => {
      console.log('✅ Dashboard conectado');
      setConectado(true);
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📦 Dashboard recibió:', data.type);
        
        if (data.type === 'INIT' || data.type === 'ACTUALIZACION') {
          const lotesData = data.data.lotes || [];
          setLotes(lotesData);
          
          if (data.data.ultimoMovimiento) {
            setUltimoMovimiento(data.data.ultimoMovimiento);
          }
          
          // Calcular producción basada en lotes
          calcularProduccionDesdeLotes(lotesData);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('❌ Error WebSocket:', error);
      setConectado(false);
    };
    
    ws.onclose = () => {
      console.log('❌ Dashboard desconectado');
      setConectado(false);
    };
    
    return () => ws.close();
  }, []);

  // ================ CALCULAR PRODUCCIÓN DESDE LOTES ================
  const calcularProduccionDesdeLotes = (lotesData) => {
    if (!lotesData || lotesData.length === 0) return;

    // Calcular máquinas basadas en lotes reales
    const maquinasReales = lotesData
      .filter(l => l.maquinaId)
      .reduce((acc, lote) => {
        if (!acc[lote.maquinaId]) {
          acc[lote.maquinaId] = {
            id: lote.maquinaId,
            nombre: lote.maquinaAsignada || `Máquina ${lote.maquinaId}`,
            linea: lote.areaActual || 'Producción',
            estado: lote.estado === 'en_proceso' ? 'produccion' : 'disponible',
            operador: lote.responsable || 'Pendiente',
            eficiencia: lote.progreso || 0,
            produccion: lote.cantidadProcesada || 0,
            meta: lote.cantidad || 1000,
            uptime: Math.floor(Math.random() * 10) + 90,
            alertas: 0,
            temperatura: Math.floor(Math.random() * 20) + 30,
            velocidad: Math.floor(Math.random() * 30) + 60,
            tiempoRestante: '0h',
            orden: lote.codigo || 'N/A'
          };
        }
        return acc;
      }, {});

    setMaquinas(Object.values(maquinasReales));

    // Calcular órdenes desde lotes reales
    const ordenesReales = lotesData.map((lote, index) => ({
      id: lote.codigo || `ORD-${String(index + 1).padStart(3, '0')}`,
      cliente: lote.cliente || 'Pendiente',
      producto: lote.producto || 'Producto',
      cantidad: lote.cantidad || 0,
      producido: lote.cantidadProcesada || 0,
      pendiente: (lote.cantidad || 0) - (lote.cantidadProcesada || 0),
      avance: lote.progreso || 0,
      linea: lote.areaActual || 'Recepción',
      fechaEntrega: lote.fechaEntrega || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      prioridad: lote.prioridad || 'media',
      estado: lote.estado || 'pendiente'
    }));
    setOrdenes(ordenesReales);

    // Calcular producción por hora basada en lotes
    const horaActual = new Date().getHours();
    const produccionPorHora = Array.from({ length: 24 }, (_, i) => {
      const lotesHora = lotesData.filter(l => {
        const horaLote = l.horaInicio ? parseInt(l.horaInicio.split(':')[0]) : i;
        return horaLote === i;
      });
      
      const totalReal = lotesHora.reduce((acc, l) => acc + (l.cantidadProcesada || 0), 0);
      const totalMeta = lotesHora.reduce((acc, l) => acc + (l.cantidad || 450), 0);
      
      return {
        hora: `${String(i).padStart(2, '0')}:00`,
        meta: totalMeta || 0,
        real: totalReal,
        eficiencia: totalMeta > 0 ? Math.round((totalReal / totalMeta) * 100) : 0,
        turno: i < 6 ? 'C' : i < 14 ? 'A' : i < 22 ? 'B' : 'C'
      };
    });
    setProduccionHora(produccionPorHora);

    // Calcular producción diaria
    const totalHoy = produccionHora.reduce((acc, p) => acc + p.real, 0);
    setProduccionDiaria(prev => prev.map((d, i) => {
      const hoy = new Date().getDay();
      if (i === (hoy === 0 ? 6 : hoy - 1)) {
        return { ...d, real: totalHoy, meta: lotesData.length * 450, eficiencia: totalHoy > 0 ? Math.round((totalHoy / (lotesData.length * 450)) * 100) : 0 };
      }
      return d;
    }));

    // Calcular personal basado en responsables únicos
    const responsables = [...new Set(lotesData.map(l => l.responsable).filter(Boolean))];
    setPersonal({
      total: responsables.length || 0,
      presentes: Math.floor(responsables.length * 0.8) || 0,
      ausentes: Math.floor(responsables.length * 0.2) || 0,
      vacaciones: 0,
      turnoA: Math.floor(responsables.length * 0.4) || 0,
      turnoB: Math.floor(responsables.length * 0.35) || 0,
      turnoC: Math.floor(responsables.length * 0.25) || 0,
      eficienciaGeneral: Math.round(lotesData.reduce((acc, l) => acc + (l.progreso || 0), 0) / (lotesData.length || 1)) || 0,
      productividad: Math.floor(Math.random() * 10) + 80,
      satisfaccion: Math.floor(Math.random() * 10) + 75,
      capacitacion: Math.floor(Math.random() * 10) + 70
    });

    // Calcular turnos
    const turnosCalculados = {
      A: lotesData.filter(l => l.turno === 'A').reduce((acc, l) => acc + (l.cantidadProcesada || 0), 0),
      B: lotesData.filter(l => l.turno === 'B').reduce((acc, l) => acc + (l.cantidadProcesada || 0), 0),
      C: lotesData.filter(l => l.turno === 'C').reduce((acc, l) => acc + (l.cantidadProcesada || 0), 0)
    };

    setTurnos([
      { turno: 'A', horario: '06:00 - 14:00', personal: Math.floor(responsables.length * 0.4) || 0, produccion: turnosCalculados.A, eficiencia: Math.round((turnosCalculados.A / (lotesData.length * 150)) * 100) || 0, meta: lotesData.length * 150, supervisor: 'Carlos Ruiz' },
      { turno: 'B', horario: '14:00 - 22:00', personal: Math.floor(responsables.length * 0.35) || 0, produccion: turnosCalculados.B, eficiencia: Math.round((turnosCalculados.B / (lotesData.length * 150)) * 100) || 0, meta: lotesData.length * 150, supervisor: 'María López' },
      { turno: 'C', horario: '22:00 - 06:00', personal: Math.floor(responsables.length * 0.25) || 0, produccion: turnosCalculados.C, eficiencia: Math.round((turnosCalculados.C / (lotesData.length * 150)) * 100) || 0, meta: lotesData.length * 150, supervisor: 'Juan Pérez' }
    ]);

    // Calcular calidad
    const totalRechazos = lotesData.reduce((acc, l) => acc + (l.rechazadas || 0), 0);
    const totalMuestras = lotesData.reduce((acc, l) => acc + (l.cantidad || 0), 0);
    
    setCalidad({
      tasaAprobacion: totalMuestras > 0 ? Math.round(((totalMuestras - totalRechazos) / totalMuestras) * 100) : 0,
      rechazos: totalRechazos,
      reprocesos: Math.floor(totalRechazos * 0.3),
      scrap: totalMuestras > 0 ? Math.round((totalRechazos / totalMuestras) * 100) : 0,
      inspecciones: totalMuestras,
      quejasCliente: 0,
      devoluciones: 0
    });

    // Calcular defectos
    const totalTono = lotesData.reduce((acc, l) => acc + (l.tipoRechazo?.tono || 0), 0);
    const totalTextura = lotesData.reduce((acc, l) => acc + (l.tipoRechazo?.textura || 0), 0);
    const totalColor = lotesData.reduce((acc, l) => acc + (l.tipoRechazo?.color || 0), 0);
    const totalDimension = lotesData.reduce((acc, l) => acc + (l.tipoRechazo?.dimension || 0), 0);
    
    setDefectos([
      { tipo: 'Impresión', cantidad: totalTono, porcentaje: totalRechazos > 0 ? Math.round((totalTono / totalRechazos) * 100) : 0, tendencia: 'stable' },
      { tipo: 'Corte', cantidad: totalTextura, porcentaje: totalRechazos > 0 ? Math.round((totalTextura / totalRechazos) * 100) : 0, tendencia: 'stable' },
      { tipo: 'Color', cantidad: totalColor, porcentaje: totalRechazos > 0 ? Math.round((totalColor / totalRechazos) * 100) : 0, tendencia: 'stable' },
      { tipo: 'Acabado', cantidad: totalDimension, porcentaje: totalRechazos > 0 ? Math.round((totalDimension / totalRechazos) * 100) : 0, tendencia: 'stable' }
    ]);

    // Calcular inventario
    setInventario({
      materiaPrima: Math.floor(Math.random() * 30) + 60,
      productoTerminado: Math.floor(Math.random() * 30) + 50,
      insumos: Math.floor(Math.random() * 20) + 70,
      criticidad: Math.floor(Math.random() * 10) + 10
    });
  };

  // ================ SIMULACIÓN TIEMPO REAL ================
  useEffect(() => {
    const interval = setInterval(() => {
      setFechaActual(new Date());
      
      // Actualizar producción por hora
      setProduccionHora(prev => {
        const nuevas = [...prev];
        const horaActual = new Date().getHours();
        
        nuevas[horaActual] = {
          ...nuevas[horaActual],
          real: Math.min(nuevas[horaActual].real + Math.floor(Math.random() * 3) + 1, nuevas[horaActual].meta * 1.15),
          eficiencia: Math.round((nuevas[horaActual].real / nuevas[horaActual].meta) * 100) || 0
        };
        
        return nuevas;
      });

      // Actualizar máquinas
      setMaquinas(prev => prev.map(m => {
        if (m.estado === 'produccion') {
          const nuevoProducido = m.produccion + Math.floor(Math.random() * 2);
          return {
            ...m,
            produccion: nuevoProducido,
            eficiencia: Math.round((nuevoProducido / m.meta) * 100) || 0,
            temperatura: m.temperatura + (Math.random() * 0.5 - 0.25)
          };
        }
        return m;
      }));

    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // ================ FUNCIONES AUXILIARES ================
  const formatNumber = (num) => {
    return new Intl.NumberFormat('es-MX').format(num || 0);
  };

  const formatPercent = (num) => {
    return `${num || 0}%`;
  };

  const getStatusColor = (estado) => {
    switch(estado) {
      case 'produccion': return '#10b981';
      case 'mantenimiento': return '#f59e0b';
      case 'inactiva': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getEficienciaColor = (eficiencia) => {
    if (eficiencia >= 100) return '#10b981';
    if (eficiencia >= 90) return '#3b82f6';
    if (eficiencia >= 80) return '#f59e0b';
    return '#ef4444';
  };

  // ================ RENDER GRÁFICAS ================
  const renderGraficoProduccionHora = () => {
    const maxValor = Math.max(...produccionHora.map(p => p.meta), 1) * 1.2;
    const datosVisibles = produccionHora.slice(0, 12);

    return (
      <div className="grafico-barras-container">
        {datosVisibles.map((item, index) => (
          <div key={index} className="barra-grupo">
            <div className="barra-meta" style={{ height: `${(item.meta / maxValor) * 180}px` }}>
              <span className="barra-meta-valor">{item.meta}</span>
            </div>
            <div 
              className="barra-real" 
              style={{ 
                height: `${(item.real / maxValor) * 180}px`,
                backgroundColor: getEficienciaColor(item.eficiencia)
              }}
            >
              <span className="barra-real-valor">{item.real}</span>
            </div>
            <div className="barra-etiqueta">
              <span>{item.hora}</span>
              <span className="barra-turno">{item.turno}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`dashboard-maquila ${temaOscuro ? 'tema-oscuro' : ''}`}>
      
      {/* ========== HEADER PRINCIPAL ========== */}
      <header className="dashboard-header">
        <div className="header-left">
          <button className="menu-toggle" onClick={() => setMenuLateral(!menuLateral)}>
            <span className="menu-icon">☰</span>
          </button>
          
          <div className="logo-area">
            <div className="logo-icon">TEGRA</div>
            <div className="logo-texto">
              <h1>Manufacturing Suite</h1>
            </div>
          </div>
        </div>

        {/* INDICADOR DE CONEXIÓN */}
        <div className={`connection-status ${conectado ? 'connected' : 'disconnected'}`}>
          <span className="status-dot"></span>
          <span>{conectado ? 'Conectado' : 'Sin conexión'}</span>
        </div>

        {/* FECHA CENTRADA */}
        <div className="fecha-display">
          <span className="fecha-icon">📅</span>
          <div className="fecha-info">
            <span className="fecha-dia">
              {fechaActual.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }).replace(/^\w/, c => c.toUpperCase())}
            </span>
            <span className="fecha-hora">
              {fechaActual.toLocaleTimeString()}
            </span>
          </div>
        </div>

        <div className="header-right">
          <div className="usuario-info">
            <div className="usuario-avatar">OP</div>
            <div className="usuario-detalles">
              <span className="usuario-nombre">Operador</span>
              <span className="usuario-rol">Dashboard Demo</span>
            </div>
          </div>
        </div>
      </header>

      {/* NOTIFICACIÓN DE ÚLTIMO MOVIMIENTO */}
      {ultimoMovimiento && (
        <div className="movimiento-notificacion">
          🔄 {ultimoMovimiento.loteId} → {ultimoMovimiento.area}
        </div>
      )}

      {/* ========== MENÚ LATERAL ========== */}
      <aside className={`menu-lateral ${menuLateral ? 'abierto' : ''}`}>
        <nav className="menu-nav">
          <div className="menu-seccion">
            <h4>PRINCIPAL</h4>
            <button className={`menu-item ${vista === 'general' ? 'active' : ''}`} onClick={() => setVista('general')}>
              <span className="item-icon">📊</span>
              <span>Dashboard General</span>
            </button>
            <button className="menu-item">
              <span className="item-icon">⚙️</span>
              <span>Máquinas</span>
              <span className="item-badge">{maquinas.length}</span>
            </button>
            <button className="menu-item">
              <span className="item-icon">📋</span>
              <span>Órdenes</span>
              <span className="item-badge">{ordenes.length}</span>
            </button>
            <button className="menu-item">
              <span className="item-icon">👥</span>
              <span>Personal</span>
              <span className="item-badge">{personal.total}</span>
            </button>
          </div>

          <div className="menu-seccion">
            <h4>PRODUCCIÓN</h4>
            <button className="menu-item">
              <span className="item-icon">📈</span>
              <span>Plan de Producción</span>
            </button>
            <button className="menu-item">
              <span className="item-icon">🔄</span>
              <span>Líneas de Ensamble</span>
            </button>
            <button className="menu-item">
              <span className="item-icon">✅</span>
              <span>Control de Calidad</span>
            </button>
          </div>

          <div className="menu-seccion">
            <h4>ANÁLISIS</h4>
            <button className="menu-item">
              <span className="item-icon">📊</span>
              <span>Eficiencia OEE</span>
            </button>
            <button className="menu-item">
              <span className="item-icon">📑</span>
              <span>Reportes</span>
            </button>
          </div>
        </nav>

        <div className="menu-footer">
          <div className="sistema-status">
            <span className={`status-dot ${conectado ? 'verde' : 'rojo'}`}></span>
            <span>{conectado ? 'Conectado' : 'Desconectado'}</span>
          </div>
          <div className="sistema-info">
            <span>Demo v1.0</span>
            <span>•</span>
            <span>Producción</span>
          </div>
        </div>
      </aside>

      {/* ========== CONTENIDO PRINCIPAL ========== */}
      <main className={`contenido-principal ${menuLateral ? 'con-menu' : ''}`}>
        
        {/* ========== SELECTOR DE PERÍODO ========== */}
        <div className="periodo-selector">
          <button className={`periodo-btn ${periodo === 'dia' ? 'active' : ''}`} onClick={() => setPeriodo('dia')}>
            DÍA
          </button>
          <button className={`periodo-btn ${periodo === 'semana' ? 'active' : ''}`} onClick={() => setPeriodo('semana')}>
            SEMANA
          </button>
          <button className={`periodo-btn ${periodo === 'mes' ? 'active' : ''}`} onClick={() => setPeriodo('mes')}>
            MES
          </button>
          
          <div className="periodo-acciones">
            <button className="accion-btn" title="Exportar datos">
              📥 Exportar
            </button>
            <button className="accion-btn" title="Actualizar">
              🔄 Actualizar
            </button>
          </div>
        </div>

        {/* ========== KPI PRINCIPALES ========== */}
        <div className="kpi-grid">
          <div className="kpi-card produccion">
            <div className="kpi-icono">📊</div>
            <div className="kpi-contenido">
              <span className="kpi-valor">{formatNumber(produccionHora.reduce((acc, p) => acc + p.real, 0))}</span>
              <span className="kpi-etiqueta">Producción Hoy</span>
              <div className="kpi-tendencia positiva">
                <span>↑ 0%</span>
                <span>vs ayer</span>
              </div>
            </div>
          </div>

          <div className="kpi-card oee">
            <div className="kpi-icono">⚡</div>
            <div className="kpi-contenido">
              <span className="kpi-valor">{personal.eficienciaGeneral}%</span>
              <span className="kpi-etiqueta">OEE Global</span>
              <div className="kpi-tendencia positiva">
                <span>↑ 0%</span>
                <span>vs ayer</span>
              </div>
            </div>
          </div>

          <div className="kpi-card maquinas">
            <div className="kpi-icono">⚙️</div>
            <div className="kpi-contenido">
              <span className="kpi-valor">{maquinas.filter(m => m.estado === 'produccion').length}/{maquinas.length}</span>
              <span className="kpi-etiqueta">Máquinas Activas</span>
            </div>
          </div>

          <div className="kpi-card personal">
            <div className="kpi-icono">👥</div>
            <div className="kpi-contenido">
              <span className="kpi-valor">{personal.presentes}/{personal.total}</span>
              <span className="kpi-etiqueta">Personal Activo</span>
            </div>
          </div>

          <div className="kpi-card calidad">
            <div className="kpi-icono">✅</div>
            <div className="kpi-contenido">
              <span className="kpi-valor">{calidad.tasaAprobacion}%</span>
              <span className="kpi-etiqueta">Calidad</span>
            </div>
          </div>
        </div>

        {/* ========== GRÁFICO PRINCIPAL ========== */}
        <div className="grafico-principal">
          <div className="grafico-header">
            <div className="grafico-titulo">
              <h3>Producción por Hora - Tiempo Real</h3>
              <div className="grafico-leyenda">
                <span className="leyenda-item">
                  <span className="leyenda-color real"></span>
                  Producción Real
                </span>
                <span className="leyenda-item">
                  <span className="leyenda-color meta"></span>
                  Meta (450/h)
                </span>
              </div>
            </div>
          </div>
          <div className="grafico-body">
            {renderGraficoProduccionHora()}
          </div>
          <div className="grafico-footer">
            <div className="total-produccion">
              <span>Total hoy:</span>
              <strong>{formatNumber(produccionHora.reduce((acc, p) => acc + p.real, 0))} unidades</strong>
            </div>
          </div>
        </div>

        {/* ========== FILA DE GRÁFICOS SECUNDARIOS ========== */}
        <div className="graficos-secundarios">
          
          {/* Producción por Día */}
          <div className="grafico-card">
            <div className="card-header">
              <h4>Producción por Día</h4>
            </div>
            <div className="card-body">
              {produccionDiaria.map((dia, index) => (
                <div key={index} className="dia-item">
                  <div className="dia-info">
                    <span className="dia-nombre">{dia.dia}</span>
                  </div>
                  <div className="dia-barra-container">
                    <div 
                      className="dia-barra" 
                      style={{ 
                        width: `${(dia.real / (dia.meta || 1)) * 100}%`,
                        backgroundColor: getEficienciaColor(dia.eficiencia)
                      }}
                    ></div>
                  </div>
                  <div className="dia-valores">
                    <span className="dia-real">{formatNumber(dia.real)}</span>
                    <span className="dia-eficiencia" style={{ color: getEficienciaColor(dia.eficiencia) }}>
                      {dia.eficiencia}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Estado de Máquinas */}
          <div className="grafico-card">
            <div className="card-header">
              <h4>Máquinas en Tiempo Real</h4>
            </div>
            <div className="card-body maquinas-lista">
              {maquinas.slice(0, 4).map(maquina => (
                <div key={maquina.id} className="maquina-item-lista">
                  <div className="maquina-info">
                    <div className="maquina-nombre">
                      <span className={`maquina-estado-dot ${maquina.estado}`}></span>
                      <span>{maquina.nombre}</span>
                    </div>
                  </div>
                  <div className="maquina-stats">
                    <div className="maquina-eficiencia">
                      <div className="eficiencia-barra">
                        <div 
                          className="eficiencia-fill" 
                          style={{ 
                            width: `${maquina.eficiencia}%`,
                            backgroundColor: getEficienciaColor(maquina.eficiencia)
                          }}
                        ></div>
                      </div>
                      <span className="eficiencia-valor">{maquina.eficiencia}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rendimiento por Turno */}
          <div className="grafico-card">
            <div className="card-header">
              <h4>Rendimiento por Turno</h4>
            </div>
            <div className="card-body">
              {turnos.map((turno, index) => (
                <div key={index} className="turno-item">
                  <div className="turno-header">
                    <span className={`turno-badge ${turno.turno}`}>Turno {turno.turno}</span>
                  </div>
                  <div className="turno-stats">
                    <div className="turno-stat">
                      <span className="stat-label">Personal</span>
                      <span className="stat-valor">{turno.personal}</span>
                    </div>
                    <div className="turno-stat">
                      <span className="stat-label">Producción</span>
                      <span className="stat-valor">{formatNumber(turno.produccion)}</span>
                    </div>
                    <div className="turno-stat">
                      <span className="stat-label">Eficiencia</span>
                      <span className="stat-valor" style={{ color: getEficienciaColor(turno.eficiencia) }}>
                        {turno.eficiencia}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calidad */}
          <div className="grafico-card">
            <div className="card-header">
              <h4>Control de Calidad</h4>
            </div>
            <div className="card-body">
              <div className="calidad-grid">
                <div className="calidad-item">
                  <span className="calidad-label">Aprobación</span>
                  <span className="calidad-valor">{calidad.tasaAprobacion}%</span>
                </div>
                <div className="calidad-item">
                  <span className="calidad-label">Rechazos</span>
                  <span className="calidad-valor">{calidad.rechazos}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========== TABLA DE ÓRDENES ========== */}
        <div className="ordenes-table-container">
          <div className="table-header">
            <h3>Órdenes de Producción</h3>
          </div>
          
          <div className="table-responsive">
            <table className="ordenes-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Avance</th>
                  <th>Línea</th>
                  <th>Prioridad</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {ordenes.slice(0, 5).map(orden => (
                  <tr key={orden.id}>
                    <td className="orden-id">{orden.id}</td>
                    <td>{orden.cliente}</td>
                    <td>{orden.producto}</td>
                    <td>{formatNumber(orden.cantidad)}</td>
                    <td>
                      <div className="table-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ 
                              width: `${orden.avance}%`,
                              backgroundColor: getEficienciaColor(orden.avance)
                            }}
                          ></div>
                        </div>
                        <span className="progress-text">{orden.avance}%</span>
                      </div>
                    </td>
                    <td>{orden.linea}</td>
                    <td>
                      <span className={`prioridad-badge ${orden.prioridad}`}>
                        {orden.prioridad}
                      </span>
                    </td>
                    <td>
                      <span className={`estado-badge ${orden.estado}`}>
                        {orden.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========== FOOTER ========== */}
        <footer className="dashboard-footer">
          <div className="footer-left">
            <span>© 2026 TEGRA Manufacturing - Demo</span>
          </div>
          <div className="footer-right">
            <span className="tiempo-real">
              <span className={`punto-${conectado ? 'verde' : 'rojo'}`}></span>
              {conectado ? 'Tiempo real' : 'Modo demo'} • {fechaActual.toLocaleTimeString()}
            </span>
          </div>
        </footer>
      </main>

      <style>{`
        .connection-status {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 15px;
          border-radius: 30px;
          font-size: 0.85rem;
          font-weight: 600;
          margin: 0 15px;
        }
        
        .connection-status.connected {
          background: #d4edda;
          color: #155724;
        }
        
        .connection-status.disconnected {
          background: #f8d7da;
          color: #721c24;
        }
        
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }
        
        .status-dot.verde {
          background: #28a745;
          box-shadow: 0 0 10px #28a745;
          animation: pulse 2s infinite;
        }
        
        .status-dot.rojo {
          background: #dc3545;
        }
        
        .punto-verde {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #28a745;
          display: inline-block;
          margin-right: 8px;
          animation: pulse 2s infinite;
        }
        
        .punto-rojo {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #dc3545;
          display: inline-block;
          margin-right: 8px;
        }

        .movimiento-notificacion {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: #3b82f6;
          color: white;
          padding: 12px 20px;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          z-index: 10000;
          animation: slideUp 0.3s ease;
          font-weight: 500;
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }

        .fecha-display {
          display: flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 8px 20px;
          border-radius: 40px;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .fecha-icon {
          font-size: 1.2rem;
        }

        .fecha-info {
          display: flex;
          flex-direction: column;
        }

        .fecha-dia {
          font-size: 0.85rem;
          font-weight: 500;
          opacity: 0.9;
        }

        .fecha-hora {
          font-size: 1.1rem;
          font-weight: 700;
          font-family: 'Courier New', monospace;
        }
      `}</style>
    </div>
  );
};

export default DashboardProduccion;