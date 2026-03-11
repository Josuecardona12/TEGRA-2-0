import React, { useState, useEffect } from 'react';
import './Configuracion.css';

// ============================================
// CONFIGURACIÓN WEBSOCKET
// ============================================
const WS_URL = 'wss://glowing-lamp-r47wvpq4574fxv7j-8080.app.github.dev';

const Configuration = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isEditing, setIsEditing] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('');
  
  // ============================================
  // ESTADOS DE CONEXIÓN Y DATOS
  // ============================================
  const [conectado, setConectado] = useState(false);
  const [stats, setStats] = useState({
    totalLotes: 0,
    lotesActivos: 0,
    lotesCompletados: 0,
    totalAreas: 12,
    usuariosActivos: 1
  });
  const [ultimoMovimiento, setUltimoMovimiento] = useState(null);
  
  const [companyData, setCompanyData] = useState({
    nombre: 'TEGRA Manufacturing',
    direccion: 'San Pedro Sula, Cortés',
    telefono: '+504 9999-9999',
    email: 'contacto@tegra.com',
    sitioWeb: 'www.tegra.com',
    rtn: '0801-1990-123456',
    fechaRegistro: '15/01/2020'
  });

  const [user, setUser] = useState({
    nombre: 'Josué Cardona',
    rol: 'ADMINISTRADOR',
    ultimoAcceso: new Date().toLocaleString(),
    iniciales: 'JC',
    email: 'josue@tegra.com',
    departamento: 'Sistemas',
    fechaIngreso: '01/03/2023'
  });

  const [system, setSystem] = useState({
    version: '2.5.0',
    ultimaActualizacion: new Date().toLocaleDateString(),
    sincronizado: false,
    ultimaSincronizacion: '--:--:--',
    baseDatos: 'SQLite v3.45',
    entorno: 'Development',
    apiVersion: 'v1',
    uptime: '0 días 0 horas'
  });

  const [uptimeSegundos, setUptimeSegundos] = useState(0);

  // ============================================
  // CONEXIÓN WEBSOCKET MEJORADA
  // ============================================
  useEffect(() => {
    console.log('🔌 Configuration conectando...');
    
    const ws = new WebSocket(WS_URL);
    
    ws.onopen = () => {
      console.log('✅ Configuration conectado');
      setConectado(true);
      setSystem(prev => ({
        ...prev,
        sincronizado: true,
        ultimaSincronizacion: formatTime(new Date())
      }));
      mostrarMensaje('✅ Conectado al servidor', 'exito');
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📦 Configuration recibió:', data.type);
        
        if (data.type === 'INIT' || data.type === 'ACTUALIZACION') {
          const lotes = data.data.lotes || [];
          setStats({
            totalLotes: lotes.length,
            lotesActivos: lotes.filter(l => l.estado !== 'completado').length,
            lotesCompletados: lotes.filter(l => l.estado === 'completado').length,
            totalAreas: 12,
            usuariosActivos: 1
          });

          if (data.data.ultimoMovimiento) {
            setUltimoMovimiento(data.data.ultimoMovimiento);
            mostrarMensaje(`🔄 ${data.data.ultimoMovimiento.loteId} → ${data.data.ultimoMovimiento.area}`, 'info');
          }

          setSystem(prev => ({
            ...prev,
            ultimaSincronizacion: formatTime(new Date()),
            sincronizado: true
          }));
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('❌ Error WebSocket:', error);
      setConectado(false);
      setSystem(prev => ({
        ...prev,
        sincronizado: false
      }));
      mostrarMensaje('❌ Error de conexión con el servidor', 'error');
    };
    
    ws.onclose = () => {
      console.log('❌ Configuration desconectado');
      setConectado(false);
      setSystem(prev => ({
        ...prev,
        sincronizado: false
      }));
    };
    
    return () => ws.close();
  }, []);

  // ============================================
  // CALCULAR UPTIME
  // ============================================
  useEffect(() => {
    const intervalo = setInterval(() => {
      setUptimeSegundos(prev => prev + 1);
    }, 1000);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    const dias = Math.floor(uptimeSegundos / 86400);
    const horas = Math.floor((uptimeSegundos % 86400) / 3600);
    const minutos = Math.floor((uptimeSegundos % 3600) / 60);
    setSystem(prev => ({
      ...prev,
      uptime: `${dias}d ${horas}h ${minutos}m`
    }));
  }, [uptimeSegundos]);

  // ============================================
  // TIEMPO REAL
  // ============================================
  useEffect(() => {
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

  const mostrarMensaje = (texto, tipo) => {
    setMensaje(texto);
    setTipoMensaje(tipo);
    setTimeout(() => setMensaje(''), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCompanyData({
      ...companyData,
      [name]: value
    });
  };

  const handleSave = () => {
    console.log('Guardando cambios:', companyData);
    mostrarMensaje('✅ Cambios guardados exitosamente', 'exito');
    setIsEditing(false);
  };

  const handleLogout = () => {
    mostrarMensaje('🔄 Cerrando sesión...', 'info');
    setTimeout(() => {
      mostrarMensaje('✅ Sesión cerrada', 'exito');
    }, 1500);
  };

  const handleSync = () => {
    mostrarMensaje('🔄 Sincronizando con el servidor...', 'info');
    
    setTimeout(() => {
      setSystem({
        ...system,
        ultimaSincronizacion: formatTime(new Date()),
        sincronizado: true
      });
      mostrarMensaje('✅ Sincronización completada', 'exito');
    }, 1500);
  };

  const handleReset = () => {
    if (window.confirm('¿Estás seguro de reiniciar la configuración? Esta acción no se puede deshacer.')) {
      mostrarMensaje('🔄 Reiniciando configuración...', 'info');
      
      setTimeout(() => {
        setCompanyData({
          nombre: 'TEGRA Manufacturing',
          direccion: 'San Pedro Sula, Cortés',
          telefono: '+504 9999-9999',
          email: 'contacto@tegra.com',
          sitioWeb: 'www.tegra.com',
          rtn: '0801-1990-123456',
          fechaRegistro: '15/01/2020'
        });
        mostrarMensaje('✅ Configuración reiniciada', 'exito');
      }, 1000);
    }
  };

  return (
    <div className="config-container">
      {/* HEADER */}
      <div className="config-header">
        <div className="header-left">
          <h1>⚙️ Configuración del Sistema</h1>
          <div className={`connection-status ${conectado ? 'connected' : 'disconnected'}`}>
            <span className="status-dot"></span>
            <span>{conectado ? 'Conectado al servidor' : 'Sin conexión'}</span>
          </div>
        </div>
        <div className="header-right">
          <div className="header-date">
            <span>📅</span>
            {formatDate(currentTime)}
          </div>
          <div className="header-time">
            <span>⏰</span>
            {formatTime(currentTime)}
          </div>
        </div>
      </div>

      {/* MENSAJE FLOTANTE */}
      {mensaje && (
        <div className={`mensaje ${tipoMensaje}`}>
          {mensaje}
        </div>
      )}

      {/* NOTIFICACIÓN DE ÚLTIMO MOVIMIENTO */}
      {ultimoMovimiento && (
        <div className="movimiento-notificacion">
          🔄 {ultimoMovimiento.loteId} → {ultimoMovimiento.area}
        </div>
      )}

      {/* GRID PRINCIPAL */}
      <div className="config-grid">
        {/* TARJETA DE USUARIO */}
        <div className="config-card user-card">
          <div className="user-avatar-large">
            {user.iniciales}
          </div>
          <h2 className="user-name">{user.nombre}</h2>
          <div className="user-role">{user.rol}</div>
          
          <div className="user-info">
            <div className="info-row">
              <span className="info-label">📧 Email</span>
              <span className="info-value">{user.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">🏢 Departamento</span>
              <span className="info-value">{user.departamento}</span>
            </div>
            <div className="info-row">
              <span className="info-label">📅 Ingreso</span>
              <span className="info-value">{user.fechaIngreso}</span>
            </div>
            <div className="info-row">
              <span className="info-label">🕐 Último acceso</span>
              <span className="info-value">{user.ultimoAcceso}</span>
            </div>
          </div>

          <button className="logout-button" onClick={handleLogout}>
            <span className="icon">🚪</span>
            Cerrar Sesión
          </button>
        </div>

        {/* TARJETA DE EMPRESA */}
        <div className="config-card company-card">
          <h2>🏢 Datos de la Empresa</h2>
          
          {!isEditing ? (
            <div className="company-info">
              <div className="info-group">
                <label>Nombre</label>
                <p>{companyData.nombre}</p>
              </div>
              
              <div className="info-group">
                <label>Dirección</label>
                <p>{companyData.direccion}</p>
              </div>
              
              <div className="info-group">
                <label>Teléfono</label>
                <p>{companyData.telefono}</p>
              </div>
              
              <div className="info-group">
                <label>Email</label>
                <p>{companyData.email}</p>
              </div>

              <div className="info-group">
                <label>Sitio Web</label>
                <p>{companyData.sitioWeb}</p>
              </div>

              <div className="info-group">
                <label>RTN</label>
                <p>{companyData.rtn}</p>
              </div>

              <div className="info-group">
                <label>Fecha Registro</label>
                <p>{companyData.fechaRegistro}</p>
              </div>

              <button className="edit-button" onClick={() => setIsEditing(true)}>
                <span className="icon">✏️</span>
                Editar Información
              </button>
            </div>
          ) : (
            <div className="edit-form">
              <div className="form-group">
                <label>Nombre de la empresa</label>
                <input
                  type="text"
                  name="nombre"
                  value={companyData.nombre}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Dirección</label>
                <input
                  type="text"
                  name="direccion"
                  value={companyData.direccion}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={companyData.telefono}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={companyData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Sitio Web</label>
                <input
                  type="text"
                  name="sitioWeb"
                  value={companyData.sitioWeb}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>RTN</label>
                <input
                  type="text"
                  name="rtn"
                  value={companyData.rtn}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Fecha de Registro</label>
                <input
                  type="text"
                  name="fechaRegistro"
                  value={companyData.fechaRegistro}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-actions">
                <button className="cancel-button" onClick={() => setIsEditing(false)}>
                  Cancelar
                </button>
                <button className="save-button" onClick={handleSave}>
                  Guardar Cambios
                </button>
              </div>
            </div>
          )}
        </div>

        {/* TARJETA DE SISTEMA */}
        <div className="config-card system-card">
          <h2>🖥️ Sistema</h2>
          
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{stats.totalLotes}</span>
              <span className="stat-label">Total Lotes</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.lotesActivos}</span>
              <span className="stat-label">Lotes Activos</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.lotesCompletados}</span>
              <span className="stat-label">Completados</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.totalAreas}</span>
              <span className="stat-label">Áreas</span>
            </div>
          </div>

          <div className="system-info">
            <div className="info-row">
              <span className="info-label">Versión</span>
              <span className="info-value version-badge">{system.version}</span>
            </div>
            
            <div className="info-row">
              <span className="info-label">Base de Datos</span>
              <span className="info-value">{system.baseDatos}</span>
            </div>

            <div className="info-row">
              <span className="info-label">Entorno</span>
              <span className="info-value">{system.entorno}</span>
            </div>

            <div className="info-row">
              <span className="info-label">API Version</span>
              <span className="info-value">{system.apiVersion}</span>
            </div>

            <div className="info-row">
              <span className="info-label">Uptime</span>
              <span className="info-value">{system.uptime}</span>
            </div>

            <div className="info-row">
              <span className="info-label">Última Actualización</span>
              <span className="info-value">{system.ultimaActualizacion}</span>
            </div>

            <div className="sync-status">
              <div className="status-indicator">
                <span className={`status-dot ${system.sincronizado ? 'connected' : 'disconnected'}`}></span>
                <span>{system.sincronizado ? 'Sincronizado' : 'No sincronizado'}</span>
              </div>
              
              <div className="sync-time">
                <span>Última sincronización</span>
                <span className="time-value">{system.ultimaSincronizacion}</span>
              </div>

              <button className="sync-button" onClick={handleSync}>
                <span className="icon">🔄</span>
                Sincronizar Ahora
              </button>

              <button className="reset-button" onClick={handleReset}>
                <span className="icon">🔄</span>
                Reiniciar Configuración
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="config-footer">
        <div className="footer-info">
          <span>© 2026 TEGRA Manufacturing - Todos los derechos reservados</span>
        </div>
        <div className="footer-version">
          <span>Build: {system.version}.{Math.floor(Math.random() * 100)}</span>
        </div>
      </div>

      <style>{`
        .config-footer {
          margin-top: 30px;
          padding: 20px;
          background: white;
          border-radius: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #666;
          font-size: 0.9rem;
          box-shadow: 0 5px 20px rgba(0,0,0,0.05);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .header-time {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 8px 16px;
          border-radius: 30px;
          font-weight: 600;
          font-family: 'Courier New', monospace;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .reset-button {
          padding: 12px 24px;
          border: none;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s ease;
          width: 100%;
          margin-top: 10px;
          background: linear-gradient(135deg, #ff6b6b, #ee5253);
          color: white;
        }

        .reset-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(255, 107, 107, 0.3);
        }

        .user-card h2::before {
          content: '👤';
          margin-right: 10px;
        }

        .company-card h2::before {
          content: '🏢';
          margin-right: 10px;
        }

        .system-card h2::before {
          content: '🖥️';
          margin-right: 10px;
        }

        .movimiento-notificacion {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: linear-gradient(135deg, #667eea, #764ba2);
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
      `}</style>
    </div>
  );
};

export default Configuration;