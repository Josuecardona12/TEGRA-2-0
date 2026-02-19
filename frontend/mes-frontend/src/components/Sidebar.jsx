import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="logo">TEGRA ERP</div>

      {/* GENERAL */}
      <div className="menu-section">
        <span className="section-title">GENERAL</span>

        <NavLink to="/" className="menu-item">
          Dashboard
        </NavLink>

        <NavLink to="/atrasos" className="menu-item">
          <span>Atrasos</span>
          <span className="badge"></span>
        </NavLink>
      </div>

      {/* OPERACIONES */}
      <div className="menu-section">
        <span className="section-title">OPERACIONES</span>

        <NavLink to="/plan-semanal" className="menu-item">
          Plan Semanal
        </NavLink>

        <NavLink to="/ordenes" className="menu-item">
          Órdenes
        </NavLink>

        <NavLink to="/produccion" className="menu-item">
          Producción
        </NavLink>

        <NavLink to="/escaneo" className="menu-item">
          Escaneo
        </NavLink>

        <NavLink to="/micelanios" className="menu-item">
          Miceláneos
        </NavLink>
      </div>

      {/* SISTEMA */}
      <div className="menu-section">
        <span className="section-title">SISTEMA</span>

        <NavLink to="/reportes" className="menu-item">
          Reportes
        </NavLink>

        <NavLink to="/configuracion" className="menu-item">
          Configuración
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
