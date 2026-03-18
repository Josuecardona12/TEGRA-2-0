import React, { useState, useEffect, useRef } from "react";
import "./Reportes.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { 
  Line, Bar, Doughnut, Pie, PolarArea, Radar 
} from 'react-chartjs-2';
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
  Filler,
  Colors
} from 'chart.js';
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
  Colors,
  annotationPlugin
);

const API_URL = import.meta.env.VITE_API_URL;
const WS_URL = 'wss://glowing-lamp-r47wvpq4574fxv7j-8080.app.github.dev';

// ============================================
// CONFIGURACIÓN DE ÁREAS CON FORMATO V132274/IF2128
// ============================================
const AREAS = [
  { 
    value: "logistica", 
    label: "Logística", 
    icon: "🚚", 
    color: "#10b981",
    codigo: "LOG-001",
    descripcion: "Gestión de envíos y recepciones",
    estadisticas: { total: 12458, eficiencia: 94, alertas: 2 }
  },
  { 
    value: "plotter", 
    label: "Plotter", 
    icon: "🖨️", 
    color: "#3b82f6",
    codigo: "PLT-017",
    descripcion: "17 máquinas de impresión",
    estadisticas: { total: 8923, eficiencia: 92, alertas: 1 }
  },
  { 
    value: "diseno", 
    label: "Diseño", 
    icon: "🎨", 
    color: "#8b5cf6",
    codigo: "DIS-006",
    descripcion: "6 diseñadores gráficos",
    estadisticas: { total: 3456, eficiencia: 97, alertas: 0 }
  },
  { 
    value: "rh", 
    label: "RH", 
    icon: "👥", 
    color: "#ec4899",
    codigo: "RH-145",
    descripcion: "145 empleados activos",
    estadisticas: { total: 145, eficiencia: 96, alertas: 3 }
  },
  { 
    value: "fftt", 
    label: "FFTT", 
    icon: "🔬", 
    color: "#f59e0b",
    codigo: "FFT-012",
    descripcion: "Control de calidad FFTT",
    estadisticas: { total: 5678, eficiencia: 98, alertas: 0 }
  },
  { 
    value: "sublimado", 
    label: "Sublimado", 
    icon: "🔥", 
    color: "#06b6d4",
    codigo: "SUB-008",
    descripcion: "8 máquinas de sublimado",
    estadisticas: { total: 7234, eficiencia: 93, alertas: 2 }
  },
  { 
    value: "calidad", 
    label: "Calidad", 
    icon: "✅", 
    color: "#14b8a6",
    codigo: "CAL-004",
    descripcion: "Control de calidad final",
    estadisticas: { total: 2345, eficiencia: 99, alertas: 1 }
  },
  { 
    value: "produccion", 
    label: "Producción", 
    icon: "⚙️", 
    color: "#f43f5e",
    codigo: "PRO-023",
    descripcion: "Línea de producción general",
    estadisticas: { total: 15678, eficiencia: 91, alertas: 4 }
  },
  { 
    value: "mantenimiento", 
    label: "Mantenimiento", 
    icon: "🔧", 
    color: "#64748b",
    codigo: "MTN-012",
    descripcion: "Mantenimiento de máquinas",
    estadisticas: { total: 456, eficiencia: 88, alertas: 5 }
  },
  { 
    value: "inventario", 
    label: "Inventario", 
    icon: "📦", 
    color: "#a855f7",
    codigo: "INV-034",
    descripcion: "Control de inventario",
    estadisticas: { total: 12345, eficiencia: 95, alertas: 2 }
  }
];

// MAPEO DE ÁREA → ID (para API)
const AREA_MAP = {
  logistica: 1,
  plotter: 2,
  diseno: 3,
  rh: 4,
  fftt: 5,
  sublimado: 6,
  calidad: 7,
  produccion: 8,
  mantenimiento: 9,
  inventario: 10
};

// ============================================
// TIPOS DE REPORTE CON FORMATO V132274/IF2128
// ============================================
const TIPOS_REPORTE = [
  { 
    value: "pdf", 
    label: "PDF", 
    icon: "📄", 
    color: "#ef4444",
    formato: "V132274/IF2128",
    extension: ".pdf"
  },
  { 
    value: "excel", 
    label: "Excel", 
    icon: "📊", 
    color: "#10b981",
    formato: "V134339/BV1012",
    extension: ".xlsx"
  },
  { 
    value: "csv", 
    label: "CSV", 
    icon: "📃", 
    color: "#f59e0b",
    formato: "V152489/IF3245",
    extension: ".csv"
  },
  { 
    value: "json", 
    label: "JSON", 
    icon: "📋", 
    color: "#3b82f6",
    formato: "V163478/IF4567",
    extension: ".json"
  },
  { 
    value: "grafico", 
    label: "Gráfico", 
    icon: "📈", 
    color: "#8b5cf6",
    formato: "V174569/IF5890",
    extension: ".png"
  },
  { 
    value: "powerbi", 
    label: "Power BI", 
    icon: "📊", 
    color: "#f2c811",
    formato: "V185670/IF6789",
    extension: ".pbix"
  },
  { 
    value: "tableau", 
    label: "Tableau", 
    icon: "📉", 
    color: "#e97627",
    formato: "V196781/IF7890",
    extension: ".twbx"
  }
];

// ============================================
// PRIORIDADES CON FORMATO
// ============================================
const PRIORIDADES = [
  { value: "critica", label: "Crítica", icon: "🚨", color: "#ef4444", nivel: 4 },
  { value: "alta", label: "Alta", icon: "🔴", color: "#f97316", nivel: 3 },
  { value: "media", label: "Media", icon: "🟡", color: "#f59e0b", nivel: 2 },
  { value: "baja", label: "Baja", icon: "🟢", color: "#10b981", nivel: 1 }
];

// ============================================
// ESTADOS CON FORMATO
// ============================================
const ESTADOS = [
  { value: "completado", label: "Completado", icon: "✅", color: "#10b981" },
  { value: "en_proceso", label: "En Proceso", icon: "⚡", color: "#3b82f6" },
  { value: "pendiente", label: "Pendiente", icon: "⏳", color: "#f59e0b" },
  { value: "revision", label: "Revisión", icon: "🔍", color: "#8b5cf6" },
  { value: "cancelado", label: "Cancelado", icon: "❌", color: "#ef4444" }
];

export default function Reportes() {
  // ================ ESTADOS PRINCIPALES ================
  const [area, setArea] = useState("logistica");
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");
  const [soloCriticos, setSoloCriticos] = useState(false);
  const [tipoReporte, setTipoReporte] = useState("pdf");
  const [prioridad, setPrioridad] = useState("todas");
  const [estado, setEstado] = useState("todos");
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [modoOscuro, setModoOscuro] = useState(false);
  const [conectado, setConectado] = useState(false);
  const [ultimoMovimiento, setUltimoMovimiento] = useState(null);
  const [historialReportes, setHistorialReportes] = useState([]);
  const [datosGrafico, setDatosGrafico] = useState(null);
  const [vista, setVista] = useState("generador");
  const [lotesSeleccionados, setLotesSeleccionados] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [ordenarPor, setOrdenarPor] = useState("fecha");
  const [ordenDireccion, setOrdenDireccion] = useState("desc");
  const [notificaciones, setNotificaciones] = useState([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [filtrosAvanzados, setFiltrosAvanzados] = useState({
    responsable: "",
    cliente: "",
    producto: "",
    lote: "",
    codigo: ""
  });
  const [vistaGrafico, setVistaGrafico] = useState("linea");
  const [periodoGrafico, setPeriodoGrafico] = useState("mensual");
  const [metricasTiempoReal, setMetricasTiempoReal] = useState({
    produccionHoy: 0,
    eficiencia: 0,
    alertasActivas: 0,
    lotesEnProceso: 0,
    temperaturaPromedio: 0,
    tiempoPromedio: 0,
    cumplimiento: 0
  });

  const wsRef = useRef(null);
  const mainContentRef = useRef(null);
  const inputRef = useRef(null);

  // ================ CONEXIÓN WEBSOCKET ================
  useEffect(() => {
    console.log('🔌 Reportes Ultra conectando...');
    
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    
    ws.onopen = () => {
      console.log('✅ Reportes Ultra conectado');
      setConectado(true);
      agregarNotificacion('✅ Conectado al servidor en tiempo real', 'exito');
      
      // Solicitar datos iniciales
      ws.send(JSON.stringify({ type: 'REQUEST_DATA', payload: { area, inicio, fin } }));
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📦 Reportes Ultra recibió:', data.type);
        
        if (data.type === 'METRICAS') {
          setMetricasTiempoReal(data.payload);
        }
        
        if (data.type === 'ULTIMO_MOVIMIENTO') {
          setUltimoMovimiento(data.payload);
          agregarNotificacion(`🔄 ${data.payload.loteId} → ${data.payload.area}`, 'info');
        }
        
        if (data.type === 'ALERTA') {
          agregarNotificacion(`⚠️ ${data.payload.mensaje}`, 'alerta');
        }
        
        if (data.type === 'DATOS_GRAFICO') {
          setDatosGrafico(data.payload);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('❌ Error WebSocket:', error);
      setConectado(false);
      agregarNotificacion('❌ Error de conexión', 'error');
    };
    
    ws.onclose = () => {
      console.log('❌ Reportes Ultra desconectado');
      setConectado(false);
    };
    
    return () => ws.close();
  }, []);

  // ================ EFECTOS ================
  useEffect(() => {
    const timer = setInterval(() => {
      // Actualizar métricas en tiempo real
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ 
          type: 'REQUEST_METRICAS', 
          payload: { area, inicio, fin } 
        }));
      }
    }, 5000);
    
    return () => clearInterval(timer);
  }, [area, inicio, fin]);

  useEffect(() => {
    const modoGuardado = localStorage.getItem('modoOscuroReportesUltra') === 'true';
    setModoOscuro(modoGuardado);
  }, []);

  useEffect(() => {
    localStorage.setItem('modoOscuroReportesUltra', modoOscuro);
  }, [modoOscuro]);

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

  // ================ NOTIFICACIONES ================
  const agregarNotificacion = (mensaje, tipo = 'info') => {
    const id = Date.now();
    setNotificaciones(prev => [...prev, { id, mensaje, tipo }]);
    setTimeout(() => {
      setNotificaciones(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  // ================ GENERAR NOMBRE DE ARCHIVO CON FORMATO ================
  const generarNombreArchivo = () => {
    const fecha = new Date();
    const año = fecha.getFullYear().toString().slice(-2);
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    const hora = fecha.getHours().toString().padStart(2, '0');
    const minuto = fecha.getMinutes().toString().padStart(2, '0');
    
    const areaSel = AREAS.find(a => a.value === area);
    const tipoSel = TIPOS_REPORTE.find(t => t.value === tipoReporte);
    
    return `V${año}${mes}${dia}/${tipoSel?.formato?.split('/')[1] || 'IF0000'}_${areaSel?.codigo || 'AREA'}_${hora}${minuto}`;
  };

  // ================ FUNCIÓN PARA GENERAR REPORTE ================
  const generarReporte = async () => {
    setMensaje("");

    if (!inicio || !fin) {
      setMensaje("❌ Selecciona ambas fechas.");
      return;
    }

    if (inicio > fin) {
      setMensaje("❌ La fecha inicio no puede ser mayor que la fecha fin.");
      return;
    }

    const areaId = AREA_MAP[area];

    if (!areaId) {
      setMensaje("❌ Área inválida.");
      return;
    }

    setLoading(true);

    try {
      // Construir URL con todos los filtros
      let url = `${API_URL}/reportes/${tipoReporte}?area_id=${areaId}&fecha_inicio=${inicio}&fecha_fin=${fin}`;
      
      if (soloCriticos) url += `&criticos=true`;
      if (prioridad !== "todas") url += `&prioridad=${prioridad}`;
      if (estado !== "todos") url += `&estado=${estado}`;
      
      if (filtrosAvanzados.responsable) url += `&responsable=${encodeURIComponent(filtrosAvanzados.responsable)}`;
      if (filtrosAvanzados.cliente) url += `&cliente=${encodeURIComponent(filtrosAvanzados.cliente)}`;
      if (filtrosAvanzados.producto) url += `&producto=${encodeURIComponent(filtrosAvanzados.producto)}`;
      if (filtrosAvanzados.lote) url += `&lote=${encodeURIComponent(filtrosAvanzados.lote)}`;

      const response = await fetch(url, { method: "GET" });

      if (!response.ok) {
        throw new Error(`Error generando reporte: ${response.status}`);
      }

      const nombreArchivo = generarNombreArchivo();
      const areaSel = AREAS.find(a => a.value === area);
      const tipoSel = TIPOS_REPORTE.find(t => t.value === tipoReporte);

      // Procesar según el tipo de reporte
      if (tipoReporte === "pdf") {
        const blob = await response.blob();
        saveAs(blob, `${nombreArchivo}${tipoSel?.extension || '.pdf'}`);
        agregarNotificacion(`✅ Reporte PDF generado: ${nombreArchivo}`, 'exito');
      } 
      else if (tipoReporte === "excel") {
        const blob = await response.blob();
        saveAs(blob, `${nombreArchivo}${tipoSel?.extension || '.xlsx'}`);
        agregarNotificacion(`✅ Reporte Excel generado: ${nombreArchivo}`, 'exito');
      }
      else if (tipoReporte === "csv") {
        const text = await response.text();
        const blob = new Blob([text], { type: 'text/csv' });
        saveAs(blob, `${nombreArchivo}${tipoSel?.extension || '.csv'}`);
        agregarNotificacion(`✅ Reporte CSV generado: ${nombreArchivo}`, 'exito');
      }
      else if (tipoReporte === "json") {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        saveAs(blob, `${nombreArchivo}${tipoSel?.extension || '.json'}`);
        agregarNotificacion(`✅ Reporte JSON generado: ${nombreArchivo}`, 'exito');
        
        if (data.data) setDatosGrafico(data.data);
      }
      else if (tipoReporte === "grafico") {
        const data = await response.json();
        setDatosGrafico(data);
        setVista("visualizador");
        agregarNotificacion(`✅ Datos cargados para visualización: ${nombreArchivo}`, 'exito');
      }
      else {
        const blob = await response.blob();
        saveAs(blob, `${nombreArchivo}${tipoSel?.extension || '.bin'}`);
        agregarNotificacion(`✅ Reporte ${tipoSel?.label} generado: ${nombreArchivo}`, 'exito');
      }

      // Agregar al historial
      const nuevoReporte = {
        id: Date.now(),
        area: areaSel?.label,
        areaCodigo: areaSel?.codigo,
        tipo: tipoReporte,
        tipoLabel: tipoSel?.label,
        fecha: new Date().toISOString(),
        inicio,
        fin,
        criticos: soloCriticos,
        prioridad,
        estado,
        nombreArchivo,
        formato: tipoSel?.formato
      };
      setHistorialReportes(prev => [nuevoReporte, ...prev].slice(0, 20));
      setMensaje("");

    } catch (error) {
      console.error(error);
      setMensaje(`❌ Error: ${error.message}`);
      agregarNotificacion(`❌ Error generando reporte`, 'error');
    }

    setLoading(false);
  };

  // ================ EXPORTAR DATOS ACTUALES ================
  const exportarDatosActuales = (formato) => {
    const areaSel = AREAS.find(a => a.value === area);
    const fecha = new Date();
    const nombreArchivo = `V${fecha.getFullYear().toString().slice(-2)}${(fecha.getMonth()+1).toString().padStart(2,'0')}${fecha.getDate().toString().padStart(2,'0')}/IF${fecha.getHours().toString().padStart(2,'0')}${fecha.getMinutes().toString().padStart(2,'0')}_${areaSel?.codigo || 'EXPORT'}`;

    // Datos de ejemplo con formato
    const datos = [
      { 
        lote: "V132274/IF2128", 
        producto: "Camiseta MLB Yankees", 
        cliente: "Nike",
        cantidad: 150, 
        estado: "Completado", 
        prioridad: "Alta",
        fecha: "2026-03-17",
        responsable: "Carlos Ruiz",
        eficiencia: 98,
        progreso: 100
      },
      { 
        lote: "V134339/BV1012", 
        producto: "Gorra NBA Lakers", 
        cliente: "Adidas",
        cantidad: 75, 
        estado: "En Proceso", 
        prioridad: "Media",
        fecha: "2026-03-17",
        responsable: "María González",
        eficiencia: 95,
        progreso: 75
      },
      { 
        lote: "V152489/IF3245", 
        producto: "Uniforme NFL Patriots", 
        cliente: "RUN",
        cantidad: 200, 
        estado: "Pendiente", 
        prioridad: "Baja",
        fecha: "2026-03-16",
        responsable: "Juan Pérez",
        eficiencia: 0,
        progreso: 0
      }
    ];

    if (formato === "excel") {
      const ws = XLSX.utils.json_to_sheet(datos);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Datos");
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      saveAs(new Blob([excelBuffer]), `${nombreArchivo}.xlsx`);
      agregarNotificacion(`✅ Datos exportados a Excel: ${nombreArchivo}.xlsx`, 'exito');
    } 
    else if (formato === "csv") {
      const headers = Object.keys(datos[0]).join(',');
      const rows = datos.map(obj => Object.values(obj).join(',')).join('\n');
      const csv = `${headers}\n${rows}`;
      saveAs(new Blob([csv], { type: 'text/csv' }), `${nombreArchivo}.csv`);
      agregarNotificacion(`✅ Datos exportados a CSV: ${nombreArchivo}.csv`, 'exito');
    }
    else if (formato === "json") {
      saveAs(new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' }), `${nombreArchivo}.json`);
      agregarNotificacion(`✅ Datos exportados a JSON: ${nombreArchivo}.json`, 'exito');
    }
  };

  // ================ DATOS PARA GRÁFICOS ================
  const getChartData = () => {
    const areaSel = AREAS.find(a => a.value === area);
    
    // Datos dinámicos según área seleccionada
    const datosPorArea = {
      logistica: [45, 78, 112, 89, 134, 98, 65, 123, 87, 92, 76, 88],
      plotter: [67, 89, 123, 145, 167, 189, 156, 134, 98, 112, 78, 92],
      diseno: [23, 45, 67, 89, 112, 134, 98, 76, 54, 43, 32, 21],
      rh: [12, 18, 24, 30, 36, 42, 38, 44, 50, 46, 52, 58],
      fftt: [89, 92, 94, 96, 98, 97, 95, 93, 91, 94, 96, 98],
      sublimado: [56, 78, 98, 112, 134, 156, 143, 121, 99, 87, 65, 43],
      calidad: [45, 67, 89, 112, 134, 156, 143, 121, 99, 87, 65, 43],
      produccion: [234, 256, 278, 289, 301, 323, 345, 367, 389, 401, 423, 445],
      mantenimiento: [12, 8, 15, 10, 18, 14, 22, 16, 20, 24, 28, 32],
      inventario: [456, 478, 499, 521, 543, 565, 587, 609, 631, 653, 675, 697]
    };

    const datos = datosPorArea[area] || datosPorArea.logistica;
    
    const labels = {
      dia: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
      semana: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
      mes: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
      anual: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    };

    const labelActual = periodoGrafico === 'dia' ? labels.dia : 
                       periodoGrafico === 'semana' ? labels.semana :
                       periodoGrafico === 'mes' ? labels.mes : labels.anual;

    return {
      labels: labelActual,
      datasets: [
        {
          label: `${areaSel?.label} - Producción`,
          data: datos.slice(0, labelActual.length),
          borderColor: areaSel?.color || '#3b82f6',
          backgroundColor: `${areaSel?.color}20` || '#3b82f620',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: areaSel?.color,
          pointBorderColor: '#ffffff',
          pointHoverRadius: 8,
          pointHoverBackgroundColor: areaSel?.color,
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 2
        },
        {
          label: 'Meta',
          data: datos.map(d => d * 1.1),
          borderColor: '#f59e0b',
          backgroundColor: '#f59e0b20',
          borderDash: [5, 5],
          fill: false,
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 2
        }
      ]
    };
  };

  const getDistribucionData = () => {
    return {
      labels: AREAS.map(a => a.label),
      datasets: [{
        data: AREAS.map(a => a.estadisticas?.total || Math.floor(Math.random() * 10000) + 1000),
        backgroundColor: AREAS.map(a => a.color),
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 15
      }]
    };
  };

  const getPrioridadData = () => {
    return {
      labels: PRIORIDADES.map(p => p.label),
      datasets: [{
        data: [12, 25, 45, 18],
        backgroundColor: PRIORIDADES.map(p => p.color),
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    };
  };

  const getRadarData = () => {
    return {
      labels: ['Eficiencia', 'Calidad', 'Velocidad', 'Precisión', 'Cumplimiento', 'Productividad'],
      datasets: [{
        label: AREAS.find(a => a.value === area)?.label || 'Área',
        data: [94, 98, 92, 96, 95, 93],
        backgroundColor: `${AREAS.find(a => a.value === area)?.color}40` || '#3b82f640',
        borderColor: AREAS.find(a => a.value === area)?.color || '#3b82f6',
        borderWidth: 2,
        pointBackgroundColor: AREAS.find(a => a.value === area)?.color || '#3b82f6',
        pointBorderColor: '#ffffff',
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: AREAS.find(a => a.value === area)?.color || '#3b82f6'
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    },
    plugins: {
      legend: {
        labels: {
          color: modoOscuro ? '#d1d5db' : '#374151',
          font: { size: 12, weight: '500' }
        },
        position: 'top',
        align: 'center'
      },
      tooltip: {
        backgroundColor: modoOscuro ? '#1f2937' : '#ffffff',
        titleColor: modoOscuro ? '#f3f4f6' : '#111827',
        bodyColor: modoOscuro ? '#d1d5db' : '#374151',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        usePointStyle: true
      },
      annotation: {
        annotations: {
          line1: {
            type: 'line',
            yMin: 100,
            yMax: 100,
            borderColor: '#f59e0b',
            borderWidth: 2,
            borderDash: [6, 6],
            label: {
              content: 'Meta',
              enabled: true,
              position: 'end'
            }
          }
        }
      }
    },
    scales: {
      y: {
        grid: {
          color: modoOscuro ? 'rgba(75, 85, 99, 0.2)' : 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          color: modoOscuro ? '#9ca3af' : '#6b7280',
          callback: function(value) {
            return value.toLocaleString();
          }
        },
        beginAtZero: true
      },
      x: {
        grid: { display: false },
        ticks: {
          color: modoOscuro ? '#9ca3af' : '#6b7280',
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };

  const doughnutOptions = {
    ...chartOptions,
    cutout: '60%',
    plugins: {
      ...chartOptions.plugins,
      legend: { position: 'right' }
    }
  };

  return (
    <div className={`reportes-ultra ${modoOscuro ? 'dark-mode' : ''}`} ref={mainContentRef}>
      
      {/* ===== HEADER PREMIUM ===== */}
      <header className="reportes-header">
        <div className="header-gradient"></div>
        <div className="header-content">
          <div className="header-left">
            <div className="logo-wrapper">
              <div className="logo-icon">
                <span className="logo-emoji">📊</span>
                <span className="logo-glow"></span>
              </div>
              <div className="logo-text">
                <h1 className="logo-title">
                  REPORTES ULTRA
                  <span className="logo-badge">4K</span>
                </h1>
                <span className="logo-subtitle">Sistema de Análisis Premium</span>
              </div>
            </div>

            <div className="header-metrics">
              <div className="header-metric">
                <span className="metric-label">Hoy</span>
                <span className="metric-value">{metricasTiempoReal.produccionHoy.toLocaleString()}</span>
              </div>
              <div className="header-metric">
                <span className="metric-label">Eficiencia</span>
                <span className="metric-value">{metricasTiempoReal.eficiencia}%</span>
              </div>
              <div className="header-metric alerta">
                <span className="metric-label">Alertas</span>
                <span className="metric-value">{metricasTiempoReal.alertasActivas}</span>
              </div>
            </div>
          </div>

          <div className="header-right">
            <div className={`connection-badge ${conectado ? 'online' : 'offline'}`}>
              <span className="connection-dot"></span>
              <span className="connection-text">
                {conectado ? '🟢 EN VIVO' : '🟡 LOCAL'}
              </span>
            </div>

            <button 
              className="theme-toggle" 
              onClick={() => setModoOscuro(!modoOscuro)}
              title={modoOscuro ? 'Modo claro' : 'Modo oscuro'}
            >
              <span className="toggle-icon">{modoOscuro ? '☀️' : '🌙'}</span>
            </button>
          </div>
        </div>

        {/* ===== TABS ===== */}
        <div className="reportes-tabs">
          <button 
            className={`tab-btn ${vista === 'generador' ? 'active' : ''}`}
            onClick={() => setVista('generador')}
          >
            <span className="tab-icon">⚙️</span>
            <span>Generador</span>
            <span className="tab-badge">V132274/IF2128</span>
          </button>
          <button 
            className={`tab-btn ${vista === 'visualizador' ? 'active' : ''}`}
            onClick={() => setVista('visualizador')}
          >
            <span className="tab-icon">📈</span>
            <span>Visualizador</span>
            <span className="tab-badge">V134339/BV1012</span>
          </button>
          <button 
            className={`tab-btn ${vista === 'historial' ? 'active' : ''}`}
            onClick={() => setVista('historial')}
          >
            <span className="tab-icon">📜</span>
            <span>Historial</span>
            <span className="tab-badge">V152489/IF3245</span>
          </button>
          <button 
            className={`tab-btn ${vista === 'exportacion' ? 'active' : ''}`}
            onClick={() => setVista('exportacion')}
          >
            <span className="tab-icon">📤</span>
            <span>Exportación</span>
            <span className="tab-badge">V163478/IF4567</span>
          </button>
          <button 
            className={`tab-btn ${vista === 'analisis' ? 'active' : ''}`}
            onClick={() => setVista('analisis')}
          >
            <span className="tab-icon">🔬</span>
            <span>Análisis</span>
            <span className="tab-badge">V174569/IF5890</span>
          </button>
        </div>
      </header>

      {/* ===== NOTIFICACIONES ===== */}
      <div className="notificaciones-flotantes">
        {notificaciones.map(notif => (
          <div key={notif.id} className={`notif-flotante ${notif.tipo}`}>
            <span className="notif-icon">
              {notif.tipo === 'exito' ? '✅' : 
               notif.tipo === 'error' ? '❌' : 
               notif.tipo === 'alerta' ? '⚠️' : 'ℹ️'}
            </span>
            <span className="notif-texto">{notif.mensaje}</span>
          </div>
        ))}
      </div>

      {/* ===== ÚLTIMO MOVIMIENTO ===== */}
      {ultimoMovimiento && (
        <div className="ultimo-movimiento">
          <span className="movimiento-icono">🔄</span>
          <span className="movimiento-texto">
            {ultimoMovimiento.loteId || 'V132274/IF2128'} → {ultimoMovimiento.area || 'Plotter'}
          </span>
          <span className="movimiento-tiempo">ahora</span>
        </div>
      )}

      {/* ===== CONTENIDO PRINCIPAL ===== */}
      <div className="reportes-content">
        
        {/* ===== VISTA GENERADOR ===== */}
        {vista === 'generador' && (
          <div className="generador-container">
            <div className="generador-card">
              <h2 className="card-title">
                <span className="title-icon">⚙️</span>
                Generador de Reportes
                <span className="title-codigo">V132274/IF2128</span>
              </h2>
              
              <div className="form-grid">
                {/* ÁREA */}
                <div className="form-group">
                  <label>
                    <span className="label-icon">📍</span>
                    Área de Trabajo
                  </label>
                  <div className="area-selector">
                    {AREAS.map(a => (
                      <button
                        key={a.value}
                        className={`area-btn ${area === a.value ? 'active' : ''}`}
                        onClick={() => setArea(a.value)}
                        style={{ borderColor: a.color }}
                      >
                        <span className="area-icon">{a.icon}</span>
                        <span className="area-label">{a.label}</span>
                        <span className="area-codigo">{a.codigo}</span>
                        {a.estadisticas?.alertas > 0 && (
                          <span className="area-alerta">{a.estadisticas.alertas}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* FECHAS */}
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <span className="label-icon">📅</span>
                      Fecha Inicio
                    </label>
                    <input
                      type="date"
                      value={inicio}
                      onChange={(e) => setInicio(e.target.value)}
                      className="premium-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <span className="label-icon">📅</span>
                      Fecha Fin
                    </label>
                    <input
                      type="date"
                      value={fin}
                      onChange={(e) => setFin(e.target.value)}
                      className="premium-input"
                    />
                  </div>
                </div>

                {/* TIPO DE REPORTE */}
                <div className="form-group">
                  <label>
                    <span className="label-icon">📊</span>
                    Tipo de Reporte
                  </label>
                  <div className="tipo-selector">
                    {TIPOS_REPORTE.map(t => (
                      <button
                        key={t.value}
                        className={`tipo-btn ${tipoReporte === t.value ? 'active' : ''}`}
                        onClick={() => setTipoReporte(t.value)}
                        style={{ backgroundColor: t.color + '20', color: t.color }}
                      >
                        <span className="tipo-icon">{t.icon}</span>
                        <span className="tipo-label">{t.label}</span>
                        <span className="tipo-formato">{t.formato}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* FILTROS RÁPIDOS */}
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <span className="label-icon">🎯</span>
                      Prioridad
                    </label>
                    <select 
                      value={prioridad} 
                      onChange={(e) => setPrioridad(e.target.value)}
                      className="premium-select"
                    >
                      <option value="todas">Todas las prioridades</option>
                      {PRIORIDADES.map(p => (
                        <option key={p.value} value={p.value}>
                          {p.icon} {p.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      <span className="label-icon">⚡</span>
                      Estado
                    </label>
                    <select 
                      value={estado} 
                      onChange={(e) => setEstado(e.target.value)}
                      className="premium-select"
                    >
                      <option value="todos">Todos los estados</option>
                      {ESTADOS.map(e => (
                        <option key={e.value} value={e.value}>
                          {e.icon} {e.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* FILTROS AVANZADOS */}
                <div className="filtros-avanzados">
                  <h3 className="filtros-title">
                    <span className="title-icon">🔍</span>
                    Filtros Avanzados
                  </h3>
                  
                  <div className="filtros-grid">
                    <div className="filtro-item">
                      <label>Responsable</label>
                      <input
                        type="text"
                        value={filtrosAvanzados.responsable}
                        onChange={(e) => setFiltrosAvanzados({...filtrosAvanzados, responsable: e.target.value})}
                        placeholder="Ej: Carlos Ruiz"
                        className="filtro-input"
                      />
                    </div>

                    <div className="filtro-item">
                      <label>Cliente</label>
                      <input
                        type="text"
                        value={filtrosAvanzados.cliente}
                        onChange={(e) => setFiltrosAvanzados({...filtrosAvanzados, cliente: e.target.value})}
                        placeholder="Ej: Nike"
                        className="filtro-input"
                      />
                    </div>

                    <div className="filtro-item">
                      <label>Producto</label>
                      <input
                        type="text"
                        value={filtrosAvanzados.producto}
                        onChange={(e) => setFiltrosAvanzados({...filtrosAvanzados, producto: e.target.value})}
                        placeholder="Ej: Camiseta MLB"
                        className="filtro-input"
                      />
                    </div>

                    <div className="filtro-item">
                      <label>Lote</label>
                      <input
                        type="text"
                        value={filtrosAvanzados.lote}
                        onChange={(e) => setFiltrosAvanzados({...filtrosAvanzados, lote: e.target.value})}
                        placeholder="Ej: V132274/IF2128"
                        className="filtro-input"
                      />
                    </div>
                  </div>

                  <div className="checkbox-group premium">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={soloCriticos}
                        onChange={(e) => setSoloCriticos(e.target.checked)}
                      />
                      <span className="checkbox-custom"></span>
                      <span className="checkbox-text">
                        Solo registros críticos <span className="checkbox-badge">🚨</span>
                      </span>
                    </label>
                  </div>
                </div>

                {/* BOTÓN GENERAR */}
                <button
                  className="btn-generar-premium"
                  onClick={generarReporte}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      <span>Generando reporte...</span>
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">📥</span>
                      <span>Generar Reporte</span>
                      <span className="btn-codigo">V{new Date().getFullYear().toString().slice(-2)}{(new Date().getMonth()+1).toString().padStart(2,'0')}{new Date().getDate().toString().padStart(2,'0')}/IF{new Date().getHours().toString().padStart(2,'0')}{new Date().getMinutes().toString().padStart(2,'0')}</span>
                    </>
                  )}
                </button>

                {mensaje && (
                  <div className={`mensaje-alerta ${mensaje.includes('✅') ? 'exito' : 'error'}`}>
                    {mensaje}
                  </div>
                )}
              </div>
            </div>

            {/* PREVIEW CARD */}
            <div className="preview-card">
              <h3 className="card-title">
                <span className="title-icon">👁️</span>
                Vista Previa
              </h3>
              <div className="preview-content">
                <div className="preview-item">
                  <span className="preview-label">Área:</span>
                  <span className="preview-value">
                    {AREAS.find(a => a.value === area)?.icon} {AREAS.find(a => a.value === area)?.label}
                    <span className="preview-codigo">{AREAS.find(a => a.value === area)?.codigo}</span>
                  </span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Período:</span>
                  <span className="preview-value">
                    {inicio || '????-??-??'} → {fin || '????-??-??'}
                  </span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Tipo:</span>
                  <span className="preview-value">
                    {TIPOS_REPORTE.find(t => t.value === tipoReporte)?.icon} {TIPOS_REPORTE.find(t => t.value === tipoReporte)?.label}
                    <span className="preview-formato">{TIPOS_REPORTE.find(t => t.value === tipoReporte)?.formato}</span>
                  </span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Filtros:</span>
                  <span className="preview-value">
                    {soloCriticos ? 'Críticos + ' : ''}
                    {prioridad !== 'todas' ? PRIORIDADES.find(p => p.value === prioridad)?.icon + ' ' : ''}
                    {estado !== 'todos' ? ESTADOS.find(e => e.value === estado)?.icon + ' ' : ''}
                    {Object.values(filtrosAvanzados).filter(v => v).length} filtros
                  </span>
                </div>
                <div className="preview-item total">
                  <span className="preview-label">Total registros:</span>
                  <span className="preview-value total">1,234</span>
                </div>
                <div className="preview-item codigo">
                  <span className="preview-label">Código:</span>
                  <span className="preview-value codigo">{generarNombreArchivo()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== VISTA VISUALIZADOR ===== */}
        {vista === 'visualizador' && (
          <div className="visualizador-container">
            <div className="visualizador-header">
              <h2 className="section-title">
                <span className="title-icon">📈</span>
                Visualizador de Datos
                <span className="title-codigo">V134339/BV1012</span>
              </h2>
              <div className="visualizador-controles">
                <select 
                  value={vistaGrafico} 
                  onChange={(e) => setVistaGrafico(e.target.value)}
                  className="control-select"
                >
                  <option value="linea">📈 Línea</option>
                  <option value="barra">📊 Barras</option>
                  <option value="doughnut">🍩 Doughnut</option>
                  <option value="pie">🥧 Pastel</option>
                  <option value="radar">📡 Radar</option>
                  <option value="polar">🌐 Polar</option>
                </select>
                
                <select 
                  value={periodoGrafico} 
                  onChange={(e) => setPeriodoGrafico(e.target.value)}
                  className="control-select"
                >
                  <option value="dia">📅 Por día</option>
                  <option value="semana">📆 Por semana</option>
                  <option value="mes">📊 Por mes</option>
                  <option value="anual">📈 Anual</option>
                </select>
              </div>
            </div>

            <div className="graficos-grid">
              {/* GRÁFICO PRINCIPAL */}
              <div className="grafico-card principal">
                <div className="grafico-header">
                  <h3>{AREAS.find(a => a.value === area)?.label} - Producción</h3>
                  <div className="grafico-leyenda">
                    <span className="leyenda-item">
                      <span className="leyenda-color" style={{ backgroundColor: AREAS.find(a => a.value === area)?.color }}></span>
                      Real
                    </span>
                    <span className="leyenda-item">
                      <span className="leyenda-color" style={{ backgroundColor: '#f59e0b' }}></span>
                      Meta
                    </span>
                  </div>
                </div>
                <div className="grafico-contenedor">
                  {vistaGrafico === 'linea' && <Line data={getChartData()} options={chartOptions} />}
                  {vistaGrafico === 'barra' && <Bar data={getChartData()} options={chartOptions} />}
                  {vistaGrafico === 'doughnut' && <Doughnut data={getDistribucionData()} options={doughnutOptions} />}
                  {vistaGrafico === 'pie' && <Pie data={getDistribucionData()} options={doughnutOptions} />}
                  {vistaGrafico === 'radar' && <Radar data={getRadarData()} options={chartOptions} />}
                  {vistaGrafico === 'polar' && <PolarArea data={getPrioridadData()} options={chartOptions} />}
                </div>
              </div>

              {/* GRÁFICO DE DISTRIBUCIÓN */}
              <div className="grafico-card secundario">
                <div className="grafico-header">
                  <h3>Distribución por Área</h3>
                </div>
                <div className="grafico-contenedor pequeno">
                  <Doughnut data={getDistribucionData()} options={{
                    ...doughnutOptions,
                    plugins: { legend: { position: 'bottom' } }
                  }} />
                </div>
              </div>

              {/* GRÁFICO DE PRIORIDADES */}
              <div className="grafico-card secundario">
                <div className="grafico-header">
                  <h3>Distribución por Prioridad</h3>
                </div>
                <div className="grafico-contenedor pequeno">
                  <Pie data={getPrioridadData()} options={{
                    ...doughnutOptions,
                    plugins: { legend: { position: 'bottom' } }
                  }} />
                </div>
              </div>

              {/* MÉTRICAS EN TIEMPO REAL */}
              <div className="metricas-card">
                <h3>Métricas en Tiempo Real</h3>
                <div className="metricas-grid">
                  <div className="metrica-item">
                    <span className="metrica-label">Producción Hoy</span>
                    <span className="metrica-valor">{metricasTiempoReal.produccionHoy.toLocaleString()}</span>
                    <span className="metrica-trend positivo">+12.5%</span>
                  </div>
                  <div className="metrica-item">
                    <span className="metrica-label">Eficiencia</span>
                    <span className="metrica-valor">{metricasTiempoReal.eficiencia}%</span>
                    <span className="metrica-trend positivo">+3.2%</span>
                  </div>
                  <div className="metrica-item">
                    <span className="metrica-label">Tasa FFTT</span>
                    <span className="metrica-valor">98.3%</span>
                    <span className="metrica-trend positivo">+2.1%</span>
                  </div>
                  <div className="metrica-item">
                    <span className="metrica-label">Alertas Activas</span>
                    <span className="metrica-valor">{metricasTiempoReal.alertasActivas}</span>
                    <span className="metrica-trend negativo">+2</span>
                  </div>
                  <div className="metrica-item">
                    <span className="metrica-label">Lotes en Proceso</span>
                    <span className="metrica-valor">{metricasTiempoReal.lotesEnProceso}</span>
                    <span className="metrica-trend neutral">=0</span>
                  </div>
                  <div className="metrica-item">
                    <span className="metrica-label">Cumplimiento</span>
                    <span className="metrica-valor">{metricasTiempoReal.cumplimiento}%</span>
                    <span className="metrica-trend positivo">+5%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== VISTA HISTORIAL ===== */}
        {vista === 'historial' && (
          <div className="historial-container">
            <div className="historial-header">
              <h2 className="section-title">
                <span className="title-icon">📜</span>
                Historial de Reportes
                <span className="title-codigo">V152489/IF3245</span>
              </h2>
              <button className="limpiar-btn" onClick={() => setHistorialReportes([])}>
                <span className="btn-icon">🗑️</span>
                Limpiar historial
              </button>
            </div>

            {historialReportes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3>No hay reportes en el historial</h3>
                <p>Los reportes que generes aparecerán aquí</p>
                <button className="empty-btn" onClick={() => setVista('generador')}>
                  Generar primer reporte
                </button>
              </div>
            ) : (
              <div className="historial-lista">
                {historialReportes.map(reporte => (
                  <div key={reporte.id} className="historial-item">
                    <div className="item-icon">
                      {reporte.tipo === 'pdf' && '📄'}
                      {reporte.tipo === 'excel' && '📊'}
                      {reporte.tipo === 'csv' && '📃'}
                      {reporte.tipo === 'json' && '📋'}
                      {reporte.tipo === 'grafico' && '📈'}
                      {reporte.tipo === 'powerbi' && '📊'}
                      {reporte.tipo === 'tableau' && '📉'}
                    </div>
                    <div className="item-info">
                      <div className="item-titulo">
                        <span className="item-area">{reporte.area}</span>
                        <span className="item-codigo">{reporte.areaCodigo}</span>
                        <span className="item-tipo" style={{ backgroundColor: TIPOS_REPORTE.find(t => t.value === reporte.tipo)?.color + '20', color: TIPOS_REPORTE.find(t => t.value === reporte.tipo)?.color }}>
                          {reporte.tipoLabel}
                        </span>
                      </div>
                      <div className="item-detalles">
                        <span className="item-fecha">
                          {new Date(reporte.fecha).toLocaleString('es-ES', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span className="item-periodo">
                          {reporte.inicio} → {reporte.fin}
                        </span>
                      </div>
                      <div className="item-archivo">
                        <span className="archivo-label">Archivo:</span>
                        <span className="archivo-nombre">{reporte.nombreArchivo}</span>
                        <span className="archivo-formato">{reporte.formato}</span>
                      </div>
                      <div className="item-filtros">
                        {reporte.criticos && <span className="filtro-badge critico">🚨 Críticos</span>}
                        {reporte.prioridad !== 'todas' && (
                          <span className="filtro-badge" style={{ backgroundColor: PRIORIDADES.find(p => p.value === reporte.prioridad)?.color + '20', color: PRIORIDADES.find(p => p.value === reporte.prioridad)?.color }}>
                            {PRIORIDADES.find(p => p.value === reporte.prioridad)?.icon} {PRIORIDADES.find(p => p.value === reporte.prioridad)?.label}
                          </span>
                        )}
                        {reporte.estado !== 'todos' && (
                          <span className="filtro-badge" style={{ backgroundColor: ESTADOS.find(e => e.value === reporte.estado)?.color + '20', color: ESTADOS.find(e => e.value === reporte.estado)?.color }}>
                            {ESTADOS.find(e => e.value === reporte.estado)?.icon} {ESTADOS.find(e => e.value === reporte.estado)?.label}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="item-acciones">
                      <button className="item-btn" title="Ver detalles">👁️</button>
                      <button className="item-btn" title="Descargar">📥</button>
                      <button className="item-btn" title="Compartir">📤</button>
                      <button className="item-btn" title="Eliminar">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== VISTA EXPORTACIÓN ===== */}
        {vista === 'exportacion' && (
          <div className="exportacion-container">
            <div className="exportacion-card">
              <h2 className="card-title">
                <span className="title-icon">📤</span>
                Exportación de Datos
                <span className="title-codigo">V163478/IF4567</span>
              </h2>
              
              <div className="exportacion-opciones">
                <button 
                  className="exportacion-btn excel"
                  onClick={() => exportarDatosActuales('excel')}
                >
                  <span className="btn-icon">📊</span>
                  <span className="btn-text">Exportar a Excel</span>
                  <span className="btn-formato">V134339/BV1012</span>
                </button>
                
                <button 
                  className="exportacion-btn csv"
                  onClick={() => exportarDatosActuales('csv')}
                >
                  <span className="btn-icon">📃</span>
                  <span className="btn-text">Exportar a CSV</span>
                  <span className="btn-formato">V152489/IF3245</span>
                </button>
                
                <button 
                  className="exportacion-btn json"
                  onClick={() => exportarDatosActuales('json')}
                >
                  <span className="btn-icon">📋</span>
                  <span className="btn-text">Exportar a JSON</span>
                  <span className="btn-formato">V163478/IF4567</span>
                </button>
              </div>

              <div className="exportacion-info">
                <h3>Vista previa de datos</h3>
                <table className="exportacion-tabla">
                  <thead>
                    <tr>
                      <th>Lote</th>
                      <th>Producto</th>
                      <th>Cliente</th>
                      <th>Cantidad</th>
                      <th>Estado</th>
                      <th>Prioridad</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span className="lote-codigo">V132274/IF2128</span></td>
                      <td>Camiseta MLB Yankees</td>
                      <td>Nike</td>
                      <td>150</td>
                      <td><span className="estado-badge completado">Completado</span></td>
                      <td><span className="prioridad-badge alta">Alta</span></td>
                    </tr>
                    <tr>
                      <td><span className="lote-codigo">V134339/BV1012</span></td>
                      <td>Gorra NBA Lakers</td>
                      <td>Adidas</td>
                      <td>75</td>
                      <td><span className="estado-badge proceso">En Proceso</span></td>
                      <td><span className="prioridad-badge media">Media</span></td>
                    </tr>
                    <tr>
                      <td><span className="lote-codigo">V152489/IF3245</span></td>
                      <td>Uniforme NFL Patriots</td>
                      <td>RUN</td>
                      <td>200</td>
                      <td><span className="estado-badge pendiente">Pendiente</span></td>
                      <td><span className="prioridad-badge baja">Baja</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===== VISTA ANÁLISIS ===== */}
        {vista === 'analisis' && (
          <div className="analisis-container">
            <h2 className="section-title">
              <span className="title-icon">🔬</span>
              Análisis Avanzado
              <span className="title-codigo">V174569/IF5890</span>
            </h2>

            <div className="analisis-grid">
              <div className="analisis-card">
                <h3>📊 Estadísticas Descriptivas</h3>
                <div className="estadisticas-tabla">
                  <div className="estadistica-row">
                    <span>Media</span>
                    <span>1,234.56</span>
                  </div>
                  <div className="estadistica-row">
                    <span>Mediana</span>
                    <span>1,189.00</span>
                  </div>
                  <div className="estadistica-row">
                    <span>Moda</span>
                    <span>1,150.00</span>
                  </div>
                  <div className="estadistica-row">
                    <span>Desviación Estándar</span>
                    <span>234.78</span>
                  </div>
                  <div className="estadistica-row">
                    <span>Varianza</span>
                    <span>55,123.45</span>
                  </div>
                  <div className="estadistica-row">
                    <span>Rango</span>
                    <span>890.00</span>
                  </div>
                  <div className="estadistica-row">
                    <span>Mínimo</span>
                    <span>789.00</span>
                  </div>
                  <div className="estadistica-row">
                    <span>Máximo</span>
                    <span>1,679.00</span>
                  </div>
                </div>
              </div>

              <div className="analisis-card">
                <h3>📈 Análisis de Tendencia</h3>
                <div className="tendencia-info">
                  <div className="tendencia-item">
                    <span className="tendencia-label">Tendencia general</span>
                    <span className="tendencia-valor positiva">↑ +12.5%</span>
                  </div>
                  <div className="tendencia-item">
                    <span className="tendencia-label">Estacionalidad</span>
                    <span className="tendencia-valor">Semanal</span>
                  </div>
                  <div className="tendencia-item">
                    <span className="tendencia-label">Ciclo</span>
                    <span className="tendencia-valor">Mensual</span>
                  </div>
                  <div className="tendencia-item">
                    <span className="tendencia-label">Proyección próximo mes</span>
                    <span className="tendencia-valor positiva">↑ +8.3%</span>
                  </div>
                </div>
              </div>

              <div className="analisis-card">
                <h3>🎯 KPIs Clave</h3>
                <div className="kpis-grid">
                  <div className="kpi-analisis">
                    <span className="kpi-label">OEE</span>
                    <span className="kpi-valor">85.7%</span>
                    <span className="kpi-trend positiva">+2.3%</span>
                  </div>
                  <div className="kpi-analisis">
                    <span className="kpi-label">FFTT</span>
                    <span className="kpi-valor">98.3%</span>
                    <span className="kpi-trend positiva">+1.2%</span>
                  </div>
                  <div className="kpi-analisis">
                    <span className="kpi-label">MTBF</span>
                    <span className="kpi-valor">342h</span>
                    <span className="kpi-trend positiva">+15h</span>
                  </div>
                  <div className="kpi-analisis">
                    <span className="kpi-label">MTTR</span>
                    <span className="kpi-valor">2.3h</span>
                    <span className="kpi-trend negativa">-0.5h</span>
                  </div>
                </div>
              </div>

              <div className="analisis-card full-width">
                <h3>📋 Recomendaciones</h3>
                <div className="recomendaciones-lista">
                  <div className="recomendacion-item alta">
                    <span className="recomendacion-prioridad">🔴 Alta</span>
                    <p>Aumentar capacidad en área de Plotter para reducir backlog</p>
                    <span className="recomendacion-impacto">+15% eficiencia estimada</span>
                  </div>
                  <div className="recomendacion-item media">
                    <span className="recomendacion-prioridad">🟡 Media</span>
                    <p>Implementar mantenimiento preventivo en Sublimado 3</p>
                    <span className="recomendacion-impacto">-23% tiempo de inactividad</span>
                  </div>
                  <div className="recomendacion-item baja">
                    <span className="recomendacion-prioridad">🟢 Baja</span>
                    <p>Capacitar personal en nuevo sistema de calidad</p>
                    <span className="recomendacion-impacto">+5% tasa FFTT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===== BOTÓN VOLVER ARRIBA ===== */}
      <button 
        className={`scroll-top ${showScrollTop ? 'visible' : ''}`} 
        onClick={scrollToTop}
        title="Volver arriba"
      >
        ↑
      </button>
    </div>
  );
}