import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import './BuzonDiseno.css';
import { useProduccion } from '../context/ProduccionContext';

const BuzonDiseno = () => {
  // ================ CONTEXTO GLOBAL ================
  const { 
    lotes: lotesGlobal,
    procesarEscaneo: procesarEscaneoGlobal,
    conectado: wsConectado,
    ultimoMovimiento: ultimoMovimientoGlobal,
    agregarEvento: agregarEventoGlobal
  } = useProduccion();

  // ================ ESTADOS ================
  const [disenadorActual, setDisenadorActual] = useState(null);
  const [modoEscaner, setModoEscaner] = useState(false);
  const [codigoDisenador, setCodigoDisenador] = useState('');
  const [codigoTemporal, setCodigoTemporal] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('info');
  const [lotesPendientes, setLotesPendientes] = useState([]);
  const [misLotes, setMisLotes] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [filtro, setFiltro] = useState('pendientes');
  const [showModalTomar, setShowModalTomar] = useState(false);
  const [showModalFinalizar, setShowModalFinalizar] = useState(false);
  const [loteSeleccionado, setLoteSeleccionado] = useState(null);
  const [animacionActiva, setAnimacionActiva] = useState(false);
  const [ultimoEscaneo, setUltimoEscaneo] = useState(null);
  const [mostrarEstadisticas, setMostrarEstadisticas] = useState(false);
  const [vista, setVista] = useState('grid');
  
  const inputRef = useRef(null);
  const mainContentRef = useRef(null);

  // ================ DISEÑADORES REGISTRADOS ================
  const disenadoresRegistrados = useMemo(() => [
    { id: 'D001', codigo: 'CARLOS123', nombre: 'Carlos Ruiz', avatar: 'CR', color: '#3b82f6', especialidad: 'Vectorial', experiencia: 8 },
    { id: 'D002', codigo: 'MARIA456', nombre: 'María González', avatar: 'MG', color: '#8b5cf6', especialidad: 'Ilustración', experiencia: 6 },
    { id: 'D003', codigo: 'JUAN789', nombre: 'Juan Pérez', avatar: 'JP', color: '#ec4899', especialidad: 'Tipografía', experiencia: 5 },
    { id: 'D004', codigo: 'ANA101', nombre: 'Ana López', avatar: 'AL', color: '#10b981', especialidad: 'Fotocomposición', experiencia: 7 },
    { id: 'D005', codigo: 'PEDRO202', nombre: 'Pedro Sánchez', avatar: 'PS', color: '#f59e0b', especialidad: 'Vectorial', experiencia: 4 },
    { id: 'D006', codigo: 'LAURA303', nombre: 'Laura Martínez', avatar: 'LM', color: '#6366f1', especialidad: 'Ilustración', experiencia: 9 }
  ], []);

  // ================ ESTADÍSTICAS DEL DISEÑADOR ================
  const estadisticas = useMemo(() => {
    if (!disenadorActual) return null;
    
    const completados = historial.length;
    const enProceso = misLotes.length;
    const tiempoTotal = historial.reduce((sum, l) => sum + (l.tiempoReal || 0), 0);
    const tiempoPromedio = completados > 0 ? Math.round(tiempoTotal / completados) : 0;
    const eficiencia = completados > 0 ? Math.round((completados / (completados + enProceso)) * 100) : 0;
    
    return {
      completados,
      enProceso,
      tiempoTotal,
      tiempoPromedio,
      eficiencia
    };
  }, [historial, misLotes, disenadorActual]);

  // ================ FUNCIONES DE SESIÓN ================
  const mostrarMensaje = useCallback((texto, tipo = 'info') => {
    setMensaje(texto);
    setTipoMensaje(tipo);
    setTimeout(() => setMensaje(''), 3000);
  }, []);

  const iniciarSesion = () => {
    const codigo = codigoDisenador.trim().toUpperCase();
    if (!codigo) {
      mostrarMensaje('❌ Ingresa tu código de diseñador', 'error');
      setAnimacionActiva(true);
      setTimeout(() => setAnimacionActiva(false), 500);
      return;
    }

    const disenador = disenadoresRegistrados.find(d => d.codigo === codigo);
    if (disenador) {
      setDisenadorActual(disenador);
      setModoEscaner(false);
      setCodigoDisenador('');
      setCodigoTemporal('');
      mostrarMensaje(`✅ Bienvenido ${disenador.nombre}`, 'exito');
      
      cargarLotesPendientes();
      cargarMisLotes(disenador.id);
      cargarHistorial(disenador.id);
      
      if (agregarEventoGlobal) {
        agregarEventoGlobal('success', `👨‍🎨 ${disenador.nombre} ha iniciado sesión en el buzón de diseño`, 'buzon');
      }
      
      setAnimacionActiva(true);
      setTimeout(() => setAnimacionActiva(false), 500);
    } else {
      mostrarMensaje('❌ Código de diseñador no válido', 'error');
      setAnimacionActiva(true);
      setTimeout(() => setAnimacionActiva(false), 500);
    }
  };

  const cerrarSesion = () => {
    setDisenadorActual(null);
    setLotesPendientes([]);
    setMisLotes([]);
    setHistorial([]);
    setFiltro('pendientes');
    mostrarMensaje('👋 Sesión cerrada correctamente', 'info');
    
    if (agregarEventoGlobal) {
      agregarEventoGlobal('info', '👨‍🎨 Diseñador cerró sesión', 'buzon');
    }
    
    setAnimacionActiva(true);
    setTimeout(() => setAnimacionActiva(false), 500);
  };

  // ================ CARGAR DATOS ================
  const cargarLotesPendientes = useCallback(() => {
    const pendientes = (lotesGlobal || []).filter(lote => 
      (lote.areaActual === 'Diseño' || lote.areaActual === 'diseno') && 
      (!lote.disenadorAsignado || lote.disenadorAsignado === null) &&
      lote.estado !== 'completado'
    );
    
    setLotesPendientes(pendientes);
  }, [lotesGlobal]);

  const cargarMisLotes = useCallback((disenadorId) => {
    const misLotesAsignados = (lotesGlobal || []).filter(lote => 
      lote.disenadorAsignado === disenadorId && 
      lote.estado === 'en_proceso' &&
      (lote.areaActual === 'Diseño' || lote.areaActual === 'diseno')
    );
    
    setMisLotes(misLotesAsignados);
  }, [lotesGlobal]);

  const cargarHistorial = useCallback((disenadorId) => {
    const historialCompletados = (lotesGlobal || []).filter(lote => 
      lote.disenadorAsignado === disenadorId && 
      lote.estado === 'completado'
    ).sort((a, b) => new Date(b.fechaFin || b.fechaInicio) - new Date(a.fechaInicio));
    
    setHistorial(historialCompletados);
  }, [lotesGlobal]);

  // ================ SINCRONIZAR CON CAMBIOS GLOBALES ================
  useEffect(() => {
    if (disenadorActual) {
      cargarLotesPendientes();
      cargarMisLotes(disenadorActual.id);
      cargarHistorial(disenadorActual.id);
    }
  }, [lotesGlobal, disenadorActual, cargarLotesPendientes, cargarMisLotes, cargarHistorial]);

  useEffect(() => {
    if (ultimoMovimientoGlobal && disenadorActual) {
      cargarLotesPendientes();
      cargarMisLotes(disenadorActual.id);
      cargarHistorial(disenadorActual.id);
      
      if (ultimoMovimientoGlobal.lote && ultimoMovimientoGlobal.area === 'Diseño') {
        mostrarMensaje(`🆕 Nuevo lote disponible: ${ultimoMovimientoGlobal.lote}`, 'info');
        setUltimoEscaneo(ultimoMovimientoGlobal);
      }
    }
  }, [ultimoMovimientoGlobal, disenadorActual]);

  // ================ FUNCIONES DEL BUZÓN ================
  const tomarLote = (lote) => {
    setLoteSeleccionado(lote);
    setShowModalTomar(true);
  };

  const confirmarTomaLote = () => {
    if (!loteSeleccionado) return;
    
    const loteActualizado = {
      ...loteSeleccionado,
      disenadorAsignado: disenadorActual.id,
      disenadorNombre: disenadorActual.nombre,
      estado: 'en_proceso',
      fechaAsignacion: new Date().toISOString(),
      horaAsignacion: new Date().toLocaleTimeString(),
      comentarios: [
        ...(loteSeleccionado.comentarios || []),
        { 
          usuario: disenadorActual.nombre, 
          fecha: new Date().toLocaleTimeString(), 
          texto: `📌 Diseñador ${disenadorActual.nombre} ha tomado el lote`,
          avatar: disenadorActual.avatar
        }
      ]
    };
    
    if (procesarEscaneoGlobal) {
      procesarEscaneoGlobal(loteSeleccionado.codigo);
    }
    
    mostrarMensaje(`✅ Has tomado el lote ${loteSeleccionado.codigo}`, 'exito');
    setShowModalTomar(false);
    setLoteSeleccionado(null);
    setAnimacionActiva(true);
    setTimeout(() => setAnimacionActiva(false), 500);
    
    if (agregarEventoGlobal) {
      agregarEventoGlobal('success', `📦 ${disenadorActual.nombre} tomó el lote ${loteSeleccionado.codigo}`, 'buzon');
    }
  };

  const finalizarLote = (lote) => {
    setLoteSeleccionado(lote);
    setShowModalFinalizar(true);
  };

  const confirmarFinalizarLote = () => {
    if (!loteSeleccionado) return;
    
    const loteFinalizado = {
      ...loteSeleccionado,
      estado: 'completado',
      fechaFin: new Date().toISOString(),
      horaFin: new Date().toLocaleTimeString(),
      progreso: 100,
      comentarios: [
        ...(loteSeleccionado.comentarios || []),
        { 
          usuario: disenadorActual.nombre, 
          fecha: new Date().toLocaleTimeString(), 
          texto: `✅ Diseño finalizado por ${disenadorActual.nombre}`,
          avatar: disenadorActual.avatar
        }
      ]
    };
    
    if (procesarEscaneoGlobal) {
      procesarEscaneoGlobal(loteSeleccionado.codigo);
    }
    
    mostrarMensaje(`🎉 Has completado el lote ${loteSeleccionado.codigo}`, 'exito');
    setShowModalFinalizar(false);
    setLoteSeleccionado(null);
    setAnimacionActiva(true);
    setTimeout(() => setAnimacionActiva(false), 500);
    
    if (agregarEventoGlobal) {
      agregarEventoGlobal('success', `🏆 ${disenadorActual.nombre} completó el lote ${loteSeleccionado.codigo}`, 'buzon');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !disenadorActual) {
      iniciarSesion();
    } else if (e.key === 'Enter' && modoEscaner && codigoTemporal) {
      setCodigoDisenador(codigoTemporal);
      setCodigoTemporal('');
      iniciarSesion();
    }
  };

  // ================ FILTROS ================
  const lotesMostrados = useMemo(() => {
    if (filtro === 'pendientes') return lotesPendientes;
    if (filtro === 'misLotes') return misLotes;
    return historial;
  }, [filtro, lotesPendientes, misLotes, historial]);

  // ================ RENDER ================
  return (
    <div className={`buzon-diseno-premium ${disenadorActual ? 'logged-in' : ''}`} ref={mainContentRef}>
      
      {/* ===== NOTIFICACIÓN FLOTANTE ===== */}
      {mensaje && (
        <div className={`floating-message ${tipoMensaje} animate-slide-down`}>
          <span className="message-icon">
            {tipoMensaje === 'exito' && '✅'}
            {tipoMensaje === 'error' && '❌'}
            {tipoMensaje === 'info' && 'ℹ️'}
            {tipoMensaje === 'warning' && '⚠️'}
          </span>
          <span className="message-text">{mensaje}</span>
          <div className="message-progress"></div>
        </div>
      )}

      {/* ===== HEADER PREMIUM ===== */}
      <div className="buzon-header">
        <div className="header-glow"></div>
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-3d">
              <span className="logo-icon">🎨</span>
              <span className="logo-text">Buzón de Diseño</span>
              <span className="logo-badge">PRO</span>
            </div>
            {disenadorActual && (
              <div className="connection-status live">
                <span className="pulse-dot"></span>
                <span>EN VIVO</span>
              </div>
            )}
          </div>

          <div className="time-section">
            <div className="time-digital">
              {new Date().toLocaleTimeString()}
            </div>
            <div className="date-info">
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
          </div>
        </div>
      </div>

      {/* ===== PANEL DE LOGIN ===== */}
      {!disenadorActual ? (
        <div className="login-panel-premium">
          <div className="login-card">
            <div className="card-glow"></div>
            <div className="login-icon">
              <span className="icon-animated">🎨</span>
              <div className="icon-ring"></div>
            </div>
            <h2 className="login-title">Bienvenido Diseñador</h2>
            <p className="login-subtitle">Ingresa tu código para acceder al buzón</p>
            
            <div className="input-group-premium">
              <div className="input-wrapper">
                <span className="input-icon">🔑</span>
                <input
                  ref={inputRef}
                  type="text"
                  className={`login-input ${animacionActiva ? 'shake' : ''}`}
                  value={codigoDisenador}
                  onChange={(e) => setCodigoDisenador(e.target.value.toUpperCase())}
                  onKeyPress={handleKeyPress}
                  placeholder="Ej: CARLOS123"
                  autoComplete="off"
                />
                {codigoDisenador && (
                  <button className="clear-input" onClick={() => setCodigoDisenador('')}>✕</button>
                )}
              </div>
              <button 
                className="login-button"
                onClick={iniciarSesion}
              >
                <span className="btn-text">Ingresar</span>
                <span className="btn-icon">→</span>
              </button>
            </div>
            
            <div className="codigos-ayuda">
              <span className="help-title">📋 Códigos de prueba:</span>
              <div className="codigos-grid">
                {disenadoresRegistrados.map(d => (
                  <div key={d.id} className="codigo-chip" onClick={() => setCodigoDisenador(d.codigo)}>
                    <span className="chip-avatar" style={{ background: d.color }}>{d.avatar}</span>
                    <span className="chip-code">{d.codigo}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* ===== PERFIL DEL DISEÑADOR ===== */}
          <div className="perfil-disenador-premium">
            <div className="perfil-background" style={{ background: disenadorActual.color + '20' }}>
              <div className="perfil-glow" style={{ background: disenadorActual.color }}></div>
            </div>
            <div className="perfil-content">
              <div className="avatar-container">
                <div className="avatar-premium" style={{ background: disenadorActual.color }}>
                  {disenadorActual.avatar}
                  <div className="avatar-ring"></div>
                </div>
                <div className="status-badge online">
                  <span className="status-dot"></span>
                  Activo
                </div>
              </div>
              <div className="info-container">
                <h2 className="disenador-nombre">{disenadorActual.nombre}</h2>
                <div className="disenador-detalles">
                  <span className="detalle">
                    <span className="detalle-icon">🎯</span>
                    {disenadorActual.especialidad}
                  </span>
                  <span className="detalle">
                    <span className="detalle-icon">⭐</span>
                    {disenadorActual.experiencia} años exp.
                  </span>
                </div>
              </div>
              <button className="logout-btn-premium" onClick={cerrarSesion}>
                <span>🚪</span>
                <span>Cerrar Sesión</span>
              </button>
            </div>

            {/* Estadísticas Rápidas */}
            {mostrarEstadisticas && estadisticas && (
              <div className="stats-flotantes animate-scale">
                <div className="stat-item">
                  <span className="stat-value">{estadisticas.completados}</span>
                  <span className="stat-label">Completados</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{estadisticas.enProceso}</span>
                  <span className="stat-label">En Proceso</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{estadisticas.tiempoPromedio}min</span>
                  <span className="stat-label">Promedio</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{estadisticas.eficiencia}%</span>
                  <span className="stat-label">Eficiencia</span>
                </div>
              </div>
            )}
          </div>

          {/* ===== TABS DE NAVEGACIÓN ===== */}
          <div className="tabs-navegacion">
            <button 
              className={`tab-btn-premium ${filtro === 'pendientes' ? 'active' : ''}`}
              onClick={() => setFiltro('pendientes')}
            >
              <span className="tab-icon">📋</span>
              <span className="tab-text">Pendientes</span>
              {lotesPendientes.length > 0 && (
                <span className="tab-badge">{lotesPendientes.length}</span>
              )}
            </button>
            <button 
              className={`tab-btn-premium ${filtro === 'misLotes' ? 'active' : ''}`}
              onClick={() => setFiltro('misLotes')}
            >
              <span className="tab-icon">⚡</span>
              <span className="tab-text">Mis Lotes</span>
              {misLotes.length > 0 && (
                <span className="tab-badge warning">{misLotes.length}</span>
              )}
            </button>
            <button 
              className={`tab-btn-premium ${filtro === 'historial' ? 'active' : ''}`}
              onClick={() => setFiltro('historial')}
            >
              <span className="tab-icon">📜</span>
              <span className="tab-text">Historial</span>
            </button>
            <div className="vista-toggle">
              <button 
                className={`vista-btn ${vista === 'grid' ? 'active' : ''}`}
                onClick={() => setVista('grid')}
                title="Vista cuadrícula"
              >
                📱
              </button>
              <button 
                className={`vista-btn ${vista === 'lista' ? 'active' : ''}`}
                onClick={() => setVista('lista')}
                title="Vista lista"
              >
                📋
              </button>
            </div>
          </div>

          {/* ===== LISTA DE LOTES ===== */}
          <div className="lotes-container">
            {lotesMostrados.length === 0 ? (
              <div className="empty-state-premium">
                <div className="empty-animation">
                  <span>📭</span>
                  <span>✨</span>
                </div>
                <h3>No hay lotes</h3>
                <p>
                  {filtro === 'pendientes' && 'No hay lotes pendientes en este momento'}
                  {filtro === 'misLotes' && 'No tienes lotes asignados actualmente'}
                  {filtro === 'historial' && 'No hay lotes en tu historial'}
                </p>
                {filtro === 'pendientes' && (
                  <div className="empty-hint">
                    <span>💡</span>
                    <span>Los nuevos lotes aparecerán automáticamente aquí</span>
                  </div>
                )}
              </div>
            ) : vista === 'grid' ? (
              <div className="lotes-grid-premium">
                {lotesMostrados.map((lote, index) => (
                  <div 
                    key={lote.id} 
                    className={`lote-card-premium ${filtro === 'misLotes' ? 'asignado' : ''} ${lote.prioridad === 'alta' ? 'alta-prioridad' : ''}`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="card-glow-bg"></div>
                    <div className="card-header">
                      <div className="lote-codigo-premium">{lote.codigo || lote.id}</div>
                      {lote.prioridad === 'alta' && (
                        <div className="prioridad-badge alta">🔴 Alta</div>
                      )}
                      {filtro === 'misLotes' && (
                        <div className="estado-badge en-proceso">⚡ En proceso</div>
                      )}
                      {filtro === 'historial' && (
                        <div className="estado-badge completado">✅ Completado</div>
                      )}
                    </div>
                    <div className="card-body">
                      <h4 className="lote-nombre">{lote.producto || lote.nombre || 'Producto'}</h4>
                      <div className="lote-detalles">
                        <div className="detalle">
                          <span className="detalle-icon">👤</span>
                          <span className="detalle-text">Cliente: {lote.cliente || 'No especificado'}</span>
                        </div>
                        <div className="detalle">
                          <span className="detalle-icon">📅</span>
                          <span className="detalle-text">Fecha: {lote.fechaInicio?.split('T')[0] || new Date().toLocaleDateString()}</span>
                        </div>
                        {lote.cantidad && (
                          <div className="detalle">
                            <span className="detalle-icon">📦</span>
                            <span className="detalle-text">Cantidad: {lote.cantidad} uds</span>
                          </div>
                        )}
                      </div>
                      {lote.progreso !== undefined && (
                        <div className="progreso-mini">
                          <div className="progreso-bar">
                            <div className="progreso-fill" style={{ width: `${lote.progreso}%` }}></div>
                          </div>
                          <span className="progreso-text">{lote.progreso}%</span>
                        </div>
                      )}
                    </div>
                    <div className="card-footer">
                      {filtro === 'pendientes' && (
                        <button className="btn-tomar" onClick={() => tomarLote(lote)}>
                          <span>📌</span>
                          <span>Tomar Lote</span>
                        </button>
                      )}
                      {filtro === 'misLotes' && (
                        <button className="btn-finalizar" onClick={() => finalizarLote(lote)}>
                          <span>✅</span>
                          <span>Finalizar</span>
                        </button>
                      )}
                      {filtro === 'historial' && (
                        <div className="completado-info">
                          <span>✅ Completado</span>
                          {lote.tiempoReal && <span>⏱️ {lote.tiempoReal} min</span>}
                        </div>
                      )}
                    </div>
                    {filtro === 'misLotes' && (
                      <div className="card-ripple"></div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <table className="lotes-tabla-premium">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Producto</th>
                    <th>Cliente</th>
                    <th>Fecha</th>
                    <th>Cantidad</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {lotesMostrados.map(lote => (
                    <tr key={lote.id} className="tabla-row">
                      <td className="codigo-cell">{lote.codigo || lote.id}</td>
                      <td>{lote.producto || lote.nombre || 'Producto'}</td>
                      <td>{lote.cliente || 'No especificado'}</td>
                      <td>{lote.fechaInicio?.split('T')[0] || new Date().toLocaleDateString()}</td>
                      <td>{lote.cantidad || '-'} uds</td>
                      <td>
                        {filtro === 'pendientes' && <span className="estado-badge pendiente">📋 Pendiente</span>}
                        {filtro === 'misLotes' && <span className="estado-badge proceso">⚡ En proceso</span>}
                        {filtro === 'historial' && <span className="estado-badge completado">✅ Completado</span>}
                      </td>
                      <td className="acciones-cell">
                        {filtro === 'pendientes' && (
                          <button className="btn-icon tomar" onClick={() => tomarLote(lote)} title="Tomar lote">📌</button>
                        )}
                        {filtro === 'misLotes' && (
                          <button className="btn-icon finalizar" onClick={() => finalizarLote(lote)} title="Finalizar">✅</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* ===== ÚLTIMO MOVIMIENTO ===== */}
          {ultimoEscaneo && (
            <div className="ultimo-movimiento animate-slide-up">
              <div className="movimiento-icon">🔄</div>
              <div className="movimiento-info">
                <span className="movimiento-text">Nuevo lote disponible</span>
                <span className="movimiento-detalle">{ultimoEscaneo.lote} → {ultimoEscaneo.area}</span>
              </div>
              <div className="movimiento-progress"></div>
            </div>
          )}
        </>
      )}

      {/* ===== MODAL TOMAR LOTE ===== */}
      {showModalTomar && loteSeleccionado && (
        <div className="modal-premium-overlay" onClick={() => setShowModalTomar(false)}>
          <div className="modal-premium-content modal-tomar" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModalTomar(false)}>✕</button>
            <div className="modal-icon">📌</div>
            <h2>Confirmar toma de lote</h2>
            <p>¿Estás seguro de que quieres tomar este lote?</p>
            <div className="modal-lote-info">
              <div className="info-row">
                <span className="info-label">Código:</span>
                <span className="info-value">{loteSeleccionado.codigo || loteSeleccionado.id}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Producto:</span>
                <span className="info-value">{loteSeleccionado.producto || loteSeleccionado.nombre || 'Producto'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Cliente:</span>
                <span className="info-value">{loteSeleccionado.cliente || 'No especificado'}</span>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-cancelar" onClick={() => setShowModalTomar(false)}>Cancelar</button>
              <button className="btn-confirmar" onClick={confirmarTomaLote}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL FINALIZAR LOTE ===== */}
      {showModalFinalizar && loteSeleccionado && (
        <div className="modal-premium-overlay" onClick={() => setShowModalFinalizar(false)}>
          <div className="modal-premium-content modal-finalizar" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModalFinalizar(false)}>✕</button>
            <div className="modal-icon">✅</div>
            <h2>Finalizar lote</h2>
            <p>¿Has completado el diseño de este lote?</p>
            <div className="modal-lote-info">
              <div className="info-row">
                <span className="info-label">Código:</span>
                <span className="info-value">{loteSeleccionado.codigo || loteSeleccionado.id}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Producto:</span>
                <span className="info-value">{loteSeleccionado.producto || loteSeleccionado.nombre || 'Producto'}</span>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-cancelar" onClick={() => setShowModalFinalizar(false)}>Cancelar</button>
              <button className="btn-confirmar success" onClick={confirmarFinalizarLote}>Finalizar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuzonDiseno;