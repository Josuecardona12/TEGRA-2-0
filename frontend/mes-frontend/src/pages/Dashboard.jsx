import React, { useState, useEffect, useRef } from 'react';
import './Dashboard.css';

const DashboardProduccion = () => {
  // ================ ESTADOS PRINCIPALES ================
  const [fechaActual, setFechaActual] = useState(new Date());
  const [periodo, setPeriodo] = useState('dia');
  const [vista, setVista] = useState('general');
  const [menuLateral, setMenuLateral] = useState(true);
  const [temaOscuro, setTemaOscuro] = useState(false);
  
  // ================ DATOS EN TIEMPO REAL ================
  const [produccionHora, setProduccionHora] = useState([
    { hora: '06:00', meta: 450, real: 445, eficiencia: 99, turno: 'A' },
    { hora: '07:00', meta: 450, real: 458, eficiencia: 102, turno: 'A' },
    { hora: '08:00', meta: 450, real: 462, eficiencia: 103, turno: 'A' },
    { hora: '09:00', meta: 450, real: 478, eficiencia: 106, turno: 'A' },
    { hora: '10:00', meta: 450, real: 481, eficiencia: 107, turno: 'A' },
    { hora: '11:00', meta: 450, real: 492, eficiencia: 109, turno: 'A' },
    { hora: '12:00', meta: 450, real: 485, eficiencia: 108, turno: 'A' },
    { hora: '13:00', meta: 450, real: 470, eficiencia: 104, turno: 'A' },
    { hora: '14:00', meta: 450, real: 475, eficiencia: 106, turno: 'B' },
    { hora: '15:00', meta: 450, real: 482, eficiencia: 107, turno: 'B' },
    { hora: '16:00', meta: 450, real: 488, eficiencia: 108, turno: 'B' },
    { hora: '17:00', meta: 450, real: 479, eficiencia: 106, turno: 'B' },
    { hora: '18:00', meta: 450, real: 465, eficiencia: 103, turno: 'B' },
    { hora: '19:00', meta: 450, real: 455, eficiencia: 101, turno: 'B' },
    { hora: '20:00', meta: 450, real: 442, eficiencia: 98, turno: 'B' },
    { hora: '21:00', meta: 450, real: 438, eficiencia: 97, turno: 'B' },
    { hora: '22:00', meta: 450, real: 425, eficiencia: 94, turno: 'C' },
    { hora: '23:00', meta: 450, real: 415, eficiencia: 92, turno: 'C' },
    { hora: '00:00', meta: 450, real: 402, eficiencia: 89, turno: 'C' },
    { hora: '01:00', meta: 450, real: 395, eficiencia: 88, turno: 'C' },
    { hora: '02:00', meta: 450, real: 388, eficiencia: 86, turno: 'C' },
    { hora: '03:00', meta: 450, real: 380, eficiencia: 84, turno: 'C' },
    { hora: '04:00', meta: 450, real: 375, eficiencia: 83, turno: 'C' },
    { hora: '05:00', meta: 450, real: 370, eficiencia: 82, turno: 'C' }
  ]);

  const [produccionDiaria, setProduccionDiaria] = useState([
    { dia: 'Lunes', fecha: '24/02', meta: 10800, real: 10650, eficiencia: 98.6, turnos: 3 },
    { dia: 'Martes', fecha: '25/02', meta: 10800, real: 10920, eficiencia: 101.1, turnos: 3 },
    { dia: 'Miércoles', fecha: '26/02', meta: 10800, real: 11050, eficiencia: 102.3, turnos: 3 },
    { dia: 'Jueves', fecha: '27/02', meta: 10800, real: 10880, eficiencia: 100.7, turnos: 3 },
    { dia: 'Viernes', fecha: '28/02', meta: 10800, real: 0, eficiencia: 0, turnos: 2 },
    { dia: 'Sábado', fecha: '01/03', meta: 7200, real: 0, eficiencia: 0, turnos: 1 },
    { dia: 'Domingo', fecha: '02/03', meta: 0, real: 0, eficiencia: 0, turnos: 0 }
  ]);

  const [produccionSemanal, setProduccionSemanal] = useState([
    { semana: 'Semana 9', fecha: '24/02 - 02/03', meta: 75600, real: 32500, eficiencia: 43.0, avance: 43 },
    { semana: 'Semana 8', fecha: '17/02 - 23/02', meta: 75600, real: 74800, eficiencia: 99.0, avance: 99 },
    { semana: 'Semana 7', fecha: '10/02 - 16/02', meta: 75600, real: 76200, eficiencia: 100.8, avance: 101 },
    { semana: 'Semana 6', fecha: '03/02 - 09/02', meta: 75600, real: 75100, eficiencia: 99.3, avance: 99 },
    { semana: 'Semana 5', fecha: '27/01 - 02/02', meta: 75600, real: 74900, eficiencia: 99.1, avance: 99 }
  ]);

  const [produccionMensual, setProduccionMensual] = useState([
    { mes: 'Enero', año: 2026, meta: 324000, real: 321500, eficiencia: 99.2, cumplimiento: 99 },
    { mes: 'Febrero', año: 2026, meta: 302400, real: 295800, eficiencia: 97.8, cumplimiento: 98 },
    { mes: 'Marzo', año: 2026, meta: 324000, real: 0, eficiencia: 0, cumplimiento: 0 },
    { mes: 'Abril', año: 2026, meta: 313200, real: 0, eficiencia: 0, cumplimiento: 0 },
    { mes: 'Mayo', año: 2026, meta: 324000, real: 0, eficiencia: 0, cumplimiento: 0 },
    { mes: 'Junio', año: 2026, meta: 313200, real: 0, eficiencia: 0, cumplimiento: 0 }
  ]);

  // ================ MÁQUINAS Y LÍNEAS ================
  const [maquinas, setMaquinas] = useState([
    { id: 1, nombre: 'Plotter HP Z6800', linea: 'Impresión', estado: 'produccion', operador: 'Carlos R.', eficiencia: 96, produccion: 1245, meta: 1300, uptime: 98, alertas: 0, temperatura: 42, velocidad: 85, tiempoRestante: '2.5h', orden: 'ORD-001' },
    { id: 2, nombre: 'Sublimadora Epson F950', linea: 'Sublimado', estado: 'produccion', operador: 'María G.', eficiencia: 94, produccion: 2341, meta: 2500, uptime: 97, alertas: 0, temperatura: 38, velocidad: 92, tiempoRestante: '1.5h', orden: 'ORD-003' },
    { id: 3, nombre: 'Cortadora Zund G3', linea: 'Corte', estado: 'produccion', operador: 'Juan P.', eficiencia: 91, produccion: 876, meta: 950, uptime: 95, alertas: 1, temperatura: 35, velocidad: 78, tiempoRestante: '0.8h', orden: 'ORD-002' },
    { id: 4, nombre: 'Impresora Durst Rho', linea: 'Impresión', estado: 'mantenimiento', operador: 'Ana L.', eficiencia: 0, produccion: 0, meta: 800, uptime: 82, alertas: 3, temperatura: 28, velocidad: 0, tiempoRestante: '3.0h', orden: 'N/A' },
    { id: 5, nombre: 'Plancha Monti', linea: 'Terminado', estado: 'produccion', operador: 'Pedro M.', eficiencia: 98, produccion: 567, meta: 600, uptime: 99, alertas: 0, temperatura: 180, velocidad: 75, tiempoRestante: '1.2h', orden: 'ORD-004' },
    { id: 6, nombre: 'Plotter Mimaki', linea: 'Impresión', estado: 'produccion', operador: 'Luisa F.', eficiencia: 89, produccion: 1450, meta: 1600, uptime: 93, alertas: 2, temperatura: 41, velocidad: 78, tiempoRestante: '2.0h', orden: 'ORD-005' },
    { id: 7, nombre: 'Sublimadora Sawgrass', linea: 'Sublimado', estado: 'inactiva', operador: 'Roberto C.', eficiencia: 0, produccion: 670, meta: 900, uptime: 88, alertas: 1, temperatura: 22, velocidad: 0, tiempoRestante: '0h', orden: 'N/A' },
    { id: 8, nombre: 'Cortadora Kongsberg', linea: 'Corte', estado: 'produccion', operador: 'Sofía R.', eficiencia: 93, produccion: 1820, meta: 2000, uptime: 96, alertas: 0, temperatura: 37, velocidad: 82, tiempoRestante: '2.8h', orden: 'ORD-006' },
    { id: 9, nombre: 'Bordadora Tajima', linea: 'Bordado', estado: 'produccion', operador: 'Jorge L.', eficiencia: 87, produccion: 345, meta: 400, uptime: 91, alertas: 1, temperatura: 45, velocidad: 65, tiempoRestante: '1.8h', orden: 'ORD-007' },
    { id: 10, nombre: 'Laminadora', linea: 'Acabado', estado: 'produccion', operador: 'Carmen V.', eficiencia: 92, produccion: 890, meta: 950, uptime: 94, alertas: 0, temperatura: 52, velocidad: 70, tiempoRestante: '2.3h', orden: 'ORD-008' },
    { id: 11, nombre: 'Dobladora', linea: 'Metal', estado: 'produccion', operador: 'Diego H.', eficiencia: 90, produccion: 560, meta: 600, uptime: 92, alertas: 1, temperatura: 48, velocidad: 60, tiempoRestante: '1.5h', orden: 'ORD-009' },
    { id: 12, nombre: 'Ensambladora', linea: 'Ensamblaje', estado: 'produccion', operador: 'Laura P.', eficiencia: 95, produccion: 780, meta: 800, uptime: 97, alertas: 0, temperatura: 36, velocidad: 72, tiempoRestante: '2.0h', orden: 'ORD-010' }
  ]);

  // ================ ÓRDENES DE PRODUCCIÓN ================
  const [ordenes, setOrdenes] = useState([
    { id: 'ORD-001', cliente: 'Nike', producto: 'Camisetas MLB', cantidad: 1500, producido: 1245, pendiente: 255, avance: 83, linea: 'Impresión', fechaEntrega: '15/03/2026', prioridad: 'alta', estado: 'en_proceso' },
    { id: 'ORD-002', cliente: 'NBA', producto: 'Gorras NBA', cantidad: 800, producido: 876, pendiente: 0, avance: 100, linea: 'Corte', fechaEntrega: '10/03/2026', prioridad: 'media', estado: 'completada' },
    { id: 'ORD-003', cliente: 'RUN', producto: 'Uniformes NFL', cantidad: 2000, producido: 1450, pendiente: 550, avance: 73, linea: 'Sublimado', fechaEntrega: '20/03/2026', prioridad: 'alta', estado: 'en_proceso' },
    { id: 'ORD-004', cliente: 'Fanatics', producto: 'Sudadera NHL', cantidad: 600, producido: 345, pendiente: 255, avance: 58, linea: 'Bordado', fechaEntrega: '18/03/2026', prioridad: 'baja', estado: 'en_proceso' },
    { id: 'ORD-005', cliente: 'NikeRetail', producto: 'Camisetas FIFA', cantidad: 1200, producido: 890, pendiente: 310, avance: 74, linea: 'Acabado', fechaEntrega: '22/03/2026', prioridad: 'media', estado: 'en_proceso' },
    { id: 'ORD-006', cliente: 'Sport', producto: 'Pantalones', cantidad: 900, producido: 560, pendiente: 340, avance: 62, linea: 'Metal', fechaEntrega: '25/03/2026', prioridad: 'baja', estado: 'en_proceso' },
    { id: 'ORD-007', cliente: 'NHL', producto: 'Chalecos', cantidad: 400, producido: 0, pendiente: 400, avance: 0, linea: 'Ensamblaje', fechaEntrega: '28/03/2026', prioridad: 'media', estado: 'pendiente' },
    { id: 'ORD-008', cliente: 'Running', producto: 'Jerseys', cantidad: 750, producido: 0, pendiente: 750, avance: 0, linea: 'Impresión', fechaEntrega: '30/03/2026', prioridad: 'baja', estado: 'pendiente' }
  ]);

  // ================ PERSONAL Y TURNOS ================
  const [personal, setPersonal] = useState({
    total: 145,
    presentes: 128,
    ausentes: 12,
    vacaciones: 5,
    turnoA: 52,
    turnoB: 48,
    turnoC: 28,
    eficienciaGeneral: 94,
    productividad: 92,
    satisfaccion: 88,
    capacitacion: 76
  });

  const [turnos, setTurnos] = useState([
    { turno: 'A', horario: '06:00 - 14:00', personal: 52, produccion: 3875, eficiencia: 106, meta: 3600, supervisor: 'Carlos Ruiz' },
    { turno: 'B', horario: '14:00 - 22:00', personal: 48, produccion: 3250, eficiencia: 98, meta: 3300, supervisor: 'María López' },
    { turno: 'C', horario: '22:00 - 06:00', personal: 28, produccion: 1650, eficiencia: 87, meta: 1900, supervisor: 'Juan Pérez' }
  ]);

  // ================ CALIDAD ================
  const [calidad, setCalidad] = useState({
    tasaAprobacion: 97.5,
    rechazos: 125,
    reprocesos: 45,
    scrap: 2.5,
    inspecciones: 12500,
    quejasCliente: 3,
    devoluciones: 8
  });

  const [defectos, setDefectos] = useState([
    { tipo: 'Impresión', cantidad: 45, porcentaje: 36, tendencia: 'down' },
    { tipo: 'Corte', cantidad: 32, porcentaje: 25.6, tendencia: 'stable' },
    { tipo: 'Color', cantidad: 28, porcentaje: 22.4, tendencia: 'up' },
    { tipo: 'Acabado', cantidad: 20, porcentaje: 16, tendencia: 'down' }
  ]);

  // ================ INVENTARIO ================
  const [inventario, setInventario] = useState({
    materiaPrima: 78,
    productoTerminado: 65,
    insumos: 82,
    criticidad: 15
  });

  // ================ SIMULACIÓN TIEMPO REAL ================
  useEffect(() => {
    const interval = setInterval(() => {
      setFechaActual(new Date());
      
      // Actualizar producción por hora
      setProduccionHora(prev => {
        const nuevas = [...prev];
        const horaActual = new Date().getHours();
        const indice = nuevas.findIndex(p => parseInt(p.hora) === horaActual);
        
        if (indice >= 0) {
          nuevas[indice] = {
            ...nuevas[indice],
            real: Math.min(nuevas[indice].real + Math.floor(Math.random() * 3) + 1, nuevas[indice].meta * 1.15),
            eficiencia: Math.round((nuevas[indice].real / nuevas[indice].meta) * 100)
          };
        }
        return nuevas;
      });

      // Actualizar producción diaria
      setProduccionDiaria(prev => {
        const hoy = new Date().getDay();
        const indice = hoy === 0 ? 6 : hoy - 1;
        if (indice >= 0 && indice < prev.length) {
          const totalHoy = produccionHora.reduce((acc, p) => acc + p.real, 0);
          prev[indice] = {
            ...prev[indice],
            real: totalHoy,
            eficiencia: Math.round((totalHoy / prev[indice].meta) * 100)
          };
        }
        return [...prev];
      });

      // Actualizar máquinas
      setMaquinas(prev => prev.map(m => {
        if (m.estado === 'produccion') {
          const nuevoProducido = m.produccion + Math.floor(Math.random() * 2);
          return {
            ...m,
            produccion: nuevoProducido,
            eficiencia: Math.round((nuevoProducido / m.meta) * 100),
            temperatura: m.temperatura + (Math.random() * 0.5 - 0.25)
          };
        }
        return m;
      }));

      // Actualizar calidad
      setCalidad(prev => ({
        ...prev,
        inspecciones: prev.inspecciones + Math.floor(Math.random() * 5)
      }));

    }, 3000);

    return () => clearInterval(interval);
  }, [produccionHora]);

  // ================ FUNCIONES AUXILIARES ================
  const formatNumber = (num) => {
    return new Intl.NumberFormat('es-MX').format(num);
  };

  const formatPercent = (num) => {
    return `${num}%`;
  };

  const getStatusColor = (estado) => {
    switch(estado) {
      case 'produccion': return '#10b981';
      case 'mantenimiento': return '#f59e0b';
      case 'inactiva': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getEficienciaColor = (eficiencia) => {
    if (eficiencia >= 100) return '#10b981';
    if (eficiencia >= 90) return '#3b82f6';
    if (eficiencia >= 80) return '#f59e0b';
    return '#ef4444';
  };

  // ================ RENDER GRÁFICAS ================
  const renderGraficoProduccionHora = () => {
    const maxValor = Math.max(...produccionHora.map(p => p.meta)) * 1.2;
    const datosVisibles = produccionHora.slice(0, 12);

    return (
      <div className="grafico-barras-container">
        {datosVisibles.map((item, index) => (
          <div key={index} className="barra-grupo">
            <div className="barra-meta" style={{ height: `${(item.meta / maxValor) * 180}px` }}>
              <span className="barra-meta-valor">{item.meta}</span>
            </div>
            <div 
              className="barra-real" 
              style={{ 
                height: `${(item.real / maxValor) * 180}px`,
                backgroundColor: getEficienciaColor(item.eficiencia)
              }}
            >
              <span className="barra-real-valor">{item.real}</span>
            </div>
            <div className="barra-etiqueta">
              <span>{item.hora}</span>
              <span className="barra-turno">{item.turno}</span>
            </div>
            {item.eficiencia >= 100 && (
              <span className="barra-badge">🔥</span>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderGraficoLineas = () => {
    const puntos = produccionHora.map((p, i) => {
      const x = (i / produccionHora.length) * 800;
      const y = 200 - (p.real / 600) * 180;
      return `${x},${y}`;
    }).join(' ');

    const puntosMeta = produccionHora.map((p, i) => {
      const x = (i / produccionHora.length) * 800;
      const y = 200 - (p.meta / 600) * 180;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg viewBox="0 0 800 200" className="grafico-lineas">
        <defs>
          <linearGradient id="gradienteArea" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
          </linearGradient>
        </defs>
        
        <polyline
          points={puntosMeta}
          fill="none"
          stroke="#94a3b8"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
        
        <polyline
          points={puntos}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
        />
        
        <polygon
          points={`0,200 ${puntos} 800,200`}
          fill="url(#gradienteArea)"
        />
        
        {produccionHora.map((p, i) => (
          <circle
            key={i}
            cx={(i / produccionHora.length) * 800}
            cy={200 - (p.real / 600) * 180}
            r="4"
            fill="#3b82f6"
            className="punto-linea"
          />
        ))}
      </svg>
    );
  };

  const renderGraficoCircular = (valor, total, color, tamaño = 120) => {
    const porcentaje = (valor / total) * 100;
    const dash = (porcentaje / 100) * 283;
    
    return (
      <svg width={tamaño} height={tamaño} viewBox="0 0 100 100" className="grafico-circular">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash}, 283`}
          transform="rotate(-90 50 50)"
        />
        <text x="50" y="55" textAnchor="middle" className="grafico-texto">
          {Math.round(porcentaje)}%
        </text>
      </svg>
    );
  };

  return (
    <div className={`dashboard-maquila ${temaOscuro ? 'tema-oscuro' : ''}`}>
      
      {/* ========== HEADER PRINCIPAL ========== */}
      <header className="dashboard-header">
        <div className="header-left">
          <button className="menu-toggle" onClick={() => setMenuLateral(!menuLateral)}>
            <span className="menu-icon">☰</span>
          </button>
          
          <div className="logo-area">
            <div className="logo-icon">T</div>
            <div className="logo-texto">
              <h1>TEGRA</h1>
              <span>Manufacturing Suite</span>
            </div>
          </div>

          <div className="fecha-display">
            <span className="fecha-icon">📅</span>
            <div className="fecha-info">
              <span className="fecha-dia">
                {fechaActual.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="fecha-hora">
                {fechaActual.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        <div className="header-right">
          <div className="live-indicator">
            <span className="live-pulse"></span>
            <span className="live-text">TIEMPO REAL</span>
          </div>

          <div className="tema-toggle" onClick={() => setTemaOscuro(!temaOscuro)}>
            {temaOscuro ? '☀️' : '🌙'}
          </div>

          <div className="usuario-info">
            <div className="usuario-avatar">JC</div>
            <div className="usuario-detalles">
              <span className="usuario-nombre">Josué Cardona</span>
              <span className="usuario-rol">Director de Operaciones</span>
            </div>
          </div>
        </div>
      </header>

      {/* ========== MENÚ LATERAL ========== */}
      <aside className={`menu-lateral ${menuLateral ? 'abierto' : ''}`}>
        <nav className="menu-nav">
          <div className="menu-seccion">
            <h4>PRINCIPAL</h4>
            <button className={`menu-item ${vista === 'general' ? 'active' : ''}`} onClick={() => setVista('general')}>
              <span className="item-icon">📊</span>
              <span>Dashboard General</span>
            </button>
            <button className="menu-item">
              <span className="item-icon">⚙️</span>
              <span>Máquinas</span>
              <span className="item-badge">12</span>
            </button>
            <button className="menu-item">
              <span className="item-icon">📋</span>
              <span>Órdenes</span>
              <span className="item-badge">8</span>
            </button>
            <button className="menu-item">
              <span className="item-icon">👥</span>
              <span>Personal</span>
              <span className="item-badge">145</span>
            </button>
          </div>

          <div className="menu-seccion">
            <h4>PRODUCCIÓN</h4>
            <button className="menu-item">
              <span className="item-icon">📈</span>
              <span>Plan de Producción</span>
            </button>
            <button className="menu-item">
              <span className="item-icon">🔄</span>
              <span>Líneas de Ensamble</span>
            </button>
            <button className="menu-item">
              <span className="item-icon">✅</span>
              <span>Control de Calidad</span>
            </button>
            <button className="menu-item">
              <span className="item-icon">📦</span>
              <span>Inventario</span>
            </button>
          </div>

          <div className="menu-seccion">
            <h4>ANÁLISIS</h4>
            <button className="menu-item">
              <span className="item-icon">📊</span>
              <span>Eficiencia OEE</span>
            </button>
            <button className="menu-item">
              <span className="item-icon">📉</span>
              <span>Tendencias</span>
            </button>
            <button className="menu-item">
              <span className="item-icon">💰</span>
              <span>Costos</span>
            </button>
            <button className="menu-item">
              <span className="item-icon">📑</span>
              <span>Reportes</span>
            </button>
          </div>

          <div className="menu-seccion">
            <h4>CONFIGURACIÓN</h4>
            <button className="menu-item">
              <span className="item-icon">⚙️</span>
              <span>Ajustes</span>
            </button>
            <button className="menu-item">
              <span className="item-icon">👤</span>
              <span>Mi Perfil</span>
            </button>
            <button className="menu-item">
              <span className="item-icon">🔒</span>
              <span>Seguridad</span>
            </button>
          </div>
        </nav>

        <div className="menu-footer">
          <div className="sistema-status">
            <span className="status-dot verde"></span>
            <span>Sistema Operativo</span>
          </div>
          <div className="sistema-info">
            <span>v3.2.0</span>
            <span>•</span>
            <span>Producción</span>
          </div>
        </div>
      </aside>

      {/* ========== CONTENIDO PRINCIPAL ========== */}
      <main className={`contenido-principal ${menuLateral ? 'con-menu' : ''}`}>
        
        {/* ========== SELECTOR DE PERÍODO ========== */}
        <div className="periodo-selector">
          <button className={`periodo-btn ${periodo === 'dia' ? 'active' : ''}`} onClick={() => setPeriodo('dia')}>
            DÍA
          </button>
          <button className={`periodo-btn ${periodo === 'semana' ? 'active' : ''}`} onClick={() => setPeriodo('semana')}>
            SEMANA
          </button>
          <button className={`periodo-btn ${periodo === 'mes' ? 'active' : ''}`} onClick={() => setPeriodo('mes')}>
            MES
          </button>
          <button className={`periodo-btn ${periodo === 'trimestre' ? 'active' : ''}`} onClick={() => setPeriodo('trimestre')}>
            TRIMESTRE
          </button>
          <button className={`periodo-btn ${periodo === 'año' ? 'active' : ''}`} onClick={() => setPeriodo('año')}>
            AÑO
          </button>
          
          <div className="periodo-acciones">
            <button className="accion-btn" title="Exportar datos">
              📥 Exportar
            </button>
            <button className="accion-btn" title="Actualizar">
              🔄 Actualizar
            </button>
          </div>
        </div>

        {/* ========== KPI PRINCIPALES ========== */}
        <div className="kpi-grid">
          <div className="kpi-card produccion">
            <div className="kpi-icono">📊</div>
            <div className="kpi-contenido">
              <span className="kpi-valor">{formatNumber(produccionDiaria.find(d => d.dia === 'Jueves')?.real || 0)}</span>
              <span className="kpi-etiqueta">Producción Hoy</span>
              <div className="kpi-tendencia positiva">
                <span>↑ 8.5%</span>
                <span>vs ayer</span>
              </div>
            </div>
            <div className="kpi-mini-grafica">
              {renderGraficoCircular(produccionDiaria.find(d => d.dia === 'Jueves')?.eficiencia || 0, 100, '#3b82f6', 60)}
            </div>
          </div>

          <div className="kpi-card oee">
            <div className="kpi-icono">⚡</div>
            <div className="kpi-contenido">
              <span className="kpi-valor">{personal.eficienciaGeneral}%</span>
              <span className="kpi-etiqueta">OEE Global</span>
              <div className="kpi-tendencia positiva">
                <span>↑ 2.3%</span>
                <span>vs ayer</span>
              </div>
            </div>
            <div className="oee-detalle">
              <div className="oee-item">
                <span>D</span>
                <span>{personal.disponibilidad}%</span>
              </div>
              <div className="oee-item">
                <span>R</span>
                <span>{personal.productividad}%</span>
              </div>
              <div className="oee-item">
                <span>C</span>
                <span>{calidad.tasaAprobacion}%</span>
              </div>
            </div>
          </div>

          <div className="kpi-card maquinas">
            <div className="kpi-icono">⚙️</div>
            <div className="kpi-contenido">
              <span className="kpi-valor">{maquinas.filter(m => m.estado === 'produccion').length}/{maquinas.length}</span>
              <span className="kpi-etiqueta">Máquinas Activas</span>
              <div className="kpi-mini-status">
                <span className="status-badge disponible">8 activas</span>
                <span className="status-badge inactiva">2 inactivas</span>
                <span className="status-badge mantenimiento">2 mantenimiento</span>
              </div>
            </div>
          </div>

          <div className="kpi-card personal">
            <div className="kpi-icono">👥</div>
            <div className="kpi-contenido">
              <span className="kpi-valor">{personal.presentes}/{personal.total}</span>
              <span className="kpi-etiqueta">Personal Activo</span>
              <div className="kpi-mini-status">
                <span className="turno-badge A">A: {personal.turnoA}</span>
                <span className="turno-badge B">B: {personal.turnoB}</span>
                <span className="turno-badge C">C: {personal.turnoC}</span>
              </div>
            </div>
          </div>

          <div className="kpi-card calidad">
            <div className="kpi-icono">✅</div>
            <div className="kpi-contenido">
              <span className="kpi-valor">{calidad.tasaAprobacion}%</span>
              <span className="kpi-etiqueta">Calidad</span>
              <div className="kpi-tendencia positiva">
                <span>↑ 1.2%</span>
                <span>rechazos: {calidad.rechazos}</span>
              </div>
            </div>
          </div>

          <div className="kpi-card cumplimiento">
            <div className="kpi-icono">🎯</div>
            <div className="kpi-contenido">
              <span className="kpi-valor">94%</span>
              <span className="kpi-etiqueta">Cumplimiento</span>
              <div className="kpi-barra">
                <div className="kpi-barra-fill" style={{ width: '94%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* ========== GRÁFICO PRINCIPAL ========== */}
        <div className="grafico-principal">
          <div className="grafico-header">
            <div className="grafico-titulo">
              <h3>Producción por Hora - Tiempo Real</h3>
              <div className="grafico-leyenda">
                <span className="leyenda-item">
                  <span className="leyenda-color real"></span>
                  Producción Real
                </span>
                <span className="leyenda-item">
                  <span className="leyenda-color meta"></span>
                  Meta
                </span>
                <span className="leyenda-item">
                  <span className="leyenda-color turnoA"></span>
                  Turno A
                </span>
                <span className="leyenda-item">
                  <span className="leyenda-color turnoB"></span>
                  Turno B
                </span>
                <span className="leyenda-item">
                  <span className="leyenda-color turnoC"></span>
                  Turno C
                </span>
              </div>
            </div>
            <div className="grafico-controles">
              <button className="control-grafico active">📊 Barras</button>
              <button className="control-grafico">📈 Líneas</button>
              <button className="control-grafico">📉 Áreas</button>
            </div>
          </div>
          <div className="grafico-body">
            {renderGraficoProduccionHora()}
          </div>
          <div className="grafico-footer">
            <div className="total-produccion">
              <span>Total hoy:</span>
              <strong>{formatNumber(produccionHora.reduce((acc, p) => acc + p.real, 0))} unidades</strong>
            </div>
            <div className="meta-produccion">
              <span>Meta hoy:</span>
              <strong>{formatNumber(produccionHora.reduce((acc, p) => acc + p.meta, 0))} unidades</strong>
            </div>
            <div className="eficiencia-promedio">
              <span>Eficiencia promedio:</span>
              <strong style={{ color: getEficienciaColor(Math.round(produccionHora.reduce((acc, p) => acc + p.eficiencia, 0) / produccionHora.length)) }}>
                {Math.round(produccionHora.reduce((acc, p) => acc + p.eficiencia, 0) / produccionHora.length)}%
              </strong>
            </div>
          </div>
        </div>

        {/* ========== FILA DE GRÁFICOS SECUNDARIOS ========== */}
        <div className="graficos-secundarios">
          
          {/* Producción por Día */}
          <div className="grafico-card">
            <div className="card-header">
              <h4>Producción por Día</h4>
              <button className="card-btn">Ver detalles →</button>
            </div>
            <div className="card-body">
              {produccionDiaria.map((dia, index) => (
                <div key={index} className="dia-item">
                  <div className="dia-info">
                    <span className="dia-nombre">{dia.dia}</span>
                    <span className="dia-fecha">{dia.fecha}</span>
                  </div>
                  <div className="dia-barra-container">
                    <div 
                      className="dia-barra" 
                      style={{ 
                        width: `${(dia.real / dia.meta) * 100}%`,
                        backgroundColor: getEficienciaColor(dia.eficiencia)
                      }}
                    ></div>
                  </div>
                  <div className="dia-valores">
                    <span className="dia-real">{formatNumber(dia.real)}</span>
                    <span className="dia-meta">/{formatNumber(dia.meta)}</span>
                    <span className="dia-eficiencia" style={{ color: getEficienciaColor(dia.eficiencia) }}>
                      {dia.eficiencia}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Estado de Máquinas */}
          <div className="grafico-card">
            <div className="card-header">
              <h4>Máquinas en Tiempo Real</h4>
              <button className="card-btn">Ver todas →</button>
            </div>
            <div className="card-body maquinas-lista">
              {maquinas.slice(0, 6).map(maquina => (
                <div key={maquina.id} className="maquina-item-lista">
                  <div className="maquina-info">
                    <div className="maquina-nombre">
                      <span className={`maquina-estado-dot ${maquina.estado}`}></span>
                      <span>{maquina.nombre}</span>
                    </div>
                    <span className="maquina-linea">{maquina.linea}</span>
                  </div>
                  <div className="maquina-stats">
                    <div className="maquina-eficiencia">
                      <div className="eficiencia-barra">
                        <div 
                          className="eficiencia-fill" 
                          style={{ 
                            width: `${maquina.eficiencia}%`,
                            backgroundColor: getEficienciaColor(maquina.eficiencia)
                          }}
                        ></div>
                      </div>
                      <span className="eficiencia-valor">{maquina.eficiencia}%</span>
                    </div>
                    <span className="maquina-temp">{maquina.temperatura}°C</span>
                  </div>
                  <div className="maquina-footer">
                    <span className="maquina-operador">👤 {maquina.operador}</span>
                    <span className="maquina-orden">{maquina.orden}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rendimiento por Turno */}
          <div className="grafico-card">
            <div className="card-header">
              <h4>Rendimiento por Turno</h4>
              <button className="card-btn">Ver detalles →</button>
            </div>
            <div className="card-body">
              {turnos.map((turno, index) => (
                <div key={index} className="turno-item">
                  <div className="turno-header">
                    <span className={`turno-badge ${turno.turno}`}>Turno {turno.turno}</span>
                    <span className="turno-horario">{turno.horario}</span>
                    <span className="turno-supervisor">{turno.supervisor}</span>
                  </div>
                  <div className="turno-stats">
                    <div className="turno-stat">
                      <span className="stat-label">Personal</span>
                      <span className="stat-valor">{turno.personal}</span>
                    </div>
                    <div className="turno-stat">
                      <span className="stat-label">Producción</span>
                      <span className="stat-valor">{formatNumber(turno.produccion)}</span>
                    </div>
                    <div className="turno-stat">
                      <span className="stat-label">Meta</span>
                      <span className="stat-valor">{formatNumber(turno.meta)}</span>
                    </div>
                    <div className="turno-stat">
                      <span className="stat-label">Eficiencia</span>
                      <span className="stat-valor" style={{ color: getEficienciaColor(turno.eficiencia) }}>
                        {turno.eficiencia}%
                      </span>
                    </div>
                  </div>
                  <div className="turno-progreso">
                    <div 
                      className="turno-progreso-fill" 
                      style={{ 
                        width: `${(turno.produccion / turno.meta) * 100}%`,
                        backgroundColor: getEficienciaColor(turno.eficiencia)
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calidad */}
          <div className="grafico-card">
            <div className="card-header">
              <h4>Control de Calidad</h4>
              <button className="card-btn">Ver reporte →</button>
            </div>
            <div className="card-body">
              <div className="calidad-grid">
                <div className="calidad-item">
                  <span className="calidad-label">Aprobación</span>
                  <span className="calidad-valor">{calidad.tasaAprobacion}%</span>
                  <div className="calidad-barra">
                    <div className="calidad-barra-fill" style={{ width: `${calidad.tasaAprobacion}%` }}></div>
                  </div>
                </div>
                <div className="calidad-item">
                  <span className="calidad-label">Rechazos</span>
                  <span className="calidad-valor">{calidad.rechazos}</span>
                  <div className="calidad-barra">
                    <div className="calidad-barra-fill" style={{ width: (calidad.rechazos / calidad.inspecciones) * 100 }}></div>
                  </div>
                </div>
                <div className="calidad-item">
                  <span className="calidad-label">Reprocesos</span>
                  <span className="calidad-valor">{calidad.reprocesos}</span>
                </div>
                <div className="calidad-item">
                  <span className="calidad-label">Scrap</span>
                  <span className="calidad-valor">{calidad.scrap}%</span>
                </div>
              </div>

              <div className="defectos-lista">
                <h5>Defectos por tipo</h5>
                {defectos.map((defecto, index) => (
                  <div key={index} className="defecto-item">
                    <div className="defecto-info">
                      <span>{defecto.tipo}</span>
                      <span className={`defecto-tendencia ${defecto.tendencia}`}>
                        {defecto.tendencia === 'up' ? '↑' : defecto.tendencia === 'down' ? '↓' : '→'}
                      </span>
                    </div>
                    <div className="defecto-barra-container">
                      <div className="defecto-barra" style={{ width: `${defecto.porcentaje}%` }}></div>
                    </div>
                    <span className="defecto-cantidad">{defecto.cantidad}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ========== TABLA DE ÓRDENES ========== */}
        <div className="ordenes-table-container">
          <div className="table-header">
            <h3>Órdenes de Producción Activas</h3>
            <div className="table-actions">
              <button className="table-btn">Filtrar</button>
              <button className="table-btn primary">Nueva Orden</button>
            </div>
          </div>
          
          <div className="table-responsive">
            <table className="ordenes-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Producido</th>
                  <th>Pendiente</th>
                  <th>Avance</th>
                  <th>Línea</th>
                  <th>Entrega</th>
                  <th>Prioridad</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ordenes.filter(o => o.estado !== 'completada').map(orden => (
                  <tr key={orden.id}>
                    <td className="orden-id">{orden.id}</td>
                    <td>{orden.cliente}</td>
                    <td>{orden.producto}</td>
                    <td className="orden-cantidad">{formatNumber(orden.cantidad)}</td>
                    <td className="orden-producido">{formatNumber(orden.producido)}</td>
                    <td className="orden-pendiente">{formatNumber(orden.pendiente)}</td>
                    <td>
                      <div className="table-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ 
                              width: `${orden.avance}%`,
                              backgroundColor: getEficienciaColor(orden.avance)
                            }}
                          ></div>
                        </div>
                        <span className="progress-text">{orden.avance}%</span>
                      </div>
                    </td>
                    <td>{orden.linea}</td>
                    <td className="orden-fecha">{orden.fechaEntrega}</td>
                    <td>
                      <span className={`prioridad-badge ${orden.prioridad}`}>
                        {orden.prioridad}
                      </span>
                    </td>
                    <td>
                      <span className={`estado-badge ${orden.estado}`}>
                        {orden.estado.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div className="table-acciones">
                        <button className="accion-icono" title="Ver detalles">👁️</button>
                        <button className="accion-icono" title="Editar">✏️</button>
                        <button className="accion-icono" title="Más">⋯</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========== ESTADÍSTICAS AVANZADAS ========== */}
        <div className="estadisticas-avanzadas">
          
          <div className="estadistica-card">
            <h4>OEE por Línea</h4>
            <div className="oee-lineas">
              <div className="oee-linea">
                <span className="linea-nombre">Impresión</span>
                <div className="linea-barra">
                  <div className="linea-fill" style={{ width: '92%' }}></div>
                </div>
                <span className="linea-valor">92%</span>
              </div>
              <div className="oee-linea">
                <span className="linea-nombre">Sublimado</span>
                <div className="linea-barra">
                  <div className="linea-fill" style={{ width: '88%' }}></div>
                </div>
                <span className="linea-valor">88%</span>
              </div>
              <div className="oee-linea">
                <span className="linea-nombre">Corte</span>
                <div className="linea-barra">
                  <div className="linea-fill" style={{ width: '91%' }}></div>
                </div>
                <span className="linea-valor">91%</span>
              </div>
              <div className="oee-linea">
                <span className="linea-nombre">Bordado</span>
                <div className="linea-barra">
                  <div className="linea-fill" style={{ width: '87%' }}></div>
                </div>
                <span className="linea-valor">87%</span>
              </div>
              <div className="oee-linea">
                <span className="linea-nombre">Acabado</span>
                <div className="linea-barra">
                  <div className="linea-fill" style={{ width: '93%' }}></div>
                </div>
                <span className="linea-valor">93%</span>
              </div>
            </div>
          </div>

          <div className="estadistica-card">
            <h4>Indicadores Clave</h4>
            <div className="indicadores-grid">
              <div className="indicador">
                <span className="indicador-label">MTBF</span>
                <span className="indicador-valor">245 h</span>
                <span className="indicador-trend up">↑ 12h</span>
              </div>
              <div className="indicador">
                <span className="indicador-label">MTTR</span>
                <span className="indicador-valor">2.5 h</span>
                <span className="indicador-trend down">↓ 0.3h</span>
              </div>
              <div className="indicador">
                <span className="indicador-label">Takt Time</span>
                <span className="indicador-valor">45 s</span>
                <span className="indicador-trend stable">→</span>
              </div>
              <div className="indicador">
                <span className="indicador-label">Throughput</span>
                <span className="indicador-valor">120/h</span>
                <span className="indicador-trend up">↑ 8</span>
              </div>
              <div className="indicador">
                <span className="indicador-label">Scrap Rate</span>
                <span className="indicador-valor">2.5%</span>
                <span className="indicador-trend down">↓ 0.3%</span>
              </div>
              <div className="indicador">
                <span className="indicador-label">First Pass</span>
                <span className="indicador-valor">96.5%</span>
                <span className="indicador-trend up">↑ 1.2%</span>
              </div>
            </div>
          </div>

          <div className="estadistica-card">
            <h4>Alertas Activas</h4>
            <div className="alertas-lista">
              <div className="alerta-item critica">
                <span className="alerta-icono">🔴</span>
                <div className="alerta-contenido">
                  <span className="alerta-mensaje">Temperatura alta en Máquina 05</span>
                  <span className="alerta-tiempo">hace 2m</span>
                </div>
              </div>
              <div className="alerta-item advertencia">
                <span className="alerta-icono">🟠</span>
                <div className="alerta-contenido">
                  <span className="alerta-mensaje">Mantenimiento preventivo requerido</span>
                  <span className="alerta-tiempo">hace 15m</span>
                </div>
              </div>
              <div className="alerta-item info">
                <span className="alerta-icono">🔵</span>
                <div className="alerta-contenido">
                  <span className="alerta-mensaje">Orden ORD-003 completada</span>
                  <span className="alerta-tiempo">hace 25m</span>
                </div>
              </div>
              <div className="alerta-item critica">
                <span className="alerta-icono">🔴</span>
                <div className="alerta-contenido">
                  <span className="alerta-mensaje">Retraso en producción</span>
                  <span className="alerta-tiempo">hace 30m</span>
                </div>
              </div>
            </div>
            <button className="ver-todas-btn">Ver todas las alertas</button>
          </div>
        </div>

        {/* ========== FOOTER ========== */}
        <footer className="dashboard-footer">
          <div className="footer-left">
            <span>© 2026 TEGRA Manufacturing. Todos los derechos reservados.</span>
            <span className="footer-separator">•</span>
            <span>v3.2.0</span>
            <span className="footer-separator">•</span>
            <span>Actualización en tiempo real</span>
          </div>
          <div className="footer-right">
            <span className="tiempo-real">
              <span className="punto-verde"></span>
              Última actualización: {fechaActual.toLocaleTimeString()}
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default DashboardProduccion;