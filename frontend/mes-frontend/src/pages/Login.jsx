import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  const handleLogin = () => {
    login(username);
    navigate("/");
  };

  return (
    <div style={{ padding: 50 }}>
      <h2>Login ERP</h2>
      <input
        placeholder="Usuario"
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={handleLogin}>Ingresar</button>
    </div>
  );
}
