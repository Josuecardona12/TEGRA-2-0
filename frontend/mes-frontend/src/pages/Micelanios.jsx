import React, { useState, useEffect, useRef } from 'react';
import './Micelanios.css';

const Micalenios = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [codigo, setCodigo] = useState('');
  const [tipo, setTipo] = useState('');
  const [areaOrigen, setAreaOrigen] = useState('Sublimado');
  const [areaDestino, setAreaDestino] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('');
  const [historial, setHistorial] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const inputRef = useRef(null);

  const tiposMicelanio = [
    'Twin',
    'Logos',
    'Paneles',
    'Mangas',
    'Insert',
    'Especiales',
    'Personalizado'
  ];

  const areasDisponibles = [
    'Sublimado',
    'Diseño',
    'Plotter',
    'RH',
    'Incompleto',
    'Colorimetria',
    'Logística',
    'Corte',
    'Calidad',
    'Almacén',
    'Producción'
  ];

  useEffect(() => {
    inputRef.current?.focus();
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      registrarMicelanio();
    }
  };

  const registrarMicelanio = () => {
    // Validaciones
    if (!codigo.trim()) {
      mostrarMensaje('Por favor escanee o escriba un código', 'error');
      return;
    }

    if (!tipo) {
      mostrarMensaje('Seleccione un tipo de miceláneo', 'error');
      return;
    }

    if (!areaDestino) {
      mostrarMensaje('Seleccione un área de destino', 'error');
      return;
    }

    if (cantidad < 1) {
      mostrarMensaje('La cantidad debe ser mayor a 0', 'error');
      return;
    }

    // Crear nuevo registro
    const nuevoRegistro = {
      id: Date.now(),
      codigo: codigo,
      tipo: tipo,
      areaOrigen: areaOrigen,
      areaDestino: areaDestino,
      cantidad: cantidad,
      fecha: new Date().toLocaleDateString(),
      hora: new Date().toLocaleTimeString(),
      usuario: 'Josué Cardona',
      estado: 'registrado'
    };

    // Agregar al historial
    setHistorial(prev => [nuevoRegistro, ...prev]);
    
    // Mostrar mensaje de éxito
    mostrarMensaje('✅ Miceláneo registrado exitosamente', 'exito');
    
    // Limpiar formulario
    setCodigo('');
    setTipo('');
    setAreaDestino('');
    setCantidad(1);
    
    // Enfocar input
    inputRef.current?.focus();
  };

  const mostrarMensaje = (texto, tipo) => {
    setMensaje(texto);
    setTipoMensaje(tipo);
    setTimeout(() => setMensaje(''), 3000);
  };

  const handleCantidadChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    setCantidad(Math.max(1, value));
  };

  const simularScan = () => {
    const codigosEjemplo = ['MIC-001', 'MIC-002', 'MIC-003', 'TWN-045', 'LOG-789'];
    const random = codigosEjemplo[Math.floor(Math.random() * codigosEjemplo.length)];
    setCodigo(random);
  };

  return (
    <div className={`micalenios-container ${darkMode ? 'dark-mode' : ''}`}>
      {/* Header */}
      <div className="micalenios-header">
        <div className="header-left">
          <h1>
            <span className="header-icon">📦</span>
            Miceláneos
          </h1>
          <div className="header-date">
            {formatDate(currentTime)}
          </div>
        </div>
        <div className="header-right">
          <div className="weather">
            <span className="weather-icon">☁️</span>
            <span className="weather-temp">69°F</span>
            <span className="weather-desc">Cloudy</span>
          </div>
          <button 
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {/* Mensaje de notificación */}
      {mensaje && (
        <div className={`mensaje ${tipoMensaje}`}>
          {mensaje}
        </div>
      )}

      <div className="micalenios-grid">
        {/* Columna izquierda - Formulario de registro */}
        <div className="form-column">
          <div className="form-card">
            <h2>Registro de Miceláneo</h2>
            
            <div className="form-group">
              <label>
                <span className="label-icon">📷</span>
                Código de Barra
              </label>
              <div className="codigo-input-group">
                <input
                  ref={inputRef}
                  type="text"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                  onKeyDown={handleKeyDown}
                  placeholder="Escanee o escriba el código"
                  className="codigo-input"
                />
                <button 
                  className="scan-simulate"
                  onClick={simularScan}
                  title="Simular escaneo"
                >
                  🔄
                </button>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Tipo de Miceláneo</label>
                <select 
                  value={tipo} 
                  onChange={(e) => setTipo(e.target.value)}
                  className="select-input"
                >
                  <option value="">Seleccione tipo</option>
                  {tiposMicelanio.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Cantidad</label>
                <input
                  type="number"
                  min="1"
                  value={cantidad}
                  onChange={handleCantidadChange}
                  className="cantidad-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Área Origen</label>
                <select 
                  value={areaOrigen} 
                  onChange={(e) => setAreaOrigen(e.target.value)}
                  className="select-input"
                >
                  {areasDisponibles.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Área Destino</label>
                <select 
                  value={areaDestino} 
                  onChange={(e) => setAreaDestino(e.target.value)}
                  className="select-input"
                >
                  <option value="">Seleccione destino</option>
                  {areasDisponibles.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              className="registrar-button"
              onClick={registrarMicelanio}
            >
              <span className="button-icon">📝</span>
              Registrar Miceláneo
            </button>
          </div>

          {/* Áreas rápidas */}
          <div className="areas-card">
            <h3>Áreas de Trabajo</h3>
            <div className="areas-grid">
              {areasDisponibles.map(area => (
                <button
                  key={area}
                  className={`area-button ${areaDestino === area ? 'active' : ''}`}
                  onClick={() => setAreaDestino(area)}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Columna derecha - Historial */}
        <div className="historial-column">
          <div className="historial-card">
            <div className="historial-header">
              <h3>
                <span className="header-icon">📋</span>
                Historial de Registros
              </h3>
              <span className="registros-count">{historial.length} registros</span>
            </div>

            {historial.length > 0 ? (
              <div className="historial-list">
                {historial.map(item => (
                  <div key={item.id} className="historial-item">
                    <div className="item-header">
                      <span className="item-codigo">{item.codigo}</span>
                      <span className={`item-estado ${item.estado}`}>
                        {item.estado}
                      </span>
                    </div>
                    <div className="item-body">
                      <span className="item-tipo">{item.tipo}</span>
                      <span className="item-ruta">
                        {item.areaOrigen} → {item.areaDestino}
                      </span>
                    </div>
                    <div className="item-footer">
                      <span className="item-cantidad">Cant: {item.cantidad}</span>
                      <span className="item-fecha">{item.fecha} {item.hora}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-registros">
                <div className="empty-icon">📭</div>
                <p>No hay registros aún</p>
                <small>Registre un miceláneo para comenzar</small>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="micalenios-footer">
        <div className="footer-left">
          <div className="user-info">
            <div className="user-avatar">JC</div>
            <div className="user-details">
              <span className="user-name">Josué Cardona</span>
              <span className="user-role">ADMINISTRADOR</span>
            </div>
          </div>
        </div>

        <div className="footer-right">
          <div className="system-info">
            <span className="version">VERSIÓN 2.5.0</span>
            <span className="separator">•</span>
            <span className="sync-status">
              <span className="sync-dot"></span>
              SINCRÓ {formatTime(currentTime)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Micalenios;