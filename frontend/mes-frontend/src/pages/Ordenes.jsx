// src/pages/Ordenes.jsx (VERSIÓN FINAL CON PORCENTAJES CORREGIDOS)
import React, { useState, useEffect, useRef } from 'react';
import './Ordenes.css';
import { useProduccion } from '../context/ProduccionContext';

// ============================================
// CONFIGURACIÓN WEBSOCKET PARA TIEMPO REAL
// ============================================
const WS_URL = 'https://miniature-adventure-v6q4r64gqq7qfr67-8080.app.github.dev/';

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
  const [tiempoReal, setTiempoReal] = useState(new Date());

  // ================ ESTADOS DE CONEXIÓN PARA TIEMPO REAL ================
  const [conectado, setConectado] = useState(false);
  const [usandoServidor, setUsandoServidor] = useState(false);
  const [ultimoMovimiento, setUltimoMovimiento] = useState(null);
  const wsRef = useRef(null);
  const inputRef = useRef(null);
  const mainContentRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // ================ CONEXIÓN WEBSOCKET PARA TIEMPO REAL ================
  useEffect(() => {
    console.log('🔌 Ordenes conectando...');
    
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    
    ws.onopen = () => {
      console.log('✅ Ordenes conectado');
      setConectado(true);
      setUsandoServidor(true);
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📦 Ordenes recibió:', data.type);
        
        if (data.type === 'INIT' || data.type === 'ACTUALIZACION') {
          const lotesData = data.data.lotes || [];
          
          if (data.data.ultimoMovimiento) {
            setUltimoMovimiento(data.data.ultimoMovimiento);
          }
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('❌ Error WebSocket:', error);
      setConectado(false);
      setUsandoServidor(false);
    };
    
    ws.onclose = () => {
      console.log('❌ Ordenes desconectado');
      setConectado(false);
      setUsandoServidor(false);
    };
    
    return () => ws.close();
  }, []);

  // ================ DATOS CON PORCENTAJES CORREGIDOS SEGÚN LA IMAGEN ================
  const [ordenes, setOrdenes] = useState([
    { 
      id: 'ORD-001', 
      producto: 'Camiseta MLB Yankees', 
      cliente: 'Nike',
      cantidad: 150, 
      area: 'Producción', 
      turno: 'Mañana', 
      tiempo: '08:00:47',
      estado: 'en_proceso',
      prioridad: 'alta',
      progreso: 75, // 75% según la imagen
      fechaInicio: '2026-03-11',
      fechaEntrega: '2026-03-18',
      responsable: 'Carlos Ruiz',
      notas: 'Urgente - Cliente premium',
      balanza: 100
    },
    { 
      id: 'ORD-002', 
      producto: 'Gorra NBA Lakers', 
      cliente: 'Adidas',
      cantidad: 75, 
      area: 'Calidad', 
      turno: 'Mañana', 
      tiempo: '08:00:47',
      estado: 'completada',
      prioridad: 'media',
      progreso: 100, // 100% según la imagen
      fechaInicio: '2026-03-10',
      fechaEntrega: '2026-03-11',
      responsable: 'María González',
      notas: 'Inspección final',
      balanza: 100
    },
    { 
      id: 'ORD-003', 
      producto: 'Uniforme NFL Patriots', 
      cliente: 'Run',
      cantidad: 200, 
      area: 'Logística', 
      turno: 'Mañana', 
      tiempo: '08:00:47',
      estado: 'en_proceso',
      prioridad: 'baja',
      progreso: 90, // 90% según la imagen
      fechaInicio: '2026-03-11',
      fechaEntrega: '2026-03-22',
      responsable: 'Juan Pérez',
      notas: 'Esperando materiales',
      balanza: 100
    },
    { 
      id: 'ORD-004', 
      producto: 'Sudadera NHL Bruins', 
      cliente: 'Local',
      cantidad: 300, 
      area: 'Sublimado', 
      turno: 'Mañana', 
      tiempo: '08:00:47',
      estado: 'en_proceso',
      prioridad: 'alta',
      progreso: 45, // 45% según la imagen
      fechaInicio: '2026-03-11',
      fechaEntrega: '2026-03-16',
      responsable: 'Ana López',
      notas: 'Diseño personalizado',
      balanza: 100
    },
    { 
      id: 'ORD-005', 
      producto: 'Camiseta FIFA World Cup', 
      cliente: 'Nike',
      cantidad: 300, 
      area: 'Sublimado', 
      turno: 'Mañana', 
      tiempo: '08:00:47',
      estado: 'en_proceso',
      prioridad: 'alta',
      progreso: 60, // 60% según la imagen
      fechaInicio: '2026-03-09',
      fechaEntrega: '2026-03-13',
      responsable: 'Pedro Sánchez',
      notas: 'Revisar calidad',
      balanza: 100
    },
    { 
      id: 'ORD-006', 
      producto: 'Gorra MLB Dodgers', 
      cliente: 'Adidas',
      cantidad: 120, 
      area: 'Producción', 
      turno: 'Mañana', 
      tiempo: '08:00:47',
      estado: 'en_proceso',
      prioridad: 'media',
      progreso: 30, // 30% según la imagen
      fechaInicio: '2026-03-11',
      fechaEntrega: '2026-03-15',
      responsable: 'Laura Martínez',
      notas: 'Lote prioritario',
      balanza: 100
    },
    { 
      id: 'ORD-007', 
      producto: 'Jersey NBA Bulls', 
      cliente: 'Puma',
      cantidad: 180, 
      area: 'Producción', 
      turno: 'Tarde', 
      tiempo: '08:00:47',
      estado: 'en_proceso',
      prioridad: 'alta',
      progreso: 60, // 60% según la imagen
      fechaInicio: '2026-03-10',
      fechaEntrega: '2026-03-17',
      responsable: 'Carlos Ruiz',
      notas: 'Producción en línea',
      balanza: 100
    },
    { 
      id: 'ORD-008', 
      producto: 'Bufanda NFL', 
      cliente: 'Local',
      cantidad: 0, 
      area: 'Sublimado', 
      turno: 'Noche', 
      tiempo: '08:00:47',
      estado: 'pendiente',
      prioridad: 'baja',
      progreso: 0, // 0% según la imagen
      fechaInicio: '2026-03-12',
      fechaEntrega: '2026-03-24',
      responsable: 'Ana López',
      notas: 'Material en camino',
      balanza: 0
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

  // Detectar scroll
  useEffect(() => {
    const handleScroll = () => {
      if (mainContentRef.current) {
        setShowScrollTop(mainContentRef.current.scrollTop > 400);
      }
    };
    const currentRef = mainContentRef.current;
    if (currentRef) currentRef.addEventListener('scroll', handleScroll);
    return () => { if (currentRef) currentRef.removeEventListener('scroll', handleScroll); };
  }, []);

  const scrollToTop = () => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Actualizar tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setTiempoReal(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filtrar órdenes
  const ordenesFiltradas = ordenes
    .filter(orden => {
      if (busqueda && !orden.id.toLowerCase().includes(busqueda.toLowerCase()) && 
          !orden.producto.toLowerCase().includes(busqueda.toLowerCase()) &&
          !orden.cliente.toLowerCase().includes(busqueda.toLowerCase())) {
        return false;
      }
      
      if (filtroEstado !== 'todas' && orden.estado !== filtroEstado) return false;
      
      if (filtrosAvanzados.area !== 'todas' && orden.area !== filtrosAvanzados.area) return false;
      if (filtrosAvanzados.turno !== 'todos' && orden.turno !== filtrosAvanzados.turno) return false;
      if (filtrosAvanzados.prioridad !== 'todas' && orden.prioridad !== filtrosAvanzados.prioridad) return false;
      
      return true;
    })
    .sort((a, b) => {
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
    <div className="ordenes-container" ref={mainContentRef}>
      
      {/* Indicador de conexión */}
      <div className={`connection-status ${conectado ? 'connected' : 'disconnected'}`}>
        <span className="status-dot"></span>
        <span>{conectado ? '🟢 Servidor Conectado' : '🟡 Modo Demo Local'}</span>
      </div>

      {/* NOTIFICACIÓN DE ÚLTIMO MOVIMIENTO */}
      {ultimoMovimiento && (
        <div className="movimiento-notificacion">
          🔄 {ultimoMovimiento.loteId} → {ultimoMovimiento.area}
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
            {tiempoReal.toLocaleDateString('es-ES', {
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
              ref={inputRef}
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
        <div className="kpi-card completadas" onClick={() => setFiltroEstado('completada')}>
          <div className="kpi-icon">✅</div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.completadas}</span>
            <span className="kpi-label">Completadas</span>
          </div>
          <div className="kpi-trend positive">+12%</div>
        </div>

        <div className="kpi-card pendientes" onClick={() => setFiltroEstado('pendiente')}>
          <div className="kpi-icon">⏳</div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.pendientes}</span>
            <span className="kpi-label">Pendientes</span>
          </div>
          <div className="kpi-trend warning">-5%</div>
        </div>

        <div className="kpi-card proceso" onClick={() => setFiltroEstado('en_proceso')}>
          <div className="kpi-icon">⚙️</div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.enProceso}</span>
            <span className="kpi-label">En Proceso</span>
          </div>
          <div className="kpi-trend positive">+8%</div>
        </div>

        <div className="kpi-card criticas" onClick={() => setFiltrosAvanzados({...filtrosAvanzados, prioridad: 'critica'})}>
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
              {/* HEADER con ID y Favorito */}
              <div className="card-header">
                <span className="card-id">{orden.id}</span>
                <button 
                  className="favorito-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorito(orden.id);
                  }}
                >
                  {favoritos.includes(orden.id) ? '★' : '☆'}
                </button>
              </div>

              {/* Producto y Cliente */}
              <div className="card-producto">{orden.producto}</div>
              <div className="card-cliente">{orden.cliente}</div>

              {/* Área y Turno */}
              <div className="card-area-turno">
                <div className="area-info">
                  <span className="area-label">ÁREA</span>
                  <span className="area-valor">{orden.area}</span>
                </div>
                <div className="turno-info">
                  <span className="turno-label">TURNO</span>
                  <span className="turno-valor">{orden.turno}</span>
                </div>
              </div>

              {/* Cantidad */}
              <div className="card-cantidad">
                <span className="cantidad-label">CANTIDAD</span>
                <span className="cantidad-valor">{orden.cantidad}</span>
              </div>

              {/* Progreso y Tiempo */}
              <div className="card-progreso-tiempo">
                <div className="progreso-container">
                  <div className="progreso-barra">
                    <div 
                      className="progreso-llenado" 
                      style={{ width: `${orden.progreso}%` }}
                    ></div>
                  </div>
                  <span className="progreso-porcentaje">{orden.progreso}%</span>
                </div>
                <span className="tiempo-restante">{orden.tiempo}</span>
              </div>

              {/* Badges de Prioridad y Estado */}
              <div className="card-badges">
                <span className="prioridad-badge" style={{ backgroundColor: getPrioridadColor(orden.prioridad) }}>
                  {orden.prioridad.toUpperCase()}
                </span>
                <span className="estado-badge-mini" style={{ backgroundColor: getEstadoColor(orden.estado) }}>
                  {getEstadoTexto(orden.estado)}
                </span>
              </div>

              {/* Balanza */}
              <div className="card-balanza">
                <span className="balanza-label">BALANZA</span>
                <span className="balanza-valor">{orden.balanza}%</span>
              </div>

              {/* Footer con Responsable */}
              <div className="card-footer">
                <span className="responsable">{orden.responsable}</span>
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
                <th>Balanza</th>
                <th>Responsable</th>
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
                      {favoritos.includes(orden.id) ? '★' : '☆'}
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
                  <td>{orden.balanza}%</td>
                  <td className="orden-responsable">{orden.responsable}</td>
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
        </div>
      </div>

      {/* Botón volver arriba */}
      <button 
        className={`scroll-to-top ${showScrollTop ? 'visible' : ''}`} 
        onClick={scrollToTop}
        title="Volver arriba"
      >
        ↑
      </button>

      {/* Estilos para el indicador de conexión */}
      <style>{`
        .connection-status {
          position: fixed;
          top: 10px;
          right: 10px;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 30px;
          font-size: 13px;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          backdrop-filter: blur(10px);
        }
        
        .connection-status.connected {
          background: #10b981;
          color: white;
        }
        
        .connection-status.disconnected {
          background: #f59e0b;
          color: white;
        }
        
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 0 10px white;
          animation: pulse 2s infinite;
        }

        .movimiento-notificacion {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: #3b82f6;
          color: white;
          padding: 12px 20px;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          z-index: 10000;
          animation: slideUp 0.3s ease;
          font-weight: 500;
        }

        .scroll-to-top {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          transition: all 0.3s ease;
          z-index: 1000;
          opacity: 0;
          visibility: hidden;
          transform: translateY(20px);
        }

        .scroll-to-top.visible {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .scroll-to-top:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};

export default Ordenes;