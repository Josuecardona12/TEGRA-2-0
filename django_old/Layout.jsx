// src/components/Layout.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children }) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const location = useLocation();

    const menuItems = {
        general: [
            { path: '/', icon: '📊', label: 'Dashboard', active: true },
            { path: '/atrasos', icon: '⏰', label: 'Atrasos' },
        ],
        operaciones: [
            { path: '/plan-semanal', icon: '📅', label: 'Plan Semanal' },
            { path: '/ordenes', icon: '📋', label: 'Órdenes' },
            { path: '/produccion', icon: '🏭', label: 'Producción' },
        ]
    };

    return (
        <div className="app-container">
            {/* Sidebar */}
            <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
                {/* Logo */}
                <div className="sidebar-logo">
                    <span className="logo-icon">🏭</span>
                    {!sidebarCollapsed && <span className="logo-text">TEGRA ERP</span>}
                </div>

                {/* Buscador */}
                <div className="sidebar-search">
                    <span className="search-icon">🔍</span>
                    {!sidebarCollapsed && (
                        <input 
                            type="text" 
                            placeholder="Buscar en menú..." 
                            className="search-input"
                        />
                    )}
                </div>

                {/* Menú GENERAL */}
                <div className="menu-section">
                    {!sidebarCollapsed && <div className="menu-title">GENERAL</div>}
                    {menuItems.general.map(item => (
                        <Link 
                            key={item.path}
                            to={item.path}
                            className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            <span className="menu-icon">{item.icon}</span>
                            {!sidebarCollapsed && <span className="menu-label">{item.label}</span>}
                        </Link>
                    ))}
                </div>

                {/* Menú OPERACIONES */}
                <div className="menu-section">
                    {!sidebarCollapsed && <div className="menu-title">OPERACIONES</div>}
                    {menuItems.operaciones.map(item => (
                        <Link 
                            key={item.path}
                            to={item.path}
                            className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            <span className="menu-icon">{item.icon}</span>
                            {!sidebarCollapsed && <span className="menu-label">{item.label}</span>}
                        </Link>
                    ))}
                </div>

                {/* Perfil de usuario */}
                <div className="sidebar-footer">
                    <div className="user-profile">
                        <div className="user-avatar">JC</div>
                        {!sidebarCollapsed && (
                            <div className="user-info">
                                <div className="user-name">Josué Cardona</div>
                                <div className="user-role">ADMINISTRADOR</div>
                            </div>
                        )}
                    </div>

                    {!sidebarCollapsed && (
                        <>
                            <div className="company-info">
                                <span className="company-name">Ocurro</span>
                            </div>

                            <div className="system-info">
                                <div className="version">
                                    <span className="info-label">VERSIÓN</span>
                                    <span className="info-value">2.5.0</span>
                                </div>
                                <div className="sincro">
                                    <span className="info-label">SINCRO</span>
                                    <span className="info-value">1:29:52 PM</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Botón colapsar */}
                <button 
                    className="collapse-btn"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                >
                    {sidebarCollapsed ? '→' : '←'}
                </button>
            </aside>

            {/* Contenido principal */}
            <main className="main-content">
                {/* Topbar */}
                <header className="topbar">
                    <div className="page-title">
                        {location.pathname === '/' && 'Dashboard'}
                        {location.pathname === '/atrasos' && 'Gestión de Atrasos'}
                        {location.pathname === '/plan-semanal' && 'Plan Semanal'}
                        {location.pathname === '/ordenes' && 'Órdenes de Trabajo'}
                        {location.pathname === '/produccion' && 'Producción'}
                    </div>
                    
                    <div className="topbar-actions">
                        <button className="notification-btn">🔔</button>
                        <button className="settings-btn">⚙️</button>
                    </div>
                </header>

                {/* Contenido de la página */}
                <div className="page-content">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;