import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import "./Dashboard.css";

const data = [
  { name: "Lun", produccion: 120 },
  { name: "Mar", produccion: 210 },
  { name: "Mie", produccion: 180 },
  { name: "Jue", produccion: 250 },
  { name: "Vie", produccion: 300 },
];

export default function Dashboard() {
  return (
    <div className="dashboard">
      <h1>Dashboard General</h1>

      <div className="kpi-container">
        <div className="kpi-card">
          <h3>Producción Hoy</h3>
          <p>320</p>
        </div>

        <div className="kpi-card">
          <h3>Órdenes Activas</h3>
          <p>14</p>
        </div>

        <div className="kpi-card">
          <h3>Pedidos Enviados</h3>
          <p>27</p>
        </div>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid stroke="#e2e8f0" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="produccion"
              stroke="#2563eb"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
