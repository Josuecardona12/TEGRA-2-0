import React, { useState, useEffect } from 'react';
import './Ordenes.css';

const Ordenes = () => {
  const [vista, setVista] = useState('tablero');
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [mostrarPanelDetalle, setMostrarPanelDetalle] = useState(false);
  const [modoCompacto, setModoCompacto] = useState(false);
  const [ordenamiento, setOrdenamiento] = useState({ campo: 'id', direccion: 'asc' });
  const [filtrosAvanzados, setFiltrosAvanzados] = useState({
    area: 'todas',
    turno: 'todos',
    prioridad: 'todas'
  });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [favoritos, setFavoritos] = useState([]);

  // Datos de ejemplo mejorados
  const [ordenes, setOrdenes] = useState([
    { 
      id: 'ORD-001', 
      producto: 'Camiseta MLB Yankees', 
      cliente: 'Nike',
      cantidad: 150, 
      area: 'Producción', 
      turno: 'Mañana', 
      tiempo: '00:00:47',
      estado: 'en_proceso',
      prioridad: 'alta',
      progreso: 75,
      fechaInicio: '2026-02-26',
      fechaEntrega: '2026-03-05',
      responsable: 'Carlos Ruiz',
      notas: 'Urgente - Cliente premium'
    },
    { 
      id: 'ORD-002', 
      producto: 'Gorra NBA Lakers', 
      cliente: 'Adidas',
      cantidad: 75, 
      area: 'Calidad', 
      turno: 'Mañana', 
      tiempo: '00:00:47',
      estado: 'completada',
      prioridad: 'media',
      progreso: 100,
      fechaInicio: '2026-02-25',
      fechaEntrega: '2026-02-26',
      responsable: 'María González',
      notas: 'Inspección final'
    },
    { 
      id: 'ORD-003', 
      producto: 'Uniforme NFL Patriots', 
      cliente: 'Puma',
      cantidad: 200, 
      area: 'Logística', 
      turno: 'Mañana', 
      tiempo: '00:00:47',
      estado: 'pendiente',
      prioridad: 'baja',
      progreso: 0,
      fechaInicio: '2026-02-27',
      fechaEntrega: '2026-03-10',
      responsable: 'Juan Pérez',
      notas: 'Esperando materiales'
    },
    { 
      id: 'ORD-004', 
      producto: 'Sudadera NHL Bruins', 
      cliente: 'Local',
      cantidad: 100, 
      area: 'Sublimado', 
      turno: 'Mañana', 
      tiempo: '00:00:47',
      estado: 'en_proceso',
      prioridad: 'alta',
      progreso: 45,
      fechaInicio: '2026-02-26',
      fechaEntrega: '2026-03-03',
      responsable: 'Ana López',
      notas: 'Diseño personalizado'
    },
    { 
      id: 'ORD-005', 
      producto: 'Camiseta FIFA World Cup', 
      cliente: 'Nike',
      cantidad: 300, 
      area: 'Reposición', 
      turno: 'Mañana', 
      tiempo: '00:00:47',
      estado: 'revision',
      prioridad: 'critica',
      progreso: 90,
      fechaInicio: '2026-02-24',
      fechaEntrega: '2026-02-28',
      responsable: 'Pedro Sánchez',
      notas: 'Revisar calidad'
    },
    { 
      id: 'ORD-006', 
      producto: 'Gorra MLB Dodgers', 
      cliente: 'Adidas',
      cantidad: 120, 
      area: 'Producción', 
      turno: 'Mañana', 
      tiempo: '00:00:47',
      estado: 'en_proceso',
      prioridad: 'media',
      progreso: 30,
      fechaInicio: '2026-02-26',
      fechaEntrega: '2026-03-02',
      responsable: 'Laura Martínez',
      notas: 'Lote prioritario'
    },
    { 
      id: 'ORD-007', 
      producto: 'Jersey NBA Bulls', 
      cliente: 'Puma',
      cantidad: 180, 
      area: 'Producción', 
      turno: 'Tarde', 
      tiempo: '00:00:47',
      estado: 'en_proceso',
      prioridad: 'alta',
      progreso: 60,
      fechaInicio: '2026-02-25',
      fechaEntrega: '2026-03-04',
      responsable: 'Carlos Ruiz',
      notas: 'Producción en línea'
    },
    { 
      id: 'ORD-008', 
      producto: 'Bufanda NFL', 
      cliente: 'Local',
      cantidad: 90, 
      area: 'Sublimado', 
      turno: 'Noche', 
      tiempo: '00:00:47',
      estado: 'pendiente',
      prioridad: 'baja',
      progreso: 0,
      fechaInicio: '2026-02-28',
      fechaEntrega: '2026-03-12',
      responsable: 'Ana López',
      notas: 'Material en camino'
    }
  ]);

  const [stats, setStats] = useState({
    total: 0,
    completadas: 0,
    pendientes: 0,
    enProceso: 0,
    criticas: 0,
    retrasadas: 0
  });

  // Calcular estadísticas
  useEffect(() => {
    setStats({
      total: ordenes.length,
      completadas: ordenes.filter(o => o.estado === 'completada').length,
      pendientes: ordenes.filter(o => o.estado === 'pendiente').length,
      enProceso: ordenes.filter(o => o.estado === 'en_proceso').length,
      criticas: ordenes.filter(o => o.prioridad === 'critica').length,
      retrasadas: ordenes.filter(o => {
        const hoy = new Date();
        const entrega = new Date(o.fechaEntrega);
        return entrega < hoy && o.estado !== 'completada';
      }).length
    });
  }, [ordenes]);

  // Filtrar órdenes
  const ordenesFiltradas = ordenes
    .filter(orden => {
      // Filtro por búsqueda
      if (busqueda && !orden.id.toLowerCase().includes(busqueda.toLowerCase()) && 
          !orden.producto.toLowerCase().includes(busqueda.toLowerCase()) &&
          !orden.cliente.toLowerCase().includes(busqueda.toLowerCase())) {
        return false;
      }
      
      // Filtro por estado
      if (filtroEstado !== 'todas' && orden.estado !== filtroEstado) return false;
      
      // Filtros avanzados
      if (filtrosAvanzados.area !== 'todas' && orden.area !== filtrosAvanzados.area) return false;
      if (filtrosAvanzados.turno !== 'todos' && orden.turno !== filtrosAvanzados.turno) return false;
      if (filtrosAvanzados.prioridad !== 'todas' && orden.prioridad !== filtrosAvanzados.prioridad) return false;
      
      return true;
    })
    .sort((a, b) => {
      // Ordenamiento
      let valorA = a[ordenamiento.campo];
      let valorB = b[ordenamiento.campo];
      
      if (ordenamiento.campo === 'fechaEntrega' || ordenamiento.campo === 'fechaInicio') {
        valorA = new Date(valorA);
        valorB = new Date(valorB);
      }
      
      if (ordenamiento.direccion === 'asc') {
        return valorA > valorB ? 1 : -1;
      } else {
        return valorA < valorB ? 1 : -1;
      }
    });

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'completada': return '#10b981';
      case 'en_proceso': return '#3b82f6';
      case 'pendiente': return '#f59e0b';
      case 'revision': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getPrioridadColor = (prioridad) => {
    switch(prioridad) {
      case 'critica': return '#ef4444';
      case 'alta': return '#f97316';
      case 'media': return '#f59e0b';
      case 'baja': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getEstadoTexto = (estado) => {
    switch(estado) {
      case 'completada': return 'Completada';
      case 'en_proceso': return 'En Proceso';
      case 'pendiente': return 'Pendiente';
      case 'revision': return 'Revisión';
      default: return estado;
    }
  };

  const handleOrdenClick = (orden) => {
    setOrdenSeleccionada(orden);
    setMostrarPanelDetalle(true);
  };

  const toggleFavorito = (id) => {
    if (favoritos.includes(id)) {
      setFavoritos(favoritos.filter(f => f !== id));
    } else {
      setFavoritos([...favoritos, id]);
    }
  };

  const itemsPorPagina = 8;
  const totalPaginas = Math.ceil(ordenesFiltradas.length / itemsPorPagina);
  const ordenesPaginadas = ordenesFiltradas.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  return (
    <div className="ordenes-container">
      {/* Panel de detalle */}
      {mostrarPanelDetalle && ordenSeleccionada && (
        <div className="detalle-overlay" onClick={() => setMostrarPanelDetalle(false)}>
          <div className="detalle-panel" onClick={e => e.stopPropagation()}>
            <button className="detalle-cerrar" onClick={() => setMostrarPanelDetalle(false)}>✕</button>
            <div className="detalle-header">
              <h2>{ordenSeleccionada.id}</h2>
              <span className={`estado-badge-detalle ${ordenSeleccionada.estado}`}>
                {getEstadoTexto(ordenSeleccionada.estado)}
              </span>
            </div>
            
            <div className="detalle-grid">
              <div className="detalle-seccion">
                <h4>Información General</h4>
                <div className="detalle-info">
                  <div className="info-row">
                    <span className="info-label">Producto:</span>
                    <span className="info-valor">{ordenSeleccionada.producto}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Cliente:</span>
                    <span className="info-valor">{ordenSeleccionada.cliente}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Cantidad:</span>
                    <span className="info-valor">{ordenSeleccionada.cantidad}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Responsable:</span>
                    <span className="info-valor">{ordenSeleccionada.responsable}</span>
                  </div>
                </div>
              </div>

              <div className="detalle-seccion">
                <h4>Fechas</h4>
                <div className="detalle-info">
                  <div className="info-row">
                    <span className="info-label">Inicio:</span>
                    <span className="info-valor">{ordenSeleccionada.fechaInicio}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Entrega:</span>
                    <span className="info-valor">{ordenSeleccionada.fechaEntrega}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Tiempo restante:</span>
                    <span className="info-valor">{ordenSeleccionada.tiempo}</span>
                  </div>
                </div>
              </div>

              <div className="detalle-seccion">
                <h4>Producción</h4>
                <div className="detalle-info">
                  <div className="info-row">
                    <span className="info-label">Área:</span>
                    <span className="info-valor">{ordenSeleccionada.area}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Turno:</span>
                    <span className="info-valor">{ordenSeleccionada.turno}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Prioridad:</span>
                    <span className="info-valor" style={{ color: getPrioridadColor(ordenSeleccionada.prioridad) }}>
                      {ordenSeleccionada.prioridad.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detalle-seccion">
                <h4>Progreso</h4>
                <div className="detalle-info">
                  <div className="progress-detalle">
                    <div className="progress-bar-detalle">
                      <div 
                        className="progress-fill-detalle" 
                        style={{ width: `${ordenSeleccionada.progreso}%` }}
                      ></div>
                    </div>
                    <span className="progress-text-detalle">{ordenSeleccionada.progreso}%</span>
                  </div>
                  <div className="info-row notas">
                    <span className="info-label">Notas:</span>
                    <span className="info-valor">{ordenSeleccionada.notas}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="detalle-acciones">
              <button className="btn-primary">Editar Orden</button>
              <button className="btn-secondary">Ver Historial</button>
              <button className="btn-secondary">Asignar Recursos</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="ordenes-header">
        <div className="header-left">
          <h1 className="header-titulo">
            Gestión de Órdenes
            <span className="header-badge">{stats.total} total</span>
          </h1>
          <div className="header-fecha">
            <span className="fecha-icon">📅</span>
            {new Date().toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }).replace(/^\w/, c => c.toUpperCase())}
          </div>
        </div>
        
        <div className="header-actions">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Buscar orden, producto o cliente..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="search-input"
            />
            {busqueda && (
              <button className="search-clear" onClick={() => setBusqueda('')}>✕</button>
            )}
          </div>

          <button 
            className={`action-btn ${mostrarFiltros ? 'active' : ''}`}
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            title="Filtros avanzados"
          >
            🔍
            <span className="action-badge">{stats.criticas}</span>
          </button>

          <button 
            className={`action-btn ${vista === 'tabla' ? 'active' : ''}`}
            onClick={() => setVista('tabla')}
            title="Vista tabla"
          >
            📋
          </button>
          
          <button 
            className={`action-btn ${vista === 'tablero' ? 'active' : ''}`}
            onClick={() => setVista('tablero')}
            title="Vista tablero"
          >
            📊
          </button>

          <button 
            className={`action-btn ${modoCompacto ? 'active' : ''}`}
            onClick={() => setModoCompacto(!modoCompacto)}
            title="Modo compacto"
          >
            📏
          </button>

          <div className="user-profile">
            <div className="user-avatar">JC</div>
            <div className="user-info">
              <span className="user-name">Josué Cardona</span>
              <span className="user-role">Administrador</span>
            </div>
          </div>
        </div>
      </div>

      {/* Panel de filtros avanzados */}
      {mostrarFiltros && (
        <div className="filtros-avanzados">
          <div className="filtros-grid">
            <div className="filtro-grupo">
              <label>Área</label>
              <select 
                value={filtrosAvanzados.area}
                onChange={(e) => setFiltrosAvanzados({...filtrosAvanzados, area: e.target.value})}
              >
                <option value="todas">Todas las áreas</option>
                <option value="Producción">Producción</option>
                <option value="Calidad">Calidad</option>
                <option value="Logística">Logística</option>
                <option value="Sublimado">Sublimado</option>
                <option value="Reposición">Reposición</option>
              </select>
            </div>

            <div className="filtro-grupo">
              <label>Turno</label>
              <select 
                value={filtrosAvanzados.turno}
                onChange={(e) => setFiltrosAvanzados({...filtrosAvanzados, turno: e.target.value})}
              >
                <option value="todos">Todos los turnos</option>
                <option value="Mañana">Mañana</option>
                <option value="Tarde">Tarde</option>
                <option value="Noche">Noche</option>
              </select>
            </div>

            <div className="filtro-grupo">
              <label>Prioridad</label>
              <select 
                value={filtrosAvanzados.prioridad}
                onChange={(e) => setFiltrosAvanzados({...filtrosAvanzados, prioridad: e.target.value})}
              >
                <option value="todas">Todas las prioridades</option>
                <option value="critica">Crítica</option>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>

            <div className="filtro-grupo">
              <label>Ordenar por</label>
              <select 
                value={`${ordenamiento.campo}-${ordenamiento.direccion}`}
                onChange={(e) => {
                  const [campo, direccion] = e.target.value.split('-');
                  setOrdenamiento({ campo, direccion });
                }}
              >
                <option value="fechaInicio-desc">Más recientes</option>
                <option value="fechaInicio-asc">Más antiguos</option>
                <option value="prioridad-desc">Mayor prioridad</option>
                <option value="progreso-asc">Menor progreso</option>
                <option value="id-asc">ID (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card completadas">
          <div className="kpi-icon">✅</div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.completadas}</span>
            <span className="kpi-label">Completadas</span>
          </div>
          <div className="kpi-trend positive">+12%</div>
        </div>

        <div className="kpi-card pendientes">
          <div className="kpi-icon">⏳</div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.pendientes}</span>
            <span className="kpi-label">Pendientes</span>
          </div>
          <div className="kpi-trend warning">-5%</div>
        </div>

        <div className="kpi-card proceso">
          <div className="kpi-icon">⚙️</div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.enProceso}</span>
            <span className="kpi-label">En Proceso</span>
          </div>
          <div className="kpi-trend positive">+8%</div>
        </div>

        <div className="kpi-card criticas">
          <div className="kpi-icon">🔴</div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.criticas}</span>
            <span className="kpi-label">Críticas</span>
          </div>
          <div className="kpi-trend negative">+3</div>
        </div>

        <div className="kpi-card retrasadas">
          <div className="kpi-icon">⚠️</div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.retrasadas}</span>
            <span className="kpi-label">Retrasadas</span>
          </div>
          <div className="kpi-trend negative">+2</div>
        </div>
      </div>

      {/* Filtros rápidos */}
      <div className="filtros-rapidos">
        <button 
          className={`filtro-btn ${filtroEstado === 'todas' ? 'active' : ''}`}
          onClick={() => setFiltroEstado('todas')}
        >
          Todas <span className="filtro-count">{stats.total}</span>
        </button>
        <button 
          className={`filtro-btn ${filtroEstado === 'en_proceso' ? 'active' : ''}`}
          onClick={() => setFiltroEstado('en_proceso')}
        >
          En Proceso <span className="filtro-count">{stats.enProceso}</span>
        </button>
        <button 
          className={`filtro-btn ${filtroEstado === 'pendiente' ? 'active' : ''}`}
          onClick={() => setFiltroEstado('pendiente')}
        >
          Pendiente <span className="filtro-count">{stats.pendientes}</span>
        </button>
        <button 
          className={`filtro-btn ${filtroEstado === 'completada' ? 'active' : ''}`}
          onClick={() => setFiltroEstado('completada')}
        >
          Completado <span className="filtro-count">{stats.completadas}</span>
        </button>
        <button 
          className={`filtro-btn ${filtroEstado === 'revision' ? 'active' : ''}`}
          onClick={() => setFiltroEstado('revision')}
        >
          Revisión <span className="filtro-count">2</span>
        </button>
      </div>

      {/* Vista de Tablero/Tarjetas */}
      {vista === 'tablero' && (
        <div className={`ordenes-tablero ${modoCompacto ? 'compacto' : ''}`}>
          {ordenesPaginadas.map(orden => (
            <div 
              key={orden.id} 
              className={`orden-card ${orden.estado} ${favoritos.includes(orden.id) ? 'favorita' : ''}`}
              onClick={() => handleOrdenClick(orden)}
            >
              <div className="card-header">
                <div className="card-titulo">
                  <span className="card-id">{orden.id}</span>
                  <button 
                    className="favorito-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorito(orden.id);
                    }}
                  >
                    {favoritos.includes(orden.id) ? '⭐' : '☆'}
                  </button>
                </div>
                <span className="card-producto">{orden.producto}</span>
                <span className="card-cliente">{orden.cliente}</span>
              </div>

              <div className="card-body">
                <div className="card-info-grid">
                  <div className="info-item">
                    <span className="info-label">Área</span>
                    <span className="info-valor">{orden.area}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Turno</span>
                    <span className="info-valor">{orden.turno}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Cantidad</span>
                    <span className="info-valor">{orden.cantidad}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Tiempo</span>
                    <span className="info-valor tiempo">{orden.tiempo}</span>
                  </div>
                </div>

                <div className="card-progreso">
                  <div className="progreso-header">
                    <span>Progreso</span>
                    <span className="progreso-porcentaje">{orden.progreso}%</span>
                  </div>
                  <div className="progreso-barra">
                    <div 
                      className="progreso-llenado" 
                      style={{ width: `${orden.progreso}%` }}
                    ></div>
                  </div>
                </div>

                <div className="card-badges">
                  <span className="prioridad-badge" style={{ backgroundColor: getPrioridadColor(orden.prioridad) }}>
                    {orden.prioridad}
                  </span>
                  <span className="estado-badge-mini" style={{ backgroundColor: getEstadoColor(orden.estado) }}>
                    {getEstadoTexto(orden.estado)}
                  </span>
                </div>
              </div>

              <div className="card-footer">
                <span className="responsable">👤 {orden.responsable}</span>
                <span className="fecha-entrega">📅 {orden.fechaEntrega}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vista de Tabla */}
      {vista === 'tabla' && (
        <div className="tabla-container">
          <table className="ordenes-tabla">
            <thead>
              <tr>
                <th>⭐</th>
                <th>ID</th>
                <th>Producto</th>
                <th>Cliente</th>
                <th>Área</th>
                <th>Turno</th>
                <th>Cantidad</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Progreso</th>
                <th>Responsable</th>
                <th>Entrega</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ordenesPaginadas.map(orden => (
                <tr key={orden.id} className={favoritos.includes(orden.id) ? 'fila-favorita' : ''}>
                  <td>
                    <button 
                      className="favorito-tabla-btn"
                      onClick={() => toggleFavorito(orden.id)}
                    >
                      {favoritos.includes(orden.id) ? '⭐' : '☆'}
                    </button>
                  </td>
                  <td className="orden-id">{orden.id}</td>
                  <td className="orden-producto">{orden.producto}</td>
                  <td>{orden.cliente}</td>
                  <td>{orden.area}</td>
                  <td>{orden.turno}</td>
                  <td className="orden-cantidad">{orden.cantidad}</td>
                  <td>
                    <span className="prioridad-badge" style={{ backgroundColor: getPrioridadColor(orden.prioridad) }}>
                      {orden.prioridad}
                    </span>
                  </td>
                  <td>
                    <span className="estado-badge-mini" style={{ backgroundColor: getEstadoColor(orden.estado) }}>
                      {getEstadoTexto(orden.estado)}
                    </span>
                  </td>
                  <td>
                    <div className="tabla-progreso">
                      <div className="tabla-progreso-barra">
                        <div className="tabla-progreso-llenado" style={{ width: `${orden.progreso}%` }}></div>
                      </div>
                      <span className="tabla-progreso-texto">{orden.progreso}%</span>
                    </div>
                  </td>
                  <td className="orden-responsable">{orden.responsable}</td>
                  <td className="orden-fecha">{orden.fechaEntrega}</td>
                  <td>
                    <div className="acciones-tabla">
                      <button className="accion-tabla-btn" title="Ver detalles" onClick={() => handleOrdenClick(orden)}>👁️</button>
                      <button className="accion-tabla-btn" title="Editar">✏️</button>
                      <button className="accion-tabla-btn" title="Asignar">👥</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="paginacion">
          <button 
            className="paginacion-btn"
            onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
            disabled={paginaActual === 1}
          >
            ← Anterior
          </button>
          
          {[...Array(totalPaginas)].map((_, i) => (
            <button
              key={i}
              className={`paginacion-btn ${paginaActual === i + 1 ? 'activo' : ''}`}
              onClick={() => setPaginaActual(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          
          <button 
            className="paginacion-btn"
            onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
            disabled={paginaActual === totalPaginas}
          >
            Siguiente →
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="ordenes-footer">
        <div className="footer-left">
          <span className="total-ordenes">
            Mostrando {ordenesPaginadas.length} de {ordenesFiltradas.length} órdenes
          </span>
          <span className="footer-separator">•</span>
          <span className="favoritos-total">⭐ {favoritos.length} favoritos</span>
        </div>
        
        <div className="footer-right">
          <button className="btn-exportar" title="Exportar a Excel">
            📥 Exportar
          </button>
          <button className="btn-exportar" title="Generar reporte">
            📊 Reporte
          </button>
          <select className="idioma-select">
            <option value="es">🇪🇸 ES</option>
            <option value="en">🇬🇧 EN</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Ordenes;