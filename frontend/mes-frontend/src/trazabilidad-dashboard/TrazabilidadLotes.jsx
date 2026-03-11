import React, { useState, useEffect, useRef } from 'react';
import './TrazabilidadLotes.css';
import TrackingLote from './TrackingLote';

const TrazabilidadLotes = () => {
  const [lotes, setLotes] = useState([]);
  const [areas, setAreas] = useState([]);
  const [ultimoEscaneo, setUltimoEscaneo] = useState(null);
  const [colaEscaneos, setColaEscaneos] = useState({ area: null, lote: null });
  const [modoEscaner, setModoEscaner] = useState(true);
  const [eventos, setEventos] = useState([]);
  const [loteSeleccionado, setLoteSeleccionado] = useState(null);
  const [loteActivo, setLoteActivo] = useState(null);
  const [codigoEscaneado, setCodigoEscaneado] = useState('');
  const [mensajeEscaner, setMensajeEscaner] = useState('📡 Esperando código...');
  const [tipoMensaje, setTipoMensaje] = useState('info');
  const [vistaLotes, setVistaLotes] = useState('activos');
  const [filtroArea, setFiltroArea] = useState('todas');
  const [mostrarPanelAyuda, setMostrarPanelAyuda] = useState(true);
  const [statsTiempoReal, setStatsTiempoReal] = useState({
    lotesPorHora: 0,
    eficiencia: 0,
    tiempoPromedio: 0,
    alertasActivas: 0,
    productividad: 0,
    oee: 0,
    disponibilidad: 0,
    calidad: 0
  });
  const [notificaciones, setNotificaciones] = useState([]);
  const [graficoData, setGraficoData] = useState([]);
  const [filtrosAvanzados, setFiltrosAvanzados] = useState({
    fechaInicio: '',
    fechaFin: '',
    responsable: '',
    prioridad: 'todas'
  });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [modoOscuro, setModoOscuro] = useState(false);
  const [historialCompleto, setHistorialCompleto] = useState([]);
  const [alertasConfig, setAlertasConfig] = useState({
    email: true,
    sms: false,
    telegram: true
  });
  const [predicciones, setPredicciones] = useState({});
  const [incidencias, setIncidencias] = useState([]);
  const [camaras, setCamaras] = useState({});
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  
  // ===== NUEVOS ESTADOS PARA EL SERVIDOR =====
  const [servidorConectado, setServidorConectado] = useState(false);
  const [usandoServidor, setUsandoServidor] = useState(false);
  
  const inputRef = useRef(null);
  const headerRef = useRef(null);
  const wsRef = useRef(null);
  const notificacionesRef = useRef(null);

  // ============================================
  // CONFIGURACIÓN DE ÁREAS
  // ============================================
  const areasProduccion = [
    { id: 'AREA-001', codigo: '9001', nombre: 'Recepción', icono: '📦', color: '#3b82f6', orden: 1 },
    { id: 'AREA-002', codigo: '9002', nombre: 'Diseño', icono: '🎨', color: '#8b5cf6', orden: 2 },
    { id: 'AREA-003', codigo: '9003', nombre: 'Plotter', icono: '🖨️', color: '#ec4899', orden: 3 },
    { id: 'AREA-004', codigo: '9004', nombre: 'Corte', icono: '✂️', color: '#f59e0b', orden: 4 },
    { id: 'AREA-005', codigo: '9005', nombre: 'Sublimado', icono: '🔥', color: '#10b981', orden: 5 },
    { id: 'AREA-006', codigo: '9006', nombre: 'Colorimetría', icono: '🎯', color: '#6366f1', orden: 6 },
    { id: 'AREA-007', codigo: '9007', nombre: 'Preparacion', icono: '⚙️', color: '#14b8a6', orden: 7 },
    { id: 'AREA-008', codigo: '9008', nombre: 'Calidad', icono: '✅', color: '#a855f7', orden: 8 },
    { id: 'AREA-009', codigo: '9009', nombre: 'RH', icono: '👥', color: '#f43f5e', orden: 9 },
    { id: 'AREA-010', codigo: '9010', nombre: 'Logística', icono: '🚚', color: '#06b6d4', orden: 10 },
    { id: 'AREA-011', codigo: '9011', nombre: 'Almacén', icono: '🏢', color: '#d946ef', orden: 11 },
    { id: 'AREA-012', codigo: '9012', nombre: 'Incompleto', icono: '⚠️', color: '#f97316', orden: 12 }
  ];

  // ============================================
  // CONEXIÓN AL SERVIDOR WEB SOCKET
  // ============================================
  useEffect(() => {
    // 🔴 IMPORTANTE: CAMBIA ESTA URL POR LA DE TU CODESPACES
    const WS_URL = 'wss://glowing-lamp-r47wvpq4574fxv7j-8080.app.github.dev';
    
    console.log('🔌 Conectando a servidor...', WS_URL);
    
    const ws = new WebSocket(WS_URL);
    
    ws.onopen = () => {
      console.log('✅ Conectado al servidor');
      setServidorConectado(true);
      setUsandoServidor(true);
      agregarEvento('info', 'Conectado al servidor tiempo real');
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('📦 Recibido:', data.type);
      
      if (data.type === 'INIT') {
        // Datos iniciales del servidor
        const lotesServidor = data.data.lotes.map(l => ({
          id: l.id,
          codigo: l.codigo,
          producto: l.producto,
          cliente: l.cliente,
          cantidad: l.cantidad,
          fechaInicio: new Date().toLocaleString(),
          estado: l.estado || 'en_proceso',
          areaActual: l.areaActual || 'Recepción',
          progreso: l.progreso || 5,
          prioridad: l.prioridad || 'media',
          responsable: l.responsable || 'Sistema',
          tiempoRestante: '8h 00m',
          alertas: [],
          historial: []
        }));
        
        setLotes(lotesServidor);
        
        // Usar áreas del servidor o las nuestras
        if (data.data.areas && data.data.areas.length > 0) {
          const areasMapeadas = data.data.areas.map((nombre, index) => ({
            id: `AREA-${String(index + 1).padStart(3, '0')}`,
            codigo: String(9000 + index + 1),
            nombre: nombre,
            icono: ['📦', '🎨', '🖨️', '✂️', '🔥', '🎯', '⚙️', '✅', '🚚', '🏢'][index] || '📍',
            color: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#14b8a6', '#a855f7', '#06b6d4', '#d946ef'][index] || '#6b7280'
          }));
          setAreas(areasMapeadas);
        } else {
          setAreas(areasProduccion);
        }
        
        if (lotesServidor.length > 0) {
          setLoteSeleccionado(lotesServidor[0]);
          setLoteActivo(lotesServidor[0].id);
        }
      }
      
      if (data.type === 'ACTUALIZACION') {
        // Actualización en tiempo real
        const lotesActualizados = data.data.lotes.map(l => ({
          id: l.id,
          codigo: l.codigo,
          producto: l.producto,
          cliente: l.cliente,
          cantidad: l.cantidad,
          fechaInicio: new Date().toLocaleString(),
          estado: l.estado || 'en_proceso',
          areaActual: l.areaActual,
          progreso: l.progreso,
          prioridad: l.prioridad || 'media',
          responsable: l.responsable || 'Sistema',
          tiempoRestante: '8h 00m',
          alertas: []
        }));
        
        setLotes(lotesActualizados);
        
        if (data.data.ultimoMovimiento) {
          const { loteId, area } = data.data.ultimoMovimiento;
          setUltimoEscaneo({
            lote: loteId,
            area: area,
            fecha: new Date().toLocaleString()
          });
          
          setMensajeEscaner(`✅ ${loteId} → ${area}`);
          setTipoMensaje('exito');
          agregarEvento('exito', `✅ ${loteId} movido a ${area}`);
          
          if (navigator.vibrate) navigator.vibrate(100);
        }
      }
    };
    
    ws.onerror = (error) => {
      console.error('❌ Error WebSocket:', error);
      setServidorConectado(false);
      setUsandoServidor(false);
      setAreas(areasProduccion);
      agregarEvento('error', 'Error conectando al servidor - Usando modo local');
    };
    
    ws.onclose = () => {
      console.log('❌ Desconectado del servidor');
      setServidorConectado(false);
      setUsandoServidor(false);
      setAreas(areasProduccion);
      agregarEvento('error', 'Desconectado del servidor - Usando modo local');
    };
    
    wsRef.current = ws;
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // ============================================
  // SIMULACIÓN LOCAL (solo si no hay servidor)
  // ============================================
  useEffect(() => {
    // Solo ejecutar simulación si NO estamos usando el servidor
    if (usandoServidor) return;
    
    console.log('🎮 Usando modo local (simulación)');
    setAreas(areasProduccion);
    
    // LOTES DE EJEMPLO PARA MODO LOCAL
    const lotesIniciales = [
      {
        id: 'LOTE-001',
        codigo: '1001',
        producto: 'Camiseta MLB Yankees',
        cliente: 'Nike',
        cantidad: 150,
        fechaInicio: new Date().toLocaleString(),
        estado: 'en_proceso',
        areaActual: 'Recepción',
        progreso: 5,
        prioridad: 'alta',
        responsable: 'Carlos Ruiz',
        tiempoRestante: '8h 00m',
        alertas: [],
        historial: [
          { area: 'Recepción', codigoArea: '9001', fecha: new Date().toLocaleString(), operador: 'Ana López', actual: true }
        ]
      },
      {
        id: 'LOTE-002',
        codigo: '1002',
        producto: 'Gorra NBA Lakers',
        cliente: 'Adidas',
        cantidad: 75,
        fechaInicio: new Date().toLocaleString(),
        estado: 'en_proceso',
        areaActual: 'Recepción',
        progreso: 5,
        prioridad: 'media',
        responsable: 'María González',
        tiempoRestante: '8h 00m',
        alertas: [],
        historial: [
          { area: 'Recepción', codigoArea: '9001', fecha: new Date().toLocaleString(), operador: 'Ana López', actual: true }
        ]
      },
      {
        id: 'LOTE-003',
        codigo: '1003',
        producto: 'Uniforme NFL Patriots',
        cliente: 'Puma',
        cantidad: 200,
        fechaInicio: new Date().toLocaleString(),
        estado: 'en_proceso',
        areaActual: 'Recepción',
        progreso: 5,
        prioridad: 'alta',
        responsable: 'Juan Pérez',
        tiempoRestante: '8h 00m',
        alertas: [],
        historial: [
          { area: 'Recepción', codigoArea: '9001', fecha: new Date().toLocaleString(), operador: 'Ana López', actual: true }
        ]
      }
    ];

    setLotes(lotesIniciales);
    setHistorialCompleto(lotesIniciales.flatMap(l => l.historial));
    
    if (lotesIniciales.length > 0) {
      setLoteSeleccionado(lotesIniciales[0]);
      setLoteActivo(lotesIniciales[0].id);
    }

    // Simulación de estadísticas en modo local
    const intervaloStats = setInterval(() => {
      setStatsTiempoReal(prev => ({
        lotesPorHora: Math.floor(Math.random() * 20) + 15,
        eficiencia: Math.floor(Math.random() * 15) + 80,
        tiempoPromedio: Math.floor(Math.random() * 30) + 25,
        alertasActivas: lotes.filter(l => l.alertas?.length > 0).length,
        productividad: Math.floor(Math.random() * 20) + 75,
        oee: Math.floor(Math.random() * 15) + 80,
        disponibilidad: Math.floor(Math.random() * 10) + 85,
        calidad: Math.floor(Math.random() * 5) + 94
      }));

      generarDatosGrafico();
    }, 3000);

    return () => {
      clearInterval(intervaloStats);
    };
  }, [usandoServidor]); // Depende de usandoServidor

  // ============================================
  // GENERAR DATOS PARA GRÁFICO
  // ============================================
  const generarDatosGrafico = () => {
    const horas = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
    const datos = horas.map(hora => ({
      hora,
      valor: Math.floor(Math.random() * 50) + 50,
      meta: 85
    }));
    setGraficoData(datos);
  };

  // ============================================
  // CERRAR NOTIFICACIONES
  // ============================================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificacionesRef.current && !notificacionesRef.current.contains(event.target)) {
        setMostrarNotificaciones(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ============================================
  // ENFOCAR INPUT
  // ============================================
  useEffect(() => {
    if (modoEscaner && inputRef.current) {
      inputRef.current.focus();
    }
  }, [modoEscaner]);

  // ============================================
  // FUNCIONES AUXILIARES
  // ============================================
  const agregarEvento = (tipo, mensaje, loteRef = '') => {
    const nuevoEvento = {
      id: Date.now(),
      tipo,
      mensaje,
      loteRef,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setEventos(prev => [nuevoEvento, ...prev.slice(0, 19)]);

    if (tipo === 'warning' || tipo === 'error' || tipo === 'completado') {
      setNotificaciones(prev => [{
        id: Date.now(),
        mensaje,
        tipo,
        leida: false,
        tiempo: 'ahora'
      }, ...prev.slice(0, 4)]);
    }
  };

  const marcarNotificacionLeida = (id) => {
    setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
  };

  // ============================================
  // PROCESAR ESCANEO
  // ============================================
  const procesarEscaneo = () => {
    const codigo = codigoEscaneado.trim();
    if (!codigo) return;

    setMensajeEscaner(`⏳ Procesando: ${codigo}...`);
    setTipoMensaje('info');

    if (navigator.vibrate) navigator.vibrate(50);

    if (codigo.match(/^9\d{3}$/)) {
      procesarEscaneoArea(codigo);
    }
    else if (codigo.match(/^1\d{3}$/)) {
      procesarEscaneoLote(codigo);
    }
    else {
      setMensajeEscaner(`❌ Código inválido: ${codigo}`);
      setTipoMensaje('error');
      agregarEvento('error', `❌ Código inválido: ${codigo}`);
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
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
  // PROCESAR ESCANEO DE ÁREA
  // ============================================
  const procesarEscaneoArea = (codigoArea) => {
    const area = areas.find(a => a.codigo === codigoArea);

    if (area) {
      setMensajeEscaner(`✅ Área: ${area.nombre}`);
      setTipoMensaje('exito');
      agregarEvento('area', `📍 Área escaneada: ${area.nombre} [${area.codigo}]`);
      
      if (navigator.vibrate) navigator.vibrate(100);

      setColaEscaneos(prev => {
        const nuevaCola = { ...prev, area: area };
        
        if (prev.lote) {
          procesarMovimiento(area, prev.lote);
          return { area: null, lote: null };
        }
        
        setMensajeEscaner('⏳ Área guardada. Escanea el lote...');
        return nuevaCola;
      });
    } else {
      setMensajeEscaner(`❌ Área no encontrada: ${codigoArea}`);
      setTipoMensaje('error');
      agregarEvento('error', `❌ Área no encontrada: ${codigoArea}`);
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }
  };

  // ============================================
  // PROCESAR ESCANEO DE LOTE
  // ============================================
  const procesarEscaneoLote = (codigoLote) => {
    const lote = lotes.find(l => l.codigo === codigoLote);

    if (lote) {
      setMensajeEscaner(`✅ Lote: ${lote.id} - ${lote.producto}`);
      setTipoMensaje('exito');
      agregarEvento('lote', `📦 Lote escaneado: ${lote.id}`);
      
      setLoteSeleccionado(lote);
      setLoteActivo(lote.id);
      
      if (navigator.vibrate) navigator.vibrate(100);

      setColaEscaneos(prev => {
        const nuevaCola = { ...prev, lote: lote };
        
        if (prev.area) {
          procesarMovimiento(prev.area, lote);
          return { area: null, lote: null };
        }
        
        setMensajeEscaner('⏳ Lote guardado. Escanea el área...');
        return nuevaCola;
      });
    } else {
      if (window.confirm(`❌ Lote no encontrado.\n¿Desea crear un nuevo lote con código ${codigoLote}?`)) {
        crearNuevoLote(codigoLote);
      } else {
        setMensajeEscaner(`❌ Lote no encontrado: ${codigoLote}`);
        setTipoMensaje('error');
        agregarEvento('error', `❌ Lote no encontrado: ${codigoLote}`);
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      }
    }
  };

  // ============================================
  // PROCESAR MOVIMIENTO
  // ============================================
  const procesarMovimiento = (area, lote) => {
    // Si estamos conectados al servidor, enviar por WebSocket
    if (usandoServidor && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'MOVIMIENTO',
        payload: {
          loteId: lote.id,
          area: area.nombre
        }
      }));
      
      setMensajeEscaner(`📤 Enviando: ${lote.id} → ${area.nombre}`);
      setTipoMensaje('info');
      return;
    }
    
    // MODO LOCAL - Simular movimiento
    const vecesPasadas = lote.historial?.filter(h => h.codigoArea === area.codigo).length || 0;
    const esReingreso = vecesPasadas > 0;
    
    const nuevoHistorial = {
      area: area.nombre,
      codigoArea: area.codigo,
      fecha: new Date().toLocaleString(),
      operador: 'Operador Actual',
      actual: true,
      reingreso: esReingreso,
      numeroPaso: vecesPasadas + 1
    };

    setLotes(prevLotes => prevLotes.map(l => {
      if (l.id === lote.id) {
        const historialActualizado = (l.historial || []).map(h => ({ ...h, actual: false }));
        const nuevoEstado = area.id === 'AREA-011' ? 'completado' : 
                           area.id === 'AREA-012' ? 'incompleto' : 
                           area.id === 'AREA-008' ? 'calidad' : 'en_proceso';
        
        let nuevoProgreso;
        if (esReingreso) {
          nuevoProgreso = Math.max(0, Math.min(100, l.progreso + (Math.random() > 0.5 ? 5 : -3)));
        } else {
          nuevoProgreso = Math.min(100, l.progreso + 8);
        }

        return {
          ...l,
          areaActual: area.nombre,
          estado: nuevoEstado,
          progreso: nuevoProgreso,
          historial: [...historialActualizado, nuevoHistorial]
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
          Math.max(0, Math.min(100, prev.progreso + (Math.random() > 0.5 ? 5 : -3))) : 
          Math.min(100, prev.progreso + 8),
        historial: [...(prev.historial || []).map(h => ({ ...h, actual: false })), nuevoHistorial]
      };
    });

    if (esReingreso) {
      setMensajeEscaner(`↩️ ${lote.id} REINGRESA a ${area.nombre} (${vecesPasadas + 1}ª vez)`);
      setTipoMensaje('warning');
      agregarEvento('warning', `↩️ ${lote.id} reingresa a ${area.nombre} (${vecesPasadas + 1}ª vez)`, lote.id);
    } else {
      setMensajeEscaner(`✅ ${lote.id} → ${area.nombre}`);
      setTipoMensaje('exito');
      agregarEvento('exito', `✅ ${lote.id} movido a ${area.nombre}`, lote.id);
    }
    
    if (navigator.vibrate) navigator.vibrate(200);

    setUltimoEscaneo({
      lote: lote.id,
      area: area.nombre,
      fecha: new Date().toLocaleString(),
      reingreso: esReingreso,
      veces: vecesPasadas + 1
    });
  };

  // ============================================
  // CREAR NUEVO LOTE
  // ============================================
  const crearNuevoLote = (codigo) => {
    const nuevoLote = {
      id: `LOTE-${String(lotes.length + 1).padStart(3, '0')}`,
      codigo: codigo,
      producto: `Producto Nuevo ${lotes.length + 1}`,
      cliente: 'Pendiente',
      cantidad: 0,
      fechaInicio: new Date().toLocaleString(),
      estado: 'en_proceso',
      areaActual: 'Recepción',
      progreso: 5,
      prioridad: 'media',
      responsable: 'Sistema',
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
      ]
    };

    setLotes(prev => [...prev, nuevoLote]);
    setLoteSeleccionado(nuevoLote);
    setLoteActivo(nuevoLote.id);
    
    setMensajeEscaner(`🆕 Nuevo lote: ${nuevoLote.id}`);
    setTipoMensaje('exito');
    agregarEvento('nuevo', `🆕 Nuevo lote: ${nuevoLote.id}`);

    setUltimoEscaneo({
      lote: nuevoLote.id,
      area: 'Recepción',
      fecha: new Date().toLocaleString()
    });
  };

  // ============================================
  // FILTRAR LOTES
  // ============================================
  const lotesFiltrados = lotes.filter(lote => {
    if (vistaLotes === 'activos') return lote.estado !== 'completado';
    if (vistaLotes === 'completados') return lote.estado === 'completado';
    return true;
  }).filter(lote => {
    if (filtroArea === 'todas') return true;
    return lote.areaActual === filtroArea;
  }).filter(lote => {
    if (filtrosAvanzados.prioridad !== 'todas') {
      return lote.prioridad === filtrosAvanzados.prioridad;
    }
    return true;
  });

  return (
    <div className={`trazabilidad-container ${modoOscuro ? 'dark-mode' : ''}`}>
      {/* ===== HEADER FIJO ===== */}
      <header className="app-header" ref={headerRef}>
        <div className="header-top">
          <div className="header-left">
            <div className="logo-area">
              <span className="logo-icon">🏭</span>
              <h1 className="app-title">
                TEGRA ERP
                <span className="title-badge">
                  {usandoServidor ? '🌐 Modo Servidor' : '💻 Modo Local'}
                </span>
              </h1>
            </div>
            <div className="header-date">
              <span className="date-icon">📅</span>
              {new Date().toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }).replace(/^\w/, c => c.toUpperCase())}
            </div>
          </div>

          <div className="header-right">
            <button className="theme-toggle" onClick={() => setModoOscuro(!modoOscuro)}>
              {modoOscuro ? '☀️' : '🌙'}
            </button>

            {/* INDICADOR DE SERVIDOR */}
            <div className={`server-status ${servidorConectado ? 'connected' : 'disconnected'}`}>
              <span className="status-dot"></span>
              <span>{servidorConectado ? 'Servidor OK' : 'Sin servidor'}</span>
            </div>

            {/* NOTIFICACIONES */}
            <div className="notificaciones-wrapper" ref={notificacionesRef}>
              <button 
                className="notificaciones-icono"
                onClick={() => setMostrarNotificaciones(!mostrarNotificaciones)}
              >
                🔔
                {notificaciones.filter(n => !n.leida).length > 0 && (
                  <span className="notificaciones-badge">
                    {notificaciones.filter(n => !n.leida).length}
                  </span>
                )}
              </button>

              {mostrarNotificaciones && (
                <div className="notificaciones-dropdown">
                  <div className="notificaciones-header">
                    <h4>Notificaciones</h4>
                    <button onClick={() => setNotificaciones([])}>Limpiar</button>
                  </div>
                  <div className="notificaciones-lista">
                    {notificaciones.length === 0 ? (
                      <div className="no-notificaciones">No hay notificaciones</div>
                    ) : (
                      notificaciones.map(notif => (
                        <div 
                          key={notif.id} 
                          className={`notificacion-item ${notif.tipo} ${notif.leida ? 'leida' : ''}`}
                          onClick={() => marcarNotificacionLeida(notif.id)}
                        >
                          <span className="notif-icon">
                            {notif.tipo === 'warning' && '⚠️'}
                            {notif.tipo === 'error' && '❌'}
                            {notif.tipo === 'completado' && '🎉'}
                            {notif.tipo === 'info' && 'ℹ️'}
                            {notif.tipo === 'success' && '✅'}
                          </span>
                          <div className="notif-contenido">
                            <span className="notif-mensaje">{notif.mensaje}</span>
                            <span className="notif-tiempo">{notif.tiempo || 'ahora'}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className={`scanner-status ${modoEscaner ? 'active' : ''}`}>
              <span className="status-pulse"></span>
              <span>{modoEscaner ? 'Escáner activo' : 'Escáner inactivo'}</span>
            </div>

            <button 
              className={`scanner-toggle ${modoEscaner ? 'active' : ''}`}
              onClick={() => setModoEscaner(!modoEscaner)}
            >
              {modoEscaner ? '🔴 Desactivar' : '🟢 Activar'}
            </button>

            <button className="export-btn" onClick={() => alert('Exportar')}>
              📥 Exportar
            </button>

            <div className="user-profile">
              <div className="user-avatar">OP</div>
              <div className="user-info">
                <span className="user-name">Operador</span>
                <span className="user-role">Producción</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== PANEL DE ESCANEO ===== */}
        <div className="scanner-panel">
          <div className="scanner-container">
            <div className="scanner-input-group">
              <span className="scanner-icon">📷</span>
              <input
                ref={inputRef}
                type="text"
                className="scanner-input"
                value={codigoEscaneado}
                onChange={(e) => setCodigoEscaneado(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && procesarEscaneo()}
                placeholder="Escanea un código aquí (9001-9012 para áreas, 1001-1005 para lotes)"
                disabled={!modoEscaner}
              />
              <button 
                className="scanner-button"
                onClick={procesarEscaneo}
                disabled={!codigoEscaneado}
              >
                Procesar
              </button>
            </div>

            <div className={`scanner-message ${tipoMensaje}`}>
              {mensajeEscaner}
            </div>

            {(colaEscaneos.area || colaEscaneos.lote) && (
              <div className="queue-indicator">
                {colaEscaneos.area && (
                  <span className="queue-item" style={{ background: colaEscaneos.area.color + '20', color: colaEscaneos.area.color }}>
                    {colaEscaneos.area.icono} {colaEscaneos.area.nombre}
                  </span>
                )}
                <span className="queue-arrow">→</span>
                {colaEscaneos.lote ? (
                  <span className="queue-item" style={{ background: '#3b82f620', color: '#3b82f6' }}>
                    📦 {colaEscaneos.lote.id}
                  </span>
                ) : (
                  <span className="queue-item pending">Esperando lote...</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ===== KPI EN TIEMPO REAL ===== */}
        <div className="kpi-tiempo-real">
          <div className="kpi-item">
            <span className="kpi-label">Lotes/hora</span>
            <span className="kpi-valor">{statsTiempoReal.lotesPorHora}</span>
            <span className="kpi-trend positive">↑12%</span>
          </div>
          <div className="kpi-item">
            <span className="kpi-label">Eficiencia</span>
            <span className="kpi-valor">{statsTiempoReal.eficiencia}%</span>
            <span className="kpi-trend positive">↑5%</span>
          </div>
          <div className="kpi-item">
            <span className="kpi-label">OEE</span>
            <span className="kpi-valor">{statsTiempoReal.oee}%</span>
            <span className="kpi-trend positive">↑3%</span>
          </div>
          <div className="kpi-item">
            <span className="kpi-label">Calidad</span>
            <span className="kpi-valor">{statsTiempoReal.calidad}%</span>
            <span className="kpi-trend positive">↑1%</span>
          </div>
          <div className="kpi-item">
            <span className="kpi-label">Tiempo prom.</span>
            <span className="kpi-valor">{statsTiempoReal.tiempoPromedio} min</span>
            <span className="kpi-trend negative">↓3%</span>
          </div>
          <div className="kpi-item">
            <span className="kpi-label">Alertas</span>
            <span className="kpi-valor">{statsTiempoReal.alertasActivas}</span>
            <span className="kpi-trend warning">activas</span>
          </div>
        </div>
      </header>

      {/* ===== RESTO DEL CÓDIGO JSX (sin cambios) ===== */}
      <main className="app-main">
        {/* Tabs y filtros */}
        <div className="tabs-container">
          <div className="lotes-tabs">
            <button 
              className={`tab-btn ${vistaLotes === 'activos' ? 'active' : ''}`}
              onClick={() => setVistaLotes('activos')}
            >
              📋 Activos <span className="tab-count">{lotes.filter(l => l.estado !== 'completado').length}</span>
            </button>
            <button 
              className={`tab-btn ${vistaLotes === 'completados' ? 'active' : ''}`}
              onClick={() => setVistaLotes('completados')}
            >
              ✅ Completados <span className="tab-count">{lotes.filter(l => l.estado === 'completado').length}</span>
            </button>
            <button 
              className={`tab-btn ${vistaLotes === 'todos' ? 'active' : ''}`}
              onClick={() => setVistaLotes('todos')}
            >
              📊 Todos <span className="tab-count">{lotes.length}</span>
            </button>

            <button 
              className={`filter-toggle-btn ${mostrarFiltros ? 'active' : ''}`}
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
            >
              🔍 Filtros
            </button>

            <select 
              className="area-filter"
              value={filtroArea}
              onChange={(e) => setFiltroArea(e.target.value)}
            >
              <option value="todas">🌐 Todas las áreas</option>
              {areas.map(area => (
                <option key={area.id} value={area.nombre}>
                  {area.icono} {area.nombre}
                </option>
              ))}
            </select>
          </div>

          {mostrarFiltros && (
            <div className="filtros-avanzados">
              <input
                type="date"
                value={filtrosAvanzados.fechaInicio}
                onChange={(e) => setFiltrosAvanzados({...filtrosAvanzados, fechaInicio: e.target.value})}
                placeholder="Fecha inicio"
              />
              <input
                type="date"
                value={filtrosAvanzados.fechaFin}
                onChange={(e) => setFiltrosAvanzados({...filtrosAvanzados, fechaFin: e.target.value})}
                placeholder="Fecha fin"
              />
              <select
                value={filtrosAvanzados.prioridad}
                onChange={(e) => setFiltrosAvanzados({...filtrosAvanzados, prioridad: e.target.value})}
              >
                <option value="todas">Todas las prioridades</option>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
              <input
                type="text"
                placeholder="Responsable"
                value={filtrosAvanzados.responsable}
                onChange={(e) => setFiltrosAvanzados({...filtrosAvanzados, responsable: e.target.value})}
              />
            </div>
          )}

          {/* Lista horizontal de lotes */}
          <div className="lotes-horizontal">
            {lotesFiltrados.map(lote => (
              <div 
                key={lote.id} 
                className={`lote-card ${loteActivo === lote.id ? 'active' : ''} ${lote.estado} ${lote.alertas?.length > 0 ? 'con-alerta' : ''}`}
                onClick={() => {
                  setLoteSeleccionado(lote);
                  setLoteActivo(lote.id);
                }}
              >
                {lote.alertas?.length > 0 && (
                  <span className="alerta-icono">⚠️</span>
                )}
                <div className="lote-card-header">
                  <span className="lote-id">{lote.id}</span>
                  <span className={`lote-status ${lote.estado}`}></span>
                </div>
                <span className="lote-producto">{lote.producto}</span>
                <div className="lote-cliente">
                  <span>{lote.cliente}</span>
                  <span className="lote-cantidad">{lote.cantidad}</span>
                </div>
                <span className="lote-area">
                  {areas.find(a => a.nombre === lote.areaActual)?.icono} {lote.areaActual}
                </span>
                <div className="lote-progress">
                  <div className="progress-bar-mini">
                    <div className="progress-fill-mini" style={{ width: `${lote.progreso}%` }}></div>
                  </div>
                  <span className="progress-text-mini">{lote.progreso}%</span>
                </div>
                <div className="lote-footer">
                  <span className="lote-tiempo">⏱️ {lote.tiempoRestante}</span>
                  <span className="lote-responsable">👤 {lote.responsable}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grid principal */}
        <div className="main-grid">
          {/* Columna izquierda - Áreas */}
          <div className="areas-column">
            <div className="areas-header">
              <h2>Áreas de Producción</h2>
              <span className="areas-count">{areas.length}</span>
            </div>

            <div className="areas-list">
              {areas.map(area => {
                const lotesEnArea = lotes.filter(l => l.areaActual === area.nombre).length;
                const progresoArea = Math.floor(Math.random() * 100);
                return (
                  <div 
                    key={area.id} 
                    className="area-item"
                    style={{ borderLeftColor: area.color }}
                    onClick={() => {
                      setCodigoEscaneado(area.codigo);
                      inputRef.current?.focus();
                    }}
                  >
                    <div className="area-icon" style={{ background: area.color + '15', color: area.color }}>
                      {area.icono}
                    </div>
                    <div className="area-details">
                      <span className="area-name">{area.nombre}</span>
                      <div className="area-code">
                        <code>{area.codigo}</code>
                        <span className="copy-hint">📋</span>
                      </div>
                      <div className="area-metrics">
                        <span className="area-badge" style={{ background: area.color + '20', color: area.color }}>
                          {lotesEnArea} lote{lotesEnArea !== 1 ? 's' : ''}
                        </span>
                        <div className="area-progress-mini">
                          <div className="progress-mini-bar">
                            <div className="progress-mini-fill" style={{ width: `${progresoArea}%`, background: area.color }}></div>
                          </div>
                          <span className="progress-mini-text">{progresoArea}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mapa de calor de áreas */}
            <div className="heatmap-container">
              <h4>Mapa de calor - Producción</h4>
              <div className="heatmap-grid">
                {areas.slice(0, 6).map(area => (
                  <div key={area.id} className="heatmap-cell" style={{
                    background: `${area.color}${Math.floor(Math.random() * 50 + 30)}`,
                    opacity: 0.7
                  }}>
                    <span>{area.icono}</span>
                    <small>{Math.floor(Math.random() * 20 + 80)}%</small>
                  </div>
                ))}
              </div>
            </div>

            {/* Predicciones IA */}
            <div className="predicciones-container">
              <h4>🤖 Predicciones IA</h4>
              <div className="prediccion-item">
                <span>Producción esperada</span>
                <span className="prediccion-valor">156 lotes</span>
              </div>
              <div className="prediccion-item">
                <span>Cuello de botella</span>
                <span className="prediccion-valor warning">Corte</span>
              </div>
              <div className="prediccion-item">
                <span>Rendimiento estimado</span>
                <span className="prediccion-valor positive">92%</span>
              </div>
            </div>
          </div>

          {/* Columna central - Tracking */}
          <div className="tracking-column">
            <TrackingLote 
              loteSeleccionado={loteSeleccionado}
              areas={areas}
              predicciones={predicciones}
            />
            
            {loteSeleccionado && (
              <div className="camera-preview">
                <h4>📹 Vista en tiempo real - {loteSeleccionado.areaActual}</h4>
                <div className="camera-placeholder">
                  <span className="camera-icon">🎥</span>
                  <span>Transmisión en vivo</span>
                  <small>{loteSeleccionado.areaActual} - Estación {Math.floor(Math.random() * 5) + 1}</small>
                </div>
              </div>
            )}
          </div>

          {/* Columna derecha - Eventos y análisis */}
          <div className="events-column">
            <div className="events-header">
              <h2>Eventos en tiempo real</h2>
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
                    <div className="event-icon">
                      {evento.tipo === 'exito' && '✅'}
                      {evento.tipo === 'area' && '📍'}
                      {evento.tipo === 'lote' && '📦'}
                      {evento.tipo === 'error' && '❌'}
                      {evento.tipo === 'warning' && '⚠️'}
                      {evento.tipo === 'completado' && '🎉'}
                      {evento.tipo === 'nuevo' && '🆕'}
                      {evento.tipo === 'info' && 'ℹ️'}
                    </div>
                    <div className="event-content">
                      <span className="event-message">{evento.mensaje}</span>
                      <span className="event-time">{evento.timestamp}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {ultimoEscaneo && (
              <div className="last-scan">
                <h4>Último movimiento</h4>
                <div className="scan-card">
                  <span className="scan-lote">{ultimoEscaneo.lote}</span>
                  <span className="scan-arrow">→</span>
                  <span className="scan-area">{ultimoEscaneo.area}</span>
                  <span className="scan-time">{ultimoEscaneo.fecha}</span>
                  {ultimoEscaneo.reingreso && (
                    <span className="scan-reingreso" title={`${ultimoEscaneo.veces}ª vez en esta área`}>
                      ↩️{ultimoEscaneo.veces > 1 ? ` x${ultimoEscaneo.veces}` : ''}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Gráfico de producción */}
            <div className="grafico-container">
              <h4>Producción por hora</h4>
              <div className="grafico-barras">
                {graficoData.map((item, idx) => (
                  <div key={idx} className="barra-wrapper">
                    <div className="barra" style={{ height: `${item.valor}px` }}>
                      <span className="barra-valor">{item.valor}</span>
                    </div>
                    <span className="barra-hora">{item.hora}</span>
                  </div>
                ))}
              </div>
              <div className="meta-line">Meta: 85</div>
            </div>

            <div className="simulation-panel">
              <h4>Simulador de escaneo</h4>
              <div className="simulation-buttons">
                <button onClick={() => {
                  const areasDisponibles = areas.filter(a => a.id !== 'AREA-011');
                  const randomArea = areasDisponibles[Math.floor(Math.random() * areasDisponibles.length)];
                  setCodigoEscaneado(randomArea.codigo);
                  setTimeout(() => procesarEscaneo(), 100);
                }} className="btn-area">
                  📍 Simular área
                </button>
                <button onClick={() => {
                  const lotesActivos = lotes.filter(l => l.estado !== 'completado');
                  if (lotesActivos.length > 0) {
                    const randomLote = lotesActivos[Math.floor(Math.random() * lotesActivos.length)];
                    setCodigoEscaneado(randomLote.codigo);
                    setTimeout(() => procesarEscaneo(), 100);
                  }
                }} className="btn-lote">
                  📦 Simular lote
                </button>
              </div>
            </div>

            <div className="areas-summary">
              <h4>Resumen por área</h4>
              {areas.map(area => {
                const count = lotes.filter(l => l.areaActual === area.nombre).length;
                if (count === 0) return null;
                return (
                  <div key={area.id} className="summary-item">
                    <span className="summary-area" style={{ color: area.color }}>
                      {area.icono} {area.nombre}
                    </span>
                    <span className="summary-count">{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Alertas activas */}
            <div className="alertas-container">
              <h4>Alertas activas</h4>
              {lotes.filter(l => l.alertas?.length > 0).map(lote => (
                <div key={lote.id} className="alerta-item">
                  <span className="alerta-icono">⚠️</span>
                  <div className="alerta-contenido">
                    <span className="alerta-lote">{lote.id}</span>
                    <span className="alerta-desc">
                      {lote.alertas?.includes('materiales') ? 'Faltan materiales' : 
                       lote.alertas?.includes('retraso') ? 'Retraso en Preparacion' : 
                       'Atención requerida'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Incidencias recientes */}
            <div className="incidencias-container">
              <h4>Incidencias recientes</h4>
              {incidencias.slice(0, 3).map(inc => (
                <div key={inc.id} className="incidencia-item">
                  <span className="incidencia-icono">📌</span>
                  <div className="incidencia-contenido">
                    <span className="incidencia-lote">{inc.loteId}</span>
                    <span className="incidencia-desc">{inc.descripcion}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Configuración de alertas */}
            <div className="alertas-config">
              <h4>Notificaciones</h4>
              <label>
                <input 
                  type="checkbox" 
                  checked={alertasConfig.email}
                  onChange={(e) => setAlertasConfig({...alertasConfig, email: e.target.checked})}
                />
                📧 Email
              </label>
              <label>
                <input 
                  type="checkbox" 
                  checked={alertasConfig.sms}
                  onChange={(e) => setAlertasConfig({...alertasConfig, sms: e.target.checked})}
                />
                📱 SMS
              </label>
              <label>
                <input 
                  type="checkbox" 
                  checked={alertasConfig.telegram}
                  onChange={(e) => setAlertasConfig({...alertasConfig, telegram: e.target.checked})}
                />
                📨 Telegram
              </label>
            </div>
          </div>
        </div>
      </main>

      {/* CSS para el indicador de servidor */}
      <style jsx>{`
        .server-status {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 13px;
          margin-right: 10px;
        }
        .server-status.connected {
          background: #10b98120;
          color: #10b981;
        }
        .server-status.disconnected {
          background: #ef444420;
          color: #ef4444;
        }
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }
        .connected .status-dot {
          background: #10b981;
          box-shadow: 0 0 10px #10b981;
        }
        .disconnected .status-dot {
          background: #ef4444;
          box-shadow: 0 0 10px #ef4444;
        }
      `}</style>
    </div>
  );
};

export default TrazabilidadLotes;