import React, { useState, useEffect } from 'react';
import './ReporteRH.css';

const ReporteRH = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [vista, setVista] = useState('tabla'); // tabla, tarjetas, graficos, detalle
  const [periodo, setPeriodo] = useState('semana');
  const [filtros, setFiltros] = useState({
    semana: 'todas',
    status: 'todos',
    sport: 'todos',
    turno: 'todos',
    busqueda: ''
  });

  const [reportes, setReportes] = useState([
    { id: 1, po: 'V108707', sport: 'Baseball', week: 7, pc: 15, sublimado: '11/26', maquina: 88, turno: 'A', status: 'OK', operador: 'Carlos López', horas: 6.5, eficiencia: 92 },
    { id: 2, po: 'V109133', sport: 'Baseball', week: 8, pc: 4, sublimado: '11/26', maquina: 88, turno: 'B', status: 'OK', operador: 'María González', horas: 4, eficiencia: 88 },
    { id: 3, po: 'V108994', sport: 'Baseball', week: 2, pc: 10, sublimado: '11/27', maquina: 18, turno: 'A', status: 'OK', operador: 'Pedro Ramírez', horas: 5, eficiencia: 95 },
    { id: 4, po: 'V109217', sport: 'Baseball', week: 4, pc: 20, sublimado: '12/2', maquina: 88, turno: 'B', status: 'OK', operador: 'Ana Martínez', horas: 7, eficiencia: 89 },
    { id: 5, po: 'V108251', sport: 'Baseball', week: 8, pc: 50, sublimado: '12/3', maquina: '3A', turno: 'A', status: 'RH', operador: 'Roberto Díaz', horas: 8, eficiencia: 76 },
    { id: 6, po: 'V109459', sport: 'Baseball', week: 2, pc: 10, sublimado: '12/4', maquina: '5A', turno: 'A', status: 'OK', operador: 'Laura Torres', horas: 5.5, eficiencia: 94 },
    { id: 7, po: 'V109460', sport: 'Soccer', week: 3, pc: 25, sublimado: '12/5', maquina: 12, turno: 'A', status: 'OK', operador: 'Carlos López', horas: 6, eficiencia: 91 },
    { id: 8, po: 'V109461', sport: 'Basketball', week: 5, pc: 30, sublimado: '12/6', maquina: 7, turno: 'B', status: 'RH', operador: 'María González', horas: 7.5, eficiencia: 72 },
    { id: 9, po: 'V109462', sport: 'Football', week: 6, pc: 12, sublimado: '12/7', maquina: 15, turno: 'A', status: 'OK', operador: 'Pedro Ramírez', horas: 5, eficiencia: 93 },
    { id: 10, po: 'V109463', sport: 'Tennis', week: 4, pc: 18, sublimado: '12/8', maquina: 22, turno: 'C', status: 'Pendiente', operador: 'Ana Martínez', horas: 4.5, eficiencia: 0 },
    { id: 11, po: 'V109464', sport: 'Volleyball', week: 7, pc: 22, sublimado: '12/9', maquina: 31, turno: 'A', status: 'OK', operador: 'Roberto Díaz', horas: 6, eficiencia: 96 },
    { id: 12, po: 'V109465', sport: 'Baseball', week: 1, pc: 8, sublimado: '12/10', maquina: 45, turno: 'B', status: 'Revisión', operador: 'Laura Torres', horas: 3, eficiencia: 0 },
  ]);

  const [selectedReporte, setSelectedReporte] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');

  // Opciones para filtros
  const semanas = ['todas', ...new Set(reportes.map(r => `Semana ${r.week}`))];
  const sports = ['todos', ...new Set(reportes.map(r => r.sport))];
  const turnos = ['todos', ...new Set(reportes.map(r => r.turno))];
  const statusList = ['todos', 'OK', 'RH', 'Pendiente', 'Revisión'];

  useEffect(() => {
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

  // Filtrar reportes
  const reportesFiltrados = reportes.filter(reporte => {
    if (filtros.semana !== 'todas' && `Semana ${reporte.week}` !== filtros.semana) return false;
    if (filtros.status !== 'todos' && reporte.status !== filtros.status) return false;
    if (filtros.sport !== 'todos' && reporte.sport !== filtros.sport) return false;
    if (filtros.turno !== 'todos' && reporte.turno !== filtros.turno) return false;
    if (filtros.busqueda && !reporte.po.toLowerCase().includes(filtros.busqueda.toLowerCase()) && 
        !reporte.sport.toLowerCase().includes(filtros.busqueda.toLowerCase()) &&
        !reporte.operador.toLowerCase().includes(filtros.busqueda.toLowerCase())) return false;
    return true;
  });

  // Calcular estadísticas
  const stats = {
    totalRegistros: reportesFiltrados.length,
    totalOK: reportesFiltrados.filter(r => r.status === 'OK').length,
    totalRH: reportesFiltrados.filter(r => r.status === 'RH').length,
    totalPC: reportesFiltrados.reduce((sum, r) => sum + r.pc, 0),
    totalHoras: reportesFiltrados.reduce((sum, r) => sum + (r.horas || 0), 0).toFixed(1),
    eficienciaPromedio: Math.round(reportesFiltrados.filter(r => r.eficiencia > 0).reduce((sum, r) => sum + r.eficiencia, 0) / 
      (reportesFiltrados.filter(r => r.eficiencia > 0).length || 1)),
    porSport: {},
    porTurno: { A: 0, B: 0, C: 0 }
  };

  // Calcular estadísticas por deporte
  reportesFiltrados.forEach(r => {
    stats.porSport[r.sport] = (stats.porSport[r.sport] || 0) + r.pc;
    stats.porTurno[r.turno] = (stats.porTurno[r.turno] || 0) + 1;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'OK': return '#10b981';
      case 'RH': return '#ef4444';
      case 'Pendiente': return '#f59e0b';
      case 'Revisión': return '#8b5cf6';
      default: return '#94a3b8';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'OK': return '✅';
      case 'RH': return '⚠️';
      case 'Pendiente': return '⏳';
      case 'Revisión': return '🔍';
      default: return '❓';
    }
  };

  const handleVerDetalle = (reporte) => {
    setSelectedReporte(reporte);
    setModalType('detalle');
    setShowModal(true);
  };

  const handleEditar = (reporte) => {
    setSelectedReporte(reporte);
    setModalType('editar');
    setShowModal(true);
  };

  const handleCambiarStatus = (id, nuevoStatus) => {
    setReportes(prev => prev.map(r => 
      r.id === id ? { ...r, status: nuevoStatus } : r
    ));
  };

  const handleExportar = (formato) => {
    console.log(`Exportando en formato ${formato}...`);
    // Aquí iría la lógica de exportación
  };

  const resetFiltros = () => {
    setFiltros({
      semana: 'todas',
      status: 'todos',
      sport: 'todos',
      turno: 'todos',
      busqueda: ''
    });
  };

  return (
    <div className="reporterh-premium-container">
      {/* Modal de Detalle/Edición */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            
            {modalType === 'detalle' && selectedReporte && (
              <div className="detalle-modal">
                <h2>Detalle de Orden {selectedReporte.po}</h2>
                <div className="detalle-grid">
                  <div className="detalle-section">
                    <h4>Información General</h4>
                    <p><strong>PO:</strong> {selectedReporte.po}</p>
                    <p><strong>Sport:</strong> {selectedReporte.sport}</p>
                    <p><strong>Semana:</strong> {selectedReporte.week}</p>
                    <p><strong>PC:</strong> {selectedReporte.pc}</p>
                  </div>
                  <div className="detalle-section">
                    <h4>Producción</h4>
                    <p><strong>Sublimado:</strong> {selectedReporte.sublimado}</p>
                    <p><strong>Máquina:</strong> {selectedReporte.maquina}</p>
                    <p><strong>Turno:</strong> {selectedReporte.turno}</p>
                    <p><strong>Operador:</strong> {selectedReporte.operador}</p>
                  </div>
                  <div className="detalle-section">
                    <h4>Métricas</h4>
                    <p><strong>Status:</strong> 
                      <span className="status-badge" style={{backgroundColor: getStatusColor(selectedReporte.status)}}>
                        {selectedReporte.status}
                      </span>
                    </p>
                    <p><strong>Horas:</strong> {selectedReporte.horas}</p>
                    <p><strong>Eficiencia:</strong> {selectedReporte.eficiencia}%</p>
                  </div>
                </div>
                <div className="detalle-actions">
                  <button className="btn-editar" onClick={() => handleEditar(selectedReporte)}>
                    ✏️ Editar
                  </button>
                  <button className="btn-cerrar" onClick={() => setShowModal(false)}>
                    Cerrar
                  </button>
                </div>
              </div>
            )}

            {modalType === 'editar' && selectedReporte && (
              <div className="editar-modal">
                <h2>Editar Orden {selectedReporte.po}</h2>
                <form className="editar-form">
                  <div className="form-group">
                    <label>Status</label>
                    <select defaultValue={selectedReporte.status}>
                      <option value="OK">OK</option>
                      <option value="RH">RH</option>
                      <option value="Pendiente">Pendiente</option>
                      <option value="Revisión">Revisión</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Operador</label>
                    <input type="text" defaultValue={selectedReporte.operador} />
                  </div>
                  <div className="form-group">
                    <label>Horas</label>
                    <input type="number" step="0.5" defaultValue={selectedReporte.horas} />
                  </div>
                  <div className="form-group">
                    <label>Eficiencia (%)</label>
                    <input type="number" defaultValue={selectedReporte.eficiencia} />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn-guardar">Guardar Cambios</button>
                    <button type="button" className="btn-cancelar" onClick={() => setShowModal(false)}>Cancelar</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header Premium */}
      <div className="reporterh-header-premium">
        <div className="header-glow"></div>
        <div className="header-content">
          <div className="header-left">
            <h1 className="title-gradient">
              <span className="title-icon">👥</span>
              Reporte de Recursos Humanos
            </h1>
            <div className="date-badge-premium">
              <span className="date-icon">📅</span>
              {formatDate(currentTime)}
            </div>
          </div>
          
          <div className="header-right">
            <div className="live-indicator-premium">
              <span className="live-pulse"></span>
              <span className="live-text">ACTUALIZADO</span>
              <span className="live-time">{formatTime(currentTime)}</span>
            </div>
            
            <div className="header-actions-premium">
              <button 
                className={`action-btn ${vista === 'tabla' ? 'active' : ''}`}
                onClick={() => setVista('tabla')}
              >
                <span className="btn-icon">📋</span>
                <span className="btn-text">Tabla</span>
              </button>
              <button 
                className={`action-btn ${vista === 'tarjetas' ? 'active' : ''}`}
                onClick={() => setVista('tarjetas')}
              >
                <span className="btn-icon">🃏</span>
                <span className="btn-text">Tarjetas</span>
              </button>
              <button 
                className={`action-btn ${vista === 'graficos' ? 'active' : ''}`}
                onClick={() => setVista('graficos')}
              >
                <span className="btn-icon">📊</span>
                <span className="btn-text">Gráficos</span>
              </button>
              <button 
                className={`action-btn ${vista === 'analisis' ? 'active' : ''}`}
                onClick={() => setVista('analisis')}
              >
                <span className="btn-icon">📈</span>
                <span className="btn-text">Análisis</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de herramientas */}
      <div className="toolbar-premium">
        <div className="toolbar-left">
          <div className="period-selector">
            <button 
              className={`period-btn ${periodo === 'dia' ? 'active' : ''}`}
              onClick={() => setPeriodo('dia')}
            >
              Día
            </button>
            <button 
              className={`period-btn ${periodo === 'semana' ? 'active' : ''}`}
              onClick={() => setPeriodo('semana')}
            >
              Semana
            </button>
            <button 
              className={`period-btn ${periodo === 'mes' ? 'active' : ''}`}
              onClick={() => setPeriodo('mes')}
            >
              Mes
            </button>
            <button 
              className={`period-btn ${periodo === 'trimestre' ? 'active' : ''}`}
              onClick={() => setPeriodo('trimestre')}
            >
              Trimestre
            </button>
          </div>

          <div className="export-actions">
            <button className="export-btn" onClick={() => handleExportar('pdf')}>
              <span>📄</span> PDF
            </button>
            <button className="export-btn" onClick={() => handleExportar('excel')}>
              <span>📊</span> Excel
            </button>
            <button className="export-btn" onClick={() => handleExportar('csv')}>
              <span>📑</span> CSV
            </button>
          </div>
        </div>

        <div className="toolbar-right">
          <button className="reset-filters-btn" onClick={resetFiltros}>
            <span>🔄</span> Resetear Filtros
          </button>
        </div>
      </div>

      {/* Filtros Premium */}
      <div className="filtros-premium">
        <div className="filtros-grid">
          <div className="filtro-item">
            <label>Semana</label>
            <select 
              value={filtros.semana} 
              onChange={(e) => setFiltros({...filtros, semana: e.target.value})}
              className="filtro-select-premium"
            >
              {semanas.map(s => (
                <option key={s} value={s}>{s === 'todas' ? 'Todas las semanas' : s}</option>
              ))}
            </select>
          </div>

          <div className="filtro-item">
            <label>Status</label>
            <select 
              value={filtros.status} 
              onChange={(e) => setFiltros({...filtros, status: e.target.value})}
              className="filtro-select-premium"
            >
              {statusList.map(s => (
                <option key={s} value={s}>{s === 'todos' ? 'Todos los status' : s}</option>
              ))}
            </select>
          </div>

          <div className="filtro-item">
            <label>Sport</label>
            <select 
              value={filtros.sport} 
              onChange={(e) => setFiltros({...filtros, sport: e.target.value})}
              className="filtro-select-premium"
            >
              {sports.map(s => (
                <option key={s} value={s}>{s === 'todos' ? 'Todos los sports' : s}</option>
              ))}
            </select>
          </div>

          <div className="filtro-item">
            <label>Turno</label>
            <select 
              value={filtros.turno} 
              onChange={(e) => setFiltros({...filtros, turno: e.target.value})}
              className="filtro-select-premium"
            >
              {turnos.map(t => (
                <option key={t} value={t}>{t === 'todos' ? 'Todos los turnos' : `Turno ${t}`}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="search-box-premium">
          <input
            type="text"
            placeholder="Buscar por PO, Sport u Operador..."
            value={filtros.busqueda}
            onChange={(e) => setFiltros({...filtros, busqueda: e.target.value})}
            className="search-input-premium"
          />
          <span className="search-icon-premium">🔍</span>
          {filtros.busqueda && (
            <button className="clear-search" onClick={() => setFiltros({...filtros, busqueda: ''})}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Premium */}
      <div className="kpi-grid-premium">
        <div className="kpi-card-premium total">
          <div className="kpi-glow"></div>
          <div className="kpi-icon-wrapper">
            <span className="kpi-icon">📋</span>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.totalRegistros}</span>
            <span className="kpi-label">Total Registros</span>
          </div>
          <div className="kpi-trend">+{stats.totalRegistros - 5} vs ayer</div>
        </div>

        <div className="kpi-card-premium ok">
          <div className="kpi-glow"></div>
          <div className="kpi-icon-wrapper">
            <span className="kpi-icon">✅</span>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.totalOK}</span>
            <span className="kpi-label">Total OK</span>
          </div>
          <div className="kpi-trend">{Math.round((stats.totalOK/stats.totalRegistros)*100)}% del total</div>
        </div>

        <div className="kpi-card-premium rh">
          <div className="kpi-glow"></div>
          <div className="kpi-icon-wrapper">
            <span className="kpi-icon">⚠️</span>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.totalRH}</span>
            <span className="kpi-label">Total RH</span>
          </div>
          <div className="kpi-trend">Requiere atención</div>
        </div>

        <div className="kpi-card-premium pc">
          <div className="kpi-glow"></div>
          <div className="kpi-icon-wrapper">
            <span className="kpi-icon">📦</span>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.totalPC}</span>
            <span className="kpi-label">Total PC</span>
          </div>
          <div className="kpi-trend">Unidades producidas</div>
        </div>

        <div className="kpi-card-premium horas">
          <div className="kpi-glow"></div>
          <div className="kpi-icon-wrapper">
            <span className="kpi-icon">⏱️</span>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.totalHoras}</span>
            <span className="kpi-label">Horas Hombre</span>
          </div>
          <div className="kpi-trend">Promedio {Math.round(stats.totalHoras/stats.totalRegistros)}h/orden</div>
        </div>

        <div className="kpi-card-premium eficiencia">
          <div className="kpi-glow"></div>
          <div className="kpi-icon-wrapper">
            <span className="kpi-icon">📊</span>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.eficienciaPromedio}%</span>
            <span className="kpi-label">Eficiencia</span>
          </div>
          <div className="kpi-trend">{stats.eficienciaPromedio > 85 ? 'Excelente' : 'Mejorable'}</div>
        </div>
      </div>

      {/* Vista de Tabla */}
      {vista === 'tabla' && (
        <div className="tabla-premium-container">
          <table className="reporterh-table-premium">
            <thead>
              <tr>
                <th>PO</th>
                <th>Sport</th>
                <th>Week</th>
                <th>PC</th>
                <th>Sublimado</th>
                <th>Máquina</th>
                <th>Turno</th>
                <th>Operador</th>
                <th>Horas</th>
                <th>Eficiencia</th>
                <th>Status</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reportesFiltrados.map((reporte, index) => (
                <tr key={index} className={`table-row ${reporte.status === 'RH' ? 'rh' : ''}`}>
                  <td className="po-cell">{reporte.po}</td>
                  <td>{reporte.sport}</td>
                  <td className="week-cell">{reporte.week}</td>
                  <td className="pc-cell">{reporte.pc}</td>
                  <td>{reporte.sublimado}</td>
                  <td>{reporte.maquina}</td>
                  <td>
                    <span className="turno-badge turno-{reporte.turno}">
                      {reporte.turno}
                    </span>
                  </td>
                  <td>{reporte.operador}</td>
                  <td>{reporte.horas}</td>
                  <td>
                    <div className="eficiencia-mini">
                      <div className="mini-bar" style={{width: `${reporte.eficiencia}%`}}></div>
                      <span>{reporte.eficiencia}%</span>
                    </div>
                  </td>
                  <td>
                    <span 
                      className="status-badge-premium"
                      style={{ backgroundColor: getStatusColor(reporte.status) }}
                    >
                      {getStatusIcon(reporte.status)} {reporte.status}
                    </span>
                  </td>
                  <td>
                    <div className="acciones-cell">
                      <button 
                        className="accion-btn ver" 
                        onClick={() => handleVerDetalle(reporte)}
                        title="Ver detalle"
                      >
                        👁️
                      </button>
                      <button 
                        className="accion-btn editar" 
                        onClick={() => handleEditar(reporte)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <select 
                        className="status-selector"
                        onChange={(e) => handleCambiarStatus(reporte.id, e.target.value)}
                        value={reporte.status}
                      >
                        <option value="OK">✅ OK</option>
                        <option value="RH">⚠️ RH</option>
                        <option value="Pendiente">⏳ Pendiente</option>
                        <option value="Revisión">🔍 Revisión</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Vista de Tarjetas */}
      {vista === 'tarjetas' && (
        <div className="tarjetas-grid-premium">
          {reportesFiltrados.map(reporte => (
            <div key={reporte.id} className={`reporte-card ${reporte.status}`}>
              <div className="card-glow"></div>
              
              <div className="card-header">
                <div className="card-titulo">
                  <h3>{reporte.po}</h3>
                  <span className="card-sport">{reporte.sport}</span>
                </div>
                <span 
                  className="card-status"
                  style={{ backgroundColor: getStatusColor(reporte.status) }}
                >
                  {getStatusIcon(reporte.status)} {reporte.status}
                </span>
              </div>

              <div className="card-body">
                <div className="card-info-grid">
                  <div className="info-item">
                    <span className="info-label">Semana</span>
                    <span className="info-value">{reporte.week}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">PC</span>
                    <span className="info-value">{reporte.pc}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Máquina</span>
                    <span className="info-value">{reporte.maquina}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Turno</span>
                    <span className="info-value">{reporte.turno}</span>
                  </div>
                </div>

                <div className="card-operador">
                  <span className="operador-icon">👤</span>
                  <span className="operador-nombre">{reporte.operador}</span>
                </div>

                <div className="card-metricas">
                  <div className="metrica">
                    <span className="metrica-label">Horas</span>
                    <span className="metrica-value">{reporte.horas}</span>
                  </div>
                  <div className="metrica">
                    <span className="metrica-label">Eficiencia</span>
                    <span className="metrica-value">{reporte.eficiencia}%</span>
                  </div>
                </div>

                <div className="card-progress">
                  <div 
                    className="progress-bar" 
                    style={{width: `${reporte.eficiencia}%`, backgroundColor: getStatusColor(reporte.status)}}
                  ></div>
                </div>
              </div>

              <div className="card-footer">
                <span className="fecha">{reporte.sublimado}</span>
                <div className="card-actions">
                  <button className="card-btn" onClick={() => handleVerDetalle(reporte)}>Ver</button>
                  <button className="card-btn" onClick={() => handleEditar(reporte)}>Editar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vista de Gráficos */}
      {vista === 'graficos' && (
        <div className="graficos-premium-container">
          <div className="graficos-grid">
            <div className="grafico-card">
              <h3>Distribución por Status</h3>
              <div className="grafico-pie-container">
                <div className="pie-chart">
                  {['OK', 'RH', 'Pendiente', 'Revisión'].map(status => {
                    const count = reportesFiltrados.filter(r => r.status === status).length;
                    const percentage = Math.round((count / stats.totalRegistros) * 100);
                    if (count === 0) return null;
                    return (
                      <div key={status} className="pie-segment" style={{
                        backgroundColor: getStatusColor(status),
                        width: `${percentage}%`
                      }}>
                        <span className="segment-label">{status} {percentage}%</span>
                      </div>
                    );
                  })}
                </div>
                <div className="pie-legend">
                  {['OK', 'RH', 'Pendiente', 'Revisión'].map(status => {
                    const count = reportesFiltrados.filter(r => r.status === status).length;
                    if (count === 0) return null;
                    return (
                      <div key={status} className="legend-item">
                        <span className="legend-color" style={{backgroundColor: getStatusColor(status)}}></span>
                        <span className="legend-label">{status}</span>
                        <span className="legend-value">{count} ({Math.round((count/stats.totalRegistros)*100)}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grafico-card">
              <h3>Producción por Sport</h3>
              <div className="barras-container">
                {Object.entries(stats.porSport).map(([sport, pc]) => (
                  <div key={sport} className="barra-item">
                    <span className="barra-label">{sport}</span>
                    <div className="barra-wrapper">
                      <div 
                        className="barra-fill"
                        style={{
                          width: `${(pc / Math.max(...Object.values(stats.porSport))) * 100}%`,
                          background: 'linear-gradient(90deg, #6366f1, #8b5cf6)'
                        }}
                      ></div>
                      <span className="barra-value">{pc} PC</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grafico-card">
              <h3>Distribución por Turno</h3>
              <div className="donut-container">
                <div className="donut-chart">
                  {Object.entries(stats.porTurno).map(([turno, count], index) => {
                    const percentage = (count / stats.totalRegistros) * 100;
                    const colors = ['#3b82f6', '#10b981', '#f59e0b'];
                    return (
                      <div key={turno} className="donut-segment" style={{
                        transform: `rotate(${index * 120}deg)`,
                        background: `conic-gradient(${colors[index]} 0deg ${percentage * 3.6}deg, transparent ${percentage * 3.6}deg 360deg)`
                      }}>
                        <span className="segment-text">{turno}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="donut-legend">
                  {Object.entries(stats.porTurno).map(([turno, count], index) => {
                    const colors = ['#3b82f6', '#10b981', '#f59e0b'];
                    return (
                      <div key={turno} className="legend-item">
                        <span className="legend-color" style={{backgroundColor: colors[index]}}></span>
                        <span className="legend-label">Turno {turno}</span>
                        <span className="legend-value">{count} ({Math.round((count/stats.totalRegistros)*100)}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grafico-card">
              <h3>Eficiencia por Operador</h3>
              <div className="operadores-lista">
                {[...new Set(reportesFiltrados.map(r => r.operador))].map(operador => {
                  const reportesOp = reportesFiltrados.filter(r => r.operador === operador);
                  const eficienciaOp = Math.round(reportesOp.reduce((sum, r) => sum + r.eficiencia, 0) / reportesOp.length);
                  const color = eficienciaOp > 85 ? '#10b981' : eficienciaOp > 70 ? '#f59e0b' : '#ef4444';
                  
                  return (
                    <div key={operador} className="operador-item">
                      <span className="operador-name">{operador}</span>
                      <div className="operador-bar-container">
                        <div 
                          className="operador-bar"
                          style={{
                            width: `${eficienciaOp}%`,
                            backgroundColor: color
                          }}
                        ></div>
                        <span className="operador-eficiencia">{eficienciaOp}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vista de Análisis */}
      {vista === 'analisis' && (
        <div className="analisis-premium-container">
          <div className="analisis-grid">
            <div className="analisis-card">
              <h3>Resumen Ejecutivo</h3>
              <div className="resumen-stats">
                <div className="stat-item">
                  <span className="stat-label">Total Órdenes</span>
                  <span className="stat-number">{stats.totalRegistros}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Tasa de Aprobación</span>
                  <span className="stat-number">{Math.round((stats.totalOK/stats.totalRegistros)*100)}%</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Horas Promedio</span>
                  <span className="stat-number">{Math.round(stats.totalHoras/stats.totalRegistros)}h</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">PC por Hora</span>
                  <span className="stat-number">{Math.round(stats.totalPC/stats.totalHoras)}</span>
                </div>
              </div>
            </div>

            <div className="analisis-card">
              <h3>Recomendaciones</h3>
              <ul className="recomendaciones-lista">
                {stats.totalRH > 0 && (
                  <li className="recomendacion-item alerta">
                    ⚠️ {stats.totalRH} órdenes requieren atención de RH
                  </li>
                )}
                {stats.eficienciaPromedio < 85 && (
                  <li className="recomendacion-item advertencia">
                    📉 Eficiencia por debajo del objetivo (85%)
                  </li>
                )}
                {stats.porTurno.B > stats.porTurno.A && (
                  <li className="recomendacion-item info">
                    ℹ️ Turno B tiene mayor productividad
                  </li>
                )}
                <li className="recomendacion-item exito">
                  ✅ {stats.totalOK} órdenes completadas exitosamente
                </li>
              </ul>
            </div>

            <div className="analisis-card">
              <h3>Tendencias</h3>
              <div className="tendencias">
                <div className="tendencia-item positiva">
                  <span className="tendencia-icon">📈</span>
                  <div className="tendencia-info">
                    <span className="tendencia-label">Producción</span>
                    <span className="tendencia-value">+12% vs ayer</span>
                  </div>
                </div>
                <div className="tendencia-item negativa">
                  <span className="tendencia-icon">📉</span>
                  <div className="tendencia-info">
                    <span className="tendencia-label">Eficiencia</span>
                    <span className="tendencia-value">-3% vs ayer</span>
                  </div>
                </div>
                <div className="tendencia-item estable">
                  <span className="tendencia-icon">📊</span>
                  <div className="tendencia-info">
                    <span className="tendencia-label">Horas Hombre</span>
                    <span className="tendencia-value">Estable</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="analisis-card">
              <h3>Próximos Pasos</h3>
              <div className="proximos-pasos">
                <div className="paso-item">
                  <input type="checkbox" id="paso1" />
                  <label htmlFor="paso1">Revisar órdenes con status RH</label>
                </div>
                <div className="paso-item">
                  <input type="checkbox" id="paso2" />
                  <label htmlFor="paso2">Optimizar turno con menor producción</label>
                </div>
                <div className="paso-item">
                  <input type="checkbox" id="paso3" />
                  <label htmlFor="paso3">Capacitación para operadores</label>
                </div>
                <div className="paso-item">
                  <input type="checkbox" id="paso4" />
                  <label htmlFor="paso4">Actualizar reporte semanal</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Premium */}
      <div className="reporterh-footer-premium">
        <div className="footer-left">
          <div className="sync-status-premium">
            <span className="sync-dot-premium"></span>
            <span>Sincronizado {formatTime(currentTime)}</span>
          </div>
        </div>
        <div className="footer-right">
          <div className="footer-stats-premium">
            <span>📊 Mostrando {reportesFiltrados.length} de {reportes.length} registros</span>
            <span className="stat-separator">•</span>
            <span>✅ {stats.totalOK} OK</span>
            <span className="stat-separator">•</span>
            <span>⚠️ {stats.totalRH} RH</span>
            <span className="stat-separator">•</span>
            <span>📦 {stats.totalPC} PC</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReporteRH;