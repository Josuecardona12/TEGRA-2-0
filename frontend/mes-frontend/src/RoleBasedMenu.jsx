import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useRole } from "./RoleContext";

const RoleBasedMenu = () => {
  const { hasModule } = useRole();
  const location = useLocation();
  const [openSections, setOpenSections] = useState({
    general: true,
    operaciones: true,
    sistema: true
  });

  // Estructura del menú - SOLO LOS ÍTEMS DEL MENÚ, SIN EL HEADER DEL ROL
  const menuSections = [
    {
      id: "general",
      title: "GENERAL",
      icon: "📌",
      items: [
        { name: "Dashboard", path: "/dashboard", icon: "🏠", permission: null },
        { name: "Atrasos", path: "/atrasos", icon: "⏱️", permission: null }
      ]
    },
    {
      id: "operaciones",
      title: "OPERACIONES",
      icon: "⚙️",
      items: [
        { name: "Plan Semanal", path: "/plan-semanal", icon: "📅", permission: null },
        { name: "Órdenes", path: "/ordenes", icon: "📋", permission: "ordenes" },
        { name: "Máquinas", path: "/maquinas", icon: "⚙️", permission: "maquinas" },
        { name: "Trazabilidad", path: "/trazabilidad", icon: "🔍", permission: "trazabilidad" },
        { name: "Reporte RH", path: "/reporte-rh", icon: "👥", permission: "reporte-rh" },
        { name: "Miceláneos", path: "/micelanios", icon: "📦", permission: null },
        { name: "FFTT Quality", path: "/fftt-quality", icon: "📈", permission: "fftt-quality" },
        { name: "Plotter 17", path: "/plotter", icon: "🖨️", permission: "plotter" },
        { name: "Diseño", path: "/diseno", icon: "🎨", permission: "diseno" }
      ]
    },
    {
      id: "sistema",
      title: "SISTEMA",
      icon: "🔧",
      items: [
        { name: "Reportes", path: "/reportes", icon: "📑", permission: "reportes" },
        { name: "Configuración", path: "/configuracion", icon: "⚙️", permission: "configuracion" }
      ]
    }
  ];

  // Alternar sección
  const toggleSection = (sectionId) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Verificar permisos
  const hasAccess = (permission) => {
    if (!permission) return true;
    return hasModule && hasModule(permission);
  };

  return (
    <div className="role-based-menu">
      {menuSections.map((section) => {
        // Filtrar items visibles por permisos
        const visibleItems = section.items.filter(item => hasAccess(item.permission));
        
        if (visibleItems.length === 0) return null;
        
        return (
          <div key={section.id} className="menu-section">
            <div 
              className="section-header"
              onClick={() => toggleSection(section.id)}
            >
              <span className="section-icon">{section.icon}</span>
              <span className="section-title">{section.title}</span>
              <span className={`section-arrow ${openSections[section.id] ? "open" : ""}`}>
                ▼
              </span>
            </div>
            
            {openSections[section.id] && (
              <div className="section-items">
                {visibleItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => 
                      `menu-item ${isActive ? "active" : ""}`
                    }
                  >
                    <span className="menu-icon">{item.icon}</span>
                    <span className="menu-name">{item.name}</span>
                    {location.pathname === item.path && <span className="active-dot"></span>}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default RoleBasedMenu;