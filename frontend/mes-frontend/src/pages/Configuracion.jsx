import React, { useState, useEffect } from 'react';
import './Configuracion.css';

const Configuration = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isEditing, setIsEditing] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('');
  
  const [companyData, setCompanyData] = useState({
    nombre: 'TEGRA Manufacturing',
    direccion: 'San Pedro Sula, Cortés',
    telefono: '+504 9999-9999',
    email: 'contacto@tegra.com'
  });

  const [user, setUser] = useState({
    nombre: 'Josué Cardona',
    rol: 'ADMINISTRADOR',
    ultimoAcceso: '2/24/2026, 8:30:00 AM',
    iniciales: 'JC'
  });

  const [system, setSystem] = useState({
    version: '2.5.0',
    ultimaActualizacion: '24/02/2026',
    sincronizado: true,
    ultimaSincronizacion: '14:53:10'
  });

  // Actualizar hora cada segundo
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCompanyData({
      ...companyData,
      [name]: value
    });
  };

  const handleSave = () => {
    // Aquí iría la llamada a la API
    console.log('Guardando cambios:', companyData);
    setMensaje('Cambios guardados exitosamente');
    setTipoMensaje('exito');
    setIsEditing(false);
    
    setTimeout(() => {
      setMensaje('');
    }, 3000);
  };

  const handleLogout = () => {
    console.log('Cerrando sesión...');
    setMensaje('Cerrando sesión...');
    setTipoMensaje('info');
    // Aquí iría la lógica real de logout
  };

  const handleSync = () => {
    console.log('Sincronizando...');
    setMensaje('Sincronizando con el servidor...');
    setTipoMensaje('info');
    
    // Simular sincronización
    setTimeout(() => {
      setSystem({
        ...system,
        ultimaSincronizacion: formatTime(new Date()),
        sincronizado: true
      });
      setMensaje('Sincronización completada');
      setTipoMensaje('exito');
      
      setTimeout(() => {
        setMensaje('');
      }, 3000);
    }, 2000);
  };

  return (
    <div className="config-container">
      {/* Header */}
      <div className="config-header">
        <h1>Configuración del Sistema</h1>
        <div className="header-date">
          {formatDate(currentTime)}
        </div>
      </div>

      {/* Mensaje de notificación */}
      {mensaje && (
        <div className={`mensaje ${tipoMensaje}`}>
          {mensaje}
        </div>
      )}

      <div className="config-grid">
        {/* Tarjeta de Usuario */}
        <div className="config-card user-card">
          <div className="user-avatar-large">
            {user.iniciales}
          </div>
          <h2 className="user-name">{user.nombre}</h2>
          <div className="user-role">{user.rol}</div>
          
          <div className="user-info">
            <div className="info-row">
              <span className="info-label">ÚLTIMO ACCESO</span>
              <span className="info-value">{user.ultimoAcceso}</span>
            </div>
          </div>

          <button className="logout-button" onClick={handleLogout}>
            <span className="icon">🚪</span>
            Cerrar Sesión
          </button>
        </div>

        {/* Tarjeta de Datos de Empresa */}
        <div className="config-card company-card">
          <h2>Datos de la Empresa</h2>
          
          {!isEditing ? (
            <div className="company-info">
              <div className="info-group">
                <label>Nombre de la empresa</label>
                <p>{companyData.nombre}</p>
              </div>
              
              <div className="info-group">
                <label>Dirección completa</label>
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
                  placeholder="Nombre de la empresa"
                />
              </div>
              
              <div className="form-group">
                <label>Dirección completa</label>
                <input
                  type="text"
                  name="direccion"
                  value={companyData.direccion}
                  onChange={handleInputChange}
                  placeholder="Dirección completa"
                />
              </div>
              
              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={companyData.telefono}
                  onChange={handleInputChange}
                  placeholder="+504 9999-9999"
                />
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={companyData.email}
                  onChange={handleInputChange}
                  placeholder="contacto@tegra.com"
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

        {/* Tarjeta de Sistema */}
        <div className="config-card system-card">
          <h2>Sistema</h2>
          
          <div className="system-info">
            <div className="info-row">
              <span className="info-label">Versión</span>
              <span className="info-value version-badge">{system.version}</span>
            </div>
            
            <div className="info-row">
              <span className="info-label">Última actualización</span>
              <span className="info-value">{system.ultimaActualizacion}</span>
            </div>

            <div className="sync-status">
              <div className="status-indicator">
                <span className={`status-dot ${system.sincronizado ? 'connected' : 'disconnected'}`}></span>
                <span>{system.sincronizado ? 'Conectado al servidor' : 'Desconectado'}</span>
              </div>
              
              <div className="sync-time">
                <span>Última sincronización</span>
                <span className="time-value">{system.ultimaSincronizacion}</span>
              </div>

              <button className="sync-button" onClick={handleSync}>
                <span className="icon">🔄</span>
                Sincronizar Ahora
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuration;