import React, { useEffect, useState } from "react";
import "./PlanSemanal.css";

const PlanSemanal = () => {
  // Estados para Plan Semanal - NIKE
  const [backlog, setBacklog] = useState(1533);
  const [plan, setPlan] = useState(7955);
  const [pull, setPull] = useState(2681);
  const [animate, setAnimate] = useState(false);
  const [vistaNike, setVistaNike] = useState("tabla");
  const [ordenLotes, setOrdenLotes] = useState("desc");
  const [filtroArea, setFiltroArea] = useState("todas");
  const [busquedaLote, setBusquedaLote] = useState("");
  const [selectedLote, setSelectedLote] = useState(null);
  const [modoOscuro, setModoOscuro] = useState(false);

  // Estados para Producción
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [vistaProduccion, setVistaProduccion] = useState("tabla");
  const [ordenProduccion, setOrdenProduccion] = useState("area");
  
  // ================ DATOS DE PRODUCCIÓN ESTILO META VS REAL ================
  const [produccionData, setProduccionData] = useState({
    total: 15185,
    totalSublimado: 16264,
    entregadas: 14140, // Cambiado de entregado a entregadas (piezas)
    adherencia: 107.1,
    tendencias: {
      total: "+12%",
      sublimado: "+8%",
      entregadas: "-3%", // Cambiado
      adherencia: "+5%"
    }
  });

  const dataProduccion = [
    { 
      area: "Entregas a Logística", 
      total: 14140, 
      tipo: "green", 
      meta: 15000, 
      entregadas: 14140, // Cambiado
      cumplimiento: 94.3,
      variacion: -5.7,
      tendencia: "▼",
      color: "#10b981"
    },
    { 
      area: "Reformulación RH", 
      total: 204, 
      tipo: "red", 
      meta: 250, 
      entregadas: 204, // Cambiado
      cumplimiento: 81.6,
      variacion: +36,
      tendencia: "▲",
      color: "#ef4444"
    },
    { 
      area: "En Preparación", 
      total: 571, 
      tipo: "yellow", 
      meta: 500, 
      entregadas: 571, // Cambiado
      cumplimiento: 114.2,
      variacion: +14.2,
      tendencia: "▲",
      color: "#f59e0b"
    },
    { 
      area: "Plotter (Pendiente Impresión)", 
      total: 270, 
      tipo: "gray", 
      meta: 200, 
      entregadas: 270, // Cambiado
      cumplimiento: 135,
      variacion: +35,
      tendencia: "▲",
      color: "#6b7280"
    }
  ];

  const totalGeneral = dataProduccion.reduce((acc, item) => acc + item.total, 0);
  const totalSublimado = produccionData.totalSublimado;
  const entregadas = dataProduccion[0].entregadas; // Cambiado
  const porcentajeEntregadas = ((entregadas / totalGeneral) * 100).toFixed(1); // Cambiado
  const adherencia = produccionData.adherencia;

  const [lotes, setLotes] = useState([
    {
      lote: "NK-137",
      area: "Sublimado",
      piezas: 1342,
      fecha: "2/15/2026 6:00 AM",
      dias: 4,
      horas: 4,
      estado: "Atraso Grave",
      prioridad: "Alta",
      cliente: "Nike Sportswear",
      progreso: 89.5,
      eficiencia: 92
    },
    {
      lote: "NK-79",
      area: "Costura",
      piezas: 572,
      fecha: "2/15/2026 6:00 AM",
      dias: 7,
      horas: 3,
      estado: "Medio",
      prioridad: "Media",
      cliente: "Nike Running",
      progreso: 95.3,
      eficiencia: 88
    },
    {
      lote: "NK-6",
      area: "Sublimado",
      piezas: 1249,
      fecha: "2/15/2026 6:00 AM",
      dias: 8,
      horas: 3,
      estado: "Atraso Grave",
      prioridad: "Alta",
      cliente: "Nike SB",
      progreso: 83.3,
      eficiencia: 78
    },
    {
      lote: "NK-73",
      area: "Empaque",
      piezas: 280,
      fecha: "2/15/2026 6:00 AM",
      dias: 5,
      horas: 1,
      estado: "Medio",
      prioridad: "Baja",
      cliente: "Nike ACG",
      progreso: 93.3,
      eficiencia: 95
    },
  ]);

  // 🔥 TIEMPO REAL MEJORADO
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimate(true);

      setBacklog((prev) => Math.max(0, prev + (Math.random() > 0.5 ? 15 : -8)));
      setPlan((prev) => prev + Math.floor(Math.random() * 30));
      setPull((prev) => prev + Math.floor(Math.random() * 20));

      // Actualizar producción en tiempo real
      setProduccionData(prev => ({
        ...prev,
        total: prev.total + Math.floor(Math.random() * 10),
        entregadas: prev.entregadas + Math.floor(Math.random() * 5) // Cambiado
      }));

      if (Math.random() > 0.7) {
        const areas = ["Sublimado", "Costura", "Empaque", "Corte", "Bordado"];
        const nuevosLotes = Array.from({ length: Math.floor(Math.random() * 2) + 1 }, () => ({
          lote: `NK-${Math.floor(Math.random() * 500)}`,
          area: areas[Math.floor(Math.random() * areas.length)],
          piezas: Math.floor(Math.random() * 1500) + 100,
          fecha: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleString(),
          dias: Math.floor(Math.random() * 10),
          horas: Math.floor(Math.random() * 5),
          estado: Math.random() > 0.6 ? "Atraso Grave" : "Medio",
          prioridad: ["Alta", "Media", "Baja"][Math.floor(Math.random() * 3)],
          cliente: ["Nike Sportswear", "Nike Running", "Nike SB", "Nike ACG"][Math.floor(Math.random() * 4)],
          progreso: Math.floor(Math.random() * 100),
          eficiencia: Math.floor(Math.random() * 30) + 70
        }));

        setLotes((prev) => {
          const nuevos = [...nuevosLotes, ...prev];
          return nuevos.slice(0, 8);
        });
      }

      setTimeout(() => setAnimate(false), 600);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

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
      {/* TOGGLE MODO OSCURO */}
      <button className="theme-toggle" onClick={() => setModoOscuro(!modoOscuro)}>
        {modoOscuro ? '☀️' : '🌙'}
      </button>

      {/* SECCIÓN 1: PRODUCCIÓN - META VS REAL */}
      <div className="produccion-section">
        <div className="section-header">
          <div>
            <h2>Producción</h2>
            <p className="subtitle">Panel general de producción</p>
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

        {/* CARDS DE PRODUCCIÓN - META VS REAL */}
        <div className="cards-grid meta-real-grid">
          <div className="card premium-card meta-real-card">
            <div className="card-header-meta">
              <span className="card-icon">📦</span>
              <span className="card-trend positive">{produccionData.tendencias.total}</span>
            </div>
            <div className="card-content-meta">
              <div className="meta-real-valor">
                <span className="valor-label">Total</span>
                <span className="valor-numero">{produccionData.total.toLocaleString()}</span>
              </div>
              <div className="meta-real-barra">
                <div className="barra-label">
                  <span>Meta: 15,000</span>
                  <span>{Math.round((produccionData.total/15000)*100)}%</span>
                </div>
                <div className="barra-contenedor">
                  <div className="barra-llenado" style={{width: `${(produccionData.total/15000)*100}%`}}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="card premium-card meta-real-card">
            <div className="card-header-meta">
              <span className="card-icon">🖨️</span>
              <span className="card-trend positive">{produccionData.tendencias.sublimado}</span>
            </div>
            <div className="card-content-meta">
              <div className="meta-real-valor">
                <span className="valor-label">Total Sublimado</span>
                <span className="valor-numero">{produccionData.totalSublimado.toLocaleString()}</span>
              </div>
              <div className="meta-real-barra">
                <div className="barra-label">
                  <span>Meta: 15,000</span>
                  <span>{Math.round((produccionData.totalSublimado/15000)*100)}%</span>
                </div>
                <div className="barra-contenedor">
                  <div className="barra-llenado" style={{width: `${(produccionData.totalSublimado/15000)*100}%`}}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="card premium-card meta-real-card">
            <div className="card-header-meta">
              <span className="card-icon">✅</span>
              <span className="card-trend negative">{produccionData.tendencias.entregadas}</span>
            </div>
            <div className="card-content-meta">
              <div className="meta-real-valor">
                <span className="valor-label">Entregadas</span>
                <span className="valor-numero">{produccionData.entregadas.toLocaleString()} pz</span>
              </div>
              <div className="meta-real-barra">
                <div className="barra-label">
                  <span>Meta: 14,500</span>
                  <span>{Math.round((produccionData.entregadas/14500)*100)}%</span>
                </div>
                <div className="barra-contenedor">
                  <div className="barra-llenado" style={{width: `${(produccionData.entregadas/14500)*100}%`, background: produccionData.entregadas > 14000 ? '#10b981' : '#f59e0b'}}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="card premium-card meta-real-card">
            <div className="card-header-meta">
              <span className="card-icon">📊</span>
              <span className="card-trend positive">{produccionData.tendencias.adherencia}</span>
            </div>
            <div className="card-content-meta">
              <div className="meta-real-valor">
                <span className="valor-label">Adherencia Plan</span>
                <span className="valor-numero">{produccionData.adherencia}%</span>
              </div>
              <div className="meta-real-barra">
                <div className="barra-label">
                  <span>Meta: 100%</span>
                  <span>{produccionData.adherencia}%</span>
                </div>
                <div className="barra-contenedor">
                  <div className="barra-llenado" style={{width: `${Math.min(produccionData.adherencia, 100)}%`, background: produccionData.adherencia > 100 ? '#10b981' : '#f59e0b'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* VISTAS DINÁMICAS DE PRODUCCIÓN */}
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
                    <th>Cumplimiento</th>
                    <th>Variación</th>
                    <th>Acciones</th>
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
                        <td>
                          <div className="progress-bar-container">
                            <div className="progress-bar" style={{width: `${item.cumplimiento}%`, backgroundColor: item.color}}></div>
                            <span>{item.cumplimiento.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td>
                          <span className={`variation ${item.variacion > 0 ? 'positive' : 'negative'}`}>
                            {item.tendencia} {Math.abs(item.variacion)}%
                          </span>
                        </td>
                        <td>
                          <button className="action-btn" onClick={() => alert(`Detalles de ${item.area}`)}>
                            👁️
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="total-row">
                    <td><strong>Total / Promedio</strong></td>
                    <td><strong>{(dataProduccion.reduce((acc, item) => acc + item.meta, 0)).toLocaleString()}</strong></td>
                    <td><strong>{totalGeneral.toLocaleString()}</strong></td>
                    <td><strong>{dataProduccion.reduce((acc, item) => acc + item.entregadas, 0).toLocaleString()} pz</strong></td>
                    <td colSpan="3">
                      <strong>Cumplimiento Promedio: {(dataProduccion.reduce((acc, item) => acc + item.cumplimiento, 0) / dataProduccion.length).toFixed(1)}%</strong>
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
                      <span className="comparacion-valor meta">{item.meta.toLocaleString()}</span>
                    </div>
                    <div className="comparacion-item">
                      <span className="comparacion-label">Real</span>
                      <span className="comparacion-valor real">{item.total.toLocaleString()}</span>
                    </div>
                    <div className="comparacion-item">
                      <span className="comparacion-label">Entregadas</span>
                      <span className="comparacion-valor entregadas">{item.entregadas.toLocaleString()} pz</span>
                    </div>
                  </div>
                  <div className="cumplimiento-bar">
                    <div className="barra-label">
                      <span>Cumplimiento</span>
                      <span>{item.cumplimiento.toFixed(1)}%</span>
                    </div>
                    <div className="barra-contenedor">
                      <div className="barra-llenado" style={{width: `${item.cumplimiento}%`, backgroundColor: item.color}}></div>
                    </div>
                  </div>
                  <div className="card-footer">
                    <span className={`variation-badge ${item.variacion > 0 ? 'positive' : 'negative'}`}>
                      {item.tendencia} {Math.abs(item.variacion)}%
                    </span>
                    <button className="mini-btn">Ver detalles</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {vistaProduccion === 'grafico' && (
            <div className="chart-container meta-real-grafico">
              <h3>Comparativa Meta vs Real vs Entregadas</h3>
              <div className="comparativa-barras">
                {dataProduccion.map((item, index) => (
                  <div key={index} className="comparativa-item">
                    <div className="comparativa-label">{item.area}</div>
                    <div className="barras-dobles">
                      <div className="barra-meta" style={{height: '30px'}}>
                        <div className="barra-meta-fill" style={{width: `${(item.meta / 15000) * 100}%`}}>
                          <span className="barra-texto">Meta: {item.meta.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="barra-real" style={{height: '30px'}}>
                        <div className="barra-real-fill" style={{width: `${(item.total / 15000) * 100}%`, backgroundColor: item.color}}>
                          <span className="barra-texto">Real: {item.total.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="barra-entregadas" style={{height: '30px'}}>
                        <div className="barra-entregadas-fill" style={{width: `${(item.entregadas / 15000) * 100}%`, backgroundColor: '#8b5cf6'}}>
                          <span className="barra-texto">Entregadas: {item.entregadas.toLocaleString()} pz</span>
                        </div>
                      </div>
                    </div>
                    <div className="comparativa-eficiencia">
                      <span>Cumplimiento: {item.cumplimiento.toFixed(1)}%</span>
                      <span className={`variacion ${item.variacion > 0 ? 'positive' : 'negative'}`}>
                        {item.tendencia} {Math.abs(item.variacion)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN 2: PLAN SEMANAL NIKE */}
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
              <span className="trend">▼ -2%</span>
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
              <span className="trend positive">▲ +5%</span>
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
              <span className="trend positive">▲ +12%</span>
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
              <span className="trend">▼ -1%</span>
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

            <table className="lotes-table">
              <thead>
                <tr>
                  <th>Lote</th>
                  <th>Área</th>
                  <th>Piezas</th>
                  <th>Fecha Entrega</th>
                  <th>Días</th>
                  <th>Horas</th>
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
          </div>
        )}

        {vistaNike === 'cards' && (
          <div className="lotes-cards">
            {lotesFiltrados.map((l, index) => (
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
            ))}
          </div>
        )}

        {vistaNike === 'grafico' && (
          <div className="analytics-container">
            <div className="charts-grid">
              <div className="chart-card">
                <h3>Distribución por Área</h3>
                <div className="donut-chart">
                  {Object.entries(chartData).map(([area, total], index) => (
                    <div key={index} className="chart-legend-item">
                      <span className="color-dot" style={{backgroundColor: ['#f97316', '#10b981', '#3b82f6', '#8b5cf6'][index]}}></span>
                      <span>{area}</span>
                      <span className="chart-value">{total.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="chart-card">
                <h3>Eficiencia por Lote</h3>
                <div className="trend-chart">
                  {lotes.map((l, index) => (
                    <div key={index} className="trend-bar" title={`${l.lote}: ${l.eficiencia}%`}>
                      <div className="trend-fill" style={{height: `${l.eficiencia}%`, backgroundColor: l.eficiencia > 90 ? '#10b981' : l.eficiencia > 80 ? '#f59e0b' : '#ef4444'}}></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="chart-card">
                <h3>Métricas Clave</h3>
                <div className="metrics-grid">
                  <div className="metric-item">
                    <span>Eficiencia Prom</span>
                    <strong>{(lotes.reduce((acc, l) => acc + l.eficiencia, 0) / lotes.length).toFixed(1)}%</strong>
                  </div>
                  <div className="metric-item">
                    <span>Tiempo Promedio</span>
                    <strong>{(lotes.reduce((acc, l) => acc + l.dias, 0) / lotes.length).toFixed(1)} días</strong>
                  </div>
                  <div className="metric-item">
                    <span>Lotes Críticos</span>
                    <strong className="critical">{lotes.filter(l => l.estado === 'Atraso Grave').length}</strong>
                  </div>
                  <div className="metric-item">
                    <span>Cumplimiento</span>
                    <strong>{(lotes.filter(l => l.estado !== 'Atraso Grave').length / lotes.length * 100).toFixed(1)}%</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
    </div>
  );
};

export default PlanSemanal;