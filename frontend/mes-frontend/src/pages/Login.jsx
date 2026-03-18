import React, { useState, useEffect } from 'react';
import './Login.css';

const Login = () => {
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

  // Efecto para animación inicial
  useEffect(() => {
    setAnimacionActiva(true);
    setTimeout(() => setAnimacionActiva(false), 1000);
  }, []);

  // Cargar modo oscuro guardado
  useEffect(() => {
    const modoGuardado = localStorage.getItem('modoOscuroLogin') === 'true';
    setModoOscuro(modoGuardado);
  }, []);

  // Guardar modo oscuro
  useEffect(() => {
    localStorage.setItem('modoOscuroLogin', modoOscuro);
  }, [modoOscuro]);

  // ================ ROLES Y USUARIOS DE EJEMPLO ================
  const usuarios = [
    { 
      id: 1, 
      email: 'admin@tegraglobal.com', 
      password: 'admin123', 
      rol: 'admin',
      nombre: 'Administrador',
      avatar: 'AD',
      permisos: ['dashboard', 'reportes', 'usuarios', 'configuracion', 'trazabilidad', 'maquinas', 'diseno']
    },
    { 
      id: 2, 
      email: 'supervisor@tegraglobal.com', 
      password: 'super123', 
      rol: 'supervisor',
      nombre: 'Supervisor',
      avatar: 'SV',
      permisos: ['dashboard', 'reportes', 'trazabilidad', 'maquinas']
    },
    { 
      id: 3, 
      email: 'operador@tegraglobal.com', 
      password: 'operador123', 
      rol: 'operador',
      nombre: 'Operador',
      avatar: 'OP',
      permisos: ['dashboard', 'trazabilidad', 'maquinas']
    },
    { 
      id: 4, 
      email: 'calidad@tegraglobal.com', 
      password: 'calidad123', 
      rol: 'calidad',
      nombre: 'Inspector de Calidad',
      avatar: 'QC',
      permisos: ['dashboard', 'fftt-quality', 'reportes']
    },
    { 
      id: 5, 
      email: 'disenador@tegraglobal.com', 
      password: 'diseno123', 
      rol: 'disenador',
      nombre: 'Diseñador',
      avatar: 'DS',
      permisos: ['dashboard', 'diseno']
    },
    { 
      id: 6, 
      email: 'invitado@tegraglobal.com', 
      password: 'invitado123', 
      rol: 'invitado',
      nombre: 'Invitado',
      avatar: 'IN',
      permisos: ['dashboard']
    }
  ];

  // ================ ROLES DISPONIBLES ================
  const roles = [
    { 
      id: 'admin', 
      nombre: 'Administrador', 
      icono: '👑', 
      color: '#6366f1',
      descripcion: 'Acceso completo al sistema',
      nivel: 5
    },
    { 
      id: 'supervisor', 
      nombre: 'Supervisor', 
      icono: '🔍', 
      color: '#10b981',
      descripcion: 'Supervisión de operaciones',
      nivel: 4
    },
    { 
      id: 'operador', 
      nombre: 'Operador', 
      icono: '⚙️', 
      color: '#3b82f6',
      descripcion: 'Operaciones de producción',
      nivel: 3
    },
    { 
      id: 'calidad', 
      nombre: 'Calidad', 
      icono: '✅', 
      color: '#f59e0b',
      descripcion: 'Control de calidad FFTT',
      nivel: 3
    },
    { 
      id: 'disenador', 
      nombre: 'Diseñador', 
      icono: '🎨', 
      color: '#8b5cf6',
      descripcion: 'Diseño y creatividad',
      nivel: 2
    },
    { 
      id: 'invitado', 
      nombre: 'Invitado', 
      icono: '👤', 
      color: '#64748b',
      descripcion: 'Acceso limitado',
      nivel: 1
    }
  ];

  // ================ MANEJADORES ================
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Simular validación
    setTimeout(() => {
      const usuario = usuarios.find(u => u.email === email && u.password === password);

      if (usuario) {
        setSuccess(`✅ Bienvenido ${usuario.nombre}`);
        
        // Guardar usuario en localStorage
        localStorage.setItem('usuario', JSON.stringify({
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
          rol: usuario.rol,
          avatar: usuario.avatar,
          permisos: usuario.permisos
        }));

        if (rememberMe) {
          localStorage.setItem('rememberEmail', email);
        } else {
          localStorage.removeItem('rememberEmail');
        }

        // Redireccionar después de 1 segundo
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      } else {
        setError('❌ Credenciales incorrectas');
      }
      setIsLoading(false);
    }, 1500);
  };

  // Cargar email guardado
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // ================ AUTOCOMPLETAR ROL (para demo) ================
  const autocompletarRol = (rolId) => {
    setRolSeleccionado(rolId);
    const usuarioEjemplo = usuarios.find(u => u.rol === rolId);
    if (usuarioEjemplo) {
      setEmail(usuarioEjemplo.email);
      setPassword(usuarioEjemplo.password);
    }
  };

  return (
    <div className={`login-ultra ${modoOscuro ? 'dark-mode' : ''}`}>
      {/* ===== FONDO ANIMADO ===== */}
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

      {/* ===== CONTENEDOR PRINCIPAL ===== */}
      <div className="login-container">
        <div className={`login-card ${animacionActiva ? 'animate-in' : ''}`}>
          
          {/* ===== TOGGLE MODO OSCURO ===== */}
          <button 
            className="theme-toggle-login" 
            onClick={() => setModoOscuro(!modoOscuro)}
            title={modoOscuro ? 'Modo claro' : 'Modo oscuro'}
          >
            <span className="toggle-icon">{modoOscuro ? '☀️' : '🌙'}</span>
          </button>

          {/* ===== LOGO Y TÍTULO ===== */}
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

          {/* ===== SELECTOR DE ROLES (DEMO) ===== */}
          <div className="roles-selector">
            <h3 className="roles-title">
              <span className="title-icon">👥</span>
              Selecciona un rol para demo
            </h3>
            <div className="roles-grid">
              {roles.map(rol => (
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
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ===== FORMULARIO ===== */}
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

              <a href="#" className="forgot-link">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* ===== MENSAJES ===== */}
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

            {/* ===== BOTÓN DE INICIO ===== */}
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

            {/* ===== ACCESOS RÁPIDOS ===== */}
            <div className="quick-access">
              <p className="quick-title">Acceso rápido para pruebas:</p>
              <div className="quick-buttons">
                <button 
                  type="button" 
                  className="quick-btn admin"
                  onClick={() => autocompletarRol('admin')}
                >
                  <span className="quick-icon">👑</span>
                  <span>Admin</span>
                </button>
                <button 
                  type="button" 
                  className="quick-btn supervisor"
                  onClick={() => autocompletarRol('supervisor')}
                >
                  <span className="quick-icon">🔍</span>
                  <span>Supervisor</span>
                </button>
                <button 
                  type="button" 
                  className="quick-btn operador"
                  onClick={() => autocompletarRol('operador')}
                >
                  <span className="quick-icon">⚙️</span>
                  <span>Operador</span>
                </button>
              </div>
            </div>
          </form>

          {/* ===== FOOTER ===== */}
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