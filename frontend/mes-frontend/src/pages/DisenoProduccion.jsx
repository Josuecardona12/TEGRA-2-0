import React, { useState, useEffect, useRef } from 'react';
import './DisenoProduccion.css';

// ============================================
// CONFIGURACIÓN WEBSOCKET PARA TIEMPO REAL
// ============================================
const WS_URL = 'wss://glowing-lamp-r47wvpq4574fxv7j-8080.app.github.dev';

const DisenoProduccion = () => {
  // ================ ESTADOS PRINCIPALES ================
  const [vista, setVista] = useState('tablero');
  const [periodo, setPeriodo] = useState('dia');
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [turnoSeleccionado, setTurnoSeleccionado] = useState('todos');
  const [disenadorSeleccionado, setDisenadorSeleccionado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [showModalDetalle, setShowModalDetalle] = useState(false);
  const [disenoSeleccionado, setDisenoSeleccionado] = useState(null);
  const [modoOscuro, setModoOscuro] = useState(false);
  const [tiempoReal, setTiempoReal] = useState(new Date());
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [vistaDisenos, setVistaDisenos] = useState('grid');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [ordenarPor, setOrdenarPor] = useState('horaInicio');
  const [ordenDireccion, setOrdenDireccion] = useState('desc');
  
  // ================ ESTADOS PARA DOBLE ESCANEO ================
  const [codigoEscaneado, setCodigoEscaneado] = useState('');
  const [modoEscaner, setModoEscaner] = useState('inactivo');
  const [colaEscaneos, setColaEscaneos] = useState({ diseno: null, accion: null });
  const [mensajeEscaner, setMensajeEscaner] = useState('📡 Esperando código de diseño...');
  const [tipoMensaje, setTipoMensaje] = useState('info');
  const [animacionActiva, setAnimacionActiva] = useState(false);
  const [ultimoEscaneo, setUltimoEscaneo] = useState(null);
  const inputEscanerRef = useRef(null);

  // ================ ESTADOS DE CONEXIÓN WEBSOCKET ================
  const [conectado, setConectado] = useState(false);
  const [ultimoMovimiento, setUltimoMovimiento] = useState(null);
  const wsRef = useRef(null);

  const mainContentRef = useRef(null);
  const inputRef = useRef(null);

  // ================ CONEXIÓN WEBSOCKET ================
  useEffect(() => {
    console.log('🔌 DisenoProduccion conectando...');
    
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    
    ws.onopen = () => {
      console.log('✅ DisenoProduccion conectado');
      setConectado(true);
      agregarNotificacion('✅ Conectado al servidor de diseño', 'exito');
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📦 DisenoProduccion recibió:', data.type);
        
        if (data.type === 'INIT' || data.type === 'ACTUALIZACION') {
          const lotesData = data.data.lotes || [];
          
          if (data.data.ultimoMovimiento) {
            setUltimoMovimiento(data.data.ultimoMovimiento);
            agregarNotificacion(`🔄 ${data.data.ultimoMovimiento.loteId} → ${data.data.ultimoMovimiento.area}`, 'info');
          }
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('❌ Error WebSocket:', error);
      setConectado(false);
      agregarNotificacion('❌ Error de conexión con el servidor', 'error');
    };
    
    ws.onclose = () => {
      console.log('❌ DisenoProduccion desconectado');
      setConectado(false);
      agregarNotificacion('⚠️ Desconectado del servidor', 'info');
    };
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // ================ ENVIAR AL SERVIDOR ================
  const enviarAlServidor = (tipo, payload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: tipo, payload }));
      console.log('📤 Enviado:', tipo, payload);
    }
  };

  // ================ DATOS DE DISEÑADORES ================
  const [disenadores, setDisenadores] = useState([
    { 
      id: 'D001', 
      nombre: 'Carlos Ruiz', 
      avatar: 'CR',
      especialidad: 'Vectorial',
      experiencia: 8,
      eficiencia: 98,
      diseñosHoy: 0,
      tiempoPromedio: '0min',
      estado: 'disponible',
      color: '#3b82f6',
      turno: 'mañana',
      horario: '06:00 - 14:00',
      metricas: {
        diseñosCompletados: 0,
        tiempoTotal: 0,
        revisiones: 0,
        aprobaciones: 0
      }
    },
    { 
      id: 'D002', 
      nombre: 'María González', 
      avatar: 'MG',
      especialidad: 'Ilustración',
      experiencia: 6,
      eficiencia: 95,
      diseñosHoy: 0,
      tiempoPromedio: '0min',
      estado: 'disponible',
      color: '#8b5cf6',
      turno: 'mañana',
      horario: '06:00 - 14:00',
      metricas: {
        diseñosCompletados: 0,
        tiempoTotal: 0,
        revisiones: 0,
        aprobaciones: 0
      }
    },
    { 
      id: 'D003', 
      nombre: 'Juan Pérez', 
      avatar: 'JP',
      especialidad: 'Tipografía',
      experiencia: 5,
      eficiencia: 92,
      diseñosHoy: 0,
      tiempoPromedio: '0min',
      estado: 'disponible',
      color: '#ec4899',
      turno: 'tarde',
      horario: '14:00 - 22:00',
      metricas: {
        diseñosCompletados: 0,
        tiempoTotal: 0,
        revisiones: 0,
        aprobaciones: 0
      }
    },
    { 
      id: 'D004', 
      nombre: 'Ana López', 
      avatar: 'AL',
      especialidad: 'Fotocomposición',
      experiencia: 7,
      eficiencia: 97,
      diseñosHoy: 0,
      tiempoPromedio: '0min',
      estado: 'disponible',
      color: '#10b981',
      turno: 'tarde',
      horario: '14:00 - 22:00',
      metricas: {
        diseñosCompletados: 0,
        tiempoTotal: 0,
        revisiones: 0,
        aprobaciones: 0
      }
    },
    { 
      id: 'D005', 
      nombre: 'Pedro Sánchez', 
      avatar: 'PS',
      especialidad: 'Vectorial',
      experiencia: 4,
      eficiencia: 90,
      diseñosHoy: 0,
      tiempoPromedio: '0min',
      estado: 'disponible',
      color: '#f59e0b',
      turno: 'noche',
      horario: '22:00 - 06:00',
      metricas: {
        diseñosCompletados: 0,
        tiempoTotal: 0,
        revisiones: 0,
        aprobaciones: 0
      }
    },
    { 
      id: 'D006', 
      nombre: 'Laura Martínez', 
      avatar: 'LM',
      especialidad: 'Ilustración',
      experiencia: 9,
      eficiencia: 99,
      diseñosHoy: 0,
      tiempoPromedio: '0min',
      estado: 'disponible',
      color: '#6366f1',
      turno: 'noche',
      horario: '22:00 - 06:00',
      metricas: {
        diseñosCompletados: 0,
        tiempoTotal: 0,
        revisiones: 0,
        aprobaciones: 0
      }
    }
  ]);

  // ================ DATOS DE DISEÑOS CON SOPORTE PARA DOBLE ESCANEO ================
  const [disenos, setDisenos] = useState([
    // Ejemplos para pruebas con doble escaneo
    {
      id: 'DIS-001',
      codigo: 'DS-2403-001',
      nombre: 'Logo Corporativo Nike',
      cliente: 'Nike',
      disenador: 'D001',
      disenadorNombre: 'Carlos Ruiz',
      horaInicio: '08:30:45',
      horaFin: null,
      fechaInicio: '2026-03-17',
      fechaFin: null,
      turno: 'mañana',
      estado: 'en_proceso',
      prioridad: 'alta',
      tiempoEstimado: 120,
      tiempoReal: 45,
      progreso: 38,
      revisiones: 1,
      archivos: ['logo_v1.ai', 'logo_v2.ai'],
      observaciones: 'Primer escaneo: Inicio de diseño',
      comentarios: [
        { usuario: 'Carlos Ruiz', fecha: '08:35', texto: 'Iniciando bocetos' },
        { usuario: 'Carlos Ruiz', fecha: '09:15', texto: 'Revisión de colores' }
      ],
      primerEscaneo: { timestamp: '2026-03-17T08:30:45', usuario: 'Carlos Ruiz' },
      segundoEscaneo: null,
      etiquetas: ['urgente', 'premium']
    },
    {
      id: 'DIS-002',
      codigo: 'DS-2403-002',
      nombre: 'Banner Publicitario Adidas',
      cliente: 'Adidas',
      disenador: 'D003',
      disenadorNombre: 'Juan Pérez',
      horaInicio: '09:15:20',
      horaFin: '11:30:10',
      fechaInicio: '2026-03-17',
      fechaFin: '2026-03-17',
      turno: 'mañana',
      estado: 'completado',
      prioridad: 'media',
      tiempoEstimado: 150,
      tiempoReal: 135,
      progreso: 100,
      revisiones: 2,
      archivos: ['banner_final.ai', 'banner_export.png'],
      observaciones: 'Completado en tiempo récord',
      comentarios: [
        { usuario: 'Juan Pérez', fecha: '09:20', texto: 'Iniciando diseño' },
        { usuario: 'Juan Pérez', fecha: '10:45', texto: 'Primera revisión' },
        { usuario: 'Supervisor', fecha: '11:00', texto: 'Aprobado' }
      ],
      primerEscaneo: { timestamp: '2026-03-17T09:15:20', usuario: 'Juan Pérez' },
      segundoEscaneo: { timestamp: '2026-03-17T11:30:10', usuario: 'Juan Pérez' },
      etiquetas: ['completado', 'exitoso']
    },
    {
      id: 'DIS-003',
      codigo: 'DS-2403-003',
      nombre: 'Packaging run',
      cliente: 'Running',
      disenador: 'D002',
      disenadorNombre: 'María González',
      horaInicio: '10:45:30',
      horaFin: null,
      fechaInicio: '2026-03-17',
      fechaFin: null,
      turno: 'mañana',
      estado: 'en_proceso',
      prioridad: 'alta',
      tiempoEstimado: 180,
      tiempoReal: 60,
      progreso: 33,
      revisiones: 0,
      archivos: [],
      observaciones: 'Diseño de packaging ecológico',
      comentarios: [
        { usuario: 'María González', fecha: '10:50', texto: 'Investigando referencias' }
      ],
      primerEscaneo: { timestamp: '2026-03-17T10:45:30', usuario: 'María González' },
      segundoEscaneo: null,
      etiquetas: ['ecologico', 'nuevo']
    }
  ]);

  // ================ DATOS DE PRODUCCIÓN POR HORA ================
  const [produccionHora, setProduccionHora] = useState(
    Array.from({ length: 24 }, (_, i) => {
      const hora = i;
      // Simular datos para las horas con actividad
      const diseñosPorHora = [0, 0, 0, 0, 0, 0, 2, 5, 8, 12, 15, 18, 16, 14, 12, 10, 8, 6, 4, 2, 1, 0, 0, 0];
      return {
        hora: i,
        rango: `${String(i).padStart(2, '0')}:00 - ${String(i + 1).padStart(2, '0')}:00`,
        diseños: diseñosPorHora[i],
        disenadores: [],
        tiempoPromedio: Math.floor(Math.random() * 30) + 30,
        eficiencia: Math.floor(Math.random() * 20) + 80
      };
    })
  );

  // ================ DATOS DE TURNOS ================
  const [turnos, setTurnos] = useState([
    {
      id: 'turno-1',
      nombre: 'Turno Mañana',
      horario: '06:00 - 14:00',
      disenadores: ['D001', 'D002'],
      produccion: 0,
      eficiencia: 0,
      estado: 'activo',
      color: '#3b82f6'
    },
    {
      id: 'turno-2',
      nombre: 'Turno Tarde',
      horario: '14:00 - 22:00',
      disenadores: ['D003', 'D004'],
      produccion: 0,
      eficiencia: 0,
      estado: 'inactivo',
      color: '#f59e0b'
    },
    {
      id: 'turno-3',
      nombre: 'Turno Noche',
      horario: '22:00 - 06:00',
      disenadores: ['D005', 'D006'],
      produccion: 0,
      eficiencia: 0,
      estado: 'inactivo',
      color: '#8b5cf6'
    }
  ]);

  // ================ NOTIFICACIONES ================
  const [notificaciones, setNotificaciones] = useState([]);

  const agregarNotificacion = (mensaje, tipo = 'info') => {
    const id = Date.now();
    setNotificaciones(prev => [...prev, { id, mensaje, tipo }]);
    setTimeout(() => {
      setNotificaciones(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  // ================ ESTADÍSTICAS GENERALES ================
  const calcularStats = () => {
    const hoy = new Date().toISOString().split('T')[0];
    const disenosHoy = disenos.filter(d => d.fechaInicio === hoy).length;
    const disenosCompletados = disenos.filter(d => d.estado === 'completado').length;
    const disenosEnProceso = disenos.filter(d => d.estado === 'en_proceso').length;
    
    const tiempoTotal = disenos
      .filter(d => d.estado === 'completado')
      .reduce((acc, d) => acc + (d.tiempoReal || 0), 0);
    
    const tiempoPromedio = disenosCompletados > 0 
      ? Math.round(tiempoTotal / disenosCompletados) 
      : 0;

    const diseñosPorTurno = {
      mañana: disenos.filter(d => d.turno === 'mañana').length,
      tarde: disenos.filter(d => d.turno === 'tarde').length,
      noche: disenos.filter(d => d.turno === 'noche').length
    };

    return {
      totalDisenos: disenos.length,
      disenosHoy,
      disenosSemana: disenos.length, // Simplificado
      disenosMes: disenos.length, // Simplificado
      tiempoPromedio,
      eficienciaGlobal: disenosCompletados > 0 
        ? Math.round((disenosCompletados / disenos.length) * 100) 
        : 0,
      disenadoresActivos: disenadores.filter(d => d.estado === 'ocupado').length,
      turnosActivos: turnos.filter(t => t.estado === 'activo').length,
      produccionPorHora: produccionHora.reduce((acc, h) => acc + h.diseños, 0),
      picoProduccion: {
        hora: `${String(produccionHora.reduce((max, h) => h.diseños > max.diseños ? h : max, produccionHora[0]).hora)}:00`,
        cantidad: produccionHora.reduce((max, h) => Math.max(max, h.diseños), 0)
      },
      diseñosPorTurno
    };
  };

  const [stats, setStats] = useState(calcularStats());

  // Actualizar stats cuando cambien los datos
  useEffect(() => {
    setStats(calcularStats());
  }, [disenos, disenadores, turnos, produccionHora]);

  // ================ EFECTOS ================
  useEffect(() => {
    const timer = setInterval(() => {
      setTiempoReal(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Detectar scroll
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

  const scrollToTop = () => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Cargar preferencias
  useEffect(() => {
    const modoGuardado = localStorage.getItem('modoOscuroDiseno') === 'true';
    setModoOscuro(modoGuardado);
  }, []);

  useEffect(() => {
    localStorage.setItem('modoOscuroDiseno', modoOscuro);
  }, [modoOscuro]);

  // Enfocar input del escáner cuando está activo
  useEffect(() => {
    if (modoEscaner === 'activo' && inputEscanerRef.current) {
      inputEscanerRef.current.focus();
    }
  }, [modoEscaner]);

  // ================ FUNCIONES DEL ESCÁNER DE DOBLE PASO ================
  const activarEscaner = () => {
    setModoEscaner('activo');
    setMensajeEscaner('📷 Escáner activado - Esperando código...');
    setTipoMensaje('info');
    agregarNotificacion('📷 Escáner de diseño activado', 'info');
    setTimeout(() => {
      if (inputEscanerRef.current) {
        inputEscanerRef.current.focus();
      }
    }, 100);
  };

  const desactivarEscaner = () => {
    setModoEscaner('inactivo');
    setColaEscaneos({ diseno: null, accion: null });
    setMensajeEscaner('📡 Escáner desactivado');
    setTipoMensaje('info');
    setCodigoEscaneado('');
    agregarNotificacion('⏹️ Escáner desactivado', 'info');
  };

  const procesarEscaneo = () => {
    const codigo = codigoEscaneado.trim().toUpperCase();
    if (!codigo) {
      setAnimacionActiva(true);
      setTimeout(() => setAnimacionActiva(false), 500);
      setMensajeEscaner('⚠️ Ingresa un código válido');
      setTipoMensaje('error');
      return;
    }

    setAnimacionActiva(true);
    setTimeout(() => setAnimacionActiva(false), 500);
    
    // Buscar el diseño por código
    const disenoExistente = disenos.find(d => d.codigo === codigo);

    if (!disenoExistente) {
      // PRIMER ESCANEO: Crear nuevo diseño
      const nuevoDiseno = crearNuevoDiseno(codigo);
      setMensajeEscaner(`✅ PRIMER ESCANEO: Diseño ${codigo} iniciado`);
      setTipoMensaje('success');
      setUltimoEscaneo({ codigo, tipo: 'primer', diseno: nuevoDiseno, hora: tiempoReal.toLocaleTimeString() });
      agregarNotificacion(`🎨 Diseño ${codigo} iniciado - Primer escaneo`, 'exito');
      enviarAlServidor('PRIMER_ESCANEO', { codigo, diseno: nuevoDiseno, timestamp: new Date().toISOString() });
      
      setCodigoEscaneado('');
      return;
    }

    if (disenoExistente && disenoExistente.estado === 'en_proceso') {
      // SEGUNDO ESCANEO: Finalizar diseño
      const disenoFinalizado = finalizarDiseno(disenoExistente);
      setMensajeEscaner(`✅ SEGUNDO ESCANEO: Diseño ${codigo} finalizado`);
      setTipoMensaje('success');
      setUltimoEscaneo({ codigo, tipo: 'segundo', diseno: disenoFinalizado, hora: tiempoReal.toLocaleTimeString() });
      agregarNotificacion(`✅ Diseño ${codigo} finalizado - Segundo escaneo`, 'exito');
      enviarAlServidor('SEGUNDO_ESCANEO', { 
        codigo, 
        diseno: disenoFinalizado, 
        timestamp: new Date().toISOString(),
        duracion: disenoFinalizado.tiempoReal 
      });
      
      setCodigoEscaneado('');
    } else if (disenoExistente && disenoExistente.estado === 'completado') {
      // Diseño ya finalizado - mostrar detalles
      setMensajeEscaner(`ℹ️ Diseño ${codigo} ya fue finalizado`);
      setTipoMensaje('info');
      setDisenoSeleccionado(disenoExistente);
      setShowModalDetalle(true);
      setUltimoEscaneo({ codigo, tipo: 'consulta', diseno: disenoExistente, hora: tiempoReal.toLocaleTimeString() });
      setCodigoEscaneado('');
    }
  };

  const crearNuevoDiseno = (codigo) => {
    const horaActual = tiempoReal.toLocaleTimeString();
    const fechaActual = tiempoReal.toISOString().split('T')[0];
    const turnoActual = determinarTurnoActual();
    
    // Buscar diseñador disponible del turno actual
    let disenadorAsignado = disenadores.find(d => 
      d.estado === 'disponible' && d.turno === turnoActual
    );
    
    // Si no hay disponible, asignar el primero del turno
    if (!disenadorAsignado) {
      disenadorAsignado = disenadores.find(d => d.turno === turnoActual) || disenadores[0];
    }

    const nuevoDiseno = {
      id: `DIS-${Date.now()}`,
      codigo: codigo,
      nombre: `Diseño ${codigo}`,
      cliente: 'Pendiente',
      disenador: disenadorAsignado.id,
      disenadorNombre: disenadorAsignado.nombre,
      horaInicio: horaActual,
      horaFin: null,
      fechaInicio: fechaActual,
      fechaFin: null,
      turno: turnoActual,
      estado: 'en_proceso',
      prioridad: 'media',
      tiempoEstimado: 120,
      tiempoReal: 0,
      progreso: 0,
      revisiones: 0,
      archivos: [],
      observaciones: `Primer escaneo: ${horaActual}`,
      comentarios: [
        { usuario: disenadorAsignado.nombre, fecha: horaActual, texto: 'Iniciando diseño' }
      ],
      primerEscaneo: { 
        timestamp: new Date().toISOString(), 
        usuario: disenadorAsignado.nombre,
        hora: horaActual 
      },
      segundoEscaneo: null,
      etiquetas: ['nuevo']
    };

    setDisenos([nuevoDiseno, ...disenos]);
    
    // Actualizar estadísticas del diseñador
    setDisenadores(prev => prev.map(d => 
      d.id === disenadorAsignado.id 
        ? { 
            ...d, 
            estado: 'ocupado', 
            diseñosHoy: d.diseñosHoy + 1,
            metricas: {
              ...d.metricas,
              diseñosCompletados: d.metricas.diseñosCompletados + 1
            }
          }
        : d
    ));

    // Actualizar producción por hora
    const horaActualNum = tiempoReal.getHours();
    setProduccionHora(prev => prev.map((h, i) => 
      i === horaActualNum 
        ? { ...h, diseños: h.diseños + 1 }
        : h
    ));

    return nuevoDiseno;
  };

  const finalizarDiseno = (diseno) => {
    const horaActual = tiempoReal.toLocaleTimeString();
    const fechaActual = tiempoReal.toISOString().split('T')[0];
    
    // Calcular tiempo real en minutos
    const inicio = new Date(`${fechaActual}T${diseno.horaInicio}`);
    const fin = new Date(`${fechaActual}T${horaActual}`);
    const tiempoRealMinutos = Math.round((fin - inicio) / 60000);

    const progresoFinal = 100;
    const comentarioFinal = `Diseño finalizado a las ${horaActual}`;

    const disenoFinalizado = {
      ...diseno,
      horaFin: horaActual,
      fechaFin: fechaActual,
      estado: 'completado',
      tiempoReal: tiempoRealMinutos,
      progreso: progresoFinal,
      segundoEscaneo: { 
        timestamp: new Date().toISOString(), 
        usuario: diseno.disenadorNombre,
        hora: horaActual 
      },
      comentarios: [
        ...diseno.comentarios,
        { usuario: diseno.disenadorNombre, fecha: horaActual, texto: comentarioFinal }
      ]
    };

    setDisenos(prev => prev.map(d => 
      d.id === diseno.id ? disenoFinalizado : d
    ));

    // Liberar diseñador y actualizar métricas
    setDisenadores(prev => prev.map(d => {
      if (d.id === diseno.disenador) {
        const diseñosCompletados = (d.metricas?.diseñosCompletados || 0) + 1;
        const tiempoTotal = (d.metricas?.tiempoTotal || 0) + tiempoRealMinutos;
        const promedio = Math.round(tiempoTotal / diseñosCompletados);
        
        return {
          ...d,
          estado: 'disponible',
          tiempoPromedio: `${promedio}min`,
          eficiencia: Math.min(100, d.eficiencia + 1),
          metricas: {
            ...d.metricas,
            diseñosCompletados,
            tiempoTotal
          }
        };
      }
      return d;
    }));

    return disenoFinalizado;
  };

  // ================ FUNCIONES AUXILIARES ================
  const determinarTurnoActual = () => {
    const hora = tiempoReal.getHours();
    if (hora >= 6 && hora < 14) return 'mañana';
    if (hora >= 14 && hora < 22) return 'tarde';
    return 'noche';
  };

  const getDisenadorById = (id) => {
    return disenadores.find(d => d.id === id);
  };

  const handleVerDetalle = (diseno) => {
    setDisenoSeleccionado(diseno);
    setShowModalDetalle(true);
  };

  const handleAgregarDiseno = () => {
    const nuevoCodigo = `DS-${String(disenos.length + 1).padStart(4, '0')}`;
    setCodigoEscaneado(nuevoCodigo);
    if (modoEscaner !== 'activo') {
      activarEscaner();
    } else {
      procesarEscaneo();
    }
  };

  const agregarComentario = (disenoId, texto) => {
    if (!texto.trim()) return;
    
    setDisenos(prev => prev.map(d => 
      d.id === disenoId
        ? {
            ...d,
            comentarios: [
              ...d.comentarios,
              { 
                usuario: 'Admin', 
                fecha: tiempoReal.toLocaleTimeString(), 
                texto: texto.trim() 
              }
            ]
          }
        : d
    ));
    agregarNotificacion('💬 Comentario agregado', 'exito');
  };

  const toggleEtiqueta = (disenoId, etiqueta) => {
    setDisenos(prev => prev.map(d => {
      if (d.id === disenoId) {
        const etiquetas = d.etiquetas || [];
        const nuevasEtiquetas = etiquetas.includes(etiqueta)
          ? etiquetas.filter(e => e !== etiqueta)
          : [...etiquetas, etiqueta];
        return { ...d, etiquetas: nuevasEtiquetas };
      }
      return d;
    }));
  };

  const handleEliminarDiseno = (disenoId) => {
    if (window.confirm('¿Estás seguro de eliminar este diseño?')) {
      setDisenos(prev => prev.filter(d => d.id !== disenoId));
      agregarNotificacion('🗑️ Diseño eliminado', 'info');
    }
  };

  const handleDuplicarDiseno = (diseno) => {
    const nuevoDiseno = {
      ...diseno,
      id: `DIS-${Date.now()}`,
      codigo: `${diseno.codigo}-COPY`,
      nombre: `${diseno.nombre} (Copia)`,
      estado: 'pendiente',
      progreso: 0,
      horaInicio: tiempoReal.toLocaleTimeString(),
      horaFin: null,
      fechaInicio: tiempoReal.toISOString().split('T')[0],
      fechaFin: null,
      primerEscaneo: null,
      segundoEscaneo: null,
      comentarios: [
        { usuario: 'Admin', fecha: tiempoReal.toLocaleTimeString(), texto: 'Copia del diseño original' }
      ]
    };
    setDisenos([nuevoDiseno, ...disenos]);
    agregarNotificacion('📋 Diseño duplicado', 'exito');
  };

  // ================ FILTROS ================
  const disenosFiltrados = disenos.filter(diseno => {
    if (turnoSeleccionado !== 'todos' && diseno.turno !== turnoSeleccionado) return false;
    if (disenadorSeleccionado !== 'todos' && diseno.disenador !== disenadorSeleccionado) return false;
    if (filtroEstado !== 'todos' && diseno.estado !== filtroEstado) return false;
    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase();
      return (
        diseno.nombre.toLowerCase().includes(busquedaLower) ||
        diseno.cliente.toLowerCase().includes(busquedaLower) ||
        diseno.id.toLowerCase().includes(busquedaLower) ||
        diseno.codigo.toLowerCase().includes(busquedaLower)
      );
    }
    return true;
  }).sort((a, b) => {
    if (ordenarPor === 'horaInicio') {
      return ordenDireccion === 'desc' 
        ? new Date(b.horaInicio) - new Date(a.horaInicio)
        : new Date(a.horaInicio) - new Date(b.horaInicio);
    }
    if (ordenarPor === 'progreso') {
      return ordenDireccion === 'desc'
        ? b.progreso - a.progreso
        : a.progreso - b.progreso;
    }
    return 0;
  });

  const disenadoresFiltrados = disenadores.filter(d => {
    if (turnoSeleccionado !== 'todos' && d.turno !== turnoSeleccionado) return false;
    if (busqueda) {
      return d.nombre.toLowerCase().includes(busqueda.toLowerCase());
    }
    return true;
  });

  return (
    <div className={`diseno-container ${modoOscuro ? 'dark-mode' : ''}`} ref={mainContentRef}>
      
      {/* ===== INDICADOR DE CONEXIÓN WEBSOCKET ===== */}
      <div className={`connection-status ${conectado ? 'connected' : 'disconnected'}`}>
        <span className="status-dot"></span>
        <span className="status-text">
          {conectado ? '🟢 Servidor Conectado' : '🟡 Modo Local'}
        </span>
      </div>

      {/* ===== NOTIFICACIÓN DE ÚLTIMO MOVIMIENTO ===== */}
      {ultimoMovimiento && (
        <div className="movimiento-notificacion">
          🔄 {ultimoMovimiento.loteId} → {ultimoMovimiento.area}
        </div>
      )}

      {/* ===== NOTIFICACIONES ===== */}
      <div className="notificaciones-container">
        {notificaciones.map(notif => (
          <div key={notif.id} className={`notificacion ${notif.tipo}`}>
            <span className="notificacion-icono">
              {notif.tipo === 'exito' && '✅'}
              {notif.tipo === 'error' && '❌'}
              {notif.tipo === 'info' && 'ℹ️'}
              {notif.tipo === 'alerta' && '⚠️'}
            </span>
            <span className="notificacion-mensaje">{notif.mensaje}</span>
          </div>
        ))}
      </div>

      {/* ===== HEADER PREMIUM ===== */}
      <header className="diseno-header">
        <div className="header-top">
          <div className="header-left">
            <div className="logo-area">
              <div className="logo-icon-wrapper">
                <span className="logo-icon">🎨</span>
                <span className="logo-glow"></span>
              </div>
              <div className="logo-text">
                <h1 className="app-title">
                  Diseño & Producción
                  <span className="title-badge">PRO</span>
                </h1>
                <span className="app-subtitle">Gestión de Diseñadores</span>
              </div>
            </div>
            
            <div className="header-date">
              <span className="date-icon">📅</span>
              <div className="date-info">
                <span className="date-full">
                  {tiempoReal.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }).replace(/^\w/, c => c.toUpperCase())}
                </span>
                <span className="time-full">
                  {tiempoReal.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            </div>
          </div>

          <div className="header-right">
            <button 
              className="theme-toggle" 
              onClick={() => setModoOscuro(!modoOscuro)}
              title={modoOscuro ? 'Modo claro' : 'Modo oscuro'}
            >
              <span>{modoOscuro ? '☀️' : '🌙'}</span>
            </button>

            <button 
              className="action-btn" 
              onClick={() => setVista(vista === 'tablero' ? 'lista' : 'tablero')}
              title={vista === 'tablero' ? 'Vista lista' : 'Vista tablero'}
            >
              {vista === 'tablero' ? '📋' : '📊'}
            </button>

            <button 
              className="action-btn" 
              onClick={() => activarEscaner()}
              title="Activar escáner"
            >
              📷
            </button>

            <div className="user-profile">
              <div className="user-avatar">
                <span>AD</span>
                <span className="avatar-status online"></span>
              </div>
              <div className="user-info">
                <span className="user-name">Admin</span>
                <span className="user-role">Supervisor</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== PANEL DE ESCÁNER DE DOBLE PASO ===== */}
        <div className="scanner-panel">
          <div className="scanner-header">
            <h3>
              <span className="title-icon">📷</span>
              Sistema de Doble Escaneo
            </h3>
            <div className="scanner-indicators">
              <span className={`scanner-mode ${modoEscaner === 'activo' ? 'active' : ''}`}>
                {modoEscaner === 'activo' ? '🔴 ESCANEANDO' : '⚪ INACTIVO'}
              </span>
            </div>
          </div>

          <div className="scanner-input-group">
            <div className="input-wrapper">
              <span className="input-icon">🔍</span>
              <input
                ref={inputEscanerRef}
                type="text"
                className={`scanner-input ${animacionActiva ? 'pulse' : ''}`}
                value={codigoEscaneado}
                onChange={(e) => setCodigoEscaneado(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && procesarEscaneo()}
                placeholder="Escanea código de diseño (DS-XXXX)..."
                disabled={modoEscaner !== 'activo'}
                autoComplete="off"
              />
              {codigoEscaneado && (
                <button className="input-clear" onClick={() => setCodigoEscaneado('')}>✕</button>
              )}
            </div>
            <div className="scanner-buttons">
              {modoEscaner === 'inactivo' ? (
                <button className="scanner-btn activar" onClick={activarEscaner}>
                  <span>▶️</span>
                  <span>Activar Escáner</span>
                </button>
              ) : (
                <button className="scanner-btn desactivar" onClick={desactivarEscaner}>
                  <span>⏹️</span>
                  <span>Desactivar</span>
                </button>
              )}
              <button className="scanner-btn procesar" onClick={procesarEscaneo} disabled={!codigoEscaneado}>
                <span>⚡</span>
                <span>Procesar</span>
              </button>
            </div>
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

          {ultimoEscaneo && (
            <div className="ultimo-escaneo">
              <span className="ultimo-label">Último escaneo:</span>
              <span className="ultimo-codigo">{ultimoEscaneo.codigo}</span>
              <span className="ultimo-tipo">
                {ultimoEscaneo.tipo === 'primer' ? '(1°)' : 
                 ultimoEscaneo.tipo === 'segundo' ? '(2°)' : '(consulta)'}
              </span>
              <span className="ultimo-hora">{ultimoEscaneo.hora}</span>
            </div>
          )}

          <div className="scanner-instrucciones">
            <div className={`instruccion-paso ${!colaEscaneos.diseno ? 'active' : ''}`}>
              <span className="paso-numero">1</span>
              <div className="paso-contenido">
                <strong>PRIMER ESCANEO</strong>
                <span>INICIAR DISEÑO</span>
                <small>Crea automáticamente un nuevo diseño</small>
              </div>
            </div>
            <div className="instruccion-paso">
              <span className="paso-numero">2</span>
              <div className="paso-contenido">
                <strong>SEGUNDO ESCANEO</strong>
                <span>FINALIZAR DISEÑO</span>
                <small>Registra tiempo real y métricas</small>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ===== KPI CARDS CON DATOS REALES ===== */}
      <div className="kpi-grid">
        <div className="kpi-card total">
          <div className="kpi-icon">🎨</div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.totalDisenos}</span>
            <span className="kpi-label">Total Diseños</span>
          </div>
          <div className="kpi-trend positive">+{stats.disenosHoy} hoy</div>
        </div>

        <div className="kpi-card hoy">
          <div className="kpi-icon">📅</div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.disenosHoy}</span>
            <span className="kpi-label">Diseños Hoy</span>
          </div>
          <div className="kpi-trend neutral">hoy</div>
        </div>

        <div className="kpi-card tiempo">
          <div className="kpi-icon">⏱️</div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.tiempoPromedio}min</span>
            <span className="kpi-label">Tiempo Promedio</span>
          </div>
          <div className="kpi-trend positive">óptimo</div>
        </div>

        <div className="kpi-card proceso">
          <div className="kpi-icon">⚡</div>
          <div className="kpi-content">
            <span className="kpi-value">{disenos.filter(d => d.estado === 'en_proceso').length}</span>
            <span className="kpi-label">En Proceso</span>
          </div>
          <div className="kpi-trend warning">activos</div>
        </div>

        <div className="kpi-card completados">
          <div className="kpi-icon">✅</div>
          <div className="kpi-content">
            <span className="kpi-value">{disenos.filter(d => d.estado === 'completado').length}</span>
            <span className="kpi-label">Completados</span>
          </div>
          <div className="kpi-trend success">hoy</div>
        </div>

        <div className="kpi-card pico">
          <div className="kpi-icon">📊</div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.picoProduccion.hora}</span>
            <span className="kpi-label">Pico Producción</span>
          </div>
          <div className="kpi-trend info">{stats.picoProduccion.cantidad} diseños</div>
        </div>
      </div>

      {/* ===== FILTROS AVANZADOS ===== */}
      <div className="filtros-panel">
        <div className="filtro-group">
          <input
            type="text"
            placeholder="🔍 Buscar diseño, código, cliente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="filtro-input"
          />
        </div>

        <div className="filtro-group">
          <select value={turnoSeleccionado} onChange={(e) => setTurnoSeleccionado(e.target.value)} className="filtro-select">
            <option value="todos">🌐 Todos los turnos</option>
            <option value="mañana">🌅 Turno Mañana</option>
            <option value="tarde">☀️ Turno Tarde</option>
            <option value="noche">🌙 Turno Noche</option>
          </select>
        </div>

        <div className="filtro-group">
          <select value={disenadorSeleccionado} onChange={(e) => setDisenadorSeleccionado(e.target.value)} className="filtro-select">
            <option value="todos">👥 Todos los diseñadores</option>
            {disenadores.map(d => (
              <option key={d.id} value={d.id}>{d.nombre}</option>
            ))}
          </select>
        </div>

        <div className="filtro-group">
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="filtro-select">
            <option value="todos">📋 Todos los estados</option>
            <option value="en_proceso">⚡ En Proceso</option>
            <option value="completado">✅ Completado</option>
          </select>
        </div>

        <div className="filtro-group">
          <select value={ordenarPor} onChange={(e) => setOrdenarPor(e.target.value)} className="filtro-select">
            <option value="horaInicio">⏰ Por hora inicio</option>
            <option value="progreso">📊 Por progreso</option>
          </select>
        </div>

        <button 
          className="filtro-direccion"
          onClick={() => setOrdenDireccion(prev => prev === 'desc' ? 'asc' : 'desc')}
          title={ordenDireccion === 'desc' ? 'Descendente' : 'Ascendente'}
        >
          {ordenDireccion === 'desc' ? '↓' : '↑'}
        </button>

        <button className="btn-agregar" onClick={handleAgregarDiseno}>
          <span>➕</span>
          <span>Nuevo Diseño</span>
        </button>
      </div>

      {/* ===== PRODUCCIÓN POR HORA ===== */}
      <div className="produccion-hora-container">
        <div className="section-header">
          <h2>
            <span className="header-icon">📊</span>
            Producción por Hora
          </h2>
          <div className="header-actions">
            <span className="actualizacion">Actualizado {tiempoReal.toLocaleTimeString()}</span>
            <span className="total-produccion">Total: {stats.produccionPorHora}</span>
          </div>
        </div>

        <div className="hora-grid">
          {produccionHora.map((hora, index) => (
            <div key={index} className={`hora-card ${hora.diseños > 0 ? 'activa' : ''}`}>
              <div className="hora-header">
                <span className="hora-tiempo">{hora.rango}</span>
                <span className="hora-cantidad">{hora.diseños} {hora.diseños === 1 ? 'diseño' : 'diseños'}</span>
              </div>
              <div className="hora-bar">
                <div 
                  className="hora-fill" 
                  style={{ width: `${(hora.diseños / Math.max(...produccionHora.map(h => h.diseños), 1)) * 100}%` }}
                ></div>
              </div>
              <div className="hora-footer">
                <span className="hora-tiempo-prom">⏱️ {hora.tiempoPromedio}min</span>
                <span className="hora-eficiencia">⚡ {hora.eficiencia}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== DISEÑADORES ===== */}
      <div className="disenadores-container">
        <div className="section-header">
          <h2>
            <span className="header-icon">👥</span>
            Diseñadores
          </h2>
          <div className="header-actions">
            <span className="disenadores-count">{disenadores.length} total</span>
            <span className="activos-count">{stats.disenadoresActivos} activos</span>
          </div>
        </div>

        <div className="disenadores-grid">
          {disenadoresFiltrados.map(disenador => (
            <div key={disenador.id} className={`disenador-card ${disenador.estado}`}>
              <div className="disenador-header">
                <div className="disenador-avatar" style={{ backgroundColor: disenador.color }}>
                  {disenador.avatar}
                </div>
                <div className="disenador-info">
                  <h3 className="disenador-nombre">{disenador.nombre}</h3>
                  <span className="disenador-especialidad">{disenador.especialidad}</span>
                </div>
                <span className={`disenador-estado-badge ${disenador.estado}`}>
                  {disenador.estado === 'disponible' ? '✅ Disponible' :
                   disenador.estado === 'ocupado' ? '⏳ Ocupado' : '⚪ Inactivo'}
                </span>
              </div>

              <div className="disenador-body">
                <div className="disenador-stats">
                  <div className="stat">
                    <span className="stat-label">Experiencia</span>
                    <span className="stat-valor">{disenador.experiencia} años</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Eficiencia</span>
                    <span className="stat-valor">{disenador.eficiencia}%</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Diseños hoy</span>
                    <span className="stat-valor">{disenador.diseñosHoy}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Tiempo prom.</span>
                    <span className="stat-valor">{disenador.tiempoPromedio}</span>
                  </div>
                </div>

                <div className="disenador-turno">
                  <span className="turno-icon">🕒</span>
                  <span className="turno-texto">{disenador.turno} - {disenador.horario}</span>
                </div>
              </div>

              <div className="disenador-footer">
                <button className="btn-ver-mas" onClick={() => {}}>
                  Ver detalles
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== LISTA DE DISEÑOS ===== */}
      <div className="disenos-container">
        <div className="section-header">
          <h2>
            <span className="header-icon">🎨</span>
            Diseños
          </h2>
          <div className="header-actions">
            <div className="vista-toggle">
              <button 
                className={`vista-btn ${vistaDisenos === 'grid' ? 'active' : ''}`}
                onClick={() => setVistaDisenos('grid')}
              >
                📱 Grid
              </button>
              <button 
                className={`vista-btn ${vistaDisenos === 'lista' ? 'active' : ''}`}
                onClick={() => setVistaDisenos('lista')}
              >
                📋 Lista
              </button>
            </div>
            <span className="result-count">{disenosFiltrados.length} resultados</span>
          </div>
        </div>

        {disenosFiltrados.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎨</div>
            <h3>No hay diseños</h3>
            <p>Activa el escáner y escanea un código para comenzar</p>
            <button className="btn-primary" onClick={activarEscaner}>
              📷 Activar Escáner
            </button>
          </div>
        ) : (
          <div className={`disenos-${vistaDisenos}`}>
            {vistaDisenos === 'grid' ? (
              <div className="disenos-grid">
                {disenosFiltrados.map(diseno => (
                  <div key={diseno.id} className={`diseno-card ${diseno.estado}`} onClick={() => handleVerDetalle(diseno)}>
                    <div className="diseno-header">
                      <div className="diseno-titulo">
                        <span className="diseno-codigo">{diseno.codigo}</span>
                        <span className={`diseno-estado-badge ${diseno.estado}`}>
                          {diseno.estado === 'en_proceso' ? '⚡' : '✅'}
                        </span>
                      </div>
                      <h3 className="diseno-nombre">{diseno.nombre}</h3>
                      <span className="diseno-cliente">{diseno.cliente}</span>
                    </div>

                    <div className="diseno-body">
                      <div className="diseno-info">
                        <div className="info-row">
                          <span>👤 Diseñador:</span>
                          <strong>{diseno.disenadorNombre}</strong>
                        </div>
                        <div className="info-row">
                          <span>⏰ Inicio:</span>
                          <strong>{diseno.horaInicio}</strong>
                        </div>
                        {diseno.horaFin && (
                          <div className="info-row">
                            <span>⏱️ Fin:</span>
                            <strong>{diseno.horaFin}</strong>
                          </div>
                        )}
                        {diseno.tiempoReal > 0 && (
                          <div className="info-row">
                            <span>⌛ Duración:</span>
                            <strong>{diseno.tiempoReal} min</strong>
                          </div>
                        )}
                      </div>

                      <div className="progreso-indicador">
                        <div className="progreso-header">
                          <span>Progreso</span>
                          <span className="progreso-porcentaje">{diseno.progreso}%</span>
                        </div>
                        <div className="progreso-barra">
                          <div className="progreso-fill" style={{ width: `${diseno.progreso}%` }}></div>
                        </div>
                      </div>

                      {diseno.etiquetas && diseno.etiquetas.length > 0 && (
                        <div className="diseno-etiquetas">
                          {diseno.etiquetas.map(etq => (
                            <span key={etq} className="etiqueta">#{etq}</span>
                          ))}
                        </div>
                      )}

                      {diseno.comentarios && diseno.comentarios.length > 0 && (
                        <div className="diseno-comentarios-preview">
                          <span className="comentario-icon">💬</span>
                          <span className="comentario-text">{diseno.comentarios[diseno.comentarios.length - 1].texto}</span>
                        </div>
                      )}
                    </div>

                    <div className="diseno-footer">
                      <div className="footer-left">
                        <span className="diseno-turno">🕒 {diseno.turno}</span>
                        <span className="diseno-revisiones">📋 {diseno.revisiones} rev</span>
                      </div>
                      <div className="footer-actions">
                        {diseno.estado === 'en_proceso' && (
                          <button 
                            className="footer-btn finalizar" 
                            onClick={(e) => { e.stopPropagation(); setCodigoEscaneado(diseno.codigo); procesarEscaneo(); }}
                            title="Finalizar diseño"
                          >
                            ✅
                          </button>
                        )}
                        <button 
                          className="footer-btn duplicar" 
                          onClick={(e) => { e.stopPropagation(); handleDuplicarDiseno(diseno); }}
                          title="Duplicar diseño"
                        >
                          📋
                        </button>
                        <button 
                          className="footer-btn eliminar" 
                          onClick={(e) => { e.stopPropagation(); handleEliminarDiseno(diseno.id); }}
                          title="Eliminar diseño"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {diseno.primerEscaneo && !diseno.segundoEscaneo && (
                      <div className="escaneo-badge primer">
                        1° {diseno.primerEscaneo.hora}
                      </div>
                    )}
                    {diseno.segundoEscaneo && (
                      <div className="escaneo-badge completo">
                        2° {diseno.segundoEscaneo.hora}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <table className="disenos-tabla">
                <thead>
                  <tr>
                    <th>Escaneo</th>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Cliente</th>
                    <th>Diseñador</th>
                    <th>Inicio</th>
                    <th>Fin</th>
                    <th>Duración</th>
                    <th>Progreso</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {disenosFiltrados.map(diseno => (
                    <tr key={diseno.id} onClick={() => handleVerDetalle(diseno)}>
                      <td>
                        {!diseno.segundoEscaneo ? (
                          <span className="escaneo-indicador primer" title="Solo primer escaneo">1/2</span>
                        ) : (
                          <span className="escaneo-indicador completo" title="Escaneo completo">2/2</span>
                        )}
                      </td>
                      <td className="codigo">{diseno.codigo}</td>
                      <td>{diseno.nombre}</td>
                      <td>{diseno.cliente}</td>
                      <td>{diseno.disenadorNombre}</td>
                      <td>{diseno.horaInicio}</td>
                      <td>{diseno.horaFin || '—'}</td>
                      <td>{diseno.tiempoReal ? `${diseno.tiempoReal} min` : '—'}</td>
                      <td>
                        <div className="tabla-progreso">
                          <div className="tabla-progreso-barra">
                            <div className="tabla-progreso-fill" style={{ width: `${diseno.progreso}%` }}></div>
                          </div>
                          <span className="tabla-progreso-texto">{diseno.progreso}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`estado-badge ${diseno.estado}`}>
                          {diseno.estado === 'en_proceso' ? '⚡ En Proceso' : '✅ Completado'}
                        </span>
                      </td>
                      <td>
                        <div className="acciones-cell">
                          <button className="accion-icon" onClick={(e) => { e.stopPropagation(); handleVerDetalle(diseno); }} title="Ver detalles">👁️</button>
                          <button className="accion-icon" onClick={(e) => { e.stopPropagation(); handleDuplicarDiseno(diseno); }} title="Duplicar">📋</button>
                          <button className="accion-icon danger" onClick={(e) => { e.stopPropagation(); handleEliminarDiseno(diseno.id); }} title="Eliminar">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* ===== MODAL DE DETALLE MEJORADO ===== */}
      {showModalDetalle && disenoSeleccionado && (
        <div className="modal-overlay" onClick={() => setShowModalDetalle(false)}>
          <div className="modal-content modal-lg" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModalDetalle(false)}>✕</button>
            <h2>Detalles del Diseño</h2>
            
            <div className="modal-tabs">
              <button className="modal-tab active">Información</button>
              <button className="modal-tab">Comentarios</button>
              <button className="modal-tab">Historial</button>
            </div>
            
            <div className="modal-detalle-grid">
              <div className="detalle-item">
                <label>Código:</label>
                <span className="codigo-valor">{disenoSeleccionado.codigo}</span>
              </div>
              <div className="detalle-item">
                <label>Nombre:</label>
                <span>{disenoSeleccionado.nombre}</span>
              </div>
              <div className="detalle-item">
                <label>Cliente:</label>
                <span>{disenoSeleccionado.cliente}</span>
              </div>
              <div className="detalle-item">
                <label>Diseñador:</label>
                <span>{disenoSeleccionado.disenadorNombre}</span>
              </div>
              <div className="detalle-item">
                <label>Fecha inicio:</label>
                <span>{disenoSeleccionado.fechaInicio} {disenoSeleccionado.horaInicio}</span>
              </div>
              <div className="detalle-item">
                <label>Fecha fin:</label>
                <span>{disenoSeleccionado.fechaFin || '—'} {disenoSeleccionado.horaFin || ''}</span>
              </div>
              <div className="detalle-item">
                <label>Duración:</label>
                <span>{disenoSeleccionado.tiempoReal ? `${disenoSeleccionado.tiempoReal} minutos` : 'En proceso'}</span>
              </div>
              <div className="detalle-item">
                <label>Turno:</label>
                <span>{disenoSeleccionado.turno}</span>
              </div>
              <div className="detalle-item">
                <label>Revisiones:</label>
                <span>{disenoSeleccionado.revisiones}</span>
              </div>
              <div className="detalle-item full-width">
                <label>Progreso:</label>
                <div className="modal-progreso">
                  <div className="modal-progreso-barra">
                    <div className="modal-progreso-fill" style={{ width: `${disenoSeleccionado.progreso}%` }}></div>
                  </div>
                  <span className="modal-progreso-texto">{disenoSeleccionado.progreso}%</span>
                </div>
              </div>
            </div>

            <div className="escaneos-detalle">
              <h4>📷 Información de Escaneos</h4>
              {disenoSeleccionado.primerEscaneo && (
                <div className="escaneo-item primer">
                  <span className="escaneo-tipo">Primer escaneo</span>
                  <span className="escaneo-fecha">{new Date(disenoSeleccionado.primerEscaneo.timestamp).toLocaleString()}</span>
                  <span className="escaneo-usuario">👤 {disenoSeleccionado.primerEscaneo.usuario}</span>
                </div>
              )}
              {disenoSeleccionado.segundoEscaneo && (
                <div className="escaneo-item segundo">
                  <span className="escaneo-tipo">Segundo escaneo</span>
                  <span className="escaneo-fecha">{new Date(disenoSeleccionado.segundoEscaneo.timestamp).toLocaleString()}</span>
                  <span className="escaneo-usuario">👤 {disenoSeleccionado.segundoEscaneo.usuario}</span>
                </div>
              )}
            </div>

            {disenoSeleccionado.etiquetas && disenoSeleccionado.etiquetas.length > 0 && (
              <div className="etiquetas-detalle">
                <h4>🏷️ Etiquetas</h4>
                <div className="etiquetas-lista">
                  {disenoSeleccionado.etiquetas.map(etq => (
                    <span key={etq} className="etiqueta-item">#{etq}</span>
                  ))}
                </div>
              </div>
            )}

            {disenoSeleccionado.comentarios && disenoSeleccionado.comentarios.length > 0 && (
              <div className="comentarios-detalle">
                <h4>💬 Comentarios</h4>
                <div className="comentarios-lista">
                  {disenoSeleccionado.comentarios.map((com, idx) => (
                    <div key={idx} className="comentario-item">
                      <span className="comentario-fecha">{com.fecha}</span>
                      <span className="comentario-usuario">{com.usuario}:</span>
                      <span className="comentario-texto">{com.texto}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-acciones">
              <button className="btn-primary" onClick={() => agregarComentario(disenoSeleccionado.id, prompt('Escribe tu comentario:'))}>
                💬 Agregar Comentario
              </button>
              {disenoSeleccionado.estado === 'en_proceso' && (
                <button className="btn-success" onClick={() => { setCodigoEscaneado(disenoSeleccionado.codigo); procesarEscaneo(); setShowModalDetalle(false); }}>
                  ✅ Finalizar Diseño
                </button>
              )}
              <button className="btn-secondary" onClick={() => handleDuplicarDiseno(disenoSeleccionado)}>
                📋 Duplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== BOTÓN VOLVER ARRIBA ===== */}
      <button 
        className={`scroll-to-top ${showScrollTop ? 'visible' : ''}`} 
        onClick={scrollToTop}
        title="Volver arriba"
      >
        ↑
      </button>
    </div>
  );
};

export default DisenoProduccion;