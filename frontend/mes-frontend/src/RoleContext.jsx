import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from "react";
import { getModulosPorRol, getRolInfo, MODULOS } from "./config/roles.config";

const RoleContext = createContext();

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
};

export const RoleProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userModules, setUserModules] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(() => {
    try {
      const storedUser = localStorage.getItem("usuario");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setUserRole(userData.rol);
        
        const modules = getModulosPorRol(userData.rol);
        setUserModules(modules);
      } else {
        setUser(null);
        setUserRole(null);
        setUserModules([]);
      }
    } catch (error) {
      console.error("Error loading user:", error);
      setUser(null);
      setUserRole(null);
      setUserModules([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUser = useCallback(() => {
    setLoading(true);
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    loadUser();
    
    const handleStorageChange = (e) => {
      if (e.key === "usuario") {
        loadUser();
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [loadUser]);

  const getMenuItems = useCallback(() => {
    if (userRole === "admin") {
      return Object.values(MODULOS).map(m => ({
        path: m.id,
        name: m.nombre,
        icon: m.icono,
        category: m.categoria,
        badge: m.badge
      }));
    }
    return userModules.map(m => ({
      path: m.id,
      name: m.nombre,
      icon: m.icono,
      category: m.categoria,
      badge: m.badge
    }));
  }, [userRole, userModules]);

  const hasModule = useCallback((moduleId) => {
    if (!userRole) return false;
    if (userRole === "admin") return true;
    return userModules.some(m => m.id === moduleId);
  }, [userRole, userModules]);

  const roleInfo = useMemo(() => getRolInfo(userRole), [userRole]);

  const value = {
    user,
    userRole,
    userModules,
    loading,
    hasModule,
    getMenuItems,
    refreshUser,
    roleInfo,
    isAdmin: userRole === "admin",
    isSupervisor: userRole === "supervisor",
    isOperador: userRole === "operador",
    isCalidad: userRole === "calidad",
    isDisenador: userRole === "disenador",
    isRRHH: userRole === "rrhh",
    isMantenimiento: userRole === "mantenimiento",
    isInvitado: userRole === "invitado"
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};