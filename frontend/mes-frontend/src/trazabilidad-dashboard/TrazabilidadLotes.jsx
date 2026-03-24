import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './TrazabilidadLotes.css';
import TrackingLote from './TrackingLote';
import { useProduccion } from '../context/ProduccionContext';

// ============================================
// CONFIGURACIÓN WEBSOCKET
// ============================================
const WS_URL = 'https://miniature-adventure-v6q4r64gqq7qfr67-8080.app.github.dev/';

const TrazabilidadLotes = () => {
  // ===== CONTEXTO GLOBAL =====
  const { 
    lotes: lotesGlobal,
    areas: areasGlobal,
    ultimoMovimiento: ultimoMovimientoGlobal,
    conectado: wsConectado,
    procesarEscaneo: procesarEscaneoGlobal,
    agregarEvento: agregarEventoGlobal
  } = useProduccion();

  // ===== ESTADOS PRINCIPALES =====
  const [lotes, setLotes] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loteSeleccionado, setLoteSeleccionado] = useState(null);
  const [codigoEscaneado, setCodigoEscaneado] = useState('');
  const [mensajeEscaner, setMensajeEscaner] = useState('📡 Esperando escanear ÁREA (9001-9012)...');
  const [tipoMensaje, setTipoMensaje] = useState('info');
  const [animacionActiva, setAnimacionActiva] = useState(false);
  const [modoEscaner, setModoEscaner] = useState(true);
  const [eventos, setEventos] = useState([]);
  const [ultimoEscaneo, setUltimoEscaneo] = useState(null);
  
  // ===== COLA DE ESCANEO (PRIMERO ÁREA, LUEGO LOTE) =====
  const [colaEscaneos, setColaEscaneos] = useState({ area: null, lote: null });
  
  // ===== ESTADOS UI/UX =====
  const [scannerMinimizado, setScannerMinimizado] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [ultimaPosicionScroll, setUltimaPosicionScroll] = useState(0);
  const [umbralScroll, setUmbralScroll] = useState(100);
  const [vistaLotes, setVistaLotes] = useState('activos');
  const [filtroArea, setFiltroArea] = useState('todas');
  const [modoOscuro, setModoOscuro] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [vistaCompacta, setVistaCompacta] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtrosAvanzados, setFiltrosAvanzados] = useState({
    prioridad: 'todas',
    cliente: '',
    producto: ''
  });
  
  // ===== ESTADOS DE CONEXIÓN =====
  const [conectado, setConectado] = useState(false);
  const wsRef = useRef(null);
  const inputRef = useRef(null);
  const notificacionesRef = useRef(null);
  const mainContentRef = useRef(null);
  
  // ===== NOTIFICACIONES =====
  const [notificaciones, setNotificaciones] = useState([]);
  
  // ===== ESTADÍSTICAS =====
  const [statsTiempoReal, setStatsTiempoReal] = useState({
    wip: 0,
    eficiencia: 0,
    tiempoPromedio: 0,
    alertasActivas: 0
  });

  // ============================================
  // CONFIGURACIÓN DE ÁREAS
  // ============================================
  const areasProduccion = useMemo(() => [
    { id: 'AREA-001', codigo: '9001', nombre: 'Recepción', icono: '📦', color: '#3b82f6', orden: 1, capacidad: 50 },
    { id: 'AREA-002', codigo: '9002', nombre: 'Diseño', icono: '🎨', color: '#8b5cf6', orden: 2, capacidad: 25 },
    { id: 'AREA-003', codigo: '9003', nombre: 'Plotter', icono: '🖨️', color: '#ec4899', orden: 3, capacidad: 15 },
    { id: 'AREA-004', codigo: '9004', nombre: 'Corte', icono: '✂️', color: '#f59e0b', orden: 4, capacidad: 20 },
    { id: 'AREA-005', codigo: '9005', nombre: 'Sublimado', icono: '🔥', color: '#10b981', orden: 5, capacidad: 18 },
    { id: 'AREA-006', codigo: '9006', nombre: 'Colorimetría', icono: '🎯', color: '#6366f1', orden: 6, capacidad: 12 },
    { id: 'AREA-007', codigo: '9007', nombre: 'Preparacion', icono: '⚙️', color: '#14b8a6', orden: 7, capacidad: 30 },
    { id: 'AREA-008', codigo: '9008', nombre: 'Calidad', icono: '✅', color: '#a855f7', orden: 8, capacidad: 10 },
    { id: 'AREA-009', codigo: '9009', nombre: 'RH', icono: '👥', color: '#f43f5e', orden: 9, capacidad: 8 },
    { id: 'AREA-010', codigo: '9010', nombre: 'Logística', icono: '🚚', color: '#06b6d4', orden: 10, capacidad: 22 },
    { id: 'AREA-011', codigo: '9011', nombre: 'Almacén', icono: '🏢', color: '#d946ef', orden: 11, capacidad: 100 },
    { id: 'AREA-012', codigo: '9012', nombre: 'Incompleto', icono: '⚠️', color: '#f97316', orden: 12, capacidad: 15 }
  ], []);

  // ============================================
  // SINCronizar CON CONTEXTO GLOBAL
  // ============================================
  useEffect(() => {
    if (lotesGlobal && lotesGlobal.length > 0) {
      setLotes(lotesGlobal);
      if (!loteSeleccionado && lotesGlobal.length > 0) {
        const activo = lotesGlobal.find(l => l.estado !== 'completado');
        setLoteSeleccionado(activo || lotesGlobal[0]);
      }
    }
  }, [lotesGlobal]);

  useEffect(() => {
    if (areasGlobal && areasGlobal.length > 0) {
      setAreas(areasGlobal);
    } else {
      setAreas(areasProduccion);
    }
  }, [areasGlobal]);

  useEffect(() => {
    if (ultimoMovimientoGlobal) {
      agregarNotificacion(`🔄 ${ultimoMovimientoGlobal.lote} → ${ultimoMovimientoGlobal.area}`, 'info');
    }
  }, [ultimoMovimientoGlobal]);

  useEffect(() => {
    if (wsConectado !== undefined) {
      setConectado(wsConectado);
    }
  }, [wsConectado]);

  // ============================================
  // CONEXIÓN WEBSOCKET
  // ============================================
  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    
    ws.onopen = () => {
      setConectado(true);
      agregarNotificacion('✅ Conectado al servidor', 'exito');
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'ACTUALIZACION' && data.data.ultimoMovimiento) {
          setUltimoEscaneo(data.data.ultimoMovimiento);
          agregarNotificacion(`🔄 ${data.data.ultimoMovimiento.lote} → ${data.data.ultimoMovimiento.area}`, 'info');
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
  }, []);

  // ============================================
  // SCROLL Y UI
  // ============================================
  useEffect(() => {
    const handleScroll = () => {
      if (mainContentRef.current) {
        const scrollTop = mainContentRef.current.scrollTop;
        setShowScrollTop(scrollTop > 400);
        if (scrollTop > umbralScroll && scrollTop > ultimaPosicionScroll) {
          setScannerMinimizado(true);
        } else if (scrollTop < ultimaPosicionScroll - 10 && scrollTop < umbralScroll) {
          setScannerMinimizado(false);
        }
        setUltimaPosicionScroll(scrollTop);
      }
    };
    const currentRef = mainContentRef.current;
    if (currentRef) currentRef.addEventListener('scroll', handleScroll);
    return () => { if (currentRef) currentRef.removeEventListener('scroll', handleScroll); };
  }, [ultimaPosicionScroll, umbralScroll]);

  useEffect(() => {
    if (!scannerMinimizado && modoEscaner && inputRef.current) {
      inputRef.current.focus();
    }
  }, [scannerMinimizado, modoEscaner]);

  useEffect(() => {
    const modoGuardado = localStorage.getItem('modoOscuro') === 'true';
    setModoOscuro(modoGuardado);
  }, []);

  useEffect(() => {
    localStorage.setItem('modoOscuro', modoOscuro);
  }, [modoOscuro]);

  // ============================================
  // FUNCIONES AUXILIARES
  // ============================================
  const agregarNotificacion = (mensaje, tipo = 'info') => {
    const id = Date.now();
    setNotificaciones(prev => [...prev, { id, mensaje, tipo }]);
    setTimeout(() => {
      setNotificaciones(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const agregarEventoLocal = (tipo, mensaje, loteRef = '') => {
    const nuevoEvento = {
      id: Date.now() + Math.random(),
      tipo,
      mensaje,
      loteRef,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setEventos(prev => [nuevoEvento, ...prev.slice(0, 29)]);
  };

  const marcarNotificacionLeida = (id) => {
    setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
  };
  
  const marcarTodasLeidas = () => {
    setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
  };

  const scrollToTop = () => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      setScannerMinimizado(false);
    }
  };

  // ============================================
  // FUNCIÓN PRINCIPAL: PROCESAR ESCANEO
  // PRIMERO ÁREA, LUEGO LOTE
  // ============================================
  const procesarEscaneo = () => {
    const codigo = codigoEscaneado.trim().toUpperCase();
    if (!codigo) return;

    setAnimacionActiva(true);
    setTimeout(() => setAnimacionActiva(false), 500);
    setMensajeEscaner(`⏳ Procesando: ${codigo}...`);
    setTipoMensaje('info');

    // Si hay procesador global, usarlo
    if (procesarEscaneoGlobal) {
      procesarEscaneoGlobal(codigo);
      setTimeout(() => {
        setCodigoEscaneado('');
        setMensajeEscaner('📡 Esperando escanear ÁREA (9001-9012)...');
        setTipoMensaje('info');
      }, 1000);
      return;
    }

    // PROCESAMIENTO LOCAL
    // 1. VERIFICAR SI ES ÁREA (códigos 9001-9012)
    if (codigo.match(/^9\d{3}$/)) {
      const area = areas.find(a => a.codigo === codigo);
      if (area) {
        // Guardar área en cola
        setColaEscaneos({ area: area, lote: null });
        setMensajeEscaner(`✅ Área: ${area.nombre} seleccionada. AHORA escanea el LOTE para moverlo`);
        setTipoMensaje('success');
        agregarEventoLocal('area', `📍 Área seleccionada: ${area.nombre} [${area.codigo}] - Esperando lote`);
        if (navigator.vibrate) navigator.vibrate(30);
        setCodigoEscaneado('');
      } else {
        setMensajeEscaner(`❌ Área no encontrada: ${codigo}`);
        setTipoMensaje('error');
        setCodigoEscaneado('');
      }
      return;
    }

    // 2. ES UN LOTE - VERIFICAR QUE HAYA UN ÁREA EN COLA
    if (!colaEscaneos.area) {
      setMensajeEscaner(`⚠️ PRIMERO debes escanear un ÁREA (9001-9012) antes de escanear el lote`);
      setTipoMensaje('error');
      setAnimacionActiva(true);
      setTimeout(() => {
        setAnimacionActiva(false);
        setMensajeEscaner('📡 Escanea un ÁREA primero (9001-9012)...');
        setTipoMensaje('info');
      }, 2000);
      setCodigoEscaneado('');
      return;
    }

    // 3. PROCESAR LOTE (YA HAY ÁREA EN COLA)
    const area = colaEscaneos.area;
    const loteExistente = lotes.find(l => l.codigo === codigo || l.id === codigo);

    if (loteExistente) {
      setMensajeEscaner(`✅ Moviendo lote ${loteExistente.id} a ${area.nombre}...`);
      setTipoMensaje('success');
      agregarEventoLocal('lote', `📦 Lote escaneado: ${loteExistente.id} - Moviendo a ${area.nombre}`, loteExistente.id);
      setLoteSeleccionado(loteExistente);
      if (navigator.vibrate) navigator.vibrate(30);
      
      procesarMovimientoLocal(area, loteExistente);
      setColaEscaneos({ area: null, lote: null });
      setMensajeEscaner(`✅ ${loteExistente.id} movido a ${area.nombre}`);
      setTimeout(() => {
        setMensajeEscaner('📡 Escanea un ÁREA (9001-9012) para el próximo movimiento...');
        setTipoMensaje('info');
      }, 2000);
    } else {
      const nuevoLote = crearNuevoLoteLocal(codigo);
      setMensajeEscaner(`🆕 Nuevo lote: ${codigo} creado. Moviendo a ${area.nombre}...`);
      setTipoMensaje('success');
      procesarMovimientoLocal(area, nuevoLote);
      setColaEscaneos({ area: null, lote: null });
      setMensajeEscaner(`✅ ${nuevoLote.id} movido a ${area.nombre}`);
      setTimeout(() => {
        setMensajeEscaner('📡 Escanea un ÁREA (9001-9012) para el próximo movimiento...');
        setTipoMensaje('info');
      }, 2000);
    }
    
    setCodigoEscaneado('');
  };

  // ============================================
  // CREAR NUEVO LOTE
  // ============================================
  const crearNuevoLoteLocal = (codigo) => {
    const nuevoId = `LOTE-${String(lotes.length + 1).padStart(3, '0')}`;
    const areaInicial = areas.find(a => a.nombre === 'Recepción') || areas[0];
    
    let producto = 'Producto Genérico';
    let cliente = 'Cliente General';
    
    if (codigo.includes('/')) {
      const partes = codigo.split('/');
      if (partes[0] && partes[0].startsWith('V')) producto = `Producto V-Serie ${partes[0]}`;
      if (partes[1] && partes[1].startsWith('IF')) cliente = 'Cliente IF';
      else if (partes[1] && partes[1].startsWith('BV')) cliente = 'Cliente BV';
    }
    
    const nuevoLote = {
      id: nuevoId,
      codigo: codigo,
      producto: producto,
      cliente: cliente,
      cantidad: Math.floor(Math.random() * 500) + 100,
      fechaInicio: new Date().toLocaleString(),
      estado: 'en_proceso',
      areaActual: areaInicial.nombre,
      progreso: 5,
      prioridad: 'media',
      responsable: 'Sistema',
      tiempoRestante: '8h 00m',
      alertas: [],
      historial: [{
        area: areaInicial.nombre,
        codigoArea: areaInicial.codigo,
        fecha: new Date().toLocaleString(),
        timestamp: Date.now(),
        operador: 'Sistema',
        actual: true
      }]
    };
    
    setLotes(prev => [nuevoLote, ...prev]);
    agregarEventoLocal('success', `🆕 Nuevo lote: ${codigo} creado`, nuevoId);
    return nuevoLote;
  };

  // ============================================
  // MOVER LOTE A ÁREA
  // ============================================
  const procesarMovimientoLocal = (area, lote) => {
    const vecesPasadas = lote.historial?.filter(h => h.codigoArea === area.codigo).length || 0;
    const esReingreso = vecesPasadas > 0;
    
    const nuevoHistorial = {
      area: area.nombre,
      codigoArea: area.codigo,
      fecha: new Date().toLocaleString(),
      timestamp: Date.now(),
      operador: 'Operador',
      actual: true,
      reingreso: esReingreso,
      numeroPaso: vecesPasadas + 1
    };
    
    setLotes(prevLotes => prevLotes.map(l => {
      if (l.id === lote.id) {
        const historialActualizado = (l.historial || []).map(h => ({ ...h, actual: false }));
        let nuevoEstado = l.estado;
        let nuevoProgreso = l.progreso;
        
        if (area.nombre === 'Almacén') {
          nuevoEstado = 'completado';
          nuevoProgreso = 100;
        } else if (area.nombre === 'Incompleto') {
          nuevoEstado = 'incompleto';
        } else {
          const areaIndex = areas.findIndex(a => a.nombre === area.nombre);
          const totalAreas = areas.length;
          nuevoProgreso = Math.min(100, Math.floor((areaIndex / totalAreas) * 100));
          if (esReingreso) nuevoProgreso = Math.max(0, Math.min(100, nuevoProgreso + (Math.random() > 0.5 ? 5 : -2)));
        }
        
        return {
          ...l,
          areaActual: area.nombre,
          estado: nuevoEstado,
          progreso: nuevoProgreso,
          historial: [...historialActualizado, nuevoHistorial],
          ultimoMovimiento: Date.now(),
          tiempoRestante: nuevoEstado === 'completado' ? '0h' : `${Math.floor((100 - nuevoProgreso) / 10)}h ${((100 - nuevoProgreso) % 10) * 6}m`
        };
      }
      return l;
    }));
    
    setLoteSeleccionado(prev => {
      if (!prev || prev.id !== lote.id) return prev;
      const areaIndex = areas.findIndex(a => a.nombre === area.nombre);
      const totalAreas = areas.length;
      const nuevoProgreso = esReingreso ? 
        Math.max(0, Math.min(100, prev.progreso + (Math.random() > 0.5 ? 5 : -2))) : 
        Math.min(100, Math.floor((areaIndex / totalAreas) * 100));
      return {
        ...prev,
        areaActual: area.nombre,
        progreso: nuevoProgreso,
        historial: [...(prev.historial || []).map(h => ({ ...h, actual: false })), nuevoHistorial],
        ultimoMovimiento: Date.now()
      };
    });
    
    const mensaje = esReingreso ? 
      `↩️ ${lote.id} reingresa a ${area.nombre} (${vecesPasadas + 1}ª vez)` : 
      `✅ ${lote.id} → ${area.nombre}`;
    
    setMensajeEscaner(mensaje);
    setTipoMensaje(esReingreso ? 'warning' : 'success');
    agregarEventoLocal(esReingreso ? 'warning' : 'success', mensaje, lote.id);
    
    setUltimoEscaneo({ 
      lote: lote.id, 
      codigoLote: lote.codigo, 
      area: area.nombre, 
      fecha: new Date().toLocaleString(), 
      reingreso: esReingreso, 
      veces: vecesPasadas + 1 
    });
    
    if (area.nombre === 'Almacén') agregarEventoLocal('success', `🎉 ${lote.id} completado`, lote.id);
  };

  // ============================================
  // ELIMINAR LOTE
  // ============================================
  const eliminarLote = (loteId) => {
    if (window.confirm('¿Eliminar este lote?')) {
      setLotes(prev => prev.filter(l => l.id !== loteId));
      if (loteSeleccionado?.id === loteId) {
        const nuevoSeleccionado = lotes.find(l => l.id !== loteId && l.estado !== 'completado');
        setLoteSeleccionado(nuevoSeleccionado || null);
      }
      agregarEventoLocal('info', `🗑️ Lote ${loteId} eliminado`, loteId);
    }
  };

  // ============================================
  // ACTUALIZAR ESTADÍSTICAS
  // ============================================
  useEffect(() => {
    const lotesActivos = lotes.filter(l => l.estado !== 'completado').length;
    const completados = lotes.filter(l => l.estado === 'completado').length;
    const alertasActivas = lotes.filter(l => l.alertas?.length > 0).length;
    const eficiencia = lotes.length > 0 ? Math.round((completados / lotes.length) * 100) : 0;
    const tiempoPromedio = lotes.length > 0 ? Math.round(lotes.reduce((acc, l) => acc + (l.progreso || 0), 0) / lotes.length) : 0;
    
    setStatsTiempoReal({
      wip: lotesActivos,
      eficiencia,
      tiempoPromedio,
      alertasActivas
    });
  }, [lotes]);

  // ============================================
  // FILTROS
  // ============================================
  const lotesFiltrados = useMemo(() => {
    return lotes
      .filter(lote => {
        if (vistaLotes === 'activos') return lote.estado !== 'completado';
        if (vistaLotes === 'completados') return lote.estado === 'completado';
        return true;
      })
      .filter(lote => {
        if (filtroArea === 'todas') return true;
        return lote.areaActual === filtroArea;
      })
      .filter(lote => {
        if (filtrosAvanzados.prioridad !== 'todas') return lote.prioridad === filtrosAvanzados.prioridad;
        return true;
      })
      .filter(lote => {
        if (filtrosAvanzados.cliente) return lote.cliente?.toLowerCase().includes(filtrosAvanzados.cliente.toLowerCase());
        return true;
      })
      .filter(lote => {
        if (busqueda) {
          const busquedaLower = busqueda.toLowerCase();
          return lote.id.toLowerCase().includes(busquedaLower) || 
                 lote.codigo.toLowerCase().includes(busquedaLower) ||
                 lote.producto.toLowerCase().includes(busquedaLower);
        }
        return true;
      })
      .sort((a, b) => (b.ultimoMovimiento || 0) - (a.ultimoMovimiento || 0));
  }, [lotes, vistaLotes, filtroArea, filtrosAvanzados, busqueda]);

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className={`trazabilidad-container ${modoOscuro ? 'dark-mode' : ''} ${vistaCompacta ? 'compact-view' : ''}`} ref={mainContentRef}>
      
      {/* INDICADOR DE CONEXIÓN */}
      <div className={`connection-status ${conectado || wsConectado ? 'connected' : 'disconnected'}`}>
        <span className="status-dot"></span>
        <span>{conectado || wsConectado ? '🟢 Servidor Conectado - Datos en tiempo real' : '🟡 Modo Demo Local'}</span>
        {conectado || wsConectado && <span className="connection-badge">LIVE</span>}
      </div>

      {/* BOTÓN FLOTANTE EXPANDIR ESCÁNER */}
      {scannerMinimizado && (
        <button className="expand-scanner-btn" onClick={() => setScannerMinimizado(false)} title="Mostrar escáner">
          <span>📷</span>
          <span className="expand-tooltip">Mostrar escáner</span>
        </button>
      )}

      {/* HEADER */}
      <header className="app-header">
        <div className="header-top">
          <div className="header-left">
            <div className="logo-area">
              <div className="logo-icon-wrapper">
                <span className="logo-icon">🏭</span>
                <span className="logo-glow"></span>
              </div>
              <div className="logo-text">
                <h1 className="app-title">TEGRA ERP <span className="title-badge">PRO</span></h1>
                <span className="app-subtitle">Trazabilidad Premium - Centro de Control</span>
              </div>
            </div>
            <div className="header-date">
              <span className="date-icon">📅</span>
              <div className="date-info">
                <span className="date-full">{new Date().toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span className="time-full">{new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              </div>
            </div>
          </div>

          <div className="header-right">
            <button className="theme-toggle" onClick={() => setModoOscuro(!modoOscuro)}>
              <span>{modoOscuro ? '☀️' : '🌙'}</span>
            </button>
            <button className="compact-toggle" onClick={() => setVistaCompacta(!vistaCompacta)}>
              <span>{vistaCompacta ? '🔲' : '📱'}</span>
            </button>

            {/* NOTIFICACIONES */}
            <div className="notificaciones-wrapper" ref={notificacionesRef}>
              <button className={`notificaciones-btn ${notificaciones.filter(n => !n.leida).length > 0 ? 'tiene-notificaciones' : ''}`} onClick={() => setMostrarNotificaciones(!mostrarNotificaciones)}>
                <span>🔔</span>
                {notificaciones.filter(n => !n.leida).length > 0 && (
                  <span className="notificaciones-badge">{notificaciones.filter(n => !n.leida).length}</span>
                )}
              </button>

              {mostrarNotificaciones && (
                <div className="notificaciones-menu">
                  <div className="notificaciones-header">
                    <h4>Notificaciones <span className="header-count">{notificaciones.length}</span></h4>
                    <div className="header-actions">
                      <button onClick={marcarTodasLeidas}>✓ Todo</button>
                    </div>
                  </div>
                  <div className="notificaciones-lista">
                    {notificaciones.length === 0 ? (
                      <div className="no-notificaciones">
                        <span className="empty-icon">🔔</span>
                        <p>No hay notificaciones</p>
                      </div>
                    ) : (
                      notificaciones.map(notif => (
                        <div key={notif.id} className={`notificacion-item ${notif.tipo} ${notif.leida ? 'leida' : ''}`} onClick={() => marcarNotificacionLeida(notif.id)}>
                          <div className="notif-icon-wrapper">
                            <span className="notif-icon">
                              {notif.tipo === 'warning' && '⚠️'}
                              {notif.tipo === 'error' && '❌'}
                              {notif.tipo === 'success' && '✅'}
                              {notif.tipo === 'info' && 'ℹ️'}
                            </span>
                          </div>
                          <div className="notif-contenido">
                            <span className="notif-mensaje">{notif.mensaje}</span>
                          </div>
                          {!notif.leida && <span className="notif-dot"></span>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className={`scanner-status ${modoEscaner ? 'active' : ''}`}>
              <div className="status-indicator">
                <span className="status-pulse"></span>
                <span className="status-text">{modoEscaner ? 'Escáner activo' : 'Inactivo'}</span>
              </div>
            </div>

            <button className={`scanner-toggle ${modoEscaner ? 'active' : ''}`} onClick={() => setModoEscaner(!modoEscaner)}>
              <span>{modoEscaner ? '🔴' : '🟢'}</span>
              <span>{modoEscaner ? 'Desactivar' : 'Activar'}</span>
            </button>

            <div className="user-profile">
              <div className="user-avatar">
                <span>OP</span>
                <span className="avatar-status online"></span>
              </div>
              <span className="user-name">Operador</span>
            </div>
          </div>
        </div>

        {/* PANEL DE ESCANEO PREMIUM */}
        <div className={`scanner-panel ${scannerMinimizado ? 'minimizado' : ''}`}>
          <div className="scanner-container">
            <div className="scanner-header">
              <h3><span className="title-icon">📷</span> Centro de Control - Escáner de Trazabilidad</h3>
              <div className="formatos-ayuda">
                <span className="formato-badge area">9001-9012</span>
                <span className="formato-badge lote">V132274/IF2128</span>
                <span className="formato-badge lote">V134339/BV1012</span>
                <span className="formato-badge lote">Cualquier código</span>
              </div>
              <button className="minimize-scanner-btn" onClick={() => setScannerMinimizado(true)} title="Minimizar escáner">−</button>
            </div>

            <div className="scanner-input-group">
              <div className="input-wrapper">
                <span className="input-icon">🔍</span>
                <input
                  ref={inputRef}
                  type="text"
                  className={`scanner-input ${animacionActiva ? 'pulse' : ''}`}
                  value={codigoEscaneado}
                  onChange={(e) => setCodigoEscaneado(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && procesarEscaneo()}
                  placeholder="1. ESCANEA ÁREA (9001-9012) → 2. ESCANEA LOTE"
                  disabled={!modoEscaner}
                  autoComplete="off"
                />
                {codigoEscaneado && <button className="input-clear" onClick={() => setCodigoEscaneado('')}>✕</button>}
              </div>
              <button className={`scanner-button ${animacionActiva ? 'pulse' : ''}`} onClick={procesarEscaneo} disabled={!codigoEscaneado}>
                <span>Procesar</span>
              </button>
            </div>

            <div className={`scanner-message ${tipoMensaje} ${animacionActiva ? 'pop' : ''}`}>
              <span className="message-icon">
                {tipoMensaje === 'success' && '✅'}
                {tipoMensaje === 'error' && '❌'}
                {tipoMensaje === 'warning' && '⚠️'}
                {tipoMensaje === 'info' && 'ℹ️'}
              </span>
              <span className="message-text">{mensajeEscaner}</span>
            </div>

            {/* INDICADOR DE COLA DE ESCANEO */}
            <div className="queue-indicator">
              <div className="queue-title">
                <span className="queue-icon">📋</span>
                <span>Cola de escaneo</span>
              </div>
              <div className="queue-items">
                <div className={`queue-step ${colaEscaneos.area ? 'active' : 'pending'}`}>
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <strong>Área</strong>
                    <span>{colaEscaneos.area ? colaEscaneos.area.nombre : 'Esperando área...'}</span>
                  </div>
                  {colaEscaneos.area && <div className="step-check">✓</div>}
                </div>
                <div className="queue-arrow">→</div>
                <div className={`queue-step ${colaEscaneos.lote ? 'active' : colaEscaneos.area ? 'ready' : 'pending'}`}>
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <strong>Lote</strong>
                    <span>{colaEscaneos.lote ? colaEscaneos.lote.id : colaEscaneos.area ? 'Listo para escanear' : 'Esperando área primero'}</span>
                  </div>
                  {colaEscaneos.lote && <div className="step-check">✓</div>}
                </div>
              </div>
            </div>

            <div className="scanner-instrucciones">
              <div className="instruccion-paso active">
                <div className="paso-numero">1</div>
                <div className="paso-contenido">
                  <strong>ESCANEAR ÁREA</strong>
                  <span>Códigos: 9001 (Recepción), 9002 (Diseño), 9003 (Plotter)...</span>
                </div>
              </div>
              <div className="instruccion-paso">
                <div className="paso-numero">2</div>
                <div className="paso-contenido">
                  <strong>ESCANEAR LOTE</strong>
                  <span>Código de lote (ej: V132274/IF2128)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="kpi-tiempo-real">
          <div className="kpi-item">
            <span className="kpi-icon">📊</span>
            <div className="kpi-content">
              <span className="kpi-label">En proceso</span>
              <span className="kpi-valor">{statsTiempoReal.wip}</span>
            </div>
          </div>
          <div className="kpi-item">
            <span className="kpi-icon">⚡</span>
            <div className="kpi-content">
              <span className="kpi-label">Eficiencia</span>
              <span className="kpi-valor">{statsTiempoReal.eficiencia}%</span>
            </div>
          </div>
          <div className="kpi-item">
            <span className="kpi-icon">📈</span>
            <div className="kpi-content">
              <span className="kpi-label">Progreso promedio</span>
              <span className="kpi-valor">{statsTiempoReal.tiempoPromedio}%</span>
            </div>
          </div>
          <div className="kpi-item warning">
            <span className="kpi-icon">⚠️</span>
            <div className="kpi-content">
              <span className="kpi-label">Alertas</span>
              <span className="kpi-valor">{statsTiempoReal.alertasActivas}</span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="app-main" ref={mainContentRef}>
        {/* TABS Y FILTROS */}
        <div className="tabs-container">
          <div className="tabs-header">
            <div className="lotes-tabs">
              <button className={`tab-btn ${vistaLotes === 'activos' ? 'active' : ''}`} onClick={() => setVistaLotes('activos')}>
                <span className="tab-icon">📋</span> Activos
                <span className="tab-count">{lotes.filter(l => l.estado !== 'completado').length}</span>
              </button>
              <button className={`tab-btn ${vistaLotes === 'completados' ? 'active' : ''}`} onClick={() => setVistaLotes('completados')}>
                <span className="tab-icon">✅</span> Completados
                <span className="tab-count">{lotes.filter(l => l.estado === 'completado').length}</span>
              </button>
              <button className={`tab-btn ${vistaLotes === 'todos' ? 'active' : ''}`} onClick={() => setVistaLotes('todos')}>
                <span className="tab-icon">📊</span> Todos
                <span className="tab-count">{lotes.length}</span>
              </button>
            </div>

            <div className="filters-actions">
              <button className={`filter-toggle-btn ${mostrarFiltros ? 'active' : ''}`} onClick={() => setMostrarFiltros(!mostrarFiltros)}>
                <span className="btn-icon">🔍</span> Filtros
              </button>
              <select className="area-filter" value={filtroArea} onChange={(e) => setFiltroArea(e.target.value)}>
                <option value="todas">🌐 Todas las áreas</option>
                {areas.map(area => (
                  <option key={area.id} value={area.nombre}>{area.icono} {area.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          {mostrarFiltros && (
            <div className="filtros-avanzados">
              <div className="filtro-group">
                <label>Buscar</label>
                <input type="text" placeholder="🔍 Buscar lote, código..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
              </div>
              <div className="filtro-group">
                <label>Cliente</label>
                <input type="text" placeholder="Buscar cliente..." value={filtrosAvanzados.cliente} onChange={(e) => setFiltrosAvanzados({...filtrosAvanzados, cliente: e.target.value})} />
              </div>
              <div className="filtro-group">
                <label>Prioridad</label>
                <select value={filtrosAvanzados.prioridad} onChange={(e) => setFiltrosAvanzados({...filtrosAvanzados, prioridad: e.target.value})}>
                  <option value="todas">Todas</option>
                  <option value="alta">🔴 Alta</option>
                  <option value="media">🟡 Media</option>
                  <option value="baja">🟢 Baja</option>
                </select>
              </div>
            </div>
          )}

          {/* LISTA DE LOTES */}
          {lotesFiltrados.length > 0 ? (
            <div className="lotes-horizontal">
              {lotesFiltrados.map(lote => {
                const areaActual = areas.find(a => a.nombre === lote.areaActual);
                return (
                  <div 
                    key={lote.id} 
                    className={`lote-card ${loteSeleccionado?.id === lote.id ? 'selected' : ''} ${lote.estado} ${lote.prioridad === 'alta' ? 'prioridad-alta' : ''}`} 
                    onClick={() => setLoteSeleccionado(lote)} 
                    style={{ borderLeftColor: areaActual?.color }}
                  >
                    {lote.prioridad === 'alta' && <span className="prioridad-alta-badge">🔴</span>}
                    <div className="card-header">
                      <div className="lote-info">
                        <span className="lote-id">{lote.id}</span>
                        <span className="lote-codigo">{lote.codigo?.slice(0, 20)}</span>
                      </div>
                      <span className={`status-badge ${lote.estado}`}>
                        {lote.estado === 'completado' ? '✅' : lote.estado === 'incompleto' ? '⚠️' : '⚙️'}
                      </span>
                    </div>
                    <div className="card-body">
                      <span className="lote-producto">{lote.producto}</span>
                      <div className="lote-cliente">
                        <span className="cliente-nombre">{lote.cliente}</span>
                        <span className="lote-cantidad">{lote.cantidad}uds</span>
                      </div>
                    </div>
                    <div className="card-area" style={{ background: areaActual?.color + '15' }}>
                      <span className="area-icon">{areaActual?.icono}</span>
                      <span className="area-nombre">{lote.areaActual}</span>
                    </div>
                    <div className="progress-container">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${lote.progreso}%`, background: `linear-gradient(90deg, ${areaActual?.color}, ${areaActual?.color}dd)` }}></div>
                      </div>
                      <span className="progress-text">{lote.progreso}%</span>
                    </div>
                    <div className="card-footer">
                      <span className="lote-tiempo">⏱️ {lote.tiempoRestante}</span>
                      <button className="btn-eliminar" onClick={(e) => { e.stopPropagation(); eliminarLote(lote.id); }} title="Eliminar lote">🗑️</button>
                    </div>
                    {loteSeleccionado?.id === lote.id && <span className="selected-glow"></span>}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-lotes-message">
              <div className="empty-state">
                <span className="empty-icon">📦</span>
                <h3>No hay lotes</h3>
                <p>Escanea un ÁREA (9001-9012) y luego un LOTE para comenzar</p>
                <div className="formatos-ejemplos">
                  <code>9002</code>
                  <code>V132274/IF2128</code>
                  <code>9005</code>
                  <code>V134339/BV1012</code>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* GRID PRINCIPAL */}
        <div className="main-grid">
          {/* COLUMNA ÁREAS */}
          <div className="areas-column">
            <div className="areas-header">
              <h2><span className="title-icon">🏭</span> Áreas de Producción</h2>
              <div className="header-stats">
                <span className="areas-count">{areas.length}</span>
              </div>
            </div>
            <div className="areas-list">
              {areas.map(area => {
                const lotesEnArea = lotes.filter(l => l.areaActual === area.nombre);
                const ocupacion = (lotesEnArea.length / area.capacidad) * 100;
                const esAreaActiva = loteSeleccionado?.areaActual === area.nombre;
                const esAreaEnCola = colaEscaneos.area?.nombre === area.nombre;
                
                return (
                  <div key={area.id} className={`area-item ${esAreaActiva ? 'activa' : ''} ${esAreaEnCola ? 'en-cola' : ''} ${ocupacion > 80 ? 'alta-ocupacion' : ''}`} style={{ borderLeftColor: area.color }} onClick={() => { setCodigoEscaneado(area.codigo); inputRef.current?.focus(); }}>
                    <div className="area-icon-wrapper" style={{ background: area.color + '15' }}>
                      <span className="area-icon">{area.icono}</span>
                      {lotesEnArea.length > 0 && <span className="area-badge" style={{ background: area.color }}>{lotesEnArea.length}</span>}
                    </div>
                    <div className="area-details">
                      <div className="area-header">
                        <span className="area-name">{area.nombre}</span>
                        <span className="area-code">{area.codigo}</span>
                      </div>
                      <div className="area-metrics">
                        <div className="metric">
                          <span className="metric-label">Ocupación</span>
                          <div className="metric-bar">
                            <div className="metric-fill" style={{ width: `${Math.min(100, ocupacion)}%`, background: area.color }}></div>
                          </div>
                          <span className="metric-value">{Math.round(ocupacion)}%</span>
                        </div>
                      </div>
                    </div>
                    {esAreaEnCola && <div className="cola-badge">⏳ En cola</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLUMNA TRACKING */}
          <div className="tracking-column">
            <TrackingLote loteSeleccionado={loteSeleccionado} areas={areas} />
          </div>

          {/* COLUMNA EVENTOS */}
          <div className="events-column">
            <div className="events-header">
              <h2><span className="title-icon">⚡</span> Eventos en tiempo real</h2>
              <span className="events-count">{eventos.length}</span>
            </div>
            <div className="events-list">
              {eventos.length === 0 ? (
                <div className="no-events">
                  <span>⚡</span>
                  <p>Esperando eventos...</p>
                </div>
              ) : (
                eventos.map(evento => (
                  <div key={evento.id} className={`event-item ${evento.tipo}`}>
                    <div className="event-icon-wrapper">
                      <span className="event-icon">
                        {evento.tipo === 'success' && '✅'}
                        {evento.tipo === 'area' && '📍'}
                        {evento.tipo === 'lote' && '📦'}
                        {evento.tipo === 'error' && '❌'}
                        {evento.tipo === 'warning' && '⚠️'}
                      </span>
                    </div>
                    <div className="event-content">
                      <span className="event-message">{evento.mensaje}</span>
                      <div className="event-footer">
                        <span className="event-time">{evento.timestamp}</span>
                        {evento.loteRef && <span className="event-lote">{evento.loteRef}</span>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {ultimoEscaneo && (
              <div className="last-scan">
                <h4><span className="title-icon">🔄</span> Último movimiento</h4>
                <div className="scan-card">
                  <div className="scan-lote-info">
                    <span className="scan-lote">{ultimoEscaneo.lote}</span>
                    <span className="scan-codigo">{ultimoEscaneo.codigoLote}</span>
                  </div>
                  <span className="scan-arrow">→</span>
                  <div className="scan-area-info">
                    <span className="scan-area">{ultimoEscaneo.area}</span>
                  </div>
                  <span className="scan-time">{ultimoEscaneo.fecha?.split(' ')[1]}</span>
                </div>
              </div>
            )}

            <div className="simulation-panel">
              <h4><span className="title-icon">🎮</span> Simulador de pruebas</h4>
              <div className="simulation-buttons">
                <button onClick={() => { const randomArea = areas[Math.floor(Math.random() * areas.length)]; setCodigoEscaneado(randomArea.codigo); setTimeout(() => procesarEscaneo(), 100); }} className="btn-area">
                  <span>📍</span> Simular área
                </button>
                <button onClick={() => { const formatos = ['V132274/IF2128', 'V134339/BV1012', 'NK-137', '1001']; setCodigoEscaneado(formatos[Math.floor(Math.random() * formatos.length)]); setTimeout(() => procesarEscaneo(), 100); }} className="btn-lote">
                  <span>📦</span> Simular lote
                </button>
              </div>
              <div className="simulation-info">
                <small>Prueba el flujo: escanea un área (9001-9012) y luego un lote</small>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* BOTÓN VOLVER ARRIBA */}
      <button className={`scroll-to-top ${showScrollTop ? 'visible' : ''}`} onClick={scrollToTop} title="Volver arriba">↑</button>

      {/* NOTIFICACIONES FLOTANTES */}
      <div className="floating-premium-toasts">
        {notificaciones.filter(n => !n.leida).slice(0, 2).map(notif => (
          <div key={notif.id} className={`toast-premium ${notif.tipo}`}>
            <span className="toast-icon">{notif.tipo === 'exito' ? '✅' : notif.tipo === 'error' ? '❌' : 'ℹ️'}</span>
            <span className="toast-message">{notif.mensaje}</span>
            <div className="toast-progress"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrazabilidadLotes;