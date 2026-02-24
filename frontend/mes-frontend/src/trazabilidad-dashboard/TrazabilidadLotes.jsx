import React, { useState, useEffect } from 'react';
import './TrazabilidadLotes.css';

export default function TrazabilidadLotes() {
  const [loteActual, setLoteActual] = useState(null);
  const [codigoLote, setCodigoLote] = useState('');
  const [historial, setHistorial] = useState([]);
  const [ultimosLotes, setUltimosLotes] = useState([]);
  const [modoEscaneo, setModoEscaneo] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [filtroHistorial, setFiltroHistorial] = useState('todos');
  const [tiempoReal, setTiempoReal] = useState(new Date());
  const [conectado, setConectado] = useState(true);
  const [notificacion, setNotificacion] = useState(null);

  // Base de datos de lotes
  const lotesDB = {
    'LOTE-001': {
      id: 'LOTE-001',
      producto: 'Camiseta Premium Nike',
      cliente: 'Nike',
      cantidad: 1500,
      fechaInicio: '2024-02-20',
      fechaEstimada: '2024-02-28',
      progreso: 80,
      responsable: 'Carlos Rodríguez',
      prioridad: 'Alta',
      temperatura: 23.5,
      humedad: 45,
      imagen: '👕',
      estaciones: [
        { nombre: 'Recepción', estado: 'completado', fecha: '2024-02-20 08:30', responsable: 'Ana López' },
        { nombre: 'Diseño', estado: 'completado', fecha: '2024-02-21 10:15', responsable: 'Pedro Sánchez' },
        { nombre: 'Corte', estado: 'completado', fecha: '2024-02-22 09:45', responsable: 'María García' },
        { nombre: 'Costura', estado: 'completado', fecha: '2024-02-23 11:20', responsable: 'Juan Pérez' },
        { nombre: 'Estampado', estado: 'en-proceso', fecha: '2024-02-24 09:15', responsable: 'Roberto Díaz' },
        { nombre: 'Control Calidad', estado: 'pendiente', fecha: null, responsable: null },
        { nombre: 'Empaque', estado: 'pendiente', fecha: null, responsable: null },
        { nombre: 'Despacho', estado: 'pendiente', fecha: null, responsable: null }
      ]
    },
    'LOTE-002': {
      id: 'LOTE-002',
      producto: 'Uniforme Deportivo Adidas',
      cliente: 'Adidas',
      cantidad: 800,
      fechaInicio: '2024-02-21',
      fechaEstimada: '2024-02-27',
      progreso: 90,
      responsable: 'Laura Torres',
      prioridad: 'Media',
      temperatura: 22.8,
      humedad: 48,
      imagen: '⚽',
      estaciones: [
        { nombre: 'Recepción', estado: 'completado', fecha: '2024-02-21 09:00', responsable: 'Ana López' },
        { nombre: 'Diseño', estado: 'completado', fecha: '2024-02-22 11:30', responsable: 'Pedro Sánchez' },
        { nombre: 'Corte', estado: 'completado', fecha: '2024-02-23 10:20', responsable: 'María García' },
        { nombre: 'Costura', estado: 'completado', fecha: '2024-02-24 14:15', responsable: 'Juan Pérez' },
        { nombre: 'Estampado', estado: 'completado', fecha: '2024-02-25 13:40', responsable: 'Roberto Díaz' },
        { nombre: 'Control Calidad', estado: 'completado', fecha: '2024-02-26 09:30', responsable: 'Sofía Castro' },
        { nombre: 'Empaque', estado: 'en-proceso', fecha: '2024-02-26 11:20', responsable: 'Carlos Ruiz' },
        { nombre: 'Despacho', estado: 'pendiente', fecha: null, responsable: null }
      ]
    },
    'LOTE-003': {
      id: 'LOTE-003',
      producto: 'Gorra Personalizada',
      cliente: 'Local Store',
      cantidad: 300,
      fechaInicio: '2024-02-22',
      fechaEstimada: '2024-03-01',
      progreso: 45,
      responsable: 'Roberto Díaz',
      prioridad: 'Baja',
      temperatura: 23.1,
      humedad: 46,
      imagen: '🧢',
      estaciones: [
        { nombre: 'Recepción', estado: 'completado', fecha: '2024-02-22 08:15', responsable: 'Ana López' },
        { nombre: 'Diseño', estado: 'completado', fecha: '2024-02-23 10:30', responsable: 'Pedro Sánchez' },
        { nombre: 'Corte', estado: 'en-proceso', fecha: '2024-02-24 09:45', responsable: 'María García' },
        { nombre: 'Costura', estado: 'pendiente', fecha: null, responsable: null },
        { nombre: 'Estampado', estado: 'pendiente', fecha: null, responsable: null },
        { nombre: 'Control Calidad', estado: 'pendiente', fecha: null, responsable: null },
        { nombre: 'Empaque', estado: 'pendiente', fecha: null, responsable: null },
        { nombre: 'Despacho', estado: 'pendiente', fecha: null, responsable: null }
      ]
    }
  };

  // Cargar últimos lotes al iniciar
  useEffect(() => {
    const lotesArray = Object.values(lotesDB).map(lote => ({
      ...lote,
      seleccionado: lote.id === 'LOTE-001'
    }));
    setUltimosLotes(lotesArray);
    seleccionarLote('LOTE-001');
  }, []);

  // ⚡ TIEMPO REAL ⚡
  useEffect(() => {
    if (!loteActual) return;

    const interval = setInterval(() => {
      setTiempoReal(new Date());

      setLoteActual(prev => {
        if (!prev) return prev;

        const estacionEnProceso = prev.estaciones.find(e => e.estado === 'en-proceso');
        
        if (estacionEnProceso && Math.random() > 0.7) {
          const nuevasEstaciones = prev.estaciones.map(e => {
            if (e.nombre === estacionEnProceso.nombre) {
              return { 
                ...e, 
                estado: 'completado',
                fecha: new Date().toLocaleString()
              };
            }
            return e;
          });

          const siguientePendiente = nuevasEstaciones.find(e => e.estado === 'pendiente');
          if (siguientePendiente) {
            const index = nuevasEstaciones.findIndex(e => e.nombre === siguientePendiente.nombre);
            nuevasEstaciones[index] = {
              ...siguientePendiente,
              estado: 'en-proceso',
              fecha: new Date().toLocaleString(),
              responsable: 'Sistema'
            };
          }

          const completadas = nuevasEstaciones.filter(e => e.estado === 'completado').length;
          const nuevoProgreso = Math.round((completadas / nuevasEstaciones.length) * 100);

          const nuevoEvento = {
            id: Date.now(),
            hora: new Date().toLocaleTimeString(),
            evento: `✅ Estación ${estacionEnProceso.nombre} completada`,
            tipo: 'success'
          };
          setHistorial(prevHist => [nuevoEvento, ...prevHist].slice(0, 20));

          mostrarNotificacion('success', `Estación ${estacionEnProceso.nombre} completada`);

          setUltimosLotes(prev => 
            prev.map(l => {
              if (l.id === prev.id) {
                return { ...l, progreso: nuevoProgreso };
              }
              return l;
            })
          );

          return {
            ...prev,
            estaciones: nuevasEstaciones,
            progreso: nuevoProgreso,
            temperatura: +(prev.temperatura + (Math.random() * 0.6 - 0.3)).toFixed(1),
            humedad: +(prev.humedad + (Math.random() * 2 - 1)).toFixed(1)
          };
        }

        return {
          ...prev,
          temperatura: +(prev.temperatura + (Math.random() * 0.4 - 0.2)).toFixed(1),
          humedad: +(prev.humedad + (Math.random() * 1 - 0.5)).toFixed(1)
        };
      });

    }, 5000);

    return () => clearInterval(interval);
  }, [loteActual]);

  const mostrarNotificacion = (tipo, mensaje) => {
    setNotificacion({ tipo, mensaje, id: Date.now() });
    setTimeout(() => setNotificacion(null), 3000);
  };

  const buscarLote = () => {
    if (!codigoLote) {
      mostrarNotificacion('error', 'Ingrese un código de lote');
      return;
    }

    setCargando(true);
    
    setTimeout(() => {
      const loteEncontrado = lotesDB[codigoLote] || lotesDB[`LOTE-${codigoLote.padStart(3, '0')}`];
      
      if (loteEncontrado) {
        seleccionarLote(loteEncontrado.id);
        setCodigoLote('');
        mostrarNotificacion('success', `Lote ${loteEncontrado.id} encontrado`);
      } else {
        mostrarNotificacion('error', `Lote ${codigoLote} no encontrado`);
      }
      
      setCargando(false);
      setModoEscaneo(false);
    }, 800);
  };

  const seleccionarLote = (loteId) => {
    const lote = lotesDB[loteId];
    if (!lote) return;

    setLoteActual(lote);

    // Generar historial
    const historialLote = [];
    
    lote.estaciones
      .filter(e => e.estado === 'completado')
      .forEach(e => {
        historialLote.push({
          id: Date.now() + Math.random(),
          hora: e.fecha.split(' ')[1] || e.fecha,
          evento: `${e.nombre} - ${e.responsable}`,
          tipo: 'info'
        });
      });

    const enProceso = lote.estaciones.find(e => e.estado === 'en-proceso');
    if (enProceso) {
      historialLote.push({
        id: Date.now() + Math.random(),
        hora: 'En curso',
        evento: `⚙️ En proceso: ${enProceso.nombre}`,
        tipo: 'warning'
      });
    }

    historialLote.sort((a, b) => {
      if (a.hora === 'En curso') return -1;
      if (b.hora === 'En curso') return 1;
      return new Date(b.hora) - new Date(a.hora);
    });
    
    setHistorial(historialLote.slice(0, 20));

    setUltimosLotes(prev => 
      prev.map(l => ({
        ...l,
        seleccionado: l.id === loteId
      }))
    );
  };

  const handleScanChange = (e) => {
    const valor = e.target.value.toUpperCase();
    setCodigoLote(valor);
    setModoEscaneo(valor.length >= 3);
  };

  const getPrioridadClass = (prioridad) => {
    switch(prioridad) {
      case 'Alta': return 'prioridad-alta';
      case 'Media': return 'prioridad-media';
      case 'Baja': return 'prioridad-baja';
      default: return '';
    }
  };

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'completado': return '#10b981';
      case 'en-proceso': return '#3b82f6';
      case 'pendiente': return '#94a3b8';
      default: return '#94a3b8';
    }
  };

  const getEstadoIcono = (estado) => {
    switch(estado) {
      case 'completado': return '✅';
      case 'en-proceso': return '⚙️';
      case 'pendiente': return '⏳';
      default: return '○';
    }
  };

  return (
    <div className="trazabilidad-container">
      {/* Notificación flotante */}
      {notificacion && (
        <div className={`notificacion ${notificacion.tipo}`}>
          <span className="notificacion-icon">
            {notificacion.tipo === 'success' ? '✅' : '❌'}
          </span>
          <span className="notificacion-mensaje">{notificacion.mensaje}</span>
        </div>
      )}

      {/* Header */}
      <div className="trazabilidad-header">
        <div className="header-left">
          <h1>
            <span className="header-icon">📊</span>
            Trazabilidad de Lotes
          </h1>
          <div className="header-badge">
            <div className={`connection-status ${conectado ? 'connected' : 'disconnected'}`}>
              <span className="status-dot"></span>
              {conectado ? 'CONECTADO' : 'RECONECTANDO...'}
            </div>
            <div className="real-time">
              <span className="time-icon">⏱️</span>
              {tiempoReal.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Grid principal */}
      <div className="trazabilidad-grid">
        {/* Columna 1: Escáner y últimos lotes */}
        <div className="grid-col col-1">
          <div className="card scanner-card">
            <h3>
              <span className="card-icon">📡</span>
              Escanear Lote
            </h3>
            <div className="scanner-input-group">
              <div className={`input-wrapper ${modoEscaneo ? 'scanning' : ''}`}>
                <span className="input-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Ingrese código (ej: 001 o LOTE-001)..."
                  value={codigoLote}
                  onChange={handleScanChange}
                  onKeyPress={(e) => e.key === 'Enter' && buscarLote()}
                  autoFocus
                />
                {modoEscaneo && (
                  <div className="scan-indicator">
                    <div className="scan-line"></div>
                    <span>Escaneando...</span>
                  </div>
                )}
                {cargando && <div className="loading-spinner"></div>}
              </div>
              <button 
                className="btn-buscar"
                onClick={buscarLote}
                disabled={!codigoLote || cargando}
              >
                {cargando ? 'Buscando...' : 'Buscar Lote'}
              </button>
            </div>
          </div>

          <div className="card ultimos-lotes-card">
            <h3>
              <span className="card-icon">📋</span>
              Últimos lotes
              <span className="live-badge">EN VIVO</span>
            </h3>
            <div className="ultimos-lotes-lista">
              {ultimosLotes.map(lote => (
                <div 
                  key={lote.id} 
                  className={`lote-item ${lote.seleccionado ? 'selected' : ''}`}
                  onClick={() => seleccionarLote(lote.id)}
                >
                  <div className="lote-icon">{lote.imagen}</div>
                  <div className="lote-info">
                    <div className="lote-header">
                      <span className="lote-id">{lote.id}</span>
                      <span className={`lote-prioridad ${getPrioridadClass(lote.prioridad)}`}>
                        {lote.prioridad}
                      </span>
                    </div>
                    <span className="lote-producto">{lote.producto}</span>
                    <span className="lote-cliente">{lote.cliente}</span>
                    <div className="lote-progreso">
                      <div className="progreso-barra">
                        <div 
                          className="progreso-llenado"
                          style={{ width: `${lote.progreso}%` }}
                        ></div>
                      </div>
                      <span className="progreso-texto">{lote.progreso}%</span>
                    </div>
                  </div>
                  {lote.seleccionado && (
                    <div className="seleccionado-indicador">✓</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Columna 2: Información del lote y timeline */}
        <div className="grid-col col-2">
          {loteActual ? (
            <>
              <div className="card lote-info-card">
                <div className="lote-info-header">
                  <h3>
                    <span className="card-icon">📦</span>
                    Lote {loteActual.id}
                  </h3>
                  <span className={`lote-prioridad-badge ${getPrioridadClass(loteActual.prioridad)}`}>
                    {loteActual.prioridad}
                  </span>
                </div>
                
                <div className="lote-detalles">
                  <div className="detalle-row">
                    <span className="detalle-label">PRODUCTO:</span>
                    <span className="detalle-value">{loteActual.producto}</span>
                  </div>
                  <div className="detalle-row">
                    <span className="detalle-label">CLIENTE:</span>
                    <span className="detalle-value">{loteActual.cliente}</span>
                  </div>
                  <div className="detalle-row">
                    <span className="detalle-label">CANTIDAD:</span>
                    <span className="detalle-value">{loteActual.cantidad.toLocaleString()} uds</span>
                  </div>
                  <div className="detalle-row">
                    <span className="detalle-label">RESPONSABLE:</span>
                    <span className="detalle-value">{loteActual.responsable}</span>
                  </div>
                  <div className="detalle-row">
                    <span className="detalle-label">FECHA INICIO:</span>
                    <span className="detalle-value">{loteActual.fechaInicio}</span>
                  </div>
                </div>

                <div className="lote-metrics">
                  <div className="metric">
                    <span className="metric-icon">🌡️</span>
                    <div>
                      <span className="metric-label">Temperatura</span>
                      <span className="metric-value">{loteActual.temperatura.toFixed(1)}°C</span>
                    </div>
                  </div>
                  <div className="metric">
                    <span className="metric-icon">💧</span>
                    <div>
                      <span className="metric-label">Humedad</span>
                      <span className="metric-value">{loteActual.humedad.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div className="lote-progreso-general">
                  <div className="progreso-header">
                    <span>Progreso general</span>
                    <span className="progreso-porcentaje">{loteActual.progreso}%</span>
                  </div>
                  <div className="progreso-barra-general">
                    <div 
                      className="progreso-llenado-general"
                      style={{ width: `${loteActual.progreso}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="card timeline-card">
                <h3>
                  <span className="card-icon">⏱️</span>
                  Línea de Producción
                  <span className="live-badge small">ACTUALIZANDO</span>
                </h3>
                <div className="timeline">
                  {loteActual.estaciones.map((estacion, index) => (
                    <div key={index} className="timeline-item">
                      <div className="timeline-indicador">
                        <div 
                          className="timeline-dot"
                          style={{ backgroundColor: getEstadoColor(estacion.estado) }}
                        >
                          {getEstadoIcono(estacion.estado)}
                        </div>
                        {index < loteActual.estaciones.length - 1 && (
                          <div 
                            className="timeline-linea"
                            style={{ 
                              background: estacion.estado === 'completado' 
                                ? 'linear-gradient(180deg, #10b981, #10b981)' 
                                : 'linear-gradient(180deg, #e2e8f0, #e2e8f0)'
                            }}
                          ></div>
                        )}
                      </div>
                      <div className="timeline-contenido">
                        <div className="timeline-header">
                          <span className="timeline-nombre">{estacion.nombre}</span>
                          <span 
                            className="timeline-estado"
                            style={{ color: getEstadoColor(estacion.estado) }}
                          >
                            {estacion.estado === 'completado' && 'Completado'}
                            {estacion.estado === 'en-proceso' && 'En proceso'}
                            {estacion.estado === 'pendiente' && 'Pendiente'}
                          </span>
                        </div>
                        {estacion.fecha && (
                          <div className="timeline-detalle">
                            <span className="timeline-fecha">{estacion.fecha}</span>
                            <span className="timeline-responsable">{estacion.responsable}</span>
                          </div>
                        )}
                        {estacion.estado === 'en-proceso' && (
                          <div className="en-proceso-animacion">
                            <span className="proceso-pulso"></span>
                            <span className="proceso-texto">En curso...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="card placeholder-card">
              <div className="placeholder-content">
                <span className="placeholder-icon">📦</span>
                <h3>Selecciona un lote</h3>
                <p>Haz clic en cualquier lote de la lista o escanea un código</p>
              </div>
            </div>
          )}
        </div>

        {/* Columna 3: Historial de movimientos */}
        <div className="grid-col col-3">
          <div className="card historial-card">
            <div className="historial-header">
              <h3>
                <span className="card-icon">📋</span>
                Historial de Movimientos
              </h3>
              <select 
                className="historial-filtro"
                value={filtroHistorial}
                onChange={(e) => setFiltroHistorial(e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="hoy">Hoy</option>
                <option value="semana">Esta semana</option>
              </select>
            </div>

            <div className="historial-lista">
              {historial.length > 0 ? (
                historial.map((item) => (
                  <div key={item.id} className={`historial-item ${item.tipo}`}>
                    <span className="historial-hora">{item.hora}</span>
                    <span className="historial-evento">{item.evento}</span>
                    {item.tipo === 'success' && <span className="historial-icon">✅</span>}
                    {item.tipo === 'warning' && <span className="historial-icon">⚙️</span>}
                    {item.tipo === 'info' && <span className="historial-icon">ℹ️</span>}
                  </div>
                ))
              ) : (
                <div className="historial-vacio">
                  <span>No hay movimientos para mostrar</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}