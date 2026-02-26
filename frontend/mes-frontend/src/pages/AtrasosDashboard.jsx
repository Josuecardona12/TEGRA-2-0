import React, { useState, useEffect } from 'react';

const AtrasosDashboard = () => {
  const [filtroArea, setFiltroArea] = useState('todas');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroDias, setFiltroDias] = useState('todos');
  const [elementosPorPagina, setElementosPorPagina] = useState(5);
  const [paginaActual, setPaginaActual] = useState(1);
  const [favoritos, setFavoritos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [tiempoActual, setTiempoActual] = useState(new Date());
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);

  // Datos de ejemplo
  const [atrasos] = useState([
    { id: 1, lote: 'LOTE-001', cliente: 'Nike', area: 'Corte', piezas: 1260, dias: 12, prioridad: 'Alta', estado: 'GRAVE', progreso: 35, responsable: 'Carlos Ruiz', fecha: '2024-02-14' },
    { id: 2, lote: 'LOTE-002', cliente: 'Adidas', area: 'Sublimado', piezas: 1099, dias: 8, prioridad: 'Media', estado: 'MEDIO', progreso: 45, responsable: 'María González', fecha: '2024-02-18' },
    { id: 3, lote: 'LOTE-003', cliente: 'Puma', area: 'Empaque', piezas: 804, dias: 5, prioridad: 'Media', estado: 'MEDIO', progreso: 60, responsable: 'Juan Pérez', fecha: '2024-02-19' },
    { id: 4, lote: 'LOTE-004', cliente: 'Nike', area: 'Estampado', piezas: 562, dias: 2, prioridad: 'Baja', estado: 'LEVE', progreso: 85, responsable: 'Ana López', fecha: '2024-02-24' },
    { id: 5, lote: 'LOTE-005', cliente: 'Adidas', area: 'Corte', piezas: 750, dias: 10, prioridad: 'Alta', estado: 'GRAVE', progreso: 20, responsable: 'Pedro Sánchez', fecha: '2024-02-16' },
    { id: 6, lote: 'LOTE-006', cliente: 'Local', area: 'Sublimado', piezas: 976, dias: 6, prioridad: 'Media', estado: 'MEDIO', progreso: 40, responsable: 'Laura Martínez', fecha: '2024-02-20' }
  ]);

  // Estadísticas
  const estadisticas = {
    graves: atrasos.filter(a => a.estado === 'GRAVE').length,
    medios: atrasos.filter(a => a.estado === 'MEDIO').length,
    leves: atrasos.filter(a => a.estado === 'LEVE').length,
    total: atrasos.length,
    piezas: atrasos.reduce((acc, a) => acc + a.piezas, 0),
    dias: atrasos.reduce((acc, a) => acc + a.dias, 0)
  };

  // Tiempo real
  useEffect(() => {
    const intervalo = setInterval(() => {
      setTiempoActual(new Date());
    }, 1000);
    return () => clearInterval(intervalo);
  }, []);

  // Filtrar datos
  const atrasosFiltrados = atrasos.filter(item => {
    if (filtroArea !== 'todas' && item.area !== filtroArea) return false;
    if (filtroEstado !== 'todos' && item.estado !== filtroEstado) return false;
    if (busqueda && !item.lote.toLowerCase().includes(busqueda.toLowerCase())) return false;
    return true;
  });

  // Paginación
  const totalPaginas = Math.ceil(atrasosFiltrados.length / elementosPorPagina);
  const inicio = (paginaActual - 1) * elementosPorPagina;
  const atrasosPaginados = atrasosFiltrados.slice(inicio, inicio + elementosPorPagina);

  const toggleFavorito = (id) => {
    if (favoritos.includes(id)) {
      setFavoritos(favoritos.filter(f => f !== id));
    } else {
      setFavoritos([...favoritos, id]);
    }
  };

  // ESTILOS INLINE - TODO AQUÍ
  const styles = {
    container: {
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      overflow: 'hidden'
    },
    header: {
      backgroundColor: 'white',
      borderBottom: '2px solid #e2e8f0',
      padding: '20px 30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexShrink: 0,
      boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px'
    },
    headerIcon: {
      width: '55px',
      height: '55px',
      background: '#2563eb',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '28px',
      fontWeight: 'bold',
      boxShadow: '0 8px 16px -4px #2563eb50'
    },
    headerTitle: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#0f172a',
      margin: 0
    },
    headerBadge: {
      fontSize: '0.8rem',
      background: '#f1f5f9',
      color: '#64748b',
      padding: '4px 12px',
      borderRadius: '30px',
      marginLeft: '12px',
      fontWeight: 'normal'
    },
    headerFecha: {
      fontSize: '0.9rem',
      color: '#64748b',
      marginTop: '4px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    headerActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px'
    },
    searchBox: {
      display: 'flex',
      alignItems: 'center',
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '40px',
      padding: '0 20px',
      width: '300px'
    },
    searchIcon: {
      color: '#94a3b8',
      marginRight: '10px'
    },
    searchInput: {
      background: 'transparent',
      border: 'none',
      padding: '12px 0',
      width: '100%',
      fontSize: '0.95rem',
      outline: 'none'
    },
    headerBtn: {
      width: '45px',
      height: '45px',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      background: '#f8fafc',
      cursor: 'pointer',
      fontSize: '1.3rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    },
    notificacionBadge: {
      position: 'absolute',
      top: '-5px',
      right: '-5px',
      background: '#ef4444',
      color: 'white',
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      fontSize: '11px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '2px solid white'
    },
    headerTiempoReal: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      background: '#f8fafc',
      padding: '8px 20px',
      borderRadius: '40px',
      border: '1px solid #e2e8f0'
    },
    puntoTiempoReal: {
      width: '10px',
      height: '10px',
      background: '#ef4444',
      borderRadius: '50%',
      animation: 'pulse 1.5s infinite'
    },
    tiempoRealTexto: {
      fontSize: '0.8rem',
      fontWeight: '700',
      color: '#ef4444'
    },
    relojDigital: {
      fontFamily: 'monospace',
      fontSize: '1.1rem',
      fontWeight: '600',
      background: 'white',
      padding: '5px 12px',
      borderRadius: '30px',
      border: '1px solid #e2e8f0'
    },
    kpiGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: '20px',
      padding: '25px 30px',
      background: '#f8fafc',
      borderBottom: '2px solid #e2e8f0'
    },
    kpiCard: (color) => ({
      background: 'white',
      border: '1px solid #e2e8f0',
      borderLeft: `5px solid ${color}`,
      borderRadius: '20px',
      padding: '20px'
    }),
    kpiHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px'
    },
    kpiIcon: {
      fontSize: '1.8rem',
      background: '#f8fafc',
      width: '45px',
      height: '45px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    kpiTendencia: {
      fontSize: '0.8rem',
      background: '#f1f5f9',
      padding: '5px 12px',
      borderRadius: '30px',
      color: '#64748b',
      fontWeight: '600'
    },
    kpiNumero: {
      fontSize: '3rem',
      fontWeight: '700',
      color: '#0f172a',
      lineHeight: '1',
      marginBottom: '8px',
      fontFamily: 'monospace'
    },
    kpiLabel: {
      fontSize: '0.85rem',
      color: '#64748b',
      textTransform: 'uppercase',
      fontWeight: '600',
      marginBottom: '15px'
    },
    kpiFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '0.8rem',
      borderTop: '1px solid #e2e8f0',
      paddingTop: '12px'
    },
    kpiTrend: (color) => ({
      color: color,
      background: color === '#22c55e' ? '#f0fdf4' : '#fee2e2',
      padding: '4px 10px',
      borderRadius: '20px',
      fontWeight: '600'
    }),
    kpiPeriodo: {
      color: '#94a3b8'
    },
    filtrosContainer: {
      padding: '20px 30px',
      background: 'white',
      borderBottom: '2px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '20px'
    },
    filtrosIzquierda: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap'
    },
    filtroSelect: {
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      color: '#0f172a',
      padding: '12px 40px 12px 16px',
      borderRadius: '40px',
      fontSize: '0.9rem',
      fontWeight: '500',
      cursor: 'pointer',
      appearance: 'none',
      backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 16px center',
      minWidth: '170px'
    },
    filtrosDerecha: {
      display: 'flex',
      gap: '12px'
    },
    btnExportar: {
      padding: '12px 28px',
      borderRadius: '40px',
      border: '1px solid #e2e8f0',
      background: '#f8fafc',
      color: '#334155',
      fontSize: '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    btnBuscar: {
      padding: '12px 32px',
      borderRadius: '40px',
      border: 'none',
      background: '#2563eb',
      color: 'white',
      fontSize: '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      boxShadow: '0 8px 16px -4px #2563eb70'
    },
    tablaContainer: {
      flex: '1',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      padding: '0 30px 20px'
    },
    tablaToolbar: {
      padding: '15px 0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '2px solid #e2e8f0'
    },
    tablaInfo: {
      fontSize: '0.95rem',
      color: '#334155',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '15px'
    },
    favoritosBadge: {
      background: '#fef3c7',
      color: '#b45309',
      padding: '5px 15px',
      borderRadius: '30px',
      fontSize: '0.8rem',
      fontWeight: '600'
    },
    tablaAcciones: {
      display: 'flex',
      gap: '12px'
    },
    tablaAccionBtn: {
      padding: '8px 20px',
      borderRadius: '30px',
      border: '1px solid #e2e8f0',
      background: 'white',
      color: '#334155',
      fontSize: '0.85rem',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    tablaWrapper: {
      flex: '1',
      overflow: 'auto',
      marginTop: '20px',
      border: '1px solid #e2e8f0',
      borderRadius: '16px',
      background: 'white'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      minWidth: '1200px'
    },
    th: {
      background: '#f8fafc',
      color: '#64748b',
      fontWeight: '600',
      fontSize: '0.8rem',
      textTransform: 'uppercase',
      padding: '18px 20px',
      textAlign: 'left',
      borderBottom: '2px solid #e2e8f0'
    },
    td: {
      padding: '16px 20px',
      color: '#334155',
      fontSize: '0.9rem',
      borderBottom: '1px solid #e2e8f0'
    },
    favoritoBtn: {
      background: 'transparent',
      border: 'none',
      fontSize: '1.3rem',
      cursor: 'pointer',
      padding: '5px'
    },
    diasBadge: (dias) => ({
      padding: '6px 14px',
      borderRadius: '30px',
      fontSize: '0.8rem',
      fontWeight: '600',
      display: 'inline-block',
      background: dias > 10 ? '#fee2e2' : dias > 5 ? '#fff7ed' : '#f0fdf4',
      color: dias > 10 ? '#b91c1c' : dias > 5 ? '#9a3412' : '#166534'
    }),
    prioridadIndicator: {
      fontSize: '1.3rem'
    },
    estadoBadge: (estado) => ({
      padding: '6px 16px',
      borderRadius: '30px',
      fontWeight: '600',
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      display: 'inline-block',
      background: estado === 'GRAVE' ? '#fee2e2' : estado === 'MEDIO' ? '#fff7ed' : '#f0fdf4',
      color: estado === 'GRAVE' ? '#b91c1c' : estado === 'MEDIO' ? '#9a3412' : '#166534',
      border: `1px solid ${
        estado === 'GRAVE' ? '#fecaca' : estado === 'MEDIO' ? '#fed7aa' : '#bbf7d0'
      }`
    }),
    progresoContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      minWidth: '130px'
    },
    progresoBarra: {
      flex: '1',
      height: '8px',
      background: '#e2e8f0',
      borderRadius: '10px',
      overflow: 'hidden'
    },
    progresoLlenado: (progreso) => ({
      height: '100%',
      width: `${progreso}%`,
      background: progreso < 30 ? '#ef4444' : progreso < 70 ? '#f59e0b' : '#22c55e',
      borderRadius: '10px'
    }),
    progresoTexto: {
      fontSize: '0.8rem',
      fontWeight: '600',
      color: '#334155',
      minWidth: '40px',
      fontFamily: 'monospace'
    },
    responsable: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontWeight: '500'
    },
    accionesContainer: {
      display: 'flex',
      gap: '6px'
    },
    accionBtn: {
      width: '34px',
      height: '34px',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      background: 'white',
      color: '#64748b',
      cursor: 'pointer',
      fontSize: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    paginacion: {
      padding: '20px 0 10px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '8px'
    },
    paginacionBtn: (activo) => ({
      padding: '8px 16px',
      borderRadius: '30px',
      border: activo ? 'none' : '1px solid #e2e8f0',
      background: activo ? '#2563eb' : 'white',
      color: activo ? 'white' : '#334155',
      fontSize: '0.85rem',
      fontWeight: '500',
      cursor: 'pointer',
      minWidth: '42px',
      boxShadow: activo ? '0 4px 10px -2px #2563eb70' : 'none'
    }),
    footer: {
      background: 'white',
      borderTop: '2px solid #e2e8f0',
      padding: '18px 30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexShrink: 0,
      fontSize: '0.9rem',
      color: '#64748b'
    },
    footerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '30px'
    },
    infoActualizacion: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    puntoEstado: {
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      background: '#22c55e',
      animation: 'pulse 2s infinite'
    },
    statsRapidas: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px'
    },
    statRapida: {
      color: '#64748b',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    footerRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '25px'
    },
    totalRegistros: {
      fontWeight: '600',
      color: '#2563eb',
      background: '#dbeafe',
      padding: '6px 16px',
      borderRadius: '30px',
      fontSize: '0.85rem'
    },
    versionInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      background: '#f8fafc',
      padding: '8px 20px',
      borderRadius: '30px',
      border: '1px solid #e2e8f0',
      fontWeight: '500'
    },
    buildInfo: {
      color: '#94a3b8',
      fontSize: '0.75rem'
    }
  };

  return (
    <div style={styles.container}>
      {/* Estilos de animación */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.2); }
          }
        `}
      </style>

      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}>📊</div>
          <div>
            <h1 style={styles.headerTitle}>
              Control de Atrasos
              <span style={styles.headerBadge}>{atrasos.length} total</span>
            </h1>
            <div style={styles.headerFecha}>
              <span>📅</span>
              {tiempoActual.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>

        <div style={styles.headerActions}>
          <div style={styles.searchBox}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Buscar lote..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <button style={styles.headerBtn} onClick={() => setMostrarNotificaciones(!mostrarNotificaciones)}>
            🔔
          </button>

          <div style={styles.headerTiempoReal}>
            <span style={styles.puntoTiempoReal}></span>
            <span style={styles.tiempoRealTexto}>EN VIVO</span>
            <span style={styles.relojDigital}>
              {tiempoActual.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </header>

      {/* KPI CARDS */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard('#ef4444')}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiIcon}>⚠️</span>
            <span style={styles.kpiTendencia}>+12%</span>
          </div>
          <div style={styles.kpiNumero}>{estadisticas.graves}</div>
          <div style={styles.kpiLabel}>ATRASOS GRAVES</div>
          <div style={styles.kpiFooter}>
            <span style={styles.kpiTrend('#22c55e')}>+2 vs ayer</span>
            <span style={styles.kpiPeriodo}>Alta prioridad</span>
          </div>
        </div>

        <div style={styles.kpiCard('#f59e0b')}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiIcon}>⚡</span>
            <span style={styles.kpiTendencia}>+5%</span>
          </div>
          <div style={styles.kpiNumero}>{estadisticas.medios}</div>
          <div style={styles.kpiLabel}>ATRASOS MEDIOS</div>
          <div style={styles.kpiFooter}>
            <span style={styles.kpiTrend('#22c55e')}>+1 esta semana</span>
            <span style={styles.kpiPeriodo}>Atención media</span>
          </div>
        </div>

        <div style={styles.kpiCard('#22c55e')}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiIcon}>✅</span>
            <span style={styles.kpiTendencia}>-8%</span>
          </div>
          <div style={styles.kpiNumero}>{estadisticas.leves}</div>
          <div style={styles.kpiLabel}>ATRASOS LEVES</div>
          <div style={styles.kpiFooter}>
            <span style={styles.kpiTrend('#22c55e')}>-3 resueltos</span>
            <span style={styles.kpiPeriodo}>Bajo control</span>
          </div>
        </div>

        <div style={styles.kpiCard('#2563eb')}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiIcon}>📊</span>
            <span style={styles.kpiTendencia}>Total</span>
          </div>
          <div style={styles.kpiNumero}>{estadisticas.total}</div>
          <div style={styles.kpiLabel}>TOTAL ATRASOS</div>
          <div style={styles.kpiFooter}>
            <span style={styles.kpiTrend('#22c55e')}>{estadisticas.dias} días acum.</span>
            <span style={styles.kpiPeriodo}>+2 vs ayer</span>
          </div>
        </div>

        <div style={styles.kpiCard('#8b5cf6')}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiIcon}>📦</span>
            <span style={styles.kpiTendencia}>Alto</span>
          </div>
          <div style={styles.kpiNumero}>{estadisticas.piezas.toLocaleString()}</div>
          <div style={styles.kpiLabel}>PIEZAS ATRASADAS</div>
          <div style={styles.kpiFooter}>
            <span style={styles.kpiTrend('#ef4444')}>Alto impacto</span>
            <span style={styles.kpiPeriodo}>Producción detenida</span>
          </div>
        </div>
      </div>

      {/* FILTROS */}
      <div style={styles.filtrosContainer}>
        <div style={styles.filtrosIzquierda}>
          <select style={styles.filtroSelect} value={filtroArea} onChange={(e) => setFiltroArea(e.target.value)}>
            <option value="todas">🌐 Todas las áreas</option>
            <option value="Corte">✂️ Corte</option>
            <option value="Sublimado">🎨 Sublimado</option>
            <option value="Empaque">📦 Empaque</option>
          </select>

          <select style={styles.filtroSelect} value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="todos">⚪ Todos los estados</option>
            <option value="GRAVE">🔴 Graves</option>
            <option value="MEDIO">🟡 Medios</option>
            <option value="LEVE">🟢 Leves</option>
          </select>

          <select style={styles.filtroSelect} value={filtroDias} onChange={(e) => setFiltroDias(e.target.value)}>
            <option value="todos">📅 Todos los días</option>
            <option value="critico">⚠️ Crítico (+10 días)</option>
            <option value="moderado">⚡ Moderado (5-10 días)</option>
          </select>

          <select style={styles.filtroSelect} value={elementosPorPagina} onChange={(e) => setElementosPorPagina(Number(e.target.value))}>
            <option value="5">5 por página</option>
            <option value="10">10 por página</option>
            <option value="20">20 por página</option>
          </select>
        </div>

        <div style={styles.filtrosDerecha}>
          <button style={styles.btnExportar} onClick={() => alert('Exportando...')}>
            📥 Exportar
          </button>
          <button style={styles.btnBuscar}>
            🔍 Aplicar Filtros
          </button>
        </div>
      </div>

      {/* TABLA */}
      <div style={styles.tablaContainer}>
        <div style={styles.tablaToolbar}>
          <div style={styles.tablaInfo}>
            Mostrando {atrasosPaginados.length} de {atrasosFiltrados.length} registros
            {favoritos.length > 0 && (
              <span style={styles.favoritosBadge}>⭐ {favoritos.length} favoritos</span>
            )}
          </div>
          <div style={styles.tablaAcciones}>
            <button style={styles.tablaAccionBtn} onClick={() => window.location.reload()}>
              🔄 Actualizar
            </button>
            <button style={styles.tablaAccionBtn} onClick={() => setFavoritos([])}>
              🧹 Limpiar favoritos
            </button>
          </div>
        </div>

        <div style={styles.tablaWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>⭐</th>
                <th style={styles.th}>LOTE</th>
                <th style={styles.th}>CLIENTE</th>
                <th style={styles.th}>ÁREA</th>
                <th style={styles.th}>PIEZAS</th>
                <th style={styles.th}>DÍAS</th>
                <th style={styles.th}>PRIORIDAD</th>
                <th style={styles.th}>ESTADO</th>
                <th style={styles.th}>PROGRESO</th>
                <th style={styles.th}>RESPONSABLE</th>
                <th style={styles.th}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {atrasosPaginados.map(item => (
                <tr key={item.id}>
                  <td style={styles.td}>
                    <button style={styles.favoritoBtn} onClick={() => toggleFavorito(item.id)}>
                      {favoritos.includes(item.id) ? '⭐' : '☆'}
                    </button>
                  </td>
                  <td style={styles.td}><strong>{item.lote}</strong></td>
                  <td style={styles.td}>{item.cliente}</td>
                  <td style={styles.td}>{item.area}</td>
                  <td style={{...styles.td, fontFamily: 'monospace', fontWeight: '600'}}>{item.piezas.toLocaleString()}</td>
                  <td style={styles.td}>
                    <span style={styles.diasBadge(item.dias)}>{item.dias}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.prioridadIndicator}>
                      {item.prioridad === 'Alta' ? '🔴' : item.prioridad === 'Media' ? '🟡' : '🟢'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.estadoBadge(item.estado)}>{item.estado}</span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.progresoContainer}>
                      <div style={styles.progresoBarra}>
                        <div style={styles.progresoLlenado(item.progreso)}></div>
                      </div>
                      <span style={styles.progresoTexto}>{item.progreso}%</span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.responsable}>{item.responsable}</span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.accionesContainer}>
                      <button style={styles.accionBtn}>👁️</button>
                      <button style={styles.accionBtn}>✏️</button>
                      <button style={styles.accionBtn}>💬</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN */}
        {totalPaginas > 1 && (
          <div style={styles.paginacion}>
            <button 
              style={styles.paginacionBtn(false)}
              onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
              disabled={paginaActual === 1}
            >
              ←
            </button>
            
            {[...Array(totalPaginas)].map((_, i) => (
              <button
                key={i}
                style={styles.paginacionBtn(paginaActual === i + 1)}
                onClick={() => setPaginaActual(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            
            <button 
              style={styles.paginacionBtn(false)}
              onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
              disabled={paginaActual === totalPaginas}
            >
              →
            </button>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div style={styles.footerLeft}>
          <div style={styles.infoActualizacion}>
            <span style={styles.puntoEstado}></span>
            <span>Actualización en tiempo real • cada 5 segundos</span>
          </div>
          <div style={styles.statsRapidas}>
            <span style={styles.statRapida}>📊 {atrasosFiltrados.length} filtrados</span>
            <span style={styles.statRapida}>⭐ {favoritos.length} favoritos</span>
            <span style={styles.statRapida}>📅 {tiempoActual.toLocaleDateString()}</span>
          </div>
        </div>
        <div style={styles.footerRight}>
          <span style={styles.totalRegistros}>Página {paginaActual} de {totalPaginas}</span>
          <span style={styles.versionInfo}>
            TEGRA v2.5.0
            <span style={styles.buildInfo}>Build 2024.02.26</span>
          </span>
        </div>
      </footer>
    </div>
  );
};

export default AtrasosDashboard;