// ScanInicio.jsx
import React, { useState, useEffect, useRef } from 'react';
import './ScanInicio.css';

const ScanInicio = () => {
  const [codigo, setCodigo] = useState('');
  const [ultimoScan, setUltimoScan] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('info');
  const [escaneando, setEscaneando] = useState(true);
  const [historialReciente, setHistorialReciente] = useState([]);
  const inputRef = useRef(null);

  // Enfoque automático al input
  useEffect(() => {
    inputRef.current.focus();
  }, []);

  // Simular detección de scanner (los scanners generalmente envían un Enter al final)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      procesarScan();
    }
  };

  const procesarScan = async () => {
    if (!codigo.trim()) {
      mostrarMensaje('Por favor escanee un código', 'error');
      return;
    }

    // Validar formato del código (ejemplo: ORD-XXX o LOTE-XXX)
    if (!validarFormatoCodigo(codigo)) {
      mostrarMensaje('Formato de código inválido', 'error');
      setCodigo('');
      inputRef.current.focus();
      return;
    }

    // Aquí iría la llamada a tu API de FastAPI
    try {
      // Simulación de llamada API
      mostrarMensaje(`Procesando: ${codigo}`, 'info');
      
      // Simular respuesta exitosa después de 1 segundo
      setTimeout(() => {
        const nuevoScan = {
          id: Date.now(),
          codigo: codigo,
          timestamp: new Date().toLocaleTimeString(),
          area: determinarArea(codigo),
          estado: 'en_proceso'
        };

        setUltimoScan(nuevoScan);
        setHistorialReciente(prev => [nuevoScan, ...prev].slice(0, 5));
        mostrarMensaje(`✅ Scan exitoso: ${codigo}`, 'exito');
        
        // Aquí iniciarías el tracking en tiempo real
        iniciarTracking(codigo);
        
        setCodigo('');
        inputRef.current.focus();
      }, 500);

    } catch (error) {
      mostrarMensaje('Error al procesar el scan', 'error');
    }
  };

  const validarFormatoCodigo = (codigo) => {
    // Ejemplo de formatos: ORD-001, LOTE-2024-001, PAL-123
    const patrones = [
      /^ORD-\d{3}$/i,           // Órdenes
      /^LOTE-\d{4}-\d{3}$/i,    // Lotes
      /^PAL-\d{3}$/i,           // Palets
      /^PROD-[A-Z0-9]{5}$/i,    // Productos
      /^\d{13}$/                 // Código de barras estándar (EAN-13)
    ];
    
    return patrones.some(patron => patron.test(codigo));
  };

  const determinarArea = (codigo) => {
    if (codigo.startsWith('ORD')) return 'Producción';
    if (codigo.startsWith('LOTE')) return 'Calidad';
    if (codigo.startsWith('PAL')) return 'Logística';
    return 'General';
  };

  const iniciarTracking = (codigo) => {
    // Aquí conectarías con WebSocket para tracking en tiempo real
    console.log(`Iniciando tracking en tiempo real para: ${codigo}`);
    // Ejemplo: socket.emit('iniciar-tracking', { codigo });
  };

  const mostrarMensaje = (texto, tipo) => {
    setMensaje(texto);
    setTipoMensaje(tipo);
    setTimeout(() => setMensaje(''), 3000);
  };

  const simularScan = () => {
    // Para pruebas - genera códigos de ejemplo
    const codigosEjemplo = ['ORD-001', 'LOTE-2024-123', 'PAL-045', 'PROD-ABC12'];
    const random = codigosEjemplo[Math.floor(Math.random() * codigosEjemplo.length)];
    setCodigo(random);
    setTimeout(() => procesarScan(), 100);
  };

  return (
    <div className="scan-container">
      {/* Header con estado del sistema */}
      <div className="scan-header">
        <div className="header-left">
          <h1>TEGRA SCAN</h1>
          <span className="system-status">
            <span className="status-dot"></span>
            Sistema activo
          </span>
        </div>
        <div className="header-right">
          <div className="datetime">
            {new Date().toLocaleDateString()} - {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Área principal de escaneo */}
      <div className="scan-main">
        <div className="scan-card">
          <div className="scan-icon">📷</div>
          <h2>Escáner de Códigos</h2>
          <p className="scan-subtitle">Escanea un código para iniciar el tracking</p>
          
          <div className="scan-input-group">
            <input
              ref={inputRef}
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              placeholder="Esperando escaneo..."
              className="scan-input"
              autoFocus
            />
            <button onClick={procesarScan} className="scan-button">
              Procesar
            </button>
          </div>

          {/* Mensaje de estado */}
          {mensaje && (
            <div className={`mensaje ${tipoMensaje}`}>
              {mensaje}
            </div>
          )}

          {/* Indicador de escaneo */}
          <div className="scan-indicator">
            <div className={`pulse ${escaneando ? 'activo' : ''}`}></div>
            <span>{escaneando ? 'Listo para escanear' : 'Pausado'}</span>
          </div>

          {/* Último scan */}
          {ultimoScan && (
            <div className="ultimo-scan">
              <h3>Último escaneo:</h3>
              <div className="scan-details">
                <span className="codigo">{ultimoScan.codigo}</span>
                <span className="hora">{ultimoScan.timestamp}</span>
                <span className="area">{ultimoScan.area}</span>
              </div>
            </div>
          )}

          {/* Botón para pruebas (solo desarrollo) */}
          {process.env.NODE_ENV === 'development' && (
            <button onClick={simularScan} className="test-button">
              🔧 Simular Scan (Pruebas)
            </button>
          )}
        </div>

        {/* Panel de tracking en tiempo real */}
        <div className="tracking-panel">
          <h3>
            <span className="live-badge">🔴 EN VIVO</span>
            Tracking Activo
          </h3>
          
          {historialReciente.length > 0 ? (
            <div className="tracking-list">
              {historialReciente.map(item => (
                <div key={item.id} className="tracking-item">
                  <div className="tracking-header">
                    <span className="tracking-codigo">{item.codigo}</span>
                    <span className="tracking-hora">{item.timestamp}</span>
                  </div>
                  <div className="tracking-body">
                    <span className="tracking-area">{item.area}</span>
                    <span className="tracking-estado">● En proceso</span>
                  </div>
                  <div className="tracking-progress">
                    <div className="progress-bar" style={{width: '45%'}}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-tracking">
              <p>No hay elementos en tracking</p>
              <small>Escanee un código para comenzar</small>
            </div>
          )}
        </div>
      </div>

      {/* Instrucciones rápidas */}
      <div className="scan-footer">
        <div className="footer-info">
          <span>📌 Formatos aceptados:</span>
          <span className="formato">ORD-001</span>
          <span className="formato">LOTE-2024-123</span>
          <span className="formato">PAL-045</span>
          <span className="formato">Código EAN-13</span>
        </div>
      </div>
    </div>
  );
};

export default ScanInicio;

