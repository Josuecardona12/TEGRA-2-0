// src/pages/Login.jsx
import React, { useState } from 'react';
import './Login.css';

function Login() {
    const [form, setForm] = useState({
        usuario: '',
        password: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Directo al dashboard sin validar nada
        window.location.href = '/dashboard';
    };

    return (
        <div className="login-container">
            {/* Fondo con partículas */}
            <div className="particles">
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
            </div>

            {/* Tarjeta de login */}
            <div className="login-card">
                {/* Logo flotante */}
                <div className="logo-container">
                    <div className="logo-glow"></div>
                    <div className="logo">
                        <span className="logo-icon">🏭</span>
                    </div>
                </div>

                {/* Texto de bienvenida */}
                <div className="welcome-text">
                    <h1 className="title">ERP Gestión</h1>
                    <p className="subtitle">Panel de Control</p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="login-form">
                    {/* Campo usuario con diseño premium */}
                    <div className="input-group">
                        <label className="input-label">
                            <span className="label-icon">👤</span>
                            <span>Usuario</span>
                        </label>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                value={form.usuario}
                                onChange={(e) => setForm({...form, usuario: e.target.value})}
                                placeholder="admin"
                                className="premium-input"
                            />
                            <div className="input-border"></div>
                        </div>
                    </div>

                    {/* Campo contraseña con diseño premium */}
                    <div className="input-group">
                        <label className="input-label">
                            <span className="label-icon">🔒</span>
                            <span>Contraseña</span>
                        </label>
                        <div className="input-wrapper">
                            <input
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm({...form, password: e.target.value})}
                                placeholder="••••••••"
                                className="premium-input"
                            />
                            <div className="input-border"></div>
                        </div>
                    </div>

                    {/* Botón premium */}
                    <button type="submit" className="premium-button">
                        <span className="button-text">Iniciar Sesión</span>
                        <span className="button-icon">→</span>
                        <div className="button-glow"></div>
                    </button>

                    {/* Mensaje demo */}
                    <div className="demo-badge">
                        <span className="demo-icon">⚡</span>
                        <span>Acceso directo - Sin credenciales</span>
                    </div>
                </form>

                {/* Footer */}
                <div className="login-footer">
                    <p>© 2024 ERP Gestión. Todos los derechos reservados.</p>
                </div>
            </div>
        </div>
    );
}

export default Login;