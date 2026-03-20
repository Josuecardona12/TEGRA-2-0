import React from "react";
import { Link } from "react-router-dom";
import { useRole } from "../RoleContext";
import "./Unauthorized.css";

const Unauthorized = () => {
  const { userRole, userPermissions } = useRole();

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-card">
        <div className="unauthorized-icon">🚫</div>
        <h1 className="unauthorized-title">Acceso No Autorizado</h1>
        <p className="unauthorized-message">
          No tienes los permisos necesarios para acceder a esta página.
        </p>

        <div className="unauthorized-info">
          <div className="info-section">
            <span className="info-label">Tu rol actual:</span>
            <span className="info-value">{userRole || 'Sin rol'}</span>
          </div>

          {userPermissions && userPermissions.length > 0 && (
            <div className="info-section">
              <span className="info-label">Tus permisos:</span>
              <div className="permissions-list">
                {userPermissions.slice(0, 8).map(perm => (
                  <span key={perm} className="permission-badge">
                    {perm.replace(/_/g, ' ')}
                  </span>
                ))}
                {userPermissions.length > 8 && (
                  <span className="permission-badge more">
                    +{userPermissions.length - 8}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="unauthorized-actions">
          <Link to="/dashboard" className="btn-primary">
            Volver al Dashboard
          </Link>
          <Link to="/login" className="btn-secondary" onClick={() => {
            localStorage.removeItem('usuario');
          }}>
            Cerrar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;