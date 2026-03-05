import React, { useState, useEffect, useRef, useCallback } from "react";
import "./MaquinasTiempoReal.css";

const MaquinasTiempoReal = () => {
  // ================ ESTADOS PRINCIPALES ================
  const [loteEscaneado, setLoteEscaneado] = useState("");
  const [loteActivo, setLoteActivo] = useState(null);
  const [lotesEnProduccion, setLotesEnProduccion] = useState([]);
  const [lotesFinalizados, setLotesFinalizados] = useState([]);
  const [historialCompleto, setHistorialCompleto] = useState([]);
  const [escaneando, setEscaneando] = useState(false);
  const [turnoActual, setTurnoActual] = useState("");
  const [notificaciones, setNotificaciones] = useState([]);
  const [busquedaMaquina, setBusquedaMaquina] = useState("");
  const [vistaActiva, setVistaActiva] = useState("produccion");
  const [filtroHistorial, setFiltroHistorial] = useState("todos");
  const [modalCrearLote, setModalCrearLote] = useState(false);
  const [modoOscuro, setModoOscuro] = useState(false);
  const [vistaCompacta, setVistaCompacta] = useState(false);
  const [maquinaSeleccionada, setMaquinaSeleccionada] = useState(null);
  const [nuevoLoteForm, setNuevoLoteForm] = useState({
    codigo: "",
    cliente: "",
    producto: "",
    cantidadTotal: 0,
    prioridad: "Media",
    area: "Sublimado"
  });

  // Estadísticas en tiempo real
  const [estadisticas, setEstadisticas] = useState({
    lotesActivos: 0,
    lotesCompletados: 0,
    piezasProcesadas: 0,
    piezasTotales: 0,
    eficienciaGlobal: 0,
    tiempoPromedio: "00:00:00",
    piezasPorHora: 0,
    productividad: 0,
    lotesRetrasados: 0,
    tiempoReal: new Date().toLocaleTimeString()
  });

  const inputRef = useRef(null);
  const intervalRef = useRef(null);

  // ================ DETECTAR TURNO ================
  useEffect(() => {
    const hora = new Date().getHours();
    if (hora >= 6 && hora < 14) {
      setTurnoActual("🌅 MATUTINO");
    } else if (hora >= 14 && hora < 22) {
      setTurnoActual("☀️ VESPERTINO");
    } else {
      setTurnoActual("🌙 NOCTURNO");
    }
  }, []);

  // ================ MÁQUINAS PREMIUM CON HISTORIAL ================
  const [maquinas, setMaquinas] = useState([
    {
      id: "plot-001",
      nombre: "Sublimado 3",
      icono: "🖨️",
      tipo: "Impresión",
      estado: "disponible",
      temperatura: 85,
      eficiencia: 92,
      color: "#10b981",
      colorSecundario: "#34d399",
      loteActual: null,
      velocidad: 1800,
      operador: "Carlos R.",
      ultimoMantenimiento: "2026-02-15",
      produccionHoy: 1245,
      historial: [] // Array para guardar lotes procesados
    },
    {
      id: "sub-001",
      nombre: "SUBLIMADORA 1",
      icono: "🎨",
      tipo: "Sublimado",
      estado: "disponible",
      temperatura: 92,
      eficiencia: 88,
      color: "#f97316",
      colorSecundario: "#fb923c",
      loteActual: null,
      velocidad: 2100,
      operador: "María G.",
      ultimoMantenimiento: "2026-02-10",
      produccionHoy: 2341,
      historial: []
    },
    {
      id: "cor-001",
      nombre: "Sublimado 2",
      icono: "🎨",
      tipo: "Sublimado",
      estado: "disponible",
      temperatura: 0,
      eficiencia: 95,
      color: "#3b82f6",
      colorSecundario: "#60a5fa",
      loteActual: null,
      velocidad: 1500,
      operador: "Juan P.",
      ultimoMantenimiento: "2026-02-18",
      produccionHoy: 876,
      historial: []
    }
  ]);

  // ================ LOTES DB PREMIUM ================
  const [lotesDB, setLotesDB] = useState([
    {
      id: "LOTE-001",
      codigo: "NK-137",
      cliente: "NIKE SPORTSWEAR",
      clienteIcono: "👟",
      producto: "CAMISETA DRI-FIT",
      cantidadTotal: 1500,
      cantidadProcesada: 0,
      prioridad: "ALTA",
      estado: "pendiente",
      area: "Sublimado",
      operador: "Carlos",
      eficiencia: 0,
      escaneos: 0,
      fechaCreacion: "2026-02-27",
      horaCreacion: "08:30"
    },
    {
      id: "LOTE-002",
      codigo: "NK-79",
      cliente: "NIKE RUNNING",
      clienteIcono: "🏃",
      producto: "SHORT DEPORTIVO",
      cantidadTotal: 600,
      cantidadProcesada: 0,
      prioridad: "MEDIA",
      estado: "pendiente",
      area: "Sublimado",
      operador: "María",
      eficiencia: 0,
      escaneos: 0,
      fechaCreacion: "2026-02-27",
      horaCreacion: "09:15"
    },
    {
      id: "LOTE-003",
      codigo: "NK-1002",
      cliente: "NIKE SB",
      clienteIcono: "🛹",
      producto: "Run",
      cantidadTotal: 1502,
      cantidadProcesada: 0,
      prioridad: "MEDIA",
      estado: "pendiente",
      area: "Sublimado",
      operador: "Juan",
      eficiencia: 0,
      escaneos: 0,
      fechaCreacion: "2026-02-27",
      horaCreacion: "10:00"
    },
    {
      id: "LOTE-004",
      codigo: "NK-73",
      cliente: "NIKE ACG",
      clienteIcono: "🏔️",
      producto: "CHAQUETA",
      cantidadTotal: 280,
      cantidadProcesada: 0,
      prioridad: "BAJA",
      estado: "pendiente",
      area: "Sublimado",
      operador: "Ana",
      eficiencia: 0,
      escaneos: 0,
      fechaCreacion: "2026-02-27",
      horaCreacion: "11:30"
    }
  ]);

  // ================ ENFOCAR INPUT ================
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // ================ ACTUALIZACIÓN EN TIEMPO REAL (100ms) ================
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      actualizarProduccion();
      actualizarEstadisticas();
      setEstadisticas(prev => ({
        ...prev,
        tiempoReal: new Date().toLocaleTimeString()
      }));
    }, 100);

    return () => clearInterval(intervalRef.current);
  }, [lotesEnProduccion]);

  // ================ ACTUALIZAR PRODUCCIÓN ================
  const actualizarProduccion = useCallback(() => {
    setLotesEnProduccion(prev => 
      prev.map(lote => {
        if (lote.estado !== "en_produccion" || !lote.maquinaId) return lote;
        
        const variacion = 0.9 + (Math.random() * 0.2);
        const incremento = (lote.velocidadProduccion || 5) * variacion;
        
        const nuevaCantidad = Math.min(
          lote.cantidadProcesada + incremento,
          lote.cantidadTotal
        );
        
        const tiempoTranscurrido = Math.floor((new Date() - new Date(lote.horaInicio)) / 1000);
        const horas = Math.floor(tiempoTranscurrido / 3600);
        const minutos = Math.floor((tiempoTranscurrido % 3600) / 60);
        const segundos = tiempoTranscurrido % 60;
        
        const progreso = (nuevaCantidad / lote.cantidadTotal) * 100;
        
        const piezasPorHora = tiempoTranscurrido > 0 
          ? Math.round((nuevaCantidad / tiempoTranscurrido) * 3600)
          : 0;

        return {
          ...lote,
          cantidadProcesada: nuevaCantidad,
          tiempoActual: `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`,
          progreso: progreso.toFixed(1),
          piezasPorHora
        };
      })
    );
  }, []);

  // ================ ACTUALIZAR ESTADÍSTICAS ================
  const actualizarEstadisticas = useCallback(() => {
    const totalPiezas = lotesEnProduccion.reduce((acc, l) => acc + l.cantidadProcesada, 0);
    const totalPiezasFinalizadas = lotesFinalizados.reduce((acc, l) => acc + l.cantidadProcesada, 0);
    const piezasPorHora = lotesEnProduccion.reduce((acc, l) => acc + (l.piezasPorHora || 0), 0);
    
    setEstadisticas(prev => ({
      ...prev,
      lotesActivos: lotesEnProduccion.length,
      lotesCompletados: lotesFinalizados.length,
      piezasProcesadas: Math.round(totalPiezas + totalPiezasFinalizadas),
      piezasTotales: lotesDB.reduce((acc, l) => acc + l.cantidadTotal, 0),
      piezasPorHora: Math.round(piezasPorHora)
    }));
  }, [lotesEnProduccion, lotesFinalizados, lotesDB]);

  // ================ PROCESAR ESCANEO - DOBLE FUNCIÓN CORREGIDA ================
  const procesarEscaneo = (codigo) => {
    if (!codigo || codigo.trim() === "") {
      agregarNotificacion("⚠️ Ingrese un código válido", "warning");
      return;
    }

    const codigoLimpio = codigo.trim().toUpperCase();

    // 1️⃣ SI YA ESTÁ EN PRODUCCIÓN → SEGUNDO ESCANEO: FINALIZAR
    const loteEnProduccion = lotesEnProduccion.find(l => l.codigo === codigoLimpio);
    
    if (loteEnProduccion) {
      finalizarLote(loteEnProduccion.idProduccion);
      setLoteEscaneado("");
      setTimeout(() => inputRef.current?.focus(), 100);
      return;
    }

    // 2️⃣ SI ESTÁ PENDIENTE → PRIMER ESCANEO: INICIAR
    const lotePendiente = lotesDB.find(l => l.codigo === codigoLimpio && l.estado === "pendiente");
    
    if (lotePendiente) {
      iniciarNuevoLote(lotePendiente);
      setLoteEscaneado("");
      setTimeout(() => inputRef.current?.focus(), 100);
      return;
    }

    // 3️⃣ SI YA FUE FINALIZADO → MOSTRAR DETALLE
    const loteFinalizado = lotesFinalizados.find(l => l.codigo === codigoLimpio);
    
    if (loteFinalizado) {
      setLoteActivo(loteFinalizado);
      setEscaneando(true);
      agregarNotificacion(`📋 Mostrando detalle de ${codigoLimpio}`, "info");
      setLoteEscaneado("");
      setTimeout(() => inputRef.current?.focus(), 100);
      return;
    }

    // 4️⃣ NO EXISTE
    agregarNotificacion(`❌ Lote ${codigoLimpio} no encontrado`, "error");
    setLoteEscaneado("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // ================ INICIAR NUEVO LOTE ================
  const iniciarNuevoLote = (lote) => {
    const maquinasDisponibles = maquinas.filter(m => m.estado === "disponible");
    
    const nuevoLoteProduccion = {
      ...lote,
      idProduccion: `PROD-${Date.now()}`,
      horaInicio: new Date(),
      horaInicioStr: new Date().toLocaleTimeString(),
      turno: turnoActual,
      maquinaId: null,
      maquinaAsignada: null,
      tiempoActual: "00:00:00",
      progreso: "0.0",
      cantidadProcesada: 0,
      piezasPorHora: 0,
      escaneos: 1,
      estado: "en_produccion",
      velocidadProduccion: 5,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`
    };
    
    setLotesEnProduccion(prev => [...prev, nuevoLoteProduccion]);
    setLoteActivo(nuevoLoteProduccion);
    setEscaneando(true);
    
    setLotesDB(prev =>
      prev.map(l =>
        l.codigo === lote.codigo
          ? { ...l, estado: "en_produccion" }
          : l
      )
    );

    setHistorialCompleto(prev => [{
      id: Date.now(),
      tipo: "INICIO_LOTE",
      lote: lote.codigo,
      timestamp: new Date().toLocaleString()
    }, ...prev]);

    agregarNotificacion(`🚀 Lote ${lote.codigo} iniciado`, "success");
    
    if (maquinasDisponibles.length > 0) {
      setTimeout(() => {
        agregarNotificacion(`💡 Hay ${maquinasDisponibles.length} máquina(s) disponible(s)`, "info");
      }, 1500);
    }
  };

  // ================ FINALIZAR LOTE - CORREGIDO (SIN PANTALLAZO) ================
  const finalizarLote = (loteId) => {
    const lote = lotesEnProduccion.find(l => l.idProduccion === loteId);
    if (!lote) return;

    const cantidadFinal = Math.round(lote.cantidadProcesada);
    const eficiencia = ((cantidadFinal / lote.cantidadTotal) * 100).toFixed(1);

    const loteFinalizado = {
      ...lote,
      cantidadProcesada: cantidadFinal,
      horaFin: new Date().toLocaleTimeString(),
      tiempoTotal: lote.tiempoActual,
      eficienciaFinal: eficiencia,
      estado: "finalizado"
    };

    // Si tenía máquina asignada, guardar en su historial
    if (lote.maquinaId) {
      setMaquinas(prev =>
        prev.map(m => {
          if (m.id === lote.maquinaId) {
            const nuevoHistorial = [
              ...m.historial,
              {
                lote: lote.codigo,
                cliente: lote.cliente,
                cantidad: cantidadFinal,
                total: lote.cantidadTotal,
                eficiencia: eficiencia,
                tiempo: lote.tiempoActual,
                fecha: new Date().toLocaleString()
              }
            ];
            return {
              ...m,
              estado: "disponible",
              loteActual: null,
              produccionHoy: m.produccionHoy + cantidadFinal,
              historial: nuevoHistorial
            };
          }
          return m;
        })
      );
    }

    setLotesFinalizados(prev => [loteFinalizado, ...prev]);
    setLotesEnProduccion(prev => prev.filter(l => l.idProduccion !== loteId));

    setHistorialCompleto(prev => [{
      id: Date.now(),
      tipo: "FINALIZACION",
      lote: lote.codigo,
      timestamp: new Date().toLocaleString()
    }, ...prev]);

    // MOSTRAR DETALLE AUTOMÁTICAMENTE
    setLoteActivo(loteFinalizado);
    setEscaneando(true);

    agregarNotificacion(`🎉 Lote ${lote.codigo} finalizado - ${eficiencia}%`, "success");
  };

  // ================ ASIGNAR MÁQUINA ================
  const asignarMaquina = (loteId, maquinaId, event) => {
    if (event) event.stopPropagation();
    
    const maquina = maquinas.find(m => m.id === maquinaId);
    const lote = lotesEnProduccion.find(l => l.idProduccion === loteId);
    
    if (!maquina || maquina.estado !== "disponible" || !lote) {
      agregarNotificacion(`❌ No se puede asignar la máquina`, "error");
      return;
    }

    setLotesEnProduccion(prev =>
      prev.map(l =>
        l.idProduccion === loteId
          ? {
              ...l,
              maquinaId: maquinaId,
              maquinaAsignada: maquina.nombre,
              operadorAsignado: maquina.operador,
              velocidadProduccion: maquina.velocidad / 360,
              color: maquina.color
            }
          : l
      )
    );

    setMaquinas(prev =>
      prev.map(m =>
        m.id === maquinaId
          ? { ...m, estado: "ocupada", loteActual: loteId }
          : m
      )
    );

    agregarNotificacion(`⚡ Máquina ${maquina.nombre} asignada`, "success");
  };

  // ================ VER HISTORIAL DE MÁQUINA ================
  const verHistorialMaquina = (maquina) => {
    setMaquinaSeleccionada(maquina);
  };

  // ================ GENERAR LOTE ALEATORIO ================
  const generarLoteAleatorio = () => {
    const clientes = ["NIKE", "ADIDAS", "PUMA", "UNDER ARMOUR", "THE NORTH FACE"];
    const productos = ["CAMISETA", "PANTALÓN", "SHORT", "GORRA", "CHAQUETA", "SUDADERA"];
    const areas = ["Sublimado", "Costura", "Corte", "Empaque", "Bordado"];
    const prioridades = ["ALTA", "MEDIA", "BAJA"];
    const iconos = ["👟", "🏃", "⚽", "🎽", "🧥"];
    
    const codigo = `NK-${Math.floor(Math.random() * 9000 + 1000)}`;
    const clienteIndex = Math.floor(Math.random() * clientes.length);
    
    const nuevoLote = {
      id: `LOTE-${Date.now()}`,
      codigo: codigo,
      cliente: clientes[clienteIndex],
      clienteIcono: iconos[clienteIndex % iconos.length],
      producto: productos[Math.floor(Math.random() * productos.length)],
      cantidadTotal: Math.floor(Math.random() * 2000) + 500,
      cantidadProcesada: 0,
      prioridad: prioridades[Math.floor(Math.random() * prioridades.length)],
      estado: "pendiente",
      area: areas[Math.floor(Math.random() * areas.length)],
      operador: "Pendiente",
      eficiencia: 0,
      escaneos: 0,
      fechaCreacion: new Date().toLocaleDateString(),
      horaCreacion: new Date().toLocaleTimeString()
    };
    
    setLotesDB(prev => [nuevoLote, ...prev]);
    agregarNotificacion(`✨ Lote ${codigo} generado`, "success");
  };

  // ================ CREAR LOTE PERSONALIZADO ================
  const crearLotePersonalizado = () => {
    if (!nuevoLoteForm.codigo || nuevoLoteForm.cantidadTotal <= 0) {
      agregarNotificacion("❌ Complete todos los campos", "error");
      return;
    }

    const nuevoLote = {
      id: `LOTE-${Date.now()}`,
      ...nuevoLoteForm,
      codigo: nuevoLoteForm.codigo.toUpperCase(),
      clienteIcono: "📦",
      cantidadProcesada: 0,
      estado: "pendiente",
      operador: "Pendiente",
      eficiencia: 0,
      escaneos: 0,
      fechaCreacion: new Date().toLocaleDateString(),
      horaCreacion: new Date().toLocaleTimeString()
    };

    setLotesDB(prev => [nuevoLote, ...prev]);
    setModalCrearLote(false);
    setNuevoLoteForm({
      codigo: "",
      cliente: "",
      producto: "",
      cantidadTotal: 0,
      prioridad: "Media",
      area: "Sublimado"
    });
    agregarNotificacion(`✅ Lote ${nuevoLote.codigo} creado`, "success");
  };

  // ================ AGREGAR NOTIFICACIÓN ================
  const agregarNotificacion = (mensaje, tipo) => {
    const id = Date.now();
    setNotificaciones(prev => [...prev, { id, mensaje, tipo }]);
    setTimeout(() => {
      setNotificaciones(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  // ================ HANDLE KEY PRESS ================
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      procesarEscaneo(loteEscaneado.trim());
    }
  };

  // ================ CERRAR MODAL DETALLE ================
  const cerrarDetalle = () => {
    setEscaneando(false);
    setLoteActivo(null);
    setMaquinaSeleccionada(null);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  return (
    <div className={`sistema-produccion-container ${modoOscuro ? 'dark-mode' : ''} ${vistaCompacta ? 'vista-compacta' : ''}`}>
      
      {/* Panel de Control Rápido */}
      <div className="control-panel">
        <button className={`control-btn ${modoOscuro ? 'active' : ''}`} onClick={() => setModoOscuro(!modoOscuro)}>
          {modoOscuro ? '☀️' : '🌙'}
        </button>
        <button className={`control-btn ${vistaCompacta ? 'active' : ''}`} onClick={() => setVistaCompacta(!vistaCompacta)}>
          {vistaCompacta ? '🔍' : '👁️'}
        </button>
        <button className="control-btn" onClick={() => setVistaActiva('produccion')}>⚡</button>
        <button className="control-btn" onClick={() => setVistaActiva('historial')}>📜</button>
        <button className="control-btn" onClick={() => setVistaActiva('estadisticas')}>📊</button>
      </div>

      {/* Notificaciones */}
      <div className="notificaciones-premium">
        {notificaciones.map(n => (
          <div key={n.id} className={`notificacion-premium ${n.tipo}`}>
            <span className="notificacion-icono">
              {n.tipo === 'success' && '✅'}
              {n.tipo === 'error' && '❌'}
              {n.tipo === 'warning' && '⚠️'}
              {n.tipo === 'info' && 'ℹ️'}
            </span>
            <span className="notificacion-texto">{n.mensaje}</span>
          </div>
        ))}
      </div>

      {/* Modal Crear Lote */}
      {modalCrearLote && (
        <div className="modal-premium" onClick={() => setModalCrearLote(false)}>
          <div className="modal-contenido-premium" onClick={e => e.stopPropagation()}>
            <h2>✨ CREAR NUEVO LOTE</h2>
            <input
              type="text"
              placeholder="Código"
              value={nuevoLoteForm.codigo}
              onChange={(e) => setNuevoLoteForm({...nuevoLoteForm, codigo: e.target.value.toUpperCase()})}
            />
            <input
              type="text"
              placeholder="Cliente"
              value={nuevoLoteForm.cliente}
              onChange={(e) => setNuevoLoteForm({...nuevoLoteForm, cliente: e.target.value})}
            />
            <input
              type="text"
              placeholder="Producto"
              value={nuevoLoteForm.producto}
              onChange={(e) => setNuevoLoteForm({...nuevoLoteForm, producto: e.target.value})}
            />
            <input
              type="number"
              placeholder="Cantidad"
              value={nuevoLoteForm.cantidadTotal}
              onChange={(e) => setNuevoLoteForm({...nuevoLoteForm, cantidadTotal: parseInt(e.target.value) || 0})}
            />
            <select
              value={nuevoLoteForm.prioridad}
              onChange={(e) => setNuevoLoteForm({...nuevoLoteForm, prioridad: e.target.value})}
            >
              <option value="ALTA">🔴 ALTA</option>
              <option value="MEDIA">🟡 MEDIA</option>
              <option value="BAJA">🟢 BAJA</option>
            </select>
            <div className="modal-buttons">
              <button onClick={() => setModalCrearLote(false)}>CANCELAR</button>
              <button onClick={crearLotePersonalizado}>CREAR</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="header-premium">
        <h1>⚡ CONTROL DE PRODUCCIÓN - DOBLE ESCANEO</h1>
        <div className="header-info">
          <span>{turnoActual}</span>
          <span>{estadisticas.tiempoReal}</span>
        </div>
      </div>

      {/* Scanner */}
      <div className="scanner-premium">
        <h2>📷 ESCANEAR CÓDIGO DE LOTE</h2>
        <div className="scanner-input-group">
          <input
            ref={inputRef}
            type="text"
            value={loteEscaneado}
            onChange={(e) => setLoteEscaneado(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            placeholder="EJ: NK-137"
          />
          <button onClick={() => procesarEscaneo(loteEscaneado)}>
            PROCESAR
          </button>
        </div>
        <div className="scanner-badges">
          <span className="badge primero">🔵 1er ESCANEO = INICIAR</span>
          <span className="badge segundo">🟢 2do ESCANEO = FINALIZAR</span>
        </div>
        <div className="scanner-actions">
          <button onClick={generarLoteAleatorio}>🎲 GENERAR ALEATORIO</button>
          <button onClick={() => setModalCrearLote(true)}>➕ CREAR PERSONALIZADO</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-rapidas">
        <div className="stat-card">
          <span className="stat-valor">{lotesDB.length}</span>
          <span>LOTES TOTALES</span>
        </div>
        <div className="stat-card">
          <span className="stat-valor">{lotesEnProduccion.length}</span>
          <span>EN PRODUCCIÓN</span>
        </div>
        <div className="stat-card">
          <span className="stat-valor">{lotesFinalizados.length}</span>
          <span>FINALIZADOS</span>
        </div>
        <div className="stat-card">
          <span className="stat-valor">{estadisticas.piezasPorHora}</span>
          <span>PZ/HORA</span>
        </div>
      </div>

      {/* Producción */}
      <h3>⚡ PRODUCCIÓN EN TIEMPO REAL</h3>
      <div className="lotes-grid">
        {lotesEnProduccion.map(lote => (
          <div key={lote.idProduccion} className="lote-card">
            <div className="lote-header">
              <span className="lote-codigo">{lote.codigo}</span>
              <span className={`lote-prioridad ${lote.prioridad?.toLowerCase()}`}>
                {lote.prioridad}
              </span>
            </div>
            
            <div className="lote-cliente">{lote.cliente}</div>
            
            <div className="progreso">
              <div className="progreso-header">
                <span>PROGRESO</span>
                <span>{lote.progreso}%</span>
              </div>
              <div className="progreso-barra">
                <div className="progreso-fill" style={{ width: `${lote.progreso}%` }}></div>
              </div>
            </div>

            <div className="lote-footer">
              <span>{Math.round(lote.cantidadProcesada)}/{lote.cantidadTotal}</span>
              <span>{lote.tiempoActual}</span>
              <span>{lote.piezasPorHora} pz/h</span>
            </div>

            {!lote.maquinaId ? (
              <select 
                className="maquina-selector"
                onChange={(e) => asignarMaquina(lote.idProduccion, e.target.value, e)}
                onClick={(e) => e.stopPropagation()}
                defaultValue=""
              >
                <option value="" disabled>⚡ ASIGNAR MÁQUINA</option>
                {maquinas.filter(m => m.estado === "disponible").map(m => (
                  <option key={m.id} value={m.id}>{m.icono} {m.nombre}</option>
                ))}
              </select>
            ) : (
              <div className="maquina-asignada">
                ⚙️ {lote.maquinaAsignada}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Máquinas con Historial */}
      <h3>🖨️ MÁQUINAS</h3>
      <div className="maquinas-grid">
        {maquinas.map(maquina => (
          <div 
            key={maquina.id} 
            className={`maquina-card ${maquina.estado}`}
            onClick={() => verHistorialMaquina(maquina)}
            style={{ cursor: 'pointer' }}
          >
            <div className="maquina-header">
              <span>{maquina.icono} {maquina.nombre}</span>
              <span>{maquina.estado === 'disponible' ? '✅' : '⚡'}</span>
            </div>
            <div className="maquina-stats">
              <span>🌡️ {maquina.temperatura}°C</span>
              <span>⚡ {maquina.velocidad} pz/h</span>
            </div>
            {maquina.loteActual && (
              <div className="maquina-lote">
                Lote: {lotesEnProduccion.find(l => l.idProduccion === maquina.loteActual)?.codigo}
              </div>
            )}
            {maquina.historial.length > 0 && (
              <div className="maquina-historial">
                📋 {maquina.historial.length} lotes procesados
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Finalizados */}
      {lotesFinalizados.length > 0 && (
        <>
          <h3>✅ ÚLTIMOS LOTES FINALIZADOS</h3>
          <div className="finalizados-grid">
            {lotesFinalizados.slice(0, 4).map(lote => (
              <div 
                key={lote.idProduccion} 
                className="finalizado-card"
                onClick={() => {
                  setLoteActivo(lote);
                  setEscaneando(true);
                }}
              >
                <div className="finalizado-header">
                  <span>{lote.codigo}</span>
                  <span className={`eficiencia ${parseFloat(lote.eficienciaFinal) > 90 ? 'alta' : 'media'}`}>
                    {lote.eficienciaFinal}%
                  </span>
                </div>
                <div className="finalizado-body">
                  <span>{lote.cantidadProcesada}/{lote.cantidadTotal}</span>
                  <span>⏱️ {lote.tiempoTotal}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal de Detalle (Lote o Historial de Máquina) */}
      {(escaneando && loteActivo) || maquinaSeleccionada ? (
        <div className="modal-detalle-premium" onClick={cerrarDetalle}>
          <div className="detalle-contenido-premium" onClick={e => e.stopPropagation()}>
            
            {/* DETALLE DE LOTE */}
            {loteActivo && (
              <>
                <div className="detalle-header">
                  <h2>
                    {loteActivo.estado === 'finalizado' ? '✅ LOTE FINALIZADO' : '⚡ LOTE EN PRODUCCIÓN'}
                  </h2>
                  <button className="detalle-close" onClick={cerrarDetalle}>✕</button>
                </div>

                <div className="detalle-codigo">
                  <span className="codigo-label">CÓDIGO</span>
                  <span className="codigo-valor">{loteActivo.codigo}</span>
                </div>

                <div className="detalle-grid">
                  <div className="detalle-info">
                    <p><strong>Cliente:</strong> {loteActivo.cliente}</p>
                    <p><strong>Producto:</strong> {loteActivo.producto}</p>
                    <p><strong>Área:</strong> {loteActivo.area}</p>
                    <p><strong>Prioridad:</strong> {loteActivo.prioridad}</p>
                    {loteActivo.maquinaAsignada && (
                      <p><strong>Máquina:</strong> {loteActivo.maquinaAsignada}</p>
                    )}
                  </div>

                  <div className="detalle-progreso">
                    <div className="progreso-circular">
                      <svg viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#e0e0e0" strokeWidth="8"/>
                        <circle 
                          cx="50" cy="50" r="45" 
                          fill="none" 
                          stroke="#4361ee" 
                          strokeWidth="8"
                          strokeDasharray={`${parseFloat(loteActivo.progreso || 0) * 2.83}, 283`}
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                      <span className="progreso-porcentaje">{loteActivo.progreso || 0}%</span>
                    </div>
                    <p>{Math.round(loteActivo.cantidadProcesada)}/{loteActivo.cantidadTotal} piezas</p>
                  </div>

                  <div className="detalle-metricas">
                    <p><strong>Tiempo:</strong> {loteActivo.tiempoActual || '00:00:00'}</p>
                    <p><strong>Ritmo:</strong> {loteActivo.piezasPorHora || 0} pz/h</p>
                    <p><strong>Eficiencia:</strong> {loteActivo.eficienciaFinal || loteActivo.eficiencia || 0}%</p>
                  </div>
                </div>
              </>
            )}

            {/* HISTORIAL DE MÁQUINA */}
            {maquinaSeleccionada && !loteActivo && (
              <>
                <div className="detalle-header">
                  <h2>📋 HISTORIAL DE {maquinaSeleccionada.nombre}</h2>
                  <button className="detalle-close" onClick={cerrarDetalle}>✕</button>
                </div>

                <div className="historial-lista">
                  {maquinaSeleccionada.historial.length > 0 ? (
                    maquinaSeleccionada.historial.map((item, index) => (
                      <div key={index} className="historial-item">
                        <span className="historial-lote">{item.lote}</span>
                        <span>{item.cliente}</span>
                        <span>{item.cantidad}/{item.total} pz</span>
                        <span className={`eficiencia-badge ${
                          parseFloat(item.eficiencia) > 90 ? 'alta' : 
                          parseFloat(item.eficiencia) > 70 ? 'media' : 'baja'
                        }`}>{item.eficiencia}%</span>
                        <span className="historial-tiempo">⏱️ {item.tiempo}</span>
                      </div>
                    ))
                  ) : (
                    <p className="sin-historial">Esta máquina no tiene historial aún</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MaquinasTiempoReal;