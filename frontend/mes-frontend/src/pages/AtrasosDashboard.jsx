import React, { useState, useEffect } from 'react';
import './AtrasosDashboard.css';

export default function AtrasosDashboard() {
  const [filtroArea, setFiltroArea] = useState('todas');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [vista, setVista] = useState('tabla');
  const [atrasos, setAtrasos] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    graves: 0,
    medios: 0,
    leves: 0,
    total: 0,
    piezas: 0,
    dias: 0
  });
  const [tiempoActual, setTiempoActual] = useState(new Date());
  const [actualizando, setActualizando] = useState(false);

  // Datos iniciales
  useEffect(() => {
    const datosIniciales = [
      { id: 1, lote: 'NK-228', area: 'Empaque', piezas: 1260, dias: 12, horas: 0, estado: 'GRAVE', progreso: 15, cliente: 'Nike' },
      { id: 2, lote: 'NK-335', area: 'Sublimado', piezas: 1099, dias: 5, horas: 0, estado: 'MEDIO', progreso: 45, cliente: 'Adidas' },
      { id: 3, lote: 'NK-959', area: 'Corte', piezas: 804, dias: 5, horas: 0, estado: 'MEDIO', progreso: 60, cliente: 'Puma' },
      { id: 4, lote: 'NK-935', area: 'Empaque', piezas: 562, dias: 1, horas: 0, estado: 'LEVE', progreso: 85, cliente: 'Nike' },
      { id: 5, lote: 'NK-554', area: 'Estampado', piezas: 750, dias: 8, horas: 0, estado: 'GRAVE', progreso: 20, cliente: 'Adidas' },
      { id: 6, lote: 'NK-348', area: 'Empaque', piezas: 976, dias: 6, horas: 0, estado: 'MEDIO', progreso: 40, cliente: 'Local' }
    ];
    setAtrasos(datosIniciales);
    calcularEstadisticas(datosIniciales);
  }, []);

  // Calcular estadísticas
  const calcularEstadisticas = (datos) => {
    setEstadisticas({
      graves: datos.filter(a => a.estado === 'GRAVE').length,
      medios: datos.filter(a => a.estado === 'MEDIO').length,
      leves: datos.filter(a => a.estado === 'LEVE').length,
      total: datos.length,
      piezas: datos.reduce((acc, a) => acc + a.piezas, 0),
      dias: datos.reduce((acc, a) => acc + a.dias, 0)
    });
  };

  // Tiempo real - actualiza cada 5 segundos
  useEffect(() => {
    const intervalo = setInterval(() => {
      setActualizando(true);
      setTiempoActual(new Date());
      
      setAtrasos(prevAtrasos => {
        const nuevosAtrasos = prevAtrasos.map(item => {
          if (item.progreso < 100 && Math.random() > 0.7) {
            const nuevoProgreso = Math.min(100, item.progreso + Math.floor(Math.random() * 5) + 1);
            return { ...item, progreso: nuevoProgreso };
          }
          return item;
        });
        
        calcularEstadisticas(nuevosAtrasos);
        return nuevosAtrasos;
      });

      setTimeout(() => setActualizando(false), 500);
    }, 5000);

    return () => clearInterval(intervalo);
  }, []);

  // Filtrar datos
  const atrasosFiltrados = atrasos.filter(item => {
    if (filtroArea !== 'todas' && item.area !== filtroArea) return false;
    if (filtroEstado !== 'todos' && item.estado !== filtroEstado) return false;
    return true;
  });

  const getEstadoClass = (estado) => {
    switch(estado) {
      case 'GRAVE': return 'estado-grave';
      case 'MEDIO': return 'estado-medio';
      case 'LEVE': return 'estado-leve';
      default: return '';
    }
  };

  return (
    <div className="atrasos-dashboard">
      {/* Header con tiempo real */}
      <div className="dashboard-header">
        <div>
          <h1 className="header-titulo">
            Control de Atrasos
            <span className="header-fecha">
              {tiempoActual.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </h1>
        </div>
        <div className="header-tiempo-real">
          <div className={`indicador-tiempo-real ${actualizando ? 'parpadeando' : ''}`}>
            <span className="punto-tiempo-real"></span>
            <span className="tiempo-real-texto">EN VIVO</span>
          </div>
          <div className="reloj-digital">
            {tiempoActual.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-numero">{estadisticas.graves}</div>
          <div className="kpi-label">Atrasos Graves</div>
          <div className="kpi-trend">+2 vs ayer</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-numero">{estadisticas.medios}</div>
          <div className="kpi-label">Atrasos Medios</div>
          <div className="kpi-trend">+1 esta semana</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-numero">{estadisticas.leves}</div>
          <div className="kpi-label">Atrasos Leves</div>
          <div className="kpi-trend">-3 resueltos</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-numero">{estadisticas.total}</div>
          <div className="kpi-label">Total Atrasados</div>
          <div className="kpi-trend">{estadisticas.dias} días</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-numero">{estadisticas.piezas.toLocaleString()}</div>
          <div className="kpi-label">Piezas Atrasadas</div>
          <div className="kpi-trend">Alto impacto</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="filtros-container">
        <div className="filtros-izquierda">
          <select 
            className="filtro-select"
            value={filtroArea}
            onChange={(e) => setFiltroArea(e.target.value)}
          >
            <option value="todas">Todas las áreas</option>
            <option value="Empaque">Empaque</option>
            <option value="Sublimado">Sublimado</option>
            <option value="Corte">Corte</option>
            <option value="Estampado">Estampado</option>
          </select>

          <select 
            className="filtro-select"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="todos">Todos los estados</option>
            <option value="GRAVE">Graves</option>
            <option value="MEDIO">Medios</option>
            <option value="LEVE">Leves</option>
          </select>
        </div>

        <button className="btn-buscar">
          Buscar
        </button>
      </div>

      {/* Tabla */}
      <div className="tabla-container">
        <table className="tabla-atrasos">
          <thead>
            <tr>
              <th>LOTE</th>
              <th>CLIENTE</th>
              <th>ÁREA</th>
              <th>PIEZAS</th>
              <th>DÍAS</th>
              <th>ESTADO</th>
              <th>PROGRESO</th>
            </tr>
          </thead>
          <tbody>
            {atrasosFiltrados.map((item) => (
              <tr key={item.id} className={actualizando ? 'fila-actualizando' : ''}>
                <td><strong>{item.lote}</strong></td>
                <td>{item.cliente}</td>
                <td>{item.area}</td>
                <td className="numero">{item.piezas.toLocaleString()}</td>
                <td className="numero">{item.dias}</td>
                <td>
                  <span className={`estado-badge ${getEstadoClass(item.estado)}`}>
                    {item.estado}
                  </span>
                </td>
                <td>
                  <div className="progreso-container">
                    <div className="progreso-barra">
                      <div 
                        className={`progreso-llenado ${getEstadoClass(item.estado)}`}
                        style={{ width: `${item.progreso}%` }}
                      ></div>
                    </div>
                    <span className="progreso-texto">{item.progreso}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="dashboard-footer">
        <div className="info-actualizacion">
          <span className={`punto-estado ${actualizando ? 'activo' : ''}`}></span>
          <span>Actualización en tiempo real • cada 5 segundos</span>
        </div>
        <div className="total-registros">
          Mostrando {atrasosFiltrados.length} de {atrasos.length} registros
        </div>
      </div>
    </div>
  );
}