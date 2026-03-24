import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { USUARIOS, ROLES_CONFIG } from '../config/roles.config';
import { useRole } from '../RoleContext';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { refreshUser } = useRole();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modoOscuro, setModoOscuro] = useState(false);
  const [animacionActiva, setAnimacionActiva] = useState(false);
  const [rolSeleccionado, setRolSeleccionado] = useState('admin');
  const [activeFeature, setActiveFeature] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const rolesList = Object.values(ROLES_CONFIG);

  // Características rotativas
  const features = [
    { icon: "📊", title: "Dashboard en Tiempo Real", desc: "Métricas actualizadas al instante" },
    { icon: "⚙️", title: "Trazabilidad Total", desc: "Seguimiento de lotes desde origen" },
    { icon: "🎨", title: "Buzón de Diseño", desc: "Gestión exclusiva para diseñadores" },
    { icon: "📈", title: "Análisis Predictivo", desc: "IA para optimizar producción" },
    { icon: "🔔", title: "Alertas Inteligentes", desc: "Notificaciones en tiempo real" },
    { icon: "📱", title: "Acceso Multiplataforma", desc: "Funciona en cualquier dispositivo" }
  ];

  // Rotar características
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  useEffect(() => {
    setAnimacionActiva(true);
    setTimeout(() => setAnimacionActiva(false), 1000);
  }, []);

  useEffect(() => {
    const modoGuardado = localStorage.getItem('modoOscuroLogin') === 'true';
    setModoOscuro(modoGuardado);
  }, []);

  useEffect(() => {
    localStorage.setItem('modoOscuroLogin', modoOscuro);
    document.body.setAttribute('data-theme', modoOscuro ? 'dark' : 'light');
  }, [modoOscuro]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    setTimeout(() => {
      const usuario = USUARIOS.find(u => u.email === email);

      if (usuario) {
        // Verificar contraseña (si está definida)
        if (usuario.password && usuario.password !== password) {
          setError('❌ Contraseña incorrecta');
          setIsLoading(false);
          return;
        }

        const usuarioConMetadata = {
          id: usuario.id,
          email: usuario.email,
          rol: usuario.rol,
          nombre: usuario.nombre,
          avatar: usuario.avatar,
          ultimoAcceso: new Date().toISOString(),
          sesionIniciada: true,
          color: ROLES_CONFIG[usuario.rol]?.color || '#6366f1'
        };

        localStorage.setItem('usuario', JSON.stringify(usuarioConMetadata));
        
        refreshUser();
        
        setSuccess(`✅ Bienvenido ${usuario.nombre}`);

        if (rememberMe) {
          localStorage.setItem('rememberEmail', email);
        } else {
          localStorage.removeItem('rememberEmail');
        }

        // Redirigir según el rol
        setTimeout(() => {
          if (usuario.rol === 'disenador') {
            navigate('/buzon-diseno');
          } else {
            navigate('/dashboard');
          }
        }, 500);
      } else {
        setError('❌ Usuario no encontrado');
      }
      setIsLoading(false);
    }, 800);
  };

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const autocompletarRol = (rolId) => {
    setRolSeleccionado(rolId);
    const usuarioEjemplo = USUARIOS.find(u => u.rol === rolId);
    if (usuarioEjemplo) {
      setEmail(usuarioEjemplo.email);
      setPassword('');
      setSuccess(`📋 Rol ${ROLES_CONFIG[rolId]?.nombre || rolId} seleccionado - Ingresa tu contraseña`);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const limpiarFormulario = () => {
    setEmail('');
    setPassword('');
    setError('');
    setSuccess('');
    setRolSeleccionado('admin');
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100
    });
  };

  return (
    <div 
      className={`login-ultra ${modoOscuro ? 'dark-mode' : ''}`}
      onMouseMove={handleMouseMove}
    >
      {/* Fondo animado con gradientes dinámicos */}
      <div className="login-background">
        <div className="gradient-orb orbe-1" style={{ '--x': `${mousePosition.x}%`, '--y': `${mousePosition.y}%` }}></div>
        <div className="gradient-orb orbe-2"></div>
        <div className="gradient-orb orbe-3"></div>
        <div className="grid-overlay"></div>
        
        {/* Partículas flotantes */}
        <div className="particles">
          {[...Array(80)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${Math.random() * 6 + 3}s`,
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              opacity: Math.random() * 0.5 + 0.2
            }}></div>
          ))}
        </div>
      </div>

      <div className="login-container">
        <div className={`login-card ${animacionActiva ? 'animate-in' : ''}`}>
          
          {/* Botón de tema */}
          <button 
            className="theme-toggle-login" 
            onClick={() => setModoOscuro(!modoOscuro)}
            title={modoOscuro ? 'Modo claro' : 'Modo oscuro'}
          >
            <span className="toggle-icon">{modoOscuro ? '☀️' : '🌙'}</span>
            <span className="toggle-text">{modoOscuro ? 'Claro' : 'Oscuro'}</span>
          </button>

          {/* Botón limpiar */}
          {(email || password) && (
            <button 
              className="clear-button"
              onClick={limpiarFormulario}
              title="Limpiar formulario"
            >
              <span className="clear-icon">🗑️</span>
            </button>
          )}

          {/* Logo y título */}
          <div className="login-header">
            <div className="logo-3d">
              <span className="logo-icon">🏭</span>
              <div className="logo-pulse"></div>
              <span className="logo-glow"></span>
            </div>
            <h1 className="login-title">
              TEGRA ERP
              <span className="title-badge">PRO</span>
            </h1>
            <p className="login-subtitle">Sistema de Gestión Empresarial</p>
          </div>

          {/* Feature rotativo */}
          <div className="feature-rotator">
            <div className="feature-content">
              <span className="feature-icon">{features[activeFeature].icon}</span>
              <div className="feature-text">
                <h4>{features[activeFeature].title}</h4>
                <p>{features[activeFeature].desc}</p>
              </div>
            </div>
            <div className="feature-dots">
              {features.map((_, idx) => (
                <span 
                  key={idx} 
                  className={`dot ${activeFeature === idx ? 'active' : ''}`}
                  onClick={() => setActiveFeature(idx)}
                />
              ))}
            </div>
          </div>

          {/* Selector de roles */}
          <div className="roles-selector">
            <h3 className="roles-title">
              <span className="title-icon">👥</span>
              Selecciona tu rol
            </h3>
            <div className="roles-grid">
              {rolesList.map(rol => {
                const usuarioEjemplo = USUARIOS.find(u => u.rol === rol.id);
                return (
                  <button
                    key={rol.id}
                    className={`rol-btn ${rolSeleccionado === rol.id ? 'active' : ''}`}
                    onClick={() => autocompletarRol(rol.id)}
                    style={{ borderColor: rol.color }}
                  >
                    <div className="rol-icon-wrapper">
                      <span className="rol-icon" style={{ backgroundColor: rol.color + '20', color: rol.color }}>
                        {rol.icono}
                      </span>
                      {usuarioEjemplo && (
                        <span className="rol-avatar" style={{ background: rol.color }}>
                          {usuarioEjemplo.avatar}
                        </span>
                      )}
                    </div>
                    <div className="rol-info">
                      <span className="rol-nombre">{rol.nombre}</span>
                      <span className="rol-desc">{rol.descripcion}</span>
                      <div className="rol-meta">
                        <span className="rol-badge" style={{ backgroundColor: rol.color }}>
                          {rol.modulos.length} módulos
                        </span>
                        {usuarioEjemplo && (
                          <span className="rol-demo">Demo: {usuarioEjemplo.email}</span>
                        )}
                      </div>
                    </div>
                    {rolSeleccionado === rol.id && (
                      <div className="rol-check">✓</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Formulario de login */}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label htmlFor="email">
                <span className="label-icon">📧</span>
                Correo Electrónico
              </label>
              <div className="input-wrapper">
                <span className="input-icon">📧</span>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@tegraglobal.com"
                  required
                  autoComplete="email"
                />
                {email && (
                  <span className="input-check">✓</span>
                )}
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">
                <span className="label-icon">🔒</span>
                Contraseña
              </label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="checkbox-custom"></span>
                <span className="checkbox-text">Recordarme</span>
              </label>

              <a href="#" className="forgot-link" onClick={(e) => e.preventDefault()}>
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Mensajes de error/success */}
            {error && (
              <div className="message error animate-shake">
                <span className="message-icon">❌</span>
                <span className="message-text">{error}</span>
                <div className="message-progress"></div>
              </div>
            )}

            {success && (
              <div className="message success animate-slide-down">
                <span className="message-icon">✅</span>
                <span className="message-text">{success}</span>
                <div className="message-progress"></div>
              </div>
            )}

            {/* Botón de login */}
            <button
              type="submit"
              className={`login-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <>
                  <span className="btn-icon">🔓</span>
                  <span>Iniciar Sesión</span>
                  <span className="btn-arrow">→</span>
                </>
              )}
            </button>

            {/* Usuarios de prueba rápidos */}
            <div className="quick-users">
              <span className="quick-title">🔑 Acceso rápido:</span>
              <div className="quick-buttons">
                {USUARIOS.slice(0, 5).map(user => (
                  <button
                    key={user.id}
                    className="quick-user"
                    onClick={() => {
                      setEmail(user.email);
                      setPassword(user.password || '');
                      setSuccess(`📋 Usuario ${user.nombre} seleccionado`);
                      setTimeout(() => setSuccess(''), 2000);
                    }}
                  >
                    <span className="quick-avatar" style={{ background: ROLES_CONFIG[user.rol]?.color }}>
                      {user.avatar}
                    </span>
                    <span className="quick-name">{user.nombre}</span>
                  </button>
                ))}
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="login-footer">
            <div className="security-badge">
              <span>🔒</span>
              <span>SSL Secure</span>
            </div>
            <p className="version">Versión 3.0.0 • Tiempo Real</p>
            <p className="copyright">© 2026 TEGRA Global. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;