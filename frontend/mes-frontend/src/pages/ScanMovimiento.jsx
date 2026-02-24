import { useState, useEffect, useRef } from "react";
import "./ScanMovimiento.css";

export default function ScanMovimiento() {
  const [codigo, setCodigo] = useState("");
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });
  const [movimientos, setMovimientos] = useState([]);
  const [escanenado, setEscanenado] = useState(false);
  const [productoInfo, setProductoInfo] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [modoEscaneo, setModoEscaneo] = useState("auto"); // 'auto' o 'manual'
  const [sugerencias, setSugerencias] = useState([]);
  
  const inputRef = useRef(null);
  const scanTimeout = useRef(null);
  const scanAudioRef = useRef(null);

  // Simular base de datos de productos
  const productosDB = {
    "NK-137": { 
      nombre: "Producto A - Premium", 
      area: "logistica", 
      cantidad: 10,
      imagen: "🖼️",
      descripcion: "Lote especial de alta calidad"
    },
    "NK-79": { 
      nombre: "Producto B - Estándar", 
      area: "Diseño", 
      cantidad: 5,
      imagen: "📦",
      descripcion: "Producto de línea regular"
    },
    "NK-6": { 
      nombre: "Producto C - Económico", 
      area: "Plotter", 
      cantidad: 8,
      imagen: "📊",
      descripcion: "Versión básica"
    },
    "LOTE-001": { 
      nombre: "Lote Premium", 
      area: "Sublimado", 
      cantidad: 50,
      imagen: "🏭",
      descripcion: "Lote completo de producción"
    },
    "LOTE-002": { 
      nombre: "Lote Estándar", 
      area: "RH", 
      cantidad: 25,
      imagen: "📦",
      descripcion: "Lote en proceso"
    },
    "MAT-123": { 
      nombre: "Material Textil", 
      area: "Costura", 
      cantidad: 100,
      imagen: "🧵",
      descripcion: "Rollo de tela premium"
    },
    "MAT-456": { 
      nombre: "Hilos Especiales", 
      area: "Costura", 
      cantidad: 200,
      imagen: "🪡",
      descripcion: "Hilos de colores"
    }
  };

  const areas = [
    { id: "diseno", nombre: "Diseño", icono: "🎨", color: "#8b5cf6" },
    { id: "plotter", nombre: "Plotter", icono: "🖨️", color: "#ec4899" },
    { id: "Colorimetria", nombre: "Colorimetria", icono: "👥", color: "#14b8a6" },
    { id: "RH", nombre: "RH", icono: "⚠️", color: "#f59e0b" },
    { id: "Logistica", nombre: "Logistica", icono: "⚙️", color: "#3b82f6" },
    { id: "sublimado", nombre: "sublimado", icono: "🏢", color: "#10b981" },
    { id: "costura", nombre: "Costura", icono: "🧵", color: "#8b5cf6" },
    { id: "calidad", nombre: "Calidad", icono: "✅", color: "#06b6d4" }
  ];

  // Auto-focus al input al cargar
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Buscar sugerencias mientras escribe
  useEffect(() => {
    if (codigo.length >= 2 && modoEscaneo === "manual") {
      const sugerenciasEncontradas = Object.keys(productosDB)
        .filter(key => key.toLowerCase().includes(codigo.toLowerCase()))
        .map(key => ({
          codigo: key,
          ...productosDB[key]
        }));
      setSugerencias(sugerenciasEncontradas);
    } else {
      setSugerencias([]);
    }
  }, [codigo, modoEscaneo]);

  // Simular búsqueda de producto por código
  const buscarProducto = async (codigoBuscado) => {
    setCargando(true);
    
    // Simular llamada a API con delay
    return new Promise((resolve) => {
      setTimeout(() => {
        const encontrado = productosDB[codigoBuscado];
        setCargando(false);
        
        if (encontrado) {
          setProductoInfo({
            codigo: codigoBuscado,
            ...encontrado
          });
          
          // Auto-seleccionar área origen si coincide
          const areaEncontrada = areas.find(a => a.nombre === encontrado.area);
          if (areaEncontrada) {
            setOrigen(areaEncontrada.nombre);
          }
          
          // Sonido de éxito (simulado)
          if (scanAudioRef.current) {
            // Reproducir sonido si está disponible
          }
          
          setMensaje({
            tipo: "success",
            texto: `✅ Producto encontrado: ${encontrado.nombre}`
          });
        } else {
          setProductoInfo(null);
          setMensaje({
            tipo: "error",
            texto: "❌ Producto no encontrado"
          });
        }
        resolve(encontrado);
      }, 600);
    });
  };

  // Manejar escaneo automático
  const handleScan = (e) => {
    const valor = e.target.value;
    setCodigo(valor);
    
    // Limpiar timeout anterior
    if (scanTimeout.current) {
      clearTimeout(scanTimeout.current);
    }
    
    // Modo automático: escanear después de pausa
    if (modoEscaneo === "auto" && valor.length >= 3) {
      setEscanenado(true);
      scanTimeout.current = setTimeout(() => {
        buscarProducto(valor);
        setEscanenado(false);
      }, 800);
    }
  };

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (scanTimeout.current) {
        clearTimeout(scanTimeout.current);
      }
    };
  }, []);

  const moverProducto = () => {
    if (!codigo) {
      setMensaje({ tipo: "error", texto: "⚠️ Escanea o ingresa un código" });
      inputRef.current?.focus();
      return;
    }
    
    if (!origen) {
      setMensaje({ tipo: "error", texto: "⚠️ Selecciona área de origen" });
      return;
    }
    
    if (!destino) {
      setMensaje({ tipo: "error", texto: "⚠️ Selecciona área de destino" });
      return;
    }
    
    if (origen === destino) {
      setMensaje({ tipo: "error", texto: "⚠️ Origen y destino no pueden ser iguales" });
      return;
    }

    const nuevoMovimiento = {
      id: Date.now(),
      codigo,
      origen,
      destino,
      cantidad: Number(cantidad),
      fecha: new Date().toLocaleString(),
      producto: productoInfo?.nombre || "Desconocido",
      icono: productoInfo?.imagen || "📦",
      timestamp: Date.now()
    };

    setMovimientos([nuevoMovimiento, ...movimientos]);

    setMensaje({ 
      tipo: "success", 
      texto: `✅ Movimiento registrado: ${codigo} de ${origen} a ${destino}` 
    });

    // Resetear formulario
    setOrigen("");
    setDestino("");
    setCantidad(1);
    setProductoInfo(null);
    setCodigo("");
    setSugerencias([]);
    
    // Auto-focus para siguiente escaneo
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Manejar Enter en el input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && codigo) {
      buscarProducto(codigo);
    }
  };

  // Seleccionar sugerencia
  const seleccionarSugerencia = (sugerencia) => {
    setCodigo(sugerencia.codigo);
    setProductoInfo(sugerencia);
    setSugerencias([]);
    
    const areaEncontrada = areas.find(a => a.nombre === sugerencia.area);
    if (areaEncontrada) {
      setOrigen(areaEncontrada.nombre);
    }
  };

  return (
    <div className="scan-elegant-container">
      {/* Header con título y modo */}
      <div className="scan-elegant-header">
        <div>
          <h1 className="scan-elegant-title">
            <span className="title-icon">📱</span>
            Escaneo de Movimiento
          </h1>
          <p className="scan-elegant-subtitle">
            Escanea el código de barras o ingrésalo manualmente
          </p>
        </div>
        
        <div className="scan-mode-selector">
          <button 
            className={`mode-btn ${modoEscaneo === 'auto' ? 'active' : ''}`}
            onClick={() => setModoEscaneo('auto')}
          >
            <span className="mode-icon">⚡</span>
            Auto
          </button>
          <button 
            className={`mode-btn ${modoEscaneo === 'manual' ? 'active' : ''}`}
            onClick={() => setModoEscaneo('manual')}
          >
            <span className="mode-icon">✏️</span>
            Manual
          </button>
        </div>
      </div>

      {/* Tarjeta principal de escaneo */}
      <div className="scan-elegant-card">
        <div className="scan-elegant-body">
          {/* Área de escaneo principal */}
          <div className="scan-area-principal">
            <div className="scan-input-wrapper">
              <div className="scan-input-container">
                <span className="scan-input-icon">🔍</span>
                <input
                  ref={inputRef}
                  type="text"
                  className={`scan-input-elegant ${escanenado ? 'scanning' : ''} ${cargando ? 'loading' : ''}`}
                  placeholder="Escanee o escriba el código..."
                  value={codigo}
                  onChange={handleScan}
                  onKeyPress={handleKeyPress}
                  autoComplete="off"
                />
                {escanenado && (
                  <div className="scan-status scanning">
                    <div className="scanning-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span>Escaneando...</span>
                  </div>
                )}
                {cargando && (
                  <div className="scan-status loading">
                    <div className="loading-spinner-elegant"></div>
                    <span>Buscando...</span>
                  </div>
                )}
              </div>

              {/* Sugerencias de búsqueda */}
              {sugerencias.length > 0 && (
                <div className="sugerencias-dropdown">
                  {sugerencias.map((sug) => (
                    <div 
                      key={sug.codigo}
                      className="sugerencia-item"
                      onClick={() => seleccionarSugerencia(sug)}
                    >
                      <span className="sugerencia-icon">{sug.imagen}</span>
                      <div className="sugerencia-info">
                        <span className="sugerencia-codigo">{sug.codigo}</span>
                        <span className="sugerencia-nombre">{sug.nombre}</span>
                      </div>
                      <span className="sugerencia-area">{sug.area}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Información del producto escaneado */}
            {productoInfo && (
              <div className="producto-detalle-card">
                <div className="producto-detalle-header">
                  <span className="producto-detalle-badge">✅ Producto Verificado</span>
                  <span className="producto-detalle-icon">{productoInfo.imagen}</span>
                </div>
                <div className="producto-detalle-grid">
                  <div className="detalle-item">
                    <span className="detalle-label">Código</span>
                    <span className="detalle-value code">{productoInfo.codigo}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Producto</span>
                    <span className="detalle-value">{productoInfo.nombre}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Área Actual</span>
                    <span className="detalle-value area">
                      <span className="area-indicator" style={{ backgroundColor: areas.find(a => a.nombre === productoInfo.area)?.color }}></span>
                      {productoInfo.area}
                    </span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Stock Disponible</span>
                    <span className="detalle-value stock">{productoInfo.cantidad} unidades</span>
                  </div>
                  <div className="detalle-item full-width">
                    <span className="detalle-label">Descripción</span>
                    <span className="detalle-value">{productoInfo.descripcion}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Selectores de área */}
            <div className="areas-selector-grid">
              <div className="area-selector-group">
                <label className="area-selector-label">
                  <span className="label-icon">📤</span>
                  Área Origen
                </label>
                <div className="area-cards">
                  {areas.map((area) => (
                    <div
                      key={`origen-${area.id}`}
                      className={`area-card ${origen === area.nombre ? 'selected' : ''} ${productoInfo?.area === area.nombre ? 'match' : ''}`}
                      onClick={() => setOrigen(area.nombre)}
                      style={{ borderColor: origen === area.nombre ? area.color : 'transparent' }}
                    >
                      <div className="area-card-content">
                        <span className="area-icon" style={{ backgroundColor: area.color + '20', color: area.color }}>
                          {area.icono}
                        </span>
                        <span className="area-nombre">{area.nombre}</span>
                      </div>
                      {productoInfo?.area === area.nombre && (
                        <span className="area-match-badge">Actual</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="area-selector-group">
                <label className="area-selector-label">
                  <span className="label-icon">📥</span>
                  Área Destino
                </label>
                <div className="area-cards">
                  {areas.map((area) => (
                    <div
                      key={`destino-${area.id}`}
                      className={`area-card ${destino === area.nombre ? 'selected' : ''} ${area.nombre === origen ? 'disabled' : ''}`}
                      onClick={() => area.nombre !== origen && setDestino(area.nombre)}
                      style={{ borderColor: destino === area.nombre ? area.color : 'transparent' }}
                    >
                      <div className="area-card-content">
                        <span className="area-icon" style={{ backgroundColor: area.color + '20', color: area.color }}>
                          {area.icono}
                        </span>
                        <span className="area-nombre">{area.nombre}</span>
                      </div>
                      {area.nombre === origen && (
                        <span className="area-disabled-badge">Origen</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cantidad y botón de acción */}
            <div className="accion-container">
              <div className="cantidad-selector">
                <label className="cantidad-label">
                  <span className="label-icon">🔢</span>
                  Cantidad
                </label>
                <div className="cantidad-control">
                  <button 
                    className="cantidad-btn"
                    onClick={() => setCantidad(prev => Math.max(1, prev - 1))}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={productoInfo?.cantidad || 999}
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    className="cantidad-input"
                  />
                  <button 
                    className="cantidad-btn"
                    onClick={() => setCantidad(prev => Math.min(productoInfo?.cantidad || 999, prev + 1))}
                  >
                    +
                  </button>
                </div>
              </div>

              <button 
                className={`movimiento-btn ${codigo && origen && destino ? 'active' : ''}`}
                onClick={moverProducto}
                disabled={!codigo || !origen || !destino}
              >
                <span className="btn-icon">📦</span>
                <span className="btn-text">Mover Producto</span>
                {(codigo && origen && destino) && (
                  <span className="btn-glow"></span>
                )}
              </button>
            </div>
          </div>

          {/* Mensaje de estado */}
          {mensaje.texto && (
            <div className={`mensaje-elegante ${mensaje.tipo}`}>
              <span className="mensaje-icon">
                {mensaje.tipo === 'success' ? '✅' : mensaje.tipo === 'error' ? '❌' : '⚠️'}
              </span>
              <span className="mensaje-texto">{mensaje.texto}</span>
              <button className="mensaje-close" onClick={() => setMensaje({ tipo: '', texto: '' })}>×</button>
            </div>
          )}
        </div>
      </div>

  

      {/* Historial de movimientos */}
      <div className="historial-elegante">
        <div className="historial-header">
          <div className="historial-title">
            <span className="historial-icon">📋</span>
            <h2>Historial de Movimientos</h2>
          </div>
          <span className="historial-count">{movimientos.length} movimientos</span>
        </div>

        {movimientos.length === 0 ? (
          <div className="empty-state-elegante">
            <div className="empty-animation">
              <span className="empty-icon">📭</span>
              <div className="empty-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            <h3>No hay movimientos aún</h3>
            <p>Escanea un producto para comenzar a registrar movimientos</p>
          </div>
        ) : (
          <div className="timeline-movimientos">
            {movimientos.map((mov) => (
              <div key={mov.id} className="timeline-item">
                <div className="timeline-icon" style={{ backgroundColor: areas.find(a => a.nombre === mov.origen)?.color + '20' }}>
                  <span style={{ color: areas.find(a => a.nombre === mov.origen)?.color }}>
                    {mov.icono}
                  </span>
                </div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <span className="timeline-codigo">{mov.codigo}</span>
                    <span className="timeline-fecha">{mov.fecha}</span>
                  </div>
                  <div className="timeline-producto">{mov.producto}</div>
                  <div className="timeline-ruta">
                    <span className="ruta-origen" style={{ backgroundColor: areas.find(a => a.nombre === mov.origen)?.color + '20', color: areas.find(a => a.nombre === mov.origen)?.color }}>
                      {mov.origen}
                    </span>
                    <span className="ruta-flecha">→</span>
                    <span className="ruta-destino" style={{ backgroundColor: areas.find(a => a.nombre === mov.destino)?.color + '20', color: areas.find(a => a.nombre === mov.destino)?.color }}>
                      {mov.destino}
                    </span>
                    <span className="ruta-cantidad">{mov.cantidad} uds</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}