import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="sidebar">
      <div className="logo">TEGRA</div>

      <nav>
        <Link
          to="/"
          className={location.pathname === "/" ? "active" : ""}
        >
          Dashboard
        </Link>

        <Link
          to="/ordenes"
          className={location.pathname === "/ordenes" ? "active" : ""}
        >
          Órdenes
        </Link>
        <Link
  to="/plan-semanal"
  className={location.pathname === "/plan-semanal" ? "active" : ""}
>
  Plan Semanal
</Link>


        <Link
          to="/logistica"
          className={location.pathname === "/logistica" ? "active" : ""}
        >
          Logística
        </Link>
      </nav>
    </div>
  );
}
