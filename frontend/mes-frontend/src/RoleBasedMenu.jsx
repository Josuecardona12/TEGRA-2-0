import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useRole } from "./RoleContext";

const RoleBasedMenu = () => {
  const { hasModule, userRole } = useRole();
  const location = useLocation();
  const [openSections, setOpenSections] = useState({
    general: true,
    operaciones: true,
    sistema: true,
    disenadores: true // Nueva sección para diseñadores
  });

  // Obtener el rol del usuario desde localStorage
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const rolUsuario = usuario?.rol?.toLowerCase();

  // Verificar si es diseñador
  const esDisenador = rolUsuario === 'disenador' || rolUsuario === 'designer' || rolUsuario === 'diseñador';

  // Estructura del menú principal
  const menuSections = [
    {
      id: "general",
      title: "GENERAL",
      icon: "📌",
      items: [
        { name: "Dashboard", path: "/dashboard", icon: "🏠", permission: null, roles: ["admin", "supervisor", "operador"] },
        { name: "Atrasos", path: "/atrasos", icon: "⏱️", permission: null, roles: ["admin", "supervisor", "operador"] }
      ]
    },
    {
      id: "operaciones",
      title: "OPERACIONES",
      icon: "⚙️",
      items: [
        { name: "Plan Semanal", path: "/plan-semanal", icon: "📅", permission: null, roles: ["admin", "supervisor", "operador"] },
        { name: "Órdenes", path: "/ordenes", icon: "📋", permission: "ordenes", roles: ["admin", "supervisor"] },
        { name: "Máquinas", path: "/maquinas", icon: "⚙️", permission: "maquinas", roles: ["admin", "supervisor"] },
        { name: "Trazabilidad", path: "/trazabilidad", icon: "🔍", permission: "trazabilidad", roles: ["admin", "supervisor"] },
        { name: "Reporte RH", path: "/reporte-rh", icon: "👥", permission: "reporte-rh", roles: ["admin"] },
        { name: "Miceláneos", path: "/micelanios", icon: "📦", permission: null, roles: ["admin", "supervisor"] },
        { name: "FFTT Quality", path: "/fftt-quality", icon: "📈", permission: "fftt-quality", roles: ["admin", "supervisor"] },
        { name: "Plotter 17", path: "/plotter", icon: "🖨️", permission: "plotter", roles: ["admin", "supervisor"] },
        { name: "Diseño", path: "/diseno", icon: "🎨", permission: "diseno", roles: ["admin", "supervisor"] }
      ]
    },
    {
      id: "sistema",
      title: "SISTEMA",
      icon: "🔧",
      items: [
        { name: "Reportes", path: "/reportes", icon: "📑", permission: "reportes", roles: ["admin"] },
        { name: "Configuración", path: "/configuracion", icon: "⚙️", permission: "configuracion", roles: ["admin"] }
      ]
    }
  ];

  // ===== SECCIÓN EXCLUSIVA PARA DISEÑADORES =====
  const disenadoresSection = {
    id: "disenadores",
    title: "🎨 MIS DISEÑOS",
    icon: "🎨",
    items: [
      { name: "Buzón de Diseño", path: "/buzon-diseno", icon: "📬", permission: null, description: "Gestión de lotes para diseñadores" }
    ]
  };

  // Función para verificar si un ítem debe ser visible según el rol
  const esVisibleParaRol = (itemRoles) => {
    if (!itemRoles) return true; // Si no especifica roles, visible para todos
    if (esDisenador) {
      // Para diseñadores, solo mostrar items que incluyan "disenador" o items sin restricción
      return itemRoles.includes("disenador") || itemRoles.includes("designer") || itemRoles.includes("diseñador");
    }
    // Para admin/supervisor, mostrar items que incluyan su rol
    return itemRoles.includes(rolUsuario) || itemRoles.includes("admin") || itemRoles.includes("supervisor");
  };

  // Alternar sección
  const toggleSection = (sectionId) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Verificar permisos por módulo
  const hasAccess = (permission) => {
    if (!permission) return true;
    return hasModule && hasModule(permission);
  };

  return (
    <div className="role-based-menu">
      {/* Si es diseñador, mostrar solo su sección */}
      {esDisenador ? (
        // Vista de diseñador - Solo su buzón
        <div className="menu-section">
          <div 
            className="section-header"
            onClick={() => toggleSection("disenadores")}
          >
            <span className="section-icon">{disenadoresSection.icon}</span>
            <span className="section-title">{disenadoresSection.title}</span>
            <span className={`section-arrow ${openSections.disenadores ? "open" : ""}`}>
              ▼
            </span>
          </div>
          
          {openSections.disenadores && (
            <div className="section-items">
              {disenadoresSection.items.map((item) => (
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
      ) : (
        // Vista de Admin/Supervisor/Operador - Menú completo
        <>
          {menuSections.map((section) => {
            // Filtrar items según rol y permisos
            const visibleItems = section.items.filter(item => {
              const tienePermiso = hasAccess(item.permission);
              const tieneRol = esVisibleParaRol(item.roles);
              return tienePermiso && tieneRol;
            });
            
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
        </>
      )}
    </div>
  );
};

export default RoleBasedMenu;