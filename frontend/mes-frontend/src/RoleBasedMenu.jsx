import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useRole } from "./RoleContext";

const RoleBasedMenu = () => {
  const location = useLocation();
  const { getMenuItems, roleInfo, loading } = useRole();

  if (loading) return null;

  const isActive = (path) => location.pathname.includes(path);

  const menuItems = getMenuItems();

  const groupedMenu = menuItems.reduce((groups, item) => {
    const category = item.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {});

  const getCategoryIcon = (category) => {
    switch(category) {
      case "GENERAL": return "⭐";
      case "OPERACIONES": return "⚙️";
      case "SISTEMA": return "🔧";
      default: return "📁";
    }
  };

  const renderBadge = (badge) => {
    if (!badge) return null;
    if (badge === "LIVE") {
      return <span className="live-badge">LIVE</span>;
    }
    if (badge === "NUEVO") {
      return <span className="nav-badge new">NUEVO</span>;
    }
    if (badge === "PREMIUM") {
      return <span className="premium-badge">PREMIUM</span>;
    }
    return <span className="nav-badge">{badge}</span>;
  };

  if (menuItems.length === 0) {
    return (
      <div style={{
        textAlign: "center",
        padding: "40px 20px",
        color: "#64748b"
      }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔒</div>
        <p>No tienes módulos disponibles</p>
        <p style={{ fontSize: "12px", marginTop: "8px" }}>
          Contacta al administrador para obtener acceso
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="role-info-banner" style={{
        background: `linear-gradient(135deg, ${roleInfo.color}20, ${roleInfo.color}05)`,
        borderLeft: `3px solid ${roleInfo.color}`,
        padding: "12px 16px",
        margin: "0 16px 20px 16px",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        gap: "12px"
      }}>
        <span style={{ fontSize: "24px" }}>{roleInfo.icono}</span>
        <div>
          <div style={{ fontSize: "11px", color: "#64748b" }}>ROL ACTUAL</div>
          <div style={{ fontWeight: "bold", color: roleInfo.color }}>{roleInfo.nombre}</div>
          <div style={{ fontSize: "10px", color: "#64748b" }}>{roleInfo.descripcion}</div>
        </div>
      </div>

      {Object.entries(groupedMenu).map(([category, items]) => (
        <div key={category} className="nav-section">
          <div className="section-title">
            <span className="section-icon">{getCategoryIcon(category)}</span>
            <span>{category}</span>
          </div>
          {items.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${isActive(item.path) ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.name}</span>
              {renderBadge(item.badge)}
              {isActive(item.path) && <span className="nav-indicator"></span>}
            </Link>
          ))}
        </div>
      ))}
    </>
  );
};

export default RoleBasedMenu;