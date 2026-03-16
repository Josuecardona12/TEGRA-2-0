// src/pages/PlotterLotes.jsx
import React, { useState, useEffect, useRef } from "react";
import "./PlotterLotes.css";

// ============================================
// CONFIGURACIÓN WEBSOCKET PARA TIEMPO REAL
// ============================================
const WS_URL = 'wss://glowing-lamp-r47wvpq4574fxv7j-8080.app.github.dev';

const PlotterLotes = () => {
  // ================ ESTADOS DE CONEXIÓN ================
  const [conectado, setConectado] = useState(false);
  const [usandoServidor, setUsandoServidor] = useState(false);
  const [ultimoMovimiento, setUltimoMovimiento] = useState(null);
  const wsRef = useRef(null);

  // ================ MÁQUINAS ================
  const [maquinas, setMaquinas] = useState([
    { 
      id: "plt-001", 
      nombre: "MAQUINA 1", 
      icono: "🖨️", 
      estado: "disponible", 
      temperatura: 42, 
      tinta: 87, 
      produccionHoy: 1245,
      loteActual: null, 
      operador: "Carlos R.",
      velocidad: 1850,
      eficiencia: 98,
      alertas: [],
      color: "#4361ee",
      historial: []
    },
    { 
      id: "plt-002", 
      nombre: "MAQUINA 6", 
      icono: "🖨️", 
      estado: "produciendo", 
      temperatura: 45, 
      tinta: 62, 
      produccionHoy: 2134,
      loteActual: "V132274/IF2128", 
      operador: "María G.",
      velocidad: 2200,
      eficiencia: 95,
      alertas: ["⚠️ Tinta baja 62%"],
      color: "#3a0ca3",
      historial: []
    },
    { 
      id: "plt-003", 
      nombre: "MAQUINA 4", 
      icono: "🖨️", 
      estado: "disponible", 
      temperatura: 38, 
      tinta: 94, 
      produccionHoy: 1876,
      loteActual: null, 
      operador: "Juan P.",
      velocidad: 2000,
      eficiencia: 97,
      alertas: [],
      color: "#4cc9f0",
      historial: []
    },
    { 
      id: "plt-004", 
      nombre: "MAQUINA 2", 
      icono: "🖨️", 
      estado: "mantenimiento", 
      temperatura: 0, 
      tinta: 0, 
      produccionHoy: 0,
      loteActual: null, 
      operador: "Técnico",
      velocidad: 2400,
      eficiencia: 0,
      alertas: ["🔧 Mantenimiento programado"],
      color: "#f72585",
      historial: []
    },
    { 
      id: "plt-005", 
      nombre: "MAQUINA 3", 
      icono: "🖨️", 
      estado: "disponible", 
      temperatura: 35, 
      tinta: 72, 
      produccionHoy: 2341,
      loteActual: null, 
      operador: "Luisa F.",
      velocidad: 1200,
      eficiencia: 92,
      alertas: [],
      color: "#f94144",
      historial: []
    }
  ]);

  // ================ LOTES ================
  const [lotes, setLotes] = useState({
    pendientes: [
      { 
        id: "V132274/IF2128", 
        codigo: "V132274/IF2128", 
        cliente: "NIKE", 
        producto: "LONA IMPRESA 3x2m", 
        cantidad: 450, 
        prioridad: "ALTA",
        fecha: "2026-03-11",
        hora: "08:30",
        material: "Lona Front",
        acabado: "Mate",
        colores: 4,
        tiempoEstimado: "2.5h",
        diseño: "nk_137_campaign.ai",
        observaciones: "Urgente - Evento deportivo",
        fechaCodigo: "2026-03-16",
        loteV: "132274",
        loteIF: "2128",
        historia: []
      },
      { 
        id: "V152489/IF3245", 
        codigo: "V152489/IF3245", 
        cliente: "ADIDAS", 
        producto: "VINILO TEXTIL", 
        cantidad: 280, 
        prioridad: "MEDIA",
        fecha: "2026-03-11",
        hora: "09:15",
        material: "Vinil textil",
        acabado: "Brillante",
        colores: 3,
        tiempoEstimado: "1.8h",
        diseño: "ad_245_running.eps",
        observaciones: "Camisetas running",
        fechaCodigo: "2015-02-24",
        loteV: "152489",
        loteIF: "3245",
        historia: []
      },
      { 
        id: "V163478/IF4567", 
        codigo: "V163478/IF4567", 
        cliente: "PUMA", 
        producto: "PAPEL SUBLIMACIÓN", 
        cantidad: 600, 
        prioridad: "ALTA",
        fecha: "2026-03-11",
        hora: "10:20",
        material: "Papel transfer",
        acabado: "Premium",
        colores: 6,
        tiempoEstimado: "3.2h",
        diseño: "pm_389_collection.pdf",
        observaciones: "200°C temperatura",
        fechaCodigo: "2016-03-16",
        loteV: "163478",
        loteIF: "4567",
        historia: []
      },
      { 
        id: "V174569/IF5890", 
        codigo: "V174569/IF5890", 
        cliente: "NBA", 
        producto: "BANNER 2x1m", 
        cantidad: 200, 
        prioridad: "ALTA",
        fecha: "2026-03-11",
        hora: "11:45",
        material: "Banner mesh",
        acabado: "Con ojillos",
        colores: 2,
        tiempoEstimado: "1.5h",
        diseño: "ua_456_outdoor.cdr",
        observaciones: "Resistente UV",
        fechaCodigo: "2017-04-05",
        loteV: "174569",
        loteIF: "5890",
        historia: []
      },
      { 
        id: "V134339/BV1012", 
        codigo: "V134339/BV1012", 
        cliente: "CLIENTE NUEVO", 
        producto: "PRODUCTO ESPECIAL", 
        cantidad: 350, 
        prioridad: "ALTA",
        fecha: "2026-03-16",
        hora: "14:30",
        material: "Material Premium",
        acabado: "Especial",
        colores: 5,
        tiempoEstimado: "3.0h",
        diseño: "especial_001.ai",
        observaciones: "Nuevo formato",
        fechaCodigo: "2013-04-03",
        loteV: "134339",
        loteIF: "1012",
        historia: []
      }
    ],
    produccion: [],
    finalizados: []
  });

  // ================ ESTADOS ================
  const [codigoEscaneado, setCodigoEscaneado] = useState("");
  const [notificaciones, setNotificaciones] = useState([]);
  const [modoOscuro, setModoOscuro] = useState(false);
  const [modalAsignar, setModalAsignar] = useState({ abierto: false, lote: null });
  const [modalDetalle, setModalDetalle] = useState({ abierto: false, tipo: null, item: null });
  const [maquinaSeleccionada, setMaquinaSeleccionada] = useState(null);
  const [tiempoReal, setTiempoReal] = useState(new Date());
  const [vista, setVista] = useState("grid");
  const [busqueda, setBusqueda] = useState("");
  const [filtroMaquinas, setFiltroMaquinas] = useState("todas");
  const [animacionActiva, setAnimacionActiva] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const inputRef = useRef(null);
  const mainContentRef = useRef(null);

  // ================ VALIDAR FORMATO DE LOTE (AHORA ACEPTA CUALQUIER CÓDIGO) ================
  const validarFormatoLote = (codigo) => {
    // ¡AHORA ACEPTA CUALQUIER CÓDIGO QUE NO SEA UN ÁREA!
    // Los códigos de área son 9001-9012, todo lo demás es un lote válido
    return !codigo.match(/^9\d{3}$/);
  };

  const extraerInfoLote = (codigo) => {
    // Extraer información básica del código
    const info = {
      codigoOriginal: codigo,
      timestamp: Date.now()
    };

    // Intentar extraer formato VXXXXXX/IFXXXX
    const matchPrincipal = codigo.match(/^V(\d{6})\/([A-Z]{2})(\d{4})$/);
    if (matchPrincipal) {
      const año = matchPrincipal[1].substring(0, 2);
      const mes = matchPrincipal[1].substring(2, 4);
      const dia = matchPrincipal[1].substring(4, 6);
      return {
        ...info,
        formato: 'principal',
        numeroV: matchPrincipal[1],
        prefijo: matchPrincipal[2],
        numeroSufijo: matchPrincipal[3],
        fecha: `20${año}-${mes}-${dia}`
      };
    }

    // Intentar extraer formato VXXXXXX/IFXXXX (formato original)
    const matchOriginal = codigo.match(/^V(\d{6})\/IF(\d{4})$/);
    if (matchOriginal) {
      const año = matchOriginal[1].substring(0, 2);
      const mes = matchOriginal[1].substring(2, 4);
      const dia = matchOriginal[1].substring(4, 6);
      return {
        ...info,
        formato: 'original',
        numeroV: matchOriginal[1],
        numeroIF: matchOriginal[2],
        fecha: `20${año}-${mes}-${dia}`
      };
    }

    // Si no coincide con ningún formato específico, devolver info básica
    return {
      ...info,
      formato: 'generico'
    };
  };

  // ================ CONEXIÓN WEBSOCKET ================
  useEffect(() => {
    console.log('🔌 PlotterLotes conectando...');
    
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    
    ws.onopen = () => {
      console.log('✅ PlotterLotes conectado');
      setConectado(true);
      setUsandoServidor(true);
      mostrarNotificacion('✅ Conectado al servidor - Tiempo Real', 'success');
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📦 PlotterLotes recibió:', data.type);
        
        if (data.type === 'INIT' || data.type === 'ACTUALIZACION') {
          const lotesData = data.data.lotes || [];
          
          if (data.data.ultimoMovimiento) {
            setUltimoMovimiento(data.data.ultimoMovimiento);
            mostrarNotificacion(`🔄 ${data.data.ultimoMovimiento.loteId} → ${data.data.ultimoMovimiento.area}`, 'info');
          }
          
          if (lotesData.length > 0) {
            // Actualizar lotes pendientes con datos del servidor
            const nuevosPendientes = lotesData
              .filter(l => l.estado === 'pendiente' || l.estado === 'nuevo')
              .map(l => {
                const infoLote = extraerInfoLote(l.codigo);
                return {
                  id: l.codigo,
                  codigo: l.codigo,
                  cliente: l.cliente || 'Pendiente',
                  producto: l.producto || 'Producto',
                  cantidad: l.cantidad || 0,
                  prioridad: l.prioridad || 'MEDIA',
                  fecha: new Date().toLocaleDateString(),
                  hora: new Date().toLocaleTimeString(),
                  material: "Estándar",
                  acabado: "Estándar",
                  colores: 4,
                  tiempoEstimado: "2.0h",
                  diseño: "pendiente.ai",
                  observaciones: "",
                  fechaCodigo: infoLote?.fecha || '',
                  loteV: infoLote?.numeroV || '',
                  loteIF: infoLote?.numeroIF || '',
                  prefijo: infoLote?.prefijo || '',
                  historia: []
                };
              });
            
            setLotes(prev => ({
              ...prev,
              pendientes: [...nuevosPendientes, ...prev.pendientes].slice(0, 10)
            }));
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
      mostrarNotificacion('❌ Usando modo local - Demo', 'info');
    };
    
    ws.onclose = () => {
      console.log('❌ PlotterLotes desconectado');
      setConectado(false);
      setUsandoServidor(false);
    };
    
    return () => ws.close();
  }, []);

  // ================ DETECTAR SCROLL ================
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

  // ================ ENVIAR AL SERVIDOR ================
  const enviarAlServidor = (tipo, payload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: tipo, payload }));
    }
  };

  // ================ EFECTOS ================
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    const interval = setInterval(() => {
      setTiempoReal(new Date());
      actualizarProduccion();
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // ================ ACTUALIZAR PRODUCCIÓN ================
  const actualizarProduccion = () => {
    setLotes(prev => ({
      ...prev,
      produccion: prev.produccion.map(lote => {
        if (lote.estado !== "produciendo") return lote;
        
        const maquina = maquinas.find(m => m.id === lote.maquinaId);
        const avance = (maquina?.velocidad || 1000) / 3600;
        const nuevaCantidad = Math.min(
          (lote.cantidadProcesada || 0) + avance,
          lote.cantidad
        );
        
        return {
          ...lote,
          cantidadProcesada: nuevaCantidad,
          progreso: ((nuevaCantidad / lote.cantidad) * 100).toFixed(1)
        };
      })
    }));
  };

  // ================ PROCESAR ESCANEO (AHORA ACEPTA CUALQUIER CÓDIGO) ================
  const procesarEscaneo = () => {
    const codigo = codigoEscaneado.trim().toUpperCase();
    if (!codigo) {
      mostrarNotificacion("⚠️ Ingrese un código válido", "warning");
      return;
    }

    // Verificar si es código de área (9001-9012)
    if (codigo.match(/^9\d{3}$/)) {
      mostrarNotificacion(`❌ Los códigos de área (${codigo}) no son válidos para lotes`, "error");
      setCodigoEscaneado("");
      return;
    }

    setAnimacionActiva(true);
    setTimeout(() => setAnimacionActiva(false), 500);
    
    const infoLote = extraerInfoLote(codigo);
    
    // Buscar en producción (2do escaneo - finalizar)
    const loteEnProduccion = lotes.produccion.find(l => l.codigo === codigo);
    if (loteEnProduccion) {
      setModalDetalle({ 
        abierto: true, 
        tipo: "confirmarFinalizar", 
        item: loteEnProduccion 
      });
      
      // Enviar al servidor
      enviarAlServidor('ESCANEO', { codigo, tipo: 'finalizar', area: 'Plotter', infoLote });
      
      setCodigoEscaneado("");
      return;
    }

    // Buscar en pendientes (1er escaneo - iniciar)
    const lotePendiente = lotes.pendientes.find(l => l.codigo === codigo);
    if (lotePendiente) {
      setModalAsignar({ abierto: true, lote: lotePendiente });
      
      // Enviar al servidor
      enviarAlServidor('ESCANEO', { codigo, tipo: 'iniciar', area: 'Plotter', infoLote });
      
      setCodigoEscaneado("");
      return;
    }

    // Buscar en finalizados
    const loteFinalizado = lotes.finalizados.find(l => l.codigo === codigo);
    if (loteFinalizado) {
      setModalDetalle({ abierto: true, tipo: "lote", item: loteFinalizado });
      
      // Enviar al servidor
      enviarAlServidor('ESCANEO', { codigo, tipo: 'detalle', area: 'Plotter', infoLote });
      
      setCodigoEscaneado("");
      return;
    }

    // Si no existe, crear nuevo lote con cualquier código
    crearNuevoLote(codigo, infoLote);
  };

  // ================ CREAR NUEVO LOTE (ACEPTA CUALQUIER CÓDIGO) ================
  const crearNuevoLote = (codigo, infoLote = null) => {
    const clientes = ['NIKE', 'ADIDAS', 'PUMA', 'NBA', 'UNDER ARMOUR', 'NEW BALANCE', 'CLIENTE NUEVO'];
    const productos = ['LONA IMPRESA', 'VINILO TEXTIL', 'PAPEL SUBLIMACIÓN', 'BANNER', 'LONA FRONT', 'PRODUCTO ESPECIAL'];
    const prioridades = ['ALTA', 'MEDIA', 'BAJA'];
    
    // Personalizar según el formato
    let cliente = clientes[Math.floor(Math.random() * clientes.length)];
    let producto = `${productos[Math.floor(Math.random() * productos.length)]} ${Math.floor(1 + Math.random() * 5)}x${Math.floor(1 + Math.random() * 3)}m`;
    let fechaCodigo = '';
    let loteV = '';
    let loteIF = '';
    let prefijo = '';
    
    if (infoLote) {
      if (infoLote.formato === 'principal' || infoLote.formato === 'original') {
        fechaCodigo = infoLote.fecha || '';
        loteV = infoLote.numeroV || '';
        loteIF = infoLote.numeroIF || infoLote.numeroSufijo || '';
        prefijo = infoLote.prefijo || 'IF';
        if (infoLote.prefijo === 'BV') {
          cliente = 'CLIENTE BV';
          producto = 'PRODUCTO ESPECIAL BV';
        }
      }
    }

    const nuevoLote = {
      id: codigo,
      codigo,
      cliente,
      producto,
      cantidad: Math.floor(100 + Math.random() * 900),
      prioridad: prioridades[Math.floor(Math.random() * prioridades.length)],
      fecha: tiempoReal.toISOString().split('T')[0],
      hora: tiempoReal.toLocaleTimeString(),
      material: ["Lona", "Vinil", "Papel", "Banner", "Premium"][Math.floor(Math.random() * 5)],
      acabado: ["Mate", "Brillante", "Premium", "Económico", "Especial"][Math.floor(Math.random() * 5)],
      colores: Math.floor(2 + Math.random() * 4),
      tiempoEstimado: `${(1 + Math.random() * 3).toFixed(1)}h`,
      diseño: `${codigo.toLowerCase().replace(/[\/-]/g, '_')}.ai`,
      observaciones: "Generado automáticamente",
      fechaCodigo: fechaCodigo || new Date().toISOString().split('T')[0],
      loteV: loteV || codigo.replace(/[^0-9]/g, '').substring(0, 6),
      loteIF: loteIF || codigo.replace(/[^0-9]/g, '').substring(6, 10) || '0000',
      prefijo: prefijo || 'IF',
      historia: []
    };

    setLotes(prev => ({
      ...prev,
      pendientes: [nuevoLote, ...prev.pendientes]
    }));
    
    // Enviar al servidor
    enviarAlServidor('NUEVO_LOTE', nuevoLote);
    
    mostrarNotificacion(`✅ Lote ${codigo} generado`, "success");
    setCodigoEscaneado("");
  };

  // ================ ASIGNAR LOTE ================
  const asignarLote = (lote, maquina) => {
    if (!maquina) {
      mostrarNotificacion("❌ Seleccione una máquina", "warning");
      return;
    }

    const infoLote = extraerInfoLote(lote.codigo);

    const nuevoLote = {
      ...lote,
      idProduccion: `PROD-${Date.now()}`,
      maquinaId: maquina.id,
      maquinaNombre: maquina.nombre,
      horaInicio: tiempoReal.toLocaleTimeString(),
      cantidadProcesada: 0,
      progreso: "0",
      estado: "produciendo",
      operador: maquina.operador,
      tiempoInicio: Date.now(),
      fechaCodigo: infoLote?.fecha || lote.fechaCodigo,
      loteV: infoLote?.numeroV || lote.loteV,
      loteIF: infoLote?.numeroIF || lote.loteIF,
      prefijo: infoLote?.prefijo || lote.prefijo || 'IF'
    };

    setLotes(prev => ({
      ...prev,
      pendientes: prev.pendientes.filter(l => l.id !== lote.id),
      produccion: [...prev.produccion, nuevoLote]
    }));

    setMaquinas(prev => prev.map(m => 
      m.id === maquina.id 
        ? { ...m, estado: "produciendo", loteActual: lote.codigo }
        : m
    ));

    // Enviar al servidor
    enviarAlServidor('MOVIMIENTO', {
      loteId: lote.codigo,
      area: 'Plotter',
      maquinaId: maquina.id,
      maquinaNombre: maquina.nombre,
      estado: 'iniciado'
    });

    setModalAsignar({ abierto: false, lote: null });
    setMaquinaSeleccionada(null);
    mostrarNotificacion(`🚀 Lote ${lote.codigo} iniciado en ${maquina.nombre}`, "success");
  };

  // ================ FINALIZAR LOTE ================
  const finalizarLote = (lote) => {
    const tiempoTotal = Math.round((Date.now() - lote.tiempoInicio) / 1000 / 60);
    const eficiencia = lote.progreso;

    const loteFinalizado = {
      ...lote,
      horaFin: tiempoReal.toLocaleTimeString(),
      fechaFin: tiempoReal.toISOString(),
      estado: "finalizado",
      eficiencia,
      tiempoTotal: `${tiempoTotal} minutos`
    };

    setMaquinas(prev => prev.map(m => 
      m.id === lote.maquinaId 
        ? { 
            ...m, 
            estado: "disponible", 
            loteActual: null,
            produccionHoy: m.produccionHoy + Math.round(lote.cantidadProcesada || 0)
          }
        : m
    ));

    setLotes(prev => ({
      ...prev,
      produccion: prev.produccion.filter(l => l.idProduccion !== lote.idProduccion),
      finalizados: [loteFinalizado, ...prev.finalizados]
    }));

    // Enviar al servidor
    enviarAlServidor('MOVIMIENTO', {
      loteId: lote.codigo,
      area: 'Finalizado',
      maquinaId: lote.maquinaId,
      estado: 'completado',
      eficiencia: eficiencia
    });

    setModalDetalle({ abierto: false, tipo: null, item: null });
    mostrarNotificacion(`✅ Lote ${lote.codigo} finalizado`, "success");
  };

  // ================ MOSTRAR DETALLE ================
  const mostrarDetalle = (tipo, item) => {
    setModalDetalle({ abierto: true, tipo, item });
  };

  // ================ NOTIFICACIONES ================
  const mostrarNotificacion = (mensaje, tipo) => {
    const id = Date.now();
    setNotificaciones(prev => [...prev, { id, mensaje, tipo }]);
    setTimeout(() => {
      setNotificaciones(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  // ================ GENERAR ALEATORIO CON FORMATOS VARIADOS ================
  const generarAleatorio = () => {
    // Elegir formato aleatorio
    const tipoFormato = Math.floor(Math.random() * 4);
    let codigo;
    
    switch(tipoFormato) {
      case 0: // Formato VXXXXXX/IFXXXX
        const año = String(Math.floor(Math.random() * 3) + 22).padStart(2, '0');
        const mes = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
        const dia = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
        const numeroV = año + mes + dia;
        const numeroIF = String(Math.floor(Math.random() * 9000) + 1000);
        codigo = `V${numeroV}/IF${numeroIF}`;
        break;
      case 1: // Formato VXXXXXX/BVXXXX
        const año2 = String(Math.floor(Math.random() * 3) + 22).padStart(2, '0');
        const mes2 = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
        const dia2 = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
        const numeroV2 = año2 + mes2 + dia2;
        const numeroBV = String(Math.floor(Math.random() * 9000) + 1000);
        codigo = `V${numeroV2}/BV${numeroBV}`;
        break;
      case 2: // Formato NK-137, AD-245, etc.
        const prefijos = ['NK', 'AD', 'PM', 'UA', 'NB', 'AS', 'BV', 'CX'];
        const prefijo = prefijos[Math.floor(Math.random() * prefijos.length)];
        const numero = String(Math.floor(Math.random() * 900) + 100);
        codigo = `${prefijo}-${numero}`;
        break;
      case 3: // Formato numérico simple
        codigo = String(Math.floor(Math.random() * 9000) + 1000);
        break;
      default:
        codigo = `V${String(Math.floor(Math.random() * 900000) + 100000)}/IF${String(Math.floor(Math.random() * 9000) + 1000)}`;
    }
    
    const infoLote = extraerInfoLote(codigo);
    crearNuevoLote(codigo, infoLote);
  };

  // ================ HANDLE KEY PRESS ================
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      procesarEscaneo();
    }
  };

  // ================ FILTRAR MÁQUINAS ================
  const maquinasFiltradas = maquinas.filter(m => {
    if (filtroMaquinas === "todas") return true;
    if (filtroMaquinas === "disponibles") return m.estado === "disponible";
    if (filtroMaquinas === "produciendo") return m.estado === "produciendo";
    return true;
  }).filter(m => m.nombre.toLowerCase().includes(busqueda.toLowerCase()));

  return (
    <div className={`plotter-container ${modoOscuro ? 'dark-mode' : ''}`} ref={mainContentRef}>
      
      {/* ===== INDICADOR DE CONEXIÓN ===== */}
      <div className={`connection-status ${conectado ? 'connected' : 'disconnected'}`}>
        <span className="status-dot"></span>
        <span>{conectado ? '🟢 Servidor Conectado' : '🟡 Modo Demo Local'}</span>
      </div>

      {/* ===== NOTIFICACIÓN DE ÚLTIMO MOVIMIENTO ===== */}
      {ultimoMovimiento && (
        <div className="movimiento-notificacion">
          🔄 {ultimoMovimiento.loteId} → {ultimoMovimiento.area}
        </div>
      )}

      {/* ===== HEADER ===== */}
      <header className="plotter-header">
        <div className="header-left">
          <h1>🖨️ Plotter - 17 Máquinas en Línea</h1>
          <span className="header-date">
            {tiempoReal.toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
        <div className="header-right">
          <div className="header-time">
            <span className="time">{tiempoReal.toLocaleTimeString()}</span>
            <span className="date">{tiempoReal.toLocaleDateString()}</span>
          </div>
          <button className="theme-toggle" onClick={() => setModoOscuro(!modoOscuro)}>
            {modoOscuro ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* ===== NOTIFICACIONES ===== */}
      <div className="notificaciones-container">
        {notificaciones.map(n => (
          <div key={n.id} className={`notificacion ${n.tipo} ${animacionActiva ? 'pop' : ''}`}>
            <span className="notificacion-icono">
              {n.tipo === 'success' && '✅'}
              {n.tipo === 'error' && '❌'}
              {n.tipo === 'warning' && '⚠️'}
              {n.tipo === 'info' && 'ℹ️'}
            </span>
            <span className="notificacion-mensaje">{n.mensaje}</span>
          </div>
        ))}
      </div>

      {/* ===== SCANNER PRINCIPAL - AHORA ACEPTA CUALQUIER CÓDIGO ===== */}
      <div className="scanner-principal">
        <h2>Sistema de Gestión de Impresión</h2>
        
        <div className="scanner-title">
          <h3>ESCANEAR CÓDIGO DE LOTE</h3>
          <span className="ejemplo">Formatos: V132274/IF2128, V134339/BV1012, NK-137, 1001...</span>
        </div>

        <div className="scanner-input-container">
          <input
            ref={inputRef}
            type="text"
            value={codigoEscaneado}
            onChange={(e) => setCodigoEscaneado(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            placeholder="V132274/IF2128, V134339/BV1012, NK-137, 1001..."
            className={`scanner-input ${animacionActiva ? 'shake' : ''}`}
          />
          <button 
            className="scanner-button"
            onClick={procesarEscaneo}
          >
            📷 ESCANEAR
          </button>
        </div>

        <div className="scanner-instrucciones">
          <div className="instruccion">
            <span className="numero">1.</span>
            <div className="texto">
              <strong>PRIMER ESCANEO</strong>
              <span>INICIAR PRODUCCIÓN</span>
            </div>
          </div>
          <div className="instruccion">
            <span className="numero">2.</span>
            <div className="texto">
              <strong>SEGUNDO ESCANEO</strong>
              <span>FINALIZAR LOTE</span>
            </div>
          </div>
        </div>

        <div className="formatos-aceptados">
          <span className="formatos-titulo">📋 Formatos aceptados:</span>
          <div className="formatos-lista">
            <span className="formato-item">V132274/IF2128</span>
            <span className="formato-item">V134339/BV1012</span>
            <span className="formato-item">NK-137</span>
            <span className="formato-item">1001</span>
            <span className="formato-item">CUALQUIER CÓDIGO</span>
          </div>
        </div>

        <button className="btn-generar" onClick={generarAleatorio}>
          🎲 GENERAR LOTE ALEATORIO
        </button>

        <div className="scanner-footer">
          <span className="okc">OKC - NYK</span>
          <span className="puntuacion">{conectado ? '🟢 EN VIVO' : '🟡 MODO LOCAL'}</span>
        </div>
      </div>

      {/* ===== FILTROS ===== */}
      <div className="filtros-panel">
        <div className="busqueda">
          <input
            type="text"
            placeholder="🔍 Buscar máquina..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <select value={filtroMaquinas} onChange={(e) => setFiltroMaquinas(e.target.value)}>
          <option value="todas">📋 Todas las máquinas</option>
          <option value="disponibles">✅ Disponibles</option>
          <option value="produciendo">⚡ En producción</option>
        </select>
        <div className="vista-toggle">
          <button 
            className={vista === 'grid' ? 'active' : ''} 
            onClick={() => setVista('grid')}
          >
            🔲 Grid
          </button>
          <button 
            className={vista === 'lista' ? 'active' : ''} 
            onClick={() => setVista('lista')}
          >
            📋 Lista
          </button>
        </div>
      </div>

      {/* ===== MÁQUINAS ===== */}
      <div className="maquinas-section">
        <h3>🖨️ MÁQUINAS DE IMPRESIÓN</h3>
        <div className={`maquinas-grid ${vista}`}>
          {maquinasFiltradas.map(maquina => (
            <div 
              key={maquina.id} 
              className={`maquina-card ${maquina.estado} animate-in`}
              onClick={() => mostrarDetalle('maquina', maquina)}
            >
              <div className="maquina-header" style={{ backgroundColor: maquina.color + '20' }}>
                <span className="maquina-icono">{maquina.icono}</span>
                <span className="maquina-nombre">{maquina.nombre}</span>
                <span className={`estado-badge ${maquina.estado}`}>
                  {maquina.estado === 'produciendo' && '⚡'}
                  {maquina.estado === 'disponible' && '✅'}
                  {maquina.estado === 'mantenimiento' && '🔧'}
                </span>
              </div>

              <div className="maquina-body">
                <div className="info-row">
                  <span>👤 Operador:</span>
                  <strong>{maquina.operador}</strong>
                </div>
                <div className="info-row">
                  <span>⚡ Velocidad:</span>
                  <strong>{maquina.velocidad} pz/h</strong>
                </div>
                <div className="info-row">
                  <span>🌡️ Temperatura:</span>
                  <strong className={maquina.temperatura > 45 ? 'alerta' : ''}>
                    {maquina.temperatura}°C
                  </strong>
                </div>
                <div className="info-row">
                  <span>🖨️ Tinta:</span>
                  <div className="tinta-bar">
                    <div 
                      className={`tinta-nivel ${maquina.tinta < 20 ? 'critico' : ''}`}
                      style={{ width: `${maquina.tinta}%` }}
                    />
                    <span className="tinta-porcentaje">{maquina.tinta}%</span>
                  </div>
                </div>

                {maquina.loteActual && (
                  <div className="lote-actual">
                    <span className="label">Lote actual:</span>
                    <span className="codigo">{maquina.loteActual}</span>
                  </div>
                )}

                {maquina.alertas.map((alerta, idx) => (
                  <div key={idx} className="alerta pulse">{alerta}</div>
                ))}
              </div>

              <div className="maquina-footer">
                <span>📊 {maquina.eficiencia}% eficiencia</span>
                <span>📦 {maquina.produccionHoy} hoy</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== LOTES PENDIENTES ===== */}
      {lotes.pendientes.length > 0 && (
        <div className="lotes-section">
          <h3>📦 LOTES PENDIENTES</h3>
          <div className="lotes-grid">
            {lotes.pendientes.map(lote => {
              // Determinar badge según formato
              let formatoBadge = null;
              if (lote.codigo.includes('/IF')) {
                formatoBadge = <span className="formato-badge-mini if">IF</span>;
              } else if (lote.codigo.includes('/BV')) {
                formatoBadge = <span className="formato-badge-mini bv">BV</span>;
              } else if (lote.codigo.includes('-')) {
                formatoBadge = <span className="formato-badge-mini alt">{lote.codigo.split('-')[0]}</span>;
              } else if (/^\d+$/.test(lote.codigo)) {
                formatoBadge = <span className="formato-badge-mini num">#</span>;
              }
              
              return (
                <div 
                  key={lote.id} 
                  className="lote-card animate-in"
                  onClick={() => mostrarDetalle('lote', lote)}
                >
                  <div className="lote-header">
                    <div className="lote-titulo">
                      <span className="lote-codigo" title={lote.codigo}>
                        {lote.codigo}
                      </span>
                      {formatoBadge}
                    </div>
                    <span className={`prioridad ${lote.prioridad.toLowerCase()}`}>
                      {lote.prioridad}
                    </span>
                  </div>
                  <div className="lote-cliente">{lote.cliente}</div>
                  <div className="lote-producto">{lote.producto}</div>
                  {lote.fechaCodigo && (
                    <div className="lote-fecha">📅 {lote.fechaCodigo}</div>
                  )}
                  <div className="lote-footer">
                    <span>📦 {lote.cantidad} pz</span>
                    <span>⏱️ {lote.tiempoEstimado}</span>
                  </div>
                  <button 
                    className="btn-asignar"
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalAsignar({ abierto: true, lote });
                    }}
                  >
                    ASIGNAR
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== PRODUCCIÓN ACTUAL ===== */}
      {lotes.produccion.length > 0 && (
        <div className="produccion-section">
          <h3>⚡ PRODUCCIÓN ACTUAL</h3>
          <div className="produccion-grid">
            {lotes.produccion.map(lote => (
              <div 
                key={lote.idProduccion} 
                className="produccion-card animate-in"
                onClick={() => mostrarDetalle('produccion', lote)}
              >
                <div className="produccion-header">
                  <span className="codigo" title={lote.codigo}>{lote.codigo}</span>
                  <span className={`prioridad ${lote.prioridad.toLowerCase()}`}>
                    {lote.prioridad}
                  </span>
                </div>
                <div className="cliente">{lote.cliente}</div>
                <div className="maquina">🖨️ {lote.maquinaNombre}</div>
                
                <div className="progreso">
                  <div className="progreso-header">
                    <span>Progreso</span>
                    <span className="porcentaje">{lote.progreso}%</span>
                  </div>
                  <div className="progreso-barra">
                    <div 
                      className="progreso-fill" 
                      style={{ width: `${lote.progreso}%` }}
                    />
                  </div>
                </div>

                <div className="cantidades">
                  <span>Procesado: {Math.round(lote.cantidadProcesada || 0)}</span>
                  <span>Total: {lote.cantidad}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== MODAL ASIGNAR ===== */}
      {modalAsignar.abierto && modalAsignar.lote && (
        <div className="modal-overlay" onClick={() => {
          setModalAsignar({ abierto: false, lote: null });
          setMaquinaSeleccionada(null);
        }}>
          <div className="modal-contenido" onClick={e => e.stopPropagation()}>
            <h3>📦 ASIGNAR LOTE A MÁQUINA</h3>
            
            <div className="modal-lote-info">
              <p><strong>Lote:</strong> {modalAsignar.lote.codigo}</p>
              <p><strong>Cliente:</strong> {modalAsignar.lote.cliente}</p>
              <p><strong>Producto:</strong> {modalAsignar.lote.producto}</p>
              <p><strong>Cantidad:</strong> {modalAsignar.lote.cantidad} pz</p>
              <p><strong>Prioridad:</strong> {modalAsignar.lote.prioridad}</p>
              {modalAsignar.lote.fechaCodigo && (
                <p><strong>Fecha código:</strong> {modalAsignar.lote.fechaCodigo}</p>
              )}
            </div>

            <h4>Máquinas Disponibles</h4>
            <div className="modal-maquinas">
              {maquinas
                .filter(m => m.estado === "disponible")
                .map(m => (
                  <div
                    key={m.id}
                    className={`modal-maquina ${maquinaSeleccionada?.id === m.id ? 'seleccionada' : ''}`}
                    onClick={() => setMaquinaSeleccionada(m)}
                  >
                    <span>{m.icono} {m.nombre}</span>
                    <span>⚡ {m.velocidad} pz/h</span>
                    <span>👤 {m.operador}</span>
                  </div>
                ))}
            </div>

            <div className="modal-acciones">
              <button className="btn-cancelar" onClick={() => {
                setModalAsignar({ abierto: false, lote: null });
                setMaquinaSeleccionada(null);
              }}>
                CANCELAR
              </button>
              <button 
                className={`btn-asignar ${!maquinaSeleccionada ? 'disabled' : ''}`}
                onClick={() => asignarLote(modalAsignar.lote, maquinaSeleccionada)}
                disabled={!maquinaSeleccionada}
              >
                ASIGNAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL DETALLE ===== */}
      {modalDetalle.abierto && (
        <div className="modal-overlay" onClick={() => setModalDetalle({ abierto: false, tipo: null, item: null })}>
          <div className="modal-contenido modal-detalle" onClick={e => e.stopPropagation()}>
            
            {/* Detalle de Máquina */}
            {modalDetalle.tipo === 'maquina' && modalDetalle.item && (
              <>
                <h3>🖨️ DETALLE DE MÁQUINA</h3>
                <div className="detalle-maquina">
                  <div className="detalle-header" style={{ backgroundColor: modalDetalle.item.color + '20' }}>
                    <span className="icono">{modalDetalle.item.icono}</span>
                    <span className="nombre">{modalDetalle.item.nombre}</span>
                    <span className={`estado ${modalDetalle.item.estado}`}>
                      {modalDetalle.item.estado.toUpperCase()}
                    </span>
                  </div>

                  <div className="detalle-body">
                    <div className="detalle-grid">
                      <div className="detalle-item">
                        <label>Operador:</label>
                        <span>👤 {modalDetalle.item.operador}</span>
                      </div>
                      <div className="detalle-item">
                        <label>Velocidad:</label>
                        <span>⚡ {modalDetalle.item.velocidad} pz/h</span>
                      </div>
                      <div className="detalle-item">
                        <label>Temperatura:</label>
                        <span className={modalDetalle.item.temperatura > 45 ? 'alerta' : ''}>
                          🌡️ {modalDetalle.item.temperatura}°C
                        </span>
                      </div>
                      <div className="detalle-item">
                        <label>Tinta:</label>
                        <div className="tinta-detalle">
                          <div className="tinta-barra-grande">
                            <div 
                              className={`tinta-nivel ${modalDetalle.item.tinta < 20 ? 'critico' : ''}`}
                              style={{ width: `${modalDetalle.item.tinta}%` }}
                            />
                          </div>
                          <span>{modalDetalle.item.tinta}%</span>
                        </div>
                      </div>
                      <div className="detalle-item">
                        <label>Eficiencia:</label>
                        <span>📊 {modalDetalle.item.eficiencia}%</span>
                      </div>
                      <div className="detalle-item">
                        <label>Producción hoy:</label>
                        <span>📦 {modalDetalle.item.produccionHoy} pz</span>
                      </div>
                    </div>

                    {modalDetalle.item.loteActual && (
                      <div className="lote-actual-detalle">
                        <h4>Lote en producción:</h4>
                        <p className="codigo">{modalDetalle.item.loteActual}</p>
                      </div>
                    )}

                    {modalDetalle.item.alertas.length > 0 && (
                      <div className="alertas-detalle">
                        <h4>Alertas:</h4>
                        {modalDetalle.item.alertas.map((a, i) => (
                          <div key={i} className="alerta-item">{a}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Detalle de Lote */}
            {modalDetalle.tipo === 'lote' && modalDetalle.item && (
              <>
                <h3>📦 DETALLE DE LOTE</h3>
                <div className="detalle-lote">
                  <div className="detalle-header">
                    <span className="codigo">{modalDetalle.item.codigo}</span>
                    <span className={`prioridad ${modalDetalle.item.prioridad.toLowerCase()}`}>
                      {modalDetalle.item.prioridad}
                    </span>
                  </div>

                  <div className="detalle-body">
                    <div className="detalle-grid">
                      <div className="detalle-item">
                        <label>Cliente:</label>
                        <span>{modalDetalle.item.cliente}</span>
                      </div>
                      <div className="detalle-item">
                        <label>Producto:</label>
                        <span>{modalDetalle.item.producto}</span>
                      </div>
                      <div className="detalle-item">
                        <label>Cantidad:</label>
                        <span>📦 {modalDetalle.item.cantidad}</span>
                      </div>
                      <div className="detalle-item">
                        <label>Material:</label>
                        <span>{modalDetalle.item.material}</span>
                      </div>
                      <div className="detalle-item">
                        <label>Acabado:</label>
                        <span>{modalDetalle.item.acabado}</span>
                      </div>
                      <div className="detalle-item">
                        <label>Colores:</label>
                        <span>🎨 {modalDetalle.item.colores}</span>
                      </div>
                      <div className="detalle-item">
                        <label>Fecha:</label>
                        <span>📅 {modalDetalle.item.fecha}</span>
                      </div>
                      <div className="detalle-item">
                        <label>Hora:</label>
                        <span>⏰ {modalDetalle.item.hora}</span>
                      </div>
                      <div className="detalle-item">
                        <label>Tiempo estimado:</label>
                        <span>⏱️ {modalDetalle.item.tiempoEstimado}</span>
                      </div>
                    </div>

                    {(modalDetalle.item.loteV || modalDetalle.item.fechaCodigo) && (
                      <div className="detalle-codigo">
                        <h4>Información del código:</h4>
                        <div className="codigo-grid">
                          {modalDetalle.item.loteV && (
                            <div><strong>Lote V:</strong> {modalDetalle.item.loteV}</div>
                          )}
                          {modalDetalle.item.loteIF && (
                            <div><strong>Lote IF:</strong> {modalDetalle.item.loteIF}</div>
                          )}
                          {modalDetalle.item.prefijo && (
                            <div><strong>Prefijo:</strong> {modalDetalle.item.prefijo}</div>
                          )}
                          {modalDetalle.item.fechaCodigo && (
                            <div><strong>Fecha:</strong> {modalDetalle.item.fechaCodigo}</div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="detalle-extra">
                      <p><strong>Diseño:</strong> {modalDetalle.item.diseño}</p>
                      <p><strong>Observaciones:</strong> {modalDetalle.item.observaciones}</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Detalle de Producción */}
            {modalDetalle.tipo === 'produccion' && modalDetalle.item && (
              <>
                <h3>⚡ DETALLE DE PRODUCCIÓN</h3>
                <div className="detalle-produccion">
                  <div className="detalle-header">
                    <span className="codigo">{modalDetalle.item.codigo}</span>
                    <span className={`prioridad ${modalDetalle.item.prioridad.toLowerCase()}`}>
                      {modalDetalle.item.prioridad}
                    </span>
                  </div>

                  <div className="detalle-body">
                    <div className="detalle-grid">
                      <div className="detalle-item">
                        <label>Cliente:</label>
                        <span>{modalDetalle.item.cliente}</span>
                      </div>
                      <div className="detalle-item">
                        <label>Máquina:</label>
                        <span>🖨️ {modalDetalle.item.maquinaNombre}</span>
                      </div>
                      <div className="detalle-item">
                        <label>Operador:</label>
                        <span>👤 {modalDetalle.item.operador}</span>
                      </div>
                      <div className="detalle-item">
                        <label>Hora inicio:</label>
                        <span>⏰ {modalDetalle.item.horaInicio}</span>
                      </div>
                    </div>

                    <div className="progreso-detalle">
                      <h4>Progreso</h4>
                      <div className="progreso-barra-grande">
                        <div 
                          className="progreso-fill" 
                          style={{ width: `${modalDetalle.item.progreso}%` }}
                        />
                      </div>
                      <div className="cantidades-detalle">
                        <span>Procesado: {Math.round(modalDetalle.item.cantidadProcesada)}</span>
                        <span>Total: {modalDetalle.item.cantidad}</span>
                        <span>{modalDetalle.item.progreso}%</span>
                      </div>
                    </div>

                    <button 
                      className="btn-finalizar-modal"
                      onClick={() => {
                        setModalDetalle({ abierto: false, tipo: null, item: null });
                        setModalDetalle({ 
                          abierto: true, 
                          tipo: "confirmarFinalizar", 
                          item: modalDetalle.item 
                        });
                      }}
                    >
                      ✅ FINALIZAR LOTE
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Confirmar Finalizar */}
            {modalDetalle.tipo === 'confirmarFinalizar' && modalDetalle.item && (
              <>
                <h3>✅ CONFIRMAR FINALIZACIÓN</h3>
                <div className="confirmar-finalizar">
                  <p>¿Está seguro de finalizar el lote <strong>{modalDetalle.item.codigo}</strong>?</p>
                  
                  <div className="resumen">
                    <p>Cliente: {modalDetalle.item.cliente}</p>
                    <p>Progreso: {modalDetalle.item.progreso}%</p>
                    <p>Procesado: {Math.round(modalDetalle.item.cantidadProcesada)}/{modalDetalle.item.cantidad}</p>
                  </div>

                  <div className="modal-acciones">
                    <button 
                      className="btn-cancelar"
                      onClick={() => setModalDetalle({ abierto: false, tipo: null, item: null })}
                    >
                      NO, CANCELAR
                    </button>
                    <button 
                      className="btn-confirmar"
                      onClick={() => finalizarLote(modalDetalle.item)}
                    >
                      SÍ, FINALIZAR
                    </button>
                  </div>
                </div>
              </>
            )}

            <button 
              className="modal-cerrar"
              onClick={() => setModalDetalle({ abierto: false, tipo: null, item: null })}
            >
              ✕
            </button>
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

      {/* ===== ESTILOS ADICIONALES ===== */}
      <style>{`
        .connection-status {
          position: fixed;
          top: 10px;
          right: 10px;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 30px;
          font-size: 13px;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          backdrop-filter: blur(10px);
          animation: slideIn 0.3s ease;
        }
        
        .connection-status.connected {
          background: #10b981;
          color: white;
        }
        
        .connection-status.disconnected {
          background: #f59e0b;
          color: white;
        }
        
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 0 10px white;
          animation: pulse 2s infinite;
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

        .scanner-button {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border: none;
          padding: 0 24px;
          border-radius: 0 8px 8px 0;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          height: 50px;
        }

        .scanner-button:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }

        .shake {
          animation: shake 0.5s ease-in-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }

        .pop {
          animation: pop 0.3s ease-out;
        }

        @keyframes pop {
          0% { transform: scale(0.95); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        .animate-in {
          animation: fadeInUp 0.5s ease forwards;
          opacity: 0;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .pulse {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .scroll-to-top {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: var(--primary-500, #3b82f6);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          transition: all 0.3s ease;
          z-index: 1000;
          opacity: 0;
          visibility: hidden;
          transform: translateY(20px);
        }

        .scroll-to-top.visible {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .scroll-to-top:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
        }

        .dark-mode .scroll-to-top {
          background: #2563eb;
        }

        .formatos-aceptados {
          margin: 20px 0;
          text-align: center;
        }
        
        .formatos-titulo {
          display: block;
          font-size: 0.9rem;
          color: var(--text-muted, #6b7280);
          margin-bottom: 8px;
        }
        
        .formatos-lista {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
        }
        
        .formato-item {
          background: var(--bg-tertiary, #f3f4f6);
          padding: 4px 12px;
          border-radius: 20px;
          font-family: monospace;
          font-size: 0.8rem;
          color: var(--text-primary);
          border: 1px solid var(--border, #e5e7eb);
        }
        
        .lote-titulo {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .formato-badge-mini {
          padding: 2px 6px;
          border-radius: 12px;
          font-size: 0.6rem;
          font-weight: 600;
          color: white;
        }
        
        .formato-badge-mini.if {
          background: #3b82f6;
        }
        
        .formato-badge-mini.bv {
          background: #8b5cf6;
        }
        
        .formato-badge-mini.alt {
          background: #10b981;
        }
        
        .formato-badge-mini.num {
          background: #f59e0b;
        }
      `}</style>
    </div>
  );
};

export default PlotterLotes;