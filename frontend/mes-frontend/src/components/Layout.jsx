import { Link, useLocation } from "react-router-dom";
import "./Layout.css";

export default function Layout({ children }) {
  const location = useLocation();

  const menu = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Órdenes", path: "/ordenes" },
    { name: "Escaneo", path: "/scan" },
    { name: "Configuración", path: "/config" },
  ];

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2 className="logo">TEGRA ERP</h2>

        {menu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={
              location.pathname === item.path
                ? "menu-item active"
                : "menu-item"
            }
          >
            {item.name}
          </Link>
        ))}
      </aside>

      <main className="content">{children}</main>
    </div>
  );
}
