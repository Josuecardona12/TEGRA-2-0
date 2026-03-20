import React from "react";
import { Navigate } from "react-router-dom";
import { useRole } from "./RoleContext";

const PermissionGuard = ({ 
  children, 
  requiredPermissions = [], 
  requireAll = false,
  redirectTo = "/unauthorized",
  fallback = null
}) => {
  const { hasModule, loading, userRole, roleInfo } = useRole();

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      }}>
        <div style={{
          width: "50px",
          height: "50px",
          border: "3px solid rgba(255,255,255,0.3)",
          borderTopColor: "white",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }} />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  if (!requiredPermissions || requiredPermissions.length === 0) {
    return <>{children}</>;
  }

  let hasAccess;
  if (requireAll) {
    hasAccess = requiredPermissions.every(perm => hasModule(perm));
  } else {
    hasAccess = requiredPermissions.some(perm => hasModule(perm));
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default PermissionGuard;