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
  // INICIALIZAR DATOS
  // ============================================
  useEffect(() => {
    setAreas(areasProduccion);

    const lotesIniciales = [
      {
        id: 'LOTE-001',
        codigo: '1001',
        producto: 'Camiseta MLB Yankees',
        cliente: 'Nike',
        cantidad: 150,
        fechaInicio: '2024-02-26 08:30',
        estado: 'en_proceso',
        areaActual: 'Sublimado',
        progreso: 65,
        prioridad: 'alta',
        responsable: 'Carlos Ruiz',
        tiempoRestante: '2h 15m',
        alertas: [],
        historial: [
          { area: 'Recepción', codigoArea: '9001', fecha: '2024-02-26 08:30', operador: 'Ana López' },
          { area: 'Diseño', codigoArea: '9002', fecha: '2024-02-26 09:45', operador: 'Pedro Sánchez' },
          { area: 'Plotter', codigoArea: '9003', fecha: '2024-02-26 10:30', operador: 'María García' },
          { area: 'Corte', codigoArea: '9004', fecha: '2024-02-26 11:20', operador: 'Juan Pérez' },
          { area: 'Sublimado', codigoArea: '9005', fecha: '2024-02-26 13:15', operador: 'Roberto Díaz', actual: true }
        ]
      },
      {
        id: 'LOTE-002',
        codigo: '1002',
        producto: 'Gorra NBA Lakers',
        cliente: 'Adidas',
        cantidad: 75,
        fechaInicio: '2024-02-26 09:15',
        estado: 'en_proceso',
        areaActual: 'Colorimetría',
        progreso: 45,
        prioridad: 'media',
        responsable: 'María González',
        tiempoRestante: '4h 30m',
        alertas: ['retraso'],
        historial: [
          { area: 'Recepción', codigoArea: '9001', fecha: '2024-02-26 09:15', operador: 'Ana López' },
          { area: 'Diseño', codigoArea: '9002', fecha: '2024-02-26 10:30', operador: 'Pedro Sánchez' },
          { area: 'Plotter', codigoArea: '9003', fecha: '2024-02-26 11:45', operador: 'María García' },
          { area: 'Colorimetría', codigoArea: '9006', fecha: '2024-02-26 13:00', operador: 'Laura Martínez', actual: true }
        ]
      },
      {
        id: 'LOTE-003',
        codigo: '1003',
        producto: 'Uniforme NFL Patriots',
        cliente: 'Puma',
        cantidad: 200,
        fechaInicio: '2024-02-26 10:00',
        estado: 'calidad',
        areaActual: 'Calidad',
        progreso: 85,
        prioridad: 'alta',
        responsable: 'Juan Pérez',
        tiempoRestante: '1h 00m',
        alertas: [],
        historial: [
          { area: 'Recepción', codigoArea: '9001', fecha: '2024-02-26 10:00', operador: 'Ana López' },
          { area: 'Diseño', codigoArea: '9002', fecha: '2024-02-26 11:15', operador: 'Pedro Sánchez' },
          { area: 'Plotter', codigoArea: '9003', fecha: '2024-02-26 12:30', operador: 'María García' },
          { area: 'Corte', codigoArea: '9004', fecha: '2024-02-26 14:00', operador: 'Juan Pérez' },
          { area: 'Sublimado', codigoArea: '9005', fecha: '2024-02-26 15:30', operador: 'Roberto Díaz' },
          { area: 'Colorimetría', codigoArea: '9006', fecha: '2024-02-26 16:45', operador: 'Laura Martínez' },
          { area: 'Preparacion', codigoArea: '9007', fecha: '2024-02-26 17:30', operador: 'Carlos Ruiz' },
          { area: 'Calidad', codigoArea: '9008', fecha: '2024-02-26 18:15', operador: 'Ana López', actual: true }
        ]
      },
      {
        id: 'LOTE-004',
        codigo: '1004',
        producto: 'Sudadera NHL Bruins',
        cliente: 'Local',
        cantidad: 100,
        fechaInicio: '2024-02-26 11:30',
        estado: 'incompleto',
        areaActual: 'Incompleto',
        progreso: 38,
        prioridad: 'baja',
        responsable: 'Ana López',
        tiempoRestante: '6h 00m',
        alertas: ['materiales', 'urgente'],
        historial: [
          { area: 'Recepción', codigoArea: '9001', fecha: '2024-02-26 11:30', operador: 'Ana López' },
          { area: 'Diseño', codigoArea: '9002', fecha: '2024-02-26 12:45', operador: 'Pedro Sánchez' },
          { area: 'Incompleto', codigoArea: '9012', fecha: '2024-02-26 14:00', operador: 'Sistema', actual: true, observacion: 'Faltan materiales' }
        ]
      },
      {
        id: 'LOTE-005',
        codigo: '1005',
        producto: 'Jersey NBA Bulls',
        cliente: 'Nike',
        cantidad: 180,
        fechaInicio: '2024-02-26 08:00',
        estado: 'completado',
        areaActual: 'Logística',
        progreso: 100,
        prioridad: 'alta',
        responsable: 'Pedro Sánchez',
        tiempoRestante: '0h 00m',
        alertas: [],
        historial: [
          { area: 'Recepción', codigoArea: '9001', fecha: '2024-02-26 08:00', operador: 'Ana López' },
          { area: 'Diseño', codigoArea: '9002', fecha: '2024-02-26 09:15', operador: 'Pedro Sánchez' },
          { area: 'Plotter', codigoArea: '9003', fecha: '2024-02-26 10:30', operador: 'María García' },
          { area: 'Corte', codigoArea: '9004', fecha: '2024-02-26 11:45', operador: 'Juan Pérez' },
          { area: 'Sublimado', codigoArea: '9005', fecha: '2024-02-26 13:00', operador: 'Roberto Díaz' },
          { area: 'Colorimetría', codigoArea: '9006', fecha: '2024-02-26 14:15', operador: 'Laura Martínez' },
          { area: 'Preparacion', codigoArea: '9007', fecha: '2024-02-26 15:30', operador: 'Carlos Ruiz' },
          { area: 'Calidad', codigoArea: '9008', fecha: '2024-02-26 16:45', operador: 'Ana López' },
          { area: 'RH', codigoArea: '9009', fecha: '2024-02-26 17:30', operador: 'Sistema RH' },
          { area: 'Logística', codigoArea: '9010', fecha: '2024-02-26 18:15', operador: 'Logística', actual: true },
          { area: 'Almacén', codigoArea: '9011', fecha: '2024-02-26 19:00', operador: 'Almacén' }
        ]
      }
    ];

    setLotes(lotesIniciales);
    setHistorialCompleto(lotesIniciales.flatMap(l => l.historial));
    
    if (lotesIniciales.length > 0) {
      setLoteSeleccionado(lotesIniciales[0]);
      setLoteActivo(lotesIniciales[0].id);
    }

    generarDatosGrafico();
    generarPredicciones();
  }, []);

  // ============================================
  // CERRAR NOTIFICACIONES AL HACER CLICK FUERA
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
  // SIMULACIÓN DE TIEMPO REAL
  // ============================================
  useEffect(() => {
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

      if (Math.random() > 0.7) {
        const tipos = ['info', 'success', 'warning', 'error'];
        const mensajes = [
          '📊 Producción en aumento',
          '⚡ Nueva orden de trabajo',
          '✅ Lote completado',
          '⚠️ Mantenimiento preventivo',
          '📦 Material recibido',
          '🔧 Máquina en reparación',
          '📈 Meta de producción alcanzada',
          '🎯 Objetivo del día cumplido'
        ];
        const randomTipo = tipos[Math.floor(Math.random() * tipos.length)];
        const randomMensaje = mensajes[Math.floor(Math.random() * mensajes.length)];
        
        agregarEvento(randomTipo, randomMensaje);

        if (randomTipo === 'warning' || randomTipo === 'error') {
          enviarAlerta(randomTipo, randomMensaje);
        }
      }

      setLotes(prev => prev.map(lote => {
        if (lote.estado !== 'completado' && Math.random() > 0.8) {
          return {
            ...lote,
            progreso: Math.min(100, lote.progreso + 1)
          };
        }
        return lote;
      }));

      generarDatosGrafico();
    }, 3000);

    wsRef.current = {
      send: (data) => console.log('WebSocket enviado:', data),
      close: () => console.log('WebSocket cerrado')
    };

    return () => {
      clearInterval(intervaloStats);
      if (wsRef.current) wsRef.current.close();
    };
  }, [lotes]);

  // ============================================
  // GENERAR PREDICCIONES IA
  // ============================================
  const generarPredicciones = () => {
    const pred = {
      'LOTE-001': { tiempoEstimado: '2h 15m', confianza: 85, alerta: 'ninguna' },
      'LOTE-002': { tiempoEstimado: '4h 30m', confianza: 65, alerta: 'retraso' },
      'LOTE-003': { tiempoEstimado: '1h 00m', confianza: 95, alerta: 'ninguna' },
      'LOTE-004': { tiempoEstimado: '6h 00m', confianza: 45, alerta: 'critico' }
    };
    setPredicciones(pred);
  };

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
  // ENVIAR ALERTA
  // ============================================
  const enviarAlerta = (tipo, mensaje) => {
    if (alertasConfig.email) {
      console.log('📧 Email enviado:', mensaje);
    }
    if (alertasConfig.sms) {
      console.log('📱 SMS enviado:', mensaje);
    }
    if (alertasConfig.telegram) {
      console.log('📨 Telegram enviado:', mensaje);
    }
  };

  // ============================================
  // AGREGAR INCIDENCIA
  // ============================================
  const agregarIncidencia = (loteId, tipo, descripcion) => {
    const nuevaIncidencia = {
      id: Date.now(),
      loteId,
      tipo,
      descripcion,
      fecha: new Date().toLocaleString(),
      estado: 'abierta',
      fotos: []
    };
    setIncidencias(prev => [nuevaIncidencia, ...prev]);
    agregarEvento('warning', `⚠️ Incidencia en ${loteId}: ${descripcion}`);
  };

  // ============================================
  // EXPORTAR REPORTE
  // ============================================
  const exportarReporte = (formato) => {
    const data = {
      lotes,
      eventos,
      estadisticas: statsTiempoReal,
      fecha: new Date().toLocaleString()
    };
    
    if (formato === 'pdf') {
      console.log('📄 Exportando PDF...', data);
      alert('Reporte PDF generado');
    } else if (formato === 'excel') {
      console.log('📊 Exportando Excel...', data);
      alert('Reporte Excel generado');
    }
  };

  // ============================================
  // ENFOCAR INPUT
  // ============================================
  useEffect(() => {
    if (modoEscaner && inputRef.current) {
      inputRef.current.focus();
    }
  }, [modoEscaner]);

  // ============================================
  // AGREGAR EVENTO
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

  // ============================================
  // MARCAR NOTIFICACIÓN COMO LEÍDA
  // ============================================
  const marcarNotificacionLeida = (id) => {
    setNotificaciones(prev => prev.map(n => 
      n.id === id ? { ...n, leida: true } : n
    ));
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
  // En lugar de bloquear, registramos el movimiento aunque ya haya pasado
  const yaPaso = lote.historial.some(h => h.codigoArea === area.codigo);
  
  // Registrar si es un reingreso
  const esReingreso = yaPaso;
  
  if (esReingreso) {
    // Mostramos una advertencia pero permitimos el movimiento
    setMensajeEscaner(`↩️ ${lote.id} REINGRESA a ${area.nombre}`);
    setTipoMensaje('warning');
    agregarEvento('warning', `↩️ ${lote.id} reingresa a ${area.nombre}`, lote.id);
    if (navigator.vibrate) navigator.vibrate(100);
  }

  // Contar cuántas veces ha pasado por esta área
  const vecesPasadas = lote.historial.filter(h => h.codigoArea === area.codigo).length;
  
  const nuevoHistorial = {
    area: area.nombre,
    codigoArea: area.codigo,
    fecha: new Date().toLocaleString(),
    operador: 'Operador Actual',
    actual: true,
    reingreso: esReingreso,
    numeroPaso: vecesPasadas + 1 // Indica si es la 1ra, 2da, etc. vez
  };

  setLotes(prevLotes => prevLotes.map(l => {
    if (l.id === lote.id) {
      // Marcar todos los historiales anteriores como no actuales
      const historialActualizado = l.historial.map(h => ({
        ...h,
        actual: false
      }));

      // Determinar el estado basado en el área actual
      const nuevoEstado = area.id === 'AREA-011' ? 'completado' : 
                         area.id === 'AREA-012' ? 'incompleto' : 
                         area.id === 'AREA-008' ? 'calidad' : 
                         l.estado === 'completado' ? 'en_proceso' : // Si estaba completado y regresa
                         'en_proceso';

      // Ajustar progreso (puede subir o bajar dependiendo del contexto)
      let nuevoProgreso = l.progreso;
      if (esReingreso) {
        // Si reingresa, podría bajar el progreso o mantenerse
        nuevoProgreso = Math.max(0, l.progreso - 5); // Baja 5% al reingresar
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
      progreso: esReingreso ? Math.max(0, prev.progreso - 5) : Math.min(100, prev.progreso + 8),
      historial: [...prev.historial.map(h => ({ ...h, actual: false })), nuevoHistorial]
    };
  });

  setHistorialCompleto(prev => [nuevoHistorial, ...prev]);

  if (!esReingreso) {
    setMensajeEscaner(`✅ ${lote.id} → ${area.nombre}`);
    setTipoMensaje('exito');
    agregarEvento('exito', `✅ ${lote.id} movido a ${area.nombre}`, lote.id);
  }
  
  if (navigator.vibrate) navigator.vibrate(200);

  setUltimoEscaneo({
    lote: lote.id,
    area: area.nombre,
    fecha: new Date().toLocaleString(),
    reingreso: esReingreso
  });

  // Notificaciones especiales
  if (area.id === 'AREA-011') {
    agregarEvento('completado', `🎉 ¡Lote ${lote.id} COMPLETADO!`, lote.id);
    enviarAlerta('completado', `Lote ${lote.id} completado`);
  } else if (area.id === 'AREA-012') {
    agregarEvento('warning', `⚠️ Lote ${lote.id} marcado como incompleto`, lote.id);
  } else if (esReingreso) {
    agregarEvento('warning', `↩️ Lote ${lote.id} reingresó a ${area.nombre}`, lote.id);
  }
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
      progreso: 8,
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
                <span className="title-badge">Trazabilidad</span>
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

            {/* NOTIFICACIONES CORREGIDAS */}
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

            <button className="export-btn" onClick={() => exportarReporte('pdf')}>
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
                placeholder="Escanea un código aquí..."
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

      {/* ===== CONTENIDO CON SCROLL ===== */}
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
                {predicciones[lote.id] && predicciones[lote.id].alerta === 'critico' && (
                  <div className="prediccion-alerta">⚠️ Riesgo alto</div>
                )}
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
  
  {/* Cámara en tiempo real (simulada) - AHORA DENTRO DE LA COLUMNA */}
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
    </div>
  );
};

export default TrazabilidadLotes;