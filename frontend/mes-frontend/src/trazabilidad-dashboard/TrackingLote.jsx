import React from 'react';
import './TrackingLote.css';

const TrackingLote = ({ loteSeleccionado, areas }) => {
  if (!loteSeleccionado) {
    return (
      <div className="tracking-placeholder">
        <div className="placeholder-icon">🔍</div>
        <h3>Selecciona un lote</h3>
        <p>Haz clic en cualquier lote para ver su tracking completo</p>
      </div>
    );
  }

  const areasEnOrden = [...areas].sort((a, b) => a.orden - b.orden);
  const areaActual = areas.find(a => a.nombre === loteSeleccionado.areaActual);

  const formatearFecha = (fechaStr) => {
    try {
      const fecha = new Date(fechaStr);
      return fecha.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch {
      return fechaStr;
    }
  };

  return (
    <div className="tracking-lote-container">
      {/* HEADER */}
      <div className="tracking-header">
        <div className="lote-titulo">
          <h2 className="lote-id-tracking">{loteSeleccionado.id}</h2>
          <span className={`estado-badge ${loteSeleccionado.estado}`}>
            {loteSeleccionado.estado?.replace('_', ' ') || 'En proceso'}
          </span>
        </div>
        <p className="lote-producto-tracking">{loteSeleccionado.producto}</p>
        {loteSeleccionado.codigo && (
          <p className="lote-codigo-tracking">
            <span className="codigo-label">Código:</span>
            <span className="codigo-valor">{loteSeleccionado.codigo}</span>
          </p>
        )}
      </div>

      {/* INFO RÁPIDA */}
      <div className="info-rapida-grid">
        <div className="info-item">
          <span className="info-label">Cliente</span>
          <span className="info-valor">{loteSeleccionado.cliente || 'N/A'}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Cantidad</span>
          <span className="info-valor">{loteSeleccionado.cantidad || 0} uds</span>
        </div>
        <div className="info-item">
          <span className="info-label">Responsable</span>
          <span className="info-valor">{loteSeleccionado.responsable || 'N/A'}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Inicio</span>
          <span className="info-valor">{formatearFecha(loteSeleccionado.fechaInicio)}</span>
        </div>
      </div>

      {/* PROGRESO */}
      <div className="progreso-general">
        <div className="progreso-header">
          <span>Progreso general</span>
          <span className="progreso-porcentaje">{loteSeleccionado.progreso || 0}%</span>
        </div>
        <div className="barra-progreso-grande">
          <div className="barra-progreso-llenado" style={{ width: `${loteSeleccionado.progreso || 0}%` }}></div>
        </div>
      </div>

      {/* ÁREA ACTUAL */}
      {areaActual && (
        <div className="area-actual-destacada" style={{ borderColor: areaActual.color }}>
          <div className="area-actual-icono" style={{ background: areaActual.color }}>{areaActual.icono}</div>
          <div className="area-actual-info">
            <span className="area-actual-label">ÁREA ACTUAL</span>
            <span className="area-actual-nombre">{areaActual.nombre}</span>
          </div>
          <div className="area-actual-tiempo">
            <span className="tiempo-label">Tiempo restante</span>
            <span className="tiempo-valor">{loteSeleccionado.tiempoRestante || '—'}</span>
          </div>
        </div>
      )}

      {/* TIMELINE */}
      <div className="timeline-completo">
        <h3 className="timeline-titulo">
          <span>📋 Línea de tiempo</span>
          <span className="timeline-sub">{loteSeleccionado.historial?.length || 0} pasos</span>
        </h3>

        <div className="timeline-track">
          {areasEnOrden.map((area, index) => {
            const hito = loteSeleccionado.historial?.find(h => h.area === area.nombre);
            const esActual = loteSeleccionado.areaActual === area.nombre;
            const indiceActual = areasEnOrden.findIndex(a => a.nombre === loteSeleccionado.areaActual);
            const esCompletado = hito || indiceActual > index;

            return (
              <div key={area.id} className={`timeline-step ${hito ? 'completado' : ''} ${esActual ? 'actual' : ''}`}>
                <div className="timeline-marker" style={{ backgroundColor: hito ? area.color : esActual ? area.color : esCompletado ? area.color + '40' : 'var(--gray-300)' }}>
                  {hito ? '✓' : esActual ? '●' : index + 1}
                </div>
                <div className="timeline-step-content">
                  <div className="step-header">
                    <span className="step-area">{area.icono} {area.nombre}</span>
                    {hito && <span className="step-fecha">{formatearFecha(hito.fecha)}</span>}
                  </div>
                  {hito ? (
                    <div className="step-detalle">
                      <span className="step-operador">👤 {hito.operador || 'Sistema'}</span>
                      {hito.reingreso && <span className="step-reingreso">↩️ {hito.numeroPaso}</span>}
                    </div>
                  ) : esActual ? (
                    <div className="step-detalle actual">
                      <span className="pulse-dot"></span> En proceso...
                    </div>
                  ) : (
                    <div className="step-detalle pendiente">⏱️ Pendiente</div>
                  )}
                </div>
                {index < areasEnOrden.length - 1 && (
                  <div className="timeline-connector" style={{ backgroundColor: (hito || indiceActual > index) ? area.color : 'var(--border)' }}></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* TIEMPOS POR ÁREA */}
      {loteSeleccionado.historial && loteSeleccionado.historial.length > 0 && (
        <div className="tiempos-area-container">
          <h4 className="tiempos-titulo">⏱️ Tiempos por área</h4>
          <div className="tiempos-grid">
            {loteSeleccionado.historial.map((hito, idx) => {
              const area = areas.find(a => a.nombre === hito.area);
              let duracion = null;
              if (idx < loteSeleccionado.historial.length - 1) {
                try {
                  const fechaActual = new Date(hito.fecha).getTime();
                  const fechaSiguiente = new Date(loteSeleccionado.historial[idx + 1].fecha).getTime();
                  if (!isNaN(fechaActual) && !isNaN(fechaSiguiente)) {
                    const minutos = Math.round((fechaSiguiente - fechaActual) / 60000);
                    if (minutos > 0 && minutos < 1440) {
                      duracion = minutos < 60 ? `${minutos} min` : `${Math.floor(minutos / 60)}h ${minutos % 60}min`;
                    }
                  }
                } catch (e) {}
              }

              return (
                <div key={idx} className="tiempo-area-item">
                  <div className="tiempo-area-icono" style={{ background: area?.color + '20', color: area?.color }}>
                    {area?.icono || '📍'}
                  </div>
                  <div className="tiempo-area-info">
                    <span className="tiempo-area-nombre">{hito.area}</span>
                    <span className="tiempo-area-fecha">{formatearFecha(hito.fecha)}</span>
                  </div>
                  {duracion ? (
                    <span className="tiempo-area-duracion">{duracion}</span>
                  ) : idx === loteSeleccionado.historial.length - 1 ? (
                    <span className="tiempo-area-duracion actual">En curso</span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* METADATOS */}
      {loteSeleccionado.metadatos && (
        <div className="metadatos-lote">
          <h4 className="metadatos-titulo">📋 Información del código</h4>
          <div className="metadatos-grid">
            {loteSeleccionado.metadatos.loteV && (
              <div className="metadato-item">
                <span className="metadato-label">Lote V</span>
                <span className="metadato-valor">{loteSeleccionado.metadatos.loteV}</span>
              </div>
            )}
            {loteSeleccionado.metadatos.loteIF && (
              <div className="metadato-item">
                <span className="metadato-label">Lote IF</span>
                <span className="metadato-valor">{loteSeleccionado.metadatos.loteIF}</span>
              </div>
            )}
            {loteSeleccionado.metadatos.fechaProduccion && (
              <div className="metadato-item">
                <span className="metadato-label">Fecha prod.</span>
                <span className="metadato-valor">{loteSeleccionado.metadatos.fechaProduccion}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackingLote;