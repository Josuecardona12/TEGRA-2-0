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

  const rolesList = Object.values(ROLES_CONFIG);

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
  }, [modoOscuro]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    setTimeout(() => {
      const usuario = USUARIOS.find(u => u.email === email);

      if (usuario) {
        const usuarioConMetadata = {
          id: usuario.id,
          email: usuario.email,
          rol: usuario.rol,
          nombre: usuario.nombre,
          avatar: usuario.avatar,
          ultimoAcceso: new Date().toISOString(),
          sesionIniciada: true
        };

        localStorage.setItem('usuario', JSON.stringify(usuarioConMetadata));
        
        refreshUser();
        
        setSuccess(`✅ Bienvenido ${usuario.nombre}`);

        if (rememberMe) {
          localStorage.setItem('rememberEmail', email);
        } else {
          localStorage.removeItem('rememberEmail');
        }

        setTimeout(() => {
          navigate('/dashboard');
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
      setSuccess(`📋 Rol ${rolId} seleccionado - Ingresa tu contraseña`);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const limpiarFormulario = () => {
    setEmail('');
    setPassword('');
    setError('');
    setSuccess('');
    setRolSeleccionado('');
  };

  return (
    <div className={`login-ultra ${modoOscuro ? 'dark-mode' : ''}`}>
      <div className="login-background">
        <div className="gradient-orb orbe-1"></div>
        <div className="gradient-orb orbe-2"></div>
        <div className="gradient-orb orbe-3"></div>
        <div className="grid-overlay"></div>
        <div className="particles">
          {[...Array(50)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`
            }}></div>
          ))}
        </div>
      </div>

      <div className="login-container">
        <div className={`login-card ${animacionActiva ? 'animate-in' : ''}`}>
          
          <button 
            className="theme-toggle-login" 
            onClick={() => setModoOscuro(!modoOscuro)}
            title={modoOscuro ? 'Modo claro' : 'Modo oscuro'}
          >
            <span className="toggle-icon">{modoOscuro ? '☀️' : '🌙'}</span>
          </button>

          {(email || password) && (
            <button 
              className="clear-button"
              onClick={limpiarFormulario}
              title="Limpiar formulario"
            >
              <span className="clear-icon">🗑️</span>
            </button>
          )}

          <div className="login-header">
            <div className="logo-3d">
              <span className="logo-icon">🏭</span>
              <span className="logo-glow"></span>
            </div>
            <h1 className="login-title">
              TEGRA ERP
              <span className="title-badge">PRO</span>
            </h1>
            <p className="login-subtitle">Sistema de Gestión Empresarial</p>
          </div>

          <div className="roles-selector">
            <h3 className="roles-title">
              <span className="title-icon">👥</span>
              Selecciona tu rol
            </h3>
            <div className="roles-grid">
              {rolesList.map(rol => (
                <button
                  key={rol.id}
                  className={`rol-btn ${rolSeleccionado === rol.id ? 'active' : ''}`}
                  onClick={() => autocompletarRol(rol.id)}
                  style={{ borderColor: rol.color }}
                >
                  <span className="rol-icon" style={{ backgroundColor: rol.color + '20', color: rol.color }}>
                    {rol.icono}
                  </span>
                  <span className="rol-info">
                    <span className="rol-nombre">{rol.nombre}</span>
                    <span className="rol-desc">{rol.descripcion}</span>
                    <span className="rol-badge" style={{ backgroundColor: rol.color }}>
                      {rol.modulos.length} módulos
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>

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

            {error && (
              <div className="message error">
                <span className="message-icon">❌</span>
                <span className="message-text">{error}</span>
              </div>
            )}

            {success && (
              <div className="message success">
                <span className="message-icon">✅</span>
                <span className="message-text">{success}</span>
              </div>
            )}

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
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p className="version">Versión 3.0.0 • Tiempo Real</p>
            <p className="copyright">© 2026 TEGRA Global. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;