import React from 'react';
import './TrackingLote.css';

const TrackingLote = ({ loteSeleccionado, areas, predicciones }) => {
  if (!loteSeleccionado) {
    return (
      <div className="tracking-placeholder">
        <div className="placeholder-icon">🔍</div>
        <h3>Selecciona un lote</h3>
        <p>Haz clic en cualquier lote para ver su tracking completo</p>
      </div>
    );
  }

  // Ordenar áreas por flujo de producción
  const areasEnOrden = areas.sort((a, b) => a.orden - b.orden);

  // Encontrar el área actual
  const areaActual = areas.find(a => a.nombre === loteSeleccionado.areaActual);

  return (
    <div className="tracking-lote-container">
      {/* HEADER DEL LOTE */}
      <div className="tracking-header">
        <div className="lote-titulo">
          <h2>{loteSeleccionado.id}</h2>
          <span className={`estado-badge ${loteSeleccionado.estado}`}>
            {loteSeleccionado.estado.replace('_', ' ')}
          </span>
        </div>
        <p className="lote-producto">{loteSeleccionado.producto}</p>
      </div>

      {/* INFO RÁPIDA */}
      <div className="info-rapida-grid">
        <div className="info-item">
          <span className="info-label">Cliente</span>
          <span className="info-valor">{loteSeleccionado.cliente}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Cantidad</span>
          <span className="info-valor">{loteSeleccionado.cantidad} uds</span>
        </div>
        <div className="info-item">
          <span className="info-label">Responsable</span>
          <span className="info-valor">{loteSeleccionado.responsable}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Inicio</span>
          <span className="info-valor">{loteSeleccionado.fechaInicio}</span>
        </div>
      </div>

      {/* PROGRESO GENERAL */}
      <div className="progreso-general">
        <div className="progreso-header">
          <span>Progreso general</span>
          <span className="progreso-porcentaje">{loteSeleccionado.progreso}%</span>
        </div>
        <div className="barra-progreso-grande">
          <div 
            className="barra-progreso-llenado" 
            style={{ width: `${loteSeleccionado.progreso}%` }}
          ></div>
        </div>
      </div>

      {/* ÁREA ACTUAL DESTACADA */}
      {areaActual && (
        <div className="area-actual-destacada" style={{ borderColor: areaActual.color }}>
          <div className="area-actual-icono" style={{ background: areaActual.color }}>
            {areaActual.icono}
          </div>
          <div className="area-actual-info">
            <span className="area-actual-label">ÁREA ACTUAL</span>
            <span className="area-actual-nombre">{areaActual.nombre}</span>
          </div>
          <div className="area-actual-tiempo">
            <span className="tiempo-label">Tiempo restante</span>
            <span className="tiempo-valor">{loteSeleccionado.tiempoRestante}</span>
          </div>
        </div>
      )}

      {/* PREDICCIÓN IA (si existe) */}
      {predicciones[loteSeleccionado.id] && (
        <div className="prediccion-ia-card">
          <div className="prediccion-header">
            <span className="prediccion-icono">🤖</span>
            <span className="prediccion-titulo">Predicción IA</span>
          </div>
          <div className="prediccion-detalles">
            <div className="prediccion-item">
              <span>Tiempo estimado</span>
              <strong>{predicciones[loteSeleccionado.id].tiempoEstimado}</strong>
            </div>
            <div className="prediccion-item">
              <span>Confianza</span>
              <div className="confianza-indicador">
                <div className="confianza-barra">
                  <div 
                    className="confianza-llenado" 
                    style={{ 
                      width: `${predicciones[loteSeleccionado.id].confianza}%`,
                      backgroundColor: predicciones[loteSeleccionado.id].confianza > 80 ? '#22c55e' :
                                     predicciones[loteSeleccionado.id].confianza > 60 ? '#f59e0b' : '#ef4444'
                    }}
                  ></div>
                </div>
                <span>{predicciones[loteSeleccionado.id].confianza}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LÍNEA DE TIEMPO - TRACKING COMPLETO */}
      <div className="timeline-completo">
        <h3 className="timeline-titulo">
          <span>📋 Línea de tiempo</span>
          <span className="timeline-sub">{loteSeleccionado.historial.length} pasos</span>
        </h3>

        <div className="timeline-track">
          {areasEnOrden.map((area, index) => {
            const hito = loteSeleccionado.historial.find(h => h.area === area.nombre);
            const esActual = loteSeleccionado.areaActual === area.nombre;
            const esSiguiente = !hito && !esActual && 
              areasEnOrden.findIndex(a => a.nombre === loteSeleccionado.areaActual) < index;

            return (
              <div 
                key={area.id} 
                className={`timeline-step ${hito ? 'completado' : ''} ${esActual ? 'actual' : ''} ${esSiguiente ? 'siguiente' : ''}`}
              >
                {/* Conector entre pasos */}
                {index < areasEnOrden.length - 1 && (
                  <div 
                    className="timeline-connector"
                    style={{
                      backgroundColor: hito && areasEnOrden[index + 1].historial ? 
                        areasEnOrden[index + 1].color : 'var(--border)'
                    }}
                  ></div>
                )}

                {/* Marker del paso */}
                <div 
                  className="timeline-marker"
                  style={{ 
                    backgroundColor: hito ? area.color : 
                                   esActual ? area.color : 
                                   'var(--gray-200)',
                    borderColor: esActual ? area.color : 'transparent'
                  }}
                >
                  {hito ? '✓' : esActual ? '●' : index + 1}
                </div>

                {/* Contenido del paso */}
                <div className="timeline-step-content">
                  <div className="step-header">
                    <span className="step-area">
                      {area.icono} {area.nombre}
                    </span>
                    {hito && (
                      <span className="step-fecha">{hito.fecha.split(' ')[0]}</span>
                    )}
                  </div>
                  
                  {hito ? (
                    <div className="step-detalle">
                      <span className="step-operador">👤 {hito.operador}</span>
                      <span className="step-hora">{hito.fecha.split(' ')[1]}</span>
                    </div>
                  ) : esActual ? (
                    <div className="step-detalle actual">
                      <span className="pulse"></span>
                      <span>En proceso...</span>
                    </div>
                  ) : esSiguiente ? (
                    <div className="step-detalle pendiente">
                      <span>⏳ Próximo</span>
                    </div>
                  ) : (
                    <div className="step-detalle pendiente">
                      <span>⏱️ Pendiente</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TIEMPOS POR ÁREA */}
      <div className="tiempos-area-container">
        <h4 className="tiempos-titulo">⏱️ Tiempos por área</h4>
        <div className="tiempos-grid">
          {loteSeleccionado.historial.map((hito, idx) => {
            const area = areas.find(a => a.nombre === hito.area);
            const tiempoSiguiente = idx < loteSeleccionado.historial.length - 1 ?
              new Date(loteSeleccionado.historial[idx + 1].fecha) - new Date(hito.fecha) : null;
            
            const minutos = tiempoSiguiente ? Math.round(tiempoSiguiente / 60000) : null;

            return (
              <div key={idx} className="tiempo-area-item">
                <div className="tiempo-area-icono" style={{ background: area?.color + '20', color: area?.color }}>
                  {area?.icono}
                </div>
                <div className="tiempo-area-info">
                  <span className="tiempo-area-nombre">{hito.area}</span>
                  <span className="tiempo-area-fecha">{hito.fecha}</span>
                </div>
                {minutos && (
                  <span className="tiempo-area-duracion">{minutos} min</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrackingLote;