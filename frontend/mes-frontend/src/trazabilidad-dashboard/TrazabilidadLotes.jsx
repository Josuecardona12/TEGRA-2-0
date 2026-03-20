import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './TrazabilidadLotes.css';
import TrackingLote from './TrackingLote';
import { useProduccion } from '../context/ProduccionContext';

const TrazabilidadLotes = () => {
  // ===== USAR CONTEXTO GLOBAL DE PRODUCCIÓN =====
  const { 
    lotes: lotesGlobal,
    areas: areasGlobal,
    ultimoMovimiento: ultimoMovimientoGlobal,
    colaEscaneo: colaEscaneoGlobal,
    estadisticas: estadisticasGlobal,
    conectado: wsConectado,
    procesarEscaneo: procesarEscaneoGlobal,
    getLotesPorArea,
    getTiempoEnArea,
    moverLoteManual,
    getAreaById,
    eventos: eventosGlobal,
    agregarEvento: agregarEventoGlobal
  } = useProduccion();

  // ===== ESTADOS LOCALES =====
  const [lotes, setLotes] = useState([]);
  const [areas, setAreas] = useState([]);
  const [ultimoEscaneo, setUltimoEscaneo] = useState(null);
  const [colaEscaneos, setColaEscaneos] = useState({ area: null, lote: null });
  const [modoEscaner, setModoEscaner] = useState(true);
  const [eventos, setEventos] = useState([]);
  const [loteSeleccionado, setLoteSeleccionado] = useState(null);
  const [codigoEscaneado, setCodigoEscaneado] = useState('');
  const [mensajeEscaner, setMensajeEscaner] = useState('📡 Esperando código...');
  const [tipoMensaje, setTipoMensaje] = useState('info');
  const [animacionActiva, setAnimacionActiva] = useState(false);
  
  // ===== ESTADOS DE CONEXIÓN WEBSOCKET =====
  const [conectado, setConectado] = useState(false);
  const [usandoServidor, setUsandoServidor] = useState(false);
  const wsRef = useRef(null);
  
  // ===== ESTADOS DE UI/UX =====
  const [vistaLotes, setVistaLotes] = useState('activos');
  const [filtroArea, setFiltroArea] = useState('todas');
  const [modoOscuro, setModoOscuro] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [vistaCompacta, setVistaCompacta] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // ===== ESTADOS DE ANÁLISIS =====
  const [statsTiempoReal, setStatsTiempoReal] = useState({
    lotesPorHora: 0,
    eficiencia: 0,
    tiempoPromedio: 0,
    alertasActivas: 0,
    wip: 0
  });
  
  const [notificaciones, setNotificaciones] = useState([]);
  const [filtrosAvanzados, setFiltrosAvanzados] = useState({
    fechaInicio: '',
    fechaFin: '',
    responsable: '',
    prioridad: 'todas',
    cliente: '',
    producto: ''
  });

  // ===== REFS =====
  const inputRef = useRef(null);
  const notificacionesRef = useRef(null);
  const mainContentRef = useRef(null);

  // ============================================
  // CONFIGURACIÓN DE ÁREAS (FALLBACK SI NO HAY CONTEXTO)
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
    }
  }, [lotesGlobal]);

  useEffect(() => {
    if (areasGlobal && areasGlobal.length > 0) {
      setAreas(areasGlobal);
    } else {
      setAreas(areasProduccion);
    }
  }, [areasGlobal, areasProduccion]);

  useEffect(() => {
    if (ultimoMovimientoGlobal) {
      setUltimoEscaneo(ultimoMovimientoGlobal);
      setMensajeEscaner(`✅ ${ultimoMovimientoGlobal.lote} → ${ultimoMovimientoGlobal.area}`);
      setTipoMensaje('success');
      if (navigator.vibrate) navigator.vibrate(100);
    }
  }, [ultimoMovimientoGlobal]);

  useEffect(() => {
    if (colaEscaneoGlobal) {
      setColaEscaneos(colaEscaneoGlobal);
    }
  }, [colaEscaneoGlobal]);

  useEffect(() => {
    if (eventosGlobal && eventosGlobal.length > 0) {
      setEventos(eventosGlobal);
    }
  }, [eventosGlobal]);

  // ============================================
  // CONEXIÓN WEBSOCKET PARA TIEMPO REAL
  // ============================================
  useEffect(() => {
    console.log('🔌 Trazabilidad conectando...');
    
    const WS_URL = 'wss://glowing-lamp-r47wvpq4574fxv7j-8080.app.github.dev';
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    
    ws.onopen = () => {
      console.log('✅ Trazabilidad conectado');
      setConectado(true);
      setUsandoServidor(true);
      agregarEventoLocal('success', '✅ Conectado al servidor - Tiempo Real');
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📦 Trazabilidad recibió:', data.type);
        
        if (data.type === 'INIT') {
          const lotesServidor = data.data.lotes.map((l, index) => ({
            id: l.codigo || `LOTE-${String(index + 1).padStart(3, '0')}`,
            codigo: l.codigo || `V${String(Math.floor(Math.random() * 900000) + 100000)}/IF${String(Math.floor(Math.random() * 9000) + 1000)}`,
            producto: l.producto || 'Producto',
            cliente: l.cliente || 'Cliente',
            cantidad: l.cantidad || Math.floor(Math.random() * 500) + 100,
            fechaInicio: new Date().toLocaleString(),
            estado: l.estado || 'en_proceso',
            areaActual: l.areaActual || 'Recepción',
            progreso: l.progreso || 5,
            prioridad: l.prioridad || 'media',
            responsable: l.responsable || 'Sistema',
            tiempoRestante: '8h 00m',
            alertas: [],
            historial: [
              { 
                area: 'Recepción',
                codigoArea: '9001',
                fecha: new Date().toLocaleString(),
                operador: 'Sistema',
                actual: true
              }
            ],
            metadatos: { codigoOriginal: l.codigo }
          }));
          
          setLotes(lotesServidor);
          if (lotesServidor.length > 0 && !loteSeleccionado) {
            setLoteSeleccionado(lotesServidor[0]);
          }
        }
        
        if (data.type === 'ACTUALIZACION') {
          if (data.data.ultimoMovimiento) {
            const { loteId, area } = data.data.ultimoMovimiento;
            setUltimoEscaneo({
              lote: loteId,
              area: area,
              fecha: new Date().toLocaleString()
            });
            setMensajeEscaner(`✅ ${loteId} → ${area}`);
            setTipoMensaje('success');
            agregarEventoLocal('success', `✅ ${loteId} movido a ${area}`);
            if (navigator.vibrate) navigator.vibrate(100);
          }
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('❌ Error WebSocket:', error);
      setConectado(false);
      setUsandoServidor(false);
      agregarEventoLocal('error', '❌ Error conectando al servidor - Usando modo local');
    };
    
    ws.onclose = () => {
      console.log('❌ Desconectado del servidor');
      setConectado(false);
      setUsandoServidor(false);
      agregarEventoLocal('info', 'ℹ️ Desconectado del servidor - Usando modo local');
    };
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // ============================================
  // ENVIAR AL SERVIDOR
  // ============================================
  const enviarAlServidor = (tipo, payload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: tipo, payload }));
      console.log('📤 Enviado:', tipo, payload);
    }
  };

  // ============================================
  // INICIALIZACIÓN LOCAL
  // ============================================
  useEffect(() => {
    if (!conectado && areas.length === 0) {
      setAreas(areasProduccion);
    }
  }, [conectado, areas.length, areasProduccion]);

  // ============================================
  // GUARDAR PREFERENCIAS
  // ============================================
  useEffect(() => { localStorage.setItem('modoOscuro', modoOscuro); }, [modoOscuro]);
  useEffect(() => { localStorage.setItem('vistaCompacta', vistaCompacta); }, [vistaCompacta]);

  // ============================================
  // DETECTAR SCROLL
  // ============================================
  useEffect(() => {
    const handleScroll = () => {
      if (mainContentRef.current) setShowScrollTop(mainContentRef.current.scrollTop > 400);
    };
    const currentRef = mainContentRef.current;
    if (currentRef) currentRef.addEventListener('scroll', handleScroll);
    return () => { if (currentRef) currentRef.removeEventListener('scroll', handleScroll); };
  }, []);

  const scrollToTop = () => {
    if (mainContentRef.current) mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ============================================
  // ENFOCAR INPUT
  // ============================================
  useEffect(() => {
    if (modoEscaner && inputRef.current) inputRef.current.focus();
  }, [modoEscaner]);

  // ============================================
  // CERRAR NOTIFICACIONES
  // ============================================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificacionesRef.current && !notificacionesRef.current.contains(event.target)) setMostrarNotificaciones(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ============================================
  // FUNCIONES AUXILIARES LOCALES
  // ============================================
  const agregarEventoLocal = (tipo, mensaje, loteRef = '') => {
    const nuevoEvento = {
      id: Date.now() + Math.random(),
      tipo,
      mensaje,
      loteRef,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setEventos(prev => [nuevoEvento, ...prev.slice(0, 29)]);
    if (tipo === 'warning' || tipo === 'error' || tipo === 'success') {
      setNotificaciones(prev => [{
        id: Date.now(),
        mensaje,
        tipo,
        leida: false
      }, ...prev.slice(0, 9)]);
      if (navigator.vibrate) navigator.vibrate(tipo === 'success' ? 50 : 100);
    }
  };

  const marcarNotificacionLeida = (id) => {
    setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
  };
  const marcarTodasLeidas = () => {
    setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
  };

  // ============================================
  // VALIDAR FORMATO DE LOTE
  // ============================================
  const validarFormatoLote = (codigo) => {
    return !codigo.match(/^9\d{3}$/);
  };

  const extraerInfoLote = (codigo) => {
    return {
      formato: 'generico',
      codigoOriginal: codigo,
      timestamp: Date.now()
    };
  };

  // ============================================
  // PROCESAR ESCANEO (USA CONTEXTO GLOBAL SI ESTÁ DISPONIBLE)
  // ============================================
  const procesarEscaneo = () => {
    const codigo = codigoEscaneado.trim().toUpperCase();
    if (!codigo) return;

    setAnimacionActiva(true);
    setTimeout(() => setAnimacionActiva(false), 500);
    
    setMensajeEscaner(`⏳ Procesando: ${codigo}...`);
    setTipoMensaje('info');

    // Si hay contexto global, usar su procesador
    if (procesarEscaneoGlobal) {
      const resultado = procesarEscaneoGlobal(codigo);
      setTimeout(() => {
        setCodigoEscaneado('');
        if (resultado) {
          setMensajeEscaner(`✅ ${resultado.nombre || resultado.codigo || 'Procesado'}`);
          setTipoMensaje('success');
        }
        if (!colaEscaneos.area && !colaEscaneos.lote) {
          setTimeout(() => {
            setMensajeEscaner('📡 Esperando código...');
            setTipoMensaje('info');
          }, 1500);
        }
      }, 500);
      return;
    }

    // Fallback: procesamiento local
    if (codigo.match(/^9\d{3}$/)) {
      procesarEscaneoAreaLocal(codigo);
    } else {
      const infoLote = extraerInfoLote(codigo);
      procesarEscaneoLoteLocal(codigo, infoLote);
    }

    setTimeout(() => {
      setCodigoEscaneado('');
      if (!colaEscaneos.area && !colaEscaneos.lote) {
        setMensajeEscaner('📡 Esperando código...');
        setTipoMensaje('info');
      }
    }, 1500);
  };

  // ============================================
  // PROCESAR ESCANEO DE ÁREA (LOCAL)
  // ============================================
  const procesarEscaneoAreaLocal = (codigoArea) => {
    const area = areas.find(a => a.codigo === codigoArea);
    if (area) {
      setMensajeEscaner(`✅ Área: ${area.nombre}`);
      setTipoMensaje('success');
      agregarEventoLocal('area', `📍 Área escaneada: ${area.nombre} [${area.codigo}]`);
      enviarAlServidor('ESCANEO', { codigo: codigoArea, tipo: 'area', area: area.nombre });
      if (navigator.vibrate) navigator.vibrate(30);
      setColaEscaneos(prev => {
        const nuevaCola = { ...prev, area: area };
        if (prev.lote) {
          procesarMovimientoLocal(area, prev.lote);
          return { area: null, lote: null };
        }
        setMensajeEscaner('⏳ Área guardada. Escanea el lote...');
        return nuevaCola;
      });
    } else {
      setMensajeEscaner(`❌ Área no encontrada: ${codigoArea}`);
      setTipoMensaje('error');
      agregarEventoLocal('error', `❌ Área no encontrada: ${codigoArea}`);
    }
  };

  // ============================================
  // PROCESAR ESCANEO DE LOTE (LOCAL)
  // ============================================
  const procesarEscaneoLoteLocal = (codigoLote, infoLote = null) => {
    const loteExistente = lotes.find(l => 
      l.codigo === codigoLote || 
      l.id === codigoLote
    );

    if (loteExistente) {
      setMensajeEscaner(`✅ Lote encontrado: ${loteExistente.id}`);
      setTipoMensaje('success');
      agregarEventoLocal('lote', `📦 Lote escaneado: ${loteExistente.id}`, loteExistente.id);
      setLoteSeleccionado(loteExistente);
      enviarAlServidor('ESCANEO', { codigo: codigoLote, tipo: 'lote', loteId: loteExistente.id });
      if (navigator.vibrate) navigator.vibrate(30);

      setColaEscaneos(prev => {
        const nuevaCola = { ...prev, lote: loteExistente };
        if (prev.area) {
          procesarMovimientoLocal(prev.area, loteExistente);
          return { area: null, lote: null };
        }
        setMensajeEscaner('⏳ Lote guardado. Escanea el área...');
        return nuevaCola;
      });
    } else {
      crearNuevoLoteLocal(codigoLote, infoLote);
    }
  };

  // ============================================
  // CREAR NUEVO LOTE (LOCAL)
  // ============================================
  const crearNuevoLoteLocal = (codigo, infoLote = null) => {
    const nuevoId = `LOTE-${String(lotes.length + 1).padStart(3, '0')}`;
    
    let producto = 'Producto Genérico';
    let cliente = 'Pendiente';
    let cantidad = Math.floor(Math.random() * 500) + 100;
    
    if (codigo.includes('/')) {
      const partes = codigo.split('/');
      producto = `Producto ${partes[0]}`;
      if (partes[1] && partes[1].startsWith('IF')) {
        cliente = 'Cliente IF';
      } else if (partes[1] && partes[1].startsWith('BV')) {
        cliente = 'Cliente BV';
      }
    }

    const nuevoLote = {
      id: nuevoId,
      codigo: codigo,
      producto: producto,
      cliente: cliente,
      cantidad: cantidad,
      fechaInicio: new Date().toLocaleString(),
      fechaISO: new Date().toISOString(),
      estado: 'en_proceso',
      areaActual: 'Recepción',
      progreso: 5,
      prioridad: 'media',
      responsable: 'Sistema',
      tiempoRestante: '8h 00m',
      alertas: [],
      infoLote: infoLote,
      historial: [
        { 
          area: 'Recepción',
          codigoArea: '9001',
          fecha: new Date().toLocaleString(),
          timestamp: Date.now(),
          operador: 'Sistema',
          actual: true
        }
      ],
      metadatos: {
        codigoOriginal: codigo,
        timestamp: Date.now()
      }
    };

    setLotes(prev => [...prev, nuevoLote]);
    setLoteSeleccionado(nuevoLote);
    enviarAlServidor('NUEVO_LOTE', { lote: nuevoLote, codigo: codigo });
    setMensajeEscaner(`🆕 Nuevo lote: ${codigo}`);
    setTipoMensaje('success');
    agregarEventoLocal('success', `🆕 Nuevo lote: ${codigo}`, nuevoId);

    setUltimoEscaneo({
      lote: nuevoId,
      codigoLote: codigo,
      area: 'Recepción',
      fecha: new Date().toLocaleString()
    });
  };

  // ============================================
  // PROCESAR MOVIMIENTO (LOCAL)
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
        if (area.id === 'AREA-011') nuevoEstado = 'completado';
        else if (area.id === 'AREA-012') nuevoEstado = 'incompleto';
        const nuevoProgreso = esReingreso ? 
          Math.max(0, Math.min(100, l.progreso + (Math.random() > 0.5 ? 5 : -2))) : 
          Math.min(100, l.progreso + 8);
        return {
          ...l,
          areaActual: area.nombre,
          estado: nuevoEstado,
          progreso: nuevoProgreso,
          historial: [...historialActualizado, nuevoHistorial],
          ultimoMovimiento: Date.now()
        };
      }
      return l;
    }));
    
    setLoteSeleccionado(prev => {
      if (!prev || prev.id !== lote.id) return prev;
      return {
        ...prev,
        areaActual: area.nombre,
        progreso: esReingreso ? 
          Math.max(0, Math.min(100, prev.progreso + (Math.random() > 0.5 ? 5 : -2))) : 
          Math.min(100, prev.progreso + 8),
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
    
    enviarAlServidor('MOVIMIENTO', {
      loteId: lote.id,
      codigoLote: lote.codigo,
      area: area.nombre,
      codigoArea: area.codigo,
      reingreso: esReingreso,
      veces: vecesPasadas + 1
    });
    
    setUltimoEscaneo({ 
      lote: lote.id, 
      codigoLote: lote.codigo, 
      area: area.nombre, 
      fecha: new Date().toLocaleString(), 
      reingreso: esReingreso, 
      veces: vecesPasadas + 1 
    });
    
    if (area.id === 'AREA-011') agregarEventoLocal('success', `🎉 ${lote.id} completado`, lote.id);
  };

  // ============================================
  // ELIMINAR LOTE
  // ============================================
  const eliminarLote = (loteId) => {
    if (window.confirm('¿Eliminar este lote?')) {
      setLotes(prev => prev.filter(l => l.id !== loteId));
      if (loteSeleccionado?.id === loteId) setLoteSeleccionado(lotes.length > 1 ? lotes[0] : null);
      enviarAlServidor('ELIMINAR_LOTE', { loteId });
      agregarEventoLocal('info', `🗑️ Lote ${loteId} eliminado`, loteId);
    }
  };

  // ============================================
  // ACTUALIZAR ESTADÍSTICAS
  // ============================================
  useEffect(() => {
    const calcularEstadisticas = () => {
      const lotesActivos = lotes.filter(l => l.estado !== 'completado').length;
      const alertasActivas = lotes.filter(l => l.alertas?.length > 0).length;
      let eficiencia = 0;
      if (lotes.length > 0) {
        const completados = lotes.filter(l => l.estado === 'completado').length;
        eficiencia = Math.round((completados / lotes.length) * 100);
      }
      setStatsTiempoReal({
        lotesPorHora: lotesActivos,
        eficiencia: eficiencia,
        tiempoPromedio: lotes.length > 0 ? Math.round(lotes.reduce((acc, l) => acc + (l.progreso || 0), 0) / lotes.length) : 0,
        alertasActivas: alertasActivas,
        wip: lotesActivos
      });
    };
    calcularEstadisticas();
    const intervalo = setInterval(calcularEstadisticas, 5000);
    return () => clearInterval(intervalo);
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
      .sort((a, b) => (b.ultimoMovimiento || 0) - (a.ultimoMovimiento || 0));
  }, [lotes, vistaLotes, filtroArea, filtrosAvanzados]);

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className={`trazabilidad-container ${modoOscuro ? 'dark-mode' : ''} ${vistaCompacta ? 'compact-view' : ''}`}>
      
      {/* INDICADOR DE CONEXIÓN WEBSOCKET */}
      <div className={`connection-status ${conectado || wsConectado ? 'connected' : 'disconnected'}`}>
        <span className="status-dot"></span>
        <span>{conectado || wsConectado ? '🟢 Servidor Conectado' : '🟡 Modo Demo Local'}</span>
      </div>

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
                <span className="app-subtitle">Trazabilidad Premium</span>
              </div>
            </div>
            <div className="header-date">
              <span className="date-icon">📅</span>
              <div className="date-info">
                <span className="date-full">{new Date().toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span className="time-full">{new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>

          <div className="header-right">
            <button className="theme-toggle" onClick={() => setModoOscuro(!modoOscuro)} title={modoOscuro ? 'Modo claro' : 'Modo oscuro'}>
              <span>{modoOscuro ? '☀️' : '🌙'}</span>
            </button>
            <button className="compact-toggle" onClick={() => setVistaCompacta(!vistaCompacta)} title={vistaCompacta ? 'Vista normal' : 'Vista compacta'}>
              <span>{vistaCompacta ? '🔲' : '📱'}</span>
            </button>

            {/* NOTIFICACIONES */}
            <div className="notificaciones-wrapper" ref={notificacionesRef}>
              <button 
                className={`notificaciones-btn ${notificaciones.filter(n => !n.leida).length > 0 ? 'tiene-notificaciones' : ''}`}
                onClick={() => setMostrarNotificaciones(!mostrarNotificaciones)}
              >
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

        {/* PANEL DE ESCANEO */}
        <div className="scanner-panel">
          <div className="scanner-container">
            <div className="scanner-header">
              <h3><span className="title-icon">📷</span> Escáner de Códigos</h3>
              <div className="formatos-ayuda">
                <span className="formato-badge area">9001-9012</span>
                <span className="formato-badge lote">V132274/IF2128</span>
                <span className="formato-badge lote">V134339/BV1012</span>
                <span className="formato-badge lote">Cualquier código</span>
              </div>
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
                  placeholder="V132274/IF2128, V134339/BV1012 o cualquier código..."
                  disabled={!modoEscaner}
                  autoComplete="off"
                />
                {codigoEscaneado && (
                  <button className="input-clear" onClick={() => setCodigoEscaneado('')}>✕</button>
                )}
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

            {(colaEscaneos.area || colaEscaneos.lote) && (
              <div className="queue-indicator">
                <div className="queue-items">
                  {colaEscaneos.area && (
                    <div className="queue-item area" style={{ borderColor: colaEscaneos.area.color }}>
                      <span className="item-icon">{colaEscaneos.area.icono}</span>
                      <span className="item-name">{colaEscaneos.area.nombre}</span>
                      <span className="item-code">{colaEscaneos.area.codigo}</span>
                    </div>
                  )}
                  <span className="queue-arrow">→</span>
                  {colaEscaneos.lote ? (
                    <div className="queue-item lote">
                      <span className="item-icon">📦</span>
                      <span className="item-name">{colaEscaneos.lote.id}</span>
                      <span className="item-code">{colaEscaneos.lote.codigo}</span>
                    </div>
                  ) : (
                    <div className="queue-item pending">
                      <span className="pending-icon">⏳</span>
                      <span>Esperando lote...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* KPI */}
        <div className="kpi-tiempo-real">
          <div className="kpi-item">
            <span className="kpi-icon">📊</span>
            <div className="kpi-content">
              <span className="kpi-label">En proceso</span>
              <span className="kpi-valor">{statsTiempoReal.wip}</span>
            </div>
            <div className="kpi-glow"></div>
          </div>
          <div className="kpi-item">
            <span className="kpi-icon">⚡</span>
            <div className="kpi-content">
              <span className="kpi-label">Eficiencia</span>
              <span className="kpi-valor">{statsTiempoReal.eficiencia}%</span>
            </div>
            <div className="kpi-glow"></div>
          </div>
          <div className="kpi-item">
            <span className="kpi-icon">📈</span>
            <div className="kpi-content">
              <span className="kpi-label">Progreso</span>
              <span className="kpi-valor">{statsTiempoReal.tiempoPromedio}%</span>
            </div>
            <div className="kpi-glow"></div>
          </div>
          <div className="kpi-item warning">
            <span className="kpi-icon">⚠️</span>
            <div className="kpi-content">
              <span className="kpi-label">Alertas</span>
              <span className="kpi-valor">{statsTiempoReal.alertasActivas}</span>
            </div>
            <div className="kpi-glow"></div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT CON SCROLL */}
      <main className="app-main" ref={mainContentRef}>
        {/* TABS Y FILTROS */}
        <div className="tabs-container">
          <div className="tabs-header">
            <div className="lotes-tabs">
              <button className={`tab-btn ${vistaLotes === 'activos' ? 'active' : ''}`} onClick={() => setVistaLotes('activos')}>
                <span className="tab-icon">📋</span> Activos
                <span className="tab-count">{lotes.filter(l => l.estado !== 'completado').length}</span>
                {vistaLotes === 'activos' && <span className="tab-glow"></span>}
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
                {(filtrosAvanzados.cliente || filtrosAvanzados.producto || filtrosAvanzados.prioridad !== 'todas') && (
                  <span className="filter-indicator"></span>
                )}
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
                <label>Cliente</label>
                <input type="text" placeholder="Buscar cliente..." value={filtrosAvanzados.cliente} onChange={(e) => setFiltrosAvanzados({...filtrosAvanzados, cliente: e.target.value})} />
              </div>
              <div className="filtro-group">
                <label>Producto</label>
                <input type="text" placeholder="Buscar producto..." value={filtrosAvanzados.producto} onChange={(e) => setFiltrosAvanzados({...filtrosAvanzados, producto: e.target.value})} />
              </div>
              <div className="filtro-group">
                <label>Prioridad</label>
                <select value={filtrosAvanzados.prioridad} onChange={(e) => setFiltrosAvanzados({...filtrosAvanzados, prioridad: e.target.value})}>
                  <option value="todas">Todas</option>
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="baja">Baja</option>
                </select>
              </div>
              <div className="filtro-group">
                <label>Fecha</label>
                <input type="date" value={filtrosAvanzados.fechaInicio} onChange={(e) => setFiltrosAvanzados({...filtrosAvanzados, fechaInicio: e.target.value})} />
              </div>
            </div>
          )}

          {/* LISTA DE LOTES */}
          {lotesFiltrados.length > 0 ? (
            <div className="lotes-horizontal">
              {lotesFiltrados.map(lote => {
                const areaActual = areas.find(a => a.nombre === lote.areaActual);
                
                return (
                  <div key={lote.id} className={`lote-card ${loteSeleccionado?.id === lote.id ? 'selected' : ''} ${lote.estado}`} onClick={() => setLoteSeleccionado(lote)} style={{ borderLeftColor: areaActual?.color }}>
                    {lote.alertas?.length > 0 && <span className="alerta-flotante">⚠️</span>}
                    <div className="card-header">
                      <div className="lote-info">
                        <span className="lote-id">{lote.id}</span>
                        <span className="lote-codigo" title={lote.codigo}>{lote.codigo}</span>
                      </div>
                      <span className={`status-badge ${lote.estado}`}>
                        {lote.estado === 'completado' ? '✅' : lote.estado === 'calidad' ? '🔍' : lote.estado === 'incompleto' ? '⚠️' : '⚙️'}
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
                      <span className="lote-tiempo" title="Tiempo restante">⏱️ {lote.tiempoRestante}</span>
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
                <p>Escanea cualquier código de lote para comenzar</p>
                <div className="formatos-ejemplos">
                  <code>V132274/IF2128</code>
                  <code>V134339/BV1012</code>
                  <code>NK-137</code>
                  <code>1001</code>
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
                <span className="ocupacion-total">
                  {Math.round(areas.reduce((acc, a) => acc + (lotes.filter(l => l.areaActual === a.nombre).length / a.capacidad * 100), 0) / areas.length)}%
                </span>
              </div>
            </div>

            <div className="areas-list">
              {areas.map(area => {
                const lotesEnArea = lotes.filter(l => l.areaActual === area.nombre).length;
                const ocupacion = (lotesEnArea / area.capacidad) * 100;
                const esAreaActiva = loteSeleccionado?.areaActual === area.nombre;
                return (
                  <div key={area.id} className={`area-item ${esAreaActiva ? 'activa' : ''}`} style={{ borderLeftColor: area.color }} onClick={() => { setCodigoEscaneado(area.codigo); inputRef.current?.focus(); }}>
                    <div className="area-icon-wrapper" style={{ background: area.color + '15' }}>
                      <span className="area-icon">{area.icono}</span>
                      {lotesEnArea > 0 && <span className="area-badge" style={{ background: area.color }}>{lotesEnArea}</span>}
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
                      <div className="area-footer">
                        <span className="area-capacidad">{lotesEnArea}/{area.capacidad}</span>
                      </div>
                    </div>
                    {esAreaActiva && <span className="area-glow" style={{ background: area.color }}></span>}
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
              <h2><span className="title-icon">⚡</span> Eventos</h2>
              <span className="events-count">{eventos.length}</span>
            </div>

            <div className="events-list">
              {eventos.length === 0 ? (
                <div className="no-events">
                  <span>⚡</span>
                  <p>Esperando eventos...</p>
                  <div className="pulse-dots"><span></span><span></span><span></span></div>
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
                        {evento.tipo === 'info' && 'ℹ️'}
                      </span>
                    </div>
                    <div className="event-content">
                      <span className="event-message">{evento.mensaje}</span>
                      <div className="event-footer">
                        <span className="event-time">{evento.timestamp}</span>
                        {evento.loteRef && <span className="event-lote">{evento.loteRef}</span>}
                      </div>
                    </div>
                    {evento.tipo === 'warning' && <span className="event-pulse"></span>}
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
                  {ultimoEscaneo.reingreso && (
                    <span className="scan-reingreso" title={`${ultimoEscaneo.veces}ª vez`}>↩️{ultimoEscaneo.veces > 1 ? ` x${ultimoEscaneo.veces}` : ''}</span>
                  )}
                </div>
              </div>
            )}

            <div className="simulation-panel">
              <h4><span className="title-icon">🎮</span> Simulador</h4>
              <div className="simulation-buttons">
                <button onClick={() => { const randomArea = areas[Math.floor(Math.random() * areas.length)]; setCodigoEscaneado(randomArea.codigo); setTimeout(() => procesarEscaneo(), 100); }} className="btn-area">
                  <span>📍</span> Simular área
                </button>
                <button onClick={() => { 
                  const formatos = [
                    `V132274/IF2128`,
                    `V134339/BV1012`,
                    `NK-137`,
                    `1001`,
                    `LOTE-001`
                  ];
                  const codigoSimulado = formatos[Math.floor(Math.random() * formatos.length)];
                  setCodigoEscaneado(codigoSimulado); 
                  setTimeout(() => procesarEscaneo(), 100); 
                }} className="btn-lote">
                  <span>📦</span> Simular lote
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* BOTÓN VOLVER ARRIBA */}
      <button className={`scroll-to-top ${showScrollTop ? 'visible' : ''}`} onClick={scrollToTop} title="Volver arriba">↑</button>

      {/* ESTILOS ADICIONALES */}
      <style>{`
        .formatos-ejemplos {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 16px;
        }
        
        .formatos-ejemplos code {
          background: var(--bg-tertiary);
          padding: 6px 12px;
          border-radius: 20px;
          font-family: monospace;
          font-size: 0.9rem;
          color: var(--primary-600);
          border: 1px solid var(--border);
        }
      `}</style>
    </div>
  );
};

export default TrazabilidadLotes;