import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // LOGIN DEMO → entra siempre
    if (usuario && password) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="login-container">

      <div className="login-left">
        <h1>TEGRA ERP</h1>
        <p>Sistema de Gestión Industrial</p>
        <span>Demo Mode</span>
      </div>

      <div className="login-card">
        <h2>Iniciar Sesión</h2>

        <form onSubmit={handleLogin}>

          <div className="input-group">
            <label>Usuario</label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit">
            Entrar
          </button>

        </form>

        <p style={{ marginTop: "10px", fontSize: "12px", opacity: 0.6 }}>
          Demo sin autenticación
        </p>
      </div>

    </div>
  );
}
