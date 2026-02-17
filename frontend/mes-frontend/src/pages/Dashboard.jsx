import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import "./Dashboard.css";

export default function Dashboard() {

  const produccionSemanal = [
    { dia: "Lun", valor: 120 },
    { dia: "Mar", valor: 210 },
    { dia: "Mié", valor: 180 },
    { dia: "Jue", valor: 250 },
    { dia: "Vie", valor: 300 },
  ];

  const produccionPorArea = [
    { area: "Producción", valor: 500 },
    { area: "Sublimado", valor: 320 },
    { area: "Calidad", valor: 200 },
    { area: "Logística", valor: 150 },
  ];

  const estadosOrdenes = [
    { name: "En Proceso", value: 14 },
    { name: "Pendientes", value: 6 },
    { name: "Completadas", value: 27 },
  ];

  const colores = ["#2563eb", "#f59e0b", "#16a34a"];

  return (
    <div className="dashboard-container">

      <h1>Dashboard General</h1>

      {/* KPIs */}
      <div className="kpi-grid">
        <KPI titulo="Producción Hoy" valor="320" />
        <KPI titulo="Órdenes Activas" valor="14" />
        <KPI titulo="Pedidos Enviados" valor="27" />
        <KPI titulo="Eficiencia" valor="92%" />
      </div>

      {/* Gráficas */}
      <div className="charts-grid">

        {/* Producción semanal */}
        <div className="chart-card">
          <h3>Producción Semanal</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={produccionSemanal}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="valor" stroke="#2563eb" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Producción por área */}
        <div className="chart-card">
          <h3>Producción por Área</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={produccionPorArea}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="area" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="valor" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Estados de órdenes */}
        <div className="chart-card">
          <h3>Órdenes por Estado</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={estadosOrdenes}
                dataKey="value"
                nameKey="name"
                outerRadius={90}
                label
              >
                {estadosOrdenes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colores[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}

function KPI({ titulo, valor }) {
  return (
    <div className="kpi-card">
      <h2>{valor}</h2>
      <p>{titulo}</p>
    </div>
  );
}
