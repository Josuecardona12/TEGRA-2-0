// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import './Login.css';

// ============================================
// CONFIGURACIÓN WEBSOCKET PARA VERIFICAR SERVIDOR
// ============================================
const WS_URL = 'wss://glowing-lamp-r47wvpq4574fxv7j-8080.app.github.dev';

function Login() {
    const [form, setForm] = useState({
        usuario: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    
    // ================ ESTADO DE CONEXIÓN ================
    const [conectado, setConectado] = useState(false);
    const [lotesActivos, setLotesActivos] = useState(0);

    // ================ VERIFICAR CONEXIÓN AL SERVIDOR ================
    useEffect(() => {
        const ws = new WebSocket(WS_URL);
        
        ws.onopen = () => {
            console.log('✅ Login: Servidor conectado');
            setConectado(true);
        };
        
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'INIT' || data.type === 'ACTUALIZACION') {
                    const lotes = data.data.lotes || [];
                    setLotesActivos(lotes.length);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };
        
        ws.onerror = () => {
            console.log('❌ Login: Sin conexión al servidor');
            setConectado(false);
        };
        
        ws.onclose = () => {
            setConectado(false);
        };
        
        return () => ws.close();
    }, []);

    // Efecto de parallax en el fondo
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth - 0.5) * 20,
                y: (e.clientY / window.innerHeight - 0.5) * 20
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        // Simular validación
        setTimeout(() => {
            setLoading(false);
            window.location.href = '/dashboard';
        }, 1500);
    };

    return (
        <div className="login-container">
            {/* Fondo animado con gradientes */}
            <div className="background-gradient"></div>
            
            {/* Capa de efecto glass */}
            <div className="glass-overlay"></div>
            
            {/* Partículas animadas */}
            <div className="particles">
                {[...Array(50)].map((_, i) => (
                    <div 
                        key={i} 
                        className="particle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            width: `${Math.random() * 6 + 2}px`,
                            height: `${Math.random() * 6 + 2}px`
                        }}
                    ></div>
                ))}
            </div>

            {/* Indicador de conexión del servidor */}
            <div className={`server-status-indicator ${conectado ? 'connected' : 'disconnected'}`}>
                <span className="status-dot"></span>
                <span className="status-text">
                    {conectado ? `Servidor OK • ${lotesActivos} lotes` : 'Servidor: Sin conexión'}
                </span>
            </div>

            {/* Círculos decorativos con efecto parallax */}
            <div 
                className="floating-circle circle-1"
                style={{
                    transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`
                }}
            ></div>
            <div 
                className="floating-circle circle-2"
                style={{
                    transform: `translate(${mousePosition.x * -0.3}px, ${mousePosition.y * -0.3}px)`
                }}
            ></div>
            <div 
                className="floating-circle circle-3"
                style={{
                    transform: `translate(${mousePosition.x * 0.2}px, ${mousePosition.y * -0.4}px)`
                }}
            ></div>

            {/* Tarjeta de login con efecto 3D */}
            <div 
                className="login-card"
                style={{
                    transform: `perspective(1000px) rotateX(${mousePosition.y * 0.05}deg) rotateY(${mousePosition.x * 0.05}deg)`
                }}
            >
                {/* Borde animado */}
                <div className="card-border"></div>
                
                {/* Logo flotante con animación 3D */}
                <div className="logo-container">
                    <div className="logo-glow"></div>
                    <div className="logo-3d">
                        <div className="logo-face front">
                            <span className="logo-icon">🏭</span>
                        </div>
                        <div className="logo-face back">
                            <span className="logo-icon">⚙️</span>
                        </div>
                        <div className="logo-face right"></div>
                        <div className="logo-face left"></div>
                        <div className="logo-face top"></div>
                        <div className="logo-face bottom"></div>
                    </div>
                </div>

                {/* Texto de bienvenida con efecto glass */}
                <div className="welcome-text">
                    <h1 className="title">
                        <span className="title-word">ERP</span>
                        <span className="title-word">Gestión</span>
                    </h1>
                    <div className="subtitle-container">
                        <p className="subtitle">Sistema de Control Empresarial</p>
                        <div className="subtitle-line"></div>
                    </div>
                </div>

                {/* Formulario premium */}
                <form onSubmit={handleSubmit} className="login-form">
                    {/* Campo usuario premium */}
                    <div className="input-group">
                        <label className="input-label">
                            <span className="label-icon">👤</span>
                            <span className="label-text">Usuario</span>
                        </label>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                value={form.usuario}
                                onChange={(e) => setForm({...form, usuario: e.target.value})}
                                placeholder="demo@tegra.com"
                                className="premium-input"
                                required
                            />
                            <div className="input-highlight"></div>
                            <div className="input-focus-effect"></div>
                        </div>
                    </div>

                    {/* Campo contraseña premium */}
                    <div className="input-group">
                        <label className="input-label">
                            <span className="label-icon">🔒</span>
                            <span className="label-text">Contraseña</span>
                        </label>
                        <div className="input-wrapper">
                            <input
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm({...form, password: e.target.value})}
                                placeholder="••••••••"
                                className="premium-input"
                                required
                            />
                            <div className="input-highlight"></div>
                            <div className="input-focus-effect"></div>
                        </div>
                    </div>

                    {/* Opciones extras */}
                    <div className="login-options">
                        <label className="remember-checkbox">
                            <input type="checkbox" />
                            <span className="checkmark"></span>
                            <span>Recordarme</span>
                        </label>
                        <a href="#" className="forgot-link">¿Olvidaste tu contraseña?</a>
                    </div>

                    {/* Botón premium con efecto 3D */}
                    <button 
                        type="submit" 
                        className={`premium-button ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        <div className="button-inner">
                            {loading ? (
                                <>
                                    <div className="loader"></div>
                                    <span>Procesando...</span>
                                </>
                            ) : (
                                <>
                                    <span className="button-text">Iniciar Sesión</span>
                                    <span className="button-icon">→</span>
                                </>
                            )}
                        </div>
                        <div className="button-glow"></div>
                        <div className="button-shine"></div>
                    </button>

                    {/* Mensaje de error */}
                    {error && (
                        <div className="error-message">
                            <span className="error-icon">⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Mensaje demo */}
                    <div className="demo-badge">
                        <div className="demo-badge-inner">
                            <span className="demo-icon">⚡</span>
                            <span>DEMO - Cualquier usuario funciona</span>
                        </div>
                    </div>

                    {/* Acceso rápido */}
                    <div className="quick-access">
                        <p>Acceso rápido:</p>
                        <div className="quick-buttons">
                            <button 
                                type="button" 
                                className="quick-btn"
                                onClick={() => setForm({ usuario: 'admin', password: 'admin123' })}
                            >
                                Admin
                            </button>
                            <button 
                                type="button" 
                                className="quick-btn"
                                onClick={() => setForm({ usuario: 'supervisor', password: 'sup123' })}
                            >
                                Supervisor
                            </button>
                            <button 
                                type="button" 
                                className="quick-btn"
                                onClick={() => setForm({ usuario: 'operador', password: 'op123' })}
                            >
                                Operador
                            </button>
                        </div>
                    </div>
                </form>

                {/* Footer con enlaces */}
                <div className="login-footer">
                    <div className="footer-links">
                        <a href="#">Términos</a>
                        <span className="separator">•</span>
                        <a href="#">Privacidad</a>
                        <span className="separator">•</span>
                        <a href="#">Soporte</a>
                    </div>
                    <p className="copyright">
                        © 2026 TEGRA Manufacturing. Todos los derechos reservados.
                    </p>
                    <p className="version">
                        Versión 3.2.0 • Build 2026.03.11
                    </p>
                </div>
            </div>

            {/* Estilos para el indicador de conexión */}
            <style>{`
                .server-status-indicator {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    border-radius: 40px;
                    font-size: 14px;
                    font-weight: 600;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    animation: slideDown 0.5s ease;
                }
                
                .server-status-indicator.connected {
                    background: rgba(16, 185, 129, 0.2);
                    color: #10b981;
                    border: 1px solid rgba(16, 185, 129, 0.3);
                }
                
                .server-status-indicator.disconnected {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                    border: 1px solid rgba(239, 68, 68, 0.3);
                }
                
                .status-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    display: inline-block;
                }
                
                .connected .status-dot {
                    background: #10b981;
                    box-shadow: 0 0 15px #10b981;
                    animation: pulse 2s infinite;
                }
                
                .disconnected .status-dot {
                    background: #ef4444;
                    box-shadow: 0 0 15px #ef4444;
                }
                
                .status-text {
                    font-family: 'Inter', sans-serif;
                    letter-spacing: 0.3px;
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.2); }
                }
                
                @keyframes slideDown {
                    from {
                        transform: translateY(-100%);
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
}

export default Login;