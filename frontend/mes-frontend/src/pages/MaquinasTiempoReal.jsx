import { useState, useEffect } from "react";
import "./MaquinasTiempoReal.css";

export default function MaquinasTiempoReal() {
  const [maquinas, setMaquinas] = useState([]);
  const [filtro, setFiltro] = useState("todas");
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date());

  useEffect(() => {
    // Datos iniciales con más variedad
    const datosIniciales = [
      { 
        id: 1, 
        nombre: "Máquina 01", 
        tipo: "Plotter", 
        status: "operando", 
        operador: "Carlos Rodríguez", 
        orden: "V108707", 
        progreso: 75, 
        tiempoRestante: "2h 15m", 
        eficiencia: 91, 
        temperatura: 42.8,
        alerta: false,
        color: "#ff6b6b"
      },
      { 
        id: 2, 
        nombre: "Máquina 02", 
        tipo: "Plotter", 
        status: "operando", 
        operador: "María López", 
        orden: "V109133", 
        progreso: 88, 
        tiempoRestante: "1h 20m", 
        eficiencia: 94, 
        temperatura: 41.2,
        alerta: false,
        color: "#4ecdc4"
      },
      { 
        id: 3, 
        nombre: "Máquina 03", 
        tipo: "Costura", 
        status: "operando", 
        operador: "Ana García", 
        orden: "V108994", 
        progreso: 58, 
        tiempoRestante: "4h 30m", 
        eficiencia: 82, 
        temperatura: 39.5,
        alerta: false,
        color: "#ffe66d"
      },
      { 
        id: 4, 
        nombre: "Máquina 04", 
        tipo: "Costura", 
        status: "pausa", 
        operador: "Pedro Sánchez", 
        orden: "V109217", 
        progreso: 45, 
        tiempoRestante: "5h 10m", 
        eficiencia: 0, 
        temperatura: 38.1,
        alerta: false,
        motivo: "Cambio de turno",
        color: "#ff9f1c"
      },
      { 
        id: 5, 
        nombre: "Máquina 05", 
        tipo: "Subimado", 
        status: "operando", 
        operador: "Laura Torres", 
        orden: "V108251", 
        progreso: 32, 
        tiempoRestante: "6h 45m", 
        eficiencia: 76, 
        temperatura: 40.3,
        alerta: false,
        color: "#bf7af0"
      },
      { 
        id: 6, 
        nombre: "Máquina 06", 
        tipo: "Subimado", 
        status: "error", 
        operador: "Roberto Díaz", 
        orden: "V109459", 
        progreso: 15, 
        tiempoRestante: "0m", 
        eficiencia: 0, 
        temperatura: 45.6,
        alerta: true,
        motivo: "Error de temperatura",
        color: "#ff6b6b"
      },
      { 
        id: 7, 
        nombre: "Máquina 07", 
        tipo: "Diseño", 
        status: "detenida", 
        operador: "Sofía Castro", 
        orden: "V108707", 
        progreso: 0, 
        tiempoRestante: "0m", 
        eficiencia: 0, 
        temperatura: 36.2,
        alerta: true,
        motivo: "Mantenimiento",
        color: "#feca57"
      },
      { 
        id: 8, 
        nombre: "Máquina 08", 
        tipo: "Plotter", 
        status: "operando", 
        operador: "Javier Ruiz", 
        orden: "V109133", 
        progreso: 62, 
        tiempoRestante: "3h 40m", 
        eficiencia: 87, 
        temperatura: 41.9,
        alerta: false,
        color: "#54a0ff"
      },
      { 
        id: 9, 
        nombre: "Máquina 09", 
        tipo: "Diseño", 
        status: "operando", 
        operador: "Miguel Ángel", 
        orden: "V108888", 
        progreso: 95, 
        tiempoRestante: "30m", 
        eficiencia: 98, 
        temperatura: 37.5,
        alerta: false,
        color: "#5f27cd"
      },
      { 
        id: 10, 
        nombre: "Máquina 10", 
        tipo: "Costura", 
        status: "pausa", 
        operador: "Lucía Méndez", 
        orden: "V109999", 
        progreso: 20, 
        tiempoRestante: "7h 30m", 
        eficiencia: 0, 
        temperatura: 36.8,
        alerta: false,
        motivo: "Descanso",
        color: "#00d2d3"
      },
    ];
    
    setMaquinas(datosIniciales);

    // Simular actualizaciones en tiempo real
    const interval = setInterval(() => {
      setMaquinas(prev => prev.map(m => {
        if (m.status === "operando") {
          const nuevoProgreso = Math.min(100, m.progreso + Math.floor(Math.random() * 3) + 1);
          const tiempoRestante = calcularTiempoRestante(nuevoProgreso);
          const nuevaTemperatura = m.temperatura + (Math.random() * 1 - 0.5);
          const alerta = nuevaTemperatura > 44;
          
          return {
            ...m,
            progreso: nuevoProgreso,
            tiempoRestante,
            temperatura: Math.round(nuevaTemperatura * 10) / 10,
            alerta,
            eficiencia: Math.min(100, m.eficiencia + (Math.random() * 3 - 1.5))
          };
        }
        return m;
      }));
      setUltimaActualizacion(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const calcularTiempoRestante = (progreso) => {
    const minutosRestantes = Math.round((100 - progreso) * 0.8 * 60 / 100);
    const horas = Math.floor(minutosRestantes / 60);
    const minutos = minutosRestantes % 60;
    return `${horas}h ${minutos}m`;
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      operando: { color: "#00b894", texto: "Operando", icono: "⚙️", bg: "#00b89420" },
      detenida: { color: "#d63031", texto: "Detenida", icono: "⏹️", bg: "#d6303120" },
      pausa: { color: "#fdcb6e", texto: "En Pausa", icono: "⏸️", bg: "#fdcb6e20" },
      error: { color: "#e17055", texto: "Error", icono: "⚠️", bg: "#e1705520" }
    };
    return statusMap[status];
  };

  const filteredMaquinas = filtro === "todas" 
    ? maquinas 
    : maquinas.filter(m => m.status === filtro);

  const stats = {
    total: maquinas.length,
    operando: maquinas.filter(m => m.status === "operando").length,
    detenidas: maquinas.filter(m => m.status === "detenida" || m.status === "error" || m.status === "pausa").length,
    alertas: maquinas.filter(m => m.alerta).length,
    eficienciaPromedio: Math.round(maquinas.filter(m => m.eficiencia > 0).reduce((acc, m) => acc + m.eficiencia, 0) / maquinas.filter(m => m.eficiencia > 0).length) || 0
  };

  return (
    <div className="maquinas-container-colorido">
      {/* Header con efecto arcoíris */}
      <div className="rainbow-header">
        <div className="header-content">
          <h1 className="rainbow-title">
            <span className="title-emoji">🏭</span>
            Máquinas en Tiempo Real
          </h1>
          <div className="live-badge">
            <span className="live-dot"></span>
            <span>ACTUALIZACIÓN EN VIVO</span>
          </div>
        </div>
        <p className="update-time">
          ⏱️ Última actualización: {ultimaActualizacion.toLocaleTimeString()}
        </p>
      </div>

      {/* Stats Cards Coloridas */}
      <div className="colorful-stats">
        <div className="stat-card-colorful" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
          <div className="stat-icon">🏭</div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Máquinas</span>
          </div>
        </div>

        <div className="stat-card-colorful" style={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" }}>
          <div className="stat-icon">⚙️</div>
          <div className="stat-info">
            <span className="stat-value">{stats.operando}</span>
            <span className="stat-label">Operando</span>
          </div>
        </div>

        <div className="stat-card-colorful" style={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" }}>
          <div className="stat-icon">⏸️</div>
          <div className="stat-info">
            <span className="stat-value">{stats.detenidas}</span>
            <span className="stat-label">Detenidas</span>
          </div>
        </div>

        <div className="stat-card-colorful" style={{ background: "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)" }}>
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <span className="stat-value">{stats.alertas}</span>
            <span className="stat-label">Alertas</span>
          </div>
        </div>

        <div className="stat-card-colorful" style={{ background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" }}>
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <span className="stat-value">{stats.eficienciaPromedio}%</span>
            <span className="stat-label">Eficiencia</span>
          </div>
        </div>
      </div>

      {/* Filtros Coloridos */}
      <div className="colorful-filters">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filtro === 'todas' ? 'active' : ''}`}
            onClick={() => setFiltro('todas')}
            style={{ background: filtro === 'todas' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#fff' }}
          >
             Todas
          </button>
          <button 
            className={`filter-btn ${filtro === 'operando' ? 'active' : ''}`}
            onClick={() => setFiltro('operando')}
            style={{ background: filtro === 'operando' ? 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)' : '#fff' }}
          >
            ⚙️ Operando
          </button>
          <button 
            className={`filter-btn ${filtro === 'pausa' ? 'active' : ''}`}
            onClick={() => setFiltro('pausa')}
            style={{ background: filtro === 'pausa' ? 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)' : '#fff' }}
          >
            ⏸️ En Pausa
          </button>
          <button 
            className={`filter-btn ${filtro === 'detenida' ? 'active' : ''}`}
            onClick={() => setFiltro('detenida')}
            style={{ background: filtro === 'detenida' ? 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)' : '#fff' }}
          >
            ⏹️ Detenidas
          </button>
          <button 
            className={`filter-btn ${filtro === 'error' ? 'active' : ''}`}
            onClick={() => setFiltro('error')}
            style={{ background: filtro === 'error' ? 'linear-gradient(135deg, #ff512f 0%, #dd2476 100%)' : '#fff' }}
          >
            ⚠️ Con Error
          </button>
        </div>
      </div>

      {/* Grid de Máquinas Coloridas */}
      <div className="colorful-grid">
        {filteredMaquinas.map(maquina => {
          const status = getStatusInfo(maquina.status);
          return (
            <div 
              key={maquina.id} 
              className={`colorful-card ${maquina.alerta ? 'alerta' : ''}`}
              style={{ borderTop: `6px solid ${maquina.color}` }}
            >
              {maquina.alerta && (
                <div className="alerta-flotante">
                  <span className="alerta-texto">🚨 ALERTA</span>
                </div>
              )}
              
              <div className="card-header-colorful">
                <div className="maquina-info">
                  <h3 className="maquina-nombre">{maquina.nombre}</h3>
                  <span className="maquina-tipo" style={{ background: `${maquina.color}20`, color: maquina.color }}>
                    {maquina.tipo}
                  </span>
                </div>
                <div className="status-indicator" style={{ backgroundColor: status.bg, color: status.color }}>
                  <span className="status-dot" style={{ backgroundColor: status.color }}></span>
                  {status.texto}
                </div>
              </div>

              <div className="card-body-colorful">
                <div className="info-panel">
                  <div className="info-item" style={{ background: `${maquina.color}10` }}>
                    <span className="info-icon">👤</span>
                    <div>
                      <span className="info-label">Operador</span>
                      <span className="info-value">{maquina.operador}</span>
                    </div>
                  </div>
                  <div className="info-item" style={{ background: `${maquina.color}10` }}>
                    <span className="info-icon">📋</span>
                    <div>
                      <span className="info-label">Orden</span>
                      <span className="info-value orden">{maquina.orden}</span>
                    </div>
                  </div>
                </div>

                <div className="progreso-colorido">
                  <div className="progreso-header">
                    <span>Progreso</span>
                    <span className="progreso-porcentaje" style={{ color: maquina.color }}>{maquina.progreso}%</span>
                  </div>
                  <div className="progreso-bar-colorido">
                    <div 
                      className="progreso-fill-colorido"
                      style={{ 
                        width: `${maquina.progreso}%`,
                        background: `linear-gradient(90deg, ${maquina.color}, ${maquina.color}dd, ${maquina.color}99)`
                      }}
                    ></div>
                  </div>
                </div>

                <div className="metrics-panel">
                  <div className="metric" style={{ background: `${maquina.color}10` }}>
                    <span className="metric-icon">⏱️</span>
                    <div>
                      <span className="metric-label">Tiempo restante</span>
                      <span className="metric-value" style={{ color: maquina.color }}>{maquina.tiempoRestante}</span>
                    </div>
                  </div>
                  <div className="metric" style={{ background: `${maquina.color}10` }}>
                    <span className="metric-icon">📈</span>
                    <div>
                      <span className="metric-label">Eficiencia</span>
                      <span className="metric-value" style={{ color: maquina.color }}>{maquina.eficiencia}%</span>
                    </div>
                  </div>
                  <div className="metric" style={{ background: `${maquina.color}10` }}>
                    <span className="metric-icon">🌡️</span>
                    <div>
                      <span className="metric-label">Temperatura</span>
                      <span className="metric-value" style={{ color: maquina.color }}>{maquina.temperatura}°C</span>
                    </div>
                  </div>
                </div>

                {maquina.motivo && (
                  <div className="motivo-panel" style={{ background: `${status.color}10`, borderColor: status.color }}>
                    <span className="motivo-icon">💬</span>
                    <span className="motivo-texto">{maquina.motivo}</span>
                  </div>
                )}
              </div>

              <div className="card-footer-colorful">
                <button className="action-btn detalle" style={{ background: maquina.color }}>
                  Ver detalles
                </button>
                {maquina.status === 'error' && (
                  <button className="action-btn reiniciar" style={{ background: '#ff6b6b' }}>
                    Reiniciar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Timeline Colorido */}
      <div className="timeline-colorido">
        <h3 className="timeline-titulo">
          <span className="timeline-icon">⏰</span>
          Actividad Reciente
        </h3>
        <div className="timeline-items">
          <div className="timeline-item" style={{ borderLeftColor: '#163eee' }}>
            <span className="timeline-hora">14:32</span>
            <span className="timeline-desc">Máquina 01 completó orden V108707</span>
            <span className="timeline-badge" style={{ background: '#667eea' }}>Completado</span>
          </div>
          <div className="timeline-item" style={{ borderLeftColor: '#d001e7' }}>
            <span className="timeline-hora">14:15</span>
            <span className="timeline-desc">Máquina 04 en pausa - Cambio de turno</span>
            <span className="timeline-badge" style={{ background: '#9804a8' }}>Pausa</span>
          </div>
          <div className="timeline-item" style={{ borderLeftColor: '#f10c14' }}>
            <span className="timeline-hora">13:58</span>
            <span className="timeline-desc">Máquina 06 - Error de temperatura</span>
            <span className="timeline-badge" style={{ background: '#f5060e' }}>Error</span>
          </div>
          <div className="timeline-item" style={{ borderLeftColor: '#4facfe' }}>
            <span className="timeline-hora">13:30</span>
            <span className="timeline-desc">Máquina 03 inició nueva orden</span>
            <span className="timeline-badge" style={{ background: '#4facfe' }}>Iniciado</span>
          </div>
        </div>
      </div>

      {/* Leyenda Colorida */}
      <div className="leyenda-colorida">
        <div className="leyenda-item">
          <span className="leyenda-dot" style={{ background: '#00b894' }}></span>
          <span>Operando</span>
        </div>
        <div className="leyenda-item">
          <span className="leyenda-dot" style={{ background: '#fdcb6e' }}></span>
          <span>En Pausa</span>
        </div>
        <div className="leyenda-item">
          <span className="leyenda-dot" style={{ background: '#d63031' }}></span>
          <span>Detenida</span>
        </div>
        <div className="leyenda-item">
          <span className="leyenda-dot" style={{ background: '#e17055' }}></span>
          <span>Error</span>
        </div>
        <div className="leyenda-item">
          <span className="leyenda-dot" style={{ background: 'linear-gradient(45deg, #ff6b6b, #feca57, #48dbfb)' }}></span>
          <span>Alerta</span>
        </div>
      </div>
    </div>
  );
}