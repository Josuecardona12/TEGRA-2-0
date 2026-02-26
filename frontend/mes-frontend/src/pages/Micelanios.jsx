import React, { useState, useEffect, useRef } from 'react';
import './Micelanios.css'; // Corregido: ahora importa Micelanios.css

const Micelanios = () => { // Corregido: nombre del componente igual al archivo
  const [currentTime, setCurrentTime] = useState(new Date());
  const [codigo, setCodigo] = useState('');
  const [tipo, setTipo] = useState('');
  const [areaOrigen, setAreaOrigen] = useState('Corte');
  const [areaDestino, setAreaDestino] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [loteActivo, setLoteActivo] = useState('LOTE-001');
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('');
  const [mostrarNuevoLote, setMostrarNuevoLote] = useState(false);
  const [nuevoLoteNombre, setNuevoLoteNombre] = useState('');
  const [vista, setVista] = useState('lotes'); // 'lotes', 'tracking', 'estadisticas'
  const [busqueda, setBusqueda] = useState('');
  const [modoOscuro, setModoOscuro] = useState(false);
  const [ordenAscendente, setOrdenAscendente] = useState(true);
  const inputRef = useRef(null);

  // Estado para almacenar registros agrupados por lote
  const [lotes, setLotes] = useState([
    {
      id: 'LOTE-001',
      nombre: 'LOTE-001',
      fechaCreacion: '2/25/2026',
      color: '#6366f1',
      icono: '📦',
      activo: true,
      registros: [
        { 
          id: '1002', 
          codigo: '1002', 
          tipo: 'Twill', 
          areaOrigen: 'Corte', 
          areaDestino: 'Producción', 
          cantidad: 1, 
          fecha: '2/25/2026', 
          hora: '5:04 AM', 
          estado: 'REGISTRADO',
          prioridad: 'Alta',
          tracking: ['Corte', 'Producción']
        },
        { 
          id: '1004', 
          codigo: '1004', 
          tipo: 'Logos', 
          areaOrigen: 'Corte', 
          areaDestino: 'Almacén', 
          cantidad: 1, 
          fecha: '2/25/2026', 
          hora: '5:04 AM', 
          estado: 'REGISTRADO',
          prioridad: 'Media',
          tracking: ['Corte', 'Almacén']
        },
        { 
          id: '1008', 
          codigo: '1008', 
          tipo: 'Paneles', 
          areaOrigen: 'Diseño', 
          areaDestino: 'Plotter', 
          cantidad: 3, 
          fecha: '2/25/2026', 
          hora: '6:30 AM', 
          estado: 'REGISTRADO',
          prioridad: 'Baja',
          tracking: ['Diseño', 'Plotter']
        }
      ]
    },
    {
      id: 'LOTE-002',
      nombre: 'LOTE-002',
      fechaCreacion: '2/25/2026',
      color: '#8b5cf6',
      icono: '📫',
      activo: false,
      registros: [
        { 
          id: '1003', 
          codigo: '1003', 
          tipo: 'Paneles', 
          areaOrigen: 'Logística', 
          areaDestino: 'Incompleto', 
          cantidad: 2, 
          fecha: '2/25/2026', 
          hora: '5:04 AM', 
          estado: 'REGISTRADO',
          prioridad: 'Alta',
          tracking: ['Logística', 'Incompleto']
        }
      ]
    },
    {
      id: 'LOTE-003',
      nombre: 'LOTE-003',
      fechaCreacion: '2/25/2026',
      color: '#ec4899',
      icono: '📭',
      activo: false,
      registros: []
    },
    {
      id: 'v10120',
      nombre: 'v10120',
      fechaCreacion: '2/25/2026',
      color: '#10b981',
      icono: '⚡',
      activo: false,
      registros: [
        { 
          id: '1006', 
          codigo: '1006', 
          tipo: 'Mangas', 
          areaOrigen: 'Colorimetría', 
          areaDestino: 'Calidad', 
          cantidad: 5, 
          fecha: '2/25/2026', 
          hora: '8:15 AM', 
          estado: 'REGISTRADO',
          prioridad: 'Media',
          tracking: ['Colorimetría', 'Calidad']
        },
        { 
          id: '1007', 
          codigo: '1007', 
          tipo: 'Insert', 
          areaOrigen: 'RH', 
          areaDestino: 'Producción', 
          cantidad: 2, 
          fecha: '2/25/2026', 
          hora: '9:30 AM', 
          estado: 'REGISTRADO',
          prioridad: 'Alta',
          tracking: ['RH', 'Producción']
        }
      ]
    }
  ]);

  const tiposMicelanio = [
    'Twill',
    'Logos',
    'Paneles',
    'Mangas',
    'Insert',
    'Especiales',
    'Personalizado'
  ];

  const areasDisponibles = [
    'Sublimado',
    'Diseño',
    'Plotter',
    'RH',
    'Incompleto',
    'Colorimetría',
    'Logística',
    'Corte',
    'Calidad',
    'Almacén',
    'Producción'
  ];

  useEffect(() => {
    inputRef.current?.focus();
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).replace(/^\w/, c => c.toUpperCase());
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      registrarMicelanio();
    }
  };

  const generarNuevoLote = () => {
    const numLote = lotes.length + 1;
    return `LOTE-${numLote.toString().padStart(3, '0')}`;
  };

  const crearNuevoLote = () => {
    const nuevoLoteId = nuevoLoteNombre || generarNuevoLote();
    
    if (lotes.some(l => l.id === nuevoLoteId)) {
      mostrarMensaje(`❌ El lote ${nuevoLoteId} ya existe`, 'error');
      return;
    }

    const colores = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];
    const colorRandom = colores[Math.floor(Math.random() * colores.length)];
    const iconos = ['📦', '📫', '📭', '⚡', '🎯', '💎'];
    const iconoRandom = iconos[Math.floor(Math.random() * iconos.length)];

    const nuevoLote = {
      id: nuevoLoteId,
      nombre: nuevoLoteId,
      fechaCreacion: new Date().toLocaleDateString('en-US'),
      color: colorRandom,
      icono: iconoRandom,
      activo: false,
      registros: []
    };
    
    setLotes([...lotes, nuevoLote]);
    setLoteActivo(nuevoLoteId);
    setMostrarNuevoLote(false);
    setNuevoLoteNombre('');
    mostrarMensaje(`✅ Nuevo lote ${nuevoLoteId} creado`, 'exito');
  };

  const cambiarLoteActivo = (loteId) => {
    setLoteActivo(loteId);
    mostrarMensaje(`📦 Cambiado a ${loteId}`, 'info');
    
    setLotes(lotes.map(lote => ({
      ...lote,
      activo: lote.id === loteId
    })));
  };

  const registrarMicelanio = () => {
    if (!codigo.trim()) {
      mostrarMensaje('Por favor escanee o escriba un código', 'error');
      return;
    }

    if (!tipo) {
      mostrarMensaje('Seleccione un tipo de miceláneo', 'error');
      return;
    }

    if (!areaDestino) {
      mostrarMensaje('Seleccione un área de destino', 'error');
      return;
    }

    if (cantidad < 1) {
      mostrarMensaje('La cantidad debe ser mayor a 0', 'error');
      return;
    }

    const loteIndex = lotes.findIndex(l => l.id === loteActivo);
    if (loteIndex === -1) {
      mostrarMensaje('Error: Lote no encontrado', 'error');
      return;
    }

    const todosLosIds = lotes.flatMap(l => l.registros.map(r => parseInt(r.id) || 0));
    const maxId = Math.max(0, ...todosLosIds);
    const nuevoId = (maxId + 1).toString();

    const prioridades = ['Alta', 'Media', 'Baja'];
    const prioridadRandom = prioridades[Math.floor(Math.random() * prioridades.length)];

    const nuevoRegistro = {
      id: nuevoId,
      codigo: codigo,
      tipo: tipo,
      areaOrigen: areaOrigen,
      areaDestino: areaDestino,
      cantidad: cantidad,
      fecha: new Date().toLocaleDateString('en-US'),
      hora: new Date().toLocaleTimeString('en-US'),
      estado: 'REGISTRADO',
      prioridad: prioridadRandom,
      tracking: [areaOrigen, areaDestino]
    };

    const lotesActualizados = [...lotes];
    lotesActualizados[loteIndex] = {
      ...lotesActualizados[loteIndex],
      registros: [...lotesActualizados[loteIndex].registros, nuevoRegistro]
    };
    
    setLotes(lotesActualizados);
    
    mostrarMensaje(`✅ Registro ${nuevoId} agregado a ${loteActivo}`, 'exito');
    
    setCodigo('');
    setTipo('');
    setAreaDestino('');
    setCantidad(1);
    
    inputRef.current?.focus();
  };

  const eliminarRegistro = (loteId, registroId) => {
    setLotes(lotes.map(lote => 
      lote.id === loteId 
        ? { ...lote, registros: lote.registros.filter(r => r.id !== registroId) }
        : lote
    ));
    mostrarMensaje(`🗑️ Registro ${registroId} eliminado`, 'info');
  };

  const duplicarRegistro = (loteId, registro) => {
    const nuevoRegistro = {
      ...registro,
      id: (parseInt(registro.id) + 1000).toString(),
      hora: new Date().toLocaleTimeString('en-US')
    };
    
    setLotes(lotes.map(lote => 
      lote.id === loteId 
        ? { ...lote, registros: [...lote.registros, nuevoRegistro] }
        : lote
    ));
    mostrarMensaje(`📋 Registro duplicado`, 'exito');
  };

  const mostrarMensaje = (texto, tipo) => {
    setMensaje(texto);
    setTipoMensaje(tipo);
    setTimeout(() => setMensaje(''), 3000);
  };

  const handleCantidadChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    setCantidad(Math.max(1, value));
  };

  const simularScan = () => {
    const codigosEjemplo = ['1001', '1002', '1003', '1004', '1005', '1006', '1007', '1008'];
    const random = codigosEjemplo[Math.floor(Math.random() * codigosEjemplo.length)];
    setCodigo(random);
  };

  const getTotalRegistros = () => {
    return lotes.reduce((total, lote) => total + lote.registros.length, 0);
  };

  const getRegistrosLoteActivo = () => {
    const lote = lotes.find(l => l.id === loteActivo);
    return lote ? lote.registros : [];
  };

  const getEstadisticas = () => {
    const totalRegistros = getTotalRegistros();
    const totalLotes = lotes.length;
    const registrosPorTipo = {};
    const registrosPorArea = {};
    
    lotes.forEach(lote => {
      lote.registros.forEach(reg => {
        registrosPorTipo[reg.tipo] = (registrosPorTipo[reg.tipo] || 0) + 1;
        registrosPorArea[reg.areaDestino] = (registrosPorArea[reg.areaDestino] || 0) + 1;
      });
    });
    
    return { totalRegistros, totalLotes, registrosPorTipo, registrosPorArea };
  };

  const estadisticas = getEstadisticas();

  const lotesOrdenados = [...lotes].sort((a, b) => 
    ordenAscendente 
      ? a.registros.length - b.registros.length
      : b.registros.length - a.registros.length
  );

  const lotesFiltrados = lotesOrdenados.filter(lote => 
    lote.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    lote.registros.some(r => r.id.includes(busqueda))
  );

  return (
    <div className={`micelanios-premium-container ${modoOscuro ? 'dark-mode' : ''}`}>
      {/* Header Premium */}
      <div className="premium-header">
        <div className="header-glow"></div>
        <div className="header-content">
          <div className="header-left">
            <h1 className="title-gradient">
              <span className="title-icon">📦</span>
              Miceláneos Pro
            </h1>
            <div className="date-badge">
              <span className="date-icon">📅</span>
              {formatDate(currentTime)}
            </div>
          </div>
          
          <div className="header-right">
            <div className="live-indicator">
              <span className="live-pulse"></span>
              <span className="live-text">EN VIVO</span>
              <span className="live-time">{formatTime(currentTime)}</span>
            </div>
            
            <button 
              className="theme-toggle"
              onClick={() => setModoOscuro(!modoOscuro)}
            >
              {modoOscuro ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </div>

      {/* Mensaje de notificación */}
      {mensaje && (
        <div className={`premium-mensaje ${tipoMensaje}`}>
          <div className="mensaje-icon">
            {tipoMensaje === 'exito' && '✅'}
            {tipoMensaje === 'error' && '❌'}
            {tipoMensaje === 'info' && 'ℹ️'}
          </div>
          <span className="mensaje-texto">{mensaje}</span>
        </div>
      )}

      {/* Navegación de vistas */}
      <div className="vistas-nav">
        <button 
          className={`vista-btn ${vista === 'lotes' ? 'active' : ''}`}
          onClick={() => setVista('lotes')}
        >
          <span className="vista-icon">📋</span>
          <span>Lotes</span>
        </button>
        <button 
          className={`vista-btn ${vista === 'tracking' ? 'active' : ''}`}
          onClick={() => setVista('tracking')}
        >
          <span className="vista-icon">📍</span>
          <span>Tracking</span>
        </button>
        <button 
          className={`vista-btn ${vista === 'estadisticas' ? 'active' : ''}`}
          onClick={() => setVista('estadisticas')}
        >
          <span className="vista-icon">📊</span>
          <span>Estadísticas</span>
        </button>
      </div>

      <div className="premium-grid">
        {/* Columna izquierda - Formulario */}
        <div className="form-column">
          <div className="glass-card">
            <h2 className="card-title">
              <span className="title-icon">📝</span>
              Registro de Miceláneo
            </h2>
            
            {/* Selector de Lote Activo */}
            <div className="lote-activo-card">
              <div className="lote-activo-header">
                <span className="lote-activo-label">Lote Activo:</span>
                <span className="lote-activo-valor">{loteActivo}</span>
                <span className="lote-activo-badge">
                  {lotes.find(l => l.id === loteActivo)?.registros.length || 0} registros
                </span>
              </div>
              
              <div className="lote-selector-group">
                <select 
                  value={loteActivo} 
                  onChange={(e) => cambiarLoteActivo(e.target.value)}
                  className="lote-selector-premium"
                >
                  {lotes.map(lote => (
                    <option key={lote.id} value={lote.id}>
                      {lote.icono} {lote.nombre} ({lote.registros.length})
                    </option>
                  ))}
                </select>
                <button 
                  className="btn-nuevo-lote-premium"
                  onClick={() => setMostrarNuevoLote(!mostrarNuevoLote)}
                >
                  <span className="btn-icon">+</span>
                  Nuevo
                </button>
              </div>
              
              {mostrarNuevoLote && (
                <div className="nuevo-lote-premium">
                  <input
                    type="text"
                    placeholder="Nombre del lote"
                    value={nuevoLoteNombre}
                    onChange={(e) => setNuevoLoteNombre(e.target.value)}
                    className="nuevo-lote-input-premium"
                    autoFocus
                  />
                  <div className="nuevo-lote-actions">
                    <button className="btn-crear" onClick={crearNuevoLote}>
                      ✓ Crear
                    </button>
                    <button className="btn-cancelar" onClick={() => {
                      setMostrarNuevoLote(false);
                      setNuevoLoteNombre('');
                    }}>
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="form-group-premium">
              <label>
                <span className="label-icon">📷</span>
                Código de Barra
              </label>
              <div className="codigo-input-group-premium">
                <input
                  ref={inputRef}
                  type="text"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escanee o escriba el código"
                  className="codigo-input-premium"
                />
                <button 
                  className="scan-simulate-premium"
                  onClick={simularScan}
                  title="Simular escaneo"
                >
                  🔄
                </button>
              </div>
            </div>

            <div className="form-row-premium">
              <div className="form-group-premium">
                <label>Tipo de Miceláneo</label>
                <select 
                  value={tipo} 
                  onChange={(e) => setTipo(e.target.value)}
                  className="select-premium"
                >
                  <option value="">Seleccione tipo</option>
                  {tiposMicelanio.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="form-group-premium">
                <label>Cantidad</label>
                <div className="cantidad-control">
                  <button 
                    className="cantidad-btn"
                    onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                  >-</button>
                  <input
                    type="number"
                    min="1"
                    value={cantidad}
                    onChange={handleCantidadChange}
                    className="cantidad-input-premium"
                  />
                  <button 
                    className="cantidad-btn"
                    onClick={() => setCantidad(cantidad + 1)}
                  >+</button>
                </div>
              </div>
            </div>

            <div className="form-row-premium">
              <div className="form-group-premium">
                <label>Área Origen</label>
                <select 
                  value={areaOrigen} 
                  onChange={(e) => setAreaOrigen(e.target.value)}
                  className="select-premium"
                >
                  {areasDisponibles.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>

              <div className="form-group-premium">
                <label>Área Destino</label>
                <select 
                  value={areaDestino} 
                  onChange={(e) => setAreaDestino(e.target.value)}
                  className="select-premium"
                >
                  <option value="">Seleccione destino</option>
                  {areasDisponibles.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              className="registrar-btn-premium"
              onClick={registrarMicelanio}
            >
              <span className="btn-icon">📝</span>
              Registrar Miceláneo
              <span className="btn-glow"></span>
            </button>
          </div>

          {/* Áreas de Trabajo */}
          <div className="glass-card">
            <h3 className="card-subtitle">
              <span className="title-icon">🏭</span>
              Áreas de Trabajo
            </h3>
            <div className="areas-grid-premium">
              {areasDisponibles.map(area => (
                <button
                  key={area}
                  className={`area-btn-premium ${areaDestino === area ? 'active' : ''}`}
                  onClick={() => setAreaDestino(area)}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Columna derecha - Contenido variable según vista */}
        <div className="content-column">
          {vista === 'lotes' && (
            <div className="glass-card">
              <div className="historial-header-premium">
                <h3>
                  <span className="title-icon">📋</span>
                  Historial de Registros
                </h3>
                <div className="historial-controls">
                  <span className="total-badge">{getTotalRegistros()} registros totales</span>
                  <div className="search-box-premium">
                    <input
                      type="text"
                      placeholder="Buscar lote o código..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      className="search-input-premium"
                    />
                    <span className="search-icon">🔍</span>
                  </div>
                  <button 
                    className="sort-btn"
                    onClick={() => setOrdenAscendente(!ordenAscendente)}
                  >
                    {ordenAscendente ? '⬆️' : '⬇️'}
                  </button>
                </div>
              </div>

              {/* Lista de Lotes Premium */}
              <div className="lotes-grid-premium">
                {lotesFiltrados.map(lote => (
                  <div 
                    key={lote.id} 
                    className={`lote-card-premium ${lote.id === loteActivo ? 'activo' : ''}`}
                    style={{ borderLeftColor: lote.color }}
                    onClick={() => cambiarLoteActivo(lote.id)}
                  >
                    <div className="lote-card-header">
                      <div className="lote-titulo">
                        <span className="lote-icon">{lote.icono}</span>
                        <span className="lote-nombre">{lote.nombre}</span>
                      </div>
                      <span className="lote-badge" style={{ backgroundColor: lote.color }}>
                        {lote.registros.length} registros
                      </span>
                    </div>
                    
                    {lote.registros.length > 0 ? (
                      <div className="lote-preview">
                        {lote.registros.slice(0, 2).map(reg => (
                          <div key={reg.id} className="preview-item-premium">
                            <span className="preview-id">{reg.id}</span>
                            <span className="preview-ruta">
                              {reg.areaOrigen} → {reg.areaDestino}
                            </span>
                          </div>
                        ))}
                        {lote.registros.length > 2 && (
                          <div className="preview-mas">
                            +{lote.registros.length - 2} más
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="lote-vacio-premium">
                        <span>📭 Sin registros</span>
                      </div>
                    )}

                    {lote.id === loteActivo && (
                      <div className="lote-activo-indicador">
                        <span className="indicador-pulso"></span>
                        ACTIVO
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Registros del Lote Activo */}
              <div className="lote-detalle-premium">
                <h4 className="detalle-titulo">
                  <span className="lote-icon">
                    {lotes.find(l => l.id === loteActivo)?.icono}
                  </span>
                  Registros de {loteActivo}
                  <span className="detalle-count">
                    {getRegistrosLoteActivo().length} registros
                  </span>
                </h4>
                
                <div className="registros-grid-premium">
                  {getRegistrosLoteActivo().length > 0 ? (
                    getRegistrosLoteActivo().map(registro => (
                      <div key={registro.id} className="registro-card-premium">
                        <div className="registro-header">
                          <div className="registro-titulo">
                            <span className="registro-id">{registro.id}</span>
                            <span className={`registro-prioridad ${registro.prioridad.toLowerCase()}`}>
                              {registro.prioridad}
                            </span>
                          </div>
                          <span className="registro-estado">{registro.estado}</span>
                        </div>
                        
                        <div className="registro-body">
                          <span className="registro-tipo">{registro.tipo}</span>
                          <div className="registro-ruta">
                            <span className="ruta-origen">{registro.areaOrigen}</span>
                            <span className="ruta-flecha">→</span>
                            <span className="ruta-destino">{registro.areaDestino}</span>
                          </div>
                        </div>
                        
                        <div className="registro-footer">
                          <span className="registro-cantidad">Cant: {registro.cantidad}</span>
                          <span className="registro-fecha">{registro.fecha} {registro.hora}</span>
                        </div>

                        <div className="registro-actions">
                          <button 
                            className="action-btn duplicate"
                            onClick={() => duplicarRegistro(loteActivo, registro)}
                            title="Duplicar"
                          >
                            📋
                          </button>
                          <button 
                            className="action-btn delete"
                            onClick={() => eliminarRegistro(loteActivo, registro.id)}
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-registros-premium">
                      <div className="empty-icon">📭</div>
                      <p>No hay registros en este lote</p>
                      <small>Registre un miceláneo para comenzar</small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {vista === 'tracking' && (
            <div className="glass-card">
              <h3>
                <span className="title-icon">📍</span>
                Tracking en Tiempo Real
              </h3>
              
              <div className="tracking-timeline-premium">
                {lotes.filter(l => l.registros.length > 0).map(lote => (
                  <div key={lote.id} className="tracking-lote">
                    <div className="tracking-lote-header" style={{ color: lote.color }}>
                      <span className="lote-icon">{lote.icono}</span>
                      <span className="lote-nombre">{lote.nombre}</span>
                    </div>
                    
                    {lote.registros.map(reg => (
                      <div key={reg.id} className="tracking-item-premium">
                        <div className="tracking-item-header">
                          <span className="tracking-id">{reg.id}</span>
                          <span className="tracking-tipo">{reg.tipo}</span>
                        </div>
                        
                        <div className="tracking-progress">
                          {reg.tracking.map((etapa, index) => (
                            <div key={index} className="tracking-step">
                              <div className="step-dot"></div>
                              <div className="step-content">
                                <span className="step-area">{etapa}</span>
                              </div>
                              {index < reg.tracking.length - 1 && (
                                <div className="step-line"></div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {vista === 'estadisticas' && (
            <div className="glass-card">
              <h3>
                <span className="title-icon">📊</span>
                Estadísticas y Análisis
              </h3>
              
              <div className="stats-grid-premium">
                <div className="stat-card">
                  <div className="stat-icon">📦</div>
                  <div className="stat-content">
                    <span className="stat-value">{estadisticas.totalRegistros}</span>
                    <span className="stat-label">Total Registros</span>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">📋</div>
                  <div className="stat-content">
                    <span className="stat-value">{estadisticas.totalLotes}</span>
                    <span className="stat-label">Total Lotes</span>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">📊</div>
                  <div className="stat-content">
                    <span className="stat-value">
                      {Math.round(estadisticas.totalRegistros / estadisticas.totalLotes)}
                    </span>
                    <span className="stat-label">Promedio x Lote</span>
                  </div>
                </div>
              </div>

              <div className="charts-container">
                <div className="chart-card">
                  <h4>Registros por Tipo</h4>
                  <div className="chart-bars">
                    {Object.entries(estadisticas.registrosPorTipo).map(([tipo, count]) => (
                      <div key={tipo} className="chart-bar-item">
                        <span className="bar-label">{tipo}</span>
                        <div className="bar-container">
                          <div 
                            className="bar-fill"
                            style={{
                              width: `${(count / estadisticas.totalRegistros) * 100}%`,
                              background: 'linear-gradient(90deg, #6366f1, #8b5cf6)'
                            }}
                          ></div>
                          <span className="bar-value">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="chart-card">
                  <h4>Registros por Área Destino</h4>
                  <div className="chart-bars">
                    {Object.entries(estadisticas.registrosPorArea).map(([area, count]) => (
                      <div key={area} className="chart-bar-item">
                        <span className="bar-label">{area}</span>
                        <div className="bar-container">
                          <div 
                            className="bar-fill"
                            style={{
                              width: `${(count / estadisticas.totalRegistros) * 100}%`,
                              background: 'linear-gradient(90deg, #10b981, #059669)'
                            }}
                          ></div>
                          <span className="bar-value">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Premium */}
      <div className="premium-footer">
        <div className="footer-left">
          <div className="sync-status">
            <span className="sync-dot"></span>
            <span>Sincronizado • {formatTime(currentTime)}</span>
          </div>
        </div>
        <div className="footer-right">
          <span className="footer-version">v2.5.0</span>
          <span className="footer-separator">•</span>
          <span className="footer-user">Josué Cardona</span>
        </div>
      </div>
    </div>
  );
};

export default Micelanios; // Exportación con nombre corregido