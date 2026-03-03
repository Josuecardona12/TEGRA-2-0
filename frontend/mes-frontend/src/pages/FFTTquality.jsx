import React, { useState, useEffect } from 'react';
import './FFTTquality.css';

const FFTTquality = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [vista, setVista] = useState('dashboard'); // dashboard, lotes, analisis, graficos, scanner
  const [periodo, setPeriodo] = useState('dia');
  const [filtros, setFiltros] = useState({
    fecha: 'todas',
    tipoRechazo: 'todos',
    sport: 'todos',
    turno: 'todos',
    gravedad: 'todos',
    busqueda: ''
  });

  // Estados para datos principales
  const [lotes, setLotes] = useState([
    { 
      id: 1, 
      lote: 'L2401-001', 
      po: 'V108707', 
      sport: 'Baseball', 
      fecha: '2024-03-15',
      turno: 'A',
      totalMuestras: 150,
      aceptadas: 142,
      rechazadas: 8,
      tasaFFTT: 94.7,
      tipoRechazo: {
        tono: 3,
        textura: 2,
        color: 1,
        dimension: 1,
        acabado: 1
      },
      operador: 'Carlos López',
      inspector: 'María González',
      observaciones: 'Lote con variaciones menores en tono',
      gravedad: 'media'
    },
    { 
      id: 2, 
      lote: 'L2402-002', 
      po: 'V109133', 
      sport: 'Baseball', 
      fecha: '2024-03-15',
      turno: 'B',
      totalMuestras: 200,
      aceptadas: 182,
      rechazadas: 18,
      tasaFFTT: 91.0,
      tipoRechazo: {
        tono: 8,
        textura: 4,
        color: 3,
        dimension: 2,
        acabado: 1
      },
      operador: 'María González',
      inspector: 'Pedro Ramírez',
      observaciones: 'Problemas consistentes con tono',
      gravedad: 'alta'
    },
    { 
      id: 3, 
      lote: 'L2403-003', 
      po: 'V108994', 
      sport: 'Baseball', 
      fecha: '2024-03-14',
      turno: 'A',
      totalMuestras: 180,
      aceptadas: 175,
      rechazadas: 5,
      tasaFFTT: 97.2,
      tipoRechazo: {
        tono: 1,
        textura: 1,
        color: 1,
        dimension: 1,
        acabado: 1
      },
      operador: 'Pedro Ramírez',
      inspector: 'Ana Martínez',
      observaciones: 'Rechazos mínimos, excelente calidad',
      gravedad: 'baja'
    },
    { 
      id: 4, 
      lote: 'L2404-004', 
      po: 'V109217', 
      sport: 'Baseball', 
      fecha: '2024-03-14',
      turno: 'B',
      totalMuestras: 220,
      aceptadas: 198,
      rechazadas: 22,
      tasaFFTT: 90.0,
      tipoRechazo: {
        tono: 10,
        textura: 5,
        color: 4,
        dimension: 2,
        acabado: 1
      },
      operador: 'Ana Martínez',
      inspector: 'Roberto Díaz',
      observaciones: 'Problema crítico con tono y textura',
      gravedad: 'critica'
    },
    { 
      id: 5, 
      lote: 'L2405-005', 
      po: 'V108251', 
      sport: 'Soccer', 
      fecha: '2024-03-13',
      turno: 'A',
      totalMuestras: 190,
      aceptadas: 185,
      rechazadas: 5,
      tasaFFTT: 97.4,
      tipoRechazo: {
        tono: 2,
        textura: 1,
        color: 1,
        dimension: 1,
        acabado: 0
      },
      operador: 'Roberto Díaz',
      inspector: 'Laura Torres',
      observaciones: 'Buen control de calidad',
      gravedad: 'baja'
    },
    { 
      id: 6, 
      lote: 'L2406-006', 
      po: 'V109459', 
      sport: 'Soccer', 
      fecha: '2024-03-13',
      turno: 'C',
      totalMuestras: 210,
      aceptadas: 195,
      rechazadas: 15,
      tasaFFTT: 92.9,
      tipoRechazo: {
        tono: 5,
        textura: 3,
        color: 3,
        dimension: 2,
        acabado: 2
      },
      operador: 'Laura Torres',
      inspector: 'Carlos López',
      observaciones: 'Múltiples problemas de acabado',
      gravedad: 'media'
    },
    { 
      id: 7, 
      lote: 'L2407-007', 
      po: 'V109460', 
      sport: 'Basketball', 
      fecha: '2024-03-12',
      turno: 'A',
      totalMuestras: 175,
      aceptadas: 170,
      rechazadas: 5,
      tasaFFTT: 97.1,
      tipoRechazo: {
        tono: 2,
        textura: 1,
        color: 1,
        dimension: 1,
        acabado: 0
      },
      operador: 'Carlos López',
      inspector: 'María González',
      observaciones: 'Calidad consistente',
      gravedad: 'baja'
    },
    { 
      id: 8, 
      lote: 'L2408-008', 
      po: 'V109461', 
      sport: 'Basketball', 
      fecha: '2024-03-12',
      turno: 'B',
      totalMuestras: 195,
      aceptadas: 175,
      rechazadas: 20,
      tasaFFTT: 89.7,
      tipoRechazo: {
        tono: 9,
        textura: 4,
        color: 3,
        dimension: 2,
        acabado: 2
      },
      operador: 'María González',
      inspector: 'Pedro Ramírez',
      observaciones: 'Problemas severos de tono',
      gravedad: 'alta'
    },
    { 
      id: 9, 
      lote: 'L2409-009', 
      po: 'V109462', 
      sport: 'Football', 
      fecha: '2024-03-11',
      turno: 'A',
      totalMuestras: 185,
      aceptadas: 180,
      rechazadas: 5,
      tasaFFTT: 97.3,
      tipoRechazo: {
        tono: 2,
        textura: 1,
        color: 1,
        dimension: 1,
        acabado: 0
      },
      operador: 'Pedro Ramírez',
      inspector: 'Ana Martínez',
      observaciones: 'Excelente control',
      gravedad: 'baja'
    },
    { 
      id: 10, 
      lote: 'L2410-010', 
      po: 'V109463', 
      sport: 'Football', 
      fecha: '2024-03-11',
      turno: 'C',
      totalMuestras: 205,
      aceptadas: 188,
      rechazadas: 17,
      tasaFFTT: 91.7,
      tipoRechazo: {
        tono: 7,
        textura: 3,
        color: 3,
        dimension: 2,
        acabado: 2
      },
      operador: 'Ana Martínez',
      inspector: 'Roberto Díaz',
      observaciones: 'Variaciones en tono y textura',
      gravedad: 'media'
    }
  ]);

  // Estado para el escáner
  const [scannerData, setScannerData] = useState({
    codigoEscaneado: '',
    numeroLote: '',
    fechaEscaneo: new Date().toISOString().split('T')[0],
    horaEscaneo: new Date().toLocaleTimeString(),
    tipoProducto: '',
    operador: ''
  });

  const [historialEscaneos, setHistorialEscaneos] = useState([]);
  const [escanerActivo, setEscanerActivo] = useState(false);
  const [codigoTemporal, setCodigoTemporal] = useState('');

  const [selectedLote, setSelectedLote] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [notificacion, setNotificacion] = useState({ mostrar: false, mensaje: '', tipo: '' });

  // Estado para análisis en tiempo real
  const [analisisTiempoReal, setAnalisisTiempoReal] = useState({
    tendencias: [],
    alertas: [],
    predicciones: {}
  });

  // Estado para edición por lote
  const [loteEditMode, setLoteEditMode] = useState(false);
  const [loteSeleccionados, setLoteSeleccionados] = useState([]);
  const [loteEditField, setLoteEditField] = useState('');
  const [loteEditValue, setLoteEditValue] = useState('');
  const [notasLote, setNotasLote] = useState({});

  // Estado para inspección detallada
  const [inspeccionActiva, setInspeccionActiva] = useState(null);
  const [muestrasDetalle, setMuestrasDetalle] = useState([]);

  // Opciones para filtros
  const tiposRechazo = ['todos', 'tono', 'textura', 'color', 'dimension', 'acabado'];
  const sports = ['todos', ...new Set(lotes.map(l => l.sport))];
  const turnos = ['todos', ...new Set(lotes.map(l => l.turno))];
  const gravedades = ['todos', 'baja', 'media', 'alta', 'critica'];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Cargar historial de escaneos desde localStorage
  useEffect(() => {
    const historialGuardado = localStorage.getItem('historialEscaneos');
    if (historialGuardado) {
      setHistorialEscaneos(JSON.parse(historialGuardado));
    }
  }, []);

  // Efecto para notificaciones
  useEffect(() => {
    if (notificacion.mostrar) {
      const timer = setTimeout(() => {
        setNotificacion({ mostrar: false, mensaje: '', tipo: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notificacion]);

  // Efecto para simular escáner activo
  useEffect(() => {
    if (escanerActivo) {
      const handleKeyPress = (e) => {
        // Simular entrada de escáner (los escáneres normalmente terminan con Enter)
        if (e.key === 'Enter') {
          if (codigoTemporal) {
            setScannerData(prev => ({
              ...prev,
              codigoEscaneado: codigoTemporal
            }));
            setCodigoTemporal('');
            setNotificacion({
              mostrar: true,
              mensaje: '✅ Código escaneado correctamente',
              tipo: 'exito'
            });
          }
        } else if (e.key.length === 1) {
          // Solo caracteres imprimibles
          setCodigoTemporal(prev => prev + e.key);
        }
      };

      window.addEventListener('keypress', handleKeyPress);
      return () => window.removeEventListener('keypress', handleKeyPress);
    }
  }, [escanerActivo, codigoTemporal]);

  // Calcular estadísticas FFTT
  const stats = {
    totalLotes: lotes.length,
    totalMuestras: lotes.reduce((sum, l) => sum + l.totalMuestras, 0),
    totalAceptadas: lotes.reduce((sum, l) => sum + l.aceptadas, 0),
    totalRechazadas: lotes.reduce((sum, l) => sum + l.rechazadas, 0),
    tasaFFTTPromedio: Math.round(lotes.reduce((sum, l) => sum + l.tasaFFTT, 0) / lotes.length),
    rechazosPorTipo: {
      tono: lotes.reduce((sum, l) => sum + l.tipoRechazo.tono, 0),
      textura: lotes.reduce((sum, l) => sum + l.tipoRechazo.textura, 0),
      color: lotes.reduce((sum, l) => sum + l.tipoRechazo.color, 0),
      dimension: lotes.reduce((sum, l) => sum + l.tipoRechazo.dimension, 0),
      acabado: lotes.reduce((sum, l) => sum + l.tipoRechazo.acabado, 0)
    },
    lotesCriticos: lotes.filter(l => l.gravedad === 'critica' || l.gravedad === 'alta').length,
    tendencia: {
      diaria: +2.3,
      semanal: +1.8,
      mensual: -0.5
    }
  };

  // Estadísticas del escáner
  const scannerStats = {
    totalEscaneos: historialEscaneos.length,
    escaneosHoy: historialEscaneos.filter(e => 
      e.fechaEscaneo === new Date().toISOString().split('T')[0]
    ).length,
    lotesUnicos: new Set(historialEscaneos.map(e => e.numeroLote)).size
  };

  // Filtrar lotes
  const lotesFiltrados = lotes.filter(lote => {
    if (filtros.tipoRechazo !== 'todos' && lote.tipoRechazo[filtros.tipoRechazo] === 0) return false;
    if (filtros.sport !== 'todos' && lote.sport !== filtros.sport) return false;
    if (filtros.turno !== 'todos' && lote.turno !== filtros.turno) return false;
    if (filtros.gravedad !== 'todos' && lote.gravedad !== filtros.gravedad) return false;
    if (filtros.busqueda && 
        !lote.lote.toLowerCase().includes(filtros.busqueda.toLowerCase()) && 
        !lote.po.toLowerCase().includes(filtros.busqueda.toLowerCase()) &&
        !lote.operador.toLowerCase().includes(filtros.busqueda.toLowerCase())) return false;
    return true;
  });

  const getGravedadColor = (gravedad) => {
    switch(gravedad) {
      case 'baja': return '#10b981';
      case 'media': return '#f59e0b';
      case 'alta': return '#ef4444';
      case 'critica': return '#7f1d1d';
      default: return '#94a3b8';
    }
  };

  const getGravedadIcon = (gravedad) => {
    switch(gravedad) {
      case 'baja': return '🟢';
      case 'media': return '🟡';
      case 'alta': return '🟠';
      case 'critica': return '🔴';
      default: return '⚪';
    }
  };

  const getTasaFFTTColor = (tasa) => {
    if (tasa >= 95) return '#10b981';
    if (tasa >= 90) return '#f59e0b';
    if (tasa >= 85) return '#ef4444';
    return '#7f1d1d';
  };

  // Funciones del escáner
  const handleIniciarEscaner = () => {
    setEscanerActivo(true);
    setNotificacion({
      mostrar: true,
      mensaje: '📷 Escáner activado - Listo para leer códigos',
      tipo: 'info'
    });
  };

  const handleDetenerEscaner = () => {
    setEscanerActivo(false);
    setCodigoTemporal('');
    setNotificacion({
      mostrar: true,
      mensaje: '⏹️ Escáner desactivado',
      tipo: 'info'
    });
  };

  const handleGuardarEscaneo = () => {
    if (!scannerData.codigoEscaneado || !scannerData.numeroLote) {
      setNotificacion({
        mostrar: true,
        mensaje: '❌ Debes escanear un código y asignar un lote',
        tipo: 'error'
      });
      return;
    }

    const nuevoEscaneo = {
      id: Date.now(),
      ...scannerData,
      timestamp: new Date().toISOString()
    };

    const nuevoHistorial = [nuevoEscaneo, ...historialEscaneos];
    setHistorialEscaneos(nuevoHistorial);
    localStorage.setItem('historialEscaneos', JSON.stringify(nuevoHistorial));

    setNotificacion({
      mostrar: true,
      mensaje: '✅ Escaneo guardado correctamente',
      tipo: 'exito'
    });

    // Limpiar formulario pero mantener el lote si se quiere seguir escaneando
    setScannerData(prev => ({
      ...prev,
      codigoEscaneado: '',
      horaEscaneo: new Date().toLocaleTimeString()
    }));
  };

  const handleLimpiarEscaneo = () => {
    setScannerData({
      codigoEscaneado: '',
      numeroLote: '',
      fechaEscaneo: new Date().toISOString().split('T')[0],
      horaEscaneo: new Date().toLocaleTimeString(),
      tipoProducto: '',
      operador: ''
    });
  };

  const handleEliminarEscaneo = (id) => {
    const nuevoHistorial = historialEscaneos.filter(e => e.id !== id);
    setHistorialEscaneos(nuevoHistorial);
    localStorage.setItem('historialEscaneos', JSON.stringify(nuevoHistorial));
    setNotificacion({
      mostrar: true,
      mensaje: '🗑️ Escaneo eliminado',
      tipo: 'info'
    });
  };

  const handleExportarEscaneos = () => {
    const dataStr = JSON.stringify(historialEscaneos, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `escaneos_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    setNotificacion({
      mostrar: true,
      mensaje: '📥 Historial exportado',
      tipo: 'exito'
    });
  };

  const handleVerDetalle = (lote) => {
    setSelectedLote(lote);
    setModalType('detalle');
    setShowModal(true);
  };

  const handleInspeccionar = (lote) => {
    setSelectedLote(lote);
    setInspeccionActiva(lote);
    setModalType('inspeccion');
    setShowModal(true);
  };

  const handleEditar = (lote) => {
    setSelectedLote(lote);
    setModalType('editar');
    setShowModal(true);
  };

  const handleGuardarCambios = (e) => {
    e.preventDefault();
    setNotificacion({
      mostrar: true,
      mensaje: '✅ Cambios guardados exitosamente',
      tipo: 'exito'
    });
    setShowModal(false);
  };

  const toggleSeleccionLote = (id) => {
    setLoteSeleccionados(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSeleccionTodos = () => {
    if (loteSeleccionados.length === lotesFiltrados.length) {
      setLoteSeleccionados([]);
    } else {
      setLoteSeleccionados(lotesFiltrados.map(l => l.id));
    }
  };

  const aplicarEdicionLote = () => {
    if (!loteEditField || loteSeleccionados.length === 0) return;

    setNotificacion({
      mostrar: true,
      mensaje: `✅ Actualizados ${loteSeleccionados.length} lotes`,
      tipo: 'exito'
    });

    setLoteEditMode(false);
    setLoteSeleccionados([]);
    setLoteEditField('');
    setLoteEditValue('');
  };

  const generarReporte = (tipo) => {
    setNotificacion({
      mostrar: true,
      mensaje: `📊 Generando reporte ${tipo}...`,
      tipo: 'info'
    });
  };

  const exportarDatos = (formato) => {
    setNotificacion({
      mostrar: true,
      mensaje: `📥 Exportando a ${formato}...`,
      tipo: 'info'
    });
  };

  return (
    <div className="fftt-quality-container">
      {/* Notificaciones */}
      {notificacion.mostrar && (
        <div className={`fftt-notificacion ${notificacion.tipo}`}>
          <div className="notificacion-contenido">
            <span className="notificacion-icono">
              {notificacion.tipo === 'exito' && '✅'}
              {notificacion.tipo === 'info' && 'ℹ️'}
              {notificacion.tipo === 'error' && '❌'}
              {notificacion.tipo === 'alerta' && '⚠️'}
            </span>
            <span className="notificacion-mensaje">{notificacion.mensaje}</span>
          </div>
          <div className="notificacion-progreso"></div>
        </div>
      )}

      {/* Panel de Control FFTT */}
      <div className="fftt-control-panel">
        <div className="panel-glow"></div>
        <div className="panel-header">
          <div className="header-titulo">
            <h1 className="titulo-3d">
              <span className="titulo-icono">🔬</span>
              FFTT quality Control
              <span className="titulo-badge">First Time Through</span>
            </h1>
            <div className="header-stats">
              <div className="stat-chip live">
                <span className="live-dot"></span>
                <span>Monitoreo en Tiempo Real</span>
              </div>
              <div className="stat-chip">
                <span>📊 Tasa FFTT Promedio: {stats.tasaFFTTPromedio}%</span>
              </div>
              <div className="stat-chip">
                <span>⚠️ Lotes Críticos: {stats.lotesCriticos}</span>
              </div>
            </div>
          </div>
          <div className="header-acciones">
            <button className="accion-btn premium" onClick={() => generarReporte('completo')}>
              <span className="btn-icon">📑</span>
              <span>Reporte Completo</span>
            </button>
            <button className="accion-btn premium" onClick={() => exportarDatos('Excel')}>
              <span className="btn-icon">📊</span>
              <span>Exportar Datos</span>
            </button>
            <button className="accion-btn premium" onClick={() => setVista('analisis')}>
              <span className="btn-icon">📈</span>
              <span>Análisis Detallado</span>
            </button>
            <button 
              className={`accion-btn premium ${vista === 'scanner' ? 'activo' : ''}`}
              onClick={() => setVista(vista === 'scanner' ? 'dashboard' : 'scanner')}
            >
              <span className="btn-icon">📷</span>
              <span>Escáner</span>
            </button>
          </div>
        </div>

        {/* KPIs 3D */}
        <div className="kpi-grid-3d">
          <div className="kpi-card-3d total-muestras">
            <div className="kpi-card-inner">
              <div className="kpi-front">
                <div className="kpi-icon">🧪</div>
                <div className="kpi-valor">{stats.totalMuestras.toLocaleString()}</div>
                <div className="kpi-etiqueta">Total Muestras</div>
              </div>
              <div className="kpi-back">
                <div className="kpi-detalle">+{Math.round(stats.totalMuestras * 0.05)} vs ayer</div>
              </div>
            </div>
          </div>

          <div className="kpi-card-3d aceptadas">
            <div className="kpi-card-inner">
              <div className="kpi-front">
                <div className="kpi-icon">✅</div>
                <div className="kpi-valor">{stats.totalAceptadas.toLocaleString()}</div>
                <div className="kpi-etiqueta">Muestras Aceptadas</div>
              </div>
              <div className="kpi-back">
                <div className="kpi-detalle">{Math.round((stats.totalAceptadas/stats.totalMuestras)*100)}% del total</div>
              </div>
            </div>
          </div>

          <div className="kpi-card-3d rechazadas">
            <div className="kpi-card-inner">
              <div className="kpi-front">
                <div className="kpi-icon">❌</div>
                <div className="kpi-valor">{stats.totalRechazadas.toLocaleString()}</div>
                <div className="kpi-etiqueta">Muestras Rechazadas</div>
              </div>
              <div className="kpi-back">
                <div className="kpi-detalle">{Math.round((stats.totalRechazadas/stats.totalMuestras)*100)}% del total</div>
              </div>
            </div>
          </div>

          <div className="kpi-card-3d tasa-fftt">
            <div className="kpi-card-inner">
              <div className="kpi-front">
                <div className="kpi-icon">📊</div>
                <div className="kpi-valor">{stats.tasaFFTTPromedio}%</div>
                <div className="kpi-etiqueta">Tasa FFTT Promedio</div>
              </div>
              <div className="kpi-back">
                <div className="kpi-detalle">
                  {stats.tendencia.diaria > 0 ? '↑' : '↓'} {Math.abs(stats.tendencia.diaria)}% vs ayer
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico de Pareto de Rechazos */}
        <div className="pareto-chart-container">
          <h3 className="chart-title">
            <span className="title-icon">📉</span>
            Análisis de Pareto - Causas de Rechazo
          </h3>
          <div className="pareto-grid">
            {Object.entries(stats.rechazosPorTipo)
              .sort(([,a], [,b]) => b - a)
              .map(([tipo, cantidad], index, array) => {
                const porcentaje = (cantidad / stats.totalRechazadas) * 100;
                const acumulado = array
                  .slice(0, index + 1)
                  .reduce((sum, [,val]) => sum + (val / stats.totalRechazadas) * 100, 0);
                
                return (
                  <div key={tipo} className="pareto-item">
                    <div className="pareto-label">
                      <span className={`tipo-icon tipo-${tipo}`}>
                        {tipo === 'tono' && '🎨'}
                        {tipo === 'textura' && '🪡'}
                        {tipo === 'color' && '🌈'}
                        {tipo === 'dimension' && '📏'}
                        {tipo === 'acabado' && '✨'}
                      </span>
                      <span className="tipo-nombre">{tipo.charAt(0).toUpperCase() + tipo.slice(1)}</span>
                      <span className="tipo-cantidad">{cantidad}</span>
                    </div>
                    <div className="pareto-barras">
                      <div className="barra-porcentaje">
                        <div 
                          className="barra-fill"
                          style={{
                            width: `${porcentaje}%`,
                            background: `linear-gradient(90deg, 
                              ${index === 0 ? '#ef4444' : 
                                index === 1 ? '#f59e0b' : 
                                index === 2 ? '#3b82f6' : '#10b981'} 0%, 
                              ${index === 0 ? '#dc2626' : 
                                index === 1 ? '#d97706' : 
                                index === 2 ? '#2563eb' : '#16a34a'} 100%)`
                          }}
                        >
                          <span className="barra-texto">{Math.round(porcentaje)}%</span>
                        </div>
                      </div>
                      <div className="barra-acumulada">
                        <div 
                          className="acumulada-fill"
                          style={{
                            width: `${acumulado}%`,
                            background: 'linear-gradient(90deg, #8b5cf6, #6366f1)'
                          }}
                        >
                          <span className="acumulada-texto">{Math.round(acumulado)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Panel de Escáner */}
      {vista === 'scanner' && (
        <div className="scanner-panel-3d">
          <div className="scanner-header">
            <h2>
              <span className="header-icon">📷</span>
              Escáner de Códigos y Lotes
            </h2>
            <div className="scanner-stats">
              <div className="stat-badge">
                <span>📊 Total Escaneos: {scannerStats.totalEscaneos}</span>
              </div>
              <div className="stat-badge">
                <span>📅 Hoy: {scannerStats.escaneosHoy}</span>
              </div>
              <div className="stat-badge">
                <span>📦 Lotes Únicos: {scannerStats.lotesUnicos}</span>
              </div>
            </div>
          </div>

          <div className="scanner-grid">
            {/* Panel de Escaneo Activo */}
            <div className="scanner-active-panel">
              <div className="panel-title">
                <h3>Escaneo Activo</h3>
                <div className="scanner-status">
                  {escanerActivo ? (
                    <span className="status-active">
                      <span className="pulse-dot"></span>
                      Escáner Activo
                    </span>
                  ) : (
                    <span className="status-inactive">
                      <span className="static-dot"></span>
                      Escáner Inactivo
                    </span>
                  )}
                </div>
              </div>

              <div className="scanner-display">
                <div className="code-display">
                  <label>Código Escaneado:</label>
                  <div className="code-box">
                    {scannerData.codigoEscaneado || (
                      <span className="placeholder">
                        {escanerActivo ? 'Esperando código...' : 'Activa el escáner'}
                      </span>
                    )}
                  </div>
                  {escanerActivo && codigoTemporal && (
                    <div className="typing-indicator">
                      Escribiendo: {codigoTemporal}
                    </div>
                  )}
                </div>

                <div className="scanner-controls">
                  {!escanerActivo ? (
                    <button className="btn-scan-start" onClick={handleIniciarEscaner}>
                      <span className="btn-icon">▶️</span>
                      Iniciar Escáner
                    </button>
                  ) : (
                    <button className="btn-scan-stop" onClick={handleDetenerEscaner}>
                      <span className="btn-icon">⏹️</span>
                      Detener Escáner
                    </button>
                  )}
                </div>
              </div>

              <div className="scanner-form">
                <h4>Asignar a Lote</h4>
                
                <div className="form-group">
                  <label>📦 Número de Lote:</label>
                  <input
                    type="text"
                    value={scannerData.numeroLote}
                    onChange={(e) => setScannerData({...scannerData, numeroLote: e.target.value})}
                    placeholder="Ej: L2401-001"
                    list="lotes-sugeridos"
                  />
                  <datalist id="lotes-sugeridos">
                    {lotes.map(lote => (
                      <option key={lote.id} value={lote.lote} />
                    ))}
                  </datalist>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>📅 Fecha:</label>
                    <input
                      type="date"
                      value={scannerData.fechaEscaneo}
                      onChange={(e) => setScannerData({...scannerData, fechaEscaneo: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label>⏰ Hora:</label>
                    <input
                      type="time"
                      value={scannerData.horaEscaneo}
                      onChange={(e) => setScannerData({...scannerData, horaEscaneo: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>🏷️ Tipo de Producto:</label>
                    <select
                      value={scannerData.tipoProducto}
                      onChange={(e) => setScannerData({...scannerData, tipoProducto: e.target.value})}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Baseball">Baseball</option>
                      <option value="Soccer">Soccer</option>
                      <option value="Basketball">Basketball</option>
                      <option value="Football">Football</option>
                      <option value="Tennis">Tennis</option>
                      <option value="Volleyball">Volleyball</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>👤 Operador:</label>
                    <input
                      type="text"
                      value={scannerData.operador}
                      onChange={(e) => setScannerData({...scannerData, operador: e.target.value})}
                      placeholder="Nombre del operador"
                    />
                  </div>
                </div>

                <div className="scanner-form-actions">
                  <button className="btn-guardar" onClick={handleGuardarEscaneo}>
                    💾 Guardar Escaneo
                  </button>
                  <button className="btn-limpiar" onClick={handleLimpiarEscaneo}>
                    🧹 Limpiar
                  </button>
                </div>
              </div>
            </div>

            {/* Historial de Escaneos */}
            <div className="scanner-history-panel">
              <div className="panel-title">
                <h3>Historial de Escaneos</h3>
                <button className="btn-export" onClick={handleExportarEscaneos}>
                  📥 Exportar
                </button>
              </div>

              <div className="history-list">
                {historialEscaneos.length === 0 ? (
                  <div className="empty-history">
                    <span className="empty-icon">📭</span>
                    <p>No hay escaneos registrados</p>
                    <small>Los códigos escaneados aparecerán aquí</small>
                  </div>
                ) : (
                  historialEscaneos.map((escaneo, index) => (
                    <div key={escaneo.id} className="history-item" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="history-item-header">
                        <span className="item-time">{escaneo.horaEscaneo}</span>
                        <span className="item-date">{escaneo.fechaEscaneo}</span>
                        <button 
                          className="item-delete"
                          onClick={() => handleEliminarEscaneo(escaneo.id)}
                          title="Eliminar"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="history-item-content">
                        <div className="code-info">
                          <span className="info-label">Código:</span>
                          <span className="code-value">{escaneo.codigoEscaneado}</span>
                        </div>
                        <div className="lote-info">
                          <span className="info-label">Lote:</span>
                          <span className="lote-value">{escaneo.numeroLote || 'No asignado'}</span>
                        </div>
                        {escaneo.tipoProducto && (
                          <div className="producto-info">
                            <span className="info-label">Producto:</span>
                            <span>{escaneo.tipoProducto}</span>
                          </div>
                        )}
                        {escaneo.operador && (
                          <div className="operador-info">
                            <span className="info-label">Operador:</span>
                            <span>{escaneo.operador}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Panel de Instrucciones */}
          <div className="scanner-instructions">
            <div className="instruction-item">
              <span className="instruction-icon">1️⃣</span>
              <div className="instruction-text">
                <strong>Activa el escáner</strong>
                <p>Haz clic en "Iniciar Escáner" para comenzar a leer códigos</p>
              </div>
            </div>
            <div className="instruction-item">
              <span className="instruction-icon">2️⃣</span>
              <div className="instruction-text">
                <strong>Escanea el código</strong>
                <p>Usa tu escáner de código de barras o escribe manualmente</p>
              </div>
            </div>
            <div className="instruction-item">
              <span className="instruction-icon">3️⃣</span>
              <div className="instruction-text">
                <strong>Asigna el lote</strong>
                <p>Selecciona o escribe el número de lote correspondiente</p>
              </div>
            </div>
            <div className="instruction-item">
              <span className="instruction-icon">4️⃣</span>
              <div className="instruction-text">
                <strong>Guarda el registro</strong>
                <p>Confirma la información y guarda el escaneo</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Panel de Filtros 3D (solo visible si no está en modo scanner) */}
      {vista !== 'scanner' && (
        <>
          <div className="fftt-filtros-panel">
            <div className="filtros-header">
              <h3>🔍 Filtros Inteligentes</h3>
              <button className="reset-filtros" onClick={() => setFiltros({
                fecha: 'todas',
                tipoRechazo: 'todos',
                sport: 'todos',
                turno: 'todos',
                gravedad: 'todos',
                busqueda: ''
              })}>
                <span className="reset-icon">🔄</span>
                Limpiar Filtros
              </button>
            </div>

            <div className="filtros-grid-3d">
              <div className="filtro-item-3d">
                <label>Tipo de Rechazo</label>
                <select 
                  value={filtros.tipoRechazo}
                  onChange={(e) => setFiltros({...filtros, tipoRechazo: e.target.value})}
                  className="filtro-select-3d"
                >
                  {tiposRechazo.map(t => (
                    <option key={t} value={t}>
                      {t === 'todos' ? 'Todos los tipos' : t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filtro-item-3d">
                <label>Sport</label>
                <select 
                  value={filtros.sport}
                  onChange={(e) => setFiltros({...filtros, sport: e.target.value})}
                  className="filtro-select-3d"
                >
                  {sports.map(s => (
                    <option key={s} value={s}>
                      {s === 'todos' ? 'Todos los sports' : s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filtro-item-3d">
                <label>Turno</label>
                <select 
                  value={filtros.turno}
                  onChange={(e) => setFiltros({...filtros, turno: e.target.value})}
                  className="filtro-select-3d"
                >
                  {turnos.map(t => (
                    <option key={t} value={t}>
                      {t === 'todos' ? 'Todos los turnos' : `Turno ${t}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filtro-item-3d">
                <label>Gravedad</label>
                <select 
                  value={filtros.gravedad}
                  onChange={(e) => setFiltros({...filtros, gravedad: e.target.value})}
                  className="filtro-select-3d"
                >
                  {gravedades.map(g => (
                    <option key={g} value={g}>
                      {g === 'todos' ? 'Todas las gravedades' : g.charAt(0).toUpperCase() + g.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="busqueda-3d-container">
              <input
                type="text"
                placeholder="🔎 Buscar por lote, PO u operador..."
                value={filtros.busqueda}
                onChange={(e) => setFiltros({...filtros, busqueda: e.target.value})}
                className="busqueda-input-3d"
              />
              {filtros.busqueda && (
                <button className="clear-busqueda" onClick={() => setFiltros({...filtros, busqueda: ''})}>
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Tabla de Lotes Premium */}
          <div className="lotes-table-container">
            <div className="table-header-actions">
              <div className="selection-info">
                {loteSeleccionados.length > 0 && (
                  <span className="selection-badge">
                    {loteSeleccionados.length} lotes seleccionados
                  </span>
                )}
              </div>
              <div className="table-actions">
                <button 
                  className={`action-btn-3d ${loteSeleccionados.length > 0 ? 'active' : ''}`}
                  onClick={() => setLoteEditMode(true)}
                  disabled={loteSeleccionados.length === 0}
                >
                  <span className="btn-icon">📝</span>
                  <span>Editar Lote ({loteSeleccionados.length})</span>
                </button>
                <button className="action-btn-3d" onClick={() => exportarDatos('CSV')}>
                  <span className="btn-icon">📥</span>
                  <span>Exportar</span>
                </button>
              </div>
            </div>

            <div className="table-wrapper-3d">
              <table className="lotes-table-premium">
                <thead>
                  <tr>
                    <th className="select-col">
                      <input
                        type="checkbox"
                        checked={loteSeleccionados.length === lotesFiltrados.length && lotesFiltrados.length > 0}
                        onChange={toggleSeleccionTodos}
                        className="select-checkbox-3d"
                      />
                    </th>
                    <th>Lote</th>
                    <th>PO</th>
                    <th>Sport</th>
                    <th>Fecha</th>
                    <th>Turno</th>
                    <th>Total</th>
                    <th>Aceptadas</th>
                    <th>Rechazadas</th>
                    <th>Tasa FFTT</th>
                    <th>Análisis de Rechazos</th>
                    <th>Gravedad</th>
                    <th>Operador</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {lotesFiltrados.map((lote, index) => (
                    <tr 
                      key={lote.id} 
                      className={`table-row-3d ${loteSeleccionados.includes(lote.id) ? 'selected' : ''} ${lote.gravedad}`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td className="select-col">
                        <input
                          type="checkbox"
                          checked={loteSeleccionados.includes(lote.id)}
                          onChange={() => toggleSeleccionLote(lote.id)}
                          className="select-checkbox-3d"
                        />
                      </td>
                      <td className="lote-cell">{lote.lote}</td>
                      <td className="po-cell">{lote.po}</td>
                      <td>
                        <span className="sport-badge">{lote.sport}</span>
                      </td>
                      <td>{lote.fecha}</td>
                      <td>
                        <span className={`turno-badge turno-${lote.turno}`}>
                          {lote.turno}
                        </span>
                      </td>
                      <td className="numero-cell">{lote.totalMuestras}</td>
                      <td className="numero-cell aceptadas">{lote.aceptadas}</td>
                      <td className="numero-cell rechazadas">{lote.rechazadas}</td>
                      <td>
                        <div className="tasa-fftt-cell">
                          <div className="tasa-bar">
                            <div 
                              className="tasa-fill"
                              style={{
                                width: `${lote.tasaFFTT}%`,
                                backgroundColor: getTasaFFTTColor(lote.tasaFFTT)
                              }}
                            ></div>
                          </div>
                          <span className="tasa-valor">{lote.tasaFFTT}%</span>
                        </div>
                      </td>
                      <td>
                        <div className="rechazos-mini">
                          {Object.entries(lote.tipoRechazo).map(([tipo, cantidad]) => (
                            cantidad > 0 && (
                              <div key={tipo} className="rechazo-chip" title={`${tipo}: ${cantidad}`}>
                                {tipo === 'tono' && '🎨'}
                                {tipo === 'textura' && '🪡'}
                                {tipo === 'color' && '🌈'}
                                {tipo === 'dimension' && '📏'}
                                {tipo === 'acabado' && '✨'}
                                <span className="rechazo-cantidad">{cantidad}</span>
                              </div>
                            )
                          ))}
                        </div>
                      </td>
                      <td>
                        <span 
                          className={`gravedad-badge gravedad-${lote.gravedad}`}
                          style={{ backgroundColor: getGravedadColor(lote.gravedad) }}
                        >
                          {getGravedadIcon(lote.gravedad)} {lote.gravedad}
                        </span>
                      </td>
                      <td>{lote.operador}</td>
                      <td>
                        <div className="acciones-3d">
                          <button 
                            className="accion-3d ver" 
                            onClick={() => handleVerDetalle(lote)}
                            title="Ver detalle"
                          >
                            👁️
                          </button>
                          <button 
                            className="accion-3d inspeccionar" 
                            onClick={() => handleInspeccionar(lote)}
                            title="Inspeccionar muestras"
                          >
                            🔬
                          </button>
                          <button 
                            className="accion-3d editar" 
                            onClick={() => handleEditar(lote)}
                            title="Editar"
                          >
                            ✏️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Resumen de la tabla */}
            <div className="table-footer-3d">
              <div className="footer-info">
                <span className="info-item">📊 Mostrando {lotesFiltrados.length} de {lotes.length} lotes</span>
                <span className="info-item">✅ Tasa FFTT Promedio: {stats.tasaFFTTPromedio}%</span>
                <span className="info-item">❌ Total Rechazos: {stats.totalRechazadas}</span>
              </div>
              <div className="footer-pagination">
                <button className="pagination-btn">←</button>
                <button className="pagination-btn active">1</button>
                <button className="pagination-btn">2</button>
                <button className="pagination-btn">3</button>
                <button className="pagination-btn">→</button>
              </div>
            </div>
          </div>

          {/* Panel de Análisis Predictivo */}
          <div className="predictive-analytics-panel">
            <h3 className="panel-title">
              <span className="title-icon">🤖</span>
              Análisis Predictivo y Recomendaciones
            </h3>
            
            <div className="predictive-grid">
              <div className="predictive-card warning">
                <div className="card-header">
                  <span className="card-icon">⚠️</span>
                  <h4>Alertas de Calidad</h4>
                </div>
                <div className="card-content">
                  <div className="alerta-item critica">
                    <span className="alerta-indicador"></span>
                    <span className="alerta-texto">Lote L2404-004: Tasa de rechazo crítica (10%)</span>
                    <button className="alerta-accion">Ver</button>
                  </div>
                  <div className="alerta-item alta">
                    <span className="alerta-indicador"></span>
                    <span className="alerta-texto">Tendencia ascendente en rechazos por tono</span>
                    <button className="alerta-accion">Analizar</button>
                  </div>
                  <div className="alerta-item media">
                    <span className="alerta-indicador"></span>
                    <span className="alerta-texto">Turno B muestra 15% más rechazos</span>
                    <button className="alerta-accion">Comparar</button>
                  </div>
                </div>
              </div>

              <div className="predictive-card trend">
                <div className="card-header">
                  <span className="card-icon">📈</span>
                  <h4>Predicción de Tendencias</h4>
                </div>
                <div className="card-content">
                  <div className="trend-item">
                    <span className="trend-label">Próxima semana</span>
                    <div className="trend-bar">
                      <div className="trend-fill" style={{width: '75%'}}>
                        <span className="trend-value">-2.3%</span>
                      </div>
                    </div>
                  </div>
                  <div className="trend-item">
                    <span className="trend-label">Próximo mes</span>
                    <div className="trend-bar">
                      <div className="trend-fill" style={{width: '45%'}}>
                        <span className="trend-value">-5.1%</span>
                      </div>
                    </div>
                  </div>
                  <div className="trend-item">
                    <span className="trend-label">Trimestre</span>
                    <div className="trend-bar">
                      <div className="trend-fill" style={{width: '30%'}}>
                        <span className="trend-value">-8.7%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="predictive-card recommendation">
                <div className="card-header">
                  <span className="card-icon">💡</span>
                  <h4>Recomendaciones</h4>
                </div>
                <div className="card-content">
                  <ul className="recomendaciones-lista">
                    <li className="recomendacion-item">
                      <span className="item-bullet">1</span>
                      <span className="item-text">Revisar parámetros de tono en máquina 88</span>
                    </li>
                    <li className="recomendacion-item">
                      <span className="item-bullet">2</span>
                      <span className="item-text">Capacitación para operadores del Turno B</span>
                    </li>
                    <li className="recomendacion-item">
                      <span className="item-bullet">3</span>
                      <span className="item-text">Ajustar calibración de color en Baseball</span>
                    </li>
                    <li className="recomendacion-item">
                      <span className="item-bullet">4</span>
                      <span className="item-text">Implementar doble inspección para lotes críticos</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal de Detalle */}
      {showModal && selectedLote && (
        <div className="modal-overlay-3d" onClick={() => setShowModal(false)}>
          <div className="modal-content-3d" onClick={e => e.stopPropagation()}>
            <button className="modal-close-3d" onClick={() => setShowModal(false)}>✕</button>
            
            {modalType === 'detalle' && (
              <div className="detalle-lote-modal">
                <h2 className="modal-titulo">
                  <span className="titulo-icon">🔍</span>
                  Detalle de Lote {selectedLote.lote}
                </h2>

                <div className="detalle-grid-3d">
                  <div className="detalle-seccion info-general">
                    <h4>Información General</h4>
                    <div className="info-grid">
                      <div className="info-row">
                        <span className="info-label">PO:</span>
                        <span className="info-valor">{selectedLote.po}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Sport:</span>
                        <span className="info-valor">{selectedLote.sport}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Fecha:</span>
                        <span className="info-valor">{selectedLote.fecha}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Turno:</span>
                        <span className={`turno-badge turno-${selectedLote.turno}`}>
                          {selectedLote.turno}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="detalle-seccion metricas-calidad">
                    <h4>Métricas de Calidad</h4>
                    <div className="metricas-grid">
                      <div className="metrica-card">
                        <span className="metrica-valor">{selectedLote.totalMuestras}</span>
                        <span className="metrica-label">Total Muestras</span>
                      </div>
                      <div className="metrica-card">
                        <span className="metrica-valor aceptadas">{selectedLote.aceptadas}</span>
                        <span className="metrica-label">Aceptadas</span>
                      </div>
                      <div className="metrica-card">
                        <span className="metrica-valor rechazadas">{selectedLote.rechazadas}</span>
                        <span className="metrica-label">Rechazadas</span>
                      </div>
                      <div className="metrica-card">
                        <span className="metrica-valor" style={{color: getTasaFFTTColor(selectedLote.tasaFFTT)}}>
                          {selectedLote.tasaFFTT}%
                        </span>
                        <span className="metrica-label">Tasa FFTT</span>
                      </div>
                    </div>
                  </div>

                  <div className="detalle-seccion analisis-rechazos">
                    <h4>Análisis de Rechazos</h4>
                    <div className="rechazos-detalle">
                      {Object.entries(selectedLote.tipoRechazo).map(([tipo, cantidad]) => (
                        <div key={tipo} className="rechazo-tipo-item">
                          <div className="tipo-header">
                            <span className="tipo-icon">
                              {tipo === 'tono' && '🎨'}
                              {tipo === 'textura' && '🪡'}
                              {tipo === 'color' && '🌈'}
                              {tipo === 'dimension' && '📏'}
                              {tipo === 'acabado' && '✨'}
                            </span>
                            <span className="tipo-nombre">{tipo}</span>
                            <span className="tipo-cantidad">{cantidad}</span>
                          </div>
                          <div className="tipo-barra">
                            <div 
                              className="tipo-barra-fill"
                              style={{
                                width: `${(cantidad / selectedLote.rechazadas) * 100}%`,
                                background: `linear-gradient(90deg, 
                                  ${tipo === 'tono' ? '#ef4444' : 
                                    tipo === 'textura' ? '#f59e0b' : 
                                    tipo === 'color' ? '#3b82f6' : 
                                    tipo === 'dimension' ? '#10b981' : '#8b5cf6'} 0%, 
                                  ${tipo === 'tono' ? '#dc2626' : 
                                    tipo === 'textura' ? '#d97706' : 
                                    tipo === 'color' ? '#2563eb' : 
                                    tipo === 'dimension' ? '#16a34a' : '#7c3aed'} 100%)`
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="detalle-seccion personal">
                    <h4>Personal Responsable</h4>
                    <div className="personal-info">
                      <div className="personal-item">
                        <span className="personal-rol">Operador:</span>
                        <span className="personal-nombre">{selectedLote.operador}</span>
                      </div>
                      <div className="personal-item">
                        <span className="personal-rol">Inspector:</span>
                        <span className="personal-nombre">{selectedLote.inspector}</span>
                      </div>
                    </div>
                  </div>

                  <div className="detalle-seccion observaciones">
                    <h4>Observaciones</h4>
                    <p className="observaciones-texto">{selectedLote.observaciones}</p>
                  </div>

                  <div className="detalle-seccion gravedad">
                    <h4>Nivel de Gravedad</h4>
                    <span 
                      className={`gravedad-badge-large gravedad-${selectedLote.gravedad}`}
                      style={{ backgroundColor: getGravedadColor(selectedLote.gravedad) }}
                    >
                      {getGravedadIcon(selectedLote.gravedad)} {selectedLote.gravedad.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="modal-acciones">
                  <button className="btn-inspeccionar" onClick={() => handleInspeccionar(selectedLote)}>
                    🔬 Inspeccionar Muestras
                  </button>
                  <button className="btn-editar" onClick={() => handleEditar(selectedLote)}>
                    ✏️ Editar Lote
                  </button>
                  <button className="btn-cerrar" onClick={() => setShowModal(false)}>
                    Cerrar
                  </button>
                </div>
              </div>
            )}

            {modalType === 'inspeccion' && (
              <div className="inspeccion-modal">
                <h2 className="modal-titulo">
                  <span className="titulo-icon">🔬</span>
                  Inspección Detallada - Lote {selectedLote.lote}
                </h2>

                <div className="inspeccion-grid">
                  <div className="inspeccion-visualizador">
                    <div className="muestra-visualizador">
                      <div className="muestra-3d">
                        <div className="muestra-cara frontal">
                          <span className="muestra-id">M-001</span>
                        </div>
                        <div className="muestra-cara superior"></div>
                        <div className="muestra-cara inferior"></div>
                        <div className="muestra-cara lateral"></div>
                      </div>
                      <div className="muestra-controles">
                        <button className="control-3d">↺</button>
                        <button className="control-3d">↻</button>
                        <button className="control-3d">🔍+</button>
                        <button className="control-3d">🔍-</button>
                      </div>
                    </div>

                    <div className="muestra-info">
                      <h4>Muestra Actual</h4>
                      <div className="muestra-detalle">
                        <p><strong>ID:</strong> M-001</p>
                        <p><strong>Tipo:</strong> Tono</p>
                        <p><strong>Desviación:</strong> +2.3%</p>
                        <p><strong>Inspector:</strong> {selectedLote.inspector}</p>
                      </div>
                    </div>
                  </div>

                  <div className="inspeccion-lista">
                    <h4>Lista de Muestras</h4>
                    <div className="muestras-lista">
                      {[...Array(10)].map((_, i) => (
                        <div key={i} className="muestra-item">
                          <span className="muestra-indice">M-{String(i + 1).padStart(3, '0')}</span>
                          <span className="muestra-estado">✅ Aceptada</span>
                          <button className="muestra-ver">Ver</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="inspeccion-acciones">
                  <button className="btn-guardar">💾 Guardar Inspección</button>
                  <button className="btn-cancelar" onClick={() => setShowModal(false)}>Cancelar</button>
                </div>
              </div>
            )}

            {modalType === 'editar' && (
              <div className="editar-lote-modal">
                <h2 className="modal-titulo">
                  <span className="titulo-icon">✏️</span>
                  Editar Lote {selectedLote.lote}
                </h2>

                <form className="editar-form-3d" onSubmit={handleGuardarCambios}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Lote</label>
                      <input type="text" defaultValue={selectedLote.lote} />
                    </div>

                    <div className="form-group">
                      <label>PO</label>
                      <input type="text" defaultValue={selectedLote.po} />
                    </div>

                    <div className="form-group">
                      <label>Sport</label>
                      <select defaultValue={selectedLote.sport}>
                        <option value="Baseball">Baseball</option>
                        <option value="Soccer">Soccer</option>
                        <option value="Basketball">Basketball</option>
                        <option value="Football">Football</option>
                        <option value="Tennis">Tennis</option>
                        <option value="Volleyball">Volleyball</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Turno</label>
                      <select defaultValue={selectedLote.turno}>
                        <option value="A">Turno A</option>
                        <option value="B">Turno B</option>
                        <option value="C">Turno C</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Total Muestras</label>
                      <input type="number" defaultValue={selectedLote.totalMuestras} />
                    </div>

                    <div className="form-group">
                      <label>Aceptadas</label>
                      <input type="number" defaultValue={selectedLote.aceptadas} />
                    </div>

                    <div className="form-group">
                      <label>Rechazadas</label>
                      <input type="number" defaultValue={selectedLote.rechazadas} />
                    </div>

                    <div className="form-group">
                      <label>Gravedad</label>
                      <select defaultValue={selectedLote.gravedad}>
                        <option value="baja">Baja</option>
                        <option value="media">Media</option>
                        <option value="alta">Alta</option>
                        <option value="critica">Crítica</option>
                      </select>
                    </div>

                    <div className="form-group full-width">
                      <label>Observaciones</label>
                      <textarea 
                        rows="4" 
                        defaultValue={selectedLote.observaciones}
                        placeholder="Agregar observaciones..."
                      ></textarea>
                    </div>

                    <div className="form-group full-width">
                      <label>Desglose de Rechazos</label>
                      <div className="rechazos-input-grid">
                        <div className="rechazo-input">
                          <label>🎨 Tono</label>
                          <input type="number" defaultValue={selectedLote.tipoRechazo.tono} />
                        </div>
                        <div className="rechazo-input">
                          <label>🪡 Textura</label>
                          <input type="number" defaultValue={selectedLote.tipoRechazo.textura} />
                        </div>
                        <div className="rechazo-input">
                          <label>🌈 Color</label>
                          <input type="number" defaultValue={selectedLote.tipoRechazo.color} />
                        </div>
                        <div className="rechazo-input">
                          <label>📏 Dimensión</label>
                          <input type="number" defaultValue={selectedLote.tipoRechazo.dimension} />
                        </div>
                        <div className="rechazo-input">
                          <label>✨ Acabado</label>
                          <input type="number" defaultValue={selectedLote.tipoRechazo.acabado} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-guardar-3d">
                      💾 Guardar Cambios
                    </button>
                    <button type="button" className="btn-cancelar-3d" onClick={() => setShowModal(false)}>
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Panel de Edición por Lote */}
      {loteEditMode && (
        <div className="lote-edit-panel-3d">
          <div className="panel-header">
            <h3>
              <span className="header-icon">📝</span>
              Edición por Lote ({loteSeleccionados.length} seleccionados)
            </h3>
            <button className="close-btn" onClick={() => setLoteEditMode(false)}>✕</button>
          </div>

          <div className="panel-body">
            <div className="edit-field">
              <label>Campo a modificar:</label>
              <select 
                value={loteEditField}
                onChange={(e) => setLoteEditField(e.target.value)}
                className="edit-select"
              >
                <option value="">Seleccionar campo...</option>
                <option value="turno">Turno</option>
                <option value="gravedad">Gravedad</option>
                <option value="inspector">Inspector</option>
                <option value="observaciones">Observaciones</option>
              </select>
            </div>

            {loteEditField && (
              <div className="edit-value">
                <label>Nuevo valor:</label>
                {loteEditField === 'turno' ? (
                  <select 
                    value={loteEditValue}
                    onChange={(e) => setLoteEditValue(e.target.value)}
                    className="edit-select"
                  >
                    <option value="">Seleccionar turno...</option>
                    <option value="A">Turno A</option>
                    <option value="B">Turno B</option>
                    <option value="C">Turno C</option>
                  </select>
                ) : loteEditField === 'gravedad' ? (
                  <select 
                    value={loteEditValue}
                    onChange={(e) => setLoteEditValue(e.target.value)}
                    className="edit-select"
                  >
                    <option value="">Seleccionar gravedad...</option>
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="critica">Crítica</option>
                  </select>
                ) : loteEditField === 'observaciones' ? (
                  <textarea
                    value={loteEditValue}
                    onChange={(e) => setLoteEditValue(e.target.value)}
                    placeholder="Nuevas observaciones..."
                    rows="4"
                    className="edit-textarea"
                  />
                ) : (
                  <input
                    type="text"
                    value={loteEditValue}
                    onChange={(e) => setLoteEditValue(e.target.value)}
                    placeholder={`Nuevo valor para ${loteEditField}`}
                    className="edit-input"
                  />
                )}
              </div>
            )}

            <div className="edit-actions">
              <button 
                className="apply-btn"
                onClick={aplicarEdicionLote}
                disabled={!loteEditField || !loteEditValue}
              >
                Aplicar a {loteSeleccionados.length} lotes
              </button>
              <button className="cancel-btn" onClick={() => setLoteEditMode(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FFTTquality;