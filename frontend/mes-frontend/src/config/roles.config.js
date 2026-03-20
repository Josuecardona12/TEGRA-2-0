export const MODULOS = {
  DASHBOARD: { id: "dashboard", nombre: "Dashboard", icono: "📊", ruta: "/dashboard", categoria: "GENERAL", descripcion: "Panel principal con KPIs" },
  ATRASOS: { id: "atrasos", nombre: "Atrasos", icono: "⚠️", ruta: "/atrasos", categoria: "GENERAL", descripcion: "Control de atrasos" },
  PLAN_SEMANAL: { id: "plan-semanal", nombre: "Plan Semanal", icono: "📅", ruta: "/plan-semanal", categoria: "OPERACIONES", descripcion: "Planificación semanal" },
  ORDENES: { id: "ordenes", nombre: "Órdenes", icono: "📋", ruta: "/ordenes", categoria: "OPERACIONES", descripcion: "Gestión de órdenes" },
  MAQUINAS: { id: "maquinas", nombre: "Máquinas", icono: "🚀", ruta: "/maquinas", categoria: "OPERACIONES", descripcion: "Monitoreo de máquinas" },
  TRAZABILIDAD: { id: "trazabilidad", nombre: "Trazabilidad", icono: "📊", ruta: "/trazabilidad", categoria: "OPERACIONES", descripcion: "Seguimiento de lotes" },
  REPORTES_RH: { id: "reporte-rh", nombre: "Reporte RH", icono: "👥", ruta: "/reporte-rh", categoria: "OPERACIONES", descripcion: "Reportes RH" },
  MICELANIOS: { id: "micelanios", nombre: "Miceláneos", icono: "📦", ruta: "/micelanios", categoria: "OPERACIONES", descripcion: "Productos varios" },
  FFTT_QUALITY: { id: "fftt-quality", nombre: "FFTT Quality", icono: "🔬", ruta: "/fftt-quality", categoria: "OPERACIONES", descripcion: "Control calidad" },
  PLOTTER: { id: "plotter", nombre: "Plotter 17", icono: "🖨️", ruta: "/plotter", categoria: "OPERACIONES", descripcion: "Control plotters" },
  DISENO: { id: "diseno", nombre: "Diseño", icono: "🎨", ruta: "/diseno", categoria: "OPERACIONES", descripcion: "Gestión de diseños" },
  REPORTES: { id: "reportes", nombre: "Reportes", icono: "📈", ruta: "/reportes", categoria: "SISTEMA", descripcion: "Reportes avanzados" },
  CONFIGURACION: { id: "configuracion", nombre: "Configuración", icono: "⚙️", ruta: "/configuracion", categoria: "SISTEMA", descripcion: "Configuración del sistema" }
};

export const ROLES_CONFIG = {
  admin: {
    id: "admin",
    nombre: "Administrador",
    nivel: 100,
    color: "#6366f1",
    icono: "👑",
    descripcion: "Acceso total al sistema",
    modulos: [
      "dashboard", "atrasos", "plan-semanal", "ordenes", "maquinas",
      "trazabilidad", "reporte-rh", "micelanios", "fftt-quality",
      "plotter", "diseno", "reportes", "configuracion"
    ]
  },
  supervisor: {
    id: "supervisor",
    nombre: "Supervisor",
    nivel: 80,
    color: "#10b981",
    icono: "🔍",
    descripcion: "Supervisión de operaciones",
    modulos: [
      "dashboard", "atrasos", "plan-semanal", "ordenes", "maquinas",
      "trazabilidad", "reporte-rh", "fftt-quality", "reportes"
    ]
  },
  operador: {
    id: "operador",
    nombre: "Operador",
    nivel: 60,
    color: "#3b82f6",
    icono: "⚙️",
    descripcion: "Operaciones de producción",
    modulos: ["dashboard", "plan-semanal", "ordenes", "maquinas", "trazabilidad", "plotter"]
  },
  calidad: {
    id: "calidad",
    nombre: "Control Calidad",
    nivel: 60,
    color: "#f59e0b",
    icono: "✅",
    descripcion: "Control de calidad",
    modulos: ["dashboard", "fftt-quality", "reportes"]
  },
  disenador: {
    id: "disenador",
    nombre: "Diseñador",
    nivel: 50,
    color: "#8b5cf6",
    icono: "🎨",
    descripcion: "Diseño y creatividad",
    modulos: ["dashboard", "diseno"]
  },
  rrhh: {
    id: "rrhh",
    nombre: "Recursos Humanos",
    nivel: 70,
    color: "#ec4899",
    icono: "👥",
    descripcion: "Gestión de personal",
    modulos: ["dashboard", "reporte-rh", "reportes"]
  },
  mantenimiento: {
    id: "mantenimiento",
    nombre: "Mantenimiento",
    nivel: 55,
    color: "#f97316",
    icono: "🔧",
    descripcion: "Mantenimiento de máquinas",
    modulos: ["dashboard", "maquinas", "plotter"]
  },
  invitado: {
    id: "invitado",
    nombre: "Invitado",
    nivel: 10,
    color: "#64748b",
    icono: "👤",
    descripcion: "Acceso limitado",
    modulos: ["dashboard"]
  }
};

export const USUARIOS = [
  { id: 1, email: "admin@tegraglobal.com", rol: "admin", nombre: "Administrador", avatar: "AD" },
  { id: 2, email: "supervisor@tegraglobal.com", rol: "supervisor", nombre: "Supervisor", avatar: "SV" },
  { id: 3, email: "operador@tegraglobal.com", rol: "operador", nombre: "Operador", avatar: "OP" },
  { id: 4, email: "calidad@tegraglobal.com", rol: "calidad", nombre: "Inspector de Calidad", avatar: "QC" },
  { id: 5, email: "disenador@tegraglobal.com", rol: "disenador", nombre: "Diseñador", avatar: "DS" },
  { id: 6, email: "invitado@tegraglobal.com", rol: "invitado", nombre: "Invitado", avatar: "IN" },
  { id: 7, email: "rrhh@tegraglobal.com", rol: "rrhh", nombre: "Recursos Humanos", avatar: "RH" },
  { id: 8, email: "mantenimiento@tegraglobal.com", rol: "mantenimiento", nombre: "Mantenimiento", avatar: "MT" }
];

export const getModulosPorRol = (rol) => {
  const config = ROLES_CONFIG[rol];
  if (!config) return [];
  return config.modulos.map(moduloId => MODULOS[moduloId.toUpperCase().replace(/-/g, "_")]).filter(Boolean);
};

export const getRolInfo = (rol) => {
  return ROLES_CONFIG[rol] || ROLES_CONFIG.invitado;
};

export const getUsuarioPorEmail = (email) => {
  return USUARIOS.find(u => u.email === email);
};