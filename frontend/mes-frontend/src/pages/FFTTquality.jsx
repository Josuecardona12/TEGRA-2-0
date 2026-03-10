import React, { useState, useEffect, useRef, useCallback } from 'react';
import './FFTTquality.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const FFTTquality = () => {
  // ================ ESTADOS PRINCIPALES ================
  const [currentTime, setCurrentTime] = useState(new Date());
  const [vista, setVista] = useState('dashboard');
  const [theme, setTheme] = useState('dark');
  const [loading, setLoading] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [selectedLote, setSelectedLote] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [loteSeleccionados, setLoteSeleccionados] = useState([]);
  const [showAyuda, setShowAyuda] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [showEstadisticas, setShowEstadisticas] = useState(false);
  const [showComparativa, setShowComparativa] = useState(false);
  const [showAlertas, setShowAlertas] = useState(false);
  const [showReportes, setShowReportes] = useState(false);
  const [showCalendario, setShowCalendario] = useState(false);
  const [showMapaCalor, setShowMapaCalor] = useState(false);
  const [showTendencias, setShowTendencias] = useState(false);
  const [showPredicciones, setShowPredicciones] = useState(false);
  const [showOptimizacion, setShowOptimizacion] = useState(false);
  const [showIA, setShowIA] = useState(false);
  const [filtroMaquina, setFiltroMaquina] = useState('todas');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('fecha');
  const [ordenDireccion, setOrdenDireccion] = useState('desc');
  const [vistaMaquinas, setVistaMaquinas] = useState('grid'); // 'grid' o 'lista'

  // ================ DATOS DE 12 MÁQUINAS DE SUBLIMADO ================
  const maquinas = [
    { id: 'M01', nombre: 'Sublimadora 1', tipo: 'Grande', estado: 'operativa', eficiencia: 95, produccion: 150, temperatura: 185, presion: 3.5, velocidad: 18.5, lotesHoy: 8, alertas: [] },
    { id: 'M02', nombre: 'Sublimadora 2', tipo: 'Grande', estado: 'operativa', eficiencia: 92, produccion: 145, temperatura: 188, presion: 3.8, velocidad: 19.2, lotesHoy: 7, alertas: [] },
    { id: 'M03', nombre: 'Sublimadora 3', tipo: 'Mediana', estado: 'mantenimiento', eficiencia: 0, produccion: 0, temperatura: 0, presion: 0, velocidad: 0, lotesHoy: 0, alertas: ['Mantenimiento programado'] },
    { id: 'M04', nombre: 'Sublimadora 4', tipo: 'Mediana', estado: 'operativa', eficiencia: 88, produccion: 130, temperatura: 182, presion: 3.4, velocidad: 18.0, lotesHoy: 6, alertas: [] },
    { id: 'M05', nombre: 'Sublimadora 5', tipo: 'Pequeña', estado: 'operativa', eficiencia: 97, produccion: 120, temperatura: 183, presion: 3.3, velocidad: 17.8, lotesHoy: 9, alertas: [] },
    { id: 'M06', nombre: 'Sublimadora 6', tipo: 'Pequeña', estado: 'operativa', eficiencia: 91, produccion: 115, temperatura: 184, presion: 3.6, velocidad: 18.2, lotesHoy: 7, alertas: [] },
    { id: 'M07', nombre: 'Sublimadora 7', tipo: 'Grande', estado: 'operativa', eficiencia: 94, produccion: 148, temperatura: 186, presion: 3.7, velocidad: 19.0, lotesHoy: 8, alertas: [] },
    { id: 'M08', nombre: 'Sublimadora 8', tipo: 'Grande', estado: 'reparacion', eficiencia: 0, produccion: 0, temperatura: 0, presion: 0, velocidad: 0, lotesHoy: 0, alertas: ['Fallo técnico'] },
    { id: 'M09', nombre: 'Sublimadora 9', tipo: 'Mediana', estado: 'operativa', eficiencia: 89, produccion: 125, temperatura: 181, presion: 3.2, velocidad: 17.5, lotesHoy: 6, alertas: [] },
    { id: 'M10', nombre: 'Sublimadora 10', tipo: 'Mediana', estado: 'operativa', eficiencia: 93, produccion: 135, temperatura: 187, presion: 3.9, velocidad: 19.5, lotesHoy: 7, alertas: [] },
    { id: 'M11', nombre: 'Sublimadora 11', tipo: 'Pequeña', estado: 'operativa', eficiencia: 96, produccion: 118, temperatura: 182, presion: 3.4, velocidad: 17.9, lotesHoy: 8, alertas: [] },
    { id: 'M12', nombre: 'Sublimadora 12', tipo: 'Pequeña', estado: 'operativa', eficiencia: 90, produccion: 112, temperatura: 183, presion: 3.5, velocidad: 18.1, lotesHoy: 6, alertas: [] }
  ];

  // ================ DATOS DE LOTES (PERSISTENTES) ================
  const [lotes, setLotes] = useState(() => {
    const guardados = localStorage.getItem('lotesFFTT');
    if (guardados) {
      return JSON.parse(guardados);
    }
    // Datos iniciales mejorados con más información
    return [
      {
        id: 1,
        lote: 'L2401-001',
        po: 'PO-2024-001',
        sport: 'Baseball',
        fecha: '2024-03-15',
        horaInicio: '06:00',
        horaFin: '14:00',
        turno: 'A',
        maquina: 'M01',
        operador: 'Carlos López',
        inspector: 'María González',
        supervisor: 'Juan Pérez',
        totalMuestras: 150,
        aceptadas: 142,
        rechazadas: 8,
        tasaFFTT: 94.7,
        temperatura: 185,
        presion: 3.5,
        velocidad: 18.5,
        tipoRechazo: {
          tono: 3,
          textura: 2,
          color: 1,
          dimension: 1,
          acabado: 1
        },
        calidad: {
          indiceCalidad: 94.7,
          conformidad: 95.2,
          capabilidad: 1.25,
          sigma: 3.5
        },
        materiaPrima: {
          lote: 'MP-2403-015',
          proveedor: 'Proveedor A',
          certificado: 'CERT-001'
        },
        observaciones: 'Lote con variaciones menores en tono',
        acciones: [
          { fecha: '2024-03-15', accion: 'Calibración', estado: 'completada' }
        ],
        gravedad: 'media',
        estado: 'completado',
        alertas: []
      },
      {
        id: 2,
        lote: 'L2402-002',
        po: 'PO-2024-002',
        sport: 'Soccer',
        fecha: '2024-03-15',
        horaInicio: '14:00',
        horaFin: '22:00',
        turno: 'B',
        maquina: 'M02',
        operador: 'María González',
        inspector: 'Pedro Ramírez',
        supervisor: 'Ana Martínez',
        totalMuestras: 200,
        aceptadas: 182,
        rechazadas: 18,
        tasaFFTT: 91.0,
        temperatura: 188,
        presion: 3.8,
        velocidad: 19.2,
        tipoRechazo: {
          tono: 8,
          textura: 4,
          color: 3,
          dimension: 2,
          acabado: 1
        },
        calidad: {
          indiceCalidad: 91.0,
          conformidad: 91.5,
          capabilidad: 1.15,
          sigma: 3.2
        },
        materiaPrima: {
          lote: 'MP-2403-016',
          proveedor: 'Proveedor B',
          certificado: 'CERT-002'
        },
        observaciones: 'Problemas con tono - Revisar materia prima',
        acciones: [
          { fecha: '2024-03-15', accion: 'Inspección MP', estado: 'en_proceso' }
        ],
        gravedad: 'alta',
        estado: 'en_proceso',
        alertas: ['Tasa de rechazo alta']
      },
      {
        id: 3,
        lote: 'L2403-003',
        po: 'PO-2024-003',
        sport: 'Basketball',
        fecha: '2024-03-14',
        horaInicio: '06:00',
        horaFin: '14:00',
        turno: 'A',
        maquina: 'M05',
        operador: 'Pedro Ramírez',
        inspector: 'Ana Martínez',
        supervisor: 'Carlos López',
        totalMuestras: 180,
        aceptadas: 175,
        rechazadas: 5,
        tasaFFTT: 97.2,
        temperatura: 182,
        presion: 3.4,
        velocidad: 18.0,
        tipoRechazo: {
          tono: 1,
          textura: 1,
          color: 1,
          dimension: 1,
          acabado: 1
        },
        calidad: {
          indiceCalidad: 97.2,
          conformidad: 97.5,
          capabilidad: 1.45,
          sigma: 3.8
        },
        materiaPrima: {
          lote: 'MP-2403-014',
          proveedor: 'Proveedor A',
          certificado: 'CERT-003'
        },
        observaciones: 'Excelente calidad',
        acciones: [],
        gravedad: 'baja',
        estado: 'completado',
        alertas: []
      },
      {
        id: 4,
        lote: 'L2404-004',
        po: 'PO-2024-004',
        sport: 'Football',
        fecha: '2024-03-14',
        horaInicio: '22:00',
        horaFin: '06:00',
        turno: 'C',
        maquina: 'M07',
        operador: 'Ana Martínez',
        inspector: 'Roberto Díaz',
        supervisor: 'Laura Torres',
        totalMuestras: 220,
        aceptadas: 198,
        rechazadas: 22,
        tasaFFTT: 90.0,
        temperatura: 190,
        presion: 4.0,
        velocidad: 20.0,
        tipoRechazo: {
          tono: 10,
          textura: 5,
          color: 4,
          dimension: 2,
          acabado: 1
        },
        calidad: {
          indiceCalidad: 90.0,
          conformidad: 90.2,
          capabilidad: 1.08,
          sigma: 3.1
        },
        materiaPrima: {
          lote: 'MP-2403-017',
          proveedor: 'Proveedor C',
          certificado: 'CERT-004'
        },
        observaciones: 'Problema crítico - Requiere acción inmediata',
        acciones: [
          { fecha: '2024-03-14', accion: 'Paro de línea', estado: 'completada' },
          { fecha: '2024-03-15', accion: 'Revisión MP', estado: 'pendiente' }
        ],
        gravedad: 'critica',
        estado: 'revision',
        alertas: ['Crítico', 'Múltiples paros']
      },
      {
        id: 5,
        lote: 'L2405-005',
        po: 'PO-2024-005',
        sport: 'Baseball',
        fecha: '2024-03-13',
        horaInicio: '06:00',
        horaFin: '14:00',
        turno: 'A',
        maquina: 'M09',
        operador: 'Roberto Díaz',
        inspector: 'Laura Torres',
        supervisor: 'Carlos López',
        totalMuestras: 190,
        aceptadas: 185,
        rechazadas: 5,
        tasaFFTT: 97.4,
        temperatura: 183,
        presion: 3.3,
        velocidad: 18.2,
        tipoRechazo: {
          tono: 2,
          textura: 1,
          color: 1,
          dimension: 1,
          acabado: 0
        },
        calidad: {
          indiceCalidad: 97.4,
          conformidad: 97.8,
          capabilidad: 1.48,
          sigma: 3.9
        },
        materiaPrima: {
          lote: 'MP-2403-013',
          proveedor: 'Proveedor A',
          certificado: 'CERT-005'
        },
        observaciones: 'Buen desempeño',
        acciones: [],
        gravedad: 'baja',
        estado: 'completado',
        alertas: []
      },
      {
        id: 6,
        lote: 'L2406-006',
        po: 'PO-2024-006',
        sport: 'Soccer',
        fecha: '2024-03-13',
        horaInicio: '14:00',
        horaFin: '22:00',
        turno: 'B',
        maquina: 'M10',
        operador: 'Laura Torres',
        inspector: 'Carlos López',
        supervisor: 'Ana Martínez',
        totalMuestras: 210,
        aceptadas: 195,
        rechazadas: 15,
        tasaFFTT: 92.9,
        temperatura: 186,
        presion: 3.6,
        velocidad: 19.5,
        tipoRechazo: {
          tono: 5,
          textura: 3,
          color: 3,
          dimension: 2,
          acabado: 2
        },
        calidad: {
          indiceCalidad: 92.9,
          conformidad: 93.1,
          capabilidad: 1.22,
          sigma: 3.4
        },
        materiaPrima: {
          lote: 'MP-2403-012',
          proveedor: 'Proveedor B',
          certificado: 'CERT-006'
        },
        observaciones: 'Múltiples problemas de acabado',
        acciones: [
          { fecha: '2024-03-13', accion: 'Ajuste parámetros', estado: 'completada' }
        ],
        gravedad: 'media',
        estado: 'completado',
        alertas: []
      },
      {
        id: 7,
        lote: 'L2407-007',
        po: 'PO-2024-007',
        sport: 'Basketball',
        fecha: '2024-03-12',
        horaInicio: '06:00',
        horaFin: '14:00',
        turno: 'A',
        maquina: 'M11',
        operador: 'Carlos López',
        inspector: 'María González',
        supervisor: 'Juan Pérez',
        totalMuestras: 160,
        aceptadas: 152,
        rechazadas: 8,
        tasaFFTT: 95.0,
        temperatura: 184,
        presion: 3.5,
        velocidad: 18.3,
        tipoRechazo: {
          tono: 3,
          textura: 2,
          color: 1,
          dimension: 1,
          acabado: 1
        },
        calidad: {
          indiceCalidad: 95.0,
          conformidad: 95.3,
          capabilidad: 1.30,
          sigma: 3.6
        },
        materiaPrima: {
          lote: 'MP-2403-011',
          proveedor: 'Proveedor A',
          certificado: 'CERT-007'
        },
        observaciones: 'Buen lote',
        acciones: [],
        gravedad: 'baja',
        estado: 'completado',
        alertas: []
      },
      {
        id: 8,
        lote: 'L2408-008',
        po: 'PO-2024-008',
        sport: 'Football',
        fecha: '2024-03-12',
        horaInicio: '14:00',
        horaFin: '22:00',
        turno: 'B',
        maquina: 'M12',
        operador: 'María González',
        inspector: 'Pedro Ramírez',
        supervisor: 'Ana Martínez',
        totalMuestras: 195,
        aceptadas: 175,
        rechazadas: 20,
        tasaFFTT: 89.7,
        temperatura: 189,
        presion: 3.9,
        velocidad: 19.8,
        tipoRechazo: {
          tono: 9,
          textura: 4,
          color: 3,
          dimension: 2,
          acabado: 2
        },
        calidad: {
          indiceCalidad: 89.7,
          conformidad: 90.1,
          capabilidad: 1.05,
          sigma: 3.0
        },
        materiaPrima: {
          lote: 'MP-2403-010',
          proveedor: 'Proveedor C',
          certificado: 'CERT-008'
        },
        observaciones: 'Problemas severos de tono',
        acciones: [
          { fecha: '2024-03-12', accion: 'Revisión', estado: 'completada' }
        ],
        gravedad: 'alta',
        estado: 'revision',
        alertas: ['Tasa baja']
      }
    ];
  });

  // ================ ESTADO DEL ESCÁNER ================
  const [scannerState, setScannerState] = useState({
    activo: false,
    permisos: false,
    ultimoCodigo: '',
    codigoTemporal: '',
    modo: 'manual',
    tipoScanner: 'codigo-barras',
    configuracion: {
      sonido: true,
      vibracion: true,
      autoguardar: true,
      validarFormato: true,
      duplicados: 'alertar',
      prefijos: ['LOT', 'PO', 'BATCH'],
      longitudMinima: 5,
      longitudMaxima: 20
    }
  });

  const [scannerData, setScannerData] = useState({
    codigoEscaneado: '',
    numeroLote: '',
    fechaEscaneo: new Date().toISOString().split('T')[0],
    horaEscaneo: new Date().toLocaleTimeString(),
    tipoProducto: '',
    operador: '',
    maquina: '',
    turno: '',
    observaciones: '',
    ubicacion: '',
    cantidad: 1,
    unidadMedida: 'unidad',
    loteProveedor: '',
    fechaFabricacion: '',
    fechaVencimiento: '',
    certificadoCalidad: '',
    loteOriginal: '',
    reproceso: false,
    prioridad: 'normal'
  });

  const [historialEscaneos, setHistorialEscaneos] = useState(() => {
    const guardados = localStorage.getItem('historialEscaneos');
    return guardados ? JSON.parse(guardados) : [];
  });

  const [escanerActivo, setEscanerActivo] = useState(false);
  const [codigoTemporal, setCodigoTemporal] = useState('');

  const [estadisticasEscaneo, setEstadisticasEscaneo] = useState({
    totalEscaneos: 0,
    escaneosHoy: 0,
    escaneosExitosos: 0,
    escaneosFallidos: 0,
    tiempoPromedio: 0,
    ultimoEscaneo: null,
    lotesUnicos: 0,
    productosUnicos: 0,
    operadoresActivos: [],
    maquinasActivas: []
  });

  // ================ ESTADOS DE FILTROS ================
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    tipoRechazo: 'todos',
    sport: 'todos',
    turno: 'todos',
    gravedad: 'todos',
    operador: 'todos',
    maquina: 'todas',
    lote: '',
    po: '',
    busqueda: '',
    ordenarPor: 'fecha',
    ordenDireccion: 'desc',
    limiteResultados: 100,
    incluirReprocesos: true,
    soloCriticos: false,
    soloAlertas: false,
    rangoTasaFFTT: [0, 100],
    rangoRechazos: [0, 100]
  });

  // ================ CONFIGURACIÓN DEL ESCÁNER ================
  const scannerInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);

  // ================ EFECTOS ================
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    cargarHistorialEscaneos();
    cargarPreferencias();
    inicializarAudio();
    configurarAtajosTeclado();
  }, []);

  useEffect(() => {
    if (escanerActivo && scannerInputRef.current) {
      scannerInputRef.current.focus();
    }
  }, [escanerActivo]);

  // Persistir lotes
  useEffect(() => {
    localStorage.setItem('lotesFFTT', JSON.stringify(lotes));
  }, [lotes]);

  // Persistir historial de escaneos
  useEffect(() => {
    localStorage.setItem('historialEscaneos', JSON.stringify(historialEscaneos));
  }, [historialEscaneos]);

  // ================ FUNCIONES DEL ESCÁNER ================
  const inicializarAudio = () => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      } catch (error) {
        console.log('Audio Context no soportado');
      }
    }
  };

  const reproducirSonido = (tipo = 'success') => {
    if (!scannerState.configuracion.sonido || !audioContextRef.current) return;
    
    try {
      const context = audioContextRef.current;
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      if (tipo === 'success') {
        oscillator.frequency.setValueAtTime(800, context.currentTime);
        gainNode.gain.setValueAtTime(0.1, context.currentTime);
        oscillator.start();
        oscillator.stop(context.currentTime + 0.1);
      } else if (tipo === 'error') {
        oscillator.frequency.setValueAtTime(400, context.currentTime);
        gainNode.gain.setValueAtTime(0.1, context.currentTime);
        oscillator.start();
        oscillator.stop(context.currentTime + 0.2);
      }
    } catch (error) {
      console.log('Error reproduciendo sonido:', error);
    }
  };

  const vibrar = (duracion = 100) => {
    if (scannerState.configuracion.vibracion && window.navigator.vibrate) {
      window.navigator.vibrate(duracion);
    }
  };

  const handleKeyPress = useCallback((e) => {
    if (escanerActivo) {
      if (e.key === 'Enter') {
        if (codigoTemporal) {
          procesarCodigoEscaneado(codigoTemporal);
          setCodigoTemporal('');
        }
      } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        setCodigoTemporal(prev => prev + e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        setCodigoTemporal(prev => prev.slice(0, -1));
      }
    }
  }, [escanerActivo, codigoTemporal]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const procesarCodigoEscaneado = (codigo) => {
    setScannerData(prev => ({
      ...prev,
      codigoEscaneado: codigo
    }));

    // Buscar si el código corresponde a un lote existente
    const loteExistente = lotes.find(l => l.lote === codigo);
    if (loteExistente) {
      setScannerData(prev => ({
        ...prev,
        numeroLote: loteExistente.lote,
        tipoProducto: loteExistente.sport,
        maquina: loteExistente.maquina,
        operador: loteExistente.operador,
        turno: loteExistente.turno
      }));
    }

    // Analizar formato del código
    const formatoValido = validarFormatoCodigo(codigo);
    
    if (!formatoValido && scannerState.configuracion.validarFormato) {
      agregarNotificacion('error', 'Formato de código inválido');
      reproducirSonido('error');
      return;
    }

    // Verificar duplicados
    const esDuplicado = verificarDuplicado(codigo);
    
    if (esDuplicado) {
      switch (scannerState.configuracion.duplicados) {
        case 'alertar':
          agregarNotificacion('alerta', 'Código ya escaneado anteriormente');
          break;
        case 'bloquear':
          agregarNotificacion('error', 'Código duplicado - No permitido');
          return;
        default:
          break;
      }
    }

    if (scannerState.configuracion.autoguardar) {
      handleGuardarEscaneo();
    }

    reproducirSonido('success');
    vibrar();
    
    setScannerState(prev => ({
      ...prev,
      ultimoCodigo: codigo
    }));

    actualizarEstadisticasEscaneo(codigo);
  };

  const validarFormatoCodigo = (codigo) => {
    if (!codigo) return false;
    
    if (codigo.length < scannerState.configuracion.longitudMinima ||
        codigo.length > scannerState.configuracion.longitudMaxima) {
      return false;
    }
    
    const tienePrefijoValido = scannerState.configuracion.prefijos.some(
      prefijo => codigo.startsWith(prefijo)
    );
    
    return tienePrefijoValido;
  };

  const verificarDuplicado = (codigo) => {
    return historialEscaneos.some(e => e.codigoEscaneado === codigo);
  };

  const actualizarEstadisticasEscaneo = (codigo) => {
    setEstadisticasEscaneo(prev => ({
      ...prev,
      totalEscaneos: prev.totalEscaneos + 1,
      escaneosExitosos: prev.escaneosExitosos + 1,
      ultimoEscaneo: new Date(),
      lotesUnicos: new Set([...historialEscaneos.map(e => e.numeroLote), scannerData.numeroLote]).size
    }));
  };

  const cargarHistorialEscaneos = () => {
    const historialGuardado = localStorage.getItem('historialEscaneos');
    if (historialGuardado) {
      const historial = JSON.parse(historialGuardado);
      setHistorialEscaneos(historial);
      
      const escaneosHoy = historial.filter(e => 
        e.fechaEscaneo === new Date().toISOString().split('T')[0]
      ).length;
      
      const lotesUnicos = new Set(historial.map(e => e.numeroLote)).size;
      const operadoresActivos = [...new Set(historial.map(e => e.operador).filter(Boolean))];
      
      setEstadisticasEscaneo(prev => ({
        ...prev,
        totalEscaneos: historial.length,
        escaneosHoy,
        lotesUnicos,
        operadoresActivos
      }));
    }
  };

  const cargarPreferencias = () => {
    const preferencias = localStorage.getItem('preferenciasFFTT');
    if (preferencias) {
      const { theme: temaGuardado } = JSON.parse(preferencias);
      setTheme(temaGuardado);
    }
  };

  const configurarAtajosTeclado = () => {
    const handleGlobalKeyPress = (e) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        setVista('scanner');
        setEscanerActivo(true);
      } else if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        setVista('dashboard');
      } else if (e.ctrlKey && e.key === 'm') {
        e.preventDefault();
        setVista('maquinas');
      } else if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        setVista('lotes');
      } else if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        setVista('analisis');
      } else if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        const input = document.querySelector('input[placeholder*="Buscar"]');
        if (input) input.focus();
      } else if (e.key === 'Escape') {
        setShowModal(false);
        setShowAyuda(false);
        setShowConfig(false);
        setEscanerActivo(false);
      }
    };
    
    window.addEventListener('keydown', handleGlobalKeyPress);
    return () => window.removeEventListener('keydown', handleGlobalKeyPress);
  };

  // ================ FUNCIONES DE NOTIFICACIONES ================
  const agregarNotificacion = (tipo, mensaje, duracion = 5000) => {
    const id = Date.now();
    const nuevaNotificacion = {
      id,
      tipo,
      mensaje,
      duracion,
      timestamp: new Date()
    };
    
    setNotificaciones(prev => [...prev, nuevaNotificacion]);
    
    setTimeout(() => {
      setNotificaciones(prev => prev.filter(n => n.id !== id));
    }, duracion);
  };

  // ================ FUNCIONES DEL ESCÁNER ================
  const handleIniciarEscaner = (modo = 'manual') => {
    setEscanerActivo(true);
    setScannerState(prev => ({ ...prev, activo: true, modo }));
    agregarNotificacion('info', `📷 Escáner activado - Modo ${modo === 'auto' ? 'Automático' : 'Manual'}`);
    
    if (scannerInputRef.current) {
      scannerInputRef.current.focus();
    }
  };

  const handleDetenerEscaner = () => {
    setEscanerActivo(false);
    setScannerState(prev => ({ ...prev, activo: false }));
    setCodigoTemporal('');
    agregarNotificacion('info', '⏹️ Escáner desactivado');
  };

  const handleGuardarEscaneo = () => {
    if (!scannerData.codigoEscaneado) {
      agregarNotificacion('error', '❌ Debes escanear un código');
      return;
    }

    const nuevoEscaneo = {
      id: Date.now(),
      ...scannerData,
      timestamp: new Date().toISOString(),
      usuario: 'Admin',
      estacion: 'Estación 1'
    };

    const nuevoHistorial = [nuevoEscaneo, ...historialEscaneos];
    setHistorialEscaneos(nuevoHistorial);

    // Si tiene número de lote, actualizar o crear lote
    if (scannerData.numeroLote) {
      const loteExistente = lotes.find(l => l.lote === scannerData.numeroLote);
      if (loteExistente) {
        // Actualizar lote existente
        setLotes(lotes.map(l => 
          l.lote === scannerData.numeroLote 
            ? { ...l, totalMuestras: l.totalMuestras + scannerData.cantidad }
            : l
        ));
      } else {
        // Crear nuevo lote
        const nuevoLote = {
          id: Date.now() + 1,
          lote: scannerData.numeroLote,
          po: `PO-${new Date().getFullYear()}-${String(lotes.length + 1).padStart(3, '0')}`,
          sport: scannerData.tipoProducto || 'Baseball',
          fecha: scannerData.fechaEscaneo,
          horaInicio: scannerData.horaEscaneo,
          horaFin: '',
          turno: scannerData.turno || 'A',
          maquina: scannerData.maquina || 'M01',
          operador: scannerData.operador || 'Sin asignar',
          inspector: 'Pendiente',
          supervisor: 'Pendiente',
          totalMuestras: scannerData.cantidad,
          aceptadas: scannerData.cantidad,
          rechazadas: 0,
          tasaFFTT: 100,
          temperatura: 0,
          presion: 0,
          velocidad: 0,
          tipoRechazo: { tono: 0, textura: 0, color: 0, dimension: 0, acabado: 0 },
          calidad: {
            indiceCalidad: 100,
            conformidad: 100,
            capabilidad: 1.0,
            sigma: 3.0
          },
          materiaPrima: {
            lote: '',
            proveedor: '',
            certificado: ''
          },
          observaciones: scannerData.observaciones || 'Lote creado desde escáner',
          acciones: [],
          gravedad: 'baja',
          estado: 'nuevo',
          alertas: []
        };
        setLotes([nuevoLote, ...lotes]);
      }
    }

    agregarNotificacion('exito', '✅ Escaneo guardado correctamente');

    setScannerData(prev => ({
      ...prev,
      codigoEscaneado: '',
      horaEscaneo: new Date().toLocaleTimeString()
    }));
  };

  const handleLimpiarEscaneo = () => {
    setScannerData({
      codigoEscaneado: '',
      numeroLote: '',
      fechaEscaneo: new Date().toISOString().split('T')[0],
      horaEscaneo: new Date().toLocaleTimeString(),
      tipoProducto: '',
      operador: '',
      maquina: '',
      turno: '',
      observaciones: '',
      ubicacion: '',
      cantidad: 1,
      unidadMedida: 'unidad',
      loteProveedor: '',
      fechaFabricacion: '',
      fechaVencimiento: '',
      certificadoCalidad: '',
      loteOriginal: '',
      reproceso: false,
      prioridad: 'normal'
    });
  };

  const handleEliminarEscaneo = (id) => {
    const nuevoHistorial = historialEscaneos.filter(e => e.id !== id);
    setHistorialEscaneos(nuevoHistorial);
    agregarNotificacion('info', '🗑️ Escaneo eliminado');
  };

  const handleExportarEscaneos = (formato = 'json') => {
    if (formato === 'excel') {
      const ws = XLSX.utils.json_to_sheet(historialEscaneos);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Escaneos');
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(data, `escaneos_${new Date().toISOString().split('T')[0]}.xlsx`);
    } else {
      const dataStr = JSON.stringify(historialEscaneos, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `escaneos_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
    
    agregarNotificacion('exito', `📥 Historial exportado a ${formato.toUpperCase()}`);
  };

  // ================ FUNCIONES DE LOTES ================
  const agregarLote = (nuevoLote) => {
    const lote = {
      id: Date.now(),
      ...nuevoLote,
      fecha: new Date().toISOString().split('T')[0],
      tasaFFTT: ((nuevoLote.aceptadas / nuevoLote.totalMuestras) * 100).toFixed(1),
      estado: 'nuevo',
      alertas: []
    };
    setLotes([lote, ...lotes]);
    agregarNotificacion('exito', '✅ Lote agregado');
  };

  const editarLote = (id, datos) => {
    setLotes(lotes.map(l => l.id === id ? { ...l, ...datos } : l));
    agregarNotificacion('exito', '✅ Lote actualizado');
  };

  const eliminarLote = (id) => {
    setLotes(lotes.filter(l => l.id !== id));
    agregarNotificacion('info', '🗑️ Lote eliminado');
  };

  const duplicarLote = (lote) => {
    const nuevoLote = {
      ...lote,
      id: Date.now(),
      lote: `${lote.lote}-COPY`,
      fecha: new Date().toISOString().split('T')[0],
      estado: 'borrador'
    };
    setLotes([nuevoLote, ...lotes]);
    agregarNotificacion('exito', '📋 Lote duplicado');
  };

  const toggleSeleccionLote = (id) => {
    setLoteSeleccionados(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const seleccionarTodos = () => {
    if (loteSeleccionados.length === lotesFiltrados.length) {
      setLoteSeleccionados([]);
    } else {
      setLoteSeleccionados(lotesFiltrados.map(l => l.id));
    }
  };

  const eliminarSeleccionados = () => {
    setLotes(lotes.filter(l => !loteSeleccionados.includes(l.id)));
    setLoteSeleccionados([]);
    agregarNotificacion('info', `🗑️ ${loteSeleccionados.length} lotes eliminados`);
  };

  const exportarLotes = () => {
    const ws = XLSX.utils.json_to_sheet(lotesFiltrados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Lotes');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, `lotes_${new Date().toISOString().split('T')[0]}.xlsx`);
    agregarNotificacion('exito', '📥 Lotes exportados');
  };

  // ================ FUNCIONES DE MÁQUINAS ================
  const iniciarMaquina = (id) => {
    setMaquinas(maquinas.map(m => 
      m.id === id ? { ...m, estado: 'operativa', alertas: [] } : m
    ));
    agregarNotificacion('exito', `✅ Máquina ${id} iniciada`);
  };

  const detenerMaquina = (id) => {
    setMaquinas(maquinas.map(m => 
      m.id === id ? { ...m, estado: 'mantenimiento' } : m
    ));
    agregarNotificacion('info', `⏹️ Máquina ${id} detenida`);
  };

  const programarMantenimiento = (id) => {
    setMaquinas(maquinas.map(m => 
      m.id === id ? { ...m, estado: 'mantenimiento', alertas: ['Mantenimiento programado'] } : m
    ));
    agregarNotificacion('info', `🔧 Mantenimiento programado para máquina ${id}`);
  };

  // ================ CÁLCULOS Y FILTROS ================
  const lotesFiltrados = lotes.filter(lote => {
    if (filtroMaquina !== 'todas' && lote.maquina !== filtroMaquina) return false;
    if (filtroEstado !== 'todos' && lote.estado !== filtroEstado) return false;
    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase();
      return (
        lote.lote.toLowerCase().includes(busquedaLower) ||
        lote.po.toLowerCase().includes(busquedaLower) ||
        lote.operador.toLowerCase().includes(busquedaLower) ||
        lote.sport.toLowerCase().includes(busquedaLower)
      );
    }
    return true;
  }).sort((a, b) => {
    if (ordenarPor === 'fecha') {
      return ordenDireccion === 'desc' 
        ? new Date(b.fecha) - new Date(a.fecha)
        : new Date(a.fecha) - new Date(b.fecha);
    }
    if (ordenarPor === 'tasaFFTT') {
      return ordenDireccion === 'desc'
        ? b.tasaFFTT - a.tasaFFTT
        : a.tasaFFTT - b.tasaFFTT;
    }
    return 0;
  });

  const stats = {
    totalLotes: lotes.length,
    totalMuestras: lotes.reduce((sum, l) => sum + l.totalMuestras, 0),
    totalAceptadas: lotes.reduce((sum, l) => sum + l.aceptadas, 0),
    totalRechazadas: lotes.reduce((sum, l) => sum + l.rechazadas, 0),
    tasaFFTTPromedio: lotes.length ? 
      Math.round(lotes.reduce((sum, l) => sum + l.tasaFFTT, 0) / lotes.length) : 0,
    lotesCriticos: lotes.filter(l => l.gravedad === 'critica' || l.gravedad === 'alta').length,
    rechazosPorTipo: {
      tono: lotes.reduce((sum, l) => sum + (l.tipoRechazo?.tono || 0), 0),
      textura: lotes.reduce((sum, l) => sum + (l.tipoRechazo?.textura || 0), 0),
      color: lotes.reduce((sum, l) => sum + (l.tipoRechazo?.color || 0), 0),
      dimension: lotes.reduce((sum, l) => sum + (l.tipoRechazo?.dimension || 0), 0),
      acabado: lotes.reduce((sum, l) => sum + (l.tipoRechazo?.acabado || 0), 0)
    },
    maquinasOperativas: maquinas.filter(m => m.estado === 'operativa').length,
    maquinasMantenimiento: maquinas.filter(m => m.estado === 'mantenimiento').length,
    maquinasReparacion: maquinas.filter(m => m.estado === 'reparacion').length,
    produccionTotal: maquinas.reduce((sum, m) => sum + m.produccion, 0),
    eficienciaPromedio: Math.round(maquinas.filter(m => m.estado === 'operativa').reduce((sum, m) => sum + m.eficiencia, 0) / maquinas.filter(m => m.estado === 'operativa').length) || 0
  };

  // ================ DATOS PARA GRÁFICOS ================
  const chartData = {
    tendenciaFFTT: {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Tasa FFTT %',
          data: [94, 93, 95, 94, 96, 95],
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    },
    rechazosPorTipo: {
      labels: ['Tono', 'Textura', 'Color', 'Dimensión', 'Acabado'],
      datasets: [
        {
          label: 'Cantidad de Rechazos',
          data: [
            stats.rechazosPorTipo.tono,
            stats.rechazosPorTipo.textura,
            stats.rechazosPorTipo.color,
            stats.rechazosPorTipo.dimension,
            stats.rechazosPorTipo.acabado
          ],
          backgroundColor: [
            '#ef4444',
            '#f59e0b',
            '#3b82f6',
            '#10b981',
            '#8b5cf6'
          ]
        }
      ]
    },
    rendimientoMaquinas: {
      labels: maquinas.map(m => m.id),
      datasets: [
        {
          label: 'Eficiencia %',
          data: maquinas.map(m => m.eficiencia),
          backgroundColor: maquinas.map(m => 
            m.estado === 'operativa' ? '#22c55e' : 
            m.estado === 'mantenimiento' ? '#f59e0b' : '#ef4444'
          )
        }
      ]
    },
    distribucionGravedad: {
      labels: ['Baja', 'Media', 'Alta', 'Crítica'],
      datasets: [
        {
          data: [
            lotes.filter(l => l.gravedad === 'baja').length,
            lotes.filter(l => l.gravedad === 'media').length,
            lotes.filter(l => l.gravedad === 'alta').length,
            lotes.filter(l => l.gravedad === 'critica').length
          ],
          backgroundColor: [
            '#10b981',
            '#f59e0b',
            '#ef4444',
            '#7f1d1d'
          ]
        }
      ]
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#6b7280'
        }
      }
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(107, 114, 128, 0.1)'
        },
        ticks: {
          color: '#6b7280'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6b7280'
        }
      }
    }
  };

  // ================ RENDER ================
  return (
    <div className={`fftt-quality-container theme-${theme}`}>
      {/* Header con navegación mejorada */}
      <header className="fftt-header">
        <div className="header-left">
          <div className="logo-container">
            <div className="logo-3d">
              <span className="logo-icon">⚡</span>
              <span className="logo-text">FFTT</span>
              <span className="logo-badge">Quality Control</span>
            </div>
          </div>
          
          <nav className="main-nav">
            <button 
              className={`nav-btn ${vista === 'dashboard' ? 'active' : ''}`}
              onClick={() => setVista('dashboard')}
              title="Dashboard (Ctrl+D)"
            >
              <span className="nav-icon">📊</span>
              <span className="nav-text">Dashboard</span>
            </button>
            <button 
              className={`nav-btn ${vista === 'maquinas' ? 'active' : ''}`}
              onClick={() => setVista('maquinas')}
              title="12 Máquinas (Ctrl+M)"
            >
              <span className="nav-icon">⚙️</span>
              <span className="nav-text">Máquinas</span>
              <span className="nav-badge">12</span>
            </button>
            <button 
              className={`nav-btn ${vista === 'lotes' ? 'active' : ''}`}
              onClick={() => setVista('lotes')}
              title="Gestión de Lotes (Ctrl+L)"
            >
              <span className="nav-icon">📦</span>
              <span className="nav-text">Lotes</span>
              <span className="nav-badge">{lotes.length}</span>
            </button>
            <button 
              className={`nav-btn ${vista === 'scanner' ? 'active' : ''}`}
              onClick={() => setVista('scanner')}
              title="Escáner (Ctrl+S)"
            >
              <span className="nav-icon">📷</span>
              <span className="nav-text">Escáner</span>
            </button>
            <button 
              className={`nav-btn ${vista === 'analisis' ? 'active' : ''}`}
              onClick={() => setVista('analisis')}
              title="Análisis (Ctrl+A)"
            >
              <span className="nav-icon">📈</span>
              <span className="nav-text">Análisis</span>
            </button>
            <button 
              className={`nav-btn ${vista === 'ia' ? 'active' : ''}`}
              onClick={() => setVista('ia')}
              title="IA Predictiva"
            >
              <span className="nav-icon">🤖</span>
              <span className="nav-text">IA</span>
            </button>
          </nav>
        </div>

        <div className="header-right">
          <div className="header-time">
            <div className="time-digital">
              {currentTime.toLocaleTimeString()}
            </div>
            <div className="date-digital">
              {currentTime.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>

          <div className="header-actions">
            <button className="action-icon" onClick={() => setShowAyuda(true)} title="Ayuda (F1)">
              <span>❓</span>
            </button>
            <button className="action-icon" onClick={() => setShowConfig(true)} title="Configuración">
              <span>⚙️</span>
            </button>
            <button className="action-icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title="Cambiar tema">
              <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
            </button>
            <div className="user-profile">
              <div className="user-avatar">
                <span>👤</span>
              </div>
              <div className="user-info">
                <span className="user-name">Admin</span>
                <span className="user-role">Supervisor</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Panel de Control Principal */}
      <div className="control-panel-moderno">
        <div className="panel-glow-effect"></div>
        
        {/* KPIs Interactivos - Siempre visibles */}
        <div className="kpi-grid-interactivo">
          <div className="kpi-card-interactivo total-muestras" onClick={() => setShowEstadisticas(true)}>
            <div className="kpi-front">
              <div className="kpi-icon-container">
                <span className="kpi-icon-3d">🧪</span>
              </div>
              <div className="kpi-content">
                <span className="kpi-valor-digital">{stats.totalMuestras.toLocaleString()}</span>
                <span className="kpi-label">Total Muestras</span>
              </div>
              <div className="kpi-trend positivo">
                <span>↑ 5.2%</span>
              </div>
            </div>
            <div className="kpi-hover-info">
              <p>Click para ver detalles</p>
            </div>
          </div>

          <div className="kpi-card-interactivo aceptadas" onClick={() => setShowEstadisticas(true)}>
            <div className="kpi-front">
              <div className="kpi-icon-container">
                <span className="kpi-icon-3d">✅</span>
              </div>
              <div className="kpi-content">
                <span className="kpi-valor-digital">{stats.totalAceptadas.toLocaleString()}</span>
                <span className="kpi-label">Muestras Aceptadas</span>
              </div>
              <div className="kpi-trend positivo">
                <span>↑ 3.1%</span>
              </div>
            </div>
          </div>

          <div className="kpi-card-interactivo rechazadas" onClick={() => setShowEstadisticas(true)}>
            <div className="kpi-front">
              <div className="kpi-icon-container">
                <span className="kpi-icon-3d">❌</span>
              </div>
              <div className="kpi-content">
                <span className="kpi-valor-digital">{stats.totalRechazadas.toLocaleString()}</span>
                <span className="kpi-label">Muestras Rechazadas</span>
              </div>
              <div className="kpi-trend negativo">
                <span>↓ 2.1%</span>
              </div>
            </div>
          </div>

          <div className="kpi-card-interactivo tasa-fftt" onClick={() => setShowEstadisticas(true)}>
            <div className="kpi-front">
              <div className="kpi-icon-container">
                <span className="kpi-icon-3d">📊</span>
              </div>
              <div className="kpi-content">
                <span className="kpi-valor-digital">{stats.tasaFFTTPromedio}%</span>
                <span className="kpi-label">Tasa FFTT</span>
              </div>
              <div className="kpi-trend estable">
                <span>→ 0%</span>
              </div>
            </div>
          </div>

          <div className="kpi-card-interactivo lotes-criticos" onClick={() => setShowAlertas(true)}>
            <div className="kpi-front">
              <div className="kpi-icon-container">
                <span className="kpi-icon-3d">⚠️</span>
              </div>
              <div className="kpi-content">
                <span className="kpi-valor-digital">{stats.lotesCriticos}</span>
                <span className="kpi-label">Lotes Críticos</span>
              </div>
              <div className="kpi-trend alerta">
                <span>↑ +2</span>
              </div>
            </div>
          </div>

          <div className="kpi-card-interactivo maquinas" onClick={() => setVista('maquinas')}>
            <div className="kpi-front">
              <div className="kpi-icon-container">
                <span className="kpi-icon-3d">⚙️</span>
              </div>
              <div className="kpi-content">
                <span className="kpi-valor-digital">{stats.maquinasOperativas}/12</span>
                <span className="kpi-label">Máquinas Activas</span>
              </div>
              <div className="kpi-trend positivo">
                <span>{stats.eficienciaPromedio}% ef.</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================ VISTA DE MÁQUINAS (12 Sublimadoras) ================ */}
        {vista === 'maquinas' && (
          <div className="maquinas-panel-premium">
            <div className="panel-header-actions">
              <h2 className="panel-title-premium">
                <span className="title-icon">⚙️</span>
                12 Máquinas de Sublimado
                <span className="title-badge">Tiempo Real</span>
              </h2>
              <div className="header-actions">
                <button 
                  className={`action-btn-small ${vistaMaquinas === 'grid' ? 'active' : ''}`}
                  onClick={() => setVistaMaquinas('grid')}
                >
                  📱 Grid
                </button>
                <button 
                  className={`action-btn-small ${vistaMaquinas === 'lista' ? 'active' : ''}`}
                  onClick={() => setVistaMaquinas('lista')}
                >
                  📋 Lista
                </button>
                <button className="action-btn-small" onClick={() => setShowReportes(true)}>
                  📊 Reporte
                </button>
              </div>
            </div>

            {/* Resumen de máquinas */}
            <div className="maquinas-resumen">
              <div className="resumen-card total">
                <span className="resumen-valor">12</span>
                <span className="resumen-label">Total Máquinas</span>
              </div>
              <div className="resumen-card operativas">
                <span className="resumen-valor">{stats.maquinasOperativas}</span>
                <span className="resumen-label">Operativas</span>
              </div>
              <div className="resumen-card mantenimiento">
                <span className="resumen-valor">{stats.maquinasMantenimiento}</span>
                <span className="resumen-label">Mantenimiento</span>
              </div>
              <div className="resumen-card reparacion">
                <span className="resumen-valor">{stats.maquinasReparacion}</span>
                <span className="resumen-label">Reparación</span>
              </div>
              <div className="resumen-card produccion">
                <span className="resumen-valor">{stats.produccionTotal}/h</span>
                <span className="resumen-label">Producción Total</span>
              </div>
              <div className="resumen-card eficiencia">
                <span className="resumen-valor">{stats.eficienciaPromedio}%</span>
                <span className="resumen-label">Eficiencia Prom.</span>
              </div>
            </div>

            {/* Grid de máquinas */}
            {vistaMaquinas === 'grid' ? (
              <div className="maquinas-grid">
                {maquinas.map(maquina => (
                  <div key={maquina.id} className={`maquina-card ${maquina.estado}`}>
                    <div className="maquina-header">
                      <div className="maquina-titulo">
                        <span className="maquina-id">{maquina.id}</span>
                        <h3 className="maquina-nombre">{maquina.nombre}</h3>
                      </div>
                      <span className={`maquina-estado-badge ${maquina.estado}`}>
                        {maquina.estado === 'operativa' ? '🟢' : 
                         maquina.estado === 'mantenimiento' ? '🟡' : '🔴'} {maquina.estado}
                      </span>
                    </div>

                    <div className="maquina-tipo">{maquina.tipo}</div>

                    <div className="maquina-parametros">
                      <div className="parametro" title="Temperatura">
                        <span className="parametro-icon">🌡️</span>
                        <span className="parametro-valor">{maquina.temperatura}°C</span>
                      </div>
                      <div className="parametro" title="Presión">
                        <span className="parametro-icon">📊</span>
                        <span className="parametro-valor">{maquina.presion} bar</span>
                      </div>
                      <div className="parametro" title="Velocidad">
                        <span className="parametro-icon">⚡</span>
                        <span className="parametro-valor">{maquina.velocidad} rpm</span>
                      </div>
                    </div>

                    <div className="maquina-stats">
                      <div className="stat">
                        <span className="stat-label">Eficiencia</span>
                        <div className="stat-progreso">
                          <div 
                            className="progreso-bar" 
                            style={{ width: `${maquina.eficiencia}%` }}
                          ></div>
                          <span className="stat-valor">{maquina.eficiencia}%</span>
                        </div>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Producción</span>
                        <span className="stat-valor">{maquina.produccion}/h</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Lotes Hoy</span>
                        <span className="stat-valor">{maquina.lotesHoy}</span>
                      </div>
                    </div>

                    {maquina.alertas.length > 0 && (
                      <div className="maquina-alertas">
                        {maquina.alertas.map((alerta, i) => (
                          <span key={i} className="alerta-text">⚠️ {alerta}</span>
                        ))}
                      </div>
                    )}

                    <div className="maquina-acciones">
                      {maquina.estado === 'operativa' ? (
                        <button 
                          className="maquina-btn detener"
                          onClick={() => detenerMaquina(maquina.id)}
                        >
                          ⏹️ Detener
                        </button>
                      ) : maquina.estado === 'mantenimiento' ? (
                        <button 
                          className="maquina-btn iniciar"
                          onClick={() => iniciarMaquina(maquina.id)}
                        >
                          ▶️ Iniciar
                        </button>
                      ) : (
                        <button 
                          className="maquina-btn reparar"
                          onClick={() => programarMantenimiento(maquina.id)}
                        >
                          🔧 Reparar
                        </button>
                      )}
                      <button 
                        className="maquina-btn config"
                        onClick={() => programarMantenimiento(maquina.id)}
                      >
                        ⚙️
                      </button>
                      <button 
                        className="maquina-btn ver"
                        onClick={() => {
                          setFiltroMaquina(maquina.id);
                          setVista('lotes');
                        }}
                      >
                        👁️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Vista de lista de máquinas */
              <div className="maquinas-lista">
                <table className="maquinas-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Máquina</th>
                      <th>Tipo</th>
                      <th>Estado</th>
                      <th>Temperatura</th>
                      <th>Presión</th>
                      <th>Velocidad</th>
                      <th>Eficiencia</th>
                      <th>Producción</th>
                      <th>Lotes Hoy</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maquinas.map(maquina => (
                      <tr key={maquina.id} className={`maquina-row ${maquina.estado}`}>
                        <td className="maquina-id">{maquina.id}</td>
                        <td>{maquina.nombre}</td>
                        <td>{maquina.tipo}</td>
                        <td>
                          <span className={`estado-badge ${maquina.estado}`}>
                            {maquina.estado === 'operativa' ? '🟢' : 
                             maquina.estado === 'mantenimiento' ? '🟡' : '🔴'} {maquina.estado}
                          </span>
                        </td>
                        <td>{maquina.temperatura}°C</td>
                        <td>{maquina.presion} bar</td>
                        <td>{maquina.velocidad} rpm</td>
                        <td>
                          <div className="eficiencia-cell">
                            <div className="eficiencia-bar">
                              <div 
                                className="eficiencia-fill"
                                style={{ width: `${maquina.eficiencia}%` }}
                              ></div>
                            </div>
                            <span>{maquina.eficiencia}%</span>
                          </div>
                        </td>
                        <td>{maquina.produccion}/h</td>
                        <td>{maquina.lotesHoy}</td>
                        <td>
                          <div className="acciones-cell">
                            {maquina.estado === 'operativa' ? (
                              <button className="accion-icon small" onClick={() => detenerMaquina(maquina.id)}>⏹️</button>
                            ) : (
                              <button className="accion-icon small" onClick={() => iniciarMaquina(maquina.id)}>▶️</button>
                            )}
                            <button className="accion-icon small" onClick={() => programarMantenimiento(maquina.id)}>🔧</button>
                            <button className="accion-icon small" onClick={() => {
                              setFiltroMaquina(maquina.id);
                              setVista('lotes');
                            }}>📦</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ================ VISTA DE LOTES ================ */}
        {vista === 'lotes' && (
          <div className="lotes-panel-premium">
            <div className="lotes-header">
              <h2 className="panel-title-premium">
                <span className="title-icon">📦</span>
                Gestión de Lotes
                <span className="title-badge">{lotes.length} total</span>
              </h2>

              <div className="lotes-acciones">
                <button className="accion-btn" onClick={exportarLotes}>
                  <span className="btn-icon">📥</span>
                  <span>Exportar</span>
                </button>
                {loteSeleccionados.length > 0 && (
                  <button className="accion-btn danger" onClick={eliminarSeleccionados}>
                    <span className="btn-icon">🗑️</span>
                    <span>Eliminar ({loteSeleccionados.length})</span>
                  </button>
                )}
                <button className="accion-btn primary" onClick={() => setVista('scanner')}>
                  <span className="btn-icon">➕</span>
                  <span>Nuevo Lote</span>
                </button>
              </div>
            </div>

            <div className="lotes-filtros">
              <div className="filtro-group">
                <input
                  type="text"
                  placeholder="🔍 Buscar lote, PO, operador..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="filtro-input"
                />
              </div>

              <div className="filtro-group">
                <select value={filtroMaquina} onChange={(e) => setFiltroMaquina(e.target.value)} className="filtro-select">
                  <option value="todas">Todas las máquinas</option>
                  {maquinas.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="filtro-group">
                <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="filtro-select">
                  <option value="todos">Todos los estados</option>
                  <option value="nuevo">🆕 Nuevo</option>
                  <option value="en_proceso">⚙️ En proceso</option>
                  <option value="completado">✅ Completado</option>
                  <option value="revision">⚠️ Revisión</option>
                </select>
              </div>

              <div className="filtro-group">
                <select value={ordenarPor} onChange={(e) => setOrdenarPor(e.target.value)} className="filtro-select">
                  <option value="fecha">📅 Por fecha</option>
                  <option value="tasaFFTT">📊 Por tasa FFTT</option>
                </select>
              </div>

              <button 
                className="filtro-direccion"
                onClick={() => setOrdenDireccion(prev => prev === 'desc' ? 'asc' : 'desc')}
                title={ordenDireccion === 'desc' ? 'Descendente' : 'Ascendente'}
              >
                {ordenDireccion === 'desc' ? '↓' : '↑'}
              </button>

              <button className="filtro-selector" onClick={seleccionarTodos}>
                {loteSeleccionados.length === lotesFiltrados.length ? 'Deseleccionar' : 'Seleccionar'}
              </button>
            </div>

            <div className="lotes-table-container">
              <table className="lotes-table">
                <thead>
                  <tr>
                    <th style={{ width: '30px' }}>
                      <input
                        type="checkbox"
                        checked={loteSeleccionados.length === lotesFiltrados.length && lotesFiltrados.length > 0}
                        onChange={seleccionarTodos}
                      />
                    </th>
                    <th>Lote</th>
                    <th>PO</th>
                    <th>Producto</th>
                    <th>Máquina</th>
                    <th>Fecha</th>
                    <th>Turno</th>
                    <th>Operador</th>
                    <th>Muestras</th>
                    <th>Aceptadas</th>
                    <th>Rechazadas</th>
                    <th>FFTT</th>
                    <th>Tono</th>
                    <th>Textura</th>
                    <th>Color</th>
                    <th>Dimensión</th>
                    <th>Acabado</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {lotesFiltrados.map(lote => (
                    <tr key={lote.id} className={`lote-row ${lote.gravedad}`}>
                      <td>
                        <input
                          type="checkbox"
                          checked={loteSeleccionados.includes(lote.id)}
                          onChange={() => toggleSeleccionLote(lote.id)}
                        />
                      </td>
                      <td className="lote-cell">{lote.lote}</td>
                      <td>{lote.po}</td>
                      <td>{lote.sport}</td>
                      <td>
                        <span className="maquina-badge">{lote.maquina}</span>
                      </td>
                      <td>{lote.fecha}</td>
                      <td>
                        <span className={`turno-badge turno-${lote.turno}`}>
                          {lote.turno}
                        </span>
                      </td>
                      <td>{lote.operador}</td>
                      <td className="numero">{lote.totalMuestras}</td>
                      <td className="numero success">{lote.aceptadas}</td>
                      <td className="numero danger">{lote.rechazadas}</td>
                      <td>
                        <div className="tasa-cell">
                          <div className="tasa-bar">
                            <div 
                              className="tasa-fill"
                              style={{ 
                                width: `${lote.tasaFFTT}%`,
                                backgroundColor: lote.tasaFFTT >= 95 ? '#22c55e' :
                                               lote.tasaFFTT >= 90 ? '#f59e0b' : '#ef4444'
                              }}
                            ></div>
                          </div>
                          <span className="tasa-valor">{lote.tasaFFTT}%</span>
                        </div>
                      </td>
                      <td className="numero">{lote.tipoRechazo?.tono || 0}</td>
                      <td className="numero">{lote.tipoRechazo?.textura || 0}</td>
                      <td className="numero">{lote.tipoRechazo?.color || 0}</td>
                      <td className="numero">{lote.tipoRechazo?.dimension || 0}</td>
                      <td className="numero">{lote.tipoRechazo?.acabado || 0}</td>
                      <td>
                        <span className={`estado-badge ${lote.estado}`}>
                          {lote.estado === 'en_proceso' ? '⚙️' :
                           lote.estado === 'completado' ? '✅' :
                           lote.estado === 'revision' ? '⚠️' : '🆕'} {lote.estado}
                        </span>
                      </td>
                      <td>
                        <div className="acciones-cell">
                          <button className="accion-icon small" onClick={() => {
                            setSelectedLote(lote);
                            setModalType('ver');
                            setShowModal(true);
                          }} title="Ver detalles">👁️</button>
                          <button className="accion-icon small" onClick={() => {
                            setSelectedLote(lote);
                            setModalType('editar');
                            setShowModal(true);
                          }} title="Editar">✏️</button>
                          <button className="accion-icon small" onClick={() => duplicarLote(lote)} title="Duplicar">📋</button>
                          <button className="accion-icon small danger" onClick={() => eliminarLote(lote.id)} title="Eliminar">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="lotes-footer">
              <span>Mostrando {lotesFiltrados.length} de {lotes.length} lotes</span>
            </div>
          </div>
        )}

        {/* ================ VISTA DE ESCÁNER ================ */}
        {vista === 'scanner' && (
          <div className="scanner-panel-premium">
            <div className="scanner-header-premium">
              <h2>
                <span className="header-icon-animado">📷</span>
                Escáner de Códigos
              </h2>
              <div className="scanner-status-premium">
                <div className={`status-indicator ${escanerActivo ? 'activo' : 'inactivo'}`}>
                  <span className="status-dot"></span>
                  <span className="status-text">
                    {escanerActivo ? 'Escáner Activo' : 'Escáner Inactivo'}
                  </span>
                </div>
                <div className="scanner-mode">
                  <select 
                    value={scannerState.modo}
                    onChange={(e) => setScannerState(prev => ({ ...prev, modo: e.target.value }))}
                    className="mode-select"
                  >
                    <option value="manual">⌨️ Modo Manual</option>
                    <option value="auto">📷 Modo Auto</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="scanner-grid-premium">
              {/* Panel de Escaneo Activo */}
              <div className="scanner-active-premium">
                {/* Display de código escaneado */}
                <div className="code-display-premium">
                  <div className="code-label">
                    <span>Código Escaneado</span>
                    <span className="code-format">{scannerState.tipoScanner}</span>
                  </div>
                  <div className="code-box-premium">
                    {scannerData.codigoEscaneado ? (
                      <span className="code-value">{scannerData.codigoEscaneado}</span>
                    ) : (
                      <span className="code-placeholder">
                        {escanerActivo ? 'Esperando código...' : 'Activa el escáner'}
                      </span>
                    )}
                  </div>
                  {escanerActivo && codigoTemporal && (
                    <div className="typing-indicator-premium">
                      <span className="typing-text">Escribiendo: {codigoTemporal}</span>
                      <span className="typing-cursor"></span>
                    </div>
                  )}
                </div>

                {/* Controles del escáner */}
                <div className="scanner-controls-premium">
                  {!escanerActivo ? (
                    <button 
                      className="btn-scan premium" 
                      onClick={() => handleIniciarEscaner(scannerState.modo)}
                    >
                      <span className="btn-icon">▶️</span>
                      <span className="btn-text">Iniciar Escáner</span>
                    </button>
                  ) : (
                    <button className="btn-scan stop" onClick={handleDetenerEscaner}>
                      <span className="btn-icon">⏹️</span>
                      <span className="btn-text">Detener Escáner</span>
                    </button>
                  )}
                </div>

                {/* Formulario de datos del escaneo */}
                <div className="scanner-form-premium">
                  <h3 className="form-title">
                    <span className="title-icon">📋</span>
                    Información del Lote
                  </h3>

                  <div className="form-grid-premium">
                    <div className="form-group">
                      <label>📦 Número de Lote</label>
                      <input
                        type="text"
                        value={scannerData.numeroLote}
                        onChange={(e) => setScannerData({...scannerData, numeroLote: e.target.value})}
                        placeholder="Ej: L2401-001"
                        list="lotes-sugeridos"
                      />
                      <datalist id="lotes-sugeridos">
                        {lotes.map(lote => (
                          <option key={lote.id} value={lote.lote} />
                        ))}
                      </datalist>
                    </div>

                    <div className="form-group">
                      <label>🏷️ Tipo de Tallas</label>
                      <select
                        value={scannerData.tipoProducto}
                        onChange={(e) => setScannerData({...scannerData, tipoProducto: e.target.value})}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="LGT"> LGT</option>
                        <option value="MED"> MED</option>
                        <option value="XL"> XL</option>
                        <option value="3XL"> 3XL</option>
                        <option value="LRG"> LRG</option>
                        <option value="XLT"> XLT</option>
                        <option value="XSM"> XSM</option>
                        <option value="3LT"> 3LT</option>

                      </select>
                    </div>

                    <div className="form-group">
                      <label>⚙️ Máquina</label>
                      <select
                        value={scannerData.maquina}
                        onChange={(e) => setScannerData({...scannerData, maquina: e.target.value})}
                      >
                        <option value="">Seleccionar...</option>
                        {maquinas.map(m => (
                          <option key={m.id} value={m.id}>{m.nombre}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>👤 Operador</label>
                      <input
                        type="text"
                        value={scannerData.operador}
                        onChange={(e) => setScannerData({...scannerData, operador: e.target.value})}
                        placeholder="Nombre del operador"
                      />
                    </div>

                    <div className="form-group">
                      <label>🔄 Turno</label>
                      <select
                        value={scannerData.turno}
                        onChange={(e) => setScannerData({...scannerData, turno: e.target.value})}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="A">Turno A (06:00-14:00)</option>
                        <option value="B">Turno B (14:00-22:00)</option>
                        <option value="C">Turno C (22:00-06:00)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>📊 Cantidad</label>
                      <input
                        type="number"
                        value={scannerData.cantidad}
                        onChange={(e) => setScannerData({...scannerData, cantidad: parseInt(e.target.value)})}
                        min="1"
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>📝 Observaciones</label>
                      <textarea
                        value={scannerData.observaciones}
                        onChange={(e) => setScannerData({...scannerData, observaciones: e.target.value})}
                        placeholder="Notas adicionales..."
                        rows="3"
                      />
                    </div>

                    <div className="form-group checkbox">
                      <label>
                        <input
                          type="checkbox"
                          checked={scannerData.reproceso}
                          onChange={(e) => setScannerData({...scannerData, reproceso: e.target.checked})}
                        />
                        Es reproceso
                      </label>
                    </div>

                    <div className="form-group">
                      <label>🎯 Prioridad</label>
                      <select
                        value={scannerData.prioridad}
                        onChange={(e) => setScannerData({...scannerData, prioridad: e.target.value})}
                      >
                        <option value="baja">🟢 Baja</option>
                        <option value="normal">🔵 Normal</option>
                        <option value="alta">🟠 Alta</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-actions-premium">
                    <button className="btn-guardar premium" onClick={handleGuardarEscaneo}>
                      <span className="btn-icon">💾</span>
                      <span>Guardar</span>
                    </button>
                    <button className="btn-limpiar premium" onClick={handleLimpiarEscaneo}>
                      <span className="btn-icon">🧹</span>
                      <span>Limpiar</span>
                    </button>
                    <button className="btn-exportar premium" onClick={() => handleExportarEscaneos('excel')}>
                      <span className="btn-icon">📥</span>
                      <span>Exportar</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Panel de Historial */}
              <div className="scanner-history-premium">
                <div className="history-header">
                  <h3>
                    <span className="header-icon">📜</span>
                    Historial de Escaneos
                  </h3>
                  <div className="history-stats">
                    <div className="stat-mini">
                      <span className="stat-value">{estadisticasEscaneo.totalEscaneos}</span>
                      <span className="stat-label">Total</span>
                    </div>
                    <div className="stat-mini">
                      <span className="stat-value">{estadisticasEscaneo.escaneosHoy}</span>
                      <span className="stat-label">Hoy</span>
                    </div>
                  </div>
                </div>

                <div className="history-list premium">
                  {historialEscaneos.length === 0 ? (
                    <div className="empty-history premium">
                      <div className="empty-icon-animado">📭</div>
                      <p>No hay escaneos</p>
                      <small>Los códigos aparecerán aquí</small>
                    </div>
                  ) : (
                    historialEscaneos.slice(0, 20).map((escaneo, index) => (
                      <div key={escaneo.id} className="history-item premium">
                        <div className="item-header">
                          <div className="item-time">
                            <span className="time">{escaneo.horaEscaneo}</span>
                          </div>
                          <button 
                            className="item-delete"
                            onClick={() => handleEliminarEscaneo(escaneo.id)}
                          >
                            ✕
                          </button>
                        </div>
                        
                        <div className="item-content">
                          <div className="code-section">
                            <span className="label">Código:</span>
                            <span className="code">{escaneo.codigoEscaneado}</span>
                          </div>
                          
                          <div className="details-section">
                            {escaneo.numeroLote && (
                              <div className="detail">
                                <span>📦 {escaneo.numeroLote}</span>
                              </div>
                            )}
                            {escaneo.tipoProducto && (
                              <div className="detail">
                                <span>🏷️ {escaneo.tipoProducto}</span>
                              </div>
                            )}
                            {escaneo.maquina && (
                              <div className="detail">
                                <span>⚙️ {escaneo.maquina}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Instrucciones */}
            <div className="scanner-instructions-premium">
              <div className="instruction-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Activar</h4>
                  <p>Inicia el escáner</p>
                </div>
              </div>
              <div className="instruction-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Escanear</h4>
                  <p>Usa el teclado o escáner</p>
                </div>
              </div>
              <div className="instruction-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Completar</h4>
                  <p>Agrega información</p>
                </div>
              </div>
              <div className="instruction-step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>Guardar</h4>
                  <p>Confirma el registro</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================ VISTA DE ANÁLISIS ================ */}
        {vista === 'analisis' && (
          <div className="analytics-panel-premium">
            <h2 className="panel-title-premium">
              <span className="title-icon">📊</span>
              Análisis de Calidad
            </h2>

            <div className="analytics-grid-premium">
              {/* Gráfico de Tendencia FFTT */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3>Tendencia FFTT</h3>
                  <div className="chart-controls">
                    <button className="chart-btn active">Semanal</button>
                    <button className="chart-btn">Mensual</button>
                  </div>
                </div>
                <div className="chart-container">
                  <Line data={chartData.tendenciaFFTT} options={chartOptions} />
                </div>
              </div>

              {/* Gráfico de Causas de Rechazo */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3>Causas de Rechazo</h3>
                </div>
                <div className="chart-container">
                  <Bar data={chartData.rechazosPorTipo} options={chartOptions} />
                </div>
              </div>

              {/* Gráfico de Rendimiento de Máquinas */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3>Rendimiento por Máquina</h3>
                </div>
                <div className="chart-container">
                  <Bar data={chartData.rendimientoMaquinas} options={chartOptions} />
                </div>
              </div>

              {/* Gráfico de Distribución por Gravedad */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3>Distribución por Gravedad</h3>
                </div>
                <div className="chart-container doughnut">
                  <Doughnut data={chartData.distribucionGravedad} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================ VISTA DE IA ================ */}
        {vista === 'ia' && (
          <div className="ia-panel-premium">
            <h2 className="panel-title-premium">
              <span className="title-icon">🤖</span>
              Asistente de Calidad IA
            </h2>

            <div className="ia-grid-premium">
              {/* Predicciones */}
              <div className="ia-card">
                <h3>📈 Predicciones</h3>
                <div className="predicciones-list">
                  <div className="prediccion-item">
                    <span className="prediccion-label">Próxima semana</span>
                    <div className="prediccion-bar">
                      <div className="bar-fill" style={{width: '75%'}}>
                        <span className="prediccion-valor">-2.3%</span>
                      </div>
                    </div>
                  </div>
                  <div className="prediccion-item">
                    <span className="prediccion-label">Próximo mes</span>
                    <div className="prediccion-bar">
                      <div className="bar-fill" style={{width: '45%'}}>
                        <span className="prediccion-valor">-5.1%</span>
                      </div>
                    </div>
                  </div>
                  <div className="prediccion-item">
                    <span className="prediccion-label">Trimestre</span>
                    <div className="prediccion-bar">
                      <div className="bar-fill" style={{width: '30%'}}>
                        <span className="prediccion-valor">-8.7%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="confianza">
                  <span>Confianza: 85%</span>
                  <div className="confianza-bar">
                    <div className="confianza-fill" style={{width: '85%'}}></div>
                  </div>
                </div>
              </div>

              {/* Recomendaciones */}
              <div className="ia-card">
                <h3>💡 Recomendaciones</h3>
                <div className="recomendaciones-list">
                  <div className="recomendacion alta">
                    <span className="recomendacion-prioridad">🔴 Alta</span>
                    <p>Revisar parámetros en M02 (tono)</p>
                    <span className="recomendacion-impacto">+3.2% calidad</span>
                  </div>
                  <div className="recomendacion media">
                    <span className="recomendacion-prioridad">🟡 Media</span>
                    <p>Capacitación turno B</p>
                    <span className="recomendacion-impacto">+1.8% eficiencia</span>
                  </div>
                  <div className="recomendacion baja">
                    <span className="recomendacion-prioridad">🟢 Baja</span>
                    <p>Calibrar M05 y M09</p>
                    <span className="recomendacion-impacto">+0.9% conformidad</span>
                  </div>
                </div>
              </div>

              {/* Alertas Inteligentes */}
              <div className="ia-card">
                <h3>⚠️ Alertas</h3>
                <div className="alertas-list">
                  <div className="alerta">
                    <span className="alerta-tiempo">Hace 2h</span>
                    <p>Pico de rechazos en M07</p>
                  </div>
                  <div className="alerta">
                    <span className="alerta-tiempo">Hace 5h</span>
                    <p>Patrón anormal en textura</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sistema de Notificaciones */}
      <div className="notifications-container">
        {notificaciones.map(notif => (
          <div key={notif.id} className={`notification ${notif.tipo}`}>
            <div className="notification-content">
              <span className="notification-icon">
                {notif.tipo === 'exito' && '✅'}
                {notif.tipo === 'error' && '❌'}
                {notif.tipo === 'info' && 'ℹ️'}
                {notif.tipo === 'alerta' && '⚠️'}
              </span>
              <span className="notification-message">{notif.mensaje}</span>
            </div>
            <div className="notification-progress"></div>
          </div>
        ))}
      </div>

      {/* Atajos de teclado */}
      <div className="keyboard-shortcuts-hint">
        <span className="hint-item">Ctrl+D: Dashboard</span>
        <span className="hint-item">Ctrl+M: Máquinas</span>
        <span className="hint-item">Ctrl+L: Lotes</span>
        <span className="hint-item">Ctrl+S: Escáner</span>
        <span className="hint-item">Ctrl+A: Análisis</span>
        <span className="hint-item">Esc: Cerrar</span>
      </div>

      {/* Modal de detalles de lote */}
      {showModal && selectedLote && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            
            {modalType === 'ver' && (
              <div className="modal-detalle-lote">
                <h2>Detalles del Lote {selectedLote.lote}</h2>
                <div className="detalle-grid">
                  <div className="detalle-seccion">
                    <h4>Información General</h4>
                    <p><strong>PO:</strong> {selectedLote.po}</p>
                    <p><strong>Producto:</strong> {selectedLote.sport}</p>
                    <p><strong>Fecha:</strong> {selectedLote.fecha}</p>
                    <p><strong>Máquina:</strong> {selectedLote.maquina}</p>
                    <p><strong>Turno:</strong> {selectedLote.turno}</p>
                    <p><strong>Operador:</strong> {selectedLote.operador}</p>
                  </div>
                  
                  <div className="detalle-seccion">
                    <h4>Métricas de Calidad</h4>
                    <p><strong>Total Muestras:</strong> {selectedLote.totalMuestras}</p>
                    <p><strong>Aceptadas:</strong> {selectedLote.aceptadas}</p>
                    <p><strong>Rechazadas:</strong> {selectedLote.rechazadas}</p>
                    <p><strong>Tasa FFTT:</strong> {selectedLote.tasaFFTT}%</p>
                    <p><strong>Nivel Sigma:</strong> {selectedLote.calidad?.sigma}</p>
                  </div>
                  
                  <div className="detalle-seccion">
                    <h4>Parámetros de Producción</h4>
                    <p><strong>Temperatura:</strong> {selectedLote.temperatura}°C</p>
                    <p><strong>Presión:</strong> {selectedLote.presion} bar</p>
                    <p><strong>Velocidad:</strong> {selectedLote.velocidad} rpm</p>
                  </div>
                  
                  <div className="detalle-seccion">
                    <h4>Rechazos por Tipo</h4>
                    <p><strong>Tono:</strong> {selectedLote.tipoRechazo?.tono}</p>
                    <p><strong>Textura:</strong> {selectedLote.tipoRechazo?.textura}</p>
                    <p><strong>Color:</strong> {selectedLote.tipoRechazo?.color}</p>
                    <p><strong>Dimensión:</strong> {selectedLote.tipoRechazo?.dimension}</p>
                    <p><strong>Acabado:</strong> {selectedLote.tipoRechazo?.acabado}</p>
                  </div>
                  
                  <div className="detalle-seccion full-width">
                    <h4>Observaciones</h4>
                    <p>{selectedLote.observaciones}</p>
                  </div>
                  
                  {selectedLote.acciones?.length > 0 && (
                    <div className="detalle-seccion full-width">
                      <h4>Acciones Realizadas</h4>
                      {selectedLote.acciones.map((accion, i) => (
                        <p key={i}>• {accion.fecha}: {accion.accion} ({accion.estado})</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {modalType === 'editar' && (
              <div className="modal-editar-lote">
                <h2>Editar Lote {selectedLote.lote}</h2>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  editarLote(selectedLote.id, selectedLote);
                  setShowModal(false);
                }}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Lote</label>
                      <input 
                        type="text" 
                        value={selectedLote.lote}
                        onChange={(e) => setSelectedLote({...selectedLote, lote: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>PO</label>
                      <input 
                        type="text" 
                        value={selectedLote.po}
                        onChange={(e) => setSelectedLote({...selectedLote, po: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Producto</label>
                      <select 
                        value={selectedLote.sport}
                        onChange={(e) => setSelectedLote({...selectedLote, sport: e.target.value})}
                      >
                        <option value="Baseball">Baseball</option>
                        <option value="Soccer">Soccer</option>
                        <option value="Basketball">Basketball</option>
                        <option value="Football">Football</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Máquina</label>
                      <select 
                        value={selectedLote.maquina}
                        onChange={(e) => setSelectedLote({...selectedLote, maquina: e.target.value})}
                      >
                        {maquinas.map(m => (
                          <option key={m.id} value={m.id}>{m.nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Total Muestras</label>
                      <input 
                        type="number" 
                        value={selectedLote.totalMuestras}
                        onChange={(e) => setSelectedLote({...selectedLote, totalMuestras: parseInt(e.target.value)})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Aceptadas</label>
                      <input 
                        type="number" 
                        value={selectedLote.aceptadas}
                        onChange={(e) => setSelectedLote({...selectedLote, aceptadas: parseInt(e.target.value)})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Rechazadas</label>
                      <input 
                        type="number" 
                        value={selectedLote.rechazadas}
                        onChange={(e) => setSelectedLote({...selectedLote, rechazadas: parseInt(e.target.value)})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Estado</label>
                      <select 
                        value={selectedLote.estado}
                        onChange={(e) => setSelectedLote({...selectedLote, estado: e.target.value})}
                      >
                        <option value="nuevo">Nuevo</option>
                        <option value="en_proceso">En proceso</option>
                        <option value="completado">Completado</option>
                        <option value="revision">Revisión</option>
                      </select>
                    </div>
                    <div className="form-group full-width">
                      <label>Observaciones</label>
                      <textarea 
                        value={selectedLote.observaciones}
                        onChange={(e) => setSelectedLote({...selectedLote, observaciones: e.target.value})}
                        rows="4"
                      />
                    </div>
                  </div>
                  <div className="modal-acciones">
                    <button type="submit" className="btn-guardar">Guardar Cambios</button>
                    <button type="button" className="btn-cancelar" onClick={() => setShowModal(false)}>Cancelar</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FFTTquality; 