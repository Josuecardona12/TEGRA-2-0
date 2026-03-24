import React, { useState, useEffect, useRef } from 'react';
import './ReporteRH.css';
import { useProduccion } from '../context/ProduccionContext';

// ============================================
// CONFIGURACIÓN WEBSOCKET PARA TIEMPO REAL
// ============================================
const WS_URL = 'https://miniature-adventure-v6q4r64gqq7qfr67-8080.app.github.dev/';

const ReporteRH = () => {
  // ================ ESTADOS DE CONEXIÓN ================
  const [conectado, setConectado] = useState(false);
  const [usandoServidor, setUsandoServidor] = useState(false);
  const [ultimoMovimiento, setUltimoMovimiento] = useState(null);
  const wsRef = useRef(null);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [vista, setVista] = useState('tabla'); // tabla, tarjetas, graficos, analisis, escaner
  const [periodo, setPeriodo] = useState('semana');
  const [filtros, setFiltros] = useState({
    semana: 'todas',
    status: 'todos',
    sport: 'todos',
    turno: 'todos',
    busqueda: ''
  });

  // NUEVO: Estado para escáner mejorado
  const [codigoEscaneado, setCodigoEscaneado] = useState('');
  const [loteActual, setLoteActual] = useState(null);
  const [colaEspera, setColaEspera] = useState([]);
  const [historialSalidas, setHistorialSalidas] = useState([]);
  const [modoEscaneo, setModoEscaneo] = useState('entrada'); // entrada, salida

  // Estado para edición por lote
  const [loteEditMode, setLoteEditMode] = useState(false);
  const [loteSeleccionados, setLoteSeleccionados] = useState([]);
  const [loteEditField, setLoteEditField] = useState('');
  const [loteEditValue, setLoteEditValue] = useState('');
  const [notasLote, setNotasLote] = useState({});

  // Estado para notificaciones
  const [notificacion, setNotificacion] = useState({ mostrar: false, mensaje: '', tipo: '' });

  // ================ CONEXIÓN WEBSOCKET ================
  useEffect(() => {
    console.log('🔌 ReporteRH conectando...');
    
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    
    ws.onopen = () => {
      console.log('✅ ReporteRH conectado');
      setConectado(true);
      setUsandoServidor(true);
      mostrarNotificacion('✅ Conectado al servidor - Tiempo Real', 'exito');
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📦 ReporteRH recibió:', data.type);
        
        if (data.type === 'INIT' || data.type === 'ACTUALIZACION') {
          const lotesData = data.data.lotes || [];
          
          if (data.data.ultimoMovimiento) {
            setUltimoMovimiento(data.data.ultimoMovimiento);
            mostrarNotificacion(`🔄 ${data.data.ultimoMovimiento.loteId} → ${data.data.ultimoMovimiento.area}`, 'info');
          }
          
          if (lotesData.length > 0) {
            // Aquí podríamos actualizar los reportes con datos del servidor si es necesario
            console.log(`📊 ${lotesData.length} lotes en el sistema`);
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
      mostrarNotificacion('❌ Usando modo local - Demo', 'info');
    };
    
    ws.onclose = () => {
      console.log('❌ ReporteRH desconectado');
      setConectado(false);
      setUsandoServidor(false);
    };
    
    return () => ws.close();
  }, []);

  // ================ ENVIAR AL SERVIDOR ================
  const enviarAlServidor = (tipo, payload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: tipo, payload }));
    }
  };

  // Estado para inventarios
  const [inventarios, setInventarios] = useState({
    totalInicial: 1250,
    producido: 0,
    enviado: 0,
    enProceso: 0,
    pendiente: 0,
    porSport: {
      Baseball: { inicial: 450, producido: 0, enviado: 0 },
      Soccer: { inicial: 200, producido: 0, enviado: 0 },
      Basketball: { inicial: 180, producido: 0, enviado: 0 },
      Football: { inicial: 150, producido: 0, enviado: 0 },
      Tennis: { inicial: 120, producido: 0, enviado: 0 },
      Volleyball: { inicial: 150, producido: 0, enviado: 0 }
    }
  });

  const [reportes, setReportes] = useState([
    { id: 1, po: 'V108707', sport: 'Baseball', week: 7, pc: 15, sublimado: '11/26', maquina: 88, turno: 'A', status: 'OK', operador: 'Carlos López', horas: 6.5, eficiencia: 92, escaneado: false },
    { id: 2, po: 'V109133', sport: 'Baseball', week: 8, pc: 4, sublimado: '11/26', maquina: 88, turno: 'B', status: 'OK', operador: 'María González', horas: 4, eficiencia: 88, escaneado: false },
    { id: 3, po: 'V108994', sport: 'Baseball', week: 2, pc: 10, sublimado: '11/27', maquina: 18, turno: 'A', status: 'OK', operador: 'Pedro Ramírez', horas: 5, eficiencia: 95, escaneado: false },
    { id: 4, po: 'V109217', sport: 'Baseball', week: 4, pc: 20, sublimado: '12/2', maquina: 88, turno: 'B', status: 'OK', operador: 'Ana Martínez', horas: 7, eficiencia: 89, escaneado: false },
    { id: 5, po: 'V108251', sport: 'Baseball', week: 8, pc: 50, sublimado: '12/3', maquina: '3A', turno: 'A', status: 'RH', operador: 'Roberto Díaz', horas: 8, eficiencia: 76, escaneado: false },
    { id: 6, po: 'V109459', sport: 'Baseball', week: 2, pc: 10, sublimado: '12/4', maquina: '5A', turno: 'A', status: 'OK', operador: 'Laura Torres', horas: 5.5, eficiencia: 94, escaneado: false },
  ]);

  const [selectedReporte, setSelectedReporte] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');

  // Estado para el formulario de edición
  const [editFormData, setEditFormData] = useState({
    status: '',
    operador: '',
    horas: '',
    eficiencia: '',
    nota: ''
  });

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

  // Efecto para auto-ocultar notificaciones
  useEffect(() => {
    if (notificacion.mostrar) {
      const timer = setTimeout(() => {
        setNotificacion({ mostrar: false, mensaje: '', tipo: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notificacion]);

  // Efecto para actualizar inventarios
  useEffect(() => {
    const nuevosInventarios = { ...inventarios };
    
    Object.keys(nuevosInventarios.porSport).forEach(sport => {
      nuevosInventarios.porSport[sport].producido = 0;
      nuevosInventarios.porSport[sport].enviado = 0;
    });

    reportes.forEach(reporte => {
      if (nuevosInventarios.porSport[reporte.sport]) {
        if (reporte.status === 'OK' || reporte.status === 'Enviado') {
          nuevosInventarios.porSport[reporte.sport].enviado += reporte.pc;
        } else if (reporte.status === 'RH' || reporte.status === 'Pendiente' || reporte.status === 'Revisión') {
          nuevosInventarios.porSport[reporte.sport].producido += reporte.pc;
        }
      }
    });

    nuevosInventarios.producido = Object.values(nuevosInventarios.porSport).reduce((sum, sport) => sum + sport.producido, 0);
    nuevosInventarios.enviado = Object.values(nuevosInventarios.porSport).reduce((sum, sport) => sum + sport.enviado, 0);
    nuevosInventarios.enProceso = nuevosInventarios.producido - nuevosInventarios.enviado;
    nuevosInventarios.pendiente = nuevosInventarios.totalInicial - nuevosInventarios.producido;

    setInventarios(nuevosInventarios);
  }, [reportes]);

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

  const mostrarNotificacion = (mensaje, tipo) => {
    setNotificacion({
      mostrar: true,
      mensaje,
      tipo
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
    setEditFormData({
      status: reporte.status,
      operador: reporte.operador,
      horas: reporte.horas,
      eficiencia: reporte.eficiencia,
      nota: notasLote[reporte.id] || ''
    });
    setModalType('editar');
    setShowModal(true);
  };

  const handleGuardarCambios = (e) => {
    e.preventDefault();
    
    setReportes(prev => prev.map(r => 
      r.id === selectedReporte.id 
        ? { 
            ...r, 
            status: editFormData.status,
            operador: editFormData.operador,
            horas: parseFloat(editFormData.horas),
            eficiencia: parseInt(editFormData.eficiencia)
          } 
        : r
    ));

    if (editFormData.nota) {
      setNotasLote(prev => ({
        ...prev,
        [selectedReporte.id]: editFormData.nota
      }));
    }

    // Enviar al servidor
    enviarAlServidor('ACTUALIZACION_REPORTE', {
      id: selectedReporte.id,
      po: selectedReporte.po,
      cambios: editFormData
    });

    setNotificacion({
      mostrar: true,
      mensaje: '✅ Cambios guardados exitosamente',
      tipo: 'exito'
    });

    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCambiarStatus = (id, nuevoStatus) => {
    setReportes(prev => prev.map(r => 
      r.id === id ? { ...r, status: nuevoStatus } : r
    ));

    // Enviar al servidor
    enviarAlServidor('CAMBIO_STATUS', {
      id,
      nuevoStatus
    });

    setNotificacion({
      mostrar: true,
      mensaje: `🔄 Status actualizado a ${nuevoStatus}`,
      tipo: 'info'
    });
  };

  // NUEVA FUNCIÓN: Escanear código
  const handleEscanearCodigo = (codigo) => {
    // Buscar el lote en los reportes
    const loteEncontrado = reportes.find(r => r.po === codigo);
    
    if (loteEncontrado) {
      // Verificar si ya está en cola de espera
      const existeEnCola = colaEspera.some(item => item.po === codigo);
      
      if (!existeEnCola && modoEscaneo === 'entrada') {
        // Agregar a cola de espera
        setColaEspera(prev => [...prev, { ...loteEncontrado, horaEntrada: new Date().toISOString() }]);
        setLoteActual(loteEncontrado);
        
        // Enviar al servidor
        enviarAlServidor('ESCANEO_ENTRADA', {
          po: codigo,
          timestamp: new Date().toISOString()
        });
        
        setNotificacion({
          mostrar: true,
          mensaje: `📦 Lote ${codigo} agregado a cola de espera`,
          tipo: 'exito'
        });
      } else if (modoEscaneo === 'salida') {
        // Modo salida - buscar en cola de espera
        const loteEnCola = colaEspera.find(item => item.po === codigo);
        
        if (loteEnCola) {
          // Registrar salida
          const nuevaSalida = {
            ...loteEnCola,
            horaSalida: new Date().toISOString(),
            tiempoEspera: calcularTiempoEspera(loteEnCola.horaEntrada)
          };
          
          setHistorialSalidas(prev => [nuevaSalida, ...prev]);
          setColaEspera(prev => prev.filter(item => item.po !== codigo));
          setLoteActual(null);
          
          // Enviar al servidor
          enviarAlServidor('ESCANEO_SALIDA', {
            po: codigo,
            timestamp: new Date().toISOString(),
            tiempoEspera: nuevaSalida.tiempoEspera
          });
          
          setNotificacion({
            mostrar: true,
            mensaje: `🚚 Lote ${codigo} marcado como salida`,
            tipo: 'exito'
          });
        } else {
          setNotificacion({
            mostrar: true,
            mensaje: `❌ Lote ${codigo} no está en cola de espera`,
            tipo: 'error'
          });
        }
      }
      
      setCodigoEscaneado('');
    } else {
      setNotificacion({
        mostrar: true,
        mensaje: `❌ Lote ${codigo} no encontrado`,
        tipo: 'error'
      });
    }
  };

  const calcularTiempoEspera = (horaEntrada) => {
    const entrada = new Date(horaEntrada);
    const salida = new Date();
    const diffMs = salida - entrada;
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && codigoEscaneado) {
      handleEscanearCodigo(codigoEscaneado);
    }
  };

  const toggleModoEscaneo = (modo) => {
    setModoEscaneo(modo);
    setCodigoEscaneado('');
    setLoteActual(null);
  };

  // Funciones de edición por lote
  const toggleSeleccionLote = (id) => {
    setLoteSeleccionados(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSeleccionTodos = () => {
    if (loteSeleccionados.length === reportesFiltrados.length) {
      setLoteSeleccionados([]);
    } else {
      setLoteSeleccionados(reportesFiltrados.map(r => r.id));
    }
  };

  const aplicarEdicionLote = () => {
    if (!loteEditField || loteSeleccionados.length === 0) return;

    setReportes(prev => prev.map(reporte => {
      if (loteSeleccionados.includes(reporte.id)) {
        if (loteEditField === 'nota') {
          setNotasLote(prevNotas => ({
            ...prevNotas,
            [reporte.id]: loteEditValue
          }));
          return reporte;
        } else {
          return { ...reporte, [loteEditField]: loteEditValue };
        }
      }
      return reporte;
    }));

    // Enviar al servidor
    enviarAlServidor('EDICION_LOTE', {
      ids: loteSeleccionados,
      campo: loteEditField,
      valor: loteEditValue
    });

    setNotificacion({
      mostrar: true,
      mensaje: `✅ Actualizados ${loteSeleccionados.length} registros`,
      tipo: 'exito'
    });

    setLoteEditMode(false);
    setLoteSeleccionados([]);
    setLoteEditField('');
    setLoteEditValue('');
  };

  const cancelarEdicionLote = () => {
    setLoteEditMode(false);
    setLoteSeleccionados([]);
    setLoteEditField('');
    setLoteEditValue('');
  };

  const handleExportar = (formato) => {
    setNotificacion({
      mostrar: true,
      mensaje: `📊 Exportando a ${formato.toUpperCase()}...`,
      tipo: 'info'
    });
  };

  const resetFiltros = () => {
    setFiltros({
      semana: 'todas',
      status: 'todos',
      sport: 'todos',
      turno: 'todos',
      busqueda: ''
    });

    setNotificacion({
      mostrar: true,
      mensaje: '🔄 Filtros restablecidos',
      tipo: 'info'
    });
  };

  return (
    <div className="reporterh-premium-container">
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

      {/* Notificación flotante */}
      {notificacion.mostrar && (
        <div className={`notificacion-flotante ${notificacion.tipo}`}>
          {notificacion.mensaje}
        </div>
      )}

      {/* Panel de inventarios */}
      <div className="inventarios-panel-premium">
        <div className="inventarios-header">
          <h3>
            <span className="inventarios-icon">📦</span>
            Control de Inventarios en Tiempo Real
          </h3>
          <div className="inventarios-update">
            <span className="update-dot"></span>
            Actualizado {formatTime(currentTime)}
          </div>
        </div>

        <div className="inventarios-grid">
          <div className="inventario-card total">
            <div className="inventario-icon">🏭</div>
            <div className="inventario-info">
              <span className="inventario-label">Inventario Inicial</span>
              <span className="inventario-valor">{inventarios.totalInicial} pz</span>
            </div>
          </div>

          <div className="inventario-card producido">
            <div className="inventario-icon">⚙️</div>
            <div className="inventario-info">
              <span className="inventario-label">Producido</span>
              <span className="inventario-valor">{inventarios.producido} pz</span>
            </div>
          </div>

          <div className="inventario-card enviado">
            <div className="inventario-icon">🚚</div>
            <div className="inventario-info">
              <span className="inventario-label">Enviado</span>
              <span className="inventario-valor">{inventarios.enviado} pz</span>
            </div>
          </div>

          <div className="inventario-card proceso">
            <div className="inventario-icon">⏳</div>
            <div className="inventario-info">
              <span className="inventario-label">En Proceso</span>
              <span className="inventario-valor">{inventarios.enProceso} pz</span>
            </div>
          </div>

          <div className="inventario-card pendiente">
            <div className="inventario-icon">📅</div>
            <div className="inventario-info">
              <span className="inventario-label">Pendiente</span>
              <span className="inventario-valor">{inventarios.pendiente} pz</span>
            </div>
          </div>
        </div>
      </div>

      {/* Panel de edición por lote */}
      {loteEditMode && (
        <div className="lote-edit-panel-premium">
          <div className="lote-edit-header">
            <h3>
              <span className="lote-icon">📝</span>
              Edición por Lote ({loteSeleccionados.length} seleccionados)
            </h3>
            <button className="lote-close-btn" onClick={cancelarEdicionLote}>✕</button>
          </div>
          
          <div className="lote-edit-body">
            <div className="lote-edit-field">
              <label>Campo a modificar:</label>
              <select 
                value={loteEditField} 
                onChange={(e) => setLoteEditField(e.target.value)}
                className="lote-select"
              >
                <option value="">Seleccionar campo...</option>
                <option value="status">Status</option>
                <option value="turno">Turno</option>
                <option value="horas">Horas</option>
                <option value="nota">Nota / Comentario</option>
              </select>
            </div>

            {loteEditField && (
              <div className="lote-edit-value">
                <label>Nuevo valor:</label>
                {loteEditField === 'status' ? (
                  <select 
                    value={loteEditValue} 
                    onChange={(e) => setLoteEditValue(e.target.value)}
                    className="lote-select"
                  >
                    <option value="">Seleccionar status...</option>
                    <option value="OK">✅ OK</option>
                    <option value="RH">⚠️ RH</option>
                    <option value="Pendiente">⏳ Pendiente</option>
                    <option value="Revisión">🔍 Revisión</option>
                  </select>
                ) : loteEditField === 'turno' ? (
                  <select 
                    value={loteEditValue} 
                    onChange={(e) => setLoteEditValue(e.target.value)}
                    className="lote-select"
                  >
                    <option value="">Seleccionar turno...</option>
                    <option value="A">Turno A</option>
                    <option value="B">Turno B</option>
                    <option value="C">Turno C</option>
                  </select>
                ) : loteEditField === 'nota' ? (
                  <textarea
                    value={loteEditValue}
                    onChange={(e) => setLoteEditValue(e.target.value)}
                    placeholder="Escribe una nota..."
                    className="lote-textarea"
                    rows="3"
                  />
                ) : (
                  <input
                    type="number"
                    value={loteEditValue}
                    onChange={(e) => setLoteEditValue(e.target.value)}
                    placeholder={`Nuevo valor`}
                    className="lote-input"
                    step="0.5"
                  />
                )}
              </div>
            )}

            <div className="lote-edit-actions">
              <button 
                className="lote-apply-btn"
                onClick={aplicarEdicionLote}
                disabled={!loteEditField || !loteEditValue || loteSeleccionados.length === 0}
              >
                Aplicar a {loteSeleccionados.length} registros
              </button>
              <button className="lote-cancel-btn" onClick={cancelarEdicionLote}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

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
                    
                    {notasLote[selectedReporte.id] && (
                      <div className="nota-container">
                        <strong>Nota:</strong>
                        <p className="nota-text">{notasLote[selectedReporte.id]}</p>
                      </div>
                    )}
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
                <form className="editar-form" onSubmit={handleGuardarCambios}>
                  <div className="form-group">
                    <label>Status</label>
                    <select 
                      name="status"
                      value={editFormData.status} 
                      onChange={handleInputChange}
                    >
                      <option value="OK">✅ OK</option>
                      <option value="RH">⚠️ RH</option>
                      <option value="Pendiente">⏳ Pendiente</option>
                      <option value="Revisión">🔍 Revisión</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Operador</label>
                    <input 
                      type="text" 
                      name="operador"
                      value={editFormData.operador} 
                      onChange={handleInputChange}
                      placeholder="Nombre del operador"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Horas</label>
                    <input 
                      type="number" 
                      name="horas"
                      step="0.5" 
                      value={editFormData.horas} 
                      onChange={handleInputChange}
                      placeholder="0.0"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Eficiencia (%)</label>
                    <input 
                      type="number" 
                      name="eficiencia"
                      value={editFormData.eficiencia} 
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                      max="100"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Nota / Comentario</label>
                    <textarea 
                      name="nota"
                      value={editFormData.nota}
                      onChange={handleInputChange}
                      placeholder="Agregar nota..."
                      rows="4"
                    />
                  </div>
                  
                  <div className="form-actions">
                    <button type="submit" className="btn-guardar">
                      💾 Guardar Cambios
                    </button>
                    <button type="button" className="btn-cancelar" onClick={() => setShowModal(false)}>
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="reporterh-header-premium">
        <div className="header-glow"></div>
        <div className="header-content">
          <div className="header-left">
            <h1 className="title-gradient">
              <span className="title-icon">👥</span>
              Reporte de RH
            </h1>
            <div className="date-badge-premium">
              <span className="date-icon">📅</span>
              {formatDate(currentTime)}
            </div>
          </div>
          
          <div className="header-right">
            <div className="live-indicator-premium">
              <span className="live-pulse"></span>
              <span className="live-text">{conectado ? 'EN VIVO' : 'MODO DEMO'}</span>
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
              <button 
                className={`action-btn ${vista === 'escaner' ? 'active' : ''}`}
                onClick={() => setVista('escaner')}
              >
                <span className="btn-icon">📱</span>
                <span className="btn-text">Escáner RH</span>
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
          <button 
            className={`lote-edit-btn ${loteSeleccionados.length > 0 ? 'active' : ''}`}
            onClick={() => setLoteEditMode(true)}
            disabled={loteSeleccionados.length === 0}
          >
            <span>📝</span> Editar Lote ({loteSeleccionados.length})
          </button>
          
          <button className="reset-filters-btn" onClick={resetFiltros}>
            <span>🔄</span> Resetear Filtros
          </button>
        </div>
      </div>

      {/* Filtros */}
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

      {/* KPI Cards */}
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

      {/* VISTA DE ESCÁNER MEJORADA - ESTILO TERCERA IMAGEN */}
      {vista === 'escaner' && (
        <div className="scanner-mejorado-container">
          {/* Selector de modo */}
          <div className="scanner-modo-selector">
            <button 
              className={`modo-btn ${modoEscaneo === 'entrada' ? 'active' : ''}`}
              onClick={() => toggleModoEscaneo('entrada')}
            >
              📥 ENTRADA
            </button>
            <button 
              className={`modo-btn ${modoEscaneo === 'salida' ? 'active' : ''}`}
              onClick={() => toggleModoEscaneo('salida')}
            >
              📤 SALIDA
            </button>
          </div>

          {/* Escáner de Códigos */}
          <div className="scanner-codigo-section">
            <h2>
              <span className="scanner-icon">📷</span>
              Escáner de Códigos
            </h2>
            
            <div className="codigo-input-container">
              <input
                type="text"
                value={codigoEscaneado}
                onChange={(e) => setCodigoEscaneado(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escanear código de lote..."
                className="codigo-input"
                autoFocus
              />
              <button 
                className="escanear-btn"
                onClick={() => handleEscanearCodigo(codigoEscaneado)}
              >
                Escanear
              </button>
            </div>
          </div>

          {loteActual && modoEscaneo === 'entrada' && (
            /* Código Transversal - Información Detallada del Lote */
            <div className="codigo-transversal-section">
              <h3>
                <span className="transversal-icon">🔲</span>
                Código Transversal
              </h3>
              
              <div className="informacion-lote-detallada">
                <h4>Información del Lote</h4>
                
                <div className="lote-detalle-grid">
                  <div className="lote-detalle-item">
                    <span className="detalle-label">NÚMERO DE PLANTILLAS</span>
                    <span className="detalle-valor">T1-PARTNER</span>
                  </div>
                  
                  <div className="lote-detalle-item">
                    <span className="detalle-label">SALDO</span>
                    <div className="saldo-info">
                      <span className="saldo-dividido">DIVIDIDO: {loteActual.pc}</span>
                      <span className="saldo-continua">CONTINUA: V</span>
                    </div>
                  </div>
                  
                  <div className="lote-detalle-item">
                    <span className="detalle-label">NOMBRE DE PLANTILLA</span>
                    <span className="detalle-valor">{loteActual.sport} - {loteActual.po}</span>
                  </div>
                  
                  <div className="lote-detalle-item">
                    <span className="detalle-label">CONTENIDO</span>
                    <div className="contenido-info">
                      <span>CONSTRUCCIONES: {loteActual.maquina}</span>
                      <span>VARIOS PLANTA: {loteActual.operador}</span>
                    </div>
                  </div>
                  
                  <div className="lote-detalle-item">
                    <span className="detalle-label">TURNO</span>
                    <span className="detalle-valor">Turno {loteActual.turno}</span>
                  </div>
                  
                  <div className="lote-detalle-item">
                    <span className="detalle-label">EFICIENCIA</span>
                    <span className="detalle-valor">{loteActual.eficiencia}%</span>
                  </div>
                  
                  <div className="lote-detalle-item">
                    <span className="detalle-label">STATUS</span>
                    <span className="status-badge" style={{backgroundColor: getStatusColor(loteActual.status)}}>
                      {loteActual.status}
                    </span>
                  </div>
                  
                  <div className="lote-detalle-item">
                    <span className="detalle-label">HORA ENTRADA</span>
                    <span className="detalle-valor">{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cola de Espera */}
          <div className="cola-espera-section">
            <h3>
              <span className="cola-icon">⏳</span>
              COLA DE ESPERA ({colaEspera.length})
            </h3>
            
            <div className="cola-lista">
              {colaEspera.length === 0 ? (
                <div className="cola-vacia">
                  No hay lotes en espera
                </div>
              ) : (
                colaEspera.map(lote => (
                  <div key={lote.id} className="cola-item">
                    <div className="cola-item-header">
                      <span className="cola-po">{lote.po}</span>
                      <span className="cola-status" style={{backgroundColor: getStatusColor(lote.status)}}>
                        {lote.status}
                      </span>
                    </div>
                    <div className="cola-item-body">
                      <span>{lote.sport} - PC: {lote.pc}</span>
                      <span>Operador: {lote.operador}</span>
                      <span>Entrada: {new Date(lote.horaEntrada).toLocaleTimeString()}</span>
                    </div>
                    <button 
                      className="cola-salida-btn"
                      onClick={() => {
                        setModoEscaneo('salida');
                        handleEscanearCodigo(lote.po);
                      }}
                    >
                      Marcar Salida
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Historial de Salidas */}
          <div className="historial-salidas-section">
            <h3>
              <span className="historial-icon">📋</span>
              HISTORIAL DE SALIDAS
            </h3>
            
            <div className="salidas-lista">
              {historialSalidas.length === 0 ? (
                <div className="salidas-vacia">
                  No hay salidas registradas
                </div>
              ) : (
                historialSalidas.map((salida, index) => (
                  <div key={index} className="salida-item">
                    <div className="salida-header">
                      <span className="salida-po">{salida.po}</span>
                      <span className="salida-tiempo">{salida.tiempoEspera}</span>
                    </div>
                    <div className="salida-body">
                      <span>Entrada: {new Date(salida.horaEntrada).toLocaleTimeString()}</span>
                      <span>Salida: {new Date(salida.horaSalida).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Botón de salida */}
          <div className="menu-inicial-container">
            <button className="menu-inicial-btn">
              <span>🏠</span>
              MENÚ INICIAL
            </button>
            <button className="salida-btn">
              <span>🚪</span>
              Salida
            </button>
          </div>
        </div>
      )}

      {/* Vista de Tabla */}
      {vista === 'tabla' && (
        <div className="tabla-premium-container">
          <table className="reporterh-table-premium">
            <thead>
              <tr>
                <th className="select-col">
                  <input
                    type="checkbox"
                    checked={loteSeleccionados.length === reportesFiltrados.length && reportesFiltrados.length > 0}
                    onChange={toggleSeleccionTodos}
                    className="select-checkbox"
                  />
                </th>
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
                <th>Nota</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reportesFiltrados.map((reporte, index) => (
                <tr key={index} className={`table-row ${reporte.status === 'RH' ? 'rh' : ''} ${loteSeleccionados.includes(reporte.id) ? 'selected-row' : ''}`}>
                  <td className="select-col">
                    <input
                      type="checkbox"
                      checked={loteSeleccionados.includes(reporte.id)}
                      onChange={() => toggleSeleccionLote(reporte.id)}
                      className="select-checkbox"
                    />
                  </td>
                  <td className="po-cell">{reporte.po}</td>
                  <td>{reporte.sport}</td>
                  <td className="week-cell">{reporte.week}</td>
                  <td className="pc-cell">{reporte.pc}</td>
                  <td>{reporte.sublimado}</td>
                  <td>{reporte.maquina}</td>
                  <td>
                    <span className={`turno-badge turno-${reporte.turno}`}>
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
                    <div className="nota-cell">
                      {notasLote[reporte.id] ? (
                        <div className="nota-preview" title={notasLote[reporte.id]}>
                          <span className="nota-icon">📝</span>
                          <span className="nota-text-preview">
                            {notasLote[reporte.id].substring(0, 15)}
                            {notasLote[reporte.id].length > 15 && '...'}
                          </span>
                        </div>
                      ) : (
                        <span className="nota-placeholder">—</span>
                      )}
                    </div>
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
            <div key={reporte.id} className={`reporte-card ${reporte.status} ${loteSeleccionados.includes(reporte.id) ? 'selected-card' : ''}`}>
              <div className="card-glow"></div>
              
              <div className="card-select">
                <input
                  type="checkbox"
                  checked={loteSeleccionados.includes(reporte.id)}
                  onChange={() => toggleSeleccionLote(reporte.id)}
                  className="select-checkbox-card"
                />
              </div>
              
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

                {notasLote[reporte.id] && (
                  <div className="card-nota" title={notasLote[reporte.id]}>
                    <span className="nota-icon">📝</span>
                    <span className="nota-text">
                      {notasLote[reporte.id].substring(0, 30)}
                      {notasLote[reporte.id].length > 30 && '...'}
                    </span>
                  </div>
                )}

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

      {/* Footer */}
      <div className="reporterh-footer-premium">
        <div className="footer-left">
          <div className="sync-status-premium">
            <span className="sync-dot-premium"></span>
            <span>{conectado ? 'Conectado' : 'Modo demo'} • {formatTime(currentTime)}</span>
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

export default ReporteRH;