import React, { useMemo, useState, useEffect } from 'react';
import './TrackingLote.css';

const TrackingLote = ({ loteSeleccionado, areas }) => {
  const [tiempoActual, setTiempoActual] = useState(Date.now());
  const [animacionPaso, setAnimacionPaso] = useState(null);

  // Actualizar tiempo cada segundo para el contador
  useEffect(() => {
    const interval = setInterval(() => {
      setTiempoActual(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ========== TODOS LOS HOOKS ANTES DEL RETURN CONDICIONAL ==========
  
  // Obtener el área actual del lote
  const areaActualObj = areas?.find(a => a.nombre === loteSeleccionado?.areaActual);
  
  // Obtener el historial ordenado
  const historialOrdenado = useMemo(() => {
    if (!loteSeleccionado?.historial || loteSeleccionado.historial.length === 0) {
      return [];
    }
    return [...loteSeleccionado.historial].sort((a, b) => {
      const timeA = a.timestamp || new Date(a.fecha).getTime();
      const timeB = b.timestamp || new Date(b.fecha).getTime();
      return timeA - timeB;
    });
  }, [loteSeleccionado?.historial]);

  // Obtener el movimiento actual
  const movimientoActual = useMemo(() => {
    if (!loteSeleccionado) return null;
    const actual = historialOrdenado.find(h => h.actual === true);
    if (actual) return actual;
    if (historialOrdenado.length > 0) return historialOrdenado[historialOrdenado.length - 1];
    return null;
  }, [historialOrdenado, loteSeleccionado]);

  // Calcular tiempo en área actual
  const tiempoEnAreaActual = useMemo(() => {
    if (!movimientoActual || !movimientoActual.timestamp) return null;
    const tiempoTranscurrido = Math.floor((tiempoActual - movimientoActual.timestamp) / 60000);
    if (tiempoTranscurrido < 1) return 'Menos de 1 minuto';
    if (tiempoTranscurrido < 60) return `${tiempoTranscurrido} min`;
    const horas = Math.floor(tiempoTranscurrido / 60);
    const minutos = tiempoTranscurrido % 60;
    return `${horas}h ${minutos}m`;
  }, [movimientoActual, tiempoActual]);

  // Estadísticas
  const estadisticas = useMemo(() => {
    if (!loteSeleccionado) {
      return {
        areasCompletadas: 0,
        totalMovimientos: 0,
        reingresos: 0,
        tiempoTotal: 0,
        progresoReal: 0
      };
    }
    const areasVisitadas = new Set(historialOrdenado.map(h => h.area));
    const reingresos = historialOrdenado.filter(h => h.reingreso === true).length;
    const tiempoTotal = historialOrdenado.reduce((total, h, idx) => {
      if (idx === 0) return total;
      const prevTime = historialOrdenado[idx - 1].timestamp || new Date(historialOrdenado[idx - 1].fecha).getTime();
      const currTime = h.timestamp || new Date(h.fecha).getTime();
      return total + (currTime - prevTime);
    }, 0);
    
    return {
      areasCompletadas: areasVisitadas.size,
      totalMovimientos: historialOrdenado.length,
      reingresos: reingresos,
      tiempoTotal: tiempoTotal > 0 ? Math.floor(tiempoTotal / 60000) : 0,
      progresoReal: Math.min(100, Math.floor((areasVisitadas.size / (areas?.length || 1)) * 100))
    };
  }, [historialOrdenado, areas, loteSeleccionado]);

  // Calcular porcentaje de progreso general
  const progresoGeneral = useMemo(() => {
    if (!loteSeleccionado || !areas) return 0;
    const areasCompletadas = areas?.filter(a => {
      const paso = historialOrdenado.find(h => h.area === a.nombre);
      return paso || loteSeleccionado.areaActual === a.nombre;
    }).length || 0;
    return Math.min(100, Math.round((areasCompletadas / (areas?.length || 1)) * 100));
  }, [areas, historialOrdenado, loteSeleccionado]);

  // Formatear fecha
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return 'Fecha no disponible';
    const fecha = new Date(fechaStr);
    if (isNaN(fecha.getTime())) return fechaStr;
    return fecha.toLocaleString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  };

  // Determinar estado de área para línea de tiempo
  const getEstadoArea = (area) => {
    if (!loteSeleccionado) return 'pending';
    const paso = historialOrdenado.find(h => h.area === area.nombre);
    const esAreaActual = loteSeleccionado.areaActual === area.nombre;
    if (esAreaActual) return 'active';
    if (paso && paso.actual === true) return 'active';
    if (paso && paso.reingreso === true) return 'reingreso';
    if (paso) return 'completed';
    return 'pending';
  };

  // ========== RETURN CONDICIONAL DESPUÉS DE TODOS LOS HOOKS ==========
  
  // Si no hay lote seleccionado, mostrar mensaje
  if (!loteSeleccionado) {
    return (
      <div className="tracking-premium-empty">
        <div className="empty-glow"></div>
        <div className="empty-content">
          <div className="empty-icon-container">
            <div className="empty-icon-pulse"></div>
            <span className="empty-icon">📦</span>
          </div>
          <h3>No hay lote seleccionado</h3>
          <p>Selecciona un lote de la lista para ver su trazabilidad completa</p>
          <div className="empty-hint-premium">
            <span className="hint-icon">💡</span>
            <span>Haz clic en cualquier lote para ver su seguimiento detallado</span>
          </div>
          <div className="empty-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    );
  }

  // ========== RENDER PRINCIPAL ==========
  
  return (
    <div className="tracking-premium-ultra">
      {/* Header con información del lote */}
      <div className="tracking-premium-header">
        <div className="lote-info-premium-card">
          <div className="lote-badge-premium-3d" style={{ background: `linear-gradient(135deg, ${areaActualObj?.color || '#6366f1'}, ${areaActualObj?.color || '#6366f1'}cc)` }}>
            <div className="badge-glow-3d"></div>
            <span className="lote-icon-premium">📦</span>
            <div className="lote-text-premium">
              <span className="lote-id-premium">{loteSeleccionado.id}</span>
              <span className="lote-codigo-premium">{loteSeleccionado.codigo?.slice(0, 25)}</span>
            </div>
          </div>
          <div className="producto-info-premium">
            <span className="producto-nombre-premium">{loteSeleccionado.producto || 'Producto'}</span>
            <span className="producto-cliente-premium">
              <span className="cliente-icon">👥</span>
              {loteSeleccionado.cliente || 'Cliente'}
            </span>
          </div>
        </div>
        
        {/* Área actual con efecto 3D */}
        <div className="area-actual-premium-card">
          <div className="area-actual-glow" style={{ background: areaActualObj?.color }}></div>
          <div className="area-actual-content">
            <div className="area-actual-icon" style={{ background: areaActualObj?.color }}>
              <span>{areaActualObj?.icono || '📍'}</span>
              <div className="icon-pulse"></div>
            </div>
            <div className="area-actual-details">
              <span className="area-actual-label">UBICACIÓN ACTUAL</span>
              <span className="area-actual-name" style={{ color: areaActualObj?.color }}>
                {loteSeleccionado.areaActual || 'No asignada'}
              </span>
              {tiempoEnAreaActual && (
                <div className="area-actual-tiempo">
                  <span className="tiempo-icon">⏱️</span>
                  <span className="tiempo-valor">{tiempoEnAreaActual}</span>
                  <span className="tiempo-label">en esta área</span>
                </div>
              )}
            </div>
          </div>
          <div className="area-actual-ripple"></div>
        </div>
      </div>

      {/* Progreso General con efecto 3D */}
      <div className="progreso-premium-3d">
        <div className="progreso-header-premium">
          <div className="progreso-titulo-premium">
            <span className="titulo-icon">📊</span>
            <span>Progreso de Producción</span>
          </div>
          <div className="progreso-valor-premium">
            <span className="valor-numero">{progresoGeneral}%</span>
            <div className="valor-barra">
              <div className="barra-progreso" style={{ width: `${progresoGeneral}%`, background: areaActualObj?.color }}></div>
            </div>
          </div>
        </div>
        <div className="progreso-barra-3d-container">
          <div className="progreso-barra-fondo"></div>
          <div 
            className="progreso-barra-llenado" 
            style={{ 
              width: `${loteSeleccionado.progreso || 0}%`,
              background: `linear-gradient(90deg, ${areaActualObj?.color || '#6366f1'}, ${areaActualObj?.color || '#6366f1'}dd, ${areaActualObj?.color || '#6366f1'})`
            }}
          >
            <div className="barra-shimmer-effect"></div>
          </div>
          <div className="progreso-marcadores">
            <div className="marcador" style={{ left: '0%' }}><span>Inicio</span></div>
            <div className="marcador" style={{ left: '25%' }}><span>Diseño</span></div>
            <div className="marcador" style={{ left: '50%' }}><span>Producción</span></div>
            <div className="marcador" style={{ left: '75%' }}><span>Calidad</span></div>
            <div className="marcador" style={{ left: '100%' }}><span>Completado</span></div>
          </div>
        </div>
      </div>

      {/* Línea de tiempo 3D */}
      <div className="timeline-premium-3d">
        <div className="timeline-header-premium">
          <div className="timeline-title">
            <span className="title-icon">⏳</span>
            <h3>Línea de tiempo del proceso</h3>
          </div>
          <div className="timeline-stats">
            <div className="stat-badge">
              <span className="stat-value">{historialOrdenado.length}</span>
              <span className="stat-label">movimientos</span>
            </div>
            <div className="stat-badge">
              <span className="stat-value">{estadisticas.reingresos}</span>
              <span className="stat-label">reingresos</span>
            </div>
          </div>
        </div>

        <div className="timeline-track-premium-3d">
          {areas && areas.map((area, index) => {
            const estado = getEstadoArea(area);
            const paso = historialOrdenado.find(h => h.area === area.nombre);
            const esAreaActual = loteSeleccionado.areaActual === area.nombre;
            const esUltimo = index === areas.length - 1;
            
            let estadoIcono = '';
            let estadoColor = '';
            let animacion = '';
            
            if (estado === 'active') {
              estadoIcono = '●';
              estadoColor = area.color;
              animacion = 'pulse-glow';
            } else if (estado === 'completed') {
              estadoIcono = '✓';
              estadoColor = '#10b981';
            } else if (estado === 'reingreso') {
              estadoIcono = '↺';
              estadoColor = '#f59e0b';
              animacion = 'rotate';
            } else {
              estadoIcono = '○';
              estadoColor = '#475569';
            }
            
            return (
              <div 
                key={area.id} 
                className={`timeline-step-premium-3d ${estado} ${animacion}`}
                style={{ '--step-color': area.color }}
                onMouseEnter={() => setAnimacionPaso(area.id)}
                onMouseLeave={() => setAnimacionPaso(null)}
              >
                <div className="step-marker-premium-3d">
                  <div className="marker-outer-ring" style={{ borderColor: estadoColor }}>
                    <div className="marker-inner" style={{ background: estadoColor }}>
                      <span className="marker-icon">{estadoIcono}</span>
                    </div>
                  </div>
                  {estado === 'active' && <div className="marker-wave" style={{ background: area.color }}></div>}
                </div>
                
                <div className={`step-content-premium-3d ${animacionPaso === area.id ? 'hovered' : ''}`}>
                  <div className="step-header-premium">
                    <div className="step-area-premium">
                      <span className="area-icon">{area.icono}</span>
                      <span className="area-name" style={{ color: estado === 'active' ? area.color : undefined }}>
                        {area.nombre}
                      </span>
                      {estado === 'active' && (
                        <div className="active-badge-premium">
                          <div className="badge-dot"></div>
                          <span>EN PROCESO</span>
                        </div>
                      )}
                      {estado === 'reingreso' && (
                        <div className="reingreso-badge-premium">
                          <span>↺</span>
                          <span>Reingreso #{paso?.numeroPaso || 1}</span>
                        </div>
                      )}
                    </div>
                    <div className="step-estado-badge-premium" style={{ 
                      background: estado === 'completed' ? '#10b98120' : estado === 'active' ? `${area.color}20` : '#33415520',
                      color: estado === 'completed' ? '#10b981' : estado === 'active' ? area.color : '#94a3b8'
                    }}>
                      {estado === 'completed' && '✓ Completado'}
                      {estado === 'active' && '● En proceso'}
                      {estado === 'reingreso' && '↺ Reingreso'}
                      {estado === 'pending' && '○ Pendiente'}
                    </div>
                  </div>
                  
                  {paso && (
                    <div className="step-details-premium">
                      <div className="detail-time">
                        <span className="time-icon">🕐</span>
                        <span className="time-text">{formatearFecha(paso.fecha)}</span>
                      </div>
                      {paso.operador && (
                        <div className="detail-operator">
                          <span className="operator-icon">👤</span>
                          <span className="operator-text">{paso.operador}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {estado === 'active' && tiempoEnAreaActual && (
                    <div className="step-tiempo-premium">
                      <div className="tiempo-icon-mini">⏱️</div>
                      <div className="tiempo-texto">
                        <span>Tiempo en área</span>
                        <strong>{tiempoEnAreaActual}</strong>
                      </div>
                      <div className="tiempo-progress">
                        <div className="tiempo-progress-bar" style={{ width: `${Math.min(100, (parseInt(tiempoEnAreaActual) / 120) * 100)}%` }}></div>
                      </div>
                    </div>
                  )}
                </div>
                
                {!esUltimo && (
                  <div className={`step-connector-premium-3d ${estado === 'completed' ? 'completed' : ''}`}>
                    <div className="connector-line"></div>
                    <div className="connector-glow"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Historial de movimientos premium */}
      <div className="historial-premium-ultra">
        <div className="historial-header-premium">
          <div className="historial-title">
            <span className="title-icon">📜</span>
            <h4>Historial de movimientos</h4>
          </div>
          <div className="historial-stats">
            <div className="stat">
              <span className="stat-value">{estadisticas.totalMovimientos}</span>
              <span className="stat-label">movimientos</span>
            </div>
            <div className="stat">
              <span className="stat-value">{estadisticas.areasCompletadas}</span>
              <span className="stat-label">áreas visitadas</span>
            </div>
          </div>
        </div>
        
        <div className="historial-lista-premium-ultra">
          {historialOrdenado.length === 0 ? (
            <div className="empty-historial-premium">
              <div className="empty-animation-premium">
                <span>🚀</span>
                <span>✨</span>
                <span>⚡</span>
              </div>
              <p>No hay movimientos registrados</p>
              <small>Escanea el lote para iniciar su trazabilidad</small>
            </div>
          ) : (
            historialOrdenado.map((movimiento, idx) => {
              const areaInfo = areas?.find(a => a.nombre === movimiento.area);
              const esUltimo = idx === historialOrdenado.length - 1;
              const esReingreso = movimiento.reingreso === true;
              const esActual = movimiento.actual === true;
              
              return (
                <div key={`${movimiento.area}_${movimiento.timestamp || idx}`} className={`historial-item-premium-ultra ${esActual ? 'actual' : ''} ${esReingreso ? 'reingreso' : ''}`}>
                  <div className="item-timeline-premium">
                    <div className="timeline-dot-premium" style={{ background: areaInfo?.color || '#6366f1' }}>
                      <div className="dot-pulse"></div>
                    </div>
                    {!esUltimo && <div className="timeline-line-premium"></div>}
                  </div>
                  <div className="item-icon-premium" style={{ background: `${areaInfo?.color || '#6366f1'}20`, color: areaInfo?.color || '#6366f1' }}>
                    {esReingreso ? '↺' : '→'}
                  </div>
                  <div className="item-content-premium">
                    <div className="item-header-premium">
                      <div className="item-area-premium">
                        <span className="area-icon-mini">{areaInfo?.icono || '📍'}</span>
                        <span className="area-name-premium" style={{ color: areaInfo?.color || '#6366f1' }}>
                          {movimiento.area}
                        </span>
                        {esReingreso && (
                          <span className="reingreso-tag-premium">
                            Reingreso #{movimiento.numeroPaso || 1}
                          </span>
                        )}
                        {esActual && (
                          <span className="actual-tag-premium">ACTUAL</span>
                        )}
                      </div>
                      <div className="item-time-premium">
                        <span className="time-icon">🕐</span>
                        <span>{formatearFecha(movimiento.fecha)}</span>
                      </div>
                    </div>
                    <div className="item-footer-premium">
                      <div className="item-operator-premium">
                        <span className="operator-icon">👤</span>
                        <span>{movimiento.operador || 'Sistema'}</span>
                      </div>
                      {esReingreso && (
                        <div className="item-reingreso-info-premium">
                          <span className="info-icon">ℹ️</span>
                          <span>Este lote ya había pasado por esta área anteriormente</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {esActual && (
                    <div className="item-glow-premium" style={{ background: areaInfo?.color || '#6366f1' }}></div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Estadísticas rápidas premium */}
      <div className="stats-premium-grid">
        <div className="stat-premium-card" style={{ '--card-color': '#10b981' }}>
          <div className="card-icon-container">
            <span className="card-icon">✓</span>
            <div className="card-icon-bg"></div>
          </div>
          <div className="card-info">
            <span className="card-value">{estadisticas.areasCompletadas}</span>
            <span className="card-label">Áreas completadas</span>
          </div>
          <div className="card-progress-bar">
            <div className="card-progress-fill" style={{ width: `${(estadisticas.areasCompletadas / (areas?.length || 1)) * 100}%` }}></div>
          </div>
        </div>
        
        <div className="stat-premium-card" style={{ '--card-color': '#6366f1' }}>
          <div className="card-icon-container">
            <span className="card-icon">🔄</span>
            <div className="card-icon-bg"></div>
          </div>
          <div className="card-info">
            <span className="card-value">{estadisticas.totalMovimientos}</span>
            <span className="card-label">Movimientos totales</span>
          </div>
          <div className="card-trend-premium">
            <span>+{Math.floor(Math.random() * 20)}%</span>
          </div>
        </div>
        
        <div className="stat-premium-card" style={{ '--card-color': '#f59e0b' }}>
          <div className="card-icon-container">
            <span className="card-icon">↺</span>
            <div className="card-icon-bg"></div>
          </div>
          <div className="card-info">
            <span className="card-value">{estadisticas.reingresos}</span>
            <span className="card-label">Reingresos</span>
          </div>
          <div className="card-warning-premium">
            <span>⚠️</span>
          </div>
        </div>
        
        <div className="stat-premium-card" style={{ '--card-color': '#3b82f6' }}>
          <div className="card-icon-container">
            <span className="card-icon">⏱️</span>
            <div className="card-icon-bg"></div>
          </div>
          <div className="card-info">
            <span className="card-value">{estadisticas.tiempoTotal}</span>
            <span className="card-label">Minutos totales</span>
          </div>
          <div className="card-eta-premium">
            <span>promedio: {Math.floor(estadisticas.tiempoTotal / Math.max(1, estadisticas.totalMovimientos))} min/mov</span>
          </div>
        </div>
      </div>

      {/* Indicador de tiempo real */}
      <div className="realtime-premium-indicator">
        <div className="realtime-dot-premium"></div>
        <span className="realtime-text">Actualizando en tiempo real</span>
        <div className="realtime-wave"></div>
      </div>
    </div>
  );
};

export default TrackingLote;