// src/pages/PlotterLotes.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import "./PlotterLotes.css";

const PlotterLotes = () => {
  // ================ CONFIGURACIÓN DE 17 MÁQUINAS PLOTTER ================
  const [maquinas, setMaquinas] = useState([
    // PLOTTERS DE ALTA VELOCIDAD (1-6)
    { id: "plt-001", nombre: "PLOTTER HP-01", icono: "🖨️", tipo: "HP Latex", velocidad: 2200, estado: "disponible", temperatura: 42, tinta: 87, loteActual: null, operador: "Carlos R.", eficiencia: 98, ultimoMantenimiento: "2026-02-20", produccionHoy: 1245, historial: [], color: "#4361ee" },
    { id: "plt-002", nombre: "PLOTTER HP-02", icono: "🖨️", tipo: "HP Latex", velocidad: 2200, estado: "produciendo", temperatura: 45, tinta: 62, loteActual: "L2402-089", operador: "María G.", eficiencia: 95, ultimoMantenimiento: "2026-02-18", produccionHoy: 2134, historial: [], color: "#3a0ca3" },
    { id: "plt-003", nombre: "PLOTTER HP-03", icono: "🖨️", tipo: "HP Latex", velocidad: 2200, estado: "disponible", temperatura: 38, tinta: 94, loteActual: null, operador: "Juan P.", eficiencia: 97, ultimoMantenimiento: "2026-02-22", produccionHoy: 1876, historial: [], color: "#4cc9f0" },
    { id: "plt-004", nombre: "PLOTTER HP-04", icono: "🖨️", tipo: "HP Latex", velocidad: 2200, estado: "mantenimiento", temperatura: 0, tinta: 0, loteActual: null, operador: "Técnico", eficiencia: 0, ultimoMantenimiento: "2026-02-15", produccionHoy: 0, historial: [], color: "#f72585" },
    { id: "plt-005", nombre: "PLOTTER HP-05", icono: "🖨️", tipo: "HP Latex", velocidad: 2200, estado: "produciendo", temperatura: 41, tinta: 45, loteActual: "L2402-092", operador: "Ana L.", eficiencia: 96, ultimoMantenimiento: "2026-02-19", produccionHoy: 1567, historial: [], color: "#4895ef" },
    { id: "plt-006", nombre: "PLOTTER HP-06", icono: "🖨️", tipo: "HP Latex", velocidad: 2200, estado: "disponible", temperatura: 37, tinta: 78, loteActual: null, operador: "Pedro M.", eficiencia: 94, ultimoMantenimiento: "2026-02-21", produccionHoy: 987, historial: [], color: "#560bad" },
    
    // PLOTTERS DE CORTE (7-12)
    { id: "plt-007", nombre: "CUTTER-01", icono: "✂️", tipo: "Corte", velocidad: 1800, estado: "produciendo", temperatura: 35, tinta: 0, loteActual: "L2402-095", operador: "Luisa F.", eficiencia: 92, ultimoMantenimiento: "2026-02-17", produccionHoy: 2341, historial: [], color: "#f94144" },
    { id: "plt-008", nombre: "CUTTER-02", icono: "✂️", tipo: "Corte", velocidad: 1800, estado: "disponible", temperatura: 34, tinta: 0, loteActual: null, operador: "Roberto C.", eficiencia: 93, ultimoMantenimiento: "2026-02-23", produccionHoy: 1432, historial: [], color: "#f3722c" },
    { id: "plt-009", nombre: "CUTTER-03", icono: "✂️", tipo: "Corte", velocidad: 1800, estado: "averiada", temperatura: 52, tinta: 0, loteActual: "L2402-078", operador: "Jorge N.", eficiencia: 0, ultimoMantenimiento: "2026-02-10", produccionHoy: 567, historial: [], color: "#f8961e" },
    { id: "plt-010", nombre: "CUTTER-04", icono: "✂️", tipo: "Corte", velocidad: 1800, estado: "produciendo", temperatura: 36, tinta: 0, loteActual: "L2402-096", operador: "Sofia R.", eficiencia: 91, ultimoMantenimiento: "2026-02-20", produccionHoy: 1876, historial: [], color: "#f9844a" },
    { id: "plt-011", nombre: "CUTTER-05", icono: "✂️", tipo: "Corte", velocidad: 1800, estado: "disponible", temperatura: 33, tinta: 0, loteActual: null, operador: "Diego S.", eficiencia: 95, ultimoMantenimiento: "2026-02-22", produccionHoy: 1098, historial: [], color: "#f9c74f" },
    { id: "plt-012", nombre: "CUTTER-06", icono: "✂️", tipo: "Corte", velocidad: 1800, estado: "produciendo", temperatura: 37, tinta: 0, loteActual: "L2402-082", operador: "Elena T.", eficiencia: 90, ultimoMantenimiento: "2026-02-19", produccionHoy: 1654, historial: [], color: "#f9844a" },
    
    // PLOTTERS GRANDES FORMATOS (13-17)
    { id: "plt-013", nombre: "GRAN FORMATO-01", icono: "🖼️", tipo: "Gran Formato", velocidad: 1500, estado: "produciendo", temperatura: 44, tinta: 56, loteActual: "L2402-091", operador: "Oscar M.", eficiencia: 89, ultimoMantenimiento: "2026-02-18", produccionHoy: 2345, historial: [], color: "#90be6d" },
    { id: "plt-014", nombre: "GRAN FORMATO-02", icono: "🖼️", tipo: "Gran Formato", velocidad: 1500, estado: "disponible", temperatura: 39, tinta: 72, loteActual: null, operador: "Lucia G.", eficiencia: 92, ultimoMantenimiento: "2026-02-24", produccionHoy: 1432, historial: [], color: "#43aa8b" },
    { id: "plt-015", nombre: "GRAN FORMATO-03", icono: "🖼️", tipo: "Gran Formato", velocidad: 1500, estado: "produciendo", temperatura: 42, tinta: 38, loteActual: "L2402-097", operador: "Marta P.", eficiencia: 88, ultimoMantenimiento: "2026-02-16", produccionHoy: 1765, historial: [], color: "#4d908e" },
    { id: "plt-016", nombre: "GRAN FORMATO-04", icono: "🖼️", tipo: "Gran Formato", velocidad: 1500, estado: "mantenimiento", temperatura: 0, tinta: 0, loteActual: null, operador: "Técnico", eficiencia: 0, ultimoMantenimiento: "2026-02-12", produccionHoy: 0, historial: [], color: "#577590" },
    { id: "plt-017", nombre: "GRAN FORMATO-05", icono: "🖼️", tipo: "Gran Formato", velocidad: 1500, estado: "disponible", temperatura: 38, tinta: 81, loteActual: null, operador: "Andres V.", eficiencia: 93, ultimoMantenimiento: "2026-02-21", produccionHoy: 1254, historial: [], color: "#277da1" },
  ]);

  // ================ LOTES PENDIENTES ================
  const [lotesPendientes, setLotesPendientes] = useState([
    { id: "L2402-089", codigo: "NK-2024-01", cliente: "NIKE", producto: "LONA IMPRESA 3x2m", cantidad: 450, prioridad: "ALTA", fecha: "2026-03-04", color: "#f94144" },
    { id: "L2402-090", codigo: "AD-2024-05", cliente: "ADIDAS", producto: "VINILO TEXTIL 50m", cantidad: 280, prioridad: "MEDIA", fecha: "2026-03-04", color: "#f3722c" },
    { id: "L2402-091", codigo: "NK-2024-12", cliente: "NIKE", producto: "PAPEL SUBLIMACIÓN", cantidad: 600, prioridad: "ALTA", fecha: "2026-03-03", color: "#f8961e" },
    { id: "L2402-092", codigo: "PU-2024-03", cliente: "PUMA", producto: "LONA BACKLIT", cantidad: 320, prioridad: "BAJA", fecha: "2026-03-04", color: "#f9c74f" },
    { id: "L2402-093", codigo: "NK-2024-18", cliente: "NIKE", producto: "VINILO ADHESIVO", cantidad: 550, prioridad: "MEDIA", fecha: "2026-03-03", color: "#90be6d" },
    { id: "L2402-094", codigo: "UA-2024-02", cliente: "UNDER ARMOUR", producto: "BANNER 2x1m", cantidad: 200, prioridad: "ALTA", fecha: "2026-03-04", color: "#43aa8b" },
    { id: "L2402-095", codigo: "NK-2024-22", cliente: "NIKE", producto: "LONA IMPRESA 5x3m", cantidad: 180, prioridad: "ALTA", fecha: "2026-03-04", color: "#577590" },
    { id: "L2402-096", codigo: "AD-2024-09", cliente: "ADIDAS", producto: "VINILO REFLECTIVO", cantidad: 420, prioridad: "MEDIA", fecha: "2026-03-03", color: "#277da1" },
    { id: "L2402-097", codigo: "NK-2024-31", cliente: "NIKE", producto: "PAPEL PHOTOLUMINISCENTE", cantidad: 150, prioridad: "BAJA", fecha: "2026-03-04", color: "#4cc9f0" },
    { id: "L2402-098", codigo: "PU-2024-07", cliente: "PUMA", producto: "LONA IMPRESA 2x2m", cantidad: 390, prioridad: "MEDIA", fecha: "2026-03-04", color: "#4895ef" },
  ]);

  // ================ LOTES EN PRODUCCIÓN ================
  const [lotesEnProduccion, setLotesEnProduccion] = useState([]);
  
  // ================ LOTES FINALIZADOS ================
  const [lotesFinalizados, setLotesFinalizados] = useState([]);

  // ================ ESTADOS DEL SISTEMA ================
  const [codigoEscaneado, setCodigoEscaneado] = useState("");
  const [loteSeleccionado, setLoteSeleccionado] = useState(null);
  const [notificaciones, setNotificaciones] = useState([]);
  const [filtroMaquinas, setFiltroMaquinas] = useState("todas");
  const [vista, setVista] = useState("grid");
  const [modoOscuro, setModoOscuro] = useState(false);
  const [vistaCompacta, setVistaCompacta] = useState(false);
  const [modalAsignar, setModalAsignar] = useState({ abierto: false, lote: null });
  const [estadisticas, setEstadisticas] = useState({
    lotesActivos: 0,
    lotesCompletados: 0,
    piezasProcesadas: 0,
    eficienciaGlobal: 94,
    tiempoReal: new Date().toLocaleTimeString(),
    productividad: 87,
    tintaPromedio: 64,
    temperaturaPromedio: 38
  });

  const inputRef = useRef(null);
  const intervalRef = useRef(null);

  // ================ ENFOCAR INPUT ================
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // ================ ACTUALIZACIÓN EN TIEMPO REAL ================
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      actualizarProduccion();
      actualizarEstadisticas();
      setEstadisticas(prev => ({
        ...prev,
        tiempoReal: new Date().toLocaleTimeString()
      }));
    }, 500);

    return () => clearInterval(intervalRef.current);
  }, [lotesEnProduccion]);

  // ================ ACTUALIZAR PRODUCCIÓN ================
  const actualizarProduccion = useCallback(() => {
    setLotesEnProduccion(prev => 
      prev.map(lote => {
        if (lote.estado !== "produciendo") return lote;
        
        const incremento = (lote.velocidad || 2) * (0.8 + Math.random() * 0.4);
        const nuevaCantidad = Math.min(
          lote.cantidadProcesada + incremento,
          lote.cantidadTotal
        );
        
        const progreso = (nuevaCantidad / lote.cantidadTotal) * 100;
        
        return {
          ...lote,
          cantidadProcesada: nuevaCantidad,
          progreso: progreso.toFixed(1)
        };
      })
    );
  }, []);

  // ================ ACTUALIZAR ESTADÍSTICAS ================
  const actualizarEstadisticas = useCallback(() => {
    const totalPiezas = lotesEnProduccion.reduce((acc, l) => acc + l.cantidadProcesada, 0);
    const tintaTotal = maquinas.filter(m => m.tinta > 0).reduce((acc, m) => acc + m.tinta, 0);
    const maquinasTinta = maquinas.filter(m => m.tinta > 0).length;
    const tempTotal = maquinas.filter(m => m.temperatura > 0).reduce((acc, m) => acc + m.temperatura, 0);
    const maquinasTemp = maquinas.filter(m => m.temperatura > 0).length;
    
    setEstadisticas(prev => ({
      ...prev,
      lotesActivos: lotesEnProduccion.length,
      lotesCompletados: lotesFinalizados.length,
      piezasProcesadas: Math.round(totalPiezas),
      tintaPromedio: maquinasTinta > 0 ? Math.round(tintaTotal / maquinasTinta) : 0,
      temperaturaPromedio: maquinasTemp > 0 ? Math.round(tempTotal / maquinasTemp) : 0
    }));
  }, [lotesEnProduccion, lotesFinalizados, maquinas]);

  // ================ PROCESAR ESCANEO ================
  const procesarEscaneo = (codigo) => {
    if (!codigo || codigo.trim() === "") {
      mostrarNotificacion("⚠️ Ingrese un código válido", "warning");
      return;
    }

    const codigoLimpio = codigo.trim().toUpperCase();

    // Buscar en producción
    const loteEnProduccion = lotesEnProduccion.find(l => l.codigo === codigoLimpio);
    if (loteEnProduccion) {
      setLoteSeleccionado(loteEnProduccion);
      mostrarNotificacion(`📋 Mostrando detalle de ${codigoLimpio}`, "info");
      setCodigoEscaneado("");
      return;
    }

    // Buscar en pendientes
    const lotePendiente = lotesPendientes.find(l => l.codigo === codigoLimpio);
    if (lotePendiente) {
      setModalAsignar({ abierto: true, lote: lotePendiente });
      mostrarNotificacion(`✅ Lote ${codigoLimpio} listo para asignar`, "success");
      setCodigoEscaneado("");
      return;
    }

    // Buscar en finalizados
    const loteFinalizado = lotesFinalizados.find(l => l.codigo === codigoLimpio);
    if (loteFinalizado) {
      setLoteSeleccionado(loteFinalizado);
      mostrarNotificacion(`📋 Mostrando detalle de ${codigoLimpio} (finalizado)`, "info");
      setCodigoEscaneado("");
      return;
    }

    mostrarNotificacion(`❌ Lote ${codigoLimpio} no encontrado`, "error");
    setCodigoEscaneado("");
  };

  // ================ ASIGNAR LOTE A MÁQUINA ================
  const asignarLoteAMaquina = (lote, maquinaId) => {
    const maquina = maquinas.find(m => m.id === maquinaId);
    
    if (!maquina || maquina.estado !== "disponible") {
      mostrarNotificacion(`❌ Máquina no disponible`, "error");
      return;
    }

    const nuevoLoteProduccion = {
      ...lote,
      idProduccion: `PROD-${Date.now()}`,
      maquinaId: maquinaId,
      maquinaNombre: maquina.nombre,
      horaInicio: new Date().toLocaleTimeString(),
      cantidadProcesada: 0,
      progreso: "0",
      estado: "produciendo",
      velocidad: maquina.velocidad / 1000,
      color: maquina.color
    };

    setLotesEnProduccion(prev => [...prev, nuevoLoteProduccion]);
    setLotesPendientes(prev => prev.filter(l => l.id !== lote.id));
    
    setMaquinas(prev =>
      prev.map(m =>
        m.id === maquinaId
          ? { ...m, estado: "produciendo", loteActual: lote.id }
          : m
      )
    );

    setModalAsignar({ abierto: false, lote: null });
    mostrarNotificacion(`🚀 Lote ${lote.codigo} asignado a ${maquina.nombre}`, "success");
  };

  // ================ FINALIZAR LOTE ================
  const finalizarLote = (loteId) => {
    const lote = lotesEnProduccion.find(l => l.idProduccion === loteId);
    if (!lote) return;

    const eficiencia = ((lote.cantidadProcesada / lote.cantidadTotal) * 100).toFixed(1);

    const loteFinalizado = {
      ...lote,
      eficienciaFinal: eficiencia,
      horaFin: new Date().toLocaleTimeString(),
      estado: "finalizado"
    };

    // Actualizar historial de máquina
    setMaquinas(prev =>
      prev.map(m => {
        if (m.id === lote.maquinaId) {
          const nuevoHistorial = [
            ...m.historial,
            {
              lote: lote.codigo,
              cliente: lote.cliente,
              cantidad: Math.round(lote.cantidadProcesada),
              total: lote.cantidadTotal,
              eficiencia: eficiencia,
              fecha: new Date().toLocaleString()
            }
          ];
          return {
            ...m,
            estado: "disponible",
            loteActual: null,
            produccionHoy: m.produccionHoy + Math.round(lote.cantidadProcesada),
            historial: nuevoHistorial
          };
        }
        return m;
      })
    );

    setLotesFinalizados(prev => [loteFinalizado, ...prev]);
    setLotesEnProduccion(prev => prev.filter(l => l.idProduccion !== loteId));
    mostrarNotificacion(`🎉 Lote ${lote.codigo} finalizado - ${eficiencia}%`, "success");
  };

  // ================ MOSTRAR NOTIFICACIÓN ================
  const mostrarNotificacion = (mensaje, tipo) => {
    const id = Date.now();
    setNotificaciones(prev => [...prev, { id, mensaje, tipo }]);
    setTimeout(() => {
      setNotificaciones(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  // ================ REGISTRAR ENTRADA/SALIDA ================
  const registrarEntrada = (maquinaId) => {
    mostrarNotificacion(`📥 Entrada registrada en máquina ${maquinaId}`, "info");
  };

  const registrarSalida = (maquinaId) => {
    mostrarNotificacion(`📤 Salida registrada de máquina ${maquinaId}`, "info");
  };

  const registrarInOut = (maquinaId, tipo) => {
    mostrarNotificacion(`🔄 ${tipo} registrado en máquina ${maquinaId}`, "success");
  };

  // ================ HANDLE KEY PRESS ================
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      procesarEscaneo(codigoEscaneado.trim());
    }
  };

  return (
    <div className={`plotter-container ${modoOscuro ? 'dark-mode' : ''} ${vistaCompacta ? 'vista-compacta' : ''}`}>
      
      {/* Panel de Control */}
      <div className="control-panel-plotter">
        <button className={`control-btn ${modoOscuro ? 'active' : ''}`} onClick={() => setModoOscuro(!modoOscuro)}>
          {modoOscuro ? '☀️' : '🌙'}
        </button>
        <button className={`control-btn ${vistaCompacta ? 'active' : ''}`} onClick={() => setVistaCompacta(!vistaCompacta)}>
          {vistaCompacta ? '🔍' : '👁️'}
        </button>
        <button className="control-btn" onClick={() => setVista('grid')}>🔲</button>
        <button className="control-btn" onClick={() => setVista('lista')}>📋</button>
        <select 
          className="filtro-select"
          value={filtroMaquinas}
          onChange={(e) => setFiltroMaquinas(e.target.value)}
        >
          <option value="todas">TODAS LAS MÁQUINAS</option>
          <option value="disponible">✅ DISPONIBLES</option>
          <option value="produciendo">⚡ EN PRODUCCIÓN</option>
          <option value="mantenimiento">🔧 MANTENIMIENTO</option>
          <option value="averiada">⚠️ AVERIADAS</option>
        </select>
      </div>

      {/* Notificaciones */}
      <div className="notificaciones-plotter">
        {notificaciones.map(n => (
          <div key={n.id} className={`notificacion-plotter ${n.tipo}`}>
            <span>
              {n.tipo === 'success' && '✅'}
              {n.tipo === 'error' && '❌'}
              {n.tipo === 'warning' && '⚠️'}
              {n.tipo === 'info' && 'ℹ️'}
            </span>
            {n.mensaje}
          </div>
        ))}
      </div>

      {/* Header con Escáner */}
      <div className="header-plotter">
        <div className="header-titulo">
          <h1>🖨️ PLOTTER CONTROL - 17 MÁQUINAS</h1>
          <div className="header-badges">
            <span className="badge-online">🔴 EN VIVO</span>
            <span className="badge-turno">{new Date().getHours() >= 6 && new Date().getHours() < 14 ? '🌅 MATUTINO' : new Date().getHours() >= 14 && new Date().getHours() < 22 ? '☀️ VESPERTINO' : '🌙 NOCTURNO'}</span>
          </div>
        </div>
        
        <div className="scanner-plotter">
          <div className="scanner-input-group">
            <span className="scanner-icon">📷</span>
            <input
              ref={inputRef}
              type="text"
              value={codigoEscaneado}
              onChange={(e) => setCodigoEscaneado(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              placeholder="ESCANEAR CÓDIGO DE LOTE"
              className="scanner-input"
            />
            <button onClick={() => procesarEscaneo(codigoEscaneado)} className="scanner-btn">
              PROCESAR
            </button>
          </div>
          <div className="scanner-info">
            <span>🔵 ESCANEAR PARA INICIAR</span>
            <span>🟢 ESCANEAR EN PRODUCCIÓN = VER DETALLE</span>
          </div>
        </div>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="stats-plotter">
        <div className="stat-card-plotter">
          <span className="stat-valor">{maquinas.filter(m => m.estado === 'produciendo').length}</span>
          <span className="stat-label">MÁQUINAS ACTIVAS</span>
          <span className="stat-trend">⚡ {estadisticas.eficienciaGlobal}%</span>
        </div>
        <div className="stat-card-plotter">
          <span className="stat-valor">{lotesEnProduccion.length}</span>
          <span className="stat-label">LOTES EN PRODUCCIÓN</span>
          <span className="stat-trend">📊 {estadisticas.productividad}%</span>
        </div>
        <div className="stat-card-plotter">
          <span className="stat-valor">{lotesPendientes.length}</span>
          <span className="stat-label">LOTES PENDIENTES</span>
          <span className="stat-trend">⏳ {Math.round(lotesPendientes.reduce((acc, l) => acc + l.cantidad, 0) / 1000)}K pz</span>
        </div>
        <div className="stat-card-plotter">
          <span className="stat-valor">{estadisticas.piezasProcesadas}</span>
          <span className="stat-label">PIEZAS HOY</span>
          <span className="stat-trend">📈 +12%</span>
        </div>
        <div className="stat-card-plotter">
          <span className="stat-valor">{estadisticas.tintaPromedio}%</span>
          <span className="stat-label">TINTA PROMEDIO</span>
          <span className="stat-trend">🖨️ {maquinas.filter(m => m.tinta < 20).length} críticas</span>
        </div>
        <div className="stat-card-plotter">
          <span className="stat-valor">{estadisticas.temperaturaPromedio}°C</span>
          <span className="stat-label">TEMP PROMEDIO</span>
          <span className="stat-trend">🌡️ Óptima</span>
        </div>
      </div>

      {/* Grid de 17 Máquinas Plotter */}
      <div className={`maquinas-grid-plotter ${vista}`}>
        {maquinas
          .filter(m => filtroMaquinas === 'todas' || m.estado === filtroMaquinas)
          .map(maquina => (
            <div 
              key={maquina.id} 
              className={`maquina-card-plotter ${maquina.estado}`}
              style={{ borderTop: `4px solid ${maquina.color}` }}
            >
              <div className="maquina-header-plotter">
                <div className="maquina-titulo">
                  <span className="maquina-icono">{maquina.icono}</span>
                  <span className="maquina-nombre">{maquina.nombre}</span>
                </div>
                <span className={`maquina-estado-badge ${maquina.estado}`}>
                  {maquina.estado === 'produciendo' && '⚡'}
                  {maquina.estado === 'disponible' && '✅'}
                  {maquina.estado === 'mantenimiento' && '🔧'}
                  {maquina.estado === 'averiada' && '⚠️'}
                  {maquina.estado.toUpperCase()}
                </span>
              </div>

              <div className="maquina-body-plotter">
                <div className="maquina-tipo">{maquina.tipo}</div>
                
                <div className="maquina-metricas">
                  <div className="metrica">
                    <span>⚡ Vel</span>
                    <span className="metrica-valor">{maquina.velocidad} pz/h</span>
                  </div>
                  {maquina.tinta > 0 && (
                    <div className="metrica">
                      <span>🖨️ Tinta</span>
                      <div className="progress-bar-mini">
                        <div 
                          className={`progress-fill ${maquina.tinta < 20 ? 'critico' : ''}`}
                          style={{ width: `${maquina.tinta}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  {maquina.temperatura > 0 && (
                    <div className="metrica">
                      <span>🌡️ Temp</span>
                      <span className={`metrica-valor ${maquina.temperatura > 45 ? 'critico' : ''}`}>
                        {maquina.temperatura}°C
                      </span>
                    </div>
                  )}
                </div>

                {maquina.loteActual && (
                  <div className="maquina-lote-activo">
                    <span className="lote-indicador">🔵 Lote:</span>
                    <span className="lote-codigo">
                      {lotesEnProduccion.find(l => l.id === maquina.loteActual)?.codigo || maquina.loteActual}
                    </span>
                  </div>
                )}

                <div className="maquina-footer">
                  <span className="maquina-operador">👤 {maquina.operador}</span>
                  <span className="maquina-produccion">📦 {maquina.produccionHoy} hoy</span>
                </div>

                <div className="maquina-acciones">
                  <button 
                    className="accion-btn in"
                    onClick={() => registrarInOut(maquina.id, 'IN')}
                    title="Registrar ENTRADA"
                  >
                    📥 IN
                  </button>
                  <button 
                    className="accion-btn out"
                    onClick={() => registrarInOut(maquina.id, 'OUT')}
                    title="Registrar SALIDA"
                  >
                    📤 OUT
                  </button>
                  <button 
                    className="accion-btn on"
                    onClick={() => registrarInOut(maquina.id, 'ON')}
                    title="Encender máquina"
                  >
                    ⚡ ON
                  </button>
                  <button 
                    className="accion-btn off"
                    onClick={() => registrarInOut(maquina.id, 'OFF')}
                    title="Apagar máquina"
                  >
                    ⭕ OFF
                  </button>
                </div>
              </div>

              <div className="maquina-historial-mini">
                {maquina.historial.length > 0 ? (
                  <span>📋 {maquina.historial.length} lotes hoy</span>
                ) : (
                  <span>🆕 Sin historial hoy</span>
                )}
              </div>
            </div>
          ))}
      </div>

      {/* Sección de Producción Actual */}
      {lotesEnProduccion.length > 0 && (
        <div className="produccion-actual">
          <h2>⚡ PRODUCCIÓN EN TIEMPO REAL</h2>
          <div className="lotes-produccion-grid">
            {lotesEnProduccion.map(lote => (
              <div 
                key={lote.idProduccion} 
                className="lote-produccion-card"
                style={{ borderLeft: `4px solid ${lote.color}` }}
              >
                <div className="lote-produccion-header">
                  <span className="lote-produccion-codigo">{lote.codigo}</span>
                  <span className={`lote-produccion-prioridad ${lote.prioridad.toLowerCase()}`}>
                    {lote.prioridad}
                  </span>
                </div>
                
                <div className="lote-produccion-cliente">{lote.cliente}</div>
                <div className="lote-produccion-maquina">🖨️ {lote.maquinaNombre}</div>
                
                <div className="progreso-plotter">
                  <div className="progreso-header">
                    <span>PROGRESO</span>
                    <span>{lote.progreso}%</span>
                  </div>
                  <div className="progreso-barra-plotter">
                    <div 
                      className="progreso-fill-plotter" 
                      style={{ width: `${lote.progreso}%` }}
                    ></div>
                  </div>
                </div>

                <div className="lote-produccion-footer">
                  <span>{Math.round(lote.cantidadProcesada)}/{lote.cantidadTotal}</span>
                  <button 
                    className="btn-finalizar"
                    onClick={() => finalizarLote(lote.idProduccion)}
                  >
                    ✅ FINALIZAR
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Asignación */}
      {modalAsignar.abierto && modalAsignar.lote && (
        <div className="modal-plotter" onClick={() => setModalAsignar({ abierto: false, lote: null })}>
          <div className="modal-contenido-plotter" onClick={e => e.stopPropagation()}>
            <h2>📦 ASIGNAR LOTE A MÁQUINA</h2>
            
            <div className="modal-lote-info">
              <p><strong>Código:</strong> {modalAsignar.lote.codigo}</p>
              <p><strong>Cliente:</strong> {modalAsignar.lote.cliente}</p>
              <p><strong>Producto:</strong> {modalAsignar.lote.producto}</p>
              <p><strong>Cantidad:</strong> {modalAsignar.lote.cantidad}</p>
              <p><strong>Prioridad:</strong> {modalAsignar.lote.prioridad}</p>
            </div>

            <h3>MÁQUINAS DISPONIBLES</h3>
            <div className="modal-maquinas-grid">
              {maquinas
                .filter(m => m.estado === "disponible")
                .map(maquina => (
                  <div 
                    key={maquina.id} 
                    className="modal-maquina-item"
                    onClick={() => asignarLoteAMaquina(modalAsignar.lote, maquina.id)}
                  >
                    <span>{maquina.icono} {maquina.nombre}</span>
                    <span>⚡ {maquina.velocidad} pz/h</span>
                    <span>🖨️ Tinta {maquina.tinta}%</span>
                  </div>
                ))}
            </div>

            {maquinas.filter(m => m.estado === "disponible").length === 0 && (
              <p className="modal-error">❌ No hay máquinas disponibles</p>
            )}

            <button 
              className="modal-cerrar"
              onClick={() => setModalAsignar({ abierto: false, lote: null })}
            >
              CERRAR
            </button>
          </div>
        </div>
      )}

      {/* Modal de Detalle de Lote */}
      {loteSeleccionado && (
        <div className="modal-plotter" onClick={() => setLoteSeleccionado(null)}>
          <div className="modal-contenido-plotter" onClick={e => e.stopPropagation()}>
            <h2>📋 DETALLE DE LOTE</h2>
            
            <div className="detalle-lote-grid">
              <div className="detalle-info">
                <p><strong>Código:</strong> {loteSeleccionado.codigo}</p>
                <p><strong>Cliente:</strong> {loteSeleccionado.cliente}</p>
                <p><strong>Producto:</strong> {loteSeleccionado.producto}</p>
                <p><strong>Cantidad:</strong> {loteSeleccionado.cantidadTotal || loteSeleccionado.cantidad}</p>
                <p><strong>Prioridad:</strong> {loteSeleccionado.prioridad}</p>
              </div>

              {loteSeleccionado.estado === 'produciendo' && (
                <div className="detalle-progreso-grande">
                  <div className="progreso-circular">
                    <svg viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#e0e0e0" strokeWidth="8"/>
                      <circle 
                        cx="50" cy="50" r="45" 
                        fill="none" 
                        stroke="#4361ee" 
                        strokeWidth="8"
                        strokeDasharray={`${parseFloat(loteSeleccionado.progreso) * 2.83}, 283`}
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <span className="progreso-porcentaje">{loteSeleccionado.progreso}%</span>
                  </div>
                  <p>Procesado: {Math.round(loteSeleccionado.cantidadProcesada)}/{loteSeleccionado.cantidadTotal}</p>
                  <p>Máquina: {loteSeleccionado.maquinaNombre}</p>
                  <p>Hora inicio: {loteSeleccionado.horaInicio}</p>
                </div>
              )}

              {loteSeleccionado.estado === 'finalizado' && (
                <div className="detalle-finalizado">
                  <p className="eficiencia-grande">✅ {loteSeleccionado.eficienciaFinal}%</p>
                  <p>Finalizado: {loteSeleccionado.horaFin}</p>
                  <p>Procesado: {Math.round(loteSeleccionado.cantidadProcesada)}/{loteSeleccionado.cantidadTotal}</p>
                </div>
              )}
            </div>

            <button 
              className="modal-cerrar"
              onClick={() => setLoteSeleccionado(null)}
            >
              CERRAR
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlotterLotes;