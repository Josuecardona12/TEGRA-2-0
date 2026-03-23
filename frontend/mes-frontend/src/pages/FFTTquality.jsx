import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './FFTTquality.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { useProduccion } from '../context/ProduccionContext';
import annotationPlugin from 'chartjs-plugin-annotation';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  annotationPlugin
);

// ============================================
// CONFIGURACIÓN WEBSOCKET
// ============================================
const WS_URL = 'wss://glowing-lamp-r47wvpq4574fxv7j-8080.app.github.dev';

const FFTTquality = () => {
  // ================ USAR CONTEXTO GLOBAL ================
  const { 
    lotes: lotesGlobal,
    ultimoMovimiento: ultimoMovimientoGlobal,
    conectado: wsConectado,
    procesarEscaneo: procesarEscaneoGlobal,
    agregarEvento: agregarEventoGlobal,
    estadisticas: estadisticasGlobal,
    getLotesPorArea
  } = useProduccion();

  // ================ FUNCIONES AUXILIARES ================
  const determinarTurnoActual = () => {
    const hora = new Date().getHours();
    if (hora >= 6 && hora < 14) return 'A';
    if (hora >= 14 && hora < 22) return 'B';
    return 'C';
  };

  const determinarGravedad = (tasaFFTT) => {
    if (tasaFFTT >= 95) return 'baja';
    if (tasaFFTT >= 85) return 'media';
    if (tasaFFTT >= 70) return 'alta';
    return 'critica';
  };

  const generarMuestrasDetalle = (total) => {
    const muestras = [];
    for (let i = 0; i < Math.min(total, 50); i++) {
      muestras.push({
        id: i + 1,
        valor: 70 + Math.random() * 30,
        aceptada: Math.random() > 0.15,
        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString()
      });
    }
    return muestras;
  };

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
  const [showAlertas, setShowAlertas] = useState(false);
  const [showReportes, setShowReportes] = useState(false);
  const [showPredicciones, setShowPredicciones] = useState(false);
  const [filtroMaquina, setFiltroMaquina] = useState('todas');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('fecha');
  const [ordenDireccion, setOrdenDireccion] = useState('desc');
  const [vistaMaquinas, setVistaMaquinas] = useState('grid');
  const [periodoAnalisis, setPeriodoAnalisis] = useState('semanal');
  const [mostrarMetricasAvanzadas, setMostrarMetricasAvanzadas] = useState(false);
  const [mostrarBenchmark, setMostrarBenchmark] = useState(false);

  // ================ ESTADOS DE CONEXIÓN ================
  const [conectado, setConectado] = useState(false);
  const [lotesServidor, setLotesServidor] = useState([]);
  const [ultimoMovimiento, setUltimoMovimiento] = useState(null);
  const wsRef = useRef(null);

  // ================ MÁQUINAS (12 Sublimadoras) ================
  const [maquinas, setMaquinas] = useState(() => {
    const maquinasBase = [
      { id: 'M01', nombre: 'Sublimadora 1', tipo: 'Grande', estado: 'operativa', eficiencia: 95, produccion: 150, temperatura: 185, presion: 3.5, velocidad: 18.5, lotesHoy: 8, alertas: [], oee: 87, mtbf: 720, mttr: 45, consumoEnergia: 12.5 },
      { id: 'M02', nombre: 'Sublimadora 2', tipo: 'Grande', estado: 'operativa', eficiencia: 92, produccion: 145, temperatura: 188, presion: 3.8, velocidad: 19.2, lotesHoy: 7, alertas: [], oee: 85, mtbf: 680, mttr: 52, consumoEnergia: 13.2 },
      { id: 'M03', nombre: 'Sublimadora 3', tipo: 'Mediana', estado: 'mantenimiento', eficiencia: 0, produccion: 0, temperatura: 0, presion: 0, velocidad: 0, lotesHoy: 0, alertas: ['Mantenimiento programado'], oee: 0, mtbf: 0, mttr: 0, consumoEnergia: 0 },
      { id: 'M04', nombre: 'Sublimadora 4', tipo: 'Mediana', estado: 'operativa', eficiencia: 88, produccion: 130, temperatura: 182, presion: 3.4, velocidad: 18.0, lotesHoy: 6, alertas: [], oee: 82, mtbf: 550, mttr: 48, consumoEnergia: 11.8 },
      { id: 'M05', nombre: 'Sublimadora 5', tipo: 'Pequeña', estado: 'operativa', eficiencia: 97, produccion: 120, temperatura: 183, presion: 3.3, velocidad: 17.8, lotesHoy: 9, alertas: [], oee: 91, mtbf: 890, mttr: 38, consumoEnergia: 9.8 },
      { id: 'M06', nombre: 'Sublimadora 6', tipo: 'Pequeña', estado: 'operativa', eficiencia: 91, produccion: 115, temperatura: 184, presion: 3.6, velocidad: 18.2, lotesHoy: 7, alertas: [], oee: 84, mtbf: 620, mttr: 44, consumoEnergia: 10.2 },
      { id: 'M07', nombre: 'Sublimadora 7', tipo: 'Grande', estado: 'operativa', eficiencia: 94, produccion: 148, temperatura: 186, presion: 3.7, velocidad: 19.0, lotesHoy: 8, alertas: [], oee: 86, mtbf: 710, mttr: 42, consumoEnergia: 12.8 },
      { id: 'M08', nombre: 'Sublimadora 8', tipo: 'Grande', estado: 'reparacion', eficiencia: 0, produccion: 0, temperatura: 0, presion: 0, velocidad: 0, lotesHoy: 0, alertas: ['Fallo técnico'], oee: 0, mtbf: 0, mttr: 0, consumoEnergia: 0 },
      { id: 'M09', nombre: 'Sublimadora 9', tipo: 'Mediana', estado: 'operativa', eficiencia: 89, produccion: 125, temperatura: 181, presion: 3.2, velocidad: 17.5, lotesHoy: 6, alertas: [], oee: 81, mtbf: 530, mttr: 47, consumoEnergia: 11.2 },
      { id: 'M10', nombre: 'Sublimadora 10', tipo: 'Mediana', estado: 'operativa', eficiencia: 93, produccion: 135, temperatura: 187, presion: 3.9, velocidad: 19.5, lotesHoy: 7, alertas: [], oee: 85, mtbf: 670, mttr: 49, consumoEnergia: 12.0 },
      { id: 'M11', nombre: 'Sublimadora 11', tipo: 'Pequeña', estado: 'operativa', eficiencia: 96, produccion: 118, temperatura: 182, presion: 3.4, velocidad: 17.9, lotesHoy: 8, alertas: [], oee: 88, mtbf: 750, mttr: 41, consumoEnergia: 9.5 },
      { id: 'M12', nombre: 'Sublimadora 12', tipo: 'Pequeña', estado: 'operativa', eficiencia: 90, produccion: 112, temperatura: 183, presion: 3.5, velocidad: 18.1, lotesHoy: 6, alertas: [], oee: 83, mtbf: 590, mttr: 46, consumoEnergia: 10.5 }
    ];
    return maquinasBase;
  });

  // ================ DATOS DE LOTES ================
  const [lotes, setLotes] = useState([]);

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
      validarFormato: false,
      duplicados: 'alertar',
      prefijos: ['LOT', 'PO', 'BATCH', 'V', 'NK', 'AD', 'DS', 'DIS'],
      longitudMinima: 1,
      longitudMaxima: 50
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

  // ================ FILTROS AVANZADOS ================
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    tipoRechazo: 'todos',
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
    rangoRechazos: [0, 100],
    rangoTemperatura: [170, 200],
    rangoPresion: [2.5, 4.5],
    calidadMinima: 0
  });

  // ================ ANÁLISIS AVANZADO ================
  const [analisisAvanzado, setAnalisisAvanzado] = useState({
    tendencias: [],
    predicciones: [],
    anomalias: [],
    recomendaciones: [],
    correlaciones: {},
    patrones: [],
    alertasPredictivas: []
  });

  const scannerInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const chartRefs = useRef({});

  // ================ SINCRONIZAR CON CONTEXTO GLOBAL ================
  useEffect(() => {
    if (lotesGlobal && lotesGlobal.length > 0 && conectado) {
      const lotesCalidad = getLotesPorArea ? getLotesPorArea('calidad') : lotesGlobal.filter(l => l.areaActual === 'calidad');
      if (lotesCalidad.length > 0) {
        const lotesConvertidos = lotesCalidad.map((lote, index) => ({
          id: lote.id || index + 1,
          lote: lote.codigo,
          po: `PO-${new Date().getFullYear()}-${String(index + 1).padStart(3, '0')}`,
          sport: lote.producto || 'Producto',
          fecha: lote.fechaInicio?.split('T')[0] || new Date().toISOString().split('T')[0],
          horaInicio: lote.horaInicio || new Date().toLocaleTimeString(),
          horaFin: lote.horaFin || '',
          turno: lote.turno || determinarTurnoActual(),
          maquina: lote.maquinaId || `M${String((index % 12) + 1).padStart(2, '0')}`,
          operador: lote.responsable || 'Sistema',
          inspector: 'Pendiente',
          supervisor: 'Pendiente',
          totalMuestras: lote.cantidad || Math.floor(Math.random() * 500) + 100,
          aceptadas: (lote.cantidad || 0) - (lote.rechazadas || 0),
          rechazadas: lote.rechazadas || 0,
          tasaFFTT: lote.progreso || Math.floor(Math.random() * 30) + 70,
          temperatura: lote.temperatura || 180 + Math.floor(Math.random() * 15),
          presion: lote.presion || 3 + (Math.random() * 1.5),
          velocidad: lote.velocidad || 17 + (Math.random() * 3),
          tipoRechazo: lote.tipoRechazo || {
            tono: Math.floor(Math.random() * 15),
            textura: Math.floor(Math.random() * 12),
            color: Math.floor(Math.random() * 20),
            dimension: Math.floor(Math.random() * 8),
            acabado: Math.floor(Math.random() * 10)
          },
          calidad: {
            indiceCalidad: lote.progreso || 85 + Math.floor(Math.random() * 15),
            conformidad: 90 + Math.floor(Math.random() * 10),
            capabilidad: 0.8 + Math.random() * 0.4,
            sigma: 2 + Math.random() * 2,
            cpk: 0.7 + Math.random() * 0.5,
            ppm: Math.floor(Math.random() * 50000)
          },
          materiaPrima: {
            lote: `MP-${Math.floor(Math.random() * 10000)}`,
            proveedor: ['Proveedor A', 'Proveedor B', 'Proveedor C'][Math.floor(Math.random() * 3)],
            certificado: `CERT-${Math.floor(Math.random() * 1000)}`,
            loteOriginal: lote.codigo
          },
          observaciones: lote.observaciones || '',
          acciones: [],
          gravedad: lote.gravedad || determinarGravedad(lote.progreso || 85),
          estado: lote.estado || 'nuevo',
          alertas: lote.alertas || [],
          historialCalidad: [],
          muestrasDetalle: generarMuestrasDetalle(lote.cantidad || 200)
        }));
        
        setLotes(prev => [...prev, ...lotesConvertidos]);
        agregarNotificacion('exito', `📊 ${lotesCalidad.length} lotes sincronizados desde calidad`);
      }
    }
  }, [lotesGlobal, conectado]);

  useEffect(() => {
    if (ultimoMovimientoGlobal) {
      setUltimoMovimiento(ultimoMovimientoGlobal);
      agregarNotificacion('info', `🔄 ${ultimoMovimientoGlobal.lote} → ${ultimoMovimientoGlobal.area}`);
    }
  }, [ultimoMovimientoGlobal]);

  useEffect(() => {
    if (wsConectado !== undefined) {
      setConectado(wsConectado);
    }
  }, [wsConectado]);

  const cargarDatosCalidad = async (loteId) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      agregarNotificacion('exito', `📊 Datos de calidad cargados para ${loteId}`);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // ================ WEBSOCKET ================
  useEffect(() => {
    console.log('🔌 FFTTquality conectando...');
    
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    
    ws.onopen = () => {
      console.log('✅ FFTTquality conectado');
      setConectado(true);
      agregarNotificacion('exito', '✅ Conectado al servidor de trazabilidad');
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📦 FFTTquality recibió:', data.type);
        
        if (data.type === 'INIT' || data.type === 'ACTUALIZACION') {
          const lotesData = data.data.lotes || [];
          setLotesServidor(lotesData);
          
          if (data.data.ultimoMovimiento) {
            setUltimoMovimiento(data.data.ultimoMovimiento);
            agregarNotificacion('info', `🔄 ${data.data.ultimoMovimiento.loteId} → ${data.data.ultimoMovimiento.area}`);
          }
          
          const lotesConvertidos = lotesData.map((lote, index) => ({
            id: index + 1,
            lote: lote.id || `LOTE-${String(index + 1).padStart(3, '0')}`,
            po: `PO-${new Date().getFullYear()}-${String(index + 1).padStart(3, '0')}`,
            sport: lote.producto || 'Producto',
            fecha: lote.fechaInicio?.split('T')[0] || new Date().toISOString().split('T')[0],
            horaInicio: lote.horaInicio || new Date().toLocaleTimeString(),
            horaFin: lote.horaFin || '',
            turno: lote.turno || determinarTurnoActual(),
            maquina: lote.maquinaId || `M${String((index % 12) + 1).padStart(2, '0')}`,
            operador: lote.responsable || 'Sistema',
            inspector: 'Pendiente',
            supervisor: 'Pendiente',
            totalMuestras: lote.cantidad || Math.floor(Math.random() * 500) + 100,
            aceptadas: (lote.cantidad || 0) - (lote.rechazadas || 0),
            rechazadas: lote.rechazadas || 0,
            tasaFFTT: lote.progreso || Math.floor(Math.random() * 30) + 70,
            temperatura: lote.temperatura || 180 + Math.floor(Math.random() * 15),
            presion: lote.presion || 3 + (Math.random() * 1.5),
            velocidad: lote.velocidad || 17 + (Math.random() * 3),
            tipoRechazo: lote.tipoRechazo || {
              tono: Math.floor(Math.random() * 15),
              textura: Math.floor(Math.random() * 12),
              color: Math.floor(Math.random() * 20),
              dimension: Math.floor(Math.random() * 8),
              acabado: Math.floor(Math.random() * 10)
            },
            calidad: {
              indiceCalidad: lote.progreso || 85 + Math.floor(Math.random() * 15),
              conformidad: 90 + Math.floor(Math.random() * 10),
              capabilidad: 0.8 + Math.random() * 0.4,
              sigma: 2 + Math.random() * 2,
              cpk: 0.7 + Math.random() * 0.5,
              ppm: Math.floor(Math.random() * 50000)
            },
            materiaPrima: {
              lote: `MP-${Math.floor(Math.random() * 10000)}`,
              proveedor: ['Proveedor A', 'Proveedor B', 'Proveedor C'][Math.floor(Math.random() * 3)],
              certificado: `CERT-${Math.floor(Math.random() * 1000)}`,
              loteOriginal: lote.codigo
            },
            observaciones: lote.observaciones || '',
            acciones: [],
            gravedad: determinarGravedad(lote.progreso || 85),
            estado: lote.estado || 'nuevo',
            alertas: lote.alertas || []
          }));
          
          setLotes(prev => [...prev, ...lotesConvertidos]);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('❌ Error WebSocket:', error);
      setConectado(false);
      agregarNotificacion('error', '❌ Error de conexión con el servidor');
    };
    
    ws.onclose = () => {
      console.log('❌ FFTTquality desconectado');
      setConectado(false);
    };
    
    return () => ws.close();
  }, []);

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

  useEffect(() => {
    localStorage.setItem('lotesFFTT', JSON.stringify(lotes));
  }, [lotes]);

  useEffect(() => {
    localStorage.setItem('historialEscaneos', JSON.stringify(historialEscaneos));
  }, [historialEscaneos]);

  // ================ ANÁLISIS AVANZADO ================
  const analizarTendencias = useCallback(() => {
    if (lotes.length === 0) return;
    
    const lotesOrdenados = [...lotes].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    const tendencias = [];
    
    for (let i = 0; i < lotesOrdenados.length; i++) {
      const ventana = lotesOrdenados.slice(Math.max(0, i - 5), i + 1);
      const mediaTasa = ventana.reduce((sum, l) => sum + l.tasaFFTT, 0) / ventana.length;
      const desviacion = Math.sqrt(ventana.reduce((sum, l) => sum + Math.pow(l.tasaFFTT - mediaTasa, 2), 0) / ventana.length);
      
      tendencias.push({
        fecha: lotesOrdenados[i].fecha,
        tasa: lotesOrdenados[i].tasaFFTT,
        mediaMovil: mediaTasa,
        tendencia: i > 0 ? lotesOrdenados[i].tasaFFTT - lotesOrdenados[i-1].tasaFFTT : 0,
        volatilidad: desviacion,
        alerta: Math.abs(lotesOrdenados[i].tasaFFTT - mediaTasa) > desviacion * 2
      });
    }
    
    setAnalisisAvanzado(prev => ({ ...prev, tendencias }));
  }, [lotes]);

  const generarPrediccionesIA = useCallback(() => {
    if (lotes.length < 10) return;
    
    const lotesRecientes = [...lotes].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 30);
    const tasas = lotesRecientes.map(l => l.tasaFFTT);
    const mediaHistorica = tasas.reduce((a, b) => a + b, 0) / tasas.length;
    const desviacionHistorica = Math.sqrt(tasas.reduce((sum, t) => sum + Math.pow(t - mediaHistorica, 2), 0) / tasas.length);
    
    const predicciones = [];
    let ultimaTasa = tasas[0];
    
    for (let i = 1; i <= 7; i++) {
      const variacion = (Math.random() - 0.5) * desviacionHistorica * 0.5;
      const prediccion = Math.min(100, Math.max(0, ultimaTasa + variacion));
      predicciones.push({
        dia: i,
        tasaEstimada: Math.round(prediccion * 10) / 10,
        intervaloInferior: Math.max(0, prediccion - desviacionHistorica),
        intervaloSuperior: Math.min(100, prediccion + desviacionHistorica),
        confianza: 100 - (i * 5)
      });
      ultimaTasa = prediccion;
    }
    
    const anomalias = [];
    for (let i = 0; i < tasas.length; i++) {
      if (Math.abs(tasas[i] - mediaHistorica) > desviacionHistorica * 2) {
        anomalias.push({
          fecha: lotesRecientes[i].fecha,
          tasa: tasas[i],
          desviacion: tasas[i] - mediaHistorica,
          gravedad: Math.abs(tasas[i] - mediaHistorica) / desviacionHistorica
        });
      }
    }
    
    const recomendaciones = [];
    if (mediaHistorica < 85) {
      recomendaciones.push({
        prioridad: 'alta',
        titulo: 'Disminución de calidad detectada',
        descripcion: `La tasa FFTT promedio (${Math.round(mediaHistorica)}%) está por debajo del objetivo (85%)`,
        acciones: ['Revisar parámetros de temperatura', 'Calibrar máquinas', 'Capacitar operadores']
      });
    }
    
    if (anomalias.length > 3) {
      recomendaciones.push({
        prioridad: 'media',
        titulo: 'Patrones anómalos detectados',
        descripcion: `Se detectaron ${anomalias.length} lotes con comportamiento atípico`,
        acciones: ['Analizar causas raíz', 'Revisar materia prima', 'Ajustar controles de proceso']
      });
    }
    
    setAnalisisAvanzado(prev => ({
      ...prev,
      predicciones,
      anomalias,
      recomendaciones
    }));
  }, [lotes]);

  useEffect(() => {
    analizarTendencias();
    generarPrediccionesIA();
  }, [lotes, analizarTendencias, generarPrediccionesIA]);

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

  const validarFormatoCodigo = (codigo) => {
    if (!codigo) return false;
    if (codigo.length < scannerState.configuracion.longitudMinima) return false;
    if (codigo.length > scannerState.configuracion.longitudMaxima) return false;
    if (!scannerState.configuracion.validarFormato) return true;
    
    const tienePrefijoValido = scannerState.configuracion.prefijos.some(
      prefijo => codigo.startsWith(prefijo)
    );
    return tienePrefijoValido;
  };

  const extraerInfoCodigo = (codigo) => {
    const info = {
      codigoOriginal: codigo,
      timestamp: Date.now()
    };

    if (codigo.includes('/')) {
      const partes = codigo.split('/');
      if (partes.length === 2) {
        info.formato = 'compuesto';
        info.prefijo = partes[0];
        info.sufijo = partes[1];
        
        const matchV = partes[0].match(/^V(\d{6})$/);
        if (matchV) {
          const año = matchV[1].substring(0, 2);
          const mes = matchV[1].substring(2, 4);
          const dia = matchV[1].substring(4, 6);
          info.fecha = `20${año}-${mes}-${dia}`;
          info.numeroV = matchV[1];
        }
      }
    }

    if (codigo.includes('-')) {
      const partes = codigo.split('-');
      if (partes.length === 2) {
        info.formato = 'guion';
        info.prefijo = partes[0];
        info.numero = partes[1];
      }
    }

    if (/^\d+$/.test(codigo)) {
      info.formato = 'numerico';
      info.numero = codigo;
    }

    return info;
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

  const procesarCodigoEscaneado = (codigo) => {
    const codigoLimpio = codigo.trim().toUpperCase();
    
    if (procesarEscaneoGlobal && conectado) {
      procesarEscaneoGlobal(codigoLimpio);
    }
    
    setScannerData(prev => ({
      ...prev,
      codigoEscaneado: codigoLimpio
    }));

    const infoCodigo = extraerInfoCodigo(codigoLimpio);
    
    const loteExistente = lotes.find(l => l.lote === codigoLimpio);
    if (loteExistente) {
      setScannerData(prev => ({
        ...prev,
        numeroLote: loteExistente.lote,
        tipoProducto: loteExistente.sport,
        maquina: loteExistente.maquina,
        operador: loteExistente.operador,
        turno: loteExistente.turno
      }));
    } else {
      setScannerData(prev => ({
        ...prev,
        numeroLote: codigoLimpio,
        tipoProducto: infoCodigo.prefijo || 'Producto',
        observaciones: `Código escaneado: ${codigoLimpio}`
      }));
    }

    const formatoValido = validarFormatoCodigo(codigoLimpio);
    
    if (!formatoValido && scannerState.configuracion.validarFormato) {
      agregarNotificacion('error', 'Formato de código inválido');
      reproducirSonido('error');
      return;
    }

    const esDuplicado = verificarDuplicado(codigoLimpio);
    
    if (esDuplicado) {
      switch (scannerState.configuracion.duplicados) {
        case 'alertar':
          agregarNotificacion('alerta', '⚠️ Código ya escaneado anteriormente');
          break;
        case 'bloquear':
          agregarNotificacion('error', '❌ Código duplicado - No permitido');
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
      ultimoCodigo: codigoLimpio
    }));

    actualizarEstadisticasEscaneo(codigoLimpio);
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
      } else if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        setMostrarMetricasAvanzadas(prev => !prev);
      } else if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        setMostrarBenchmark(prev => !prev);
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
      estacion: 'Estación de Calidad'
    };

    const nuevoHistorial = [nuevoEscaneo, ...historialEscaneos];
    setHistorialEscaneos(nuevoHistorial);

    if (scannerData.numeroLote) {
      const loteExistente = lotes.find(l => l.lote === scannerData.numeroLote);
      if (loteExistente) {
        setLotes(lotes.map(l => 
          l.lote === scannerData.numeroLote 
            ? { ...l, totalMuestras: l.totalMuestras + scannerData.cantidad, calidad: { ...l.calidad, ultimoEscaneo: new Date().toISOString() } }
            : l
        ));
        agregarNotificacion('exito', `✅ Lote ${scannerData.numeroLote} actualizado en calidad`);
      } else {
        const nuevoLote = {
          id: Date.now() + 1,
          lote: scannerData.numeroLote,
          po: `PO-${new Date().getFullYear()}-${String(lotes.length + 1).padStart(3, '0')}`,
          sport: scannerData.tipoProducto || 'Producto Genérico',
          fecha: scannerData.fechaEscaneo,
          horaInicio: scannerData.horaEscaneo,
          horaFin: '',
          turno: scannerData.turno || determinarTurnoActual(),
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
            sigma: 3.0,
            cpk: 1.0,
            ppm: 0
          },
          materiaPrima: {
            lote: '',
            proveedor: '',
            certificado: '',
            loteOriginal: scannerData.loteOriginal || scannerData.codigoEscaneado
          },
          observaciones: scannerData.observaciones || `Lote creado desde escáner de calidad - Código: ${scannerData.codigoEscaneado}`,
          acciones: [],
          gravedad: 'baja',
          estado: 'nuevo',
          alertas: [],
          historialCalidad: [{
            fecha: new Date().toISOString(),
            accion: 'Creación',
            usuario: 'Sistema',
            observaciones: 'Lote registrado desde escáner'
          }]
        };
        setLotes([nuevoLote, ...lotes]);
        agregarNotificacion('exito', `✅ Nuevo lote ${scannerData.numeroLote} creado en calidad`);
      }
    }

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
      saveAs(data, `escaneos_calidad_${new Date().toISOString().split('T')[0]}.xlsx`);
    } else {
      const dataStr = JSON.stringify(historialEscaneos, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `escaneos_calidad_${new Date().toISOString().split('T')[0]}.json`;
      
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
      alertas: [],
      historialCalidad: [{
        fecha: new Date().toISOString(),
        accion: 'Creación',
        usuario: 'Sistema',
        observaciones: 'Lote agregado manualmente'
      }]
    };
    setLotes([lote, ...lotes]);
    agregarNotificacion('exito', '✅ Lote agregado al sistema de calidad');
  };

  const editarLote = (id, datos) => {
    setLotes(lotes.map(l => l.id === id ? { ...l, ...datos, historialCalidad: [...(l.historialCalidad || []), {
      fecha: new Date().toISOString(),
      accion: 'Edición',
      usuario: 'Admin',
      observaciones: 'Lote editado'
    }] } : l));
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
      estado: 'borrador',
      historialCalidad: [{
        fecha: new Date().toISOString(),
        accion: 'Duplicación',
        usuario: 'Admin',
        observaciones: `Copia de lote original ${lote.lote}`
      }]
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
    XLSX.utils.book_append_sheet(wb, ws, 'Lotes_Calidad');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, `lotes_calidad_${new Date().toISOString().split('T')[0]}.xlsx`);
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
  const lotesFiltrados = useMemo(() => {
    return lotes.filter(lote => {
      if (filtroMaquina !== 'todas' && lote.maquina !== filtroMaquina) return false;
      if (filtroEstado !== 'todos' && lote.estado !== filtroEstado) return false;
      if (filtros.turno !== 'todos' && lote.turno !== filtros.turno) return false;
      if (filtros.gravedad !== 'todos' && lote.gravedad !== filtros.gravedad) return false;
      if (lote.tasaFFTT < filtros.rangoTasaFFTT[0] || lote.tasaFFTT > filtros.rangoTasaFFTT[1]) return false;
      if (lote.temperatura < filtros.rangoTemperatura[0] || lote.temperatura > filtros.rangoTemperatura[1]) return false;
      if (filtros.soloCriticos && lote.gravedad !== 'critica') return false;
      if (filtros.soloAlertas && (!lote.alertas || lote.alertas.length === 0)) return false;
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
      if (ordenarPor === 'gravedad') {
        const gravedadOrder = { critica: 4, alta: 3, media: 2, baja: 1 };
        return ordenDireccion === 'desc'
          ? gravedadOrder[b.gravedad] - gravedadOrder[a.gravedad]
          : gravedadOrder[a.gravedad] - gravedadOrder[b.gravedad];
      }
      return 0;
    });
  }, [lotes, filtroMaquina, filtroEstado, filtros, busqueda, ordenarPor, ordenDireccion]);

  const stats = useMemo(() => ({
    totalLotes: lotes.length,
    totalMuestras: lotes.reduce((sum, l) => sum + l.totalMuestras, 0),
    totalAceptadas: lotes.reduce((sum, l) => sum + l.aceptadas, 0),
    totalRechazadas: lotes.reduce((sum, l) => sum + l.rechazadas, 0),
    tasaFFTTPromedio: lotes.length ? Math.round(lotes.reduce((sum, l) => sum + l.tasaFFTT, 0) / lotes.length) : 0,
    lotesCriticos: lotes.filter(l => l.gravedad === 'critica').length,
    lotesAlta: lotes.filter(l => l.gravedad === 'alta').length,
    lotesMedia: lotes.filter(l => l.gravedad === 'media').length,
    lotesBaja: lotes.filter(l => l.gravedad === 'baja').length,
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
    eficienciaPromedio: Math.round(maquinas.filter(m => m.estado === 'operativa').reduce((sum, m) => sum + m.eficiencia, 0) / maquinas.filter(m => m.estado === 'operativa').length) || 0,
    oeePromedio: Math.round(maquinas.filter(m => m.estado === 'operativa').reduce((sum, m) => sum + (m.oee || 0), 0) / maquinas.filter(m => m.estado === 'operativa').length) || 0,
    ppmPromedio: Math.round(lotes.reduce((sum, l) => sum + (l.calidad?.ppm || 0), 0) / lotes.length) || 0,
    sigmaPromedio: lotes.length ? (lotes.reduce((sum, l) => sum + (l.calidad?.sigma || 0), 0) / lotes.length).toFixed(1) : 0,
    cpkPromedio: lotes.length ? (lotes.reduce((sum, l) => sum + (l.calidad?.cpk || 0), 0) / lotes.length).toFixed(2) : 0
  }), [lotes, maquinas]);

  // ================ DATOS PARA GRÁFICOS ================
  const chartData = useMemo(() => ({
    tendenciaFFTT: {
      labels: lotes.slice(0, 20).map(l => l.fecha).reverse(),
      datasets: [
        {
          label: 'Tasa FFTT %',
          data: lotes.slice(0, 20).map(l => l.tasaFFTT).reverse(),
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#6366f1',
          pointBorderColor: '#fff',
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: 'Media Móvil (5 días)',
          data: analisisAvanzado.tendencias.slice(-20).map(t => t.mediaMovil).reverse(),
          borderColor: '#f59e0b',
          borderDash: [5, 5],
          backgroundColor: 'transparent',
          fill: false,
          tension: 0.4,
          pointRadius: 0
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
            'rgba(239, 68, 68, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(139, 92, 246, 0.8)'
          ],
          borderRadius: 8,
          barPercentage: 0.7,
          categoryPercentage: 0.8
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
            m.estado === 'operativa' ? 'rgba(34, 197, 94, 0.8)' : 
            m.estado === 'mantenimiento' ? 'rgba(245, 158, 11, 0.8)' : 'rgba(239, 68, 68, 0.8)'
          ),
          borderRadius: 8,
          barPercentage: 0.7
        },
        {
          label: 'OEE %',
          data: maquinas.map(m => m.oee || 0),
          backgroundColor: 'rgba(99, 102, 241, 0.8)',
          borderRadius: 8,
          barPercentage: 0.7
        }
      ]
    },
    distribucionGravedad: {
      labels: ['Baja', 'Media', 'Alta', 'Crítica'],
      datasets: [
        {
          data: [stats.lotesBaja, stats.lotesMedia, stats.lotesAlta, stats.lotesCriticos],
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(127, 29, 29, 0.8)'
          ],
          borderWidth: 0,
          cutout: '60%'
        }
      ]
    },
    calidadRadar: {
      labels: ['Tasa FFTT', 'Conformidad', 'Capabilidad', 'Sigma', 'Cpk', 'Eficiencia'],
      datasets: [
        {
          label: 'Calidad Actual',
          data: [
            stats.tasaFFTTPromedio,
            (lotes.reduce((sum, l) => sum + (l.calidad?.conformidad || 0), 0) / lotes.length) || 0,
            (lotes.reduce((sum, l) => sum + (l.calidad?.capabilidad || 0), 0) / lotes.length) || 0,
            parseFloat(stats.sigmaPromedio) * 10,
            parseFloat(stats.cpkPromedio) * 100,
            stats.eficienciaPromedio
          ],
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          borderColor: '#6366f1',
          borderWidth: 2,
          pointBackgroundColor: '#6366f1',
          pointBorderColor: '#fff',
          pointRadius: 4
        },
        {
          label: 'Objetivo',
          data: [95, 98, 1.33, 40, 133, 95],
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderColor: '#22c55e',
          borderWidth: 2,
          borderDash: [5, 5],
          pointBackgroundColor: '#22c55e',
          pointRadius: 3
        }
      ]
    },
    predicciones: {
      labels: analisisAvanzado.predicciones.map(p => `Día ${p.dia}`),
      datasets: [
        {
          label: 'Predicción FFTT',
          data: analisisAvanzado.predicciones.map(p => p.tasaEstimada),
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Intervalo de Confianza',
          data: analisisAvanzado.predicciones.map(p => p.intervaloSuperior),
          borderColor: 'transparent',
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          fill: '+1',
          tension: 0.4
        },
        {
          label: 'Intervalo Inferior',
          data: analisisAvanzado.predicciones.map(p => p.intervaloInferior),
          borderColor: 'transparent',
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          fill: false,
          tension: 0.4
        }
      ]
    }
  }), [lotes, stats, maquinas, analisisAvanzado]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#6b7280',
          usePointStyle: true,
          boxWidth: 10
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#e5e7eb',
        borderColor: '#6366f1',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            label += context.raw;
            if (context.dataset.label?.includes('%')) label += '%';
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(107, 114, 128, 0.1)'
        },
        ticks: {
          color: '#6b7280',
          callback: function(value) {
            return value + '%';
          }
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
    <div className={`fftt-premium-container theme-${theme}`}>
      {/* HEADER PREMIUM */}
      <header className="fftt-premium-header">
        <div className="header-glow"></div>
        <div className="header-content">
          <div className="logo-premium-area">
            <div className="logo-3d-container">
              <div className="logo-3d">
                <span className="logo-icon">⚡</span>
                <span className="logo-text">FFTT</span>
                <span className="logo-badge-premium">Quality Pro</span>
              </div>
            </div>
            
            <nav className="nav-premium">
              <button 
                className={`nav-premium-btn ${vista === 'dashboard' ? 'active' : ''}`}
                onClick={() => setVista('dashboard')}
              >
                <span className="nav-icon">📊</span>
                <span className="nav-text">Dashboard</span>
                <span className="nav-tooltip">Ctrl+D</span>
              </button>
              <button 
                className={`nav-premium-btn ${vista === 'maquinas' ? 'active' : ''}`}
                onClick={() => setVista('maquinas')}
              >
                <span className="nav-icon">⚙️</span>
                <span className="nav-text">Máquinas</span>
                <span className="nav-badge">12</span>
              </button>
              <button 
                className={`nav-premium-btn ${vista === 'lotes' ? 'active' : ''}`}
                onClick={() => setVista('lotes')}
              >
                <span className="nav-icon">📦</span>
                <span className="nav-text">Lotes</span>
                <span className="nav-badge">{lotes.length}</span>
              </button>
              <button 
                className={`nav-premium-btn ${vista === 'scanner' ? 'active' : ''}`}
                onClick={() => setVista('scanner')}
              >
                <span className="nav-icon">📷</span>
                <span className="nav-text">Escáner</span>
              </button>
              <button 
                className={`nav-premium-btn ${vista === 'analisis' ? 'active' : ''}`}
                onClick={() => setVista('analisis')}
              >
                <span className="nav-icon">📈</span>
                <span className="nav-text">Análisis</span>
              </button>
              <button 
                className={`nav-premium-btn ${vista === 'ia' ? 'active' : ''}`}
                onClick={() => setVista('ia')}
              >
                <span className="nav-icon">🤖</span>
                <span className="nav-text">IA Predictiva</span>
              </button>
            </nav>
          </div>

          <div className="header-actions-premium">
            <div className={`connection-status ${conectado ? 'online' : 'offline'}`}>
              <div className="status-pulse"></div>
              <span>{conectado ? 'SERVIDOR ONLINE' : 'OFFLINE'}</span>
            </div>

            <div className="time-premium">
              <div className="time-digital-premium">
                {currentTime.toLocaleTimeString()}
              </div>
              <div className="date-premium">
                {currentTime.toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                })}
              </div>
            </div>

            <button className="icon-btn-premium" onClick={() => setShowAyuda(true)}>
              ❓
            </button>
            <button className="icon-btn-premium" onClick={() => setShowConfig(true)}>
              ⚙️
            </button>
            <button className="icon-btn-premium" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            
            <div className="user-premium">
              <div className="user-avatar-premium">
                <span>👤</span>
              </div>
              <div className="user-info-premium">
                <span className="user-name">Admin</span>
                <span className="user-role">Supervisor Calidad</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ÚLTIMO MOVIMIENTO */}
      {ultimoMovimiento && (
        <div className="last-movement-premium animate-slide-down">
          <span className="movement-icon">🔄</span>
          <span className="movement-text">{ultimoMovimiento.lote} → {ultimoMovimiento.area}</span>
          <span className="movement-time">ahora</span>
          <div className="movement-progress"></div>
        </div>
      )}

      {/* PANEL DE CONTROL PRINCIPAL */}
      <div className="control-premium-panel">
        <div className="panel-background-glow"></div>
        
        {/* KPI CARDS PREMIUM */}
        <div className="kpi-premium-grid">
          <div className="kpi-premium-card" onClick={() => setShowEstadisticas(true)}>
            <div className="kpi-premium-icon">🧪</div>
            <div className="kpi-premium-content">
              <div className="kpi-premium-value">{stats.totalMuestras.toLocaleString()}</div>
              <div className="kpi-premium-label">Total Muestras</div>
            </div>
            <div className="kpi-premium-trend positive">
              <span>↑ {((stats.totalAceptadas / stats.totalMuestras) * 100).toFixed(1)}%</span>
            </div>
            <div className="kpi-premium-glow"></div>
          </div>

          <div className="kpi-premium-card" onClick={() => setShowEstadisticas(true)}>
            <div className="kpi-premium-icon">✅</div>
            <div className="kpi-premium-content">
              <div className="kpi-premium-value">{stats.totalAceptadas.toLocaleString()}</div>
              <div className="kpi-premium-label">Aceptadas</div>
            </div>
            <div className="kpi-premium-trend positive">
              <span>↑ {stats.tasaFFTTPromedio}%</span>
            </div>
          </div>

          <div className="kpi-premium-card" onClick={() => setShowEstadisticas(true)}>
            <div className="kpi-premium-icon">❌</div>
            <div className="kpi-premium-content">
              <div className="kpi-premium-value">{stats.totalRechazadas.toLocaleString()}</div>
              <div className="kpi-premium-label">Rechazadas</div>
            </div>
            <div className="kpi-premium-trend negative">
              <span>↓ {((stats.totalRechazadas / stats.totalMuestras) * 100).toFixed(1)}%</span>
            </div>
          </div>

          <div className="kpi-premium-card" onClick={() => setShowEstadisticas(true)}>
            <div className="kpi-premium-icon">📊</div>
            <div className="kpi-premium-content">
              <div className="kpi-premium-value">{stats.tasaFFTTPromedio}%</div>
              <div className="kpi-premium-label">Tasa FFTT</div>
            </div>
            <div className="kpi-premium-trend">
              <span>Nivel {stats.sigmaPromedio}σ</span>
            </div>
          </div>

          <div className="kpi-premium-card" onClick={() => setShowAlertas(true)}>
            <div className="kpi-premium-icon">⚠️</div>
            <div className="kpi-premium-content">
              <div className="kpi-premium-value">{stats.lotesCriticos}</div>
              <div className="kpi-premium-label">Lotes Críticos</div>
            </div>
            <div className="kpi-premium-trend alert">
              <span>+{stats.lotesCriticos}</span>
            </div>
          </div>

          <div className="kpi-premium-card" onClick={() => setVista('maquinas')}>
            <div className="kpi-premium-icon">⚙️</div>
            <div className="kpi-premium-content">
              <div className="kpi-premium-value">{stats.maquinasOperativas}/12</div>
              <div className="kpi-premium-label">Máquinas Activas</div>
            </div>
            <div className="kpi-premium-trend">
              <span>{stats.oeePromedio}% OEE</span>
            </div>
          </div>
        </div>

        {/* ================ VISTA DE MÁQUINAS PREMIUM ================ */}
        {vista === 'maquinas' && (
          <div className="maquinas-premium-panel">
            <div className="panel-premium-header">
              <h2 className="panel-premium-title">
                <span className="title-icon">⚙️</span>
                Máquinas de Sublimado
                <span className="title-badge-premium">12 Unidades</span>
              </h2>
              <div className="panel-premium-actions">
                <button className={`action-premium-btn ${vistaMaquinas === 'grid' ? 'active' : ''}`} onClick={() => setVistaMaquinas('grid')}>
                  📱 Grid
                </button>
                <button className={`action-premium-btn ${vistaMaquinas === 'lista' ? 'active' : ''}`} onClick={() => setVistaMaquinas('lista')}>
                  📋 Lista
                </button>
                <button className="action-premium-btn" onClick={() => setMostrarMetricasAvanzadas(!mostrarMetricasAvanzadas)}>
                  📊 Métricas
                </button>
              </div>
            </div>

            {/* Resumen de máquinas */}
            <div className="maquinas-resumen-premium">
              <div className="resumen-premium-card total">
                <span className="resumen-valor">12</span>
                <span className="resumen-label">Total</span>
              </div>
              <div className="resumen-premium-card operativas">
                <span className="resumen-valor">{stats.maquinasOperativas}</span>
                <span className="resumen-label">Operativas</span>
              </div>
              <div className="resumen-premium-card mantenimiento">
                <span className="resumen-valor">{stats.maquinasMantenimiento}</span>
                <span className="resumen-label">Mantenimiento</span>
              </div>
              <div className="resumen-premium-card reparacion">
                <span className="resumen-valor">{stats.maquinasReparacion}</span>
                <span className="resumen-label">Reparación</span>
              </div>
              <div className="resumen-premium-card produccion">
                <span className="resumen-valor">{stats.produccionTotal}/h</span>
                <span className="resumen-label">Producción</span>
              </div>
              <div className="resumen-premium-card oee">
                <span className="resumen-valor">{stats.oeePromedio}%</span>
                <span className="resumen-label">OEE</span>
              </div>
            </div>

            {/* Grid de máquinas */}
            {vistaMaquinas === 'grid' ? (
              <div className="maquinas-premium-grid">
                {maquinas.map(maquina => (
                  <div key={maquina.id} className={`machine-premium-card ${maquina.estado}`}>
                    <div className="machine-premium-header">
                      <div className="machine-premium-title">
                        <span className="machine-id">{maquina.id}</span>
                        <h3>{maquina.nombre}</h3>
                      </div>
                      <span className={`machine-status-badge ${maquina.estado}`}>
                        {maquina.estado === 'operativa' ? '🟢' : maquina.estado === 'mantenimiento' ? '🟡' : '🔴'} {maquina.estado}
                      </span>
                    </div>
                    <div className="machine-type">{maquina.tipo}</div>
                    
                    <div className="machine-params">
                      <div className="param" title="Temperatura">
                        <span>🌡️</span>
                        <span>{maquina.temperatura}°C</span>
                      </div>
                      <div className="param" title="Presión">
                        <span>📊</span>
                        <span>{maquina.presion} bar</span>
                      </div>
                      <div className="param" title="Velocidad">
                        <span>⚡</span>
                        <span>{maquina.velocidad} rpm</span>
                      </div>
                    </div>

                    <div className="machine-stats">
                      <div className="stat">
                        <span className="stat-label">Eficiencia</span>
                        <div className="stat-bar">
                          <div className="stat-fill" style={{ width: `${maquina.eficiencia}%` }}></div>
                        </div>
                        <span className="stat-value">{maquina.eficiencia}%</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">OEE</span>
                        <div className="stat-bar">
                          <div className="stat-fill" style={{ width: `${maquina.oee || 0}%`, background: '#6366f1' }}></div>
                        </div>
                        <span className="stat-value">{maquina.oee || 0}%</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Producción</span>
                        <span className="stat-value">{maquina.produccion}/h</span>
                      </div>
                    </div>

                    {mostrarMetricasAvanzadas && (
                      <div className="machine-advanced-metrics">
                        <div className="metric">
                          <span>MTBF</span>
                          <strong>{maquina.mtbf || 0}h</strong>
                        </div>
                        <div className="metric">
                          <span>MTTR</span>
                          <strong>{maquina.mttr || 0}min</strong>
                        </div>
                        <div className="metric">
                          <span>Energía</span>
                          <strong>{maquina.consumoEnergia || 0}kWh</strong>
                        </div>
                      </div>
                    )}

                    {maquina.alertas.length > 0 && (
                      <div className="machine-alerts">
                        {maquina.alertas.map((alerta, i) => (
                          <span key={i} className="alert">⚠️ {alerta}</span>
                        ))}
                      </div>
                    )}

                    <div className="machine-actions">
                      {maquina.estado === 'operativa' ? (
                        <button className="action-btn stop" onClick={() => detenerMaquina(maquina.id)}>⏹️ Detener</button>
                      ) : maquina.estado === 'mantenimiento' ? (
                        <button className="action-btn start" onClick={() => iniciarMaquina(maquina.id)}>▶️ Iniciar</button>
                      ) : (
                        <button className="action-btn repair" onClick={() => programarMantenimiento(maquina.id)}>🔧 Reparar</button>
                      )}
                      <button className="action-btn icon" onClick={() => programarMantenimiento(maquina.id)}>⚙️</button>
                      <button className="action-btn icon" onClick={() => {
                        setFiltroMaquina(maquina.id);
                        setVista('lotes');
                      }}>👁️</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="maquinas-lista-premium">
                <table className="maquinas-table-premium">
                  <thead>
                    <tr>
                      <th>ID</th><th>Máquina</th><th>Tipo</th><th>Estado</th><th>Temperatura</th><th>Presión</th><th>Eficiencia</th><th>OEE</th><th>Producción</th><th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maquinas.map(maquina => (
                      <tr key={maquina.id} className={`machine-row ${maquina.estado}`}>
                        <td>{maquina.id}</td>
                        <td>{maquina.nombre}</td>
                        <td>{maquina.tipo}</td>
                        <td><span className={`status-badge ${maquina.estado}`}>{maquina.estado}</span></td>
                        <td>{maquina.temperatura}°C</td>
                        <td>{maquina.presion} bar</td>
                        <td>
                          <div className="efficiency-cell">
                            <div className="efficiency-bar"><div style={{ width: `${maquina.eficiencia}%` }}></div></div>
                            <span>{maquina.eficiencia}%</span>
                          </div>
                        </td>
                        <td>{maquina.oee || 0}%</td>
                        <td>{maquina.produccion}/h</td>
                        <td>
                          <div className="action-buttons">
                            {maquina.estado === 'operativa' ? 
                              <button onClick={() => detenerMaquina(maquina.id)}>⏹️</button> :
                              <button onClick={() => iniciarMaquina(maquina.id)}>▶️</button>
                            }
                            <button onClick={() => programarMantenimiento(maquina.id)}>🔧</button>
                            <button onClick={() => {
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

        {/* ================ VISTA DE LOTES PREMIUM ================ */}
        {vista === 'lotes' && (
          <div className="lotes-premium-panel">
            <div className="panel-premium-header">
              <h2 className="panel-premium-title">
                <span className="title-icon">📦</span>
                Gestión de Lotes - Control Calidad
                <span className="title-badge-premium">{lotes.length} total</span>
              </h2>
              <div className="panel-premium-actions">
                <button className="action-premium-btn" onClick={exportarLotes}>📥 Exportar</button>
                {loteSeleccionados.length > 0 && (
                  <button className="action-premium-btn danger" onClick={eliminarSeleccionados}>🗑️ Eliminar ({loteSeleccionados.length})</button>
                )}
                <button className="action-premium-btn primary" onClick={() => setVista('scanner')}>➕ Nuevo Lote</button>
              </div>
            </div>

            <div className="filtros-premium">
              <div className="filtro-group">
                <input type="text" placeholder="🔍 Buscar lote, PO, operador..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="filtro-input" />
              </div>
              <div className="filtro-group">
                <select value={filtroMaquina} onChange={(e) => setFiltroMaquina(e.target.value)} className="filtro-select">
                  <option value="todas">Todas las máquinas</option>
                  {maquinas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </select>
              </div>
              <div className="filtro-group">
                <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="filtro-select">
                  <option value="todos">Todos los estados</option>
                  <option value="nuevo">🆕 Nuevo</option>
                  <option value="en_proceso">⚙️ En proceso</option>
                  <option value="completado">✅ Completado</option>
                </select>
              </div>
              <div className="filtro-group">
                <select value={filtros.gravedad} onChange={(e) => setFiltros({...filtros, gravedad: e.target.value})} className="filtro-select">
                  <option value="todos">Todas las gravedades</option>
                  <option value="baja">🟢 Baja</option>
                  <option value="media">🟡 Media</option>
                  <option value="alta">🟠 Alta</option>
                  <option value="critica">🔴 Crítica</option>
                </select>
              </div>
              <div className="filtro-group">
                <select value={ordenarPor} onChange={(e) => setOrdenarPor(e.target.value)} className="filtro-select">
                  <option value="fecha">📅 Por fecha</option>
                  <option value="tasaFFTT">📊 Por tasa FFTT</option>
                  <option value="gravedad">⚠️ Por gravedad</option>
                </select>
              </div>
              <button className="filtro-direction" onClick={() => setOrdenDireccion(prev => prev === 'desc' ? 'asc' : 'desc')}>
                {ordenDireccion === 'desc' ? '↓' : '↑'}
              </button>
              <button className="filtro-select-all" onClick={seleccionarTodos}>
                {loteSeleccionados.length === lotesFiltrados.length ? 'Deseleccionar' : 'Seleccionar Todos'}
              </button>
            </div>

            <div className="lotes-table-container">
              <table className="lotes-premium-table">
                <thead>
                  <tr>
                    <th style={{width: '30px'}}><input type="checkbox" checked={loteSeleccionados.length === lotesFiltrados.length && lotesFiltrados.length > 0} onChange={seleccionarTodos} /></th>
                    <th>Lote</th><th>PO</th><th>Producto</th><th>Máquina</th><th>Fecha</th><th>Turno</th><th>Operador</th>
                    <th>Muestras</th><th>Aceptadas</th><th>Rechazadas</th><th>FFTT</th><th>Gravedad</th><th>Estado</th><th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {lotesFiltrados.length > 0 ? lotesFiltrados.map(lote => (
                    <tr key={lote.id} className={`lote-row ${lote.gravedad}`}>
                      <td><input type="checkbox" checked={loteSeleccionados.includes(lote.id)} onChange={() => toggleSeleccionLote(lote.id)} /></td>
                      <td>{lote.lote}</td><td>{lote.po}</td><td>{lote.sport}</td>
                      <td><span className="machine-badge">{lote.maquina}</span></td>
                      <td>{lote.fecha}</td>
                      <td><span className={`turno-badge turno-${lote.turno}`}>{lote.turno}</span></td>
                      <td>{lote.operador}</td>
                      <td>{lote.totalMuestras}</td><td className="success">{lote.aceptadas}</td><td className="danger">{lote.rechazadas}</td>
                      <td>
                        <div className="tasa-cell">
                          <div className="tasa-bar"><div className="tasa-fill" style={{ width: `${lote.tasaFFTT}%`, background: lote.tasaFFTT >= 95 ? '#22c55e' : lote.tasaFFTT >= 85 ? '#f59e0b' : '#ef4444' }}></div></div>
                          <span>{lote.tasaFFTT}%</span>
                        </div>
                      </td>
                      <td><span className={`gravedad-badge ${lote.gravedad}`}>{lote.gravedad === 'critica' ? '🔴' : lote.gravedad === 'alta' ? '🟠' : lote.gravedad === 'media' ? '🟡' : '🟢'} {lote.gravedad}</span></td>
                      <td><span className={`estado-badge ${lote.estado}`}>{lote.estado === 'en_proceso' ? '⚙️' : lote.estado === 'completado' ? '✅' : '🆕'} {lote.estado}</span></td>
                      <td>
                        <div className="action-buttons">
                          <button className="icon-btn" onClick={() => { setSelectedLote(lote); setModalType('ver'); setShowModal(true); }} title="Ver">👁️</button>
                          <button className="icon-btn" onClick={() => { setSelectedLote(lote); setModalType('editar'); setShowModal(true); }} title="Editar">✏️</button>
                          <button className="icon-btn" onClick={() => duplicarLote(lote)} title="Duplicar">📋</button>
                          <button className="icon-btn danger" onClick={() => eliminarLote(lote.id)} title="Eliminar">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="16" className="empty-state"><div className="empty-icon">📭</div><h3>No hay lotes</h3><p>Comienza escaneando un lote o creando uno nuevo</p><button className="btn-primary" onClick={() => setVista('scanner')}>Ir al Escáner</button></td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="lotes-footer"><span>Mostrando {lotesFiltrados.length} de {lotes.length} lotes</span><span className="resumen-calidad">Calidad: {stats.tasaFFTTPromedio}% | Sigma: {stats.sigmaPromedio}σ | Cpk: {stats.cpkPromedio}</span></div>
          </div>
        )}

        {/* ================ VISTA DE ESCÁNER PREMIUM ================ */}
        {vista === 'scanner' && (
          <div className="scanner-premium-panel">
            <div className="scanner-header-premium">
              <h2><span className="header-icon">📷</span> Escáner de Calidad</h2>
              <div className="scanner-status">
                <div className={`status-indicator ${escanerActivo ? 'active' : 'inactive'}`}>
                  <span className="status-dot"></span>
                  <span>{escanerActivo ? 'Escáner Activo' : 'Escáner Inactivo'}</span>
                </div>
                <select value={scannerState.modo} onChange={(e) => setScannerState(prev => ({ ...prev, modo: e.target.value }))} className="mode-select">
                  <option value="manual">⌨️ Modo Manual</option>
                  <option value="auto">📷 Modo Auto</option>
                </select>
              </div>
            </div>

            <div className="formatos-banner">
              <span className="formatos-title">✅ Formatos aceptados:</span>
              <div className="formatos-list">
                <span className="formato-tag">V132274/IF2128</span>
                <span className="formato-tag">V134339/BV1012</span>
                <span className="formato-tag">NK-137</span>
                <span className="formato-tag">1001</span>
                <span className="formato-tag">LOTE-001</span>
                <span className="formato-tag">¡CUALQUIER CÓDIGO!</span>
              </div>
            </div>

            <div className="scanner-grid-premium">
              <div className="scanner-active-area">
                <div className="code-display">
                  <div className="code-label"><span>Código Escaneado</span><span className="code-format">{scannerState.tipoScanner}</span></div>
                  <div className="code-box">
                    {scannerData.codigoEscaneado ? <span className="code-value">{scannerData.codigoEscaneado}</span> : <span className="code-placeholder">{escanerActivo ? 'Esperando código...' : 'Activa el escáner'}</span>}
                  </div>
                  {escanerActivo && codigoTemporal && <div className="typing-indicator"><span>Escribiendo: {codigoTemporal}</span><span className="cursor"></span></div>}
                </div>
                <div className="scanner-controls">
                  {!escanerActivo ? <button className="btn-scan" onClick={() => handleIniciarEscaner(scannerState.modo)}>▶️ Iniciar Escáner</button> : <button className="btn-scan stop" onClick={handleDetenerEscaner}>⏹️ Detener Escáner</button>}
                </div>
                <div className="scanner-form">
                  <h3>📋 Información del Lote</h3>
                  <div className="form-grid">
                    <div className="form-group"><label>📦 Número de Lote</label><input type="text" value={scannerData.numeroLote} onChange={(e) => setScannerData({...scannerData, numeroLote: e.target.value})} placeholder="Se auto-completa al escanear" /></div>
                    <div className="form-group"><label>🏷️ Tipo de Producto</label><select value={scannerData.tipoProducto} onChange={(e) => setScannerData({...scannerData, tipoProducto: e.target.value})}><option value="">Seleccionar...</option><option value="Camiseta Premium">Camiseta Premium</option><option value="Gorra Deportiva">Gorra Deportiva</option><option value="Sudadera Oversize">Sudadera Oversize</option></select></div>
                    <div className="form-group"><label>⚙️ Máquina</label><select value={scannerData.maquina} onChange={(e) => setScannerData({...scannerData, maquina: e.target.value})}><option value="">Seleccionar...</option>{maquinas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}</select></div>
                    <div className="form-group"><label>👤 Operador</label><input type="text" value={scannerData.operador} onChange={(e) => setScannerData({...scannerData, operador: e.target.value})} placeholder="Nombre del operador" /></div>
                    <div className="form-group"><label>🔄 Turno</label><select value={scannerData.turno} onChange={(e) => setScannerData({...scannerData, turno: e.target.value})}><option value="">Seleccionar...</option><option value="A">Turno A (06:00-14:00)</option><option value="B">Turno B (14:00-22:00)</option><option value="C">Turno C (22:00-06:00)</option></select></div>
                    <div className="form-group"><label>📊 Cantidad</label><input type="number" value={scannerData.cantidad} onChange={(e) => setScannerData({...scannerData, cantidad: parseInt(e.target.value)})} min="1" /></div>
                    <div className="form-group full-width"><label>📝 Observaciones</label><textarea value={scannerData.observaciones} onChange={(e) => setScannerData({...scannerData, observaciones: e.target.value})} rows="3" placeholder="Notas adicionales sobre calidad..." /></div>
                    <div className="form-group checkbox"><label><input type="checkbox" checked={scannerData.reproceso} onChange={(e) => setScannerData({...scannerData, reproceso: e.target.checked})} /> Es reproceso</label></div>
                    <div className="form-group"><label>🎯 Prioridad</label><select value={scannerData.prioridad} onChange={(e) => setScannerData({...scannerData, prioridad: e.target.value})}><option value="baja">🟢 Baja</option><option value="normal">🔵 Normal</option><option value="alta">🟠 Alta</option></select></div>
                  </div>
                  <div className="form-actions">
                    <button className="btn-guardar" onClick={handleGuardarEscaneo}>💾 Guardar Escaneo</button>
                    <button className="btn-limpiar" onClick={handleLimpiarEscaneo}>🧹 Limpiar Formulario</button>
                    <button className="btn-exportar" onClick={() => handleExportarEscaneos('excel')}>📥 Exportar Historial</button>
                  </div>
                </div>
              </div>
              <div className="scanner-history">
                <div className="history-header"><h3>📜 Historial de Escaneos</h3><div className="history-stats"><div className="stat"><span className="value">{estadisticasEscaneo.totalEscaneos}</span><span className="label">Total</span></div><div className="stat"><span className="value">{estadisticasEscaneo.escaneosHoy}</span><span className="label">Hoy</span></div></div></div>
                <div className="history-list">
                  {historialEscaneos.length === 0 ? <div className="empty-history"><div className="empty-icon">📭</div><p>No hay escaneos</p><small>Los códigos aparecerán aquí</small></div> :
                    historialEscaneos.slice(0, 20).map(escaneo => (
                      <div key={escaneo.id} className="history-item">
                        <div className="item-header"><div className="item-time"><span className="time">{escaneo.horaEscaneo}</span></div><button className="item-delete" onClick={() => handleEliminarEscaneo(escaneo.id)}>✕</button></div>
                        <div className="item-content"><div className="code-section"><span className="label">Código:</span><span className="code">{escaneo.codigoEscaneado}</span></div><div className="details-section">{escaneo.numeroLote && <div className="detail">📦 {escaneo.numeroLote}</div>}{escaneo.tipoProducto && <div className="detail">🏷️ {escaneo.tipoProducto}</div>}{escaneo.maquina && <div className="detail">⚙️ {escaneo.maquina}</div>}</div></div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
            <div className="scanner-instructions">
              <div className="step"><div className="step-number">1</div><div><h4>Activar</h4><p>Inicia el escáner de calidad</p></div></div>
              <div className="step"><div className="step-number">2</div><div><h4>Escanear</h4><p>Usa el teclado o escáner físico</p></div></div>
              <div className="step"><div className="step-number">3</div><div><h4>Completar</h4><p>Agrega información de calidad</p></div></div>
              <div className="step"><div className="step-number">4</div><div><h4>Guardar</h4><p>Confirma el registro en calidad</p></div></div>
            </div>
          </div>
        )}

        {/* ================ VISTA DE ANÁLISIS PREMIUM ================ */}
        {vista === 'analisis' && (
          <div className="analisis-premium-panel">
            <div className="panel-premium-header">
              <h2 className="panel-premium-title"><span className="title-icon">📊</span> Análisis de Calidad Avanzado</h2>
              <div className="panel-premium-actions">
                <button className={`action-premium-btn ${periodoAnalisis === 'semanal' ? 'active' : ''}`} onClick={() => setPeriodoAnalisis('semanal')}>Semanal</button>
                <button className={`action-premium-btn ${periodoAnalisis === 'mensual' ? 'active' : ''}`} onClick={() => setPeriodoAnalisis('mensual')}>Mensual</button>
                <button className={`action-premium-btn ${periodoAnalisis === 'trimestral' ? 'active' : ''}`} onClick={() => setPeriodoAnalisis('trimestral')}>Trimestral</button>
                <button className="action-premium-btn" onClick={() => setMostrarBenchmark(!mostrarBenchmark)}>📊 Benchmark</button>
                <button className="action-premium-btn" onClick={() => setShowPredicciones(true)}>🔮 Predicciones</button>
              </div>
            </div>
            <div className="analytics-grid">
              <div className="chart-card"><div className="chart-header"><h3>Tendencia FFTT con Media Móvil</h3></div><div className="chart-container" style={{height: '350px'}}><Line data={chartData.tendenciaFFTT} options={chartOptions} /></div></div>
              <div className="chart-card"><div className="chart-header"><h3>Causas de Rechazo por Tipo</h3></div><div className="chart-container" style={{height: '350px'}}><Bar data={chartData.rechazosPorTipo} options={chartOptions} /></div></div>
              <div className="chart-card"><div className="chart-header"><h3>Rendimiento por Máquina (Eficiencia vs OEE)</h3></div><div className="chart-container" style={{height: '350px'}}><Bar data={chartData.rendimientoMaquinas} options={chartOptions} /></div></div>
              <div className="chart-card"><div className="chart-header"><h3>Radar de Calidad vs Objetivo</h3></div><div className="chart-container" style={{height: '350px'}}><Radar data={chartData.calidadRadar} options={chartOptions} /></div></div>
              <div className="chart-card"><div className="chart-header"><h3>Distribución por Gravedad</h3></div><div className="chart-container doughnut" style={{height: '350px'}}><Doughnut data={chartData.distribucionGravedad} options={chartOptions} /></div></div>
              {analisisAvanzado.predicciones.length > 0 && <div className="chart-card"><div className="chart-header"><h3>Predicciones IA - Próximos 7 días <span className="confidence-badge">Confianza: 85%</span></h3></div><div className="chart-container" style={{height: '350px'}}><Line data={chartData.predicciones} options={chartOptions} /></div></div>}
            </div>
            {analisisAvanzado.recomendaciones.length > 0 && <div className="recomendaciones-ia"><h3>🤖 Recomendaciones Inteligentes</h3><div className="recomendaciones-grid">{analisisAvanzado.recomendaciones.map((rec, idx) => (<div key={idx} className={`recomendacion-card ${rec.prioridad}`}><div className="recomendacion-header"><span className={`prioridad-badge ${rec.prioridad}`}>{rec.prioridad === 'alta' ? '🔴 Alta' : rec.prioridad === 'media' ? '🟡 Media' : '🟢 Baja'}</span><h4>{rec.titulo}</h4></div><p>{rec.descripcion}</p><div className="recomendacion-acciones">{rec.acciones.map((accion, i) => <span key={i} className="accion-tag">✓ {accion}</span>)}</div></div>))}</div></div>}
            {analisisAvanzado.anomalias.length > 0 && <div className="alertas-predictivas"><h3>⚠️ Alertas Predictivas</h3><div className="alertas-list">{analisisAvanzado.anomalias.map((anomalia, idx) => (<div key={idx} className="alerta-item"><span className="alerta-icon">🚨</span><div className="alerta-content"><span className="alerta-fecha">{anomalia.fecha}</span><span className="alerta-desc">Tasa FFTT {anomalia.tasa}% - Desviación {anomalia.desviacion.toFixed(1)}%</span><span className={`alerta-gravedad ${anomalia.gravedad > 2 ? 'critica' : 'alta'}`}>{anomalia.gravedad > 2 ? 'Anomalía crítica' : 'Anomalía detectada'}</span></div></div>))}</div></div>}
          </div>
        )}

        {/* ================ VISTA DE IA PREMIUM ================ */}
        {vista === 'ia' && (
          <div className="ia-premium-panel">
            <h2 className="panel-premium-title"><span className="title-icon">🤖</span> Asistente de Calidad con IA <span className="title-badge-premium">Machine Learning</span></h2>
            <div className="ia-grid">
              <div className="ia-card"><h3>📈 Predicciones de Calidad</h3><div className="predicciones-list"><div className="prediccion-item"><span className="prediccion-label">Próxima semana</span><div className="prediccion-bar"><div className="bar-fill" style={{width: '75%', background: '#f59e0b'}}><span className="prediccion-valor">-2.3%</span></div></div><span className="prediccion-detalle">Tasa FFTT esperada: 92.5%</span></div><div className="prediccion-item"><span className="prediccion-label">Próximo mes</span><div className="prediccion-bar"><div className="bar-fill" style={{width: '45%', background: '#ef4444'}}><span className="prediccion-valor">-5.1%</span></div></div><span className="prediccion-detalle">Posible degradación por temporada</span></div></div><div className="confianza"><span>Confianza del modelo: 85%</span><div className="confianza-bar"><div className="confianza-fill" style={{width: '85%'}}></div></div></div></div>
              <div className="ia-card"><h3>💡 Recomendaciones IA</h3><div className="recomendaciones-list"><div className="recomendacion alta"><span className="recomendacion-prioridad">🔴 Alta</span><p>Revisar parámetros en M02 - Tono fuera de especificación</p><span className="recomendacion-impacto">Impacto estimado: +3.2% calidad</span></div><div className="recomendacion media"><span className="recomendacion-prioridad">🟡 Media</span><p>Capacitación a operadores del turno B en control de calidad</p><span className="recomendacion-impacto">Impacto estimado: +1.8% eficiencia</span></div><div className="recomendacion baja"><span className="recomendacion-prioridad">🟢 Baja</span><p>Calibrar sensores de temperatura en M05 y M09</p><span className="recomendacion-impacto">Impacto estimado: +0.9% conformidad</span></div></div></div>
              <div className="ia-card"><h3>⚠️ Alertas Inteligentes</h3><div className="alertas-list"><div className="alerta"><span className="alerta-tiempo">Hace 2h</span><p>Pico de rechazos detectado en M07 - Posible problema de presión</p><span className="alerta-recomendacion">Recomendación: Verificar presión de trabajo</span></div><div className="alerta"><span className="alerta-tiempo">Hace 5h</span><p>Patrón anormal en textura - Turno B</p><span className="alerta-recomendacion">Recomendación: Revisar materia prima del lote</span></div></div></div>
              <div className="ia-card"><h3>📊 Métricas de Rendimiento IA</h3><div className="metricas-ia"><div className="metrica-ia"><span className="metrica-valor">94.2%</span><span className="metrica-label">Precisión</span></div><div className="metrica-ia"><span className="metrica-valor">87%</span><span className="metrica-label">Detección</span></div><div className="metrica-ia"><span className="metrica-valor">12</span><span className="metrica-label">Alertas</span></div><div className="metrica-ia"><span className="metrica-valor">+8.5%</span><span className="metrica-label">Mejora</span></div></div></div>
            </div>
          </div>
        )}
      </div>

      {/* NOTIFICACIONES */}
      <div className="notifications-premium">
        {notificaciones.map(notif => (
          <div key={notif.id} className={`notification-premium ${notif.tipo}`}>
            <div className="notification-content">
              <span className="notification-icon">{notif.tipo === 'exito' ? '✅' : notif.tipo === 'error' ? '❌' : notif.tipo === 'info' ? 'ℹ️' : '⚠️'}</span>
              <span className="notification-message">{notif.mensaje}</span>
            </div>
            <div className="notification-progress"></div>
          </div>
        ))}
      </div>

      {/* ATAJOS DE TECLADO */}
      <div className="shortcuts-hint">
        <span>Ctrl+D: Dashboard</span><span>Ctrl+M: Máquinas</span><span>Ctrl+L: Lotes</span><span>Ctrl+S: Escáner</span><span>Ctrl+A: Análisis</span><span>Esc: Cerrar</span>
      </div>

      {/* MODAL DE DETALLES */}
      {showModal && selectedLote && (
        <div className="modal-premium-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-premium-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            {modalType === 'ver' && (
              <div className="modal-detalle">
                <h2>Detalles del Lote {selectedLote.lote}</h2>
                <div className="detalle-grid">
                  <div className="detalle-seccion"><h4>Información General</h4><p><strong>Lote:</strong> {selectedLote.lote}</p><p><strong>PO:</strong> {selectedLote.po}</p><p><strong>Producto:</strong> {selectedLote.sport}</p><p><strong>Fecha:</strong> {selectedLote.fecha}</p><p><strong>Máquina:</strong> {selectedLote.maquina}</p><p><strong>Turno:</strong> {selectedLote.turno}</p><p><strong>Operador:</strong> {selectedLote.operador}</p></div>
                  <div className="detalle-seccion"><h4>Métricas de Calidad</h4><p><strong>Total Muestras:</strong> {selectedLote.totalMuestras}</p><p><strong>Aceptadas:</strong> {selectedLote.aceptadas}</p><p><strong>Rechazadas:</strong> {selectedLote.rechazadas}</p><p><strong>Tasa FFTT:</strong> {selectedLote.tasaFFTT}%</p><p><strong>Gravedad:</strong> {selectedLote.gravedad}</p><p><strong>Sigma:</strong> {selectedLote.calidad?.sigma}σ</p><p><strong>Cpk:</strong> {selectedLote.calidad?.cpk}</p></div>
                  <div className="detalle-seccion"><h4>Parámetros de Producción</h4><p><strong>Temperatura:</strong> {selectedLote.temperatura}°C</p><p><strong>Presión:</strong> {selectedLote.presion} bar</p><p><strong>Velocidad:</strong> {selectedLote.velocidad} rpm</p></div>
                  <div className="detalle-seccion"><h4>Rechazos por Tipo</h4><p><strong>Tono:</strong> {selectedLote.tipoRechazo?.tono}</p><p><strong>Textura:</strong> {selectedLote.tipoRechazo?.textura}</p><p><strong>Color:</strong> {selectedLote.tipoRechazo?.color}</p><p><strong>Dimensión:</strong> {selectedLote.tipoRechazo?.dimension}</p><p><strong>Acabado:</strong> {selectedLote.tipoRechazo?.acabado}</p></div>
                  <div className="detalle-seccion full-width"><h4>Observaciones</h4><p>{selectedLote.observaciones}</p></div>
                </div>
              </div>
            )}
            {modalType === 'editar' && (
              <div className="modal-editar"><h2>Editar Lote {selectedLote.lote}</h2><form onSubmit={(e) => { e.preventDefault(); editarLote(selectedLote.id, selectedLote); setShowModal(false); }}><div className="form-grid"><div className="form-group"><label>Lote</label><input type="text" value={selectedLote.lote} onChange={(e) => setSelectedLote({...selectedLote, lote: e.target.value})} /></div><div className="form-group"><label>PO</label><input type="text" value={selectedLote.po} onChange={(e) => setSelectedLote({...selectedLote, po: e.target.value})} /></div><div className="form-group"><label>Producto</label><select value={selectedLote.sport} onChange={(e) => setSelectedLote({...selectedLote, sport: e.target.value})}><option>Camiseta Premium</option><option>Gorra Deportiva</option><option>Sudadera Oversize</option></select></div><div className="form-group"><label>Máquina</label><select value={selectedLote.maquina} onChange={(e) => setSelectedLote({...selectedLote, maquina: e.target.value})}>{maquinas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}</select></div><div className="form-group"><label>Total Muestras</label><input type="number" value={selectedLote.totalMuestras} onChange={(e) => setSelectedLote({...selectedLote, totalMuestras: parseInt(e.target.value)})} /></div><div className="form-group"><label>Aceptadas</label><input type="number" value={selectedLote.aceptadas} onChange={(e) => setSelectedLote({...selectedLote, aceptadas: parseInt(e.target.value)})} /></div><div className="form-group"><label>Rechazadas</label><input type="number" value={selectedLote.rechazadas} onChange={(e) => setSelectedLote({...selectedLote, rechazadas: parseInt(e.target.value)})} /></div><div className="form-group"><label>Gravedad</label><select value={selectedLote.gravedad} onChange={(e) => setSelectedLote({...selectedLote, gravedad: e.target.value})}><option value="baja">Baja</option><option value="media">Media</option><option value="alta">Alta</option><option value="critica">Crítica</option></select></div><div className="form-group"><label>Estado</label><select value={selectedLote.estado} onChange={(e) => setSelectedLote({...selectedLote, estado: e.target.value})}><option value="nuevo">Nuevo</option><option value="en_proceso">En proceso</option><option value="completado">Completado</option></select></div><div className="form-group full-width"><label>Observaciones</label><textarea value={selectedLote.observaciones} onChange={(e) => setSelectedLote({...selectedLote, observaciones: e.target.value})} rows="4" /></div></div><div className="modal-actions"><button type="submit" className="btn-guardar">Guardar Cambios</button><button type="button" className="btn-cancelar" onClick={() => setShowModal(false)}>Cancelar</button></div></form></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FFTTquality;