import React, { useEffect, useState, useRef } from "react";
import * as XLSX from "xlsx";
import "./PlanSemanal.css";

// ============================================
// CONFIGURACIÓN WEBSOCKET PARA TIEMPO REAL
// ============================================
const WS_URL = 'wss://glowing-lamp-r47wvpq4574fxv7j-8080.app.github.dev';

const PlanSemanal = () => {
  // ================ ESTADOS DE CONEXIÓN PARA TIEMPO REAL ================
  const [conectado, setConectado] = useState(false);
  const [usandoServidor, setUsandoServidor] = useState(false);
  const [ultimoMovimiento, setUltimoMovimiento] = useState(null);
  const wsRef = useRef(null);

  // ================ CONEXIÓN WEBSOCKET PARA TIEMPO REAL ================
  useEffect(() => {
    console.log('🔌 PlanSemanal conectando...');
    
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    
    ws.onopen = () => {
      console.log('✅ PlanSemanal conectado');
      setConectado(true);
      setUsandoServidor(true);
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📦 PlanSemanal recibió:', data.type);
        
        if (data.type === 'INIT' || data.type === 'ACTUALIZACION') {
          const lotesData = data.data.lotes || [];
          
          if (data.data.ultimoMovimiento) {
            setUltimoMovimiento(data.data.ultimoMovimiento);
          }
          
          if (lotesData.length > 0) {
            // Convertir lotes del servidor al formato de PlanSemanal
            const nuevosLotes = lotesData.map((lote, index) => ({
              lote: lote.codigo || `NK-${Math.floor(Math.random() * 9000 + 1000)}`,
              area: lote.areaActual || "Sublimado",
              piezas: lote.cantidad || 0,
              fecha: lote.fechaEntrega || new Date().toLocaleString(),
              dias: Math.floor(Math.random() * 10) + 1,
              horas: Math.floor(Math.random() * 5),
              estado: lote.progreso < 30 ? "Atraso Grave" : "Medio",
              prioridad: lote.prioridad || "Media",
              cliente: lote.cliente || "Nike",
              progreso: lote.progreso || 0,
              eficiencia: lote.eficiencia || Math.floor(Math.random() * 20) + 80,
              backlog: Math.floor(Math.random() * 50),
              pull: 0
            }));
            
            setLotes(nuevosLotes);
            
            // Actualizar KPIs basados en los lotes
            const totalPiezas = nuevosLotes.reduce((sum, l) => sum + l.piezas, 0);
            setBacklog(Math.floor(totalPiezas * 0.15));
            setPlan(totalPiezas);
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
      console.log('❌ PlanSemanal desconectado');
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

  // Estados para Plan Semanal - NIKE (INICIALIZADOS EN 0)
  const [backlog, setBacklog] = useState(0);
  const [plan, setPlan] = useState(0);
  const [pull, setPull] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [vistaNike, setVistaNike] = useState("tabla");
  const [ordenLotes, setOrdenLotes] = useState("desc");
  const [filtroArea, setFiltroArea] = useState("todas");
  const [busquedaLote, setBusquedaLote] = useState("");
  const [selectedLote, setSelectedLote] = useState(null);
  const [modoOscuro, setModoOscuro] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [fechaActual] = useState("Viernes, 11 de Marzo de 2026");
  const [semana] = useState("WK-10");
  const [estadoPlan] = useState("DRAFT");

  // Estados para Producción
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [vistaProduccion, setVistaProduccion] = useState("tabla");
  const [ordenProduccion, setOrdenProduccion] = useState("area");
  
  // ================ DATOS DE PRODUCCIÓN EN 0 ================
  const [produccionData, setProduccionData] = useState({
    make: 0,
    makeOnTime: 0,
    makeBacklog: 0,
    makePull: 0,
    makePending: 0,
    makeCompleted: 0,
    
    in: 0,
    inOnTime: 0,
    inBacklog: 0,
    inPull: 0,
    inPending: 0,
    inCompleted: 0,
    
    on: 0,
    onOnTime: 0,
    onBacklog: 0,
    onPull: 0,
    onPending: 0,
    onCompleted: 0,
    
    schd: 0,
    schdOnTime: 0,
    schdBacklog: 0,
    schdPull: 0,
    schdPending: 0,
    schdCompleted: 0,
    
    out: 0,
    outOnTime: 0,
    outBacklog: 0,
    outPull: 0,
    outPending: 0,
    outCompleted: 0,
    
    total: 0,
    totalSublimado: 0,
    entregadas: 0,
    adherencia: 0,
    metaTotal: 0,
    metaSublimado: 0,
    metaEntregadas: 0,
    metaAdherencia: 100
  });

  // DATOS DE PRODUCCIÓN EN 0
  const [dataProduccion, setDataProduccion] = useState([
    { 
      area: "Entregas a Logística", 
      total: 0, 
      tipo: "green", 
      meta: 0, 
      entregadas: 0,
      cumplimiento: 0,
      variacion: 0,
      tendencia: "▶",
      color: "#10b981",
      backlog: 0,
      onTime: 0,
      pending: 0,
      completed: 0
    },
    { 
      area: "Reformulación RH", 
      total: 0, 
      tipo: "blue", 
      meta: 0, 
      entregadas: 0,
      cumplimiento: 0,
      variacion: 0,
      tendencia: "▶",
      color: "#3b82f6",
      backlog: 0,
      onTime: 0,
      pending: 0,
      completed: 0
    },
    { 
      area: "En Preparación", 
      total: 0, 
      tipo: "yellow", 
      meta: 0, 
      entregadas: 0,
      cumplimiento: 0,
      variacion: 0,
      tendencia: "▶",
      color: "#f59e0b",
      backlog: 0,
      onTime: 0,
      pending: 0,
      completed: 0
    },
    { 
      area: "Plotter (Pendiente Impresión)", 
      total: 0, 
      tipo: "gray", 
      meta: 0, 
      entregadas: 0,
      cumplimiento: 0,
      variacion: 0,
      tendencia: "▶",
      color: "#6b7280",
      backlog: 0,
      onTime: 0,
      pending: 0,
      completed: 0
    }
  ]);

  // LOTES VACÍOS PARA EMPEZAR
  const [lotes, setLotes] = useState([]);

  // 🔥 TIEMPO REAL DESACTIVADO PARA DEMO (solo actualiza cada 10 segundos con valores pequeños)
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimate(true);

      // Actualizaciones muy pequeñas para demo
      setBacklog((prev) => prev + (Math.random() > 0.7 ? 1 : 0));
      setPlan((prev) => prev + (Math.random() > 0.8 ? 1 : 0));
      setPull((prev) => prev + (Math.random() > 0.9 ? 1 : 0));

      // Actualizar producción con incrementos mínimos
      setProduccionData(prev => {
        return {
          ...prev,
          total: prev.total + (Math.random() > 0.9 ? 1 : 0),
          entregadas: prev.entregadas + (Math.random() > 0.95 ? 1 : 0),
          adherencia: Math.min(100, prev.adherencia + (Math.random() > 0.98 ? 0.1 : 0)),
        };
      });

      setTimeout(() => setAnimate(false), 600);
    }, 10000); // Cada 10 segundos

    return () => clearInterval(interval);
  }, []);

  // ================ FUNCIONES PARA IMPORTAR EXCEL ================
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Procesar los datos del Excel
      const headers = jsonData[0];
      const rows = jsonData.slice(1).filter(row => row.some(cell => cell !== null && cell !== ""));
      
      // Mapear los datos al formato de lotes
      const importedLotes = rows.map(row => {
        const loteObj = {};
        headers.forEach((header, index) => {
          const value = row[index] || "";
          
          switch(header?.toLowerCase()) {
            case 'lote':
            case 'lote id':
              loteObj.lote = `NK-${value}`.replace('NK-NK-', 'NK-');
              break;
            case 'area':
            case 'área':
              loteObj.area = value;
              break;
            case 'piezas':
            case 'cantidad':
              loteObj.piezas = parseInt(value) || 0;
              break;
            case 'fecha':
            case 'fecha entrega':
              loteObj.fecha = value instanceof Date ? value.toLocaleString() : value;
              break;
            case 'dias':
            case 'días':
              loteObj.dias = parseInt(value) || 0;
              break;
            case 'horas':
              loteObj.horas = parseInt(value) || 0;
              break;
            case 'estado':
              loteObj.estado = value;
              break;
            case 'prioridad':
              loteObj.prioridad = value;
              break;
            case 'cliente':
              loteObj.cliente = value;
              break;
            case 'progreso':
            case '% progreso':
              loteObj.progreso = parseFloat(value) || 0;
              break;
            case 'eficiencia':
            case '% eficiencia':
              loteObj.eficiencia = parseFloat(value) || 0;
              break;
            default:
              break;
          }
        });

        return {
          lote: loteObj.lote || `NK-${Math.floor(Math.random() * 1000)}`,
          area: loteObj.area || "Sin área",
          piezas: loteObj.piezas || 0,
          fecha: loteObj.fecha || new Date().toLocaleString(),
          dias: loteObj.dias || 0,
          horas: loteObj.horas || 0,
          estado: loteObj.estado || "Medio",
          prioridad: loteObj.prioridad || "Media",
          cliente: loteObj.cliente || "Nike",
          progreso: loteObj.progreso || 0,
          eficiencia: loteObj.eficiencia || 0,
          backlog: 0,
          pull: 0
        };
      });

      setImportPreview(importedLotes);
      setImportData(importedLotes);
    };

    reader.readAsArrayBuffer(file);
  };

  const applyImportedData = () => {
    if (importData && importData.length > 0) {
      setLotes(importData);
      
      const totalPiezas = importData.reduce((sum, lote) => sum + lote.piezas, 0);
      setBacklog(Math.floor(totalPiezas * 0.15));
      setPlan(totalPiezas);
      setPull(0);
      
      // Enviar al servidor
      enviarAlServidor('PLAN_IMPORTADO', { 
        lotes: importData,
        totalPiezas,
        fecha: new Date().toISOString()
      });
      
      setShowImportModal(false);
      setImportPreview([]);
      
      alert(`✅ Plan importado exitosamente: ${importData.length} lotes cargados`);
    }
  };

  const downloadTemplate = () => {
    const template = [
      ['Lote', 'Área', 'Piezas', 'Fecha', 'Días', 'Horas', 'Estado', 'Prioridad', 'Cliente', 'Progreso', 'Eficiencia'],
      ['137', 'Sublimado', '1342', '3/11/2026 6:00 AM', '4', '4', 'Atraso Grave', 'Alta', 'Nike Sportswear', '89.5', '92'],
      ['79', 'Costura', '572', '3/11/2026 6:00 AM', '7', '3', 'Medio', 'Media', 'Nike Running', '95.3', '88']
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(template);
    XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
    XLSX.writeFile(wb, "plantilla_plan_semanal.xlsx");
  };

  const totalGeneral = dataProduccion.reduce((acc, item) => acc + item.total, 0);
  const totalSublimado = produccionData.totalSublimado;
  const entregadas = dataProduccion[0].entregadas;
  const porcentajeEntregadas = totalGeneral > 0 ? ((entregadas / totalGeneral) * 100).toFixed(1) : 0;
  const adherencia = produccionData.adherencia;

  const lotesFiltrados = lotes
    .filter(l => filtroArea === "todas" || l.area === filtroArea)
    .filter(l => l.lote.toLowerCase().includes(busquedaLote.toLowerCase()))
    .sort((a, b) => {
      if (ordenLotes === "asc") return a.dias - b.dias;
      if (ordenLotes === "desc") return b.dias - a.dias;
      if (ordenLotes === "piezas") return b.piezas - a.piezas;
      return 0;
    });

  const total = backlog + plan + pull;

  const chartData = lotes.reduce((acc, lote) => {
    acc[lote.area] = (acc[lote.area] || 0) + lote.piezas;
    return acc;
  }, {});

  return (
    <div className={`plan-container ${modoOscuro ? 'dark-mode' : 'light-mode'}`}>
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

      {/* TOGGLE MODO OSCURO */}
      <button className="theme-toggle" onClick={() => setModoOscuro(!modoOscuro)}>
        {modoOscuro ? '☀️' : '🌙'}
      </button>

      {/* BOTÓN DE IMPORTAR */}
      <button className="import-btn" onClick={() => setShowImportModal(true)}>
        📥 Importar Plan desde Excel
      </button>

      {/* HEADER - ESTILO SUPPLY CHAIN APP */}
      <div className="app-header">
        <div className="app-title">
          <span className="app-name">Supply Chain App</span>
          <span className="app-breadcrumb">Main / DailyTracker /</span>
        </div>
        
        <div className="plan-info">
          <div className="info-chip">
            <span className="chip-label">Process</span>
            <span className="chip-value">4-Sublima...</span>
          </div>
          <div className="info-chip">
            <span className="chip-label">SubProcess</span>
            <span className="chip-value">Customer</span>
          </div>
          <div className="info-chip">
            <span className="chip-label">Year</span>
            <span className="chip-value">2026</span>
          </div>
          <div className="info-chip">
            <span className="chip-label">Week</span>
            <span className="chip-value">{semana}</span>
          </div>
          <div className="status-chips">
            <span className={`status-chip ${estadoPlan === 'DRAFT' ? 'active' : ''}`}>DRAFT</span>
            <span className={`status-chip ${estadoPlan === 'LIVE' ? 'active' : ''}`}>LIVE</span>
            <span className={`status-chip ${estadoPlan === 'SAVED' ? 'active' : ''}`}>SAVED</span>
          </div>
        </div>
      </div>

      {/* MODAL DE IMPORTACIÓN */}
      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="modal-content import-modal" onClick={e => e.stopPropagation()}>
            <h3>Importar Plan desde Excel</h3>
            
            <div className="import-actions">
              <button className="template-btn" onClick={downloadTemplate}>
                📄 Descargar Plantilla
              </button>
              
              <div className="file-upload">
                <label htmlFor="excel-upload" className="upload-label">
                  📁 Seleccionar Archivo Excel
                </label>
                <input
                  type="file"
                  id="excel-upload"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            {importPreview.length > 0 && (
              <div className="import-preview">
                <h4>Vista Previa ({importPreview.length} lotes)</h4>
                <div className="preview-table-container">
                  <table className="preview-table">
                    <thead>
                      <tr>
                        <th>Lote</th>
                        <th>Área</th>
                        <th>Piezas</th>
                        <th>Días</th>
                        <th>Estado</th>
                        <th>Prioridad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importPreview.slice(0, 5).map((lote, index) => (
                        <tr key={index}>
                          <td>{lote.lote}</td>
                          <td>{lote.area}</td>
                          <td>{lote.piezas.toLocaleString()}</td>
                          <td>{lote.dias}</td>
                          <td>
                            <span className={`badge ${lote.estado === 'Atraso Grave' ? 'grave' : 'medio'}`}>
                              {lote.estado}
                            </span>
                          </td>
                          <td>
                            <span className={`priority-${lote.prioridad.toLowerCase()}`}>
                              {lote.prioridad}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {importPreview.length > 5 && (
                    <p className="preview-more">... y {importPreview.length - 5} lotes más</p>
                  )}
                </div>

                <div className="import-summary">
                  <div className="summary-item">
                    <span>Total lotes:</span>
                    <strong>{importPreview.length}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Total piezas:</span>
                    <strong>{importPreview.reduce((sum, l) => sum + l.piezas, 0).toLocaleString()}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Lotes críticos:</span>
                    <strong className="critical">
                      {importPreview.filter(l => l.estado === 'Atraso Grave').length}
                    </strong>
                  </div>
                </div>

                <div className="modal-actions">
                  <button className="cancel-btn" onClick={() => setShowImportModal(false)}>
                    Cancelar
                  </button>
                  <button className="apply-btn" onClick={applyImportedData}>
                    Aplicar Importación
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECCIÓN 1: PRODUCCIÓN - ESTILO SUPPLY CHAIN APP */}
      <div className="produccion-section">
        <div className="section-header">
          <div>
            <h2>DailyTracker - Plan Semanal</h2>
            <p className="subtitle">{fechaActual} | {semana}</p>
          </div>
          
          <div className="view-selector">
            <button 
              className={`view-btn ${vistaProduccion === 'tabla' ? 'active' : ''}`}
              onClick={() => setVistaProduccion('tabla')}
            >
              📊 Tabla
            </button>
            <button 
              className={`view-btn ${vistaProduccion === 'cards' ? 'active' : ''}`}
              onClick={() => setVistaProduccion('cards')}
            >
              📇 Tarjetas
            </button>
            <button 
              className={`view-btn ${vistaProduccion === 'grafico' ? 'active' : ''}`}
              onClick={() => setVistaProduccion('grafico')}
            >
              📈 Gráfico
            </button>
          </div>
        </div>

        {/* FILTROS */}
        <div className="filters-premium">
          <div className="filters-group">
            <div className="filter-item">
              <label>Fecha Inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="premium-input"
                placeholder="mm/dd/yyyy"
              />
            </div>

            <div className="filter-item">
              <label>Fecha Fin</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="premium-input"
                placeholder="mm/dd/yyyy"
              />
            </div>

            <button className="filter-btn">
              <span>🔍</span> Filtrar
            </button>
          </div>

          <div className="filters-actions">
            <select className="premium-select" onChange={(e) => setOrdenProduccion(e.target.value)}>
              <option value="area">Ordenar por Área</option>
              <option value="total">Ordenar por Total</option>
              <option value="porcentaje">Ordenar por %</option>
            </select>
            
            <button className="export-btn">
              📥 Exportar
            </button>
          </div>
        </div>

        {/* CARDS DE PROCESOS - TODOS EN 0 */}
        <div className="process-cards-grid">
          <div className="process-card make-card">
            <div className="process-header">
              <span className="process-name">MAKE</span>
              <span className="process-value">{produccionData.make.toLocaleString()}</span>
            </div>
            <div className="process-details">
              <div className="detail-item">
                <span>Backlog</span>
                <strong>{produccionData.makeBacklog}</strong>
              </div>
              <div className="detail-item">
                <span>Pull</span>
                <strong>{produccionData.makePull}</strong>
              </div>
              <div className="detail-item">
                <span>OnTime</span>
                <strong>{produccionData.makeOnTime.toLocaleString()}</strong>
              </div>
            </div>
            <div className="process-progress">
              <div className="progress-row">
                <span>Pending</span>
                <span>{produccionData.makePending}%</span>
              </div>
              <div className="progress-row">
                <span>Completed</span>
                <span>{produccionData.makeCompleted}%</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-pending" style={{width: `${produccionData.makePending}%`}}></div>
                <div className="progress-bar-completed" style={{width: `${produccionData.makeCompleted}%`}}></div>
              </div>
            </div>
          </div>

          <div className="process-card in-card">
            <div className="process-header">
              <span className="process-name">IN</span>
              <span className="process-value">{produccionData.in.toLocaleString()}</span>
            </div>
            <div className="process-details">
              <div className="detail-item">
                <span>Backlog</span>
                <strong>{produccionData.inBacklog}</strong>
              </div>
              <div className="detail-item">
                <span>Pull</span>
                <strong>{produccionData.inPull}</strong>
              </div>
              <div className="detail-item">
                <span>OnTime</span>
                <strong>{produccionData.inOnTime.toLocaleString()}</strong>
              </div>
            </div>
            <div className="process-progress">
              <div className="progress-row">
                <span>Pending</span>
                <span>{produccionData.inPending}%</span>
              </div>
              <div className="progress-row">
                <span>Completed</span>
                <span>{produccionData.inCompleted}%</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-pending" style={{width: `${produccionData.inPending}%`}}></div>
                <div className="progress-bar-completed" style={{width: `${produccionData.inCompleted}%`}}></div>
              </div>
            </div>
          </div>

          <div className="process-card on-card">
            <div className="process-header">
              <span className="process-name">ON</span>
              <span className="process-value">{produccionData.on.toLocaleString()}</span>
            </div>
            <div className="process-details">
              <div className="detail-item">
                <span>Backlog</span>
                <strong>{produccionData.onBacklog}</strong>
              </div>
              <div className="detail-item">
                <span>Pull</span>
                <strong>{produccionData.onPull}</strong>
              </div>
              <div className="detail-item">
                <span>OnTime</span>
                <strong>{produccionData.onOnTime.toLocaleString()}</strong>
              </div>
            </div>
            <div className="process-progress">
              <div className="progress-row">
                <span>Pending</span>
                <span>{produccionData.onPending}%</span>
              </div>
              <div className="progress-row">
                <span>Completed</span>
                <span>{produccionData.onCompleted}%</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-pending" style={{width: `${produccionData.onPending}%`}}></div>
                <div className="progress-bar-completed" style={{width: `${produccionData.onCompleted}%`}}></div>
              </div>
            </div>
          </div>

          <div className="process-card schd-card">
            <div className="process-header">
              <span className="process-name">SCHD</span>
              <span className="process-value">{produccionData.schd.toLocaleString()}</span>
            </div>
            <div className="process-details">
              <div className="detail-item">
                <span>Backlog</span>
                <strong>{produccionData.schdBacklog}</strong>
              </div>
              <div className="detail-item">
                <span>Pull</span>
                <strong>{produccionData.schdPull}</strong>
              </div>
              <div className="detail-item">
                <span>OnTime</span>
                <strong>{produccionData.schdOnTime.toLocaleString()}</strong>
              </div>
            </div>
            <div className="process-progress">
              <div className="progress-row">
                <span>Pending</span>
                <span>{produccionData.schdPending}%</span>
              </div>
              <div className="progress-row">
                <span>Completed</span>
                <span>{produccionData.schdCompleted}%</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-pending" style={{width: `${produccionData.schdPending}%`}}></div>
                <div className="progress-bar-completed" style={{width: `${produccionData.schdCompleted}%`}}></div>
              </div>
            </div>
          </div>

          <div className="process-card out-card">
            <div className="process-header">
              <span className="process-name">OUT</span>
              <span className="process-value">{produccionData.out.toLocaleString()}</span>
            </div>
            <div className="process-details">
              <div className="detail-item">
                <span>Backlog</span>
                <strong>{produccionData.outBacklog}</strong>
              </div>
              <div className="detail-item">
                <span>Pull</span>
                <strong>{produccionData.outPull}</strong>
              </div>
              <div className="detail-item">
                <span>OnTime</span>
                <strong>{produccionData.outOnTime.toLocaleString()}</strong>
              </div>
            </div>
            <div className="process-progress">
              <div className="progress-row">
                <span>Pending</span>
                <span>{produccionData.outPending}%</span>
              </div>
              <div className="progress-row">
                <span>Completed</span>
                <span>{produccionData.outCompleted}%</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-pending" style={{width: `${produccionData.outPending}%`}}></div>
                <div className="progress-bar-completed" style={{width: `${produccionData.outCompleted}%`}}></div>
              </div>
            </div>
          </div>
        </div>

        {/* CARDS DE MÉTRICAS CLAVE - TODOS EN 0 */}
        <div className="cards-grid meta-real-grid">
          <div className="card premium-card meta-real-card">
            <div className="card-header-meta">
              <span className="card-icon">📦</span>
              <span className="card-trend positive">0%</span>
            </div>
            <div className="card-content-meta">
              <div className="meta-real-valor">
                <span className="valor-label">Total</span>
                <span className="valor-numero">{produccionData.total.toLocaleString()}</span>
              </div>
              <div className="meta-real-barra">
                <div className="barra-label">
                  <span>Meta: {produccionData.metaTotal.toLocaleString()}</span>
                  <span>0%</span>
                </div>
                <div className="barra-contenedor">
                  <div className="barra-llenado" style={{width: `0%`}}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="card premium-card meta-real-card">
            <div className="card-header-meta">
              <span className="card-icon">🖨️</span>
              <span className="card-trend positive">0%</span>
            </div>
            <div className="card-content-meta">
              <div className="meta-real-valor">
                <span className="valor-label">Total Sublimado</span>
                <span className="valor-numero">{produccionData.totalSublimado.toLocaleString()}</span>
              </div>
              <div className="meta-real-barra">
                <div className="barra-label">
                  <span>Meta: {produccionData.metaSublimado.toLocaleString()}</span>
                  <span>0%</span>
                </div>
                <div className="barra-contenedor">
                  <div className="barra-llenado" style={{width: `0%`}}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="card premium-card meta-real-card">
            <div className="card-header-meta">
              <span className="card-icon">✅</span>
              <span className="card-trend negative">0%</span>
            </div>
            <div className="card-content-meta">
              <div className="meta-real-valor">
                <span className="valor-label">Entregadas</span>
                <span className="valor-numero">{produccionData.entregadas.toLocaleString()} pz</span>
              </div>
              <div className="meta-real-barra">
                <div className="barra-label">
                  <span>Meta: {produccionData.metaEntregadas.toLocaleString()}</span>
                  <span>0%</span>
                </div>
                <div className="barra-contenedor">
                  <div className="barra-llenado" style={{width: `0%`}}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="card premium-card meta-real-card">
            <div className="card-header-meta">
              <span className="card-icon">📊</span>
              <span className="card-trend positive">0%</span>
            </div>
            <div className="card-content-meta">
              <div className="meta-real-valor">
                <span className="valor-label">Adherencia Plan</span>
                <span className="valor-numero">{produccionData.adherencia}%</span>
              </div>
              <div className="meta-real-barra">
                <div className="barra-label">
                  <span>Meta: {produccionData.metaAdherencia}%</span>
                  <span>0%</span>
                </div>
                <div className="barra-contenedor">
                  <div className="barra-llenado" style={{width: `0%`}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TABLA DE ÁREAS - TODOS EN 0 */}
        <div className="dynamic-view">
          {vistaProduccion === 'tabla' && (
            <div className="table-container">
              <table className="premium-table meta-real-table">
                <thead>
                  <tr>
                    <th>Área Responsable</th>
                    <th>Meta</th>
                    <th>Real</th>
                    <th>Entregadas</th>
                    <th>Backlog</th>
                    <th>OnTime</th>
                    <th>% Pendiente</th>
                    <th>% Completado</th>
                    <th>Cumplimiento</th>
                  </tr>
                </thead>
                <tbody>
                  {dataProduccion.sort((a, b) => {
                    if (ordenProduccion === 'total') return b.total - a.total;
                    if (ordenProduccion === 'porcentaje') return b.cumplimiento - a.cumplimiento;
                    return 0;
                  }).map((item, index) => {
                    return (
                      <tr key={index} className={`row-${item.tipo} interactive-row`}>
                        <td><strong>{item.area}</strong></td>
                        <td className="meta-valor">{item.meta.toLocaleString()}</td>
                        <td className="real-valor"><strong>{item.total.toLocaleString()}</strong></td>
                        <td className="entregadas-valor">{item.entregadas.toLocaleString()} pz</td>
                        <td>{item.backlog}</td>
                        <td>{item.onTime.toLocaleString()}</td>
                        <td>{item.pending}%</td>
                        <td>{item.completed}%</td>
                        <td>
                          <div className="progress-bar-container">
                            <div className="progress-bar" style={{width: `${item.cumplimiento}%`, backgroundColor: item.color}}></div>
                            <span>{item.cumplimiento.toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="total-row">
                    <td><strong>Total / Promedio</strong></td>
                    <td><strong>0</strong></td>
                    <td><strong>0</strong></td>
                    <td><strong>0 pz</strong></td>
                    <td><strong>0</strong></td>
                    <td><strong>0</strong></td>
                    <td><strong>0%</strong></td>
                    <td><strong>0%</strong></td>
                    <td colSpan="1">
                      <strong>Cumplimiento Promedio: 0%</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {vistaProduccion === 'cards' && (
            <div className="cards-view meta-real-cards">
              {dataProduccion.map((item, index) => (
                <div key={index} className={`detail-card ${item.tipo}`}>
                  <h3>{item.area}</h3>
                  <div className="meta-real-comparacion">
                    <div className="comparacion-item">
                      <span className="comparacion-label">Meta</span>
                      <span className="comparacion-valor meta">0</span>
                    </div>
                    <div className="comparacion-item">
                      <span className="comparacion-label">Real</span>
                      <span className="comparacion-valor real">0</span>
                    </div>
                    <div className="comparacion-item">
                      <span className="comparacion-label">Entregadas</span>
                      <span className="comparacion-valor entregadas">0 pz</span>
                    </div>
                  </div>
                  <div className="metrics-grid-small">
                    <div className="metric-small">
                      <span>Backlog</span>
                      <strong>0</strong>
                    </div>
                    <div className="metric-small">
                      <span>OnTime</span>
                      <strong>0</strong>
                    </div>
                    <div className="metric-small">
                      <span>Pendiente</span>
                      <strong>0%</strong>
                    </div>
                    <div className="metric-small">
                      <span>Completado</span>
                      <strong>0%</strong>
                    </div>
                  </div>
                  <div className="cumplimiento-bar">
                    <div className="barra-label">
                      <span>Cumplimiento</span>
                      <span>0%</span>
                    </div>
                    <div className="barra-contenedor">
                      <div className="barra-llenado" style={{width: `0%`, backgroundColor: item.color}}></div>
                    </div>
                  </div>
                  <div className="card-footer">
                    <span className={`variation-badge`}>
                      ▶ 0%
                    </span>
                    <button className="mini-btn">Ver detalles</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {vistaProduccion === 'grafico' && (
            <div className="chart-container meta-real-grafico">
              <h3>Comparativa por Área</h3>
              <div className="empty-chart">
                <p>No hay datos para mostrar</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN 2: PLAN SEMANAL NIKE - VACÍO */}
      <div className="nike-section">
        <div className="plan-header">
          <div className="header-left">
            <h1>Plan Semanal - NIKE</h1>
            <div className="header-badges">
              <span className="badge-premium">⚡ Tiempo Real</span>
              <span className="badge-premium">🎯 {lotes.length} Lotes Activos</span>
            </div>
          </div>

          <div className="header-right">
            <div className="live-indicator">
              <div className="live-dot"></div>
              LIVE
            </div>
            
            <div className="view-selector">
              <button 
                className={`view-btn ${vistaNike === 'tabla' ? 'active' : ''}`}
                onClick={() => setVistaNike('tabla')}
              >
                📋 Tabla
              </button>
              <button 
                className={`view-btn ${vistaNike === 'cards' ? 'active' : ''}`}
                onClick={() => setVistaNike('cards')}
              >
                🃏 Cards
              </button>
              <button 
                className={`view-btn ${vistaNike === 'grafico' ? 'active' : ''}`}
                onClick={() => setVistaNike('grafico')}
              >
                📊 Análisis
              </button>
            </div>
          </div>
        </div>

        <div className="kpi-grid">
          <div className="kpi interactive-kpi" onClick={() => alert(`Backlog: ${backlog} piezas`)}>
            <div className="kpi-header">
              <h3>Backlog</h3>
              <span className="kpi-icon">📋</span>
            </div>
            <p className={animate ? "number-animate" : ""}>{backlog.toLocaleString()}</p>
            <div className="kpi-footer">
              <span className="trend">▼ 0%</span>
              <span className="period">vs ayer</span>
            </div>
          </div>

          <div className="kpi interactive-kpi">
            <div className="kpi-header">
              <h3>Plan</h3>
              <span className="kpi-icon">📅</span>
            </div>
            <p className={animate ? "number-animate" : ""}>{plan.toLocaleString()}</p>
            <div className="kpi-footer">
              <span className="trend positive">▲ 0%</span>
              <span className="period">vs meta</span>
            </div>
          </div>

          <div className="kpi interactive-kpi">
            <div className="kpi-header">
              <h3>Pull</h3>
              <span className="kpi-icon">⚡</span>
            </div>
            <p className={animate ? "number-animate" : ""}>{pull.toLocaleString()}</p>
            <div className="kpi-footer">
              <span className="trend positive">▲ 0%</span>
              <span className="period">vs ayer</span>
            </div>
          </div>

          <div className="kpi interactive-kpi">
            <div className="kpi-header">
              <h3>Total</h3>
              <span className="kpi-icon">📊</span>
            </div>
            <p className={animate ? "number-animate" : ""}>{total.toLocaleString()}</p>
            <div className="kpi-footer">
              <span className="trend">▼ 0%</span>
              <span className="period">vs plan</span>
            </div>
          </div>
        </div>

        <div className="nike-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Buscar lote..."
              value={busquedaLote}
              onChange={(e) => setBusquedaLote(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-options">
            <select className="filter-select" onChange={(e) => setFiltroArea(e.target.value)}>
              <option value="todas">Todas las áreas</option>
              <option value="Sublimado">Sublimado</option>
              <option value="Costura">Costura</option>
              <option value="Empaque">Empaque</option>
            </select>

            <select className="filter-select" onChange={(e) => setOrdenLotes(e.target.value)}>
              <option value="desc">Más atrasados</option>
              <option value="asc">Menos atrasados</option>
              <option value="piezas">Por piezas</option>
            </select>
          </div>
        </div>

        {vistaNike === 'tabla' && (
          <div className="tabla-container">
            <h2>🚨 Lotes Atrasados - NIKE</h2>

            {lotesFiltrados.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3>No hay lotes</h3>
                <p>Importa un plan desde Excel para comenzar</p>
              </div>
            ) : (
              <table className="lotes-table">
                <thead>
                  <tr>
                    <th>Lote</th>
                    <th>Área</th>
                    <th>Piezas</th>
                    <th>Fecha Entrega</th>
                    <th>Días</th>
                    <th>Horas</th>
                    <th>Backlog</th>
                    <th>Progreso</th>
                    <th>Eficiencia</th>
                    <th>Prioridad</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {lotesFiltrados.map((l, index) => (
                    <tr 
                      key={index} 
                      className={`${index === lotes.length - 1 ? "new-row" : ""} ${selectedLote === l.lote ? 'selected' : ''}`}
                      onClick={() => setSelectedLote(l.lote)}
                    >
                      <td><span className="lote-code">{l.lote}</span></td>
                      <td>{l.area}</td>
                      <td><strong>{l.piezas.toLocaleString()}</strong></td>
                      <td>{l.fecha}</td>
                      <td>
                        <div className="dias-container">
                          <span>{l.dias}</span>
                          <div className="severity-bar-container">
                            <div 
                              className="severity-bar" 
                              style={{ width: `${Math.min(l.dias * 8, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td>{l.horas}</td>
                      <td>{l.backlog}</td>
                      <td>
                        <div className="progress-cell">
                          <div className="progress-bar-small">
                            <div className="progress-fill-small" style={{width: `${l.progreso}%`}}></div>
                          </div>
                          <span>{l.progreso}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`eficiencia-badge ${l.eficiencia > 90 ? 'alta' : l.eficiencia > 80 ? 'media' : 'baja'}`}>
                          {l.eficiencia}%
                        </span>
                      </td>
                      <td>
                        <span className={`priority-${l.prioridad.toLowerCase()}`}>
                          {l.prioridad}
                        </span>
                      </td>
                      <td>
                        <span
                          className={
                            l.estado === "Atraso Grave"
                              ? "badge grave"
                              : "badge medio"
                          }
                        >
                          {l.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {vistaNike === 'cards' && (
          <div className="lotes-cards">
            {lotesFiltrados.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3>No hay lotes</h3>
                <p>Importa un plan desde Excel para comenzar</p>
              </div>
            ) : (
              lotesFiltrados.map((l, index) => (
                <div key={index} className={`lote-card ${l.estado === 'Atraso Grave' ? 'grave-card' : 'medio-card'}`}>
                  <div className="card-header">
                    <span className="lote-title">{l.lote}</span>
                    <span className={`priority-badge ${l.prioridad.toLowerCase()}`}>{l.prioridad}</span>
                  </div>
                  <div className="card-body">
                    <div className="card-info">
                      <div>📍 {l.area}</div>
                      <div>📦 {l.piezas.toLocaleString()} piezas</div>
                      <div>⏰ {l.dias}d {l.horas}h</div>
                      <div>📋 Backlog: {l.backlog}</div>
                      <div>👤 {l.cliente}</div>
                    </div>
                    <div className="card-metrics">
                      <div className="metric">
                        <span>Progreso</span>
                        <strong>{l.progreso}%</strong>
                      </div>
                      <div className="metric">
                        <span>Eficiencia</span>
                        <strong>{l.eficiencia}%</strong>
                      </div>
                    </div>
                    <div className="card-progress">
                      <div className="progress-label">
                        <span>Progreso</span>
                        <span>{l.progreso}%</span>
                      </div>
                      <div className="card-progress-bar">
                        <div className="progress-fill" style={{width: `${l.progreso}%`}}></div>
                      </div>
                    </div>
                  </div>
                  <div className="card-footer">
                    <span className={`badge-card ${l.estado === 'Atraso Grave' ? 'grave' : 'medio'}`}>
                      {l.estado}
                    </span>
                    <button className="card-action">Ver detalles →</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {vistaNike === 'grafico' && (
          <div className="analytics-container">
            <div className="charts-grid">
              <div className="chart-card">
                <h3>Distribución por Área</h3>
                <div className="empty-chart">
                  <p>No hay datos para mostrar</p>
                </div>
              </div>
              
              <div className="chart-card">
                <h3>Eficiencia por Lote</h3>
                <div className="empty-chart">
                  <p>No hay datos para mostrar</p>
                </div>
              </div>

              <div className="chart-card">
                <h3>Métricas Clave</h3>
                <div className="metrics-grid">
                  <div className="metric-item">
                    <span>Eficiencia Prom</span>
                    <strong>0%</strong>
                  </div>
                  <div className="metric-item">
                    <span>Tiempo Promedio</span>
                    <strong>0 días</strong>
                  </div>
                  <div className="metric-item">
                    <span>Lotes Críticos</span>
                    <strong className="critical">0</strong>
                  </div>
                  <div className="metric-item">
                    <span>Cumplimiento</span>
                    <strong>0%</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BOTONES DE ACCIÓN - ESTILO SUPPLY CHAIN APP */}
        <div className="action-buttons">
          <button className="action-button" onClick={() => alert('Ordenar por Área')}>
            <span className="action-icon">🔤</span> Ordenar por Área
          </button>
          <button className="action-button" onClick={() => alert('Exportar datos')}>
            <span className="action-icon">📤</span> Exportar
          </button>
          <button className="action-button" onClick={() => alert('Vista Pivot')}>
            <span className="action-icon">🔄</span> PIVOT
          </button>
          <button className="action-button" onClick={() => alert('Análisis Pareto')}>
            <span className="action-icon">📊</span> PARETO
          </button>
          <button className="action-button" onClick={() => alert('Ver WIP')}>
            <span className="action-icon">⚙️</span> WIP
          </button>
          <button className="action-button primary" onClick={() => alert('Plan guardado')}>
            <span className="action-icon">💾</span> SAVE
          </button>
        </div>

        {selectedLote && (
          <div className="modal-overlay" onClick={() => setSelectedLote(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3>Detalles del Lote {selectedLote}</h3>
              <div className="modal-details">
                {lotes.find(l => l.lote === selectedLote) && (
                  <>
                    <p><strong>Cliente:</strong> {lotes.find(l => l.lote === selectedLote).cliente}</p>
                    <p><strong>Área:</strong> {lotes.find(l => l.lote === selectedLote).area}</p>
                    <p><strong>Piezas:</strong> {lotes.find(l => l.lote === selectedLote).piezas}</p>
                    <p><strong>Backlog:</strong> {lotes.find(l => l.lote === selectedLote).backlog}</p>
                    <p><strong>Progreso:</strong> {lotes.find(l => l.lote === selectedLote).progreso}%</p>
                    <p><strong>Eficiencia:</strong> {lotes.find(l => l.lote === selectedLote).eficiencia}%</p>
                  </>
                )}
              </div>
              <button className="modal-close" onClick={() => setSelectedLote(null)}>Cerrar</button>
            </div>
          </div>
        )}
      </div>

      {/* Estilos para el indicador de conexión y estado vacío */}
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

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #6b7280;
          background: white;
          border-radius: 12px;
          margin: 20px 0;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .empty-state h3 {
          font-size: 20px;
          margin-bottom: 8px;
          color: #374151;
        }

        .empty-state p {
          font-size: 14px;
        }

        .empty-chart {
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          background: #f9fafb;
          border-radius: 8px;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};

export default PlanSemanal;