import React, { useState, useEffect } from 'react';
import './MaquinasTiempoReal.css';

const MaquinasTiempoReal = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [vista, setVista] = useState('grid'); // grid, lista, detalle
  const [filtro, setFiltro] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [maquinaSeleccionada, setMaquinaSeleccionada] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [notificacion, setNotificacion] = useState({ mostrar: false, mensaje: '', tipo: '' });

  const [maquinas, setMaquinas] = useState([
    { 
      id: 1, 
      nombre: 'Plotter HP Z6800', 
      tipo: 'Plotter', 
      estado: 'operando', 
      eficiencia: 92, 
      tiempo: '02:15:30',
      temperatura: 42,
      velocidad: 85,
      produccion: 145,
      alertas: 0,
      operador: 'Carlos López',
      ultimoMantenimiento: '15/02/2026',
      proximoMantenimiento: '15/03/2026'
    },
    { 
      id: 2, 
      nombre: 'Sublimadora Epson F950', 
      tipo: 'Sublimadora', 
      estado: 'operando', 
      eficiencia: 88, 
      tiempo: '01:45:22',
      temperatura: 38,
      velocidad: 92,
      produccion: 98,
      alertas: 1,
      operador: 'María González',
      ultimoMantenimiento: '10/02/2026',
      proximoMantenimiento: '10/03/2026'
    },
    { 
      id: 3, 
      nombre: 'Cortadora Zund G3', 
      tipo: 'Corte', 
      estado: 'pausada', 
      eficiencia: 76, 
      tiempo: '00:30:15',
      temperatura: 35,
      velocidad: 0,
      produccion: 67,
      alertas: 2,
      operador: 'Pedro Ramírez',
      ultimoMantenimiento: '05/02/2026',
      proximoMantenimiento: '05/03/2026'
    },
    { 
      id: 4, 
      nombre: 'Impresora Durst Rho', 
      tipo: 'Impresora', 
      estado: 'mantenimiento', 
      eficiencia: 0, 
      tiempo: '00:00:00',
      temperatura: 0,
      velocidad: 0,
      produccion: 0,
      alertas: 3,
      operador: 'Técnico',
      ultimoMantenimiento: '20/02/2026',
      proximoMantenimiento: '20/03/2026'
    },
    { 
      id: 5, 
      nombre: 'Plancha Monti Antonio', 
      tipo: 'Plancha', 
      estado: 'operando', 
      eficiencia: 95, 
      tiempo: '03:22:10',
      temperatura: 180,
      velocidad: 75,
      produccion: 210,
      alertas: 0,
      operador: 'Juan Pérez',
      ultimoMantenimiento: '12/02/2026',
      proximoMantenimiento: '12/03/2026'
    },
    { 
      id: 6, 
      nombre: 'Plotter Mimaki', 
      tipo: 'Plotter', 
      estado: 'operando', 
      eficiencia: 84, 
      tiempo: '01:10:05',
      temperatura: 41,
      velocidad: 78,
      produccion: 89,
      alertas: 0,
      operador: 'Ana Martínez',
      ultimoMantenimiento: '08/02/2026',
      proximoMantenimiento: '08/03/2026'
    },
    { 
      id: 7, 
      nombre: 'Sublimadora Sawgrass', 
      tipo: 'Sublimadora', 
      estado: 'operando', 
      eficiencia: 90, 
      tiempo: '02:30:45',
      temperatura: 39,
      velocidad: 88,
      produccion: 156,
      alertas: 1,
      operador: 'Roberto Díaz',
      ultimoMantenimiento: '14/02/2026',
      proximoMantenimiento: '14/03/2026'
    },
    { 
      id: 8, 
      nombre: 'Cortadora Kongsberg', 
      tipo: 'Corte', 
      estado: 'inactiva', 
      eficiencia: 0, 
      tiempo: '00:00:00',
      temperatura: 22,
      velocidad: 0,
      produccion: 0,
      alertas: 0,
      operador: 'Sin asignar',
      ultimoMantenimiento: '01/02/2026',
      proximoMantenimiento: '01/03/2026'
    },
  ]);

  // Actualizar tiempos
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      actualizarTiempos();
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const actualizarTiempos = () => {
    setMaquinas(prev => prev.map(maq => {
      if (maq.estado === 'operando') {
        const tiempo = maq.tiempo.split(':');
        let horas = parseInt(tiempo[0]);
        let minutos = parseInt(tiempo[1]);
        let segundos = parseInt(tiempo[2]) + 1;
        
        if (segundos >= 60) {
          segundos = 0;
          minutos += 1;
        }
        if (minutos >= 60) {
          minutos = 0;
          horas += 1;
        }
        
        const nuevoTiempo = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
        
        // Simular cambios en eficiencia
        const variacion = (Math.random() * 2 - 1) * 0.5;
        const nuevaEficiencia = Math.min(100, Math.max(0, maq.eficiencia + variacion));
        
        return { ...maq, tiempo: nuevoTiempo, eficiencia: Math.round(nuevaEficiencia * 10) / 10 };
      }
      return maq;
    }));
  };

  const mostrarNotificacion = (mensaje, tipo) => {
    setNotificacion({ mostrar: true, mensaje, tipo });
    setTimeout(() => setNotificacion({ mostrar: false, mensaje: '', tipo: '' }), 3000);
  };

  const cambiarEstadoMaquina = (id, nuevoEstado) => {
    setMaquinas(prev => prev.map(maq => 
      maq.id === id ? { ...maq, estado: nuevoEstado } : maq
    ));
    mostrarNotificacion(`Estado de máquina actualizado a ${nuevoEstado}`, 'exito');
  };

  const iniciarMantenimiento = (id) => {
    setMaquinas(prev => prev.map(maq => 
      maq.id === id ? { ...maq, estado: 'mantenimiento', tiempo: '00:00:00' } : maq
    ));
    mostrarNotificacion('Mantenimiento iniciado', 'info');
  };

  const detenerEmergencia = (id) => {
    setMaquinas(prev => prev.map(maq => 
      maq.id === id ? { ...maq, estado: 'inactiva', tiempo: '00:00:00' } : maq
    ));
    mostrarNotificacion('¡Parada de emergencia activada!', 'error');
  };

  const reiniciarMaquina = (id) => {
    setMaquinas(prev => prev.map(maq => 
      maq.id === id ? { ...maq, estado: 'operando', tiempo: '00:00:00' } : maq
    ));
    mostrarNotificacion('Máquina reiniciada', 'exito');
  };

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

  // Estadísticas
  const stats = {
    total: maquinas.length,
    operando: maquinas.filter(m => m.estado === 'operando').length,
    pausadas: maquinas.filter(m => m.estado === 'pausada').length,
    mantenimiento: maquinas.filter(m => m.estado === 'mantenimiento').length,
    inactivas: maquinas.filter(m => m.estado === 'inactiva').length,
    eficiencia: Math.round(maquinas.filter(m => m.estado === 'operando').reduce((sum, m) => sum + m.eficiencia, 0) / 
      (maquinas.filter(m => m.estado === 'operando').length || 1)),
    produccionTotal: maquinas.reduce((sum, m) => sum + m.produccion, 0),
    alertasTotal: maquinas.reduce((sum, m) => sum + m.alertas, 0)
  };

  // Filtrar máquinas
  const maquinasFiltradas = maquinas.filter(maq => {
    if (filtro !== 'todas' && maq.estado !== filtro) return false;
    if (busqueda && !maq.nombre.toLowerCase().includes(busqueda.toLowerCase()) && 
        !maq.tipo.toLowerCase().includes(busqueda.toLowerCase())) return false;
    return true;
  });

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'operando': return '#4caf50';
      case 'pausada': return '#ff9800';
      case 'mantenimiento': return '#f44336';
      case 'inactiva': return '#9e9e9e';
      default: return '#999';
    }
  };

  const getEstadoTexto = (estado) => {
    switch(estado) {
      case 'operando': return 'Operando';
      case 'pausada': return 'Pausada';
      case 'mantenimiento': return 'Mantenimiento';
      case 'inactiva': return 'Inactiva';
      default: return estado;
    }
  };

  return (
    <div className="maquinas-container-premium">
      {/* Notificación */}
      {notificacion.mostrar && (
        <div className={`notificacion ${notificacion.tipo}`}>
          {notificacion.mensaje}
        </div>
      )}

      {/* Header Premium */}
      <div className="header-premium">
        <div className="header-glow"></div>
        <div className="header-content">
          <div className="header-left">
            <h1 className="title-gradient">
              <span className="title-icon">⚙️</span>
              Máquinas en Tiempo Real
            </h1>
            <div className="date-badge">
              <span className="date-icon">📅</span>
              {formatDate(currentTime)}
            </div>
          </div>
          
          <div className="header-right">
            <div className="live-indicator-premium">
              <span className="live-pulse"></span>
              <span className="live-text">EN VIVO</span>
              <span className="live-time">{formatTime(currentTime)}</span>
            </div>
            
            <div className="header-actions">
              <button 
                className={`action-btn ${vista === 'grid' ? 'active' : ''}`}
                onClick={() => setVista('grid')}
              >
                <span className="btn-icon">📱</span>
                <span className="btn-text">Grid</span>
              </button>
              <button 
                className={`action-btn ${vista === 'lista' ? 'active' : ''}`}
                onClick={() => setVista('lista')}
              >
                <span className="btn-icon">📋</span>
                <span className="btn-text">Lista</span>
              </button>
              <button 
                className={`action-btn ${vista === 'detalle' ? 'active' : ''}`}
                onClick={() => setVista('detalle')}
              >
                <span className="btn-icon">📊</span>
                <span className="btn-text">Detalle</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="filtros-section">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar máquina o tipo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="search-input"
          />
          {busqueda && (
            <button className="clear-search" onClick={() => setBusqueda('')}>✕</button>
          )}
        </div>

        <div className="filtros-tabs">
          <button 
            className={`filtro-tab ${filtro === 'todas' ? 'active' : ''}`}
            onClick={() => setFiltro('todas')}
          >
            Todas <span className="tab-count">{stats.total}</span>
          </button>
          <button 
            className={`filtro-tab operando ${filtro === 'operando' ? 'active' : ''}`}
            onClick={() => setFiltro('operando')}
          >
            Operando <span className="tab-count">{stats.operando}</span>
          </button>
          <button 
            className={`filtro-tab pausada ${filtro === 'pausada' ? 'active' : ''}`}
            onClick={() => setFiltro('pausada')}
          >
            Pausadas <span className="tab-count">{stats.pausadas}</span>
          </button>
          <button 
            className={`filtro-tab mantenimiento ${filtro === 'mantenimiento' ? 'active' : ''}`}
            onClick={() => setFiltro('mantenimiento')}
          >
            Mantenimiento <span className="tab-count">{stats.mantenimiento}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Premium */}
      <div className="kpi-grid-premium">
        <div className="kpi-card-premium total">
          <div className="kpi-glow"></div>
          <div className="kpi-icon-wrapper">
            <span className="kpi-icon">🏭</span>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.total}</span>
            <span className="kpi-label">Total Máquinas</span>
          </div>
          <div className="kpi-trend">+2 este mes</div>
        </div>

        <div className="kpi-card-premium operando">
          <div className="kpi-glow"></div>
          <div className="kpi-icon-wrapper">
            <span className="kpi-icon">⚡</span>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.operando}</span>
            <span className="kpi-label">En Operación</span>
          </div>
          <div className="kpi-trend">{Math.round((stats.operando/stats.total)*100)}% activas</div>
        </div>

        <div className="kpi-card-premium eficiencia">
          <div className="kpi-glow"></div>
          <div className="kpi-icon-wrapper">
            <span className="kpi-icon">📊</span>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.eficiencia}%</span>
            <span className="kpi-label">Eficiencia</span>
          </div>
          <div className="kpi-trend">+5% vs ayer</div>
        </div>

        <div className="kpi-card-premium produccion">
          <div className="kpi-glow"></div>
          <div className="kpi-icon-wrapper">
            <span className="kpi-icon">📦</span>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.produccionTotal}</span>
            <span className="kpi-label">Producción</span>
          </div>
          <div className="kpi-trend">Unidades hoy</div>
        </div>

        <div className="kpi-card-premium alertas">
          <div className="kpi-glow"></div>
          <div className="kpi-icon-wrapper">
            <span className="kpi-icon">⚠️</span>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.alertasTotal}</span>
            <span className="kpi-label">Alertas</span>
          </div>
          <div className="kpi-trend">{stats.alertasTotal > 0 ? 'Requiere atención' : 'Sin alertas'}</div>
        </div>
      </div>

      {/* Vista Grid */}
      {vista === 'grid' && (
        <div className="maquinas-grid-premium">
          {maquinasFiltradas.map(maquina => (
            <div key={maquina.id} className={`maquina-card-premium ${maquina.estado}`}>
              <div className="card-glow"></div>
              
              <div className="card-header">
                <div className="maquina-titulo">
                  <h3>{maquina.nombre}</h3>
                  <span className="maquina-tipo-badge">{maquina.tipo}</span>
                </div>
                <div className="estado-indicador-premium" style={{ backgroundColor: getEstadoColor(maquina.estado) }}>
                  <span className="estado-texto">{getEstadoTexto(maquina.estado)}</span>
                </div>
              </div>

              <div className="card-body">
                <div className="metricas-grid">
                  <div className="metrica">
                    <span className="metrica-icon">⏱️</span>
                    <div className="metrica-info">
                      <span className="metrica-label">Tiempo</span>
                      <span className="metrica-value">{maquina.tiempo}</span>
                    </div>
                  </div>
                  
                  <div className="metrica">
                    <span className="metrica-icon">🌡️</span>
                    <div className="metrica-info">
                      <span className="metrica-label">Temperatura</span>
                      <span className="metrica-value">{maquina.temperatura}°C</span>
                    </div>
                  </div>
                  
                  <div className="metrica">
                    <span className="metrica-icon">⚡</span>
                    <div className="metrica-info">
                      <span className="metrica-label">Velocidad</span>
                      <span className="metrica-value">{maquina.velocidad}%</span>
                    </div>
                  </div>
                  
                  <div className="metrica">
                    <span className="metrica-icon">📦</span>
                    <div className="metrica-info">
                      <span className="metrica-label">Producción</span>
                      <span className="metrica-value">{maquina.produccion}</span>
                    </div>
                  </div>
                </div>

                <div className="eficiencia-container">
                  <div className="eficiencia-header">
                    <span>Eficiencia</span>
                    <span className="eficiencia-valor">{maquina.eficiencia}%</span>
                  </div>
                  <div className="eficiencia-bar-premium">
                    <div 
                      className="eficiencia-progress-premium" 
                      style={{ width: `${maquina.eficiencia}%` }}
                    ></div>
                  </div>
                </div>

                {maquina.alertas > 0 && (
                  <div className="alertas-badge">
                    ⚠️ {maquina.alertas} alerta{maquina.alertas > 1 ? 's' : ''}
                  </div>
                )}

                <div className="operador-info">
                  <span className="operador-icon">👤</span>
                  <span className="operador-nombre">{maquina.operador}</span>
                </div>
              </div>

              <div className="card-actions">
                <button 
                  className="action-icon-btn play" 
                  onClick={() => cambiarEstadoMaquina(maquina.id, 'operando')}
                  disabled={maquina.estado === 'operando'}
                  title="Iniciar"
                >
                  ▶️
                </button>
                <button 
                  className="action-icon-btn pause" 
                  onClick={() => cambiarEstadoMaquina(maquina.id, 'pausada')}
                  disabled={maquina.estado === 'pausada'}
                  title="Pausar"
                >
                  ⏸️
                </button>
                <button 
                  className="action-icon-btn maintenance" 
                  onClick={() => iniciarMantenimiento(maquina.id)}
                  disabled={maquina.estado === 'mantenimiento'}
                  title="Mantenimiento"
                >
                  🔧
                </button>
                <button 
                  className="action-icon-btn restart" 
                  onClick={() => reiniciarMaquina(maquina.id)}
                  title="Reiniciar"
                >
                  🔄
                </button>
                <button 
                  className="action-icon-btn emergency" 
                  onClick={() => detenerEmergencia(maquina.id)}
                  title="Parada de emergencia"
                >
                  ⚠️
                </button>
                <button 
                  className="action-icon-btn details" 
                  onClick={() => setMaquinaSeleccionada(maquina)}
                  title="Ver detalles"
                >
                  📊
                </button>
              </div>

              <div className="mantenimiento-info">
                <span>Último: {maquina.ultimoMantenimiento}</span>
                <span>Próximo: {maquina.proximoMantenimiento}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vista Lista */}
      {vista === 'lista' && (
        <div className="maquinas-lista-premium">
          <table className="lista-table">
            <thead>
              <tr>
                <th>Máquina</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Tiempo</th>
                <th>Eficiencia</th>
                <th>Temperatura</th>
                <th>Producción</th>
                <th>Operador</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {maquinasFiltradas.map(maquina => (
                <tr key={maquina.id} className={`lista-row ${maquina.estado}`}>
                  <td className="nombre-cell">{maquina.nombre}</td>
                  <td>{maquina.tipo}</td>
                  <td>
                    <span className="estado-badge" style={{ backgroundColor: getEstadoColor(maquina.estado) }}>
                      {getEstadoTexto(maquina.estado)}
                    </span>
                  </td>
                  <td className="tiempo-cell">{maquina.tiempo}</td>
                  <td>
                    <div className="eficiencia-mini">
                      <div className="mini-bar" style={{ width: `${maquina.eficiencia}%` }}></div>
                      <span>{maquina.eficiencia}%</span>
                    </div>
                  </td>
                  <td>{maquina.temperatura}°C</td>
                  <td>{maquina.produccion}</td>
                  <td>{maquina.operador}</td>
                  <td>
                    <div className="lista-acciones">
                      <button className="lista-btn play" onClick={() => cambiarEstadoMaquina(maquina.id, 'operando')}>▶️</button>
                      <button className="lista-btn pause" onClick={() => cambiarEstadoMaquina(maquina.id, 'pausada')}>⏸️</button>
                      <button className="lista-btn details" onClick={() => setMaquinaSeleccionada(maquina)}>📊</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Vista Detalle */}
      {vista === 'detalle' && maquinaSeleccionada && (
        <div className="detalle-premium">
          <button className="close-detalle" onClick={() => setMaquinaSeleccionada(null)}>✕</button>
          <h2>{maquinaSeleccionada.nombre}</h2>
          <div className="detalle-grid">
            <div className="detalle-section">
              <h4>Información General</h4>
              <p><strong>Tipo:</strong> {maquinaSeleccionada.tipo}</p>
              <p><strong>Estado:</strong> {getEstadoTexto(maquinaSeleccionada.estado)}</p>
              <p><strong>Operador:</strong> {maquinaSeleccionada.operador}</p>
              <p><strong>Tiempo operación:</strong> {maquinaSeleccionada.tiempo}</p>
            </div>
            <div className="detalle-section">
              <h4>Métricas</h4>
              <p><strong>Eficiencia:</strong> {maquinaSeleccionada.eficiencia}%</p>
              <p><strong>Temperatura:</strong> {maquinaSeleccionada.temperatura}°C</p>
              <p><strong>Velocidad:</strong> {maquinaSeleccionada.velocidad}%</p>
              <p><strong>Producción:</strong> {maquinaSeleccionada.produccion} unidades</p>
            </div>
            <div className="detalle-section">
              <h4>Mantenimiento</h4>
              <p><strong>Último:</strong> {maquinaSeleccionada.ultimoMantenimiento}</p>
              <p><strong>Próximo:</strong> {maquinaSeleccionada.proximoMantenimiento}</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer Premium */}
      <div className="footer-premium">
        <div className="footer-left">
          <div className="sync-status-premium">
            <span className="sync-dot-premium"></span>
            <span>Sincronizado {formatTime(currentTime)}</span>
          </div>
        </div>
        <div className="footer-right">
          <div className="footer-stats">
            <span>📊 {stats.operando} activas</span>
            <span className="stat-separator">•</span>
            <span>⚡ {stats.eficiencia}% eficiencia</span>
            <span className="stat-separator">•</span>
            <span>⚠️ {stats.alertasTotal} alertas</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaquinasTiempoReal;