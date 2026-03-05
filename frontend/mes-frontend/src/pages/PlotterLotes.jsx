// src/pages/PlotterLotes.jsx
import React, { useState, useEffect, useRef } from "react";
import "./PlotterLotes.css";

const PlotterLotes = () => {
  // ================ MÁQUINAS ================
  const [maquinas, setMaquinas] = useState([
    { 
      id: "plt-001", 
      nombre: "HP LATEX 315", 
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
      nombre: "HP LATEX 335", 
      icono: "🖨️", 
      estado: "produciendo", 
      temperatura: 45, 
      tinta: 62, 
      produccionHoy: 2134,
      loteActual: "NK-137", 
      operador: "María G.",
      velocidad: 2200,
      eficiencia: 95,
      alertas: ["⚠️ Tinta baja 62%"],
      color: "#3a0ca3",
      historial: []
    },
    { 
      id: "plt-003", 
      nombre: "HP LATEX 365", 
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
      nombre: "HP LATEX 570", 
      icono: "🖨️", 
      estado: "mantenimiento", 
      temperatura: 0, 
      tinta: 0, 
      produccionHoy: 0,
      loteActual: null, 
      operador: "Técnico",
      velocidad: 2400,
      eficiencia: 0,
      alertas: ["🔧 Mantenimiento"],
      color: "#f72585",
      historial: []
    },
    { 
      id: "plt-005", 
      nombre: "UV FLATBED 1", 
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
        id: "NK-137", 
        codigo: "NK-137", 
        cliente: "NIKE", 
        producto: "LONA IMPRESA 3x2m", 
        cantidad: 450, 
        prioridad: "ALTA",
        fecha: "2026-03-05",
        hora: "08:30",
        material: "Lona Front",
        acabado: "Mate",
        colores: 4,
        tiempoEstimado: "2.5h",
        diseño: "nk_137_campaign.ai",
        observaciones: "Urgente - Evento deportivo",
        historia: []
      },
      { 
        id: "AD-245", 
        codigo: "AD-245", 
        cliente: "ADIDAS", 
        producto: "VINILO TEXTIL", 
        cantidad: 280, 
        prioridad: "MEDIA",
        fecha: "2026-03-05",
        hora: "09:15",
        material: "Vinil textil",
        acabado: "Brillante",
        colores: 3,
        tiempoEstimado: "1.8h",
        diseño: "ad_245_running.eps",
        observaciones: "Camisetas running",
        historia: []
      },
      { 
        id: "PM-389", 
        codigo: "PM-389", 
        cliente: "PUMA", 
        producto: "PAPEL SUBLIMACIÓN", 
        cantidad: 600, 
        prioridad: "ALTA",
        fecha: "2026-03-05",
        hora: "10:20",
        material: "Papel transfer",
        acabado: "Premium",
        colores: 6,
        tiempoEstimado: "3.2h",
        diseño: "pm_389_collection.pdf",
        observaciones: "200°C temperatura",
        historia: []
      },
      { 
        id: "UA-456", 
        codigo: "UA-456", 
        cliente: "UNDER ARMOUR", 
        producto: "BANNER 2x1m", 
        cantidad: 200, 
        prioridad: "ALTA",
        fecha: "2026-03-05",
        hora: "11:45",
        material: "Banner mesh",
        acabado: "Con ojillos",
        colores: 2,
        tiempoEstimado: "1.5h",
        diseño: "ua_456_outdoor.cdr",
        observaciones: "Resistente UV",
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

  const inputRef = useRef(null);

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

  // ================ PROCESAR ESCANEO ================
  const procesarEscaneo = (codigo) => {
    if (!codigo || codigo.trim() === "") {
      mostrarNotificacion("⚠️ Ingrese un código válido", "warning");
      return;
    }

    const codigoLimpio = codigo.trim().toUpperCase();
    
    // Buscar en producción (2do escaneo - finalizar)
    const loteEnProduccion = lotes.produccion.find(l => l.codigo === codigoLimpio);
    if (loteEnProduccion) {
      setModalDetalle({ 
        abierto: true, 
        tipo: "confirmarFinalizar", 
        item: loteEnProduccion 
      });
      setCodigoEscaneado("");
      return;
    }

    // Buscar en pendientes (1er escaneo - iniciar)
    const lotePendiente = lotes.pendientes.find(l => l.codigo === codigoLimpio);
    if (lotePendiente) {
      setModalAsignar({ abierto: true, lote: lotePendiente });
      setCodigoEscaneado("");
      return;
    }

    // Buscar en finalizados
    const loteFinalizado = lotes.finalizados.find(l => l.codigo === codigoLimpio);
    if (loteFinalizado) {
      setModalDetalle({ abierto: true, tipo: "lote", item: loteFinalizado });
      setCodigoEscaneado("");
      return;
    }

    mostrarNotificacion(`❌ Lote ${codigoLimpio} no encontrado`, "error");
    setCodigoEscaneado("");
  };

  // ================ ASIGNAR LOTE ================
  const asignarLote = (lote, maquina) => {
    if (!maquina) {
      mostrarNotificacion("❌ Seleccione una máquina", "warning");
      return;
    }

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
      tiempoInicio: Date.now()
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

    setModalAsignar({ abierto: false, lote: null });
    setMaquinaSeleccionada(null);
    mostrarNotificacion(`🚀 Lote ${lote.codigo} iniciado`, "success");
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

  // ================ GENERAR ALEATORIO ================
  const generarAleatorio = () => {
    const prefijos = ['NK', 'AD', 'PM', 'UA', 'NB', 'AS'];
    const numeros = Math.floor(100 + Math.random() * 900);
    const codigo = `${prefijos[Math.floor(Math.random() * prefijos.length)]}-${numeros}`;
    
    const nuevoLote = {
      id: codigo,
      codigo,
      cliente: "NUEVO CLIENTE",
      producto: "PRODUCTO GENÉRICO",
      cantidad: Math.floor(100 + Math.random() * 900),
      prioridad: ["ALTA", "MEDIA", "BAJA"][Math.floor(Math.random() * 3)],
      fecha: tiempoReal.toISOString().split('T')[0],
      hora: tiempoReal.toLocaleTimeString(),
      material: "Estándar",
      acabado: "Estándar",
      colores: Math.floor(2 + Math.random() * 4),
      tiempoEstimado: "2.0h",
      historia: []
    };

    setLotes(prev => ({
      ...prev,
      pendientes: [nuevoLote, ...prev.pendientes]
    }));
    
    mostrarNotificacion(`✅ Lote ${codigo} generado`, "success");
  };

  // ================ HANDLE KEY PRESS ================
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      procesarEscaneo(codigoEscaneado);
    }
  };

  // ================ FILTRAR MÁQUINAS ================
  const maquinasFiltradas = maquinas.filter(m => {
    if (filtroMaquinas === "todas") return true;
    if (filtroMaquinas === "disponibles") return m.estado === "disponible";
    if (filtroMaquinas === "produciendo") return m.estado === "produciendo";
    return true;
  });

  return (
    <div className={`plotter-container ${modoOscuro ? 'dark-mode' : ''}`}>
      
      {/* ===== HEADER ===== */}
      <header className="plotter-header">
        <div className="header-left">
          <h1>🖨️ Plottler - 17 Máquinas en Línea</h1>
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
          <div key={n.id} className={`notificacion ${n.tipo}`}>
            <span className="notificacion-icono">
              {n.tipo === 'success' && '✅'}
              {n.tipo === 'error' && '❌'}
              {n.tipo === 'warning' && '⚠️'}
            </span>
            <span className="notificacion-mensaje">{n.mensaje}</span>
          </div>
        ))}
      </div>

      {/* ===== SCANNER PRINCIPAL ===== */}
      <div className="scanner-principal">
        <h2>Sistema de Gestión de Impresión</h2>
        
        <div className="scanner-title">
          <h3>ESCANEAR CÓDIGO DE LOTE</h3>
          <span className="ejemplo">Ejemplo: NK-137</span>
        </div>

        <div className="scanner-input-container">
          <input
            ref={inputRef}
            type="text"
            value={codigoEscaneado}
            onChange={(e) => setCodigoEscaneado(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            placeholder="INGRESE CÓDIGO"
            className="scanner-input"
          />
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

        <button className="btn-generar" onClick={generarAleatorio}>
          3. GENERAR ALEATORIO
        </button>

        <div className="scanner-footer">
          <span className="okc">OKC - NYK</span>
          <span className="puntuacion">Puntuación del día: 98%</span>
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
          <option value="todas">Todas las máquinas</option>
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
          {maquinasFiltradas
            .filter(m => m.nombre.toLowerCase().includes(busqueda.toLowerCase()))
            .map(maquina => (
            <div 
              key={maquina.id} 
              className={`maquina-card ${maquina.estado}`}
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
                  <div key={idx} className="alerta">{alerta}</div>
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
            {lotes.pendientes.map(lote => (
              <div 
                key={lote.id} 
                className="lote-card"
                onClick={() => mostrarDetalle('lote', lote)}
              >
                <div className="lote-header">
                  <span className="lote-codigo">{lote.codigo}</span>
                  <span className={`prioridad ${lote.prioridad.toLowerCase()}`}>
                    {lote.prioridad}
                  </span>
                </div>
                <div className="lote-cliente">{lote.cliente}</div>
                <div className="lote-producto">{lote.producto}</div>
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
            ))}
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
                className="produccion-card"
                onClick={() => mostrarDetalle('produccion', lote)}
              >
                <div className="produccion-header">
                  <span className="codigo">{lote.codigo}</span>
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
                    <div className="progreso-fill" style={{ width: `${lote.progreso}%` }} />
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
              <p><strong>Cantidad:</strong> {modalAsignar.lote.cantidad}</p>
              <p><strong>Prioridad:</strong> {modalAsignar.lote.prioridad}</p>
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
                        <p>{modalDetalle.item.loteActual}</p>
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
    </div>
  );
};

export default PlotterLotes;