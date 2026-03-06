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

  return (
    <>
      <style>{`
        /* ===== RESET COMPLETO ===== */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #f8fafc;
          color: #0f172a;
          overflow: hidden;
        }

        /* ===== DASHBOARD PRINCIPAL ===== */
        .atrasos-dashboard {
          height: 100vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: white;
        }

        /* ===== HEADER ===== */
        .dashboard-header {
          background: white;
          border-bottom: 2px solid #e2e8f0;
          padding: 15px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.1);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .header-icon {
          width: 45px;
          height: 45px;
          background: #ef4444;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          font-weight: bold;
          box-shadow: 0 4px 8px -4px #ef4444;
        }

        .header-titulo {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          line-height: 1.2;
        }

        .header-badge {
          font-size: 0.75rem;
          background: #fee2e2;
          color: #ef4444;
          padding: 4px 10px;
          border-radius: 30px;
          margin-left: 8px;
          font-weight: 600;
        }

        .header-fecha {
          font-size: 0.8rem;
          color: #64748b;
          margin-top: 2px;
          display: flex;
          align-items: center;
          gap: 6px;
          text-transform: capitalize;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        /* Search */
        .search-box {
          display: flex;
          align-items: center;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 40px;
          padding: 0 15px;
          width: 250px;
          transition: all 0.2s;
        }

        .search-box:focus-within {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
        }

        .search-icon {
          color: #ef4444;
          font-size: 0.9rem;
          margin-right: 8px;
        }

        .search-input {
          background: transparent;
          border: none;
          padding: 10px 0;
          width: 100%;
          font-size: 0.9rem;
          color: inherit;
        }

        .search-input:focus {
          outline: none;
        }

        .search-input::placeholder {
          color: #94a3b8;
        }

        /* Header Buttons */
        .header-btn {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          cursor: pointer;
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: all 0.2s;
        }

        .header-btn:hover {
          background: #ef4444;
          color: white;
          border-color: #ef4444;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px #ef4444;
        }

        .notificacion-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ef4444;
          color: white;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          font-size: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          border: 2px solid white;
        }

        /* Tiempo Real */
        .header-tiempo-real {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fef2f2;
          padding: 6px 15px;
          border-radius: 40px;
          border: 1px solid #fecaca;
        }

        .punto-tiempo-real {
          width: 8px;
          height: 8px;
          background: #ef4444;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }

        .tiempo-real-texto {
          font-size: 0.7rem;
          font-weight: 700;
          color: #ef4444;
          letter-spacing: 0.5px;
        }

        .reloj-digital {
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
          font-weight: 600;
          background: white;
          padding: 4px 8px;
          border-radius: 30px;
          border: 1px solid #fecaca;
          color: #ef4444;
        }

        /* ===== KPI CARDS ===== */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 15px;
          padding: 15px 20px;
          background: #f8fafc;
          border-bottom: 2px solid #e2e8f0;
        }

        .kpi-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 15px;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }

        .kpi-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 20px -10px rgba(239, 68, 68, 0.2);
          border-color: #ef4444;
        }

        .kpi-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .kpi-icon {
          font-size: 1.5rem;
          background: #f8fafc;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .kpi-tendencia {
          font-size: 0.7rem;
          background: #f1f5f9;
          padding: 4px 10px;
          border-radius: 30px;
          color: #64748b;
          font-weight: 600;
        }

        .kpi-tendencia.positivo {
          background: #fee2e2;
          color: #ef4444;
        }

        .kpi-tendencia.negativo {
          background: #fee2e2;
          color: #ef4444;
        }

        .kpi-numero {
          font-size: 2.5rem;
          font-weight: 700;
          color: #0f172a;
          line-height: 1;
          margin-bottom: 5px;
          font-family: 'Courier New', monospace;
        }

        .kpi-label {
          font-size: 0.75rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .kpi-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.7rem;
          border-top: 1px solid #e2e8f0;
          padding-top: 10px;
        }

        .kpi-trend {
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 20px;
        }

        .kpi-trend.positivo {
          background: #fee2e2;
          color: #ef4444;
        }

        .kpi-trend.negativo {
          background: #fee2e2;
          color: #ef4444;
        }

        .kpi-periodo {
          color: #94a3b8;
          font-weight: 500;
        }

        .kpi-periodo.critico {
          background: #fee2e2;
          color: #ef4444;
          padding: 3px 8px;
          border-radius: 20px;
          font-weight: 700;
        }

        .kpi-periodo.atencion {
          background: #fee2e2;
          color: #ef4444;
          padding: 3px 8px;
          border-radius: 20px;
          font-weight: 700;
        }

        .kpi-periodo.controlado {
          background: #fee2e2;
          color: #ef4444;
          padding: 3px 8px;
          border-radius: 20px;
          font-weight: 700;
        }

        .kpi-periodo.alto-impacto {
          background: #ef4444;
          color: white;
          padding: 3px 8px;
          border-radius: 20px;
          font-weight: 700;
        }

        /* Estilos específicos para cada KPI */
        .kpi-card.grave .kpi-numero {
          color: #ef4444;
          font-size: 3rem;
          text-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
          animation: redPulse 2s infinite;
        }

        .kpi-card.grave .kpi-label {
          color: #ef4444;
          font-weight: 700;
        }

        .kpi-card.medio .kpi-numero {
          color: #ef4444;
          font-size: 3rem;
        }

        .kpi-card.medio .kpi-label {
          color: #ef4444;
        }

        .kpi-card.leve .kpi-numero {
          color: #ef4444;
          font-size: 3rem;
        }

        .kpi-card.leve .kpi-label {
          color: #ef4444;
        }

        .kpi-card.total .kpi-numero {
          color: #ef4444;
        }

        .kpi-card.total .kpi-footer span:first-child {
          color: #ef4444;
          font-weight: 700;
        }

        .kpi-card.piezas {
          border-left: 5px solid #ef4444;
        }

        .kpi-card.piezas .kpi-numero {
          color: #ef4444;
          font-size: 3rem;
          font-weight: 800;
          letter-spacing: 2px;
          animation: redPulse 2s infinite;
        }

        .kpi-card.piezas .kpi-label {
          color: #ef4444;
          font-weight: 700;
        }

        @keyframes redPulse {
          0%, 100% { text-shadow: 0 0 8px rgba(239, 68, 68, 0.5); }
          50% { text-shadow: 0 0 15px rgba(239, 68, 68, 0.8); }
        }

        /* ===== FILTROS ===== */
        .filtros-container {
          padding: 15px 20px;
          background: white;
          border-bottom: 2px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
        }

        .filtros-izquierda {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .filtro-select {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #0f172a;
          padding: 10px 35px 10px 15px;
          border-radius: 30px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23ef4444' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          min-width: 150px;
          transition: all 0.2s;
        }

        .filtro-select:hover {
          border-color: #ef4444;
          background: white;
        }

        .filtro-select:focus {
          outline: none;
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
        }

        .filtro-select option {
          color: #0f172a;
        }

        .filtro-select option:first-child,
        .filtro-select option[value="todas"],
        .filtro-select option[value="todos"] {
          color: #ef4444;
          font-weight: 700;
        }

        .filtros-derecha {
          display: flex;
          gap: 10px;
        }

        .btn-exportar {
          padding: 10px 20px;
          border-radius: 30px;
          border: 2px solid #ef4444;
          background: white;
          color: #ef4444;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s;
        }

        .btn-exportar:hover {
          background: #ef4444;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 6px 12px -4px #ef4444;
        }

        .btn-buscar {
          padding: 10px 22px;
          border-radius: 30px;
          border: none;
          background: #ef4444;
          color: white;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s;
          box-shadow: 0 6px 12px -4px #ef4444;
        }

        .btn-buscar:hover {
          background: #dc2626;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -8px #ef4444;
        }

        /* ===== TABLA ===== */
        .tabla-container {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          padding: 0 20px 15px;
        }

        .tabla-toolbar {
          padding: 12px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #e2e8f0;
        }

        .tabla-info {
          font-size: 0.9rem;
          color: #334155;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .favoritos-badge {
          background: #fef3c7;
          color: #b45309;
          padding: 4px 12px;
          border-radius: 30px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .tabla-acciones {
          display: flex;
          gap: 10px;
        }

        .tabla-accion-btn {
          padding: 6px 16px;
          border-radius: 30px;
          border: 1px solid #e2e8f0;
          background: white;
          color: #334155;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: all 0.2s;
        }

        .tabla-accion-btn:hover {
          background: #f8fafc;
          border-color: #ef4444;
          color: #ef4444;
        }

        .tabla-wrapper {
          flex: 1;
          overflow: auto;
          margin-top: 15px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: white;
          box-shadow: 0 4px 10px rgba(239, 68, 68, 0.1);
        }

        .tabla-wrapper::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .tabla-wrapper::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }

        .tabla-wrapper::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }

        .tabla-wrapper::-webkit-scrollbar-thumb:hover {
          background: #ef4444;
        }

        .tabla-atrasos {
          width: 100%;
          border-collapse: collapse;
          min-width: 1200px;
        }

        .tabla-atrasos th {
          background: #f8fafc;
          color: #64748b;
          font-weight: 600;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 15px 15px;
          text-align: left;
          border-bottom: 2px solid #e2e8f0;
          white-space: nowrap;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .tabla-atrasos td {
          padding: 12px 15px;
          color: #334155;
          font-size: 0.85rem;
          border-bottom: 1px solid #e2e8f0;
          vertical-align: middle;
        }

        .tabla-atrasos tbody tr.fila-grave {
          background-color: #fff2f0;
        }

        .tabla-atrasos tbody tr.fila-medio {
          background-color: #fff9f0;
        }

        .tabla-atrasos tbody tr.fila-leve {
          background-color: #f0fdf4;
        }

        .tabla-atrasos tbody tr {
          transition: all 0.2s;
        }

        .tabla-atrasos tbody tr:hover {
          background: #f8fafc !important;
          cursor: pointer;
        }

        .favorito-btn {
          background: transparent;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 4px;
          transition: all 0.2s;
        }

        .favorito-btn:hover {
          transform: scale(1.2);
          color: #ef4444;
        }

        .numero {
          font-family: 'Courier New', monospace;
          font-weight: 600;
        }

        .dias-badge {
          padding: 5px 12px;
          border-radius: 30px;
          font-size: 0.75rem;
          font-weight: 600;
          display: inline-block;
        }

        .dias-badge.critico {
          background: #fee2e2;
          color: #b91c1c;
        }

        .dias-badge.moderado {
          background: #fff7ed;
          color: #9a3412;
        }

        .dias-badge.normal {
          background: #f0fdf4;
          color: #166534;
        }

        .prioridad-indicator {
          font-size: 1.2rem;
          display: inline-block;
        }

        .estado-badge {
          padding: 5px 12px;
          border-radius: 30px;
          font-weight: 600;
          font-size: 0.7rem;
          text-transform: uppercase;
          display: inline-block;
          letter-spacing: 0.5px;
        }

        .estado-grave {
          background: #fee2e2;
          color: #b91c1c;
          border: 1px solid #fecaca;
        }

        .estado-medio {
          background: #fff7ed;
          color: #9a3412;
          border: 1px solid #fed7aa;
        }

        .estado-leve {
          background: #f0fdf4;
          color: #166534;
          border: 1px solid #bbf7d0;
        }

        .progreso-container {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 110px;
        }

        .progreso-barra {
          flex: 1;
          height: 6px;
          background: #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
        }

        .progreso-llenado {
          height: 100%;
          border-radius: 10px;
          transition: width 0.5s ease;
          position: relative;
          overflow: hidden;
        }

        .progreso-llenado.grave {
          background: #ef4444;
        }

        .progreso-llenado.medio {
          background: #f59e0b;
        }

        .progreso-llenado.leve {
          background: #22c55e;
        }

        .progreso-texto {
          font-size: 0.75rem;
          font-weight: 600;
          color: #334155;
          min-width: 35px;
          font-family: 'Courier New', monospace;
        }

        .responsable {
          display: flex;
          align-items: center;
          gap: 5px;
          font-weight: 500;
          color: #0f172a;
          font-size: 0.8rem;
        }

        .acciones-container {
          display: flex;
          gap: 5px;
        }

        .accion-btn {
          width: 30px;
          height: 30px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          background: white;
          color: #64748b;
          cursor: pointer;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .accion-btn:hover {
          background: #ef4444;
          color: white;
          border-color: #ef4444;
          transform: scale(1.1);
        }

        /* ===== PAGINACIÓN ===== */
        .paginacion {
          padding: 15px 0 5px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
        }

        .paginacion-btn {
          padding: 6px 12px;
          border-radius: 30px;
          border: 1px solid #e2e8f0;
          background: white;
          color: #334155;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          min-width: 36px;
          transition: all 0.2s;
        }

        .paginacion-btn:hover:not(:disabled) {
          background: #f8fafc;
          border-color: #ef4444;
          color: #ef4444;
        }

        .paginacion-btn.activo {
          background: #ef4444;
          color: white;
          border-color: #ef4444;
          box-shadow: 0 4px 8px -2px #ef4444;
        }

        .paginacion-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* ===== FOOTER ===== */
        .dashboard-footer {
          background: white;
          border-top: 2px solid #e2e8f0;
          padding: 15px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-shrink: 0;
          font-size: 0.8rem;
          color: #64748b;
        }

        .footer-left {
          display: flex;
          align-items: center;
          gap: 25px;
        }

        .info-actualizacion {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .punto-estado {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #e2e8f0;
        }

        .punto-estado.activo {
          background: #ef4444;
          animation: pulse 2s infinite;
        }

        .stats-rapidas {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .stat-rapida {
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 500;
          font-size: 0.8rem;
        }

        .footer-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .total-registros {
          font-weight: 600;
          color: #ef4444;
          background: #fee2e2;
          padding: 5px 12px;
          border-radius: 30px;
          font-size: 0.8rem;
        }

        .version-info {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f8fafc;
          padding: 6px 15px;
          border-radius: 30px;
          border: 1px solid #e2e8f0;
          font-weight: 500;
          font-size: 0.8rem;
        }

        .build-info {
          color: #94a3b8;
          font-size: 0.7rem;
          font-weight: normal;
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 1400px) {
          .kpi-grid {
            grid-template-columns: repeat(5, 1fr);
          }
          
          .tabla-atrasos {
            min-width: 1100px;
          }
        }

        @media (max-width: 1200px) {
          .kpi-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          
          .filtros-izquierda {
            width: 100%;
          }
          
          .tabla-atrasos {
            min-width: 1000px;
          }
        }

        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }
          
          .header-actions {
            width: 100%;
            flex-wrap: wrap;
          }
          
          .search-box {
            flex: 1;
          }
          
          .kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .filtros-container {
            flex-direction: column;
            align-items: stretch;
          }
          
          .footer-left {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          
          .stats-rapidas {
            flex-wrap: wrap;
          }
          
          .footer-right {
            flex-direction: column;
            align-items: flex-end;
            gap: 8px;
          }
        }
      `}</style>

      <div className="atrasos-dashboard">
        {/* HEADER */}
        <header className="dashboard-header">
          <div className="header-left">
            <div className="header-icon">🚨</div>
            <div>
              <h1 className="header-titulo">
                Control de Atrasos
                <span className="header-badge">⚠️ {atrasos.length} total</span>
              </h1>
              <div className="header-fecha">
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

          <div className="header-actions">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Buscar lote..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="search-input"
              />
            </div>

            <button className="header-btn" onClick={() => setMostrarNotificaciones(!mostrarNotificaciones)}>
              ⚠️
              <span className="notificacion-badge">3</span>
            </button>

            <div className="header-tiempo-real">
              <span className="punto-tiempo-real"></span>
              <span className="tiempo-real-texto">⚠️ EN VIVO</span>
              <span className="reloj-digital">
                {tiempoActual.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </header>

        {/* KPI CARDS */}
        <div className="kpi-grid">
          {/* ATRASOS GRAVES */}
          <div className="kpi-card grave">
            <div className="kpi-header">
              <span className="kpi-icon">🔥</span>
              <span className="kpi-tendencia positivo">+5%</span>
            </div>
            <div className="kpi-numero">{estadisticas.graves}</div>
            <div className="kpi-label">ATRASOS GRAVES</div>
            <div className="kpi-footer">
              <span className="kpi-trend positivo">⬆️ +2 vs ayer</span>
              <span className="kpi-periodo critico">⛔ CRÍTICO</span>
            </div>
          </div>

          {/* ATRASOS MEDIOS */}
          <div className="kpi-card medio">
            <div className="kpi-header">
              <span className="kpi-icon">⚠️</span>
              <span className="kpi-tendencia positivo">+5%</span>
            </div>
            <div className="kpi-numero">{estadisticas.medios}</div>
            <div className="kpi-label">ATRASOS MEDIOS</div>
            <div className="kpi-footer">
              <span className="kpi-trend positivo">📈 +1 esta semana</span>
              <span className="kpi-periodo atencion">⚡ ATENCIÓN</span>
            </div>
          </div>

          {/* ATRASOS LEVES */}
          <div className="kpi-card leve">
            <div className="kpi-header">
              <span className="kpi-icon">✅</span>
              <span className="kpi-tendencia negativo">-8%</span>
            </div>
            <div className="kpi-numero">{estadisticas.leves}</div>
            <div className="kpi-label">ATRASOS LEVES</div>
            <div className="kpi-footer">
              <span className="kpi-trend negativo">⬇️ -3 resueltos</span>
              <span className="kpi-periodo controlado">✅ CONTROLADO</span>
            </div>
          </div>

          {/* TOTAL */}
          <div className="kpi-card total">
            <div className="kpi-header">
              <span className="kpi-icon">📊</span>
              <span className="kpi-tendencia">Total</span>
            </div>
            <div className="kpi-numero">{estadisticas.total}</div>
            <div className="kpi-label">TOTAL ATRASOS</div>
            <div className="kpi-footer">
              <span className="kpi-trend positivo">{estadisticas.dias} días</span>
              <span className="kpi-periodo">+2 vs ayer</span>
            </div>
          </div>

          {/* PIEZAS ATRASADAS */}
          <div className="kpi-card piezas">
            <div className="kpi-header">
              <span className="kpi-icon">📦</span>
              <span className="kpi-tendencia">Alto</span>
            </div>
            <div className="kpi-numero">{estadisticas.piezas.toLocaleString()}</div>
            <div className="kpi-label">PIEZAS ATRASADAS</div>
            <div className="kpi-footer">
              <span className="kpi-trend positivo alto-impacto">⛔ ALTO IMPACTO</span>
              <span className="kpi-periodo alto-impacto">🚫 Producción detenida</span>
            </div>
          </div>
        </div>

        {/* FILTROS */}
        <div className="filtros-container">
          <div className="filtros-izquierda">
            <select className="filtro-select" value={filtroArea} onChange={(e) => setFiltroArea(e.target.value)}>
              <option value="todas">🌐 Todas las áreas</option>
              <option value="Corte">✂️ Corte</option>
              <option value="Sublimado">🎨 Sublimado</option>
              <option value="Empaque">📦 Empaque</option>
            </select>

            <select className="filtro-select" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
              <option value="todos">⚪ Todos los estados</option>
              <option value="GRAVE">🔥 Graves</option>
              <option value="MEDIO">⚠️ Medios</option>
              <option value="LEVE">✅ Leves</option>
            </select>

            <select className="filtro-select" value={filtroDias} onChange={(e) => setFiltroDias(e.target.value)}>
              <option value="todos">📅 Todos los días</option>
              <option value="critico">⛔ Crítico (+10 días)</option>
              <option value="moderado">⚠️ Moderado (5-10 días)</option>
            </select>

            <select className="filtro-select" value={elementosPorPagina} onChange={(e) => setElementosPorPagina(Number(e.target.value))}>
              <option value="5">5 por página</option>
              <option value="10">10 por página</option>
              <option value="20">20 por página</option>
            </select>
          </div>

          <div className="filtros-derecha">
            <button className="btn-exportar" onClick={() => alert('Exportando...')}>
              📥 Exportar
            </button>
            <button className="btn-buscar">
              ⚠️ Aplicar Filtros
            </button>
          </div>
        </div>

        {/* TABLA */}
        <div className="tabla-container">
          <div className="tabla-toolbar">
            <div className="tabla-info">
              ⚠️ Mostrando {atrasosPaginados.length} de {atrasosFiltrados.length} registros
              {favoritos.length > 0 && (
                <span className="favoritos-badge">⭐ {favoritos.length} favoritos</span>
              )}
            </div>
            <div className="tabla-acciones">
              <button className="tabla-accion-btn" onClick={() => window.location.reload()}>
                🔄 Actualizar
              </button>
              <button className="tabla-accion-btn" onClick={() => setFavoritos([])}>
                🧹 Limpiar favoritos
              </button>
            </div>
          </div>

          <div className="tabla-wrapper">
            <table className="tabla-atrasos">
              <thead>
                <tr>
                  <th>⭐</th>
                  <th>⚠️ LOTE</th>
                  <th>CLIENTE</th>
                  <th>ÁREA</th>
                  <th>📦 PIEZAS</th>
                  <th>📅 DÍAS</th>
                  <th>⚠️ PRIORIDAD</th>
                  <th>🚨 ESTADO</th>
                  <th>📊 PROGRESO</th>
                  <th>👤 RESPONSABLE</th>
                  <th>⚡ ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {atrasosPaginados.map(item => (
                  <tr key={item.id} className={`fila-${item.estado.toLowerCase()}`}>
                    <td>
                      <button className="favorito-btn" onClick={() => toggleFavorito(item.id)}>
                        {favoritos.includes(item.id) ? '⭐' : '☆'}
                      </button>
                    </td>
                    <td><strong>{item.lote}</strong></td>
                    <td>{item.cliente}</td>
                    <td>{item.area}</td>
                    <td className="numero">{item.piezas.toLocaleString()}</td>
                    <td>
                      <span className={`dias-badge ${item.dias > 10 ? 'critico' : item.dias > 5 ? 'moderado' : 'normal'}`}>
                        {item.dias} 📅
                      </span>
                    </td>
                    <td>
                      <span className="prioridad-indicator">
                        {item.prioridad === 'Alta' ? '🔥' : item.prioridad === 'Media' ? '⚠️' : '✅'}
                      </span>
                    </td>
                    <td>
                      <span className={`estado-badge estado-${item.estado.toLowerCase()}`}>
                        {item.estado === 'GRAVE' ? '🔥 ' : item.estado === 'MEDIO' ? '⚠️ ' : '✅ '}
                        {item.estado}
                      </span>
                    </td>
                    <td>
                      <div className="progreso-container">
                        <div className="progreso-barra">
                          <div className={`progreso-llenado ${item.estado.toLowerCase()}`} style={{width: `${item.progreso}%`}}></div>
                        </div>
                        <span className="progreso-texto">{item.progreso}%</span>
                      </div>
                    </td>
                    <td>
                      <span className="responsable">👤 {item.responsable}</span>
                    </td>
                    <td>
                      <div className="acciones-container">
                        <button className="accion-btn">👁️</button>
                        <button className="accion-btn">✏️</button>
                        <button className="accion-btn">⚡</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINACIÓN */}
          {totalPaginas > 1 && (
            <div className="paginacion">
              <button 
                className="paginacion-btn"
                onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                disabled={paginaActual === 1}
              >
                ←
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
                →
              </button>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <footer className="dashboard-footer">
          <div className="footer-left">
            <div className="info-actualizacion">
              <span className="punto-estado activo"></span>
              <span>⚠️ Actualización en tiempo real • cada 5 segundos</span>
            </div>
            <div className="stats-rapidas">
              <span className="stat-rapida">📊 {atrasosFiltrados.length} filtrados</span>
              <span className="stat-rapida">⭐ {favoritos.length} favoritos</span>
              <span className="stat-rapida">📅 {tiempoActual.toLocaleDateString()}</span>
            </div>
          </div>
          <div className="footer-right">
            <span className="total-registros">⚠️ Página {paginaActual} de {totalPaginas}</span>
            <span className="version-info">
              🚨 TEGRA v2.5.0
              <span className="build-info">Build 2024.02.26</span>
            </span>
          </div>
        </footer>
      </div>
    </>
  );
};

export default AtrasosDashboard;