import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Configuracion.css";

export default function Configuracion() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="config-container">
      <h1>⚙ Configuración del Sistema</h1>

      {/* CUENTA */}
      <div className="config-card">
        <h2>👤 Cuenta</h2>
        <p><strong>Usuario:</strong> {user?.username}</p>
        <button className="btn-logout" onClick={handleLogout}>
          🚪 Cerrar Sesión
        </button>
      </div>

      {/* EMPRESA */}
      <div className="config-card">
        <h2>🏢 Datos de la Empresa</h2>
        <p><strong>Nombre:</strong> TEGRA Manufacturing</p>
        <p><strong>Dirección:</strong> San Pedro Sula</p>
        <p><strong>Teléfono:</strong> +504 9999-9999</p>
        <p><strong>Email:</strong> contacto@tegra.com</p>

        <button className="btn-edit">
          ✏ Editar Información
        </button>
      </div>
    </div>
  );
}
